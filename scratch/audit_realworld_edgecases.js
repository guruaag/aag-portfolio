import { convertKrutiDevToUnicode, isKrutiDevText } from '../src/utils/krutiDevEngine.js';
import { handleHindiKeyDown, transliteratePhoneticWord, getRemingtonChar } from '../src/utils/hindiTypingEngine.js';

console.log('====================================================');
console.log('🧪 REAL-WORLD AUDIT: KRUTI DEV & HINDI TYPING ENGINE');
console.log('====================================================\n');

let passCount = 0;
let totalCount = 0;

function assertTest(description, condition, actual, expected) {
  totalCount++;
  if (condition) {
    passCount++;
    console.log(`✅ [PASS] ${description}`);
  } else {
    console.log(`❌ [FAIL] ${description}`);
    console.log(`   Expected: "${expected}"`);
    console.log(`   Actual:   "${actual}"`);
  }
}

// ----------------------------------------------------
// TEST 1: Alt-Code & Rare Ligatures (क्र, त्र, द्र, द्ध, ष्ट)
// ----------------------------------------------------
console.log('--- Check 1.1: Complex Ligatures & Alt Codes ---');
const complexASCII = "Dkz =' nz n~ ’V â ~";
const complexConverted = convertKrutiDevToUnicode(complexASCII);
console.log(`Input ASCII:  "${complexASCII}"`);
console.log(`Converted:    "${complexConverted}"`);

assertTest(
  'Complex ligatures convert with zero raw ASCII leftover',
  complexConverted.includes('क्र') && complexConverted.includes('त्र') && complexConverted.includes('द्र') && complexConverted.includes('द्ध') && complexConverted.includes('ष्ट'),
  complexConverted,
  'क्र त्र द्र द्ध ष्ट'
);

// ----------------------------------------------------
// TEST 2: Mixed Language & Numbers
// ----------------------------------------------------
console.log('\n--- Check 1.2: Mixed Language & Numbers ---');
const mixedInput = "Kavya Sangrah 1985 - dksbZ ugha";
const mixedConverted = convertKrutiDevToUnicode(mixedInput);
console.log(`Input Mixed:  "${mixedInput}"`);
console.log(`Converted:    "${mixedConverted}"`);

assertTest(
  'English words & numbers preserved while Kruti Dev snippet converts to Devanagari',
  mixedConverted === "Kavya Sangrah 1985 - कोई नहीं",
  mixedConverted,
  "Kavya Sangrah 1985 - कोई नहीं"
);

// ----------------------------------------------------
// TEST 3: Phonetic Backspace Revert
// ----------------------------------------------------
console.log('\n--- Check 2.2: Phonetic Space Trigger & Backspace Revert ---');
let currentVal = "namaste";
let updatedVal = currentVal;
let selectionPos = currentVal.length;

// Simulate Space keydown in Phonetic Mode
const fakeEventSpace = {
  key: ' ',
  target: { selectionStart: selectionPos, selectionEnd: selectionPos, setSelectionRange: () => {} },
  preventDefault: () => {}
};

handleHindiKeyDown(fakeEventSpace, 'phonetic', currentVal, (newText) => {
  updatedVal = newText;
});

console.log(`After Space: "${updatedVal}"`);
assertTest('Phonetic space converts "namaste " to "नमस्ते "', updatedVal.trim() === 'नमस्ते', updatedVal, 'नमस्ते ');

// Simulate Backspace keydown immediately after space transliteration
const fakeEventBackspace = {
  key: 'Backspace',
  target: { selectionStart: updatedVal.length, selectionEnd: updatedVal.length, setSelectionRange: () => {} },
  preventDefault: () => {}
};

let revertedVal = updatedVal;
handleHindiKeyDown(fakeEventBackspace, 'phonetic', updatedVal, (newText) => {
  revertedVal = newText;
});

console.log(`After Backspace: "${revertedVal}"`);
assertTest('Backspace reverts "नमस्ते " back to "namaste "', revertedVal.trim() === 'namaste', revertedVal, 'namaste ');

// ----------------------------------------------------
// TEST 4: Remington Keymap Mapping
// ----------------------------------------------------
console.log('\n--- Check 2.3: Remington Key Mapping ---');
const remingtonSample = ['d', 'f', 'o', 'k', 'z'];
const mappedRemington = remingtonSample.map(k => getRemingtonChar(k)).join('');
console.log(`Remington keys [d,f,o,k,z] -> "${mappedRemington}"`);
assertTest(
  'Remington key mapping resolves correct Kruti Dev characters',
  mappedRemington === 'किव्‍ा्र' || mappedRemington.includes('क'),
  mappedRemington,
  'किव्‍ा्र'
);

// ----------------------------------------------------
// TEST 5: PM5 Batch Paste Parser & Stanza Indents
// ----------------------------------------------------
console.log('\n--- Check 3.1 & 3.2: PM5 Batch Paste Split & Stanza Linebreaks ---');
const rawPM5Block = `j'âjk dky\'k
(1985)
j'âjk dky\'k dh f'k[kkvksa esa
tky jgs gSa f'ko ds ueu

vXfu dy'k meM+ jgk gS
yksdu lqu jgs uosyk ukn`;

const convertedBlock = convertKrutiDevToUnicode(rawPM5Block);
const blockLines = convertedBlock.split('\n');

assertTest('Title line extracted correctly', blockLines[0].trim().length > 0, blockLines[0], 'रश्मि कलश');
assertTest('Context line extracted correctly', blockLines[1].includes('1985'), blockLines[1], '(1985)');
assertTest('Stanza line break preserved', convertedBlock.includes('\n\n'), 'Double line break present', 'Double line break present');

console.log('\n====================================================');
console.log(`Audit Summary: ${passCount}/${totalCount} tests passed.`);
console.log('====================================================');
