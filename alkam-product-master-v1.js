(function(){
  'use strict';
  const MODULE_ID = "ALKAM_PRODUCT_MASTER_V1";
  
  const PRODUCT_MAP = [
    {
      masterId: "PROD_PATELLA_DIZLIK_2026",
      masterName: "2026 PATELLA DESTEKLİ DİZLİK",
      aliases: ["ORTOPEDİ TEKSTİL", "PATELLA DİZLİK", "ESKİ DİZLİK V1"],
      data: {
        lastPrice: 409.00,
        avgPrice: 378.00,
        lastYearPrice: 360.00,
        totalStock: 156
      }
    }
  ];

  const ISTASYON_AUTOMATION_CORE = {
    programName: "İstasyON / ALKAM Mali",
    programUrl: "https://0e46431c.alkam-mali.pages.dev/admin.html",
    rule: "Ana program korunur. Dış veriler doğrudan cari ekstresine yazılmaz; önce staging ve Onay Merkezi'ne düşer.",
    sources: ["Bizmu", "Luca", "Banka", "Moka", "Excel", "Telegram", "WhatsApp"],
    modules: [
      "Dış Veri Aktarım Merkezi",
      "Bizmu Aktarım",
      "Luca Aktarım",
      "Banka Aktarım",
      "Moka Aktarım",
      "Excel Aktarım",
      "Telegram / WhatsApp Aktarım",
      "Zamanlı İşler"
    ],
    flow: ["Dış kaynak", "Staging", "Mükerrer kontrol", "Cari eşleşme", "Güven puanı", "Onay Merkezi", "Ana kayıt", "Audit log"]
  };

  function resolveMasterProduct(inputName) {
    if(!inputName) return "Tanımsız Ürün";
    const cleanName = inputName.trim().toUpperCase();
    for(const p of PRODUCT_MAP) {
      if(p.masterName.toUpperCase() === cleanName) return p.masterName;
      if(p.aliases.some(a => a.toUpperCase() === cleanName)) {
        console.info(`${MODULE_ID}: Aliasing '${inputName}' -> '${p.masterName}'`);
        return p.masterName;
      }
    }
    return inputName;
  }

  function stabilizeStockData(movements) {
    return movements.map(m => ({
      ...m,
      product_name: resolveMasterProduct(m.product_name || m.description)
    }));
  }

  window.ALKAM_PRODUCT_MASTER = {
    resolve: resolveMasterProduct,
    stabilize: stabilizeStockData,
    map: PRODUCT_MAP
  };

  window.ISTASYON_AUTOMATION_CORE = ISTASYON_AUTOMATION_CORE;

  console.info(`${MODULE_ID} aktif. Ürün isimleri akıllı eşleştiriliyor.`);
  console.info("İstasyON otomasyon çekirdeği hazır.", ISTASYON_AUTOMATION_CORE);
})();
