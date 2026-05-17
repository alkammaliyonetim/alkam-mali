(function(){
  'use strict';

  const groups = [
    {
      key: 'safe',
      title: 'Güvenli Modüller',
      note: 'Sadece izleme, kontrol, uyarı ve rapor üretir. Veri değiştirmez.',
      tag: 'AÇIK',
      className: 'green',
      modules: [
        ['auditTrail', 'İşlem İzi / Log Takibi', 'İşlem geçmişini izler.'],
        ['dataHealthCheck', 'Veri Sağlık Kontrolü', 'Eksik kaynak, boş alan ve tutarsızlıkları raporlar.'],
        ['approvalQueueMonitor', 'Onay Merkezi Kuyruk İzleme', 'Bekleyen onayları gösterir.'],
        ['duplicateWarning', 'Mükerrer Kayıt Uyarısı', 'Benzer kayıtları uyarı olarak yakalar.'],
        ['missingSourceWarning', 'Kaynak Kolonu Eksik Uyarısı', 'Kaynak alanı boş kayıtları raporlar.'],
        ['mokaMonitor', 'Moka United İzleme', 'Moka tarafını sadece izler.'],
        ['bankImportPreview', 'Banka İçe Aktarma Ön İzleme', 'Banka verisini ön izleme olarak gösterir.'],
        ['telegramInboxMonitor', 'Telegram Gelen Kayıt İzleme', 'Telegram kayıtlarını kuyruk/öneri seviyesinde gösterir.']
      ]
    },
    {
      key: 'suggestion',
      title: 'Öneri Modülleri',
      note: 'Öneri üretir. Kullanıcı onayı olmadan sonuç işlemi yapmaz.',
      tag: 'ÖNERİ MODU',
      className: 'amber',
      modules: [
        ['monthlyAccrual', 'Aylık Ücret Önerisi', 'Aylık ücret için öneri üretir.'],
        ['retroAccrual', 'Geçmiş Ay Kontrol Önerisi', 'Eksik dönemleri öneri olarak listeler.'],
        ['bankAutoMatch', 'Banka Eşleştirme Önerisi', 'Cari adayı ve güven puanı üretir.'],
        ['invoiceAutoCreate', 'Fatura / Defter Önerisi', 'Tahakkuk önerisi üretir.'],
        ['importAutoProcess', 'Dosya İçe Aktarma Ön Okuma', 'Yüklenen dosyayı ön okuma seviyesinde değerlendirir.']
      ]
    },
    {
      key: 'blocked',
      title: 'Kapalı Riskli Modüller',
      note: 'Bu fazda kapalı kalır. Yanlış sonuç üretme riski nedeniyle aktif edilmez.',
      tag: 'KAPALI',
      className: 'red',
      modules: [
        ['bankAutoPost', 'Banka Hareketini Sonuca Çevirme', 'Bu fazda kapalıdır.'],
        ['approvalAutoConfirm', 'Otomatik Onaylama', 'Kullanıcı onayını atladığı için kapalıdır.'],
        ['mokaAutoCollection', 'Moka Tahsilat Sonuç İşlemi', 'Bu fazda kapalıdır.'],
        ['mokaAutoSettlement', 'Moka Banka Aktarım Kapatma', 'Bu fazda kapalıdır.'],
        ['bulkAutoUpdate', 'Toplu Otomatik Güncelleme', 'Toplu değişiklik riski nedeniyle kapalıdır.']
      ]
    }
  ];

  function esc(value){
    return String(value || '').replace(/[&<>"']/g, function(s){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s];
    });
  }

  function tagClass(name){
    if(name === 'green') return 'tag green';
    if(name === 'amber') return 'tag amber';
    if(name === 'red') return 'tag red';
    return 'tag gray';
  }

  function card(group, item){
    return '<div class="auto-row" data-safe-auto-module="'+esc(item[0])+'">' +
      '<div>' +
        '<div class="auto-name">'+esc(item[1])+'</div>' +
        '<div class="auto-desc">'+esc(item[2])+'</div>' +
        '<span class="auto-risk">Grup: '+esc(group.title)+'</span>' +
      '</div>' +
      '<div><span class="'+tagClass(group.className)+'">'+esc(group.tag)+'</span></div>' +
    '</div>';
  }

  function buildHtml(){
    const totalSafe = groups.find(g => g.key === 'safe').modules.length;
    const totalSuggestion = groups.find(g => g.key === 'suggestion').modules.length;
    const totalBlocked = groups.find(g => g.key === 'blocked').modules.length;

    return '<div class="rule-box" style="margin-bottom:12px">' +
      '<strong>Otomasyon v1 karar matrisi:</strong> Güvenli modüller açık, öneri modülleri onaylı akışta, riskli modüller kapalıdır. Onaysız sonuç işlemi yoktur.' +
      '</div>' +
      '<div class="grid-3" style="margin-bottom:12px">' +
        '<div class="metric-mini"><div class="k">Güvenli</div><div class="v">'+totalSafe+'</div></div>' +
        '<div class="metric-mini"><div class="k">Öneri</div><div class="v">'+totalSuggestion+'</div></div>' +
        '<div class="metric-mini"><div class="k">Kapalı Riskli</div><div class="v">'+totalBlocked+'</div></div>' +
      '</div>' +
      groups.map(function(group){
        return '<h3 style="font-size:16px;margin:18px 0 8px">'+esc(group.title)+' <span class="'+tagClass(group.className)+'">'+esc(group.tag)+'</span></h3>' +
          '<div class="rule-box" style="margin-bottom:10px">'+esc(group.note)+'</div>' +
          group.modules.map(function(item){ return card(group, item); }).join('');
      }).join('') +
      '<h3 style="font-size:15px;margin:18px 0 8px">Koruma Notu</h3>' +
      '<div class="rule-box">Bu görünüm sınıflandırma ve güvenli kullanım içindir. Mevcut kayıt yapısı korunur; onay olmadan sonuç işlemi oluşmaz.</div>';
  }

  function install(){
    const panel = document.getElementById('automationPanel');
    if(!panel) return false;
    panel.innerHTML = buildHtml();
    window.ALKAM_AUTOMATION_SAFE_UI_READY = true;
    window.ALKAM_AUTOMATION_SAFE_UI_COUNTS = { safe: 8, suggestion: 5, blocked: 5 };
    return true;
  }

  window.renderSafeAutomationModules = install;

  document.addEventListener('DOMContentLoaded', function(){
    document.addEventListener('click', function(event){
      const target = event.target;
      if(target && target.closest && target.closest('[data-tab="otomasyon"]')){
        setTimeout(install, 80);
      }
    });
  });
})();
