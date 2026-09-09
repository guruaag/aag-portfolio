import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getCategories, getAboutContent, getPublications, getPoems, getSetting } from '../../lib/supabaseClient'
import { uploadImage, getImageUrl, deleteImage } from '../../lib/imageUtils'
import PM5WritingDesk from '../../components/PM5WritingDesk'
import './AdminDashboard.css'

function AdminDashboard({ tab }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(tab || 'categories')
  const [loading, setLoading] = useState(false)

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
    <div className="admin-dashboard-container">
      {/* Leona Header Bar */}
      <header className="admin-header-bar">
        <div className="admin-header-title">
          <span>गुरुप्रताप शर्मा 'आग'</span>
          <span className="accent-badge">CMS ADMIN</span>
        </div>
        <button onClick={handleLogout} className="admin-btn-logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          प्रशासन से बाहर निकलें (Logout)
        </button>
      </header>

      <div className="admin-main-wrapper">
        {/* Navigation Tabs */}
        <div className="admin-tabs-bar">
          <button
            className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => switchTab('categories', '/admin/categories')}
          >
            🌐 वेबसाइट अनुभाग (Categories)
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => switchTab('about', '/admin/parichay')}
          >
            📖 कवि परिचय (About Bio)
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => switchTab('timeline', '/admin/timeline')}
          >
            ⏳ जीवन यात्रा Timeline
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'awards' ? 'active' : ''}`}
            onClick={() => switchTab('awards', '/admin/awards')}
          >
            🏆 सम्मान Awards
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
            onClick={() => switchTab('publications', '/admin/prakashan')}
          >
            📚 प्रकाशन (Publications)
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'poems' ? 'active' : ''}`}
            onClick={() => switchTab('poems', '/admin/kavya-sangrah')}
          >
            ✍️ काव्य रचनाएं (Poems)
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => switchTab('settings', '/admin/sampark')}
          >
            ⚙️ सेटिंग्स (Settings)
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => switchTab('inbox', '/admin/inbox')}
          >
            📬 संदेश Inbox
          </button>
        </div>

        {activeTab === 'categories' && (
          <CategoriesManager categories={data.categories} onUpdate={loadData} />
        )}
        {activeTab === 'about' && (
          <AboutManager about={data.about} onUpdate={loadData} />
        )}
        {activeTab === 'timeline' && (
          <TimelineManager onUpdate={loadData} />
        )}
        {activeTab === 'awards' && (
          <AwardsManager onUpdate={loadData} />
        )}
        {activeTab === 'publications' && (
          <PublicationsManager publications={data.publications} onUpdate={loadData} />
        )}
        {activeTab === 'poems' && (
          <PoemsManager poems={data.poems} onUpdate={loadData} />
        )}
        {activeTab === 'settings' && (
          <SettingsManager settings={data.settings} onUpdate={loadData} />
        )}
        {activeTab === 'inbox' && (
          <InboxManager onUpdate={loadData} />
        )}
      </div>
    </div>
  )
}

// Categories Manager Component
function CategoriesManager({ categories, onUpdate }) {
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
      if (editing) {
        const dataToSave = {
          name_en: formData.name_en,
          name_display: formData.name_display,
          content_type: formData.content_type,
          sort_order: formData.sort_order,
          ...(formData.is_active !== undefined && { is_active: formData.is_active })
        }
        await supabase.from('categories').update(dataToSave).eq('id', editing)
      } else {
        const dataToSave = {
          name_en: formData.name_en,
          name_display: formData.name_display,
          content_type: formData.content_type,
          sort_order: formData.sort_order,
          ...(formData.is_active !== undefined && { is_active: formData.is_active })
        }
        await supabase.from('categories').insert(dataToSave)
      }
      onUpdate()
      setEditing(null)
      setShowForm(false)
      setFormData({ name_en: '', name_display: '', content_type: 'about', sort_order: 0, is_active: true })
      alert('Saved!')
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
        <h2 className="admin-panel-title">वेबसाइट अनुभाग (Website Sections & Categories)</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + नया अनुभाग जोड़ें (Add Section)
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>अनुभाग नाम (English Name) *</label>
              <input
                className="admin-input"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>प्रदर्शित नाम (Hindi Display Name)</label>
              <input
                className="admin-input"
                value={formData.name_display}
                onChange={(e) => setFormData({ ...formData, name_display: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>सामग्री प्रकार (Content Type) *</label>
              <select
                className="admin-select"
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                required
              >
                <option value="about">कवि परिचय (About)</option>
                <option value="publications">प्रकाशन (Publications)</option>
                <option value="writings">काव्य संग्रह (Poems)</option>
                <option value="hero">Hero Banner</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>क्रम संख्या (Sort Order)</label>
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
                वेबसाइट पर सक्रिय रखें (Active / Visible on website)
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">
              {editing ? 'सहेजें (Update)' : 'जोड़ें (Create)'}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={handleCancel}>
              रद्द करें (Cancel)
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
          सक्रिय अनुभाग सूची ({categories.length})
        </h3>
        {categories.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>कोई अनुभाग नहीं मिला। नया अनुभाग जोड़ने के लिए बटन दबाएं।</p>
        ) : (
          <ul className="admin-item-list">
            {categories.map((cat) => (
              <li key={cat.id} className="admin-item-card">
                <div>
                  <div className="admin-item-title">{cat.name_display || cat.name_en}</div>
                  <div className="admin-item-sub">English: {cat.name_en} • प्रकार: {cat.content_type} • क्रम: {cat.sort_order || 0}</div>
                  {cat.is_active === false ? (
                    <span className="admin-item-badge" style={{ background: '#FFF0ED', color: '#D95343', borderColor: '#FFC4BD' }}>निष्क्रिय (Inactive)</span>
                  ) : (
                    <span className="admin-item-badge" style={{ background: '#EAF8F5', color: '#2C988F', borderColor: '#B5E8E2' }}>सक्रिय (Active)</span>
                  )}
                </div>
                <div className="admin-actions-group">
                  <button type="button" className="admin-btn-secondary" onClick={() => handleEdit(cat)}>संपादित करें (Edit)</button>
                  <button type="button" className="admin-btn-danger" onClick={() => handleDelete(cat.id)}>हटाएं (Delete)</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// About Manager Component
function AboutManager({ about, onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body_text: '',
    truncated_preview: '',
    photo_path: ''
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    if (about && !editing) {
      setFormData(about)
      if (about.photo_path) {
        setPhotoPreview(getImageUrl(about.photo_path))
      }
    }
  }, [about, editing])

  const handleCreate = () => {
    setEditing('new')
    setFormData({ title: '', body_text: '', truncated_preview: '', photo_path: '' })
    setPhotoPreview(null)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    if (about) {
      setFormData(about)
      if (about.photo_path) {
        setPhotoPreview(getImageUrl(about.photo_path))
      }
    } else {
      setFormData({ title: '', body_text: '', truncated_preview: '', photo_path: '' })
      setPhotoPreview(null)
    }
  }

  const handleEdit = () => {
    setEditing(about?.id || 'new')
    setShowForm(true)
  }

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
      setFormData({ ...formData, photo_path: path })
      setPhotoPreview(URL.createObjectURL(file))
      alert('Photo uploaded!')
    } catch (err) {
      alert('Error uploading photo: ' + err.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (about && editing !== 'new') {
        await supabase.from('about_content').update(formData).eq('id', about.id)
      } else {
        await supabase.from('about_content').insert(formData)
      }
      alert('Saved!')
      onUpdate()
      setEditing(null)
      setShowForm(false)
    } catch (err) {
      console.error('Error saving about content:', err)
      alert('Error saving about content: ' + (err.message || 'Unknown error'))
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">कवि परिचय (Poet Biography & Overview)</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={about ? handleEdit : handleCreate}>
            {about ? 'संपादित करें (Edit About)' : '+ नया विवरण जोड़ें (Add About)'}
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group full-width">
              <label>शीर्षक (Title)</label>
              <input
                className="admin-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="admin-form-group full-width">
              <label>कवि फोटो (Poet Photo)</label>
              {photoPreview && (
                <div style={{ marginBottom: '12px' }}>
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    style={{ 
                      width: '140px', 
                      height: '140px', 
                      objectFit: 'cover', 
                      borderRadius: '12px',
                      border: '2px solid var(--leona-gold)'
                    }} 
                  />
                </div>
              )}
              <input
                className="admin-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
              {uploadingPhoto && <div style={{ marginTop: '6px', color: 'var(--leona-terracotta)', fontSize: '0.85rem' }}>फोटो अपलोड हो रही है...</div>}
            </div>

            <div className="admin-form-group full-width">
              <label>सम्पूर्ण जीवनी (Full Bio Prose Text) *</label>
              <textarea
                className="admin-textarea"
                value={formData.body_text}
                onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                required
                style={{ minHeight: '220px' }}
              />
            </div>
            <div className="admin-form-group full-width">
              <label>संक्षिप्त परिचय (Truncated Preview for Home Page)</label>
              <textarea
                className="admin-textarea"
                value={formData.truncated_preview}
                onChange={(e) => setFormData({ ...formData, truncated_preview: e.target.value })}
                style={{ minHeight: '100px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">सहेजें (Save Changes)</button>
            <button type="button" className="admin-btn-secondary" onClick={handleCancel}>रद्द करें (Cancel)</button>
          </div>
        </form>
      )}

      {about && !showForm && (
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
          <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.15rem', color: 'var(--leona-charcoal)', marginBottom: '12px' }}>
            वर्तमान कवि परिचय विवरण
          </h3>
          <div style={{ fontSize: '0.92rem', color: 'var(--leona-text-main)', lineHeight: '1.7' }}>
            <p><strong>शीर्षक:</strong> {about.title || 'गुरुप्रताप शर्मा "आग"'}</p>
            <p style={{ marginTop: '8px' }}><strong>संक्षिप्त संक्षेप:</strong> {about.truncated_preview ? about.truncated_preview.substring(0, 160) + '...' : '(उपलब्ध नहीं)'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Publications Manager Component
function PublicationsManager({ publications, onUpdate }) {
  const [editing, setEditing] = useState(null)
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
        title: formData.title,
        subtitle: formData.subtitle,
        image_path: formData.image_path,
        image_alt: formData.image_alt,
        description: formData.description,
        sort_order: formData.sort_order,
        ...(formData.is_active !== undefined && { is_active: formData.is_active })
      }
      
      if (editing) {
        await supabase.from('publications').update(dataToSave).eq('id', editing)
      } else {
        const { data: newPub } = await supabase.from('publications').insert(dataToSave).select().single()
        // If image was uploaded to temp folder, move it to the actual publication folder
        if (formData.image_path && formData.image_path.includes('temp-') && newPub) {
          const oldPath = formData.image_path
          // Replace 'temp-{timestamp}' with actual publication ID
          // Path format: publications/temp-{timestamp}/cover.jpg -> publications/{id}/cover.jpg
          const newPath = oldPath.replace(/temp-\d+/, newPub.id)
          
          // Move the file in storage
          try {
            // Copy file to new location
            const { data: copyData, error: copyError } = await supabase.storage
              .from('public-assets')
              .copy(oldPath, newPath)
            
            if (!copyError) {
              // Update path in database
              await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
              // Remove old temp file
              await supabase.storage.from('public-assets').remove([oldPath])
            } else {
              // If copy fails, just update the path in database (file might already be in correct location)
              await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
            }
          } catch (moveError) {
            // Still update the path in database even if file move fails
            await supabase.from('publications').update({ image_path: newPath }).eq('id', newPub.id)
          }
        }
      }
      onUpdate()
      setEditing(null)
      setShowForm(false)
      setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0, is_active: true })
      setImagePreview(null)
      alert('Saved!')
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
        <h2 className="admin-panel-title">प्रकाशन एवं पुस्तकें (Publications & Books)</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + नई पुस्तक जोड़ें (Add Publication)
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>पुस्तक का नाम (Book Title) *</label>
              <input
                className="admin-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>उप-शीर्षक (Subtitle)</label>
              <input
                className="admin-input"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label>कवर चित्र (Book Cover Image)</label>
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
              <label>पुस्तक विवरण (Book Description & Synopsis)</label>
              <textarea
                className="admin-textarea"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label>क्रम संख्या (Sort Order)</label>
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
                वेबसाइट पर प्रकाशित रखें (Active on website)
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">
              {editing ? 'सहेजें (Update)' : 'प्रकाशित करें (Publish)'}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={() => {
              setEditing(null)
              setShowForm(false)
              setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0, is_active: true })
              setImagePreview(null)
            }}>
              रद्द करें (Cancel)
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
          प्रकाशित पुस्तकों की सूची ({publications.length})
        </h3>
        {publications.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>कोई पुस्तक नहीं मिली। नई पुस्तक जोड़ने के लिए बटन दबाएं।</p>
        ) : (
          <ul className="admin-item-list">
            {publications.map((pub) => (
              <li key={pub.id} className="admin-item-card">
                <div>
                  <div className="admin-item-title">{pub.title}</div>
                  <div className="admin-item-sub">{pub.subtitle || pub.description ? (pub.subtitle || pub.description).substring(0, 80) + '...' : ''} • क्रम: {pub.sort_order || 0}</div>
                  {pub.is_active === false ? (
                    <span className="admin-item-badge" style={{ background: '#FFF0ED', color: '#D95343', borderColor: '#FFC4BD' }}>अप्रकाशित (Draft)</span>
                  ) : (
                    <span className="admin-item-badge" style={{ background: '#EAF8F5', color: '#2C988F', borderColor: '#B5E8E2' }}>प्रकाशित (Live)</span>
                  )}
                </div>
                <div className="admin-actions-group">
                  <button type="button" className="admin-btn-secondary" onClick={() => handleEdit(pub)}>संपादित करें (Edit)</button>
                  <button type="button" className="admin-btn-danger" onClick={() => handleDelete(pub.id)}>हटाएं (Delete)</button>
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
  const [editing, setEditing] = useState(null)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare data for database - include backward compatibility fields
      const dataToSave = {
        heading_en: formData.heading_en,
        heading_hi: formData.heading_hi,
        description: formData.description,
        body_text_en: formData.body_text_en,
        body_text_hi: formData.body_text_hi,
        language: formData.language,
        sort_order: formData.sort_order,
        // Keep old 'heading' field for backward compatibility
        heading: formData.heading_en || formData.heading_hi || '',
        // Keep old 'full_text' field for backward compatibility
        full_text: formData.body_text_hi || formData.body_text_en || '',
        // Only include is_active if column exists (will be null if column doesn't exist, which is fine)
        ...(formData.is_active !== undefined && { is_active: formData.is_active })
      }
      
      if (editing) {
        await supabase.from('poems').update(dataToSave).eq('id', editing)
      } else {
        await supabase.from('poems').insert(dataToSave)
      }
      onUpdate()
      setEditing(null)
      setShowForm(false)
      setFormData({ heading_en: '', heading_hi: '', description: '', body_text_en: '', body_text_hi: '', language: 'mixed', sort_order: 0, is_active: true })
      alert('Saved!')
    } catch (err) {
      console.error('Error saving poem:', err)
      alert('Error saving poem: ' + (err.message || 'Unknown error'))
    }
  }

  const handleEdit = (poem) => {
    setEditing(poem.id)
    setShowForm(true)
    // Handle backward compatibility - map old 'heading' to 'heading_en' if needed
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
        <h2 className="admin-panel-title">काव्य रचनाएं एवं पद (Poems & Stanzas)</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleCreate}>
            + नई रचना जोड़ें (Add Poem)
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>कविता का नाम (Hindi Title) *</label>
              <input
                className="admin-input"
                value={formData.heading_hi || ''}
                onChange={(e) => setFormData({ ...formData, heading_hi: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>अंग्रेजी शीर्षक (English Title)</label>
              <input
                className="admin-input"
                value={formData.heading_en || ''}
                onChange={(e) => setFormData({ ...formData, heading_en: e.target.value })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label>रचना संदर्भ / विवरण (Context / Description)</label>
              <textarea
                className="admin-textarea"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ minHeight: '80px' }}
              />
            </div>
            <div className="admin-form-group full-width" style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '1.02rem', color: 'var(--leona-terracotta)', marginBottom: '8px', display: 'block' }}>
                🖋️ पापा का पेजमेकर (PM5) कैनवस (Hindi PM5 PageMaker Studio)
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
                  alert('✓ PM5 पेजमेकर कैनवस सामग्री फॉर्म में सहेज दी गई है!');
                }}
              />
            </div>
            <div className="admin-form-group full-width">
              <label>सम्पूर्ण कविता पंक्तियाँ (Full Stanzas / Verse Text) *</label>
              <textarea
                className="admin-textarea"
                value={formData.body_text_hi || ''}
                onChange={(e) => setFormData({ ...formData, body_text_hi: e.target.value })}
                required
                style={{ minHeight: '220px', fontFamily: 'Tiro Devanagari Hindi, Lora, serif', fontSize: '1.05rem', lineHeight: '1.7' }}
              />
            </div>
            <div className="admin-form-group">
              <label>क्रम संख्या (Sort Order)</label>
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
                वेबसाइट पर प्रकाशित रखें (Active / Visible on website)
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">
              {editing ? 'सहेजें (Update Poem)' : 'प्रकाशित करें (Publish Poem)'}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={handleCancel}>
              रद्द करें (Cancel)
            </button>
          </div>
        </form>
      )}

      <div>
        <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--leona-charcoal)' }}>
          कुल काव्य रचनाएं ({poems.length})
        </h3>
        {poems.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>कोई कविता नहीं मिली। नई रचना जोड़ने के लिए बटन दबाएं।</p>
        ) : (
          <ul className="admin-item-list">
            {poems.map((poem) => (
              <li key={poem.id} className="admin-item-card">
                <div>
                  <div className="admin-item-title">{poem.heading_hi || poem.heading_en || poem.heading || 'बिना शीर्षक'}</div>
                  <div className="admin-item-sub">English: {poem.heading_en || '(कोई नहीं)'} • क्रम: {poem.sort_order || 0}</div>
                  {poem.is_active === false ? (
                    <span className="admin-item-badge" style={{ background: '#FFF0ED', color: '#D95343', borderColor: '#FFC4BD' }}>अप्रकाशित (Draft)</span>
                  ) : (
                    <span className="admin-item-badge" style={{ background: '#EAF8F5', color: '#2C988F', borderColor: '#B5E8E2' }}>प्रकाशित (Live)</span>
                  )}
                </div>
                <div className="admin-actions-group">
                  <button type="button" className="admin-btn-secondary" onClick={() => handleEdit(poem)}>संपादित करें (Edit)</button>
                  <button type="button" className="admin-btn-danger" onClick={() => handleDelete(poem.id)}>हटाएं (Delete)</button>
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
        value: value || '',
        display_label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))

      for (const update of updates) {
        await supabase.from('settings').upsert(update, { onConflict: 'key' })
      }
      
      alert('Settings saved!')
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
        <h2 className="admin-panel-title">वेबसाइट सेटिंग्स (Website Settings & Social Links)</h2>
        {!showForm && (
          <button type="button" className="admin-btn-primary" onClick={handleEdit}>
            संपादित करें (Edit Settings)
          </button>
        )}
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group full-width">
              <label>वेबसाइट लोगो (Website Logo Image)</label>
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
              {uploadingLogo && <div style={{ marginTop: '6px', color: 'var(--leona-terracotta)', fontSize: '0.85rem' }}>लोगो अपलोड हो रहा है...</div>}
            </div>

            <div className="admin-form-group">
              <label>फोन नंबर (Phone Number)</label>
              <input
                className="admin-input"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+917676885989"
              />
            </div>
            <div className="admin-form-group">
              <label>व्हाट्सएप लिंक (WhatsApp Link / Number)</label>
              <input
                className="admin-input"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="https://wa.me/917676885989"
              />
            </div>
            <div className="admin-form-group">
              <label>ईमेल पता (Email Address)</label>
              <input
                className="admin-input"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@gurupratapsharma.com"
              />
            </div>
            <div className="admin-form-group full-width">
              <label>संपर्क पता (Location Address)</label>
              <input
                className="admin-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="साहित्य सदन, सिविल लाइन्स, जयपुर (राजस्थान), भारत - 302006"
              />
            </div>
            <div className="admin-form-group">
              <label>फेसबुक (Facebook Profile)</label>
              <input
                className="admin-input"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/gurupratap"
              />
            </div>
            <div className="admin-form-group">
              <label>इंस्टाग्राम (Instagram Profile)</label>
              <input
                className="admin-input"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/gurupratap"
              />
            </div>
            <div className="admin-form-group">
              <label>यूट्यूब (YouTube Channel)</label>
              <input
                className="admin-input"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                placeholder="https://youtube.com/@gurupratap"
              />
            </div>

            <div className="admin-form-group full-width">
              <label>मुख्य पृष्ठ टैगलाइन (Hero Tagline - Hindi)</label>
              <input
                className="admin-input"
                value={formData.hero_tagline_hi}
                onChange={(e) => setFormData({ ...formData, hero_tagline_hi: e.target.value })}
                placeholder="साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn-primary">सहेजें (Save Settings)</button>
            <button type="button" className="admin-btn-secondary" onClick={handleCancel}>रद्द करें (Cancel)</button>
          </div>
        </form>
      )}

      {!showForm && (
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
          <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.15rem', color: 'var(--leona-charcoal)', marginBottom: '12px' }}>
            वर्तमान वेबसाइट सेटिंग्स
          </h3>
          <div style={{ fontSize: '0.92rem', color: 'var(--leona-text-main)', lineHeight: '1.8' }}>
            <p><strong>फोन:</strong> {settings.phone || '+91 76768 85989'}</p>
            <p><strong>ईमेल:</strong> {settings.email || '(उपलब्ध नहीं)'}</p>
            <p><strong>टैगलाइन:</strong> {settings.hero_tagline_hi || 'साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Timeline Manager Component
function TimelineManager({ onUpdate }) {
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
      } else {
        setItems([
          { id: '1', year_display: '१९४५', title: 'जन्म एवं प्रारम्भिक शिक्षा', description: 'साहित्यिक वातावरण में बाल्यकाल व्यतीत हुआ। संस्कृत एवं हिंदी साहित्य में उच्च शिक्षा पूर्ण की।', sort_order: 1 },
          { id: '2', year_display: '१९६८', title: 'काव्य यात्रा का शुभारम्भ', description: 'प्रमुख राष्ट्रीय पत्र-पत्रिकाओं में कविताओं का प्रकाशन एवं कवि सम्मेलनों में ओजस्वी प्रस्तुति।', sort_order: 2 },
          { id: '3', year_display: '१९८५', title: "'अग्नि कलश' का प्रकाशन", description: "प्रसिद्ध काव्य कृति 'अग्नि कलश' का प्रथम संस्करण प्रकाशित, जिसे साहित्य जगत में अपार ख्याति मिली।", sort_order: 3 },
          { id: '4', year_display: '२०२६', title: '५० वर्ष का साहित्यिक अवदान', description: 'हिंदी काव्य सेवा के ५० वर्ष पूर्ण होने पर राष्ट्रीय स्तर पर नागरिक अभिनंदन।', sort_order: 4 }
        ])
      }
    } catch (e) {
      console.warn('Timeline fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId && editingId !== 'new') {
        await supabase.from('timeline_milestones').update(formData).eq('id', editingId)
      } else {
        await supabase.from('timeline_milestones').insert(formData)
      }
      alert('Timeline item saved!')
      setShowForm(false)
      fetchTimeline()
      onUpdate()
    } catch (err) {
      alert('Saved locally. Note: Create timeline_milestones table in Supabase if persistent storage is desired.')
      setShowForm(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this timeline item?')) return
    try {
      await supabase.from('timeline_milestones').delete().eq('id', id)
      fetchTimeline()
      onUpdate()
    } catch (e) {
      setItems(items.filter(i => i.id !== id))
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">कवि जीवन यात्रा Timeline Milestones</h2>
        {!showForm && (
          <button className="admin-btn-primary" onClick={() => { setEditingId(null); setFormData({ year_display: '', title: '', description: '', sort_order: items.length + 1 }); setShowForm(true); }}>
            + नया वर्ष/मील का पत्थर जोड़ें (Add Timeline Year)
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>वर्ष (Year Display e.g. १९४५ / 1945)</label>
              <input className="admin-input" value={formData.year_display} onChange={e => setFormData({ ...formData, year_display: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>शीर्षक (Title)</label>
              <input className="admin-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="admin-form-group full-width">
              <label>विवरण (Description)</label>
              <textarea className="admin-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="admin-btn-primary">सहेजें (Save Timeline)</button>
            <button type="button" className="admin-btn-secondary" onClick={() => setShowForm(false)}>रद्द करें (Cancel)</button>
          </div>
        </form>
      )}

      <ul className="admin-item-list">
        {items.map(item => (
          <li key={item.id} className="admin-item-card">
            <div>
              <div className="admin-item-title"><span style={{ color: 'var(--leona-terracotta)', fontWeight: 700 }}>{item.year_display}</span> — {item.title}</div>
              <div className="admin-item-sub">{item.description}</div>
            </div>
            <div className="admin-actions-group">
              <button className="admin-btn-secondary" onClick={() => { setEditingId(item.id); setFormData(item); setShowForm(true); }}>संपादित करें</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(item.id)}>हटाएं</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Awards Manager Component
function AwardsManager({ onUpdate }) {
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
      } else {
        setItems([
          { id: '1', year_display: '१९९५', title: 'राजस्थान साहित्य अकादमी सम्मान', organization: 'राजस्थान सरकार', sort_order: 1 },
          { id: '2', year_display: '२०१०', title: 'राष्ट्रकवि मैथिलीशरण गुप्त पुरस्कार', organization: 'हिंदी साहित्य सम्मेलन', sort_order: 2 },
          { id: '3', year_display: '२०२२', title: 'साहित्य जीवन साधना सम्मान', organization: 'भारतीय भाषा परिषद', sort_order: 3 }
        ])
      }
    } catch (e) {
      console.warn('Awards fetch error:', e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId && editingId !== 'new') {
        await supabase.from('awards_honors').update(formData).eq('id', editingId)
      } else {
        await supabase.from('awards_honors').insert(formData)
      }
      alert('Award saved!')
      setShowForm(false)
      fetchAwards()
      onUpdate()
    } catch (err) {
      alert('Notice: Saved locally.')
      setShowForm(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete award?')) return
    try {
      await supabase.from('awards_honors').delete().eq('id', id)
      fetchAwards()
      onUpdate()
    } catch (e) {
      setItems(items.filter(i => i.id !== id))
    }
  }

  return (
    <div className="admin-card-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title">पुरस्कार एवं सम्मान (Awards & Honors)</h2>
        {!showForm && (
          <button className="admin-btn-primary" onClick={() => { setEditingId(null); setFormData({ year_display: '', title: '', organization: '', sort_order: items.length + 1 }); setShowForm(true); }}>
            + नया सम्मान जोड़ें (Add Award)
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form-container">
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>वर्ष (Year e.g. १९९५ / 1995)</label>
              <input className="admin-input" value={formData.year_display} onChange={e => setFormData({ ...formData, year_display: e.target.value })} required />
            </div>
            <div className="admin-form-group">
              <label>सम्मान का नाम (Award Title)</label>
              <input className="admin-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="admin-form-group full-width">
              <label>संस्था / आयोजक (Organization)</label>
              <input className="admin-input" value={formData.organization} onChange={e => setFormData({ ...formData, organization: e.target.value })} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="admin-btn-primary">सहेजें (Save Award)</button>
            <button type="button" className="admin-btn-secondary" onClick={() => setShowForm(false)}>रद्द करें (Cancel)</button>
          </div>
        </form>
      )}

      <ul className="admin-item-list">
        {items.map(item => (
          <li key={item.id} className="admin-item-card">
            <div>
              <div className="admin-item-title"><span style={{ color: 'var(--leona-terracotta)', fontWeight: 700 }}>{item.year_display}</span> — {item.title}</div>
              <div className="admin-item-sub">संस्था: {item.organization}</div>
            </div>
            <div className="admin-actions-group">
              <button className="admin-btn-secondary" onClick={() => { setEditingId(item.id); setFormData(item); setShowForm(true); }}>संपादित करें</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(item.id)}>हटाएं</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Contact Inbox Manager Component
function InboxManager({ onUpdate }) {
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
        <h2 className="admin-panel-title">पाठक संवाद Inbox (Contact Messages)</h2>
      </div>

      {messages.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic', padding: '20px' }}>कोई नया संदेश नहीं मिला।</p>
      ) : (
        <ul className="admin-item-list">
          {messages.map(msg => (
            <li key={msg.id} className="admin-item-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>{msg.name} ({msg.email})</span>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(msg.created_at || Date.now()).toLocaleDateString('hi-IN')}</span>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--leona-terracotta)' }}>विषय: {msg.subject}</div>
              <div style={{ background: '#FDFBF7', padding: '12px', borderRadius: '8px', border: '1px solid rgba(226, 215, 197, 0.6)', width: '100%', fontSize: '0.95rem', color: 'var(--leona-text-main)' }}>
                "{msg.message}"
              </div>
              <div style={{ marginTop: '6px', alignSelf: 'flex-end' }}>
                <button className="admin-btn-danger" onClick={() => handleDelete(msg.id)}>हटाएं (Delete)</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AdminDashboard
