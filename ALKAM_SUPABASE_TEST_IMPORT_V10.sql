-- ALKAM MALİ İstasyON - Supabase Test Import Kontrol Scripti v10
-- Bu dosya canlı veri yazmaz. Test ortamında şema ve sayım kontrolleri için hazırlanmıştır.
-- Amaç: Supabase'e geçmeden önce tablolar, viewlar ve başlangıç hesapları doğru mu kontrol etmek.

-- 1) Tablo varlık kontrolü
select
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'cariler',
    'cari_hareketleri',
    'tahakkuklar',
    'tahsilatlar',
    'finans_hesaplari',
    'finans_hareketleri',
    'banka_import_raw',
    'banka_onay_bekleyen',
    'banka_islenen',
    'banka_reddedilen',
    'sistem_yedekleri',
    'sistem_loglari',
    'modul_surumleri',
    'gunluk_kontrol_ozetleri',
    'user_profiles'
  )
order by table_name;

-- 2) Finans hesapları başlangıç kontrolü
select kod, ad, tip, aktif
from public.finans_hesaplari
order by kod;

-- Beklenen kodlar:
-- banka
-- kasa
-- moka
-- cek
-- senet

-- 3) View kontrolü: cari bakiye
select *
from public.v_cari_bakiye
limit 20;

-- 4) View kontrolü: banka onay özeti
select *
from public.v_banka_onay_ozet;

-- 5) Boş sistem sayım raporu
select 'cariler' as tablo, count(*) as kayit from public.cariler
union all select 'cari_hareketleri', count(*) from public.cari_hareketleri
union all select 'tahakkuklar', count(*) from public.tahakkuklar
union all select 'tahsilatlar', count(*) from public.tahsilatlar
union all select 'finans_hesaplari', count(*) from public.finans_hesaplari
union all select 'finans_hareketleri', count(*) from public.finans_hareketleri
union all select 'banka_import_raw', count(*) from public.banka_import_raw
union all select 'banka_onay_bekleyen', count(*) from public.banka_onay_bekleyen
union all select 'banka_islenen', count(*) from public.banka_islenen
union all select 'banka_reddedilen', count(*) from public.banka_reddedilen
union all select 'sistem_yedekleri', count(*) from public.sistem_yedekleri
union all select 'sistem_loglari', count(*) from public.sistem_loglari
union all select 'modul_surumleri', count(*) from public.modul_surumleri
union all select 'gunluk_kontrol_ozetleri', count(*) from public.gunluk_kontrol_ozetleri;

-- 6) RLS açık mı kontrolü
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'cariler',
    'cari_hareketleri',
    'tahakkuklar',
    'tahsilatlar',
    'finans_hesaplari',
    'finans_hareketleri',
    'banka_import_raw',
    'banka_onay_bekleyen',
    'banka_islenen',
    'banka_reddedilen',
    'sistem_yedekleri',
    'sistem_loglari',
    'modul_surumleri',
    'gunluk_kontrol_ozetleri',
    'user_profiles'
  )
order by tablename;

-- 7) Policy kontrolü
select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 8) Test veri ekleme örneği
-- Canlıda doğrudan çalıştırılmayacak. Sadece test ortamı içindir.
-- Önce cariler içine bir test cari eklenir, sonra cari hareketi eklenir.

/*
insert into public.cariler (cari_kod, unvan, kaynak)
values ('TEST-001', 'TEST CARİ', 'Test Import')
on conflict (cari_kod) do update set unvan = excluded.unvan
returning id;

insert into public.cari_hareketleri (cari_id, tarih, donem, islem_turu, aciklama, borc, alacak, kaynak, kaynak_ref)
select id, current_date, to_char(current_date, 'YYYY-MM'), 'Tahakkuk', 'Test tahakkuk', 1000, 0, 'Test Import', 'TEST-TAH-001'
from public.cariler
where cari_kod = 'TEST-001';

select * from public.v_cari_bakiye where unvan = 'TEST CARİ';
*/

-- 9) Temizleme örneği
-- Sadece test ortamında kullanılacak.

/*
delete from public.cari_hareketleri where kaynak = 'Test Import';
delete from public.cariler where cari_kod = 'TEST-001';
*/
