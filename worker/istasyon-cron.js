const CONTROL_URL = "https://alkam-mali.pages.dev/api/automation/status";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/health") return new Response("İstasyON Cron Worker", { status: 200 });
    return Response.json({
      ok: true,
      service: "istasyon-cron",
      mode: "control_only",
      financialWrite: "approval_required",
      schedule: "hourly"
    });
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runHourlyControl(env, controller));
  }
};

async function runHourlyControl(env, controller) {
  const checkedAt = new Date().toISOString();
  const result = {
    checkedAt,
    scheduledTime: controller?.scheduledTime || null,
    mode: "control_only",
    financialWrite: "approval_required"
  };

  try {
    const response = await fetch(CONTROL_URL, {
      headers: { "user-agent": "istasyon-cron/1.0" }
    });
    result.controlCenterStatus = response.status;
    result.controlCenterOk = response.ok;
  } catch (error) {
    result.controlCenterOk = false;
    result.error = String(error?.message || error);
  }

  console.log(JSON.stringify(result));
  return result;
}
