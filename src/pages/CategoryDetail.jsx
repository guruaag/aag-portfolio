import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { getCategories, getAboutContent, getPublications, getPoems } from '../lib/supabaseClient'
import { sanitizeText, sanitizePoem, sanitizePublication } from '../lib/dataSanitizer'
import AboutPanel from '../components/AboutPanel'
import PublicationCard from '../components/PublicationCard'
import PoemCard from '../components/PoemCard'
import PoetryFocusView from '../components/PoetryFocusView'
import BookFocusView from '../components/BookFocusView'
import './CategoryDetail.css'

function CategoryDetail() {
  const { categoryId } = useParams()
  const { t, i18n } = useTranslation()
  const [category, setCategory] = useState(null)
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Focus view states
  const [focusPoemId, setFocusPoemId] = useState(null)
  const [focusPubId, setFocusPubId] = useState(null)

  useEffect(() => {
    // Scroll to top and reset focus states when category changes
    window.scrollTo({ top: 0, behavior: 'instant' })
    setFocusPoemId(null)
    setFocusPubId(null)
    loadCategory()
  }, [categoryId])

  const loadCategory = async () => {
    try {
      setLoading(true)
      setError(null)

      const categories = await getCategories().catch(() => [])
      let foundCategory = Array.isArray(categories) ? categories.find(c => c.id === categoryId) : null
      
      const slugMap = {
        'publications': 'publications',
        'prakashan': 'publications',
        'books': 'publications',
        'about': 'about',
        'parichay': 'about',
        'poems': 'writings',
        'kavya-sangrah': 'writings',
        'poetry': 'writings'
      }
      const contentType = slugMap[categoryId] || categoryId

      if (!foundCategory && contentType && Array.isArray(categories)) {
        foundCategory = categories.find(c => c.content_type === contentType)
      }
      
      // Fallback synthetic category objects for system routes
      if (!foundCategory) {
        if (contentType === 'about' || categoryId === 'about' || categoryId === 'parichay') {
          foundCategory = { id: 'about', content_type: 'about', name_display: 'कवि परिचय', name_hi: 'कवि परिचय', name_en: 'About' }
        } else if (contentType === 'publications' || categoryId === 'publications' || categoryId === 'prakashan' || categoryId === 'books') {
          foundCategory = { id: 'publications', content_type: 'publications', name_display: 'पुस्तकें', name_hi: 'पुस्तकें', name_en: 'Books' }
        } else if (contentType === 'writings' || categoryId === 'poems' || categoryId === 'kavya-sangrah' || categoryId === 'poetry') {
          foundCategory = { id: 'poems', content_type: 'writings', name_display: 'काव्य संग्रह', name_hi: 'काव्य संग्रह', name_en: 'Poetry' }
        }
      }
      
      if (!foundCategory) {
        setError('Category not found')
        return
      }

      setCategory(foundCategory)

      if (foundCategory.content_type === 'about') {
        const [aboutData, timelineData, awardsData] = await Promise.all([
          getAboutContent().catch(() => null),
          getTimeline().catch(() => []),
          getAwards().catch(() => [])
        ])
        setContent({
          ...(aboutData || {}),
          truncated_preview: aboutData?.truncated_preview ? sanitizeText(aboutData.truncated_preview) : '',
          timeline: timelineData || [],
          awards: awardsData || []
        })
      } else if (foundCategory.content_type === 'publications') {
        const pubsData = await getPublications().catch(() => [])
        setContent((pubsData || []).map(sanitizePublication).filter(Boolean))
      } else if (foundCategory.content_type === 'writings') {
        const poemsData = await getPoems().catch(() => [])
        setContent((poemsData || []).map(sanitizePoem).filter(Boolean))
      }
    } catch (err) {
      console.error('Error loading category:', err)
      setError('Content not available')
    } finally {
      setLoading(false)
    }
  }

  // Focus view helpers
  const sortedPoems = Array.isArray(content) && category?.content_type === 'writings'
    ? [...content].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : []

  const focusPoem = focusPoemId ? sortedPoems.find(p => p.id === focusPoemId) ?? null : null
  const focusPub = focusPubId && Array.isArray(content) && category?.content_type === 'publications'
    ? content.find(p => p.id === focusPubId) ?? null
    : null

  const openFocus = useCallback((poemId) => setFocusPoemId(poemId), [])
  const closeFocus = useCallback(() => setFocusPoemId(null), [])
  const goToPrevPoem = useCallback((id) => id && setFocusPoemId(id), [])
  const goToNextPoem = useCallback((id) => id && setFocusPoemId(id), [])

  const openPubFocus = useCallback((pubId) => setFocusPubId(pubId), [])
  const closePubFocus = useCallback(() => setFocusPubId(null), [])

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

  if (error || !category) {
    return (
      <div className="phoenix-error">
        <p>{error || (i18n.language === 'hi' ? 'श्रेणी नहीं मिली' : 'Category not found')}</p>
        <button className="phoenix-btn phoenix-btn-outline" onClick={loadCategory}>
          {i18n.language === 'hi' ? 'पुनः प्रयास करें' : 'Refresh'}
        </button>
      </div>
    )
  }

  const getCategoryName = () => {
    if (category.content_type === 'publications') {
      return t('nav.publications') || (i18n.language === 'hi' ? 'पुस्तकें' : 'Books')
    } else if (category.content_type === 'writings') {
      return t('nav.poems') || (i18n.language === 'hi' ? 'काव्य संग्रह' : 'Poetry')
    } else if (category.content_type === 'about') {
      return t('nav.about') || (i18n.language === 'hi' ? 'कवि परिचय' : 'About')
    }
    return category.name_display || category.name_hi || category.name_en
  }

  const categoryName = getCategoryName()

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
              <h1 
                className="phoenix-category-title phoenix-section-title-link"
                style={{ cursor: 'pointer' }}
              >
                {categoryName}
              </h1>
              <div className="phoenix-title-underline" />
            </motion.div>

            {/* Empty State */}
            {Array.isArray(content) && content.length === 0 && (
              <div className="phoenix-empty-state" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--phoenix-text-secondary)' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                  {i18n.language === 'hi' ? 'इस संग्रह में अभी कोई रचना उपलब्ध नहीं है।' : 'No items published in this collection yet.'}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>
                  {i18n.language === 'hi' ? 'शीघ्र ही नई प्रस्तुतियां जोड़ी जाएंगी।' : 'New content will be added soon.'}
                </p>
              </div>
            )}

            {/* Publications Grid — opens full-screen focus view on card click */}
            {category.content_type === 'publications' && Array.isArray(content) && content.length > 0 && (
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
                    onOpenFocus={openPubFocus}
                  />
                ))}
              </motion.div>
            )}

            {/* Poems Grid — opens focus view on card click */}
            {category.content_type === 'writings' && Array.isArray(content) && content.length > 0 && (
              <motion.div
                className="phoenix-poems-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {sortedPoems.map((poem, index) => (
                  <PoemCard
                    key={poem.id}
                    poem={poem}
                    index={index}
                    hideBadge={true}
                    onOpenFocus={openFocus}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Full-Screen Focus View Overlays */}
      {focusPoem && (
        <PoetryFocusView
          poem={focusPoem}
          poems={sortedPoems}
          onClose={closeFocus}
          onPrevPoem={goToPrevPoem}
          onNextPoem={goToNextPoem}
        />
      )}

      {focusPub && (
        <BookFocusView
          publication={focusPub}
          onClose={closePubFocus}
        />
      )}
    </>
  )
}

export default CategoryDetail
