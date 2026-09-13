import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getPoem, getPoems } from '../lib/supabaseClient'
import { sanitizePoem } from '../lib/dataSanitizer'
import PoemDetail from '../components/PoemDetail'

function PoemPage() {
  const { id } = useParams()
  const { i18n } = useTranslation()
  const [poem, setPoem] = useState(null)
  const [allPoems, setAllPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPoem()
  }, [id])

  const loadPoem = async () => {
    try {
      setLoading(true)
      setError(null)

      const [poemData, allPoemsData] = await Promise.all([
        getPoem(id),
        getPoems()
      ])

      setPoem(poemData ? sanitizePoem(poemData) : null)
      setAllPoems((allPoemsData || []).map(sanitizePoem).filter(Boolean))
    } catch (err) {
      console.error('Error loading poem:', err)
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

  if (error || !poem) {
    return (
      <div className="phoenix-error">
        <p>{error || (i18n.language === 'hi' ? 'कविता नहीं मिली' : 'Poem not found')}</p>
        <button className="phoenix-btn phoenix-btn-outline" onClick={loadPoem}>
          {i18n.language === 'hi' ? 'पुनः प्रयास करें' : 'Refresh'}
        </button>
      </div>
    )
  }

  return <PoemDetail poem={poem} allPoems={allPoems} />
}

export default PoemPage
