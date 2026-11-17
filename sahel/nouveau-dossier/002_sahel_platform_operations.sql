-- SAHEL CONNECT — Étape 2 à 5 : contrôle plateforme, partenaires, paiements et droits.
-- À exécuter APRÈS 001_multiservices_foundation.sql dans Supabase SQL Editor.
-- Faire une sauvegarde et tester d'abord sur un projet Supabase de test.
-- Aucun secret de paiement n'est stocké ici. Les statuts de paiement sont modifiés côté serveur.

create extension if not exists pgcrypto;

-- Référentiel régional : Niger activé au départ ; les autres pays restent désactivés
-- jusqu'à validation opérationnelle, juridique et commerciale.
insert into public.rg_countries(code,name,currency_code,default_locale,enabled) values
 ('NE','Niger','XOF','fr',true),
 ('BJ','Bénin','XOF','fr',false), ('BF','Burkina Faso','XOF','fr',false),
 ('CV','Cap-Vert','CVE','pt',false), ('CI','Côte d’Ivoire','XOF','fr',false),
 ('GM','Gambie','GMD','en',false), ('GH','Ghana','GHS','en',false),
 ('GN','Guinée','GNF','fr',false), ('GW','Guinée-Bissau','XOF','pt',false),
 ('LR','Liberia','LRD','en',false), ('ML','Mali','XOF','fr',false),
 ('MR','Mauritanie','MRU','ar',false), ('NG','Nigeria','NGN','en',false),
 ('SN','Sénégal','XOF','fr',false), ('SL','Sierra Leone','SLE','en',false),
 ('TG','Togo','XOF','fr',false)
on conflict (code) do update set name=excluded.name, currency_code=excluded.currency_code, default_locale=excluded.default_locale;

-- Liste d'autorisation privée du propriétaire de la plateforme.
-- L'ajout du premier propriétaire se fait manuellement dans SQL Editor (voir INSTALLATION-SAHEL.md).
create table if not exists public.rg_platform_owners (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.rg_platform_owners enable row level security;
revoke all on public.rg_platform_owners from anon, authenticated;
grant select on public.rg_platform_owners to authenticated;
drop policy if exists "platform owner reads own grant" on public.rg_platform_owners;
create policy "platform owner reads own grant" on public.rg_platform_owners
  for select to authenticated using (user_id = auth.uid());

create or replace function public.rg_is_platform_owner()
returns boolean language sql stable security definer set search_path = public, auth
as $$ select exists(select 1 from public.rg_platform_owners p where p.user_id=auth.uid() and p.active=true) $$;
revoke all on function public.rg_is_platform_owner() from public;
grant execute on function public.rg_is_platform_owner() to authenticated;

-- Partenaires, représentants et opérateurs nationaux.
create table if not exists public.rg_partners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.rg_organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  country_code char(2) not null references public.rg_countries(code),
  partner_type text not null check (partner_type in ('national_representative','institutional','payment_provider','delivery','commercial','technical','other')),
  company_name text not null,
  contact_email text,
  contact_phone text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  notes jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rg_partners_country_status_idx on public.rg_partners(country_code,status);
create index if not exists rg_partners_org_idx on public.rg_partners(organization_id);
alter table public.rg_partners enable row level security;
grant select,insert,update on public.rg_partners to authenticated;
drop policy if exists "partner visible to owner or org" on public.rg_partners;
drop policy if exists "org admin submits partner" on public.rg_partners;
drop policy if exists "platform owner manages partners" on public.rg_partners;
create policy "partner visible to owner or org" on public.rg_partners for select to authenticated
  using (public.rg_is_platform_owner() or user_id=auth.uid() or public.rg_is_org_member(organization_id));
create policy "org admin submits partner" on public.rg_partners for insert to authenticated
  with check (public.rg_is_org_admin(organization_id) and created_by=auth.uid() and status='pending');
create policy "platform owner manages partners" on public.rg_partners for update to authenticated
  using (public.rg_is_platform_owner()) with check (public.rg_is_platform_owner());

-- Paiements : journal d'intentions/transactions. Aucune donnée de carte bancaire.
-- Les mises à jour de statut doivent provenir d'une fonction serveur/webhook vérifié.
create table if not exists public.rg_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.rg_organizations(id) on delete cascade,
  country_code char(2) not null references public.rg_countries(code),
  module_code text not null check (module_code in ('restaurant','market','commerce','delivery','hotel','transport','services','events','agro','travel','pay','business')),
  record_id uuid,
  amount_minor bigint not null check (amount_minor > 0),
  currency_code char(3) not null,
  provider text not null default 'manual',
  provider_reference text,
  status text not null default 'created' check (status in ('created','pending','succeeded','failed','cancelled','refunded')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rg_payment_org_created_idx on public.rg_payment_transactions(organization_id,created_at desc);
create index if not exists rg_payment_status_idx on public.rg_payment_transactions(status,created_at desc);
alter table public.rg_payment_transactions enable row level security;
grant select,insert on public.rg_payment_transactions to authenticated;
drop policy if exists "payment visible to org or platform owner" on public.rg_payment_transactions;
drop policy if exists "org member creates pending payment" on public.rg_payment_transactions;
create policy "payment visible to org or platform owner" on public.rg_payment_transactions for select to authenticated
  using (public.rg_is_platform_owner() or public.rg_is_org_member(organization_id));
create policy "org member creates pending payment" on public.rg_payment_transactions for insert to authenticated
  with check (public.rg_is_org_member(organization_id) and created_by=auth.uid() and status='created');
-- Aucun droit UPDATE/DELETE pour les utilisateurs du navigateur.

-- Autoriser le propriétaire de plateforme à superviser les données multi-organisations.
drop policy if exists "platform owner reads all countries" on public.rg_countries;
create policy "platform owner reads all countries" on public.rg_countries for select to authenticated
  using (public.rg_is_platform_owner());
drop policy if exists "platform owner reads all organizations" on public.rg_organizations;
create policy "platform owner reads all organizations" on public.rg_organizations for select to authenticated
  using (public.rg_is_platform_owner());
drop policy if exists "platform owner updates organizations" on public.rg_organizations;
create policy "platform owner updates organizations" on public.rg_organizations for update to authenticated
  using (public.rg_is_platform_owner()) with check (public.rg_is_platform_owner());
drop policy if exists "platform owner reads all profiles" on public.rg_profiles;
create policy "platform owner reads all profiles" on public.rg_profiles for select to authenticated
  using (public.rg_is_platform_owner());
drop policy if exists "platform owner reads all memberships" on public.rg_memberships;
create policy "platform owner reads all memberships" on public.rg_memberships for select to authenticated
  using (public.rg_is_platform_owner());
drop policy if exists "platform owner reads all establishments" on public.rg_establishments;
create policy "platform owner reads all establishments" on public.rg_establishments for select to authenticated
  using (public.rg_is_platform_owner());
drop policy if exists "platform owner reads all service records" on public.rg_service_records;
create policy "platform owner reads all service records" on public.rg_service_records for select to authenticated
  using (public.rg_is_platform_owner());
drop policy if exists "platform owner reads audit logs" on public.rg_audit_logs;
create policy "platform owner reads audit logs" on public.rg_audit_logs for select to authenticated
  using (public.rg_is_platform_owner());

-- Empêcher une organisation de s'auto-déclarer vérifiée.
create or replace function public.rg_guard_org_verification()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
begin
  if tg_op = 'INSERT' and new.verification_status <> 'pending' and not public.rg_is_platform_owner() then
    raise exception 'Une organisation doit être vérifiée par la plateforme';
  end if;
  if tg_op = 'UPDATE' and new.verification_status is distinct from old.verification_status and not public.rg_is_platform_owner() then
    raise exception 'Seul le propriétaire de la plateforme peut modifier le statut de vérification';
  end if;
  return new;
end $$;
drop trigger if exists rg_guard_org_verification_trg on public.rg_organizations;
create trigger rg_guard_org_verification_trg before insert or update on public.rg_organizations
  for each row execute function public.rg_guard_org_verification();

-- La modification de statut d'un enregistrement métier est limitée à l'auteur ou à un administrateur.
drop policy if exists "members update service records" on public.rg_service_records;
create policy "authors or admins update service records" on public.rg_service_records for update to authenticated
  using (created_by=auth.uid() or public.rg_is_org_admin(organization_id))
  with check (created_by=auth.uid() or public.rg_is_org_admin(organization_id));

-- Activation/désactivation des pays réservée au propriétaire vérifié.
create or replace function public.rg_platform_set_country_enabled(p_code char(2), p_enabled boolean)
returns void language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.rg_is_platform_owner() then raise exception 'Accès propriétaire requis'; end if;
  update public.rg_countries set enabled=p_enabled where code=p_code;
  if not found then raise exception 'Pays inconnu'; end if;
  insert into public.rg_audit_logs(organization_id,actor_user_id,action,entity_type,entity_id,details)
  values(null,auth.uid(),'country.toggle','country',p_code,jsonb_build_object('enabled',p_enabled));
end $$;
revoke all on function public.rg_platform_set_country_enabled(char(2),boolean) from public;
grant execute on function public.rg_platform_set_country_enabled(char(2),boolean) to authenticated;

-- updated_at pour les nouvelles tables.
drop trigger if exists rg_touch_partners on public.rg_partners;
create trigger rg_touch_partners before update on public.rg_partners for each row execute function public.rg_touch_updated_at();
drop trigger if exists rg_touch_payments on public.rg_payment_transactions;
create trigger rg_touch_payments before update on public.rg_payment_transactions for each row execute function public.rg_touch_updated_at();

notify pgrst, 'reload schema';

-- Droits SQL explicites pour les rôles applicatifs ; les politiques RLS restent obligatoires.
grant select on public.rg_profiles to authenticated;
grant insert,update on public.rg_profiles to authenticated;
grant select,insert,update on public.rg_organizations to authenticated;
grant select,insert,update,delete on public.rg_memberships to authenticated;
grant select,insert,update,delete on public.rg_establishments to authenticated;
grant select,insert,update,delete on public.rg_service_records to authenticated;
grant select,insert on public.rg_audit_logs to authenticated;
grant select on public.rg_countries to anon,authenticated;
