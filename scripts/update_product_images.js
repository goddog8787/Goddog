import fs from 'fs';

const imageMap = {
  'test-01': '/images/products/refill_yellow.webp',
  'fil-01': '/images/products/hyper_pla_red.webp',
  'fil-01b': '/images/products/pla_white.webp',
  'fil-02': '/images/products/pla_cf_black.webp',
  'fil-07': '/images/products/pla_matte.webp',
  'fil-08': '/images/products/pla_silk.webp',
  'fil-09': '/images/products/pla_wood.webp',
  'fil-10': '/images/products/pla_glow.webp',
  'fil-11': '/images/products/lw_pla.webp',
  'fil-03': '/images/products/petg_blue.webp',
  'fil-12': '/images/products/petg_translucent.webp',
  'fil-13': '/images/products/petg_cf.webp',
  'fil-14': '/images/products/petg_esd.webp',
  'fil-05': '/images/products/abs_black.webp',
  'fil-15': '/images/products/asa_grey.webp',
  'fil-16': '/images/products/pc_abs.webp',
  'fil-04': '/images/products/tpu_orange.webp',
  'fil-17': '/images/products/tpu_cyan.webp',
  'fil-18': '/images/products/tpu_64d.webp',
  'fil-19': '/images/products/pa6_cf.webp',
  'fil-20': '/images/products/pa12_cf.webp',
  'fil-21': '/images/products/pa_gf.webp',
  'fil-22': '/images/products/nylon_natural.webp',
  'fil-23': '/images/products/pc_clear.webp',
  'fil-24': '/images/products/pp_poly.webp',
  'fil-25': '/images/products/pva_support.webp',
  'fil-26': '/images/products/peek_ultem.webp',
  'fil-06': '/images/products/resin_8k_grey.svg',
  'fil-27': '/images/products/resin_abs_tough.svg',
  'acc-01': '/images/products/dryer_box_s2.svg',
  'acc-02': '/images/products/pei_textured_sheet.svg',
  'acc-03': '/images/products/nozzle_hardened_steel.webp',
};

let content = fs.readFileSync('src/data/allMarketProducts.ts', 'utf8');

// Parse items by regex and replace imageUrl
let updatedCount = 0;
for (const [id, newUrl] of Object.entries(imageMap)) {
  // Regex to match the block starting with id: 'id' until imageUrl: '...'
  const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?imageUrl:\\s*['"])([^'"]+)(['"])`);
  if (regex.test(content)) {
    content = content.replace(regex, `$1${newUrl}$3`);
    updatedCount++;
  } else {
    console.warn(`Could not find id: ${id} in allMarketProducts.ts`);
  }
}

fs.writeFileSync('src/data/allMarketProducts.ts', content, 'utf8');
console.log(`Successfully updated ${updatedCount} products in allMarketProducts.ts!`);
