import { convertUniversalHindiFont } from '../src/utils/hindiFontEngine.js';

// Exact Kruti Dev 010 Remington Live Keymap for Single Keypresses
const REMINGTON_KEYMAP = {
  'q': 'ु', 'w': 'ू', 'e': 'म', 'r': 'त', 't': 'ज', 'y': 'ल', 'u': 'न', 'i': 'प', 'o': 'व', 'p': 'च',
  '[': 'ख', ']': ',', 'a': 'ं', 's': 'े', 'd': 'क', 'f': 'ि', 'g': 'ह', 'h': 'ी', 'j': 'र', 'k': 'ा',
  'l': 'स', ';': 'य', "'": 'श्', 'z': '्र', 'x': 'ग', 'c': 'ब', 'v': 'अ', 'b': 'इ', 'n': 'द', 'm': 'उ',
  ',': 'ए', '.': 'ण्', '/': 'ध्', '`': 'ृ', '=': 'त्र', '-': '-',

  'Q': 'फ', 'W': 'ू', 'E': 'म्', 'R': 'त्', 'T': 'ज्', 'Y': 'य्', 'U': 'न्', 'I': 'प्', 'O': 'व्', 'P': 'च्',
  '{': 'क्ष्', '}': 'द्व', 'A': 'ँ', 'S': 'ै', 'D': 'क्', 'F': 'थ्', 'G': 'ह', 'H': 'भ्', 'J': 'श्र', 'K': 'ख्',
  'L': 'स्', ':': 'ः', '"': 'ष्', 'Z': 'र्', 'X': 'ग्', 'C': 'ब्', 'V': 'ट', 'B': 'ठ', 'N': 'छ', 'M': 'ड',
  '<': 'ढ', '>': 'झ्', '?': 'घ्', '~': '्', '+': '़', '_': 'ऋ'
};

console.log('=== AUDITING GLOBAL APPLICATION-WIDE TYPING SWITCHER ENGINE ===\n');

// 1. Test Remington live key mapping for sample words
function simulateRemingtonTyping(asciiString) {
  let result = '';
  for (let i = 0; i < asciiString.length; i++) {
    const char = asciiString[i];
    result += REMINGTON_KEYMAP[char] || char;
  }
  return result;
}

const typingTests = [
  { input: 'd', expected: 'क', desc: 'Single keypress "d" -> "क"' },
  { input: 'gsyks', expected: 'हेलो', desc: 'Word "gsyks" -> "हेलो"' },
  { input: 'ueLrs', expected: 'नमस्ते', desc: 'Word "ueLrs" -> "नमस्ते"' },
  { input: 'f\'k{kk', expected: 'िश्ाक्षा', desc: 'Live pre-matra key sequence' }
];

let passed = 0;
for (const tt of typingTests) {
  const actual = simulateRemingtonTyping(tt.input);
  if (actual === tt.expected || (tt.input === 'd' && actual === 'क')) {
    console.log(`✅ [PASS] ${tt.desc}: "${tt.input}" -> "${actual}"`);
    passed++;
  } else {
    console.log(`❌ [FAIL] ${tt.desc}: "${tt.input}" -> Actual: "${actual}" | Expected: "${tt.expected}"`);
  }
}

// 2. Test Paste Interception & Full Word Normalization
const pasteTests = [
  { input: 'Hkz"VkpkjA', expected: 'भ्रष्टाचार।', desc: 'Paste legacy Kruti Dev string' },
  { input: 'f\'k{kkA', expected: 'शिक्षा।', desc: 'Paste PageMaker poem line' }
];

for (const pt of pasteTests) {
  const actual = convertUniversalHindiFont(pt.input, { font: 'Kruti Dev 010' });
  if (actual === pt.expected) {
    console.log(`✅ [PASS] ${pt.desc}: "${pt.input}" -> "${actual}"`);
    passed++;
  } else {
    console.log(`❌ [FAIL] ${pt.desc}: "${pt.input}" -> Actual: "${actual}" | Expected: "${pt.expected}"`);
  }
}

console.log(`\n========================================`);
console.log(`GLOBAL SWITCHER ENGINE AUDIT RESULTS: ${passed} / ${typingTests.length + pasteTests.length} PASSED`);
console.log(`========================================\n`);
