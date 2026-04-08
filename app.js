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
      lastCollection: "03.04.2026",
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
        { date: "01.04.2026", type: "Tahakkuk", desc: "Nisan muhasebe ücreti", debit: 6000, credit: 0, balance: 30400 }
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
      lastCollection: "15.03.2026",
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
        { date: "01.03.2026", type: "Tahakkuk", desc: "Mart muhasebe ücreti", debit: 12000, credit: 0, balance: 32500 }
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
      lastCollection: "28.03.2026",
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
  ],
  bankRows: []
};

const root = document.querySelector(".main");
const menuItems = document.querySelectorAll(".menu-item");

function money(v) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(v);
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
          <textarea id="quickAiText" rows="5" style="width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:12px;font:inherit;" placeholder="Örnek: Beta Mobilya 25000 ödeme sözü verdi cuma"></textarea>
          <button id="parseBtn" class="primary-btn" style="margin-top:12px;">Onaya Düşür</button>
          <p id="parseResult" class="quick-result"></p>
        </div>
      </div>
    </section>
  `;

  const parseBtn = document.getElementById("parseBtn");
  if (parseBtn) {
    parseBtn.addEventListener("click", parseQuickText);
  }
}

function renderClients() {
  root.innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">MÜKELLEFLER</p>
        <h1>Cari Listesi</h1>
        <p class="hero-sub">Mükellefleri ara, bakiyeleri gör, detaya gir.</p>
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
            <p>Bakiye: ${money(c.balance)}</p>
            <p>Son Tahsilat: ${c.lastCollection}</p>
            <button class="action-btn" onclick="openClient(${c.id})">Detay Gör</button>
          </div>
        `).join("")}
      </div>
    </section>
  `;
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
        <p>Cari Bakiye</p>
        <h3>${money(c.balance)}</h3>
        <span class="down">Güncel bakiye</span>
      </div>
      <div class="kpi-card">
        <p>Son Tahsilat</p>
        <h3>${c.lastCollection}</h3>
        <span class="up">Son işlem tarihi</span>
      </div>
      <div class="kpi-card">
        <p>Ödeme Sözü</p>
        <h3>${c.promises.length}</h3>
        <span class="down">Açık kayıt</span>
      </div>
      <div class="kpi-card">
        <p>Gizli Not</p>
        <h3>${c.notes.length}</h3>
        <span class="up">Ekstrede görünmez</span>
      </div>
    </section>

    <section class="content-grid">
      <div class="panel">
        <div class="panel-head"><h2>Cari Hareketler</h2></div>
        ${c.movements.map(m => `
          <div class="list-item">
            <div>
              <h4>${m.type}</h4>
              <p>${m.date} · ${m.desc}</p>
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

      <div class="panel quick-panel">
        <div class="panel-head"><h2>Geri</h2></div>
        <button class="primary-btn" onclick="renderClients()">Listeye Dön</button>
      </div>
    </section>
  `;
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
        <input type="file" id="excelFile" class="action-btn" />
        <p class="quick-result">Şimdilik dosya seçimi demo. Sonraki sürümde satırlar ayrıştırılacak.</p>
      </div>

      <div class="panel">
        <div class="panel-head"><h2>Kopyala Yapıştır</h2></div>
        <textarea id="bankPaste" rows="6" style="width:100%;border:1px solid #cbd5e1;border-radius:14px;padding:12px;font:inherit;" placeholder="Örnek: FAST: Beta Mobilya 25000"></textarea>
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
  const found = state.clients.find(c => lower.includes(c.name.toLowerCase().split(" ")[0]));
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

menuItems.forEach(item => {
  const label = item.textContent.trim().toLowerCase();
  if (label.includes("dashboard")) item.dataset.page = "dashboard";
  if (label.includes("mükellef")) item.dataset.page = "clients";
  if (label.includes("tahsilat")) item.dataset.page = "banking";
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    setActiveMenu(page);
    if (page === "dashboard") renderDashboard();
    if (page === "clients") renderClients();
    if (page === "banking") renderBanking();
  });
});

window.openClient = openClient;
window.renderClients = renderClients;

renderDashboard();
