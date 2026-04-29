/*
ALKAM Mali - Otomasyon Kontrol Katmanı
KIRMIZI ÇİZGİ:
- Bu dosya ana program değildir.
- index.html yerine yüklenmeyecek.
- Mevcut menü, modül, login, onay merkezi, Moka United ve cari ekranını silmez.
- Otomatik tahakkuk / otomatik eşleşme / otomatik işleme gibi mutasyon yapan işleri varsayılan olarak kapalı başlatır.
- Kullanıcı panelden tek tıkla "Otomatik" / "Kapalı" durumuna çevirebilir.

Kurulum:
1) Bu dosyayı index.html ile aynı klasöre yükle.
2) index.html içinde <head> bölümünde CDN scriptlerinden sonra SADECE şu satırı ekle:
   <script src="alkam-otomasyon-kontrol.js"></script>
*/

(function () {
  "use strict";

  const STORAGE_KEY = "ALKAM_AUTOMATION_CONTROL_V1";
  const PENDING_KEY = "ALKAM_AUTOMATION_PENDING_V1";
  const LOG_KEY = "ALKAM_AUTOMATION_LOG_V1";

  const RULES = [
    {
      key: "monthlyAccrual",
      title: "Aylık Muhasebe Ücreti Tahakkuku",
      desc: "Her ay otomatik muhasebe ücreti tahakkuku oluşturma.",
      defaultEnabled: false,
      risk: "Yüksek",
      aliases: [
        "autoTahakkuk", "runAutoTahakkuk", "createMonthlyAccruals",
        "createMonthlyFees", "generateMonthlyFees", "aylikTahakkukOlustur",
        "otomatikTahakkukOlustur", "runMonthlyAccruals", "createAccountingFees",
        "createMonthlyAccountingFee", "topluTahakkukOlustur"
      ]
    },
    {
      key: "retroAccrual",
      title: "Geçmiş Ay Tahakkuk Tamamlama",
      desc: "Eksik geçmiş ayları otomatik hesaplayıp cari hareketlere yazma.",
      defaultEnabled: false,
      risk: "Yüksek",
      aliases: [
        "runRetroAccrual", "retroaktifTahakkukOlustur", "completeMissingAccruals",
        "gecmisAyTahakkukTamamla", "backfillMonthlyFees", "backfillAccruals"
      ]
    },
    {
      key: "bankAutoMatch",
      title: "Banka Hareketi Otomatik Eşleştirme",
      desc: "Banka hareketlerini otomatik cariyle eşleştirme.",
      defaultEnabled: false,
      risk: "Orta",
      aliases: [
        "autoMatchBankTransactions", "otomatikBankaEslestir",
        "bankaHareketleriniOtomatikEslestir", "matchBankTransactions",
        "runBankMatching", "autoCariMatch"
      ]
    },
    {
      key: "bankAutoPost",
      title: "Banka Hareketini Otomatik Cari İşleme",
      desc: "Eşleşen banka hareketini cariye otomatik işleme.",
      defaultEnabled: false,
      risk: "Kritik",
      aliases: [
        "autoPostBankTransactions", "postMatchedBankTransactions",
        "onayliEslestirmeleriIsle", "processMatchedTransactions",
        "bankaHareketleriniCariIsle", "applyBankMatches"
      ]
    },
    {
      key: "approvalAutoConfirm",
      title: "%100 Emin Eşleşmeyi Otomatik Onaylama",
      desc: "Güven puanı yüksek kayıtları kullanıcı onayı olmadan işleme.",
      defaultEnabled: false,
      risk: "Kritik",
      aliases: [
        "autoApproveMatches", "autoConfirmMatches", "approveHighConfidenceMatches",
        "yuzdeYuzEminOtomatikOnayla", "processCertainMatches"
      ]
    },
    {
      key: "mokaAutoCollection",
      title: "Moka United Tahsilatını Otomatik Cari İşleme",
      desc: "Moka tahsilatını manuel onay olmadan cari hesabına yazma.",
      defaultEnabled: false,
      risk: "Kritik",
      aliases: [
        "autoPostMokaCollection", "mokaTahsilatiniOtomatikIsle",
        "processMokaCollections", "applyMokaCollection"
      ]
    },
    {
      key: "mokaAutoSettlement",
      title: "Moka United Banka Aktarımını Otomatik İşleme",
      desc: "Moka’dan bankaya gelen transferleri otomatik kapatma/aktarma.",
      defaultEnabled: false,
      risk: "Kritik",
      aliases: [
        "autoProcessMokaSettlement", "mokaBankaAktariminiOtomatikIsle",
        "processMokaSettlement", "applyMokaSettlement", "matchMokaBankTransfer"
      ]
    },
    {
      key: "invoiceAutoCreate",
      title: "Fatura / Defter / Dijital Defter Otomatik Tahakkuk",
      desc: "Defter, dijital defter, fatura vb. özel tahakkukları otomatik oluşturma.",
      defaultEnabled: false,
      risk: "Yüksek",
      aliases: [
        "autoCreateInvoiceAccrual", "createBookFeeAccrual", "createDigitalLedgerFee",
        "defterTahakkukuOlustur", "dijitalDefterTahakkukuOlustur"
      ]
    },
    {
      key: "importAutoProcess",
      title: "İçe Aktarılan Dosyayı Otomatik İşleme",
      desc: "Excel/PDF/banka ekstresi yüklenince kayıtları otomatik sisteme yazma.",
      defaultEnabled: false,
      risk: "Yüksek",
      aliases: [
        "autoProcessImport", "processImportAutomatically", "excelOtomatikIsle",
        "pdfOtomatikIsle", "parseAndPostImport", "autoImportCari"
      ]
    },
    {
      key: "bulkAutoUpdate",
      title: "Toplu Otomatik Güncelleme",
      desc: "Birden fazla cariyi/hareketi tek seferde otomatik değiştirme.",
      defaultEnabled: false,
      risk: "Kritik",
      aliases: [
        "bulkAutoUpdate", "topluOtomatikGuncelle", "bulkPost", "bulkApply",
        "massUpdateCariler", "runBulkAutomation"
      ]
    }
  ];

  function cloneDefaultState() {
    const state = {};
    RULES.forEach(rule => {
      state[rule.key] = {
        enabled: !!rule.defaultEnabled,
        title: rule.title,
        desc: rule.desc,
        risk: rule.risk,
        updatedAt: new Date().toISOString()
      };
    });
    return state;
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn("[ALKAM] localStorage yazılamadı:", key, err);
    }
  }

  function getState() {
    const current = readJson(STORAGE_KEY, null);
    const defaults = cloneDefaultState();
    const merged = defaults;
    if (current && typeof current === "object") {
      Object.keys(defaults).forEach(key => {
        if (current[key]) {
          merged[key] = Object.assign({}, defaults[key], current[key]);
          merged[key].enabled = !!current[key].enabled;
        }
      });
    }
    return merged;
  }

  function saveState(state) {
    writeJson(STORAGE_KEY, state);
    publishFlags();
    renderPanel();
  }

  function isEnabled(key) {
    const state = getState();
    return !!(state[key] && state[key].enabled);
  }

  function setEnabled(key, enabled) {
    const state = getState();
    if (!state[key]) return false;
    state[key].enabled = !!enabled;
    state[key].updatedAt = new Date().toISOString();
    saveState(state);
    addLog(enabled ? "AÇILDI" : "KAPANDI", key, state[key].title);
    toast(`${state[key].title}: ${enabled ? "OTOMATİK" : "KAPALI"}`);
    return true;
  }

  function disableAll() {
    const state = getState();
    Object.keys(state).forEach(key => {
      state[key].enabled = false;
      state[key].updatedAt = new Date().toISOString();
    });
    saveState(state);
    addLog("TÜMÜ KAPANDI", "all", "Tüm otomatik işler kapatıldı");
    toast("Tüm otomatik işler kapatıldı");
  }

  function addPending(ruleKey, actionName, payload) {
    const queue = readJson(PENDING_KEY, []);
    queue.unshift({
      id: `ALKAM-PENDING-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ruleKey,
      actionName,
      payload: safePayload(payload),
      createdAt: new Date().toISOString(),
      status: "Onay Bekliyor"
    });
    writeJson(PENDING_KEY, queue.slice(0, 300));
    renderPanel();
  }

  function clearPending() {
    writeJson(PENDING_KEY, []);
    renderPanel();
    toast("Onay bekleyen otomasyon kayıtları temizlendi");
  }

  function addLog(type, key, message) {
    const log = readJson(LOG_KEY, []);
    log.unshift({ type, key, message, at: new Date().toISOString() });
    writeJson(LOG_KEY, log.slice(0, 300));
  }

  function safePayload(payload) {
    try {
      return JSON.parse(JSON.stringify(payload || {}));
    } catch (err) {
      return { note: "Payload serileştirilemedi", text: String(payload) };
    }
  }

  function guard(ruleKey, actionName, fn, thisArg, args) {
    if (isEnabled(ruleKey)) {
      addLog("ÇALIŞTI", ruleKey, actionName || ruleKey);
      return typeof fn === "function" ? fn.apply(thisArg || null, args || []) : true;
    }

    addPending(ruleKey, actionName || ruleKey, { args: Array.prototype.slice.call(args || []) });
    addLog("BLOKE EDİLDİ", ruleKey, actionName || ruleKey);
    toast(`Otomatik işlem durduruldu: ${findRule(ruleKey)?.title || ruleKey}`);

    return {
      blocked: true,
      reason: "ALKAM otomasyon kontrolü: Bu işlem kapalı ve onay bekleyenlere alındı.",
      ruleKey,
      actionName
    };
  }

  function findRule(key) {
    return RULES.find(r => r.key === key);
  }

  function publishFlags() {
    const state = getState();

    window.ALKAM_AUTOMATION_FLAGS = Object.fromEntries(
      Object.keys(state).map(key => [key, !!state[key].enabled])
    );

    // Ana program ileride bu bayrakları okuyabilir.
    window.ALKAM_DISABLE_AUTO_TAHAKKUK = !isEnabled("monthlyAccrual");
    window.ALKAM_DISABLE_AUTO_BANK_MATCH = !isEnabled("bankAutoMatch");
    window.ALKAM_DISABLE_AUTO_BANK_POST = !isEnabled("bankAutoPost");
    window.ALKAM_DISABLE_AUTO_MOKA = !isEnabled("mokaAutoCollection") || !isEnabled("mokaAutoSettlement");
    window.ALKAM_REQUIRE_APPROVAL_FOR_FINANCIAL_MUTATION = true;

    window.ALKAM_AUTO_TAHAKKUK_ENABLED = isEnabled("monthlyAccrual");
    window.ALKAM_AUTO_BANK_MATCH_ENABLED = isEnabled("bankAutoMatch");
    window.ALKAM_AUTO_BANK_POST_ENABLED = isEnabled("bankAutoPost");
    window.ALKAM_AUTO_MOKA_COLLECTION_ENABLED = isEnabled("mokaAutoCollection");
    window.ALKAM_AUTO_MOKA_SETTLEMENT_ENABLED = isEnabled("mokaAutoSettlement");
  }

  function patchKnownFunctions() {
    RULES.forEach(rule => {
      rule.aliases.forEach(name => {
        const original = window[name];
        if (typeof original !== "function") return;
        if (original.__alkamAutomationPatched) return;

        const wrapped = function () {
          return guard(rule.key, name, original, this, arguments);
        };
        wrapped.__alkamAutomationPatched = true;
        wrapped.__alkamOriginal = original;
        try {
          window[name] = wrapped;
          addLog("KORUMA", rule.key, `${name} fonksiyonu otomasyon kontrolüne bağlandı`);
        } catch (err) {
          console.warn("[ALKAM] Fonksiyon sarılamadı:", name, err);
        }
      });
    });
  }

  function installRepeatingPatch() {
    patchKnownFunctions();
    let count = 0;
    const timer = setInterval(() => {
      patchKnownFunctions();
      count += 1;
      if (count >= 10) clearInterval(timer);
    }, 1000);
  }

  function injectStyles() {
    if (document.getElementById("alkamAutomationControlStyle")) return;
    const style = document.createElement("style");
    style.id = "alkamAutomationControlStyle";
    style.textContent = `
      .alkam-auto-float{position:fixed;right:18px;bottom:18px;z-index:999998;border:0;border-radius:999px;background:#061d3f;color:#fff;height:44px;padding:0 16px;font-weight:950;box-shadow:0 14px 32px rgba(2,6,23,.24);cursor:pointer}
      .alkam-auto-panel{position:fixed;right:18px;bottom:72px;width:min(760px,calc(100vw - 28px));max-height:min(760px,calc(100vh - 100px));overflow:auto;background:#fff;border:1px solid #dbe3ef;border-radius:18px;box-shadow:0 30px 90px rgba(15,23,42,.28);z-index:999998;display:none}
      .alkam-auto-panel.open{display:block}
      .alkam-auto-head{padding:16px 18px;border-bottom:1px solid #e2e8f0;background:linear-gradient(180deg,#f8fbff,#fff);display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .alkam-auto-title{font-size:18px;font-weight:950;color:#0f172a;margin:0}
      .alkam-auto-sub{font-size:12px;font-weight:800;color:#64748b;line-height:1.45;margin-top:5px}
      .alkam-auto-close{border:0;background:#e8eef9;border-radius:10px;width:34px;height:34px;font-weight:950;cursor:pointer}
      .alkam-auto-body{padding:14px 18px 18px}
      .alkam-auto-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
      .alkam-auto-btn{border:0;border-radius:10px;min-height:36px;padding:0 11px;font-size:12px;font-weight:950;cursor:pointer;background:#e8eef9;color:#0f172a}
      .alkam-auto-btn.red{background:#dc2626;color:#fff}.alkam-auto-btn.blue{background:#1769e8;color:#fff}
      .alkam-auto-list{display:grid;gap:8px}
      .alkam-auto-row{border:1px solid #e2e8f0;border-radius:13px;background:#fbfdff;padding:11px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}
      .alkam-auto-name{font-size:13px;font-weight:950;color:#0f172a}
      .alkam-auto-desc{font-size:11.5px;font-weight:750;color:#64748b;line-height:1.45;margin-top:4px}
      .alkam-auto-risk{display:inline-flex;align-items:center;border-radius:999px;padding:3px 7px;margin-top:7px;font-size:10px;font-weight:950;border:1px solid #fed7aa;background:#fff7ed;color:#c2410c}
      .alkam-switch{position:relative;display:inline-block;width:78px;height:34px}
      .alkam-switch input{opacity:0;width:0;height:0}
      .alkam-slider{position:absolute;cursor:pointer;inset:0;background:#cbd5e1;border-radius:999px;transition:.18s}
      .alkam-slider:before{position:absolute;content:"";height:26px;width:26px;left:4px;top:4px;background:white;border-radius:50%;transition:.18s;box-shadow:0 3px 10px rgba(15,23,42,.18)}
      .alkam-switch input:checked + .alkam-slider{background:#059669}
      .alkam-switch input:checked + .alkam-slider:before{transform:translateX(44px)}
      .alkam-switch-text{display:block;text-align:center;font-size:10px;font-weight:950;margin-top:4px;color:#475569}
      .alkam-auto-section-title{font-size:13px;font-weight:950;color:#0f172a;margin:16px 0 8px}
      .alkam-pending{border:1px dashed #cbd5e1;border-radius:12px;padding:10px;background:#fff}
      .alkam-pending-item{font-size:11px;line-height:1.45;color:#334155;border-bottom:1px solid #f1f5f9;padding:7px 0}
      .alkam-pending-item:last-child{border-bottom:0}
      .alkam-auto-toast{position:fixed;left:18px;bottom:18px;background:#0f172a;color:#fff;border-radius:12px;padding:11px 13px;font-size:12px;font-weight:900;z-index:999999;box-shadow:0 14px 30px rgba(15,23,42,.25);display:none;max-width:360px}
    `;
    document.head.appendChild(style);
  }

  function ensurePanel() {
    injectStyles();

    if (!document.getElementById("alkamAutomationButton")) {
      const btn = document.createElement("button");
      btn.id = "alkamAutomationButton";
      btn.className = "alkam-auto-float";
      btn.type = "button";
      btn.textContent = "⚙ Otomasyon Kontrol";
      btn.onclick = () => togglePanel();
      document.body.appendChild(btn);
    }

    if (!document.getElementById("alkamAutomationPanel")) {
      const panel = document.createElement("div");
      panel.id = "alkamAutomationPanel";
      panel.className = "alkam-auto-panel";
      document.body.appendChild(panel);
    }

    if (!document.getElementById("alkamAutoToast")) {
      const toastEl = document.createElement("div");
      toastEl.id = "alkamAutoToast";
      toastEl.className = "alkam-auto-toast";
      document.body.appendChild(toastEl);
    }

    // Ana menüye küçük erişim butonu ekle; hata olursa sessiz geç.
    try {
      const nav = document.querySelector(".nav");
      if (nav && !document.getElementById("alkamAutomationNavBtn")) {
        const navBtn = document.createElement("button");
        navBtn.id = "alkamAutomationNavBtn";
        navBtn.className = "nav-btn";
        navBtn.type = "button";
        navBtn.innerHTML = '<span class="nav-ico">⚙</span> Otomasyon';
        navBtn.onclick = () => openPanel();
        nav.appendChild(navBtn);
      }
    } catch (err) {}
  }

  function renderPanel() {
    if (typeof document === "undefined") return;
    const panel = document.getElementById("alkamAutomationPanel");
    if (!panel) return;

    const state = getState();
    const pending = readJson(PENDING_KEY, []);

    const rows = RULES.map(rule => {
      const enabled = !!state[rule.key]?.enabled;
      return `
        <div class="alkam-auto-row">
          <div>
            <div class="alkam-auto-name">${escapeHtml(rule.title)}</div>
            <div class="alkam-auto-desc">${escapeHtml(rule.desc)}</div>
            <span class="alkam-auto-risk">Risk: ${escapeHtml(rule.risk)}</span>
          </div>
          <label>
            <span class="alkam-switch">
              <input type="checkbox" data-alkam-auto-toggle="${escapeHtml(rule.key)}" ${enabled ? "checked" : ""}>
              <span class="alkam-slider"></span>
            </span>
            <span class="alkam-switch-text">${enabled ? "OTOMATİK" : "KAPALI"}</span>
          </label>
        </div>
      `;
    }).join("");

    const pendingHtml = pending.length
      ? pending.slice(0, 12).map(item => `
          <div class="alkam-pending-item">
            <b>${escapeHtml(item.actionName || item.ruleKey)}</b>
            <br>${escapeHtml(item.status)} · ${escapeHtml(formatDateTime(item.createdAt))}
          </div>
        `).join("")
      : `<div class="alkam-pending-item">Onay bekleyen otomasyon kaydı yok.</div>`;

    panel.innerHTML = `
      <div class="alkam-auto-head">
        <div>
          <h3 class="alkam-auto-title">Otomasyon Kontrol Merkezi</h3>
          <div class="alkam-auto-sub">
            Varsayılan durum: finansal/muhasebesel otomatik işler kapalıdır.
            Bir tıkla “Otomatik” veya “Kapalı” yapılabilir.
          </div>
        </div>
        <button class="alkam-auto-close" type="button" data-alkam-auto-close>×</button>
      </div>
      <div class="alkam-auto-body">
        <div class="alkam-auto-toolbar">
          <button class="alkam-auto-btn red" type="button" data-alkam-auto-disable-all>Tüm otomatik işleri kapat</button>
          <button class="alkam-auto-btn blue" type="button" data-alkam-auto-refresh>Paneli yenile</button>
          <button class="alkam-auto-btn" type="button" data-alkam-auto-clear-pending>Onay bekleyenleri temizle</button>
        </div>
        <div class="alkam-auto-list">${rows}</div>

        <div class="alkam-auto-section-title">Onay Bekleyen / Bloklanan Otomasyonlar</div>
        <div class="alkam-pending">${pendingHtml}</div>

        <div class="alkam-auto-section-title">Koruma Notu</div>
        <div class="alkam-pending">
          <div class="alkam-pending-item">
            Bu katman index.html dosyasını değiştirmez. Otomatik işlem fonksiyonları varsa sarar; yoksa yalnızca kontrol paneli ve bayrak sağlar.
          </div>
        </div>
      </div>
    `;

    panel.querySelectorAll("[data-alkam-auto-toggle]").forEach(input => {
      input.addEventListener("change", () => {
        setEnabled(input.getAttribute("data-alkam-auto-toggle"), input.checked);
      });
    });

    const closeBtn = panel.querySelector("[data-alkam-auto-close]");
    if (closeBtn) closeBtn.onclick = () => closePanel();

    const disableBtn = panel.querySelector("[data-alkam-auto-disable-all]");
    if (disableBtn) disableBtn.onclick = () => disableAll();

    const refreshBtn = panel.querySelector("[data-alkam-auto-refresh]");
    if (refreshBtn) refreshBtn.onclick = () => {
      patchKnownFunctions();
      renderPanel();
      toast("Otomasyon paneli yenilendi");
    };

    const clearBtn = panel.querySelector("[data-alkam-auto-clear-pending]");
    if (clearBtn) clearBtn.onclick = () => clearPending();
  }

  function openPanel() {
    ensurePanel();
    renderPanel();
    document.getElementById("alkamAutomationPanel")?.classList.add("open");
  }

  function closePanel() {
    document.getElementById("alkamAutomationPanel")?.classList.remove("open");
  }

  function togglePanel() {
    ensurePanel();
    renderPanel();
    document.getElementById("alkamAutomationPanel")?.classList.toggle("open");
  }

  function toast(message) {
    const el = document.getElementById("alkamAutoToast");
    if (!el) return;
    el.textContent = message;
    el.style.display = "block";
    clearTimeout(window.__alkamAutoToastTimer);
    window.__alkamAutoToastTimer = setTimeout(() => {
      el.style.display = "none";
    }, 2600);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDateTime(value) {
    try {
      return new Date(value).toLocaleString("tr-TR");
    } catch (err) {
      return value || "";
    }
  }

  function init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      writeJson(STORAGE_KEY, cloneDefaultState());
    }

    publishFlags();

    window.ALKAM_AUTOMATION_CONTROL = {
      rules: RULES.map(r => Object.assign({}, r, { aliases: r.aliases.slice() })),
      list: () => getState(),
      isEnabled,
      setEnabled,
      disableAll,
      guard,
      addPending,
      clearPending,
      openPanel,
      closePanel,
      patchKnownFunctions,
      storageKey: STORAGE_KEY,
      pendingKey: PENDING_KEY
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        ensurePanel();
        renderPanel();
        installRepeatingPatch();
      });
    } else {
      ensurePanel();
      renderPanel();
      installRepeatingPatch();
    }

    console.info("[ALKAM] Otomasyon kontrol katmanı yüklendi. Varsayılan: otomatik işlemler kapalı.");
  }

  init();
})();
