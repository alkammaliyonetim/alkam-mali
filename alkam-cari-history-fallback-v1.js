(function(){
  'use strict';
  var VERSION = 'ALKAM Cari History Fallback v1 disabled';
  function disabled(){ return false; }
  window.ALKAM_CARI_HISTORY_FALLBACK_V1 = {
    version: VERSION,
    disabled: true,
    repair: disabled,
    last: function(){ return { disabled:true, version:VERSION }; }
  };
})();
