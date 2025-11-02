import { useEffect } from 'react'
import { getSetting } from '../lib/supabaseClient'
import ColorSwatches from './ColorSwatches'

const COLOR_SWATCHES = [
  '#964B00', // Dark Orange
  '#A52A2A', // Maroon/Red
  '#000000', // Black
  '#808080', // Grey
  '#808000', // Olive
  '#800080', // Purple
  '#0000FF'  // Blue
]

function MenuOverlay({ onClose, onAccentChange, accentColor }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleCallMe = () => {
    window.location.href = 'tel:+917676885989'
  }

  const handleWhatsApp = () => {
    window.open('https://wa.me/917676885989', '_blank')
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
      aria-hidden={false}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div
        style={{
          background: 'white',
          border: '2px solid var(--accent)',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--accent)'
          }}
          aria-label="Close menu"
        >
          ×
        </button>

        <h2 style={{ color: 'var(--accent)', marginBottom: '8px' }}>
          Contact
        </h2>

        <button
          onClick={handleCallMe}
          className="btn"
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '12px'
          }}
          aria-label="Call +917676885989"
        >
          Call me (+917676885989)
        </button>

        <button
          onClick={handleWhatsApp}
          className="btn"
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '12px'
          }}
          aria-label="WhatsApp me"
        >
          Whatsapp me
        </button>

        <div style={{ marginTop: '20px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px', textAlign: 'center' }}>
            Theme Colors
          </h2>
          <ColorSwatches
            colors={COLOR_SWATCHES}
            activeColor={accentColor}
            onColorSelect={onAccentChange}
          />
        </div>
      </div>
    </div>
  )
}

export default MenuOverlay

