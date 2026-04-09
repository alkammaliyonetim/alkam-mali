(function () {
  "use strict";

  const STORAGE_KEY = "alkam_finans_v2";

  const emptyDB = {
    cariler: [],
    hareketler: [],
    seciliCariId: null
  };

  let db = loadDB();

  const el = {
    cariListesi: document.getElementById("cariListesi"),
    cariArama: document.getElementById("cariArama"),
    cariForm: document.getElementById("cariForm"),
    cariAd: document.getElementById("cariAd"),
    cariTelefon: document.getElementById("cariTelefon"),
    cariEmail: document.getElementById("cariEmail"),
    cariNot: document.getElementById("cariNot"),

    hareketForm: document.getElementById("hareketForm"),
    hareketCari: document.getElementById("hareketCari"),
    hareketTur: document.getElementById("hareketTur"),
    hareketAltTur: document.getElementById("hareketAltTur"),
    hareketTarih: document.getElementById("hareketTarih"),
    hareketTutar: document.getElementById("hareketTutar"),
    hareketAciklama: document.getElementById("hareketAciklama"),

    detayBos: document.getElementById("detayBos"),
    cariDetay: document.getElementById("cariDetay"),
    detayBaslik: document.getElementById("detayBaslik"),
    detayAlt: document.getElementById("detayAlt"),

    ozetBakiye: document.getElementById("ozetBakiye"),
    ozetToplamBorc: document.getElementById("ozetToplamBorc"),
    ozetToplamTahsilat: document.getElementById("ozetToplamTahsilat"),
    ozetSonTahakkuk: document.getElementById("ozetSonTahakkuk"),
    ozetSonTahsilat: document.getElementById("ozetSonTahsilat"),

    hareketTabloBody: document.getElementById("hareketTabloBody"),

    btnCariSil: document.getElementById("btnCariSil"),
    btnOrnekData: document.getElementById("btnOrnekData")
  };

  init();

  function init() {
    ensureDBShape();
    bindEvents();
    setDefaultValues();
    renderAll();
  }

  function bindEvents() {
    if (el.cariArama) el.cariArama.addEventListener("input", renderCariListesi);
    if (el.cariForm) el.cariForm.addEventListener("submit", onCariSubmit);
    if (el.hareketForm) el.hareketForm.addEventListener("submit", onHareketSubmit);
    if (el.btnCariSil) el.btnCariSil.addEventListener("click", onCariSil);
    if (el.btnOrnekData) el.btnOrnekData.addEventListener("click", yukleOrnekData);
  }

  function renderAll() {
    fillCariSelect();
    renderCariListesi();
    renderSeciliCariDetay();
  }

  function renderCariListesi() {
    if (!el.cariListesi) return;

    const q = (el.cariArama?.value || "").trim().toLowerCase();

    const cariler = [...db.cariler]
      .filter(c => {
        if (!q) return true;
        return [
          c.ad || "",
          c.telefon || "",
          c.email || "",
          c.not || ""
        ].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => (a.ad || "").localeCompare(b.ad || "", "tr"));

    if (!cariler.length) {
      el.cariListesi.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">Cari yok</div>
          <div class="empty-text">Yeni cari ekleyin.</div>
        </div>
      `;
      return;
    }

    el.cariListesi.innerHTML = cariler.map(cari => {
      const rapor = hesaplaCariRaporu(cari.id);

      return `
        <button type="button" class="cari-item ${db.seciliCariId === cari.id ? "active" : ""}" data-cari-id="${escapeHtml(cari.id)}">
          <div class="cari-item-top">
            <div class="cari-item-title">${escapeHtml(cari.ad || "-")}</div>
            <div class="cari-item-bakiye ${rapor.bakiye >= 0 ? "pozitif" : "negatif"}">${formatMoney(rapor.bakiye)}</div>
          </div>
          <div class="cari-item-meta">
            <span>Son Tahakkuk: ${rapor.sonTahakkuk ? formatDateTR(rapor.sonTahakkuk.tarih) : "-"}</span>
            <span>Son Tahsilat: ${rapor.sonTahsilat ? formatDateTR(rapor.sonTahsilat.tarih) : "-"}</span>
          </div>
        </button>
      `;
    }).join("");

    el.cariListesi.querySelectorAll("[data-cari-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        db.seciliCariId = btn.dataset.cariId;
        saveDB();
        renderAll();
      });
    });
  }

  function fillCariSelect() {
    if (!el.hareketCari) return;

    const options = [
      `<option value="">Cari seç</option>`,
      ...db.cariler
        .sort((a, b) => (a.ad || "").localeCompare(b.ad || "", "tr"))
        .map(c => `<option value="${escapeHtml(c.id)}" ${db.seciliCariId === c.id ? "selected" : ""}>${escapeHtml(c.ad || "")}</option>`)
    ];

    el.hareketCari.innerHTML = options.join("");
  }

  function renderSeciliCariDetay() {
    const cari = db.cariler.find(c => c.id === db.seciliCariId);

    if (!cari) {
      if (el.detayBos) el.detayBos.style.display = "block";
      if (el.cariDetay) el.cariDetay.style.display = "none";
      if (el.hareketTabloBody) el.hareketTabloBody.innerHTML = "";
      return;
    }

    if (el.detayBos) el.detayBos.style.display = "none";
    if (el.cariDetay) el.cariDetay.style.display = "block";

    const rapor = hesaplaCariRaporu(cari.id);

    if (el.detayBaslik) el.detayBaslik.textContent = cari.ad || "Cari";
    if (el.detayAlt) {
      el.detayAlt.innerHTML = `
        ${cari.telefon ? `<div>Telefon: ${escapeHtml(cari.telefon)}</div>` : ""}
        ${cari.email ? `<div>E-posta: ${escapeHtml(cari.email)}</div>` : ""}
        ${cari.not ? `<div>Not: ${escapeHtml(cari.not)}</div>` : ""}
      `;
    }

    if (el.ozetBakiye) el.ozetBakiye.textContent = formatMoney(rapor.bakiye);
    if (el.ozetToplamBorc) el.ozetToplamBorc.textContent = formatMoney(rapor.toplamTahakkuk + rapor.toplamOdeme);
    if (el.ozetToplamTahsilat) el.ozetToplamTahsilat.textContent = formatMoney(rapor.toplamTahsilat);

    if (el.ozetSonTahakkuk) {
      el.ozetSonTahakkuk.innerHTML = rapor.sonTahakkuk
        ? `
          <div><strong>${formatDateTR(rapor.sonTahakkuk.tarih)}</strong></div>
          <div>${formatMoney(rapor.sonTahakkuk.tutar)}</div>
          <div>${escapeHtml(rapor.sonTahakkuk.aciklama || rapor.sonTahakkuk.altTur || "Tahakkuk")}</div>
        `
        : `<div>Kayıt yok</div>`;
    }

    if (el.ozetSonTahsilat) {
      el.ozetSonTahsilat.innerHTML = rapor.sonTahsilat
        ? `
          <div><strong>${formatDateTR(rapor.sonTahsilat.tarih)}</strong></div>
          <div>${formatMoney(rapor.sonTahsilat.tutar)}</div>
          <div>${escapeHtml(rapor.sonTahsilat.aciklama || rapor.sonTahsilat.altTur || "Tahsilat")}</div>
        `
        : `<div>Kayıt yok</div>`;
    }

    renderCariHareketleri(cari.id);
  }

  function renderCariHareketleri(cariId) {
    if (!el.hareketTabloBody) return;

    const hareketler = db.hareketler
      .filter(h => h.cariId === cariId)
      .sort(sortByDateDesc);

    if (!hareketler.length) {
      el.hareketTabloBody.innerHTML = `<tr><td colspan="6" class="center">Bu cariye ait hareket yok.</td></tr>`;
      return;
    }

    el.hareketTabloBody.innerHTML = hareketler.map(h => `
      <tr>
        <td>${formatDateTR(h.tarih)}</td>
        <td>${etiketTur(h.tur)}</td>
        <td>${escapeHtml(h.altTur || "-")}</td>
        <td>${escapeHtml(h.aciklama || "-")}</td>
        <td class="text-right">${formatMoney(h.tutar)}</td>
        <td class="text-right">
          <button type="button" class="btn-small btn-danger" data-sil-hareket-id="${escapeHtml(h.id)}">Sil</button>
        </td>
      </tr>
    `).join("");

    el.hareketTabloBody.querySelectorAll("[data-sil-hareket-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.silHareketId;
        db.hareketler = db.hareketler.filter(h => h.id !== id);
        saveDB();
        renderAll();
      });
    });
  }

  function onCariSubmit(e) {
    e.preventDefault();

    const ad = (el.cariAd?.value || "").trim();
    const telefon = (el.cariTelefon?.value || "").trim();
    const email = (el.cariEmail?.value || "").trim();
    const not = (el.cariNot?.value || "").trim();

    if (!ad) {
      alert("Cari adı zorunlu");
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
      alert("Tür seç");
      return;
    }

    if (["tahakkuk", "tahsilat", "odeme"].includes(tur) && !cariId) {
      alert("Cari seç");
      return;
    }

    if (!tutar || tutar <= 0) {
      alert("Geçerli tutar gir");
      return;
    }

    db.hareketler.push({
      id: uid(),
      cariId,
      tur,
      altTur,
      tarih,
      tutar,
      aciklama,
      createdAt: nowISO()
    });

    if (cariId) db.seciliCariId = cariId;

    saveDB();

    if (el.hareketForm) el.hareketForm.reset();
    setDefaultValues();
    renderAll();
  }

  function onCariSil() {
    if (!db.seciliCariId) {
      alert("Cari seç");
      return;
    }

    const cari = db.cariler.find(c => c.id === db.seciliCariId);
    if (!cari) return;

    if (!confirm(`${cari.ad} silinsin mi?`)) return;

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

    const bakiye = toplamTahakkuk + toplamOdeme - toplamTahsilat;

    return {
      toplamTahakkuk,
      toplamTahsilat,
      toplamOdeme,
      bakiye,
      sonTahakkuk: tahakkuklar[0] || null,
      sonTahsilat: tahsilatlar[0] || null
    };
  }

  function loadDB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(emptyDB);
      const parsed = JSON.parse(raw);
      return {
        cariler: Array.isArray(parsed.cariler) ? parsed.cariler : [],
        hareketler: Array.isArray(parsed.hareketler) ? parsed.hareketler : [],
        seciliCariId: parsed.seciliCariId || null
      };
    } catch (e) {
      return clone(emptyDB);
    }
  }

  function saveDB() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function ensureDBShape() {
    if (!Array.isArray(db.cariler)) db.cariler = [];
    if (!Array.isArray(db.hareketler)) db.hareketler = [];
    if (typeof db.seciliCariId === "undefined") db.seciliCariId = null;
    saveDB();
  }

  function setDefaultValues() {
    if (el.hareketTarih) el.hareketTarih.value = today();
  }

  function uid() {
    return "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
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
    const db = new Date(b.tarih || b.createdAt || 0).getTime();
    return db - da;
  }

  function etiketTur(tur) {
    if (tur === "tahakkuk") return "Tahakkuk";
    if (tur === "tahsilat") return "Tahsilat";
    if (tur === "odeme") return "Ödeme";
    if (tur === "gelir") return "Gelir";
    if (tur === "gider") return "Gider";
    return tur || "-";
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
})();
