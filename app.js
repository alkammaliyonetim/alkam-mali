const testBtn = document.getElementById("testBtn");
const result = document.getElementById("result");

testBtn.addEventListener("click", () => {
  result.textContent = "Sistem çalışıyor. Bir sonraki adım Cloudflare bağlantısı.";
});
