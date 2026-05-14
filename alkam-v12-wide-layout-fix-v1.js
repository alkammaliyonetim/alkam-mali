(function(){
  'use strict';
  var VERSION = 'ALKAM v12 Wide Layout Fix v1 disabled';
  function disabled(){ return false; }
  window.ALKAM_V12_WIDE_LAYOUT_FIX_V1 = {
    version: VERSION,
    disabled: true,
    run: disabled,
    test: function(){ return { disabled:true, version:VERSION }; },
    last: function(){ return { disabled:true, version:VERSION }; }
  };
})();
