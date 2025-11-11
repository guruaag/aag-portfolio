import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import SocialShare from './SocialShare'
import './PoemDetail.css'

function PoemDetail({ poem, allPoems }) {
  const navigate = useNavigate()
  const [prevId, setPrevId] = useState(null)
  const [nextId, setNextId] = useState(null)

  useEffect(() => {
    if (!poem || !allPoems || allPoems.length === 0) return

    const sortedPoems = [...allPoems].sort((a, b) => a.sort_order - b.sort_order)
    const currentIndex = sortedPoems.findIndex(p => p.id === poem.id)

    if (currentIndex === -1) return

    const prevIndex = currentIndex === 0 ? sortedPoems.length - 1 : currentIndex - 1
    const nextIndex = currentIndex === sortedPoems.length - 1 ? 0 : currentIndex + 1

    setPrevId(sortedPoems[prevIndex].id)
    setNextId(sortedPoems[nextIndex].id)
  }, [poem, allPoems])

  const handlePrev = () => {
    if (prevId) navigate(`/poem/${prevId}`)
  }

  const handleNext = () => {
    if (nextId) navigate(`/poem/${nextId}`)
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [prevId, nextId])

  if (!poem) return null

  const pageUrl = window.location.href

  return (
    <>
      <Helmet>
        <title>{poem.heading || 'Poem'} - Guru Pratap Sharma | AAG</title>
        <meta name="description" content={poem.description || poem.full_text?.substring(0, 160) || ''} />
        <meta property="og:title" content={poem.heading || 'Poem'} />
        <meta property="og:description" content={poem.description || poem.full_text?.substring(0, 160) || ''} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
      </Helmet>

      <motion.article
        className="phoenix-poem-detail phoenix-focus-mode"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          className="phoenix-poem-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="phoenix-poem-title">
            {poem.heading || 'Untitled Poem'}
          </h1>
          {poem.description && (
            <p className="phoenix-poem-subtitle">
              {poem.description}
            </p>
          )}
        </motion.header>

        {/* Poem Text - Focus Mode */}
        <motion.div
          className="phoenix-poem-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="phoenix-poem-content">
            {poem.full_text}
          </div>
        </motion.div>

        {/* Social Share - Subtle */}
        <motion.div
          className="phoenix-poem-share"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <SocialShare
            url={pageUrl}
            title={poem.heading || 'Poem'}
            description={poem.description || poem.full_text?.substring(0, 160)}
          />
        </motion.div>

        {/* Navigation */}
        <motion.nav
          className="phoenix-poem-navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            className="phoenix-btn phoenix-btn-outline"
            onClick={handlePrev}
            disabled={!prevId}
            whileHover={prevId ? { x: -4 } : {}}
            whileTap={prevId ? { scale: 0.95 } : {}}
            style={{ opacity: prevId ? 1 : 0.4, cursor: prevId ? 'pointer' : 'not-allowed' }}
          >
            ← Previous
          </motion.button>
          <motion.button
            className="phoenix-btn phoenix-btn-outline"
            onClick={handleNext}
            disabled={!nextId}
            whileHover={nextId ? { x: 4 } : {}}
            whileTap={nextId ? { scale: 0.95 } : {}}
            style={{ opacity: nextId ? 1 : 0.4, cursor: nextId ? 'pointer' : 'not-allowed' }}
          >
            Next →
          </motion.button>
        </motion.nav>
      </motion.article>
    </>
  )
}

export default PoemDetail
