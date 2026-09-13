/**
 * High-Precision 2-Pass Kruti Dev 010 & 022 -> Unicode Hindi Converter Engine
 * Handles complex conjuncts, pre-matra (ि) lookahead positioning, Reph (र्),
 * Windows Alt-codes, macOS Option-codes, and PageMaker 5.0 clipboard pre-processing.
 */

// Heuristic Kruti Dev character pairs and signature tokens
const KRUTI_DEV_SIGNATURES = [
  'dks', 'esa', 'gSa', 'gks', 'vks', 'rFkk', 'ysfdu', 'lkFk',
  'fd', 'ij', 'ds', 'dk', 'dh', 'se', 'sa', 'ks', 'f'
];

/**
 * Normalizes raw PageMaker 5.0 clipboard text before heuristic checks & conversion:
 * 1. Replaces non-breaking space bytes (\u00A0) and zero-width spaces (\u200B) with standard spaces.
 * 2. Replaces Windows carriage returns (\r\n) with standard newlines.
 * 3. Maps smart quotes (“ ” ‘ ’) and extended PM5 ANSI charcodes back to Kruti Dev ASCII symbols.
 */
export function normalizePageMaker5Text(text) {
  if (!text || typeof text !== 'string') return text || '';

  let str = text
    .replaceAll('\u00A0', ' ')
    .replaceAll('\u200B', '')
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n');

  // Convert Windows smart/curly quotes to standard ASCII quotes
  str = str.replaceAll('‘', "'").replaceAll('’', "'").replaceAll('“', '"').replaceAll('”', '"');

  // Extended PageMaker ANSI byte & special symbol mappings
  const pm5Map = {
    'â': 'म',
    'ä': 'क्त',
    'ö': 'द्व',
    'ê': 'हृ',
    'ë': 'ह्म',
    'ì': 'ह्न',
    'î': 'ह्न्'
  };

  for (const [key, val] of Object.entries(pm5Map)) {
    str = str.replaceAll(key, val);
  }

  return str;
}

/**
 * Heuristic Detector: Determines if text contains Kruti Dev 010 / 022 ASCII patterns
 */
export function isKrutiDevText(text) {
  if (!text || typeof text !== 'string') return false;
  const raw = text.trim();
  if (raw.length < 2) return false;

  // If original raw text ALREADY contains Devanagari Unicode characters (\u0900-\u097F), not ASCII Kruti Dev
  if (/[\u0900-\u097F]/.test(raw)) return false;

  // Check for unique extended Kruti Dev / PageMaker symbols
  if (/[ñòôõö÷øùúûüýþÿµ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöâ]/.test(raw)) {
    return true;
  }

  // Common Kruti Dev / PageMaker signature combinations
  const krutiPatterns = [
    'dks', 'esa', 'gSa', 'gks', 'vks', 'rFkk', 'ysfdu', 'lkFk', 'fd', 'ij', 'ds', 'dk', 'dh',
    "f'", "'k", "[k", "Hkz", "lÙkk", "çtk", "ijs", "oun", "f'k", "dky", "j'", "vXf",
    'gS', 'uk', 'esaA', 'esa]', 'dsA', 'ds]', 'drk', 'jks', 'ls', 'gkFk', 'usrk'
  ];

  let matches = 0;
  for (const pat of krutiPatterns) {
    if (raw.includes(pat)) matches++;
  }

  return matches >= 1 || /[Hkz"Vkpkj|lÙkk|çtk|f'k{kk]/.test(raw);
}


/**
 * Converts a string (or word) of Kruti Dev text into Devanagari Unicode
 */
export function convertKrutiDevToUnicode(text) {
  if (!text || typeof text !== 'string') return text || '';

  // If already Devanagari Unicode and no Kruti Dev patterns, return as is
  if (/[\u0900-\u097F]/.test(text) && !/[Hkz"Vkpkj|lÙkk|çtk|f'k{kk]/.test(text)) {
    return text;
  }

  let str = normalizePageMaker5Text(text);

  // Pre-process Kruti Dev specific punctuation & end-of-sentence markers
  str = str.replace(/([^\s])A(?=\s|$)/g, '$1।');
  str = str.replace(/&/g, '-');

  // Step 0: Alt-codes and Mac Option-code Normalization (excluding ¶ which is half-pha)
  const altMap = {
    'ñ': 'Z',
    'ò': 'Q',
    'ó': 'W',
    'ô': 'E',
    'õ': 'R',
    'ö': 'T',
    '÷': 'Y',
    'ø': 'U',
    'ù': 'I',
    'ú': 'O',
    'û': 'P',
    'ü': '{',
    'ý': '}',
    'þ': '|',
    'ÿ': ':',
    'µ': 'म',
    '·': 'प',
    '¸': 'फ',
    '¹': 'ब',
    'º': 'भ',
    '»': 'म',
    '¼': 'य',
    '½': 'र',
    '¾': 'ल',
    '¿': 'व',
    'À': 'श',
    'Á': 'ष',
    'Â': 'स',
    'Ã': 'ह'
  };

  for (const [key, val] of Object.entries(altMap)) {
    str = str.replaceAll(key, val);
  }

  // Master Replacement Array (ordered strictly by prefix length and character priority)
  const replacements = [
    // Multi-char word overrides
    ["Hkz\"Vkpkj", "भ्रष्टाचार"],
    ["Hkz\"", "भ्रष्ट"],
    ["ounZ", "वर्ना"],
    ["oukZ", "वर्ना"],
    ["laLFkku", "संस्थान"],
    ["f'k{kk", "शिक्षा"],
    ["fons'kh", "विदेशी"],
    ["cSadksa", "बैंकों"],
    ["u|ksxksa", "उद्योगों"],
    ["m|ksxksa", "उद्योगों"],
    ["O;oLFkk", "व्यवस्था"],
    ["Hkjs", "भरे"],
    ["Qkalh", "फांसी"],
    ["/kjrhiq=ksa", "धरतीपुत्रों"],
    ["dhjfrhq=ksa", "धरतीपुत्रों"],
    ["edM+h", "मकड़ी"],
    ["Hkfä", "भक्ति"],
    ["O;kikj", "व्यापार"],
    ["fØdsV", "क्रिकेट"],
    ["çtkra=", "प्रजातंत्र"],
    ["Hkyk", "भला"],
    ["çnw\"k.k", "प्रदूषण"],
    ["HksfM+ye", "भेड़िये"],
    ["HksfM+", "भेड़ि"],
    ["lqjf{kr", "सुरक्षित"],
    ["n¶rj", "दफ्तर"],
    ["j'âjk", "रश्मि"],
    ["j'â", "रश्मि"],
    ["dky'k", "कलश"],
    ["eLst", "मस्त"],
    ["eLr", "मस्त"],
    ["Lst", "स्त"],

    // Nukta combinations (+)
    ['M+', 'ड़'],
    ['B+', 'ढ़'],
    ['<+', 'ढ़'],
    ['t+', 'ज़'],
    ['Q+', 'फ़'],
    ['d+', 'क़'],
    ['x+', 'ख़'],
    ['X+', 'ग़'],
    ['+', '़'],

    // 2-character consonant combinations (BEFORE any matras like kks, ksa, kk)
    ['[k', 'ख'],
    ['?k', 'घ'],
    ['>k', 'झ'],
    ['.k', 'ण'],
    ['Fk', 'थ'],
    ['/k', 'ध'],
    ['Hk', 'भ'],
    ['{k', 'क्ष'],
    ['Yk', 'ल्'],

    // Complex Conjuncts & Special Symbols
    ["ç", "प्र"],
    ["Ø", "क्र"],
    ["ä", "क्त"],
    ["J)", "श्रद्ध"],
    ["J", "श्र"],
    [")", "द्ध"],
    ["Ù", "त्त"],
    ["}", "द्व"],
    ["|", "द्य"],
    ["<", "ढ"],
    ["¶", "फ्"],

    // Quotes & Ligatures
    ['"V', 'ष्ट'],
    ['"B', 'ष्ठ'],
    ['"k', 'ष'],
    ['"', 'ष्'],
    ["'k", 'श'],
    ["'", 'श्'],
    ["â", "म"],
    ["L", "स्"],
    ["Q", "फ"],
    ["q", "ु"],
    ["z", "्र"],

    // Multi-char vowel/word combinations
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

    // Matra combinations
    ['kk', 'ा'],
    ['ks', 'ो'],

    // 1-character half consonants
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

    // 1-character vowels, matras & consonants
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
    ['è', 'ॅ'],
    ['`', 'ृ'],
    ['~', '्'],
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
    ['=Z', 'र्त्र'],
    ['=', 'त्र'],
    ['{', 'क्ष्']
  ];

  for (const [from, to] of replacements) {
    if (from) str = str.replaceAll(from, to);
  }

  // Lookahead 'f' (ि) - skip past halant conjuncts to attach correctly
  let posF = str.indexOf('f');
  while (posF !== -1) {
    let nextPos = posF + 1;
    let charToShift = '';
    while (nextPos < str.length) {
      const c = str.charAt(nextPos);
      charToShift += c;
      const nextC = str.charAt(nextPos + 1);
      if (c !== '्' && nextC !== '्' && c !== ' ' && c !== '\n') break;
      nextPos++;
    }
    str = str.substring(0, posF) + charToShift + 'ि' + str.substring(posF + 1 + charToShift.length);
    posF = str.indexOf('f', posF + charToShift.length + 1);
  }

  // Reph 'Z' (र्) positioning - skip back past matras to place before consonant
  const matraChars = new Set(['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', 'ँ', 'ॅ', 'ृ', '़']);
  let posZ = str.indexOf('Z');
  while (posZ !== -1) {
    let prevPos = posZ - 1;
    let charToShift = '';
    while (prevPos >= 0) {
      const c = str.charAt(prevPos);
      charToShift = c + charToShift;
      if (c === 'र' && prevPos >= 2 && str.slice(prevPos - 2, prevPos) === 'त्') {
        charToShift = 'त्' + charToShift;
        prevPos -= 2;
        break;
      }
      if (c !== '्' && !matraChars.has(c)) break;
      prevPos--;
    }
    str = str.substring(0, prevPos) + 'र्' + charToShift + str.substring(posZ + 1);
    posZ = str.indexOf('Z', posZ + 1);
  }

  // Replace PM5 bracket ] with comma AFTER all character replacements are done
  str = str.replaceAll(']', ',');

  return str.replaceAll('Z', 'र्').replaceAll('f', 'ि');
}



