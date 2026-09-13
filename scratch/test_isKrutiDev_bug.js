import { isKrutiDevText, convertKrutiDevToUnicode } from '../src/utils/krutiDevEngine.js';

console.log('====================================================');
console.log('🧪 TESTING FIXED HEURISTIC DETECTOR');
console.log('====================================================\n');

const testCases = [
  { name: "User String", raw: "j'âjk dky'k dh f'k[kkvksa esa" },
  { name: "Simple Kruti Dev", raw: "dksbZ ugha" },
  { name: "PageMaker Stanzas", raw: "vXfu dy'k meM+ jgk gS" },
  { name: "Pure English", raw: "Hello world this is standard english text" },
  { name: "Pure Unicode Hindi", raw: "नमस्ते भारत यह मानक हिंदी पाठ है" }
];

testCases.forEach(tc => {
  const isDetected = isKrutiDevText(tc.raw);
  console.log(`[${tc.name}] "${tc.raw}" -> isKrutiDevText: ${isDetected}`);
  if (isDetected) {
    console.log(`   Converted: "${convertKrutiDevToUnicode(tc.raw)}"`);
  }
});
