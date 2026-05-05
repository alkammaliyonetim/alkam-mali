-- ALKAM Mali Merkezi Veri Şeması v1
-- Supabase SQL Editor'da çalıştırılacak güvenli temel şema.
-- Not: RLS başlangıçta kapalıdır; gerçek çok kullanıcılı auth aşamasında politikalar ayrıca açılmalıdır.

create table if not exists public.alkam_cariler (
  id text primary key,
  unvan text not null,
  tur text default 'Cari Ekstre',
  aktif_ucret numeric default 0,
  vergi_no text,
  telefon text,
  email text,
  durum text default 'aktif',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.alkam_cari_hareketleri (
  id text primary key,
  cari_id text,
  cari_unvan text,
  tarih date not null,
  islem_turu text not null,
  aciklama text,
  borc numeric default 0,
  alacak numeric default 0,
  tutar numeric default 0,
  kaynak text,
  source_id text unique,
  posting_key text unique,
  created_at timestamptz default now()
);

create table if not exists public.alkam_finans_hesaplari (
  id text primary key,
  ad text not null,
  tip text,
  bakiye numeric default 0,
  ozel boolean default false,
  gider_degildir boolean default false,
  created_at timestamptz default now()
);

insert into public.alkam_finans_hesaplari (id, ad, tip, bakiye, ozel, gider_degildir)
values
  ('banka','Banka','Banka',0,false,false),
  ('kasa','Kasa','Kasa',0,false,false),
  ('moka','Moka United','Ara Hesap',0,true,true),
  ('kredi_karti','Kredi Kartı','Kredi Kartı Borç Hesabı',0,true,true),
  ('kmh_ek_hesap','KMH / Ek Hesap','Kredili Mevduat / Ek Hesap',0,true,true),
  ('cek','Çek','Çek',0,false,false),
  ('senet','Senet','Senet',0,false,false)
on conflict (id) do nothing;

create table if not exists public.alkam_finans_hareketleri (
  id text primary key,
  hesap text not null,
  tip text not null,
  tutar numeric not null,
  tarih date not null,
  aciklama text,
  kaynak text,
  cari_id text,
  gider_degildir boolean default false,
  cari_tahsilati_sayma boolean default false,
  source_id text unique,
  posting_key text unique,
  created_at timestamptz default now()
);

create table if not exists public.alkam_tahakkuklar (
  id text primary key,
  cari_id text,
  cari_unvan text,
  tarih date not null,
  donem text,
  aciklama text,
  tutar numeric not null,
  source_id text unique,
  posting_key text unique,
  created_at timestamptz default now()
);

create table if not exists public.alkam_tahsilatlar (
  id text primary key,
  cari_id text,
  cari_unvan text,
  tarih date not null,
  hesap text default 'banka',
  aciklama text,
  tutar numeric not null,
  source_id text unique,
  posting_key text unique,
  created_at timestamptz default now()
);

create table if not exists public.alkam_giderler (
  id text primary key,
  tarih date not null,
  gider_turu text,
  aciklama text,
  hesap text default 'banka',
  tutar numeric not null,
  kaynak text,
  source_id text unique,
  posting_key text unique,
  created_at timestamptz default now()
);

create table if not exists public.alkam_onay_kuyrugu (
  id text primary key,
  kaynak text,
  hareket_tipi text,
  tarih date,
  aciklama text,
  tutar numeric,
  onerilen_cari_id text,
  onerilen_cari_unvan text,
  onerilen_tip text,
  onerilen_kategori text,
  guven numeric default 0,
  durum text default 'Onay Bekliyor',
  eslesme_sebebi text,
  source_id text unique,
  raw jsonb,
  created_at timestamptz default now(),
  processed_at timestamptz
);

create table if not exists public.alkam_gecis_ham_hareketler (
  id text primary key,
  kaynak text,
  sayfa text,
  satir_no integer,
  tarih date,
  aciklama text,
  tutar numeric,
  bakiye numeric,
  source_id text unique,
  fp text,
  durum text,
  onerilen_tip text,
  onerilen_kategori text,
  guven numeric,
  eslesme_sebebi text,
  raw jsonb,
  created_at timestamptz default now()
);

create table if not exists public.alkam_ogrenme_kurallari (
  id bigserial primary key,
  anahtar text not null,
  hedef_tip text,
  hedef_kategori text,
  hedef_cari_id text,
  hedef_cari_unvan text,
  cevap text,
  sayac integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_alkam_cari_hareketleri_cari_tarih on public.alkam_cari_hareketleri(cari_id, tarih);
create index if not exists idx_alkam_finans_tarih_hesap on public.alkam_finans_hareketleri(tarih, hesap);
create index if not exists idx_alkam_onay_durum on public.alkam_onay_kuyrugu(durum);
create index if not exists idx_alkam_gecis_durum on public.alkam_gecis_ham_hareketler(durum);
