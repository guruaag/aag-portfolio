import { convertUniversalHindiFont } from '../src/utils/hindiFontEngine.js';

// Exact Kruti Dev 010 keymap reference
const vowels = [
  ['v', 'अ'], ['vk', 'आ'], ['b', 'इ'], ['bZ', 'ई'], ['m', 'उ'], ['Å', 'ऊ'],
  ['_', 'ऋ'], [',', 'ए'], ['AI', 'ऐ'], ['vks', 'ओ'], ['vkS', 'औ'], ['va', 'अं']
];

const consonants = [
  ['d', 'क'], ['[k', 'ख'], ['x', 'ग'], ['?k', 'घ'],
  ['p', 'च'], ['N', 'छ'], ['t', 'ज'], ['>k', 'झ'], ['.k', 'ण'],
  ['V', 'ट'], ['B', 'ठ'], ['M', 'ड'], ['<', 'ढ'],
  ['r', 'त'], ['Fk', 'थ'], ['n', 'द'], ['/k', 'ध'], ['u', 'न'],
  ['i', 'प'], ['Q', 'फ'], ['c', 'ब'], ['Hk', 'भ'], ['e', 'म'],
  [';', 'य'], ['j', 'र'], ['y', 'ल'], ['o', 'व'],
  ["'k", 'श'], ['"k', 'ष'], ['l', 'स'], ['g', 'ह'],
  ['=', 'त्र']
];

// Correct Kruti Dev matras mapping:
// 'q' = ु, 'w' = ू, 'W' = ू
const matras = [
  ['', ''], ['k', 'ा'], ['f', 'ि'], ['h', 'ी'], ['q', 'ु'], ['w', 'ू'], ['W', 'ू'],
  ['`', 'ृ'], ['s', 'े'], ['S', 'ै'], ['kks', 'ो'], ['kS', 'ौ'], ['a', 'ं']
];

console.log('=== GENERATING & AUDITING 1000+ EXACT KRUTI DEV COMBINATIONS ===\n');

const testCases = [];

// 1. Generate Vowels (12)
for (const [vK, vU] of vowels) {
  testCases.push({ kruti: vK, expected: vU, category: 'Vowels' });
}

// 2. Generate Consonant + Matra Combinations (32 consonants * 13 matras = 416)
for (const [cK, cU] of consonants) {
  for (const [mK, mU] of matras) {
    if (mK === 'f') {
      testCases.push({ kruti: `f${cK}`, expected: `${cU}ि`, category: 'Pre-Matra (ि)' });
    } else {
      testCases.push({ kruti: `${cK}${mK}`, expected: `${cU}${mU}`, category: 'Consonant + Matra' });
    }
  }
}

// 3. Generate Reph (र्) Combinations (32 consonants * 13 matras = 416)
for (const [cK, cU] of consonants) {
  for (const [mK, mU] of matras) {
    if (mK === 'f') {
      testCases.push({ kruti: `f${cK}Z`, expected: `र्${cU}ि`, category: 'Reph + Pre-matra' });
    } else {
      testCases.push({ kruti: `${cK}${mK}Z`, expected: `र्${cU}${mU}`, category: 'Reph (र्)' });
    }
  }
}

// 4. Half Consonant + Full Consonant Combinations (22 half-consonants * 5 consonants * 2 matras = 220)
const halfConsonants = [
  ['D', 'क्'], ['K', 'ख्'], ['X', 'ग्'], ['?', 'घ्'], ['P', 'च्'], ['T', 'ज्'], ['>', 'झ्'],
  ['.', 'ण्'], ['R', 'त्'], ['F', 'थ्'], ['/', 'ध्'], ['U', 'न्'], ['I', 'प्'], ['C', 'ब्'],
  ['H', 'भ्'], ['E', 'म्'], ['Y', 'य्'], ['Yk', 'ल्'], ['O', 'व्'], ['"', 'ष्'], ["'", 'श्'], ['L', 'स्']
];
const sampleConsonants = [['d', 'क'], ['r', 'त'], ['e', 'म'], ['y', 'ल'], ['o', 'व']];

for (const [hK, hU] of halfConsonants) {
  for (const [cK, cU] of sampleConsonants) {
    testCases.push({ kruti: `${hK}${cK}`, expected: `${hU}${cU}`, category: 'Half + Full Consonant' });
    testCases.push({ kruti: `f${hK}${cK}`, expected: `${hU}${cU}ि`, category: 'Half + Full + Pre-matra' });
  }
}

// 5. Special Ligatures & R-forms (7 * 3 = 21)
const ligatures = [
  ['Ø', 'क्र'], ['Ù', 'त्त'], ['ä', 'क्त'], ['¶', 'फ्'], ['ç', 'प्र'], ['º', 'भ'], ['µ', 'म']
];

for (const [lK, lU] of ligatures) {
  testCases.push({ kruti: lK, expected: lU, category: 'Special Ligatures' });
  testCases.push({ kruti: `${lK}k`, expected: `${lU}ा`, category: 'Ligature + Matra' });
  testCases.push({ kruti: `f${lK}`, expected: `${lU}ि`, category: 'Ligature + Pre-matra' });
}

// 6. Nukta combinations (7 * 2 = 14)
const nuktas = [
  ['M+', 'ड़'], ['B+', 'ढ़'], ['t+', 'ज़'], ['Q+', 'फ़'], ['d+', 'क़'], ['x+', 'ख़'], ['X+', 'ग़']
];

for (const [nK, nU] of nuktas) {
  testCases.push({ kruti: nK, expected: nU, category: 'Nuktas' });
  testCases.push({ kruti: `${nK}k`, expected: `${nU}ा`, category: 'Nukta + Matra' });
}

// 7. PageMaker Sentence & Verse Endings
const sentenceEndings = [
  ['Hkz"VkpkjA', 'भ्रष्टाचार।'],
  ['f\'k{kkA', 'शिक्षा।'],
  ['usrk dsA', 'नेता के।'],
  ['}kj]', 'द्वार,'],
  ['cSadksa esa]', 'बैंकों में,'],
  ['tsy esaA', 'जेल में।'],
  ['edM+h&tkyk]', 'मकड़ी-जाला,']
];

for (const [sK, sU] of sentenceEndings) {
  testCases.push({ kruti: sK, expected: sU, category: 'PageMaker Sentence Endings' });
}

console.log(`Total Generated Test Combinations: ${testCases.length}`);

let passed = 0;
let failed = 0;
const failures = [];
const categoryStats = {};

for (let i = 0; i < testCases.length; i++) {
  const tc = testCases[i];
  if (!categoryStats[tc.category]) {
    categoryStats[tc.category] = { total: 0, passed: 0, failed: 0 };
  }
  categoryStats[tc.category].total++;

  const actual = convertUniversalHindiFont(tc.kruti, { font: 'Kruti Dev 010' });
  if (actual === tc.expected) {
    passed++;
    categoryStats[tc.category].passed++;
  } else {
    failed++;
    categoryStats[tc.category].failed++;
    if (failures.length < 30) {
      failures.push({ index: i + 1, kruti: tc.kruti, actual, expected: tc.expected, category: tc.category });
    }
  }
}

console.log(`\n--- CATEGORY BREAKDOWN ---`);
for (const [cat, stats] of Object.entries(categoryStats)) {
  console.log(`• ${cat}: ${stats.passed}/${stats.total} Passed (${((stats.passed/stats.total)*100).toFixed(1)}%)`);
}

console.log(`\n--- TEST SUITE SUMMARY ---`);
console.log(`Total Tested: ${testCases.length}`);
console.log(`Passed: ${passed} / ${testCases.length}`);
console.log(`Failed: ${failed} / ${testCases.length}`);

if (failures.length > 0) {
  console.log(`\nFIRST ${failures.length} FAILURES SAMPLE:`);
  for (const f of failures) {
    console.log(`[#${f.index}] [${f.category}] Input: "${f.kruti}" -> Actual: "${f.actual}" | Expected: "${f.expected}"`);
  }
} else {
  console.log(`\n🎉 100% PERFECT PASS! ALL ${testCases.length} COMBINATIONS CONVERTED WITH ZERO ERRORS!`);
}
