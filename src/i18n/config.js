import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Standardized UI Translation Resources matching user's Final Translation Dictionary
const resources = {
 en: {
 translation: {
 // 1. Admin About & Hero
 about_hero: {
 section_header: 'Biography & Hero',
 subsection_header: 'Banner Details',
 hero_tag_pill: 'Hero Tag',
 poet_full_name: 'Full Name *',
 hero_subtitle: 'Subtitle *',
 badge_tag: 'Badge Tag',
 quote_attribution: 'Quote Credit',
 overview_bio: 'Short Bio',
 photo_upload: 'Profile Image'
 },
 // 2. Admin Timeline & Awards
 timeline: {
 section_header: 'Timeline',
 year_period: 'Year',
 milestone_title: 'Title',
 description: 'Details',
 sort_order: 'Order'
 },
 awards: {
 section_header: 'Awards',
 name: 'Award Name',
 year: 'Year',
 organization: 'Organization'
 },
 // 3. Admin Home Manager
 home: {
 section_header: 'Home Setup',
 hero_title: 'Main Heading',
 hero_subtitle: 'Subheading',
 bio_excerpt: 'Brief Intro',
 single_row_limit: 'Max Items'
 },
 // 4. Admin Poetry Manager
 poetry: {
 section_header: 'Poetry Archive',
 title: 'Poem Title *',
 context_lines: 'Context *',
 stanzas: 'Poem Text *',
 krutidev_convert: 'Kruti Dev > Unicode',
 sort_order: 'Order',
 audio_link: 'Audio Link',
 category_select: 'Category'
 },
 // 5. Admin Publications Manager
 pub: {
 section_header: 'Publications',
 title: 'Book Title *',
 overview: 'Summary',
 cover_upload: 'Cover Photo',
 sample_stanzas: 'Sample Stanzas',
 purchase_link: 'Buy Link',
 price: 'Price',
 publisher: 'Publisher'
 },
 // 6. Admin Contact & Inbox
 contact: {
 office_address: 'Address',
 phone_whatsapp: 'Phone / WhatsApp',
 email: 'Email'
 },
 inbox: {
 sender_col: 'From',
 date_col: 'Date',
 reply_action: 'Reply',
 mark_read: 'Mark Read',
 delete_action: 'Delete'
 },
 // 7. PageMaker Canvas (PM5 Desk)
 pm5: {
 layout_controls: 'Page Control',
 apply: 'Apply',
 exit: 'Exit',
 new_page: 'Add Page',
 krutidev_btn: ' Kruti Dev > Unicode',
 autoflow_indicator: 'Auto-Flow'
 },
 // 8. Public Site Navigation & Actions
 public_nav: {
 home: 'Home',
 about: 'Biography',
 poetry: 'Poetry',
 publications: 'Books',
 contact: 'Contact'
 },
 public_actions: {
 read_more: 'Read More',
 buy_now: 'Buy Book',
 sample: 'Preview'
 },
 public_footer: {
 copyright: '© All Rights Reserved'
 },

 // Legacy fallback keys
 nav: {
 home: 'Home',
 about: 'Biography',
 poems: 'Poetry',
 publications: 'Books',
 contact: 'Contact',
 settings: 'Settings'
 },
 common: {
 readMore: 'Read More',
 readNow: 'Read Now',
 back: 'Back',
 share: 'Share',
 close: 'Close',
 menu: 'Menu'
 }
 }
 },
 hi: {
 translation: {
 // 1. Admin About & Hero
 about_hero: {
 section_header: 'कवि परिचय व बैनर',
 subsection_header: 'बैनर जानकारी',
 hero_tag_pill: 'हीरो टैग',
 poet_full_name: 'नाम *',
 hero_subtitle: 'उपशीर्षक *',
 badge_tag: 'बैज टैग',
 quote_attribution: 'उद्धरण श्रेय',
 overview_bio: 'संक्षिप्त परिचय',
 photo_upload: 'प्रोफाइल फोटो'
 },
 // 2. Admin Timeline & Awards
 timeline: {
 section_header: 'समयरेखा',
 year_period: 'वर्ष',
 milestone_title: 'मुख्य घटना',
 description: 'विवरण',
 sort_order: 'क्रम'
 },
 awards: {
 section_header: 'सम्मान व पुरस्कार',
 name: 'पुरस्कार',
 year: 'वर्ष',
 organization: 'संस्था'
 },
 // 3. Admin Home Manager
 home: {
 section_header: 'होम सेटअप',
 hero_title: 'मुख्य शीर्षक',
 hero_subtitle: 'उपशीर्षक',
 bio_excerpt: 'परिचय',
 single_row_limit: 'सीमा'
 },
 // 4. Admin Poetry Manager
 poetry: {
 section_header: 'काव्य संग्रह',
 title: 'कविता शीर्षक *',
 context_lines: 'परिचय पंक्ति *',
 stanzas: 'कविता पाठ *',
 krutidev_convert: 'कृतिदेव > यूनिकोड',
 sort_order: 'क्रम',
 audio_link: 'ऑडियो लिंक',
 category_select: 'श्रेणी'
 },
 // 5. Admin Publications Manager
 pub: {
 section_header: 'प्रकाशन',
 title: 'पुस्तक शीर्षक *',
 overview: 'विवरण',
 cover_upload: 'कवर फोटो',
 sample_stanzas: 'काव्य अंश',
 purchase_link: 'खरीद लिंक',
 price: 'कीमत',
 publisher: 'प्रकाशक'
 },
 // 6. Admin Contact & Inbox
 contact: {
 office_address: 'पता',
 phone_whatsapp: 'फोन / व्हाट्सएप',
 email: 'ईमेल'
 },
 inbox: {
 sender_col: 'प्रेषक',
 date_col: 'तिथि',
 reply_action: 'उत्तर दें',
 mark_read: 'पढ़ा गया',
 delete_action: 'हटाएं'
 },
 // 7. PageMaker Canvas (PM5 Desk)
 pm5: {
 layout_controls: 'पेज कंट्रोल',
 apply: 'लागू करें',
 exit: 'बाहर निकलें',
 new_page: 'नया पेज',
 krutidev_btn: ' कृतिदेव > यूनिकोड',
 autoflow_indicator: 'ऑटो-फ्लो'
 },
 // 8. Public Site Navigation & Actions
 public_nav: {
 home: 'होम',
 about: 'परिचय',
 poetry: 'कविताएं',
 publications: 'पुस्तकें',
 contact: 'संपर्क'
 },
 public_actions: {
 read_more: 'पढ़ें',
 buy_now: 'खरीदें',
 sample: 'अंश देखें'
 },
 public_footer: {
 copyright: '© सर्वाधिकार सुरक्षित'
 },

 // Legacy fallback keys
 nav: {
 home: 'होम',
 about: 'परिचय',
 poems: 'कविताएं',
 publications: 'पुस्तकें',
 contact: 'संपर्क',
 settings: 'सेटिंग्स'
 },
 common: {
 readMore: 'पढ़ें',
 readNow: 'अभी पढ़ें',
 back: 'वापस',
 share: 'साझा करें',
 close: 'बंद करें',
 menu: 'मेनू'
 }
 }
 }
}

i18n
 .use(initReactI18next)
 .init({
 resources,
 lng: localStorage.getItem('siteLanguage') || 'hi', // Default to Hindi
 fallbackLng: 'en',
 interpolation: {
 escapeValue: false
 },
 react: {
 useSuspense: false
 }
 })

export default i18n
