import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { getPublication } from '../lib/supabaseClient'
import { sanitizePublication } from '../lib/dataSanitizer'
import { getImageUrl } from '../lib/imageUtils'
import BookFocusView from '../components/BookFocusView'
import './PublicationPage.css'

function PublicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
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

  const handleClose = () => {
    navigate('/category/publications')
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

      {/* Full-Screen Focus Reader Overlay matching PoetryFocusView */}
      <BookFocusView
        publication={publication}
        onClose={handleClose}
      />
    </>
  )
}

export default PublicationPage
