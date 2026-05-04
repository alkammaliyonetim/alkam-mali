// ALKAM MALİ İstasyON - Supabase public config example
// Bu dosya örnektir. Gerçek secret/service-role key içermez.
// Frontend tarafında sadece Supabase URL ve anon/publishable key kullanılabilir.

window.ALKAM_SUPABASE_CONFIG = {
  enabled: false,
  mode: 'read_only_test',
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  publishableKey: 'YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY',
  rules: {
    secretKeyInFrontend: false,
    serviceRoleInFrontend: false,
    writeRequiresRls: true,
    writeRequiresUserApproval: true,
    localStorageIsPrimaryUntilApproved: true
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

console.info('ALKAM Supabase config example loaded. enabled=false');
