import re

# 1. Update src/styles/mobile-fixes.css
css_path = '/Users/sankalpg/Documents/Project/aag/src/styles/mobile-fixes.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

target_css = """input,
textarea,
select {
  font-size: 16px !important;
  -webkit-appearance: none;
  appearance: none;
}"""

replacement_css = """input:not([type="checkbox"]):not([type="radio"]),
textarea,
select {
  font-size: 16px !important;
  -webkit-appearance: none;
  appearance: none;
}

input[type="checkbox"] {
  -webkit-appearance: checkbox !important;
  appearance: checkbox !important;
  width: 18px !important;
  height: 18px !important;
  cursor: pointer !important;
  accent-color: #B85C38 !important;
  display: inline-block !important;
  opacity: 1 !important;
  visibility: visible !important;
}"""

if target_css in css_content:
    css_content = css_content.replace(target_css, replacement_css)
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css_content)
    print("Updated mobile-fixes.css")
else:
    print("mobile-fixes.css target not found")

# 2. Update src/pages/Admin/Dashboard.jsx
dash_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
with open(dash_path, 'r', encoding='utf-8') as f:
    dash_content = f.read()

old_form_func = """function ContactInfoForm({ settings, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()

  const renderLabelWithToggle = (labelHi, labelEn, key) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <label style={{ margin: 0 }}>{tLabel(labelHi, labelEn)}</label>
      <label style={{ margin: 0, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--admin-text-secondary, #666)' }}>
        <input
          type="checkbox"
          checked={formData[key] === 'true'}
          onChange={e => setFormData({ ...formData, [key]: e.target.checked ? 'true' : 'false' })}
        />
        {tLabel('साइट पर दिखाएं', 'Show on site')}
      </label>
    </div>
  )
 const [formData, setFormData] = useState({
 phone: '',
 phone_text: '',
 whatsapp: '',
 whatsapp_text: '',
 email: '',
 email_text: '',
 address: '',
 facebook: '',
 instagram: '',
 twitter: '',
 linkedin: '',
 youtube: ''
 })

 useEffect(() => {
 if (settings) {
 setFormData({
 phone: settings.phone || '+91 76768 85989',
 phone_text: settings.phone_text || 'कॉल करें',
 whatsapp: settings.whatsapp || 'https://wa.me/917676885989',
 whatsapp_text: settings.whatsapp_text || 'व्हाट्सएप करें',
 email: settings.email || 'contact@gurupratapsharma.com',
 email_text: settings.email_text || 'ईमेल भेजें',
 address: settings.address || 'साहित्य सदन, सिविल लाइन्स, जयपुर (राजस्थान), भारत - 302006',
 facebook: settings.facebook || '',
 instagram: settings.instagram || '',
 twitter: settings.twitter || '',
 linkedin: settings.linkedin || '',
 youtube: settings.youtube || ''
 })
 }
 }, [settings])"""

new_form_func = """function ContactInfoForm({ settings, onUpdate, setIsDirty }) {
  const { tLabel } = useAdminLang()

  const [formData, setFormData] = useState({
    phone: '',
    phone_text: '',
    enable_phone: 'true',
    whatsapp: '',
    whatsapp_text: '',
    enable_whatsapp: 'true',
    email: '',
    email_text: '',
    enable_email: 'true',
    address: '',
    facebook: '',
    enable_facebook: 'true',
    instagram: '',
    enable_instagram: 'true',
    twitter: '',
    enable_twitter: 'true',
    linkedin: '',
    enable_linkedin: 'true',
    youtube: '',
    enable_youtube: 'true'
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        phone: settings.phone || '+91 76768 85989',
        phone_text: settings.phone_text || 'कॉल करें',
        enable_phone: settings.enable_phone !== undefined ? settings.enable_phone : 'true',
        whatsapp: settings.whatsapp || 'https://wa.me/917676885989',
        whatsapp_text: settings.whatsapp_text || 'व्हाट्सएप करें',
        enable_whatsapp: settings.enable_whatsapp !== undefined ? settings.enable_whatsapp : 'true',
        email: settings.email || 'contact@gurupratapsharma.com',
        email_text: settings.email_text || 'ईमेल भेजें',
        enable_email: settings.enable_email !== undefined ? settings.enable_email : 'true',
        address: settings.address || 'साहित्य सदन, सिविल लाइन्स, जयपुर (राजस्थान), भारत - 302006',
        facebook: settings.facebook || '',
        enable_facebook: settings.enable_facebook !== undefined ? settings.enable_facebook : 'true',
        instagram: settings.instagram || '',
        enable_instagram: settings.enable_instagram !== undefined ? settings.enable_instagram : 'true',
        twitter: settings.twitter || '',
        enable_twitter: settings.enable_twitter !== undefined ? settings.enable_twitter : 'true',
        linkedin: settings.linkedin || '',
        enable_linkedin: settings.enable_linkedin !== undefined ? settings.enable_linkedin : 'true',
        youtube: settings.youtube || '',
        enable_youtube: settings.enable_youtube !== undefined ? settings.enable_youtube : 'true'
      })
    }
  }, [settings])

  const renderLabelWithToggle = (labelHi, labelEn, key) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <label style={{ margin: 0, fontWeight: 600 }}>{tLabel(labelHi, labelEn)}</label>
      <label style={{ margin: 0, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', color: formData[key] === 'true' ? '#2e7d32' : '#888', fontWeight: 500, userSelect: 'none' }}>
        <input
          type="checkbox"
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#B85C38', appearance: 'checkbox', WebkitAppearance: 'checkbox', opacity: 1, visibility: 'visible', margin: 0 }}
          checked={formData[key] === 'true'}
          onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.checked ? 'true' : 'false' }))}
        />
        {tLabel('साइट पर दिखाएं', 'Show on site')}
      </label>
    </div>
  )"""

if old_form_func in dash_content:
    dash_content = dash_content.replace(old_form_func, new_form_func)
    with open(dash_path, 'w', encoding='utf-8') as f:
        f.write(dash_content)
    print("Updated Dashboard.jsx")
else:
    print("Dashboard.jsx target not found")

# 3. Update src/pages/Contact.jsx
contact_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Contact.jsx'
with open(contact_path, 'r', encoding='utf-8') as f:
    contact_content = f.read()

old_load_contact = """  const loadContactInfo = async () => {
    try {
      const { data } = await supabase.from('settings').select('*')
      if (data && data.length > 0) {
        const settingsMap = {}
        data.forEach(s => {
          if (s.value && s.value.trim() !== '') {
            settingsMap[s.key] = s.value
          }
        })
        setSettings(prev => ({ ...prev, ...settingsMap }))
      }
    } catch (err) {
      console.error('Error loading contact info:', err)
    } finally {
      setLoading(false)
    }
  }

  const isChannelVisible = (key) => {
    const val = settings[key]
    const enabled = settings['enable_' + key]
    return val && val.trim() !== '' && enabled !== 'false'
  }"""

new_load_contact = """  const loadContactInfo = async () => {
    try {
      const { data } = await supabase.from('settings').select('*')
      if (data && data.length > 0) {
        const settingsMap = {}
        data.forEach(s => {
          if (s && s.key) {
            settingsMap[s.key] = s.value !== undefined && s.value !== null ? s.value : ''
          }
        })
        setSettings(prev => ({ ...prev, ...settingsMap }))
      }
    } catch (err) {
      console.error('Error loading contact info:', err)
    } finally {
      setLoading(false)
    }
  }

  const isChannelVisible = (key) => {
    const val = settings[key]
    const enabled = settings['enable_' + key]
    if (enabled !== undefined && enabled !== null && enabled !== '') {
      return enabled === 'true' && val !== undefined && val !== null && val.trim() !== ''
    }
    return val !== undefined && val !== null && val.trim() !== ''
  }"""

if old_load_contact in contact_content:
    contact_content = contact_content.replace(old_load_contact, new_load_contact)
    with open(contact_path, 'w', encoding='utf-8') as f:
        f.write(contact_content)
    print("Updated Contact.jsx")
else:
    print("Contact.jsx target not found")

# 4. Update src/components/Footer.jsx
footer_path = '/Users/sankalpg/Documents/Project/aag/src/components/Footer.jsx'
with open(footer_path, 'r', encoding='utf-8') as f:
    footer_content = f.read()

old_footer_func = """  const loadSocialLinks = async () => {
    try {
      const { data } = await supabase.from('settings').select('*')
      if (data) {
        const links = {}
        data.forEach(s => {
          if (['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'whatsapp'].includes(s.key)) {
            links[s.key] = s.value || ''
          }
        })
        setSocialLinks(links)
      }
    } catch (err) {
      console.error('Error loading social links:', err)
    }
  }

  const isSocialVisible = (key) => {
    const val = socialLinks[key]
    const enabled = socialLinks['enable_' + key]
    return val && val.trim() !== '' && enabled !== 'false'
  }"""

new_footer_func = """  const loadSocialLinks = async () => {
    try {
      const { data } = await supabase.from('settings').select('*')
      if (data) {
        const links = {}
        data.forEach(s => {
          if (s && s.key) {
            links[s.key] = s.value !== undefined && s.value !== null ? s.value : ''
          }
        })
        setSocialLinks(links)
      }
    } catch (err) {
      console.error('Error loading social links:', err)
    }
  }

  const isSocialVisible = (key) => {
    const val = socialLinks[key]
    const enabled = socialLinks['enable_' + key]
    if (enabled !== undefined && enabled !== null && enabled !== '') {
      return enabled === 'true' && val !== undefined && val !== null && val.trim() !== ''
    }
    return val !== undefined && val !== null && val.trim() !== ''
  }"""

if old_footer_func in footer_content:
    footer_content = footer_content.replace(old_footer_func, new_footer_func)
    with open(footer_path, 'w', encoding='utf-8') as f:
        f.write(footer_content)
    print("Updated Footer.jsx")
else:
    print("Footer.jsx target not found")
