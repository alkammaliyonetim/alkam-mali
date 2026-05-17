/*
ALKAM Mali - Cari Veri Yükleyici
Bu dosya index.html değildir.
Bu dosyayı GitHub'da alkam-cariler-data.js içine kopyala.
Aynı klasörde alkam-cariler-77-28-04-2026.json dosyası da olmalı.
*/

(function () {
  "use strict";

  const JSON_FILE = "alkam-cariler-77-28-04-2026.json";
  const LS_CARILER = "ALKAM_FINAL_CARILER_V1";

  function readLocalCariler() {
    try {
      const data = JSON.parse(localStorage.getItem(LS_CARILER) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  function publish(data, meta) {
    const hareketSayisi = data.reduce(function (toplam, cari) {
      return toplam + ((cari && Array.isArray(cari.transactions)) ? cari.transactions.length : 0);
    }, 0);

    window.ALKAM_CARILER_DATA = data;
    window.ALKAM_CARILER_77_DATA = data;
    window.ALKAM_CARILER_META = Object.assign({
      firma: "ALKAM Mali Müşavirlik",
      cariSayisi: data.length,
      hareketSayisi: hareketSayisi,
      durum: "Yüklendi"
    }, meta || {});

    window.dispatchEvent(new CustomEvent("alkam:cariler-loaded", {
      detail: window.ALKAM_CARILER_META
    }));

    console.info("[ALKAM] Cari veri katmanı yüklendi:", window.ALKAM_CARILER_META);
  }

  function setEmpty(reason) {
    window.ALKAM_CARILER_DATA = [];
    window.ALKAM_CARILER_77_DATA = [];
    window.ALKAM_CARILER_META = {
      firma: "ALKAM Mali Müşavirlik",
      kaynak: JSON_FILE,
      cariSayisi: 0,
      hareketSayisi: 0,
      durum: "Yüklenemedi",
      hata: reason || "Bilinmeyen hata"
    };
    console.error("[ALKAM] Cari veri yüklenemedi:", reason);
  }

  const localCariler = readLocalCariler();
  if (localCariler.length > 77) {
    publish(localCariler, {
      kaynak: "localStorage güncel cari listesi",
      dosya: "ALKAM_FINAL_CARILER_V1",
      surum: "luca-guncel-cari-katmani",
      durum: "Luca sonrası güncel liste korundu"
    });
    return;
  }

  fetch(JSON_FILE, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(JSON_FILE + " bulunamadı veya okunamadı. HTTP " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) {
        throw new Error("Cari veri dosyası liste formatında değil.");
      }

      const latestLocal = readLocalCariler();
      if (latestLocal.length > data.length) {
        publish(latestLocal, {
          kaynak: "localStorage güncel cari listesi",
          dosya: "ALKAM_FINAL_CARILER_V1",
          surum: "luca-guncel-cari-katmani",
          durum: "JSON yerine güncel local cari listesi kullanıldı"
        });
        return;
      }

      publish(data, {
        kaynak: "28.04.2026 tarihli cari ekstre PDF dosyaları",
        dosya: JSON_FILE,
        surum: "77-cari-veri-katmani-290426",
        durum: "77 cari başlangıç verisi yüklendi"
      });
    })
    .catch(function (err) {
      const fallbackLocal = readLocalCariler();
      if (fallbackLocal.length) {
        publish(fallbackLocal, {
          kaynak: "localStorage yedek cari listesi",
          dosya: "ALKAM_FINAL_CARILER_V1",
          surum: "local-yedek",
          durum: "JSON okunamadı, local cari listesi kullanıldı"
        });
        return;
      }
      setEmpty(err && err.message ? err.message : String(err));
    });
})();