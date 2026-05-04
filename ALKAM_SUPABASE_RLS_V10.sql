-- ALKAM MALİ İstasyON - Supabase RLS / Yetki Taslağı v10
-- Bu dosya taslaktır. Canlıya uygulanmadan önce test ortamında denenmelidir.
-- Amaç: ileride çok kullanıcılı yapıya geçerken veri güvenliğini standartlaştırmak.

-- Kullanıcı profilleri
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'viewer',
  aktif boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_profiles_role_check check (role in ('admin','operator','viewer','auditor'))
);

-- Yetki yardımcı fonksiyonu
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select coalesce((select role from public.user_profiles where id = auth.uid() and aktif = true), 'viewer');
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.can_write_finance()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.current_user_role() in ('admin','operator');
$$;

create or replace function public.can_audit()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.current_user_role() in ('admin','auditor');
$$;

-- RLS açılacak tablolar
alter table if exists public.cariler enable row level security;
alter table if exists public.cari_hareketleri enable row level security;
alter table if exists public.tahakkuklar enable row level security;
alter table if exists public.tahsilatlar enable row level security;
alter table if exists public.finans_hesaplari enable row level security;
alter table if exists public.finans_hareketleri enable row level security;
alter table if exists public.banka_import_raw enable row level security;
alter table if exists public.banka_onay_bekleyen enable row level security;
alter table if exists public.banka_islenen enable row level security;
alter table if exists public.banka_reddedilen enable row level security;
alter table if exists public.sistem_yedekleri enable row level security;
alter table if exists public.sistem_loglari enable row level security;
alter table if exists public.modul_surumleri enable row level security;
alter table if exists public.gunluk_kontrol_ozetleri enable row level security;
alter table if exists public.user_profiles enable row level security;

-- user_profiles politikaları
create policy if not exists user_profiles_select_self_or_admin
on public.user_profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy if not exists user_profiles_admin_all
on public.user_profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Genel okuma: tüm aktif kullanıcılar okuyabilir
create policy if not exists cariler_select_authenticated
on public.cariler
for select
to authenticated
using (true);

create policy if not exists cari_hareketleri_select_authenticated
on public.cari_hareketleri
for select
to authenticated
using (true);

create policy if not exists tahakkuklar_select_authenticated
on public.tahakkuklar
for select
to authenticated
using (true);

create policy if not exists tahsilatlar_select_authenticated
on public.tahsilatlar
for select
to authenticated
using (true);

create policy if not exists finans_hesaplari_select_authenticated
on public.finans_hesaplari
for select
to authenticated
using (true);

create policy if not exists finans_hareketleri_select_authenticated
on public.finans_hareketleri
for select
to authenticated
using (true);

create policy if not exists banka_import_raw_select_authenticated
on public.banka_import_raw
for select
to authenticated
using (true);

create policy if not exists banka_onay_bekleyen_select_authenticated
on public.banka_onay_bekleyen
for select
to authenticated
using (true);

create policy if not exists banka_islenen_select_authenticated
on public.banka_islenen
for select
to authenticated
using (true);

create policy if not exists banka_reddedilen_select_authenticated
on public.banka_reddedilen
for select
to authenticated
using (true);

create policy if not exists modul_surumleri_select_authenticated
on public.modul_surumleri
for select
to authenticated
using (true);

create policy if not exists gunluk_kontrol_select_authenticated
on public.gunluk_kontrol_ozetleri
for select
to authenticated
using (true);

-- Yazma: admin/operator
create policy if not exists cariler_write_admin_operator
on public.cariler
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists cari_hareketleri_write_admin_operator
on public.cari_hareketleri
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists tahakkuklar_write_admin_operator
on public.tahakkuklar
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists tahsilatlar_write_admin_operator
on public.tahsilatlar
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists finans_hesaplari_write_admin_operator
on public.finans_hesaplari
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists finans_hareketleri_write_admin_operator
on public.finans_hareketleri
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists banka_import_raw_write_admin_operator
on public.banka_import_raw
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists banka_onay_bekleyen_write_admin_operator
on public.banka_onay_bekleyen
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists banka_islenen_write_admin_operator
on public.banka_islenen
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists banka_reddedilen_write_admin_operator
on public.banka_reddedilen
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

-- Sistem yedek/log: admin ve auditor okuyabilir; admin/operator yazabilir
create policy if not exists sistem_yedekleri_select_admin_auditor
on public.sistem_yedekleri
for select
to authenticated
using (public.is_admin() or public.can_audit());

create policy if not exists sistem_yedekleri_write_admin_operator
on public.sistem_yedekleri
for insert
to authenticated
with check (public.can_write_finance());

create policy if not exists sistem_loglari_select_admin_auditor
on public.sistem_loglari
for select
to authenticated
using (public.is_admin() or public.can_audit());

create policy if not exists sistem_loglari_write_admin_operator
on public.sistem_loglari
for insert
to authenticated
with check (public.can_write_finance());

-- Modül ve günlük kontrol yazımı admin/operator
create policy if not exists modul_surumleri_write_admin_operator
on public.modul_surumleri
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

create policy if not exists gunluk_kontrol_write_admin_operator
on public.gunluk_kontrol_ozetleri
for all
to authenticated
using (public.can_write_finance())
with check (public.can_write_finance());

-- Not: İlk admin kullanıcı manuel eklenmelidir:
-- insert into public.user_profiles (id, display_name, role) values ('AUTH_USER_UUID', 'Admin', 'admin');
