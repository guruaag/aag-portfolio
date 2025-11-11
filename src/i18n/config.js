import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        publications: 'Publications',
        about: 'About',
        poems: 'Poems',
        contact: 'Contact'
      },
      // Common
      common: {
        readMore: 'Read More',
        readNow: 'Read Now',
        back: 'Back',
        share: 'Share',
        close: 'Close',
        menu: 'Menu'
      },
      // Home
      home: {
        title: 'Guru Pratap Sharma',
        subtitle: 'AAG',
        welcome: 'Welcome',
        explore: 'Explore the literary works'
      },
      // Publications
      publications: {
        title: 'My Publications',
        subtitle: 'A collection of literary works',
        viewDetails: 'View Details'
      },
      // About
      about: {
        title: 'About',
        mission: 'Mission'
      },
      // Footer
      footer: {
        thankYou: 'Thank You',
        follow: 'Follow'
      }
    }
  },
  hi: {
    translation: {
      // Navigation
      nav: {
        home: 'होम',
        publications: 'प्रकाशन',
        about: 'के बारे में',
        poems: 'कविताएं',
        contact: 'संपर्क'
      },
      // Common
      common: {
        readMore: 'और पढ़ें',
        readNow: 'अभी पढ़ें',
        back: 'वापस',
        share: 'साझा करें',
        close: 'बंद करें',
        menu: 'मेनू'
      },
      // Home
      home: {
        title: 'गुरु प्रताप शर्मा',
        subtitle: 'आग',
        welcome: 'स्वागत है',
        explore: 'साहित्यिक कृतियों का अन्वेषण करें'
      },
      // Publications
      publications: {
        title: 'मेरे प्रकाशन',
        subtitle: 'साहित्यिक कृतियों का संग्रह',
        viewDetails: 'विवरण देखें'
      },
      // About
      about: {
        title: 'के बारे में',
        mission: 'मिशन'
      },
      // Footer
      footer: {
        thankYou: 'धन्यवाद',
        follow: 'फॉलो करें'
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('siteLanguage') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })

export default i18n

