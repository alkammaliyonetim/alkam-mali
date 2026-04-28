-- ALKAM Supabase cari reset notlari
-- Bu dosyayi tablo adlarini kontrol etmeden calistirma.
-- Amac: Eski cari verilerini once yedeklemek, sonra yeni extreler icin temiz baslangic yapmak.

-- 1) Once tablolar var mi kontrol et:
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

-- 2) Tipik ALKAM tablolarinda sayim al:
-- Tablo adi yoksa ilgili satir hata verir; olmayanlari sil.
select 'cariler' as table_name, count(*) as row_count from public.cariler
union all
select 'account_ops', count(*) from public.account_ops
union all
select 'documents', count(*) from public.documents
union all
select 'pending_approvals', count(*) from public.pending_approvals;

-- 3) Yedek tablolarini olustur.
-- Tarih ismi elle degistirilebilir.
create table if not exists public.backup_cariler_20260428 as select * from public.cariler;
create table if not exists public.backup_account_ops_20260428 as select * from public.account_ops;
create table if not exists public.backup_documents_20260428 as select * from public.documents;
create table if not exists public.backup_pending_approvals_20260428 as select * from public.pending_approvals;

-- 4) Yedek sayimlarini kontrol et:
select 'backup_cariler_20260428' as table_name, count(*) as row_count from public.backup_cariler_20260428
union all
select 'backup_account_ops_20260428', count(*) from public.backup_account_ops_20260428
union all
select 'backup_documents_20260428', count(*) from public.backup_documents_20260428
union all
select 'backup_pending_approvals_20260428', count(*) from public.backup_pending_approvals_20260428;

-- 5) Her sey dogruysa, temizleme islemini transaction icinde yap.
-- Dikkat: Hesap/kasa/banka tablolarini temizlemez.
begin;
delete from public.pending_approvals;
delete from public.documents;
delete from public.account_ops;
delete from public.cariler;
commit;

-- 6) Son kontrol:
select 'cariler' as table_name, count(*) as row_count from public.cariler
union all
select 'account_ops', count(*) from public.account_ops
union all
select 'documents', count(*) from public.documents
union all
select 'pending_approvals', count(*) from public.pending_approvals;
