(function(){
  'use strict';
  const MODULE_ID = "ALKAM_PRODUCT_MASTER_V1";
  
  // 1. Akıllı Ürün Eşleştirme Sözlüğü
  // Her ürünün bir Master ID'si ve birden fazla tanınan takma adı (alias) vardır.
  const PRODUCT_MAP = [
    {
      masterId: "PROD_PATELLA_DIZLIK_2026",
      masterName: "2026 PATELLA DESTEKLİ DİZLİK",
      aliases: ["ORTOPEDİ TEKSTİL", "PATELLA DİZLİK", "ESKİ DİZLİK V1"],
      data: {
        lastPrice: 409.00,
        avgPrice: 378.00,
        lastYearPrice: 360.00,
        totalStock: 156 // 4+7+9+30+79+27
      }
    }
    // Gelecekte yeni ürünler buraya eklenecek
  ];

  /**
   * Herhangi bir ürün ismini alır ve Master İsme dönüştürür.
   * Eğer eşleşme bulamazsa orijinal ismi döner.
   */
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

  /**
   * Bir işlem listesi içindeki tüm ürün isimlerini stabilize eder.
   */
  function stabilizeStockData(movements) {
    return movements.map(m => ({
      ...m,
      product_name: resolveMasterProduct(m.product_name || m.description)
    }));
  }

  // Global erişim
  window.ALKAM_PRODUCT_MASTER = {
    resolve: resolveMasterProduct,
    stabilize: stabilizeStockData,
    map: PRODUCT_MAP
  };

  console.info(`${MODULE_ID} aktif. Ürün isimleri artık akıllı eşleştiriliyor.`);
})();
