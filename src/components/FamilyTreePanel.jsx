import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import './FamilyTreePanel.css'

// 35 Dummy Records spanning 4 Generations for Gurupratap Sharma 'Aag' Family Tree
export const MOCK_FAMILY_DATA = [
  // Generation 1: Progenitors (Paternal & Maternal Roots)
  {
    id: 'f-101',
    name_hi: 'पंडित रामचन्द्र शर्मा',
    name_en: 'Pt. Ramchandra Sharma',
    relation_hi: 'परम पूज्य दादाजी (प्रपितामह)',
    relation_en: 'Great Grandfather (Progenitor)',
    generation: 1,
    gender: 'male',
    birth_date: '१५ अगस्त १९१५ (15 Aug 1915)',
    anniversary_date: '२० मई १९३४ (20 May 1934)',
    phone: '+91 98290 11001',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-102'],
    childrenIds: ['f-201', 'f-203', 'f-205'],
    bio: 'संस्कृत एवं ज्योतिष के प्रकांड विद्वान, वंश परंपरा के संस्थापक मुकुट।'
  },
  {
    id: 'f-102',
    name_hi: 'श्रीमती सावित्री देवी शर्मा',
    name_en: 'Smt. Savitri Devi Sharma',
    relation_hi: 'परम पूज्या दादीजी (प्रपितामही)',
    relation_en: 'Great Grandmother',
    generation: 1,
    gender: 'female',
    birth_date: '१० अक्टूबर १९२० (10 Oct 1920)',
    anniversary_date: '२० मई १९३४ (20 May 1934)',
    phone: '+91 98290 11002',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-101'],
    childrenIds: ['f-201', 'f-203', 'f-205'],
    bio: 'धर्मपरायण एवं परिवार की मुख्य संरक्षिका।'
  },

  // Generation 2: Kavi Gurupratap Sharma 'Aag' & Siblings / Spouses
  {
    id: 'f-201',
    name_hi: 'कवि गुरुप्रताप शर्मा "आग"',
    name_en: 'Kavi Gurupratap Sharma "Aag"',
    relation_hi: 'मुख्य साहित्यकार (पिताश्री)',
    relation_en: 'Patriarch & Renowned Poet',
    generation: 2,
    gender: 'male',
    birth_date: '२६ जनवरी १९४५ (26 Jan 1945)',
    anniversary_date: '१२ फरवरी १९६८ (12 Feb 1968)',
    phone: '+91 98290 55432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-101', 'f-102'],
    spouseIds: ['f-202'],
    childrenIds: ['f-301', 'f-303', 'f-305'],
    bio: 'हिंदी काव्य जगत के तेजस्वी हस्ताक्षर एवं वरिष्ठ साहित्यकार।'
  },
  {
    id: 'f-202',
    name_hi: 'श्रीमती कमला शर्मा',
    name_en: 'Smt. Kamla Sharma',
    relation_hi: 'माताश्री (धर्मपत्नी)',
    relation_en: 'Matriarch',
    generation: 2,
    gender: 'female',
    birth_date: '१४ मार्च १९५० (14 Mar 1950)',
    anniversary_date: '१२ फरवरी १९६८ (12 Feb 1968)',
    phone: '+91 98290 55433',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-201'],
    childrenIds: ['f-301', 'f-303', 'f-305'],
    bio: 'साहित्य साधना की प्रेरणास्रोत एवं गृह स्वामिनी।'
  },
  {
    id: 'f-203',
    name_hi: 'श्री हरिशंकर शर्मा',
    name_en: 'Shri Harishankar Sharma',
    relation_hi: 'चाचाजी (अनुज)',
    relation_en: 'Uncle (Younger Brother)',
    generation: 2,
    gender: 'male',
    birth_date: '०५ नवम्बर १९४८ (05 Nov 1948)',
    anniversary_date: '१८ अप्रैल १९७२ (18 Apr 1972)',
    phone: '+91 94140 12345',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-101', 'f-102'],
    spouseIds: ['f-204'],
    childrenIds: ['f-307', 'f-309'],
    bio: 'सेवानिवृत्त शिक्षाविद् एवं समाजसेवी।'
  },
  {
    id: 'f-204',
    name_hi: 'श्रीमती सुशीला शर्मा',
    name_en: 'Smt. Sushila Sharma',
    relation_hi: 'चाचीजी',
    relation_en: 'Aunt',
    generation: 2,
    gender: 'female',
    birth_date: '२२ अगस्त १९५३ (22 Aug 1953)',
    anniversary_date: '१८ अप्रैल १९७२ (18 Apr 1972)',
    phone: '+91 94140 12346',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-203'],
    childrenIds: ['f-307', 'f-309'],
    bio: 'गृहणी एवं धार्मिक विचारधारा।'
  },
  {
    id: 'f-205',
    name_hi: 'श्रीमती भगवती देवी (शर्मा)',
    name_en: 'Smt. Bhagwati Devi',
    relation_hi: 'बुआजी (भगिनी)',
    relation_en: 'Aunt (Sister)',
    generation: 2,
    gender: 'female',
    birth_date: '१२ जून १९५२ (12 Jun 1952)',
    anniversary_date: '०५ मई १९७४ (05 May 1974)',
    phone: '+91 98280 99887',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-101', 'f-102'],
    spouseIds: ['f-206'],
    childrenIds: ['f-311'],
    bio: 'जयपुर निवासी वरिष्ठ परिजनों की प्रिय बहन।'
  },
  {
    id: 'f-206',
    name_hi: 'श्री रामेश्वर प्रसाद व्यास',
    name_en: 'Shri Rameshwar Prasad Vyas',
    relation_hi: 'फूफाजी',
    relation_en: 'Uncle-in-law',
    generation: 2,
    gender: 'male',
    birth_date: '१० जनवरी १९४६ (10 Jan 1946)',
    anniversary_date: '०५ मई १९७४ (05 May 1974)',
    phone: '+91 98280 99888',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-205'],
    childrenIds: ['f-311'],
    bio: 'वरिष्ठ अधिवक्ता एवं समाजसेवी।'
  },

  // Generation 3: Children of Kavi Aag & Cousins
  {
    id: 'f-301',
    name_hi: 'श्री संकल्प शर्मा',
    name_en: 'Shri Sankalp Sharma',
    relation_hi: 'ज्येष्ठ पुत्र',
    relation_en: 'Elder Son (Architect/Tech)',
    generation: 3,
    gender: 'male',
    birth_date: '१८ सितंबर १९७२ (18 Sep 1972)',
    anniversary_date: '२१ नवंबर १९९८ (21 Nov 1998)',
    phone: '+91 98290 77665',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-201', 'f-202'],
    spouseIds: ['f-302'],
    childrenIds: ['f-401', 'f-402'],
    bio: 'वरिष्ठ सॉफ्टवेयर इंजीनियर एवं डिजिटल आर्किटेक्ट।'
  },
  {
    id: 'f-302',
    name_hi: 'श्रीमती प्रज्ञा शर्मा',
    name_en: 'Smt. Pragya Sharma',
    relation_hi: 'ज्येष्ठ पुत्रवधू',
    relation_en: 'Daughter-in-law',
    generation: 3,
    gender: 'female',
    birth_date: '०४ अप्रैल १९७६ (04 Apr 1976)',
    anniversary_date: '२१ नवंबर १९९८ (21 Nov 1998)',
    phone: '+91 98290 77666',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-301'],
    childrenIds: ['f-401', 'f-402'],
    bio: 'उच्च माध्यमिक शिक्षिका एवं चित्रकार।'
  },
  {
    id: 'f-303',
    name_hi: 'श्री राघव शर्मा',
    name_en: 'Shri Raghav Sharma',
    relation_hi: 'द्वितीय पुत्र',
    relation_en: 'Second Son',
    generation: 3,
    gender: 'male',
    birth_date: '११ दिसंबर १९७५ (11 Dec 1975)',
    anniversary_date: '०३ दिसंबर २००२ (03 Dec 2002)',
    phone: '+91 98290 44332',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-201', 'f-202'],
    spouseIds: ['f-304'],
    childrenIds: ['f-403', 'f-404'],
    bio: 'प्रशासनिक अधिकारी (राजस्थान राज्य सेवा)।'
  },
  {
    id: 'f-304',
    name_hi: 'श्रीमती अल्पना शर्मा',
    name_en: 'Smt. Alpana Sharma',
    relation_hi: 'पुत्रवधू',
    relation_en: 'Daughter-in-law',
    generation: 3,
    gender: 'female',
    birth_date: '०९ अगस्त १९७९ (09 Aug 1979)',
    anniversary_date: '०३ दिसंबर २००२ (03 Dec 2002)',
    phone: '+91 98290 44333',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-303'],
    childrenIds: ['f-403', 'f-404'],
    bio: 'बैंक प्रबंधक (भारतीय स्टेट बैंक)।'
  },
  {
    id: 'f-305',
    name_hi: 'श्रीमती नीरजा शर्मा (जोशी)',
    name_en: 'Smt. Neerja Sharma (Joshi)',
    relation_hi: 'पुत्री',
    relation_en: 'Daughter',
    generation: 3,
    gender: 'female',
    birth_date: '०२ फरवरी १९८० (02 Feb 1980)',
    anniversary_date: '२० फरवरी २००५ (20 Feb 2005)',
    phone: '+91 94141 88776',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-201', 'f-202'],
    spouseIds: ['f-306'],
    childrenIds: ['f-405'],
    bio: 'असिस्टेंट प्रोफेसर (हिंदी साहित्य)।'
  },
  {
    id: 'f-306',
    name_hi: 'डाॅ. आनंद जोशी',
    name_en: 'Dr. Anand Joshi',
    relation_hi: 'दामाद (जामातृ)',
    relation_en: 'Son-in-law',
    generation: 3,
    gender: 'male',
    birth_date: '१४ जुलाई १९७७ (14 Jul 1977)',
    anniversary_date: '२० फरवरी २००५ (20 Feb 2005)',
    phone: '+91 94141 88777',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-305'],
    childrenIds: ['f-405'],
    bio: 'वरिष्ठ हृदय रोग विशेषज्ञ (SMS हॉस्पिटल)।'
  },
  {
    id: 'f-307',
    name_hi: 'श्री मयंक शर्मा',
    name_en: 'Shri Mayank Sharma',
    relation_hi: 'चचेरा भाई (हरिशंकर जी के सुपुत्र)',
    relation_en: 'Cousin Brother',
    generation: 3,
    gender: 'male',
    birth_date: '२५ सितंबर १९८१ (25 Sep 1981)',
    anniversary_date: '१५ जनवरी २००८ (15 Jan 2008)',
    phone: '+91 98291 11223',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-203', 'f-204'],
    spouseIds: ['f-308'],
    childrenIds: ['f-406', 'f-407'],
    bio: 'व्यवसायिक उद्यमी (आईटी समाधान)।'
  },
  {
    id: 'f-308',
    name_hi: 'श्रीमती ऋचा शर्मा',
    name_en: 'Smt. Richa Sharma',
    relation_hi: 'भ्रातृजाया (भाभी)',
    relation_en: 'Cousin Sister-in-law',
    generation: 3,
    gender: 'female',
    birth_date: '३० मई १९८५ (30 May 1985)',
    anniversary_date: '१५ जनवरी २००८ (15 Jan 2008)',
    phone: '+91 98291 11224',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-307'],
    childrenIds: ['f-406', 'f-407'],
    bio: 'फैशन डिज़ाइनर एवं समाज सेविका।'
  },
  {
    id: 'f-309',
    name_hi: 'श्रीमती गरिमा शर्मा (द्विवेदी)',
    name_en: 'Smt. Garima Sharma',
    relation_hi: 'चचेरी बहन',
    relation_en: 'Cousin Sister',
    generation: 3,
    gender: 'female',
    birth_date: '०८ नवंबर १९८४ (08 Nov 1984)',
    anniversary_date: '१० फरवरी २०१० (10 Feb 2010)',
    phone: '+91 94142 33445',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-203', 'f-204'],
    spouseIds: ['f-310'],
    childrenIds: ['f-408'],
    bio: 'चार्टर्ड अकाउंटेंट (CA)।'
  },
  {
    id: 'f-310',
    name_hi: 'श्री सिद्धार्थ द्विवेदी',
    name_en: 'Shri Siddharth Dwivedi',
    relation_hi: 'बहनोई',
    relation_en: 'Brother-in-law',
    generation: 3,
    gender: 'male',
    birth_date: '१६ मार्च १९८० (16 Mar 1980)',
    anniversary_date: '१० फरवरी २०१० (10 Feb 2010)',
    phone: '+91 94142 33446',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-309'],
    childrenIds: ['f-408'],
    bio: 'वरिष्ठ प्रबंधक (इन्फोसिस)।'
  },
  {
    id: 'f-311',
    name_hi: 'श्री गौरव व्यास',
    name_en: 'Shri Gaurav Vyas',
    relation_hi: 'फूपेरा भाई (भगिनी सुपुत्र)',
    relation_en: 'Cousin Brother (Aunt Son)',
    generation: 3,
    gender: 'male',
    birth_date: '१४ अप्रैल १९८३ (14 Apr 1983)',
    anniversary_date: '२४ नवंबर २०११ (24 Nov 2011)',
    phone: '+91 98281 66554',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-205', 'f-206'],
    spouseIds: ['f-312'],
    childrenIds: ['f-409'],
    bio: 'सिविल इंजीनियर (PWD राजस्थान)।'
  },
  {
    id: 'f-312',
    name_hi: 'श्रीमती नम्रता व्यास',
    name_en: 'Smt. Namrata Vyas',
    relation_hi: 'भ्रातृजाया',
    relation_en: 'Sister-in-law',
    generation: 3,
    gender: 'female',
    birth_date: '०१ जुलाई १९८७ (01 Jul 1987)',
    anniversary_date: '२४ नवंबर २०११ (24 Nov 2011)',
    phone: '+91 98281 66555',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    parentIds: [],
    spouseIds: ['f-311'],
    childrenIds: ['f-409'],
    bio: 'वास्तुविद एवं गृह सज्जा विशेषज्ञ।'
  },

  // Generation 4: Grandchildren (Young Generation)
  {
    id: 'f-401',
    name_hi: 'आयुष्मान वेदांत शर्मा',
    name_en: 'Vedant Sharma',
    relation_hi: 'पौत्र (संकल्प जी के पुत्र)',
    relation_en: 'Grandson',
    generation: 4,
    gender: 'male',
    birth_date: '१४ अक्टूबर २००२ (14 Oct 2002)',
    anniversary_date: null,
    phone: '+91 98290 88990',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-301', 'f-302'],
    spouseIds: [],
    childrenIds: [],
    bio: 'B.Tech छात्र (IIT दिल्ली - कंप्यूटर साइंस)।'
  },
  {
    id: 'f-402',
    name_hi: 'आयुष्मती अनन्या शर्मा',
    name_en: 'Ananya Sharma',
    relation_hi: 'पौत्री (संकल्प जी की पुत्री)',
    relation_en: 'Granddaughter',
    generation: 4,
    gender: 'female',
    birth_date: '०९ मई २००६ (09 May 2006)',
    anniversary_date: null,
    phone: '+91 98290 88991',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-301', 'f-302'],
    spouseIds: [],
    childrenIds: [],
    bio: 'मेडिकल छात्रा (NEET एस्पिरेंट) एवं राष्ट्रीय स्तर की तैराक।'
  },
  {
    id: 'f-403',
    name_hi: 'आयुष्मान शौर्य शर्मा',
    name_en: 'Shaurya Sharma',
    relation_hi: 'पौत्र (राघव जी के पुत्र)',
    relation_en: 'Grandson',
    generation: 4,
    gender: 'male',
    birth_date: '२१ अगस्त २००५ (21 Aug 2005)',
    anniversary_date: null,
    phone: '+91 98290 22110',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-303', 'f-304'],
    spouseIds: [],
    childrenIds: [],
    bio: 'कक्षा १२ का मेधावी छात्र।'
  },
  {
    id: 'f-404',
    name_hi: 'आयुष्मती अवनी शर्मा',
    name_en: 'Avani Sharma',
    relation_hi: 'पौत्री (राघव जी की पुत्री)',
    relation_en: 'Granddaughter',
    generation: 4,
    gender: 'female',
    birth_date: '१६ दिसंबर २०१० (16 Dec 2010)',
    anniversary_date: null,
    phone: '+91 98290 22111',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-303', 'f-304'],
    spouseIds: [],
    childrenIds: [],
    bio: 'कक्षा ८ की छात्रा, शास्त्रीय संगीत में रुचि।'
  },
  {
    id: 'f-405',
    name_hi: 'आयुष्मान कबीर जोशी',
    name_en: 'Kabir Joshi',
    relation_hi: 'दोहित (नीरजा जी के पुत्र)',
    relation_en: 'Maternal Grandson',
    generation: 4,
    gender: 'male',
    birth_date: '०३ मार्च २००९ (03 Mar 2009)',
    anniversary_date: null,
    phone: '+91 94141 99001',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-305', 'f-306'],
    spouseIds: [],
    childrenIds: [],
    bio: 'कक्षा ९ का छात्र एवं शतरंज खिलाड़ी।'
  },
  {
    id: 'f-406',
    name_hi: 'आयुष्मान आरव शर्मा',
    name_en: 'Aarav Sharma',
    relation_hi: 'भतीजे का पुत्र (मयंक जी का पुत्र)',
    relation_en: 'Grandnephew',
    generation: 4,
    gender: 'male',
    birth_date: '१८ जून २०१२ (18 Jun 2012)',
    anniversary_date: null,
    phone: '+91 98291 55443',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-307', 'f-308'],
    spouseIds: [],
    childrenIds: [],
    bio: 'कक्षा ६ का छात्र।'
  },
  {
    id: 'f-407',
    name_hi: 'आयुष्मती सिया शर्मा',
    name_en: 'Siya Sharma',
    relation_hi: 'भतीजे की पुत्री (मयंक जी की पुत्री)',
    relation_en: 'Grandniece',
    generation: 4,
    gender: 'female',
    birth_date: '२२ नवंबर २०१५ (22 Nov 2015)',
    anniversary_date: null,
    phone: '+91 98291 55444',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-307', 'f-308'],
    spouseIds: [],
    childrenIds: [],
    bio: 'कक्षा ३ की छात्रा।'
  },
  {
    id: 'f-408',
    name_hi: 'आयुष्मान अथर्व द्विवेदी',
    name_en: 'Atharva Dwivedi',
    relation_hi: 'भांजी का पुत्र (गरिमा जी का पुत्र)',
    relation_en: 'Grandnephew',
    generation: 4,
    gender: 'male',
    birth_date: '०५ अप्रैल २०१४ (05 Apr 2014)',
    anniversary_date: null,
    phone: '+91 94142 77889',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-309', 'f-310'],
    spouseIds: [],
    childrenIds: [],
    bio: 'कक्षा ४ का छात्र।'
  },
  {
    id: 'f-409',
    name_hi: 'आयुष्मती दिया व्यास',
    name_en: 'Diya Vyas',
    relation_hi: 'भांजे की पुत्री (गौरव जी की पुत्री)',
    relation_en: 'Grandniece',
    generation: 4,
    gender: 'female',
    birth_date: '३० जनवरी २०१६ (30 Jan 2016)',
    anniversary_date: null,
    phone: '+91 98281 88990',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    parentIds: ['f-311', 'f-312'],
    spouseIds: [],
    childrenIds: [],
    bio: 'प्राथमिक विद्यालय की छात्रा।'
  },
  // Additional members to reach 35 complete nodes
  { id: 'f-410', name_hi: 'आयुष्मान देव शर्मा', name_en: 'Dev Sharma', relation_hi: 'परिजन', relation_en: 'Extended Family', generation: 4, gender: 'male', birth_date: '२०१८', anniversary_date: null, phone: '+91 98290 00010', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: [], childrenIds: [], bio: 'परिवार का कनिष्ठ सदस्य।' },
  { id: 'f-411', name_hi: 'आयुष्मती ईशा शर्मा', name_en: 'Isha Sharma', relation_hi: 'परिजन', relation_en: 'Extended Family', generation: 4, gender: 'female', birth_date: '२०२०', anniversary_date: null, phone: '+91 98290 00011', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: [], childrenIds: [], bio: 'परिवार की नन्हीं बालिका।' },
  { id: 'f-412', name_hi: 'श्री पुरुषोत्तम शर्मा', name_en: 'Shri Purushottam Sharma', relation_hi: 'पितृव्य', relation_en: 'Senior Relative', generation: 2, gender: 'male', birth_date: '१९४०', anniversary_date: '१९६५', phone: '+91 98290 00012', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-101'], spouseIds: [], childrenIds: [], bio: 'वरिष्ठ सम्पादक एवं परिवार के सलाहकार।' },
  { id: 'f-413', name_hi: 'श्रीमती कौशल्या शर्मा', name_en: 'Smt. Kaushalya Sharma', relation_hi: 'पितृव्य पत्नी', relation_en: 'Senior Aunt', generation: 2, gender: 'female', birth_date: '१९४५', anniversary_date: '१९६५', phone: '+91 98290 00013', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-412'], childrenIds: [], bio: 'परिवार की पूज्य वरिष्ठ महिला।' },
  { id: 'f-414', name_hi: 'श्री विकास शर्मा', name_en: 'Shri Vikas Sharma', relation_hi: 'अनुज', relation_en: 'Cousin', generation: 3, gender: 'male', birth_date: '१९८८', anniversary_date: '२०१५', phone: '+91 98290 00014', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', parentIds: ['f-412', 'f-413'], spouseIds: [], childrenIds: [], bio: 'सॉफ्टवेयर कंसलटेंट।' },
  { id: 'f-415', name_hi: 'श्रीमती पूजा शर्मा', name_en: 'Smt. Pooja Sharma', relation_hi: 'भ्रातृजाया', relation_en: 'Cousin Sister-in-law', generation: 3, gender: 'female', birth_date: '१९९०', anniversary_date: '२०१५', phone: '+91 98290 00015', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-414'], childrenIds: [], bio: 'वास्तुविद्।' },
  { id: 'f-416', name_hi: 'आयुष्मान वीर शर्मा', name_en: 'Veer Sharma', relation_hi: 'पौत्र', relation_en: 'Grandson', generation: 4, gender: 'male', birth_date: '२०१७', anniversary_date: null, phone: '+91 98290 00016', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-414', 'f-415'], spouseIds: [], childrenIds: [], bio: 'प्राथमिक छात्र।' },
  { id: 'f-417', name_hi: 'आयुष्मती मीरा शर्मा', name_en: 'Meera Sharma', relation_hi: 'पौत्री', relation_en: 'Granddaughter', generation: 4, gender: 'female', birth_date: '२०१९', anniversary_date: null, phone: '+91 98290 00017', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80', parentIds: ['f-414', 'f-415'], spouseIds: [], childrenIds: [], bio: 'नन्हीं पौत्री।' },
  { id: 'f-418', name_hi: 'श्री दिनेश शर्मा', name_en: 'Shri Dinesh Sharma', relation_hi: 'कुटुंबीजन', relation_en: 'Relative', generation: 3, gender: 'male', birth_date: '१९८६', anniversary_date: '२०१२', phone: '+91 98290 00018', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', parentIds: ['f-412', 'f-413'], spouseIds: [], childrenIds: [], bio: 'उद्योगपति।' },
  { id: 'f-419', name_hi: 'श्रीमती निशा शर्मा', name_en: 'Smt. Nisha Sharma', relation_hi: 'कुटुंबीजन', relation_en: 'Relative', generation: 3, gender: 'female', birth_date: '१९८९', anniversary_date: '२०१२', phone: '+91 98290 00019', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', parentIds: [], spouseIds: ['f-418'], childrenIds: [], bio: 'शिक्षिका।' },
  { id: 'f-420', name_hi: 'आयुष्मान तेजस शर्मा', name_en: 'Tejas Sharma', relation_hi: 'पौत्र', relation_en: 'Grandson', generation: 4, gender: 'male', birth_date: '२०१४', anniversary_date: null, phone: '+91 98290 00020', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', parentIds: ['f-418', 'f-419'], spouseIds: [], childrenIds: [], bio: 'बालक।' }
]

function FamilyTreePanel() {
  const { i18n } = useTranslation()
  const isHi = i18n.language !== 'en'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState('f-201') // Default select Kavi Aag
  const [activeGenFilter, setActiveGenFilter] = useState('all')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const containerRef = useRef(null)

  // Map of members by ID for fast lookup
  const membersMap = useMemo(() => {
    const map = {}
    MOCK_FAMILY_DATA.forEach(m => { map[m.id] = m })
    return map
  }, [])

  // Currently selected member
  const selectedMember = membersMap[selectedId] || MOCK_FAMILY_DATA[0]

  // Filtered members by search and generation
  const filteredMembers = useMemo(() => {
    return MOCK_FAMILY_DATA.filter(m => {
      const matchSearch = searchTerm.trim() === '' || 
        m.name_hi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.relation_hi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.relation_en.toLowerCase().includes(searchTerm.toLowerCase())

      const matchGen = activeGenFilter === 'all' || String(m.generation) === String(activeGenFilter)
      return matchSearch && matchGen
    })
  }, [searchTerm, activeGenFilter])

  // Group members by Generation for Mindmap/Radial Layout
  const generationsGrouped = useMemo(() => {
    const groups = { 1: [], 2: [], 3: [], 4: [] }
    filteredMembers.forEach(m => {
      if (groups[m.generation]) groups[m.generation].push(m)
    })
    return groups
  }, [filteredMembers])

  // Highlighted relative IDs for selected node
  const relativeIds = useMemo(() => {
    if (!selectedMember) return new Set()
    const set = new Set()
    set.add(selectedMember.id)
    ;(selectedMember.parentIds || []).forEach(id => set.add(id))
    ;(selectedMember.spouseIds || []).forEach(id => set.add(id))
    ;(selectedMember.childrenIds || []).forEach(id => set.add(id))
    return set
  }, [selectedMember])

  const handleSelectMember = (id) => {
    setSelectedId(id)
    setIsDrawerOpen(true)
  }

  return (
    <div className="phoenix-family-panel">
      {/* Header Banner & Title */}
      <div className="phoenix-family-header">
        <h2 className="phoenix-about-subheading" style={{ marginBottom: '6px' }}>
          {isHi ? 'वंशवृक्ष एवं परिवार (Family Tree)' : 'Family Tree & Lineage'}
        </h2>
        <p className="phoenix-family-subtitle">
          {isHi 
            ? 'कवि गुरुप्रताप शर्मा "आग" के ४ पीढ़ियों का पावन वंशावली आलेख (३५ सदस्य)' 
            : '4-Generation Lineage & Mindmap Graph of Kavi Gurupratap Sharma "Aag" Family (35 Members)'}
        </p>

        {/* Sticky Search & Generation Filter Bar */}
        <div className="phoenix-family-controls-bar">
          <div className="family-search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="family-search-input"
              placeholder={isHi ? 'परिवार सदस्य का नाम या संबंध खोजें...' : 'Search family member by name or relation...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>✕</button>
            )}
          </div>

          <div className="family-gen-pills">
            <button 
              className={`gen-pill ${activeGenFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveGenFilter('all')}
            >
              {isHi ? 'सभी पीढ़ियाँ (All)' : 'All Generations'}
            </button>
            <button 
              className={`gen-pill ${activeGenFilter === '1' ? 'active' : ''}`}
              onClick={() => setActiveGenFilter('1')}
            >
              {isHi ? 'प्रथम पीढ़ी (Gen 1)' : 'Gen 1 (Ancestors)'}
            </button>
            <button 
              className={`gen-pill ${activeGenFilter === '2' ? 'active' : ''}`}
              onClick={() => setActiveGenFilter('2')}
            >
              {isHi ? 'द्वितीय पीढ़ी (Gen 2)' : 'Gen 2 (Poet & Siblings)'}
            </button>
            <button 
              className={`gen-pill ${activeGenFilter === '3' ? 'active' : ''}`}
              onClick={() => setActiveGenFilter('3')}
            >
              {isHi ? 'तृतीय पीढ़ी (Gen 3)' : 'Gen 3 (Children)'}
            </button>
            <button 
              className={`gen-pill ${activeGenFilter === '4' ? 'active' : ''}`}
              onClick={() => setActiveGenFilter('4')}
            >
              {isHi ? 'चतुर्थ पीढ़ी (Gen 4)' : 'Gen 4 (Grandchildren)'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Mindmap Canvas */}
      <div className="phoenix-family-canvas-container" ref={containerRef}>
        <div className="phoenix-family-legend">
          <span className="legend-item"><span className="legend-dot root-dot"></span> {isHi ? 'मुख्य साहित्यकार (Kavi Aag)' : 'Patriarch (Kavi Aag)'}</span>
          <span className="legend-item"><span className="legend-dot male-dot"></span> {isHi ? 'पुरुष सदस्य' : 'Male'}</span>
          <span className="legend-item"><span className="legend-dot female-dot"></span> {isHi ? 'महिला सदस्य' : 'Female'}</span>
          <span className="legend-item"><span className="legend-dot rel-dot"></span> {isHi ? 'प्रत्यक्ष संबंधी (Highlighted)' : 'Immediate Relative'}</span>
        </div>

        {/* 4 Generation Bands */}
        {[1, 2, 3, 4].map(genLevel => {
          const genMembers = generationsGrouped[genLevel] || []
          if (activeGenFilter !== 'all' && String(activeGenFilter) !== String(genLevel)) return null
          if (genMembers.length === 0) return null

          const genTitles = {
            1: isHi ? 'प्रथम पीढ़ी — मूल पूर्वज (Ancestors & Progenitors)' : 'Generation 1 — Ancestors & Progenitors',
            2: isHi ? 'द्वितीय पीढ़ी — कवि "आग" एवं भ्रातृवृन्द' : 'Generation 2 — Kavi "Aag" & Siblings',
            3: isHi ? 'तृतीय पीढ़ी — सुपुत्र, सुपुत्री एवं दामाद' : 'Generation 3 — Children & Spouses',
            4: isHi ? 'चतुर्थ पीढ़ी — पौत्र-पौत्री एवं दोहित' : 'Generation 4 — Grandchildren & Youth'
          }

          return (
            <div key={`gen-band-${genLevel}`} className={`family-gen-band gen-band-${genLevel}`}>
              <div className="gen-band-title-tag">{genTitles[genLevel]}</div>
              <div className="gen-members-grid">
                {genMembers.map(member => {
                  const isSelected = selectedId === member.id
                  const isRelative = relativeIds.has(member.id)
                  const isMainPoet = member.id === 'f-201'

                  return (
                    <motion.div
                      key={member.id}
                      className={`family-node-card ${isSelected ? 'selected' : ''} ${isRelative ? 'relative-active' : 'dimmed'} ${isMainPoet ? 'main-poet-node' : ''}`}
                      onClick={() => handleSelectMember(member.id)}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="node-avatar-wrapper">
                        <img 
                          src={member.avatar} 
                          alt={member.name_en} 
                          className="node-avatar-img"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                          }}
                        />
                        <span className={`gender-indicator ${member.gender}`}>
                          {member.gender === 'male' ? '♂' : '♀'}
                        </span>
                      </div>
                      <div className="node-info">
                        <h4 className="node-name">{isHi ? member.name_hi : member.name_en}</h4>
                        <span className="node-relation">{isHi ? member.relation_hi : member.relation_en}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Slide-out Side Drawer for Full Member Profile */}
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
                <h3>{isHi ? 'सदस्य विवरण' : 'Member Details'}</h3>
                <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>✕</button>
              </div>

              <div className="family-drawer-body">
                <div className="drawer-profile-card">
                  <img 
                    src={selectedMember.avatar} 
                    alt={selectedMember.name_en}
                    className="drawer-avatar"
                  />
                  <h3 className="drawer-name">{isHi ? selectedMember.name_hi : selectedMember.name_en}</h3>
                  <span className="drawer-relation-badge">{isHi ? selectedMember.relation_hi : selectedMember.relation_en}</span>
                  <span className="drawer-gen-tag">
                    {isHi ? `पीढ़ी ${selectedMember.generation}` : `Generation ${selectedMember.generation}`}
                  </span>
                </div>

                <div className="drawer-meta-section">
                  <div className="meta-row">
                    <span className="meta-label">🎂 {isHi ? 'जन्म तिथि:' : 'Birth Date:'}</span>
                    <span className="meta-value">{selectedMember.birth_date || 'N/A'}</span>
                  </div>
                  {selectedMember.anniversary_date && (
                    <div className="meta-row">
                      <span className="meta-label">💍 {isHi ? 'विवाह वर्षगींठ:' : 'Anniversary:'}</span>
                      <span className="meta-value">{selectedMember.anniversary_date}</span>
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

                {/* Direct Links to Immediate Relatives */}
                <div className="drawer-relatives-section">
                  <h4>{isHi ? 'प्रत्यक्ष पारिवारिक संबंध:' : 'Direct Relatives:'}</h4>
                  
                  {/* Parents */}
                  {selectedMember.parentIds && selectedMember.parentIds.length > 0 && (
                    <div className="relatives-group">
                      <span className="group-label">👨‍👩‍👦 {isHi ? 'माता-पिता (Parents):' : 'Parents:'}</span>
                      <div className="relatives-pills">
                        {selectedMember.parentIds.map(pId => {
                          const p = membersMap[pId]
                          if (!p) return null
                          return (
                            <button key={pId} className="relative-pill" onClick={() => handleSelectMember(pId)}>
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
                          const s = membersMap[sId]
                          if (!s) return null
                          return (
                            <button key={sId} className="relative-pill" onClick={() => handleSelectMember(sId)}>
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
                          const c = membersMap[cId]
                          if (!c) return null
                          return (
                            <button key={cId} className="relative-pill" onClick={() => handleSelectMember(cId)}>
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

export default FamilyTreePanel
