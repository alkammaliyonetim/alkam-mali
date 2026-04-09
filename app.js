(function () {
  const ALKAM_SECURITY = {
    password: "2909",
    sessionKey: "alkam_secure_session_v4",
    maxFail: 5,
    lockMinutes: 10
  };

  function alkamPad(n) {
    return String(n).padStart(2, "0");
  }

  function alkamVersionFromLastModified() {
    let d = new Date(document.lastModified);
    if (Number.isNaN(d.getTime())) d = new Date();
    const hh = alkamPad(d.getHours());
    const mm = alkamPad(d.getMinutes());
    const dd = alkamPad(d.getDate());
    const mo = alkamPad(d.getMonth() + 1);
    const yy = String(d.getFullYear()).slice(-2);
    return `${hh}${mm}${dd}${mo}${yy}-${hh}${mm}`;
  }

  function alkamGetState() {
    try {
      return JSON.parse(localStorage.getItem(ALKAM_SECURITY.sessionKey) || "{}");
    } catch {
      return {};
    }
  }

  function alkamSetState(data) {
    localStorage.setItem(ALKAM_SECURITY.sessionKey, JSON.stringify(data));
  }

  function alkamClearState() {
    localStorage.removeItem(ALKAM_SECURITY.sessionKey);
  }

  function alkamIsLocked() {
    const state = alkamGetState();
    return !!(state.lockUntil && Date.now() < state.lockUntil);
  }

  function alkamLockText() {
    const state = alkamGetState();
    if (!state.lockUntil) return "";
    const remaining = state.lockUntil - Date.now();
    if (remaining <= 0) return "";
    const min = Math.ceil(remaining / 60000);
    return `${min} dakika sonra tekrar deneyin.`;
  }

  function alkamOpenApp() {
    const overlay = document.getElementById("alkamSecureOverlay");
    if (overlay) overlay.classList.remove("active");
    document.body.classList.add("alkam-authenticated");
  }

  function alkamCloseApp() {
    const overlay = document.getElementById("alkamSecureOverlay");
    if (overlay) overlay.classList.add("active");
    document.body.classList.remove("alkam-authenticated");
  }

  function alkamRenderVersion() {
    const version = alkamVersionFromLastModified();
    const badge = document.getElementById("alkamVersionBadge");
    if (badge) badge.textContent = "V" + version;
  }

  function alkamInitLogin() {
    const form = document.getElementById("alkamLoginForm");
    const input = document.getElementById("alkamLoginPassword");
    const errorBox = document.getElementById("alkamLoginError");
    const toggle = document.getElementById("alkamTogglePassword");
    const logoutBtn = document.getElementById("alkamLogoutBtn");

    if (!form || !input || !errorBox) return;

    alkamRenderVersion();

    const state = alkamGetState();
    if (state.authenticated === true) {
      alkamOpenApp();
    } else {
      alkamCloseApp();
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        input.type = input.type === "password" ? "text" : "password";
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (alkamIsLocked()) {
        errorBox.textContent = "Çok fazla hatalı giriş. " + alkamLockText();
        return;
      }

      const entered = (input.value || "").trim();
      const current = alkamGetState();
      const failCount = Number(current.failCount || 0);

      if (entered === ALKAM_SECURITY.password) {
        alkamSetState({
          authenticated: true,
          failCount: 0,
          lastLogin: new Date().toISOString()
        });
        input.value = "";
        input.type = "password";
        errorBox.textContent = "";
        alkamOpenApp();
        return;
      }

      const newFail = failCount + 1;

      if (newFail >= ALKAM_SECURITY.maxFail) {
        alkamSetState({
          authenticated: false,
          failCount: newFail,
          lockUntil: Date.now() + ALKAM_SECURITY.lockMinutes * 60 * 1000
        });
        input.value = "";
        input.type = "password";
        errorBox.textContent = "Çok fazla hatalı giriş. " + ALKAM_SECURITY.lockMinutes + " dakika kilitlendi.";
        return;
      }

      alkamSetState({
        authenticated: false,
        failCount: newFail
      });

      input.value = "";
      input.type = "password";
      errorBox.textContent = "Şifre hatalı.";
      input.focus();
    });

    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        alkamClearState();
        alkamCloseApp();
        input.value = "";
        input.type = "password";
        errorBox.textContent = "";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", alkamInitLogin);
  } else {
    alkamInitLogin();
  }
})();
