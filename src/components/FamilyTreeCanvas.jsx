import React, { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  onNodeSelect,
  autoFullscreen = false,
  onClose
}) {
  const { i18n } = useTranslation()
  const isHi = i18n.language !== 'en'

  // Viewport & Camera State
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: -450, y: 30 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastTouchDist, setLastTouchDist] = useState(null)
  const [lastTapTime, setLastTapTime] = useState(0)
  
  // Focal Isolation Mode State (1-Step Up / 1-Step Down Isolation)
  const [focusedId, setFocusedId] = useState(selectedNodeId || rootId)
  const [isFocalMode, setIsFocalMode] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set())
  const [maxDepthFilter, setMaxDepthFilter] = useState('all')
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const [showMobileHint, setShowMobileHint] = useState(false)

  useEffect(() => {
    if (window.innerWidth < 640) {
      setShowMobileHint(true)
      const timer = setTimeout(() => setShowMobileHint(false), 3500)
      return () => clearTimeout(timer)
    }
  }, [])

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

    if (autoFullscreen) {
      setIsFullscreen(true)
      if (wrapperRef.current) {
        if (wrapperRef.current.requestFullscreen) {
          wrapperRef.current.requestFullscreen().catch(() => {})
        } else if (wrapperRef.current.webkitRequestFullscreen) {
          wrapperRef.current.webkitRequestFullscreen()
        }
      }
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange)
      document.removeEventListener('webkitfullscreenchange', handleFSChange)
    }
  }, [autoFullscreen])

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

    // 1. Resolve Target Person dynamically from focusedId
    const targetPerson = memberMap.get(focusedId)
    if (!targetPerson) {
      return { 
        isFocalActive: false,
        visibleContainers: coupleContainers,
        focusedContainer: null,
        parentContainers: [],
        centerTierContainers: [],
        childContainers: []
      }
    }

    // Find the container holding targetPerson (primary or secondary)
    const focusedContainer = coupleContainers.find(c => 
      c.primary.id === focusedId || (c.secondary && c.secondary.id === focusedId)
    ) || {
      id: `single-focused-${targetPerson.id}`,
      primary: targetPerson,
      secondary: null,
      isCouple: false,
      generation: targetPerson.generation,
      childrenIds: targetPerson.childrenIds || []
    }

    const spouseId = (targetPerson.spouseIds && targetPerson.spouseIds.length > 0) ? targetPerson.spouseIds[0] : null

    // 2. Top Tier: Exact Blood Parents of Target Person
    const targetParentIds = new Set(targetPerson.parentIds || [])
    const parentContainers = []
    if (targetParentIds.size > 0) {
      coupleContainers.forEach(c => {
        const cMemberIds = [c.primary.id, c.secondary?.id].filter(Boolean)
        if (cMemberIds.some(id => targetParentIds.has(id))) {
          parentContainers.push(c)
        }
      })

      // Fallback for single parent cards not in coupleContainers
      if (parentContainers.length === 0) {
        targetParentIds.forEach(pId => {
          const pMem = memberMap.get(pId)
          if (pMem) {
            parentContainers.push({
              id: `single-parent-${pMem.id}`,
              primary: pMem,
              secondary: null,
              isCouple: false,
              generation: pMem.generation,
              childrenIds: pMem.childrenIds || []
            })
          }
        })
      }
    }

    // 3. Center Tier: Focused Container + Target Person's Blood Siblings
    const siblingMemberIds = new Set()
    targetParentIds.forEach(pId => {
      const pMem = memberMap.get(pId)
      if (pMem && pMem.childrenIds) {
        pMem.childrenIds.forEach(cId => {
          if (cId !== targetPerson.id && cId !== spouseId) {
            siblingMemberIds.add(cId)
          }
        })
      }
    })

    const siblingContainers = []
    siblingMemberIds.forEach(sId => {
      const siblingMember = memberMap.get(sId)
      if (siblingMember) {
        siblingContainers.push({
          id: `single-sibling-${siblingMember.id}`,
          primary: siblingMember,
          secondary: null,
          isCouple: false,
          generation: siblingMember.generation,
          childrenIds: siblingMember.childrenIds || []
        })
      }
    })

    const centerTierContainers = [focusedContainer, ...siblingContainers]

    // 4. Bottom Tier: Target Person's Direct Children
    const targetChildIds = new Set([
      ...(targetPerson.childrenIds || []),
      ...(spouseId && memberMap.get(spouseId) ? (memberMap.get(spouseId).childrenIds || []) : [])
    ])

    const childContainers = coupleContainers.filter(c => {
      if (c.id === focusedContainer.id) return false
      const cMemberIds = [c.primary.id, c.secondary?.id].filter(Boolean)
      return cMemberIds.some(id => targetChildIds.has(id))
    })

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
      childContainers,
      targetPerson
    }
  }, [isFocalMode, focusedId, coupleContainers, memberMap])

  // 2D Layout Calculation (Boxed Card Layout Dimensions)
  const layoutPositions = useMemo(() => {
    const posMap = new Map()

    const isMobile = window.innerWidth < 640
    const CONTAINER_WIDTH_SINGLE = isMobile ? 145 : 165
    const CONTAINER_WIDTH_COUPLE = isMobile ? 290 : 330
    const CONTAINER_HEIGHT = isMobile ? 150 : 165
    const getWidth = (c) => c.isCouple ? CONTAINER_WIDTH_COUPLE : CONTAINER_WIDTH_SINGLE

    if (focalWindowInfo.isFocalActive) {
      const { focusedContainer, parentContainers = [], centerTierContainers = [], childContainers = [] } = focalWindowInfo
      const isMobile = window.innerWidth < 640
      const CENTER_X = 1200
      const Y_PARENTS = isMobile ? 60 : 70
      const Y_FOCUSED = isMobile ? 310 : 350
      const Y_CHILDREN = isMobile ? 560 : 630
      const X_GAP = isMobile ? 20 : 40

      // 1. Position Focused Container EXACTLY centered at CENTER_X
      if (focusedContainer) {
        const fW = getWidth(focusedContainer)
        const fX = CENTER_X - fW / 2
        posMap.set(focusedContainer.id, {
          x: fX,
          y: Y_FOCUSED,
          width: fW,
          height: CONTAINER_HEIGHT,
          tier: 'center'
        })

        // Position siblings evenly to the left and right of focusedContainer
        const siblings = centerTierContainers.filter(c => c.id !== focusedContainer.id)
        const leftSiblings = []
        const rightSiblings = []
        siblings.forEach((sC, i) => {
          if (i % 2 === 0) leftSiblings.push(sC)
          else rightSiblings.push(sC)
        })

        let currentLeftX = fX
        leftSiblings.forEach(sC => {
          const sW = getWidth(sC)
          currentLeftX -= (sW + X_GAP)
          posMap.set(sC.id, {
            x: currentLeftX,
            y: Y_FOCUSED,
            width: sW,
            height: CONTAINER_HEIGHT,
            tier: 'sibling'
          })
        })

        let currentRightX = fX + fW + X_GAP
        rightSiblings.forEach(sC => {
          const sW = getWidth(sC)
          posMap.set(sC.id, {
            x: currentRightX,
            y: Y_FOCUSED,
            width: sW,
            height: CONTAINER_HEIGHT,
            tier: 'sibling'
          })
          currentRightX += sW + X_GAP
        })
      }

      // 2. Position Parent Containers in Top Tier (Tier 1) RIGHT ABOVE CENTER_X
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

      // 3. Position Child Containers in Bottom Tier (Tier 3) with Balanced Multi-Row Pyramid Layout
      if (childContainers.length > 0) {
        const maxPerRow = isMobile ? 2 : 3
        const numRows = Math.ceil(childContainers.length / maxPerRow)

        if (numRows === 1) {
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
        } else {
          // Multi-row balanced pyramid layout
          const Y_ROW_GAP = CONTAINER_HEIGHT + 40 // 270px vertical spacing between child rows
          let currentIndex = 0
          for (let r = 0; r < numRows; r++) {
            const remainingItems = childContainers.length - currentIndex
            const remainingRows = numRows - r
            const itemsInThisRow = Math.ceil(remainingItems / remainingRows)
            const rowItems = childContainers.slice(currentIndex, currentIndex + itemsInThisRow)
            currentIndex += itemsInThisRow

            const rowY = Y_CHILDREN + r * Y_ROW_GAP
            const totalW = rowItems.reduce((sum, c) => sum + getWidth(c), 0) + (rowItems.length - 1) * X_GAP
            let startX = CENTER_X - totalW / 2

            rowItems.forEach(cC => {
              const w = getWidth(cC)
              posMap.set(cC.id, {
                x: startX,
                y: rowY,
                width: w,
                height: CONTAINER_HEIGHT,
                tier: 'children'
              })
              startX += w + X_GAP
            })
          }
        }
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

  // Strict English Autocomplete Search
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return data.filter(m => 
      (m.name_en && m.name_en.toLowerCase().includes(q)) ||
      (m.relation_en && m.relation_en.toLowerCase().includes(q)) ||
      (m.bio && m.bio.toLowerCase().includes(q))
    ).slice(0, 10)
  }, [searchQuery, data])

  // Automatic Viewport Camera Centering: Selected person is ALWAYS in the exact center of the screen
  useEffect(() => {
    if (!canvasRef.current || !focusedId) return

    const viewW = canvasRef.current.clientWidth || window.innerWidth || 1000
    const viewH = canvasRef.current.clientHeight || window.innerHeight || 700
    const isMobile = viewW < 640

    // Find the container of the currently selected/focused person
    const selectedContainer = coupleContainers.find(c => 
      c.primary.id === focusedId || (c.secondary && c.secondary.id === focusedId)
    )
    if (!selectedContainer) return

    const selectedPos = layoutPositions.get(selectedContainer.id)
    if (!selectedPos) return

    // Exact center coordinates of the selected person container
    const selectedCenterX = selectedPos.x + selectedPos.width / 2
    const selectedCenterY = selectedPos.y + selectedPos.height / 2

    // Determine fit zoom level in focal mode so parents and children fit comfortably
    let targetZoom = zoomLevel
    if (isFocalMode && focalWindowInfo.isFocalActive && focalWindowInfo.visibleContainers.length > 0) {
      let minY = Infinity, maxY = -Infinity

      focalWindowInfo.visibleContainers.forEach(c => {
        const pos = layoutPositions.get(c.id)
        if (pos) {
          minY = Math.min(minY, pos.y)
          maxY = Math.max(maxY, pos.y + pos.height)
        }
      })

      if (minY !== Infinity && maxY > minY) {
        const bboxHeight = maxY - minY
        const paddingY = isMobile ? 80 : 100
        const scaleY = (viewH - paddingY) / bboxHeight

        // Guaranteed readable min zoom floor: 0.82 on Mobile, 0.88 on Desktop
        const minZoomFloor = isMobile ? 0.82 : 0.88
        const maxZoomCeiling = isMobile ? 0.95 : 1.0

        targetZoom = Math.max(minZoomFloor, Math.min(maxZoomCeiling, scaleY))
      }
    }

    // ALWAYS position selected person directly in the screen center
    const targetX = viewW / 2 - selectedCenterX * targetZoom
    const targetY = viewH / 2 - selectedCenterY * targetZoom

    setZoomLevel(targetZoom)
    setPanOffset({ x: targetX, y: targetY })
  }, [focusedId, isFocalMode, focalWindowInfo, layoutPositions, coupleContainers])

  useEffect(() => {
    if (selectedNodeId) {
      setFocusedId(selectedNodeId)
      setIsFocalMode(true)
      // Profile drawer stays CLOSED on focus mode load; opens only when "More" button is clicked
      setIsDrawerOpen(false)
    }
  }, [selectedNodeId])

  // Clean Spouse Name Formatter (eliminates duplicate husband names like Smt. Chaman)
  const getSpouseDisplayName = (p2, p1, isHi) => {
    if (!p2) return ''
    const rawName = isHi ? p2.name_hi : p2.name_en
    const p1RawName = isHi ? p1.name_hi : p1.name_en

    if (rawName && p1RawName && rawName.trim().toLowerCase() === p1RawName.trim().toLowerCase()) {
      const parts = p1RawName.split(' ')
      const surname = parts.length > 1 ? parts[parts.length - 1] : ''
      const prefix = isHi ? 'श्रीमती' : 'Smt.'
      return surname ? `${prefix} ${surname}` : (isHi ? 'धर्मपत्नी' : 'Spouse')
    }
    return rawName
  }

  // Active Neighborhood Highlight: Include all rendered focal containers to eliminate dimmed nodes
  const activeNeighborhood = useMemo(() => {
    const activeSet = new Set()
    if (focalWindowInfo.isFocalActive && focalWindowInfo.visibleContainers) {
      focalWindowInfo.visibleContainers.forEach(c => {
        if (c.primary) activeSet.add(c.primary.id)
        if (c.secondary) activeSet.add(c.secondary.id)
      })
    } else {
      const current = memberMap.get(focusedId)
      if (current) {
        activeSet.add(current.id)
        ;(current.parentIds || []).forEach(id => activeSet.add(id))
        ;(current.spouseIds || []).forEach(id => activeSet.add(id))
        ;(current.childrenIds || []).forEach(id => activeSet.add(id))
      }
    }
    return activeSet
  }, [focusedId, memberMap, focalWindowInfo])

  // Orthogonal SVG Tree Edges Generator
  const svgTreeEdges = useMemo(() => {
    const edges = []
    const visibleContainers = focalWindowInfo.visibleContainers || []
    const visibleSet = new Set(visibleContainers.map(c => c.id))

    visibleContainers.forEach(parentC => {
      if (collapsedNodeIds.has(parentC.id)) return

      const parentPos = layoutPositions.get(parentC.id)
      if (!parentPos) return

      const pX = parentPos.x + parentPos.width / 2
      const pY = parentPos.y + parentPos.height

      const parentMemberIds = [parentC.primary.id, parentC.secondary?.id].filter(Boolean)
      const parentChildrenIds = new Set([
        ...(parentC.childrenIds || []),
        ...(parentC.primary.childrenIds || []),
        ...(parentC.secondary ? (parentC.secondary.childrenIds || []) : [])
      ])

      visibleContainers.forEach(childC => {
        if (childC.id === parentC.id || !visibleSet.has(childC.id)) return

        const childPos = layoutPositions.get(childC.id)
        if (!childPos || childPos.y <= parentPos.y) return

        const childMemberIds = [childC.primary.id, childC.secondary?.id].filter(Boolean)
        const childParentIds = new Set([
          ...(childC.primary.parentIds || []),
          ...(childC.secondary ? (childC.secondary.parentIds || []) : [])
        ])

        const isChild = childMemberIds.some(id => parentChildrenIds.has(id)) ||
                        parentMemberIds.some(id => childParentIds.has(id))

        if (isChild) {
          const cX = childPos.x + childPos.width / 2
          const cY = childPos.y

          // In focal mode: Place horizontal bar at midY = cY - 35px (clean gap right above child's tier row)
          const midY = (isFocalMode && childPos.tier === 'children') ? (cY - 35) : (pY + cY) / 2

          const isParentActive = parentMemberIds.some(id => activeNeighborhood.has(id))
          const isChildActive = childMemberIds.some(id => activeNeighborhood.has(id))
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
        }
      })
    })

    return edges
  }, [coupleContainers, layoutPositions, activeNeighborhood, collapsedNodeIds, focalWindowInfo, isFocalMode])

  // Single Drop-Point Trunk Badges at Parent Line Origin
  const trunkBadges = useMemo(() => {
    const map = new Map()
    svgTreeEdges.forEach(edge => {
      const key = `${Math.round(edge.pX)}-${Math.round(edge.pY)}`
      if (!map.has(key)) {
        map.set(key, { pX: edge.pX, pY: edge.pY })
      }
    })
    return Array.from(map.values())
  }, [svgTreeEdges])

  const pressTimerRef = useRef(null)
  const isLongPressRef = useRef(false)
  const [pressingCardId, setPressingCardId] = useState(null)

  const handlePointerDown = (memberId, e) => {
    e.stopPropagation()
    const cardElem = e.currentTarget
    if (cardElem && cardElem.setPointerCapture) {
      try { cardElem.setPointerCapture(e.pointerId) } catch (_) {}
    }
    
    isLongPressRef.current = false
    setPressingCardId(memberId)

    if (pressTimerRef.current) clearTimeout(pressTimerRef.current)

    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      setPressingCardId(null)
      if (navigator.vibrate) {
        try { navigator.vibrate(40) } catch (_) {}
      }
      openProfileDrawer(memberId)
    }, 450)
  }

  const handlePointerMove = (e) => {
    if (!pressTimerRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const isInside = (
      e.clientX >= rect.left - 15 &&
      e.clientX <= rect.right + 15 &&
      e.clientY >= rect.top - 15 &&
      e.clientY <= rect.bottom + 15
    )
    if (!isInside) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
      setPressingCardId(null)
    }
  }

  const handlePointerUp = (memberId, e) => {
    e.stopPropagation()
    const cardElem = e.currentTarget
    if (cardElem && cardElem.releasePointerCapture) {
      try { cardElem.releasePointerCapture(e.pointerId) } catch (_) {}
    }
    setPressingCardId(null)

    const didLongPress = isLongPressRef.current

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }

    if (!didLongPress) {
      focusMemberAndIsolate(memberId)
    }
  }

  const handlePointerCancel = (e) => {
    if (e && e.currentTarget && e.currentTarget.releasePointerCapture) {
      try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_) {}
    }
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
    setPressingCardId(null)
  }

  // 1-Click Instant Focal Isolation Mode Handler
  const focusMemberAndIsolate = (memberId) => {
    setFocusedId(memberId)
    setIsFocalMode(true) // Instantly collapse unrelated people & show 1-step up/down window
    setIsDrawerOpen(false) // Guarantee profile drawer stays closed when focusing
    if (onNodeSelect) onNodeSelect(memberId)
  }

  // Open Detailed Profile Side Drawer
  const openProfileDrawer = (memberId) => {
    setFocusedId(memberId)
    setIsDrawerOpen(true)
  }

  const closeProfileDrawer = () => {
    setIsDrawerOpen(false)
    if (window.history.state && window.history.state.familyProfileModalOpen) {
      window.history.back()
    }
  }

  // Mobile Hardware / Gesture Back Button Event Listener
  useEffect(() => {
    if (isDrawerOpen) {
      window.history.pushState({ familyProfileModalOpen: true }, '')

      const handlePopState = () => {
        setIsDrawerOpen(false)
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [isDrawerOpen])

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

  // Canvas Mouse & Touch Dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.canvas-btn') || e.target.closest('.canvas-header-bar') || e.target.closest('.canvas-search-box') || e.target.tagName === 'INPUT') return
    setIsDragging(true)
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    if (document.activeElement && document.activeElement.tagName !== 'INPUT') document.activeElement.blur()
    setIsSearchDropdownOpen(false)
    setIsActionsMenuOpen(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Two-finger pinch-to-zoom gesture
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setLastTouchDist(dist)
    } else if (e.touches.length === 1) {
      if (e.target.closest('.canvas-btn') || e.target.closest('.canvas-header-bar') || e.target.closest('.canvas-search-box') || e.target.tagName === 'INPUT') return
      setIsDragging(true)
      const touch = e.touches[0]
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y })
      if (document.activeElement && document.activeElement.tagName !== 'INPUT') document.activeElement.blur()
      setIsSearchDropdownOpen(false)
      setIsActionsMenuOpen(false)

      // Double-Tap to Reset Camera Gesture
      const now = Date.now()
      if (now - lastTapTime < 300) {
        setZoomLevel(1)
        setFocusedId(rootId)
        setIsFocalMode(true)
      }
      setLastTapTime(now)
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDist) {
      // Pinch to Zoom scaling
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const delta = newDist - lastTouchDist
      if (Math.abs(delta) > 4) {
        setZoomLevel(prev => Math.max(0.4, Math.min(1.8, prev + delta * 0.005)))
        setLastTouchDist(newDist)
      }
    } else if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0]
      setPanOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setLastTouchDist(null)
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
    setIsActionsMenuOpen(false)
  }

  const exportPNG = () => {
    window.print()
    setIsActionsMenuOpen(false)
  }

  return (
    <div className={`family-canvas-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`} ref={wrapperRef}>
      {/* 1. Top Enterprise Control Bar */}
      <div className="canvas-header-bar">
        {/* Left Controls: Clean Search Pill (English Only) */}
        <div className="header-left-group">
          <div 
            className="canvas-search-box"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <span className="search-icon">🔍</span>
            <input 
              type="search"
              name="search"
              id="family-tree-search"
              className="canvas-search-input no-krutidev"
              data-no-krutidev="true"
              data-english-only="true"
              placeholder="Search name in English (e.g. Sankalp)..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value.replace(/[\u0900-\u097F]/g, '')
                setSearchQuery(val)
                setIsSearchDropdownOpen(val.trim().length > 0)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              onFocus={() => {
                if (searchQuery.trim().length > 0) {
                  setIsSearchDropdownOpen(true)
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              autoComplete="off"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => { setSearchQuery(''); setIsSearchDropdownOpen(false); }}>✕</button>
            )}

            {/* Search Dropdown */}
            {isSearchDropdownOpen && searchQuery.trim().length > 0 && searchResults.length > 0 && (
              <div className="canvas-search-dropdown">
                {searchResults.map(member => (
                  <div 
                    key={member.id} 
                    className="search-dropdown-item"
                    onClick={() => { focusMemberAndIsolate(member.id); setIsSearchDropdownOpen(false); setSearchQuery(''); }}
                  >
                    <img src={member.photoUrl} alt={member.name_en} className="search-item-avatar" />
                    <div className="search-item-meta">
                      <span className="search-item-name">{member.name_en}</span>
                      <span className="search-item-relation">{member.relation_en}</span>
                    </div>
                    <span className="search-item-gen">Gen {member.generation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Single Consolidated Top-Right Options Dropdown Menu */}
        <div className="header-right-group">
          <div className="header-dropdown-wrapper">
            <button 
              className={`header-action-btn primary-menu-btn ${isActionsMenuOpen ? 'menu-active' : ''}`}
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              title="Tree Options & Actions"
            >
              ⚙️ Options ▾
            </button>

            {isActionsMenuOpen && (
              <div className="header-menu-dropdown right-aligned main-actions-menu">
                {/* View Mode Toggle */}
                <button 
                  className={`menu-item ${!isFocalMode ? 'active' : ''}`}
                  onClick={() => {
                    if (isFocalMode) resetToFullTree(); else setIsFocalMode(true);
                    setIsActionsMenuOpen(false);
                  }}
                >
                  {isFocalMode ? '🌐 Show Full Tree' : '🎯 Focus Mode (1-Step)'}
                </button>

                {/* Fit Mobile Screen Width */}
                <button 
                  className="menu-item"
                  onClick={() => {
                    const viewW = canvasRef.current?.clientWidth || window.innerWidth
                    const viewH = canvasRef.current?.clientHeight || window.innerHeight
                    const mobileZoom = Math.max(0.85, Math.min(1.05, (viewW - 24) / 340))
                    const focusedContainer = coupleContainers.find(c => c.primary.id === focusedId || (c.secondary && c.secondary.id === focusedId))
                    const focusedPos = focusedContainer ? layoutPositions.get(focusedContainer.id) : null
                    if (focusedPos) {
                      setPanOffset({ x: viewW / 2 - (focusedPos.x + focusedPos.width / 2) * mobileZoom, y: viewH / 2 - (focusedPos.y + focusedPos.height / 2) * mobileZoom })
                    }
                    setZoomLevel(mobileZoom)
                    setIsActionsMenuOpen(false)
                  }}
                >
                  📱 Fit Mobile Screen Width
                </button>

                {/* Level Up Camera */}
                <button 
                  className="menu-item"
                  onClick={() => { levelUp(); setIsActionsMenuOpen(false); }}
                >
                  ⬆️ Level Up (Parent Gen)
                </button>

                {/* Fullscreen Toggle */}
                <button 
                  className="menu-item"
                  onClick={() => { toggleFullscreen(); setIsActionsMenuOpen(false); }}
                >
                  {isFullscreen ? '↙↗ Exit Fullscreen' : '⛶ Enter Fullscreen'}
                </button>

                <div className="menu-divider" />

                {/* Lineage Filter Options */}
                <div className="menu-group-label">LINEAGE FILTER</div>
                <button 
                  className={`menu-item ${branchFilter === 'all' ? 'active' : ''}`}
                  onClick={() => { setBranchFilter('all'); setIsActionsMenuOpen(false); }}
                >
                  👥 All Family Branches
                </button>
                <button 
                  className={`menu-item ${branchFilter === 'paternal' ? 'active' : ''}`}
                  onClick={() => { setBranchFilter('paternal'); setIsActionsMenuOpen(false); }}
                >
                  👨‍🦳 Paternal Lineage
                </button>
                <button 
                  className={`menu-item ${branchFilter === 'maternal' ? 'active' : ''}`}
                  onClick={() => { setBranchFilter('maternal'); setIsActionsMenuOpen(false); }}
                >
                  👩‍🦳 Maternal Lineage
                </button>

                <div className="menu-divider" />

                {/* Export Options */}
                <div className="menu-group-label">EXPORT DATA</div>
                <button className="menu-item" onClick={() => { exportPNG(); setIsActionsMenuOpen(false); }}>
                  📸 Export PNG Image
                </button>
                <button className="menu-item" onClick={() => { exportCSV(); setIsActionsMenuOpen(false); }}>
                  📄 Export CSV Dataset
                </button>
              </div>
            )}
          </div>

          {onClose && (
            <button className="header-icon-btn close-modal-btn" onClick={onClose} title="Exit Family Tree">
              ✕
            </button>
          )}
        </div>
      </div>

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
        onTouchEnd={handleTouchEnd}
      >
        {/* Pinned Floating Zoom & Reset View Controls */}
        <div className="pinned-zoom-controls">
          <button className="pinned-zoom-btn" onClick={zoomIn} title="Zoom In" aria-label="Zoom In">+</button>
          <button className="pinned-zoom-btn" onClick={zoomOut} title="Zoom Out" aria-label="Zoom Out">-</button>
          <button className="pinned-zoom-btn reset-btn" onClick={resetCamera} title="Reset Focal Center" aria-label="Reset Camera Position">🎯</button>
          <button className="pinned-zoom-btn fullscreen-btn" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Full Screen Mode"} aria-label="Toggle Fullscreen">
            {isFullscreen ? "↙↗" : "⛶"}
          </button>
          {isFocalMode && (
            <button className="pinned-zoom-btn full-tree-btn" onClick={resetToFullTree} title="Show Full Tree (All 35 Members)" aria-label="Show Full Tree">
              🌐
            </button>
          )}
        </div>

        {/* Mobile Gestures Toast Hint */}
        <AnimatePresence>
          {showMobileHint && (
            <motion.div 
              className="mobile-gesture-toast"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
            >
              💡 Pinch to Zoom • Swipe to Pan • Tap for Details
            </motion.div>
          )}
        </AnimatePresence>

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

          {/* SVG Connection Line Drop Point Badges */}
          {trunkBadges.map((badge, idx) => (
            <span 
              key={`trunk-badge-${idx}`}
              className="svg-trunk-badge" 
              style={{ left: `${badge.pX}px`, top: `${badge.pY + 12}px` }}
            >
              {isHi ? '⬇️ संतान (Children)' : '⬇️ Children'}
            </span>
          ))}

          {/* Explicitly Positioned Boxed Node Cards */}
          {focalWindowInfo.visibleContainers.map((container, index) => {
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

            // Blood descendant vs Spouse styling
            const p1HasParents = Boolean(p1.parentIds && p1.parentIds.length > 0)
            const p2HasParents = Boolean(p2 && p2.parentIds && p2.parentIds.length > 0)

            const focalParentChild = focalWindowInfo.focusedContainer && focalWindowInfo.focusedContainer.childrenIds
            const isP1FocalChild = focalParentChild ? focalParentChild.includes(p1.id) : false
            const isP2FocalChild = (p2 && focalParentChild) ? focalParentChild.includes(p2.id) : false

            const isP1Child = p1HasParents || isP1FocalChild
            const isP2Child = p2HasParents || isP2FocalChild

            let p1LineageClass = ''
            let p2LineageClass = ''

            if (isCouple && p2) {
              if (isP1Child && !isP2Child) {
                p1LineageClass = 'card-blood-child'
                p2LineageClass = 'card-spouse-muted'
              } else if (isP2Child && !isP1Child) {
                p1LineageClass = 'card-spouse-muted'
                p2LineageClass = 'card-blood-child'
              }
            }

            const spouseDisplayName = p2 ? getSpouseDisplayName(p2, p1, isHi) : ''

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
                {/* Primary Member Boxed Card */}
                <div 
                  className={`member-boxed-card ${isP1Selected ? 'card-selected' : ''} ${pressingCardId === p1.id ? 'card-pressing' : ''} ${p1LineageClass}`}
                  onPointerDown={(e) => handlePointerDown(p1.id, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(e) => handlePointerUp(p1.id, e)}
                  onPointerCancel={handlePointerCancel}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* Full Edge-to-Edge Photo with Overlaid Name Pill Badge */}
                  <div className="boxed-photo-container">
                    <img src={p1.photoUrl} alt={p1.name_en} className="boxed-card-photo" />
                    {p1.isDeceased && <span className="deceased-lotus-badge" title="In Reverent Memory">🪷</span>}
                    <div className="card-name-badge-pill">
                      <h4 className="boxed-card-name" title={isHi ? p1.name_hi : p1.name_en}>
                        {isHi ? p1.name_hi : p1.name_en}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Spousal Wedding Ring */}
                {isCouple && p2 && (
                  <>
                    <div className="couple-wedding-ring" title="Marriage Bond">💍</div>

                    {/* Secondary Spouse Boxed Card */}
                    <div 
                      className={`member-boxed-card ${isP2Selected ? 'card-selected' : ''} ${pressingCardId === p2.id ? 'card-pressing' : ''} ${p2LineageClass}`}
                      onPointerDown={(e) => handlePointerDown(p2.id, e)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={(e) => handlePointerUp(p2.id, e)}
                      onPointerCancel={handlePointerCancel}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {/* Full Edge-to-Edge Photo with Overlaid Name Pill Badge */}
                      <div className="boxed-photo-container">
                        <img src={p2.photoUrl} alt={p2.name_en} className="boxed-card-photo" />
                        {p2.isDeceased && <span className="deceased-lotus-badge" title="In Reverent Memory">🪷</span>}
                        <div className="card-name-badge-pill">
                          <h4 className="boxed-card-name" title={spouseDisplayName}>
                            {spouseDisplayName}
                          </h4>
                        </div>
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

      {/* 3. Portaled Full-Screen Mobile Modal / Side Drawer for Member Profile */}
      {createPortal(
        <AnimatePresence>
          {isDrawerOpen && selectedMember && (
            <>
              <motion.div 
                className="family-drawer-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeProfileDrawer}
              />
              <motion.div 
                className="family-drawer-panel"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              >
                {/* Mobile Bottom Sheet Drag Handle */}
                <div className="drawer-drag-handle" />

                {/* Header showing Person's Name */}
                <div className="family-drawer-header">
                  <h3>{isHi ? selectedMember.name_hi : selectedMember.name_en}</h3>
                  <button className="drawer-close-btn" onClick={closeProfileDrawer} aria-label="Close profile">✕</button>
                </div>

                <div className="family-drawer-body">
                  {/* Large Hero Photo Header (Top Half) with Tap to Zoom */}
                  <div 
                    className="drawer-hero-photo-container" 
                    onClick={() => setIsPhotoZoomed(true)} 
                    title="Tap to zoom photo"
                  >
                    <img 
                      src={selectedMember.photoUrl} 
                      alt=""
                      className="drawer-hero-photo-bg"
                      aria-hidden="true"
                    />
                    <img 
                      src={selectedMember.photoUrl} 
                      alt={selectedMember.name_en}
                      className="drawer-hero-photo"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name_en)}&background=B85C38&color=fff&size=500`
                      }}
                    />
                    <span className="hero-photo-zoom-hint">🔍 {isHi ? 'ज़ूम करें' : 'Tap to Zoom'}</span>
                    {selectedMember.isDeceased && (
                      <span className="drawer-deceased-badge">
                        🪷 {isHi ? 'स्वर्गीय (स्मृतिशेष)' : 'In Reverent Memory'}
                      </span>
                    )}
                  </div>

                  {/* Name & Relation Meta */}
                  <div className="drawer-member-name-block">
                    <h2 className="drawer-main-name">{selectedMember.name_en}</h2>
                    <h3 className="drawer-main-name-hi">{selectedMember.name_hi}</h3>
                    <div className="drawer-badge-pills">
                      <span className="drawer-relation-badge">{isHi ? selectedMember.relation_hi : selectedMember.relation_en}</span>
                      <span className="drawer-gen-tag">
                        {isHi ? `पीढ़ी ${selectedMember.generation}` : `Generation ${selectedMember.generation}`}
                      </span>
                    </div>
                  </div>

                  {/* Direct Action Bar: Phone Call, WhatsApp, & Focus Tree */}
                  <div className="drawer-quick-actions">
                    {selectedMember.phone && (
                      <>
                        <a href={`tel:${selectedMember.phone}`} className="drawer-action-btn btn-call">
                          📞 {isHi ? 'कॉल करें' : 'Call Phone'}
                        </a>
                        <a 
                          href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="drawer-action-btn btn-whatsapp"
                        >
                          💬 WhatsApp
                        </a>
                      </>
                    )}
                    <button 
                      className="drawer-action-btn btn-focus-tree"
                      onClick={() => {
                        closeProfileDrawer()
                        focusMemberAndIsolate(selectedMember.id)
                      }}
                    >
                      🎯 {isHi ? 'वृक्ष में देखें' : 'View on Tree'}
                    </button>
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

          {/* Full Screen Photo Zoom Lightbox Overlay */}
          {isPhotoZoomed && selectedMember && (
            <motion.div 
              className="photo-lightbox-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhotoZoomed(false)}
            >
              <button className="lightbox-close-btn" onClick={() => setIsPhotoZoomed(false)} aria-label="Close photo zoom">✕</button>
              <motion.img 
                src={selectedMember.photoUrl} 
                alt={selectedMember.name_en}
                className="lightbox-zoomed-img"
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.7 }}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="lightbox-caption">{isHi ? selectedMember.name_hi : selectedMember.name_en}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
