import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

if (!url || !serviceRoleKey) {
  console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'rujeljonathan4@gmail.com';
const ADMIN_PASSWORD = 'Elmaspro_123';
const ADMIN_NAME = 'Jonathan Rujel (Admin)';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return { hash, salt };
}

async function setupAdmin() {
  console.log('='.repeat(60));
  console.log(`🚀 CONFIGURANDO CUENTA DE ADMINISTRADOR`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log('='.repeat(60));

  let userId = null;

  // 1. Supabase Auth
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const existingAuth = usersData?.users?.find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    if (existingAuth) {
      console.log('1. Usuario existente en Supabase Auth. Actualizando contraseña...');
      const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(existingAuth.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { name: ADMIN_NAME, role: 'admin' },
      });
      if (updateErr) {
        console.warn('   ⚠️ Aviso al actualizar en Supabase Auth:', updateErr.message);
      } else {
        console.log('   ✅ Contraseña actualizada en Supabase Auth.');
      }
      userId = existingAuth.id;
    } else {
      console.log('1. Creando usuario en Supabase Auth...');
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { name: ADMIN_NAME, role: 'admin' },
      });
      if (createErr) {
        console.warn('   ⚠️ Aviso al crear en Supabase Auth:', createErr.message);
        userId = crypto.randomUUID();
      } else {
        console.log('   ✅ Usuario creado en Supabase Auth.');
        userId = created.user.id;
      }
    }
  } catch (err) {
    console.warn('   ⚠️ Error en Supabase Auth:', err.message);
    userId = crypto.randomUUID();
  }

  // 2. Insertar / Actualizar en tabla public.profiles
  console.log('\n2. Sincronizando en tabla public.profiles...');
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle();

  const finalId = existingProfile?.id || userId || crypto.randomUUID();

  const { hash: adminHash, salt: adminSalt } = hashPassword(ADMIN_PASSWORD);
  const profilePayload = {
    id: finalId,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: 'admin',
    is_pro: true,
    plan: 'yearly',
    pro_expires_at: '2099-12-31T23:59:59.999Z',
    password_hash: adminHash,
    salt: adminSalt,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'email' });

  if (profileError) {
    console.error('   ❌ Error al upsert en profiles:', profileError.message);
  } else {
    console.log(`   ✅ Perfil sincronizado en public.profiles con rol 'admin' y estado PRO permanente.`);
  }

  // 3. Sincronizar en almacenamiento local (.data/db.json) para el sistema de hash PBKDF2
  console.log('\n3. Sincronizando en almacenamiento de contraseñas locales (.data/db.json)...');
  const dbPath = path.join(process.cwd(), '.data', 'db.json');
  try {
    let db = { users: {}, licenses: {} };
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }

    const { hash, salt } = hashPassword(ADMIN_PASSWORD);
    
    // Buscar si ya existía con otro ID
    let targetKey = Object.keys(db.users || {}).find(
      k => db.users[k].email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    ) || finalId;

    if (!db.users) db.users = {};
    db.users[targetKey] = {
      id: finalId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash: hash,
      salt: salt,
      role: 'admin',
      isPro: true,
      plan: 'yearly',
      proExpiresAt: '2099-12-31T23:59:59.999Z',
      createdAt: db.users[targetKey]?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    console.log('   ✅ Contraseña PBKDF2 y credenciales sincronizadas en base local.');
  } catch (err) {
    console.warn('   ⚠️ Error al actualizar db.json:', err.message);
  }

  // 4. Registrar log de auditoría en Supabase
  try {
    await supabase.from('audit_logs').insert({
      action: 'ADMIN_USER_INITIALIZED',
      performed_by: 'System Setup',
      target_id: finalId,
      metadata: { email: ADMIN_EMAIL, role: 'admin' },
      created_at: new Date().toISOString(),
    });
    console.log('\n4. Registro de auditoría guardado en Supabase.');
  } catch (err) {
    // ignore
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 ¡USUARIO ADMINISTRADOR LISTO!');
  console.log(`   Email:      ${ADMIN_EMAIL}`);
  console.log(`   Password:   ${ADMIN_PASSWORD}`);
  console.log(`   Rol:        admin`);
  console.log(`   Estado PRO: Activo (Ilimitado)`);
  console.log('='.repeat(60));
}

setupAdmin();
