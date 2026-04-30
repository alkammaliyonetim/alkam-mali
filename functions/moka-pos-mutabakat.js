export async function onRequestGet(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  html = html
    .replace(/\s*<button class="tab" data-tab="audit">Denetim İzi<\/button>/g, "")
    .replace(/\s*<section class="panel tab-page hidden" id="tab-audit">[\s\S]*?<\/section>/g, "")
    .replace("renderBank();renderExpected();renderMatches();renderAudit()", "renderBank();renderExpected();renderMatches()")
    .replace(/\s*function renderAudit\(\)\{[\s\S]*?\}\n\s*function switchLocalTab/, "\n  function switchLocalTab");

  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(html, { status: response.status, headers });
}
