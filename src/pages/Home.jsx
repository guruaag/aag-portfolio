import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { getCategories, getAboutContent, getPublications, getPoems } from '../lib/supabaseClient'
import { getImageUrl } from '../lib/imageUtils'
import PublicationCard from '../components/PublicationCard'
import HeroSection from '../components/HeroSection'
// VerseOfTheDay component removed - was showing random poem verses on homepage
import ImageModal from '../components/ImageModal'
import './Home.css'

function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [aboutContent, setAboutContent] = useState(null)
  const [publications, setPublications] = useState([])
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageModal, setImageModal] = useState({ isOpen: false, url: null, alt: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [catsData, aboutData, pubsData, poemsData] = await Promise.all([
        getCategories(),
        getAboutContent(),
        getPublications(),
        getPoems()
      ])

      setCategories(catsData)
      setAboutContent(aboutData)
      setPublications(pubsData.slice(0, 5))
      setPoems(poemsData.slice(0, 5))
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Content not available')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="phoenix-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="phoenix-spinner"
        />
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="phoenix-error">
        <p>{error}</p>
        <button className="phoenix-btn phoenix-btn-outline" onClick={loadData}>
          Refresh
        </button>
      </div>
    )
  }

  // Find categories - only get the first active one of each type
  const aboutCategory = categories.find(c => c.content_type === 'about' && c.is_active !== false)
  const publicationsCategory = categories.find(c => c.content_type === 'publications' && c.is_active !== false)
  const poemsCategory = categories.find(c => c.content_type === 'writings' && c.is_active !== false)
  const aboutImageUrl = aboutContent?.photo_path ? getImageUrl(aboutContent.photo_path) : null

  return (
    <>
      <Helmet>
        <title>Hindi Kavi Guru Pratap Sharma 'Aag' | Hindi Sahitya | Aag Poetry</title>
        <meta name="description" content={aboutContent?.truncated_preview || 'Renowned Hindi poet Guru Pratap Sharma, known by pen name Aag. Explore his literary works, poems, and publications in Hindi Sahitya.'} />
        <meta name="keywords" content="Hindi Kavi Guru Pratap Sharma, Aag Poetry, Hindi Sahitya, Hindi Poems, Guru Pratap Sharma Aag, Hindi Literature, Kavita, Hindi Writer" />
        <meta name="author" content="Guru Pratap Sharma 'Aag'" />
        
        {/* OpenGraph Tags */}
        <meta property="og:title" content="Hindi Kavi Guru Pratap Sharma 'Aag' | Hindi Sahitya" />
        <meta property="og:description" content={aboutContent?.truncated_preview || 'Renowned Hindi poet and writer. Explore his literary works, poems, and publications.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        {aboutImageUrl && <meta property="og:image" content={aboutImageUrl} />}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="hi_IN" />
        <meta property="og:locale:alternate" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hindi Kavi Guru Pratap Sharma 'Aag'" />
        <meta name="twitter:description" content={aboutContent?.truncated_preview || 'Renowned Hindi poet and writer'} />
        {aboutImageUrl && <meta name="twitter:image" content={aboutImageUrl} />}
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="phoenix-home">
        {/* Hero Section with Parallax - Only show if hero category is active */}
        {categories.find(c => c.content_type === 'hero' && c.is_active !== false) && (
          <HeroSection />
        )}

        {/* Verse of the Day - Removed as per user request */}

        {/* 1. About Section with Box Background */}
        {aboutContent && (
          <motion.section
            className="phoenix-section phoenix-section-box phoenix-about-section-home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="phoenix-content">
              <motion.h2
                className="phoenix-section-title phoenix-section-title-link"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                onClick={() => aboutCategory && navigate(`/category/${aboutCategory.id}`)}
                style={{ cursor: aboutCategory ? 'pointer' : 'default' }}
              >
                {aboutCategory ? t('nav.about') : (aboutContent.title || t('nav.about'))}
              </motion.h2>
              
              <div className="phoenix-about-home-layout-text-wrap">
                {/* Image - Float Left, Text Wraps Around */}
                {aboutImageUrl && (
                  <motion.div
                    className="phoenix-about-home-image-wrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <img
                      src={aboutImageUrl}
                      alt={aboutContent.title || 'Guru Pratap Sharma'}
                      className="phoenix-about-home-img-wrap"
                      onClick={() => setImageModal({ isOpen: true, url: aboutImageUrl, alt: aboutContent.title || 'Guru Pratap Sharma' })}
                      style={{ cursor: 'pointer' }}
                    />
                  </motion.div>
                )}
                
                {/* Text Wraps Around Image */}
                <motion.div
                  className="phoenix-about-home-text-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {aboutContent.truncated_preview && (
                    <p className="phoenix-about-preview">
                      {aboutContent.truncated_preview}
                    </p>
                  )}
                </motion.div>
              </div>
              
              {/* Image Modal */}
              <ImageModal
                isOpen={imageModal.isOpen}
                imageUrl={imageModal.url}
                alt={imageModal.alt}
                onClose={() => setImageModal({ isOpen: false, url: null, alt: '' })}
              />
            </div>
          </motion.section>
        )}

        {/* 2. Poems Section with Box Background */}
        {poems.length > 0 && (
          <motion.section
            className="phoenix-section phoenix-section-box phoenix-poems-section-home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="phoenix-content">
              <motion.h2
                className="phoenix-section-title phoenix-section-title-link"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                onClick={() => poemsCategory && navigate(`/category/${poemsCategory.id}`)}
                style={{ cursor: poemsCategory ? 'pointer' : 'default' }}
              >
                {poemsCategory ? (poemsCategory.name_display || poemsCategory.name_en || t('nav.poems')) : t('nav.poems')}
              </motion.h2>
              
              <div className="phoenix-poems-list-home">
                {poems.map((poem, index) => (
                  <motion.div
                    key={poem.id}
                    className="phoenix-poem-item-home"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <button
                      className="phoenix-poem-link"
                      onClick={() => navigate(`/poem/${poem.id}`)}
                    >
                      <h3 className="phoenix-poem-heading phoenix-poem-heading-ellipsis">
                        {i18n.language === 'hi' 
                          ? (poem.heading_hi || poem.heading_en || poem.heading || 'Untitled')
                          : (poem.heading_en || poem.heading_hi || poem.heading || 'Untitled')}
                      </h3>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* 3. Publications Section with Box Background */}
        {publications.length > 0 && (
          <motion.section
            className="phoenix-section phoenix-section-box phoenix-publications-section-home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="phoenix-content">
              <motion.h2
                className="phoenix-section-title phoenix-section-title-link"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                onClick={() => publicationsCategory && navigate(`/category/${publicationsCategory.id}`)}
                style={{ cursor: publicationsCategory ? 'pointer' : 'default' }}
              >
                {publicationsCategory ? (publicationsCategory.name_display || publicationsCategory.name_en || t('publications.title')) : t('publications.title')}
              </motion.h2>
              
              <div className="phoenix-publications-scroll">
                {publications.map((pub, index) => (
              <PublicationCard
                key={pub.id}
                publication={pub}
                    index={index}
              />
            ))}
          </div>
          </div>
          </motion.section>
      )}
    </div>
    </>
  )
}

export default Home
