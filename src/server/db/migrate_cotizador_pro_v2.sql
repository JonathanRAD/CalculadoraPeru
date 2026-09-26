-- ==============================================================================
-- CALCULAPERÚ - MIGRACIÓN INCREMENTAL COTIZADOR PRO V2 (POSTGRESQL 15+ / SUPABASE)
-- Archivo: src/server/db/migrate_cotizador_pro_v2.sql
-- ==============================================================================
-- Esta migración es incremental, idempotente y NO destructiva sobre migrate_cotizador_pro.sql.
-- Es 100% compatible con los nombres de columna reales del esquema base:
--   quotes: quote_number, prefix, correlative, subtotal_gross, items_discount_total,
--           global_discount_type, global_discount_value, global_discount_amount,
--           discount_total, subtotal_net, taxable_base, exempt_base, igv_rate,
--           igv_amount, total_amount, payment_terms, delivery_time, public_notes,
--           internal_notes, status.
--   quote_items: quote_id, user_id, catalog_item_id, sort_order, description,
--                type, unit, quantity, unit_price, discount_type, discount_value,
--                discount_amount, is_igv_affected, gross_amount, net_amount.
--
-- Principios de seguridad aplicados:
-- 1. SET search_path = public, pg_temp en todas las funciones.
-- 2. REVOKE EXECUTE FROM PUBLIC, anon, authenticated en funciones críticas.
-- 3. GRANT EXECUTE TO service_role exclusivamente.
-- 4. Triggers multitenant para prevenir cruce de datos entre usuarios (Cross-Tenant Integrity).
-- 5. Generación atómica de correlativos y persistencia todo-o-nada en una única transacción.
-- 6. Cierre estricto de escrituras directas desde anon/authenticated hacia Supabase (Fase 2).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLA: QUOTE_SEQUENCES (Generador atómico de correlativos por usuario y prefijo)
-- ------------------------------------------------------------------------------
create table if not exists public.quote_sequences (
  user_id uuid not null references public.profiles(id) on delete cascade,
  prefix text not null check (length(trim(prefix)) between 1 and 10),
  last_correlative integer not null default 0 check (last_correlative >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, prefix)
);

create index if not exists idx_quote_sequences_lookup on public.quote_sequences(user_id, prefix);

alter table public.quote_sequences enable row level security;

-- FASE 1: Sincronización idempotente inicial de quote_sequences desde quotes existentes
-- Garantiza que secuencias existentes nunca comiencen en cero si ya existen cotizaciones,
-- respetando cada combinación user_id + prefix y nunca disminuyendo el valor existente.
insert into public.quote_sequences (
  user_id,
  prefix,
  last_correlative,
  updated_at
)
select
  user_id,
  prefix,
  max(correlative),
  now()
from public.quotes
group by user_id, prefix
on conflict (user_id, prefix)
do update set
  last_correlative = greatest(
    public.quote_sequences.last_correlative,
    excluded.last_correlative
  ),
  updated_at = now();

-- ------------------------------------------------------------------------------
-- 2. FUNCIÓN: get_next_quote_correlative
-- Genera el siguiente correlativo atómico con bloqueo de fila garantizado.
-- ------------------------------------------------------------------------------
create or replace function public.get_next_quote_correlative(
  p_user_id uuid,
  p_prefix text default 'COT-'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_clean_prefix text;
  v_next_val integer;
  v_quote_number text;
begin
  if p_user_id is null then
    raise exception 'El identificador de usuario (p_user_id) es obligatorio.';
  end if;

  v_clean_prefix := upper(trim(coalesce(p_prefix, 'COT-')));
  if v_clean_prefix = '' or length(v_clean_prefix) > 10 then
    raise exception 'El prefijo debe contener entre 1 y 10 caracteres.';
  end if;

  insert into public.quote_sequences (user_id, prefix, last_correlative, updated_at)
  values (p_user_id, v_clean_prefix, 1, now())
  on conflict (user_id, prefix)
  do update set
    last_correlative = public.quote_sequences.last_correlative + 1,
    updated_at = now()
  returning last_correlative into v_next_val;

  v_quote_number := v_clean_prefix || lpad(v_next_val::text, 5, '0');

  return jsonb_build_object(
    'prefix', v_clean_prefix,
    'correlative', v_next_val,
    'quoteNumber', v_quote_number
  );
end;
$$;

-- Permisos estrictos: solo service_role
revoke execute on function public.get_next_quote_correlative(uuid, text) from public;
revoke execute on function public.get_next_quote_correlative(uuid, text) from anon;
revoke execute on function public.get_next_quote_correlative(uuid, text) from authenticated;
grant execute on function public.get_next_quote_correlative(uuid, text) to service_role;

-- ------------------------------------------------------------------------------
-- 3. TABLA: CONTACT_SUBMISSIONS (Registro durable de solicitudes con traza Resend)
-- ------------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  public_request_id text unique not null,
  ip_hash text not null,
  name text not null check (length(trim(name)) between 2 and 100),
  email text not null check (length(trim(email)) <= 254),
  phone text check (phone is null or length(trim(phone)) between 7 and 15),
  category text not null check (length(trim(category)) between 2 and 50),
  message text not null check (length(trim(message)) between 20 and 2000),
  source_path text default '/contacto' check (length(source_path) <= 200),
  consent boolean not null check (consent = true),
  consent_at timestamptz not null default now(),
  consent_version text not null default '2026-v2',
  review_status text not null default 'pending' check (review_status in ('pending', 'in_progress', 'resolved', 'discarded')),
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  resend_message_id text,
  email_sent_at timestamptz,
  email_error_code text,
  idempotency_key text unique,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Endurecimiento incremental: Asegurar columnas en tablas existentes previamente (Fase 9)
alter table public.contact_submissions add column if not exists business_type text check (business_type is null or length(trim(business_type)) <= 100);
alter table public.contact_submissions add column if not exists public_request_id text;
alter table public.contact_submissions add column if not exists ip_hash text;
alter table public.contact_submissions add column if not exists source_path text default '/contacto';
alter table public.contact_submissions add column if not exists consent_version text default '2026-v2';
alter table public.contact_submissions add column if not exists consent_at timestamptz default now();
alter table public.contact_submissions add column if not exists review_status text default 'pending';
alter table public.contact_submissions add column if not exists email_status text default 'pending';
alter table public.contact_submissions add column if not exists resend_message_id text;
alter table public.contact_submissions add column if not exists email_sent_at timestamptz;
alter table public.contact_submissions add column if not exists email_error_code text;
alter table public.contact_submissions add column if not exists idempotency_key text;
alter table public.contact_submissions add column if not exists reviewed_at timestamptz;
alter table public.contact_submissions add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.contact_submissions add column if not exists updated_at timestamptz default now();

-- Completar registros históricos que no tengan public_request_id usando el UUID completo (determinista)
update public.contact_submissions
set public_request_id = 'CP-LEGACY-' || replace(id::text, '-', '')
where public_request_id is null;

-- Desambiguar posibles duplicados preexistentes antes de aplicar la restricción UNIQUE
with ranked_submissions as (
  select id, public_request_id,
         row_number() over (partition by public_request_id order by created_at asc, id asc) as rn
  from public.contact_submissions
  where public_request_id is not null
)
update public.contact_submissions cs
set public_request_id = cs.public_request_id || '-DUP-' || replace(cs.id::text, '-', '')
from ranked_submissions rs
where cs.id = rs.id and rs.rn > 1;

alter table public.contact_submissions alter column public_request_id set not null;

-- ------------------------------------------------------------------------------
-- Estrategia estrictamente idempotente para unicidad de public_request_id
-- Inspecciona pg_constraint y pg_index para evitar restricciones o índices redundantes
-- ------------------------------------------------------------------------------
do $$
declare
  v_attnum smallint;
  v_existing_conname text;
  v_existing_idxname text;
begin
  select attnum into v_attnum
  from pg_attribute
  where attrelid = 'public.contact_submissions'::regclass
    and attname = 'public_request_id'
    and not attisdropped;

  -- 1. Verificar si ya existe alguna restricción UNIQUE que cubra exactamente public_request_id
  select conname into v_existing_conname
  from pg_constraint
  where conrelid = 'public.contact_submissions'::regclass
    and contype = 'u'
    and conkey = array[v_attnum];

  if v_existing_conname is null then
    -- 2. Si no hay constraint UNIQUE, verificar si existe un índice único utilizable sobre public_request_id
    select c.relname into v_existing_idxname
    from pg_index i
    join pg_class c on c.oid = i.indexrelid
    where i.indrelid = 'public.contact_submissions'::regclass
      and i.indisunique = true
      and i.indkey = v_attnum::text::int2vector
      and i.indpred is null;

    if v_existing_idxname is not null then
      execute format(
        'alter table public.contact_submissions add constraint uq_contact_submissions_req_id unique using index %I',
        v_existing_idxname
      );
    else
      if exists (
        select 1 from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'idx_contact_submissions_req_id'
      ) then
        raise exception 'Existe un índice idx_contact_submissions_req_id incompatible con la restricción UNIQUE requerida.';
      end if;

      execute 'create unique index idx_contact_submissions_req_id on public.contact_submissions(public_request_id)';
      execute 'alter table public.contact_submissions add constraint uq_contact_submissions_req_id unique using index idx_contact_submissions_req_id';
    end if;
  end if;
end;
$$;

-- Normalización de valores, configuración de DEFAULTs y aplicación de NOT NULL + CHECK constraints estables
do $$
begin
  -- 1. Normalizar y asegurar review_status
  update public.contact_submissions
  set review_status = 'pending'
  where review_status is null or review_status not in ('pending', 'in_progress', 'resolved', 'discarded');

  alter table public.contact_submissions alter column review_status set default 'pending';
  alter table public.contact_submissions alter column review_status set not null;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.contact_submissions'::regclass
      and conname = 'chk_contact_submissions_review_status'
  ) then
    alter table public.contact_submissions
      add constraint chk_contact_submissions_review_status
      check (review_status in ('pending', 'in_progress', 'resolved', 'discarded'));
  end if;

  -- 2. Normalizar y asegurar email_status
  update public.contact_submissions
  set email_status = 'pending'
  where email_status is null or email_status not in ('pending', 'sent', 'failed');

  alter table public.contact_submissions alter column email_status set default 'pending';
  alter table public.contact_submissions alter column email_status set not null;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.contact_submissions'::regclass
      and conname = 'chk_contact_submissions_email_status'
  ) then
    alter table public.contact_submissions
      add constraint chk_contact_submissions_email_status
      check (email_status in ('pending', 'sent', 'failed'));
  end if;
end;
$$;

create index if not exists idx_contact_submissions_email on public.contact_submissions(email);
create index if not exists idx_contact_submissions_review on public.contact_submissions(review_status);
create index if not exists idx_contact_submissions_email_status on public.contact_submissions(email_status);
create index if not exists idx_contact_submissions_created on public.contact_submissions(created_at desc);
create unique index if not exists idx_contact_submissions_idempotency on public.contact_submissions(idempotency_key) where idempotency_key is not null;

alter table public.contact_submissions enable row level security;

-- ------------------------------------------------------------------------------
-- 4. EXTENSIONES INCREMENTALES A BETA_REQUESTS Y MIGRACIÓN A CONTACT_SUBMISSIONS
-- ------------------------------------------------------------------------------
alter table public.beta_requests add column if not exists public_request_id text;
alter table public.beta_requests add column if not exists business_type text;
alter table public.beta_requests add column if not exists feature_needed text;
alter table public.beta_requests add column if not exists source_path text default '/cotizador';
alter table public.beta_requests add column if not exists consent_version text default '2026-v2';
alter table public.beta_requests add column if not exists consent_at timestamptz default now();
alter table public.beta_requests add column if not exists review_status text default 'pending';
alter table public.beta_requests add column if not exists email_status text default 'pending';
alter table public.beta_requests add column if not exists resend_message_id text;
alter table public.beta_requests add column if not exists email_sent_at timestamptz;
alter table public.beta_requests add column if not exists email_error_code text;
alter table public.beta_requests add column if not exists idempotency_key text;
alter table public.beta_requests add column if not exists updated_at timestamptz default now();

-- Completar registros históricos de beta_requests con public_request_id único basado en UUID completo
update public.beta_requests
set public_request_id = 'CP-BETA-' || replace(id::text, '-', '')
where public_request_id is null;

-- Desambiguar duplicados en beta_requests antes de aplicar UNIQUE
with ranked_beta as (
  select id, public_request_id,
         row_number() over (partition by public_request_id order by created_at asc, id asc) as rn
  from public.beta_requests
  where public_request_id is not null
)
update public.beta_requests br
set public_request_id = br.public_request_id || '-DUP-' || replace(br.id::text, '-', '')
from ranked_beta rb
where br.id = rb.id and rb.rn > 1;

create unique index if not exists idx_beta_requests_idempotency on public.beta_requests(idempotency_key) where idempotency_key is not null;

-- Normalización, unicidad de public_request_id, NOT NULL y CHECK constraints estables para beta_requests
do $$
declare
  v_attnum smallint;
  v_existing_conname text;
  v_existing_idxname text;
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'beta_requests') then
    select attnum into v_attnum
    from pg_attribute
    where attrelid = 'public.beta_requests'::regclass
      and attname = 'public_request_id'
      and not attisdropped;

    if v_attnum is not null then
      select conname into v_existing_conname
      from pg_constraint
      where conrelid = 'public.beta_requests'::regclass
        and contype = 'u'
        and conkey = array[v_attnum];

      if v_existing_conname is null then
        select c.relname into v_existing_idxname
        from pg_index i
        join pg_class c on c.oid = i.indexrelid
        where i.indrelid = 'public.beta_requests'::regclass
          and i.indisunique = true
          and i.indkey = v_attnum::text::int2vector
          and i.indpred is null;

        if v_existing_idxname is not null then
          execute format(
            'alter table public.beta_requests add constraint uq_beta_requests_req_id unique using index %I',
            v_existing_idxname
          );
        else
          if exists (
            select 1 from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relname = 'idx_beta_requests_req_id'
          ) then
            raise exception 'Existe un índice idx_beta_requests_req_id incompatible con la restricción UNIQUE requerida.';
          end if;

          execute 'create unique index idx_beta_requests_req_id on public.beta_requests(public_request_id)';
          execute 'alter table public.beta_requests add constraint uq_beta_requests_req_id unique using index idx_beta_requests_req_id';
        end if;
      end if;
    end if;

    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'beta_requests' and column_name = 'review_status') then
      update public.beta_requests
      set review_status = 'pending'
      where review_status is null or review_status not in ('pending', 'in_progress', 'resolved', 'discarded');

      alter table public.beta_requests alter column review_status set default 'pending';
      alter table public.beta_requests alter column review_status set not null;

      if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.beta_requests'::regclass
          and conname = 'chk_beta_requests_review_status'
      ) then
        alter table public.beta_requests
          add constraint chk_beta_requests_review_status
          check (review_status in ('pending', 'in_progress', 'resolved', 'discarded'));
      end if;
    end if;

    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'beta_requests' and column_name = 'email_status') then
      update public.beta_requests
      set email_status = 'pending'
      where email_status is null or email_status not in ('pending', 'sent', 'failed');

      alter table public.beta_requests alter column email_status set default 'pending';
      alter table public.beta_requests alter column email_status set not null;

      if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.beta_requests'::regclass
          and conname = 'chk_beta_requests_email_status'
      ) then
        alter table public.beta_requests
          add constraint chk_beta_requests_email_status
          check (email_status in ('pending', 'sent', 'failed'));
      end if;
    end if;
  end if;
end;
$$;

alter table public.beta_requests enable row level security;

-- Unificación de sugerencias históricas de beta_requests en contact_submissions (Fase 4)
-- Preserva todos los datos sin eliminar beta_requests, dejando la bandeja unificada.
insert into public.contact_submissions (
  public_request_id,
  ip_hash,
  name,
  email,
  phone,
  category,
  business_type,
  message,
  source_path,
  consent,
  consent_version,
  review_status,
  email_status,
  created_at,
  updated_at
)
select
  coalesce(br.public_request_id, 'CP-BETA-' || replace(br.id::text, '-', '')),
  'legacy-import',
  'Usuario Cotizador',
  br.email,
  br.phone,
  'cotizador_feedback',
  br.business_type,
  coalesce(br.feature_needed, 'Registro en la lista de novedades y sugerencias del cotizador comercial'),
  coalesce(br.source_path, '/cotizador'),
  true,
  coalesce(br.consent_version, '2026-v2'),
  case
    when br.status = 'approved' then 'resolved'
    when br.status = 'contacted' then 'in_progress'
    when br.status = 'rejected' then 'discarded'
    else 'pending'
  end,
  case
    when br.email_status in ('pending', 'sent', 'failed') then br.email_status
    else 'pending'
  end,
  br.created_at,
  coalesce(br.updated_at, br.created_at)
from public.beta_requests br
on conflict (public_request_id) do nothing;

-- ------------------------------------------------------------------------------
-- 5. TRIGGERS DE INTEGRIDAD MULTITENANT
-- ------------------------------------------------------------------------------

-- Trigger en public.quotes: Valida que client_id pertenezca a user_id
create or replace function public.validate_quote_ownership()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if NEW.client_id is not null then
    if not exists (
      select 1 from public.clients
      where id = NEW.client_id and user_id = NEW.user_id
    ) then
      raise exception 'Violación de aislamiento multitenant: El cliente (%) no pertenece al usuario (%).', NEW.client_id, NEW.user_id;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_validate_quote_ownership on public.quotes;
create trigger trg_validate_quote_ownership
  before insert or update on public.quotes
  for each row execute function public.validate_quote_ownership();

-- Trigger en public.quote_items: Valida que quote pertenezca a NEW.user_id
-- y que catalog_item_id pertenezca a NEW.user_id
create or replace function public.validate_quote_item_ownership()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_quote_owner_id uuid;
begin
  select user_id into v_quote_owner_id
  from public.quotes
  where id = NEW.quote_id;

  if v_quote_owner_id is null then
    raise exception 'Violación de integridad: La cotización asociada (%) no existe.', NEW.quote_id;
  end if;

  if v_quote_owner_id <> NEW.user_id then
    raise exception 'Violación de aislamiento multitenant: La cotización pertenece a otro usuario.';
  end if;

  if NEW.catalog_item_id is not null then
    if not exists (
      select 1 from public.catalog_items
      where id = NEW.catalog_item_id and user_id = NEW.user_id
    ) then
      raise exception 'Violación de aislamiento multitenant: El producto del catálogo (%) no pertenece al usuario (%).', NEW.catalog_item_id, NEW.user_id;
    end if;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_validate_quote_item_ownership on public.quote_items;
create trigger trg_validate_quote_item_ownership
  before insert or update on public.quote_items
  for each row execute function public.validate_quote_item_ownership();

-- ------------------------------------------------------------------------------
-- 6. FUNCIÓN RPC TRANSACCIONAL: save_quote_atomic
-- Guarda o actualiza cabecera e ítems en un solo bloque transaccional atómico.
-- ------------------------------------------------------------------------------
create or replace function public.save_quote_atomic(
  p_quote_id uuid,
  p_user_id uuid,
  p_prefix text,
  p_client_id uuid,
  p_client_name text,
  p_client_doc_type text,
  p_client_doc_number text,
  p_client_phone text,
  p_client_email text,
  p_client_address text,
  p_issue_date date,
  p_valid_until date,
  p_currency text,
  p_subtotal_gross numeric,
  p_items_discount_total numeric,
  p_global_discount_type text,
  p_global_discount_value numeric,
  p_global_discount_amount numeric,
  p_discount_total numeric,
  p_subtotal_net numeric,
  p_taxable_base numeric,
  p_exempt_base numeric,
  p_igv_rate numeric,
  p_igv_amount numeric,
  p_total_amount numeric,
  p_payment_terms text,
  p_delivery_time text,
  p_public_notes text,
  p_internal_notes text,
  p_status text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_correlative integer;
  v_quote_number text;
  v_clean_prefix text;
  v_item jsonb;
  v_now timestamptz := pg_catalog.now();
  v_existing_correlative integer;
  v_catalog_id uuid;
  v_item_idx integer := 0;
begin
  -- 1. Validaciones básicas de parámetros
  if p_quote_id is null or p_user_id is null then
    raise exception 'Parámetros obligatorios faltantes (p_quote_id, p_user_id).';
  end if;

  if p_currency is not null and pg_catalog.upper(pg_catalog.btrim(p_currency)) <> 'PEN' then
    raise exception 'CalculaPerú únicamente admite cotizaciones en moneda PEN (Soles).';
  end if;

  if p_client_name is null or pg_catalog.length(pg_catalog.btrim(p_client_name)) < 2 or pg_catalog.length(pg_catalog.btrim(p_client_name)) > 150 then
    raise exception 'El nombre del cliente debe tener entre 2 y 150 caracteres.';
  end if;

  if p_issue_date is null then
    raise exception 'La fecha de emisión es obligatoria.';
  end if;

  if p_valid_until is not null and p_valid_until < p_issue_date then
    raise exception 'La fecha de vencimiento no puede ser anterior a la fecha de emisión.';
  end if;

  if pg_catalog.jsonb_typeof(p_items) <> 'array' then
    raise exception 'p_items debe ser un arreglo JSON.';
  end if;

  if pg_catalog.jsonb_array_length(p_items) = 0 then
    raise exception 'La cotización debe contener al menos un concepto.';
  end if;

  if pg_catalog.jsonb_array_length(p_items) > 100 then
    raise exception 'La cotización no puede contener más de 100 conceptos.';
  end if;

  -- 2. Validación de pertenencia del cliente
  if p_client_id is not null then
    if not exists (
      select 1 from public.clients
      where id = p_client_id and user_id = p_user_id
    ) then
      raise exception 'Violación de aislamiento multitenant: El cliente no pertenece al usuario.';
    end if;
  end if;

  -- 3. Validación de pertenencia de ítems de catálogo incluidos en p_items
  for v_item in select * from pg_catalog.jsonb_array_elements(p_items)
  loop
    if v_item->>'catalogItemId' is not null and pg_catalog.length(pg_catalog.btrim(v_item->>'catalogItemId')) > 0 then
      v_catalog_id := (v_item->>'catalogItemId')::uuid;
      if not exists (
        select 1 from public.catalog_items
        where id = v_catalog_id and user_id = p_user_id
      ) then
        raise exception 'Violación de aislamiento multitenant: El producto de catálogo (%) no pertenece al usuario.', v_catalog_id;
      end if;
    end if;
  end loop;

  -- 4. Comprobar si es actualización o creación
  select correlative, quote_number into v_existing_correlative, v_quote_number
  from public.quotes
  where id = p_quote_id;

  if v_existing_correlative is not null then
    -- Es actualización: verificar que pertenece a p_user_id
    if not exists (select 1 from public.quotes where id = p_quote_id and user_id = p_user_id) then
      raise exception 'Violación de aislamiento multitenant: La cotización existente no pertenece al usuario.';
    end if;

    v_correlative := v_existing_correlative;

    update public.quotes set
      client_id = p_client_id,
      client_name = pg_catalog.btrim(p_client_name),
      client_doc_type = coalesce(p_client_doc_type, 'none'),
      client_doc_number = nullif(pg_catalog.btrim(p_client_doc_number), ''),
      client_phone = nullif(pg_catalog.btrim(p_client_phone), ''),
      client_email = nullif(pg_catalog.btrim(pg_catalog.lower(p_client_email)), ''),
      client_address = nullif(pg_catalog.btrim(p_client_address), ''),
      issue_date = p_issue_date,
      valid_until = p_valid_until,
      currency = 'PEN',
      subtotal_gross = p_subtotal_gross,
      items_discount_total = p_items_discount_total,
      global_discount_type = coalesce(p_global_discount_type, 'none'),
      global_discount_value = coalesce(p_global_discount_value, 0),
      global_discount_amount = coalesce(p_global_discount_amount, 0),
      discount_total = p_discount_total,
      subtotal_net = p_subtotal_net,
      taxable_base = p_taxable_base,
      exempt_base = p_exempt_base,
      igv_rate = p_igv_rate,
      igv_amount = p_igv_amount,
      total_amount = p_total_amount,
      payment_terms = nullif(pg_catalog.btrim(p_payment_terms), ''),
      delivery_time = nullif(pg_catalog.btrim(p_delivery_time), ''),
      public_notes = nullif(pg_catalog.btrim(p_public_notes), ''),
      internal_notes = nullif(pg_catalog.btrim(p_internal_notes), ''),
      status = coalesce(p_status, 'draft'),
      updated_at = v_now
    where id = p_quote_id and user_id = p_user_id;

  else
    -- Es creación: Asignar correlativo atómico por usuario y prefijo
    v_clean_prefix := pg_catalog.upper(pg_catalog.btrim(coalesce(p_prefix, 'COT-')));
    if v_clean_prefix = '' then
      v_clean_prefix := 'COT-';
    end if;

    insert into public.quote_sequences (user_id, prefix, last_correlative, updated_at)
    values (p_user_id, v_clean_prefix, 1, v_now)
    on conflict (user_id, prefix)
    do update set
      last_correlative = public.quote_sequences.last_correlative + 1,
      updated_at = v_now
    returning last_correlative into v_correlative;

    v_quote_number := v_clean_prefix || pg_catalog.lpad(v_correlative::text, 5, '0');

    insert into public.quotes (
      id, user_id, quote_number, prefix, correlative,
      client_id, client_name, client_doc_type, client_doc_number,
      client_phone, client_email, client_address,
      issue_date, valid_until, currency,
      subtotal_gross, items_discount_total,
      global_discount_type, global_discount_value, global_discount_amount,
      discount_total, subtotal_net, taxable_base, exempt_base,
      igv_rate, igv_amount, total_amount,
      payment_terms, delivery_time, public_notes, internal_notes,
      status, created_at, updated_at
    ) values (
      p_quote_id, p_user_id, v_quote_number, v_clean_prefix, v_correlative,
      p_client_id, pg_catalog.btrim(p_client_name), coalesce(p_client_doc_type, 'none'), nullif(pg_catalog.btrim(p_client_doc_number), ''),
      nullif(pg_catalog.btrim(p_client_phone), ''), nullif(pg_catalog.btrim(pg_catalog.lower(p_client_email)), ''), nullif(pg_catalog.btrim(p_client_address), ''),
      p_issue_date, p_valid_until, 'PEN',
      p_subtotal_gross, p_items_discount_total,
      coalesce(p_global_discount_type, 'none'), coalesce(p_global_discount_value, 0), coalesce(p_global_discount_amount, 0),
      p_discount_total, p_subtotal_net, p_taxable_base, p_exempt_base,
      p_igv_rate, p_igv_amount, p_total_amount,
      nullif(pg_catalog.btrim(p_payment_terms), ''), nullif(pg_catalog.btrim(p_delivery_time), ''),
      nullif(pg_catalog.btrim(p_public_notes), ''), nullif(pg_catalog.btrim(p_internal_notes), ''),
      coalesce(p_status, 'draft'), v_now, v_now
    );
  end if;

  -- 5. Reemplazo atómico de ítems de la cotización dentro de la misma transacción
  delete from public.quote_items where quote_id = p_quote_id and user_id = p_user_id;

  for v_item in select * from pg_catalog.jsonb_array_elements(p_items)
  loop
    v_item_idx := v_item_idx + 1;
    insert into public.quote_items (
      id, quote_id, user_id, catalog_item_id, sort_order,
      description, type, unit, quantity, unit_price,
      discount_type, discount_value, discount_amount,
      is_igv_affected, gross_amount, net_amount, created_at
    ) values (
      coalesce(nullif(v_item->>'id', '')::uuid, pg_catalog.gen_random_uuid()),
      p_quote_id,
      p_user_id,
      case when v_item->>'catalogItemId' is not null and pg_catalog.length(pg_catalog.btrim(v_item->>'catalogItemId')) > 0 then (v_item->>'catalogItemId')::uuid else null end,
      coalesce((v_item->>'sortOrder')::integer, v_item_idx),
      pg_catalog.btrim((v_item->>'description')::text),
      coalesce((v_item->>'type')::text, 'product'),
      coalesce((v_item->>'unit')::text, 'unit'),
      (v_item->>'quantity')::numeric,
      (v_item->>'unitPrice')::numeric,
      coalesce((v_item->>'discountType')::text, 'none'),
      coalesce((v_item->>'discountValue')::numeric, 0),
      coalesce((v_item->>'discountAmount')::numeric, 0),
      coalesce((v_item->>'isIgvAffected')::boolean, true),
      (v_item->>'grossAmount')::numeric,
      (v_item->>'netAmount')::numeric,
      v_now
    );
  end loop;

  return pg_catalog.jsonb_build_object(
    'id', p_quote_id,
    'quoteNumber', v_quote_number,
    'correlative', v_correlative,
    'updatedAt', v_now
  );
end;
$$;

-- Endurecimiento idempotente de privilegios sobre el esquema public
revoke create on schema public from public;
revoke create on schema public from anon;
revoke create on schema public from authenticated;
grant usage on schema public to anon, authenticated, service_role;

-- Permisos estrictos: solo service_role puede ejecutar la RPC
revoke execute on function public.save_quote_atomic from public;
revoke execute on function public.save_quote_atomic from anon;
revoke execute on function public.save_quote_atomic from authenticated;
grant execute on function public.save_quote_atomic to service_role;

-- ------------------------------------------------------------------------------
-- 7. MATRIZ DE PERMISOS Y REVOCACIONES DIRECTAS A SUPABASE (Fase 2)
-- ------------------------------------------------------------------------------
-- La aplicación utiliza rutas backend con service_role. Por tanto, un usuario no
-- puede modificar directamente mediante el cliente Supabase las entidades críticas.
-- Revocar escrituras directas a anon y authenticated en todas las entidades:
revoke insert, update, delete on table public.quotes from anon, authenticated;
revoke insert, update, delete on table public.quote_items from anon, authenticated;
revoke all on table public.quote_sequences from anon, authenticated;
revoke all on table public.contact_submissions from anon, authenticated;
revoke all on table public.beta_requests from anon, authenticated;
revoke insert, update, delete on table public.clients from anon, authenticated;
revoke insert, update, delete on table public.catalog_items from anon, authenticated;

-- Otorgar privilegios completos exclusivamente a service_role
grant all on table public.quotes to service_role;
grant all on table public.quote_items to service_role;
grant all on table public.quote_sequences to service_role;
grant all on table public.contact_submissions to service_role;
grant all on table public.beta_requests to service_role;
grant all on table public.clients to service_role;
grant all on table public.catalog_items to service_role;

-- Lectura para authenticated en entidades propias
grant select on table public.quotes to authenticated;
grant select on table public.quote_items to authenticated;
grant select on table public.clients to authenticated;
grant select on table public.catalog_items to authenticated;

-- Políticas RLS explícitas: SELECT para propietarios autenticados, ALL para service_role
-- quotes
drop policy if exists "Users can manage own quotes" on public.quotes;
drop policy if exists "Authenticated users can select own quotes" on public.quotes;
drop policy if exists "Service role full access on quotes" on public.quotes;

create policy "Authenticated users can select own quotes"
  on public.quotes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role full access on quotes"
  on public.quotes for all
  to service_role
  using (true)
  with check (true);

-- quote_items
drop policy if exists "Users can manage own quote items" on public.quote_items;
drop policy if exists "Authenticated users can select own quote items" on public.quote_items;
drop policy if exists "Service role full access on quote items" on public.quote_items;

create policy "Authenticated users can select own quote items"
  on public.quote_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role full access on quote items"
  on public.quote_items for all
  to service_role
  using (true)
  with check (true);

-- quote_sequences: Sin acceso para anon ni authenticated, solo service_role
drop policy if exists "Users can manage own quote sequences" on public.quote_sequences;
drop policy if exists "Service role full access on quote sequences" on public.quote_sequences;

create policy "Service role full access on quote sequences"
  on public.quote_sequences for all
  to service_role
  using (true)
  with check (true);

-- clients
drop policy if exists "Users can manage own clients" on public.clients;
drop policy if exists "Authenticated users can select own clients" on public.clients;
drop policy if exists "Service role full access on clients" on public.clients;

create policy "Authenticated users can select own clients"
  on public.clients for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role full access on clients"
  on public.clients for all
  to service_role
  using (true)
  with check (true);

-- catalog_items
drop policy if exists "Users can manage own catalog items" on public.catalog_items;
drop policy if exists "Authenticated users can select own catalog items" on public.catalog_items;
drop policy if exists "Service role full access on catalog items" on public.catalog_items;

create policy "Authenticated users can select own catalog items"
  on public.catalog_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Service role full access on catalog items"
  on public.catalog_items for all
  to service_role
  using (true)
  with check (true);

-- contact_submissions: Solo backend service_role
drop policy if exists "Admins and service role manage contact submissions" on public.contact_submissions;
drop policy if exists "Service role full access on contact submissions" on public.contact_submissions;

create policy "Service role full access on contact submissions"
  on public.contact_submissions for all
  to service_role
  using (true)
  with check (true);

-- beta_requests: Solo backend service_role
drop policy if exists "Anyone can insert beta requests" on public.beta_requests;
drop policy if exists "Only service role manages beta requests" on public.beta_requests;
drop policy if exists "Admins and service role manage beta requests" on public.beta_requests;
drop policy if exists "Admins can view and manage beta requests" on public.beta_requests;
drop policy if exists "Service role full access on beta requests" on public.beta_requests;

create policy "Service role full access on beta requests"
  on public.beta_requests for all
  to service_role
  using (true)
  with check (true);
