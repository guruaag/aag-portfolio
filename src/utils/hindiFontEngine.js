/**
 * 10x Hindi Multi-Font & Typography Engine
 * Supports: Kruti Dev (010, 011, 020, 022, 030, 040), Devlys 010/020, Chanakya, Shusha
 * Features: Deep Nukta Normalization, Matra Stack Repair, Control Character Cleaning, Digit Toggling
 */

import { convertKrutiDevToUnicode, isKrutiDevText } from './krutiDevEngine.js';

export { convertKrutiDevToUnicode, isKrutiDevText };

/**
 * Chanakya -> Devanagari Mapping Table (Legacy Newspaper & Publishing Font)
 */
const CHANAKYA_REPLACEMENTS = [
  ['ç', 'प्र'],
  ['Ø', 'क्र'],
  ['J', 'श्र'],
  ['ä', 'क्त'],
  ['Ù', 'त्त'],
  ['}', 'द्व'],
  ['|', 'द्य'],
  ['<', 'ढ'],
  ['¶', 'फ्'],
  ['"V', 'ष्ट'],
  ['"B', 'ष्ठ'],
  ['"k', 'ष'],
  ['"', 'ष्'],
  ["'k", 'श'],
  ["'", 'श्'],
  ['â', 'म'],
  ['L', 'स्'],
  ['Q', 'फ'],
  ['q', 'ु'],
  ['z', '्र'],
  [',d', 'एक'],
  ['vkS', 'औ'],
  ['vks', 'ओ'],
  ['vk', 'आ'],
  ['AI', 'ऐ'],
  ['bZ', 'ई'],
  ['dks', 'को'],
  ['gSa', 'हैं'],
  ['gks', 'हो'],
  ['ksa', 'ों'],
  ['kks', 'ो'],
  ['kS', 'ौ'],
  ['kk', 'ा'],
  ['ks', 'ो'],
  ['[k', 'ख'],
  ['?k', 'घ'],
  ['>k', 'झ'],
  ['.k', 'ण'],
  ['Fk', 'थ'],
  ['/k', 'ध'],
  ['Hk', 'भ'],
  ['{k', 'क्ष'],
  ['Yk', 'ल्'],
  ['D', 'क्'],
  ['K', 'ख्'],
  ['X', 'ग्'],
  ['?', 'घ्'],
  ['P', 'च्'],
  ['T', 'ज्'],
  ['>', 'झ्'],
  ['.', 'ण्'],
  ['R', 'त्'],
  ['F', 'थ्'],
  ['/', 'ध्'],
  ['U', 'न्'],
  ['I', 'प्'],
  ['C', 'ब्'],
  ['H', 'भ्'],
  ['E', 'म्'],
  ['Y', 'य्'],
  ['O', 'व्'],
  ['v', 'अ'],
  ['b', 'इ'],
  ['m', 'उ'],
  ['Å', 'ऊ'],
  ['_', 'ऋ'],
  [',', 'ए'],
  ['k', 'ा'],
  ['h', 'ी'],
  ['w', 'ू'],
  ['W', 'ू'],
  ['s', 'े'],
  ['S', 'ै'],
  ['a', 'ं'],
  ['A', 'ँ'],
  ['d', 'क'],
  ['x', 'ग'],
  ['p', 'च'],
  ['N', 'छ'],
  ['t', 'ज'],
  ['V', 'ट'],
  ['B', 'ठ'],
  ['M', 'ड'],
  ['r', 'त'],
  ['n', 'द'],
  ['u', 'न'],
  ['i', 'प'],
  ['c', 'ब'],
  ['e', 'म'],
  [';', 'य'],
  ['j', 'र'],
  ['y', 'ल'],
  ['l', 'स'],
  ['g', 'ह'],
  ['o', 'व'],
  ['{', 'क्ष्']
];

/**
 * Shusha / Shivaji -> Devanagari Mapping Table
 */
const SHUSHA_REPLACEMENTS = [
  ['A', 'ा'],
  ['B', 'ि'],
  ['C', 'ी'],
  ['D', 'ु'],
  ['E', 'ू'],
  ['F', 'ृ'],
  ['G', 'े'],
  ['H', 'ै'],
  ['I', 'ो'],
  ['J', 'ौ'],
  ['K', 'ं'],
  ['L', 'ँ'],
  ['M', 'ः'],
  ['a', 'क'],
  ['b', 'ख'],
  ['c', 'ग'],
  ['d', 'घ'],
  ['e', 'ङ'],
  ['f', 'च'],
  ['g', 'छ'],
  ['h', 'ज'],
  ['i', 'झ'],
  ['j', 'ञ'],
  ['k', 'ट'],
  ['l', 'ठ'],
  ['m', 'ड'],
  ['n', 'ढ'],
  ['o', 'ण'],
  ['p', 'त'],
  ['q', 'थ'],
  ['r', 'द'],
  ['s', 'ध'],
  ['t', 'न'],
  ['u', 'प'],
  ['v', 'फ'],
  ['w', 'ब'],
  ['x', 'भ'],
  ['y', 'म'],
  ['z', 'य']
];

/**
 * Detects the legacy font family of the pasted string
 */
export function detectLegacyFont(text) {
  if (!text || typeof text !== 'string') return 'Unknown';
  const trimmed = text.trim();
  if (trimmed.length < 2) return 'Unknown';

  if (/[\u0900-\u097F]/.test(trimmed)) {
    if (/[Hkz"Vkpkj|lÙkk|çtk|f'k{kk]/.test(trimmed)) {
      return 'Kruti Dev / PageMaker (Hybrid)';
    }
    return 'Unicode Devanagari';
  }

  // 1. Unique Chanakya signatures (ß, Þ, Ý, Ü, Û, Ú)
  if (/(ß|Þ|Ý|Ü|Û|Ú)/.test(trimmed)) {
    return 'Chanakya Newspaper Font';
  }

  // 2. Kruti Dev / Devlys signatures
  if (isKrutiDevText(trimmed)) {
    if (/ñ|ò|ó|ô|õ/.test(trimmed)) {
      return 'Devlys 010 / 020';
    }
    return 'Kruti Dev 010 / 022 / 030 / PageMaker 5.0';
  }

  // 3. Extended Chanakya signatures
  if (/(×|Ö|Õ|Ô|Ó|Ò|Ñ|Ð)/.test(trimmed)) {
    return 'Chanakya Newspaper Font';
  }

  // 4. Shusha / Shivaji signatures
  if (/^[a-zABCDEFGHIJKLM\s.,!?\-]+$/.test(trimmed) && /[ABCDEFGHIJKLM]/.test(trimmed) && /[abcdefghijklmnopqrstuvwxyz]/.test(trimmed)) {
    return 'Shusha / Shivaji Font';
  }


  return 'Standard Text / ASCII';

}

/**
 * 1. Deep Nukta Normalization: Converts decomposed nuktas into pre-composed canonical Devanagari characters
 */
export function normalizeNuktaDevanagari(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replaceAll('ड\u093C', 'ड़')
    .replaceAll('ढ\u093C', 'ढ़')
    .replaceAll('ज\u093C', 'ज़')
    .replaceAll('फ\u093C', 'फ़')
    .replaceAll('क\u093C', 'क़')
    .replaceAll('ख\u093C', 'ख़')
    .replaceAll('ग\u093C', 'ग़')
    .replaceAll('र\u093C', 'ऱ');
}

/**
 * 2. PageMaker Control Character Cleaner: Strips non-printable ASCII/ANSI control bytes & soft hyphens
 */
export function cleanPageMakerControlChars(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replaceAll('\u0000', '')
    .replaceAll('\u0001', '')
    .replaceAll('\u0002', '')
    .replaceAll('\u0003', '')
    .replaceAll('\u0004', '')
    .replaceAll('\u0005', '')
    .replaceAll('\u0006', '')
    .replaceAll('\u0007', '')
    .replaceAll('\u0008', '')
    .replaceAll('\u000B', '')
    .replaceAll('\u000C', '')
    .replaceAll('\u000E', '')
    .replaceAll('\u000F', '')
    .replaceAll('\u0010', '')
    .replaceAll('\u0011', '')
    .replaceAll('\u0012', '')
    .replaceAll('\u0013', '')
    .replaceAll('\u0014', '')
    .replaceAll('\u0015', '')
    .replaceAll('\u0016', '')
    .replaceAll('\u0017', '')
    .replaceAll('\u0018', '')
    .replaceAll('\u0019', '')
    .replaceAll('\u001A', '')
    .replaceAll('\u001B', '')
    .replaceAll('\u001C', '')
    .replaceAll('\u001D', '')
    .replaceAll('\u001E', '')
    .replaceAll('\u001F', '')
    .replaceAll('\u00AD', '') // Soft hyphen
    .replaceAll('\u200B', '') // Zero-width space
    .replaceAll('\u200C', '') // ZWNJ
    .replaceAll('\u200D', '') // ZWJ
    .replaceAll('\t', ' '); // Normalize tabs to spaces
}

/**
 * 3. Matra & Halant Stack Repair: Cleans duplicate matras, misplaced halants, and Anusvara glitches
 */
export function fixMatraStacking(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replace(/ि{2,}/g, 'ि')
    .replace(/ी{2,}/g, 'ी')
    .replace(/ु{2,}/g, 'ु')
    .replace(/ू{2,}/g, 'ू')
    .replace(/े{2,}/g, 'े')
    .replace(/ै{2,}/g, 'ै')
    .replace(/ो{2,}/g, 'ो')
    .replace(/ौ{2,}/g, 'ौ')
    .replace(/्{2,}/g, '्')
    .replace(/ं{2,}/g, 'ं')
    .replace(/ँ{2,}/g, 'ँ')
    .replace(/ंँ/g, 'ं')
    .replace(/ँं/g, 'ँ');
}

/**
 * 4. Digit System Converter: Converts between ASCII digits (0-9) and Devanagari digits (०-९)
 */
export function convertDigits(text, mode = 'toDevanagari') {
  if (!text || typeof text !== 'string') return text || '';
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  
  if (mode === 'toDevanagari') {
    return text.replace(/[0-9]/g, digit => devanagariDigits[parseInt(digit, 10)]);
  } else {
    return text.replace(/[०-९]/g, digit => devanagariDigits.indexOf(digit).toString());
  }
}

/**
 * Chanakya -> Unicode Converter Function
 */
export function convertChanakyaToUnicode(text) {
  if (!text || typeof text !== 'string') return text || '';
  let str = cleanPageMakerControlChars(text);
  
  for (const [from, to] of CHANAKYA_REPLACEMENTS) {
    str = str.replaceAll(from, to);
  }
  
  return fixMatraStacking(normalizeNuktaDevanagari(str));
}

/**
 * Shusha -> Unicode Converter Function
 */
export function convertShushaToUnicode(text) {
  if (!text || typeof text !== 'string') return text || '';
  let str = text;
  for (const [from, to] of SHUSHA_REPLACEMENTS) {
    str = str.replaceAll(from, to);
  }
  return fixMatraStacking(normalizeNuktaDevanagari(str));
}

/**
 * Master Universal Font Converter: Converts any supported legacy Hindi font (Kruti Dev, Devlys, Chanakya, Shusha)
 */
export function convertUniversalHindiFont(text, options = {}) {
  if (!text || typeof text !== 'string') return text || '';

  const detected = options.font || detectLegacyFont(text);
  let cleaned = cleanPageMakerControlChars(text);


  let result = cleaned;

  if (detected.includes('Chanakya')) {
    result = convertChanakyaToUnicode(cleaned);
  } else if (detected.includes('Shusha')) {
    result = convertShushaToUnicode(cleaned);
  } else {
    // Default: Kruti Dev 010/022 / Devlys 010/020 / PageMaker 5.0
    result = convertKrutiDevToUnicode(cleaned);
  }

  // Apply Deep Typography Post-Processing
  if (options.normalizeNukta !== false) {
    result = normalizeNuktaDevanagari(result);
  }
  if (options.fixMatra !== false) {
    result = fixMatraStacking(result);
  }
  if (options.digits === 'toDevanagari') {
    result = convertDigits(result, 'toDevanagari');
  } else if (options.digits === 'toASCII') {
    result = convertDigits(result, 'toASCII');
  }

  return result;
}
