import { convertKrutiDevToUnicode } from '../src/utils/krutiDevEngine.js';

console.log('====================================================');
console.log('🧪 TESTING ROBUSTNESS UPGRADES (NUKTA + & TITLE DICT)');
console.log('====================================================\n');

const test1 = "meM+rs vXfu dy'k dks";
console.log(`Input:     "${test1}"`);
console.log(`Converted: "${convertKrutiDevToUnicode(test1)}"`);

const test2 = "j'âjk dky'k (1985)";
console.log(`Input:     "${test2}"`);
console.log(`Converted: "${convertKrutiDevToUnicode(test2)}"`);
