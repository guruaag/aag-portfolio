import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { getCategories, getAboutContent, getPublications, getPoems } from '../lib/supabaseClient'
import AboutPanel from '../components/AboutPanel'
import PublicationCard from '../components/PublicationCard'
import PoemCard from '../components/PoemCard'
import './CategoryDetail.css'

function CategoryDetail() {
  const { categoryId } = useParams()
  const { t } = useTranslation()
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
      // Support both UUID and slug-based routing
      let foundCategory = categories.find(c => c.id === categoryId)
      
      // If not found by ID, try to find by content_type slug
      if (!foundCategory) {
        const slugMap = {
          'publications': 'publications',
          'about': 'about',
          'poems': 'writings'
        }
        const contentType = slugMap[categoryId]
        if (contentType) {
          foundCategory = categories.find(c => c.content_type === contentType)
        }
      }
      
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

  if (error || !category) {
    return (
      <div className="phoenix-error">
        <p>{error || 'Category not found'}</p>
        <button className="phoenix-btn phoenix-btn-outline" onClick={loadCategory}>
          Refresh
        </button>
      </div>
    )
  }

  const categoryName = category.name_display || category.name_en

  return (
    <>
      <Helmet>
        <title>{categoryName} - Guru Pratap Sharma | AAG</title>
        <meta name="description" content={`${categoryName} - Literary works by Guru Pratap Sharma`} />
      </Helmet>

      <div className="phoenix-category-detail">
        {category.content_type === 'about' ? (
          <AboutPanel aboutContent={content} categoryName={categoryName} />
        ) : (
          <>
            {/* Section Header */}
            <motion.div
              className="phoenix-category-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="phoenix-category-title">
                {categoryName}
              </h1>
              <div className="phoenix-title-underline" />
            </motion.div>

            {/* Publications Grid */}
            {category.content_type === 'publications' && Array.isArray(content) && (
              <motion.div
                className="phoenix-publications-grid phoenix-publications-grid-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {content.map((pub, index) => (
                  <PublicationCard
                    key={pub.id}
                    publication={pub}
                    index={index}
                  />
                ))}
              </motion.div>
            )}

            {/* Poems List */}
            {category.content_type === 'writings' && Array.isArray(content) && (
              <motion.div
                className="phoenix-poems-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {content.map((poem, index) => (
                  <PoemCard key={poem.id} poem={poem} index={index} />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default CategoryDetail
