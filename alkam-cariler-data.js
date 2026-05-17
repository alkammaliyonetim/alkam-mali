/*
ALKAM Mali - Cari Veri Yükleyici
Bu dosya index.html değildir.
Bu dosyayı GitHub'da alkam-cariler-data.js içine kopyala.
Aynı klasörde alkam-cariler-77-28-04-2026.json dosyası da olmalı.
*/

(function () {
  "use strict";

  const JSON_FILE = "alkam-cariler-77-28-04-2026.json";

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

      const hareketSayisi = data.reduce(function (toplam, cari) {
        return toplam + ((cari && Array.isArray(cari.transactions)) ? cari.transactions.length : 0);
      }, 0);

      window.ALKAM_CARILER_DATA = data;
      window.ALKAM_CARILER_77_DATA = data;
      window.ALKAM_CARILER_META = {
        firma: "ALKAM Mali Müşavirlik",
        kaynak: "28.04.2026 tarihli cari ekstre PDF dosyaları",
        dosya: JSON_FILE,
        cariSayisi: data.length,
        hareketSayisi: hareketSayisi,
        surum: "77-cari-veri-katmani-290426",
        durum: "Yüklendi"
      };

      window.dispatchEvent(new CustomEvent("alkam:cariler-loaded", {
        detail: window.ALKAM_CARILER_META
      }));

      console.info("[ALKAM] Cari veri katmanı yüklendi:", window.ALKAM_CARILER_META);
    })
    .catch(function (err) {
      setEmpty(err && err.message ? err.message : String(err));
    });
})();

(function () {
  "use strict";

  if (window.ALKAM_SAFE_AUTOMATION_UI_LOADER_READY) return;
  window.ALKAM_SAFE_AUTOMATION_UI_LOADER_READY = true;

  function loadSafeAutomationUi() {
    if (window.ALKAM_AUTOMATION_SAFE_UI_READY || document.querySelector('script[data-alkam-safe-automation-ui="1"]')) {
      return;
    }

    var script = document.createElement("script");
    script.src = "automation-safe-ui.js?v=safe-v1";
    script.async = true;
    script.dataset.alkamSafeAutomationUi = "1";
    script.onload = function () {
      if (typeof window.renderSafeAutomationModules === "function") {
        window.renderSafeAutomationModules();
      }
      console.info("[ALKAM] Güvenli otomasyon UI yüklendi.");
    };
    script.onerror = function () {
      console.warn("[ALKAM] Güvenli otomasyon UI yüklenemedi.");
    };
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSafeAutomationUi);
  } else {
    loadSafeAutomationUi();
  }
})();
