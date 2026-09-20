import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import './FamilyTreeCanvas.css'

export const FAMILY_DATA_35 = [
  // Generation 1: Progenitors
  { id: 'f-101', name_hi: 'पंडित रामचन्द्र शर्मा', name_en: 'Pt. Ramchandra Sharma', relation_hi: 'परम पूज्य दादाजी (प्रपितामह)', relation_en: 'Great Grandfather', generation: 1, gender: 'male', isDeceased: true, birthDate: '15 Aug 1915', deathDate: '10 May 1998', marriageAnniversaryDate: '20 May 1934', phone: '+91 98290 11001', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-102'], childrenIds: ['f-201', 'f-203', 'f-205'], bio: 'संस्कृत एवं ज्योतिष के प्रकांड विद्वान, वंश परंपरा के मूल संस्थापक।' },
  { id: 'f-102', name_hi: 'श्रीमती सावित्री देवी शर्मा', name_en: 'Smt. Savitri Devi', relation_hi: 'परम पूज्या दादीजी (प्रपितामही)', relation_en: 'Great Grandmother', generation: 1, gender: 'female', isDeceased: true, birthDate: '10 Oct 1920', deathDate: '14 Nov 2002', marriageAnniversaryDate: '20 May 1934', phone: '+91 98290 11002', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-101'], childrenIds: ['f-201', 'f-203', 'f-205'], bio: 'धर्मपरायण एवं परिवार की मुख्य संरक्षिका।' },

  // Generation 2: Kavi Aag & Siblings/Spouses
  { id: 'f-201', name_hi: 'कवि गुरुप्रताप शर्मा "आग"', name_en: 'Kavi Gurupratap Sharma "Aag"', relation_hi: 'मुख्य साहित्यकार (पिताश्री)', relation_en: 'Patriarch & Renowned Poet', generation: 2, gender: 'male', isDeceased: false, birthDate: '26 Jan 1945', marriageAnniversaryDate: '12 Feb 1968', phone: '+91 98290 55432', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-202'], childrenIds: ['f-301', 'f-303', 'f-305'], bio: 'हिंदी काव्य जगत के तेजस्वी हस्ताक्षर एवं वरिष्ठ साहित्यकार।' },
  { id: 'f-202', name_hi: 'श्रीमती कमला शर्मा', name_en: 'Smt. Kamla Sharma', relation_hi: 'माताश्री (धर्मपत्नी)', relation_en: 'Matriarch', generation: 2, gender: 'female', isDeceased: false, birthDate: '14 Mar 1950', marriageAnniversaryDate: '12 Feb 1968', phone: '+91 98290 55433', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-201'], childrenIds: ['f-301', 'f-303', 'f-305'], bio: 'साहित्य साधना की प्रेरणास्रोत एवं गृह स्वामिनी।' },
  { id: 'f-203', name_hi: 'श्री हरिशंकर शर्मा', name_en: 'Shri Harishankar Sharma', relation_hi: 'चाचाजी (अनुज)', relation_en: 'Uncle (Younger Brother)', generation: 2, gender: 'male', isDeceased: false, birthDate: '05 Nov 1948', marriageAnniversaryDate: '18 Apr 1972', phone: '+91 94140 12345', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-204'], childrenIds: ['f-307', 'f-309'], bio: 'सेवानिवृत्त शिक्षाविद् एवं समाजसेवी।' },
  { id: 'f-204', name_hi: 'श्रीमती सुशीला शर्मा', name_en: 'Smt. Sushila Sharma', relation_hi: 'चाचीजी', relation_en: 'Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '22 Aug 1953', marriageAnniversaryDate: '18 Apr 1972', phone: '+91 94140 12346', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-203'], childrenIds: ['f-307', 'f-309'], bio: 'गृहणी एवं धार्मिक विचारधारा।' },
  { id: 'f-205', name_hi: 'श्रीमती भगवती देवी', name_en: 'Smt. Bhagwati Devi', relation_hi: 'बुआजी (भगिनी)', relation_en: 'Aunt (Sister)', generation: 2, gender: 'female', isDeceased: false, birthDate: '12 Jun 1952', marriageAnniversaryDate: '05 May 1974', phone: '+91 98280 99887', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-206'], childrenIds: ['f-311'], bio: 'जयपुर निवासी वरिष्ठ परिजनों की प्रिय बहन।' },
  { id: 'f-206', name_hi: 'श्री रामेश्वर प्रसाद व्यास', name_en: 'Shri Rameshwar Prasad Vyas', relation_hi: 'फूफाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '10 Jan 1946', marriageAnniversaryDate: '05 May 1974', phone: '+91 98280 99888', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-205'], childrenIds: ['f-311'], bio: 'वरिष्ठ अधिवक्ता एवं समाजसेवी।' },

  // Generation 3: Children & Spouses
  { id: 'f-301', name_hi: 'श्री संकल्प शर्मा', name_en: 'Shri Sankalp Sharma', relation_hi: 'ज्येष्ठ पुत्र', relation_en: 'Elder Son (Architect)', generation: 3, gender: 'male', isDeceased: false, birthDate: '18 Sep 1972', marriageAnniversaryDate: '21 Nov 1998', phone: '+91 98290 77665', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-302'], childrenIds: ['f-401', 'f-402'], bio: 'वरिष्ठ सॉफ्टवेयर इंजीनियर एवं डिजिटल आर्किटेक्ट।' },
  { id: 'f-302', name_hi: 'श्रीमती प्रज्ञा शर्मा', name_en: 'Smt. Pragya Sharma', relation_hi: 'ज्येष्ठ पुत्रवधू', relation_en: 'Daughter-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '04 Apr 1976', marriageAnniversaryDate: '21 Nov 1998', phone: '+91 98290 77666', photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-301'], childrenIds: ['f-401', 'f-402'], bio: 'उच्च माध्यमिक शिक्षिका एवं चित्रकार।' },
  { id: 'f-303', name_hi: 'श्री राघव शर्मा', name_en: 'Shri Raghav Sharma', relation_hi: 'द्वितीय पुत्र', relation_en: 'Second Son', generation: 3, gender: 'male', isDeceased: false, birthDate: '11 Dec 1975', marriageAnniversaryDate: '03 Dec 2002', phone: '+91 98290 44332', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-304'], childrenIds: ['f-403', 'f-404'], bio: 'प्रशासनिक अधिकारी (राजस्थान राज्य सेवा)।' },
  { id: 'f-304', name_hi: 'श्रीमती अल्पना शर्मा', name_en: 'Smt. Alpana Sharma', relation_hi: 'पुत्रवधू', relation_en: 'Daughter-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '09 Aug 1979', marriageAnniversaryDate: '03 Dec 2002', phone: '+91 98290 44333', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-303'], childrenIds: ['f-403', 'f-404'], bio: 'बैंक प्रबंधक (भारतीय स्टेट बैंक)।' },
  { id: 'f-305', name_hi: 'श्रीमती नीरजा शर्मा (जोशी)', name_en: 'Smt. Neerja Sharma', relation_hi: 'पुत्री', relation_en: 'Daughter', generation: 3, gender: 'female', isDeceased: false, birthDate: '02 Feb 1980', marriageAnniversaryDate: '20 Feb 2005', phone: '+91 94141 88776', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-306'], childrenIds: ['f-405'], bio: 'असिस्टेंट प्रोफेसर (हिंदी साहित्य)।' },
  { id: 'f-306', name_hi: 'डाॅ. आनंद जोशी', name_en: 'Dr. Anand Joshi', relation_hi: 'दामाद (जामातृ)', relation_en: 'Son-in-law', generation: 3, gender: 'male', isDeceased: false, birthDate: '14 Jul 1977', marriageAnniversaryDate: '20 Feb 2005', phone: '+91 94141 88777', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-305'], childrenIds: ['f-405'], bio: 'वरिष्ठ हृदय रोग विशेषज्ञ (SMS अस्पताल)।' },
  { id: 'f-307', name_hi: 'श्री मयंक शर्मा', name_en: 'Shri Mayank Sharma', relation_hi: 'चचेरा भाई', relation_en: 'Cousin Brother', generation: 3, gender: 'male', isDeceased: false, birthDate: '25 Sep 1981', marriageAnniversaryDate: '15 Jan 2008', phone: '+91 98291 11223', photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80', parentIds: ['f-203', 'f-204'], spouseIds: ['f-308'], childrenIds: ['f-406', 'f-407'], bio: 'आईटी समाधान उद्यमी।' },
  { id: 'f-308', name_hi: 'श्रीमती ऋचा शर्मा', name_en: 'Smt. Richa Sharma', relation_hi: 'भाभी', relation_en: 'Sister-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '30 May 1985', marriageAnniversaryDate: '15 Jan 2008', phone: '+91 98291 11224', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-307'], childrenIds: ['f-406', 'f-407'], bio: 'फैशन डिज़ाइनर।' },
  { id: 'f-309', name_hi: 'श्रीमती गरिमा शर्मा', name_en: 'Smt. Garima Sharma', relation_hi: 'चचेरी बहन', relation_en: 'Cousin Sister', generation: 3, gender: 'female', isDeceased: false, birthDate: '08 Nov 1984', marriageAnniversaryDate: '10 Feb 2010', phone: '+91 94142 33445', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', parentIds: ['f-203', 'f-204'], spouseIds: ['f-310'], childrenIds: ['f-408'], bio: 'चार्टर्ड अकाउंटेंट (CA)।' },
  { id: 'f-310', name_hi: 'श्री सिद्धार्थ द्विवेदी', name_en: 'Shri Siddharth Dwivedi', relation_hi: 'बहनोई', relation_en: 'Brother-in-law', generation: 3, gender: 'male', isDeceased: false, birthDate: '16 Mar 1980', marriageAnniversaryDate: '10 Feb 2010', phone: '+91 94142 33446', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-309'], childrenIds: ['f-408'], bio: 'वरिष्ठ प्रबंधक (इन्फोसिस)।' },
  { id: 'f-311', name_hi: 'श्री गौरव व्यास', name_en: 'Shri Gaurav Vyas', relation_hi: 'फूपेरा भाई', relation_en: 'Cousin Brother', generation: 3, gender: 'male', isDeceased: false, birthDate: '14 Apr 1983', marriageAnniversaryDate: '24 Nov 2011', phone: '+91 98281 66554', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', parentIds: ['f-205', 'f-206'], spouseIds: ['f-312'], childrenIds: ['f-409'], bio: 'सिविल इंजीनियर (PWD)।' },
  { id: 'f-312', name_hi: 'श्रीमती नम्रता व्यास', name_en: 'Smt. Namrata Vyas', relation_hi: 'भ्रातृजाया', relation_en: 'Sister-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '01 Jul 1987', marriageAnniversaryDate: '24 Nov 2011', phone: '+91 98281 66555', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-311'], childrenIds: ['f-409'], bio: 'वास्तुविद एवं गृह सज्जा विशेषज्ञ।' },

  // Generation 4: Grandchildren
  { id: 'f-401', name_hi: 'वेदांत शर्मा', name_en: 'Vedant Sharma', relation_hi: 'पौत्र (संकल्प जी के पुत्र)', relation_en: 'Grandson', generation: 4, gender: 'male', isDeceased: false, birthDate: '14 Oct 2002', phone: '+91 98290 88990', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', parentIds: ['f-301', 'f-302'], spouseIds: [], childrenIds: [], bio: 'B.Tech छात्र (IIT दिल्ली)।' },
  { id: 'f-402', name_hi: 'अनन्या शर्मा', name_en: 'Ananya Sharma', relation_hi: 'पौत्री (संकल्प जी की पुत्री)', relation_en: 'Granddaughter', generation: 4, gender: 'female', isDeceased: false, birthDate: '09 May 2006', phone: '+91 98290 88991', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', parentIds: ['f-301', 'f-302'], spouseIds: [], childrenIds: [], bio: 'मेडिकल छात्रा (NEET)।' },
  { id: 'f-403', name_hi: 'शौर्य शर्मा', name_en: 'Shaurya Sharma', relation_hi: 'पौत्र (राघव जी के पुत्र)', relation_en: 'Grandson', generation: 4, gender: 'male', isDeceased: false, birthDate: '21 Aug 2005', phone: '+91 98290 22110', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-303', 'f-304'], spouseIds: [], childrenIds: [], bio: 'कक्षा १२ का छात्र।' },
  { id: 'f-404', name_hi: 'अवनी शर्मा', name_en: 'Avani Sharma', relation_hi: 'पौत्री (राघव जी की पुत्री)', relation_en: 'Granddaughter', generation: 4, gender: 'female', isDeceased: false, birthDate: '16 Dec 2010', phone: '+91 98290 22111', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', parentIds: ['f-303', 'f-304'], spouseIds: [], childrenIds: [], bio: 'कक्षा ८ की छात्रा।' },
  { id: 'f-405', name_hi: 'कबीर जोशी', name_en: 'Kabir Joshi', relation_hi: 'दोहित (नीरजा जी के पुत्र)', relation_en: 'Grandson (Daughter Son)', generation: 4, gender: 'male', isDeceased: false, birthDate: '03 Mar 2009', phone: '+91 94141 99001', photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80', parentIds: ['f-305', 'f-306'], spouseIds: [], childrenIds: [], bio: 'कक्षा ९ का छात्र।' },
  { id: 'f-406', name_hi: 'आरव शर्मा', name_en: 'Aarav Sharma', relation_hi: 'भतीजे का पुत्र', relation_en: 'Grandnephew', generation: 4, gender: 'male', isDeceased: false, birthDate: '18 Jun 2012', phone: '+91 98291 55443', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', parentIds: ['f-307', 'f-308'], spouseIds: [], childrenIds: [], bio: 'कक्षा ६ का छात्र।' },
  { id: 'f-407', name_hi: 'सिया शर्मा', name_en: 'Siya Sharma', relation_hi: 'भतीजे की पुत्री', relation_en: 'Grandniece', generation: 4, gender: 'female', isDeceased: false, birthDate: '22 Nov 2015', phone: '+91 98291 55444', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80', parentIds: ['f-307', 'f-308'], spouseIds: [], childrenIds: [], bio: 'कक्षा ३ की छात्रा।' },
  { id: 'f-408', name_hi: 'अथर्व द्विवेदी', name_en: 'Atharva Dwivedi', relation_hi: 'भांजी का पुत्र', relation_en: 'Grandnephew', generation: 4, gender: 'male', isDeceased: false, birthDate: '05 Apr 2014', phone: '+91 94142 77889', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', parentIds: ['f-309', 'f-310'], spouseIds: [], childrenIds: [], bio: 'कक्षा ४ का छात्र।' },
  { id: 'f-409', name_hi: 'दिया व्यास', name_en: 'Diya Vyas', relation_hi: 'भांजे की पुत्री', relation_en: 'Grandniece', generation: 4, gender: 'female', isDeceased: false, birthDate: '30 Jan 2016', phone: '+91 98281 88990', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', parentIds: ['f-311', 'f-312'], spouseIds: [], childrenIds: [], bio: 'प्राथमिक छात्र।' },
  { id: 'f-410', name_hi: 'देव शर्मा', name_en: 'Dev Sharma', relation_hi: 'परिजन', relation_en: 'Family Member', generation: 4, gender: 'male', isDeceased: false, birthDate: '2018', phone: '+91 98290 00010', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: [], childrenIds: [], bio: 'बालक।' },
  { id: 'f-411', name_hi: 'ईशा शर्मा', name_en: 'Isha Sharma', relation_hi: 'परिजन', relation_en: 'Family Member', generation: 4, gender: 'female', isDeceased: false, birthDate: '2020', phone: '+91 98290 00011', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: [], childrenIds: [], bio: 'बालिका।' },
  { id: 'f-412', name_hi: 'श्री पुरुषोत्तम शर्मा', name_en: 'Shri Purushottam Sharma', relation_hi: 'पितृव्य', relation_en: 'Senior Relative', generation: 2, gender: 'male', isDeceased: true, birthDate: '1940', deathDate: '2015', marriageAnniversaryDate: '1965', phone: '+91 98290 00012', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-101'], spouseIds: ['f-413'], childrenIds: ['f-414', 'f-418'], bio: 'वरिष्ठ सम्पादक।' },
  { id: 'f-413', name_hi: 'श्रीमती कौशल्या शर्मा', name_en: 'Smt. Kaushalya Sharma', relation_hi: 'पितृव्य पत्नी', relation_en: 'Senior Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '1945', marriageAnniversaryDate: '1965', phone: '+91 98290 00013', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-412'], childrenIds: ['f-414', 'f-418'], bio: 'वरिष्ठ महिला।' },
  { id: 'f-414', name_hi: 'श्री विकास शर्मा', name_en: 'Shri Vikas Sharma', relation_hi: 'अनुज', relation_en: 'Cousin', generation: 3, gender: 'male', isDeceased: false, birthDate: '1988', marriageAnniversaryDate: '2015', phone: '+91 98290 00014', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', parentIds: ['f-412', 'f-413'], spouseIds: ['f-415'], childrenIds: ['f-416', 'f-417'], bio: 'सॉफ्टवेयर इंजीनियर।' },
  { id: 'f-415', name_hi: 'श्रीमती पूजा शर्मा', name_en: 'Smt. Pooja Sharma', relation_hi: 'भ्रातृजाया', relation_en: 'Sister-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '1990', marriageAnniversaryDate: '2015', phone: '+91 98290 00015', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-414'], childrenIds: ['f-416', 'f-417'], bio: 'वास्तुविद।' },
  { id: 'f-416', name_hi: 'वीर शर्मा', name_en: 'Veer Sharma', relation_hi: 'पौत्र', relation_en: 'Grandson', generation: 4, gender: 'male', isDeceased: false, birthDate: '2017', phone: '+91 98290 00016', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-414', 'f-415'], spouseIds: [], childrenIds: [], bio: 'छात्र।' },
  { id: 'f-417', name_hi: 'मीरा शर्मा', name_en: 'Meera Sharma', relation_hi: 'पौत्री', relation_en: 'Granddaughter', generation: 4, gender: 'female', isDeceased: false, birthDate: '2019', phone: '+91 98290 00017', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', parentIds: ['f-414', 'f-415'], spouseIds: [], childrenIds: [], bio: 'बालिका।' },
  { id: 'f-418', name_hi: 'श्री दिनेश शर्मा', name_en: 'Shri Dinesh Sharma', relation_hi: 'कुटुंबीजन', relation_en: 'Relative', generation: 3, gender: 'male', isDeceased: false, birthDate: '1986', marriageAnniversaryDate: '2012', phone: '+91 98290 00018', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-412', 'f-413'], spouseIds: ['f-419'], childrenIds: ['f-420'], bio: 'उद्योगपति।' },
  { id: 'f-419', name_hi: 'श्रीमती निशा शर्मा', name_en: 'Smt. Nisha Sharma', relation_hi: 'कुटुंबीजन', relation_en: 'Relative', generation: 3, gender: 'female', isDeceased: false, birthDate: '1989', marriageAnniversaryDate: '2012', phone: '+91 98290 00019', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-418'], childrenIds: ['f-420'], bio: 'शिक्षिका।' },
  { id: 'f-420', name_hi: 'तेजस शर्मा', name_en: 'Tejas Sharma', relation_hi: 'पौत्र', relation_en: 'Grandson', generation: 4, gender: 'male', isDeceased: false, birthDate: '2014', phone: '+91 98290 00020', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', parentIds: ['f-418', 'f-419'], spouseIds: [], childrenIds: [], bio: 'बालक।' }
]

export default function FamilyTreeCanvas({ 
  data = FAMILY_DATA_35, 
  rootId = 'f-201',
  selectedNodeId,
  onNodeSelect
}) {
  const { i18n } = useTranslation()
  const isHi = i18n.language !== 'en'

  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [focusedId, setFocusedId] = useState(selectedNodeId || rootId)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)

  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const containerRefs = useRef({})
  const [lines, setLines] = useState([])

  useEffect(() => {
    if (selectedNodeId) {
      setFocusedId(selectedNodeId)
      setIsDrawerOpen(true)
    }
  }, [selectedNodeId])

  // Fast $O(1)$ Node Index Map
  const memberMap = useMemo(() => {
    const map = new Map()
    data.forEach(m => map.set(m.id, m))
    return map
  }, [data])

  const selectedMember = memberMap.get(focusedId) || data[0]

  // Dynamic 2D Hierarchical Tree Layout Calculator
  const layoutPositions = useMemo(() => {
    const posMap = new Map()
    const genTiers = { 1: [], 2: [], 3: [], 4: [] }
    coupleContainers.forEach(c => {
      if (genTiers[c.generation]) genTiers[c.generation].push(c)
    })

    const CONTAINER_WIDTH_COUPLE = 330
    const CONTAINER_WIDTH_SINGLE = 175
    const CONTAINER_HEIGHT = 70
    const Y_GAP = 180
    const X_GAP = 40

    const getWidth = (c) => c.isCouple ? CONTAINER_WIDTH_COUPLE : CONTAINER_WIDTH_SINGLE

    // Gen 1 (Ancestors): Position centered at X: 1100
    let gen1X = 1100
    genTiers[1].forEach(c => {
      const w = getWidth(c)
      posMap.set(c.id, { x: gen1X, y: 50, width: w, height: CONTAINER_HEIGHT })
      gen1X += w + X_GAP
    })

    // Layout Gen 2, 3, 4 recursively beneath parents
    ;[2, 3, 4].forEach(genLevel => {
      const levelContainers = genTiers[genLevel] || []
      const parentGenContainers = genTiers[genLevel - 1] || []

      const childrenByParent = new Map()
      const unassigned = []

      levelContainers.forEach(childC => {
        const parentC = parentGenContainers.find(pC => {
          const pIds = [pC.primary.id, pC.secondary?.id].filter(Boolean)
          const cPIds = [...(childC.primary.parentIds || []), ...(childC.secondary?.parentIds || [])]
          return cPIds.some(id => pIds.includes(id))
        })

        if (parentC) {
          if (!childrenByParent.has(parentC.id)) childrenByParent.set(parentC.id, [])
          childrenByParent.get(parentC.id).push(childC)
        } else {
          unassigned.push(childC)
        }
      })

      let currentRightX = 120
      parentGenContainers.forEach(parentC => {
        const parentPos = posMap.get(parentC.id) || { x: 800, y: (genLevel - 2) * Y_GAP + 50, width: 300, height: 70 }
        const children = childrenByParent.get(parentC.id) || []

        if (children.length > 0) {
          const totalChildrenWidth = children.reduce((sum, c) => sum + getWidth(c), 0) + (children.length - 1) * X_GAP
          const parentCenterX = parentPos.x + parentPos.width / 2
          let startX = Math.max(currentRightX, parentCenterX - totalChildrenWidth / 2)

          children.forEach(childC => {
            const w = getWidth(childC)
            posMap.set(childC.id, { x: startX, y: (genLevel - 1) * Y_GAP + 50, width: w, height: CONTAINER_HEIGHT })
            startX += w + X_GAP
          })
          currentRightX = startX + X_GAP
        }
      })

      unassigned.forEach(childC => {
        const w = getWidth(childC)
        posMap.set(childC.id, { x: currentRightX, y: (genLevel - 1) * Y_GAP + 50, width: w, height: CONTAINER_HEIGHT })
        currentRightX += w + X_GAP
      })
    })

    return posMap
  }, [coupleContainers])

  // Orthogonal SVG Step-Line Edge Path Generator (Parent Couple -> Child Nodes)
  const svgTreeEdges = useMemo(() => {
    const edges = []

    coupleContainers.forEach(parentC => {
      const parentPos = layoutPositions.get(parentC.id)
      if (!parentPos) return

      const pX = parentPos.x + parentPos.width / 2
      const pY = parentPos.y + parentPos.height
      const midY = pY + 45

      ;(parentC.childrenIds || []).forEach(childId => {
        const childC = coupleContainers.find(c => c.primary.id === childId || (c.secondary && c.secondary.id === childId))
        if (!childC) return
        const childPos = layoutPositions.get(childC.id)
        if (!childPos) return

        const cX = childPos.x + childPos.width / 2
        const cY = childPos.y

        const isParentActive = activeNeighborhood.has(parentC.primary.id) || (parentC.secondary && activeNeighborhood.has(parentC.secondary.id))
        const isChildActive = activeNeighborhood.has(childId)
        const isActive = isParentActive && isChildActive

        // Orthogonal Trunk-and-Branch path (Down, Across, Down)
        const pathD = `M ${pX} ${pY} V ${midY} H ${cX} V ${cY}`

        edges.push({
          id: `edge-${parentC.id}-${childC.id}`,
          pathD,
          pX,
          pY,
          cX,
          cY,
          midY,
          isActive
        })
      })
    })

    return edges
  }, [coupleContainers, layoutPositions, activeNeighborhood])

  // Camera Centering on Node
  const focusMemberAndCenter = (memberId) => {
    const container = coupleContainers.find(c => c.primary.id === memberId || (c.secondary && c.secondary.id === memberId))
    if (container) {
      const pos = layoutPositions.get(container.id)
      if (pos) {
        setPanOffset({ x: 380 - pos.x, y: 180 - pos.y })
        setZoomLevel(1.1)
      }
    }

    setFocusedId(memberId)
    setIsDrawerOpen(true)
    if (onNodeSelect) onNodeSelect(memberId)

    if (document.activeElement) document.activeElement.blur()
    setSearchQuery('')
    setIsSearchDropdownOpen(false)
  }

  // Phase 3 Search Autocomplete Filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return data.filter(m => 
      m.name_hi.toLowerCase().includes(q) ||
      m.name_en.toLowerCase().includes(q) ||
      (m.relation_hi && m.relation_hi.toLowerCase().includes(q)) ||
      (m.relation_en && m.relation_en.toLowerCase().includes(q))
    ).slice(0, 8)
  }, [searchQuery, data])

  // Canvas Mouse & Touch Pan Controls
  const handleMouseDown = (e) => {
    if (e.target.closest('.family-joint-card') || e.target.closest('.canvas-btn') || e.target.closest('.canvas-search-box')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    if (document.activeElement) document.activeElement.blur()
    setIsSearchDropdownOpen(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (e.target.closest('.family-joint-card') || e.target.closest('.canvas-btn') || e.target.closest('.canvas-search-box')) return
      setIsDragging(true)
      const touch = e.touches[0]
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y })
      if (document.activeElement) document.activeElement.blur()
      setIsSearchDropdownOpen(false)
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    setPanOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y })
  }

  // Zoom Actions
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.8))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.4))
  const resetCamera = () => {
    setZoomLevel(1)
    setPanOffset({ x: -650, y: 20 })
    setFocusedId(rootId)
  }

  const handleCardClick = (memberId) => {
    focusMemberAndCenter(memberId)
  }

  return (
    <div className="family-canvas-wrapper">
      {/* Canvas Header, Search & Focus Mode Bar */}
      <div className="family-canvas-toolbar">
        {/* Autocomplete Search Input */}
        <div className="canvas-search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text"
            className="canvas-search-input"
            placeholder={isHi ? 'नाम या संबंध खोजें...' : 'Search member...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsSearchDropdownOpen(true)
            }}
            onFocus={() => setIsSearchDropdownOpen(true)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => { setSearchQuery(''); setIsSearchDropdownOpen(false); }}>✕</button>
          )}

          {/* Autocomplete Dropdown */}
          {isSearchDropdownOpen && searchResults.length > 0 && (
            <div className="canvas-search-dropdown">
              {searchResults.map(member => (
                <div 
                  key={member.id} 
                  className="search-dropdown-item"
                  onClick={() => focusMemberAndCenter(member.id)}
                >
                  <img src={member.photoUrl} alt={member.name_en} className="search-item-avatar" />
                  <div className="search-item-meta">
                    <span className="search-item-name">{isHi ? member.name_hi : member.name_en}</span>
                    <span className="search-item-relation">{isHi ? member.relation_hi : member.relation_en}</span>
                  </div>
                  <span className="search-item-gen">Gen {member.generation}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          className={`canvas-btn mode-btn ${isFocusMode ? 'mode-active' : ''}`}
          onClick={() => setIsFocusMode(!isFocusMode)}
          title="Toggle Sub-Tree Focus Mode"
        >
          {isFocusMode ? '🎯 Focus Mode (Active)' : '👁️ Show All'}
        </button>
        <button className="canvas-btn" onClick={zoomIn} title="Zoom In">+</button>
        <button className="canvas-btn" onClick={zoomOut} title="Zoom Out">-</button>
        <button className="canvas-btn reset-btn" onClick={resetCamera} title="Reset Center">🎯 Center</button>
        <span className="zoom-badge">{Math.round(zoomLevel * 100)}%</span>
      </div>

      {/* Interactive 2D Graph Canvas Area */}
      <div 
        className={`family-canvas-viewport ${isDragging ? 'grabbing' : 'grab'}`}
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        <motion.div 
          className="family-canvas-stage"
          ref={stageRef}
          animate={{ x: panOffset.x, y: panOffset.y, scale: zoomLevel }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ width: '2800px', height: '850px', position: 'relative' }}
        >
          {/* Generation Background Swimlane Bands */}
          {[1, 2, 3, 4].map(genTier => {
            const tierY = (genTier - 1) * 180 + 20
            const tierNames = {
              1: isHi ? 'प्रथम पीढ़ी — मूल पूर्वज (Gen 1 Ancestors)' : 'Gen 1 — Ancestors & Progenitors',
              2: isHi ? 'द्वितीय पीढ़ी — कवि "आग" एवं वरिष्ठ परिजन' : 'Gen 2 — Kavi "Aag" & Elders',
              3: isHi ? 'तृतीय पीढ़ी — सुपुत्र, सुपुत्री एवं सम्बंधी' : 'Gen 3 — Children & Spouses',
              4: isHi ? 'चतुर्थ पीढ़ी — पौत्र, पौत्री एवं युवा वर्ग' : 'Gen 4 — Grandchildren & Youth'
            }
            return (
              <div 
                key={`band-${genTier}`}
                className={`tree-gen-band-bg tier-bg-${genTier}`}
                style={{ top: `${tierY}px`, height: '140px' }}
              >
                <span className="gen-band-tag">{tierNames[genTier]}</span>
              </div>
            )
          })}

          {/* SVG Orthogonal Tree Connector Edge Paths Overlay */}
          <svg className="family-tree-svg-canvas" width="2800" height="850">
            {svgTreeEdges.map(edge => (
              <g key={edge.id}>
                <path 
                  d={edge.pathD}
                  className={`tree-connector-line ${edge.isActive ? 'line-active' : 'line-dimmed'}`}
                />
                <circle cx={edge.pX} cy={edge.midY} r="4" className={`junction-dot ${edge.isActive ? 'dot-active' : ''}`} />
                <circle cx={edge.cX} cy={edge.midY} r="3" className={`junction-dot ${edge.isActive ? 'dot-active' : ''}`} />
              </g>
            ))}
          </svg>

          {/* Explicitly Positioned Joint Couple Node Cards */}
          {coupleContainers.map(container => {
            const pos = layoutPositions.get(container.id)
            if (!pos) return null

            const isCouple = container.isCouple
            const p1 = container.primary
            const p2 = container.secondary

            const isP1Active = activeNeighborhood.has(p1.id)
            const isP2Active = p2 && activeNeighborhood.has(p2.id)
            const isContainerActive = isP1Active || isP2Active

            if (isFocusMode && !isContainerActive) return null

            const isP1Selected = focusedId === p1.id
            const isP2Selected = p2 && focusedId === p2.id

            return (
              <div 
                key={container.id}
                ref={el => containerRefs.current[container.id] = el}
                className={`family-joint-card ${isCouple ? 'couple-container' : 'single-container'} ${isContainerActive ? 'neighborhood-active' : 'dimmed'} ${(isP1Selected || isP2Selected) ? 'focused-node' : ''}`}
                style={{ 
                  position: 'absolute', 
                  left: `${pos.x}px`, 
                  top: `${pos.y}px`,
                  width: `${pos.width}px`,
                  height: `${pos.height}px`
                }}
              >
                {/* Primary Member Card */}
                <div 
                  className={`member-mini-card ${isP1Selected ? 'card-selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleCardClick(p1.id); }}
                >
                  <div className="mini-avatar-box">
                    <img src={p1.photoUrl} alt={p1.name_en} className="mini-avatar-img" />
                    {p1.isDeceased && <span className="deceased-lotus-icon" title="In Reverent Memory">🪷</span>}
                  </div>
                  <div className="mini-node-meta">
                    <span className="mini-name">{isHi ? p1.name_hi : p1.name_en}</span>
                    <span className="mini-relation">{isHi ? p1.relation_hi : p1.relation_en}</span>
                  </div>
                </div>

                {/* Spousal Connection Ring */}
                {isCouple && p2 && (
                  <>
                    <div className="couple-wedding-ring" title="Marriage Bond">💍</div>

                    {/* Secondary Spouse Card */}
                    <div 
                      className={`member-mini-card ${isP2Selected ? 'card-selected' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleCardClick(p2.id); }}
                    >
                      <div className="mini-avatar-box">
                        <img src={p2.photoUrl} alt={p2.name_en} className="mini-avatar-img" />
                        {p2.isDeceased && <span className="deceased-lotus-icon" title="In Reverent Memory">🪷</span>}
                      </div>
                      <div className="mini-node-meta">
                        <span className="mini-name">{isHi ? p2.name_hi : p2.name_en}</span>
                        <span className="mini-relation">{isHi ? p2.relation_hi : p2.relation_en}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Phase 2: Slide-Out Side Drawer / Mobile Bottom Sheet */}
      <AnimatePresence>
        {isDrawerOpen && selectedMember && (
          <>
            <motion.div 
              className="family-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div 
              className="family-drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <div className="family-drawer-header">
                <h3>{isHi ? 'सदस्य पूर्ण विवरण' : 'Member Profile'}</h3>
                <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>✕</button>
              </div>

              <div className="family-drawer-body">
                <div className="drawer-profile-card">
                  <div className="drawer-avatar-wrapper">
                    <img 
                      src={selectedMember.photoUrl} 
                      alt={selectedMember.name_en}
                      className="drawer-avatar"
                    />
                    {selectedMember.isDeceased && (
                      <span className="drawer-deceased-badge">
                        🪷 {isHi ? 'स्वर्गीय (स्मृतिशेष)' : 'In Reverent Memory'}
                      </span>
                    )}
                  </div>
                  <h3 className="drawer-name">{isHi ? selectedMember.name_hi : selectedMember.name_en}</h3>
                  <span className="drawer-relation-badge">{isHi ? selectedMember.relation_hi : selectedMember.relation_en}</span>
                  <span className="drawer-gen-tag">
                    {isHi ? `पीढ़ी ${selectedMember.generation}` : `Generation ${selectedMember.generation}`}
                  </span>
                </div>

                <div className="drawer-meta-section">
                  <div className="meta-row">
                    <span className="meta-label">🎂 {isHi ? 'जन्म तिथि:' : 'Birth Date:'}</span>
                    <span className="meta-value">{selectedMember.birthDate || 'N/A'}</span>
                  </div>
                  {selectedMember.deathDate && (
                    <div className="meta-row">
                      <span className="meta-label">🕊️ {isHi ? 'पुण्यतिथि:' : 'Passed Away:'}</span>
                      <span className="meta-value">{selectedMember.deathDate}</span>
                    </div>
                  )}
                  {selectedMember.marriageAnniversaryDate && (
                    <div className="meta-row">
                      <span className="meta-label">💍 {isHi ? 'विवाह वर्षगींठ:' : 'Anniversary:'}</span>
                      <span className="meta-value">{selectedMember.marriageAnniversaryDate}</span>
                    </div>
                  )}
                  {selectedMember.phone && (
                    <div className="meta-row">
                      <span className="meta-label">📞 {isHi ? 'संपर्क नंबर:' : 'Phone:'}</span>
                      <span className="meta-value">
                        <a href={`tel:${selectedMember.phone}`} className="phone-link">{selectedMember.phone}</a>
                      </span>
                    </div>
                  )}
                </div>

                {selectedMember.bio && (
                  <div className="drawer-bio-box">
                    <strong>{isHi ? 'परिचय / भूमिका:' : 'Biography & Role:'}</strong>
                    <p>{selectedMember.bio}</p>
                  </div>
                )}

                {/* Direct Links / Interactive Pills to 1st-Degree Relatives */}
                <div className="drawer-relatives-section">
                  <h4>{isHi ? 'प्रत्यक्ष पारिवारिक संबंध (1-Click Jump):' : 'Direct Relatives:'}</h4>
                  
                  {/* Parents */}
                  {selectedMember.parentIds && selectedMember.parentIds.length > 0 && (
                    <div className="relatives-group">
                      <span className="group-label">👨‍👩‍👦 {isHi ? 'माता-पिता (Parents):' : 'Parents:'}</span>
                      <div className="relatives-pills">
                        {selectedMember.parentIds.map(pId => {
                          const p = memberMap.get(pId)
                          if (!p) return null
                          return (
                            <button key={pId} className="relative-pill" onClick={() => handleCardClick(pId)}>
                              {isHi ? p.name_hi : p.name_en}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Spouses */}
                  {selectedMember.spouseIds && selectedMember.spouseIds.length > 0 && (
                    <div className="relatives-group">
                      <span className="group-label">💍 {isHi ? 'जीवनसाथी (Spouse):' : 'Spouse:'}</span>
                      <div className="relatives-pills">
                        {selectedMember.spouseIds.map(sId => {
                          const s = memberMap.get(sId)
                          if (!s) return null
                          return (
                            <button key={sId} className="relative-pill" onClick={() => handleCardClick(sId)}>
                              {isHi ? s.name_hi : s.name_en}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Children */}
                  {selectedMember.childrenIds && selectedMember.childrenIds.length > 0 && (
                    <div className="relatives-group">
                      <span className="group-label">👶 {isHi ? 'संतान (Children):' : 'Children:'}</span>
                      <div className="relatives-pills">
                        {selectedMember.childrenIds.map(cId => {
                          const c = memberMap.get(cId)
                          if (!c) return null
                          return (
                            <button key={cId} className="relative-pill" onClick={() => handleCardClick(cId)}>
                              {isHi ? c.name_hi : c.name_en}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
