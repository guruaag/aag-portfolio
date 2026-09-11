import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../lib/imageUtils'
import { getAboutContent, supabase, getAllSettings } from '../lib/supabaseClient'
import './HeroSection.css'

function HeroSection() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [aboutContent, setAboutContent] = useState(null)
  const [heroConfig, setHeroConfig] = useState({
    title: 'अग्नि कलश',
    subtitle: '"हिंदी काव्य और ओजस्वी चेतना की अमर गाथा"',
    imageUrl: '',
    ctaPrimaryLabel: 'रचनाएं पढ़ें',
    ctaPrimaryUrl: '/kavya-sangrah',
    ctaSecondaryLabel: 'परिचय',
    ctaSecondaryUrl: '/parichay'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHeroData()
  }, [])

  const loadHeroData = async () => {
    try {
      setLoading(true)
      const [aboutData, settingsList] = await Promise.all([
        getAboutContent().catch(() => null),
        getAllSettings().catch(() => [])
      ])

      setAboutContent(aboutData)

      const sMap = {}
      if (Array.isArray(settingsList)) {
        settingsList.forEach(s => { if (s && s.key) sMap[s.key] = s.value })
      }

      setHeroConfig({
        title: sMap.home_hero_title || 'अग्नि कलश',
        subtitle: sMap.home_hero_subtitle || '"हिंदी काव्य और ओजस्वी चेतना की अमर गाथा"',
        imageUrl: sMap.home_hero_image_url || '',
        ctaPrimaryLabel: sMap.home_cta_primary_label || 'रचनाएं पढ़ें',
        ctaPrimaryUrl: sMap.home_cta_primary_url || '/kavya-sangrah',
        ctaSecondaryLabel: sMap.home_cta_secondary_label || 'परिचय',
        ctaSecondaryUrl: sMap.home_cta_secondary_url || '/parichay'
      })
    } catch (err) {
      console.error('Error loading hero data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  const authorImageUrl = heroConfig.imageUrl
    ? getImageUrl(heroConfig.imageUrl)
    : (aboutContent?.photo_path ? getImageUrl(aboutContent.photo_path) : '/logo.png')

  const authorName = i18n.language === 'hi' ? 'गुरु प्रताप शर्मा' : 'Guru Pratap Sharma'
  const penName = i18n.language === 'hi' ? 'आग' : 'AAG'
  const isHi = i18n.language === 'hi'

  const handleCtaClick = (url) => {
    if (!url) return
    if (url.startsWith('/')) {
      navigate(url)
    } else if (url.startsWith('#')) {
      const el = document.querySelector(url)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = url
    }
  }

  return (
    <section className="phoenix-hero leona-hero">
      <div className="phoenix-container">
        <div className="leona-hero-grid">
          
          {/* 1. Left: 3D Featured Book Showcase */}
          <motion.div 
            className="leona-hero-book-showcase"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="leona-book-cover-3d-wrapper">
              <span className="leona-book-badge-award">★ {isHi ? 'विशेष संकलन' : 'Featured Collection'}</span>
              <img
                src={authorImageUrl}
                alt={heroConfig.title}
                className="leona-book-cover-3d"
                onError={(e) => {
                  e.target.src = '/logo.png'
                }}
              />
            </div>
          </motion.div>

          {/* 2. Right: Hero Content & CTAs */}
          <motion.div
            className="leona-hero-content-meta"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="leona-featured-tag">
              🔥 {isHi ? 'कवि' : 'Poet'} {authorName} <span className="phoenix-hero-aag">{penName}</span>
            </span>

            <h1 className="leona-hero-title">
              {heroConfig.title}
            </h1>

            <div className="leona-hero-subtitle">
              {heroConfig.subtitle}
            </div>

            <p className="leona-hero-description">
              {isHi
                ? "कवि गुरुप्रताप शर्मा 'आग' का कालजयी काव्य संग्रह 'अग्नि कलश' राष्ट्रभक्ति, मानवीय संवेदनाओं और ओजस्वी छंदों का अनूठा संगम है।"
                : "Renowned poet Guru Pratap Sharma 'Aag' presents a masterwork of fiery patriotic verse, human emotion, and timeless poetic rhythm."}
            </p>

            <div className="leona-hero-actions">
              <motion.button
                className="btn-primary-terracotta"
                onClick={() => handleCtaClick(heroConfig.ctaPrimaryUrl)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                🛒 {heroConfig.ctaPrimaryLabel}
              </motion.button>

              <motion.button
                className="btn-secondary-teal"
                onClick={() => handleCtaClick(heroConfig.ctaSecondaryUrl)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                📖 {heroConfig.ctaSecondaryLabel}
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default HeroSection
