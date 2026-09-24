-- Apply before deploying the session and rate-limit changes.
alter table public.profiles
  add column if not exists session_version integer not null default 0;

create table if not exists public.auth_rate_limits (
  bucket text primary key,
  window_started timestamptz not null default now(),
  attempts integer not null default 0
);

alter table public.auth_rate_limits enable row level security;

create or replace function public.consume_auth_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare current_attempts integer;
begin
  insert into public.auth_rate_limits as limits (bucket, window_started, attempts)
  values (p_bucket, now(), 1)
  on conflict (bucket) do update set
    attempts = case
      when limits.window_started <= now() - make_interval(secs => p_window_seconds) then 1
      else limits.attempts + 1
    end,
    window_started = case
      when limits.window_started <= now() - make_interval(secs => p_window_seconds) then now()
      else limits.window_started
    end
  returning attempts into current_attempts;

  if random() < 0.002 then
    delete from public.auth_rate_limits
    where window_started < now() - interval '2 days';
  end if;

  return current_attempts <= p_limit;
end;
$$;

revoke all on public.auth_rate_limits from anon, authenticated;
revoke all on function public.consume_auth_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_auth_rate_limit(text, integer, integer) to service_role;

create or replace function public.redeem_license_for_user(p_code text, p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  license_row public.licenses%rowtype;
  profile_email text;
begin
  select * into license_row from public.licenses where code = upper(trim(p_code)) for update;
  if not found then return 'not_found'; end if;
  if license_row.status <> 'available' then return license_row.status; end if;

  select email into profile_email from public.profiles where id = p_user_id for update;
  if not found then return 'user_not_found'; end if;
  if license_row.assigned_client_email is not null and
     lower(license_row.assigned_client_email) <> lower(profile_email) then
    return 'assigned_to_other';
  end if;

  update public.profiles set
    is_pro = true,
    plan = license_row.plan,
    pro_expires_at = now() + make_interval(days => license_row.duration_days),
    activated_code = license_row.code,
    updated_at = now()
  where id = p_user_id;

  update public.licenses set
    status = 'redeemed',
    redeemed_by_user_id = p_user_id,
    redeemed_by_user_email = profile_email,
    redeemed_at = now()
  where id = license_row.id;

  return 'redeemed_ok';
end;
$$;

revoke all on function public.redeem_license_for_user(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_license_for_user(text, uuid) to service_role;
