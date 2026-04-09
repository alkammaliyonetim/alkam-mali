/* =========================================================
   ALKAM - app.js
   Tek dosya, localStorage tabanlı temel ön muhasebe iskeleti
   Özellikler:
   - Cari listesi
   - Cari detay
   - Hareket ekleme
   - Tahakkuk / Tahsilat / Ödeme / Gelir / Gider kayıtları
   - Cari bakiyesi
   - Son tahsilat
   - Son tahakkuk
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "alkam_finans_v1";

  const emptyDB = {
    cariler: [
      {
        id: uid(),
        ad: "Örnek Cari 1",
        telefon: "",
        email: "",
        not: "",
        createdAt: nowISO()
      },
      {
        id: uid(),
        ad: "Örnek Cari 2",
        telefon: "",
        email: "",
        not: "",
        createdAt: nowISO()
      }
    ],
    hareketler: [
      {
        id: uid(),
        cariId: null,
        tur: "gelir",
        altTur: "nakit",
        tarih: today(),
        tutar: 15000,
        aciklama: "Açılış nakit",
        createdAt: nowISO()
      },
      {
        id: uid(),
        cariId: null,
        tur: "gider",
        altTur: "genel",
        tarih: today(),
        tutar: 3500,
        aciklama: "Kırtasiye gideri",
        createdAt: nowISO()
      }
    ],
    seciliCariId: null
  };

  let db = loadDB();

  // ---------------------------------------------------------
  // DOM
  // ---------------------------------------------------------
  const el = {
    cariListesi: $("#cariListesi"),
    cariArama: $("#cariArama"),
    cariForm: $("#cariForm"),
    cariAd: $("#cariAd"),
    cariTelefon: $("#cariTelefon"),
    cariEmail: $("#cariEmail"),
    cariNot: $("#cariNot"),

    hareketForm: $("#hareketForm"),
    hareketCari: $("#hareketCari"),
    hareketTur: $("#hareketTur"),
    hareketAltTur: $("#hareketAltTur"),
    hareketTarih: $("#hareketTarih"),
    hareketTutar: $("#hareketTutar"),
    hareketAciklama: $("#hareketAciklama"),

    detayBos: $("#detayBos"),
    cariDetay: $("#cariDetay"),
    detayBaslik: $("#detayBaslik"),
    detayAlt: $("#detayAlt"),

    ozetBakiye: $("#ozetBakiye"),
    ozetToplamBorc: $("#ozetToplamBorc"),
    ozetToplamTahsilat: $("#ozetToplamTahsilat"),
    ozetSonTahakkuk: $("#ozetSonTahakkuk"),
    ozetSonTahsilat: $("#ozetSonTahsilat"),

    hareketTabloBody: $("#hareketTabloBody"),

    btnCariSil: $("#btnCariSil"),
    btnOrnekData: $("#btnOrnekData")
  };

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  init();

  function init() {
    seedIfNeeded();
    bindEvents();
    fillCariSelect();
    setDefaultFormValues();
    renderAll();
  }

  function bindEvents() {
    if (el.cariArama) {
      el.cariArama.addEventListener("input", renderCariListesi);
    }

    if (el.cariForm) {
      el.cariForm.addEventListener("submit", onCariSubmit);
    }

    if (el.hareketForm) {
      el.hareketForm.addEventListener("submit", onHareketSubmit);
    }

    if (el.btnCariSil) {
      el.btnCariSil.addEventListener("click", onCariSil);
    }

    if (el.btnOrnekData) {
      el.btnOrnekData.addEventListener("click", yukleOrnekData);
    }
  }

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  function renderAll() {
    renderCariListesi();
    fillCariSelect();
    renderSeciliCariDetay();
  }

  function renderCariListesi() {
    if (!el.cariListesi) return;

    const q = (el.cariArama?.value || "").trim().toLowerCase();

    const cariler = [...db.cariler]
      .filter(c => {
        if (!q) return true;
        return (
          (c.ad || "").toLowerCase().includes(q) ||
          (c.telefon || "").toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.ad || "").localeCompare(b.ad || "", "tr"));

    if (!cariler.length) {
      el.cariListesi.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">Cari bulunamadı</div>
          <div class="empty-text">Aramayı değiştir ya da yeni cari ekle.</div>
        </div>
      `;
      return;
    }

    el.cariListesi.innerHTML = cariler.map(cari => {
      const rapor = hesaplaCariRaporu(cari.id);

      return `
        <button class="cari-item ${db.seciliCariId === cari.id ? "active" : ""}" data-cari-id="${escapeHtml(cari.id)}">
          <div class="cari-item-top">
            <div class="cari-item-title">${escapeHtml(cari.ad || "-")}</div>
            <div class="cari-item-bakiye ${rapor.bakiye >= 0 ? "pozitif" : "negatif"}">
              ${formatMoney(rapor.bakiye)}
            </div>
          </div>

          <div class="cari-item-meta">
            <span>Son Tahakkuk: ${rapor.sonTahakkuk ? formatDateTR(rapor.sonTahakkuk.tarih) : "-"}</span>
            <span>Son Tahsilat: ${rapor.sonTahsilat ? formatDateTR(rapor.sonTahsilat.tarih) : "-"}</span>
          </div>
        </button>
      `;
    }).join("");

    $all("[data-cari-id]", el.cariListesi).forEach(btn => {
      btn.addEventListener("click", () => {
        db.seciliCariId = btn.dataset.cariId;
        saveDB();
        renderAll();
      });
    });
  }

  function renderSeciliCariDetay() {
    const cari = db.cariler.find(x => x.id === db.seciliCariId);

    if (!cari) {
      if (el.detayBos) el.detayBos.style.display = "";
      if (el.cariDetay) el.cariDetay.style.display = "none";
      return;
    }

    if (el.detayBos) el.detayBos.style.display = "none";
    if (el.cariDetay) el.cariDetay.style.display = "";

    const rapor = hesaplaCariRaporu(cari.id);

    if (el.detayBaslik) {
      el.detayBaslik.textContent = cari.ad || "Cari";
    }

    if (el.detayAlt) {
      el.detayAlt.innerHTML = `
        <div>${cari.telefon ? `Telefon: ${escapeHtml(cari.telefon)}` : ""}</div>
        <div>${cari.email ? `E-posta: ${escapeHtml(cari.email)}` : ""}</div>
        <div>${cari.not ? `Not: ${escapeHtml(cari.not)}` : ""}</div>
      `;
    }

    if (el.ozetBakiye) el.ozetBakiye.textContent = formatMoney(rapor.bakiye);
    if (el.ozetToplamBorc) el.ozetToplamBorc.textContent = formatMoney(rapor.toplamTahakkuk + rapor.toplamOdeme);
    if (el.ozetToplamTahsilat) el.ozetToplamTahsilat.textContent = formatMoney(rapor.toplamTahsilat);

    if (el.ozetSonTahakkuk) {
      el.ozetSonTahakkuk.innerHTML = rapor.sonTahakkuk
        ? `
          <div class="mini-line">
            <strong>${formatDateTR(rapor.sonTahakkuk.tarih)}</strong>
          </div>
          <div class="mini-line">${formatMoney(rapor.sonTahakkuk.tutar)}</div>
          <div class="mini-line">${escapeHtml(rapor.sonTahakkuk.aciklama || rapor.sonTahakkuk.altTur || "Tahakkuk")}</div>
        `
        : `<div class="mini-line">Kayıt yok</div>`;
    }

    if (el.ozetSonTahsilat) {
      el.ozetSonTahsilat.innerHTML = rapor.sonTahsilat
        ? `
          <div class="mini-line">
            <strong>${formatDateTR(rapor.sonTahsilat.tarih)}</strong>
          </div>
          <div class="mini-line">${formatMoney(rapor.sonTahsilat.tutar)}</div>
          <div class="mini-line">${escapeHtml(rapor.sonTahsilat.aciklama || rapor.sonTahsilat.altTur || "Tahsilat")}</div>
        `
        : `<div class="mini-line">Kayıt yok</div>`;
    }

    renderCariHareketleri(cari.id);
    fillCariSelect();
  }

  function renderCariHareketleri(cariId) {
    if (!el.hareketTabloBody) return;

    const rows = db.hareketler
      .filter(h => h.cariId === cariId)
      .sort(sortByDateDesc)
      .map(h => {
        return `
          <tr>
            <td>${formatDateTR(h.tarih)}</td>
            <td>${etiketTur(h.tur)}</td>
            <td>${escapeHtml(h.altTur || "-")}</td>
            <td>${escapeHtml(h.aciklama || "-")}</td>
            <td class="text-right">${formatMoney(h.tutar)}</td>
            <td class="text-right">
              <button class="btn-small btn-danger" data-sil-hareket-id="${escapeHtml(h.id)}">Sil</button>
            </td>
          </tr>
        `;
      });

    el.hareketTabloBody.innerHTML = rows.length
      ? rows.join("")
      : `<tr><td colspan="6" style="text-align:center;">Bu cariye ait hareket yok.</td></tr>`;

    $all("[data-sil-hareket-id]", el.hareketTabloBody).forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.silHareketId;
        db.hareketler = db.hareketler.filter(h => h.id !== id);
        saveDB();
        renderAll();
      });
    });
  }

  function fillCariSelect() {
    if (!el.hareketCari) return;

    const secenekler = [
      `<option value="">Cari seç</option>`,
      ...db.cariler
        .sort((a, b) => (a.ad || "").localeCompare(b.ad || "", "tr"))
        .map(c => `<option value="${escapeHtml(c.id)}" ${db.seciliCariId === c.id ? "selected" : ""}>${escapeHtml(c.ad)}</option>`)
    ];

    el.hareketCari.innerHTML = secenekler.join("");
  }

  function setDefaultFormValues() {
    if (el.hareketTarih && !el.hareketTarih.value) {
      el.hareketTarih.value = today();
    }
  }

  // ---------------------------------------------------------
  // EVENTS
  // ---------------------------------------------------------
  function onCariSubmit(e) {
    e.preventDefault();

    const ad = (el.cariAd?.value || "").trim();
    const telefon = (el.cariTelefon?.value || "").trim();
    const email = (el.cariEmail?.value || "").trim();
    const not = (el.cariNot?.value || "").trim();

    if (!ad) {
      alert("Cari adı zorunlu.");
      return;
    }

    const yeniCari = {
      id: uid(),
      ad,
      telefon,
      email,
      not,
      createdAt: nowISO()
    };

    db.cariler.push(yeniCari);
    db.seciliCariId = yeniCari.id;
    saveDB();

    if (el.cariForm) el.cariForm.reset();
    renderAll();
  }

  function onHareketSubmit(e) {
    e.preventDefault();

    const cariId = (el.hareketCari?.value || "").trim() || null;
    const tur = (el.hareketTur?.value || "").trim();
    const altTur = (el.hareketAltTur?.value || "").trim();
    const tarih = (el.hareketTarih?.value || "").trim() || today();
    const tutar = parseMoney(el.hareketTutar?.value);
    const aciklama = (el.hareketAciklama?.value || "").trim();

    if (!tur) {
      alert("Hareket türü seç.");
      return;
    }

    const cariZorunlu = ["tahakkuk", "tahsilat", "odeme"];
    if (cariZorunlu.includes(tur) && !cariId) {
      alert("Bu hareket için cari seçmen lazım.");
      return;
    }

    if (!tutar || tutar <= 0) {
      alert("Geçerli bir tutar gir.");
      return;
    }

    const yeniHareket = {
      id: uid(),
      cariId,
      tur,
      altTur,
      tarih,
      tutar,
      aciklama,
      createdAt: nowISO()
    };

    db.hareketler.push(yeniHareket);

    if (cariId) db.seciliCariId = cariId;

    saveDB();

    if (el.hareketForm) el.hareketForm.reset();
    setDefaultFormValues();
    renderAll();
  }

  function onCariSil() {
    if (!db.seciliCariId) {
      alert("Silinecek cari seçili değil.");
      return;
    }

    const cari = db.cariler.find(c => c.id === db.seciliCariId);
    if (!cari) return;

    const ok = confirm(`${cari.ad} carisini ve buna bağlı hareketleri silmek istiyor musun?`);
    if (!ok) return;

    db.hareketler = db.hareketler.filter(h => h.cariId !== cari.id);
    db.cariler = db.cariler.filter(c => c.id !== cari.id);
    db.seciliCariId = null;
    saveDB();
    renderAll();
  }

  function yukleOrnekData() {
    const cariA = {
      id: uid(),
      ad: "Ercan Alaylı",
      telefon: "0532 000 00 00",
      email: "ercan@example.com",
      not: "Muhasebe ücreti müşterisi",
      createdAt: nowISO()
    };

    const cariB = {
      id: uid(),
      ad: "Malzemeci Erdinç",
      telefon: "",
      email: "",
      not: "Tedarikçi",
      createdAt: nowISO()
    };

    db.cariler.push(cariA, cariB);

    db.hareketler.push(
      {
        id: uid(),
        cariId: cariA.id,
        tur: "tahakkuk",
        altTur: "muhasebe",
        tarih: "2026-04-01",
        tutar: 3000,
        aciklama: "Nisan muhasebe ücreti tahakkuku",
        createdAt: nowISO()
      },
      {
        id: uid(),
        cariId: cariA.id,
        tur: "tahsilat",
        altTur: "nakit",
        tarih: "2026-04-05",
        tutar: 3000,
        aciklama: "Nisan tahsilat",
        createdAt: nowISO()
      },
      {
        id: uid(),
        cariId: cariA.id,
        tur: "tahakkuk",
        altTur: "muhasebe",
        tarih: "2026-03-01",
        tutar: 3000,
        aciklama: "Mart muhasebe ücreti tahakkuku",
        createdAt: nowISO()
      },
      {
        id: uid(),
        cariId: cariB.id,
        tur: "odeme",
        altTur: "banka",
        tarih: "2026-04-03",
        tutar: 5200,
        aciklama: "Malzeme ödemesi",
        createdAt: nowISO()
      }
    );

    db.seciliCariId = cariA.id;
    saveDB();
    renderAll();
  }

  // ---------------------------------------------------------
  // RAPOR / HESAP
  // ---------------------------------------------------------
  function hesaplaCariRaporu(cariId) {
    const hareketler = db.hareketler
      .filter(h => h.cariId === cariId)
      .sort(sortByDateDesc);

    const tahakkuklar = hareketler.filter(h => h.tur === "tahakkuk");
    const tahsilatlar = hareketler.filter(h => h.tur === "tahsilat");
    const odemeler = hareketler.filter(h => h.tur === "odeme");

    const toplamTahakkuk = sum(tahakkuklar.map(x => x.tutar));
    const toplamTahsilat = sum(tahsilatlar.map(x => x.tutar));
    const toplamOdeme = sum(odemeler.map(x => x.tutar));

    // Mantık:
    // Tahakkuk cari borcu artırır
    // Tahsilat borcu azaltır
    // Ödeme burada cariyle ilişkili bir tedarikçi ödemesi gibi düşünülür, borç artıran kalem gibi izlenir
    const bakiye = toplamTahakkuk + toplamOdeme - toplamTahsilat;

    const sonTahakkuk = tahakkuklar.length ? tahakkuklar[0] : null;
    const sonTahsilat = tahsilatlar.length ? tahsilatlar[0] : null;

    return {
      toplamTahakkuk,
      toplamTahsilat,
      toplamOdeme,
      bakiye,
      sonTahakkuk,
      sonTahsilat
    };
  }

  // ---------------------------------------------------------
  // STORAGE
  // ---------------------------------------------------------
  function loadDB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredCloneSafe(emptyDB);
      const parsed = JSON.parse(raw);

      return {
        cariler: Array.isArray(parsed.cariler) ? parsed.cariler : [],
        hareketler: Array.isArray(parsed.hareketler) ? parsed.hareketler : [],
        seciliCariId: parsed.seciliCariId || null
      };
    } catch (err) {
      console.error("DB okunamadı:", err);
      return structuredCloneSafe(emptyDB);
    }
  }

  function saveDB() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function seedIfNeeded() {
    if (!Array.isArray(db.cariler)) db.cariler = [];
    if (!Array.isArray(db.hareketler)) db.hareketler = [];
    if (typeof db.seciliCariId === "undefined") db.seciliCariId = null;
    saveDB();
  }

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------
  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function uid() {
    return "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function sum(arr) {
    return arr.reduce((a, b) => a + (Number(b) || 0), 0);
  }

  function parseMoney(v) {
    if (v == null) return 0;
    return Number(String(v).replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "")) || 0;
  }

  function formatMoney(v) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 2
    }).format(Number(v) || 0);
  }

  function formatDateTR(v) {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return new Intl.DateTimeFormat("tr-TR").format(d);
  }

  function sortByDateDesc(a, b) {
    const da = new Date(a.tarih || a.createdAt || 0).getTime();
    const dbb = new Date(b.tarih || b.createdAt || 0).getTime();
    return dbb - da;
  }

  function etiketTur(tur) {
    switch (tur) {
      case "tahakkuk": return "Tahakkuk";
      case "tahsilat": return "Tahsilat";
      case "odeme": return "Ödeme";
      case "gelir": return "Gelir";
      case "gider": return "Gider";
      default: return tur || "-";
    }
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function structuredCloneSafe(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
})();
