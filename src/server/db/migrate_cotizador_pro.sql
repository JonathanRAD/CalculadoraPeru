-- ==============================================================================
-- CALCULAPERÚ - MIGRACIÓN COTIZADOR COMERCIAL PRO (POSTGRESQL 15+ / SUPABASE)
-- ==============================================================================
-- Idempotente: puede ejecutarse de manera segura sin destruir tablas existentes.

-- 1. TABLA: CLIENTS (Directorio de clientes guardados del usuario PRO)
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 150),
  doc_type text not null default 'none' check (doc_type in ('none', 'dni', 'ruc', 'other')),
  doc_number text check (doc_number is null or length(trim(doc_number)) between 3 and 20),
  phone text check (phone is null or length(trim(phone)) between 7 and 18),
  email text check (email is null or length(trim(email)) <= 254),
  address text check (address is null or length(trim(address)) <= 180),
  notes text check (notes is null or length(trim(notes)) <= 500),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clients_user_id on public.clients(user_id);
create index if not exists idx_clients_name on public.clients(name);
create index if not exists idx_clients_status on public.clients(status);

-- 2. TABLA: CATALOG_ITEMS (Catálogo reutilizable de productos y servicios)
create table if not exists public.catalog_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'product' check (type in ('product', 'service')),
  name text not null check (length(trim(name)) between 2 and 120),
  description text check (description is null or length(trim(description)) <= 300),
  sku text check (sku is null or length(trim(sku)) <= 40),
  unit text not null default 'unit' check (unit in ('unit', 'service', 'hour', 'day', 'kg', 'meter', 'pack', 'other')),
  price numeric(12, 2) not null check (price >= 0 and price <= 999999999.99),
  is_igv_affected boolean not null default true,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_catalog_items_user_id on public.catalog_items(user_id);
create index if not exists idx_catalog_items_name on public.catalog_items(name);
create index if not exists idx_catalog_items_status on public.catalog_items(status);

-- 3. TABLA: QUOTES (Cabecera de cotizaciones comerciales)
create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quote_number text not null,
  prefix text not null default 'COT-',
  correlative integer not null check (correlative > 0),
  client_id uuid references public.clients(id) on delete set null,
  client_name text not null check (length(trim(client_name)) between 2 and 150),
  client_doc_type text not null default 'none' check (client_doc_type in ('none', 'dni', 'ruc', 'other')),
  client_doc_number text check (client_doc_number is null or length(trim(client_doc_number)) <= 20),
  client_phone text check (client_phone is null or length(trim(client_phone)) <= 20),
  client_email text check (client_email is null or length(trim(client_email)) <= 254),
  client_address text check (client_address is null or length(trim(client_address)) <= 180),
  issue_date date not null default current_date,
  valid_until date check (valid_until is null or valid_until >= issue_date),
  currency text not null default 'PEN' check (currency in ('PEN')),
  subtotal_gross numeric(14, 2) not null default 0 check (subtotal_gross >= 0),
  items_discount_total numeric(14, 2) not null default 0 check (items_discount_total >= 0),
  global_discount_type text not null default 'none' check (global_discount_type in ('none', 'percent', 'fixed')),
  global_discount_value numeric(14, 2) not null default 0 check (global_discount_value >= 0),
  global_discount_amount numeric(14, 2) not null default 0 check (global_discount_amount >= 0),
  discount_total numeric(14, 2) not null default 0 check (discount_total >= 0),
  subtotal_net numeric(14, 2) not null default 0 check (subtotal_net >= 0),
  taxable_base numeric(14, 2) not null default 0 check (taxable_base >= 0),
  exempt_base numeric(14, 2) not null default 0 check (exempt_base >= 0),
  igv_rate numeric(5, 4) not null default 0.18 check (igv_rate >= 0 and igv_rate <= 1),
  igv_amount numeric(14, 2) not null default 0 check (igv_amount >= 0),
  total_amount numeric(14, 2) not null default 0 check (total_amount >= 0),
  payment_terms text check (payment_terms is null or length(trim(payment_terms)) <= 500),
  delivery_time text check (delivery_time is null or length(trim(delivery_time)) <= 150),
  public_notes text check (public_notes is null or length(trim(public_notes)) <= 700),
  internal_notes text check (internal_notes is null or length(trim(internal_notes)) <= 700),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired', 'canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, prefix, correlative)
);

create index if not exists idx_quotes_user_id on public.quotes(user_id);
create index if not exists idx_quotes_status on public.quotes(status);
create index if not exists idx_quotes_issue_date on public.quotes(issue_date desc);
create index if not exists idx_quotes_created_at on public.quotes(created_at desc);

-- 4. TABLA: QUOTE_ITEMS (Líneas de concepto de la cotización)
create table if not exists public.quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  catalog_item_id uuid references public.catalog_items(id) on delete set null,
  sort_order integer not null default 0,
  description text not null check (length(trim(description)) between 2 and 200),
  type text not null default 'product' check (type in ('product', 'service')),
  unit text not null default 'unit' check (unit in ('unit', 'service', 'hour', 'day', 'kg', 'meter', 'pack', 'other')),
  quantity numeric(10, 3) not null check (quantity > 0 and quantity <= 999999.999),
  unit_price numeric(12, 2) not null check (unit_price >= 0 and unit_price <= 999999999.99),
  discount_type text not null default 'none' check (discount_type in ('none', 'percent', 'fixed')),
  discount_value numeric(12, 2) not null default 0 check (discount_value >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  is_igv_affected boolean not null default true,
  gross_amount numeric(14, 2) not null default 0 check (gross_amount >= 0),
  net_amount numeric(14, 2) not null default 0 check (net_amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_quote_items_quote_id on public.quote_items(quote_id);
create index if not exists idx_quote_items_user_id on public.quote_items(user_id);

-- 5. TABLA: BETA_REQUESTS (Registro auditable de lista de espera con consentimiento)
create table if not exists public.beta_requests (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  phone text,
  source text not null default 'cotizador',
  consent boolean not null check (consent = true),
  status text not null default 'pending' check (status in ('pending', 'contacted', 'approved', 'rejected')),
  benefit_granted text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create index if not exists idx_beta_requests_email on public.beta_requests(email);
create index if not exists idx_beta_requests_status on public.beta_requests(status);
create index if not exists idx_beta_requests_created_at on public.beta_requests(created_at desc);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
alter table public.clients enable row level security;
alter table public.catalog_items enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.beta_requests enable row level security;

-- 7. POLÍTICAS RLS POR USUARIO
-- Clients
drop policy if exists "Users can manage own clients" on public.clients;
create policy "Users can manage own clients"
  on public.clients for all
  using (auth.uid() = user_id or auth.jwt() ->> 'role' = 'service_role');

-- Catalog Items
drop policy if exists "Users can manage own catalog items" on public.catalog_items;
create policy "Users can manage own catalog items"
  on public.catalog_items for all
  using (auth.uid() = user_id or auth.jwt() ->> 'role' = 'service_role');

-- Quotes
drop policy if exists "Users can manage own quotes" on public.quotes;
create policy "Users can manage own quotes"
  on public.quotes for all
  using (auth.uid() = user_id or auth.jwt() ->> 'role' = 'service_role');

-- Quote Items
drop policy if exists "Users can manage own quote items" on public.quote_items;
create policy "Users can manage own quote items"
  on public.quote_items for all
  using (auth.uid() = user_id or auth.jwt() ->> 'role' = 'service_role');

-- Beta Requests: inserción anónima permitida con consentimiento, lectura solo admin / service_role
drop policy if exists "Anyone can insert beta requests" on public.beta_requests;
create policy "Anyone can insert beta requests"
  on public.beta_requests for insert
  with check (consent = true);

drop policy if exists "Admins can view and manage beta requests" on public.beta_requests;
create policy "Admins can view and manage beta requests"
  on public.beta_requests for all
  using (auth.jwt() ->> 'role' = 'service_role');
