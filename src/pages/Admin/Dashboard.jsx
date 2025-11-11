import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getCategories, getAboutContent, getPublications, getPoems, getSetting } from '../../lib/supabaseClient'
import { uploadImage, getImageUrl } from '../../lib/imageUtils'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('categories')
  const [loading, setLoading] = useState(false)
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
    return <div className="loading">Loading...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--accent)' }}>Admin Dashboard</h1>
        <button onClick={handleLogout} className="btn">Logout</button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button
          className={`btn ${activeTab === 'publications' ? 'active' : ''}`}
          onClick={() => setActiveTab('publications')}
        >
          Publications
        </button>
        <button
          className={`btn ${activeTab === 'poems' ? 'active' : ''}`}
          onClick={() => setActiveTab('poems')}
        >
          Poems
        </button>
        <button
          className={`btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'categories' && (
        <CategoriesManager categories={data.categories} onUpdate={loadData} />
      )}
      {activeTab === 'about' && (
        <AboutManager about={data.about} onUpdate={loadData} />
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
    </div>
  )
}

// Categories Manager Component
function CategoriesManager({ categories, onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name_en: '', name_display: '', content_type: 'about', sort_order: 0 })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await supabase.from('categories').update(formData).eq('id', editing)
      } else {
        await supabase.from('categories').insert(formData)
      }
      onUpdate()
      setEditing(null)
      setFormData({ name_en: '', name_display: '', content_type: 'about', sort_order: 0 })
      alert('Saved!')
    } catch (err) {
      alert('Error saving category')
    }
  }

  const handleEdit = (cat) => {
    setEditing(cat.id)
    setFormData(cat)
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

  return (
    <div>
      <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Categories</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Name (EN) *</label>
          <input
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Display Name</label>
          <input
            value={formData.name_display}
            onChange={(e) => setFormData({ ...formData, name_display: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Content Type *</label>
          <select
            value={formData.content_type}
            onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
            required
          >
            <option value="about">About</option>
            <option value="publications">Publications</option>
            <option value="writings">Writings</option>
          </select>
        </div>
        <div className="form-group">
          <label>Sort Order</label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>
        <button type="submit" className="btn">
          {editing ? 'Update' : 'Create'} Category
        </button>
        {editing && (
          <button type="button" className="btn" onClick={() => {
            setEditing(null)
            setFormData({ name_en: '', name_display: '', content_type: 'about', sort_order: 0 })
          }}>
            Cancel
          </button>
        )}
      </form>

      <ul className="admin-list" style={{ marginTop: '24px' }}>
        {categories.map((cat) => (
          <li key={cat.id} className="admin-list-item">
            <div>
              <strong>{cat.name_display || cat.name_en}</strong> ({cat.content_type})
            </div>
            <div className="actions">
              <button className="btn" onClick={() => handleEdit(cat)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(cat.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// About Manager Component
function AboutManager({ about, onUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    body_text: '',
    truncated_preview: '',
    photo_path: ''
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    if (about) {
      setFormData(about)
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
      if (about) {
        await supabase.from('about_content').update(formData).eq('id', about.id)
      } else {
        await supabase.from('about_content').insert(formData)
      }
      alert('Saved!')
      onUpdate()
    } catch (err) {
      alert('Error saving about content')
    }
  }

  return (
    <div>
      <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>About Content</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Title</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        
        <div className="form-group">
          <label>Photo</label>
          <div style={{ marginBottom: '12px' }}>
            {photoPreview && (
              <img 
                src={photoPreview} 
                alt="Preview" 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  marginBottom: '12px'
                }} 
              />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
          />
          {uploadingPhoto && <div style={{ marginTop: '8px', color: '#666' }}>Uploading...</div>}
          {formData.photo_path && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Current: {formData.photo_path}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Body Text (Markdown) *</label>
          <textarea
            value={formData.body_text}
            onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
            required
            style={{ minHeight: '300px' }}
          />
        </div>
        <div className="form-group">
          <label>Truncated Preview</label>
          <textarea
            value={formData.truncated_preview}
            onChange={(e) => setFormData({ ...formData, truncated_preview: e.target.value })}
          />
        </div>
        <button type="submit" className="btn">Save</button>
      </form>
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
      if (editing) {
        await supabase.from('publications').update(formData).eq('id', editing)
      } else {
        const { data: newPub } = await supabase.from('publications').insert(formData).select().single()
        // If image was uploaded to temp folder, move it to the actual publication folder
        if (formData.image_path.includes('temp-') && newPub) {
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
      setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0 })
      setImagePreview(null)
      alert('Saved!')
    } catch (err) {
      alert('Error saving publication')
    }
  }

  const handleEdit = (pub) => {
    setEditing(pub.id)
    setFormData(pub)
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
    <div>
      <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Publications</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Subtitle</label>
          <input
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Cover Image *</label>
          <div style={{ marginBottom: '12px' }}>
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  width: '150px', 
                  height: '225px', 
                  objectFit: 'contain', 
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  background: '#f8f8f8'
                }} 
              />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
          />
          {uploadingImage && <div style={{ marginTop: '8px', color: '#666' }}>Uploading...</div>}
          {formData.image_path && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Current: {formData.image_path}
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Image Alt Text</label>
          <input
            value={formData.image_alt}
            onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Sort Order</label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>
        <button type="submit" className="btn">
          {editing ? 'Update' : 'Create'} Publication
        </button>
        {editing && (
          <button type="button" className="btn" onClick={() => {
            setEditing(null)
            setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0 })
            setImagePreview(null)
          }}>
            Cancel
          </button>
        )}
      </form>

      <ul className="admin-list" style={{ marginTop: '24px' }}>
        {publications.map((pub) => (
          <li key={pub.id} className="admin-list-item">
            <div>
              <strong>{pub.title}</strong> (Order: {pub.sort_order})
            </div>
            <div className="actions">
              <button className="btn" onClick={() => handleEdit(pub)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(pub.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Poems Manager Component
function PoemsManager({ poems, onUpdate }) {
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    heading: '',
    description: '',
    full_text: '',
    language: 'mixed',
    sort_order: 0
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await supabase.from('poems').update(formData).eq('id', editing)
      } else {
        await supabase.from('poems').insert(formData)
      }
      onUpdate()
      setEditing(null)
      setFormData({ heading: '', description: '', full_text: '', language: 'mixed', sort_order: 0 })
      alert('Saved!')
    } catch (err) {
      alert('Error saving poem')
    }
  }

  const handleEdit = (poem) => {
    setEditing(poem.id)
    setFormData(poem)
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
    <div>
      <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Poems</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Heading *</label>
          <input
            value={formData.heading}
            onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Full Text *</label>
          <textarea
            value={formData.full_text}
            onChange={(e) => setFormData({ ...formData, full_text: e.target.value })}
            required
            style={{ minHeight: '300px' }}
          />
        </div>
        <div className="form-group">
          <label>Language</label>
          <input
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Sort Order</label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
          />
        </div>
        <button type="submit" className="btn">
          {editing ? 'Update' : 'Create'} Poem
        </button>
        {editing && (
          <button type="button" className="btn" onClick={() => {
            setEditing(null)
            setFormData({ heading: '', description: '', full_text: '', language: 'mixed', sort_order: 0 })
          }}>
            Cancel
          </button>
        )}
      </form>

      <ul className="admin-list" style={{ marginTop: '24px' }}>
        {poems.map((poem) => (
          <li key={poem.id} className="admin-list-item">
            <div>
              <strong>{poem.heading || 'Untitled'}</strong> (Order: {poem.sort_order})
            </div>
            <div className="actions">
              <button className="btn" onClick={() => handleEdit(poem)}>Edit</button>
              <button className="btn btn-danger" onClick={() => handleDelete(poem.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Settings Manager Component
function SettingsManager({ settings, onUpdate }) {
  const [formData, setFormData] = useState({
    phone: '',
    phone_text: '',
    whatsapp: '',
    whatsapp_text: '',
    email: '',
    email_text: '',
    thank_you_message: '',
    default_accent: '#964B00'
  })

  useEffect(() => {
    setFormData({
      phone: settings.phone || '+917676885989',
      phone_text: settings.phone_text || 'Call me',
      whatsapp: settings.whatsapp || 'https://wa.me/917676885989',
      whatsapp_text: settings.whatsapp_text || 'Whatsapp me',
      email: settings.email || '',
      email_text: settings.email_text || 'Email me',
      thank_you_message: settings.thank_you_message || 'Thank you!',
      default_accent: settings.default_accent || '#964B00'
    })
  }, [settings])

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
    } catch (err) {
      alert('Error saving settings')
      console.error(err)
    }
  }

  return (
    <div>
      <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Site Settings</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+917676885989"
          />
        </div>
        <div className="form-group">
          <label>Phone Link Text</label>
          <input
            value={formData.phone_text}
            onChange={(e) => setFormData({ ...formData, phone_text: e.target.value })}
            placeholder="Call me"
          />
        </div>
        <div className="form-group">
          <label>WhatsApp URL</label>
          <input
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="https://wa.me/917676885989"
          />
        </div>
        <div className="form-group">
          <label>WhatsApp Link Text</label>
          <input
            value={formData.whatsapp_text}
            onChange={(e) => setFormData({ ...formData, whatsapp_text: e.target.value })}
            placeholder="Whatsapp me"
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@email.com"
          />
        </div>
        <div className="form-group">
          <label>Email Link Text</label>
          <input
            value={formData.email_text}
            onChange={(e) => setFormData({ ...formData, email_text: e.target.value })}
            placeholder="Email me"
          />
        </div>
        <div className="form-group">
          <label>Thank You Message</label>
          <textarea
            value={formData.thank_you_message}
            onChange={(e) => setFormData({ ...formData, thank_you_message: e.target.value })}
            placeholder="Thank you!"
            rows="3"
          />
        </div>
        <div className="form-group">
          <label>Default Theme Color</label>
          <input
            type="color"
            value={formData.default_accent}
            onChange={(e) => setFormData({ ...formData, default_accent: e.target.value })}
            style={{ width: '100px', height: '40px' }}
          />
          <input
            type="text"
            value={formData.default_accent}
            onChange={(e) => setFormData({ ...formData, default_accent: e.target.value })}
            placeholder="#964B00"
            style={{ marginLeft: '12px', width: '200px' }}
          />
        </div>
        <button type="submit" className="btn">Save Settings</button>
      </form>
    </div>
  )
}

export default AdminDashboard
