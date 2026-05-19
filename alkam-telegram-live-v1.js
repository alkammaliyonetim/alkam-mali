(function(){
'use strict';
const K='ALKAM_TG_LIVE_V1';
const $=id=>document.getElementById(id);
const read=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(e){return {}}};
const save=v=>localStorage.setItem(K,JSON.stringify(v||{}));
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
function toast(m){const t=$('toast');if(t){t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',3000)}else alert(m)}
function ui(){
 const onay=$('tab-onay'); if(!onay||$('tgLiveBox')) return;
 const c=read();
 const b=document.createElement('div'); b.id='tgLiveBox'; b.className='ops-simple';
 b.innerHTML=`<h2>🤖 Telegram Canlı Mesaj Alma</h2><div class="note">Botuna mesaj gönder, buradan son mesajları çek. Mesajlar önce ön izlemeye aktarılır; onaylamadan cariye yazılmaz.</div><input id="tgBotKey" type="password" class="search-input" placeholder="Bot anahtarı - sadece bu tarayıcıda saklanır" value="${esc(c.key||'')}"><input id="tgChatId" class="search-input" style="margin-top:8px" placeholder="Chat ID / Grup ID - boş kalabilir" value="${esc(c.chat||'')}"><div class="btn-row" style="margin-top:8px"><button class="btn btn-soft" onclick="ALKAM_TG_LIVE.save()">Ayar Kaydet</button><button class="btn btn-blue" onclick="ALKAM_TG_LIVE.pull()">Mesajları Çek</button><button class="btn btn-green" onclick="ALKAM_TG_LIVE.pullPreview()">Çek ve Ön İzle</button></div><div class="note" style="margin-top:8px">Not: Tarayıcı doğrudan bağlantıyı engellerse sonraki küçük adımda Worker köprüsü kuracağız.</div><div id="tgLiveResult" class="ops-simple-result"></div>`;
 onay.insertBefore(b,$('simpleTelegramBox')||$('approvalList')||onay.firstChild);
}
function cfg(){const old=read();return {key:($('tgBotKey')?.value||'').trim(),chat:($('tgChatId')?.value||'').trim(),last:old.last||0}}
function rows(data,chat){return (data.result||[]).map(u=>{const m=u.message||u.edited_message||u.channel_post||{};const txt=(m.text||m.caption||'').trim();if(!txt)return null;const cid=String(m.chat?.id||'');if(chat&&cid!==String(chat))return null;return {id:u.update_id,chat:cid,text:txt,date:m.date?new Date(m.date*1000).toLocaleString('tr-TR'):''}}).filter(Boolean)}
async function pull(){
 const c=cfg(); if(!c.key){toast('Bot anahtarı girilmedi.');return []} save(c);
 const off=c.last?'&offset='+(Number(c.last)+1):'';
 try{const r=await fetch('https://api.telegram.org/bot'+c.key+'/getUpdates?timeout=0&limit=20'+off,{cache:'no-store'});const d=await r.json();if(!d.ok)throw new Error(d.description||'Bağlantı başarısız');const list=rows(d,c.chat);if(d.result?.length){c.last=Math.max(...d.result.map(x=>x.update_id||0));save(c)}$('tgLiveResult').innerHTML=list.length?('<b>Çekilen mesaj:</b> '+list.length+'<br>'+list.map(x=>esc(x.date+' | '+x.chat+' | '+x.text)).join('<br>')):'Yeni mesaj yok.';return list}catch(e){$('tgLiveResult').innerHTML='<b>Telegram bağlantısı kurulamadı:</b> '+esc(e.message||e);return []}
}
window.ALKAM_TG_LIVE={save(){save(cfg());toast('Telegram ayarı kaydedildi.')},pull,async pullPreview(){const list=await pull();if(!list.length)return;const area=$('simpleTelegramText');if(area){area.value=list.map(x=>x.text).join('\n');window.ALKAM_SIMPLE_OPS?.previewTelegram?.();toast('Mesajlar ön izlemeye aktarıldı.')}}};
document.addEventListener('DOMContentLoaded',()=>setTimeout(ui,700));window.addEventListener('alkam:cariler-loaded',()=>setTimeout(ui,700));document.addEventListener('click',()=>setTimeout(ui,50),true);
})();
