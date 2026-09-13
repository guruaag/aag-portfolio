/**
 * In-App Dual Hindi Typing Engine
 * Supports Phonetic (Hinglish) with Space Trigger & Backspace Revert
 * and Remington (Kruti Dev QWERTY layout) real-time character mapping.
 */

// Phonetic (Hinglish) Transliteration Dictionary & Rule Engine
const PHONETIC_DICT = {
  'kavita': 'कविता',
  'sharma': 'शर्मा',
  'guru': 'गुरु',
  'pratap': 'प्रताप',
  'aag': 'आग',
  'namaste': 'नमस्ते',
  'bharat': 'भारत',
  'hindi': 'हिंदी',
  'sahitya': 'साहित्य',
  'kavya': 'काव्य',
  'sangrah': 'संग्रह',
  'prakashan': 'प्रकाशन',
  'pustak': 'पुस्तक',
  'agni': 'अग्नि',
  'kalash': 'कलश',
  'yug': 'युग',
  'chetna': 'चेतना',
  'samay': 'समय',
  'swar': 'स्वर',
  'rashtra': 'राष्ट्र',
  'dhwaj': 'ध्वज',
  'pukar': 'पुकार',
  'dharana': 'धारणा',
  'shanti': 'शांति',
  'prem': 'प्रेम',
  'satya': 'सत्य',
  'jivan': 'जीवन',
  'desh': 'देश'
};

// Remington (Kruti Dev QWERTY Keyboard Layout) Mapping Table
const REMINGTON_MAP = {
  'a': 'ं', 'A': 'ँ',
  'b': 'इ', 'B': 'ठ',
  'c': 'ब', 'C': 'ब्',
  'd': 'क', 'D': 'क्',
  'e': 'म', 'E': 'म्',
  'f': 'ि', 'F': 'थ्',
  'g': 'ह', 'G': 'ळ',
  'h': 'ी', 'H': 'भ्',
  'i': 'प', 'I': 'प्',
  'j': 'र', 'J': 'श्र',
  'k': 'ा', 'K': 'ख्',
  'l': 'स', 'L': 'स्',
  'm': 'उ', 'M': 'ड',
  'n': 'द', 'N': 'ढ',
  'o': 'व', 'O': 'व्',
  'p': 'च', 'P': 'च्',
  'q': 'फ', 'Q': 'फ',
  'r': 'त', 'R': 'त्',
  's': 'े', 'S': 'ै',
  't': 'ज', 'T': 'ज्',
  'u': 'न', 'U': 'न्',
  'v': 'अ', 'V': 'व्',
  'w': 'ु', 'W': 'ू',
  'x': 'ग', 'X': 'ग्',
  'y': 'ल', 'Y': 'य्',
  'z': '्र', 'Z': 'र्',
  '[': 'ख', '{': 'क्ष',
  ']': 'ृ', '}': 'द्व',
  ';': 'य', ':': 'ः',
  '\'': 'श', '"': 'श्',
  ',': 'ए', '<': 'ष्',
  '.': 'ण', '>': 'झ',
  '/': 'ध्', '?': 'घ्',
  '`': 'ृ', '~': '्'
};

/**
 * Simple Phonetic Rule Transliteration Fallback
 */
export function transliteratePhoneticWord(word) {
  if (!word) return '';
  const lower = word.toLowerCase().trim();
  if (PHONETIC_DICT[lower]) {
    return PHONETIC_DICT[lower];
  }

  // Basic Phonetic Rule Transliteration Fallback
  let res = lower
    .replace(/k/g, 'क')
    .replace(/kh/g, 'ख')
    .replace(/g/g, 'ग')
    .replace(/gh/g, 'घ')
    .replace(/ch/g, 'च')
    .replace(/j/g, 'ज')
    .replace(/t/g, 'त')
    .replace(/th/g, 'थ')
    .replace(/d/g, 'द')
    .replace(/dh/g, 'ध')
    .replace(/n/g, 'न')
    .replace(/p/g, 'प')
    .replace(/ph/g, 'फ')
    .replace(/b/g, 'ब')
    .replace(/bh/g, 'भ')
    .replace(/m/g, 'म')
    .replace(/y/g, 'य')
    .replace(/r/g, 'र')
    .replace(/l/g, 'ल')
    .replace(/v/g, 'व')
    .replace(/w/g, 'व')
    .replace(/sh/g, 'श')
    .replace(/s/g, 'स')
    .replace(/h/g, 'ह')
    .replace(/aa/g, 'ा')
    .replace(/a/g, '')
    .replace(/ee/g, 'ी')
    .replace(/i/g, 'ि')
    .replace(/oo/g, 'ू')
    .replace(/u/g, 'ु')
    .replace(/e/g, 'े')
    .replace(/o/g, 'ो');

  return res || word;
}

/**
 * Maps a Remington Keypress (QWERTY char) to Kruti Dev Devanagari character
 */
export function getRemingtonChar(char) {
  return REMINGTON_MAP[char] || char;
}

// Track last transliterated word for Backspace revert feature
let lastTransliteratedWord = null;

/**
 * Main event handler for inputs with active Hindi typing mode
 */
export function handleHindiKeyDown(e, mode, currentValue, onUpdateText) {
  if (!mode || mode === 'off') return;

  // Ignore system shortcut key combos (Ctrl, Cmd, Alt)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const target = e.target;
  const cursorStart = target.selectionStart || 0;
  const cursorEnd = target.selectionEnd || 0;
  const val = currentValue || '';

  if (mode === 'remington') {
    // Only map single printable character keys
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const devChar = REMINGTON_MAP[e.key];
      if (devChar) {
        e.preventDefault();
        const newVal = val.substring(0, cursorStart) + devChar + val.substring(cursorEnd);
        onUpdateText(newVal);
        
        // Restore cursor position asynchronously
        if (typeof window !== 'undefined' && window.requestAnimationFrame) {
          window.requestAnimationFrame(() => {
            if (target && target.setSelectionRange) {
              const nextPos = cursorStart + devChar.length;
              target.setSelectionRange(nextPos, nextPos);
            }
          });
        }
      }
    }
  } else if (mode === 'phonetic') {
    // Handle Backspace Revert
    if (e.key === 'Backspace' && lastTransliteratedWord) {
      const textBeforeCursor = val.substring(0, cursorStart);
      if (textBeforeCursor.endsWith(lastTransliteratedWord.hindi + ' ')) {
        e.preventDefault();
        const updated = textBeforeCursor.substring(0, textBeforeCursor.length - (lastTransliteratedWord.hindi.length + 1)) + lastTransliteratedWord.original + ' ';
        const newVal = updated + val.substring(cursorEnd);
        onUpdateText(newVal);
        lastTransliteratedWord = null;
        return;
      }
    }

    // Space or Enter triggers phonetic transliteration of last English word
    if (e.key === ' ' || e.key === 'Enter') {
      const textBeforeCursor = val.substring(0, cursorStart);
      const match = textBeforeCursor.match(/([a-zA-Z]+)$/);
      if (match) {
        const engWord = match[1];
        const hindiWord = transliteratePhoneticWord(engWord);

        if (hindiWord && hindiWord !== engWord) {
          e.preventDefault();
          const wordStart = textBeforeCursor.length - engWord.length;
          const separator = e.key === 'Enter' ? '\n' : ' ';
          const newVal = val.substring(0, wordStart) + hindiWord + separator + val.substring(cursorEnd);
          
          lastTransliteratedWord = { original: engWord, hindi: hindiWord };
          onUpdateText(newVal);

          if (typeof window !== 'undefined' && window.requestAnimationFrame) {
            window.requestAnimationFrame(() => {
              if (target && target.setSelectionRange) {
                const nextPos = wordStart + hindiWord.length + separator.length;
                target.setSelectionRange(nextPos, nextPos);
              }
            });
          }
        }
      }
    }
  }
}

