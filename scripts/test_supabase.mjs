import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

console.log('='.repeat(60));
console.log('🔍 DIAGNÓSTICO DE CONEXIÓN A SUPABASE - CALCULAPERÚ');
console.log('='.repeat(60));

console.log('\n1. Verificación de variables en .env.local:');
console.log(`   - SUPABASE_URL: ${url ? '✅ Presente (' + url + ')' : '❌ No encontrada'}`);
console.log(`   - ANON / PUBLISHABLE KEY: ${anonKey ? '✅ Presente (termina en ' + anonKey.slice(-6) + ')' : '❌ No encontrada'}`);
console.log(`   - SERVICE_ROLE / SECRET KEY: ${serviceRoleKey ? '✅ Presente (termina en ' + serviceRoleKey.slice(-6) + ')' : '❌ No encontrada'}`);

if (!url || (!anonKey && !serviceRoleKey)) {
  console.log('\n❌ Faltan credenciales en .env.local.');
  console.log('Asegúrate de guardar el archivo .env.local con Ctrl + S en tu editor.');
  process.exit(1);
}

const keyToUse = serviceRoleKey || anonKey;
const client = createClient(url, keyToUse, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tables = [
  'profiles',
  'licenses',
  'subscription_requests',
  'saved_calculations',
  'audit_logs',
  'analytics_events'
];

console.log(`\n2. Probando conexión con Supabase usando clave ${serviceRoleKey ? 'SERVICE_ROLE (Admin)' : 'ANON'}...`);

async function runTests() {
  let allGood = true;
  let missingTables = [];

  for (const table of tables) {
    try {
      const { count, error } = await client
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.log(`   ❌ Tabla '${table}': NO EXISTE en la base de datos.`);
          missingTables.push(table);
          allGood = false;
        } else if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('permission')) {
          console.log(`   ⚠️ Tabla '${table}': Error de permisos o clave JWT: ${error.message}`);
          allGood = false;
        } else {
          console.log(`   ⚠️ Tabla '${table}': ${error.message} (código ${error.code})`);
          allGood = false;
        }
      } else {
        console.log(`   ✅ Tabla '${table}': Existe y responde correctamente (Filas actuales: ${count ?? 0}).`);
      }
    } catch (err) {
      console.log(`   ❌ Error al consultar '${table}': ${err.message}`);
      allGood = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  if (missingTables.length > 0) {
    console.log('⚠️ RESULTADO: La conexión a Supabase funciona, pero faltan crear las tablas.');
    console.log(`Tablas faltantes (${missingTables.length}/${tables.length}): ${missingTables.join(', ')}`);
    console.log('\n👉 SOLUCIÓN:');
    console.log('1. Abre tu panel de Supabase: https://supabase.com/dashboard');
    console.log('2. Entra a tu proyecto y haz clic en "SQL Editor" en el menú izquierdo.');
    console.log('3. Abre el archivo del proyecto: src/server/db/schema.sql');
    console.log('4. Copia todo su contenido, pégalo en el SQL Editor y dale a "Run".');
    console.log('5. Vuelve a ejecutar esta prueba.');
  } else if (allGood) {
    console.log('🎉 ¡TODO CORRECTO Y OPERATIVO!');
    console.log('Todas las tablas existen y la base de datos de Supabase está 100% conectada.');
  } else {
    console.log('⚠️ Revisa los avisos anteriores para ajustar permisos o claves.');
  }
  console.log('='.repeat(60));
}

runTests();
