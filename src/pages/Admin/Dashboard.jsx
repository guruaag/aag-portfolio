import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getCategories, getAboutContent, getPublications, getPoems, getSetting, getAllSettings } from '../../lib/supabaseClient'
import { uploadImage, getImageUrl, deleteImage } from '../../lib/imageUtils'
import PM5WritingDesk, { paginateTextIntoPages } from '../../components/PM5WritingDesk'
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

// Custom Bilingual Unsaved Changes Confirmation Modal Component
function UnsavedChangesModal({ isOpen, onConfirmDiscard, onKeepEditing, tLabel }) {
  if (!isOpen) return null

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card">
        <div className="admin-modal-icon">⚠️</div>
        <h3 className="admin-modal-title">
          {tLabel('असुरक्षित बदलाव मौजूद हैं', 'Unsaved Changes Detected')}
        </h3>
        <p className="admin-modal-body">
          {tLabel(
            'आपके द्वारा किए गए परिवर्तन अभी तक सहेजे नहीं गए हैं। यदि आप आगे बढ़ते हैं, तो आपके बदलाव नष्ट हो जाएंगे।',
            'You have unsaved changes on this form. Leaving this page will discard your recent updates.'
          )}
        </p>
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn-secondary" onClick={onKeepEditing}>
            ✏️ {tLabel('संपादन जारी रखें', 'Keep Editing')}
          </button>
          <button type="button" className="admin-btn-danger" onClick={onConfirmDiscard}>
            🗑️ {tLabel('परिवर्तन छोड़ें', 'Discard Changes')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ tab }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(tab || 'categories')
  const [loading, setLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const switchTab = (newTab, routePath) => {
    if (isDirty) {
      setPendingNavigation({ newTab, routePath })
      setShowUnsavedModal(true)
      return
    }
    executeTabSwitch(newTab, routePath)
  }

  const executeTabSwitch = (newTab, routePath) => {
    setIsDirty(false)
    setActiveTab(newTab)
    setMobileOpen(false)
    if (routePath) {
      navigate(routePath)
    }
  }

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false)
    if (pendingNavigation) {
      executeTabSwitch(pendingNavigation.newTab, pendingNavigation.routePath)
      setPendingNavigation(null)
    }
  }

  const handleCancelNavigation = () => {
    setShowUnsavedModal(false)
    setPendingNavigation(null)
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
      // Auto-align category seed data titles to match website sections
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
            }
          }
        }
      } catch (e) {
        console.warn('Category seed alignment check:', e)
      }

      const [cats, about, pubs, poems, settingsList] = await Promise.all([
        getCategories().catch(err => { console.error('Error fetching categories:', err); return [] }),
        getAboutContent().catch(err => { console.error('Error fetching about content:', err); return null }),
        getPublications().catch(err => { console.error('Error fetching publications:', err); return [] }),
        getPoems().catch(err => { console.error('Error fetching poems:', err); return [] }),
        getAllSettings().catch(err => { console.error('Error fetching settings:', err); return [] })
      ])
      
      const settingsMap = {}
      if (Array.isArray(settingsList)) {
        settingsList.forEach(s => {
          if (s && s.key) {
            settingsMap[s.key] = s.value
          }
        })
      }
      
      setData({ 
        categories: Array.isArray(cats) ? cats : [], 
        about: about || null, 
        publications: Array.isArray(pubs) ? pubs : [], 
        poems: Array.isArray(poems) ? poems : [],
        settings: settingsMap
      })
    } catch (err) {
      console.error('Error loading admin data:', err)
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
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onConfirmDiscard={handleConfirmDiscard}
        onKeepEditing={handleCancelNavigation}
        tLabel={tLabel}
      />
      <div className="admin-layout">
        
        {/* Mobile Top Navigation Bar (<768px) */}
        <div className="admin-mobile-topbar">
          <button className="admin-hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            ☰ {tLabel('नेविगेशन', 'Menu')}
          </button>
          <span className="admin-mobile-title">
            📜 {tLabel("एडमिन पैनल", "Admin Panel")}
          </span>
        </div>

        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div className="admin-drawer-overlay" onClick={() => setMobileOpen(false)} />
        )}

        {/* Phase 1 Persistent Sidebar */}
        <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-top">
            <div className="admin-sidebar-brand">
              <span>📜</span>
              <span>{tLabel("कवि गुरुप्रताप शर्मा 'आग'", "Gurupratap Sharma 'Aag'")}</span>
            </div>
            
            <Link to="/" className="admin-back-btn" onClick={() => setMobileOpen(false)}>
              ← {tLabel('मुख्य साइट पर जाएं', 'Back to Main Site')}
            </Link>

            {/* Navigation Tabs Bar in Sidebar */}
            <div className="admin-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
              
              {/* Home Page */}
              <button
                className={`admin-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => switchTab('home', '/admin/home')}
              >
                🏠 {tLabel('मुख्य पृष्ठ', 'Home Page')}
              </button>

              {/* About Bio Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'about' || activeTab === 'timeline' || activeTab === 'awards' ? 'active' : ''}`}
                onClick={() => switchTab('about', '/admin/parichay')}
              >
                📖 {tLabel('कवि परिचय', 'About Bio')}
              </button>
              
              {/* Nested Sub-categories for About Bio */}
              <div className="admin-sub-nav">
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => switchTab('about', '/admin/parichay')}
                >
                  ▫️ 1. {tLabel('कवि परिचय व बैनर', 'Overview & Hero')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                  onClick={() => switchTab('timeline', '/admin/timeline')}
                >
                  ▫️ 2. {tLabel('जीवन यात्रा (टाइमलाइन)', 'Timeline')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'awards' ? 'active' : ''}`}
                  onClick={() => switchTab('awards', '/admin/awards')}
                >
                  ▫️ 3. {tLabel('पुरस्कार व सम्मान', 'Awards & Honors')}
                </button>
              </div>

              {/* Poetry Archive Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'poems' || activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => switchTab('poems', '/admin/kavya-sangrah')}
              >
                ✍️ {tLabel('काव्य संग्रह', 'Poetry Archive')}
              </button>

              {/* Nested Sub-categories for Poetry Archive */}
              <div className="admin-sub-nav">
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'poems' ? 'active' : ''}`}
                  onClick={() => switchTab('poems', '/admin/kavya-sangrah')}
                >
                  ▫️ 1. {tLabel('काव्य सूची', 'Poetry List')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
                  onClick={() => switchTab('categories', '/admin/categories')}
                >
                  ▫️ 2. {tLabel('काव्य श्रेणियां', 'Poetry Categories')}
                </button>
              </div>

              {/* Publications Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
                onClick={() => switchTab('publications', '/admin/prakashan')}
              >
                📚 {tLabel('प्रकाशन', 'Publications')}
              </button>

              {/* Contact & Inbox Section */}
              <button
                className={`admin-tab-btn ${activeTab === 'contact' || activeTab === 'inbox' ? 'active' : ''}`}
                onClick={() => switchTab('contact', '/admin/sampark')}
              >
                📞 {tLabel('संपर्क व इनबॉक्स', 'Contact & Inbox')}
              </button>

              {/* Nested Sub-categories for Contact */}
              <div className="admin-sub-nav">
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                  onClick={() => switchTab('contact', '/admin/sampark')}
                >
                  ▫️ 1. {tLabel('संपर्क विवरण', 'Contact Info')}
                </button>
                <button
                  className={`admin-sub-tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
                  onClick={() => switchTab('inbox', '/admin/inbox')}
                >
                  ▫️ 2. {tLabel('प्राप्त संदेश', 'Received Inbox')}
                </button>
              </div>

              {/* Site Settings */}
              <button
                className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => switchTab('settings', '/admin/settings')}
              >
                ⚙️ {tLabel('सेटिंग्स', 'Site Settings')}
              </button>
            </div>
          </div>

          <div className="admin-sidebar-bottom">
            <button className="admin-lang-toggle-btn" onClick={toggleAdminLang} style={{ width: '100%', justifyContent: 'center' }}>
              🌐 {adminLang === 'hi' ? 'English' : 'हिंदी'}
            </button>
            <button className="admin-btn-logout" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
              🚪 {tLabel('लॉगआउट', 'Logout')}
            </button>
          </div>
        </aside>

        {/* Flexible Main Canvas Area */}
        <main className="admin-main-canvas">
          
          {/* Persistent Sticky Top Action Header */}
          <header className="admin-sticky-header">
            <div className="admin-sticky-header-left">
              <span className="admin-breadcrumb-title">
                {activeTab === 'home' && `🏠 ${tLabel('मुख्य पृष्ठ', 'Home Page')}`}
                {activeTab === 'about' && `📖 ${tLabel('कवि परिचय व बैनर', 'Poet Bio & Hero Banner')}`}
                {activeTab === 'timeline' && `⏳ ${tLabel('जीवन यात्रा (टाइमलाइन)', 'Timeline Milestones')}`}
                {activeTab === 'awards' && `🏆 ${tLabel('पुरस्कार व सम्मान', 'Awards & Honors')}`}
                {activeTab === 'poems' && `✍️ ${tLabel('काव्य रचनाएं', 'Poetry List')}`}
                {activeTab === 'categories' && `🌐 ${tLabel('काव्य श्रेणियां', 'Poetry Categories')}`}
                {activeTab === 'publications' && `📚 ${tLabel('प्रकाशन संग्रह', 'Publications List')}`}
                {activeTab === 'contact' && `📍 ${tLabel('संपर्क विवरण', 'Contact Info')}`}
                {activeTab === 'inbox' && `📬 ${tLabel('प्राप्त संदेश (इनबॉक्स)', 'Inbox Messages')}`}
                {activeTab === 'settings' && `⚙️ ${tLabel('वेबसाइट सेटिंग्स', 'Site Settings')}`}
              </span>
            </div>

            <div className="admin-sticky-header-right">
              {isDirty && (
                <span className="admin-dirty-badge">
                  ⚠️ {tLabel('असुरक्षित बदलाव', 'Unsaved Changes')}
                </span>
              )}
              <button
                type="submit"
                form="admin-active-form"
                className="admin-btn-primary admin-header-save-btn"
                style={{ padding: '8px 20px', borderRadius: '20px', fontWeight: 700 }}
              >
                💾 {tLabel('सहेजें / अपडेट', 'Save / Update')}
              </button>
            </div>
          </header>

          <div className="admin-dashboard-container" style={{ padding: '24px' }}>
            {activeTab === 'home' && (
              <HomeManager publications={data.publications} about={data.about} settings={data.settings} onUpdate={loadData} setIsDirty={setIsDirty} />
            )}
            {(activeTab === 'about' || activeTab === 'timeline' || activeTab === 'awards') && (
              <AboutManager
                about={data.about}
                initialSubTab={activeTab === 'timeline' ? 'timeline' : (activeTab === 'awards' ? 'awards' : 'bio')}
                onUpdate={loadData}
                setIsDirty={setIsDirty}
              />
            )}
            {(activeTab === 'poems' || activeTab === 'categories') && (
              <PoemsArchiveManager
                poems={data.poems}
                categories={data.categories}
                initialSubTab={activeTab === 'categories' ? 'categories' : 'poems'}
                onUpdate={loadData}
                setIsDirty={setIsDirty}
              />
            )}
            {activeTab === 'publications' && (
              <PublicationsManager publications={data.publications} onUpdate={loadData} setIsDirty={setIsDirty} />
            )}
            {(activeTab === 'contact' || activeTab === 'inbox') && (
              <ContactSectionManager
                settings={data.settings}
                initialSubTab={activeTab === 'inbox' ? 'inbox' : 'info'}
                onUpdate={loadData}
                setIsDirty={setIsDirty}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsManager settings={data.settings} onUpdate={loadData} setIsDirty={setIsDirty} />
            )}
          </div>
        </main>

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
        <form id="admin-active-form" onSubmit={handleSubmit} className="admin-form-container">
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
        {(() => {
          const safeCats = Array.isArray(categories) ? categories : []
          return (
            <>
              <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
                {tLabel('सक्रिय अनुभाग सूची', 'Active Sections List')} ({safeCats.length})
              </h3>
              {safeCats.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>{tLabel('कोई अनुभाग नहीं मिला। नया अनुभाग जोड़ने के लिए बटन दबाएं।', 'No sections found. Click button to add new section.')}</p>
              ) : (
                <ul className="admin-item-list">
                  {safeCats.map((cat) => (
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
      </>
    )
  })()}
      </div>
    </div>
  )
}

// 1. Home Manager Component (Homepage Sections)
function HomeManager({ publications, about, settings, onUpdate }) {
  const { tLabel } = useAdminLang()

  return (
    <div>
      <PublicationsManager publications={publications} onUpdate={onUpdate} />
      <div style={{ marginTop: '30px' }}>
        <AboutManager about={about} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

// 2. Contact Section Manager Component (Contact Details + Inbox)
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
      {subTab === 'info' && <SettingsManager settings={settings} onUpdate={onUpdate} />}
      {subTab === 'inbox' && <InboxManager onUpdate={onUpdate} />}
    </div>
  )
}

function AboutManager({ about, initialSubTab, onUpdate }) {
  const { tLabel } = useAdminLang()
  const [subTab, setSubTab] = useState(initialSubTab || 'bio') // 'bio' | 'timeline' | 'awards'

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab)
    }
  }, [initialSubTab])

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
    } catch (err) {
      console.error('Error saving about content:', err)
      alert('Error saving about content: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div>
      {subTab === 'timeline' && <TimelineManager onUpdate={onUpdate} />}
      {subTab === 'awards' && <AwardsManager onUpdate={onUpdate} />}

      {subTab === 'bio' && (
        <div className="admin-card-panel">
          <div className="admin-panel-header">
            <h2 className="admin-panel-title">📖 {tLabel('कवि परिचय व बैनर सम्पादन', 'Poet Biography & Hero Banner')}</h2>
          </div>

          <form id="admin-active-form" onSubmit={handleSubmit} className="admin-form-container">
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
                  <label>{tLabel('बैज पाठ', 'Badge Tag')}</label>
                  <input
                    className="admin-input"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>{tLabel('उद्धरण श्रेय (Quote Attribution)', 'Quote Attribution')}</label>
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
                🖼️ {tLabel('कवि की तस्वीर', 'Poet Photograph')}
              </h4>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Author Preview"
                    style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--leona-gold)' }}
                  />
                ) : (
                  <div style={{ width: '100px', height: '120px', background: '#F4EFE6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.8rem' }}>
                    {tLabel('कोई फोटो नहीं', 'No Photo')}
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    style={{ marginBottom: '8px', display: 'block' }}
                  />
                  <small style={{ color: '#666', display: 'block' }}>
                    {uploadingPhoto ? tLabel('अपलोड हो रहा है...', 'Uploading photo...') : tLabel('कवि परिचय के लिए उपयुक्त पोर्ट्रेट चित्र चुनें (JPG/PNG)', 'Select author portrait photo')}
                  </small>
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Lora, serif', color: 'var(--leona-charcoal)' }}>
                📝 {tLabel('विस्तृत जीवन परिचय (बायोग्राफी गद्य)', 'Biography Text & Prose')}
              </h4>
              <div className="admin-form-grid">
                <div className="admin-form-group full-width">
                  <label>{tLabel('बायोग्राफी शीर्षक *', 'Biography Title *')}</label>
                  <input
                    className="admin-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label>{tLabel('मुख्य पृष्ठ संक्षेप (Truncated Preview Text)', 'Homepage Short Summary')}</label>
                  <textarea
                    className="admin-textarea"
                    value={formData.truncated_preview}
                    onChange={(e) => setFormData({ ...formData, truncated_preview: e.target.value })}
                    rows={3}
                    placeholder="मुख्य पृष्ठ पर प्रदर्शित होने वाला संक्षेप..."
                  />
                </div>
                <div className="admin-form-group full-width">
                  <label>{tLabel('पूर्ण बायोग्राफी पाठ (Full Prose Text) *', 'Full Biography Prose Text *')}</label>
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
          </form>
        </div>
      )}
    </div>
  )
}

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
        <form id="admin-active-form" onSubmit={handleSubmit} className="admin-form-container">
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
        <form id="admin-active-form" onSubmit={handleSubmit} className="admin-form-container">
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

      {(() => {
        const safeMsgs = Array.isArray(messages) ? messages : []
        return safeMsgs.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', padding: '20px' }}>{tLabel('कोई नया संदेश नहीं मिला।', 'No new messages found.')}</p>
        ) : (
          <ul className="admin-item-list">
            {safeMsgs.map(msg => (
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
      )
    })()}
    </div>
  )
}

export default AdminDashboard
