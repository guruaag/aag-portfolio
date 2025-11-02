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
    <div>
      <h1 style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '24px' }}>
        {poem.heading || 'Untitled Poem'}
      </h1>
      
      {poem.description && (
        <p style={{ marginBottom: '16px', fontStyle: 'italic', color: '#666' }}>
          {poem.description}
        </p>
      )}

      <div 
        className="markdown-content"
        style={{
          whiteSpace: 'pre-wrap',
          lineHeight: '1.8',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e0e0e0',
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto'
        }}
      >
        {poem.full_text}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '20px',
        gap: '16px'
      }}>
        <button
          onClick={handlePrev}
          className="btn"
          disabled={!prevId}
          style={{
            opacity: prevId ? 1 : 0.5,
            cursor: prevId ? 'pointer' : 'not-allowed'
          }}
        >
          Previous Poem (Button)
        </button>
        <button
          onClick={handleNext}
          className="btn"
          disabled={!nextId}
          style={{
            opacity: nextId ? 1 : 0.5,
            cursor: nextId ? 'pointer' : 'not-allowed'
          }}
        >
          Next Poem (Button)
        </button>
      </div>
    </div>
  )
}

export default PoemDetail

