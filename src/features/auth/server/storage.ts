import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserAccount, SafeUser, LicenseCode, ProPlan } from '../types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');


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
      licenses: {},
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

export function toSafeUser(user: UserAccount): SafeUser {
  const safe: Partial<UserAccount> = { ...user };
  delete safe.passwordHash;
  delete safe.salt;
  return safe as SafeUser;
}

export function insertUser(user: UserAccount): SafeUser {
  const db = readDatabase();
  if (Object.values(db.users).some(existing => existing.email === user.email)) {
    throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
  }
  db.users[user.id] = user;
  writeDatabase(db);
  return toSafeUser(user);
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
  const id = crypto.randomUUID();

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
