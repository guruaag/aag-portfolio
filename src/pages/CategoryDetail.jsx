import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCategories, getAboutContent, getPublications, getPoems } from '../lib/supabaseClient'
import AboutPanel from '../components/AboutPanel'
import PublicationCard from '../components/PublicationCard'
import PoemCard from '../components/PoemCard'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

function CategoryDetail() {
  const { categoryId } = useParams()
  const [category, setCategory] = useState(null)
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCategory()
  }, [categoryId])

  const loadCategory = async () => {
    try {
      setLoading(true)
      setError(null)

      const categories = await getCategories()
      const foundCategory = categories.find(c => c.id === categoryId)
      
      if (!foundCategory) {
        setError('Category not found')
        return
      }

      setCategory(foundCategory)

      if (foundCategory.content_type === 'about') {
        const aboutData = await getAboutContent()
        setContent(aboutData)
      } else if (foundCategory.content_type === 'publications') {
        const pubsData = await getPublications()
        setContent(pubsData)
      } else if (foundCategory.content_type === 'writings') {
        const poemsData = await getPoems()
        setContent(poemsData)
      }
    } catch (err) {
      console.error('Error loading category:', err)
      setError('Content not available')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error || !category) {
    return (
      <div className="error">
        <p>{error || 'Category not found'}</p>
        <button className="btn" onClick={loadCategory}>Refresh</button>
        <p style={{ marginTop: '16px' }}>
          <a href="tel:+917676885989" className="link">Call me</a>
        </p>
      </div>
    )
  }

  return (
    <div>
      {category.content_type === 'about' ? (
        <AboutPanel aboutContent={content} categoryName={category.name_display || category.name_en} />
      ) : (
        <>
          <h1 style={{ color: 'var(--accent)', marginBottom: '24px', fontSize: '24px' }}>
            {category.name_display || category.name_en}
          </h1>
          {category.content_type === 'publications' && Array.isArray(content) && (
            <div className="grid grid-3">
              {content.map((pub) => (
                <PublicationCard
                  key={pub.id}
                  publication={pub}
                  supabaseUrl={supabaseUrl}
                />
              ))}
            </div>
          )}
          {category.content_type === 'writings' && Array.isArray(content) && (
            <div>
              {content.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  )
}

export default CategoryDetail

