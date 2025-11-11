import { useEffect, useState } from 'react'
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
  const [phone, setPhone] = useState('+917676885989')
  const [phoneText, setPhoneText] = useState('Call me')
  const [whatsapp, setWhatsapp] = useState('https://wa.me/917676885989')
  const [whatsappText, setWhatsappText] = useState('Whatsapp me')
  const [email, setEmail] = useState('')
  const [emailText, setEmailText] = useState('Email me')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    loadSettings()
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const loadSettings = async () => {
    try {
      const [phoneVal, phoneTextVal, whatsappVal, whatsappTextVal, emailVal, emailTextVal] = await Promise.all([
        getSetting('phone'),
        getSetting('phone_text'),
        getSetting('whatsapp'),
        getSetting('whatsapp_text'),
        getSetting('email'),
        getSetting('email_text')
      ])
      if (phoneVal) setPhone(phoneVal)
      if (phoneTextVal) setPhoneText(phoneTextVal)
      if (whatsappVal) setWhatsapp(whatsappVal)
      if (whatsappTextVal) setWhatsappText(whatsappTextVal)
      if (emailVal) setEmail(emailVal)
      if (emailTextVal) setEmailText(emailTextVal)
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const handleCallMe = () => {
    window.location.href = `tel:${phone}`
  }

  const handleWhatsApp = () => {
    window.open(whatsapp, '_blank')
  }

  const handleEmail = () => {
    window.location.href = `mailto:${email}`
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
          background: 'var(--bg-white)',
          border: '1px solid var(--border-light)',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
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
          aria-label={`Call ${phone}`}
        >
          {phoneText} ({phone})
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
          {whatsappText}
        </button>

        {email && (
          <button
            onClick={handleEmail}
            className="btn"
            style={{
              width: '100%',
              textAlign: 'center',
              padding: '12px'
            }}
            aria-label={`Email ${email}`}
          >
            {emailText}
          </button>
        )}

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

