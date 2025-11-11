import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
    { path: '/category/publications', label: t('nav.publications') },
    { path: '/category/about', label: t('nav.about') },
    { path: '/category/poems', label: t('nav.poems') }
  ]

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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.h1
              animate={{
                fontSize: isScrolled ? '1.25rem' : '1.75rem'
              }}
              transition={{ duration: 0.3 }}
              className="phoenix-header-title"
            >
              GURU PRATAP SHARMA
            </motion.h1>
            <motion.span
              animate={{
                fontSize: isScrolled ? '0.75rem' : '0.875rem',
                opacity: isScrolled ? 0.7 : 1
              }}
              transition={{ duration: 0.3 }}
              className="phoenix-header-subtitle"
            >
              AAG
            </motion.span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="phoenix-header-nav-desktop">
            {menuItems.map((item) => (
              <motion.button
                key={item.path}
                className={`phoenix-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="phoenix-header-actions">
            {/* Language Toggle */}
            <motion.button
              className="phoenix-lang-toggle"
              onClick={toggleLanguage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={i18n.language === 'en' ? 'active' : ''}>EN</span>
              <span className="phoenix-lang-divider">|</span>
              <span className={i18n.language === 'hi' ? 'active' : ''}>HI</span>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              className="phoenix-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="phoenix-menu-line"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="phoenix-menu-line"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="phoenix-menu-line"
              />
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
              className="phoenix-menu-offcanvas"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.button
                      className={`phoenix-menu-item ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => {
                        navigate(item.path)
                        setMenuOpen(false)
                      }}
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.label}
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
              <div className="phoenix-menu-footer">
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
