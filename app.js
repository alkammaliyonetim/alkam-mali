const APP_SECURITY = {
  password: "2909",
  sessionKey: "alkam_session_v1",
  maxFail: 5,
  lockMinutes: 10
};

function getSessionState() {
  try {
    return JSON.parse(localStorage.getItem(APP_SECURITY.sessionKey) || "{}");
  } catch {
    return {};
  }
}

function setSessionState(data) {
  localStorage.setItem(APP_SECURITY.sessionKey, JSON.stringify(data));
}

function clearSessionState() {
  localStorage.removeItem(APP_SECURITY.sessionKey);
}

function isLocked() {
  const state = getSessionState();
  if (!state.lockUntil) return false;
  return Date.now() < state.lockUntil;
}

function getRemainingLockText() {
  const state = getSessionState();
  if (!state.lockUntil) return "";
  const ms = state.lockUntil - Date.now();
  if (ms <= 0) return "";
  const min = Math.ceil(ms / 60000);
  return `${min} dakika sonra tekrar deneyin.`;
}

function openApp() {
  const overlay = document.getElementById("loginOverlay");
  if (overlay) overlay.style.display = "none";
  document.body.classList.add("app-unlocked");
}

function closeApp() {
  const overlay = document.getElementById("loginOverlay");
  if (overlay) overlay.style.display = "flex";
  document.body.classList.remove("app-unlocked");
}

function initLoginSystem() {
  const form = document.getElementById("loginForm");
  const input = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");
  const toggleBtn = document.getElementById("togglePassword");

  if (!form || !input || !errorBox) return;

  const state = getSessionState();

  if (state.authenticated === true) {
    openApp();
  } else {
    closeApp();
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      input.type = input.type === "password" ? "text" : "password";
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (isLocked()) {
      errorBox.textContent = "Çok fazla hatalı giriş. " + getRemainingLockText();
      return;
    }

    const entered = (input.value || "").trim();
    const current = getSessionState();
    const failCount = Number(current.failCount || 0);

    if (entered === APP_SECURITY.password) {
      setSessionState({
        authenticated: true,
        failCount: 0,
        lastLogin: new Date().toISOString()
      });
      errorBox.textContent = "";
      input.value = "";
      openApp();
      return;
    }

    const newFail = failCount + 1;

    if (newFail >= APP_SECURITY.maxFail) {
      setSessionState({
        authenticated: false,
        failCount: newFail,
        lockUntil: Date.now() + APP_SECURITY.lockMinutes * 60 * 1000
      });
      errorBox.textContent = "Çok fazla hatalı giriş. " + APP_SECURITY.lockMinutes + " dakika kilitlendi.";
      input.value = "";
      input.type = "password";
      return;
    }

    setSessionState({
      authenticated: false,
      failCount: newFail
    });

    errorBox.textContent = "Şifre hatalı.";
    input.value = "";
    input.type = "password";
    input.focus();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initLoginSystem();
});
