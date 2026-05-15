// ALKAM Mali - sadece sifre input focus duzeltmesi
(function(){
  if(window.__ALKAM_LOGIN_FOCUS_ONLY_V1__) return;
  window.__ALKAM_LOGIN_FOCUS_ONLY_V1__=true;
  function add(){
    if(!document.getElementById('alkamLoginFocusOnlyStyle')){
      var s=document.createElement('style');
      s.id='alkamLoginFocusOnlyStyle';
      s.textContent='.login-overlay,.login-shell,.login-panel,#loginForm,.field,.pass-wrap,#loginPassword,.login-btn{pointer-events:auto!important}#loginPassword{position:relative!important;z-index:9999999!important;background:#fff!important;color:#0f172a!important;-webkit-user-select:text!important;user-select:text!important;touch-action:manipulation!important}';
      document.head.appendChild(s);
    }
  }
  function fix(){
    add();
    var i=document.getElementById('loginPassword');
    if(!i)return;
    i.disabled=false;
    i.readOnly=false;
    i.removeAttribute('disabled');
    i.removeAttribute('readonly');
    i.setAttribute('inputmode','numeric');
    i.style.pointerEvents='auto';
    i.style.webkitUserSelect='text';
    i.style.userSelect='text';
    i.onclick=function(){try{i.focus()}catch(e){}};
    i.ontouchstart=function(){setTimeout(function(){try{i.focus()}catch(e){}},30)};
    i.ontouchend=function(){setTimeout(function(){try{i.focus()}catch(e){}},30)};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
  document.addEventListener('click',function(){setTimeout(fix,50)},true);
  var n=0,t=setInterval(function(){fix();if(++n>80)clearInterval(t)},250);
})();
