(function(){
'use strict';
const LS={cariler:'ALKAM_FINAL_CARILER_V1',manual:'ALKAM_FINAL_MANUAL_TXNS_V1',approvals:'ALKAM_FINAL_APPROVALS_V1',audit:'ALKAM_FINAL_AUDIT_V1'};
function r(k,f){try{let x=localStorage.getItem(k);return x?JSON.parse(x):f}catch(e){return f}}
function w(k,v){localStorage.setItem(k,JSON.stringify(v))}
function n(v){return Number(v||0)||0}
function uid(){return 'APP-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function log(a,d){let l=r(LS.audit,[]);l.unshift({at:new Date().toISOString(),action:a,detail:d,level:'Onay Koruma'});w(LS.audit,l.slice(0,500))}
function money(v){return n(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'}
function post(id){
 let approvals=r(LS.approvals,[]);let a=approvals.find(x=>String(x.id)===String(id));
 if(!a)return;
 if(a.status&&a.status!=='Bekliyor'){alert('Bu onay kaydı zaten işlenmiş veya kapatılmış.');return;}
 if(a.postedTxnId){alert('Bu onay kaydı daha önce cariye işlenmiş.');return;}
 let cariler=r(LS.cariler,[]);let cari=cariler.find(c=>String(c.id)===String(a.cariId)&&!c.deleted);
 if(!cari){alert('Cari bulunamadı. Kayıt cariye işlenmedi.');log('Onay kaydı engellendi','Cari bulunamadı: '+(a.cariId||''));return;}
 let manual=r(LS.manual,[]);
 let same=manual.find(t=>String(t.approvalId)===String(a.id));
 if(same){a.status='Onaylandı';a.postedTxnId=same.id;a.approvedAt=new Date().toLocaleString('tr-TR');w(LS.approvals,approvals);alert('Bu kayıt daha önce işlenmişti. Onay durumu güncellendi.');return;}
 let typ=String(a.type||'').toLocaleLowerCase('tr-TR');
 let debit=typ.includes('tahakkuk')?n(a.amount):0;
 let credit=(typ.includes('tahsilat')||typ.includes('moka'))?n(a.amount):0;
 let row={id:uid(),approvalId:a.id,cariId:a.cariId,date:a.date||new Date().toISOString().slice(0,10),type:String(a.type||'TAHSILAT').toUpperCase(),debit,credit,source:a.source||'Onay Merkezi',description:a.reason||'Onay merkezi kaydı',docNo:'ONAY'};
 manual.push(row);
 a.status='Onaylandı';a.postedTxnId=row.id;a.approvedAt=new Date().toLocaleString('tr-TR');
 w(LS.manual,manual);w(LS.approvals,approvals);
 log('Onay kaydı cariye işlendi',(cari.name||a.cariId)+' · '+money(a.amount)+' · '+row.id);
 try{window.refreshAll&&window.refreshAll()}catch(e){}
}
function install(){window.approveItem=post;}
document.addEventListener('DOMContentLoaded',()=>setTimeout(install,900));
window.addEventListener('alkam:cariler-loaded',()=>setTimeout(install,900));
setTimeout(install,1200);
})();