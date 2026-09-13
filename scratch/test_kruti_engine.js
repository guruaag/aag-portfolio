import { convertKrutiDevToUnicode, isKrutiDevText } from '../src/utils/krutiDevEngine.js';

console.log('==============================================');
console.log('🧪 KRUTI DEV 2-PASS ENGINE AUTOMATED TEST SUITE');
console.log('==============================================\n');

const testCases = [
  // 1. Basic words
  { input: 'dksbZ ugha', expectedPattern: 'कोई नहीं', desc: 'Basic Kruti Dev words' },
  { input: 'vksj', expectedPattern: 'ओर', desc: 'Vowels' },
  { input: 'vXfu dy' , expectedPattern: 'अग्नि कल', desc: 'Complex half letters' },
  { input: 'dfork', expectedPattern: 'कविता', desc: 'Pre-consonant matra f positioning' },
  { input: 'Dkz', expectedPattern: 'क्र', desc: 'Complex conjunct Dkz -> क्र' },
  { input: '=\'', expectedPattern: 'त्र', desc: 'Complex conjunct =\' -> त्र' },
  { input: 'nz', expectedPattern: 'द्र', desc: 'Complex conjunct nz -> द्र' },
  { input: 'n~', expectedPattern: 'द्ध', desc: 'Complex conjunct n~ -> द्ध' },
  { input: '’V', expectedPattern: 'ष्ट', desc: 'Complex conjunct ’V -> ष्ट' },
  { input: 'Z', expectedPattern: 'र्', desc: 'Reph Z positioning' }
];

let passed = 0;
testCases.forEach((tc, idx) => {
  const result = convertKrutiDevToUnicode(tc.input);
  const isMatch = result.includes(tc.expectedPattern) || result === tc.expectedPattern;
  if (isMatch) {
    passed++;
    console.log(`✅ Test ${idx + 1} PASSED [${tc.desc}]: "${tc.input}" -> "${result}"`);
  } else {
    console.log(`❌ Test ${idx + 1} FAILED [${tc.desc}]: Got "${result}", expected "${tc.expectedPattern}"`);
  }
});

// Heuristic classifier tests
console.log('\n--- Heuristic Auto-Detector Tests ---');
const asciiKruti = 'dksbZ ugha esa gSa rFkk';
const pureEnglish = 'Agni Kalash Published in 1985';
const unicodeHindi = 'गुरुप्रताप शर्मा अग्नि कलश';

console.log(`Kruti Dev detection: ${isKrutiDevText(asciiKruti)} (Expected: true)`);
console.log(`Pure English detection: ${isKrutiDevText(pureEnglish)} (Expected: false)`);
console.log(`Unicode Hindi detection: ${isKrutiDevText(unicodeHindi)} (Expected: false)`);

console.log(`\nResults: ${passed}/${testCases.length} test cases passed.`);
