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
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Check if user is admin (from localStorage - for security, this should be server-side)
  const isAdmin = localStorage.getItem('adminAuth') === 'true'

  const handleBack = () => {
    navigate('/')
  }

  const handleThankYou = () => {
    setShowThankYou(true)
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

          {/* Right: Share Button */}
          <div className="phoenix-footer-right">
            <motion.button
              className="phoenix-btn phoenix-btn-outline"
              onClick={() => setShowShareMenu(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('common.share')}
            </motion.button>
          </div>
        </div>
      </motion.footer>
      {/* Social Share - Show when share button clicked or on mobile */}
      {showShareMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowShareMenu(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '300px',
              width: '100%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Share</h3>
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '12px', background: '#f0f0f0', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Guru Pratap Sharma | AAG')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '12px', background: '#f0f0f0', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}
              >
                Twitter
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent('Guru Pratap Sharma | AAG ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '12px', background: '#f0f0f0', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}
              >
                WhatsApp
              </a>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href)
                    alert('Link copied!')
                    setShowShareMenu(false)
                  } catch (err) {
                    alert('Failed to copy link')
                  }
                }}
                style={{ padding: '12px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Copy Link
              </button>
            </div>
            <button
              onClick={() => setShowShareMenu(false)}
              style={{ marginTop: '16px', padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Social Share Floating Button (Mobile) */}
      <SocialShare url={window.location.href} title="Guru Pratap Sharma | AAG" />

      {toast && <Toast message={toast} />}
      {showThankYou && <ThankYouPopup onClose={() => setShowThankYou(false)} />}
    </>
  )
}

export default Footer
