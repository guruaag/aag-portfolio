import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import './FamilyTreeCanvas.css'

export const FAMILY_DATA_35 = [
  // Generation 1: Paternal Grandparents (Patriarch & Matriarch)
  { id: 'f-101', name_hi: 'श्री भद्रसेन शर्मा', name_en: 'Shri Bhadrasen Sharma', relation_hi: 'दादाजी', relation_en: 'Grandfather', generation: 1, gender: 'male', isDeceased: true, birthDate: '10 Aug 1920', deathDate: '15 May 2000', phone: '+91 98290 11001', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-102'], childrenIds: ['f-201', 'f-203', 'f-205', 'f-207', 'f-209'], bio: 'वंश परंपरा के मूल प्रपितामह एवं परिवार के पूज्य पुरोधा।' },
  { id: 'f-102', name_hi: 'श्रीमती कौशल्या शर्मा', name_en: 'Smt. Kaushalya Sharma', relation_hi: 'दादीजी', relation_en: 'Grandmother', generation: 1, gender: 'female', isDeceased: true, birthDate: '12 Oct 1925', deathDate: '20 Nov 2005', phone: '+91 98290 11002', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-101'], childrenIds: ['f-201', 'f-203', 'f-205', 'f-207', 'f-209'], bio: 'परिवार की मूल संस्थापिका एवं स्नेहमयी दादीजी।' },

  // Generation 1: Maternal Grandparents
  { id: 'm-101', name_hi: 'श्री बंसीलाल शर्मा', name_en: 'Shri Bansilal Sharma', relation_hi: 'नानाजी', relation_en: 'Maternal Grandfather', generation: 1, gender: 'male', isDeceased: true, birthDate: '05 Jan 1922', deathDate: '18 Apr 1999', phone: '+91 98290 11003', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-102'], childrenIds: ['m-201', 'f-202', 'm-205', 'm-207', 'm-209', 'm-211', 'm-213', 'm-215', 'm-217'], bio: 'नानक वंश के पूज्य संस्थापक एवं वरिष्ठ मार्गदर्शक।' },
  { id: 'm-102', name_hi: 'श्रीमती कमला शर्मा', name_en: 'Smt. Kamla Sharma', relation_hi: 'नानीजी', relation_en: 'Maternal Grandmother', generation: 1, gender: 'female', isDeceased: true, birthDate: '18 Mar 1928', deathDate: '10 Dec 2008', phone: '+91 98290 11004', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-101'], childrenIds: ['m-201', 'f-202', 'm-205', 'm-207', 'm-209', 'm-211', 'm-213', 'm-215', 'm-217'], bio: 'ननिहाल परिवार की स्नेहमयी नानीजी।' },

  // Generation 2: Paternal Children (Bhadrasen + Kaushalya)
  { id: 'f-201', name_hi: 'कवि गुरुप्रताप शर्मा "आग"', name_en: 'Kavi Gurupratap Sharma "Aag"', relation_hi: 'मुख्य साहित्यकार', relation_en: 'Poet / Father', generation: 2, gender: 'male', isDeceased: false, birthDate: '26 Jan 1945', phone: '+91 98290 55432', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-202'], childrenIds: ['f-301', 'f-303', 'f-305'], bio: 'हिंदी काव्य जगत के तेजस्वी हस्ताक्षर एवं वरिष्ठ साहित्यकार।' },
  { id: 'f-202', name_hi: 'श्रीमती अनिता शर्मा', name_en: 'Smt. Anita Sharma', relation_hi: 'माताश्री', relation_en: 'Mother', generation: 2, gender: 'female', isDeceased: false, birthDate: '14 Mar 1950', phone: '+91 98290 55433', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['f-201'], childrenIds: ['f-301', 'f-303', 'f-305'], bio: 'साहित्य साधना की प्रेरणास्रोत एवं गृह स्वामिनी।' },

  { id: 'f-203', name_hi: 'श्री चमन शर्मा', name_en: 'Shri Chaman Sharma', relation_hi: 'चाचाजी', relation_en: 'Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '15 Aug 1948', phone: '+91 94140 12345', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-204'], childrenIds: ['f-307', 'f-308'], bio: 'परिवार के सम्मानित सदस्य एवं व्यवसायी।' },
  { id: 'f-204', name_hi: 'श्रीमती चमन शर्मा', name_en: 'Smt. Chaman Sharma', relation_hi: 'चाचीजी', relation_en: 'Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '20 Nov 1952', phone: '+91 94140 12346', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-203'], childrenIds: ['f-307', 'f-308'], bio: 'गृहिणी।' },

  { id: 'f-205', name_hi: 'श्री सत्यप्रकाश शर्मा', name_en: 'Shri Satyaprakash Sharma', relation_hi: 'चाचाजी', relation_en: 'Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '10 Feb 1951', phone: '+91 94140 22334', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-206'], childrenIds: ['f-309', 'f-310'], bio: 'शिक्षाविद एवं समाजसेवी।' },
  { id: 'f-206', name_hi: 'श्रीमती सत्यप्रकाश शर्मा', name_en: 'Smt. Satyaprakash Sharma', relation_hi: 'चाचीजी', relation_en: 'Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '05 May 1955', phone: '+91 94140 22335', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-205'], childrenIds: ['f-309', 'f-310'], bio: 'गृहिणी।' },

  { id: 'f-207', name_hi: 'श्री राजेन्द्र शर्मा', name_en: 'Shri Rajendra Sharma', relation_hi: 'चाचाजी', relation_en: 'Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '14 Dec 1954', phone: '+91 94140 33445', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-208'], childrenIds: ['f-311', 'f-312'], bio: 'वरिष्ठ अधिकारी।' },
  { id: 'f-208', name_hi: 'श्रीमती राजेन्द्र शर्मा', name_en: 'Smt. Rajendra Sharma', relation_hi: 'चाचीजी', relation_en: 'Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '22 Aug 1958', phone: '+91 94140 33446', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-207'], childrenIds: ['f-311', 'f-312'], bio: 'गृहिणी।' },

  { id: 'f-209', name_hi: 'श्रीमती किरण शर्मा', name_en: 'Smt. Kiran Sharma', relation_hi: 'बुआजी (पुत्री)', relation_en: 'Paternal Aunt (Sister)', generation: 2, gender: 'female', isDeceased: false, birthDate: '08 Apr 1958', phone: '+91 98280 99887', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-210'], childrenIds: ['f-313', 'f-314'], bio: 'परिवार की प्रिय पुत्री व बुआजी।' },
  { id: 'f-210', name_hi: 'श्री किरण पति', name_en: 'Shri Kiran Spouse', relation_hi: 'फूफाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '10 Jan 1954', phone: '+91 98280 99888', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-209'], childrenIds: ['f-313', 'f-314'], bio: 'समाजसेवी।' },

  // Generation 2: Maternal Children (Bansilal + Kamla)
  { id: 'm-201', name_hi: 'श्रीमती सुनीता शर्मा', name_en: 'Smt. Sunita Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '12 May 1947', phone: '+91 98290 22001', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-202'], childrenIds: ['m-301', 'm-302'], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-202', name_hi: 'श्री राजकमल', name_en: 'Shri Rajkamal', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '10 Aug 1944', phone: '+91 98290 22002', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-201'], childrenIds: ['m-301', 'm-302'], bio: 'सुनीता जी के पति।' },

  { id: 'm-205', name_hi: 'श्रीमती सरिता शर्मा', name_en: 'Smt. Sarita Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '15 Jul 1952', phone: '+91 98290 22005', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-206'], childrenIds: [], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-206', name_hi: 'श्री भगवती', name_en: 'Shri Bhagwati', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '02 Mar 1949', phone: '+91 98290 22006', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-205'], childrenIds: [], bio: 'सरिता जी के पति।' },

  { id: 'm-207', name_hi: 'श्रीमती आशा शर्मा', name_en: 'Smt. Asha Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '18 Nov 1955', phone: '+91 98290 22007', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-208'], childrenIds: ['m-303', 'm-304'], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-208', name_hi: 'श्री राजेन्द्र', name_en: 'Shri Rajendra', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '25 Dec 1952', phone: '+91 98290 22008', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-207'], childrenIds: ['m-303', 'm-304'], bio: 'आशा जी के पति।' },

  { id: 'm-209', name_hi: 'श्रीमती सविता शर्मा', name_en: 'Smt. Savita Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '04 Jun 1958', phone: '+91 98290 22009', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-210'], childrenIds: ['m-305', 'm-306'], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-210', name_hi: 'श्री मुकेश', name_en: 'Shri Mukesh', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '14 Sep 1955', phone: '+91 98290 22010', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-209'], childrenIds: ['m-305', 'm-306'], bio: 'सविता जी के पति।' },

  { id: 'm-211', name_hi: 'श्री संदीप शर्मा', name_en: 'Shri Sandeep Sharma', relation_hi: 'मामाजी', relation_en: 'Maternal Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '22 Feb 1960', phone: '+91 98290 22011', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-212'], childrenIds: ['m-307', 'm-308'], bio: 'बंसीलाल जी के पुत्र।' },
  { id: 'm-212', name_hi: 'श्रीमती नमिता शर्मा', name_en: 'Smt. Namita Sharma', relation_hi: 'मामीजी', relation_en: 'Maternal Aunt (Uncle Wife)', generation: 2, gender: 'female', isDeceased: false, birthDate: '08 Oct 1963', phone: '+91 98290 22012', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-211'], childrenIds: ['m-307', 'm-308'], bio: 'संदीप जी की धर्मपत्नी।' },

  { id: 'm-213', name_hi: 'श्रीमती रजनी शर्मा', name_en: 'Smt. Rajni Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '11 Jan 1963', phone: '+91 98290 22013', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-214'], childrenIds: ['m-309', 'm-310'], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-214', name_hi: 'श्री आशिष', name_en: 'Shri Ashish', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '30 Mar 1960', phone: '+91 98290 22014', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-213'], childrenIds: ['m-309', 'm-310'], bio: 'रजनी जी के पति।' },

  { id: 'm-215', name_hi: 'श्री संजीव शर्मा', name_en: 'Shri Sanjeev Sharma', relation_hi: 'मामाजी', relation_en: 'Maternal Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '19 Aug 1965', phone: '+91 98290 22015', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-216'], childrenIds: ['m-311', 'm-312'], bio: 'बंसीलाल जी के पुत्र।' },
  { id: 'm-216', name_hi: 'श्रीमती कविता शर्मा', name_en: 'Smt. Kavita Sharma', relation_hi: 'मामीजी', relation_en: 'Maternal Aunt (Uncle Wife)', generation: 2, gender: 'female', isDeceased: false, birthDate: '25 Nov 1968', phone: '+91 98290 22016', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-215'], childrenIds: ['m-311', 'm-312'], bio: 'संजीव जी की धर्मपत्नी।' },

  { id: 'm-217', name_hi: 'श्री राजेश शर्मा', name_en: 'Shri Rajesh Sharma', relation_hi: 'मामाजी', relation_en: 'Maternal Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '02 Apr 1968', phone: '+91 98290 22017', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-218'], childrenIds: ['m-313', 'm-314'], bio: 'बंसीलाल जी के पुत्र।' },
  { id: 'm-218', name_hi: 'श्रीमती राजेश शर्मा', name_en: 'Smt. Rajesh Sharma', relation_hi: 'मामीजी', relation_en: 'Maternal Aunt (Uncle Wife)', generation: 2, gender: 'female', isDeceased: false, birthDate: '14 Dec 1971', phone: '+91 98290 22018', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-217'], childrenIds: ['m-313', 'm-314'], bio: 'राजेश जी की धर्मपत्नी।' },

  // Generation 3: Children of Kavi Gurupratap Sharma + Anita Sharma
  { id: 'f-301', name_hi: 'श्रीमती पूजा शर्मा (जोशी)', name_en: 'Smt. Puja Sharma Joshi', relation_hi: 'पुत्री', relation_en: 'Daughter', generation: 3, gender: 'female', isDeceased: false, birthDate: '18 Sep 1972', phone: '+91 98290 77665', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-302'], childrenIds: ['f-401', 'f-402'], bio: 'कवि गुरुप्रताप शर्मा जी की ज्येष्ठ पुत्री।' },
  { id: 'f-302', name_hi: 'श्री विकास जोशी', name_en: 'Shri Vikas Joshi', relation_hi: 'दामाद (जामातृ)', relation_en: 'Son-in-law', generation: 3, gender: 'male', isDeceased: false, birthDate: '04 Apr 1970', phone: '+91 98290 77666', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-301'], childrenIds: ['f-401', 'f-402'], bio: 'पूजा जी के पति।' },

  { id: 'f-303', name_hi: 'श्री संकल्प शर्मा', name_en: 'Shri Sankalp Sharma', relation_hi: 'पुत्र (आर्किटेक्ट)', relation_en: 'Son', generation: 3, gender: 'male', isDeceased: false, birthDate: '11 Dec 1975', phone: '+91 98290 44332', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-304'], childrenIds: ['f-403'], bio: 'वरिष्ठ सॉफ्टवेयर इंजीनियर एवं डिजिटल आर्किटेक्ट।' },
  { id: 'f-304', name_hi: 'श्रीमती चाँदनी शर्मा', name_en: 'Smt. Chandini Sharma', relation_hi: 'पुत्रवधू', relation_en: 'Daughter-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '09 Aug 1979', phone: '+91 98290 44333', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-303'], childrenIds: ['f-403'], bio: 'संकल्प जी की धर्मपत्नी।' },

  { id: 'f-305', name_hi: 'श्री सनातन शर्मा', name_en: 'Shri Sanatan Sharma', relation_hi: 'पुत्र', relation_en: 'Son', generation: 3, gender: 'male', isDeceased: false, birthDate: '02 Feb 1980', phone: '+91 94141 88776', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-306'], childrenIds: ['f-404', 'f-405'], bio: 'गुरुप्रताप जी के कनिष्ठ पुत्र।' },
  { id: 'f-306', name_hi: 'श्रीमती सुरभि शर्मा', name_en: 'Smt. Surbhi Sharma', relation_hi: 'पुत्रवधू', relation_en: 'Daughter-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '14 Jul 1983', phone: '+91 94141 88777', photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-305'], childrenIds: ['f-404', 'f-405'], bio: 'सनातन जी की धर्मपत्नी।' },

  // Generation 3: Paternal & Maternal Cousins
  { id: 'f-307', name_hi: 'श्री मयंक शर्मा', name_en: 'Shri Mayank Sharma', relation_hi: 'चचेरा भाई', relation_en: 'Cousin Brother', generation: 3, gender: 'male', isDeceased: false, birthDate: '1981', phone: '+91 98291 11223', photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80', parentIds: ['f-203', 'f-204'], spouseIds: [], childrenIds: [], bio: 'चमन जी के पुत्र।' },
  { id: 'f-308', name_hi: 'श्रीमती गरिमा शर्मा', name_en: 'Smt. Garima Sharma', relation_hi: 'चचेरी बहन', relation_en: 'Cousin Sister', generation: 3, gender: 'female', isDeceased: false, birthDate: '1984', phone: '+91 98291 11224', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: ['f-203', 'f-204'], spouseIds: [], childrenIds: [], bio: 'चमन जी की पुत्री।' },

  { id: 'f-309', name_hi: 'श्री गौरव शर्मा', name_en: 'Shri Gaurav Sharma', relation_hi: 'चचेरा भाई', relation_en: 'Cousin Brother', generation: 3, gender: 'male', isDeceased: false, birthDate: '1983', phone: '+91 94142 33445', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', parentIds: ['f-205', 'f-206'], spouseIds: [], childrenIds: [], bio: 'सत्यप्रकाश जी के पुत्र।' },
  { id: 'f-310', name_hi: 'श्रीमती ऋचा शर्मा', name_en: 'Smt. Richa Sharma', relation_hi: 'चचेरी बहन', relation_en: 'Cousin Sister', generation: 3, gender: 'female', isDeceased: false, birthDate: '1986', phone: '+91 94142 33446', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: ['f-205', 'f-206'], spouseIds: [], childrenIds: [], bio: 'सत्यप्रकाश जी की पुत्री।' },

  { id: 'f-311', name_hi: 'श्री अमित शर्मा', name_en: 'Shri Amit Sharma', relation_hi: 'चचेरा भाई', relation_en: 'Cousin Brother', generation: 3, gender: 'male', isDeceased: false, birthDate: '1987', phone: '+91 98281 66554', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: ['f-207', 'f-208'], spouseIds: [], childrenIds: [], bio: 'राजेन्द्र जी के पुत्र।' },
  { id: 'f-312', name_hi: 'श्रीमती नेहा शर्मा', name_en: 'Smt. Neha Sharma', relation_hi: 'चचेरी बहन', relation_en: 'Cousin Sister', generation: 3, gender: 'female', isDeceased: false, birthDate: '1990', phone: '+91 98281 66555', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', parentIds: ['f-207', 'f-208'], spouseIds: [], childrenIds: [], bio: 'राजेन्द्र जी की पुत्री।' },

  { id: 'f-313', name_hi: 'श्री सिद्धार्थ', name_en: 'Shri Siddharth', relation_hi: 'फूपेरा भाई', relation_en: 'Cousin Brother', generation: 3, gender: 'male', isDeceased: false, birthDate: '1985', phone: '+91 98281 77889', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: ['f-209', 'f-210'], spouseIds: [], childrenIds: [], bio: 'किरण बुआजी के पुत्र।' },
  { id: 'f-314', name_hi: 'श्रीमती पूजा', name_en: 'Smt. Pooja', relation_hi: 'फूपेरी बहन', relation_en: 'Cousin Sister', generation: 3, gender: 'female', isDeceased: false, birthDate: '1988', phone: '+91 98281 77890', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: ['f-209', 'f-210'], spouseIds: [], childrenIds: [], bio: 'किरण बुआजी की पुत्री।' },

  // Maternal Cousins (Children of Maternal Uncles/Aunts)
  { id: 'm-301', name_hi: 'मौसी संतान १ (सुनीता)', name_en: 'Sunita Child 1', relation_hi: 'मौसेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'male', isDeceased: false, birthDate: '1975', phone: '+91 98290 33001', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: ['m-201', 'm-202'], spouseIds: [], childrenIds: [], bio: 'सुनीता जी की संतान।' },
  { id: 'm-302', name_hi: 'मौसी संतान २ (सुनीता)', name_en: 'Sunita Child 2', relation_hi: 'मौसेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'female', isDeceased: false, birthDate: '1978', phone: '+91 98290 33002', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['m-201', 'm-202'], spouseIds: [], childrenIds: [], bio: 'सुनीता जी की संतान।' },

  { id: 'm-303', name_hi: 'मौसी संतान १ (आशा)', name_en: 'Asha Child 1', relation_hi: 'मौसेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'male', isDeceased: false, birthDate: '1980', phone: '+91 98290 33003', photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80', parentIds: ['m-207', 'm-208'], spouseIds: [], childrenIds: [], bio: 'आशा जी की संतान।' },
  { id: 'm-304', name_hi: 'मौसी संतान २ (आशा)', name_en: 'Asha Child 2', relation_hi: 'मौसेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'female', isDeceased: false, birthDate: '1983', phone: '+91 98290 33004', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-207', 'm-208'], spouseIds: [], childrenIds: [], bio: 'आशा जी की संतान।' },

  { id: 'm-305', name_hi: 'मौसी संतान १ (सविता)', name_en: 'Savita Child 1', relation_hi: 'मौसेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'male', isDeceased: false, birthDate: '1982', phone: '+91 98290 33005', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', parentIds: ['m-209', 'm-210'], spouseIds: [], childrenIds: [], bio: 'सविता जी की संतान।' },
  { id: 'm-306', name_hi: 'मौसी संतान २ (सविता)', name_en: 'Savita Child 2', relation_hi: 'मौसेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'female', isDeceased: false, birthDate: '1985', phone: '+91 98290 33006', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: ['m-209', 'm-210'], spouseIds: [], childrenIds: [], bio: 'सविता जी की संतान।' },

  { id: 'm-307', name_hi: 'मामा संतान १ (संदीप)', name_en: 'Sandeep Child 1', relation_hi: 'ममेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'male', isDeceased: false, birthDate: '1986', phone: '+91 98290 33007', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', parentIds: ['m-211', 'm-212'], spouseIds: [], childrenIds: [], bio: 'संदीप जी की संतान।' },
  { id: 'm-308', name_hi: 'मामा संतान २ (संदीप)', name_en: 'Sandeep Child 2', relation_hi: 'ममेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'female', isDeceased: false, birthDate: '1989', phone: '+91 98290 33008', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-211', 'm-212'], spouseIds: [], childrenIds: [], bio: 'संदीप जी की संतान।' },

  { id: 'm-309', name_hi: 'मौसी संतान १ (रजनी)', name_en: 'Rajni Child 1', relation_hi: 'मौसेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'male', isDeceased: false, birthDate: '1988', phone: '+91 98290 33009', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: ['m-213', 'm-214'], spouseIds: [], childrenIds: [], bio: 'रजनी जी की संतान।' },
  { id: 'm-310', name_hi: 'मौसी संतान २ (रजनी)', name_en: 'Rajni Child 2', relation_hi: 'मौसेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'female', isDeceased: false, birthDate: '1991', phone: '+91 98290 33010', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: ['m-213', 'm-214'], spouseIds: [], childrenIds: [], bio: 'रजनी जी की संतान।' },

  { id: 'm-311', name_hi: 'मामा संतान १ (संजीव)', name_en: 'Sanjeev Child 1', relation_hi: 'ममेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'male', isDeceased: false, birthDate: '1992', phone: '+91 98290 33011', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: ['m-215', 'm-216'], spouseIds: [], childrenIds: [], bio: 'संजीव जी की संतान।' },
  { id: 'm-312', name_hi: 'मामा संतान २ (संजीव)', name_en: 'Sanjeev Child 2', relation_hi: 'ममेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'female', isDeceased: false, birthDate: '1995', phone: '+91 98290 33012', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['m-215', 'm-216'], spouseIds: [], childrenIds: [], bio: 'संजीव जी की संतान।' },

  { id: 'm-313', name_hi: 'मामा संतान १ (राजेश)', name_en: 'Rajesh Child 1', relation_hi: 'ममेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'male', isDeceased: false, birthDate: '1994', phone: '+91 98290 33013', photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80', parentIds: ['m-217', 'm-218'], spouseIds: [], childrenIds: [], bio: 'राजेश जी की संतान।' },
  { id: 'm-314', name_hi: 'मामा संतान २ (राजेश)', name_en: 'Rajesh Child 2', relation_hi: 'ममेरा भाई/बहन', relation_en: 'Maternal Cousin', generation: 3, gender: 'female', isDeceased: false, birthDate: '1997', phone: '+91 98290 33014', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-217', 'm-218'], spouseIds: [], childrenIds: [], bio: 'राजेश जी की संतान।' },

  // Generation 4: Grandchildren (Puja, Sankalp, Sanatan)
  { id: 'f-401', name_hi: 'प्राची जोशी', name_en: 'Prachi Joshi', relation_hi: 'दौहित्री (पूजा जी की पुत्री)', relation_en: 'Granddaughter', generation: 4, gender: 'female', isDeceased: false, birthDate: '14 Oct 2002', phone: '+91 98290 88990', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: ['f-301', 'f-302'], spouseIds: [], childrenIds: [], bio: 'पूजा जी व विकास जोशी जी की ज्येष्ठ पुत्री।' },
  { id: 'f-402', name_hi: 'याशिका जोशी', name_en: 'Yashika Joshi', relation_hi: 'दौहित्री (पूजा जी की पुत्री)', relation_en: 'Granddaughter', generation: 4, gender: 'female', isDeceased: false, birthDate: '09 May 2006', phone: '+91 98290 88991', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['f-301', 'f-302'], spouseIds: [], childrenIds: [], bio: 'पूजा जी व विकास जोशी जी की कनिष्ठ पुत्री।' },

  { id: 'f-403', name_hi: 'राजवीर शर्मा', name_en: 'Rajveer Sharma', relation_hi: 'पौत्र (संकल्प जी का पुत्र)', relation_en: 'Grandson', generation: 4, gender: 'male', isDeceased: false, birthDate: '21 Aug 2012', phone: '+91 98290 22110', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: ['f-303', 'f-304'], spouseIds: [], childrenIds: [], bio: 'संकल्प जी व चाँदनी जी का सुपुत्र।' },

  { id: 'f-404', name_hi: 'वेदांत शर्मा', name_en: 'Vedant Sharma', relation_hi: 'पौत्र (सनातन जी का पुत्र)', relation_en: 'Grandson', generation: 4, gender: 'male', isDeceased: false, birthDate: '16 Dec 2008', phone: '+91 98290 22111', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: ['f-305', 'f-306'], spouseIds: [], childrenIds: [], bio: 'सनातन जी व सुरभि जी का सुपुत्र।' },
  { id: 'f-405', name_hi: 'अवनी शर्मा', name_en: 'Avani Sharma', relation_hi: 'पौत्री (सनातन जी की पुत्री)', relation_en: 'Granddaughter', generation: 4, gender: 'female', isDeceased: false, birthDate: '03 Mar 2011', phone: '+91 94141 99001', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: ['f-305', 'f-306'], spouseIds: [], childrenIds: [], bio: 'सनातन जी व सुरभि जी की सुपुत्री।' }
]

export default function FamilyTreeCanvas({ 
  data = FAMILY_DATA_35, 
  rootId = 'f-201',
  selectedNodeId,
  onNodeSelect
}) {
  const { i18n } = useTranslation()
  const isHi = i18n.language !== 'en'

  // Viewport & Camera State
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: -450, y: 30 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Focal Isolation Mode State (1-Step Up / 1-Step Down Isolation)
  const [focusedId, setFocusedId] = useState(selectedNodeId || rootId)
  const [isFocalMode, setIsFocalMode] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set())
  const [maxDepthFilter, setMaxDepthFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const stageRef = useRef(null)

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (wrapperRef.current) {
        if (wrapperRef.current.requestFullscreen) {
          wrapperRef.current.requestFullscreen().catch(() => {})
        } else if (wrapperRef.current.webkitRequestFullscreen) {
          wrapperRef.current.webkitRequestFullscreen()
        }
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFSChange = () => {
      const fsElem = document.fullscreenElement || document.webkitFullscreenElement
      setIsFullscreen(!!fsElem)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    document.addEventListener('webkitfullscreenchange', handleFSChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange)
      document.removeEventListener('webkitfullscreenchange', handleFSChange)
    }
  }, [])

  // Fast O(1) Member Map
  const memberMap = useMemo(() => {
    const map = new Map()
    data.forEach(m => map.set(m.id, m))
    return map
  }, [data])

  const selectedMember = memberMap.get(focusedId) || data[0]

  // Structural Married Couple Containers
  const { coupleContainers, containerDescendantCounts } = useMemo(() => {
    const processedSpouses = new Set()
    const containers = []

    data.forEach(member => {
      if (processedSpouses.has(member.id)) return

      if (member.spouseIds && member.spouseIds.length > 0) {
        const spouse = memberMap.get(member.spouseIds[0])
        if (spouse) {
          processedSpouses.add(member.id)
          processedSpouses.add(spouse.id)

          const primary = member.gender === 'male' ? member : spouse
          const secondary = member.gender === 'male' ? spouse : member

          const childrenIds = Array.from(new Set([...(member.childrenIds || []), ...(spouse.childrenIds || [])]))

          containers.push({
            id: `couple-${primary.id}-${secondary.id}`,
            primary,
            secondary,
            isCouple: true,
            generation: primary.generation,
            childrenIds
          })
          return
        }
      }

      processedSpouses.add(member.id)
      containers.push({
        id: `single-${member.id}`,
        primary: member,
        secondary: null,
        isCouple: false,
        generation: member.generation,
        childrenIds: member.childrenIds || []
      })
    })

    // Compute Recursive Descendant Count
    const descCounts = new Map()
    const countDescendants = (containerId) => {
      if (descCounts.has(containerId)) return descCounts.get(containerId)
      const container = containers.find(c => c.id === containerId)
      if (!container || !container.childrenIds || container.childrenIds.length === 0) {
        descCounts.set(containerId, 0)
        return 0
      }

      let sum = 0
      container.childrenIds.forEach(childId => {
        const childContainer = containers.find(c => c.primary.id === childId || (c.secondary && c.secondary.id === childId))
        if (childContainer) {
          sum += 1 + countDescendants(childContainer.id)
        }
      })
      descCounts.set(containerId, sum)
      return sum
    }

    containers.forEach(c => countDescendants(c.id))

    return { coupleContainers: containers, containerDescendantCounts: descCounts }
  }, [data, memberMap])

  // Subtree Collapse Toggle
  const toggleSubtreeCollapse = (containerId) => {
    setCollapsedNodeIds(prev => {
      const next = new Set(prev)
      if (next.has(containerId)) next.delete(containerId)
      else next.add(containerId)
      return next
    })
  }

  // 1-STEP UP / 1-STEP DOWN + SIBLINGS FOCAL ISOLATION SET COMPUTATION
  const focalWindowInfo = useMemo(() => {
    if (!isFocalMode || !focusedId) {
      return { 
        isFocalActive: false,
        visibleContainers: coupleContainers,
        focusedContainer: null,
        parentContainers: [],
        centerTierContainers: [],
        childContainers: []
      }
    }

    const focusedContainer = coupleContainers.find(c => 
      c.primary.id === focusedId || (c.secondary && c.secondary.id === focusedId)
    )

    if (!focusedContainer) {
      return { 
        isFocalActive: false,
        visibleContainers: coupleContainers,
        focusedContainer: null,
        parentContainers: [],
        centerTierContainers: [],
        childContainers: []
      }
    }

    // 1 Generation Above: Parents of primary or spouse
    const parentIds = new Set([
      ...(focusedContainer.primary.parentIds || []),
      ...(focusedContainer.secondary ? (focusedContainer.secondary.parentIds || []) : [])
    ])
    const parentContainers = coupleContainers.filter(c => 
      parentIds.has(c.primary.id) || (c.secondary && parentIds.has(c.secondary.id))
    )

    // Center Tier: Focused Container + Sibling Containers (Brothers & Sisters sharing parents)
    let centerTierContainers = [focusedContainer]
    if (parentContainers.length > 0) {
      const allParentChildrenIds = new Set()
      parentContainers.forEach(pC => {
        (pC.childrenIds || []).forEach(childId => allParentChildrenIds.add(childId))
      })

      const siblingAndFocused = coupleContainers.filter(c => 
        allParentChildrenIds.has(c.primary.id) || (c.secondary && allParentChildrenIds.has(c.secondary.id))
      )
      if (siblingAndFocused.length > 0) {
        centerTierContainers = siblingAndFocused
      }
    }

    // 1 Generation Below: Direct Children of selected couple
    const childIds = new Set(focusedContainer.childrenIds || [])
    const childContainers = coupleContainers.filter(c => 
      childIds.has(c.primary.id) || (c.secondary && childIds.has(c.secondary.id))
    )

    const visibleMap = new Map()
    parentContainers.forEach(c => visibleMap.set(c.id, c))
    centerTierContainers.forEach(c => visibleMap.set(c.id, c))
    childContainers.forEach(c => visibleMap.set(c.id, c))

    return {
      isFocalActive: true,
      visibleContainers: Array.from(visibleMap.values()),
      focusedContainer,
      parentContainers,
      centerTierContainers,
      childContainers
    }
  }, [isFocalMode, focusedId, coupleContainers])

  // 2D Layout Calculation (Boxed Card Layout Dimensions)
  const layoutPositions = useMemo(() => {
    const posMap = new Map()

    const CONTAINER_WIDTH_SINGLE = 170
    const CONTAINER_WIDTH_COUPLE = 360
    const CONTAINER_HEIGHT = 230
    const getWidth = (c) => c.isCouple ? CONTAINER_WIDTH_COUPLE : CONTAINER_WIDTH_SINGLE

    if (focalWindowInfo.isFocalActive) {
      const { focusedContainer, parentContainers = [], centerTierContainers = [], childContainers = [] } = focalWindowInfo
      const CENTER_X = 1200
      const Y_PARENTS = 70
      const Y_FOCUSED = 350
      const Y_CHILDREN = 640
      const X_GAP = 40

      // 1. Position Parent Containers in Top Tier (Tier 1)
      if (parentContainers.length > 0) {
        const totalW = parentContainers.reduce((sum, c) => sum + getWidth(c), 0) + (parentContainers.length - 1) * X_GAP
        let startX = CENTER_X - totalW / 2
        parentContainers.forEach(pC => {
          const w = getWidth(pC)
          posMap.set(pC.id, {
            x: startX,
            y: Y_PARENTS,
            width: w,
            height: CONTAINER_HEIGHT,
            tier: 'parents'
          })
          startX += w + X_GAP
        })
      }

      // 2. Position Center Tier Containers (Siblings + Focused Node) in Middle Tier (Tier 2)
      if (centerTierContainers.length > 0) {
        const totalW = centerTierContainers.reduce((sum, c) => sum + getWidth(c), 0) + (centerTierContainers.length - 1) * X_GAP
        let startX = CENTER_X - totalW / 2
        centerTierContainers.forEach(cC => {
          const w = getWidth(cC)
          const isFocused = cC.id === focusedContainer?.id
          posMap.set(cC.id, {
            x: startX,
            y: Y_FOCUSED,
            width: w,
            height: CONTAINER_HEIGHT,
            tier: isFocused ? 'center' : 'sibling'
          })
          startX += w + X_GAP
        })
      }

      // 3. Position Child Containers in Bottom Tier (Tier 3)
      if (childContainers.length > 0) {
        const totalW = childContainers.reduce((sum, c) => sum + getWidth(c), 0) + (childContainers.length - 1) * X_GAP
        let startX = CENTER_X - totalW / 2
        childContainers.forEach(cC => {
          const w = getWidth(cC)
          posMap.set(cC.id, {
            x: startX,
            y: Y_CHILDREN,
            width: w,
            height: CONTAINER_HEIGHT,
            tier: 'children'
          })
          startX += w + X_GAP
        })
      }

      return posMap
    }

    // Standard Full Tree Layout (All 4 Generations Visible)
    const genTiers = { 1: [], 2: [], 3: [], 4: [] }
    coupleContainers.forEach(c => {
      if (maxDepthFilter !== 'all' && c.generation > parseInt(maxDepthFilter)) return
      if (genTiers[c.generation]) genTiers[c.generation].push(c)
    })

    const Y_GAP = 310
    const X_GAP = 50

    // Gen 1 (Ancestors Root)
    let gen1X = 1200
    genTiers[1].forEach(c => {
      const w = getWidth(c)
      posMap.set(c.id, { x: gen1X, y: 60, width: w, height: CONTAINER_HEIGHT })
      gen1X += w + X_GAP
    })

    // Layout Gen 2, 3, 4 recursively
    ;[2, 3, 4].forEach(genLevel => {
      const levelContainers = genTiers[genLevel] || []
      const parentGenContainers = genTiers[genLevel - 1] || []

      const childrenByParent = new Map()
      const unassigned = []

      levelContainers.forEach(childC => {
        const parentC = parentGenContainers.find(pC => {
          if (collapsedNodeIds.has(pC.id)) return false
          const pIds = [pC.primary.id, pC.secondary?.id].filter(Boolean)
          const cPIds = [...(childC.primary.parentIds || []), ...(childC.secondary?.parentIds || [])]
          return cPIds.some(id => pIds.includes(id))
        })

        if (parentC) {
          if (!childrenByParent.has(parentC.id)) childrenByParent.set(parentC.id, [])
          childrenByParent.get(parentC.id).push(childC)
        } else {
          const isCollapsedAncestor = parentGenContainers.some(pC => collapsedNodeIds.has(pC.id))
          if (!isCollapsedAncestor) unassigned.push(childC)
        }
      })

      let currentRightX = 140
      parentGenContainers.forEach(parentC => {
        if (collapsedNodeIds.has(parentC.id)) return

        const parentPos = posMap.get(parentC.id) || { x: 1000, y: (genLevel - 2) * Y_GAP + 60, width: 300, height: CONTAINER_HEIGHT }
        const children = childrenByParent.get(parentC.id) || []

        if (children.length > 0) {
          const totalChildrenWidth = children.reduce((sum, c) => sum + getWidth(c), 0) + (children.length - 1) * X_GAP
          const parentCenterX = parentPos.x + parentPos.width / 2
          let startX = Math.max(currentRightX, parentCenterX - totalChildrenWidth / 2)

          children.forEach(childC => {
            const w = getWidth(childC)
            posMap.set(childC.id, { x: startX, y: (genLevel - 1) * Y_GAP + 60, width: w, height: CONTAINER_HEIGHT })
            startX += w + X_GAP
          })
          currentRightX = startX + X_GAP
        }
      })

      unassigned.forEach(childC => {
        const w = getWidth(childC)
        posMap.set(childC.id, { x: currentRightX, y: (genLevel - 1) * Y_GAP + 60, width: w, height: CONTAINER_HEIGHT })
        currentRightX += w + X_GAP
      })
    })

    return posMap
  }, [coupleContainers, collapsedNodeIds, maxDepthFilter, focalWindowInfo])

  // Automatic Viewport Camera Centering & Auto-Fit for All 4 Directions (Parents, Siblings, Children)
  useEffect(() => {
    if (!canvasRef.current) return

    const viewW = canvasRef.current.clientWidth || 1000
    const viewH = canvasRef.current.clientHeight || 700

    if (isFocalMode && focalWindowInfo.isFocalActive && focalWindowInfo.visibleContainers.length > 0) {
      // Find bounding box of all visible containers in focal window (Parents, Siblings, Children)
      let minX = Infinity, maxX = -Infinity
      let minY = Infinity, maxY = -Infinity

      focalWindowInfo.visibleContainers.forEach(c => {
        const pos = layoutPositions.get(c.id)
        if (pos) {
          minX = Math.min(minX, pos.x)
          maxX = Math.max(maxX, pos.x + pos.width)
          minY = Math.min(minY, pos.y)
          maxY = Math.max(maxY, pos.y + pos.height)
        }
      })

      if (minX !== Infinity && maxX > minX) {
        const bboxWidth = maxX - minX
        const bboxHeight = maxY - minY
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        // Compute optimal fit zoom level so ALL nodes in 4 directions fit inside view
        const paddingX = 90
        const paddingY = 90
        const scaleX = (viewW - paddingX) / bboxWidth
        const scaleY = (viewH - paddingY) / bboxHeight
        const fitZoom = Math.max(0.42, Math.min(1.0, Math.min(scaleX, scaleY)))

        // Center stage around the focal bounding box center
        const targetX = viewW / 2 - centerX * fitZoom
        const targetY = viewH / 2 - centerY * fitZoom

        setZoomLevel(fitZoom)
        setPanOffset({ x: targetX, y: targetY })
        return
      }
    }

    // Default single node centering for full tree mode
    const container = coupleContainers.find(c => c.primary.id === focusedId || (c.secondary && c.secondary.id === focusedId))
    if (container) {
      const pos = layoutPositions.get(container.id)
      if (pos) {
        const targetX = viewW / 2 - (pos.x + pos.width / 2)
        const targetY = viewH / 2 - (pos.y + pos.height / 2)
        setPanOffset({ x: targetX, y: targetY })
      }
    }
  }, [focusedId, isFocalMode, focalWindowInfo, layoutPositions, coupleContainers])

  useEffect(() => {
    if (selectedNodeId) {
      setFocusedId(selectedNodeId)
      setIsFocalMode(true)
      // Profile drawer stays CLOSED on focus mode load; opens only when "More" button is clicked
      setIsDrawerOpen(false)
    }
  }, [selectedNodeId])

  // Active Neighborhood Highlight
  const activeNeighborhood = useMemo(() => {
    const activeSet = new Set()
    const current = memberMap.get(focusedId)
    if (!current) return activeSet

    activeSet.add(current.id)
    ;(current.parentIds || []).forEach(id => activeSet.add(id))
    ;(current.spouseIds || []).forEach(id => activeSet.add(id))
    ;(current.childrenIds || []).forEach(id => activeSet.add(id))
    return activeSet
  }, [focusedId, memberMap])

  // Orthogonal SVG Tree Edges Generator
  const svgTreeEdges = useMemo(() => {
    const edges = []
    const visibleSet = new Set(focalWindowInfo.visibleContainers.map(c => c.id))

    focalWindowInfo.visibleContainers.forEach(parentC => {
      if (collapsedNodeIds.has(parentC.id)) return

      const parentPos = layoutPositions.get(parentC.id)
      if (!parentPos) return

      const pX = parentPos.x + parentPos.width / 2
      const pY = parentPos.y + parentPos.height
      const midY = pY + 45

      ;(parentC.childrenIds || []).forEach(childId => {
        const childC = coupleContainers.find(c => c.primary.id === childId || (c.secondary && c.secondary.id === childId))
        if (!childC || !visibleSet.has(childC.id)) return

        const childPos = layoutPositions.get(childC.id)
        if (!childPos) return

        const cX = childPos.x + childPos.width / 2
        const cY = childPos.y

        const isParentActive = activeNeighborhood.has(parentC.primary.id) || (parentC.secondary && activeNeighborhood.has(parentC.secondary.id))
        const isChildActive = activeNeighborhood.has(childId)
        const isActive = isParentActive && isChildActive

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
  }, [coupleContainers, layoutPositions, activeNeighborhood, collapsedNodeIds, focalWindowInfo])

  // 1-Click Instant Focal Isolation Mode Handler
  const focusMemberAndIsolate = (memberId) => {
    setFocusedId(memberId)
    setIsFocalMode(true) // Instantly collapse unrelated people & show 1-step up/down window
    if (onNodeSelect) onNodeSelect(memberId)
  }

  // Open Detailed Profile Side Drawer
  const openProfileDrawer = (memberId) => {
    focusMemberAndIsolate(memberId)
    setIsDrawerOpen(true)
  }

  // Level Up Button (`^`)
  const levelUp = () => {
    const current = memberMap.get(focusedId)
    if (current && current.parentIds && current.parentIds.length > 0) {
      focusMemberAndIsolate(current.parentIds[0])
    } else {
      focusMemberAndIsolate(rootId)
    }
  }

  // Reset View / Show Full Tree
  const resetToFullTree = () => {
    setIsFocalMode(false)
    setZoomLevel(0.9)
    setPanOffset({ x: -450, y: 30 })
    setIsDrawerOpen(false)
  }

  // English & Hindi Autocomplete Search
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return data.filter(m => 
      (m.name_en && m.name_en.toLowerCase().includes(q)) ||
      (m.name_hi && m.name_hi.toLowerCase().includes(q)) ||
      (m.relation_en && m.relation_en.toLowerCase().includes(q)) ||
      (m.relation_hi && m.relation_hi.toLowerCase().includes(q)) ||
      (m.bio && m.bio.toLowerCase().includes(q))
    ).slice(0, 10)
  }, [searchQuery, data])

  // Canvas Mouse & Touch Dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.family-joint-card') || e.target.closest('.canvas-btn') || e.target.closest('.canvas-header-bar')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    if (document.activeElement) document.activeElement.blur()
    setIsSearchDropdownOpen(false)
    setIsFilterOpen(false)
    setIsExportOpen(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      if (e.target.closest('.family-joint-card') || e.target.closest('.canvas-btn') || e.target.closest('.canvas-header-bar')) return
      setIsDragging(true)
      const touch = e.touches[0]
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y })
      if (document.activeElement) document.activeElement.blur()
      setIsSearchDropdownOpen(false)
      setIsFilterOpen(false)
      setIsExportOpen(false)
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    setPanOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y })
  }

  // Zoom Controls
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.8))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.4))
  const resetCamera = () => {
    setZoomLevel(1)
    setFocusedId(rootId)
    setIsFocalMode(true)
  }

  // Export Handlers
  const exportCSV = () => {
    const headers = ['ID', 'Name (English)', 'Name (Hindi)', 'Relation', 'Generation', 'Gender', 'Birth Date', 'Phone', 'Bio']
    const rows = data.map(m => [
      m.id,
      `"${m.name_en}"`,
      `"${m.name_hi}"`,
      `"${m.relation_en}"`,
      m.generation,
      m.gender,
      `"${m.birthDate || ''}"`,
      `"${m.phone || ''}"`,
      `"${(m.bio || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'gurupratap_sharma_family_tree.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setIsExportOpen(false)
  }

  const exportPNG = () => {
    window.print()
    setIsExportOpen(false)
  }

  return (
    <div className={`family-canvas-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`} ref={wrapperRef}>
      {/* 1. Top Enterprise Control Bar */}
      <div className="canvas-header-bar">
        {/* Left Controls: Search Pill (English & Hindi), Focal Mode Toggle, Level-Up */}
        <div className="header-left-group">
          {/* Autocomplete Search Pill supporting English & Hindi */}
          <div className="canvas-search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text"
              className="canvas-search-input"
              placeholder={isHi ? 'नाम खोजें (Search English/Hindi)...' : 'Search in English or Hindi (e.g. Sankalp)...'}
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

            {/* Search Dropdown */}
            {isSearchDropdownOpen && searchResults.length > 0 && (
              <div className="canvas-search-dropdown">
                {searchResults.map(member => (
                  <div 
                    key={member.id} 
                    className="search-dropdown-item"
                    onClick={() => { focusMemberAndIsolate(member.id); setIsSearchDropdownOpen(false); setSearchQuery(''); }}
                  >
                    <img src={member.photoUrl} alt={member.name_en} className="search-item-avatar" />
                    <div className="search-item-meta">
                      <span className="search-item-name">{member.name_en} / {member.name_hi}</span>
                      <span className="search-item-relation">{isHi ? member.relation_hi : member.relation_en}</span>
                    </div>
                    <span className="search-item-gen">Gen {member.generation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mode Switcher: 3-Gen Focal Window vs Full Tree */}
          <button 
            className={`header-action-btn ${isFocalMode ? 'mode-focal-active' : ''}`}
            onClick={() => setIsFocalMode(!isFocalMode)}
            title={isFocalMode ? 'Switch to Full Tree View' : 'Switch to 3-Generation Focal Isolation Mode'}
          >
            {isFocalMode ? '🎯 3-Gen Focus' : '🌐 Full Tree'}
          </button>

          {/* Level Depth Selector (Active when not in Focal Isolation Mode) */}
          {!isFocalMode && (
            <div className="header-dropdown-wrapper">
              <select 
                className="header-select-btn"
                value={maxDepthFilter}
                onChange={(e) => setMaxDepthFilter(e.target.value)}
                title="Filter Level Depth"
              >
                <option value="all">{isHi ? 'सभी पीढ़ियाँ (All Levels)' : 'All Levels'}</option>
                <option value="1">{isHi ? '१ पीढ़ी (Gen 1)' : '1 Level (Gen 1)'}</option>
                <option value="2">{isHi ? '२ पीढ़ियाँ (Gen 1-2)' : '2 Levels (Gen 1-2)'}</option>
                <option value="3">{isHi ? '३ पीढ़ियाँ (Gen 1-3)' : '3 Levels (Gen 1-3)'}</option>
                <option value="4">{isHi ? '४ पीढ़ियाँ (Gen 1-4)' : '4 Levels (Gen 1-4)'}</option>
              </select>
            </div>
          )}

          {/* Level-Up Button (`^`) */}
          <button className="header-icon-btn" onClick={levelUp} title="Navigate Camera Up 1 Level">
            ^
          </button>
        </div>

        {/* Right Controls: Fullscreen Toggle, Filter Options Dropdown & Export Menu */}
        <div className="header-right-group">
          {/* Fullscreen Toggle Button */}
          <button 
            className={`header-action-btn ${isFullscreen ? 'mode-fullscreen-active' : ''}`}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Full Screen View'}
          >
            {isFullscreen ? (isHi ? '↙↗ सामान्य स्क्रीन' : '↙↗ Exit Fullscreen') : (isHi ? '⛶ फुलस्क्रीन' : '⛶ Fullscreen')}
          </button>
          {/* Filter Dropdown */}
          <div className="header-dropdown-wrapper">
            <button 
              className="header-action-btn"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              ⚙️ {isHi ? 'फ़िल्टर' : 'Filter'} ▾
            </button>
            {isFilterOpen && (
              <div className="header-menu-dropdown">
                <button 
                  className={`menu-item ${branchFilter === 'all' ? 'active' : ''}`}
                  onClick={() => { setBranchFilter('all'); setIsFilterOpen(false); }}
                >
                  {isHi ? 'सभी वंश शाखाएं (All Branches)' : 'All Family Branches'}
                </button>
                <button 
                  className={`menu-item ${branchFilter === 'paternal' ? 'active' : ''}`}
                  onClick={() => { setBranchFilter('paternal'); setIsFilterOpen(false); }}
                >
                  {isHi ? 'पितृ पक्ष (Paternal Lineage)' : 'Paternal Lineage'}
                </button>
                <button 
                  className={`menu-item ${branchFilter === 'maternal' ? 'active' : ''}`}
                  onClick={() => { setBranchFilter('maternal'); setIsFilterOpen(false); }}
                >
                  {isHi ? 'मातृ पक्ष (Maternal Lineage)' : 'Maternal Lineage'}
                </button>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="header-dropdown-wrapper">
            <button 
              className="header-action-btn primary-export-btn"
              onClick={() => setIsExportOpen(!isExportOpen)}
            >
              📥 {isHi ? 'निर्यात' : 'Export'} ▾
            </button>
            {isExportOpen && (
              <div className="header-menu-dropdown right-aligned">
                <button className="menu-item" onClick={exportPNG}>
                  📸 {isHi ? 'PNG चित्र डाउनलोड करें (Image)' : 'Export PNG Image'}
                </button>
                <button className="menu-item" onClick={exportCSV}>
                  📄 {isHi ? 'CSV डेटा फ़ाइल (CSV Data)' : 'Export CSV Dataset'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Focal Mode Indicator Bar */}
      {isFocalMode && selectedMember && (
        <div className="focal-banner-bar">
          <span className="focal-badge-tag">🎯 FOCAL ISOLATION WINDOW</span>
          <span className="focal-info-text">
            {isHi 
              ? `केन्द्रित: ${selectedMember.name_hi} (${selectedMember.relation_hi}) — फोटो पर क्लिक करके १-स्टेप ऊपर/नीचे नेविगेट करें`
              : `Focus: ${selectedMember.name_en} (${selectedMember.relation_en}) — Click any card photo to isolate 1-Step Up/Down`}
          </span>
          <button className="focal-reset-pill-btn" onClick={resetToFullTree}>
            🌐 {isHi ? 'पूरा वृक्ष देखें (Show Full Tree)' : 'Show Full Tree'}
          </button>
        </div>
      )}

      {/* 2. Interactive Graph Viewport Canvas */}
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
        {/* Pinned Floating Zoom & Reset View Controls */}
        <div className="pinned-zoom-controls">
          <button className="pinned-zoom-btn" onClick={zoomIn} title="Zoom In">+</button>
          <button className="pinned-zoom-btn" onClick={zoomOut} title="Zoom Out">-</button>
          <button className="pinned-zoom-btn reset-btn" onClick={resetCamera} title="Reset Focal Center">🎯</button>
          <button className="pinned-zoom-btn fullscreen-btn" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Full Screen Mode"}>
            {isFullscreen ? "↙↗" : "⛶"}
          </button>
          {isFocalMode && (
            <button className="pinned-zoom-btn full-tree-btn" onClick={resetToFullTree} title="Show Full Tree (All 35 Members)">
              🌐
            </button>
          )}
        </div>

        {/* 2D Stage Board */}
        <motion.div 
          className="family-canvas-stage"
          ref={stageRef}
          animate={{ x: panOffset.x, y: panOffset.y, scale: zoomLevel }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ width: '3200px', height: '1050px', position: 'relative' }}
        >
          {/* Orthogonal SVG Tree Connector Step-Lines */}
          <svg className="family-tree-svg-canvas" width="3200" height="1050">
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

          {/* Explicitly Positioned Boxed Node Cards (Full Edge-to-Edge Photo + Name + 2 Side-by-Side Action Buttons) */}
          {focalWindowInfo.visibleContainers.map(container => {
            const pos = layoutPositions.get(container.id)
            if (!pos) return null

            const isCouple = container.isCouple
            const p1 = container.primary
            const p2 = container.secondary

            const isP1Active = activeNeighborhood.has(p1.id)
            const isP2Active = p2 && activeNeighborhood.has(p2.id)
            const isContainerActive = isP1Active || isP2Active

            const isP1Selected = focusedId === p1.id
            const isP2Selected = p2 && focusedId === p2.id
            const isCollapsed = collapsedNodeIds.has(container.id)
            const descendantCount = containerDescendantCounts.get(container.id) || 0

            return (
              <div 
                key={container.id}
                className={`family-joint-card ${isCouple ? 'couple-container' : 'single-container'} ${isContainerActive ? 'neighborhood-active' : 'dimmed'} ${(isP1Selected || isP2Selected) ? 'focused-node' : ''} ${pos.tier ? `tier-${pos.tier}` : ''}`}
                style={{ 
                  position: 'absolute', 
                  left: `${pos.x}px`, 
                  top: `${pos.y}px`,
                  width: `${pos.width}px`,
                  height: `${pos.height}px`
                }}
              >
                {/* Tier Label Pill in Focal Mode */}
                {isFocalMode && pos.tier && (
                  <span className={`focal-tier-badge ${pos.tier}`}>
                    {pos.tier === 'parents' ? (isHi ? '⬆️ माता-पिता (Parents)' : '⬆️ Parents') : null}
                    {pos.tier === 'center' ? (isHi ? '🎯 चयनित (Selected)' : '🎯 Selected') : null}
                    {pos.tier === 'sibling' ? (isHi ? '◀▶ भाई-बहन (Sibling)' : '◀▶ Sibling') : null}
                    {pos.tier === 'children' ? (isHi ? '⬇️ संतान (Children)' : '⬇️ Children') : null}
                  </span>
                )}

                {/* Primary Member Boxed Card (Edge-to-Edge Photo + Name + 2 Side-by-Side Buttons) */}
                <div 
                  className={`member-boxed-card ${isP1Selected ? 'card-selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); focusMemberAndIsolate(p1.id); }}
                >
                  {/* Full Edge-to-Edge Boxed Photo Header */}
                  <div className="boxed-photo-container">
                    <img src={p1.photoUrl} alt={p1.name_en} className="boxed-card-photo" />
                    {p1.isDeceased && <span className="deceased-lotus-badge" title="In Reverent Memory">🪷</span>}
                  </div>

                  {/* Person's Name */}
                  <div className="boxed-card-meta">
                    <h4 className="boxed-card-name" title={isHi ? p1.name_hi : p1.name_en}>
                      {isHi ? p1.name_hi : p1.name_en}
                    </h4>
                  </div>

                  {/* Two Side-by-Side Action Buttons: "More Details" and "Call" */}
                  <div className="boxed-card-actions">
                    <button 
                      className="card-btn-action btn-details"
                      onClick={(e) => { e.stopPropagation(); openProfileDrawer(p1.id); }}
                    >
                      {isHi ? 'अधिक' : 'More'}
                    </button>
                    <a 
                      href={p1.phone ? `tel:${p1.phone}` : '#'} 
                      className="card-btn-action btn-call"
                      onClick={(e) => { e.stopPropagation(); if (!p1.phone) openProfileDrawer(p1.id); }}
                    >
                      📞 {isHi ? 'कॉल' : 'Call'}
                    </a>
                  </div>
                </div>

                {/* Spousal Wedding Ring */}
                {isCouple && p2 && (
                  <>
                    <div className="couple-wedding-ring" title="Marriage Bond">💍</div>

                    {/* Secondary Spouse Boxed Card */}
                    <div 
                      className={`member-boxed-card ${isP2Selected ? 'card-selected' : ''}`}
                      onClick={(e) => { e.stopPropagation(); focusMemberAndIsolate(p2.id); }}
                    >
                      {/* Full Edge-to-Edge Boxed Photo Header */}
                      <div className="boxed-photo-container">
                        <img src={p2.photoUrl} alt={p2.name_en} className="boxed-card-photo" />
                        {p2.isDeceased && <span className="deceased-lotus-badge" title="In Reverent Memory">🪷</span>}
                      </div>

                      {/* Person's Name */}
                      <div className="boxed-card-meta">
                        <h4 className="boxed-card-name" title={isHi ? p2.name_hi : p2.name_en}>
                          {isHi ? p2.name_hi : p2.name_en}
                        </h4>
                      </div>

                      {/* Two Side-by-Side Action Buttons: "More Details" and "Call" */}
                      <div className="boxed-card-actions">
                        <button 
                          className="card-btn-action btn-details"
                          onClick={(e) => { e.stopPropagation(); openProfileDrawer(p2.id); }}
                        >
                          {isHi ? 'अधिक' : 'More'}
                        </button>
                        <a 
                          href={p2.phone ? `tel:${p2.phone}` : '#'} 
                          className="card-btn-action btn-call"
                          onClick={(e) => { e.stopPropagation(); if (!p2.phone) openProfileDrawer(p2.id); }}
                        >
                          📞 {isHi ? 'कॉल' : 'Call'}
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* Bottom Subtree Expand/Collapse Chevron Pill */}
                {descendantCount > 0 && !isFocalMode && (
                  <button 
                    className={`subtree-chevron-btn ${isCollapsed ? 'collapsed' : 'expanded'}`}
                    onClick={(e) => { e.stopPropagation(); toggleSubtreeCollapse(container.id); }}
                    title={isCollapsed ? `Expand ${descendantCount} descendants` : `Collapse subtree`}
                  >
                    <span>{descendantCount}</span>
                    <span className="chevron-arrow">{isCollapsed ? '∨' : '∧'}</span>
                  </button>
                )}
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* 3. Slide-Out Side Drawer for Full Member Profile */}
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
                  <h3 className="drawer-name">{selectedMember.name_en}</h3>
                  <h4 className="drawer-name-hi">{selectedMember.name_hi}</h4>
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

                {/* Direct Links / Interactive Pills to Relatives */}
                <div className="drawer-relatives-section">
                  <h4>{isHi ? 'प्रत्यक्ष पारिवारिक संबंध (1-Click Explore):' : 'Direct Relatives (1-Click Explore):'}</h4>
                  
                  {/* Parents */}
                  {selectedMember.parentIds && selectedMember.parentIds.length > 0 && (
                    <div className="relatives-group">
                      <span className="group-label">👨‍👩‍👦 {isHi ? 'माता-पिता (Parents):' : 'Parents:'}</span>
                      <div className="relatives-pills">
                        {selectedMember.parentIds.map(pId => {
                          const p = memberMap.get(pId)
                          if (!p) return null
                          return (
                            <button key={pId} className="relative-pill" onClick={() => openProfileDrawer(pId)}>
                              {p.name_en} ({p.name_hi})
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
                            <button key={sId} className="relative-pill" onClick={() => openProfileDrawer(sId)}>
                              {s.name_en} ({s.name_hi})
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
                            <button key={cId} className="relative-pill" onClick={() => openProfileDrawer(cId)}>
                              {c.name_en} ({c.name_hi})
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
