import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getPoem, getPoems } from '../lib/supabaseClient'
import PoemDetail from '../components/PoemDetail'

function PoemPage() {
  const { id } = useParams()
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

      setPoem(poemData)
      setAllPoems(allPoemsData)
    } catch (err) {
      console.error('Error loading poem:', err)
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

  if (error || !poem) {
    return (
      <div className="phoenix-error">
        <p>{error || 'Poem not found'}</p>
        <button className="phoenix-btn phoenix-btn-outline" onClick={loadPoem}>
          Refresh
        </button>
      </div>
    )
  }

  return <PoemDetail poem={poem} allPoems={allPoems} />
}

export default PoemPage
