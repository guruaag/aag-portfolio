import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublication } from '../lib/supabaseClient'
import { updateMetaTags } from '../lib/metaTags'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

function PublicationPage() {
  const { id } = useParams()
  const [publication, setPublication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPublication()
  }, [id])

  const loadPublication = async () => {
    try {
      setLoading(true)
      setError(null)

      const pubData = await getPublication(id)
      setPublication(pubData)

      // Update meta tags for SEO
      if (pubData) {
        const imageUrl = pubData.image_path
          ? `${supabaseUrl}/storage/v1/object/public/public-assets/${pubData.image_path}`
          : null
        updateMetaTags({
          title: `${pubData.title || 'Publication'} - Gurupratap Sharma | AAG`,
          description: pubData.description || pubData.subtitle || '',
          image: imageUrl,
          url: window.location.href
        })
      }
    } catch (err) {
      console.error('Error loading publication:', err)
      setError('Content not available')
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error || !publication) {
    return (
      <div className="error">
        <p>{error || 'Publication not found'}</p>
        <button className="btn" onClick={loadPublication}>Refresh</button>
        <p style={{ marginTop: '16px' }}>
          <a href="tel:+917676885989" className="link">Call me</a>
        </p>
      </div>
    )
  }

  const imageUrl = publication.image_path
    ? `${supabaseUrl}/storage/v1/object/public/public-assets/${publication.image_path}`
    : null

  return (
    <div>
      <h1 style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '24px' }}>
        {publication.title}
      </h1>
      
      {publication.subtitle && (
        <h2 style={{ marginBottom: '16px', fontSize: '18px', color: '#666' }}>
          {publication.subtitle}
        </h2>
      )}

      {imageUrl && (
        <div style={{
          marginBottom: '24px',
          border: '2px solid var(--accent)',
          padding: '16px',
          background: '#f5f5f5',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          <img
            src={imageUrl}
            alt={publication.image_alt || publication.title}
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              const placeholder = e.target.nextSibling
              if (placeholder) placeholder.style.display = 'block'
            }}
          />
          <div style={{ display: 'none', textAlign: 'center', color: '#999' }}>
            Image not available
          </div>
        </div>
      )}

      {publication.description && (
        <div className="markdown-content" style={{ lineHeight: '1.8' }}>
          {publication.description}
        </div>
      )}
    </div>
  )
}

export default PublicationPage

