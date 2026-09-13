import { 
  convertUniversalHindiFont, 
  detectLegacyFont, 
  normalizeNuktaDevanagari, 
  cleanPageMakerControlChars, 
  fixMatraStacking, 
  convertDigits
} from '../src/utils/hindiFontEngine.js';

console.log('=== 10X HINDI MULTI-FONT & TYPOGRAPHY ENGINE AUTOMATED AUDIT ===\n');

let passCount = 0;
let totalCount = 0;

function assertEqual(testName, actual, expected) {
  totalCount++;
  if (actual === expected) {
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.log(`❌ [FAIL] ${testName}`);
    console.log(`  ACTUAL:   "${actual}"`);
    console.log(`  EXPECTED: "${expected}"`);
  }
}

// 1. Font Detection Tests
assertEqual('Detect Kruti Dev / PageMaker', detectLegacyFont('Hkz"Vkpkj u gksrk'), 'Kruti Dev 010 / 022 / 030 / PageMaker 5.0');
assertEqual('Detect Unicode Devanagari', detectLegacyFont('भ्रष्टाचार न होता'), 'Unicode Devanagari');
assertEqual('Detect Chanakya Font', detectLegacyFont('ßk çtkra='), 'Chanakya Newspaper Font');

// 2. Nukta Normalization Tests
assertEqual('Normalize Decomposed Nukta (ड़)', normalizeNuktaDevanagari('ड\u093C'), 'ड़');
assertEqual('Normalize Decomposed Nukta (ढ़)', normalizeNuktaDevanagari('ढ\u093C'), 'ढ़');
assertEqual('Normalize Decomposed Nukta (ज़)', normalizeNuktaDevanagari('ज\u093C'), 'ज़');

// 3. Control Character Cleaning Tests
assertEqual('Clean Null Bytes & Soft Hyphens', cleanPageMakerControlChars('Hello\u0000World\u00AD!'), 'HelloWorld!');

// 4. Matra Stack Repair Tests
assertEqual('Fix Duplicate Matras (ि)', fixMatraStacking('कििताब'), 'किताब');
assertEqual('Fix Duplicate Halants (्)', fixMatraStacking('भक््ति'), 'भक्ति');

// 5. Digit Conversion Tests
assertEqual('Convert ASCII Digits to Devanagari', convertDigits('Poem 123', 'toDevanagari'), 'Poem १२३');
assertEqual('Convert Devanagari Digits to ASCII', convertDigits('कविता १२३', 'toASCII'), 'कविता 123');

// 6. User Poem Benchmark Regression Test
const userRawPoem = `Hkz"Vkpkj u gksrk vxj vxj u gksrk Hkz"VkpkjA

dkj[kkuksa esa u <y ikrs laLFkku ;s fo|k ds]
dqaMyh ekjs cSBs gSa ftl ij lkys usrk dsA
[kksy gh ikrk ugha vke vkneh mldk }kj]
oukZ gj cPpk ik tkrk f'k{kk dk vf/kdkjA

tek u gksrk dkyk /ku vxj fons'kh cSadksa esa]
yx ikrk ns'k dk /ku ns'k ds gh m|ksxksa esaA
rks ;qok bl ns'k dk gksrk ugha cscl] csdkj]
gj toku gkFk dks fey tkrk dksbZ jkstxkjA

QtZ o dtZ dh csy esa] jktuhfr ds [ksy esa]
lÙkk vkSj O;oLFkk dh bl tax&yxh tsy esaA 
fujijk/kksa dh HkhM+ ls Hkjs u gksrs dkjkxkj]
uk /kjrhiq=ksa ds xys esa iM+rk Qkalh dk gkjA

va/kJ)k ds rkus&ckus ls cquk ;s edM+h&tkyk]
eLr gS ns'k dh turk ihdj /keZ dh gkykA
;gka xqykeh dks Hkfä ywV dks dgrs O;kikj]
fØdsV dk p<+k cq[kkj] çtkra= gqvk chekjA

ijs'kku gS ,d eSMe ou&i'kqvksa dks cpkus esa]
j[kk gS D;k Hkyk çnw"k.k dk 'kksj epkus esaA
HksfM+ye lqjf{kr gSa laln esa fuxeksa esa fl;kj]
vtxj vius n¶rj esa cSBs&cSBs djsa f'kdkjA`;

const userExpectedPoem = `भ्रष्टाचार न होता अगर अगर न होता भ्रष्टाचार।

कारखानों में न ढल पाते संस्थान ये विद्या के,
कुंडली मारे बैठे हैं जिस पर साले नेता के।
खोल ही पाता नहीं आम आदमी उसका द्वार,
वर्ना हर बच्चा पा जाता शिक्षा का अधिकार।

जमा न होता काला धन अगर विदेशी बैंकों में,
लग पाता देश का धन देश के ही उद्योगों में।
तो युवा इस देश का होता नहीं बेबस, बेकार,
हर जवान हाथ को मिल जाता कोई रोजगार।

फर्ज व कर्ज की बेल में, राजनीति के खेल में,
सत्ता और व्यवस्था की इस जंग-लगी जेल में। 
निरपराधों की भीड़ से भरे न होते कारागार,
ना धरतीपुत्रों के गले में पड़ता फांसी का हार।

अंधश्रद्धा के ताने-बाने से बुना ये मकड़ी-जाला,
मस्त है देश की जनता पीकर धर्म की हाला।
यहां गुलामी को भक्ति लूट को कहते व्यापार,
क्रिकेट का चढ़ा बुखार, प्रजातंत्र हुआ बीमार।

परेशान है एक मैडम वन-पशुओं को बचाने में,
रखा है क्या भला प्रदूषण का शोर मचाने में।
भेड़िये सुरक्षित हैं संसद में निगमों में सियार,
अजगर अपने दफ्तर में बैठे-बैठे करें शिकार।`;

const convertedPoem = convertUniversalHindiFont(userRawPoem);
assertEqual('User 26-Line Poem Master Benchmark', convertedPoem, userExpectedPoem);

console.log(`\n========================================`);
console.log(`RESULTS: ${passCount} / ${totalCount} TESTS PASSED`);
console.log(`========================================\n`);
