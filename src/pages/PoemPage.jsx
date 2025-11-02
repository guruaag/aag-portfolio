import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPoem, getPoems } from '../lib/supabaseClient'
import PoemDetail from '../components/PoemDetail'
import { updateMetaTags } from '../lib/metaTags'

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

      // Update meta tags for SEO
      if (poemData) {
        updateMetaTags({
          title: `${poemData.heading || 'Poem'} - Gurupratap Sharma | AAG`,
          description: poemData.description || poemData.full_text?.substring(0, 160) || '',
          url: window.location.href
        })
      }
    } catch (err) {
      console.error('Error loading poem:', err)
      setError('Content not available')
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error || !poem) {
    return (
      <div className="error">
        <p>{error || 'Poem not found'}</p>
        <button className="btn" onClick={loadPoem}>Refresh</button>
        <p style={{ marginTop: '16px' }}>
          <a href="tel:+917676885989" className="link">Call me</a>
        </p>
      </div>
    )
  }

  return <PoemDetail poem={poem} allPoems={allPoems} />
}

export default PoemPage

