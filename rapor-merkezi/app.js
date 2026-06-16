
const IMPORT_STORAGE_KEY = "raporMerkeziImportsV1";
const BASE_DATA = window.REPORT_DATA;
let DATA = hydrateData(BASE_DATA);
const state = { year: "2025", month: "all", view: "overview", masterPage: 1, masterPageSize: 50, masterSearch: "", masterCategory: "Tümü", costSearch: "", costCurrency: "Tümü", importLog: [] };

const monthLabels = {
  1:"Ocak",2:"Şubat",3:"Mart",4:"Nisan",5:"Mayıs",6:"Haziran",
  7:"Temmuz",8:"Ağustos",9:"Eylül",10:"Ekim",11:"Kasım",12:"Aralık"
};

const colorClasses = ["blue","green","orange","purple","teal","gold","red","cyan","olive","navy","pink","brown"];

const q = (sel) => document.querySelector(sel);
const qa = (sel) => [...document.querySelectorAll(sel)];

function money(v) {
  if (v === null || v === undefined || v === "" || Number.isNaN(Number(v))) return "—";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(v));
}
function num(v, digits = 0) {
  if (v === null || v === undefined || v === "" || Number.isNaN(Number(v))) return "—";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number(v));
}
function pct(v) {
  if (v === null || v === undefined || v === "" || Number.isNaN(Number(v))) return "—";
  return `%${(Number(v) * 100).toFixed(1)}`;
}
function safe(value) { return Number(value || 0); }

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadImports() {
  try {
    const raw = localStorage.getItem(IMPORT_STORAGE_KEY);
    if (!raw) return { salesRows: [], expenseRows: [] };
    const parsed = JSON.parse(raw);
    return {
      salesRows: Array.isArray(parsed.salesRows) ? parsed.salesRows : [],
      expenseRows: Array.isArray(parsed.expenseRows) ? parsed.expenseRows : []
    };
  } catch (error) {
    return { salesRows: [], expenseRows: [] };
  }
}

function saveImports(imports) {
  localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(imports));
}

function hydrateData(base) {
  const data = cloneData(base);
  applyImportsToData(data, loadImports());
  return data;
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLocaleUpperCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/İ/g, "I")
    .replace(/ı/g, "I")
    .replace(/\s+/g, " ");
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const text = String(value ?? "").trim().replace(/[^\d,.-]/g, "");
  if (!text) return 0;
  const comma = text.lastIndexOf(",");
  const dot = text.lastIndexOf(".");
  let normalized = text;
  if (comma >= 0 && dot >= 0) {
    normalized = comma > dot ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
  } else if (comma >= 0) {
    const decimals = text.length - comma - 1;
    normalized = decimals === 3 ? text.replace(/,/g, "") : text.replace(",", ".");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number" && window.XLSX?.SSF) {
    const d = XLSX.SSF.parse_date_code(value);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const text = String(value).trim();
  let m = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`;
  m = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (m) return `${m[3]}-${String(m[2]).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
  m = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (m) return `20${m[3]}-${String(m[1]).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
  m = text.match(/^(\d{1,2})[.-](\d{1,2})[.-](\d{2})$/);
  if (m) return `20${m[3]}-${String(m[2]).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function inferYear(name, fallback = state.year) {
  const match = String(name || "").match(/20\d{2}/);
  return match ? match[0] : fallback;
}

function monthFromHeader(value) {
  const n = normalizeText(value);
  const map = {
    OCAK: 1, SUBAT: 2, MART: 3, NISAN: 4, MAYIS: 5, HAZIRAN: 6,
    TEMMUZ: 7, AGUSTOS: 8, EYLUL: 9, EKIM: 10, KASIM: 11, ARALIK: 12
  };
  return map[n.replace(/\s/g, "")] || null;
}

function categoryFrom(code, product, unit) {
  const text = normalizeText(`${code} ${product} ${unit}`);
  if (text.includes("KENAR") || text.includes("MYLAR") || text.includes("PVC") || normalizeText(unit) === "MT") return "KENAR BANT";
  if (text.includes("CARSAF")) return "ÇARŞAF";
  if (text.includes("ISCILIK") || text.includes("TELALAMA") || text.includes("KALINLASTIRMA")) return "İŞÇİLİK";
  if (text.includes("MDF") || text.startsWith("KM") || text.startsWith("KSM") || text.startsWith("KFM")) return "MDF";
  if (text.includes("SUNTA") || text.startsWith("KS")) return "SUNTA";
  if (normalizeText(unit) === "M2" || text.includes("KAPLAMA")) return "KAPLAMA";
  return "DİĞER";
}

function categoryCostRatios(data) {
  const ratios = {};
  (data.years["2025"]?.categories || []).forEach(c => {
    if (safe(c.ciro) > 0 && c.maliyet !== null && c.maliyet !== undefined) ratios[c.name] = safe(c.maliyet) / safe(c.ciro);
  });
  return { "MDF": .68, "SUNTA": .68, "KAPLAMA": .55, "KENAR BANT": .62, "ÇARŞAF": .55, "İŞÇİLİK": .35, "DİĞER": .60, ...ratios };
}

function emptyYear(year) {
  return {
    overview: { totalRevenue: 0, totalCost: 0, grossProfit: 0, grossMargin: 0, totalExpense: 0, profitBeforeTax: 0, netProfit: 0, netMargin: 0 },
    yonPlus: [],
    yonRapor: { summary: {}, categories: [], topCustomers: [] },
    categories: [],
    expenseRows: []
  };
}

function applyImportsToData(data, imports) {
  const salesRows = imports.salesRows || [];
  const expenseRows = imports.expenseRows || [];
  const years = [...new Set([...salesRows.map(r => String(r.yil)), ...expenseRows.map(r => String(r.year))].filter(Boolean))];
  const ratios = categoryCostRatios(data);
  years.forEach(year => {
    const y = emptyYear(year);
    const months = new Map();
    const cats = new Map();
    const customers = new Map();
    const yearSales = salesRows.filter(r => String(r.yil) === year);
    const yearExpenses = expenseRows.filter(r => String(r.year) === year);

    for (let i = 1; i <= 12; i++) months.set(i, { month: i, label: monthLabels[i], categories: new Map(), total: { adet: 0, ciro: 0, maliyet: 0, kar: 0, marj: 0 } });

    yearSales.forEach(r => {
      const m = months.get(Number(r.ay));
      if (!m) return;
      const name = r.kategori || "DİĞER";
      const current = m.categories.get(name) || { name, adet: 0, ciro: 0, maliyet: 0, kar: 0, marj: 0 };
      current.adet += safe(r.miktar);
      current.ciro += safe(r.tutar);
      current.maliyet += safe(r.tutar) * safe(ratios[name] ?? .60);
      current.kar = current.ciro - current.maliyet;
      current.marj = current.ciro ? current.kar / current.ciro : 0;
      m.categories.set(name, current);
      customers.set(r.unvan || "Tanımsız", safe(customers.get(r.unvan || "Tanımsız")) + safe(r.tutar));
    });

    y.yonPlus = [...months.values()].map(m => {
      const categories = [...m.categories.values()].sort((a, b) => safe(b.ciro) - safe(a.ciro));
      const total = categories.reduce((acc, c) => {
        acc.adet += safe(c.adet); acc.ciro += safe(c.ciro); acc.maliyet += safe(c.maliyet); acc.kar += safe(c.kar);
        return acc;
      }, { adet: 0, ciro: 0, maliyet: 0, kar: 0, marj: 0 });
      total.marj = total.ciro ? total.kar / total.ciro : 0;
      categories.forEach(c => {
        const all = cats.get(c.name) || { name: c.name, adet: 0, ciro: 0, maliyet: 0, kar: 0, marj: 0 };
        all.adet += safe(c.adet); all.ciro += safe(c.ciro); all.maliyet += safe(c.maliyet); all.kar += safe(c.kar);
        cats.set(c.name, all);
      });
      return { month: m.month, label: m.label, categories, total };
    }).filter(m => m.total.ciro || yearExpenses.some(e => Number(e.month) === m.month));

    y.categories = [...cats.values()].map(c => ({ ...c, marj: c.ciro ? c.kar / c.ciro : 0 })).sort((a, b) => safe(b.ciro) - safe(a.ciro));
    const totalRevenue = y.yonPlus.reduce((a, m) => a + safe(m.total.ciro), 0);
    const totalCost = y.yonPlus.reduce((a, m) => a + safe(m.total.maliyet), 0);
    const grossProfit = totalRevenue - totalCost;
    const totalExpense = yearExpenses.reduce((a, r) => a + safe(r.tutar), 0);
    const netProfit = grossProfit - totalExpense;
    y.overview = {
      totalRevenue, totalCost, grossProfit,
      grossMargin: totalRevenue ? grossProfit / totalRevenue : 0,
      totalExpense, profitBeforeTax: netProfit, netProfit,
      netMargin: totalRevenue ? netProfit / totalRevenue : 0
    };
    y.yonRapor.summary = y.overview;
    y.yonRapor.categories = y.categories.map(c => ({ name: c.name, adet: c.adet, ciro: c.ciro, share: totalRevenue ? c.ciro / totalRevenue : 0 }));
    y.yonRapor.topCustomers = [...customers.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([name, revenue], idx) => ({ rank: idx + 1, name, revenue, share: totalRevenue ? revenue / totalRevenue : 0 }));
    data.years[year] = y;
    data.controls[year] = [
      { label: "İçe aktarılan ciro toplamı", left: totalRevenue, right: y.categories.reduce((a, c) => a + safe(c.ciro), 0) },
      { label: "İçe aktarılan maliyet toplamı", left: totalCost, right: y.categories.reduce((a, c) => a + safe(c.maliyet), 0) },
      { label: "İçe aktarılan gider toplamı", left: totalExpense, right: yearExpenses.reduce((a, r) => a + safe(r.tutar), 0) }
    ];
  });
}

function formatVersionStamp(meta = {}) {
  const source = meta.generatedAt ? new Date(meta.generatedAt) : new Date();
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const dd = String(source.getDate()).padStart(2, "0");
  const mon = String(source.getMonth() + 1).padStart(2, "0");
  const yy = String(source.getFullYear()).slice(-2);
  return `${hh}${mm}${dd}${mon}${yy}`;
}

function formatDimension(value, category = "") {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value).trim();
  const normalized = raw.replace(',', '.');
  const numeric = Number(normalized);
  const upperCategory = String(category || '').toUpperCase();
  if (!Number.isNaN(numeric) && (upperCategory === 'MDF' || upperCategory === 'SUNTA') && numeric > 0 && numeric <= 100) {
    return `${num(numeric, 0)} mm`;
  }
  return raw;
}

function formatCostProduct(row) {
  const name = row['ÜRÜN'] ?? '—';
  const dim = formatDimension(row['KALINLIK_BOY'], row['KATEGORİ']);
  return dim ? `${name} • ${dim}` : name;
}

function currentYearData() { return DATA.years[state.year]; }
function availableMonths() {
  return currentYearData().yonPlus.map(m => ({ value: String(m.month), label: m.label }));
}
function selectedMonthData() {
  if (state.month === "all") return null;
  return currentYearData().yonPlus.find(m => String(m.month) === state.month) || null;
}

function renderYearNotice() {
  const notice = q("#yearNotice");
  if (state.year === "2026") {
    const imported = loadImports().salesRows.filter(r => String(r.yil) === "2026").length;
    notice.textContent = imported
      ? `2026 verisi yerel içe aktarım katmanından hesaplandı. İçe aktarılan satış satırı: ${imported.toLocaleString("tr-TR")}.`
      : "2026 verisi şu an ham satış + özet katmanında. 2025 tarafı birebir workbook verisiyle dolduruldu.";
    notice.classList.remove("hidden");
  } else {
    notice.classList.add("hidden");
  }
}

function computeComparisons() {
  const yearData = currentYearData();
  const selected = selectedMonthData();
  if (selected) {
    const monthIndex = selected.month;
    const prevMonth = yearData.yonPlus.find(m => m.month === monthIndex - 1);
    const prevYear = DATA.years[String(Number(state.year) - 1)];
    const sameMonthPrevYear = prevYear ? prevYear.yonPlus.find(m => m.month === monthIndex) : null;
    return [
      compareCard("Geçen Aya Göre", selected.total.ciro, prevMonth ? prevMonth.total.ciro : null),
      compareCard("Geçen Yıl Aynı Aya Göre", selected.total.ciro, sameMonthPrevYear ? sameMonthPrevYear.total.ciro : null),
      compareCard("Geçen Yıl Aynı Dönem (YTD)", yearData.yonPlus.filter(m => m.month <= monthIndex).reduce((a,b)=>a+safe(b.total.ciro),0),
        prevYear ? prevYear.yonPlus.filter(m => m.month <= monthIndex).reduce((a,b)=>a+safe(b.total.ciro),0) : null),
    ];
  }
  if (state.year === "2026") {
    const current = yearData.overview.totalRevenue;
    const prevYear = DATA.years["2025"];
    const lastMonth = yearData.yonPlus.at(-1)?.month || 1;
    const lastCurrent = yearData.yonPlus.at(-1);
    const prevCurrent = yearData.yonPlus.at(-2);
    const prevSameMonth = prevYear.yonPlus.find(m => m.month === lastMonth);
    const ytdPrev = prevYear.yonPlus.filter(m => m.month <= lastMonth).reduce((a,b)=>a+safe(b.total.ciro),0);
    return [
      compareCard("Geçen Aya Göre", lastCurrent ? lastCurrent.total.ciro : null, prevCurrent ? prevCurrent.total.ciro : null),
      compareCard("Geçen Yıl Aynı Aya Göre", lastCurrent ? lastCurrent.total.ciro : null, prevSameMonth ? prevSameMonth.total.ciro : null),
      compareCard("Geçen Yıl Aynı Dönem (YTD)", current, ytdPrev),
    ];
  }
  return [
    compareCard("Geçen Aya Göre", null, null),
    compareCard("Geçen Yıl Aynı Aya Göre", null, null),
    compareCard("Geçen Yıl Aynı Dönem (YTD)", null, null),
  ];
}

function compareCard(title, current, previous) {
  let delta = null;
  let diff = null;
  if (current !== null && current !== undefined && previous !== null && previous !== undefined && previous !== 0) {
    diff = current - previous;
    delta = diff / previous;
  }
  const good = delta !== null && delta >= 0;
  return { title, current, previous, diff, delta, good };
}

function renderOverview() {
  const y = currentYearData();
  const selected = selectedMonthData();
  const base = selected ? {
    totalRevenue: safe(selected.total.ciro),
    totalCost: safe(selected.total.maliyet),
    grossProfit: safe(selected.total.kar),
    grossMargin: safe(selected.total.marj),
    totalExpense: 0,
    profitBeforeTax: safe(selected.total.kar),
    netProfit: safe(selected.total.kar),
    netMargin: safe(selected.total.marj),
  } : y.overview;

  const cards = [
    ["Toplam Ciro", money(base.totalRevenue)],
    ["Toplam Maliyet", money(base.totalCost)],
    ["Brüt Kar", money(base.grossProfit)],
    ["Brüt Kar Marjı", pct(base.grossMargin)],
    ["Toplam Gider", money(base.totalExpense)],
    ["Vergi Öncesi Kar", money(base.profitBeforeTax)],
    ["Net Kar", money(base.netProfit)],
    ["Net Kar Marjı", pct(base.netMargin)]
  ];
  q("#overviewCards").innerHTML = cards.map(([label,value]) => `
    <div class="card kpi"><div class="label">${label}</div><div class="value">${value}</div></div>
  `).join("");

  q("#compareCards").innerHTML = computeComparisons().map(c => {
    const status = c.delta === null ? "" : (c.good ? "good" : "bad");
    return `<div class="card kpi ${status}">
      <div class="label">${c.title}</div>
      <div class="value ${c.delta !== null ? "delta" : ""}">${c.delta === null ? "—" : (c.delta >= 0 ? "+" : "") + pct(c.delta)}</div>
      <div class="sub">${c.diff === null ? "Karşılaştırma verisi yok" : (c.diff >= 0 ? "+" : "") + money(c.diff)}</div>
    </div>`;
  }).join("");

  const months = y.yonPlus.filter(m => state.month === "all" || String(m.month) === state.month);
  q("#overviewMonthlyBody").innerHTML = months.map(m => `
    <tr>
      <td>${m.label}</td>
      <td>${money(m.total.ciro)}</td>
      <td>${money(m.total.maliyet)}</td>
      <td>${money(m.total.kar)}</td>
      <td>${pct(m.total.marj)}</td>
    </tr>`).join("");

  q("#overviewCategoryBody").innerHTML = y.categories.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${num(c.adet, c.name.includes("KAPLAMA") || c.name.includes("ÇARŞAF") || c.name.includes("DİĞER") ? 3 : 0)}</td>
      <td>${money(c.ciro)}</td>
      <td>${c.kar === null ? "—" : money(c.kar)}</td>
      <td>${c.marj === null ? "—" : pct(c.marj)}</td>
    </tr>`).join("");
}

function renderYONPlus() {
  const y = currentYearData();
  const months = y.yonPlus.filter(m => state.month === "all" || String(m.month) === state.month);
  q("#yonPlusGrid").innerHTML = months.map((m,idx) => {
    const cats = m.categories.length ? m.categories : [{name:"TOPLAM", ...m.total}];
    return `
    <div class="month-card">
      <div class="month-head ${colorClasses[idx % colorClasses.length]}">${m.label}</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Satışlar</th><th>S.Adet</th><th>S.Ciro</th><th>Maliyet</th><th>Kar</th><th>%</th></tr></thead>
          <tbody>
            ${cats.map(c => `
              <tr>
                <td>${c.name}</td>
                <td>${num(c.adet, c.name==="KAPLAMA"||c.name==="ÇARŞAF"||c.name==="DİĞER" ? 3 : 0)}</td>
                <td>${money(c.ciro)}</td>
                <td>${money(c.maliyet)}</td>
                <td>${money(c.kar)}</td>
                <td>${pct(c.marj)}</td>
              </tr>`).join("")}
            <tr>
              <td><strong>TOPLAM</strong></td>
              <td><strong>${num(m.total.adet, 3)}</strong></td>
              <td><strong>${money(m.total.ciro)}</strong></td>
              <td><strong>${money(m.total.maliyet)}</strong></td>
              <td><strong>${money(m.total.kar)}</strong></td>
              <td><strong>${pct(m.total.marj)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;
  }).join("");
}

function renderYONRapor() {
  const r = currentYearData().yonRapor;
  const sum = r.summary;
  q("#profitChain").innerHTML = [
    ["Toplam Satış Cirosu", money(sum.totalRevenue), "Tüm kategoriler"],
    ["Toplam Maliyet", money(sum.totalCost), "Hammadde + işçilik + GG + DG"],
    ["Brüt Kar", money(sum.grossProfit), "Satış − maliyet"],
    ["Brüt Kar Marjı", pct(sum.grossMargin), "Brüt kar / ciro"],
    ["Toplam Giderler", money(sum.totalExpense), "Maaş + kira + SGK + enerji"],
    ["Vergi Öncesi Kar", money(sum.profitBeforeTax), "Brüt kar − giderler"],
    ["Net Kar", money(sum.netProfit), "Vergi sonrası kar"],
    ["Net Kar Marjı", pct(sum.netMargin), "Net kar / ciro"]
  ].map(item => `<div class="metric-row"><div><strong>${item[0]}</strong><small>${item[2]}</small></div><div><strong>${item[1]}</strong></div></div>`).join("");

  q("#yonRaporCategoryBody").innerHTML = r.categories.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${num(c.adet, 3)}</td>
      <td>${money(c.ciro)}</td>
      <td>${pct(c.share)}</td>
    </tr>`).join("");

  q("#yonRaporCustomerBody").innerHTML = r.topCustomers.map(c => `
    <tr><td>${c.rank}</td><td>${c.name}</td><td>${money(c.revenue)}</td><td>${pct(c.share)}</td></tr>
  `).join("");
}

function renderCategoryProfit() {
  q("#categoryProfitBody").innerHTML = currentYearData().categories.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${num(c.adet, 3)}</td>
      <td>${money(c.ciro)}</td>
      <td>${c.maliyet === null ? "—" : money(c.maliyet)}</td>
      <td>${c.kar === null ? "—" : money(c.kar)}</td>
      <td>${c.marj === null ? "—" : pct(c.marj)}</td>
    </tr>`).join("");
}

function renderCustomers() {
  q("#customerBody").innerHTML = currentYearData().yonRapor.topCustomers.map(c => `
    <tr><td>${c.rank}</td><td>${c.name}</td><td>${money(c.revenue)}</td><td>${pct(c.share)}</td></tr>
  `).join("");
}

function monthMetric(row) {
  const months = state.year === "2025" ? row.months25 : row.months26;
  const idx = state.month === "all" ? 0 : Math.max(0, Number(state.month) - 1);
  return months[idx] || {};
}

function filteredMasterRows() {
  const yearKey = state.year === "2025" ? "totals25" : "totals26";
  return DATA.masterRows.filter(r => {
    const txt = `${r.code} ${r.name} ${r.category}`.toLowerCase();
    const searchOk = !state.masterSearch || txt.includes(state.masterSearch.toLowerCase());
    const catOk = state.masterCategory === "Tümü" || r.category === state.masterCategory;
    return searchOk && catOk;
  }).sort((a,b) => safe(b[yearKey].ciro) - safe(a[yearKey].ciro));
}

function renderMaster() {
  q("#glossaryBody").innerHTML = DATA.headerGlossary.map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("");
  const cats = [...new Set(DATA.masterRows.map(r => r.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
  const catSel = q("#masterCategory");
  if (!catSel.dataset.filled) {
    catSel.innerHTML = `<option>Tümü</option>${cats.map(c => `<option>${c}</option>`).join("")}`;
    catSel.dataset.filled = "1";
  }
  catSel.value = state.masterCategory;

  const rows = filteredMasterRows();
  const pageSize = Number(state.masterPageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  state.masterPage = Math.max(1, Math.min(state.masterPage, totalPages));
  const slice = rows.slice((state.masterPage - 1) * pageSize, state.masterPage * pageSize);

  q("#masterStats").textContent = `${rows.length.toLocaleString("tr-TR")} ürün • ${state.year} • ${state.month === "all" ? "Ocak görünümü" : monthLabels[Number(state.month)]}`;
  q("#masterBody").innerHTML = slice.map(r => {
    const totals = state.year === "2025" ? r.totals25 : r.totals26;
    const m = monthMetric(r);
    return `<tr>
      <td>${r.code}</td><td>${r.name}</td><td>${r.category}</td>
      <td>${num(totals.adet, 3)}</td><td>${money(totals.ciro)}</td><td>${money(totals.maliyet)}</td><td>${money(totals.kar)}</td><td>${pct(totals.marj)}</td>
      <td>${num(m.A, 3)}</td><td>${money(m.C)}</td><td>${money(m.TM)}</td><td>${money(m.KAR)}</td><td>${money(m.BM)}</td><td>${money(m.LG)}</td>
      <td>${money(m.KAP1)}</td><td>${money(m.KAP2)}</td><td>${money(m.TUT)}</td><td>${money(m.GG)}</td><td>${money(m.DG)}</td>
      <td>${r.recipe.MKOD ?? "—"}</td><td>${r.recipe.SKOD ?? "—"}</td><td>${r.recipe.KAP1KOD ?? "—"}</td><td>${r.recipe.KAP2KOD ?? "—"}</td><td>${r.recipe.TUKOD ?? "—"}</td>
    </tr>`;
  }).join("");
  q("#masterPageLabel").textContent = `Sayfa ${state.masterPage} / ${totalPages}`;
}

function filteredCostRows() {
  return DATA.costRows.filter(r => {
    const txt = `${r.WKOD} ${r.ÜRÜN} ${r.KALINLIK_BOY ?? ""} ${r.KATEGORİ} ${r.Currency}`.toLowerCase();
    const sOk = !state.costSearch || txt.includes(state.costSearch.toLowerCase());
    const cOk = state.costCurrency === "Tümü" || (r.Currency || "—") === state.costCurrency;
    return sOk && cOk;
  });
}

function renderCosts() {
  const currencySel = q("#costCurrency");
  if (!currencySel.dataset.filled) {
    const vals = [...new Set(DATA.costRows.map(r => r.Currency).filter(Boolean))];
    currencySel.innerHTML = `<option>Tümü</option>${vals.map(v => `<option>${v}</option>`).join("")}`;
    currencySel.dataset.filled = "1";
  }
  currencySel.value = state.costCurrency;
  const index = state.month === "all" ? 0 : Number(state.month) - 1;
  q("#costBody").innerHTML = filteredCostRows().slice(0,300).map(r => {
    const monthVal = state.year === "2025" ? r.months25[index] : r.months26[index];
    return `<tr>
      <td>${r.WKOD ?? "—"}</td><td>${formatCostProduct(r)}</td><td>${r.KATEGORİ ?? "—"}</td><td>${r.Currency ?? "—"}</td><td>${money(r.Base_Price)}</td><td>${money(monthVal)}</td>
    </tr>`;
  }).join("");
}

function renderExpenses() {
  const rows = currentYearData().expenseRows || DATA.expenseRows || [];
  q("#expenseBody").innerHTML = rows.map(r => `<tr>${r.map((v,idx)=>`<td>${idx===0 ? (v ?? "—") : money(v)}</td>`).join("")}</tr>`).join("");
}

function renderControl() {
  const checks = DATA.controls[state.year] || [];
  q("#controlList").innerHTML = checks.map(c => {
    const diff = safe(c.left) - safe(c.right);
    const pass = Math.abs(diff) < 1;
    return `<div class="control-item ${pass ? "pass" : "fail"}">
      <strong>${c.label}</strong>
      <div class="control-values">
        <span>Sol: ${money(c.left)}</span>
        <span>Sağ: ${money(c.right)}</span>
        <span>Fark: ${money(diff)}</span>
      </div>
    </div>`;
  }).join("");
}

async function workbookRows(file) {
  if (!window.XLSX) throw new Error("Excel okuyucu yüklenemedi. İnternet bağlantısını kontrol edin.");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheets = [];
  wb.SheetNames.forEach(name => {
    sheets.push({ name, rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "", raw: false }) });
  });
  return sheets;
}

async function parseSalesFile(file) {
  const sheets = await workbookRows(file);
  const parsed = [];
  sheets.forEach(sheet => {
    const headerIndex = sheet.rows.findIndex(row => {
      const joined = row.map(normalizeText).join("|");
      return joined.includes("FATURA TAR") && joined.includes("MALIN/HIZMETIN CINSI");
    });
    if (headerIndex < 0) return;
    const headers = sheet.rows[headerIndex].map(normalizeText);
    const findIdx = labels => headers.findIndex(h => labels.some(label => h.includes(label)));
    const idx = {
      date: findIdx(["FATURA TAR"]),
      no: findIdx(["FATURA NO"]),
      cari: findIdx(["CARI KODU"]),
      unvan: findIdx(["UNVANI"]),
      code: findIdx(["KOD"]),
      product: findIdx(["MALIN/HIZMETIN CINSI"]),
      qty: findIdx(["MIKTAR"]),
      unit: findIdx(["MALIN"]),
      price: findIdx(["FIYAT"]),
      amount: findIdx(["TUTAR"]),
      vat: findIdx(["KDV TUTARI"]),
      total: findIdx(["GENEL TOPLAM"])
    };
    const carry = { date: null, no: "", cari: "", unvan: "" };
    sheet.rows.slice(headerIndex + 1).forEach(row => {
      const product = row[idx.product] || "";
      const code = row[idx.code] || "";
      const normalizedRow = normalizeText(row.join(" "));
      if (!product && !code) return;
      if (normalizedRow.startsWith("---") || normalizedRow.includes("TOPLAM")) return;
      const nextDate = parseDateValue(row[idx.date]);
      if (nextDate) carry.date = nextDate;
      if (row[idx.no]) carry.no = String(row[idx.no]).trim();
      if (row[idx.cari]) carry.cari = String(row[idx.cari]).trim();
      if (row[idx.unvan]) carry.unvan = String(row[idx.unvan]).trim();
      const tutar = toNumber(row[idx.amount]);
      const miktar = toNumber(row[idx.qty]);
      if (!carry.date || (!tutar && !miktar)) return;
      const date = new Date(`${carry.date}T00:00:00`);
      parsed.push({
        sourceFile: file.name,
        tarih: carry.date,
        yil: String(date.getFullYear()),
        ay: date.getMonth() + 1,
        faturaNo: carry.no,
        cariKodu: carry.cari,
        unvan: carry.unvan,
        kod: String(code || "").trim(),
        urun: String(product || "").trim(),
        kategori: categoryFrom(code, product, row[idx.unit]),
        miktar,
        birim: String(row[idx.unit] || "").trim(),
        fiyat: toNumber(row[idx.price]),
        tutar,
        kdv: toNumber(row[idx.vat]),
        genelToplam: toNumber(row[idx.total])
      });
    });
  });
  return parsed;
}

async function parseExpenseFile(file) {
  const sheets = await workbookRows(file);
  const parsed = [];
  const year = inferYear(file.name);
  sheets.forEach(sheet => {
    const headerIndex = sheet.rows.findIndex(row => row.map(monthFromHeader).filter(Boolean).length >= 3);
    if (headerIndex < 0) return;
    const monthCols = sheet.rows[headerIndex].map((cell, idx) => ({ idx, month: monthFromHeader(cell) })).filter(c => c.month);
    sheet.rows.slice(headerIndex + 1).forEach(row => {
      const category = String(row[0] || "").trim();
      const n = normalizeText(category);
      if (!category || n.includes("TOPLAM")) return;
      monthCols.forEach(col => {
        const amount = toNumber(row[col.idx]);
        if (!amount) return;
        parsed.push({ sourceFile: file.name, year, month: col.month, kategori: category, tutar: amount });
      });
    });
  });
  return parsed;
}

function dedupeRows(rows, keyFn) {
  const seen = new Set();
  return rows.filter(row => {
    const key = keyFn(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function refreshDataFromImports(imports) {
  DATA = cloneData(BASE_DATA);
  applyImportsToData(DATA, imports);
  populateMonthSelect();
}

function renderImport() {
  const body = q("#importPreviewBody");
  if (!body) return;
  const imports = loadImports();
  const grouped = new Map();
  imports.salesRows.forEach(r => {
    const key = `${r.yil}|${r.ay}|${r.kategori}`;
    const item = grouped.get(key) || { year: r.yil, month: r.ay, category: r.kategori, count: 0, adet: 0, ciro: 0, gider: 0 };
    item.count += 1; item.adet += safe(r.miktar); item.ciro += safe(r.tutar);
    grouped.set(key, item);
  });
  imports.expenseRows.forEach(r => {
    const key = `${r.year}|${r.month}|GİDER`;
    const item = grouped.get(key) || { year: r.year, month: r.month, category: "GİDER", count: 0, adet: 0, ciro: 0, gider: 0 };
    item.gider += safe(r.tutar);
    grouped.set(key, item);
  });
  const rows = [...grouped.values()].sort((a, b) => String(a.year).localeCompare(String(b.year)) || a.month - b.month || a.category.localeCompare(b.category, "tr"));
  body.innerHTML = rows.map(r => `
    <tr><td>${r.year}</td><td>${monthLabels[r.month] || r.month}</td><td>${r.category}</td><td>${num(r.count)}</td><td>${num(r.adet, 3)}</td><td>${money(r.ciro)}</td><td>${money(r.gider)}</td></tr>
  `).join("") || `<tr><td colspan="7">Henüz içe aktarılan dosya yok.</td></tr>`;
  q("#importSummary").innerHTML = `
    <span class="summary-pill">${num(imports.salesRows.length)} satış satırı</span>
    <span class="summary-pill">${num(imports.expenseRows.length)} gider satırı</span>
    <span class="summary-pill">${num(new Set(imports.salesRows.map(r => r.faturaNo).filter(Boolean)).size)} fatura</span>
  `;
  q("#importLog").innerHTML = state.importLog.map(item => `<div>${item}</div>`).join("") || "Hazır.";
}

async function processImports() {
  const salesFiles = [...(q("#salesFiles")?.files || [])];
  const expenseFiles = [...(q("#expenseFiles")?.files || [])];
  if (!salesFiles.length && !expenseFiles.length) {
    state.importLog.unshift("Dosya seçilmedi.");
    renderImport();
    return;
  }
  const imports = loadImports();
  let addedSales = 0;
  let addedExpenses = 0;
  for (const file of salesFiles) {
    const rows = await parseSalesFile(file);
    imports.salesRows.push(...rows);
    addedSales += rows.length;
    state.importLog.unshift(`${file.name}: ${num(rows.length)} satış satırı okundu.`);
  }
  for (const file of expenseFiles) {
    const rows = await parseExpenseFile(file);
    imports.expenseRows.push(...rows);
    addedExpenses += rows.length;
    state.importLog.unshift(`${file.name}: ${num(rows.length)} gider satırı okundu.`);
  }
  imports.salesRows = dedupeRows(imports.salesRows, r => `${r.tarih}|${r.faturaNo}|${r.cariKodu}|${r.kod}|${r.urun}|${r.miktar}|${r.tutar}`);
  imports.expenseRows = dedupeRows(imports.expenseRows, r => `${r.year}|${r.month}|${r.kategori}|${r.tutar}|${r.sourceFile}`);
  saveImports(imports);
  refreshDataFromImports(imports);
  const latestYear = [...new Set(imports.salesRows.map(r => r.yil).concat(imports.expenseRows.map(r => String(r.year))))].sort().pop();
  if (latestYear) state.year = latestYear;
  state.month = "all";
  populateMonthSelect();
  state.importLog.unshift(`Tamamlandı: ${num(addedSales)} satış, ${num(addedExpenses)} gider satırı işlendi.`);
  render();
}

function exportImports() {
  const blob = new Blob([JSON.stringify(loadImports(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rapor-merkezi-iceri-aktarim-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function clearImports() {
  localStorage.removeItem(IMPORT_STORAGE_KEY);
  DATA = cloneData(BASE_DATA);
  state.importLog.unshift("Yerel içe aktarım verisi temizlendi.");
  populateMonthSelect();
  render();
}

function updateHeader() {
  const meta = {
    overview:["Genel Bakış","Yıl geçişli ve karşılaştırmalı özet"],
    yonplus:["YÖN_PLUS","Aylık bloklar ve kategori performansı"],
    yonrapor:["YÖN_RAPOR","Yıllık özet, kar zinciri ve üst müşteri listesi"],
    categories:["Kategori Karlılığı","Kategori bazlı ciro, maliyet ve kâr"],
    customers:["Müşteri Analizi","Yıllık müşteri ciro kırılımı"],
    master:["MASTER_ERP","Tekil ürün maliyetleme ve reçete alanları"],
    costs:["Maliyetler","WKOD bazlı maliyet tablosu"],
    expenses:["Giderler","2025 genel gider tablosu"],
    import:["İçe Aktar","Haftalık satış ve gider Excel dosyalarını rapora işle"],
    control:["Kontrol","Toplamlar arası doğrulama ekranı"]
  }[state.view];
  q("#pageTitle").textContent = meta[0];
  q("#pageSubtitle").textContent = meta[1];
  q("#lastUpdate").textContent = `Son versiyon: ${formatVersionStamp(DATA.meta)}`;
}

function render() {
  renderYearNotice();
  updateHeader();
  renderOverview();
  renderYONPlus();
  renderYONRapor();
  renderCategoryProfit();
  renderCustomers();
  renderMaster();
  renderCosts();
  renderExpenses();
  renderControl();
  renderImport();
  qa(".view").forEach(v => v.classList.remove("active"));
  q(`#${state.view}View`).classList.add("active");
  qa(".menu-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === state.view));
}

function bind() {
  qa(".menu-item").forEach(btn => btn.addEventListener("click", () => { state.view = btn.dataset.view; render(); }));
  const yearSelect = q("#yearSelect");
  yearSelect.innerHTML = Object.keys(DATA.years).map(y => `<option value="${y}">${y}</option>`).join("");
  yearSelect.value = state.year;
  yearSelect.addEventListener("change", e => { state.year = e.target.value; state.month = "all"; state.masterPage = 1; populateMonthSelect(); render(); });

  q("#monthSelect").addEventListener("change", e => { state.month = e.target.value; state.masterPage = 1; render(); });

  q("#masterSearch").addEventListener("input", e => { state.masterSearch = e.target.value; state.masterPage = 1; renderMaster(); });
  q("#masterCategory").addEventListener("change", e => { state.masterCategory = e.target.value; state.masterPage = 1; renderMaster(); });
  q("#masterPageSize").addEventListener("change", e => { state.masterPageSize = Number(e.target.value); state.masterPage = 1; renderMaster(); });
  q("#masterPrev").addEventListener("click", () => { state.masterPage = Math.max(1, state.masterPage - 1); renderMaster(); });
  q("#masterNext").addEventListener("click", () => { state.masterPage += 1; renderMaster(); });

  q("#costSearch").addEventListener("input", e => { state.costSearch = e.target.value; renderCosts(); });
  q("#costCurrency").addEventListener("change", e => { state.costCurrency = e.target.value; renderCosts(); });

  q("#importProcess")?.addEventListener("click", () => {
    processImports().catch(error => {
      state.importLog.unshift(`Hata: ${error.message}`);
      renderImport();
    });
  });
  q("#importExport")?.addEventListener("click", exportImports);
  q("#importClear")?.addEventListener("click", clearImports);
}

function populateMonthSelect() {
  const monthSelect = q("#monthSelect");
  monthSelect.innerHTML = `<option value="all">Tümü</option>` + availableMonths().map(m => `<option value="${m.value}">${m.label}</option>`).join("");
  monthSelect.value = state.month;
}

populateMonthSelect();
bind();
render();
