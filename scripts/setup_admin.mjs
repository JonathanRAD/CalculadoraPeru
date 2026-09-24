import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

if (!url || !serviceRoleKey) {
  console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = process.env.SETUP_ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.SETUP_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.SETUP_ADMIN_NAME?.trim() || 'Administrador CalculaPerú';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 16) {
  console.error('Configura SETUP_ADMIN_EMAIL y SETUP_ADMIN_PASSWORD (mínimo 16 caracteres) antes de ejecutar este script.');
  process.exit(1);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = `scrypt:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
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
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existingAuth.id, {
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
    .select('id, session_version')
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
    session_version: Number(existingProfile?.session_version || 0) + 1,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'email' });

  if (profileError) {
    console.error('   ❌ Error al upsert en profiles:', profileError.message);
    process.exitCode = 1;
    return;
  } else {
    console.log(`   ✅ Perfil sincronizado en public.profiles con rol 'admin' y estado PRO permanente.`);
  }

  // 3. Registrar log de auditoría en Supabase
  try {
    await supabase.from('audit_logs').insert({
      action: 'ADMIN_USER_INITIALIZED',
      performed_by: 'System Setup',
      target_id: finalId,
      metadata: { email: ADMIN_EMAIL, role: 'admin' },
      created_at: new Date().toISOString(),
    });
    console.log('\n3. Registro de auditoría guardado en Supabase.');
  } catch {
    // ignore
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 ¡USUARIO ADMINISTRADOR LISTO!');
  console.log(`   Email:      ${ADMIN_EMAIL}`);
  console.log(`   Rol:        admin`);
  console.log(`   Estado PRO: Activo (Ilimitado)`);
  console.log('='.repeat(60));
}

setupAdmin();
