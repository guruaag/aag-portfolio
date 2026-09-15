import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import { getImageUrl } from '../lib/imageUtils'
import { getTimeline, getAwards } from '../lib/supabaseClient'
import './AboutPanel.css'

function AboutPanel({ aboutContent, categoryName }) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  const [timeline, setTimeline] = useState(aboutContent?.timeline || [])
  const [awards, setAwards] = useState(aboutContent?.awards || [])

  useEffect(() => {
    if (aboutContent?.timeline && aboutContent.timeline.length > 0) {
      setTimeline(aboutContent.timeline)
    }
    if (aboutContent?.awards && aboutContent.awards.length > 0) {
      setAwards(aboutContent.awards)
    }

    // Fallback load if not pre-attached to aboutContent
    if ((!aboutContent?.timeline || aboutContent.timeline.length === 0) || 
        (!aboutContent?.awards || aboutContent.awards.length === 0)) {
      Promise.all([
        getTimeline().catch(() => []),
        getAwards().catch(() => [])
      ]).then(([tData, aData]) => {
        if ((!aboutContent?.timeline || aboutContent.timeline.length === 0) && tData) {
          setTimeline(tData)
        }
        if ((!aboutContent?.awards || aboutContent.awards.length === 0) && aData) {
          setAwards(aData)
        }
      })
    }
  }, [aboutContent])

  if (!aboutContent) return null

  const htmlContent = aboutContent.body_text 
    ? marked.parse(aboutContent.body_text, { breaks: true, gfm: true })
    : ''

  const photoUrl = getImageUrl(aboutContent.photo_path)
  const displayTitle = aboutContent.title || categoryName || (isHi ? 'गुरुप्रताप शर्मा \'आग\' का परिचय' : 'About Guru Pratap Sharma')

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
        style={{ paddingTop: 'var(--phoenix-space-lg)' }}
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
                    e.target.onerror = null;
                    e.target.style.display = 'none'
                    const placeholder = e.target.nextElementSibling
                    if (placeholder) placeholder.style.display = 'flex'
                  }}
                />
                <div className="phoenix-about-photo-placeholder" style={{ display: 'none' }}>
                  <span className="phoenix-about-photo-initials">GS</span>
                  <span>{isHi ? 'चित्र' : 'Photo'}</span>
                </div>
              </div>
            ) : (
              <div className="phoenix-about-photo-placeholder">
                <span className="phoenix-about-photo-initials">GS</span>
                <span>{isHi ? 'चित्र' : 'Photo'}</span>
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
            {/* 1. Main Bio Text */}
            {htmlContent ? (
              <div
                className="phoenix-about-text"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <p className="phoenix-about-empty">
                {isHi ? 'सामग्री शीघ्र उपलब्ध होगी...' : 'Content coming soon...'}
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

        {/* 2. Timeline Section - Alternating Left & Right Vertical Flow */}
        {timeline && timeline.length > 0 && (
          <motion.div
            className="phoenix-about-timeline-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="phoenix-about-subheading">
              {isHi ? 'जीवन यात्रा (मील के पत्थर)' : 'Life Journey & Timeline'}
            </h2>
            <div className="phoenix-timeline-container">
              <div className="phoenix-timeline-spine"></div>
              {timeline.map((item, idx) => {
                const isEven = idx % 2 === 0
                const yearVal = item.year || item.year_period
                const itemTitle = item.title_hi || item.title || item.event_title || ''
                const itemDesc = item.description_hi || item.description || ''
                return (
                  <motion.div
                    key={item.id || idx}
                    className={`phoenix-timeline-item ${isEven ? 'left' : 'right'}`}
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                  >
                    <div className="phoenix-timeline-node">
                      <span className="node-dot"></span>
                    </div>
                    <div className="phoenix-timeline-card">
                      {yearVal && <span className="phoenix-about-year-badge">{yearVal}</span>}
                      <h3 className="phoenix-about-item-title">{itemTitle}</h3>
                      {itemDesc && <p className="phoenix-about-item-desc">{itemDesc}</p>}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* 3. Awards & Honors Section - Modern Card Grid */}
        {awards && awards.length > 0 && (
          <motion.div
            className="phoenix-about-awards-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="phoenix-about-subheading">
              {isHi ? 'पुरस्कार व सम्मान' : 'Awards & Honors'}
            </h2>
            <div className="phoenix-about-awards-grid">
              {awards.map((award, idx) => {
                const yearVal = award.year || award.year_awarded
                const awardTitle = award.title_hi || award.title || award.award_name || ''
                const awardDesc = award.description_hi || award.description || award.conferred_by || award.given_by || ''
                return (
                  <motion.div
                    key={award.id || idx}
                    className="phoenix-about-award-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                  >
                    <div className="phoenix-award-card-header">
                      {yearVal && <span className="phoenix-about-year-badge">{yearVal}</span>}
                      <span className="phoenix-award-icon">🏆</span>
                    </div>
                    <h3 className="phoenix-about-item-title">{awardTitle}</h3>
                    {awardDesc && <p className="phoenix-about-item-desc">{awardDesc}</p>}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}

export default AboutPanel
