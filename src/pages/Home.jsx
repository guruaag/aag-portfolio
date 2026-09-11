import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { getCategories, getAboutContent, getPublications, getPoems, getAllSettings, getTimeline, getAwards } from '../lib/supabaseClient'
import { getImageUrl } from '../lib/imageUtils'
import { sanitizeText, sanitizePoem, sanitizePublication } from '../lib/dataSanitizer'
import PublicationCard from '../components/PublicationCard'
import HeroSection from '../components/HeroSection'
import ImageModal from '../components/ImageModal'
import './Home.css'

function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [aboutContent, setAboutContent] = useState(null)
  const [publications, setPublications] = useState([])
  const [poems, setPoems] = useState([])
  const [timelineHighlights, setTimelineHighlights] = useState([])
  const [awardsHighlights, setAwardsHighlights] = useState([])
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
      
      const [catsData, aboutData, pubsData, poemsData, settingsList, timelineData, awardsData] = await Promise.all([
        getCategories().catch(() => []),
        getAboutContent().catch(() => null),
        getPublications().catch(() => []),
        getPoems().catch(() => []),
        getAllSettings().catch(() => []),
        getTimeline().catch(() => []),
        getAwards().catch(() => [])
      ])

      const sMap = {}
      if (Array.isArray(settingsList)) {
        settingsList.forEach(s => { if (s && s.key) sMap[s.key] = s.value })
      }

      // Check custom intro excerpt setting
      const useCustomExcerpt = sMap.home_use_custom_excerpt === 'true'
      const customExcerpt = sMap.home_custom_excerpt || ''

      // Process featured items based on selected sequence
      let featPoemIds = []
      let featPubIds = []
      let featTimelineIds = []
      let featAwardIds = []

      try {
        if (sMap.home_featured_poems) {
          featPoemIds = typeof sMap.home_featured_poems === 'string' ? JSON.parse(sMap.home_featured_poems) : sMap.home_featured_poems
        }
      } catch (e) {}

      try {
        if (sMap.home_featured_publications) {
          featPubIds = typeof sMap.home_featured_publications === 'string' ? JSON.parse(sMap.home_featured_publications) : sMap.home_featured_publications
        }
      } catch (e) {}

      try {
        if (sMap.home_featured_timeline) {
          featTimelineIds = typeof sMap.home_featured_timeline === 'string' ? JSON.parse(sMap.home_featured_timeline) : sMap.home_featured_timeline
        }
      } catch (e) {}

      try {
        if (sMap.home_featured_awards) {
          featAwardIds = typeof sMap.home_featured_awards === 'string' ? JSON.parse(sMap.home_featured_awards) : sMap.home_featured_awards
        }
      } catch (e) {}

      const allCleanPoems = (poemsData || []).map(sanitizePoem).filter(Boolean)
      const allCleanPubs = (pubsData || []).map(sanitizePublication).filter(Boolean)

      let orderedPoems = []
      if (Array.isArray(featPoemIds) && featPoemIds.length > 0) {
        orderedPoems = featPoemIds.map(id => allCleanPoems.find(p => String(p.id) === String(id))).filter(Boolean)
      }
      if (orderedPoems.length === 0) {
        orderedPoems = allCleanPoems.slice(0, 6)
      }

      let orderedPubs = []
      if (Array.isArray(featPubIds) && featPubIds.length > 0) {
        orderedPubs = featPubIds.map(id => allCleanPubs.find(p => String(p.id) === String(id))).filter(Boolean)
      }
      if (orderedPubs.length === 0) {
        orderedPubs = allCleanPubs.slice(0, 6)
      }

      let orderedTimeline = []
      if (Array.isArray(featTimelineIds) && featTimelineIds.length > 0) {
        orderedTimeline = featTimelineIds.map(id => (timelineData || []).find(t => String(t.id) === String(id))).filter(Boolean)
      }
      if (orderedTimeline.length === 0) {
        orderedTimeline = (timelineData || []).slice(0, 4)
      }

      let orderedAwards = []
      if (Array.isArray(featAwardIds) && featAwardIds.length > 0) {
        orderedAwards = featAwardIds.map(id => (awardsData || []).find(a => String(a.id) === String(id))).filter(Boolean)
      }
      if (orderedAwards.length === 0) {
        orderedAwards = (awardsData || []).slice(0, 4)
      }

      const cleanCategories = (catsData || []).map(c => ({
        ...c,
        name_display: sanitizeText(c.name_display || c.name_en || c.name),
        name_hi: sanitizeText(c.name_hi || c.name),
        name_en: sanitizeText(c.name_en || c.name)
      }))

      setCategories(cleanCategories)
      setAboutContent(aboutData ? {
        ...aboutData,
        truncated_preview: useCustomExcerpt && customExcerpt ? customExcerpt : sanitizeText(aboutData.truncated_preview)
      } : null)
      setPublications(orderedPubs)
      setPoems(orderedPoems)
      setTimelineHighlights(orderedTimeline)
      setAwardsHighlights(orderedAwards)
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
  const isHi = i18n.language === 'hi'

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
        {/* ISSUE 1 FIX: Top Hero Banner mounted unconditionally */}
        <HeroSection />

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
                onClick={() => navigate('/parichay')}
                style={{ cursor: 'pointer' }}
              >
                {aboutCategory ? (aboutCategory.name_display || aboutCategory.name_hi || t('nav.about')) : (aboutContent.title || t('nav.about'))}
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
                  <button
                    className="phoenix-highlights-more-btn"
                    onClick={() => navigate('/parichay')}
                  >
                    {isHi ? 'पूरा परिचय पढ़ें →' : 'Read Full Biography →'}
                  </button>
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
                onClick={() => poemsCategory ? navigate(`/category/${poemsCategory.id}`) : navigate('/kavya-sangrah')}
                style={{ cursor: 'pointer' }}
              >
                {poemsCategory ? (poemsCategory.name_display || poemsCategory.name_hi || t('nav.poems')) : t('nav.poems')}
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
                          ? (poem.heading_hi || poem.heading_en || poem.heading || poem.title || 'Untitled')
                          : (poem.heading_en || poem.heading_hi || poem.heading || poem.title || 'Untitled')}
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
                onClick={() => publicationsCategory ? navigate(`/category/${publicationsCategory.id}`) : navigate('/prakashan')}
                style={{ cursor: 'pointer' }}
              >
                {publicationsCategory ? (publicationsCategory.name_display || publicationsCategory.name_hi || t('publications.title')) : t('publications.title')}
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

        {/* ISSUE 3 FIX: Highlights Section (Timeline & Awards) */}
        {(timelineHighlights.length > 0 || awardsHighlights.length > 0) && (
          <motion.section
            className="phoenix-section phoenix-section-box phoenix-highlights-section-home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="phoenix-content">
              <h2 className="phoenix-section-title">
                {isHi ? 'मुख्य उपलब्धियां (जीवन यात्रा व सम्मान)' : 'Highlights & Honors'}
              </h2>

              <div className="phoenix-highlights-grid">
                {/* Left Col: Timeline */}
                {timelineHighlights.length > 0 && (
                  <div className="phoenix-highlight-col">
                    <h3 className="phoenix-highlight-col-title">
                      ⏳ {isHi ? 'जीवन यात्रा (मील के पत्थर)' : 'Life Timeline'}
                    </h3>
                    {timelineHighlights.map((item) => (
                      <div key={item.id} className="phoenix-highlight-card">
                        {(item.year || item.year_period) && (
                          <span className="phoenix-highlight-year-badge">{item.year || item.year_period}</span>
                        )}
                        <h4 className="phoenix-highlight-item-title">
                          {item.title_hi || item.title || item.event_title}
                        </h4>
                        {(item.description_hi || item.description) && (
                          <p className="phoenix-highlight-item-desc">
                            {item.description_hi || item.description}
                          </p>
                        )}
                      </div>
                    ))}
                    <button
                      className="phoenix-highlights-more-btn"
                      onClick={() => navigate('/parichay')}
                    >
                      {isHi ? 'और देखें →' : 'View Full Timeline →'}
                    </button>
                  </div>
                )}

                {/* Right Col: Awards */}
                {awardsHighlights.length > 0 && (
                  <div className="phoenix-highlight-col">
                    <h3 className="phoenix-highlight-col-title">
                      🏆 {isHi ? 'पुरस्कार व सम्मान' : 'Awards & Honors'}
                    </h3>
                    {awardsHighlights.map((award) => (
                      <div key={award.id} className="phoenix-highlight-card">
                        {(award.year || award.year_awarded) && (
                          <span className="phoenix-highlight-year-badge">{award.year || award.year_awarded}</span>
                        )}
                        <h4 className="phoenix-highlight-item-title">
                          {award.title_hi || award.title || award.award_name}
                        </h4>
                        {(award.description_hi || award.description || award.conferred_by || award.given_by) && (
                          <p className="phoenix-highlight-item-desc">
                            {award.description_hi || award.description || (award.conferred_by ? `प्रदाता: ${award.conferred_by}` : (award.given_by ? `Conferred by: ${award.given_by}` : ''))}
                          </p>
                        )}
                      </div>
                    ))}
                    <button
                      className="phoenix-highlights-more-btn"
                      onClick={() => navigate('/parichay')}
                    >
                      {isHi ? 'और देखें →' : 'View All Awards →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </>
  )
}

export default Home
