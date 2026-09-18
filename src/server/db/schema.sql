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
