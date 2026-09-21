import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserAccount, SafeUser, LicenseCode, ProPlan, UserRole } from '../types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const AUTH_SECRET = process.env.AUTH_SECRET || 'calculaperu-secret-auth-key-2026-secure-salt';

interface DatabaseSchema {
  users: Record<string, UserAccount>; // keyed by id
  licenses: Record<string, LicenseCode>; // keyed by code
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDatabase(): DatabaseSchema {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      users: {},
      licenses: {
        'PRO-VIP-2026': {
          id: 'lic-initial-1',
          code: 'PRO-VIP-2026',
          plan: 'yearly',
          durationDays: 365,
          assignedClientName: 'Usuario VIP (Anual)',
          status: 'available',
          createdAt: new Date().toISOString(),
        },
        'ADMIN-TEST': {
          id: 'lic-initial-2',
          code: 'ADMIN-TEST',
          plan: 'yearly',
          durationDays: 730,
          assignedClientName: 'Jonathan Rujel (Admin)',
          status: 'available',
          createdAt: new Date().toISOString(),
        },
        'PRO-MENSUAL': {
          id: 'lic-initial-3',
          code: 'PRO-MENSUAL',
          plan: 'monthly',
          durationDays: 30,
          assignedClientName: 'Suscripción Mensual',
          status: 'available',
          createdAt: new Date().toISOString(),
        },
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database file, reinitializing:', err);
    return { users: {}, licenses: {} };
  }
}

function writeDatabase(db: DatabaseSchema) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Cryptography & Tokens
// ---------------------------------------------------------------------------

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return check === hash;
}

export function toSafeUser(user: UserAccount): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

export function signToken(payload: { userId: string; email: string; role: UserRole }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60 * 24 * 30; // 30 days
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string; role: UserRole } | null {
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

// ---------------------------------------------------------------------------
// User Operations
// ---------------------------------------------------------------------------

export function findUserByEmail(email: string): UserAccount | null {
  const db = readDatabase();
  const normalized = email.toLowerCase().trim();
  for (const user of Object.values(db.users)) {
    if (user.email.toLowerCase().trim() === normalized) {
      return user;
    }
  }
  return null;
}

export function findUserById(id: string): UserAccount | null {
  const db = readDatabase();
  if (db.users[id]) return db.users[id];
  return Object.values(db.users).find(u => u.id === id) || null;
}

export function getAllUsers(): SafeUser[] {
  const db = readDatabase();
  return Object.values(db.users).map(toSafeUser);
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}): SafeUser {
  const db = readDatabase();
  const normalizedEmail = data.email.toLowerCase().trim();

  if (findUserByEmail(normalizedEmail)) {
    throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
  }

  const { hash, salt } = hashPassword(data.password);
  const id = `usr_${crypto.randomUUID().slice(0, 8)}`;

  const newUser: UserAccount = {
    id,
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash: hash,
    salt,
    role: data.role || 'user',
    isPro: false,
    plan: null,
    proExpiresAt: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  db.users[id] = newUser;
  writeDatabase(db);
  return toSafeUser(newUser);
}

export function updateUser(id: string, updates: Partial<UserAccount>): SafeUser {
  const db = readDatabase();
  const key = db.users[id] ? id : Object.keys(db.users).find(k => db.users[k].id === id);
  if (!key || !db.users[key]) {
    throw new Error('Usuario no encontrado.');
  }

  const current = db.users[key];
  const updated: UserAccount = {
    ...current,
    ...updates,
    id: current.id, // cannot change id
  };

  db.users[key] = updated;
  writeDatabase(db);
  return toSafeUser(updated);
}

// ---------------------------------------------------------------------------
// License Operations
// ---------------------------------------------------------------------------

export function generateRandomLicenseCode(plan: ProPlan): string {
  const year = new Date().getFullYear();
  const planTag = plan === 'yearly' ? 'Y' : 'M';
  const block1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const block2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `PRO-${year}-${planTag}${block1}-${block2}`;
}

export function getAllLicenses(): LicenseCode[] {
  const db = readDatabase();
  return Object.values(db.licenses).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function findLicenseByCode(code: string): LicenseCode | null {
  const db = readDatabase();
  const normalized = code.trim().toUpperCase();
  return db.licenses[normalized] || null;
}

export function createLicense(data: {
  plan: ProPlan;
  clientName: string;
  clientEmail?: string;
  durationDays?: number;
  createdBy?: string;
}): LicenseCode {
  const db = readDatabase();
  const code = generateRandomLicenseCode(data.plan);
  const durationDays = data.durationDays || (data.plan === 'yearly' ? 365 : 30);
  const id = `lic_${crypto.randomUUID().slice(0, 8)}`;

  const newLic: LicenseCode = {
    id,
    code,
    plan: data.plan,
    durationDays,
    assignedClientName: data.clientName.trim(),
    assignedClientEmail: data.clientEmail?.trim().toLowerCase(),
    status: 'available',
    createdAt: new Date().toISOString(),
    createdBy: data.createdBy,
  };

  db.licenses[code] = newLic;
  writeDatabase(db);
  return newLic;
}

export function redeemLicense(
  code: string,
  userId: string
): { success: boolean; message: string; user?: SafeUser; license?: LicenseCode } {
  const db = readDatabase();
  const normalized = code.trim().toUpperCase();
  const license = db.licenses[normalized];

  if (!license) {
    return { success: false, message: 'El código ingresado no existe en nuestro sistema.' };
  }

  if (license.status === 'redeemed') {
    return {
      success: false,
      message: `Este código ya fue canjeado previamente${license.redeemedByUserEmail ? ` por ${license.redeemedByUserEmail}` : ''}.`,
    };
  }

  if (license.status === 'revoked') {
    return { success: false, message: 'Este código de licencia ha sido revocado.' };
  }

  const user = db.users[userId];
  if (!user) {
    return { success: false, message: 'Usuario no encontrado para aplicar la licencia.' };
  }

  const now = new Date();
  let baseDate = now;
  // If user already has an active PRO subscription that expires in the future, extend it
  if (user.isPro && user.proExpiresAt && new Date(user.proExpiresAt) > now) {
    baseDate = new Date(user.proExpiresAt);
  }

  const expirationDate = new Date(baseDate);
  expirationDate.setDate(expirationDate.getDate() + license.durationDays);

  // Update License
  license.status = 'redeemed';
  license.redeemedByUserId = user.id;
  license.redeemedByUserEmail = user.email;
  license.redeemedAt = now.toISOString();
  db.licenses[normalized] = license;

  // Update User
  user.isPro = true;
  user.plan = license.plan;
  user.proExpiresAt = expirationDate.toISOString();
  user.activatedCode = license.code;
  db.users[user.id] = user;

  writeDatabase(db);

  return {
    success: true,
    message: `¡Licencia activada con éxito! Tu plan ${license.plan === 'yearly' ? 'Anual' : 'Mensual'} está activo hasta el ${expirationDate.toLocaleDateString('es-PE')}.`,
    user: toSafeUser(user),
    license,
  };
}

export function activateUserProDirectly(
  userId: string,
  plan: ProPlan,
  durationDays = plan === 'yearly' ? 365 : 30
): SafeUser {
  const db = readDatabase();
  const user = db.users[userId];
  if (!user) {
    throw new Error('Usuario no encontrado.');
  }

  const now = new Date();
  let baseDate = now;
  if (user.isPro && user.proExpiresAt && new Date(user.proExpiresAt) > now) {
    baseDate = new Date(user.proExpiresAt);
  }

  const expirationDate = new Date(baseDate);
  expirationDate.setDate(expirationDate.getDate() + durationDays);

  user.isPro = true;
  user.plan = plan;
  user.proExpiresAt = expirationDate.toISOString();
  user.activatedCode = 'ADMIN-DIRECT-GRANT';

  db.users[userId] = user;
  writeDatabase(db);
  return toSafeUser(user);
}

export function updateLicense(code: string, updates: Partial<LicenseCode>): LicenseCode | null {
  const db = readDatabase();
  const normalized = code.trim().toUpperCase();
  const lic = db.licenses[normalized];
  if (!lic) return null;

  Object.assign(lic, updates);
  db.licenses[normalized] = lic;
  writeDatabase(db);
  return lic;
}

export function deleteLicense(code: string): boolean {
  const db = readDatabase();
  const normalized = code.trim().toUpperCase();
  if (!db.licenses[normalized]) return false;
  delete db.licenses[normalized];
  writeDatabase(db);
  return true;
}
