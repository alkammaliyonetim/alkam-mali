// ALKAM MALİ İstasyON - Supabase read-only config template
// Bu dosya ŞABLONDUR. Gerçek secret/service-role key içermez.
// Kullanım: Bu dosyayı supabase-config.js olarak kopyala, sadece public URL ve anon/publishable key gir.

window.ALKAM_SUPABASE_CONFIG = {
  enabled: true,
  mode: 'read_only_test',
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  publishableKey: 'YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY',
  rules: {
    secretKeyInFrontend: false,
    serviceRoleInFrontend: false,
    writeRequiresRls: true,
    writeRequiresUserApproval: true,
    localStorageIsPrimaryUntilApproved: true,
    firstWriteTable: 'gunluk_kontrol_ozetleri',
    cariHareketleriWriteLocked: true
  },
  tables: {
    cariler: 'cariler',
    cariHareketleri: 'cari_hareketleri',
    tahakkuklar: 'tahakkuklar',
    tahsilatlar: 'tahsilatlar',
    finansHesaplari: 'finans_hesaplari',
    finansHareketleri: 'finans_hareketleri',
    bankaRaw: 'banka_import_raw',
    bankaOnay: 'banka_onay_bekleyen',
    bankaIslenen: 'banka_islenen',
    bankaReddedilen: 'banka_reddedilen',
    sistemYedekleri: 'sistem_yedekleri',
    sistemLoglari: 'sistem_loglari',
    gunlukKontrol: 'gunluk_kontrol_ozetleri',
    modulSurumleri: 'modul_surumleri'
  }
};

console.info('ALKAM Supabase read-only template loaded. enabled=true, write=false');
