import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getImageUrl } from '../lib/imageUtils'
import { getAboutContent, supabase } from '../lib/supabaseClient'
import './HeroSection.css'

function HeroSection() {
  const { t, i18n } = useTranslation()
  const [aboutContent, setAboutContent] = useState(null)
  const [heroTagline, setHeroTagline] = useState({ en: '', hi: '' })
  const [loading, setLoading] = useState(true)
  const { scrollY } = useScroll()
  
  // Parallax effect: image moves slower than scroll
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    loadAbout()
    loadHeroTagline()
  }, [])

  const loadAbout = async () => {
    try {
      const data = await getAboutContent()
      setAboutContent(data)
    } catch (err) {
      console.error('Error loading about:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadHeroTagline = async () => {
    try {
      const { data: enData } = await supabase.from('settings').select('value').eq('key', 'hero_tagline_en').single()
      const { data: hiData } = await supabase.from('settings').select('value').eq('key', 'hero_tagline_hi').single()
      setHeroTagline({
        en: enData?.value || 'Renowned for his fiery literary works',
        hi: hiData?.value || 'साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध'
      })
    } catch (err) {
      console.error('Error loading hero tagline:', err)
      setHeroTagline({
        en: 'Renowned for his fiery literary works',
        hi: 'साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध'
      })
    }
  }

  if (loading) return null

  const authorImageUrl = aboutContent?.photo_path ? getImageUrl(aboutContent.photo_path) : '/logo.png'
  const authorName = i18n.language === 'hi' ? 'गुरु प्रताप शर्मा' : 'Guru Pratap Sharma'
  const penName = i18n.language === 'hi' ? 'आग' : 'AAG'
  const isHi = i18n.language === 'hi'

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
                alt="अग्नि कलश"
                className="leona-book-cover-3d"
                onError={(e) => {
                  e.target.src = '/logo.png'
                }}
              />
            </div>
          </motion.div>

          {/* 2. Right: Book Metadata & CTAs */}
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
              {isHi ? 'अग्नि कलश' : 'Agni Kalash'}
            </h1>

            <div className="leona-hero-subtitle">
              {isHi ? '"हिंदी काव्य और ओजस्वी चेतना की अमर गाथा"' : '"Timeless Odyssey of Hindi Poetry & Fire"'}
            </div>

            <p className="leona-hero-description">
              {isHi
                ? 'कवि गुरुप्रताप शर्मा \'आग\' का कालजयी काव्य संग्रह \'अग्नि कलश\' राष्ट्रभक्ति, मानवीय संवेदनाओं और ओजस्वी छंदों का अनूठा संगम है।'
                : 'Renowned poet Guru Pratap Sharma \'Aag\' presents a masterwork of fiery patriotic verse, human emotion, and timeless poetic rhythm.'}
            </p>

            <div className="leona-hero-actions">
              <motion.button
                className="btn-primary-terracotta"
                onClick={() => {
                  const pubsSec = document.querySelector('.phoenix-publications-section-home') || document.querySelector('.phoenix-poems-section-home')
                  if (pubsSec) pubsSec.scrollIntoView({ behavior: 'smooth' })
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                🛒 {isHi ? 'अभी पुस्तक प्राप्त करें' : 'Explore Book Collection'}
              </motion.button>

              <motion.button
                className="btn-secondary-teal"
                onClick={() => {
                  const poemsSec = document.querySelector('.phoenix-poems-section-home')
                  if (poemsSec) poemsSec.scrollIntoView({ behavior: 'smooth' })
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                📖 {isHi ? 'काव्य पाठ पढ़ें' : 'Read Sample Poems'}
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default HeroSection

