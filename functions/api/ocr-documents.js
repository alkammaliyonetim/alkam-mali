const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-ALKAM-Webhook-Secret"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, CORS_HEADERS)
  });
}

function num(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  let s = String(value ?? "").replace(/\s/g, "").replace(/TL|₺/gi, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  return Number(s) || 0;
}

function bestAmount(text) {
  const matches = String(text || "").match(/(?:₺|TL)?\s*-?\d{1,3}(?:\.\d{3})*(?:,\d{2})|-?\d+(?:,\d{2})/g) || [];
  return matches.map(num).filter(x => Math.abs(x) > 0).sort((a, b) => Math.abs(b) - Math.abs(a))[0] || 0;
}

function parseRef(text) {
  const m = String(text || "").match(/(?:ref|referans|işlem no|islem no|provizyon|onay|dekont)[\s:#-]*([A-Z0-9-]{4,})/i);
  return m ? m[1] : "";
}

function parseInstallments(text) {
  const m = String(text || "").match(/(\d{1,2})\s*(?:taksit|tk|ay)/i);
  return Math.max(1, Number(m ? m[1] : 1) || 1);
}

function parseDate(text) {
  const s = String(text || "");
  const m = s.match(/\d{4}-\d{2}-\d{2}|\d{2}[./-]\d{2}[./-]\d{4}/);
  if (!m) return new Date().toISOString().slice(0, 10);
  const v = m[0];
  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return v;
  const tr = v.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
  if (tr) return `${tr[3]}-${tr[2]}-${tr[1]}`;
  return new Date().toISOString().slice(0, 10);
}

function parseCari(text) {
  let s = String(text || "").replace(/\s+/g, " ").trim();
  s = s
    .replace(/\d{1,2}[./-]\d{1,2}[./-]\d{4}/g, "")
    .replace(/(?:₺|TL)?\s*-?\d{1,3}(?:\.\d{3})*(?:,\d{2})/g, "")
    .replace(/\b\d+\s*(taksit|tk|ay)\b/ig, "")
    .replace(/(?:ref|referans|dekont)[\s:#-]*[A-Z0-9-]+/ig, "")
    .replace(/moka|pos|sanal|tahsilat|ödeme|odeme|banka|aktarımı|aktarimi/ig, "")
    .trim();
  return s.slice(0, 90) || "AI/OCR Cari Adayı";
}

function classify(text, fileName) {
  const hay = `${text || ""} ${fileName || ""}`.toLocaleLowerCase("tr-TR");
  if (hay.includes("moka") || hay.includes("pos") || hay.includes("taksit")) return "moka_pos";
  if (hay.includes("banka") || hay.includes("iban") || hay.includes("dekont") || hay.includes("hesap")) return "bank_statement";
  return "unknown";
}

function heuristicExtract(payload) {
  const text = String(payload.text || payload.ocrText || payload.caption || "");
  const fileName = String(payload.fileName || payload.filename || "");
  const docType = payload.docType || classify(text, fileName);
  const amount = bestAmount(text);
  const ref = parseRef(text);
  let confidence = 25;
  if (amount > 0) confidence += 25;
  if (ref) confidence += 20;
  if (/moka|pos|banka|dekont/i.test(text)) confidence += 15;
  if (/\d{4}-\d{2}-\d{2}|\d{2}[./-]\d{2}[./-]\d{4}/.test(text)) confidence += 15;

  return {
    ok: true,
    provider: "heuristic",
    docType,
    confidence: Math.min(100, confidence),
    rawText: text,
    extracted: {
      transactionDate: parseDate(text),
      cari: parseCari(text),
      reference: ref,
      grossAmount: amount,
      feeAmount: 0,
      netAmount: amount,
      installments: docType === "moka_pos" ? parseInstallments(text) : 1,
      direction: /\-|çıkış|cikis|borç|borc/i.test(text) ? "Çıkış" : "Giriş",
      description: text.slice(0, 500),
      fileName
    },
    warning: amount ? "candidate_ready" : "amount_not_found"
  };
}

async function verifySecret(request, env) {
  if (!env.ALKAM_WEBHOOK_SECRET) return true;
  return request.headers.get("X-ALKAM-Webhook-Secret") === env.ALKAM_WEBHOOK_SECRET;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  if (!(await verifySecret(request, env))) return json({ ok: false, error: "invalid_webhook_secret" }, 401);

  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (env.ALKAM_OCR_ENDPOINT) {
    const upstream = await fetch(env.ALKAM_OCR_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.ALKAM_OCR_TOKEN ? { "Authorization": `Bearer ${env.ALKAM_OCR_TOKEN}` } : {})
      },
      body: JSON.stringify(payload)
    });
    const text = await upstream.text();
    try {
      return json({ ok: upstream.ok, provider: "external", result: JSON.parse(text) }, upstream.ok ? 200 : 502);
    } catch (_) {
      return json({ ok: upstream.ok, provider: "external", text }, upstream.ok ? 200 : 502);
    }
  }

  return json(heuristicExtract(payload));
}
