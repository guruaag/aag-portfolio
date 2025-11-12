import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import { applyTheme, themes, getCurrentTheme } from '../lib/themeSystem'
import './Settings.css'

function Settings() {
  const { t } = useTranslation()
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme())
  const [loading, setLoading] = useState(false)

  const handleThemeChange = (themeKey) => {
    setCurrentTheme(themeKey)
    applyTheme(themeKey)
    // Save to settings
    supabase.from('settings').upsert({
      key: 'site_theme',
      value: themeKey,
      display_label: 'Site Theme'
    }).catch(err => console.error('Error saving theme:', err))
  }

  return (
    <>
      <Helmet>
        <title>Settings - Guru Pratap Sharma | AAG</title>
      </Helmet>

      <motion.div
        className="phoenix-settings"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="phoenix-content">
          <h1 className="phoenix-settings-title">{t('nav.settings')}</h1>

          <div className="phoenix-settings-section">
            <h2 className="phoenix-settings-section-title">Color Theme</h2>
            <p className="phoenix-settings-section-desc">Choose a color theme for the website</p>
            
            <div className="phoenix-theme-grid">
              {Object.entries(themes).map(([key, theme]) => (
                <motion.button
                  key={key}
                  className={`phoenix-theme-card ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => handleThemeChange(key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="phoenix-theme-preview">
                    <div 
                      className="phoenix-theme-bg" 
                      style={{ background: theme.background }}
                    />
                    <div 
                      className="phoenix-theme-accent" 
                      style={{ background: theme.accent }}
                    />
                  </div>
                  <span className="phoenix-theme-name">{theme.name}</span>
                  {currentTheme === key && (
                    <span className="phoenix-theme-check">✓</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Settings

