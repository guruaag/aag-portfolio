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
          <div className="footer-single-row">
            
            {/* Left: Copyright Note */}
            <div className="footer-copyright-note">
              © २०२६ गुरुप्रताप शर्मा 'आग' | सर्वाधिकार सुरक्षित | Auspicious Beginning
            </div>

            {/* Middle: SVG Social Icon Buttons */}
            <div className="footer-social-icons-wrapper">
              <a href={socialLinks.whatsapp || "#"} target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>

              <a href={socialLinks.facebook || "#"} target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a href={socialLinks.instagram || "#"} target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>

              <a href={socialLinks.youtube || "#"} target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {/* Right: Relocated Admin Link */}
            <div>
              <a href="/admin" className="footer-admin-link">प्रशासन (Admin)</a>
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

