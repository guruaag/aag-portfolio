/**
 * Kruti Dev 010 / Devlys 010 to Unicode Hindi Converter Utility
 * Designed for legacy PageMaker 5.0 / Word Hindi text migration
 */

export function convertKrutiDevToUnicode(str) {
  if (!str || typeof str !== 'string') return '';

  let text = str;

  // Array of Kruti Dev strings and their Unicode equivalents
  const array_one = [
    "ñ", "Q+", "w+", "g+", "j+", "z+", "c+", "f+", "q+", "k+", "n+", "v+", "y+", "r+", "C+", "N+", "E+", "I+",
    "«", "ñ", "º", "»", "¥", "·", "∙", "½", "¾", "¿", "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê",
    "k~", "k%", "d~", "d%", "s~", "s%", "g~", "g%", "T~", "T%", "V~", "V%", "M~", "M%", "<~", "<%", "D~", "D%",
    "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ð", "ñ", "ò", "ó", "ô", "õ", "ö", "÷", "ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ",
    "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "×", "Ø", "Ù", "Ú", "Û", "Ü", "Ý", "Þ", "ß", "à", "á",
    "ñ", "Q", "w", "g", "j", "z", "c", "f", "q", "k", "n", "v", "y", "r", "C", "N", "E", "I",
    "’", "‘", "”", "“", "—", "–", "…", "™", "®", "©", "º", "×", "÷", "±", "≠", "≤", "≥", "∞", "≈",
    "A", "B", "D", "F", "G", "H", "J", "K", "L", "M", "O", "P", "R", "S", "T", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/", ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "_", "`", "{", "|", "}", "~"
  ];

  // We perform step-by-step regex replacement based on established Kruti Dev 010 transformation rules
  const krutiDevMap = [
    // Special Symbols & Half Letters
    ["ñ", "Z"], ["Q+", "फ़्"], ["w+", "Autonomous"], ["g+", "ग़्"], ["j+", "ज़्"], ["z+", "़"], ["c+", "्च्"],
    ["f+", "फ़्"], ["q+", "क़्"], ["k+", "ा़"], ["n+", "ऩ्"], ["v+", "अ़"], ["y+", "य़्"], ["r+", "ऱ्"],
    ["C+", "च्&"], ["N+", "झ्&"], ["E+", "ै&"], ["I+", "ी&"],

    ["«", "“"], ["º", "”"], ["»", "”"], ["¥", "•"], ["·", "∙"],

    // Special ligatures
    ["º", "०"], ["½", "॥"], ["¾", "1"], ["¿", "2"], ["À", "3"], ["Á", "4"], ["Â", "5"], ["Ã", "6"], ["Ä", "7"], ["Å", "8"], ["Æ", "9"],
    ["Ç", "W"], ["È", "X"], ["É", "Y"], ["Ê", "Z"],

    // Compound character glyphs
    ["å", "ह्न"], ["ƒ", "努"], ["â", "द्व"], ["ã", "द्द"], ["ä", "द्य"], ["å", "ह्न"], ["æ", "ह्म"], ["ç", "ह्य"], ["è", "हृ"], ["é", "ह्म"],
    ["ê", "ह्य"], ["ë", "ह्र"], ["ì", "ह्न"], ["í", "ह्व"], ["î", "द्ग"], ["ï", "द्घ"], ["ð", "द्द"], ["ñ", "द्व"], ["ò", "द्भ"], ["ó", "द्म"],
    ["ô", "द्य"], ["õ", "द्व"], ["ö", "द्व"], ["÷", "÷"], ["ø", "ø"], ["ù", "ù"], ["ú", "ú"], ["û", "û"], ["ü", "ü"], ["ý", "ý"], ["þ", "þ"], ["ÿ", "ÿ"],

    ["Ñ", "्न्"], ["Ò", "्म्"], ["Ó", "्य्"], ["Ô", "्ल्"], ["Õ", "्व्"], ["Ö", "्श्"], ["×", "्ष्"], ["Ø", "्स्"], ["Ù", "्ह्"],
    ["Ú", "्ज्ञ"], ["Û", "्त्य"], ["Ü", "्त्व"], ["Ý", "्त्न्"], ["Þ", "्त्म्"], ["ß", "्त्स्"], ["à", "्त्थ्"], ["á", "्द्भ"],

    // Kruti Dev Alphabetic glyph replacements
    ["â", "द्व"], ["ã", "द्द"], ["ä", "द्य"], ["å", "ह्न"], ["æ", "ह्म"], ["ç", "ह्य"], ["è", "हृ"],
    ["é", "द्र"], ["ê", "द्र्"], ["ë", "्र"], ["ì", "ुँ"], ["í", "ुं"], ["î", "ूँ"], ["ï", "ूं"],

    ["=", "्र"], ["_", "्"], ["ò", "ह्न"], ["ó", "ह्म"], ["ô", "ह्य"], ["õ", "हृ"], ["ö", "द्र"],

    ["0", "०"], ["1", "१"], ["2", "२"], ["3", "३"], ["4", "४"], ["5", "५"], ["6", "६"], ["7", "७"], ["8", "८"], ["9", "९"],

    ["F", "ँ"], ["G", "्"], ["H", "्"], ["I", "ी"], ["J", "ो"], ["K", "ौ"], ["L", "ं"], ["M", "ं"],
    ["N", "छ"], ["O", "ओ"], ["P", "औ"], ["Q", "फ"], ["R", "ृ"], ["S", "ए"], ["T", "ऐ"], ["U", "ऊ"], ["V", "अं"], ["W", "ऑ"], ["X", "ऑ"], ["Y", "इ"], ["Z", "ई"],

    ["a", "ं"], ["b", "ि"], ["c", "े"], ["d", "क"], ["e", "म"], ["f", "ि"], ["g", "न"], ["h", "प"], ["i", "ग"], ["j", "र"], ["k", "ा"], ["l", "स"], ["m", "स"], ["n", "द"], ["o", "द"], ["p", "च"], ["q", "ु"], ["r", "त"], ["s", "े"], ["t", "ू"], ["u", "ह"], ["v", "अ"], ["w", "ू"], ["x", "ग"], ["y", "ब"], ["z", "़"],

    ["A", "ा"], ["B", "ै"], ["C", "ण"], ["D", "क"], ["E", "ै"], ["F", "ँ"], ["G", "ा"], ["H", "ी"], ["I", "ी"], ["J", "ो"], ["K", "ौ"], ["L", "ं"], ["M", "ं"], ["N", "छ"], ["O", "ओ"], ["P", "औ"], ["Q", "फ"], ["R", "ृ"], ["S", "ए"], ["T", "ऐ"], ["U", "ऊ"], ["V", "अं"], ["W", "ऑ"], ["X", "ऑ"], ["Y", "इ"], ["Z", "ई"]
  ];

  // Primary Substitution Loop
  // Standard Kruti Dev 010 Character Replacements
  let modifiedText = text;

  // Replace special multi-char glyphs first
  modifiedText = modifiedText.replace(/ñ/g, "Z");
  modifiedText = modifiedText.replace(/Q\+/g, "फ़्");
  modifiedText = modifiedText.replace(/g\+/g, "ग़्");
  modifiedText = modifiedText.replace(/j\+/g, "ज़्");
  modifiedText = modifiedText.replace(/z\+/g, "़");
  modifiedText = modifiedText.replace(/c\+/g, "्च्");
  modifiedText = modifiedText.replace(/f\+/g, "फ़्");
  modifiedText = modifiedText.replace(/q\+/g, "क़्");

  modifiedText = modifiedText.replace(/«/g, "“");
  modifiedText = modifiedText.replace(/»/g, "”");
  modifiedText = modifiedText.replace(/â/g, "द्व");
  modifiedText = modifiedText.replace(/ã/g, "द्द");
  modifiedText = modifiedText.replace(/ä/g, "द्य");
  modifiedText = modifiedText.replace(/å/g, "ह्न");
  modifiedText = modifiedText.replace(/æ/g, "ह्म");
  modifiedText = modifiedText.replace(/ç/g, "ह्य");
  modifiedText = modifiedText.replace(/è/g, "हृ");
  modifiedText = modifiedText.replace(/é/g, "द्र");
  modifiedText = modifiedText.replace(/ê/g, "द्र्");
  modifiedText = modifiedText.replace(/ë/g, "्र");

  // Single Character Maps
  const map = {
    'k': 'ा', 'l': 'स', 'm': 'स', 'n': 'द', 'o': 'द', 'p': 'च', 'q': 'ु', 'r': 'त', 's': 'े', 't': 'ू',
    'u': 'ह', 'v': 'अ', 'w': 'ू', 'x': 'ग', 'y': 'ब', 'z': '़',
    'A': 'ा', 'B': 'ै', 'C': 'ण', 'D': 'क', 'E': 'ै', 'F': 'ँ', 'G': 'ा', 'H': 'ी', 'I': 'ी', 'J': 'ो',
    'K': 'ौ', 'L': 'ं', 'M': 'ं', 'N': 'छ', 'O': 'ओ', 'P': 'औ', 'Q': 'फ', 'R': 'ृ', 'S': 'ए', 'T': 'ऐ',
    'U': 'ऊ', 'V': 'अं', 'W': 'ऑ', 'X': 'ऑ', 'Y': 'इ', 'Z': 'ई',
    'a': 'ं', 'b': 'ि', 'c': 'े', 'd': 'क', 'e': 'म', 'f': 'ि', 'g': 'न', 'h': 'प', 'i': 'ग', 'j': 'र',
    'K': 'ौ', 'L': 'ं', 'M': 'ं', 'N': 'छ', 'O': 'ओ', 'P': 'औ', 'Q': 'फ', 'R': 'ृ', 'S': 'ए', 'T': 'ऐ',
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
    '`': '़', '~': '़', '!': '।', '@': '/', '#': ':', '$': '‘', '%': '’', '^': '“', '&': '”', '*': '(',
    '(': 'y', ')': ']', '-': '-', '_': '्', '=': '्र', '+': '्', '[': 'D', ']': '़', '{': 'द्द', '}': 'द्य',
    '\\': '?', '|': '|', ';': 'y', ':': 'R', '\'': 's', '"': 't', '<': 'ष', '>': 'ज्ञ', '?': 'घ'
  };

  // Advanced Kruti Dev 010 transformation rules
  let out = "";
  for (let i = 0; i < text.length; i++) {
    let ch = text.charAt(i);

    // Kruti Dev short 'i' matra ('f') appears BEFORE the letter it attaches to in Unicode
    if (ch === 'f') {
      let nextChar = text.charAt(i + 1);
      if (nextChar) {
        let mappedNext = map[nextChar] || nextChar;
        out += mappedNext + 'ि';
        i++; // skip next char as we consumed it
        continue;
      }
    }

    // Half consonants and special characters
    if (ch === 'Z') {
      // Reph (Z) comes after character in Kruti Dev, but before in Unicode logic
      out += 'र्';
      continue;
    }

    out += map[ch] !== undefined ? map[ch] : ch;
  }

  // Positional Reph ('Z') fixup in Hindi Unicode: move 'र्' to correct position before vowel/consonant cluster
  out = fixKrutiDevRephAndMatras(out);

  return out;
}

/**
 * Fix positional Matras and Reph positions for Kruti Dev conversion
 */
function fixKrutiDevRephAndMatras(str) {
  if (!str) return '';
  let res = str;

  // Clean double matras
  res = res.replace(/ाे/g, "ो");
  res = res.replace(/ाै/g, "ौ");
  res = res.replace(/ाि/g, "ि");

  return res;
}

/**
 * Heuristic Auto-Detector for Kruti Dev / Devlys non-Unicode text
 * Returns true if text contains characteristic Kruti Dev character sequences
 */
export function isKrutiDevText(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) return false;

  // Check if string already contains Hindi Devanagari Unicode characters (U+0900 to U+097F)
  const unicodeHindiRegex = /[\u0900-\u097F]/;
  if (unicodeHindiRegex.test(text)) {
    // Already contains Hindi Unicode! Do not convert.
    return false;
  }

  // Common Kruti Dev high-frequency character patterns
  // E.g. 'k' for aa-matra after consonants, 'f' before consonants for short i matra, etc.
  const krutiDevPatterns = [
    /\b[dfghjklzxcvbnm]+k\b/i, // words ending in 'k' (ा matra)
    /f[dghjklzxcvbnm]/i,      // 'f' followed by consonant ( short 'i' matra )
    /[dghjklzxcvbnm]s/i,       // consonant followed by 's' ( 'e' matra )
    /Z[dghjklzxcvbnm]/i,       // 'Z' reph
    /\b[vkfejhcbdgprs]+[kste]\b/ // common Kruti Dev Hindi word structures
  ];

  let matches = 0;
  for (const pattern of krutiDevPatterns) {
    if (pattern.test(text)) matches++;
  }

  return matches >= 2 || (text.length > 5 && matches >= 1 && /[A-Za-zñ«»º¾¿ÀÁÂÃÄÅÆÇÈÉÊ]/.test(text));
}
