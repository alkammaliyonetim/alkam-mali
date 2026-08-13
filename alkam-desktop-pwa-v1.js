(function () {
  "use strict";
  let installPrompt = null;

  function addStyle() {
    if (document.getElementById("alkamPwaStyle")) return;
    const style = document.createElement("style");
    style.id = "alkamPwaStyle";
    style.textContent = `
      .alkam-pwa-tools{display:flex;align-items:center;gap:7px}
      .alkam-pwa-status{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:#ecfdf5;color:#047857;font-size:10px;font-weight:950}
      .alkam-pwa-status.offline{background:#fff7ed;color:#c2410c}
      #alkamInstallButton{display:none;background:#1769e8;color:#fff;border:0;border-radius:9px;min-height:32px;padding:6px 10px;font-size:11px;font-weight:950;cursor:pointer}
      @media(display-mode:standalone){#alkamInstallButton{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function updateStatus() {
    const badge = document.getElementById("alkamPwaStatus");
    if (!badge) return;
    badge.classList.toggle("offline", !navigator.onLine);
    badge.textContent = navigator.onLine ? "● Çevrimiçi" : "● Çevrimdışı";
  }

  function mount() {
    addStyle();
    const right = document.querySelector(".erp-module-right");
    if (!right || document.getElementById("alkamPwaTools")) return;
    const tools = document.createElement("div");
    tools.id = "alkamPwaTools";
    tools.className = "alkam-pwa-tools";
    tools.innerHTML = '<span id="alkamPwaStatus" class="alkam-pwa-status"></span><button id="alkamInstallButton" type="button">Bilgisayara Kur</button>';
    right.insertBefore(tools, right.firstChild);
    document.getElementById("alkamInstallButton").addEventListener("click", async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      document.getElementById("alkamInstallButton").style.display = "none";
    });
    updateStatus();
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    mount();
    const button = document.getElementById("alkamInstallButton");
    if (button) button.style.display = "inline-flex";
  });
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
