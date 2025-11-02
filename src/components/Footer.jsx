import { useNavigate } from 'react-router-dom'
import Toast from './Toast'
import { useState } from 'react'

function Footer() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  const handleBack = () => {
    navigate('/')
  }

  const handleThankYou = () => {
    setToast('Thank you!')
    setTimeout(() => setToast(null), 2500)
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gurupratap Sharma | AAG',
          url: url
        })
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setToast('Link copied to clipboard!')
        setTimeout(() => setToast(null), 2500)
      } catch (err) {
        setToast('Unable to copy link')
        setTimeout(() => setToast(null), 2500)
      }
    }
  }

  const handleAdmin = () => {
    navigate('/admin')
  }

  return (
    <>
      <footer
        style={{
          height: 'var(--footer-height)',
          borderTop: '2px solid var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--content-padding)',
          background: 'white',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }}
      >
        <button
          onClick={handleBack}
          className="btn"
          style={{
            fontSize: 'clamp(12px, 3vw, 14px)',
            padding: '6px 12px'
          }}
        >
          Back
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <button
            onClick={handleThankYou}
            className="btn"
            style={{
              fontSize: 'clamp(12px, 3vw, 14px)',
              padding: '6px 12px'
            }}
          >
            Thank You
          </button>
          <span
            onClick={handleAdmin}
            style={{
              fontSize: '8px',
              color: '#999',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            admin only
          </span>
        </div>

        <button
          onClick={handleShare}
          className="btn"
          style={{
            fontSize: 'clamp(12px, 3vw, 14px)',
            padding: '6px 12px'
          }}
        >
          Share
        </button>
      </footer>
      {toast && <Toast message={toast} />}
    </>
  )
}

export default Footer

