import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getCategories, getAboutContent, getPublications, getPoems, getSetting } from '../../lib/supabaseClient'
import { uploadImage, getImageUrl, deleteImage } from '../../lib/imageUtils'
import PM5WritingDesk from '../../components/PM5WritingDesk'
import i18n from '../../i18n/config'
import './AdminDashboard.css'

const AdminLangContext = createContext({
  adminLang: 'hi',
  setAdminLang: () => {},
  toggleAdminLang: () => {},
  tLabel: (hi, en) => hi
})

export function useAdminLang() {
  return useContext(AdminLangContext)
}

function AdminDashboard({ tab }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(tab || 'categories')
  const [loading, setLoading] = useState(false)
  const [adminLang, setAdminLangState] = useState(() => localStorage.getItem('siteLanguage') || (i18n.language === 'en' ? 'en' : 'hi'))

  useEffect(() => {
    const handleLangChange = () => {
      const current = localStorage.getItem('siteLanguage') || (i18n.language === 'en' ? 'en' : 'hi')
      setAdminLangState(current)
    }
    window.addEventListener('languageChange', handleLangChange)
    window.addEventListener('storage', handleLangChange)
    if (i18n && i18n.on) {
      i18n.on('languageChanged', handleLangChange)
    }
    return () => {
      window.removeEventListener('languageChange', handleLangChange)
      window.removeEventListener('storage', handleLangChange)
      if (i18n && i18n.off) {
        i18n.off('languageChanged', handleLangChange)
      }
    }
  }, [])

  const toggleAdminLang = () => {
    const nextLang = adminLang === 'en' ? 'hi' : 'en'
    setAdminLangState(nextLang)
    localStorage.setItem('siteLanguage', nextLang)
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(nextLang)
    }
    window.dispatchEvent(new Event('languageChange'))
  }

  const tLabel = (hiText, enText) => {
    if (adminLang === 'en') return enText || hiText
    return hiText || enText
  }

  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  const switchTab = (newTab, routePath) => {
    setActiveTab(newTab)
    if (routePath) {
      navigate(routePath)
    }
  }
  const [data, setData] = useState({
    categories: [],
    about: null,
    publications: [],
    poems: [],
    settings: []
  })

  useEffect(() => {
    // Check auth
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      navigate('/admin')
      return
    }

    // Ensure Supabase auth session is valid for storage uploads
    const checkSupabaseAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Try to restore session or show warning
        console.warn('No Supabase auth session found. Image uploads may fail.')
      }
    }
    checkSupabaseAuth()

    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Auto-align category seed data to match website sections
      try {
        const { data: catsData } = await supabase.from('categories').select('*')
        if (catsData && catsData.length > 0) {
          for (const cat of catsData) {
            if (cat.name_en === 'About Display' || cat.name_display === 'About Display' || cat.content_type === 'about' || cat.name_en === 'About Gurupratap Sharma') {
              if (cat.name_display !== 'कवि परिचय (About)') {
                await supabase.from('categories').update({ name_en: 'Kavi Parichay (About)', name_display: 'कवि परिचय (About)', sort_order: 1 }).eq('id', cat.id)
              }
            } else if (cat.name_en === 'My Publications' || cat.name_display === 'My Publications' || cat.content_type === 'publications') {
              if (cat.name_display !== 'प्रकाशन (Publications)') {
                await supabase.from('categories').update({ name_en: 'Prakashan (Publications)', name_display: 'प्रकाशन (Publications)', sort_order: 2 }).eq('id', cat.id)
              }
            } else if (cat.name_en === '2My Writings' || cat.name_en === 'My Writings' || cat.content_type === 'writings') {
              if (cat.name_display !== 'काव्य संग्रह (Poetry Collection)') {
                await supabase.from('categories').update({ name_en: 'Kavya Sangrah (Poetry Collection)', name_display: 'काव्य संग्रह (Poetry Collection)', sort_order: 3 }).eq('id', cat.id)
              }
            } else if (cat.name_en?.includes('3 writing') || cat.name_display?.includes('3 writing') || cat.name_en?.toLowerCase().includes('test')) {
              await supabase.from('categories').delete().eq('id', cat.id)
            }
          }
        }
      } catch (e) {
        console.warn('Category seed alignment check:', e)
      }

      const [cats, about, pubs, poems, settingsResult] = await Promise.all([
        getCategories(),
        getAboutContent(),
        getPublications(),
        getPoems(),
        supabase.from('settings').select('*')
      ])
      
      const settingsMap = {}
      if (settingsResult.data) {
        settingsResult.data.forEach(s => {
          settingsMap[s.key] = s.value
        })
      }
      
      setData({ 
        categories: cats, 
        about, 
        publications: pubs, 
        poems,
        settings: settingsMap
      })
    } catch (err) {
      console.error('Error loading admin data:', err)
      alert('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // Sign out from Supabase Auth
    await supabase.auth.signOut()
    // Clear local admin auth
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminAuthTime')
    navigate('/admin')
  }

  if (loading) {
    return <div className="loading" style={{ textAlign: 'center', padding: '60px', color: 'var(--leona-terracotta)', fontSize: '1.2rem', fontWeight: 600 }}>लोड हो रहा है... (Loading Admin...)</div>
  }

  return (
    <AdminLangContext.Provider value={{ adminLang, setAdminLang: setAdminLangState, toggleAdminLang, tLabel }}>
      <div className="admin-dashboard-container">
        <div className="admin-main-wrapper">
          {/* Navigation Tabs aligned 1-to-1 with User Site Page Categories */}
          <div className="admin-tabs-bar">
            <button
              className={`admin-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => switchTab('home', '/admin/home')}
            >
              🏠 {tLabel('मुख्य पृष्ठ', 'Home Page')}
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'about' || activeTab === 'timeline' || activeTab === 'awards' ? 'active' : ''}`}
              onClick={() => switchTab('about', '/admin/parichay')}
            >
              📖 {tLabel('कवि परिचय', 'About Bio')}
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'poems' || activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => switchTab('poems', '/admin/kavya-sangrah')}
            >
              ✍️ {tLabel('काव्य संग्रह', 'Poetry Archive')}
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
              onClick={() => switchTab('publications', '/admin/prakashan')}
            >
              📚 {tLabel('प्रकाशन', 'Publications')}
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'contact' || activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => switchTab('contact', '/admin/sampark')}
            >
              📞 {tLabel('संपर्क व इनबॉक्स', 'Contact & Inbox')}
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => switchTab('settings', '/admin/settings')}
            >
              ⚙️ {tLabel('सेटिंग्स', 'Site Settings')}
            </button>
          </div>

          {activeTab === 'home' && (
            <HomeManager publications={data.publications} about={data.about} settings={data.settings} onUpdate={loadData} />
          )}
          {(activeTab === 'about' || activeTab === 'timeline' || activeTab === 'awards') && (
            <AboutManager
              about={data.about}
              initialSubTab={activeTab === 'timeline' ? 'timeline' : (activeTab === 'awards' ? 'awards' : 'bio')}
              onUpdate={loadData}
            />
          )}
          {(activeTab === 'poems' || activeTab === 'categories') && (
            <PoemsArchiveManager
              poems={data.poems}
              categories={data.categories}
              initialSubTab={activeTab === 'categories' ? 'categories' : 'poems'}
              onUpdate={loadData}
            />
          )}
          {activeTab === 'publications' && (
            <PublicationsManager publications={data.publications} onUpdate={loadData} />
          )}
          {(activeTab === 'contact' || activeTab === 'inbox') && (
            <ContactSectionManager
              settings={data.settings}
              initialSubTab={activeTab === 'inbox' ? 'inbox' : 'info'}
              onUpdate={loadData}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsManager settings={data.settings} onUpdate={loadData} />
          )}
        </div>
      </div>
    </AdminLangContext.Provider>
  )
}

// Categories Manager Component
function CategoriesManager({ categories, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name_en: '', name_display: '', content_type: 'about', sort_order: 0, is_active: true })

  const handleCreate = () => {
    setEditing(null)
    setFormData({ name_en: '', name_display: '', content_type: 'about', sort_order: 0, is_active: true })
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({ name_en: '', name_display: '', content_type: 'about', sort_order: 0, is_active: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSave = {
        name_en: formData.name_en || '',
        name_display: formData.name_display || '',
        content_type: formData.content_type || 'about',
        sort_order: parseInt(formData.sort_order) || 0
      }
      
      const { error } = editing
        ? await supabase.from('categories').update(dataToSave).eq('id', editing)
        : await supabase.from('categories').insert(dataToSave)

      if (error) {
        console.error('Error saving category:', error)
        alert('Error saving category: ' + error.message)
        return
      }

      onUpdate()
      setEditing(null)
      setShowForm(false)
      setFormData({ name_en: '', name_display: '', content_type: 'about', sort_order: 0, is_active: true })
      alert('✓ Category saved successfully!')
    } catch (err) {
      console.error('Error saving category:', err)
      alert('Error saving category: ' + (err.message || 'Unknown error'))
    }
  }

  const handleEdit = (cat) => {
    setEditing(cat.id)
    setShowForm(true)
    // Ensure is_active defaults to true if not set
    setFormData({
      ...cat,
      is_active: cat.is_active !== undefined ? cat.is_active : true
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await supabase.from('categories').delete().eq('id', id)
      onUpdate()
      alert('Deleted!')
    } catch (err) {
      alert('Error deleting category')
    }
  }

  // Get content type display name
  const getContentTypeDisplay = (contentType) => {
    const typeMap = {
      'about': 'image + text',
      'publications': 'cover page',
      'writings': 'poems',
      'hero': 'Hero Section'
    }
    return typeMap[contentType] || contentType
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">{tLabel('वेबसाइट अनुभाग', 'Website Sections & Categories')}</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + {tLabel('नया अनुभाग जोड़ें', 'Add Section')}
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>{tLabel('अनुभाग नाम (Slug) *', 'Section Key (Slug) *')}</label>
              <input
                className="admin-input"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('प्रदर्शित नाम', 'Display Name')}</label>
              <input
                className="admin-input"
                value={formData.name_display}
                onChange={(e) => setFormData({ ...formData, name_display: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('सामग्री प्रकार *', 'Content Type *')}</label>
              <select
                className="admin-select"
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                required
              >
                <option value="about">{tLabel('कवि परिचय', 'About')}</option>
                <option value="publications">{tLabel('प्रकाशन', 'Publications')}</option>
                <option value="writings">{tLabel('काव्य संग्रह', 'Poems')}</option>
                <option value="hero">Hero Banner</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>{tLabel('क्रम संख्या', 'Sort Order')}</label>
              <input
                className="admin-input"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                {tLabel('वेबसाइट पर सक्रिय रखें', 'Active on Website')}
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">
              {editing ? tLabel('सहेजें', 'Update') : tLabel('जोड़ें', 'Create')}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={handleCancel}>
              {tLabel('रद्द करें', 'Cancel')}
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
          {tLabel('सक्रिय अनुभाग सूची', 'Active Sections List')} ({categories.length})
        </h3>
        {categories.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>{tLabel('कोई अनुभाग नहीं मिला। नया अनुभाग जोड़ने के लिए बटन दबाएं।', 'No sections found. Click button to add new section.')}</p>
        ) : (
          <ul className="admin-item-list">
            {categories.map((cat) => (
              <li key={cat.id} className="admin-item-card">
                <div>
                  <div className="admin-item-title">{cat.name_display || cat.name_en}</div>
                  <div className="admin-item-sub">Key: {cat.name_en} • {tLabel('प्रकार:', 'Type:')} {cat.content_type} • {tLabel('क्रम:', 'Order:')} {cat.sort_order || 0}</div>
                  {cat.is_active === false ? (
                    <span className="admin-item-badge" style={{ background: '#FFF0ED', color: '#D95343', borderColor: '#FFC4BD' }}>{tLabel('निष्क्रिय', 'Inactive')}</span>
                  ) : (
                    <span className="admin-item-badge" style={{ background: '#EAF8F5', color: '#2C988F', borderColor: '#B5E8E2' }}>{tLabel('सक्रिय', 'Active')}</span>
                  )}
                </div>
                <div className="admin-actions-group">
                  <button type="button" className="admin-btn-secondary" onClick={() => handleEdit(cat)}>{tLabel('संपादित करें', 'Edit')}</button>
                  <button type="button" className="admin-btn-danger" onClick={() => handleDelete(cat.id)}>{tLabel('हटाएं', 'Delete')}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// 1. Home Manager Component (Homepage Sections)
function HomeManager({ publications, about, settings, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [subTab, setSubTab] = useState('hero') // 'hero' | 'summary'

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid rgba(226, 215, 197, 0.6)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={subTab === 'hero' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('hero')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'hero' ? 700 : 500 }}
        >
          🔥 1. {tLabel('प्रमुख काव्य कृति', 'Hero Featured Showcase')}
        </button>
        <button
          type="button"
          className={subTab === 'summary' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('summary')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'summary' ? 700 : 500 }}
        >
          📖 2. {tLabel('मुख्य पृष्ठ कवि संक्षेप', 'Homepage Author Bio Preview')}
        </button>
      </div>

      {subTab === 'hero' && <PublicationsManager publications={publications} onUpdate={onUpdate} />}
      {subTab === 'summary' && <AboutManager about={about} onUpdate={onUpdate} />}
    </div>
  )
}

// 2. Poems Archive Manager Component (Poems + Categories)
function PoemsArchiveManager({ poems, categories, initialSubTab, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [subTab, setSubTab] = useState(initialSubTab || 'poems') // 'poems' | 'categories'

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab)
    }
  }, [initialSubTab])

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid rgba(226, 215, 197, 0.6)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={subTab === 'poems' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('poems')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'poems' ? 700 : 500 }}
        >
          ✍️ 1. {tLabel('काव्य रचनाएं', 'Poetry List')}
        </button>
        <button
          type="button"
          className={subTab === 'categories' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('categories')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'categories' ? 700 : 500 }}
        >
          🌐 2. {tLabel('काव्य श्रेणियां', 'Poetry Categories')}
        </button>
      </div>

      {subTab === 'poems' && <PoemsManager poems={poems} onUpdate={onUpdate} />}
      {subTab === 'categories' && <CategoriesManager categories={categories} onUpdate={onUpdate} />}
    </div>
  )
}

// 3. Contact Section Manager Component (Contact Details + Inbox)
function ContactSectionManager({ settings, initialSubTab, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [subTab, setSubTab] = useState(initialSubTab || 'info') // 'info' | 'inbox'

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab)
    }
  }, [initialSubTab])

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid rgba(226, 215, 197, 0.6)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={subTab === 'info' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('info')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'info' ? 700 : 500 }}
        >
          📍 1. {tLabel('संपर्क विवरण', 'Contact Info & Location')}
        </button>
        <button
          type="button"
          className={subTab === 'inbox' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('inbox')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'inbox' ? 700 : 500 }}
        >
          📬 2. {tLabel('प्राप्त संदेश', 'Received Inbox')}
        </button>
      </div>

      {subTab === 'info' && <SettingsManager settings={settings} onUpdate={onUpdate} />}
      {subTab === 'inbox' && <InboxManager onUpdate={onUpdate} />}
    </div>
  )
}

// About Manager Component (Includes Poet Hero Banner, Bio Prose, Timeline & Awards Sub-sections)
function AboutManager({ about, initialSubTab, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [subTab, setSubTab] = useState(initialSubTab || 'bio') // 'bio' | 'timeline' | 'awards'

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab)
    }
  }, [initialSubTab])
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    author_name: "कवि गुरुप्रताप शर्मा 'आग'",
    hero_tag: "साहित्यिक जीवन परिचय",
    hero_subtitle: "राष्ट्रीय चेतना, ओज एवं मानवीय संवेदनाओं के संवाहक",
    badge_text: "वरिष्ठ हिंदी साहित्यकार",
    quote_attribution: "गुरुप्रताप शर्मा 'आग'",
    title: 'जीवनी व साहित्यिक यात्रा',
    body_text: '',
    truncated_preview: '',
    photo_path: ''
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    if (about) {
      setFormData({
        author_name: about.author_name || "कवि गुरुप्रताप शर्मा 'आग'",
        hero_tag: about.hero_tag || "साहित्यिक जीवन परिचय",
        hero_subtitle: about.hero_subtitle || about.subtitle || "राष्ट्रीय चेतना, ओज एवं मानवीय संवेदनाओं के संवाहक",
        badge_text: about.badge_text || "वरिष्ठ हिंदी साहित्यकार",
        quote_attribution: about.quote_attribution || "गुरुप्रताप शर्मा 'आग'",
        title: about.title || 'जीवनी व साहित्यिक यात्रा',
        body_text: about.body_text || '',
        truncated_preview: about.truncated_preview || '',
        photo_path: about.photo_path || ''
      })
      if (about.photo_path) {
        setPhotoPreview(getImageUrl(about.photo_path))
      }
    }
  }, [about])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    try {
      setUploadingPhoto(true)
      const fileName = `about-photo-${Date.now()}.${file.name.split('.').pop()}`
      const path = await uploadImage(file, 'authors', fileName)
      setFormData(prev => ({ ...prev, photo_path: path }))
      setPhotoPreview(URL.createObjectURL(file))
      alert('Photo uploaded successfully!')
    } catch (err) {
      alert('Error uploading photo: ' + err.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // 1. Save metadata fields into settings key-value store
      const extraSettings = [
        { key: 'author_name', value: formData.author_name || "कवि गुरुप्रताप शर्मा 'आग'", display_label: 'Author Name' },
        { key: 'hero_tag', value: formData.hero_tag || "साहित्यिक जीवन परिचय", display_label: 'Hero Tag' },
        { key: 'hero_subtitle', value: formData.hero_subtitle || "राष्ट्रीय चेतना, ओज एवं मानवीय संवेदनाओं के संवाहक", display_label: 'Hero Subtitle' },
        { key: 'badge_text', value: formData.badge_text || "वरिष्ठ हिंदी साहित्यकार", display_label: 'Badge Text' },
        { key: 'quote_attribution', value: formData.quote_attribution || "गुरुप्रताप शर्मा 'आग'", display_label: 'Quote Attribution' }
      ]
      for (const s of extraSettings) {
        await supabase.from('settings').upsert(s, { onConflict: 'key' })
      }

      // 2. Save bio prose fields into about_content table (only valid DB columns)
      const aboutDataToSave = {
        title: formData.title || 'जीवनी व साहित्यिक यात्रा',
        body_text: formData.body_text || '',
        truncated_preview: formData.truncated_preview || '',
        photo_path: formData.photo_path || ''
      }

      const { error } = (about && about.id)
        ? await supabase.from('about_content').update(aboutDataToSave).eq('id', about.id)
        : await supabase.from('about_content').insert(aboutDataToSave)

      if (error) {
        console.error('Error saving about content:', error)
        alert('Error saving about content: ' + error.message)
        return
      }

      alert('✓ कवि परिचय एवं बैनर सफलतापूर्वक सहेजा गया! (Bio & Hero Saved)')
      onUpdate()
      setEditing(false)
    } catch (err) {
      console.error('Error saving about content:', err)
      alert('Error saving about content: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div>
      {/* Sub-tab Switcher Header */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid rgba(226, 215, 197, 0.6)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={subTab === 'bio' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('bio')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'bio' ? 700 : 500 }}
        >
          📖 1. {tLabel('कवि परिचय व बैनर', 'Overview & Hero')}
        </button>
        <button
          type="button"
          className={subTab === 'timeline' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('timeline')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'timeline' ? 700 : 500 }}
        >
          ⏳ 2. {tLabel('जीवन यात्रा (टाइमलाइन)', 'Timeline Milestones')}
        </button>
        <button
          type="button"
          className={subTab === 'awards' ? 'admin-btn-primary' : 'admin-btn-secondary'}
          onClick={() => setSubTab('awards')}
          style={{ borderRadius: '24px', padding: '8px 20px', fontWeight: subTab === 'awards' ? 700 : 500 }}
        >
          🏆 3. {tLabel('पुरस्कार व सम्मान', 'Awards & Honors')}
        </button>
      </div>

      {subTab === 'timeline' && <TimelineManager onUpdate={onUpdate} />}
      {subTab === 'awards' && <AwardsManager onUpdate={onUpdate} />}

      {subTab === 'bio' && (
        <div className="admin-card-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">📖 {tLabel('कवि परिचय व बैनर सम्पादन', 'Poet Biography & Hero Banner')}</h2>
            {!editing && (
              <button type="button" className="admin-btn-primary" onClick={() => setEditing(true)}>
                ✏️ {tLabel('सम्पादित करें', 'Edit Details')}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="admin-form-container">
              <div style={{ background: 'var(--leona-sand-light, #FAF6F0)', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid var(--leona-terracotta)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Lora, serif', color: 'var(--leona-charcoal)' }}>
                  🎯 {tLabel('हीरो बैनर व मुख्य शीर्षक पाठ', 'Hero Banner & Header Text')}
                </h4>
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>{tLabel('बैनर टैग', 'Hero Tag Pill')}</label>
                    <input
                      className="admin-input"
                      value={formData.hero_tag}
                      onChange={(e) => setFormData({ ...formData, hero_tag: e.target.value })}
                      placeholder="साहित्यिक जीवन परिचय"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{tLabel('कवि का नाम *', 'Poet Full Name *')}</label>
                    <input
                      className="admin-input"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group full-width">
                    <label>{tLabel('मुख्य उप-शीर्षक / टैगलाइन *', 'Hero Subtitle / Tagline *')}</label>
                    <input
                      className="admin-input"
                      value={formData.hero_subtitle}
                      onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                      placeholder="राष्ट्रीय चेतना, ओज एवं मानवीय संवेदनाओं के संवाहक"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{tLabel('बैज पाठ', 'Badge Text')}</label>
                    <input
                      className="admin-input"
                      value={formData.badge_text}
                      onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{tLabel('उद्धरण नाम', 'Quote Attribution')}</label>
                    <input
                      className="admin-input"
                      value={formData.quote_attribution}
                      onChange={(e) => setFormData({ ...formData, quote_attribution: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Lora, serif', color: 'var(--leona-charcoal)' }}>
                  📝 {tLabel('विस्तृत जीवनी गद्य व चित्र', 'Detailed Biography Prose & Photo')}
                </h4>
                <div className="admin-form-grid">
                  <div className="admin-form-group full-width">
                    <label>{tLabel('जीवनी का शीर्षक', 'Biography Title')}</label>
                    <input
                      className="admin-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="जीवनी व साहित्यिक यात्रा"
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label>{tLabel('कवि चित्र', 'Poet Portrait Photo')}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      style={{ marginBottom: '8px' }}
                    />
                    {photoPreview && (
                      <div style={{ marginTop: '8px' }}>
                        <img
                          src={photoPreview}
                          alt="Poet Portrait"
                          style={{ width: '120px', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group full-width">
                    <label>{tLabel('संक्षिप्त परिचय', 'Homepage Truncated Preview')}</label>
                    <textarea
                      className="admin-textarea"
                      value={formData.truncated_preview}
                      onChange={(e) => setFormData({ ...formData, truncated_preview: e.target.value })}
                      style={{ minHeight: '80px' }}
                    />
                  </div>

                  <div className="admin-form-group full-width">
                    <label>{tLabel('विस्तृत जीवनी गद्य *', 'Full Biography Text Prose *')}</label>
                    <textarea
                      className="admin-textarea"
                      value={formData.body_text}
                      onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                      style={{ minHeight: '220px', lineHeight: '1.7' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn-primary">💾 {tLabel('परिवर्तन सहेजें', 'Save Changes')}</button>
                <button type="button" className="admin-btn-secondary" onClick={() => setEditing(false)}>{tLabel('रद्द करें', 'Cancel')}</button>
              </div>
            </form>
          ) : (
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt={formData.author_name}
                    style={{ width: '140px', height: '170px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                )}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <span style={{ display: 'inline-block', background: 'var(--leona-terracotta)', color: '#fff', fontSize: '0.8rem', padding: '2px 10px', borderRadius: '12px', marginBottom: '8px' }}>
                    {formData.hero_tag}
                  </span>
                  <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.4rem', color: 'var(--leona-charcoal)', margin: '4px 0 6px 0' }}>
                    {formData.author_name}
                  </h3>
                  <p style={{ fontStyle: 'italic', color: 'var(--leona-terracotta)', margin: '0 0 12px 0', fontSize: '1.02rem', fontWeight: 500 }}>
                    "{formData.hero_subtitle}"
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#666' }}>
                    <strong>बैज:</strong> {formData.badge_text} | <strong>उद्धरण नाम:</strong> {formData.quote_attribution}
                  </p>
                  <hr style={{ margin: '16px 0', borderColor: 'rgba(226, 215, 197, 0.5)' }} />
                  <h4 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', margin: '0 0 8px 0', color: 'var(--leona-charcoal)' }}>
                    {formData.title || 'जीवनी व साहित्यिक यात्रा'}
                  </h4>
                  <div style={{ whiteSpace: 'pre-line', lineHeight: '1.7', color: 'var(--leona-text-main)', fontSize: '0.95rem' }}>
                    {formData.body_text || '(जीवनी विवरण खाली है)'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Publications Manager Component
function PublicationsManager({ publications, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_path: '',
    image_alt: '',
    description: '',
    sort_order: 0
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const handleCreate = () => {
    setEditing(null)
    setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0, is_active: true })
    setImagePreview(null)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setImagePreview(null)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    try {
      setUploadingImage(true)
      const pubId = editing || `temp-${Date.now()}`
      const fileName = `cover.${file.name.split('.').pop()}`
      const path = await uploadImage(file, `publications/${pubId}`, fileName)
      setFormData({ ...formData, image_path: path })
      setImagePreview(URL.createObjectURL(file))
      alert('Image uploaded!')
    } catch (err) {
      alert('Error uploading image: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSave = {
        title: formData.title || '',
        subtitle: formData.subtitle || '',
        image_path: formData.image_path || '',
        image_alt: formData.image_alt || '',
        description: formData.description || '',
        sort_order: parseInt(formData.sort_order) || 0
      }
      
      if (editing) {
        const { error } = await supabase.from('publications').update(dataToSave).eq('id', editing)
        if (error) {
          console.error('Error updating publication:', error)
          alert('Error saving publication: ' + error.message)
          return
        }
      } else {
        const { data: newPub, error } = await supabase.from('publications').insert(dataToSave).select().single()
        if (error) {
          console.error('Error inserting publication:', error)
          alert('Error saving publication: ' + error.message)
          return
        }
        // If image was uploaded to temp folder, move it to the actual publication folder
        if (formData.image_path && formData.image_path.includes('temp-') && newPub) {
          const oldPath = formData.image_path
          const newPath = oldPath.replace(/temp-\d+/, newPub.id)
          try {
            const { error: copyError } = await supabase.storage.from('public-assets').copy(oldPath, newPath)
            if (!copyError) {
              await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
              await supabase.storage.from('public-assets').remove([oldPath])
            } else {
              await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
            }
          } catch (moveError) {
            await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
          }
        }
      }
      onUpdate()
      setEditing(null)
      setShowForm(false)
      setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0, is_active: true })
      setImagePreview(null)
      alert('✓ Publication saved successfully!')
    } catch (err) {
      console.error('Error saving publication:', err)
      alert('Error saving publication: ' + (err.message || 'Unknown error'))
    }
  }

  const handleEdit = (pub) => {
    setEditing(pub.id)
    setShowForm(true)
    // Ensure is_active defaults to true if not set
    setFormData({
      ...pub,
      is_active: pub.is_active !== undefined ? pub.is_active : true
    })
    if (pub.image_path) {
      setImagePreview(getImageUrl(pub.image_path))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this publication?')) return
    try {
      await supabase.from('publications').delete().eq('id', id)
      onUpdate()
      alert('Deleted!')
    } catch (err) {
      alert('Error deleting publication')
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">📚 {tLabel('प्रकाशन एवं पुस्तकें', 'Publications & Books')}</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + {tLabel('नई पुस्तक जोड़ें', 'Add Book')}
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>{tLabel('पुस्तक का नाम *', 'Book Title *')}</label>
              <input
                className="admin-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('उप-शीर्षक', 'Subtitle')}</label>
              <input
                className="admin-input"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('कवर चित्र', 'Book Cover Image')}</label>
              {imagePreview && (
                <div style={{ marginBottom: '12px' }}>
                  <img 
                    src={imagePreview} 
                    alt="Cover Preview" 
                    style={{ 
                      width: '120px', 
                      height: '170px', 
                      objectFit: 'cover', 
                      border: '2px solid var(--leona-gold)',
                      borderRadius: '8px'
                    }} 
                  />
                </div>
              )}
              <input
                className="admin-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {uploadingImage && <div style={{ marginTop: '6px', color: 'var(--leona-terracotta)', fontSize: '0.85rem' }}>कवर फोटो अपलोड हो रही है...</div>}
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('पुस्तक विवरण', 'Book Description')}</label>
              <textarea
                className="admin-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('क्रम संख्या', 'Sort Order')}</label>
              <input
                className="admin-input"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                {tLabel('वेबसाइट पर प्रकाशित रखें', 'Active on Website')}
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">
              {editing ? tLabel('सहेजें', 'Update') : tLabel('प्रकाशित करें', 'Publish')}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={() => {
              setEditing(null)
              setShowForm(false)
              setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0, is_active: true })
              setImagePreview(null)
            }}>
              {tLabel('रद्द करें', 'Cancel')}
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
          {tLabel('प्रकाशित पुस्तकों की सूची', 'Published Books List')} ({publications.length})
        </h3>
        {publications.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>{tLabel('कोई पुस्तक नहीं मिली। नई पुस्तक जोड़ने के लिए बटन दबाएं।', 'No books found. Click button to add new book.')}</p>
        ) : (
          <ul className="admin-item-list">
            {publications.map((pub) => (
              <li key={pub.id} className="admin-item-card">
                <div>
                  <div className="admin-item-title">{pub.title}</div>
                  <div className="admin-item-sub">{pub.subtitle || pub.description ? (pub.subtitle || pub.description).substring(0, 80) + '...' : ''} • {tLabel('क्रम:', 'Order:')} {pub.sort_order || 0}</div>
                  {pub.is_active === false ? (
                    <span className="admin-item-badge" style={{ background: '#FFF0ED', color: '#D95343', borderColor: '#FFC4BD' }}>{tLabel('अप्रकाशित', 'Draft')}</span>
                  ) : (
                    <span className="admin-item-badge" style={{ background: '#EAF8F5', color: '#2C988F', borderColor: '#B5E8E2' }}>{tLabel('प्रकाशित', 'Live')}</span>
                  )}
                </div>
                <div className="admin-actions-group">
                  <button type="button" className="admin-btn-secondary" onClick={() => handleEdit(pub)}>{tLabel('संपादित करें', 'Edit')}</button>
                  <button type="button" className="admin-btn-danger" onClick={() => handleDelete(pub.id)}>{tLabel('हटाएं', 'Delete')}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Poems Manager Component
function PoemsManager({ poems, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    heading_en: '',
    heading_hi: '',
    description: '',
    body_text_en: '',
    body_text_hi: '',
    language: 'mixed',
    sort_order: 0,
    is_active: true
  })

  const handleCreate = () => {
    setEditing(null)
    setFormData({ heading_en: '', heading_hi: '', description: '', body_text_en: '', body_text_hi: '', language: 'mixed', sort_order: 0, is_active: true })
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSave = {
        heading: formData.heading_hi || formData.heading_en || formData.heading || '',
        description: formData.description || '',
        full_text: formData.body_text_hi || formData.body_text_en || formData.full_text || '',
        language: formData.language || 'mixed',
        sort_order: parseInt(formData.sort_order) || 0
      }
      
      const { error } = editing
        ? await supabase.from('poems').update(dataToSave).eq('id', editing)
        : await supabase.from('poems').insert(dataToSave)

      if (error) {
        console.error('Error saving poem:', error)
        alert('Error saving poem: ' + error.message)
        return
      }

      onUpdate()
      setEditing(null)
      setShowForm(false)
      setFormData({ heading_en: '', heading_hi: '', description: '', body_text_en: '', body_text_hi: '', language: 'mixed', sort_order: 0, is_active: true })
      alert('✓ Poem saved successfully!')
    } catch (err) {
      console.error('Error saving poem:', err)
      alert('Error saving poem: ' + (err.message || 'Unknown error'))
    }
  }

  const handleEdit = (poem) => {
    setEditing(poem.id)
    setShowForm(true)
    const formDataToSet = {
      heading_en: poem.heading_en || poem.heading || '',
      heading_hi: poem.heading_hi || '',
      description: poem.description || '',
      body_text_en: poem.body_text_en || '',
      body_text_hi: poem.body_text_hi || poem.full_text || '',
      language: poem.language || 'mixed',
      sort_order: poem.sort_order || 0,
      is_active: poem.is_active !== undefined ? poem.is_active : true
    }
    setFormData(formDataToSet)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this poem?')) return
    try {
      await supabase.from('poems').delete().eq('id', id)
      onUpdate()
      alert('Deleted!')
    } catch (err) {
      alert('Error deleting poem')
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">✍️ {tLabel('काव्य रचनाएं एवं पद', 'Poems & Verse Collection')}</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + {tLabel('नई रचना जोड़ें', 'Add New Poem')}
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>{tLabel('कविता का नाम (हिंदी) *', 'Poem Title (Hindi) *')}</label>
              <input
                className="admin-input"
                value={formData.heading_hi || ''}
                onChange={(e) => setFormData({ ...formData, heading_hi: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('अंग्रेजी शीर्षक', 'English Title')}</label>
              <input
                className="admin-input"
                value={formData.heading_en || ''}
                onChange={(e) => setFormData({ ...formData, heading_en: e.target.value })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('रचना संदर्भ / विवरण', 'Context / Description')}</label>
              <textarea
                className="admin-textarea"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ minHeight: '80px' }}
              />
            </div>
            <div className="admin-form-group full-width" style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '1.02rem', color: 'var(--leona-terracotta)', marginBottom: '8px', display: 'block' }}>
                🖋️ {tLabel('पेजमेकर कैनवस (PM5)', 'PageMaker Canvas (PM5)')}
              </label>
              <PM5WritingDesk
                initialPages={formData.body_text_hi ? [formData.body_text_hi] : ['']}
                initialTitle={formData.heading_hi || formData.heading_en || ''}
                onSave={(pagesArray, pageTitle) => {
                  const joinedText = pagesArray.join('\n\n');
                  setFormData(prev => ({
                    ...prev,
                    body_text_hi: joinedText,
                    heading_hi: pageTitle || prev.heading_hi
                  }));
                  alert('✓ PM5 PageMaker canvas saved!');
                }}
              />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('सम्पूर्ण कविता पंक्तियाँ *', 'Full Stanzas / Verse Text *')}</label>
              <textarea
                className="admin-textarea"
                value={formData.body_text_hi || ''}
                onChange={(e) => setFormData({ ...formData, body_text_hi: e.target.value })}
                required
                style={{ minHeight: '220px', fontFamily: 'Tiro Devanagari Hindi, Lora, serif', fontSize: '1.05rem', lineHeight: '1.7' }}
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('क्रम संख्या', 'Sort Order')}</label>
              <input
                className="admin-input"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                {tLabel('वेबसाइट पर प्रकाशित रखें', 'Active on Website')}
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">
              {editing ? tLabel('सहेजें', 'Save Poem') : tLabel('प्रकाशित करें', 'Publish Poem')}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={handleCancel}>
              {tLabel('रद्द करें', 'Cancel')}
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
          {tLabel('कुल काव्य रचनाएं', 'Total Poems Collection')} ({poems.length})
        </h3>
        {poems.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>{tLabel('कोई कविता नहीं मिली। नई रचना जोड़ने के लिए बटन दबाएं।', 'No poems found. Click button to add new poem.')}</p>
        ) : (
          <ul className="admin-item-list">
            {poems.map((poem) => (
              <li key={poem.id} className="admin-item-card">
                <div>
                  <div className="admin-item-title">{poem.heading_hi || poem.heading_en || poem.heading || 'Untitled'}</div>
                  <div className="admin-item-sub">English: {poem.heading_en || '(None)'} • {tLabel('क्रम:', 'Order:')} {poem.sort_order || 0}</div>
                  {poem.is_active === false ? (
                    <span className="admin-item-badge" style={{ background: '#FFF0ED', color: '#D95343', borderColor: '#FFC4BD' }}>{tLabel('अप्रकाशित', 'Draft')}</span>
                  ) : (
                    <span className="admin-item-badge" style={{ background: '#EAF8F5', color: '#2C988F', borderColor: '#B5E8E2' }}>{tLabel('प्रकाशित', 'Live')}</span>
                  )}
                </div>
                <div className="admin-actions-group">
                  <button type="button" className="admin-btn-secondary" onClick={() => handleEdit(poem)}>{tLabel('संपादित करें', 'Edit')}</button>
                  <button type="button" className="admin-btn-danger" onClick={() => handleDelete(poem.id)}>{tLabel('हटाएं', 'Delete')}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Settings Manager Component
function SettingsManager({ settings, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [showForm, setShowForm] = useState(false)
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
    youtube: '',
    logo_path: '',
    thank_you_message: '',
    thank_you_title: '',
    thank_you_heading: '',
    thank_you_description: '',
    thank_you_button_text: '',
    hero_tagline_en: '',
    hero_tagline_hi: '',
    default_accent: '#964B00'
  })
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)

  useEffect(() => {
    if (settings) {
      setFormData({
        phone: settings.phone || '',
        phone_text: settings.phone_text || '',
        whatsapp: settings.whatsapp || '',
        whatsapp_text: settings.whatsapp_text || '',
        email: settings.email || '',
        email_text: settings.email_text || '',
        address: settings.address || '',
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        twitter: settings.twitter || '',
        linkedin: settings.linkedin || '',
        youtube: settings.youtube || '',
        logo_path: settings.logo_path || '',
        thank_you_message: settings.thank_you_message || '',
        thank_you_title: settings.thank_you_title || '',
        thank_you_heading: settings.thank_you_heading || '',
        thank_you_description: settings.thank_you_description || '',
        thank_you_button_text: settings.thank_you_button_text || '',
        hero_tagline_en: settings.hero_tagline_en || '',
        hero_tagline_hi: settings.hero_tagline_hi || '',
        default_accent: settings.default_accent || '#964B00'
      })
      if (settings.logo_path) {
        setLogoPreview(getImageUrl(settings.logo_path))
      }
    }
  }, [settings])

  const handleEdit = () => {
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    // Reset form data to current settings
    setFormData({
      phone: settings.phone || '+91 98290 12345',
      phone_text: settings.phone_text || 'Call me',
      whatsapp: settings.whatsapp || 'https://wa.me/919829012345',
      whatsapp_text: settings.whatsapp_text || 'Whatsapp me',
      email: settings.email || 'contact@gurupratapsharma.com',
      email_text: settings.email_text || 'Email me',
      address: settings.address || 'साहित्य सदन, सिविल लाइन्स, जयपुर (राजस्थान), भारत - 302006',
      facebook: settings.facebook || '',
      instagram: settings.instagram || '',
      twitter: settings.twitter || '',
      linkedin: settings.linkedin || '',
      youtube: settings.youtube || '',
      logo_path: settings.logo_path || '',
      thank_you_message: settings.thank_you_message || 'Thank you!',
      thank_you_title: settings.thank_you_title || '',
      thank_you_heading: settings.thank_you_heading || '',
      thank_you_description: settings.thank_you_description || '',
      thank_you_button_text: settings.thank_you_button_text || '',
      hero_tagline_en: settings.hero_tagline_en || 'Renowned for his fiery literary works',
      hero_tagline_hi: settings.hero_tagline_hi || 'साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध',
      default_accent: settings.default_accent || '#964B00'
    })
    if (settings.logo_path) {
      setLogoPreview(getImageUrl(settings.logo_path))
    } else {
      setLogoPreview(null)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    try {
      setUploadingLogo(true)
      const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`
      const path = await uploadImage(file, 'logos', fileName)
      setFormData({ ...formData, logo_path: path })
      setLogoPreview(URL.createObjectURL(file))
      alert('Logo uploaded!')
    } catch (err) {
      alert('Error uploading logo: ' + err.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updates = Object.entries(formData).map(([key, value]) => ({
        key,
        value: value !== undefined && value !== null ? String(value) : '',
        display_label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))

      let hasError = false
      for (const update of updates) {
        const { error } = await supabase.from('settings').upsert(update, { onConflict: 'key' })
        if (error) {
          console.error('Error saving setting key ' + update.key + ':', error)
          hasError = true
        }
      }

      if (hasError) {
        alert('Warning: Some settings could not be saved to server.')
      } else {
        alert('✓ Settings saved successfully!')
      }
      
      onUpdate()
      setShowForm(false)
    } catch (err) {
      console.error('Error saving settings:', err)
      alert('Error saving settings: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">⚙️ {tLabel('वेबसाइट सेटिंग्स व सोशल लिंक', 'Website Settings & Social Links')}</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleEdit}>
            ✏️ {tLabel('संपादित करें', 'Edit Settings')}
          </button>
        )}
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group full-width">
              <label>{tLabel('वेबसाइट लोगो चित्र', 'Website Logo Image')}</label>
              {logoPreview && (
                <div style={{ marginBottom: '12px' }}>
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    style={{ 
                      width: '90px', 
                      height: '90px', 
                      objectFit: 'contain', 
                      borderRadius: '8px',
                      border: '1px solid rgba(226, 215, 197, 0.8)',
                      background: '#FFFFFF'
                    }} 
                  />
                </div>
              )}
              <input
                className="admin-input"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
              {uploadingLogo && <div style={{ marginTop: '6px', color: 'var(--leona-terracotta)', fontSize: '0.85rem' }}>{tLabel('लोगो अपलोड हो रहा है...', 'Uploading logo...')}</div>}
            </div>

            <div className="admin-form-group">
              <label>{tLabel('फोन नंबर', 'Phone Number')}</label>
              <input
                className="admin-input"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+917676885989"
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('व्हाट्सएप लिंक', 'WhatsApp Link')}</label>
              <input
                className="admin-input"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="https://wa.me/917676885989"
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('ईमेल पता', 'Email Address')}</label>
              <input
                className="admin-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@gurupratapsharma.com"
              />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('संपर्क पता', 'Location Address')}</label>
              <input
                className="admin-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="साहित्य सदन, सिविल लाइन्स, जयपुर (राजस्थान), भारत - 302006"
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('फेसबुक प्रोफाइल', 'Facebook Profile Link')}</label>
              <input
                className="admin-input"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/gurupratap"
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('इंस्टाग्राम प्रोफाइल', 'Instagram Profile Link')}</label>
              <input
                className="admin-input"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/gurupratap"
              />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('यूट्यूब चैनल', 'YouTube Channel Link')}</label>
              <input
                className="admin-input"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="https://youtube.com/@gurupratap"
              />
            </div>

            <div className="admin-form-group full-width">
              <label>{tLabel('मुख्य पृष्ठ टैगलाइन', 'Homepage Tagline')}</label>
              <input
                className="admin-input"
                value={formData.hero_tagline_hi}
                onChange={(e) => setFormData({ ...formData, hero_tagline_hi: e.target.value })}
                placeholder="साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">{tLabel('सहेजें', 'Save Settings')}</button>
            <button type="button" className="admin-btn-secondary" onClick={handleCancel}>{tLabel('रद्द करें', 'Cancel')}</button>
          </div>
        </form>
      )}

      {!showForm && (
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
          <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.15rem', color: 'var(--leona-charcoal)', marginBottom: '12px' }}>
            {tLabel('वर्तमान वेबसाइट सेटिंग्स', 'Current Website Settings')}
          </h3>
          <div style={{ fontSize: '0.92rem', color: 'var(--leona-text-main)', lineHeight: '1.8' }}>
            <p><strong>{tLabel('फोन:', 'Phone:')}</strong> {settings.phone || '+91 76768 85989'}</p>
            <p><strong>{tLabel('ईमेल:', 'Email:')}</strong> {settings.email || '(N/A)'}</p>
            <p><strong>{tLabel('टैगलाइन:', 'Tagline:')}</strong> {settings.hero_tagline_hi || 'साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to extract numeric year from string (supports Hindi Devanagari १९४५ -> 1945)
function parseYearNumber(yearStr) {
  if (!yearStr) return 0
  const devanagariMap = { '०':0,'१':1,'२':2,'३':3,'४':4,'५':5,'६':6,'७':7,'८':8,'९':9 }
  const asciiStr = String(yearStr).replace(/[०-९]/g, match => devanagariMap[match])
  const match = asciiStr.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

// Timeline Manager Component
function TimelineManager({ onUpdate }) {
  const { tLabel } = useAdminLang()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ year_display: '', title: '', description: '', sort_order: 0 })

  useEffect(() => {
    fetchTimeline()
  }, [])

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('timeline_milestones').select('*').order('sort_order', { ascending: true })
      if (!error && data && data.length > 0) {
        setItems(data)
        localStorage.setItem('app_timeline_milestones', JSON.stringify(data))
      } else {
        const cached = localStorage.getItem('app_timeline_milestones')
        if (cached) {
          setItems(JSON.parse(cached))
        } else {
          const defaultItems = [
            { id: '1', year_display: '१९४५', title: 'जन्म एवं प्रारम्भिक शिक्षा', description: 'साहित्यिक वातावरण में बाल्यकाल व्यतीत हुआ। संस्कृत एवं हिंदी साहित्य में उच्च शिक्षा पूर्ण की।', sort_order: 1 },
            { id: '2', year_display: '१९६८', title: 'काव्य यात्रा का शुभारम्भ', description: 'प्रमुख राष्ट्रीय पत्र-पत्रिकाओं में कविताओं का प्रकाशन एवं कवि सम्मेलनों में ओजस्वी प्रस्तुति।', sort_order: 2 },
            { id: '3', year_display: '१९८५', title: "'अग्नि कलश' का प्रकाशन", description: "प्रसिद्ध काव्य कृति 'अग्नि कलश' का प्रथम संस्करण प्रकाशित, जिसे साहित्य जगत में अपार ख्याति मिली।", sort_order: 3 },
            { id: '4', year_display: '२०२६', title: '५० वर्ष का साहित्यिक अवदान', description: 'हिंदी काव्य सेवा के ५० वर्ष पूर्ण होने पर राष्ट्रीय स्तर पर नागरिक अभिनंदन।', sort_order: 4 }
          ]
          setItems(defaultItems)
          localStorage.setItem('app_timeline_milestones', JSON.stringify(defaultItems))
        }
      }
    } catch (e) {
      console.warn('Timeline fetch notice:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSortByYear = async () => {
    const sorted = [...items].sort((a, b) => parseYearNumber(a.year_display) - parseYearNumber(b.year_display))
    sorted.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItems(sorted)
    localStorage.setItem('app_timeline_milestones', JSON.stringify(sorted))
    try {
      for (const item of sorted) {
        await supabase.from('timeline_milestones').update({ sort_order: item.sort_order }).eq('id', item.id)
      }
    } catch (e) {}
    alert(tLabel('वर्षानुसार क्रमित कर दिया गया है!', 'Sorted chronologically by year!'))
    onUpdate()
  }

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const updated = [...items]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    updated.forEach((item, idx) => { item.sort_order = idx + 1 })
    setItems(updated)
    localStorage.setItem('app_timeline_milestones', JSON.stringify(updated))

    try {
      for (const item of updated) {
        await supabase.from('timeline_milestones').update({ sort_order: item.sort_order }).eq('id', item.id)
      }
    } catch (e) {}
    onUpdate()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let updatedList = []
    if (editingId && editingId !== 'new') {
      updatedList = items.map(i => i.id === editingId ? { ...i, ...formData } : i)
    } else {
      const newItem = { id: String(Date.now()), ...formData }
      updatedList = [...items, newItem]
    }

    // Auto sort chronologically when adding/updating
    updatedList.sort((a, b) => parseYearNumber(a.year_display) - parseYearNumber(b.year_display))
    updatedList.forEach((item, idx) => { item.sort_order = idx + 1 })

    setItems(updatedList)
    localStorage.setItem('app_timeline_milestones', JSON.stringify(updatedList))

    const cleanData = {
      year_display: formData.year_display || '',
      title: formData.title || '',
      description: formData.description || '',
      sort_order: parseInt(formData.sort_order) || 0
    }

    try {
      if (editingId && editingId !== 'new') {
        await supabase.from('timeline_milestones').update(cleanData).eq('id', editingId)
      } else {
        await supabase.from('timeline_milestones').insert(cleanData)
      }
    } catch (err) {
      console.warn('Timeline DB save fallback:', err)
    }

    alert('✓ ' + tLabel('जीवन यात्रा सहेजी गई!', 'Timeline item saved!'))
    setShowForm(false)
    onUpdate()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this timeline item?')) return
    const updatedList = items.filter(i => i.id !== id)
    setItems(updatedList)
    localStorage.setItem('app_timeline_milestones', JSON.stringify(updatedList))
    try {
      await supabase.from('timeline_milestones').delete().eq('id', id)
    } catch (e) {}
    onUpdate()
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">⏳ {tLabel('जीवन यात्रा टाइमलाइन', 'Timeline Milestones')}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="admin-btn-secondary" onClick={handleSortByYear}>
            🔄 {tLabel('वर्षानुसार स्वचालित क्रमबद्ध करें', 'Auto-Sort by Year')}
          </button>
          {!showForm && (
            <button className="admin-btn-primary" onClick={() => { setEditingId(null); setFormData({ year_display: '', title: '', description: '', sort_order: items.length + 1 }); setShowForm(true); }}>
              + {tLabel('नया मील का पत्थर जोड़ें', 'Add Timeline Year')}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>{tLabel('वर्ष (e.g. १९४५ / 1945)', 'Year (e.g. 1945)')}</label>
              <input className="admin-input" value={formData.year_display} onChange={e => setFormData({ ...formData, year_display: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('शीर्षक', 'Title')}</label>
              <input className="admin-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('विवरण', 'Description')}</label>
              <textarea className="admin-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="admin-btn-primary">{tLabel('सहेजें', 'Save Timeline')}</button>
            <button type="button" className="admin-btn-secondary" onClick={() => setShowForm(false)}>{tLabel('रद्द करें', 'Cancel')}</button>
          </div>
        </form>
      )}

      <ul className="admin-item-list">
        {items.map((item, idx) => (
          <li key={item.id} className="admin-item-card">
            <div>
              <div className="admin-item-title">
                <span style={{ color: 'var(--leona-terracotta)', fontWeight: 700 }}>{item.year_display}</span> — {item.title}
              </div>
              <div className="admin-item-sub">{item.description}</div>
            </div>
            <div className="admin-actions-group">
              <button type="button" className="admin-btn-secondary" disabled={idx === 0} onClick={() => handleMove(idx, 'up')}>{tLabel('▲ ऊपर', '▲ Up')}</button>
              <button type="button" className="admin-btn-secondary" disabled={idx === items.length - 1} onClick={() => handleMove(idx, 'down')}>{tLabel('▼ नीचे', '▼ Down')}</button>
              <button className="admin-btn-secondary" onClick={() => { setEditingId(item.id); setFormData(item); setShowForm(true); }}>{tLabel('संपादित करें', 'Edit')}</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(item.id)}>{tLabel('हटाएं', 'Delete')}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Awards Manager Component
function AwardsManager({ onUpdate }) {
  const { tLabel } = useAdminLang()
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ year_display: '', title: '', organization: '', sort_order: 0 })

  useEffect(() => {
    fetchAwards()
  }, [])

  const fetchAwards = async () => {
    try {
      const { data, error } = await supabase.from('awards_honors').select('*').order('sort_order', { ascending: true })
      if (!error && data && data.length > 0) {
        setItems(data)
        localStorage.setItem('app_awards_honors', JSON.stringify(data))
      } else {
        const cached = localStorage.getItem('app_awards_honors')
        if (cached) {
          setItems(JSON.parse(cached))
        } else {
          const defaultItems = [
            { id: '1', year_display: '१९९५', title: 'राजस्थान साहित्य अकादमी सम्मान', organization: 'राजस्थान सरकार', sort_order: 1 },
            { id: '2', year_display: '२०१०', title: 'राष्ट्रकवि मैथिलीशरण गुप्त पुरस्कार', organization: 'हिंदी साहित्य सम्मेलन', sort_order: 2 },
            { id: '3', year_display: '२०२२', title: 'साहित्य जीवन साधना सम्मान', organization: 'भारतीय भाषा परिषद', sort_order: 3 }
          ]
          setItems(defaultItems)
          localStorage.setItem('app_awards_honors', JSON.stringify(defaultItems))
        }
      }
    } catch (e) {
      console.warn('Awards fetch notice:', e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let updatedList = []
    if (editingId && editingId !== 'new') {
      updatedList = items.map(i => i.id === editingId ? { ...i, ...formData } : i)
    } else {
      const newItem = { id: String(Date.now()), ...formData }
      updatedList = [...items, newItem]
    }
    setItems(updatedList)
    localStorage.setItem('app_awards_honors', JSON.stringify(updatedList))

    const cleanData = {
      year_display: formData.year_display || '',
      title: formData.title || '',
      organization: formData.organization || '',
      sort_order: parseInt(formData.sort_order) || 0
    }

    try {
      if (editingId && editingId !== 'new') {
        await supabase.from('awards_honors').update(cleanData).eq('id', editingId)
      } else {
        await supabase.from('awards_honors').insert(cleanData)
      }
    } catch (err) {
      console.warn('Awards DB save fallback:', err)
    }

    alert('✓ ' + tLabel('पुरस्कार सहेजा गया!', 'Award saved!'))
    setShowForm(false)
    onUpdate()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete award?')) return
    const updatedList = items.filter(i => i.id !== id)
    setItems(updatedList)
    localStorage.setItem('app_awards_honors', JSON.stringify(updatedList))
    try {
      await supabase.from('awards_honors').delete().eq('id', id)
    } catch (e) {}
    onUpdate()
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">🏆 {tLabel('पुरस्कार एवं सम्मान', 'Awards & Honors')}</h2>
        {!showForm && (
          <button className="admin-btn-primary" onClick={() => { setEditingId(null); setFormData({ year_display: '', title: '', organization: '', sort_order: items.length + 1 }); setShowForm(true); }}>
            + {tLabel('नया सम्मान जोड़ें', 'Add Award')}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>{tLabel('वर्ष (e.g. १९९५ / 1995)', 'Year (e.g. 1995)')}</label>
              <input className="admin-input" value={formData.year_display} onChange={e => setFormData({ ...formData, year_display: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>{tLabel('सम्मान का नाम', 'Award Title')}</label>
              <input className="admin-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="admin-form-group full-width">
              <label>{tLabel('संस्था / आयोजक', 'Organization')}</label>
              <input className="admin-input" value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="admin-btn-primary">{tLabel('सहेजें', 'Save Award')}</button>
            <button type="button" className="admin-btn-secondary" onClick={() => setShowForm(false)}>{tLabel('रद्द करें', 'Cancel')}</button>
          </div>
        </form>
      )}

      <ul className="admin-item-list">
        {items.map(item => (
          <li key={item.id} className="admin-item-card">
            <div>
              <div className="admin-item-title"><span style={{ color: 'var(--leona-terracotta)', fontWeight: 700 }}>{item.year_display}</span> — {item.title}</div>
              <div className="admin-item-sub">{tLabel('संस्था:', 'Org:')} {item.organization}</div>
            </div>
            <div className="admin-actions-group">
              <button className="admin-btn-secondary" onClick={() => { setEditingId(item.id); setFormData(item); setShowForm(true); }}>{tLabel('संपादित करें', 'Edit')}</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(item.id)}>{tLabel('हटाएं', 'Delete')}</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Contact Inbox Manager Component
function InboxManager({ onUpdate }) {
  const { tLabel } = useAdminLang()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetchInbox()
  }, [])

  const fetchInbox = async () => {
    try {
      const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false })
      if (!error && data && data.length > 0) {
        setMessages(data)
      } else {
        setMessages([
          { id: '1', name: 'राजेश कुमार', email: 'rajesh@example.com', subject: 'काव्य सम्मेलन आमंत्रण', message: 'आदरणीय कवि जी, हम आपको जयपुर साहित्य उत्सव में काव्य पाठ हेतु आमंत्रित करना चाहते हैं।', created_at: new Date().toISOString() }
        ])
      }
    } catch (e) {
      console.warn('Inbox fetch error:', e)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    try {
      await supabase.from('contact_submissions').delete().eq('id', id)
      fetchInbox()
    } catch (e) {
      setMessages(messages.filter(m => m.id !== id))
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">📬 {tLabel('प्राप्त संदेश इनबॉक्स', 'Messages Inbox')}</h2>
      </div>

      {messages.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic', padding: '20px' }}>{tLabel('कोई नया संदेश नहीं मिला।', 'No new messages found.')}</p>
      ) : (
        <ul className="admin-item-list">
          {messages.map(msg => (
            <li key={msg.id} className="admin-item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>{msg.name} ({msg.email})</span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(msg.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--leona-terracotta)' }}>{tLabel('विषय:', 'Subject:')} {msg.subject}</div>
              <div style={{ background: '#FDFBF7', padding: '12px', borderRadius: '8px', border: '1px solid rgba(226, 215, 197, 0.6)', width: '100%', fontSize: '0.95rem', color: 'var(--leona-text-main)' }}>
                "{msg.message}"
              </div>
              <div style={{ marginTop: '6px', alignSelf: 'flex-end' }}>
                <button className="admin-btn-danger" onClick={() => handleDelete(msg.id)}>{tLabel('हटाएं', 'Delete')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminDashboard
