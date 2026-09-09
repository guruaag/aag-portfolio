import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import SocialShare from './SocialShare'
import AudioPlayer from './AudioPlayer'
import BookReader from './BookReader'
import { getImageUrl } from '../lib/imageUtils'
import './PoemDetail.css'

function PoemDetail({ poem, allPoems }) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
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

  if (!poem) return null

  const pageUrl = window.location.href
  const audioUrl = poem.audio_url ? getImageUrl(poem.audio_url) : null
  const poemImage = poem.image_path ? getImageUrl(poem.image_path) : null

  const poemTitle = i18n.language === 'hi'
    ? (poem.heading_hi || poem.heading_en || poem.heading || 'Untitled Poem')
    : (poem.heading_en || poem.heading_hi || poem.heading || 'Untitled Poem')

  const poemContent = poem.pages || poem.body_text_hi || poem.body_text_en || poem.full_text || 'No content available.'

  return (
    <>
      <Helmet>
        <title>{poemTitle} - Hindi Kavi Guru Pratap Sharma 'Aag' | Aag Poetry</title>
        <meta name="description" content={(typeof poemContent === 'string' ? poemContent : poemContent.join(' '))?.substring(0, 160) || `Read ${poemTitle} by Hindi poet Guru Pratap Sharma 'Aag'.`} />
        <meta name="keywords" content={`${poemTitle}, Hindi Kavi Guru Pratap Sharma, Aag Poetry, Hindi Sahitya`} />
        {poemImage && <meta property="og:image" content={poemImage} />}
        <meta property="og:title" content={`${poemTitle} - Guru Pratap Sharma 'Aag'`} />
        <meta property="og:description" content={(typeof poemContent === 'string' ? poemContent : poemContent.join(' '))?.substring(0, 200) || ''} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
      </Helmet>

      <motion.article
        className="phoenix-poem-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ paddingTop: 'var(--phoenix-space-lg)', maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* 100X Physical 3D Book Reader Component */}
        <BookReader
          title={poemTitle}
          content={poemContent}
          author="गुरुप्रताप शर्मा 'आग'"
          collection={poem.description || 'काव्य संग्रह: अग्नि कलश'}
          year={poem.created_at ? new Date(poem.created_at).getFullYear().toString() : '१९८५'}
          audioUrl={audioUrl}
        />

        {/* Navigation Bar below BookReader */}
        <motion.nav
          className="phoenix-poem-navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.button
            className="phoenix-btn phoenix-btn-outline phoenix-poem-nav-btn"
            onClick={handlePrev}
            disabled={!prevId}
            whileHover={prevId ? { x: -4 } : {}}
            whileTap={prevId ? { scale: 0.95 } : {}}
            style={{ 
              opacity: prevId ? 1 : 0.4, 
              cursor: prevId ? 'pointer' : 'not-allowed',
              borderColor: 'var(--theme-accent)',
              color: prevId ? 'var(--theme-text)' : 'var(--theme-text-secondary)'
            }}
          >
            ← {t('common.previous')}
          </motion.button>
          <motion.button
            className="phoenix-btn phoenix-btn-outline phoenix-poem-nav-btn"
            onClick={handleNext}
            disabled={!nextId}
            whileHover={nextId ? { x: 4 } : {}}
            whileTap={nextId ? { scale: 0.95 } : {}}
            style={{ 
              opacity: nextId ? 1 : 0.4, 
              cursor: nextId ? 'pointer' : 'not-allowed',
              borderColor: 'var(--theme-accent)',
              color: nextId ? 'var(--theme-text)' : 'var(--theme-text-secondary)'
            }}
          >
            {t('common.next')} →
          </motion.button>
        </motion.nav>
      </motion.article>
    </>
  )
}

export default PoemDetail

