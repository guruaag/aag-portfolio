import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { uploadImage } from '../lib/imageUtils'
import { convertKrutiDevToUnicode, isKrutiDevText } from '../utils/krutiDevEngine'
import { handleHindiKeyDown } from '../utils/hindiTypingEngine'
import './FamilyTreeCanvas.css'

function handleKrutiDevPaste(e, currentValue, onUpdate) {
  const rawPasted = (e.clipboardData || window.clipboardData)?.getData('text') || ''
  if (rawPasted && isKrutiDevText(rawPasted)) {
    e.preventDefault()
    const converted = convertKrutiDevToUnicode(rawPasted)
    const target = e.target
    const start = target.selectionStart || 0
    const end = target.selectionEnd || 0
    const current = currentValue || ''
    const newText = current.substring(0, start) + converted + current.substring(end)
    onUpdate(newText)
  }
}

export const INITIAL_CITIES = [
  { id: 'c-1', name_en: 'Jaipur', name_hi: 'जयपुर', state_en: 'Rajasthan', state_hi: 'राजस्थान', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-2', name_en: 'Bengaluru', name_hi: 'बेंगलुरु', state_en: 'Karnataka', state_hi: 'कर्नाटक', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-3', name_en: 'New Delhi', name_hi: 'नई दिल्ली', state_en: 'Delhi', state_hi: 'दिल्ली', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-4', name_en: 'Mumbai', name_hi: 'मुंबई', state_en: 'Maharashtra', state_hi: 'महाराष्ट्र', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-5', name_en: 'Udaipur', name_hi: 'उदयपुर', state_en: 'Rajasthan', state_hi: 'राजस्थान', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-6', name_en: 'Jodhpur', name_hi: 'जोधपुर', state_en: 'Rajasthan', state_hi: 'राजस्थान', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-7', name_en: 'Kota', name_hi: 'कोटा', state_en: 'Rajasthan', state_hi: 'राजस्थान', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-8', name_en: 'Pune', name_hi: 'पुणे', state_en: 'Maharashtra', state_hi: 'महाराष्ट्र', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-9', name_en: 'Ahmedabad', name_hi: 'अहमदाबाद', state_en: 'Gujarat', state_hi: 'गुजरात', country_en: 'India', country_hi: 'भारत' },
  { id: 'c-10', name_en: 'Kolkata', name_hi: 'कोलकाता', state_en: 'West Bengal', state_hi: 'पश्चिम बंगाल', country_en: 'India', country_hi: 'भारत' }
]

export const FAMILY_DATA_35 = [
  // Generation 1: Paternal Grandparents (Patriarch & Matriarch)
  { id: 'f-101', name_hi: 'श्री भद्रसेन शर्मा', name_en: 'Shri Bhadrasen Sharma', relation_hi: 'दादाजी', relation_en: 'Grandfather', generation: 1, gender: 'male', isDeceased: true, birthDate: '10 Aug 1920', deathDate: '15 May 2000', phone: '+91 98290 11001', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-102'], childrenIds: ['f-201', 'f-203', 'f-205', 'f-207', 'f-209'], bio: 'वंश परंपरा के मूल प्रपितामह एवं परिवार के पूज्य पुरोधा।' },
  { id: 'f-102', name_hi: 'श्रीमती कौशल्या शर्मा', name_en: 'Smt. Kaushalya Sharma', relation_hi: 'दादीजी', relation_en: 'Grandmother', generation: 1, gender: 'female', isDeceased: true, birthDate: '12 Oct 1925', deathDate: '20 Nov 2005', phone: '+91 98290 11002', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-101'], childrenIds: ['f-201', 'f-203', 'f-205', 'f-207', 'f-209'], bio: 'परिवार की मूल संस्थापिका एवं स्नेहमयी दादीजी।' },

  // Generation 1: Maternal Grandparents
  { id: 'm-101', name_hi: 'श्री बंसीलाल शर्मा', name_en: 'Shri Bansilal Sharma', relation_hi: 'नानाजी', relation_en: 'Maternal Grandfather', generation: 1, gender: 'male', isDeceased: true, birthDate: '05 Jan 1922', deathDate: '18 Apr 1999', phone: '+91 98290 11003', city: 'Jodhpur', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-102'], childrenIds: ['m-201', 'f-202', 'm-205', 'm-207', 'm-209', 'm-211', 'm-213', 'm-215', 'm-217'], bio: 'नानक वंश के पूज्य संस्थापक एवं वरिष्ठ मार्गदर्शक।' },
  { id: 'm-102', name_hi: 'श्रीमती कमला शर्मा', name_en: 'Smt. Kamla Sharma', relation_hi: 'नानीजी', relation_en: 'Maternal Grandmother', generation: 1, gender: 'female', isDeceased: true, birthDate: '18 Mar 1928', deathDate: '10 Dec 2008', phone: '+91 98290 11004', city: 'Jodhpur', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-101'], childrenIds: ['m-201', 'f-202', 'm-205', 'm-207', 'm-209', 'm-211', 'm-213', 'm-215', 'm-217'], bio: 'ननिहाल परिवार की स्नेहमयी नानीजी।' },

  // Generation 2: Paternal Children (Bhadrasen + Kaushalya)
  { id: 'f-201', name_hi: 'कवि गुरुप्रताप शर्मा "आग"', name_en: 'Kavi Gurupratap Sharma "Aag"', relation_hi: 'मुख्य साहित्यकार', relation_en: 'Poet / Father', generation: 2, gender: 'male', isDeceased: false, birthDate: '26 Jan 1945', phone: '+91 98290 55432', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-202'], childrenIds: ['f-301', 'f-303', 'f-305'], bio: 'हिंदी काव्य जगत के तेजस्वी हस्ताक्षर एवं वरिष्ठ साहित्यकार।' },
  { id: 'f-202', name_hi: 'श्रीमती अनिता शर्मा', name_en: 'Smt. Anita Sharma', relation_hi: 'माताश्री', relation_en: 'Mother', generation: 2, gender: 'female', isDeceased: false, birthDate: '14 Mar 1950', phone: '+91 98290 55433', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['f-201'], childrenIds: ['f-301', 'f-303', 'f-305'], bio: 'साहित्य साधना की प्रेरणास्रोत एवं गृह स्वामिनी।' },

  { id: 'f-203', name_hi: 'श्री चमन शर्मा', name_en: 'Shri Chaman Sharma', relation_hi: 'चाचाजी', relation_en: 'Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '15 Aug 1948', phone: '+91 94140 12345', city: 'Udaipur', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-204'], childrenIds: ['f-307', 'f-308'], bio: 'परिवार के सम्मानित सदस्य एवं व्यवसायी।' },
  { id: 'f-204', name_hi: 'श्रीमती चमन शर्मा', name_en: 'Smt. Chaman Sharma', relation_hi: 'चाचीजी', relation_en: 'Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '20 Nov 1952', phone: '+91 94140 12346', city: 'Udaipur', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-203'], childrenIds: ['f-307', 'f-308'], bio: 'गृहिणी।' },

  { id: 'f-205', name_hi: 'श्री सत्यप्रकाश शर्मा', name_en: 'Shri Satyaprakash Sharma', relation_hi: 'चाचाजी', relation_en: 'Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '10 Feb 1951', phone: '+91 94140 22334', city: 'Kota', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-206'], childrenIds: ['f-309', 'f-310'], bio: 'शिक्षाविद एवं समाजसेवी।' },
  { id: 'f-206', name_hi: 'श्रीमती सत्यप्रकाश शर्मा', name_en: 'Smt. Satyaprakash Sharma', relation_hi: 'चाचीजी', relation_en: 'Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '05 May 1955', phone: '+91 94140 22335', city: 'Kota', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-205'], childrenIds: ['f-309', 'f-310'], bio: 'गृहिणी।' },

  { id: 'f-207', name_hi: 'श्री राजेन्द्र शर्मा', name_en: 'Shri Rajendra Sharma', relation_hi: 'चाचाजी', relation_en: 'Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '14 Dec 1954', phone: '+91 94140 33445', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-208'], childrenIds: ['f-311', 'f-312'], bio: 'वरिष्ठ अधिकारी।' },
  { id: 'f-208', name_hi: 'श्रीमती राजेन्द्र शर्मा', name_en: 'Smt. Rajendra Sharma', relation_hi: 'चाचीजी', relation_en: 'Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '22 Aug 1958', phone: '+91 94140 33446', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-207'], childrenIds: ['f-311', 'f-312'], bio: 'गृहिणी।' },

  { id: 'f-209', name_hi: 'श्रीमती किरण शर्मा', name_en: 'Smt. Kiran Sharma', relation_hi: 'बुआजी (पुत्री)', relation_en: 'Paternal Aunt (Sister)', generation: 2, gender: 'female', isDeceased: false, birthDate: '08 Apr 1958', phone: '+91 98280 99887', city: 'New Delhi', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['f-101', 'f-102'], spouseIds: ['f-210'], childrenIds: ['f-313', 'f-314'], bio: 'परिवार की प्रिय पुत्री व बुआजी।' },
  { id: 'f-210', name_hi: 'श्री किरण पति', name_en: 'Shri Kiran Spouse', relation_hi: 'फूफाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '10 Jan 1954', phone: '+91 98280 99888', city: 'New Delhi', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-209'], childrenIds: ['f-313', 'f-314'], bio: 'समाजसेवी।' },

  // Generation 2: Maternal Children (Bansilal + Kamla)
  { id: 'm-201', name_hi: 'श्रीमती सुनीता शर्मा', name_en: 'Smt. Sunita Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '12 May 1947', phone: '+91 98290 22001', city: 'Jodhpur', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-202'], childrenIds: ['m-301', 'm-302'], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-202', name_hi: 'श्री राजकमल', name_en: 'Shri Rajkamal', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '10 Aug 1944', phone: '+91 98290 22002', city: 'Jodhpur', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-201'], childrenIds: ['m-301', 'm-302'], bio: 'सुनीता जी के पति।' },

  { id: 'm-205', name_hi: 'श्रीमती सरिता शर्मा', name_en: 'Smt. Sarita Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '15 Jul 1952', phone: '+91 98290 22005', city: 'Jodhpur', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-206'], childrenIds: [], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-206', name_hi: 'श्री भगवती', name_en: 'Shri Bhagwati', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '02 Mar 1949', phone: '+91 98290 22006', city: 'Jodhpur', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-205'], childrenIds: [], bio: 'सरिता जी के पति।' },

  { id: 'm-207', name_hi: 'श्रीमती आशा शर्मा', name_en: 'Smt. Asha Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '18 Nov 1955', phone: '+91 98290 22007', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-208'], childrenIds: ['m-303', 'm-304'], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-208', name_hi: 'श्री राजेन्द्र', name_en: 'Shri Rajendra', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '25 Dec 1952', phone: '+91 98290 22008', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-207'], childrenIds: ['m-303', 'm-304'], bio: 'आशा जी के पति।' },

  { id: 'm-209', name_hi: 'श्रीमती सविता शर्मा', name_en: 'Smt. Savita Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '04 Jun 1958', phone: '+91 98290 22009', city: 'Ahmedabad', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-210'], childrenIds: ['m-305', 'm-306'], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-210', name_hi: 'श्री मुकेश', name_en: 'Shri Mukesh', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '14 Sep 1955', phone: '+91 98290 22010', city: 'Ahmedabad', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-209'], childrenIds: ['m-305', 'm-306'], bio: 'सविता जी के पति।' },

  { id: 'm-211', name_hi: 'श्री संदीप शर्मा', name_en: 'Shri Sandeep Sharma', relation_hi: 'मामाजी', relation_en: 'Maternal Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '22 Feb 1960', phone: '+91 98290 22011', city: 'Pune', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-212'], childrenIds: ['m-307', 'm-308'], bio: 'बंसीलाल जी के पुत्र।' },
  { id: 'm-212', name_hi: 'श्रीमती नमिता शर्मा', name_en: 'Smt. Namita Sharma', relation_hi: 'मामीजी', relation_en: 'Maternal Aunt (Uncle Wife)', generation: 2, gender: 'female', isDeceased: false, birthDate: '08 Oct 1963', phone: '+91 98290 22012', city: 'Pune', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-211'], childrenIds: ['m-307', 'm-308'], bio: 'संदीप जी की धर्मपत्नी।' },

  { id: 'm-213', name_hi: 'श्रीमती रजनी शर्मा', name_en: 'Smt. Rajni Sharma', relation_hi: 'मौसीजी', relation_en: 'Maternal Aunt', generation: 2, gender: 'female', isDeceased: false, birthDate: '11 Jan 1963', phone: '+91 98290 22013', city: 'Mumbai', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-214'], childrenIds: ['m-309', 'm-310'], bio: 'बंसीलाल जी की पुत्री।' },
  { id: 'm-214', name_hi: 'श्री आशिष', name_en: 'Shri Ashish', relation_hi: 'मौसाजी', relation_en: 'Uncle-in-law', generation: 2, gender: 'male', isDeceased: false, birthDate: '30 Mar 1960', phone: '+91 98290 22014', city: 'Mumbai', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-213'], childrenIds: ['m-309', 'm-310'], bio: 'रजनी जी के पति।' },

  { id: 'm-215', name_hi: 'श्री संजीव शर्मा', name_en: 'Shri Sanjeev Sharma', relation_hi: 'मामाजी', relation_en: 'Maternal Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '19 Aug 1965', phone: '+91 98290 22015', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-216'], childrenIds: ['m-311', 'm-312'], bio: 'बंसीलाल जी के पुत्र।' },
  { id: 'm-216', name_hi: 'श्रीमती कविता शर्मा', name_en: 'Smt. Kavita Sharma', relation_hi: 'मामीजी', relation_en: 'Maternal Aunt (Uncle Wife)', generation: 2, gender: 'female', isDeceased: false, birthDate: '25 Nov 1968', phone: '+91 98290 22016', city: 'Jaipur', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-215'], childrenIds: ['m-311', 'm-312'], bio: 'संजीव जी की धर्मपत्नी।' },

  { id: 'm-217', name_hi: 'श्री राजेश शर्मा', name_en: 'Shri Rajesh Sharma', relation_hi: 'मामाजी', relation_en: 'Maternal Uncle', generation: 2, gender: 'male', isDeceased: false, birthDate: '02 Apr 1968', phone: '+91 98290 22017', city: 'Kota', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: ['m-101', 'm-102'], spouseIds: ['m-218'], childrenIds: ['m-313', 'm-314'], bio: 'बंसीलाल जी के पुत्र।' },
  { id: 'm-218', name_hi: 'श्रीमती राजेश शर्मा', name_en: 'Smt. Rajesh Sharma', relation_hi: 'मामीजी', relation_en: 'Maternal Aunt (Uncle Wife)', generation: 2, gender: 'female', isDeceased: false, birthDate: '14 Dec 1971', phone: '+91 98290 22018', city: 'Kota', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['m-217'], childrenIds: ['m-313', 'm-314'], bio: 'राजेश जी की धर्मपत्नी।' },

  // Generation 3: Children of Kavi Gurupratap Sharma + Anita Sharma
  { id: 'f-301', name_hi: 'श्रीमती पूजा शर्मा (जोशी)', name_en: 'Smt. Puja Sharma Joshi', relation_hi: 'पुत्री', relation_en: 'Daughter', generation: 3, gender: 'female', isDeceased: false, birthDate: '18 Sep 1972', phone: '+91 98290 77665', city: 'Mumbai', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-302'], childrenIds: ['f-401', 'f-402'], bio: 'कवि गुरुप्रताप शर्मा जी की ज्येष्ठ पुत्री।' },
  { id: 'f-302', name_hi: 'श्री विकास जोशी', name_en: 'Shri Vikas Joshi', relation_hi: 'दामाद (जामातृ)', relation_en: 'Son-in-law', generation: 3, gender: 'male', isDeceased: false, birthDate: '04 Apr 1970', phone: '+91 98290 77666', city: 'Mumbai', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-301'], childrenIds: ['f-401', 'f-402'], bio: 'पूजा जी के पति।' },

  { id: 'f-303', name_hi: 'श्री संकल्प शर्मा', name_en: 'Shri Sankalp Sharma', relation_hi: 'पुत्र (आर्किटेक्ट)', relation_en: 'Son', generation: 3, gender: 'male', isDeceased: false, birthDate: '11 Dec 1975', phone: '+91 98290 44332', city: 'Bengaluru', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-304'], childrenIds: ['f-403'], bio: 'वरिष्ठ सॉफ्टवेयर इंजीनियर एवं डिजिटल आर्किटेक्ट।' },
  { id: 'f-304', name_hi: 'श्रीमती चाँदनी शर्मा', name_en: 'Smt. Chandini Sharma', relation_hi: 'पुत्रवधू', relation_en: 'Daughter-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '09 Aug 1979', phone: '+91 98290 44333', city: 'Bengaluru', photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-303'], childrenIds: ['f-403'], bio: 'संकल्प जी की धर्मपत्नी।' },

  { id: 'f-305', name_hi: 'श्री सनातन शर्मा', name_en: 'Shri Sanatan Sharma', relation_hi: 'पुत्र', relation_en: 'Son', generation: 3, gender: 'male', isDeceased: false, birthDate: '02 Feb 1980', phone: '+91 94141 88776', city: 'New Delhi', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80', parentIds: ['f-201', 'f-202'], spouseIds: ['f-306'], childrenIds: ['f-404', 'f-405'], bio: 'गुरुप्रताप जी के कनिष्ठ पुत्र।' },
  { id: 'f-306', name_hi: 'श्रीमती सुरभि शर्मा', name_en: 'Smt. Surbhi Sharma', relation_hi: 'पुत्रवधू', relation_en: 'Daughter-in-law', generation: 3, gender: 'female', isDeceased: false, birthDate: '14 Jul 1983', phone: '+91 94141 88777', city: 'New Delhi', photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80', parentIds: [], spouseIds: ['f-305'], childrenIds: ['f-404', 'f-405'], bio: 'सनातन जी की धर्मपत्नी।' },

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

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
}

const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES_HI = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']

export const parseMemberBirthInfo = (birthDateStr) => {
  if (!birthDateStr) return null
  const parts = birthDateStr.trim().split(/\s+/)
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10)
    const monthKey = parts[1].toLowerCase().slice(0, 3)
    if (!isNaN(day) && MONTH_MAP[monthKey] !== undefined) {
      return { day, month: MONTH_MAP[monthKey], year: parts[2] ? parseInt(parts[2], 10) : null }
    }
  }
  return null
}

export const getSortedBirthdays = (data) => {
  const currentMonth = new Date().getMonth()

  const parsedMembers = data.map(m => ({
    member: m,
    bInfo: parseMemberBirthInfo(m.birthDate)
  }))

  return parsedMembers.sort((a, b) => {
    if (!a.bInfo && !b.bInfo) return 0
    if (!a.bInfo) return 1
    if (!b.bInfo) return -1

    const distA = (a.bInfo.month - currentMonth + 12) % 12
    const distB = (b.bInfo.month - currentMonth + 12) % 12

    if (distA !== distB) return distA - distB
    return a.bInfo.day - b.bInfo.day
  })
}

export const autoTransliterateToHindi = (englishText) => {
  if (!englishText) return ''
  const commonMap = {
    'shri': 'श्री',
    'smt': 'श्रीमती',
    'smt.': 'श्रीमती',
    'kavi': 'कवि',
    'gurupratap': 'गुरुप्रताप',
    'sharma': 'शर्मा',
    'aag': 'आग',
    'anita': 'अनिता',
    'bhadrasen': 'भद्रसेन',
    'kaushalya': 'कौशल्या',
    'bansilal': 'बंसीलाल',
    'kamla': 'कमला',
    'chaman': 'चमन',
    'satyaprakash': 'सत्यप्रकाश',
    'rajendra': 'राजेन्द्र',
    'kiran': 'किरण',
    'sankalp': 'संकल्प',
    'sanatan': 'सनातन',
    'chandini': 'चाँदनी',
    'surbhi': 'सुरभि',
    'puja': 'पूजा',
    'pooja': 'पूजा',
    'joshi': 'जोशी',
    'vikas': 'विकास',
    'mayank': 'मयंक',
    'garima': 'गरिमा',
    'gaurav': 'गौरव',
    'richa': 'ऋचा',
    'amit': 'अमित',
    'neha': 'नेहा',
    'siddharth': 'सिद्धार्थ',
    'sunita': 'सुनीता',
    'sarita': 'सरिता',
    'asha': 'आशा',
    'savita': 'सविता',
    'sandeep': 'संदीप',
    'namita': 'नमिता',
    'rajni': 'रजनी',
    'sanjeev': 'संजीव',
    'kavita': 'कविता',
    'rajesh': 'राजेश'
  }
  const words = englishText.trim().split(/\s+/)
  const convertedWords = words.map(word => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase()
    if (commonMap[cleanWord]) return commonMap[cleanWord]
    let res = word
      .replace(/sh/gi, 'श')
      .replace(/ch/gi, 'च')
      .replace(/th/gi, 'थ')
      .replace(/ph/gi, 'फ')
      .replace(/kh/gi, 'ख')
      .replace(/gh/gi, 'घ')
      .replace(/bh/gi, 'भ')
      .replace(/dh/gi, 'ध')
      .replace(/a/gi, 'ा')
      .replace(/ee/gi, 'ी')
      .replace(/i/gi, 'ि')
      .replace(/oo/gi, 'ू')
      .replace(/u/gi, 'ु')
      .replace(/e/gi, 'े')
      .replace(/ai/gi, 'ै')
      .replace(/o/gi, 'ो')
      .replace(/au/gi, 'ौ')
      .replace(/k/gi, 'क')
      .replace(/g/gi, 'ग')
      .replace(/j/gi, 'ज')
      .replace(/t/gi, 'त')
      .replace(/d/gi, 'द')
      .replace(/n/gi, 'न')
      .replace(/p/gi, 'प')
      .replace(/b/gi, 'ब')
      .replace(/m/gi, 'म')
      .replace(/r/gi, 'र')
      .replace(/l/gi, 'ल')
      .replace(/v/gi, 'व')
      .replace(/w/gi, 'व')
      .replace(/s/gi, 'स')
      .replace(/h/gi, 'ह')
    return res
  })
}

export const getBirthYear = (dateStr) => {
  if (!dateStr) return 9999
  const info = parseMemberBirthInfo(dateStr)
  if (info && info.year) return info.year
  const match = dateStr ? dateStr.match(/\b(19\d\d|20\d\d)\b/) : null
  return match ? parseInt(match[1], 10) : 9999
}

function getMemberOptionLabel(m, isHi) {
  if (!m) return ''
  const name = isHi ? (m.name_hi || m.name_en) : (m.name_en || m.name_hi) || ''
  
  let year = ''
  if (m.birthDate) {
    const match = String(m.birthDate).match(/\b(18|19|20)\d{2}\b/)
    if (match) year = match[0]
  } else if (m.birthYear) {
    year = String(m.birthYear)
  }
  
  const city = isHi ? (m.city_hi || m.city || m.city_en || '') : (m.city_en || m.city || m.city_hi || '')
  
  const metaParts = []
  if (city) metaParts.push(city)
  if (year) metaParts.push(year)
  
  if (metaParts.length > 0) {
    return `${name} (${metaParts.join(', ')})`
  }
  return name
}

function SearchableCityPicker({ value, onChange, citiesList = [], onAddNewCity, isHi }) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuStyle, setMenuStyle] = useState({})

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setMenuStyle({
      top: `${rect.bottom + window.scrollY + 4}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${Math.max(rect.width, 240)}px`,
      zIndex: 999999
    })
  }, [])

  useEffect(() => {
    if (isOpen) {
      updateMenuPosition()
      const handleScroll = (e) => {
        if (menuRef.current && menuRef.current.contains(e.target)) return
        updateMenuPosition()
      }
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', updateMenuPosition)
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', updateMenuPosition)
      }
    }
  }, [isOpen, updateMenuPosition])

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const filteredCities = useMemo(() => {
    if (!filterText.trim()) return citiesList
    const q = filterText.toLowerCase()
    return citiesList.filter(c => 
      (c.name_en && c.name_en.toLowerCase().includes(q)) ||
      (c.name_hi && c.name_hi.includes(q)) ||
      (c.state_en && c.state_en.toLowerCase().includes(q)) ||
      (c.state_hi && c.state_hi.includes(q))
    )
  }, [citiesList, filterText])

  const selectedCityObj = useMemo(() => {
    if (!value) return null
    return citiesList.find(c => c.name_en === value || c.name_hi === value || c.id === value) || { name_en: value, name_hi: value }
  }, [citiesList, value])

  const displaySelectedText = selectedCityObj 
    ? (isHi ? (selectedCityObj.name_hi || selectedCityObj.name_en) : (selectedCityObj.name_en || selectedCityObj.name_hi))
    : ''

  return (
    <div className="city-picker-wrapper" style={{ position: 'relative', width: '100%' }}>
      <div 
        ref={triggerRef}
        className="city-picker-trigger admin-input"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) updateMenuPosition()
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '8px 12px',
          backgroundColor: '#FFF',
          borderRadius: '6px',
          border: '1px solid #D1D5DB'
        }}
      >
        <span style={{ color: displaySelectedText ? '#111827' : '#9CA3AF', fontSize: '0.85rem' }}>
          {displaySelectedText || (isHi ? 'शहर चुनें...' : 'Select city...')}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>▾</span>
      </div>

      {isOpen && createPortal(
        <div 
          ref={menuRef}
          className="city-portal-popup-menu"
          style={{
            position: 'absolute',
            ...menuStyle,
            backgroundColor: '#FFF',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
            border: '1px solid #E5E7EB',
            maxHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid #F3F4F6' }}>
            <input 
              type="text" 
              className="city-search-input"
              placeholder={isHi ? 'शहर खोजें...' : 'Search city...'}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '0.82rem',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filteredCities.length === 0 ? (
              <div style={{ padding: '10px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.8rem' }}>
                {isHi ? 'कोई शहर नहीं मिला' : 'No city found'}
              </div>
            ) : (
              filteredCities.map(c => {
                const cityName = isHi ? (c.name_hi || c.name_en) : (c.name_en || c.name_hi)
                const stateName = isHi ? (c.state_hi || c.state_en) : (c.state_en || c.state_hi)
                const isSelected = value === c.name_en || value === c.name_hi || value === c.id

                return (
                  <div 
                    key={c.id || c.name_en}
                    onClick={() => {
                      onChange(c.name_en)
                      setIsOpen(false)
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? '#F3F4F6' : 'transparent',
                      fontWeight: isSelected ? 600 : 400
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#E5E7EB' : '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#F3F4F6' : 'transparent'}
                  >
                    <span>{cityName}</span>
                    {stateName && <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>{stateName}</span>}
                  </div>
                )
              })
            )}
          </div>

          <div 
            onClick={() => {
              setIsOpen(false)
              onAddNewCity()
            }}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              color: '#8B0000',
              fontWeight: 600,
              fontSize: '0.83rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          >
            <span>➕</span>
            <span>{isHi ? 'नया शहर जोड़ें' : 'Add New City'}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function AddCityModal({ isOpen, onClose, onSave, isHi }) {
  const [cityName, setCityName] = useState('')
  const [stateName, setStateName] = useState('')
  const [countryName, setCountryName] = useState('India')

  useEffect(() => {
    if (isOpen) {
      setCityName('')
      setStateName('')
      setCountryName('India')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cityName.trim() || !stateName.trim()) return
    onSave({
      id: `c-${Date.now()}`,
      name_en: cityName.trim(),
      name_hi: cityName.trim(),
      state_en: stateName.trim(),
      state_hi: stateName.trim(),
      country_en: countryName.trim() || 'India',
      country_hi: countryName.trim() === 'India' ? 'भारत' : countryName.trim()
    })
  }

  return createPortal(
    <div 
      className="add-city-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="add-city-modal-card"
        style={{
          backgroundColor: '#FFF',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F9FAFB'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
            🏙️ {isHi ? 'नया शहर जोड़ें' : 'Add New City'}
          </h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'rgba(220, 53, 69, 0.12)',
              color: '#DC3545',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
              {isHi ? 'शहर का नाम *' : 'City Name *'}
            </label>
            <input 
              type="text" 
              required
              className="admin-input"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g. Bengaluru"
              autoFocus
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
              {isHi ? 'राज्य *' : 'State *'}
            </label>
            <input 
              type="text" 
              required
              className="admin-input"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="e.g. Karnataka"
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
              {isHi ? 'देश' : 'Country'}
            </label>
            <input 
              type="text" 
              className="admin-input"
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              placeholder="India"
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', border: '1px solid #D1D5DB', borderRadius: '6px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '0.82rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFF',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button 
              type="submit"
              style={{
                padding: '8px 18px',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#8B0000',
                color: '#FFF',
                cursor: 'pointer'
              }}
            >
              💾 {isHi ? 'शहर सहेजें' : 'Save City'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

function CompactInlineMemberPicker({
  label,
  membersList,
  selectedIds = [],
  onChange,
  currentMemberId,
  excludedIds = [],
  maxSelect = null,
  isHi
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuStyle, setMenuStyle] = useState({})

  const updateMenuPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const showAbove = spaceBelow < 250 && rect.top > 250
      
      setMenuStyle({
        position: 'fixed',
        left: `${Math.max(10, Math.min(rect.left, window.innerWidth - 330))}px`,
        top: showAbove ? 'auto' : `${rect.bottom + 4}px`,
        bottom: showAbove ? `${window.innerHeight - rect.top + 4}px` : 'auto',
        width: `${Math.max(rect.width, 320)}px`,
        zIndex: 999999
      })
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      updateMenuPosition()
      const handleScroll = (e) => {
        if (menuRef.current && menuRef.current.contains(e.target)) return
        updateMenuPosition()
      }
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', updateMenuPosition)
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', updateMenuPosition)
      }
    }
  }, [isOpen, updateMenuPosition])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedMembers = useMemo(() => {
    const set = new Set(selectedIds)
    return membersList.filter(m => set.has(m.id))
  }, [membersList, selectedIds])

  const availableMembers = useMemo(() => {
    const excludeSet = new Set([currentMemberId, ...(selectedIds || []), ...(excludedIds || [])].filter(Boolean))
    return membersList.filter(m => !excludeSet.has(m.id))
  }, [membersList, currentMemberId, selectedIds, excludedIds])

  const filteredMembers = useMemo(() => {
    if (!filterText.trim()) return availableMembers
    const q = filterText.toLowerCase()
    return availableMembers.filter(m => 
      (m.name_en && m.name_en.toLowerCase().includes(q)) ||
      (m.name_hi && m.name_hi.includes(q)) ||
      (m.relation_en && m.relation_en.toLowerCase().includes(q)) ||
      (m.relation_hi && m.relation_hi.includes(q))
    )
  }, [availableMembers, filterText])

  const selectMember = (id) => {
    if (maxSelect && selectedIds.length >= maxSelect) {
      return
    }
    onChange([...selectedIds, id])
  }

  const removeChip = (e, id) => {
    e.stopPropagation()
    onChange(selectedIds.filter(x => x !== id))
  }

  return (
    <div className="relationship-stacked-row">
      <label className="field-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
        {label}:
      </label>
      
      <div 
        ref={triggerRef}
        className="picker-trigger-box"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) updateMenuPosition()
        }}
      >
        <div className="picker-chips-container">
          {selectedMembers.length === 0 ? (
            <span className="picker-placeholder-text">
              {isHi ? 'सदस्य चुनें...' : 'Select members...'}
            </span>
          ) : (
            selectedMembers.map(m => (
              <span key={m.id} className="picker-chip-tag">
                {isHi ? (m.name_hi || m.name_en) : (m.name_en || m.name_hi)}
                <button 
                  type="button" 
                  className="chip-remove-btn" 
                  onClick={(e) => removeChip(e, m.id)}
                  title="Remove"
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
        <span style={{ fontSize: '0.85rem', color: '#888', marginLeft: '8px' }}>▾</span>
      </div>

      {isOpen && createPortal(
        <div 
          ref={menuRef}
          className="picker-portal-popup-menu"
          style={menuStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="picker-popup-search" style={{ paddingBottom: '6px', borderBottom: '1px solid #E2D7C5', marginBottom: '6px' }}>
            <input 
              type="text" 
              className="picker-search-input"
              placeholder={isHi ? 'नाम खोजें...' : 'Search name...'}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '0.82rem',
                border: '1px solid #E2D7C5',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
          </div>

          <div className="picker-popup-list" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredMembers.length === 0 ? (
              <div className="picker-no-results" style={{ padding: '12px', textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
                {isHi ? 'कोई परिणाम नहीं मिला' : 'No results found'}
              </div>
            ) : (
              filteredMembers.map(m => {
                const isLimitReached = maxSelect && selectedIds.length >= maxSelect
                return (
                  <div 
                    key={m.id} 
                    className={`picker-popup-item ${isLimitReached ? 'disabled-limit' : ''}`}
                    title={isLimitReached ? (isHi ? `अधिकतम ${maxSelect} की अनुमति है` : `Maximum ${maxSelect} allowed`) : ''}
                    onClick={() => {
                      if (!isLimitReached) {
                        selectMember(m.id)
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      cursor: isLimitReached ? 'not-allowed' : 'pointer',
                      opacity: isLimitReached ? 0.45 : 1
                    }}
                  >
                    <img 
                      src={m.photoUrl || 'https://ui-avatars.com/api/?name=Member'} 
                      alt="" 
                      style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div className="picker-item-details" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="item-name" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#333' }}>
                        {getMemberOptionLabel(m, isHi)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default function FamilyTreeCanvas({ 
  data = FAMILY_DATA_35, 
  rootId = 'f-201',
  selectedNodeId,
  onNodeSelect,
  autoFullscreen = false,
  onClose,
  isAdmin = false
}) {
  const { i18n } = useTranslation()
  const isHi = i18n.language !== 'en'

  // Admin / Editable State
  const [membersList, setMembersList] = useState(data)
  const [viewMode, setViewMode] = useState('canvas') // 'canvas' | 'table'
  const [isAdminEditOpen, setIsAdminEditOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(true)
  const [tableSearchQuery, setTableSearchQuery] = useState('')
  const [drawerLangTab, setDrawerLangTab] = useState('en')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const extractTenDigits = (val) => {
    if (!val) return ''
    const digits = val.replace(/\D/g, '')
    if (digits.length > 10 && digits.startsWith('91')) {
      return digits.slice(2, 12)
    }
    return digits.slice(0, 10)
  }

  const todayDateMax = useMemo(() => {
    return new Date().toISOString().split('T')[0]
  }, [])

  const validateDateBounds = (val) => {
    if (!val) return ''
    const parts = val.split('-')
    if (parts.length < 3) return ''
    let yearStr = parts[0]
    if (!yearStr || yearStr.length !== 4) return ''
    const yr = parseInt(yearStr, 10)
    const curYr = new Date().getFullYear()
    if (isNaN(yr) || yr < 1800 || yr > curYr) {
      return ''
    }
    return val
  }

  useEffect(() => {
    setMembersList(data)
  }, [data])

  useEffect(() => {
    const handleAdminAddEvent = () => {
      handleAddNewMember()
    }
    window.addEventListener('admin-add-family-member', handleAdminAddEvent)
    return () => window.removeEventListener('admin-add-family-member', handleAdminAddEvent)
  }, [membersList])

  const handlePhotoFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    try {
      setIsUploadingPhoto(true)
      const uploadedUrl = await uploadImage(file, 'family_tree_photos')
      if (uploadedUrl) {
        setEditingMember(prev => ({ ...prev, photoUrl: uploadedUrl }))
      } else {
        const reader = new FileReader()
        reader.onload = (evt) => {
          setEditingMember(prev => ({ ...prev, photoUrl: evt.target.result }))
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        setEditingMember(prev => ({ ...prev, photoUrl: evt.target.result }))
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

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
  const [isBirthdayDropdownOpen, setIsBirthdayDropdownOpen] = useState(false)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState(new Set())
  const [maxDepthFilter, setMaxDepthFilter] = useState('all')
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const [showMobileHint, setShowMobileHint] = useState(false)

  const sortedBirthdays = useMemo(() => getSortedBirthdays(membersList), [membersList])

  const handleSelectBirthdayMember = (memberId) => {
    setFocusedId(memberId)
    setIsFocalMode(true)
    openProfileDrawer(memberId)
    setIsBirthdayDropdownOpen(false)
  }

  // Momentum Touch Kinetic Scrolling Refs
  const lastPointerTimeRef = useRef(0)
  const lastPointerPosRef = useRef({ x: 0, y: 0 })
  const pointerVelRef = useRef({ vx: 0, vy: 0 })
  const momentumAnimRef = useRef(null)

  const stopMomentum = () => {
    if (momentumAnimRef.current) {
      cancelAnimationFrame(momentumAnimRef.current)
      momentumAnimRef.current = null
    }
  }

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

  const handleAddNewMember = (defaultParentId = null, defaultSpouseId = null) => {
    const newId = 'f-' + Date.now().toString().slice(-6)
    const newMember = {
      id: newId,
      name_en: '',
      name_hi: '',
      relation_en: 'Family Member',
      relation_hi: 'पारिवारिक सदस्य',
      generation: defaultParentId ? (memberMap.get(defaultParentId)?.generation || 1) + 1 : 1,
      gender: 'male',
      isDeceased: false,
      birthDate: '',
      deathDate: '',
      marriageAnniversaryDate: '',
      phone: '',
      whatsappPhone: '',
      facebookUrl: '',
      photoUrl: 'https://ui-avatars.com/api/?name=New+Member&background=B85C38&color=fff&size=500',
      parentIds: defaultParentId ? [defaultParentId] : [],
      spouseIds: defaultSpouseId ? [defaultSpouseId] : [],
      childrenIds: [],
      bio: ''
    }
    setEditingMember(newMember)
    setWhatsappSameAsPhone(true)
    setDrawerLangTab(isHi ? 'hi' : 'en')
    setIsAdminEditOpen(true)
  }

  const openProfileDrawer = (memberId) => {
    setFocusedId(memberId)
    setIsFocalMode(true)
    if (onNodeSelect) onNodeSelect(memberId)

    if (isAdmin) {
      const mem = memberMap.get(memberId)
      if (mem) {
        const rawPhone = extractTenDigits(mem.phone)
        const rawWa = extractTenDigits(mem.whatsappPhone || mem.phone)
        setEditingMember({ 
          ...mem,
          phone: rawPhone,
          whatsappPhone: rawWa
        })
        setWhatsappSameAsPhone(!mem.whatsappPhone || mem.whatsappPhone === mem.phone || rawWa === rawPhone)
        setDrawerLangTab(isHi ? 'hi' : 'en')
        setIsAdminEditOpen(true)
      }
    } else {
      setIsDrawerOpen(true)
    }
  }

  const handleSaveMember = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!editingMember) return

    const formatPhoneWithPrefix = (val) => {
      if (!val) return ''
      const digits = val.replace(/\D/g, '').slice(0, 10)
      return digits ? `+91 ${digits}` : ''
    }

    const finalPhone = formatPhoneWithPrefix(editingMember.phone)
    const finalWa = whatsappSameAsPhone 
      ? finalPhone 
      : formatPhoneWithPrefix(editingMember.whatsappPhone)

    const updatedMember = {
      ...editingMember,
      phone: finalPhone,
      whatsappPhone: finalWa,
      birthDate: validateDateBounds(editingMember.birthDate),
      marriageAnniversaryDate: validateDateBounds(editingMember.marriageAnniversaryDate),
      deathDate: validateDateBounds(editingMember.deathDate)
    }

    setMembersList(prev => {
      const exists = prev.some(m => m.id === updatedMember.id)
      let newList
      if (exists) {
        newList = prev.map(m => m.id === updatedMember.id ? updatedMember : m)
      } else {
        newList = [...prev, updatedMember]
      }
      return newList
    })

    setIsAdminEditOpen(false)
    setEditingMember(null)
  }

  const handleDeleteMember = (memberId) => {
    if (!window.confirm(isHi ? 'क्या आप निश्चित हैं कि इस सदस्य को हटाना चाहते हैं?' : 'Are you sure you want to delete this member?')) return
    setMembersList(prev => prev.filter(m => m.id !== memberId))
    setIsAdminEditOpen(false)
    setEditingMember(null)
  }

  // Fast O(1) Member Map
  const memberMap = useMemo(() => {
    const map = new Map()
    membersList.forEach(m => map.set(m.id, m))
    return map
  }, [membersList])

  const selectedMember = memberMap.get(focusedId) || membersList[0] || data[0]

  // Structural Married Couple Containers
  const { coupleContainers, containerDescendantCounts } = useMemo(() => {
    const processedSpouses = new Set()
    const containers = []

    membersList.forEach(member => {
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

    // Sort Containers & Children Eldest First (Earliest Birth Date)
    containers.sort((a, b) => {
      const yA = getBirthYear(a.primary.birthDate)
      const yB = getBirthYear(b.primary.birthDate)
      if (yA !== yB) return yA - yB
      return (a.primary.name_en || '').localeCompare(b.primary.name_en || '')
    })

    containers.forEach(c => {
      if (c.childrenIds && c.childrenIds.length > 0) {
        c.childrenIds.sort((aId, bId) => {
          const mA = memberMap.get(aId)
          const mB = memberMap.get(bId)
          const yA = getBirthYear(mA?.birthDate)
          const yB = getBirthYear(mB?.birthDate)
          if (yA !== yB) return yA - yB
          return (mA?.name_en || '').localeCompare(mB?.name_en || '')
        })
      }
    })

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
  const isDraggingCardRef = useRef(false)
  const pressStartPosRef = useRef({ x: 0, y: 0 })
  const [pressingCardId, setPressingCardId] = useState(null)

  const handlePointerDown = (memberId, e) => {
    e.stopPropagation()
    const cardElem = e.currentTarget
    if (cardElem && cardElem.setPointerCapture) {
      try { cardElem.setPointerCapture(e.pointerId) } catch (_) {}
    }
    
    isLongPressRef.current = false
    isDraggingCardRef.current = false
    pressStartPosRef.current = { x: e.clientX, y: e.clientY }
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
    if (!pressStartPosRef.current) return
    const dist = Math.hypot(
      e.clientX - pressStartPosRef.current.x,
      e.clientY - pressStartPosRef.current.y
    )
    if (dist > 10) {
      isDraggingCardRef.current = true
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current)
        pressTimerRef.current = null
      }
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

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }

    if (!isDraggingCardRef.current && !isLongPressRef.current) {
      openProfileDrawer(memberId)
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
    isDraggingCardRef.current = false
    setPressingCardId(null)
  }

  // 1-Click Instant Focal Isolation Mode Handler
  const focusMemberAndIsolate = (memberId) => {
    setFocusedId(memberId)
    setIsFocalMode(true) // Instantly collapse unrelated people & show 1-step up/down window
    if (onNodeSelect) onNodeSelect(memberId)
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
    stopMomentum()
    setIsDragging(true)
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    lastPointerTimeRef.current = performance.now()
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY }
    pointerVelRef.current = { vx: 0, vy: 0 }
    if (document.activeElement && document.activeElement.tagName !== 'INPUT') document.activeElement.blur()
    setIsSearchDropdownOpen(false)
    setIsBirthdayDropdownOpen(false)
    setIsActionsMenuOpen(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const now = performance.now()
    const dt = (now - (lastPointerTimeRef.current || now)) / 1000
    if (dt > 0.005) {
      pointerVelRef.current = {
        vx: (e.clientX - lastPointerPosRef.current.x) / dt,
        vy: (e.clientY - lastPointerPosRef.current.y) / dt
      }
    }
    lastPointerTimeRef.current = now
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY }
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    triggerMomentum()
  }

  const triggerMomentum = () => {
    const speed = Math.hypot(pointerVelRef.current.vx, pointerVelRef.current.vy)
    if (speed > 120) {
      let currentVx = pointerVelRef.current.vx * 0.25
      let currentVy = pointerVelRef.current.vy * 0.25

      const stepMomentum = () => {
        currentVx *= 0.90
        currentVy *= 0.90
        if (Math.hypot(currentVx, currentVy) > 4) {
          setPanOffset(prev => ({ x: prev.x + currentVx * 0.016, y: prev.y + currentVy * 0.016 }))
          momentumAnimRef.current = requestAnimationFrame(stepMomentum)
        } else {
          stopMomentum()
        }
      }
      stopMomentum()
      momentumAnimRef.current = requestAnimationFrame(stepMomentum)
    }
  }

  const handleTouchStart = (e) => {
    stopMomentum()
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
      lastPointerTimeRef.current = performance.now()
      lastPointerPosRef.current = { x: touch.clientX, y: touch.clientY }
      pointerVelRef.current = { vx: 0, vy: 0 }
      if (document.activeElement && document.activeElement.tagName !== 'INPUT') document.activeElement.blur()
      setIsSearchDropdownOpen(false)
      setIsBirthdayDropdownOpen(false)
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
      const now = performance.now()
      const dt = (now - (lastPointerTimeRef.current || now)) / 1000
      if (dt > 0.005) {
        pointerVelRef.current = {
          vx: (touch.clientX - lastPointerPosRef.current.x) / dt,
          vy: (touch.clientY - lastPointerPosRef.current.y) / dt
        }
      }
      lastPointerTimeRef.current = now
      lastPointerPosRef.current = { x: touch.clientX, y: touch.clientY }
      setPanOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setLastTouchDist(null)
    triggerMomentum()
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
    <div className={`family-canvas-wrapper ${isFullscreen ? 'is-fullscreen' : ''} ${isAdmin ? 'is-admin-mode' : ''}`} ref={wrapperRef}>

      {/* Admin Table View Mode */}
      {isAdmin && viewMode === 'table' ? (
        <div className="admin-members-table-container">
          <div className="table-search-header">
            <input 
              type="text"
              className="admin-table-search-input"
              placeholder={isHi ? 'सदस्य का नाम खोजें...' : 'Search members by name...'}
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
            />
          </div>
          <table className="admin-members-table">
            <thead>
              <tr>
                <th>{isHi ? 'फोटो' : 'Photo'}</th>
                <th>{isHi ? 'नाम' : 'Name'}</th>
                <th>{isHi ? 'संपर्क' : 'Contact'}</th>
                <th>{isHi ? 'कार्रवाई' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {membersList
                .filter(m => !tableSearchQuery || m.name_en.toLowerCase().includes(tableSearchQuery.toLowerCase()) || m.name_hi.includes(tableSearchQuery))
                .map(m => (
                  <tr key={m.id}>
                    <td>
                      <img src={m.photoUrl} alt={m.name_en} className="table-member-thumb" />
                    </td>
                    <td>
                      <strong>{isHi ? m.name_hi : m.name_en}</strong>
                      <br />
                      <small className="sub-name">{isHi ? m.name_en : m.name_hi}</small>
                    </td>
                    <td>{m.phone || 'N/A'}</td>
                    <td>
                      <button 
                        className="table-action-btn btn-edit"
                        onClick={() => openProfileDrawer(m.id)}
                      >
                        ✏️ {isHi ? 'संपादित करें' : 'Edit'}
                      </button>
                      <button 
                        className="table-action-btn btn-del"
                        onClick={() => handleDeleteMember(m.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      ) : null}

      {/* 1. Top Enterprise Control Bar */}
      <div className="canvas-header-bar">
        {/* Left Controls: Clean Search Pill (English Only) + Birthdays Dropdown */}
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
                    onClick={() => { openProfileDrawer(member.id); setIsSearchDropdownOpen(false); setSearchQuery(''); }}
                  >
                    <img src={member.photoUrl} alt={member.name_en} className="search-item-avatar" />
                    <div className="search-item-meta">
                      <span className="search-item-name">{member.name_en}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Birthdays Dropdown (Current Month First) */}
          <div className="canvas-header-dropdown-container">
            <button 
              className={`header-action-btn ${isBirthdayDropdownOpen ? 'menu-active' : ''}`}
              onClick={() => setIsBirthdayDropdownOpen(prev => !prev)}
              title="View Family Birthdays"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              🎂 {isHi ? 'जन्म दिवस' : 'Birthdays'} ▾
            </button>
            {isBirthdayDropdownOpen && (
              <div className="canvas-birthday-menu">
                <div className="birthday-menu-header">
                  <span>🎉 {isHi ? 'जन्म दिवस सूची (वर्तमान माह प्रथम)' : 'Family Birthdays (Current Month First)'}</span>
                </div>
                <div className="birthday-menu-list">
                  {sortedBirthdays.map(({ member, bInfo }) => {
                    if (!bInfo) return null
                    const isCurrentMonth = bInfo.month === new Date().getMonth()
                    const monthName = isHi ? MONTH_NAMES_HI[bInfo.month] : MONTH_NAMES_EN[bInfo.month]
                    return (
                      <div 
                        key={member.id} 
                        className={`birthday-menu-item ${isCurrentMonth ? 'current-month-item' : ''}`}
                        onClick={() => handleSelectBirthdayMember(member.id)}
                      >
                        <img src={member.photoUrl} alt="" className="birthday-item-avatar" />
                        <div className="birthday-item-info">
                          <span className="birthday-item-name">{isHi ? member.name_hi : member.name_en}</span>
                          <span className="birthday-item-date">{bInfo.day} {monthName} {bInfo.year ? `(${bInfo.year})` : ''}</span>
                        </div>
                        {isCurrentMonth && <span className="birthday-month-pill">{isHi ? 'इस माह' : 'This Month'}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Stats, Add Member, View Mode & Options */}
        <div className="header-right-group">
          {isAdmin && (
            <>
              <span className="header-stats-pill">🌳 {isHi ? `कुल सदस्य: ${membersList.length}` : `Total Members: ${membersList.length}`}</span>
              <button 
                type="button"
                className="header-btn-add-member"
                onClick={() => handleAddNewMember()}
              >
                + {isHi ? 'नया सदस्य' : 'Add New Member'}
              </button>
              <div className="view-mode-toggle">
                <button 
                  type="button"
                  className={`mode-btn ${viewMode === 'canvas' ? 'active' : ''}`}
                  onClick={() => setViewMode('canvas')}
                >
                  🌳 {isHi ? 'कैनवास' : 'Canvas'}
                </button>
                <button 
                  type="button"
                  className={`mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  📋 {isHi ? 'तालिका' : 'Table'}
                </button>
              </div>
            </>
          )}

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
          <span className="canvas-zoom-badge" title="Current Zoom Level">{Math.round(zoomLevel * 100)}%</span>
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

            const p1Birth = parseMemberBirthInfo(p1.birthDate)
            const isP1BirthdayMonth = p1Birth && p1Birth.month === new Date().getMonth()

            const p2Birth = p2 ? parseMemberBirthInfo(p2.birthDate) : null
            const isP2BirthdayMonth = p2Birth && p2Birth.month === new Date().getMonth()

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
                  className={`member-boxed-card ${isP1Selected ? 'card-selected' : ''} ${pressingCardId === p1.id ? 'card-pressing' : ''} ${p1LineageClass} ${isP1BirthdayMonth ? 'birthday-highlight-card' : ''}`}
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
                    {isP1BirthdayMonth && !p1.isDeceased && <span className="birthday-crown-badge" title="Birthday Month! 🎂">🎂</span>}
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
                      className={`member-boxed-card ${isP2Selected ? 'card-selected' : ''} ${pressingCardId === p2.id ? 'card-pressing' : ''} ${p2LineageClass} ${isP2BirthdayMonth ? 'birthday-highlight-card' : ''}`}
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
                        {isP2BirthdayMonth && !p2.isDeceased && <span className="birthday-crown-badge" title="Birthday Month! 🎂">🎂</span>}
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
                {/* Top Pinned Area: Drag handle & Hero Photo */}
                <div className="family-drawer-top-pinned">
                  <div className="drawer-drag-handle" />

                  {/* Hero Photo Header (Sits directly at top) */}
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
                      alt={isHi ? selectedMember.name_hi : selectedMember.name_en}
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
                </div>

                <div className="family-drawer-body">
                  {/* Single Language Name */}
                  <div className="drawer-member-name-block">
                    <h2 className="drawer-main-name">{isHi ? selectedMember.name_hi : selectedMember.name_en}</h2>
                  </div>

                  {/* Quick Action Bar: Call, WhatsApp, Facebook & Close */}
                  <div className="drawer-quick-actions">
                    {selectedMember.phone && (
                      <a href={`tel:${selectedMember.phone}`} className="drawer-action-btn btn-call">
                        📞 {isHi ? 'कॉल करें' : 'Call'}
                      </a>
                    )}
                    {(selectedMember.whatsappPhone || selectedMember.phone) && (
                      <a 
                        href={`https://wa.me/${(selectedMember.whatsappPhone || selectedMember.phone).replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="drawer-action-btn btn-whatsapp"
                      >
                        💬 {isHi ? 'व्हाट्सएप' : 'WhatsApp'}
                      </a>
                    )}
                    {selectedMember.facebookUrl && (
                      <a 
                        href={selectedMember.facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="drawer-action-btn btn-facebook"
                      >
                        📘 Facebook
                      </a>
                    )}
                    <button 
                      className="drawer-action-btn btn-close-panel"
                      onClick={closeProfileDrawer}
                    >
                      ❌ {isHi ? 'बंद करें' : 'Close'}
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
                  </div>

                  {/* Direct Links / Interactive Pills to Relatives */}
                  <div className="drawer-relatives-section">
                    <h4>{isHi ? 'प्रत्यक्ष पारिवारिक संबंध:' : 'Direct Relatives:'}</h4>
                    
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
                                {isHi ? p.name_hi : p.name_en}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Siblings */}
                    {(() => {
                      if (!selectedMember.parentIds || selectedMember.parentIds.length === 0) return null
                      const parentSet = new Set(selectedMember.parentIds)
                      const siblings = []
                      memberMap.forEach((m) => {
                        if (m.id !== selectedMember.id && m.parentIds && m.parentIds.some(pId => parentSet.has(pId))) {
                          siblings.push(m)
                        }
                      })
                      if (siblings.length === 0) return null
                      return (
                        <div className="relatives-group">
                          <span className="group-label">👨‍👦‍👦 {isHi ? 'भाई-बहन (Siblings):' : 'Siblings:'}</span>
                          <div className="relatives-pills">
                            {siblings.map(sib => (
                              <button key={sib.id} className="relative-pill" onClick={() => openProfileDrawer(sib.id)}>
                                {isHi ? sib.name_hi : sib.name_en}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

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
                              <button key={cId} className="relative-pill" onClick={() => openProfileDrawer(cId)}>
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
        wrapperRef.current || document.body
      )}

      {/* Admin Edit Member Drawer Form Modal */}
      {isAdmin && isAdminEditOpen && editingMember && createPortal(
        <AnimatePresence>
          <motion.div 
            className="family-drawer-overlay admin-edit-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsAdminEditOpen(false)} 
          />
          <motion.div 
            className="family-drawer-panel admin-edit-drawer-panel"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          >
            {/* Drawer Header */}
            <div className="admin-edit-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={editingMember.photoUrl || 'https://ui-avatars.com/api/?name=Member&background=B85C38&color=fff&size=500'} 
                  alt="Thumb" 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #B85C38' }} 
                />
                <h3>
                  {editingMember.id && membersList.some(m => m.id === editingMember.id) ? (
                    isHi ? `${(editingMember.name_hi || editingMember.name_en)} का विवरण बदलें` : `Edit ${(editingMember.name_en || editingMember.name_hi)} details`
                  ) : (
                    isHi ? 'नया सदस्य जोड़ें' : 'Add New Member'
                  )}
                </h3>
              </div>
              <button className="drawer-close-btn" type="button" onClick={() => setIsAdminEditOpen(false)}>✕</button>
            </div>

            <form className="admin-edit-form-body" onSubmit={handleSaveMember}>
              <div className="admin-edit-drawer-content">
                {/* SECTION 1: Basic Info */}
                <div className="drawer-section-card">
                  <h4 className="drawer-section-title">
                    👤 {isHi ? 'व्यक्तिगत विवरण' : 'Basic Info'}
                  </h4>
                  <div className="drawer-form-grid-2col-toplabel">
                    {/* Row 1: Photo & Gender */}
                    <div className="admin-field-row photo-row">
                      <label className="field-label">{isHi ? 'फोटो' : 'Photo'}</label>
                      <div className="field-input-wrapper photo-upload-only-area">
                        <label className="admin-btn-file-upload">
                          📁 {isUploadingPhoto ? (isHi ? 'अपलोड...' : 'Uploading...') : (isHi ? 'फोटो अपलोड करें' : 'Upload Photo')}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={handlePhotoFileUpload}
                            disabled={isUploadingPhoto}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="admin-field-row">
                      <label className="field-label">{isHi ? 'लिंग' : 'Gender'}</label>
                      <div className="field-input-wrapper">
                        <select 
                          className="admin-select"
                          value={editingMember.gender || 'male'}
                          onChange={(e) => setEditingMember({ ...editingMember, gender: e.target.value })}
                        >
                          <option value="male">{isHi ? 'पुरुष' : 'Male'}</option>
                          <option value="female">{isHi ? 'महिला' : 'Female'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2: English Name & Hindi Name with Inline Auto Button */}
                    <div className="admin-field-row">
                      <label className="field-label">{isHi ? 'नाम (अंग्रेजी) *' : 'Name (English) *'}</label>
                      <div className="field-input-wrapper">
                        <input 
                          type="text" 
                          required
                          className="admin-input" 
                          value={editingMember.name_en || ''} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '')
                            setEditingMember({ ...editingMember, name_en: val })
                          }}
                          placeholder="e.g. Smt. Kaushalya Sharma"
                        />
                      </div>
                    </div>

                    <div className="admin-field-row">
                      <label className="field-label">{isHi ? 'नाम (हिंदी) *' : 'Name (Hindi) *'}</label>
                      <div className="field-input-wrapper input-with-inline-action hindi-input-wrapper">
                        <input 
                          type="text" 
                          required
                          className="admin-input" 
                          value={editingMember.name_hi || ''} 
                          onKeyDown={(e) => handleHindiKeyDown(e, editingMember.name_hi, (val) => setEditingMember({ ...editingMember, name_hi: val }))}
                          onPaste={(e) => handleKrutiDevPaste(e, editingMember.name_hi, (val) => setEditingMember({ ...editingMember, name_hi: val }))}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^\u0900-\u097F\s.-]/g, '')
                            setEditingMember({ ...editingMember, name_hi: val })
                          }}
                          placeholder="उदा. श्रीमती कौशल्या शर्मा"
                        />
                        <button 
                          type="button" 
                          className="btn-inline-auto-hindi inline-auto-hindi-btn"
                          onClick={() => {
                            const autoHi = autoTransliterateToHindi(editingMember.name_en)
                            if (autoHi) setEditingMember({ ...editingMember, name_hi: autoHi })
                          }}
                          title="Auto convert English name to Hindi Devanagari"
                        >
                          ✨ Auto
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SECTION 2: Important Dates & Status */}
                <div className="drawer-section-card">
                  <h4 className="drawer-section-title">
                    📅 {isHi ? 'महत्वपूर्ण तिथियां' : 'Important Dates & Status'}
                  </h4>
                  <div className="drawer-form-grid-2col-toplabel">
                    {/* Row 1: Birth Date & Anniversary */}
                    <div className="admin-field-row">
                      <label className="field-label">{isHi ? 'जन्म तिथि' : 'Birth Date'}</label>
                      <div className="field-input-wrapper">
                        <input 
                          type="date" 
                          min="1800-01-01"
                          max={todayDateMax}
                          className="admin-input date-picker-input" 
                          value={editingMember.birthDate || ''} 
                          onChange={(e) => {
                            const val = e.target.value
                            setEditingMember(prev => ({ ...prev, birthDate: val }))
                          }}
                          onBlur={(e) => {
                            const validVal = validateDateBounds(e.target.value)
                            setEditingMember(prev => ({ ...prev, birthDate: validVal }))
                          }}
                        />
                      </div>
                    </div>

                    <div className="admin-field-row">
                      <label className="field-label">{isHi ? 'विवाह वर्षगांठ' : 'Marriage Anniversary'}</label>
                      <div className="field-input-wrapper">
                        <input 
                          type="date" 
                          min="1800-01-01"
                          max={todayDateMax}
                          className="admin-input date-picker-input" 
                          value={editingMember.marriageAnniversaryDate || ''} 
                          onChange={(e) => {
                            const val = e.target.value
                            setEditingMember(prev => ({ ...prev, marriageAnniversaryDate: val }))
                          }}
                          onBlur={(e) => {
                            const validVal = validateDateBounds(e.target.value)
                            setEditingMember(prev => ({ ...prev, marriageAnniversaryDate: validVal }))
                          }}
                        />
                      </div>
                    </div>

                    {/* Row 2: Deceased Status & Date adjacent on single line */}
                    <div className="admin-field-row" style={{ gridColumn: 'span 2' }}>
                      <label className="field-label">{isHi ? 'स्मृतिशेष' : 'Deceased Status'}</label>
                      <div className="field-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '16px', minHeight: '38px' }}>
                        <label className="checkbox-label" style={{ whiteSpace: 'nowrap' }}>
                          <input 
                            type="checkbox" 
                            checked={!!editingMember.isDeceased}
                            onChange={(e) => setEditingMember({ ...editingMember, isDeceased: e.target.checked })}
                          />
                          <span>{isHi ? 'स्वर्गीय' : 'Deceased'}</span>
                        </label>
                        {editingMember.isDeceased && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {isHi ? 'पुण्यतिथि:' : 'Passing Date:'}
                            </span>
                            <input 
                              type="date" 
                              min="1800-01-01"
                              max={todayDateMax}
                              className="admin-input date-picker-input" 
                              value={editingMember.deathDate || ''} 
                              onChange={(e) => {
                                const val = e.target.value
                                setEditingMember(prev => ({ ...prev, deathDate: val }))
                              }}
                              onBlur={(e) => {
                                const validVal = validateDateBounds(e.target.value)
                                setEditingMember(prev => ({ ...prev, deathDate: validVal }))
                              }}
                              style={{ flex: 1 }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Contact & Social */}
                <div className="drawer-section-card">
                  <h4 className="drawer-section-title">
                    📞 {isHi ? 'संपर्क एवं सोशल' : 'Contact & Social'}
                  </h4>
                  <div className="drawer-form-grid-2col-toplabel">
                    {/* Row 1: Phone & WhatsApp */}
                    <div className="admin-field-row">
                      <label className="field-label">{isHi ? 'फ़ोन नंबर' : 'Phone Number'}</label>
                      <div className="field-input-wrapper phone-input-group">
                        <span className="phone-prefix-addon">+</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          maxLength={4}
                          className="country-code-input" 
                          value={editingMember.countryCode || '91'} 
                          onChange={(e) => {
                            const rawDigits = e.target.value.replace(/\D/g, '')
                            setEditingMember(prev => ({
                              ...prev,
                              countryCode: rawDigits,
                              whatsappCountryCode: whatsappSameAsPhone ? rawDigits : prev.whatsappCountryCode
                            }))
                          }}
                        />
                        <input 
                          type="text" 
                          inputMode="numeric"
                          maxLength={10}
                          className="admin-input phone-number-input" 
                          value={editingMember.phone || ''} 
                          onChange={(e) => {
                            const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setEditingMember(prev => ({
                              ...prev,
                              phone: rawDigits,
                              whatsappPhone: whatsappSameAsPhone ? rawDigits : prev.whatsappPhone
                            }))
                          }}
                          placeholder="98290 12345"
                        />
                      </div>
                    </div>

                    <div className="admin-field-row">
                      <div className="field-label-wrapper" style={{ display: 'flex', flexDirection: 'column', minWidth: '150px', flexShrink: 0 }}>
                        <label className="field-label" style={{ minWidth: 'auto', marginBottom: '2px' }}>WhatsApp:</label>
                        <label className="checkbox-label" style={{ fontSize: '0.72rem', fontWeight: 500, color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="checkbox" 
                            checked={whatsappSameAsPhone}
                            onChange={(e) => {
                              const checked = e.target.checked
                              setWhatsappSameAsPhone(checked)
                              if (checked) {
                                setEditingMember(prev => ({
                                  ...prev,
                                  whatsappPhone: prev.phone || '',
                                  whatsappCountryCode: prev.countryCode || '91'
                                }))
                              }
                            }}
                          />
                          <span>{isHi ? 'फ़ोन के समान' : 'Same as Phone'}</span>
                        </label>
                      </div>
                      <div className="field-input-wrapper phone-input-group">
                        <span className="phone-prefix-addon">+</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          maxLength={4}
                          disabled={whatsappSameAsPhone}
                          className="country-code-input" 
                          value={whatsappSameAsPhone ? (editingMember.countryCode || '91') : (editingMember.whatsappCountryCode || '91')} 
                          onChange={(e) => {
                            if (whatsappSameAsPhone) return
                            const rawDigits = e.target.value.replace(/\D/g, '')
                            setEditingMember(prev => ({ ...prev, whatsappCountryCode: rawDigits }))
                          }}
                          style={whatsappSameAsPhone ? { opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#F3F4F6' } : {}}
                        />
                        <input 
                          type="text" 
                          inputMode="numeric"
                          maxLength={10}
                          disabled={whatsappSameAsPhone}
                          className="admin-input phone-number-input" 
                          value={whatsappSameAsPhone ? (editingMember.phone || '') : (editingMember.whatsappPhone || '')} 
                          onChange={(e) => {
                            if (whatsappSameAsPhone) return
                            const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setEditingMember(prev => ({ ...prev, whatsappPhone: rawDigits }))
                          }}
                          placeholder="98290 99999"
                          style={whatsappSameAsPhone ? { opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#F3F4F6' } : {}}
                        />
                      </div>
                    </div>

                    {/* Row 2: Facebook URL */}
                    <div className="admin-field-row" style={{ gridColumn: 'span 2' }}>
                      <label className="field-label">{isHi ? 'फेसबुक लिंक' : 'Facebook Link'}</label>
                      <div className="field-input-wrapper">
                        <input 
                          type="url" 
                          className="admin-input" 
                          value={editingMember.facebookUrl || ''} 
                          onChange={(e) => setEditingMember({ ...editingMember, facebookUrl: e.target.value })}
                          onBlur={(e) => {
                            let val = e.target.value.trim()
                            if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                              val = `https://${val}`
                              setEditingMember(prev => ({ ...prev, facebookUrl: val }))
                            }
                          }}
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: Family Relationships */}
                <div className="drawer-section-card">
                  <h4 className="drawer-section-title">
                    🌳 {isHi ? 'पारिवारिक रिश्ते' : 'Family Relationships'}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <CompactInlineMemberPicker 
                      label={isHi ? 'माता-पिता चुनें' : 'Select Parents'}
                      membersList={membersList}
                      selectedIds={editingMember.parentIds || []}
                      onChange={(ids) => {
                        const newChildren = (editingMember.childrenIds || []).filter(id => !ids.includes(id))
                        const newSpouse = (editingMember.spouseIds || []).filter(id => !ids.includes(id))
                        setEditingMember(prev => ({
                          ...prev,
                          parentIds: ids,
                          childrenIds: newChildren,
                          spouseIds: newSpouse
                        }))
                      }}
                      currentMemberId={editingMember.id}
                      excludedIds={[...(editingMember.childrenIds || []), ...(editingMember.spouseIds || [])]}
                      isHi={isHi}
                    />

                    <CompactInlineMemberPicker 
                      label={isHi ? 'जीवनसाथी चुनें' : 'Select Spouse'}
                      membersList={membersList}
                      selectedIds={editingMember.spouseIds || []}
                      onChange={(ids) => {
                        const newParents = (editingMember.parentIds || []).filter(id => !ids.includes(id))
                        const newChildren = (editingMember.childrenIds || []).filter(id => !ids.includes(id))
                        setEditingMember(prev => ({
                          ...prev,
                          spouseIds: ids,
                          parentIds: newParents,
                          childrenIds: newChildren
                        }))
                      }}
                      currentMemberId={editingMember.id}
                      excludedIds={[...(editingMember.parentIds || []), ...(editingMember.childrenIds || [])]}
                      isHi={isHi}
                    />

                    <CompactInlineMemberPicker 
                      label={isHi ? 'संतान चुनें' : 'Select Children'}
                      membersList={membersList}
                      selectedIds={editingMember.childrenIds || []}
                      onChange={(ids) => {
                        const newParents = (editingMember.parentIds || []).filter(id => !ids.includes(id))
                        const newSpouse = (editingMember.spouseIds || []).filter(id => !ids.includes(id))
                        setEditingMember(prev => ({
                          ...prev,
                          childrenIds: ids,
                          parentIds: newParents,
                          spouseIds: newSpouse
                        }))
                      }}
                      currentMemberId={editingMember.id}
                      excludedIds={[...(editingMember.parentIds || []), ...(editingMember.spouseIds || [])]}
                      isHi={isHi}
                    />
                  </div>
                </div>
              </div>

              {/* Pinned Sticky Action Footer Bar */}
              <div className="admin-edit-drawer-footer">
                <div>
                  {editingMember.id && membersList.some(m => m.id === editingMember.id) && (
                    <button 
                      type="button" 
                      className="admin-btn-delete-footer"
                      onClick={() => {
                        const name = editingMember.name_en || editingMember.name_hi || 'this member'
                        if (window.confirm(isHi ? `क्या आप वाकई ${name} को हटाना चाहते हैं?` : `Are you sure you want to delete ${name}?`)) {
                          handleDeleteMember(editingMember.id)
                        }
                      }}
                    >
                      🗑️ {isHi ? 'सदस्य हटाएं' : 'Delete Member'}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="admin-btn-cancel-footer"
                    onClick={() => setIsAdminEditOpen(false)}
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>

                  <button type="submit" className="admin-btn-save-footer">
                    💾 {isHi ? 'सुरक्षित करें' : 'Save Member'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>,
        wrapperRef.current || document.body
      )}
    </div>
  )
}
