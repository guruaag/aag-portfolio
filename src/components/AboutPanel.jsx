import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { marked } from 'marked'
import { getImageUrl } from '../lib/imageUtils'
import './AboutPanel.css'

function AboutPanel({ aboutContent, categoryName }) {
  if (!aboutContent) return null

  const htmlContent = aboutContent.body_text 
    ? marked.parse(aboutContent.body_text)
    : ''

  const photoUrl = getImageUrl(aboutContent.photo_path)
  const displayTitle = aboutContent.title || categoryName || 'About Guru Pratap Sharma'

  return (
    <>
      <Helmet>
        <title>{displayTitle} - Guru Pratap Sharma | AAG</title>
        <meta name="description" content={aboutContent.truncated_preview || aboutContent.body_text?.substring(0, 150)} />
      </Helmet>

      <motion.div
        className="phoenix-about-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Title */}
        <motion.h1
          className="phoenix-about-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {displayTitle}
        </motion.h1>

        {/* Two-Column Layout */}
        <div className="phoenix-about-layout">
          {/* Photo Section */}
          <motion.div
            className="phoenix-about-photo"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {photoUrl ? (
              <div className="phoenix-about-photo-wrapper">
                <img
                  src={photoUrl}
                  alt={displayTitle}
                  className="phoenix-about-photo-image"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const placeholder = e.target.nextElementSibling
                    if (placeholder) placeholder.style.display = 'flex'
                  }}
                />
                <div className="phoenix-about-photo-placeholder" style={{ display: 'none' }}>
                  <span className="phoenix-about-photo-initials">GS</span>
                  <span>Photo</span>
                </div>
              </div>
            ) : (
              <div className="phoenix-about-photo-placeholder">
                <span className="phoenix-about-photo-initials">GS</span>
                <span>Photo</span>
              </div>
            )}
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="phoenix-about-content"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {htmlContent ? (
              <div
                className="phoenix-about-text"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <p className="phoenix-about-empty">
                Content coming soon...
              </p>
            )}

            {/* Truncated Preview as Quote Block */}
            {aboutContent.truncated_preview && aboutContent.truncated_preview !== aboutContent.body_text && (
              <motion.div
                className="phoenix-quote phoenix-about-quote"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {aboutContent.truncated_preview}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

export default AboutPanel
