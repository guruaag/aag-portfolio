import { convertKrutiDevToUnicode, isKrutiDevText } from '../src/utils/krutiDevEngine.js';

console.log('====================================================');
console.log('🧪 TESTING ENHANCED PAGEMAKER 5.0 PRE-PROCESSING');
console.log('====================================================\n');

// Actual raw PM5 samples
const testCases = [
  {
    name: "PM5 Stanzas with Non-breaking spaces",
    raw: "j'âjk\u00A0dky'k\u00A0dh\u00A0f'k[kkvksa\u00A0esa\r\n\u00A0\r\ntky\u00A0jgs\u00A0gSa\u00A0f'ko\u00A0ds\u00A0ueu"
  },
  {
    name: "PM5 Smart Quotes Heading",
    raw: "“j'âjk dky'k” (1985)"
  },
  {
    name: "PM5 Excerpt with Kruti Dev words",
    raw: "dfork\r\n\u00A0\r\nvXfu\u00A0dy'k\u00A0dksbZ\u00A0ugha"
  }
];

testCases.forEach((tc, i) => {
  console.log(`--- Test Case ${i+1}: ${tc.name} ---`);
  const isDetected = isKrutiDevText(tc.raw);
  console.log(`isKrutiDevText Detected: ${isDetected}`);
  const result = convertKrutiDevToUnicode(tc.raw);
  console.log(`Converted Output:\n"${result}"\n`);
});
