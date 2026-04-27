/* ALKAM HARD DEDUPE V4 - GLOBAL DEFTER / LOG TUTARLILIK KATMANI */
(function () {
  const V4 = {
    ledgerKey: "alkam_local_ledger_v1",
    activeFlag: "ALKAM_HARD_DEDUPE_V4_ACTIVE",
    timer: null
  };

  window[V4.activeFlag] = true;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const val = JSON.parse(raw);
      return val == null ? fallback : val;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function ledger() {
    const rows = readJson(V4.ledgerKey, []);
    return Array.isArray(rows) ? rows : [];
  }

  function saveLedger(rows) {
    writeJson(V4.ledgerKey, Array.isArray(rows) ? rows : []);
  }

  function rowId(row) {
    return String(row?.id || row?.txn_id || row?.operation_no || row?.ref_no || "");
  }

  function dateOf(row) {
    return String(row?.line_date || row?.entry_date || row?.date || row?.created_at || "").slice(0, 10);
  }

  function ymOf(row) {
    return dateOf(row).slice(0, 7);
  }

  function nrm(v) {
    return String(v || "")
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function isTahsilat(row) {
    const text = String((row?.movement_type || "") + " " + (row?.description || row?.content_summary || "")).toLocaleLowerCase("tr-TR");
    return text.includes("tahsilat") || Number(row?.credit || 0) > 0;
  }

  function isTahakkuk(row) {
    const text = String((row?.movement_type || "") + " " + (row?.description || row?.content_summary || "")).toLocaleLowerCase("tr-TR");
    return !isTahsilat(row) && (
      text.includes("tahakkuk") ||
      text.includes("muhasebe") ||
      text.includes("satış faturası") ||
      text.includes("satis faturasi") ||
      Number(row?.debit || 0) > 0
    );
  }

  function isContract(row) {
    return String(row?.source_module || "") === "manual_contract_2026" || rowId(row).startsWith("MC2026_");
  }

  function movementType(row) {
    if (isTahsilat(row)) return "Tahsilat";
    if (isTahakkuk(row)) return "Tahakkuk";
    return String(row?.movement_type || row?.type || "İşlem");
  }

  function sourceLabel(row) {
    const sm = String(row?.source_module || "");
    const mt = String(row?.movement_type || "");
    if (sm === "manual_contract_2026" || rowId(row).startsWith("MC2026_")) return "2026 Sözleşme Tahakkuku";
    if (sm.includes("bank") || sm.includes("banka")) return "Banka/Tahsilat";
    if (sm.includes("manual") && mt.toLocaleLowerCase("tr-TR").includes("tahsilat")) return "Manuel Tahsilat";
    if (sm.includes("manual") && mt.toLocaleLowerCase("tr-TR").includes("tahakkuk")) return "Manuel Tahakkuk";
    if (sm.includes("correction") || sm.includes("duzelt") || sm.includes("düzelt")) return "Düzeltme";
    if (sm.includes("auto") || sm.includes("otomatik")) return "Otomatik";
    if (sm.includes("ana") || sm.includes("supabase")) return "Ana Veri";
    return row?.source_label || row?.source || "Ana Veri";
  }

  function money(v) {
    const n = Number(v || 0);
    return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL";
  }

  function html(v) {
    return String(v ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function ensureCaches() {
    if (!window.__liveCaches || typeof window.__liveCaches !== "object") window.__liveCaches = {};
    if (!Array.isArray(window.__liveCaches.account_ops)) window.__liveCaches.account_ops = [];
    if (!Array.isArray(window.operationalLedger)) window.operationalLedger = [];
    return window.__liveCaches;
  }

  function upsertArray(arr, row) {
    if (!Array.isArray(arr) || !row) return false;
    const id = rowId(row);
    if (id && arr.some(x => rowId(x) === id)) return false;
    arr.unshift(row);
    return true;
  }

  function mergeLedgerToRuntime() {
    const caches = ensureCaches();
    ledger().forEach(row => {
      if (!row || typeof row !== "object") return;
      if (!row.source_label) row.source_label = sourceLabel(row);
      if (!row.movement_type) row.movement_type = movementType(row);
      upsertArray(caches.account_ops, row);
      upsertArray(window.operationalLedger, row);
      if (Array.isArray(window.hareketler)) upsertArray(window.hareketler, row);
    });
  }

  function hardDedupe() {
    const caches = ensureCaches();

    function clean(rows) {
      if (!Array.isArray(rows)) return [];
      const hasAnaTahakkuk = new Set();
      const seenContract = new Set();

      rows.forEach(row => {
        if (!row || !isTahakkuk(row)) return;
        const key = String(row?.cari_id || nrm(row?.cari_name)) + "|" + ymOf(row) + "|Tahakkuk";
        if (!isContract(row)) hasAnaTahakkuk.add(key);
      });

      return rows.filter(row => {
        if (!row) return false;
        if (isTahsilat(row)) return true;

        const key = String(row?.cari_id || nrm(row?.cari_name)) + "|" + ymOf(row) + "|Tahakkuk";

        if (isContract(row) && hasAnaTahakkuk.has(key)) return false;

        if (isContract(row)) {
          if (seenContract.has(key)) return false;
          seenContract.add(key);
        }

        return true;
      });
    }

    const l = ledger();
    const cl = clean(l);
    if (cl.length !== l.length) saveLedger(cl);

    caches.account_ops = clean(caches.account_ops);
    window.operationalLedger = clean(window.operationalLedger);
    if (Array.isArray(window.hareketler)) window.hareketler = clean(window.hareketler);
  }

  function selectedCariName() {
    const hero = document.querySelector("#selectedCariDetail .hero-name");
    if (hero && hero.textContent.trim()) return hero.textContent.trim();

    const active = document.querySelector(".list-item.active .list-title");
    if (active && active.textContent.trim()) return active.textContent.trim();

    return "";
  }

  function renderMissingRows() {
    const detail = document.getElementById("selectedCariDetail");
    if (!detail) return;

    const cariName = selectedCariName();
    if (!cariName) return;

    const table = detail.querySelector("table.source-statement") || detail.querySelector("table");
    if (!table) return;

    const tbody = table.querySelector("tbody") || table;
    const visible = tbody.textContent || "";
    const target = nrm(cariName);

    ledger()
      .filter(row => {
        const rn = nrm(row?.cari_name || "");
        return rn && (rn === target || rn.includes(target) || target.includes(rn));
      })
      .sort((a, b) => String(dateOf(b)).localeCompare(String(dateOf(a))))
      .forEach(row => {
        const id = rowId(row);
        if (!id || visible.includes(id)) return;

        const debit = Number(row?.debit || 0);
        const credit = Number(row?.credit || 0);
        const tr = document.createElement("tr");
        tr.className = isTahsilat(row) ? "row-tahsilat" : (isTahakkuk(row) ? "row-tahakkuk" : "row-neutral");
        tr.setAttribute("data-v4-ledger-row", id);

        tr.innerHTML = `
          <td>${html(id)}</td>
          <td>${html(dateOf(row))}</td>
          <td class="statement-source">
            <span class="source-badge ${isTahsilat(row) ? "bank" : "manual"}">${html(sourceLabel(row))}</span>
            <span class="source-detail">V4 görünürlük doğrulandı</span>
          </td>
          <td><span class="tag ${isTahsilat(row) ? "green" : "blue"}">${html(movementType(row))}</span></td>
          <td class="statement-desc">${html(row?.description || row?.content_summary || "")}</td>
          <td class="statement-num">${debit ? money(debit) : "0,00 TL"}</td>
          <td class="statement-num">${credit ? money(credit) : "0,00 TL"}</td>
          <td class="statement-balance">-</td>
          <td><span class="tag gray">V4</span></td>
        `;
        tbody.appendChild(tr);
      });
  }

  function schedule() {
    clearTimeout(V4.timer);
    V4.timer = setTimeout(() => {
      mergeLedgerToRuntime();
      hardDedupe();
      renderMissingRows();
    }, 120);
  }

  function wrapFunction(name) {
    try {
      const fn = window[name];
      if (typeof fn !== "function" || fn.__alkamV4Wrapped) return;

      const wrapped = function () {
        mergeLedgerToRuntime();
        hardDedupe();

        const out = fn.apply(this, arguments);
        const done = () => {
          mergeLedgerToRuntime();
          hardDedupe();
          schedule();
        };

        if (out && typeof out.then === "function") {
          return out.then(v => {
            done();
            return v;
          }).catch(e => {
            done();
            throw e;
          });
        }

        done();
        return out;
      };

      wrapped.__alkamV4Wrapped = true;
      window[name] = wrapped;
      try { eval(name + " = window[name]"); } catch (_) {}
    } catch (_) {}
  }

  function wrapUpsert() {
    try {
      const fn = window.upsertLiveRow;
      if (typeof fn !== "function" || fn.__alkamV4UpsertWrapped) return;

      const wrapped = async function (table, row) {
        let result = null;
        let failed = false;

        try {
          result = await fn.apply(this, arguments);
        } catch (e) {
          failed = true;
        }

        if (String(table || "") === "account_ops" && row && typeof row === "object") {
          const id = rowId(row) || ("V4_" + Date.now() + "_" + Math.random().toString(16).slice(2));
          const safeRow = Object.assign({}, row, {
            id,
            txn_id: row.txn_id || id,
            operation_no: row.operation_no || id,
            source_label: row.source_label || sourceLabel(row),
            movement_type: row.movement_type || movementType(row),
            sync_status: failed ? "pending_sync" : (row.sync_status || "synced")
          });

          const rows = ledger();
          if (!rows.some(x => rowId(x) === id)) {
            rows.unshift(safeRow);
            saveLedger(rows);
          }

          mergeLedgerToRuntime();
          hardDedupe();
          schedule();
        }

        return result;
      };

      wrapped.__alkamV4UpsertWrapped = true;
      window.upsertLiveRow = wrapped;
      try { upsertLiveRow = window.upsertLiveRow; } catch (_) {}
    } catch (_) {}
  }

  function boot() {
    mergeLedgerToRuntime();
    hardDedupe();
    wrapUpsert();

    ["loadSelectedCariHareketler", "renderSelectedCariDetail", "renderCariList", "refreshScreens", "runContracts"]
      .forEach(wrapFunction);

    schedule();

    document.addEventListener("click", schedule, true);
    document.addEventListener("change", schedule, true);

    setInterval(() => {
      wrapUpsert();
      ["loadSelectedCariHareketler", "renderSelectedCariDetail", "renderCariList", "refreshScreens", "runContracts"]
        .forEach(wrapFunction);
      mergeLedgerToRuntime();
      hardDedupe();
      renderMissingRows();
    }, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();