import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SocialShare from './SocialShare'
import Toast from './Toast'
import ThankYouPopup from './ThankYouPopup'
import './Footer.css'

function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [toast, setToast] = useState(null)
  const [showThankYou, setShowThankYou] = useState(false)

  // Check if user is admin (from localStorage - for security, this should be server-side)
  const isAdmin = localStorage.getItem('adminAuth') === 'true'

  const handleBack = () => {
    navigate('/')
  }

  const handleThankYou = () => {
    setShowThankYou(true)
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLang)
    localStorage.setItem('siteLanguage', newLang)
  }

  const handleAdmin = (e) => {
    e.preventDefault()
    navigate('/admin')
  }

  return (
    <>
      <motion.footer
        className="phoenix-footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="phoenix-footer-container">
          {/* Left: Back Button */}
          <motion.button
            className="phoenix-btn phoenix-btn-ghost"
            onClick={handleBack}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('common.back')}
          </motion.button>

          {/* Center: Thank You */}
          <div className="phoenix-footer-center">
            <motion.button
              className="phoenix-btn phoenix-btn-ghost"
              onClick={handleThankYou}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('footer.thankYou')}
            </motion.button>
            {/* Hidden admin link - only visible to admins or via direct URL */}
            {isAdmin && (
              <a
                href="/admin"
                onClick={handleAdmin}
                className="phoenix-admin-link"
                aria-label="Admin"
              >
                admin
              </a>
            )}
          </div>

          {/* Right: Language Toggle & Share */}
          <div className="phoenix-footer-right">
            <motion.button
              className="phoenix-lang-toggle phoenix-lang-toggle-footer"
              onClick={toggleLanguage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={i18n.language === 'en' ? 'active' : ''}>EN</span>
              <span className="phoenix-lang-divider">|</span>
              <span className={i18n.language === 'hi' ? 'active' : ''}>HI</span>
            </motion.button>
          </div>
        </div>
      </motion.footer>

      {/* Social Share Floating Button (Mobile) */}
      <SocialShare url={window.location.href} title="Guru Pratap Sharma | AAG" />

      {toast && <Toast message={toast} />}
      {showThankYou && <ThankYouPopup onClose={() => setShowThankYou(false)} />}
    </>
  )
}

export default Footer
