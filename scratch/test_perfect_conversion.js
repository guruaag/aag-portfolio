function convertSingleToken(str) {
  if (!str) return '';

  // Alt-codes
  const altMap = {
    'ñ': 'Z', 'ò': 'Q', 'ó': 'W', 'ô': 'E', 'õ': 'R', 'ö': 'T', '÷': 'Y', 'ø': 'U',
    'ù': 'I', 'ú': 'O', 'û': 'P', 'ü': '{', 'ý': '}', 'þ': '|', 'ÿ': ':', 'µ': 'म',
    '¶': 'न', '·': 'प', '¸': 'फ', '¹': 'ब', 'º': 'भ', '»': 'म', '¼': 'य', '½': 'र',
    '¾': 'ल', '¿': 'व', 'À': 'श', 'Á': 'ष', 'Â': 'स', 'Ã': 'ह'
  };
  for (const [k, v] of Object.entries(altMap)) str = str.replaceAll(k, v);

  const replacements = [
    ['[k', 'ख'],
    ['?k', 'घ'],
    ['>k', 'झ'],
    ['.k', 'ण'],
    ['Fk', 'थ'],
    ['/k', 'ध'],
    ['Hk', 'भ'],
    ['{k', 'क्ष'],
    ['Dkz', 'क्र'],
    ['=k', 'त्रा'],
    ['=\'', 'त्र'],
    ['=', 'त्र'],
    ['nz', 'द्र'],
    ['n~', 'द्ध'],
    ['’V', 'ष्ट'],
    ['’B', 'ष्ठ'],
    ['’k', 'ष्'],
    ['â', 'म'],
    ["'k", 'श'],
    ['"k', 'श'],
    ["'", 'श्'],
    ['"', 'श्'],
    ['ä', 'द्य'],
    ['ö', 'द्व'],
    ['ê', 'हृ'],
    ['ë', 'ह्म'],
    ['ì', 'ह्न'],
    ['î', 'ह्न्'],
    ['™', '्र'],
    ['ç', '्र'],
    ['dks', 'को'],
    ['gSa', 'हैं'],
    ['gks', 'हो'],
    ['vks', 'ओ'],
    ['vkS', 'औ'],
    ['vk', 'आ'],
    ['AI', 'ऐ'],
    ['bZ', 'ई'],
    ['kks', 'ो'],
    ['kkj', 'ॉर'],
    ['kS', 'ौ'],
    ['kk', 'ा'],
    ['ks', 'े'],
    ['D', 'क्'],
    ['K', 'ख्'],
    ['X', 'ग्'],
    ['?', 'घ्'],
    ['P', 'च्'],
    ['T', 'ज्'],
    ['>', 'झ्'],
    ['.', 'ण्'],
    ['R', 'त्'],
    ['F', 'थ्'],
    ['/', 'ध्'],
    ['U', 'न्'],
    ['I', 'प्'],
    ['q', 'फ्'],
    ['C', 'ब्'],
    ['H', 'भ्'],
    ['E', 'म्'],
    ['Y', 'य्'],
    ['Yk', 'ल्'],
    ['V', 'व्'],
    ['L', 'ष्'],
    ['O', 'व्'],
    ['v', 'अ'],
    ['b', 'इ'],
    ['m', 'उ'],
    ['Å', 'ऊ'],
    ['_', 'ऋ'],
    [',', 'ए'],
    ['k', 'ा'],
    ['h', 'ी'],
    ['w', 'ु'],
    ['W', 'ू'],
    ['s', 'े'],
    ['S', 'ै'],
    ['a', 'ं'],
    ['A', 'ँ'],
    ['è', 'ॅ'],
    ['`', 'ृ'],
    ['~', '्'],
    ['d', 'क'],
    ['x', 'ग'],
    ['p', 'च'],
    ['N', 'छ'],
    ['t', 'ज'],
    ['V', 'ट'],
    ['B', 'ठ'],
    ['M', 'ड'],
    ['r', 'त'],
    ['n', 'द'],
    ['u', 'न'],
    ['i', 'प'],
    ['Q', 'फ'],
    ['c', 'ब'],
    ['e', 'म'],
    [';', 'य'],
    ['j', 'र'],
    ['y', 'ल'],
    ['l', 'स'],
    ['g', 'ह'],
    ['o', 'व'],
    ['{', 'क्ष्']
  ];

  for (const [from, to] of replacements) {
    if (from) str = str.replaceAll(from, to);
  }

  // Pre-i matra f
  let posF = str.indexOf('f');
  while (posF !== -1) {
    let nextPos = posF + 1;
    let charToShift = '';
    while (nextPos < str.length) {
      const c = str.charAt(nextPos);
      charToShift += c;
      if (c !== '्' && c !== ' ' && c !== '\n') break;
      nextPos++;
    }
    str = str.substring(0, posF) + charToShift + 'ि' + str.substring(posF + 1 + charToShift.length);
    posF = str.indexOf('f', posF + 1);
  }

  // Reph Z
  let posZ = str.indexOf('Z');
  while (posZ !== -1) {
    let prevPos = posZ - 1;
    let charToShift = '';
    while (prevPos >= 0) {
      const c = str.charAt(prevPos);
      charToShift = c + charToShift;
      if (c !== '्') break;
      prevPos--;
    }
    str = str.substring(0, prevPos) + 'र्' + charToShift + str.substring(posZ + 1);
    posZ = str.indexOf('Z', posZ + 1);
  }

  return str.replaceAll('Z', 'र्').replaceAll('f', 'ि');
}

let text = "j'âjk dky'k dh f'k[kkvksa esa";
text = text.replaceAll('\u00A0', ' ').replaceAll('\u200B', '').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
text = text.replaceAll('‘', "'").replaceAll('’', "'").replaceAll('“', '"').replaceAll('”', '"');

const tokens = text.split(/(\s+|[-–—:,()])/);
const result = tokens.map(convertSingleToken).join('');

console.log('INPUT: ', "j'âjk dky'k dh f'k[kkvksa esa");
console.log('OUTPUT:', result);
