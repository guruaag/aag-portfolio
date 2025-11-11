import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { getCategories, getAboutContent, getPublications, getPoems } from '../lib/supabaseClient'
import PublicationCard from '../components/PublicationCard'
import { marked } from 'marked'
import './Home.css'

function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
      setPublications(pubsData.slice(0, 5)) // Max 5 for horizontal scroll
      setPoems(poemsData.slice(0, 5)) // Max 5 titles
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

  const aboutCategory = categories.find(c => c.content_type === 'about')
  const publicationsCategory = categories.find(c => c.content_type === 'publications')
  const poemsCategory = categories.find(c => c.content_type === 'writings')

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
        {/* 1. About Section */}
        {aboutContent && (
          <motion.section
            className="phoenix-section phoenix-about-section-home"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="phoenix-content">
              <motion.h2
                className="phoenix-section-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {aboutContent.title || t('about.title')}
              </motion.h2>
              
              {aboutContent.truncated_preview && (
                <motion.p
                  className="phoenix-about-preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {aboutContent.truncated_preview}
                </motion.p>
              )}

              {aboutCategory && (
                <motion.div
                  className="phoenix-section-footer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <button
                    className="phoenix-btn phoenix-btn-outline"
                    onClick={() => navigate(`/category/${aboutCategory.id}`)}
                  >
                    {t('common.readMore')} →
                  </button>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* 2. Poems Section */}
        {poems.length > 0 && (
          <motion.section
            className="phoenix-section phoenix-poems-section-home"
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
                {t('nav.poems')}
              </motion.h2>
              
              <div className="phoenix-poems-list-home">
                {poems.map((poem, index) => (
                  <motion.div
                    key={poem.id}
                    className="phoenix-poem-item-home"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  >
                    <button
                      className="phoenix-poem-link"
                      onClick={() => navigate(`/poem/${poem.id}`)}
                    >
                      <h3 className="phoenix-poem-heading">{poem.heading || 'Untitled'}</h3>
                    </button>
                  </motion.div>
                ))}
              </div>

              {poemsCategory && (
                <motion.div
                  className="phoenix-section-footer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <button
                    className="phoenix-btn phoenix-btn-outline"
                    onClick={() => navigate(`/category/${poemsCategory.id}`)}
                  >
                    {t('common.readMore')} →
                  </button>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* 3. Publications Section */}
        {publications.length > 0 && (
          <motion.section
            className="phoenix-section phoenix-publications-section-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="phoenix-content">
              <motion.h2
                className="phoenix-section-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {t('publications.title')}
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

              {publicationsCategory && (
                <motion.div
                  className="phoenix-section-footer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <button
                    className="phoenix-btn phoenix-btn-outline"
                    onClick={() => navigate(`/category/${publicationsCategory.id}`)}
                  >
                    {t('common.readMore')} →
                  </button>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </div>
    </>
  )
}

export default Home
