import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { getPublication } from '../lib/supabaseClient'
import { sanitizePublication } from '../lib/dataSanitizer'
import { getImageUrl } from '../lib/imageUtils'
import BookReader from '../components/BookReader'
import './PublicationPage.css'

function PublicationPage() {
  const { id } = useParams()
  const { i18n } = useTranslation()
  const [publication, setPublication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPublication()
  }, [id])

  const loadPublication = async () => {
    try {
      setLoading(true)
      setError(null)

      const pubData = await getPublication(id)
      setPublication(pubData ? sanitizePublication(pubData) : null)
    } catch (err) {
      console.error('Error loading publication:', err)
      setError(i18n.language === 'hi' ? 'सामग्री उपलब्ध नहीं है' : 'Content not available')
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
        <p>{i18n.language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </div>
    )
  }

  if (error || !publication) {
    return (
      <div className="phoenix-error">
        <p>{error || (i18n.language === 'hi' ? 'प्रकाशन नहीं मिला' : 'Publication not found')}</p>
        <button className="phoenix-btn phoenix-btn-outline" onClick={loadPublication}>
          {i18n.language === 'hi' ? 'पुनः प्रयास करें' : 'Refresh'}
        </button>
      </div>
    )
  }

  const imageUrl = getImageUrl(publication.image_path)
  const pageUrl = window.location.href
  const pubContent = publication.pages || publication.description || publication.subtitle || 'No content available.'

  return (
    <>
      <Helmet>
        <title>{publication.title} - Guru Pratap Sharma | AAG</title>
        <meta name="description" content={publication.description || publication.subtitle || ''} />
        <meta property="og:title" content={publication.title} />
        <meta property="og:description" content={publication.description || publication.subtitle || ''} />
        <meta property="og:image" content={imageUrl || ''} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={publication.title} />
        <meta name="twitter:description" content={publication.description || publication.subtitle || ''} />
        <meta name="twitter:image" content={imageUrl || ''} />
      </Helmet>

      <motion.article
        className="phoenix-publication-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="phoenix-content" style={{ paddingTop: 'var(--phoenix-space-lg)', maxWidth: '1400px' }}>
          
          {/* 100X Physical 3D Book Reader */}
          <BookReader
            title={publication.title}
            content={pubContent}
            author="गुरुप्रताप शर्मा 'आग'"
            collection={publication.subtitle || 'प्रकाशित कृति'}
            year={publication.publication_year ? publication.publication_year.toString() : '१९८५'}
          />
        </div>
      </motion.article>
    </>
  )
}

export default PublicationPage
