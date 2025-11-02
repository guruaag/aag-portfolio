import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function PoemDetail({ poem, allPoems }) {
  const navigate = useNavigate()
  const [prevId, setPrevId] = useState(null)
  const [nextId, setNextId] = useState(null)

  useEffect(() => {
    if (!poem || !allPoems || allPoems.length === 0) return

    const sortedPoems = [...allPoems].sort((a, b) => a.sort_order - b.sort_order)
    const currentIndex = sortedPoems.findIndex(p => p.id === poem.id)

    if (currentIndex === -1) return

    // Looping logic
    const prevIndex = currentIndex === 0 ? sortedPoems.length - 1 : currentIndex - 1
    const nextIndex = currentIndex === sortedPoems.length - 1 ? 0 : currentIndex + 1

    setPrevId(sortedPoems[prevIndex].id)
    setNextId(sortedPoems[nextIndex].id)
  }, [poem, allPoems])

  const handlePrev = () => {
    if (prevId) navigate(`/poem/${prevId}`)
  }

  const handleNext = () => {
    if (nextId) navigate(`/poem/${nextId}`)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [prevId, nextId])

  if (!poem) return null

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
      <h1 style={{ 
        color: '#1a1a1a', 
        marginBottom: '12px', 
        fontSize: '32px',
        fontFamily: 'Georgia, Times New Roman, serif',
        fontWeight: 700,
        lineHeight: 1.2
      }}>
        {poem.heading || 'Untitled Poem'}
      </h1>
      
      {poem.description && (
        <p style={{ 
          marginBottom: '32px', 
          fontStyle: 'italic', 
          color: '#666',
          fontSize: '16px',
          lineHeight: 1.6
        }}>
          {poem.description}
        </p>
      )}

      <div 
        className="markdown-content"
        style={{
          whiteSpace: 'pre-wrap',
          lineHeight: '2',
          marginBottom: '48px',
          paddingBottom: '32px',
          borderBottom: '1px solid #e8e8e8',
          color: '#2a2a2a',
          fontSize: '17px',
          fontFamily: 'var(--font-family-main)'
        }}
      >
        {poem.full_text}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handlePrev}
          className="btn"
          disabled={!prevId}
          style={{
            opacity: prevId ? 1 : 0.5,
            cursor: prevId ? 'pointer' : 'not-allowed',
            flex: '1',
            minWidth: '140px'
          }}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          className="btn"
          disabled={!nextId}
          style={{
            opacity: nextId ? 1 : 0.5,
            cursor: nextId ? 'pointer' : 'not-allowed',
            flex: '1',
            minWidth: '140px'
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default PoemDetail

