(function(){
'use strict';
function install(){
  window.printSelectedCari = function(){
    const detail = document.getElementById('selectedCariDetail');
    if(!detail){ alert('Cari detay alanı bulunamadı.'); return; }
    const title = (detail.querySelector('.hero-name')||{}).textContent || 'Cari Ekstresi';
    const popup = window.open('', '_blank', 'width=1280,height=900');
    if(!popup){ alert('Yazdırma penceresi açılamadı.'); return; }
    popup.document.write(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
body{font-family:Arial,sans-serif;padding:24px;color:#111827}
button{display:none!important}
.btn{display:none!important}
.alkam-cari-toolbar{display:none!important}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border:1px solid #d1d5db;padding:6px;text-align:left;vertical-align:top}
th{background:#f3f4f6}
.money{text-align:right;font-weight:700;white-space:nowrap}
.metric-mini{border:1px solid #d1d5db;border-radius:8px;padding:10px;margin-bottom:8px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}
.v119-legend,.rule-box{margin-bottom:12px}
@media print{body{padding:0;margin:0}}
</style>
</head>
<body>
${detail.innerHTML}
<script>
window.onload=function(){setTimeout(function(){window.print();},250)};
<\/script>
</body>
</html>`);
    popup.document.close();
  };
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(install,700));
window.addEventListener('alkam:cariler-loaded',()=>setTimeout(install,700));
setTimeout(install,1200);
})();