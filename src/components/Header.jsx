import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import { getImageUrl } from '../lib/imageUtils'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoPath, setLogoPath] = useState(null)

  // Load logo from settings
  useEffect(() => {
    loadLogo()
    // Reload logo periodically in case it was updated
    const interval = setInterval(loadLogo, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadLogo = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'logo_path')
        .single()
      
      if (data?.value && data.value.trim() !== '') {
        setLogoPath(data.value)
      } else {
        // No logo uploaded, show text only
        setLogoPath(null)
      }
    } catch (err) {
      // Logo not set, show text only
      setLogoPath(null)
    }
  }

  // Scroll listener for header transformation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(newLang)
    localStorage.setItem('siteLanguage', newLang)
  }

  const menuItems = [
    { path: '/', label: t('nav.home') },
    { path: '/kavi-parichay.html', label: t('nav.about'), isHtml: true },
    { path: '/category/poems', label: t('nav.poems') },
    { path: '/category/publications', label: t('nav.publications') },
    { path: '/contact', label: t('nav.contact') }
  ]

  // Get logo URL - if it's a public path, use it directly, otherwise get from Supabase
  const logoUrl = logoPath 
    ? (logoPath.startsWith('/') ? logoPath : getImageUrl(logoPath))
    : '/logo.png' // Fallback to public logo

  const isAdminRoute = location.pathname.startsWith('/admin')

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminAuthTime')
    navigate('/admin')
  }

  return (
    <>
      <motion.header
        className={`phoenix-header ${isScrolled ? 'phoenix-header-scrolled' : ''}`}
        initial={false}
        animate={{
          height: isScrolled ? '60px' : '80px',
          backgroundColor: isScrolled ? 'rgba(250, 249, 246, 0.95)' : 'rgba(250, 249, 246, 1)',
          backdropFilter: isScrolled ? 'blur(10px)' : 'blur(0px)',
          boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : '0 2px 10px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="phoenix-header-container">
          {/* Logo/Title */}
          <motion.div
            className="phoenix-header-logo"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Logo Image - Show if logo exists in settings */}
            {logoPath && (
              <motion.img
                src={logoUrl}
                alt="Logo"
                className="phoenix-header-logo-image"
                animate={{
                  width: isScrolled ? '36px' : '48px',
                  height: isScrolled ? '36px' : '48px'
                }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  // If logo fails to load, hide image
                  e.target.style.display = 'none'
                }}
              />
            )}
            
            {/* Title - Always show alongside logo */}
            <motion.h1
              animate={{
                fontSize: isScrolled ? '0.875rem' : '1.225rem'
              }}
              transition={{ duration: 0.3 }}
              className="phoenix-header-title phoenix-header-title-inline"
            >
              गुरु प्रताप शर्मा <span className="phoenix-header-aag" style={{ color: '#F66E5E' }}>आग</span>
            </motion.h1>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="phoenix-header-nav-desktop">
            {menuItems.map((item) => (
              <motion.button
                key={item.path}
                className={`phoenix-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => {
                  if (item.isHtml) {
                    window.location.href = item.path
                  } else {
                    navigate(item.path)
                  }
                }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="phoenix-header-actions">
            {/* Language Switcher Button - Exact HI / EN as public site */}
            <motion.button
              className="btn-lang"
              onClick={toggleLanguage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={i18n.language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              style={{
                padding: '6px 16px',
                border: '1.5px solid #1E1B18',
                borderRadius: '20px',
                background: 'transparent',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              HI / EN
            </motion.button>

            {/* Logout Button when on Admin routes */}
            {isAdminRoute && location.pathname !== '/admin' && (
              <motion.button
                className="btn-lang btn-logout-nav"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Logout"
                style={{
                  padding: '6px 16px',
                  border: '1.5px solid #D95343',
                  borderRadius: '20px',
                  background: '#D95343',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Logout
              </motion.button>
            )}

            {/* Menu Button - Always visible */}
            <motion.button
              className="phoenix-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Off-Canvas Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="phoenix-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="phoenix-menu-offcanvas phoenix-menu-offcanvas-right"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="phoenix-menu-header">
                <h2>Menu</h2>
                <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                  ×
                </button>
              </div>
              <ul className="phoenix-menu-list">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.button
                      className={`phoenix-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => {
                        navigate(item.path)
                        setMenuOpen(false)
                      }}
                      whileHover={{ x: -10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.label}
                    </motion.button>
                  </motion.li>
                ))}
                
                {/* Action Buttons as Icons */}
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: menuItems.length * 0.1 }}
                >
                  <div className="phoenix-menu-actions">
                    <motion.button
                      className="phoenix-menu-action-icon"
                      onClick={() => {
                        navigate('/contact')
                        setMenuOpen(false)
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={t('nav.contact')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      className="phoenix-menu-action-icon"
                      onClick={() => {
                        // Follow modal will be handled by Footer component
                        setMenuOpen(false)
                        // Trigger follow modal via custom event
                        window.dispatchEvent(new CustomEvent('openFollowModal'))
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={t('footer.follow')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      className="phoenix-menu-action-icon"
                      onClick={() => {
                        setMenuOpen(false)
                        // Trigger share modal via custom event
                        window.dispatchEvent(new CustomEvent('openShareModal'))
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={t('common.share')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </motion.button>
                  </div>
                </motion.li>
                
                {/* Admin Button - Always show in menu for testing, can be hidden later */}
                <motion.li
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length + 1) * 0.1 }}
                >
                  <motion.button
                    className="phoenix-menu-item phoenix-menu-admin"
                    onClick={() => {
                      navigate('/admin')
                      setMenuOpen(false)
                    }}
                    whileHover={{ x: -10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Admin
                  </motion.button>
                </motion.li>
              </ul>
              <div className="phoenix-menu-footer">
                {/* Language Toggle Inside Menu */}
                <button
                  className="phoenix-lang-toggle phoenix-lang-toggle-menu"
                  onClick={toggleLanguage}
                >
                  <span className={i18n.language === 'en' ? 'active' : ''}>EN</span>
                  <span className="phoenix-lang-divider">|</span>
                  <span className={i18n.language === 'hi' ? 'active' : ''}>HI</span>
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
