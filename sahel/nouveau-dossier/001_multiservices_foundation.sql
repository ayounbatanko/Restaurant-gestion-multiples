-- Sahel Connect : fondation multi-pays / multi-organisations (version 1.1 corrigée).
-- À exécuter dans un projet Supabase de TEST (SQL Editor), après sauvegarde et revue.
-- Ce script est ré-exécutable (idempotent) et ne touche PAS aux tables historiques rg_users / rg_rests / rg_orders.
-- Corrections par rapport à la v1.0 :
--  * le créateur d'une organisation devient automatiquement « owner » (sinon il ne pouvait ni la lire ni la gérer) ;
--  * les politiques sont recréées proprement (drop policy if exists) ;
--  * un « admin » ne peut plus se promouvoir ou promouvoir quelqu'un « owner » ;
--  * mise à jour automatique de updated_at ;
--  * création automatique du profil à l'inscription ;
--  * module_code limité aux 12 pôles ; indexes sur les clés étrangères.

create extension if not exists pgcrypto;

create table if not exists public.rg_countries (
  code char(2) primary key,
  name text not null,
  currency_code char(3) not null,
  default_locale text not null default 'fr',
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rg_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  country_code char(2) references public.rg_countries(code),
  preferred_locale text not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rg_organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  public_name text not null,
  country_code char(2) not null references public.rg_countries(code),
  organization_type text not null default 'business',
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','suspended')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rg_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.rg_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','staff','viewer')),
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id,user_id)
);

create table if not exists public.rg_establishments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.rg_organizations(id) on delete cascade,
  module_code text not null check (module_code in ('restaurant','market','commerce','delivery','hotel','transport','services','events','agro','travel','pay','business')),
  name text not null,
  country_code char(2) not null references public.rg_countries(code),
  city text,
  address text,
  status text not null default 'draft' check (status in ('draft','pending','active','suspended','closed')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rg_service_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.rg_organizations(id) on delete cascade,
  establishment_id uuid references public.rg_establishments(id) on delete set null,
  module_code text not null check (module_code in ('restaurant','market','commerce','delivery','hotel','transport','services','events','agro','travel','pay','business')),
  record_type text not null,
  status text not null default 'draft',
  reference text,
  amount_minor bigint check (amount_minor is null or amount_minor >= 0),
  currency_code char(3),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rg_audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.rg_organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists rg_memberships_user_idx on public.rg_memberships(user_id);
create index if not exists rg_organizations_creator_idx on public.rg_organizations(created_by);
create index if not exists rg_establishments_org_module_idx on public.rg_establishments(organization_id,module_code);
create index if not exists rg_service_records_org_module_idx on public.rg_service_records(organization_id,module_code,created_at desc);
create index if not exists rg_service_records_establishment_idx on public.rg_service_records(establishment_id);
create index if not exists rg_service_records_payload_gin on public.rg_service_records using gin(payload);
create index if not exists rg_audit_logs_org_created_idx on public.rg_audit_logs(organization_id,created_at desc);

-- ---------- Fonctions ----------
create or replace function public.rg_is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.rg_memberships m where m.organization_id = target_org and m.user_id = auth.uid()) $$;

create or replace function public.rg_is_org_admin(target_org uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.rg_memberships m where m.organization_id = target_org and m.user_id = auth.uid() and m.role in ('owner','admin')) $$;

create or replace function public.rg_is_org_owner(target_org uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.rg_memberships m where m.organization_id = target_org and m.user_id = auth.uid() and m.role = 'owner') $$;

create or replace function public.rg_touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Le créateur d'une organisation en devient automatiquement propriétaire.
create or replace function public.rg_org_creator_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.rg_memberships(organization_id,user_id,role) values (new.id,new.created_by,'owner')
  on conflict (organization_id,user_id) do nothing;
  return new;
end $$;

-- Profil créé automatiquement à l'inscription.
create or replace function public.rg_new_user_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.rg_profiles(user_id,display_name) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists rg_touch_profiles on public.rg_profiles;
create trigger rg_touch_profiles before update on public.rg_profiles for each row execute function public.rg_touch_updated_at();
drop trigger if exists rg_touch_orgs on public.rg_organizations;
create trigger rg_touch_orgs before update on public.rg_organizations for each row execute function public.rg_touch_updated_at();
drop trigger if exists rg_touch_estab on public.rg_establishments;
create trigger rg_touch_estab before update on public.rg_establishments for each row execute function public.rg_touch_updated_at();
drop trigger if exists rg_touch_records on public.rg_service_records;
create trigger rg_touch_records before update on public.rg_service_records for each row execute function public.rg_touch_updated_at();
drop trigger if exists rg_org_owner_trg on public.rg_organizations;
create trigger rg_org_owner_trg after insert on public.rg_organizations for each row execute function public.rg_org_creator_owner();
drop trigger if exists rg_new_user_profile_trg on auth.users;
create trigger rg_new_user_profile_trg after insert on auth.users for each row execute function public.rg_new_user_profile();

-- ---------- RLS ----------
alter table public.rg_profiles enable row level security;
alter table public.rg_organizations enable row level security;
alter table public.rg_memberships enable row level security;
alter table public.rg_establishments enable row level security;
alter table public.rg_service_records enable row level security;
alter table public.rg_audit_logs enable row level security;
alter table public.rg_countries enable row level security;

drop policy if exists "profiles read own" on public.rg_profiles;
drop policy if exists "profiles insert own" on public.rg_profiles;
drop policy if exists "profiles update own" on public.rg_profiles;
create policy "profiles read own" on public.rg_profiles for select to authenticated using (user_id = auth.uid());
create policy "profiles insert own" on public.rg_profiles for insert to authenticated with check (user_id = auth.uid());
create policy "profiles update own" on public.rg_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "countries visible when enabled" on public.rg_countries;
create policy "countries visible when enabled" on public.rg_countries for select to anon, authenticated using (enabled = true);

drop policy if exists "organization members read org" on public.rg_organizations;
drop policy if exists "user creates organization" on public.rg_organizations;
drop policy if exists "org admins update org" on public.rg_organizations;
-- le créateur peut relire son organisation (nécessaire pour « insert ... returning »)
create policy "organization members read org" on public.rg_organizations for select to authenticated using (public.rg_is_org_member(id) or created_by = auth.uid());
create policy "user creates organization" on public.rg_organizations for insert to authenticated with check (created_by = auth.uid());
create policy "org admins update org" on public.rg_organizations for update to authenticated using (public.rg_is_org_admin(id)) with check (public.rg_is_org_admin(id));

drop policy if exists "members read membership list" on public.rg_memberships;
drop policy if exists "org admins manage memberships" on public.rg_memberships;
drop policy if exists "org admins insert memberships" on public.rg_memberships;
drop policy if exists "org admins update memberships" on public.rg_memberships;
drop policy if exists "org admins delete memberships" on public.rg_memberships;
create policy "members read membership list" on public.rg_memberships for select to authenticated using (user_id = auth.uid() or public.rg_is_org_member(organization_id));
-- seul un « owner » peut attribuer ou retirer le rôle owner ; un « admin » gère les autres rôles
create policy "org admins insert memberships" on public.rg_memberships for insert to authenticated
  with check (public.rg_is_org_owner(organization_id) or (public.rg_is_org_admin(organization_id) and role <> 'owner'));
create policy "org admins update memberships" on public.rg_memberships for update to authenticated
  using (public.rg_is_org_owner(organization_id) or (public.rg_is_org_admin(organization_id) and role <> 'owner'))
  with check (public.rg_is_org_owner(organization_id) or (public.rg_is_org_admin(organization_id) and role <> 'owner'));
create policy "org admins delete memberships" on public.rg_memberships for delete to authenticated
  using (public.rg_is_org_owner(organization_id) or (public.rg_is_org_admin(organization_id) and role <> 'owner'));

drop policy if exists "members read establishments" on public.rg_establishments;
drop policy if exists "org admins insert establishments" on public.rg_establishments;
drop policy if exists "org admins update establishments" on public.rg_establishments;
drop policy if exists "org admins delete establishments" on public.rg_establishments;
create policy "members read establishments" on public.rg_establishments for select to authenticated using (public.rg_is_org_member(organization_id));
create policy "org admins insert establishments" on public.rg_establishments for insert to authenticated with check (public.rg_is_org_admin(organization_id));
create policy "org admins update establishments" on public.rg_establishments for update to authenticated using (public.rg_is_org_admin(organization_id)) with check (public.rg_is_org_admin(organization_id));
create policy "org admins delete establishments" on public.rg_establishments for delete to authenticated using (public.rg_is_org_admin(organization_id));

drop policy if exists "members read service records" on public.rg_service_records;
drop policy if exists "members insert service records" on public.rg_service_records;
drop policy if exists "members update service records" on public.rg_service_records;
drop policy if exists "org admins delete service records" on public.rg_service_records;
create policy "members read service records" on public.rg_service_records for select to authenticated using (public.rg_is_org_member(organization_id));
create policy "members insert service records" on public.rg_service_records for insert to authenticated with check (public.rg_is_org_member(organization_id) and created_by = auth.uid());
create policy "members update service records" on public.rg_service_records for update to authenticated using (public.rg_is_org_member(organization_id)) with check (public.rg_is_org_member(organization_id));
create policy "org admins delete service records" on public.rg_service_records for delete to authenticated using (public.rg_is_org_admin(organization_id));

drop policy if exists "org members read audit logs" on public.rg_audit_logs;
drop policy if exists "authenticated users append audit logs" on public.rg_audit_logs;
create policy "org members read audit logs" on public.rg_audit_logs for select to authenticated using (organization_id is not null and public.rg_is_org_admin(organization_id));
create policy "authenticated users append audit logs" on public.rg_audit_logs for insert to authenticated with check (actor_user_id = auth.uid() and (organization_id is null or public.rg_is_org_member(organization_id)));

-- ---------- Pays ----------
insert into public.rg_countries(code,name,currency_code,default_locale,enabled) values
 ('NE','Niger','XOF','fr',true),
 ('CI','Côte d’Ivoire','XOF','fr',false),
 ('BJ','Bénin','XOF','fr',false),
 ('TG','Togo','XOF','fr',false),
 ('SN','Sénégal','XOF','fr',false),
 ('BF','Burkina Faso','XOF','fr',false),
 ('ML','Mali','XOF','fr',false),
 ('GH','Ghana','GHS','en',false),
 ('NG','Nigeria','NGN','en',false)
on conflict (code) do nothing;

-- IMPORTANT : tester ces politiques avec au moins 3 comptes (propriétaire, admin, membre) et 2 organisations.
-- Les paiements, réservations et commandes exigent des tables métier et des validations serveur non incluses ici.
