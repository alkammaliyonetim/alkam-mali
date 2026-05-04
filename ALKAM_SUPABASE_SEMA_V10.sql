-- ALKAM MALİ İstasyON - Supabase Kalıcı Veri Şeması v10
-- Bu dosya taslak şemadır. Mevcut çalışan localStorage yapısı silinmeden önce test ortamında denenmelidir.
-- Ana kural: cari_hareketleri ana defterdir. banka_import/onay tabloları doğrulama katmanıdır.

create table if not exists public.cariler (
  id uuid primary key default gen_random_uuid(),
  cari_kod text unique,
  unvan text not null,
  vergi_no text,
  telefon text,
  email text,
  durum text default 'aktif',
  muhasebe_ucreti numeric(18,2) default 0,
  kaynak text default 'Manuel',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.cari_hareketleri (
  id uuid primary key default gen_random_uuid(),
  cari_id uuid references public.cariler(id),
  tarih date not null,
  donem text,
  islem_turu text not null,
  aciklama text,
  borc numeric(18,2) default 0,
  alacak numeric(18,2) default 0,
  tutar numeric(18,2) generated always as (coalesce(borc,0) - coalesce(alacak,0)) stored,
  kaynak text not null,
  kaynak_ref text,
  guven_puani numeric(5,2),
  iptal boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tahakkuklar (
  id uuid primary key default gen_random_uuid(),
  cari_id uuid references public.cariler(id),
  cari_hareket_id uuid references public.cari_hareketleri(id),
  donem text not null,
  tutar numeric(18,2) not null,
  aciklama text,
  kaynak text default 'Tahakkuk Modülü',
  created_at timestamptz default now(),
  unique(cari_id, donem, kaynak)
);

create table if not exists public.tahsilatlar (
  id uuid primary key default gen_random_uuid(),
  cari_id uuid references public.cariler(id),
  cari_hareket_id uuid references public.cari_hareketleri(id),
  finans_hesap_id uuid,
  tarih date not null,
  tutar numeric(18,2) not null,
  aciklama text,
  kaynak text default 'Tahsilat Modülü',
  created_at timestamptz default now()
);

create table if not exists public.finans_hesaplari (
  id uuid primary key default gen_random_uuid(),
  kod text unique not null,
  ad text not null,
  tip text not null,
  acilis_bakiyesi numeric(18,2) default 0,
  aktif boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.finans_hareketleri (
  id uuid primary key default gen_random_uuid(),
  hesap_id uuid references public.finans_hesaplari(id),
  tarih date not null,
  hareket_tipi text not null,
  tutar numeric(18,2) not null,
  aciklama text,
  kaynak text not null,
  kaynak_ref text,
  cari_tahsilati_sayma boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.banka_import_raw (
  id uuid primary key default gen_random_uuid(),
  kaynak text not null,
  tarih date,
  aciklama text,
  tutar numeric(18,2),
  fingerprint text unique,
  durum text default 'import_edildi',
  created_at timestamptz default now()
);

create table if not exists public.banka_onay_bekleyen (
  id uuid primary key default gen_random_uuid(),
  raw_id uuid references public.banka_import_raw(id),
  onerilen_tip text,
  onerilen_cari_id uuid references public.cariler(id),
  guven_puani numeric(5,2),
  eslesme_sebebi text,
  durum text default 'onay_bekliyor',
  created_at timestamptz default now()
);

create table if not exists public.banka_islenen (
  id uuid primary key default gen_random_uuid(),
  raw_id uuid references public.banka_import_raw(id),
  islem_turu text,
  cari_hareket_id uuid references public.cari_hareketleri(id),
  finans_hareket_id uuid references public.finans_hareketleri(id),
  processed_at timestamptz default now()
);

create table if not exists public.banka_reddedilen (
  id uuid primary key default gen_random_uuid(),
  raw_id uuid references public.banka_import_raw(id),
  red_sebebi text,
  rejected_at timestamptz default now()
);

create table if not exists public.sistem_yedekleri (
  id uuid primary key default gen_random_uuid(),
  yedek_tipi text not null,
  sebep text,
  payload jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.sistem_loglari (
  id uuid primary key default gen_random_uuid(),
  log_tipi text not null,
  mesaj text,
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists public.modul_surumleri (
  id uuid primary key default gen_random_uuid(),
  modul_key text not null,
  modul_ad text,
  version text,
  aktif boolean default true,
  checked_at timestamptz default now()
);

create table if not exists public.gunluk_kontrol_ozetleri (
  id uuid primary key default gen_random_uuid(),
  kontrol_tarihi date not null unique,
  skor numeric(5,2),
  durum text,
  banka_onay_bekleyen integer default 0,
  veri_hata integer default 0,
  veri_uyari integer default 0,
  saglik_ok integer default 0,
  saglik_total integer default 0,
  payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Başlangıç finans hesapları
insert into public.finans_hesaplari (kod, ad, tip)
values
  ('banka', 'Banka', 'Banka'),
  ('kasa', 'Kasa', 'Kasa'),
  ('moka', 'Moka United', 'Ara Hesap'),
  ('cek', 'Çek', 'Çek'),
  ('senet', 'Senet', 'Senet')
on conflict (kod) do nothing;

-- Faydalı view: cari bakiye
create or replace view public.v_cari_bakiye as
select
  c.id as cari_id,
  c.unvan,
  coalesce(sum(h.borc),0) as toplam_borc,
  coalesce(sum(h.alacak),0) as toplam_alacak,
  coalesce(sum(h.borc),0) - coalesce(sum(h.alacak),0) as bakiye,
  case
    when coalesce(sum(h.borc),0) - coalesce(sum(h.alacak),0) > 0 then 'BAKİYE B'
    when coalesce(sum(h.borc),0) - coalesce(sum(h.alacak),0) < 0 then 'BAKİYE A'
    else 'KAPALI'
  end as bakiye_tipi
from public.cariler c
left join public.cari_hareketleri h on h.cari_id = c.id and coalesce(h.iptal,false) = false
group by c.id, c.unvan;

-- Faydalı view: banka onay özeti
create or replace view public.v_banka_onay_ozet as
select
  (select count(*) from public.banka_onay_bekleyen where durum='onay_bekliyor') as onay_bekleyen,
  (select count(*) from public.banka_islenen) as islenen,
  (select count(*) from public.banka_reddedilen) as reddedilen;
