import { useState, useEffect } from 'react'
import { getSetting } from '../lib/supabaseClient'

function ThankYouPopup({ onClose }) {
  const [message, setMessage] = useState('Thank you!')

  useEffect(() => {
    loadMessage()
  }, [])

  const loadMessage = async () => {
    try {
      const msg = await getSetting('thank_you_message')
      if (msg) setMessage(msg)
    } catch (err) {
      console.error('Error loading thank you message:', err)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          textAlign: 'center'
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
            color: '#999',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close"
        >
          ×
        </button>
        <div style={{
          fontSize: '24px',
          color: 'var(--accent)',
          marginBottom: '16px',
          fontWeight: 600
        }}>
          {message}
        </div>
      </div>
    </div>
  )
}

export default ThankYouPopup


