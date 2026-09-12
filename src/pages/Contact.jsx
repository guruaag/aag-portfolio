import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import './Contact.css'

function Contact() {
  const { t, i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const [settings, setSettings] = useState({
    phone: '',
    whatsapp: '',
    email: '',
    facebook: '',
    instagram: ''
  })
  const [loading, setLoading] = useState(true)

  // Interactive Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    loadContactInfo()
  }, [])

  const loadContactInfo = async () => {
    try {
      const { data } = await supabase.from('settings').select('*')
      if (data) {
        const settingsMap = {}
        data.forEach(s => {
          settingsMap[s.key] = s.value
        })
        setSettings(settingsMap)
      }
    } catch (err) {
      console.error('Error loading contact info:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleContactChannel = (type, value) => {
    if (!value) return
    switch (type) {
      case 'phone':
        window.location.href = `tel:${value}`
        break
      case 'whatsapp':
        window.open(value, '_blank')
        break
      case 'email':
        window.location.href = `mailto:${value}`
        break
      case 'facebook':
      case 'instagram':
        window.open(value, '_blank')
        break
      default:
        break
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFeedback(null)

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFeedback({
        type: 'error',
        msg: isHi ? 'कृपया अपना नाम, ईमेल और संदेश भरें।' : 'Please fill in your name, email, and message.'
      })
      return
    }

    try {
      const basePayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || (isHi ? 'वेबसाइट संदेश' : 'Website Message'),
        message: formData.message.trim(),
        created_at: new Date().toISOString()
      }

      let { error } = await supabase.from('contact_submissions').insert([basePayload])

      if (error && error.code === 'PGRST204') {
        const fallbackRes = await supabase.from('contact_submissions').insert([{
          name: basePayload.name,
          email: basePayload.email,
          message: basePayload.message
        }])
        error = fallbackRes.error
      }

      if (error) {
        throw error
      }

      setFeedback({
        type: 'success',
        msg: isHi
          ? '✓ आपका संदेश सफलतापूर्वक भेज दिया गया है! हम शीघ्र ही आपसे संपर्क करेंगे।'
          : '✓ Your message has been sent successfully! We will get back to you soon.'
      })

      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      console.error('Contact submission error:', err)
      setFeedback({
        type: 'error',
        msg: isHi ? 'संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Failed to send message. Please try again.'
      })
    } finally {
      setSubmitting(false)
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

  return (
    <>
      <Helmet>
        <title>{isHi ? 'संपर्क - गुरुप्रताप शर्मा \'आग\'' : 'Contact - Guru Pratap Sharma | AAG'}</title>
        <meta name="description" content="Get in touch with Guru Pratap Sharma" />
      </Helmet>

      <motion.div
        className="phoenix-contact"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="phoenix-content" style={{ paddingTop: 'var(--phoenix-space-lg)' }}>
          <motion.h1
            className="phoenix-contact-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {isHi ? 'संपर्क सूत्र' : (t('nav.contact') || 'Contact')}
          </motion.h1>

          <motion.p
            className="phoenix-contact-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {isHi 
              ? 'आप सीधे संदेश भेजकर या अन्य माध्यमों से कवि गुरुप्रताप शर्मा \'आग\' से संपर्क कर सकते हैं' 
              : 'Get in touch directly by sending a message below'}
          </motion.p>

          {/* Interactive Direct Message Form */}
          <motion.div
            className="phoenix-contact-form-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <h2 className="phoenix-form-title">
              ✉️ {isHi ? 'सीधा संदेश भेजें (Direct Message)' : 'Send a Direct Message'}
            </h2>

            {feedback && (
              <div className={`phoenix-feedback-banner ${feedback.type}`}>
                {feedback.msg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="phoenix-contact-form">
              <div className="phoenix-form-grid">
                <div className="phoenix-form-group">
                  <label htmlFor="contact-name">{isHi ? 'आपका नाम *' : 'Your Name *'}</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder={isHi ? 'जैसे: राजेश कुमार' : 'e.g. Rajesh Kumar'}
                    required
                  />
                </div>
                <div className="phoenix-form-group">
                  <label htmlFor="contact-email">{isHi ? 'आपका ईमेल *' : 'Your Email *'}</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder={isHi ? 'जैसे: rajesh@example.com' : 'e.g. rajesh@example.com'}
                    required
                  />
                </div>
              </div>

              <div className="phoenix-form-group full-width">
                <label htmlFor="contact-subject">{isHi ? 'विषय' : 'Subject'}</label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder={isHi ? 'जैसे: काव्य सम्मेलन आमंत्रण / प्रतिक्रिया' : 'e.g. Event Invitation / Feedback'}
                />
              </div>

              <div className="phoenix-form-group full-width">
                <label htmlFor="contact-message">{isHi ? 'आपका संदेश *' : 'Your Message *'}</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  rows={5}
                  placeholder={isHi ? 'यहाँ अपना विस्तृत संदेश लिखें...' : 'Type your detailed message here...'}
                  required
                />
              </div>

              <button
                type="submit"
                className="phoenix-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? (isHi ? '⏳ भेजा जा रहा है...' : '⏳ Sending...')
                  : (isHi ? '📨 भेजें' : '📨 Send')}
              </button>
            </form>
          </motion.div>

          <h3 style={{ textAlign: 'center', marginTop: '48px', marginBottom: '24px', fontFamily: 'var(--phoenix-font-serif)', fontSize: '1.35rem', color: 'var(--phoenix-charcoal)' }}>
            {isHi ? 'अथवा अन्य माध्यमों से जुड़ें' : 'Or connect via social channels'}
          </h3>

          <div className="phoenix-contact-grid">
            {settings.phone && (
              <motion.button
                className="phoenix-contact-card"
                onClick={() => handleContactChannel('phone', settings.phone)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="phoenix-contact-card-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <h3>{isHi ? 'दूरभाष (Phone)' : 'Phone'}</h3>
                <p>{settings.phone}</p>
              </motion.button>
            )}

            {settings.whatsapp && (
              <motion.button
                className="phoenix-contact-card"
                onClick={() => handleContactChannel('whatsapp', settings.whatsapp)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="phoenix-contact-card-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <h3>{isHi ? 'व्हाट्सएप (WhatsApp)' : 'WhatsApp'}</h3>
                <p>{isHi ? 'संदेश भेजें' : 'Message me'}</p>
              </motion.button>
            )}

            {settings.email && (
              <motion.button
                className="phoenix-contact-card"
                onClick={() => handleContactChannel('email', settings.email)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="phoenix-contact-card-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <h3>{isHi ? 'ईमेल (Email)' : 'Email'}</h3>
                <p>{settings.email}</p>
              </motion.button>
            )}

            {settings.facebook && (
              <motion.button
                className="phoenix-contact-card"
                onClick={() => handleContactChannel('facebook', settings.facebook)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="phoenix-contact-card-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <h3>{isHi ? 'फ़ेसबुक (Facebook)' : 'Facebook'}</h3>
                <p>{isHi ? 'जुड़ें' : 'Follow me'}</p>
              </motion.button>
            )}

            {settings.instagram && (
              <motion.button
                className="phoenix-contact-card"
                onClick={() => handleContactChannel('instagram', settings.instagram)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="phoenix-contact-card-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </div>
                <h3>{isHi ? 'इंस्टाग्राम (Instagram)' : 'Instagram'}</h3>
                <p>{isHi ? 'फ़ॉलो करें' : 'Follow me'}</p>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Contact
