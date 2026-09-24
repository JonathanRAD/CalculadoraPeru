-- ==============================================================================
-- CALCULAPERÚ - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL 15+)
-- ==============================================================================

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 1. TABLA: PROFILES (Perfiles de usuarios y datos corporativos)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_pro boolean not null default false,
  plan text check (plan in ('monthly', 'yearly')),
  pro_expires_at timestamptz,
  activated_code text,
  
  -- Autenticación interna (scrypt para nuevas claves; PBKDF2 heredado se migra al iniciar sesión)
  password_hash text,
  salt text,
  session_version integer not null default 0,
  
  -- Membrete y Personalización Corporativa
  company_name text,
  company_ruc text,
  company_address text,
  company_logo_url text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para búsqueda rápida
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_is_pro on public.profiles(is_pro);

-- 2. TABLA: LICENSES (Códigos de activación PRO emitidos)
create table if not exists public.licenses (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  plan text not null check (plan in ('monthly', 'yearly')),
  duration_days integer not null default 365,
  assigned_client_name text not null,
  assigned_client_email text,
  status text not null default 'available' check (status in ('available', 'redeemed', 'revoked')),
  redeemed_by_user_id uuid references public.profiles(id) on delete set null,
  redeemed_by_user_email text,
  redeemed_at timestamptz,
  created_by text not null default 'Admin Panel',
  created_at timestamptz not null default now()
);

-- Índices para licencias
create index if not exists idx_licenses_code on public.licenses(code);
create index if not exists idx_licenses_status on public.licenses(status);

-- 3. TABLA: AUDIT_LOGS (Trazabilidad inmutable de acciones del panel admin)
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null,
  performed_by text not null,
  target_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- 4. TABLA: ANALYTICS_EVENTS (Métricas nativas en tiempo real: visitas, páginas y búsquedas)
create table if not exists public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null check (event_type in ('page_view', 'search', 'calculator_use', 'pro_click')),
  path text not null,
  query text,
  referrer text,
  device text default 'desktop' check (device in ('desktop', 'mobile', 'tablet')),
  session_id text,
  created_at timestamptz not null default now()
);

-- Índices de alto rendimiento para analítica
create index if not exists idx_analytics_created_at on public.analytics_events(created_at desc);
create index if not exists idx_analytics_event_type on public.analytics_events(event_type);
create index if not exists idx_analytics_path on public.analytics_events(path);
create index if not exists idx_analytics_query on public.analytics_events(query);

-- 5. POLÍTICAS ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.licenses enable row level security;
alter table public.audit_logs enable row level security;
alter table public.analytics_events enable row level security;

-- Profiles: Los usuarios pueden leer su propio perfil
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id or auth.jwt() ->> 'role' = 'service_role');

-- Profiles: Los usuarios pueden actualizar su propio perfil
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id or auth.jwt() ->> 'role' = 'service_role');

-- Licenses: Solo el servicio backend o administradores pueden acceder
create policy "Admins and service role can manage licenses"
  on public.licenses for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Audit Logs: Solo el servicio backend puede escribir logs
create policy "Admins and service role can manage audit logs"
  on public.audit_logs for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Analytics: Permitir inserción anónima y lectura solo a administradores / service_role
create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  with check (true);

create policy "Admins and service role can view analytics"
  on public.analytics_events for select
  using (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 5. TABLA: CÁLCULOS GUARDADOS (MIS CÁLCULOS PRO)
-- ============================================================================
create table if not exists public.saved_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  calculator_type text not null,
  title text not null,
  summary_text text,
  total_amount numeric(12, 2),
  data jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_saved_calculations_user on public.saved_calculations(user_id);
create index if not exists idx_saved_calculations_created on public.saved_calculations(created_at desc);

alter table public.saved_calculations enable row level security;

create policy "Users can manage own saved calculations"
  on public.saved_calculations for all
  using (auth.uid() = user_id or auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 6. TABLA: SOLICITUDES DE SUSCRIPCIÓN PRO (PAGOS YAPE / PLIN EN REVISIÓN)
-- ============================================================================
create table if not exists public.subscription_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount numeric(10, 2) not null,
  operation_code text not null,
  coupon_code text,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  generated_license_code text,
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create index if not exists idx_subscription_requests_status on public.subscription_requests(status);
create index if not exists idx_subscription_requests_created_at on public.subscription_requests(created_at desc);
create index if not exists idx_subscription_requests_email on public.subscription_requests(customer_email);
create index if not exists idx_subscription_requests_op_code on public.subscription_requests(operation_code);

alter table public.subscription_requests enable row level security;

-- Cualquier usuario puede crear una solicitud de suscripción
create policy "Anyone can insert subscription requests"
  on public.subscription_requests for insert
  with check (true);

-- Solo administradores y service_role pueden ver y gestionar solicitudes
create policy "Admins and service role can manage subscription requests"
  on public.subscription_requests for all
  using (auth.jwt() ->> 'role' = 'service_role');
