(function(){
  'use strict';
  var VERSION = 'ALKAM Cari Detail Render Lock v1 disabled';
  function disabled(){ return false; }
  window.ALKAM_CARI_DETAIL_RENDER_LOCK_V1 = {
    version: VERSION,
    disabled: true,
    render: disabled,
    last: function(){ return { disabled:true, version:VERSION }; }
  };
})();
