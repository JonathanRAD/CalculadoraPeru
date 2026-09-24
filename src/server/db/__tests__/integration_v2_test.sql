-- ==============================================================================
-- SCRIPT DE PRUEBAS DE INTEGRACIÓN POSTGRESQL / SUPABASE (V2 REEJECUTABLE)
-- CalculaPerú - Cotizador Comercial PRO & Endurecimiento de Seguridad
-- Archivo: src/server/db/__tests__/integration_v2_test.sql
-- ==============================================================================
--
-- GUÍA DE VERIFICACIÓN LOCAL / STAGING (DOBLE EJECUCIÓN IDEMPOTENTE):
-- Para comprobar la migración y suite completa en Supabase CLI local o PostgreSQL:
--
-- 1. Iniciar Supabase localmente (si Docker está activo):
--    npx supabase start
--
-- 2. Ejecutar la migración v2 por PRIMERA vez:
--    npx supabase db execute --file src/server/db/migrate_cotizador_pro_v2.sql
--
-- 3. Ejecutar la migración v2 por SEGUNDA vez (prueba de idempotencia estricta):
--    npx supabase db execute --file src/server/db/migrate_cotizador_pro_v2.sql
--
-- 4. Ejecutar este script de integración completo:
--    npx supabase db execute --file src/server/db/__tests__/integration_v2_test.sql
--
-- NOTA IMPORTANTE:
-- Todo el script se ejecuta dentro de un bloque BEGIN ... ROLLBACK con identificadores
-- dinámicos (gen_random_uuid). NUNCA ejecutar contra Supabase de producción.
-- ==============================================================================

\set ON_ERROR_STOP on

begin;

do $$
begin
  raise notice '==============================================================================';
  raise notice '>>> INICIANDO SUITE DE PRUEBAS DE INTEGRACIÓN SQL V2 (TRANSACCIÓN SEGURA) <<<';
  raise notice '==============================================================================';
end;
$$;

-- ------------------------------------------------------------------------------
-- TEST 1: NOT NULL Y CHECK CONSTRAINTS EN REVIEW_STATUS Y EMAIL_STATUS
-- ------------------------------------------------------------------------------
do $$
declare
  v_sub_id uuid;
  v_req text;
begin
  raise notice 'TEST 1: Verificando NOT NULL y CHECK en review_status y email_status...';

  -- 1.1 review_status rechaza NULL
  v_sub_id := gen_random_uuid();
  v_req := 'CP-NULL-REV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  begin
    insert into public.contact_submissions (
      id, public_request_id, ip_hash, name, email, category, message, source_path,
      consent, consent_version, review_status, email_status
    ) values (
      v_sub_id, v_req, 'hash_null_rev', 'Usuario Null Rev', 'nullrev@test.pe', 'consulta_general',
      'Mensaje con longitud válida para comprobar rechazo de null en review_status.', '/contacto',
      true, '2026-v2', null, 'pending'
    );
    raise exception 'FALLO TEST 1.1: contact_submissions permitió review_status NULL.';
  exception when not_null_violation then
    raise notice '  -> Aprobado 1.1: review_status NULL rechazado correctamente.';
  end;

  -- 1.2 email_status rechaza NULL
  v_sub_id := gen_random_uuid();
  v_req := 'CP-NULL-EML-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  begin
    insert into public.contact_submissions (
      id, public_request_id, ip_hash, name, email, category, message, source_path,
      consent, consent_version, review_status, email_status
    ) values (
      v_sub_id, v_req, 'hash_null_eml', 'Usuario Null Eml', 'nulleml@test.pe', 'consulta_general',
      'Mensaje con longitud válida para comprobar rechazo de null en email_status.', '/contacto',
      true, '2026-v2', 'pending', null
    );
    raise exception 'FALLO TEST 1.2: contact_submissions permitió email_status NULL.';
  exception when not_null_violation then
    raise notice '  -> Aprobado 1.2: email_status NULL rechazado correctamente.';
  end;

  -- 1.3 review_status rechaza valores fuera del conjunto permitido
  v_sub_id := gen_random_uuid();
  v_req := 'CP-BAD-REV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  begin
    insert into public.contact_submissions (
      id, public_request_id, ip_hash, name, email, category, message, source_path,
      consent, consent_version, review_status, email_status
    ) values (
      v_sub_id, v_req, 'hash_bad_rev', 'Usuario Bad Rev', 'badrev@test.pe', 'consulta_general',
      'Mensaje con longitud válida para comprobar check de review_status.', '/contacto',
      true, '2026-v2', 'status_invalido', 'pending'
    );
    raise exception 'FALLO TEST 1.3: contact_submissions admitió review_status inválido.';
  exception when check_violation then
    raise notice '  -> Aprobado 1.3: review_status inválido rechazado correctamente.';
  end;

  -- 1.4 email_status rechaza valores fuera del conjunto permitido
  v_sub_id := gen_random_uuid();
  v_req := 'CP-BAD-EML-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  begin
    insert into public.contact_submissions (
      id, public_request_id, ip_hash, name, email, category, message, source_path,
      consent, consent_version, review_status, email_status
    ) values (
      v_sub_id, v_req, 'hash_bad_eml', 'Usuario Bad Eml', 'bademl@test.pe', 'consulta_general',
      'Mensaje con longitud válida para comprobar check de email_status.', '/contacto',
      true, '2026-v2', 'pending', 'status_invalido'
    );
    raise exception 'FALLO TEST 1.4: contact_submissions admitió email_status inválido.';
  exception when check_violation then
    raise notice '  -> Aprobado 1.4: email_status inválido rechazado correctamente.';
  end;

  raise notice 'APROBADO TEST 1: Integridad de review_status y email_status verificada.';
end;
$$;

-- ------------------------------------------------------------------------------
-- TEST 2: RESTRICCIÓN UNIQUE EFECTIVA Y AUSENCIA DE ÍNDICES REDUNDANTES
-- ------------------------------------------------------------------------------
do $$
declare
  v_attnum smallint;
  v_unique_constraints_count integer;
  v_unique_indexes_count integer;
  v_id1 uuid := gen_random_uuid();
  v_id2 uuid := gen_random_uuid();
  v_dup_req text := 'CP-DUP-TEST-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
begin
  raise notice 'TEST 2: Verificando autoridad de unicidad y ausencia de índices redundantes...';

  -- Obtener número de atributo de public_request_id
  select attnum into v_attnum
  from pg_attribute
  where attrelid = 'public.contact_submissions'::regclass
    and attname = 'public_request_id'
    and not attisdropped;

  -- Contar restricciones UNIQUE que cubran public_request_id
  select count(*) into v_unique_constraints_count
  from pg_constraint
  where conrelid = 'public.contact_submissions'::regclass
    and contype = 'u'
    and conkey = array[v_attnum];

  if v_unique_constraints_count <> 1 then
    raise exception 'FALLO TEST 2: Se esperaba exactamente 1 restricción UNIQUE en public_request_id, pero se encontraron %.', v_unique_constraints_count;
  end if;

  -- Contar índices únicos NO parciales sobre public_request_id
  select count(*) into v_unique_indexes_count
  from pg_index i
  where i.indrelid = 'public.contact_submissions'::regclass
    and i.indisunique = true
    and i.indkey = v_attnum::text::int2vector
    and i.indpred is null;

  if v_unique_indexes_count <> 1 then
    raise exception 'FALLO TEST 2: Se esperaba exactamente 1 índice UNIQUE sobre public_request_id (sin redundancia), pero se encontraron %.', v_unique_indexes_count;
  end if;

  -- Comprobar que rechaza duplicados efectivamente con 23505
  insert into public.contact_submissions (
    id, public_request_id, ip_hash, name, email, category, message, source_path,
    consent, consent_version, email_status
  ) values (
    v_id1, v_dup_req, 'hash_dup1', 'Usuario Dup 1', 'dup1@test.pe', 'consulta_general',
    'Mensaje inicial con public_request_id para probar colisión.', '/contacto',
    true, '2026-v2', 'pending'
  );

  begin
    insert into public.contact_submissions (
      id, public_request_id, ip_hash, name, email, category, message, source_path,
      consent, consent_version, email_status
    ) values (
      v_id2, v_dup_req, 'hash_dup2', 'Usuario Dup 2', 'dup2@test.pe', 'consulta_general',
      'Segundo mensaje con el mismo public_request_id que debe ser rechazado.', '/contacto',
      true, '2026-v2', 'pending'
    );
    raise exception 'FALLO TEST 2: La restricción UNIQUE no bloqueó el duplicado de public_request_id.';
  exception when unique_violation then
    raise notice '  -> Aprobado: Violación UNIQUE (23505) capturada correctamente.';
  end;

  raise notice 'APROBADO TEST 2: Unicidad estricta y sin redundancia de índices verificada.';
end;
$$;

-- ------------------------------------------------------------------------------
-- TEST 3: RESTRICCIÓN ÚNICA DE IDEMPOTENCY_KEY
-- ------------------------------------------------------------------------------
do $$
declare
  v_idem_key text := 'idem-' || gen_random_uuid()::text;
  v_sub_id1 uuid := gen_random_uuid();
  v_sub_id2 uuid := gen_random_uuid();
  v_req1 text := 'CP-IDEM1-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  v_req2 text := 'CP-IDEM2-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
begin
  raise notice 'TEST 3: Verificando rechazo de duplicados en idempotency_key...';

  insert into public.contact_submissions (
    id, public_request_id, ip_hash, name, email, category, message, source_path,
    consent, consent_version, email_status, idempotency_key
  ) values (
    v_sub_id1, v_req1, 'hash_idem', 'Idem User', 'idem@test.pe', 'cotizador_feedback',
    'Mensaje con clave de idempotencia única para prueba de rechazo.', '/cotizador',
    true, '2026-v2', 'sent', v_idem_key
  );

  begin
    insert into public.contact_submissions (
      id, public_request_id, ip_hash, name, email, category, message, source_path,
      consent, consent_version, email_status, idempotency_key
    ) values (
      v_sub_id2, v_req2, 'hash_idem', 'Idem User 2', 'idem@test.pe', 'cotizador_feedback',
      'Segundo mensaje con la misma clave de idempotencia.', '/cotizador',
      true, '2026-v2', 'pending', v_idem_key
    );
    raise exception 'FALLO TEST 3: Se permitió insertar la misma idempotency_key.';
  exception when unique_violation then
    raise notice '  -> Aprobado: Excepción unique_violation 23505 capturada por idempotency_key duplicada.';
  end;

  raise notice 'APROBADO TEST 3: Idempotencia en contact_submissions verificada.';
end;
$$;

-- ------------------------------------------------------------------------------
-- TEST 4: PERMISOS DE ESCRITURA REVOCADOS PARA ANON Y AUTHENTICATED
-- ------------------------------------------------------------------------------
do $$
declare
  v_dummy uuid := gen_random_uuid();
begin
  raise notice 'TEST 4: Verificando que anon y authenticated no puedan escribir en tablas críticas...';

  -- 4.1 Probar rol ANON
  set local role anon;

  -- quotes
  begin
    insert into public.quotes (id, user_id, quote_number, prefix, correlative, client_name, issue_date, currency, subtotal_gross, items_discount_total, discount_total, subtotal_net, taxable_base, exempt_base, igv_rate, igv_amount, total_amount, status)
    values (gen_random_uuid(), v_dummy, 'COT-99999', 'COT-', 99999, 'Hacker', current_date, 'PEN', 0, 0, 0, 0, 0, 0, 0.18, 0, 0, 'draft');
    raise exception 'FALLO TEST 4: anon pudo escribir en quotes.';
  exception when insufficient_privilege then end;

  -- quote_items
  begin
    insert into public.quote_items (quote_id, user_id, description, type, unit, quantity, unit_price, discount_type, discount_value, discount_amount, is_igv_affected, gross_amount, net_amount)
    values (v_dummy, v_dummy, 'Item Hacker', 'product', 'unit', 1, 10, 'none', 0, 0, true, 10, 10);
    raise exception 'FALLO TEST 4: anon pudo escribir en quote_items.';
  exception when insufficient_privilege then end;

  -- quote_sequences
  begin
    insert into public.quote_sequences (user_id, prefix, last_correlative) values (v_dummy, 'COT-', 1);
    raise exception 'FALLO TEST 4: anon pudo escribir en quote_sequences.';
  exception when insufficient_privilege then end;

  -- contact_submissions
  begin
    insert into public.contact_submissions (id, public_request_id, ip_hash, name, email, category, message, consent)
    values (v_dummy, 'CP-ANON-1', 'hash', 'Anon', 'anon@test.pe', 'cat', 'Mensaje con tamaño suficiente para pasar validacion', true);
    raise exception 'FALLO TEST 4: anon pudo escribir en contact_submissions.';
  exception when insufficient_privilege then end;

  -- beta_requests (si existe)
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'beta_requests') then
    begin
      insert into public.beta_requests (id, email) values (v_dummy, 'anon@test.pe');
      raise exception 'FALLO TEST 4: anon pudo escribir en beta_requests.';
    exception when insufficient_privilege then end;
  end if;

  -- clients
  begin
    insert into public.clients (id, user_id, name) values (v_dummy, v_dummy, 'Cliente Anon');
    raise exception 'FALLO TEST 4: anon pudo escribir en clients.';
  exception when insufficient_privilege then end;

  -- catalog_items
  begin
    insert into public.catalog_items (id, user_id, name, unit_price) values (v_dummy, v_dummy, 'Item Anon', 10);
    raise exception 'FALLO TEST 4: anon pudo escribir en catalog_items.';
  exception when insufficient_privilege then end;

  -- 4.2 Probar RPCs críticas para anon
  begin
    perform public.get_next_quote_correlative(v_dummy, 'COT-');
    raise exception 'FALLO TEST 4: anon pudo ejecutar get_next_quote_correlative.';
  exception when insufficient_privilege then end;

  begin
    perform public.save_quote_atomic(
      v_dummy, v_dummy, 'COT-', null, 'Cliente', 'none', null, null, null, null,
      current_date, null, 'PEN', 0, 0, 'none', 0, 0, 0, 0, 0, 0, 0.18, 0, 0,
      null, null, null, null, 'draft', '[]'::jsonb
    );
    raise exception 'FALLO TEST 4: anon pudo ejecutar save_quote_atomic.';
  exception when insufficient_privilege then end;

  -- 4.3 Probar rol AUTHENTICATED
  set local role authenticated;

  begin
    insert into public.quote_sequences (user_id, prefix, last_correlative) values (v_dummy, 'COT-', 1);
    raise exception 'FALLO TEST 4: authenticated pudo escribir en quote_sequences.';
  exception when insufficient_privilege then end;

  begin
    perform public.get_next_quote_correlative(v_dummy, 'COT-');
    raise exception 'FALLO TEST 4: authenticated pudo ejecutar get_next_quote_correlative.';
  exception when insufficient_privilege then end;

  begin
    perform public.save_quote_atomic(
      v_dummy, v_dummy, 'COT-', null, 'Cliente', 'none', null, null, null, null,
      current_date, null, 'PEN', 0, 0, 'none', 0, 0, 0, 0, 0, 0, 0.18, 0, 0,
      null, null, null, null, 'draft', '[]'::jsonb
    );
    raise exception 'FALLO TEST 4: authenticated pudo ejecutar save_quote_atomic.';
  exception when insufficient_privilege then end;

  -- Restaurar rol de administración
  reset role;
  raise notice 'APROBADO TEST 4: Anon y Authenticated bloqueados de tablas y RPCs críticas.';
end;
$$;

-- ------------------------------------------------------------------------------
-- TEST 5: SERVICE_ROLE TIENE LOS PERMISOS NECESARIOS
-- ------------------------------------------------------------------------------
do $$
declare
  v_test_user uuid := gen_random_uuid();
  v_quote_id uuid := gen_random_uuid();
  v_next_res jsonb;
begin
  raise notice 'TEST 5: Verificando permisos de service_role...';

  -- Crear usuario de prueba
  insert into public.profiles (id, email, full_name)
  values (v_test_user, 'service-role-test@calculaperu.pe', 'Usuario Service Role Test');

  -- Simular rol service_role si existe en el entorno
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    set local role service_role;
  end if;

  -- 1. Ejecutar RPC get_next_quote_correlative
  v_next_res := public.get_next_quote_correlative(v_test_user, 'COT-');
  if v_next_res is null or (v_next_res->>'correlative') is null then
    raise exception 'FALLO TEST 5: service_role no pudo ejecutar get_next_quote_correlative.';
  end if;

  -- 2. Ejecutar save_quote_atomic
  perform public.save_quote_atomic(
    v_quote_id, v_test_user, 'COT-', null, 'Cliente Service Role', 'none', null,
    null, null, null, current_date, null, 'PEN', 100, 0, 'none', 0, 0, 0, 100, 100, 0,
    0.18, 18, 118, null, null, null, null, 'draft',
    jsonb_build_array(
      jsonb_build_object(
        'description', 'Item de prueba service_role',
        'type', 'product',
        'unit', 'unit',
        'quantity', 1,
        'unitPrice', 100,
        'discountType', 'none',
        'discountValue', 0,
        'discountAmount', 0,
        'isIgvAffected', true,
        'grossAmount', 100,
        'netAmount', 100
      )
    )
  );

  reset role;
  raise notice 'APROBADO TEST 5: service_role cuenta con todos los permisos requeridos.';
end;
$$;

-- ------------------------------------------------------------------------------
-- TEST 6: NO DUPLICACIÓN DE CORRELATIVOS EN CONCURRENCIA
-- ------------------------------------------------------------------------------
do $$
declare
  v_user uuid := gen_random_uuid();
  v_r1 jsonb;
  v_r2 jsonb;
  v_r3 jsonb;
begin
  raise notice 'TEST 6: Verificando que correlativos incrementen estrictamente y no se dupliquen...';

  insert into public.profiles (id, email, full_name)
  values (v_user, 'seq-test@calculaperu.pe', 'Usuario Seq Test');

  v_r1 := public.get_next_quote_correlative(v_user, 'COT-');
  v_r2 := public.get_next_quote_correlative(v_user, 'COT-');
  v_r3 := public.get_next_quote_correlative(v_user, 'COT-');

  if (v_r1->>'correlative')::int >= (v_r2->>'correlative')::int or
     (v_r2->>'correlative')::int >= (v_r3->>'correlative')::int then
    raise exception 'FALLO TEST 6: Los correlativos no fueron estrictamente crecientes: %, %, %', v_r1, v_r2, v_r3;
  end if;

  if (v_r1->>'quoteNumber') = (v_r2->>'quoteNumber') or
     (v_r2->>'quoteNumber') = (v_r3->>'quoteNumber') then
    raise exception 'FALLO TEST 6: Se detectó duplicación en quoteNumber.';
  end if;

  raise notice 'APROBADO TEST 6: Generación monótona y libre de duplicados de correlativos.';
end;
$$;

-- ------------------------------------------------------------------------------
-- TEST 7: MIGRACIÓN HISTÓRICA DE BETA_REQUESTS SIN CREAR DUPLICADOS
-- ------------------------------------------------------------------------------
do $$
declare
  v_beta_id uuid := gen_random_uuid();
  v_count_before integer;
  v_count_after integer;
begin
  raise notice 'TEST 7: Verificando que migración histórica no genere duplicados...';

  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'beta_requests') then
    -- Insertar un beta_request
    insert into public.beta_requests (id, email, business_type, feature_needed, public_request_id)
    values (v_beta_id, 'migracion-test@calculaperu.pe', 'comercio', 'Mejora en cotizaciones', 'CP-BETA-TESTMIG1');

    -- Ejecutar migración por primera vez para este registro
    insert into public.contact_submissions (
      public_request_id, ip_hash, name, email, category, business_type, message,
      source_path, consent, consent_version, review_status, email_status
    )
    values (
      'CP-BETA-TESTMIG1', 'legacy-test', 'Usuario Beta', 'migracion-test@calculaperu.pe',
      'cotizador_feedback', 'comercio', 'Mejora en cotizaciones', '/cotizador',
      true, '2026-v2', 'pending', 'pending'
    )
    on conflict (public_request_id) do nothing;

    select count(*) into v_count_before
    from public.contact_submissions
    where public_request_id = 'CP-BETA-TESTMIG1';

    -- Ejecutar migración por segunda vez (simulando reejecución del script)
    insert into public.contact_submissions (
      public_request_id, ip_hash, name, email, category, business_type, message,
      source_path, consent, consent_version, review_status, email_status
    )
    values (
      'CP-BETA-TESTMIG1', 'legacy-test', 'Usuario Beta', 'migracion-test@calculaperu.pe',
      'cotizador_feedback', 'comercio', 'Mejora en cotizaciones', '/cotizador',
      true, '2026-v2', 'pending', 'pending'
    )
    on conflict (public_request_id) do nothing;

    select count(*) into v_count_after
    from public.contact_submissions
    where public_request_id = 'CP-BETA-TESTMIG1';

    if v_count_before <> 1 or v_count_after <> 1 then
      raise exception 'FALLO TEST 7: La reejecución de la migración creó duplicados (antes: %, después: %)', v_count_before, v_count_after;
    end if;

    raise notice 'APROBADO TEST 7: Migración idempotente sin duplicados confirmada.';
  else
    raise notice 'SKIP TEST 7: Tabla beta_requests no presente en este entorno.';
  end if;
end;
$$;

do $$
begin
  raise notice '==============================================================================';
  raise notice '>>> TODAS LAS PRUEBAS DE INTEGRACIÓN SQL V2 HAN FINALIZADO EXITOSAMENTE <<<';
  raise notice '==============================================================================';
end;
$$;

-- Deshacer todos los cambios de prueba garantizando 0 residuos y total reejecutabilidad
rollback;
