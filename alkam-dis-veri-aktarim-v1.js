(function(){
  'use strict';

  var MODULE_ID = 'ALKAM_DIS_VERI_AKTARIM_V1';
  var BOT_BASE = 'https://bizmu-browser-bot.alkammaliyonetim.workers.dev';

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function findAutomationContainer(){
    return document.getElementById('tab-otomasyon') ||
      document.getElementById('otomasyon') ||
      document.querySelector('[data-tab="otomasyon"]') ||
      Array.from(document.querySelectorAll('.tab-page,.page,.section')).find(function(el){
        return /Otomasyon|OTOMASYON|Zamanlı/i.test(el.textContent || '');
      });
  }

  function panelHtml(){
    return ''+
    '<div id="alkamDisVeriAktarimPanel" class="section" style="margin-top:16px">'+
      '<h2 class="section-title">Dış Veri Aktarım Merkezi</h2>'+
      '<div class="rule-box" style="margin-bottom:12px">Hiçbir dış veri ana cari ekstresine doğrudan yazılmaz. Tüm kayıtlar önce staging ve Onay Merkezi kontrolüne düşer.</div>'+
      '<div class="grid-3" style="margin-bottom:12px">'+
        '<div class="metric-mini"><div class="k">Bizmu Aktarım</div><div class="v" id="alkamBizmuStatus">Bekliyor</div></div>'+
        '<div class="metric-mini"><div class="k">Luca Aktarım</div><div class="v">Planlandı</div></div>'+
        '<div class="metric-mini"><div class="k">Banka / Moka</div><div class="v">Staging</div></div>'+
      '</div>'+
      '<div class="btn-row" style="margin-bottom:12px">'+
        '<button class="btn btn-soft" type="button" onclick="window.ALKAM_DIS_VERI.run(\'/health\')">Bot Sağlık</button>'+
        '<button class="btn btn-soft" type="button" onclick="window.ALKAM_DIS_VERI.run(\'/login-check\')">Login Kontrol</button>'+
        '<button class="btn btn-blue" type="button" onclick="window.ALKAM_DIS_VERI.run(\'/customers-all-scan?max_pages=6\')">Carileri Ön İzle</button>'+
      '</div>'+
      '<div class="rule-box"><b>Akış:</b> Dış kaynak → Staging → Mükerrer kontrol → Cari eşleşme → Güven puanı → Onay Merkezi → Kullanıcı onayı → Ana kayıt → Audit log</div>'+
      '<div id="alkamDisVeriPreview" class="rule-box" style="margin-top:12px;white-space:pre-wrap;word-break:break-word">Henüz veri çekilmedi.</div>'+
    '</div>';
  }

  function install(){
    if(document.getElementById('alkamDisVeriAktarimPanel')) return true;
    var host = findAutomationContainer();
    if(!host) return false;
    host.insertAdjacentHTML('beforeend', panelHtml());
    console.info(MODULE_ID + ' kuruldu.');
    return true;
  }

  async function run(endpoint){
    var status = document.getElementById('alkamBizmuStatus');
    var preview = document.getElementById('alkamDisVeriPreview');
    if(status) status.textContent = 'Çalışıyor';
    if(preview) preview.textContent = 'İstek gönderildi: ' + endpoint;
    try{
      var res = await fetch(BOT_BASE + endpoint, {method:'GET'});
      var data = await res.json();
      if(status) status.textContent = data && data.ok === false ? 'Kontrol' : 'Hazır';
      if(preview) preview.innerHTML = '<pre style="margin:0;white-space:pre-wrap;word-break:break-word">' + esc(JSON.stringify(data,null,2)).slice(0,5000) + '</pre>';
    }catch(err){
      if(status) status.textContent = 'Hata';
      if(preview) preview.textContent = 'Hata: ' + err.message;
    }
  }

  window.ALKAM_DIS_VERI = { install: install, run: run };

  function boot(){
    var done = install();
    if(!done){
      var tries = 0;
      var timer = setInterval(function(){
        tries += 1;
        if(install() || tries > 20) clearInterval(timer);
      }, 500);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
