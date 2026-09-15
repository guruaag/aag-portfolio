import { useNavigate } from 'react'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import PoetryFocusView from './PoetryFocusView'
import { getImageUrl } from '../lib/imageUtils'
import './PoemDetail.css'

function PoemDetail({ poem, allPoems = [] }) {
  const navigate = useNavigate()
  const { i18n } = useTranslation()

  const handleClose = () => {
    navigate('/category/poems')
  }

  if (!poem) return null

  const poemTitle = i18n.language === 'hi'
    ? (poem.heading_hi || poem.heading_en || poem.heading || 'Untitled Poem')
    : (poem.heading_en || poem.heading_hi || poem.heading || 'Untitled Poem')

  const poemContent = poem.pages || poem.body_text_hi || poem.body_text_en || poem.full_text || ''
  const poemImage = poem.image_path ? getImageUrl(poem.image_path) : null
  const pageUrl = window.location.href

  return (
    <>
      <Helmet>
        <title>{poemTitle} - Guru Pratap Sharma 'Aag' | Aag Poetry</title>
        <meta name="description" content={(typeof poemContent === 'string' ? poemContent : poemContent.join(' '))?.substring(0, 160) || `Read ${poemTitle} by Hindi poet Guru Pratap Sharma 'Aag'.`} />
        {poemImage && <meta property="og:image" content={poemImage} />}
        <meta property="og:title" content={`${poemTitle} - Guru Pratap Sharma 'Aag'`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
      </Helmet>

      {/* Render exact same clean modal component as poetry focus view */}
      <PoetryFocusView
        poem={poem}
        poems={allPoems}
        onClose={handleClose}
      />
    </>
  )
}

export default PoemDetail
