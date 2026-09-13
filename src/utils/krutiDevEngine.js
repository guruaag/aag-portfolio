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

  // Preserve Kruti Dev ligatures using right single quote ’ before quote mapping
  str = str.replaceAll('’V', 'ष्ट').replaceAll('’B', 'ष्ठ').replaceAll('’k', 'ष्');

  // Convert Windows smart/curly quotes to standard ASCII quotes
  str = str.replaceAll('‘', "'").replaceAll('’', "'").replaceAll('“', '"').replaceAll('”', '"');

  // Extended PageMaker ANSI byte mappings
  const pm5Map = {
    'â': 'म',
    'ä': 'द्य',
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

  // Check for unique extended Kruti Dev symbols
  if (/[ñòôõö÷øùúûüýþÿµ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöâ]/.test(raw)) {
    return true;
  }

  // Count matches of Kruti Dev signature substrings
  const cleanSpace = raw.replaceAll('\u00A0', ' ').replaceAll('\r\n', '\n');
  const words = cleanSpace.split(/\s+/);
  let krutiMatches = 0;
  let totalWords = 0;

  for (const word of words) {
    // Ignore numbers, punctuation, or legitimate English words/titles
    if (/^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(word)) continue;
    if (/^[a-zA-Z]{3,}$/.test(word) && !/(dks|esa|gSa|gks|vks|rFkk|ysfdu|lkFk|fjd|djk|f'|dky|j'|vXf)/i.test(word)) {
      // Standard English word without Kruti Dev signature combinations
      continue;
    }
    
    totalWords++;

    let hasPattern = false;
    for (const sig of KRUTI_DEV_SIGNATURES) {
      if (word.includes(sig) || word.includes("f'") || word.includes("'k") || word.includes("[k")) {
        hasPattern = true;
        break;
      }
    }
    if (hasPattern) krutiMatches++;
  }

  if (totalWords === 0) return false;
  return (krutiMatches / totalWords) >= 0.20;
}


/**
 * Converts a single Kruti Dev token string to Unicode Devanagari
 */
function convertKrutiDevSingleToken(str) {
  if (!str) return '';

  // Step 0: Alt-codes and Mac Option-code Normalization
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
    '¶': 'न',
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

  // Step 1: Pre-processed Substitutions for Complex Conjuncts & Special Symbols
  const replacements = [
    ['[k', 'ख'],
    ['?k', 'घ'],
    ['>k', 'झ'],
    ['.k', 'ण'],
    ['Fk', 'थ'],
    ['/k', 'ध'],
    ['Hk', 'भ'],
    ['{k', 'क्ष'],
    ["'k", 'श'],
    ['"k', 'श'],
    ["'", 'श्'],
    ['"', 'श्'],
    ['â', 'म'],
    ['Dkz', 'क्र'],
    ['=k', 'त्रा'],
    ['=\'', 'त्र'],
    ['=', 'त्र'],
    ['nz', 'द्र'],
    ['n~', 'द्ध'],
    ['’V', 'ष्ट'],
    ['’B', 'ष्ठ'],
    ['’k', 'ष्'],
    ['ä', 'द्य'],
    ['ö', 'द्व'],
    ['ê', 'हृ'],
    ['ë', 'ह्म'],
    ['ì', 'ह्न'],
    ['î', 'ह्न्'],
    ['™', '्र'],
    ['ç', '्र'],

    // Multi-char vowel/consonant combinations (MUST BE BEFORE single chars)
    ['dks', 'को'],
    ['gSa', 'हैं'],
    ['gks', 'हो'],
    ['vks', 'ओ'],
    ['vkS', 'औ'],
    ['vk', 'आ'],
    ['AI', 'ऐ'],
    ['bZ', 'ई'],
    ['kks', 'ो'],
    ['kkj', 'ॉर'],
    ['kS', 'ौ'],
    ['kk', 'ा'],
    ['ks', 'े'],
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
    ['q', 'फ्'],
    ['C', 'ब्'],
    ['H', 'भ्'],
    ['E', 'म्'],
    ['Y', 'य्'],
    ['Yk', 'ल्'],
    ['V', 'व्'],
    ['L', 'ष्'],
    ['O', 'व्'],

    ['v', 'अ'],
    ['b', 'इ'],
    ['m', 'उ'],
    ['Å', 'ऊ'],
    ['_', 'ऋ'],
    [',', 'ए'],

    ['k', 'ा'],
    ['h', 'ी'],
    ['w', 'ु'],
    ['W', 'ू'],
    ['s', 'े'],
    ['S', 'ै'],
    ['a', 'ं'],
    ['A', 'ँ'],
    ['è', 'ॅ'],
    ['`', 'ृ'],
    ['~', '्'],

    // Consonants
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
    ['Q', 'फ'],
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

  for (const [from, to] of replacements) {
    if (from) {
      str = str.replaceAll(from, to);
    }
  }

  // Step 2: Pass 1 - Lookahead Positioning for Pre-Consonant Matra 'f' (ि)
  let positionOfF = str.indexOf('f');
  while (positionOfF !== -1) {
    let nextCharPos = positionOfF + 1;
    let characterToShift = '';

    while (nextCharPos < str.length) {
      const c = str.charAt(nextCharPos);
      characterToShift += c;
      if (c !== '्' && c !== ' ' && c !== '\n') {
        break;
      }
      nextCharPos++;
    }

    str =
      str.substring(0, positionOfF) +
      characterToShift +
      'ि' +
      str.substring(positionOfF + 1 + characterToShift.length);

    positionOfF = str.indexOf('f', positionOfF + 1);
  }

  // Step 3: Pass 2 - Reph 'Z' (र्) Positioning
  let positionOfZ = str.indexOf('Z');
  while (positionOfZ !== -1) {
    let prevCharPos = positionOfZ - 1;
    let characterToShift = '';

    while (prevCharPos >= 0) {
      const c = str.charAt(prevCharPos);
      characterToShift = c + characterToShift;
      if (c !== '्') {
        break;
      }
      prevCharPos--;
    }

    str =
      str.substring(0, prevCharPos) +
      'र्' +
      characterToShift +
      str.substring(positionOfZ + 1);

    positionOfZ = str.indexOf('Z', positionOfZ + 1);
  }

  // Clean up residual Z or f if any
  str = str.replaceAll('Z', 'र्').replaceAll('f', 'ि');

  return str;
}

/**
 * Main Conversion Function: Kruti Dev 010 & 022 ASCII to Unicode Devanagari
 * Preserves English words and numbers while converting Kruti Dev legacy snippets.
 */
export function convertKrutiDevToUnicode(text) {
  if (!text || typeof text !== 'string') return text || '';

  const normalizedText = normalizePageMaker5Text(text);

  // Split string into words and delimiters while preserving whitespace and sentence punctuation
  const tokens = normalizedText.split(/(\s+|[-–—:,()])/);

  return tokens.map(token => {
    if (!token || /^\s+$/.test(token) || /^[-–—:,()]+$/.test(token)) {
      return token;
    }

    // Preserve pure numbers
    if (/^[0-9]+$/.test(token)) {
      return token;
    }

    // Check if token is standard English dictionary word (e.g. "Kavya", "Sangrah", "PageMaker", "Author", "Published")
    const isStandardEnglishWord = /^(kavya|sangrah|prakashan|pustak|vol|volume|edition|published|page|pagemaker|author|title|by|in|at|on|for|with|and|or|the|a|an|is|are|of|to|from)$/i.test(token);
    if (isStandardEnglishWord) {
      return token;
    }

    // If token matches standard English capitalization (e.g. "Poetry", "Archive") AND has no Kruti Dev signature patterns/symbols
    if (/^[A-Z][a-z]{2,}$/.test(token)) {
      const lower = token.toLowerCase();
      const krutiPatterns = ['dks', 'esa', 'gSa', 'gks', 'vks', 'rFkk', 'ysfdu', 'lkFk', 'dfork', 'j\'âjk', 'vXfu', 'dy\'k', 'ugha', 'ugh', 'kz', 'nz', 'n~'];
      if (!krutiPatterns.some(pat => lower.includes(pat))) {
        return token;
      }
    }

    return convertKrutiDevSingleToken(token);
  }).join('');
}
