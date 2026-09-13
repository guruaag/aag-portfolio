import { convertKrutiDevToUnicode } from '../src/utils/krutiDevEngine.js';
import { cleanPageMakerControlChars, fixMatraStacking, normalizeNuktaDevanagari } from '../src/utils/hindiFontEngine.js';

const userRawPoem = `Hkz"Vkpkj u gksrk vxj vxj u gksrk Hkz"VkpkjA

dkj[kkuksa esa u <y ikrs laLFkku ;s fo|k ds]
dqaMyh ekjs cSBs gSa ftl ij lkys usrk dsA
[kksy gh ikrk ugha vke vkneh mldk }kj]
oukZ gj cPpk ik tkrk f'k{kk dk vf/kdkjA`;

console.log('Step 1. Raw input length:', userRawPoem.length);
const step1 = cleanPageMakerControlChars(userRawPoem);
console.log('Step 2. Cleaned length:', step1.length);
const step2 = convertKrutiDevToUnicode(step1);
console.log('Step 3. Kruti Dev Converted:\n', step2);
const step3 = normalizeNuktaDevanagari(step2);
console.log('Step 4. Nukta Normalized:\n', step3);
const step4 = fixMatraStacking(step3);
console.log('Step 5. Fix Matra Stacking:\n', step4);
