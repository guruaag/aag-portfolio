import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { getPublication } from '../lib/supabaseClient'
import { getImageUrl } from '../lib/imageUtils'
import SocialShare from '../components/SocialShare'
import './PublicationPage.css'

function PublicationPage() {
  const { id } = useParams()
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
      setPublication(pubData)
    } catch (err) {
      console.error('Error loading publication:', err)
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

  if (error || !publication) {
    return (
      <div className="phoenix-error">
        <p>{error || 'Publication not found'}</p>
        <button className="phoenix-btn phoenix-btn-outline" onClick={loadPublication}>
          Refresh
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

      <motion.article
        className="phoenix-publication-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="phoenix-content phoenix-focus-mode" style={{ paddingTop: 'var(--phoenix-space-lg)' }}>
          {/* Header */}
          <motion.header
            className="phoenix-publication-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="phoenix-publication-page-title">
              {publication.title}
            </h1>
            {publication.subtitle && (
              <p className="phoenix-publication-page-subtitle">
                {publication.subtitle}
              </p>
            )}
          </motion.header>

          {/* Cover Image */}
          {imageUrl && (
            <motion.div
              className="phoenix-publication-cover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <img
                src={imageUrl}
                alt={publication.image_alt || publication.title}
                className="phoenix-publication-cover-image"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </motion.div>
          )}

          {/* Description */}
          {publication.description && (
            <motion.div
              className="phoenix-publication-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div
                className="phoenix-markdown-content"
                dangerouslySetInnerHTML={{ __html: publication.description }}
              />
            </motion.div>
          )}

          {/* Social Share - Desktop */}
          <motion.div
            className="phoenix-publication-share"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <SocialShare
              url={pageUrl}
              title={publication.title}
              description={publication.description || publication.subtitle}
            />
          </motion.div>
        </div>
      </motion.article>
    </>
  )
}

export default PublicationPage
