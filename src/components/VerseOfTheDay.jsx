import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getPoems } from '../lib/supabaseClient'
import './VerseOfTheDay.css'

function VerseOfTheDay() {
  const { t, i18n } = useTranslation()
  const [verse, setVerse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVerse()
  }, [i18n.language])

  const loadVerse = async () => {
    try {
      setLoading(true)
      const poems = await getPoems()
      
      // Filter featured poems or get random
      const featured = poems.filter(p => p.is_featured || p.verse_of_day)
      const pool = featured.length > 0 ? featured : poems
      
      if (pool.length > 0) {
        // Get random poem
        const randomIndex = Math.floor(Math.random() * pool.length)
        const selectedPoem = pool[randomIndex]
        
        // Get first few lines as verse
        const content = i18n.language === 'hi' 
          ? (selectedPoem.body_text_hi || selectedPoem.body_text_en)
          : (selectedPoem.body_text_en || selectedPoem.body_text_hi)
        
        const lines = content?.split('\n').filter(l => l.trim()).slice(0, 4) || []
        
        setVerse({
          title: i18n.language === 'hi'
            ? (selectedPoem.heading_hi || selectedPoem.heading_en)
            : (selectedPoem.heading_en || selectedPoem.heading_hi),
          lines: lines.join('\n'),
          id: selectedPoem.id
        })
      }
    } catch (err) {
      console.error('Error loading verse:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !verse) return null

  return (
    <motion.section
      className="phoenix-verse-of-day"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="phoenix-verse-container">
        <motion.div
          className="phoenix-verse-flame"
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          🔥
        </motion.div>
        
        <h2 className="phoenix-verse-title">
          {i18n.language === 'hi' ? 'आज का शेर' : 'Verse of the Day'}
        </h2>
        
        <div className="phoenix-verse-content">
          <h3 className="phoenix-verse-poem-title">{verse.title}</h3>
          <pre className="phoenix-verse-text">{verse.lines}</pre>
        </div>
        
        <motion.button
          className="phoenix-verse-refresh"
          onClick={loadVerse}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {i18n.language === 'hi' ? 'नया शेर' : 'New Verse'}
        </motion.button>
      </div>
    </motion.section>
  )
}

export default VerseOfTheDay

