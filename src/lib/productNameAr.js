// Arabic display names for catalog products (word-by-word, longest phrases first)
const WORDS = [
  ['Long Cube Ice', 'مكعبات ثلج طويلة'], ['Long Ice Cubes', 'مكعبات ثلج طويلة'], ['Ice Cubes', 'مكعبات ثلج'],
  ['Ice Cube', 'مكعب ثلج'], ['Ice Ball', 'كرات ثلج'], ['Ice Cup', 'أكواب ثلج'], ['Tube Ice', 'ثلج أنبوبي'],
  ['Tokyo Ice', 'ثلج طوكيو'], ['Crushed Ice', 'ثلج مجروش'], ['Solid Ice', 'ثلج صلب'], ['Flake Ice', 'ثلج رقائق'],
  ['Dry Ice', 'ثلج جاف'], ['Diamond Ice', 'ثلج الماس'], ['Full Moon Ice', 'ثلج البدر'], ['Dubai Ice', 'ثلج دبي'],
  ['Pool Block Ice', 'لوح ثلج للمسابح'], ['Block Ice', 'لوح ثلج'], ['Customized', 'مخصص'],
  ['Normal', 'عادي'], ['Lemon', 'ليمون'], ['Strawberry', 'فراولة'], ['Orange', 'برتقال'], ['Mint', 'نعناع'],
  ['Lavander', 'لافندر'], ['Flower', 'زهور'], ['Gold', 'ذهبي'], ['Silver', 'فضي'], ['Fruit', 'فواكه'],
  ['Luxury', 'فاخر'], ['Bentley', 'بنتلي'], ['EMAAR', 'إعمار'], ['Ice', 'ثلج'], ['Pcs', 'قطع'], ['pcs', 'قطع'], ['kg', 'كجم'],
];

export const UNIT_AR = { kg: 'كجم', piece: 'قطعة', box: 'علبة', pack: 'عبوة', liter: 'لتر' };

export function productNameAr(name) {
  return WORDS.reduce((s, [en, ar]) => s.replace(new RegExp(`\\b${en}\\b`, 'g'), ar), name);
}