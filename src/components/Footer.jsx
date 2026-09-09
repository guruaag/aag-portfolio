import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import ContactModal from './ContactModal'
import FollowModal from './FollowModal'
import Toast from './Toast'
import ThankYouPopup from './ThankYouPopup'
import './Footer.css'

function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [toast, setToast] = useState(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showFollowModal, setShowFollowModal] = useState(false)
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsapp: ''
  })

  // Check if user is admin
  const isAdmin = localStorage.getItem('adminAuth') === 'true'

  // Load social links from settings
  useEffect(() => {
    loadSocialLinks()
    
    // Listen for custom events from Header menu
    const handleOpenFollowModal = () => {
      setShowFollowModal(true)
    }
    const handleOpenShareModal = () => {
      setShowShareMenu(true)
    }
    
    window.addEventListener('openFollowModal', handleOpenFollowModal)
    window.addEventListener('openShareModal', handleOpenShareModal)
    
    return () => {
      window.removeEventListener('openFollowModal', handleOpenFollowModal)
      window.removeEventListener('openShareModal', handleOpenShareModal)
    }
  }, [])

  const loadSocialLinks = async () => {
    try {
      const { data } = await supabase.from('settings').select('*')
      if (data) {
        const links = {}
        data.forEach(s => {
          if (['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'whatsapp'].includes(s.key)) {
            links[s.key] = s.value || ''
          }
        })
        setSocialLinks(links)
      }
    } catch (err) {
      console.error('Error loading social links:', err)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleShare = async (platform) => {
    const url = window.location.href
    const title = 'Guru Pratap Sharma | AAG'
    let shareUrl = ''

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          setToast('Link copied!')
          setTimeout(() => setToast(null), 2000)
          setShowShareMenu(false)
          return
        } catch (err) {
          setToast('Failed to copy link')
          return
        }
      default:
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      setShowShareMenu(false)
    }
  }

  return (
    <>
      <footer className="phoenix-footer">
        <div className="phoenix-footer-container">
          
          {/* Social Links Bar */}
          <div className="footer-social-links-bar">
            {socialLinks.whatsapp && (
              <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                📱 व्हाट्सएप (WhatsApp)
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                📘 फ़ेसबुक (Facebook)
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                📷 इंस्टाग्राम (Instagram)
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                ▶️ यूट्यूब (YouTube)
              </a>
            )}
          </div>

          <div className="footer-bottom-row">
            {/* Back Button - Only visible on detail pages */}
            {!['/', '/category/about', '/about', '/category/poems', '/poems', '/category/publications', '/publications', '/contact'].includes(location.pathname) && (
              <motion.button
                className="phoenix-footer-back-icon"
                onClick={handleBack}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={t('common.back')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </motion.button>
            )}

            {/* Copyright Note */}
            <div className="footer-copyright-note">
              © २०२६ गुरुप्रताप शर्मा 'आग' | सर्वाधिकार सुरक्षित | Auspicious Beginning
            </div>
          </div>

        </div>
      </footer>

      {/* Share Menu Modal */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            className="phoenix-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div
              className="phoenix-modal-content phoenix-share-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="phoenix-modal-header">
                <h3 className="phoenix-modal-title">{t('common.share')}</h3>
                <button className="phoenix-modal-close-btn" onClick={() => setShowShareMenu(false)} aria-label="Close">
                  ×
                </button>
              </div>
              <div className="phoenix-footer-share-buttons">
                <button className="phoenix-share-modal-btn" onClick={() => handleShare('facebook')}>Facebook</button>
                <button className="phoenix-share-modal-btn" onClick={() => handleShare('twitter')}>Twitter</button>
                <button className="phoenix-share-modal-btn" onClick={() => handleShare('whatsapp')}>WhatsApp</button>
                <button className="phoenix-share-modal-btn" onClick={() => handleShare('copy')}>Copy Link</button>
              </div>
              <button className="phoenix-modal-close-button" onClick={() => setShowShareMenu(false)}>
                {t('common.close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact & Follow Modals */}
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      <FollowModal 
        isOpen={showFollowModal} 
        onClose={() => setShowFollowModal(false)}
        socialLinks={socialLinks}
      />

      {toast && <Toast message={toast} />}
      {showThankYou && <ThankYouPopup onClose={() => setShowThankYou(false)} />}
    </>
  )
}

export default Footer

