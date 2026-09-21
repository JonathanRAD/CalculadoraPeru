import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { UserRole, SafeUser, UserAccount } from '@/features/auth/types';
import { userRepository } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

const AUTH_SECRET = process.env.AUTH_SECRET || 'calculaperu-secret-auth-key-2026-secure-salt';
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'admin2026';

export class AuthService {
  hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return { hash, salt };
  }

  verifyPassword(password: string, hash: string, salt: string): boolean {
    const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return check === hash;
  }

  toSafeUser(user: UserAccount): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, salt, ...safe } = user;
    return safe;
  }

  signToken(payload: { userId: string; email: string; role: UserRole }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24 * 30; // 30 days
    const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp })).toString('base64url');
    const signature = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  verifyToken(token: string): { userId: string; email: string; role: UserRole } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');
      if (expectedSignature !== signature) return null;

      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) return null;

      return { userId: payload.userId, email: payload.email, role: payload.role };
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
    return user ? this.toSafeUser(user) : null;
  }

  async isAuthorizedAdmin(req: NextRequest): Promise<boolean> {
    const headerKey = req.headers.get('x-admin-secret');
    if (headerKey && headerKey === ADMIN_KEY) return true;

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

    const token = this.signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
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
      createdAt: new Date().toISOString(),
    };

    const created = await userRepository.create(newUser);
    const token = this.signToken({
      userId: created.id,
      email: created.email,
      role: created.role,
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
