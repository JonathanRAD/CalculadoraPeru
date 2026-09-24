import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { UserRole, SafeUser, UserAccount } from '@/features/auth/types';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

const devAuthSecret = crypto.randomBytes(32).toString('hex');
function authSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET debe configurarse en producción.');
  return devAuthSecret;
}

export function getAuthCookieOptions(req?: Request | NextRequest) {
  const host = req?.headers.get('host') || (req ? new URL(req.url).host : '');
  const isProduction = process.env.NODE_ENV === 'production';
  const isCalculaPeru = /^(?:[a-z0-9-]+\.)*calculaperu\.com\.pe(?::\d+)?$/i.test(host);

  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: isProduction,
    domain: isCalculaPeru ? '.calculaperu.com.pe' : undefined,
  };
}

export class AuthService {
  hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = `scrypt:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
    return { hash, salt };
  }

  verifyPassword(password: string, hash: string, salt: string): boolean {
    if (!salt || !hash) return false;
    const modern = hash.startsWith('scrypt:');
    const expected = modern ? hash.slice(7) : hash;
    if (!/^[a-f0-9]{128}$/i.test(expected)) return false;
    const check = modern
      ? crypto.scryptSync(password, salt, 64)
      : crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256');
    return crypto.timingSafeEqual(check, Buffer.from(expected, 'hex'));
  }

  toSafeUser(user: UserAccount): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, salt, ...safe } = user;
    return safe;
  }

  signToken(payload: { userId: string; email: string; role: UserRole; sessionVersion?: number }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24 * 30; // 30 days
    const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp })).toString('base64url');
    const signature = crypto.createHmac('sha256', authSecret()).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  verifyToken(token: string): { userId: string; email: string; role: UserRole; sessionVersion: number } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSignature = crypto.createHmac('sha256', authSecret()).update(`${header}.${body}`).digest('base64url');
      if (signature.length !== expectedSignature.length ||
          !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
      const now = Math.floor(Date.now() / 1000);
      if (!Number.isInteger(payload.exp) || payload.exp <= now ||
          typeof payload.userId !== 'string' || typeof payload.email !== 'string' ||
          !['user', 'admin'].includes(payload.role)) return null;

      return { userId: payload.userId, email: payload.email, role: payload.role, sessionVersion: payload.sessionVersion ?? 0 };
    } catch {
      return null;
    }
  }

  async authenticateRequest(req: NextRequest): Promise<SafeUser | null> {
    const token = req.cookies.get('calculaperu_auth_token')?.value;
    if (!token) return null;

    const payload = this.verifyToken(token);
    if (!payload) return null;

    const user = await userRepository.findById(payload.userId);
    return user && (user.sessionVersion ?? 0) === payload.sessionVersion ? this.toSafeUser(user) : null;
  }

  async isAuthorizedAdmin(req: NextRequest): Promise<boolean> {
    const headerKey = req.headers.get('x-admin-secret');
    const adminKey = process.env.ADMIN_SECRET_KEY;
    if (adminKey && headerKey && headerKey.length === adminKey.length &&
        crypto.timingSafeEqual(Buffer.from(headerKey), Buffer.from(adminKey))) return true;

    const user = await this.authenticateRequest(req);
    return Boolean(user && user.role === 'admin');
  }

  async login(input: LoginInput): Promise<{ success: boolean; message: string; user?: SafeUser; token?: string }> {
    const cleanEmail = input.email.trim().toLowerCase();
    const user = await userRepository.findByEmail(cleanEmail);

    if (!user) {
      return { success: false, message: 'Correo o contraseña incorrectos.' };
    }

    const isValidPassword = this.verifyPassword(input.password, user.passwordHash, user.salt);
    if (!isValidPassword) {
      return { success: false, message: 'Correo o contraseña incorrectos.' };
    }

    if (!user.passwordHash.startsWith('scrypt:')) {
      const upgraded = this.hashPassword(input.password);
      await userRepository.update(user.id, { passwordHash: upgraded.hash, salt: upgraded.salt });
    }

    const token = this.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionVersion: user.sessionVersion ?? 0,
    });

    await userRepository.update(user.id, { lastLoginAt: new Date().toISOString() });
    await auditRepository.logAction('USER_LOGIN', user.email, user.id);

    return {
      success: true,
      message: 'Inicio de sesión exitoso.',
      user: this.toSafeUser(user),
      token,
    };
  }

  async register(input: RegisterInput): Promise<{ success: boolean; message: string; user?: SafeUser; token?: string }> {
    const cleanEmail = input.email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(cleanEmail);

    if (existing) {
      return { success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const { hash, salt } = this.hashPassword(input.password);
    const id = crypto.randomUUID();

    const newUser: UserAccount = {
      id,
      email: cleanEmail,
      name: input.name.trim(),
      passwordHash: hash,
      salt,
      role: 'user',
      isPro: false,
      sessionVersion: 0,
      createdAt: new Date().toISOString(),
    };

    const created = await userRepository.create(newUser);
    const token = this.signToken({
      userId: created.id,
      email: created.email,
      role: created.role,
      sessionVersion: created.sessionVersion ?? 0,
    });

    await auditRepository.logAction('USER_REGISTERED', created.email, created.id);

    return {
      success: true,
      message: 'Cuenta creada exitosamente.',
      user: created,
      token,
    };
  }
}

export const authService = new AuthService();
