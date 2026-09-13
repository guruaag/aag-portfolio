import { isKrutiDevText, convertKrutiDevToUnicode, normalizePageMaker5Text } from '../src/utils/krutiDevEngine.js';

console.log('====================================================');
console.log('🔍 TESTING HEURISTIC DETECTOR ON USER STRING');
console.log('====================================================\n');

const userString = "j'âjk dky'k dh f'k[kkvksa esa";

console.log(`Input string: "${userString}"`);
console.log(`Normalized:   "${normalizePageMaker5Text(userString)}"`);

const words = normalizePageMaker5Text(userString).trim().split(/\s+/);
console.log(`Words:`, words);

words.forEach(w => {
  const isEng = /^[a-zA-Z]{3,}$/.test(w) && !/(dks|esa|gSa|gks|vks|rFkk|ysfdu|lkFk|fjd|djk)/i.test(w);
  console.log(`Word "${w}": isEng = ${isEng}`);
});

const isDetected = isKrutiDevText(userString);
console.log(`\nisKrutiDevText Result: ${isDetected}`);
