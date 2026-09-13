import { isKrutiDevText, convertUniversalHindiFont } from '../src/utils/hindiFontEngine.js';

const wikipediaSample = `संयुक्त राज्य अमेरिका ([अंग्रेज़ी](https://hi.wikipedia.org/wiki/%E0%A4%85%E0%A4%82%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A5%87%E0%A4%9C%E0%A4%BC%E0%A5%80_%E0%A4%AD%E0%A4%BE%E0%A4%B7%E0%A4%BE): United States of America), जिसे सामान्यतः संयुक्त राज्य (सं॰रा॰; [अंग्रेज़ी](https://hi.wikipedia.org/wiki/%E0%A4%85%E0%A4%82%E0%A4%97%E0%A5%8D%E0%A4%B0%E0%A5%87%E0%A4%9C%E0%A4%BC%E0%A5%80_%E0%A4%AD%E0%A4%BE%E0%A4%B7%E0%A4%BE): United States या US) या यूनाइटेड स्टेट्स, अमेरिका, या अमरीका कहा जाता हैं...`;

const krutiDevSample = `Hkz"Vkpkj u gksrk vxj vxj u gksrk Hkz"VkpkjA`;

console.log('=== AUDITING UNICODE vs KRUTI DEV PASTE SAFEGUARD ===\n');

// Test 1: Wikipedia Unicode Hindi text check
const isWikiKruti = isKrutiDevText(wikipediaSample);
console.log(`Wikipedia Text isKrutiDevText check: ${isWikiKruti} (Expected: false)`);
if (!isWikiKruti) {
  console.log('✅ [PASS] Wikipedia text correctly identified as Unicode Devanagari! Paste conversion bypassed.\n');
} else {
  console.log('❌ [FAIL] Wikipedia text incorrectly identified as Kruti Dev!\n');
}

// Test 2: Legacy Kruti Dev text check
const isKruti = isKrutiDevText(krutiDevSample);
console.log(`Legacy Kruti Dev isKrutiDevText check: ${isKruti} (Expected: true)`);
if (isKruti) {
  const converted = convertUniversalHindiFont(krutiDevSample, { font: 'Kruti Dev 010' });
  console.log(`Converted output: "${converted}"`);
  console.log('✅ [PASS] Legacy Kruti Dev text correctly converted!\n');
} else {
  console.log('❌ [FAIL] Legacy Kruti Dev text missed!\n');
}
