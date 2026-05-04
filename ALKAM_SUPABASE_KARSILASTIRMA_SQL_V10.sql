-- ALKAM MALİ İstasyON - Supabase Karşılaştırma SQL v10
-- Amaç: Supabase test import sonrası tablo sayıları, toplamlar ve kritik fark kontrolleri için özet üretmek.
-- Bu dosya veri değiştirmez. Sadece SELECT sorguları içerir.

-- 1) Genel tablo kayıt sayıları
select 'cariler' as alan, count(*)::numeric as kayit, null::numeric as toplam_borc, null::numeric as toplam_alacak, null::numeric as net
from public.cariler
union all
select 'cari_hareketleri', count(*)::numeric, coalesce(sum(borc),0), coalesce(sum(alacak),0), coalesce(sum(borc),0)-coalesce(sum(alacak),0)
from public.cari_hareketleri
where coalesce(iptal,false)=false
union all
select 'tahakkuklar', count(*)::numeric, coalesce(sum(tutar),0), null::numeric, coalesce(sum(tutar),0)
from public.tahakkuklar
union all
select 'tahsilatlar', count(*)::numeric, null::numeric, coalesce(sum(tutar),0), coalesce(sum(tutar),0)
from public.tahsilatlar
union all
select 'finans_hareketleri', count(*)::numeric, null::numeric, null::numeric, coalesce(sum(case when hareket_tipi ilike '%çık%' or hareket_tipi ilike '%cik%' then -tutar else tutar end),0)
from public.finans_hareketleri
union all
select 'banka_import_raw', count(*)::numeric, null::numeric, null::numeric, coalesce(sum(tutar),0)
from public.banka_import_raw
union all
select 'banka_onay_bekleyen', count(*)::numeric, null::numeric, null::numeric, null::numeric
from public.banka_onay_bekleyen
union all
select 'banka_islenen', count(*)::numeric, null::numeric, null::numeric, null::numeric
from public.banka_islenen
union all
select 'banka_reddedilen', count(*)::numeric, null::numeric, null::numeric, null::numeric
from public.banka_reddedilen
union all
select 'gunluk_kontrol_ozetleri', count(*)::numeric, null::numeric, null::numeric, coalesce(avg(skor),0)
from public.gunluk_kontrol_ozetleri;

-- 2) Cari bazlı bakiye kontrolü
select
  cari_id,
  unvan,
  toplam_borc,
  toplam_alacak,
  bakiye,
  bakiye_tipi
from public.v_cari_bakiye
order by abs(bakiye) desc, unvan;

-- 3) Kaynak boş cari hareketleri kritik kontrol
select
  count(*) as kaynak_bos_kayit
from public.cari_hareketleri
where coalesce(trim(kaynak),'') = ''
  and coalesce(iptal,false)=false;

-- 4) Açıklama boş cari hareketleri uyarı kontrolü
select
  count(*) as aciklama_bos_kayit
from public.cari_hareketleri
where coalesce(trim(aciklama),'') = ''
  and coalesce(iptal,false)=false;

-- 5) Mükerrer cari hareket adayları
select
  cari_id,
  tarih,
  islem_turu,
  coalesce(aciklama,'') as aciklama,
  borc,
  alacak,
  kaynak,
  count(*) as adet
from public.cari_hareketleri
where coalesce(iptal,false)=false
group by cari_id, tarih, islem_turu, coalesce(aciklama,''), borc, alacak, kaynak
having count(*) > 1
order by adet desc, tarih desc;

-- 6) Tahakkuk dönem/cari mükerrer kontrolü
select
  cari_id,
  donem,
  kaynak,
  count(*) as adet,
  sum(tutar) as toplam
from public.tahakkuklar
group by cari_id, donem, kaynak
having count(*) > 1
order by donem desc, adet desc;

-- 7) Finans hesap bazlı hareket özeti
select
  h.kod,
  h.ad,
  h.tip,
  count(f.id) as hareket_adedi,
  coalesce(sum(case when f.hareket_tipi ilike '%çık%' or f.hareket_tipi ilike '%cik%' then 0 else f.tutar end),0) as toplam_giris,
  coalesce(sum(case when f.hareket_tipi ilike '%çık%' or f.hareket_tipi ilike '%cik%' then f.tutar else 0 end),0) as toplam_cikis,
  h.acilis_bakiyesi + coalesce(sum(case when f.hareket_tipi ilike '%çık%' or f.hareket_tipi ilike '%cik%' then -f.tutar else f.tutar end),0) as bakiye
from public.finans_hesaplari h
left join public.finans_hareketleri f on f.hesap_id = h.id
group by h.id, h.kod, h.ad, h.tip, h.acilis_bakiyesi
order by h.kod;

-- 8) Moka özel kontrol: Moka banka aktarımı cari tahsilatı sayılmış mı?
select
  count(*) as moka_cari_tahsilati_supheli
from public.cari_hareketleri
where (lower(coalesce(aciklama,'')) like '%moka%' or lower(coalesce(kaynak,'')) like '%moka%')
  and lower(coalesce(islem_turu,'')) like '%tahsil%'
  and coalesce(iptal,false)=false;

-- 9) Banka import fingerprint mükerrer kontrolü
select
  fingerprint,
  count(*) as adet
from public.banka_import_raw
where coalesce(fingerprint,'') <> ''
group by fingerprint
having count(*) > 1
order by adet desc;

-- 10) Banka onay bekleyen kalite kontrolü
select
  count(*) filter (where guven_puani is null) as guven_bos,
  count(*) filter (where coalesce(trim(eslesme_sebebi),'') = '') as eslesme_sebebi_bos,
  count(*) filter (where onerilen_tip is null or trim(onerilen_tip) = '') as tip_bos,
  count(*) as toplam_onay_bekleyen
from public.banka_onay_bekleyen
where durum = 'onay_bekliyor';

-- 11) Onaysız işlenmiş banka satırı var mı? raw_id olmadan işlenen kayıt şüphelidir.
select
  count(*) as raw_baglantisi_olmayan_islenen
from public.banka_islenen
where raw_id is null;

-- 12) Günlük kontrol durum özeti
select
  durum,
  count(*) as gun_sayisi,
  min(skor) as min_skor,
  max(skor) as max_skor,
  avg(skor) as ortalama_skor
from public.gunluk_kontrol_ozetleri
group by durum
order by min_skor;

-- 13) Kritik kabul kriterleri tek satır özet
select
  (select count(*) from public.cari_hareketleri where coalesce(trim(kaynak),'') = '' and coalesce(iptal,false)=false) as kaynak_bos,
  (select count(*) from (
    select cari_id, tarih, islem_turu, coalesce(aciklama,'') aciklama, borc, alacak, kaynak, count(*)
    from public.cari_hareketleri
    where coalesce(iptal,false)=false
    group by cari_id, tarih, islem_turu, coalesce(aciklama,''), borc, alacak, kaynak
    having count(*) > 1
  ) x) as mukerrer_cari_hareket,
  (select count(*) from public.cari_hareketleri where (lower(coalesce(aciklama,'')) like '%moka%' or lower(coalesce(kaynak,'')) like '%moka%') and lower(coalesce(islem_turu,'')) like '%tahsil%' and coalesce(iptal,false)=false) as moka_tahsilat_supheli,
  (select count(*) from public.banka_islenen where raw_id is null) as onaysiz_islenen_supheli,
  (select count(*) from public.banka_onay_bekleyen where durum='onay_bekliyor') as banka_onay_bekleyen;
