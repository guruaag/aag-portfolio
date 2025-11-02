import { useEffect, useState } from 'react'
import { getCategories, getAboutContent, getPublications, getPoems } from '../lib/supabaseClient'
import { updateMetaTags } from '../lib/metaTags'
import CategoryCard from '../components/CategoryCard'
import PublicationCard from '../components/PublicationCard'
import PoemCard from '../components/PoemCard'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

function Home() {
  const [categories, setCategories] = useState([])
  const [aboutContent, setAboutContent] = useState(null)
  const [publications, setPublications] = useState([])
  const [poems, setPoems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [catsData, aboutData, pubsData, poemsData] = await Promise.all([
        getCategories(),
        getAboutContent(),
        getPublications(),
        getPoems()
      ])

      setCategories(catsData)
      setAboutContent(aboutData)
      setPublications(pubsData.slice(0, 3)) // Show first 3 on home
      setPoems(poemsData.slice(0, 5)) // Show first 5 on home

      // Update meta tags for SEO
      updateMetaTags({
        title: 'Gurupratap Sharma | AAG',
        description: aboutData?.truncated_preview || 'Portfolio of poems, publications, and writings by Gurupratap Sharma.',
        url: window.location.href
      })
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Content not available')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button className="btn" onClick={loadData}>Refresh</button>
        <p style={{ marginTop: '16px' }}>
          <a href="tel:+917676885989" className="link">Call me</a>
        </p>
      </div>
    )
  }

  const aboutCategory = categories.find(c => c.content_type === 'about')
  const publicationsCategory = categories.find(c => c.content_type === 'publications')
  const writingsCategory = categories.find(c => c.content_type === 'writings')

  return (
    <div>
      {aboutCategory && (
        <CategoryCard
          category={aboutCategory}
          preview={aboutContent?.truncated_preview || aboutContent?.body_text?.substring(0, 150)}
        />
      )}

      {publicationsCategory && publications.length > 0 && (
        <CategoryCard category={publicationsCategory}>
          <div className="grid grid-3" style={{ marginBottom: '16px' }}>
            {publications.map((pub) => (
              <PublicationCard
                key={pub.id}
                publication={pub}
                supabaseUrl={supabaseUrl}
              />
            ))}
          </div>
        </CategoryCard>
      )}

      {writingsCategory && poems.length > 0 && (
        <CategoryCard category={writingsCategory}>
          <div style={{ marginBottom: '16px' }}>
            {poems.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        </CategoryCard>
      )}
    </div>
  )
}

export default Home

