const state = {
  clients: [
    {
      id: 1,
      name: "Ercan Alaylı Ltd. Şti.",
      phone: "0532 000 00 00",
      email: "info@ornek.com",
      taxNo: "1234567890",
      city: "Bursa",
      balance: 18400,
      lastCollectionDate: "03.04.2026",
      lastCollectionAmount: 12000,
      annualFee2026: 6000,
      status: "Aktif",
      risk: "Düşük",
      notes: [
        { text: "Ödeme düzenli, ayın ilk haftası aranır.", type: "genel", date: "2026-04-01" }
      ],
      promises: [
        { amount: 12000, date: "2026-04-12", status: "Bekliyor", note: "Hafta içi ödeme sözü verdi." }
      ],
      movements: [
        { date: "03.04.2026", type: "Tahsilat", desc: "Mart muhasebe ücreti", debit: 0, credit: 12000, balance: 18400 },
        { date: "01.04.2026", type: "Tahakkuk", desc: "NİSAN 2026", service: "2026 yılı muhasebe ücreti", debit: 6000, credit: 0, balance: 30400 }
      ]
    },
    {
      id: 2,
      name: "Beta Mobilya",
      phone: "0533 000 00 00",
      email: "beta@ornek.com",
      taxNo: "2222222222",
      city: "İnegöl",
      balance: 26500,
      lastCollectionDate: "15.03.2026",
      lastCollectionAmount: 6000,
      annualFee2026: 12000,
      status: "Gecikmiş",
      risk: "Yüksek",
      notes: [
        { text: "Ödeme sözü veriyor ama geciktiriyor.", type: "risk", date: "2026-04-05" }
      ],
      promises: [
        { amount: 25000, date: "2026-04-11", status: "Bekliyor", note: "Cuma ödeme sözü." }
      ],
      movements: [
        { date: "15.03.2026", type: "Tahsilat", desc: "Kısmi tahsilat", debit: 0, credit: 6000, balance: 26500 },
        { date: "01.04.2026", type: "Tahakkuk", desc: "NİSAN 2026", service: "2026 yılı muhasebe ücreti", debit: 12000, credit: 0, balance: 38500 }
      ]
    },
    {
      id: 3,
      name: "Akdeniz Gıda",
      phone: "0534 000 00 00",
      email: "akdeniz@ornek.com",
      taxNo: "3333333333",
      city: "Bursa",
      balance: 9750,
      lastCollectionDate: "28.03.2026",
      lastCollectionAmount: 9750,
      annualFee2026: 9750,
      status: "Aktif",
      risk: "Orta",
      notes: [],
      promises: [],
      movements: [
        { date: "28.03.2026", type: "Tahsilat", desc: "Banka tahsilatı", debit: 0, credit: 9750, balance: 9750 }
      ]
    }
  ],
  approvals: [
    { id: 1, raw: "Ercan Alaylı 60000 muhasebe ücreti", client: "Ercan Alaylı Ltd. Şti.", type: "Tahsilat", amount: 60000, confidence: 92, status: "Onay Bekliyor" },
    { id: 2, raw: "Beta Mobilya 25000 ödeme sözü verdi cuma", client: "Beta Mobilya", type: "Ödeme Sözü", amount: 25000, confidence: 89, status: "Onay Bekliyor" }
  ]
};

const root = document.querySelector(".main");
const menuItems = document.querySelectorAll(".menu-item");

function money(v) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(v || 0);
}

function monthLabelTR() {
  const now = new Date();
  const months = [
    "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN",
    "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK"
  ];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function currentYearServiceText() {
  return `${new Date().getFullYear()} yılı muhasebe ücreti`;
}

function ensureMonthlyAccruals() {
  const label = monthLabelTR();
  const service = currentYearServiceText();
  const today = new Date();
  const firstDay = `01.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;

  state.clients.forEach(client => {
    const exists = client.movements.some(
      m => m.type === "Tahakkuk" && m.desc === label
    );
    if (!exists && client.annualFee2026 > 0) {
      const newBalance = client.balance + client.annualFee2026;
      client.balance = newBalance;
      client.movements.unshift({
        date: firstDay,
        type: "Tahakkuk",
        desc: label,
        service,
        debit: client.annualFee2026,
        credit: 0,
        balance: newBalance
      });
    }
  });
}

function exportStatementCSV(client) {
  const rows = [
    ["Tarih", "İşlem Tipi", "Açıklama", "Hizmet Bedeli", "Borç", "Alacak", "Bakiye"],
    ...client.movements.map(m => [
      m.date,
      m.type,
      m.desc || "",
      m.service || "",
      m.debit || 0,
      m.credit || 0,
      m.balance || 0
    ])
  ];

  const csv = rows
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${client.name}-Cari-Ekstre.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printStatement(client) {
  const win = window.open("", "_blank");
  if (!win) return;

  const rows = client.movements.map(m => `
    <tr>
      <td>${m.date}</td>
      <td>${m.type}</td>
      <td>${m.desc || ""}</td>
      <td>${m.service || ""}</td>
      <td>${money(m.debit)}</td>
      <td>${money(m.credit)}</td>
      <td>${money(m.balance)}</td>
    </tr>
  `).join("");

  win.document.write(`
    <html>
    <head>
      <title>${client.name} Cari Ekstre</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
        h1 { margin-bottom: 6px; }
        p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f3f4f6; }
      </style>
    </head>
    <body>
      <h1>${client.name}</h1>
      <p>Telefon: ${client.phone}</p>
      <p>Vergi No: ${client.taxNo}</p>
      <p>Son Tahsilat Tarihi: ${client.lastCollectionDate || "-"}</p>
      <p>Son Tahsilat Tutarı: ${money(client.lastCollectionAmount || 0)}</p>
      <p>Güncel Bakiye: ${money(client.balance)}</p>
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>İşlem Tipi</th>
            <th>Açıklama</th>
            <th>Hizmet Bedeli</th>
            <th>Borç</th>
            <th>Alacak</th>
            <th>Bakiye</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

function renderDashboard() {
  const totalBalance = state.clients.reduce((a, b) => a + b.balance, 0);
  const promiseCount = state.clients.reduce((a, b) => a + b.promises.filter(p => p.status === "Bekliyor").length, 0);

  root.innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">ALKAM MALİ MÜŞAVİRLİK</p>
        <h1>Yönetim Paneli</h1>
        <p class="hero-sub">Mükellef, tahsilat ve operasyon takibini tek ekranda yönet.</p>
      </div>
      <div class="hero-badges">
        <span class="badge warning">${promiseCount} ödeme sözü bekliyor</span>
        <span class="badge danger">${state.approvals.length} onay bekliyor</span>
        <span class="badge success">${state.clients.length} aktif cari</span>
      </div>
    </section>

    <section class="kpi-grid">
      <div class="kpi-card">
        <p>Toplam Alacak</p>
        <h3>${money(totalBalance)}</h3>
        <span class="up">Cari bakiyelerin toplamı</span>
      </div>
      <div class="kpi-card">
        <p>Onay Bekleyen</p>
        <h3>${state.approvals.length}</h3>
        <span class="down">AI öneri kuyruğu</span>
      </div>
      <div class="kpi-card">
        <p>Ödeme Sözü</p>
        <h3>${promiseCount}</h3>
        <span class="down">Takip edilmesi gerekenler</span>
      </div>
      <div class="kpi-card">
        <p>Mükellef</p>
        <h3>${state.clients.length}</h3>
        <span class="up">Aktif kayıt</span>
      </div>
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-head"><h2>Öne Çıkan Cariler</h2></div>
        ${state.clients.map(c => `
          <div class="list-item">
            <div>
              <h4>${c.name}</h4>
              <p>${c.city} · ${c.phone}</p>
            </div>
            <div class="list-right">
              <strong>${money(c.balance)}</strong>
              <button class="action-btn" onclick="openClient(${c.id})">Detay Gör</button>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Hızlı AI Giriş</h2></div>
        <div class="task-item" style="display:block">
          <textarea id="quickAiText" rows="5" placeholder="Örnek: Beta Mobilya 25000 ödeme sözü verdi cuma"></textarea>
          <button id="parseBtn" class="primary-btn" style="margin-top:12px;">Onaya Düşür</button>
          <p id="parseResult" class="quick-result"></p>
        </div>
      </div>
    </section>
  `;

  const parseBtn = document.getElementById("parseBtn");
  if (parseBtn) parseBtn.addEventListener("click", parseQuickText);
}

function renderClients() {
  root.innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">MÜKELLEFLER</p>
        <h1>Cari Listesi</h1>
        <p class="hero-sub">Mükellefleri ara, son tahsilatı ve son bakiyeyi gör, detaya gir.</p>
      </div>
    </section>

    <section class="panel" style="margin-top:24px;">
      <div class="panel-head"><h2>Tüm Mükellefler</h2></div>
      <div class="client-cards">
        ${state.clients.map(c => `
          <div class="client-card">
            <h4>${c.name}</h4>
            <p>Telefon: ${c.phone}</p>
            <p>Vergi No: ${c.taxNo}</p>
            <p>Son Tahsilat Tarihi: ${c.lastCollectionDate || "-"}</p>
            <p>Son Tahsilat Tutarı: ${money(c.lastCollectionAmount || 0)}</p>
            <p>Son Bakiye: ${money(c.balance)}</p>
            <button class="action-btn" onclick="openClient(${c.id})">Detay Gör</button>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderReports() {
  root.innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">RAPORLAR VE TAHAKKUK</p>
        <h1>Otomatik Tahakkuk Yönetimi</h1>
        <p class="hero-sub">Ayın ilk günü için tahakkuk mantığı. Açıklama: ${monthLabelTR()} · Hizmet bedeli: ${currentYearServiceText()}</p>
      </div>
    </section>

    <section class="panel" style="margin-top:24px;">
      <div class="panel-head"><h2>Bu Ay Tahakkuk İşlemi</h2></div>
      <button id="createAccrualBtn" class="primary-btn">Bu Ay Tahakkuklarını Oluştur</button>
      <p id="accrualResult" class="quick-result"></p>
    </section>

    <section class="panel" style="margin-top:24px;">
      <div class="panel-head"><h2>Mükellef Yıllık Tutarları</h2></div>
      ${state.clients.map(c => `
        <div class="list-item">
          <div>
            <h4>${c.name}</h4>
            <p>2026 yıllık muhasebe ücreti: ${money(c.annualFee2026)}</p>
          </div>
          <div class="list-right">
            <button class="action-btn" onclick="openClient(${c.id})">Cariyi Aç</button>
          </div>
        </div>
      `).join("")}
    </section>
  `;

  const btn = document.getElementById("createAccrualBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      ensureMonthlyAccruals();
      document.getElementById("accrualResult").textContent =
        `${monthLabelTR()} tahakkukları oluşturuldu.`;
    });
  }
}

function openClient(id) {
  const c = state.clients.find(x => x.id === id);
  if (!c) return;

  root.innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">MÜKELLEF DETAY</p>
        <h1>${c.name}</h1>
        <p class="hero-sub">${c.city} · ${c.phone} · ${c.email}</p>
      </div>
      <div class="hero-badges">
        <span class="badge ${c.risk === "Yüksek" ? "danger" : c.risk === "Orta" ? "warning" : "success"}">Risk: ${c.risk}</span>
        <span class="badge neutral">Durum: ${c.status}</span>
      </div>
    </section>

    <section class="kpi-grid">
      <div class="kpi-card">
        <p>Son Bakiye</p>
        <h3>${money(c.balance)}</h3>
        <span class="down">Güncel bakiye</span>
      </div>
      <div class="kpi-card">
        <p>Son Tahsilat Tarihi</p>
        <h3>${c.lastCollectionDate || "-"}</h3>
        <span class="up">Son tahsilat</span>
      </div>
      <div class="kpi-card">
        <p>Son Tahsilat Tutarı</p>
        <h3>${money(c.lastCollectionAmount || 0)}</h3>
        <span class="up">Son tahsil edilen</span>
      </div>
      <div class="kpi-card">
        <p>2026 Ücreti</p>
        <h3>${money(c.annualFee2026)}</h3>
        <span class="up">Yıllık hizmet bedeli</span>
      </div>
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-head">
          <h2>Cari Hareketler</h2>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="action-btn" onclick="downloadExcelStatement(${c.id})">Excel Ekstre</button>
            <button class="action-btn" onclick="downloadPdfStatement(${c.id})">PDF Ekstre</button>
          </div>
        </div>
        ${c.movements.map(m => `
          <div class="list-item">
            <div>
              <h4>${m.type}</h4>
              <p>${m.date} · ${m.desc || ""}</p>
              <p>${m.service || ""}</p>
            </div>
            <div class="list-right">
              <strong>Bakiye: ${money(m.balance)}</strong>
              <span class="tag neutral">B: ${money(m.debit)} / A: ${money(m.credit)}</span>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Gizli Notlar</h2></div>
        ${(c.notes.length ? c.notes : [{ text: "Henüz gizli not yok.", type: "genel", date: "-" }]).map(n => `
          <div class="task-item">
            <span>${n.date} · ${n.text}</span>
            <span class="tag warning">${n.type}</span>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="bottom-grid">
      <div class="panel">
        <div class="panel-head"><h2>Ödeme Sözleri</h2></div>
        ${(c.promises.length ? c.promises : [{ amount: 0, date: "-", status: "Kayıt yok", note: "-" }]).map(p => `
          <div class="list-item">
            <div>
              <h4>${money(p.amount)}</h4>
              <p>${p.date} · ${p.note}</p>
            </div>
            <div class="list-right">
              <span class="tag ${p.status === "Bekliyor" ? "warning" : "success"}">${p.status}</span>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Tutar Tanımı</h2></div>
        <label style="display:block;margin-bottom:8px;">2026 yılı muhasebe ücreti</label>
        <input id="annualFeeInput" type="text" value="${c.annualFee2026}" />
        <button id="saveFeeBtn" class="primary-btn" style="margin-top:12px;">Kaydet</button>
        <p id="saveFeeResult" class="quick-result"></p>
        <button class="action-btn" onclick="renderClients()">Listeye Dön</button>
      </div>
    </section>
  `;

  const saveBtn = document.getElementById("saveFeeBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const val = Number(document.getElementById("annualFeeInput").value.replace(/\D/g, ""));
      c.annualFee2026 = val || 0;
      document.getElementById("saveFeeResult").textContent = "Yıllık hizmet bedeli kaydedildi.";
    });
  }
}

function renderBanking() {
  root.innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">BANKA HAREKETLERİ</p>
        <h1>Excel + Kopyala Yapıştır + Ses</h1>
        <p class="hero-sub">Banka hareketlerini yükle, AI öneri oluştursun, sen onayla.</p>
      </div>
    </section>

    <section class="content-grid" style="margin-top:24px;">
      <div class="panel">
        <div class="panel-head"><h2>Excel Yükleme</h2></div>
        <input type="file" id="excelFile" />
        <p class="quick-result">Demo alanı hazır. Sonraki aşamada gerçek ekstre import bağlanacak.</p>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Kopyala Yapıştır</h2></div>
        <textarea id="bankPaste" rows="6" placeholder="Örnek: FAST: Beta Mobilya 25000"></textarea>
        <button id="bankParseBtn" class="primary-btn" style="margin-top:12px;">AI ile Yoruma Gönder</button>
        <p id="bankParseResult" class="quick-result"></p>
      </div>
    </section>

    <section class="panel" style="margin-top:24px;">
      <div class="panel-head"><h2>Onay Kuyruğu</h2></div>
      ${state.approvals.map(a => `
        <div class="list-item">
          <div>
            <h4>${a.client}</h4>
            <p>${a.raw}</p>
          </div>
          <div class="list-right">
            <strong>${money(a.amount)}</strong>
            <span class="tag ${a.type === "Tahsilat" ? "success" : "warning"}">${a.type} · %${a.confidence}</span>
          </div>
        </div>
      `).join("")}
    </section>
  `;

  const bankParseBtn = document.getElementById("bankParseBtn");
  if (bankParseBtn) {
    bankParseBtn.addEventListener("click", () => {
      const val = document.getElementById("bankPaste").value.trim();
      const result = document.getElementById("bankParseResult");
      if (!val) {
        result.textContent = "Metin gir.";
        return;
      }
      state.approvals.unshift({
        id: Date.now(),
        raw: val,
        client: guessClient(val),
        type: guessType(val),
        amount: guessAmount(val),
        confidence: 84,
        status: "Onay Bekliyor"
      });
      result.textContent = "İşlem onay kuyruğuna düştü.";
      renderBanking();
    });
  }
}

function parseQuickText() {
  const txt = document.getElementById("quickAiText").value.trim();
  const result = document.getElementById("parseResult");
  if (!txt) {
    result.textContent = "Metin gir.";
    return;
  }
  const item = {
    id: Date.now(),
    raw: txt,
    client: guessClient(txt),
    type: guessType(txt),
    amount: guessAmount(txt),
    confidence: 88,
    status: "Onay Bekliyor"
  };
  state.approvals.unshift(item);
  result.textContent = `${item.client} için ${item.type} önerisi kuyruğa eklendi.`;
}

function guessClient(text) {
  const lower = text.toLowerCase();
  const found = state.clients.find(c => {
    const first = c.name.toLowerCase().split(" ")[0];
    return lower.includes(first);
  });
  return found ? found.name : "Belirsiz Cari";
}

function guessType(text) {
  const lower = text.toLowerCase();
  if (lower.includes("ödeme sözü")) return "Ödeme Sözü";
  if (lower.includes("ödeme")) return "Ödeme";
  if (lower.includes("gider")) return "Gider";
  if (lower.includes("tahakkuk")) return "Tahakkuk";
  return "Tahsilat";
}

function guessAmount(text) {
  const m = text.replace(/\./g, "").match(/(\d{3,})/);
  return m ? Number(m[1]) : 0;
}

function setActiveMenu(name) {
  menuItems.forEach(i => i.classList.remove("active"));
  const target = [...menuItems].find(i => i.dataset.page === name);
  if (target) target.classList.add("active");
}

function downloadExcelStatement(id) {
  const client = state.clients.find(x => x.id === id);
  if (client) exportStatementCSV(client);
}

function downloadPdfStatement(id) {
  const client = state.clients.find(x => x.id === id);
  if (client) printStatement(client);
}

menuItems.forEach(item => {
  const label = item.textContent.trim().toLowerCase();
  if (label.includes("dashboard")) item.dataset.page = "dashboard";
  if (label.includes("mükellef")) item.dataset.page = "clients";
  if (label.includes("tahsilat")) item.dataset.page = "banking";
  if (label.includes("rapor")) item.dataset.page = "reports";

  item.addEventListener("click", (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    setActiveMenu(page);
    if (page === "dashboard") renderDashboard();
    if (page === "clients") renderClients();
    if (page === "banking") renderBanking();
    if (page === "reports") renderReports();
  });
});

window.openClient = openClient;
window.renderClients = renderClients;
window.downloadExcelStatement = downloadExcelStatement;
window.downloadPdfStatement = downloadPdfStatement;

ensureMonthlyAccruals();
renderDashboard();
