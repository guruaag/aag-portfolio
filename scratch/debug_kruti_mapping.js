import { convertKrutiDevToUnicode } from '../src/utils/krutiDevEngine.js';

console.log('====================================================');
console.log('🧪 TESTING KRUTI DEV 010 MAPPING FIX FOR \'k, \', AND â');
console.log('====================================================\n');

function testConversionWithFix(text) {
  let str = text;

  // Pre-normalize PageMaker 5.0 whitespace
  str = str.replaceAll('\u00A0', ' ').replaceAll('\u200B', '').replaceAll('\r\n', '\n').replaceAll('\r', '\n');

  // Preserve smart quotes
  str = str.replaceAll('‘', "'").replaceAll('’', "'").replaceAll('“', '"').replaceAll('”', '"');

  // Key Kruti Dev 010 character mappings:
  // 'k -> श (e.g. dky'k = कलश, f'k[kkvksa = शिखाओं)
  // "k -> श
  // ' -> श्
  // " -> श्
  // â -> म
  // [k -> ख

  const fixes = [
    ["'k", "श"],
    ['"k', "श"],
    ["'", "श्"],
    ['"', "श्"],
    ["â", "म"],
    ["[k", "ख"],
    ["?k", "घ"],
    [">k", "झ"],
    [".k", "ण"],
    ["Fk", "थ"],
    ["/k", "ध"],
    ["Hk", "भ"],
    ["{k", "क्ष"]
  ];

  for (const [from, to] of fixes) {
    str = str.replaceAll(from, to);
  }

  return convertKrutiDevToUnicode(str);
}

const input1 = "j'âjk dky'k dh f'k[kkvksa esa";
console.log(`Raw Input:    "${input1}"`);
console.log(`Fixed Output: "${testConversionWithFix(input1)}"`);
