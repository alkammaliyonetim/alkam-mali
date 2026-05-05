# ALKAM Mali - v12 Canlı Test Hızlı Kopya

Bu dosya canlı sitede hızlıca kopyala-yapıştır yapılması için hazırlanmıştır.

## Site

```text
https://alkam-mali.pages.dev
```

## Console'a Yapıştırılacak Komut

```js
(() => {
  const safe = (name, fn) => {
    try {
      return { name, ok: true, result: fn() };
    } catch (error) {
      return { name, ok: false, error: error.message };
    }
  };

  const results = [
    safe('Cache / Deploy', () => ALKAM_CACHE_DEPLOY_KONTROL_V11.test()),
    safe('Dashboard', () => ALKAM_DASHBOARD_KURUMSAL_V11.test()),
    safe('Preflight', () => ALKAM_V12_PREFLIGHT_V1.test()),
    safe('Sonuç Export Test', () => ALKAM_V12_PREFLIGHT_EXPORT_V1.test()),
    safe('Supabase Write Gate', () => ALKAM_SUPABASE_WRITE_GATE_V10.test()),
    safe('Canlı Test Paketi', () => ALKAM_CANLI_TEST_PAKETI_V11.test())
  ];

  const exportData = safe('Sonuç Export Collect', () => ALKAM_V12_PREFLIGHT_EXPORT_V1.collect());

  const summary = {
    status: 'ALKAM v12 Final Canlı Test',
    expectedBuild: 'v11.32 - 05.05.2026',
    cacheOk: !!(results[0].result && results[0].result.missing === 0),
    preflightReady: !!(results[2].result && results[2].result.ready === true),
    writeOpen: !!(results[2].result && results[2].result.writeOpen === true),
    exportBad: !!(results[2].result && results[2].result.exportBad === true),
    writeAllowed: !!(results[4].result && results[4].result.writeAllowed === true),
    liveFailed: results[5].result && results[5].result.failed,
    liveRisky: results[5].result && results[5].result.risky,
    decision: (results[2].result && results[2].result.ready === true)
      ? 'v12 stabilizasyonuna geçilebilir'
      : 'Önce eksikler düzeltilecek',
    security: 'AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.',
    time: new Date().toISOString(),
    results,
    exportData
  };

  console.log('ALKAM FINAL TEST SUMMARY:', summary);
  return summary;
})();
```

## Temiz Sonuçta Görmemiz Gerekenler

```text
cacheOk: true
preflightReady: true
writeOpen: false
exportBad: false
writeAllowed: false
liveFailed: 0
liveRisky: 0
decision: "v12 stabilizasyonuna geçilebilir"
```

## Sonraki Adım

Temizse:

```text
v12: stabilize dashboard and module loading
```

Temiz değilse:

```text
fix: resolve v11 live test gaps before v12
```
