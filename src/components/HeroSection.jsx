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

  const authorImageUrl = aboutContent?.photo_path ? getImageUrl(aboutContent.photo_path) : null
  const authorName = i18n.language === 'hi' ? 'गुरु प्रताप शर्मा' : 'Guru Pratap Sharma'
  const penName = i18n.language === 'hi' ? 'आग' : 'AAG'
  const tagline = i18n.language === 'hi' ? heroTagline.hi : heroTagline.en

  return (
    <section className="phoenix-hero">
      <div className="phoenix-hero-background">
        {authorImageUrl && (
          <motion.div
            className="phoenix-hero-image-wrapper"
            style={{ y }}
          >
            <motion.img
              src={authorImageUrl}
              alt={authorName}
              className="phoenix-hero-image"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </motion.div>
        )}
        <div className="phoenix-hero-overlay" />
      </div>
      
      <motion.div
        className="phoenix-hero-content"
        style={{ opacity }}
      >
        <motion.div
          className="phoenix-hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="phoenix-hero-title phoenix-hero-title-inline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {authorName} <span className="phoenix-hero-aag">{penName}</span>
          </motion.h1>
          <motion.p
            className="phoenix-hero-tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {tagline}
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection

