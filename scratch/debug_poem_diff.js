import { convertKrutiDevToUnicode } from '../src/utils/krutiDevEngine.js';

const fullPoem = `Hkz"Vkpkj u gksrk vxj vxj u gksrk Hkz"VkpkjA

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
eLst gS ns'k dh turk ihdj /keZ dh gkykA
;gka xqykeh dks Hkfä ywV dks dgrs O;kikj]
fØdsV dk p<+k cq[kkj] çtkra= gqvk chekjA

ijs'kku gS ,d eSMe ou&i'kqvksa dks cpkus esa]
j[kk gS D;k Hkyk çnw"k.k dk 'kksj epkus esaA
HksfM+ye lqjf{kr gSa laln esa fuxeksa esa fl;kj]
vtxj vius n¶rj esa cSBs&cSBs djsa f'kdkjA`;

const out = convertKrutiDevToUnicode(fullPoem);
console.log('OUTPUT:\n', out);
