import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { getCategories, getAboutContent, getPublications, getPoems } from '../lib/supabaseClient'
import PublicationCard from '../components/PublicationCard'
import './Home.css'

function Home() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [aboutContent, setAboutContent] = useState(null)
  const [publications, setPublications] = useState([])
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      setPublications(pubsData.slice(0, 6))
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
          {t('common.readMore')}
        </button>
      </div>
    )
  }

  const publicationsCategory = categories.find(c => c.content_type === 'publications')

  return (
    <>
      <Helmet>
        <title>Guru Pratap Sharma | AAG - Literary Works & Poetry</title>
        <meta name="description" content={aboutContent?.truncated_preview || 'Portfolio of poems, publications, and writings by Guru Pratap Sharma.'} />
        <meta property="og:title" content="Guru Pratap Sharma | AAG" />
        <meta property="og:description" content={aboutContent?.truncated_preview || 'Literary works and poetry'} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="phoenix-home">
        {/* Hero Section */}
        <motion.section
          className="phoenix-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="phoenix-hero-title">
            {t('home.title')}
          </h1>
          <p className="phoenix-hero-subtitle">
            {t('home.subtitle')}
          </p>
          {aboutContent?.truncated_preview && (
            <motion.p
              className="phoenix-hero-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {aboutContent.truncated_preview}
            </motion.p>
          )}
        </motion.section>

        {/* Publications Grid */}
        {publicationsCategory && publications.length > 0 && (
          <motion.section
            className="phoenix-section phoenix-publications-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="phoenix-content">
              <motion.h2
                className="phoenix-section-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {t('publications.title')}
              </motion.h2>
              <motion.p
                className="phoenix-section-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {t('publications.subtitle')}
              </motion.p>
              
              <div className="phoenix-publications-grid">
                {publications.map((pub, index) => (
                  <PublicationCard
                    key={pub.id}
                    publication={pub}
                    index={index}
                  />
                ))}
              </div>

              {publications.length >= 6 && (
                <motion.div
                  className="phoenix-section-footer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <a
                    href={`/category/${publicationsCategory.id}`}
                    className="phoenix-btn phoenix-btn-outline"
                  >
                    {t('common.readMore')} →
                  </a>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* About Quote Block */}
        {aboutContent && (
          <motion.section
            className="phoenix-section phoenix-about-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="phoenix-content">
              <div className="phoenix-quote">
                {aboutContent.body_text && (
                  <div
                    className="phoenix-quote-content"
                    dangerouslySetInnerHTML={{ __html: aboutContent.body_text }}
                  />
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
