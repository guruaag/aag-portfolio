import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getCategories, getAboutContent, getPublications, getPoems, getSetting } from '../../lib/supabaseClient'
import { uploadImage, getImageUrl, deleteImage } from '../../lib/imageUtils'
import PM5WritingDesk from '../../components/PM5WritingDesk'

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
        <h1 style={{ color: 'var(--accent)', fontSize: '1.5rem', margin: 0, whiteSpace: 'nowrap' }}>Admin Dashboard</h1>
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: 'var(--accent)', margin: 0 }}>Categories</h2>
        {!showForm && (
          <button type="button" className="btn" onClick={handleCreate}>
            Create Category
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
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
            <option value="about">image + text</option>
            <option value="publications">cover page</option>
            <option value="writings">poems</option>
            <option value="hero">Hero Section</option>
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
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.is_active !== false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            {' '}Active (Show on website)
          </label>
        </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn">
              {editing ? 'Update' : 'Create'} Category
            </button>
            <button type="button" className="btn" onClick={handleCancel} style={{ background: '#999' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>All Categories ({categories.length})</h3>
        {categories.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No categories found. Click "Create Category" to add one.</p>
        ) : (
          <ul className="admin-list">
            {categories.map((cat) => (
              <li key={cat.id} className="admin-list-item" style={{ 
                padding: '12px', 
                marginBottom: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                background: cat.is_active === false ? '#f5f5f5' : '#fff'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '16px' }}>{cat.name_display || cat.name_en}</strong>
                    {cat.is_active === false && (
                      <span style={{ 
                        color: '#fff', 
                        background: '#999', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>INACTIVE</span>
                    )}
                    {cat.is_active !== false && (
                      <span style={{ 
                        color: '#fff', 
                        background: '#28a745', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    <strong>Content Type:</strong> {getContentTypeDisplay(cat.content_type)} | 
                    <strong> Sort Order:</strong> {cat.sort_order} |
                    <strong> ID:</strong> {cat.id.substring(0, 8)}...
                  </div>
                </div>
                <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={() => handleEdit(cat)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(cat.id)}>Delete</button>
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: 'var(--accent)', margin: 0 }}>About Content</h2>
        {!showForm && (
          <button type="button" className="btn" onClick={about ? handleEdit : handleCreate}>
            {about ? 'Edit' : 'Create'} About
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
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
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn">Save</button>
            <button type="button" className="btn" onClick={handleCancel} style={{ background: '#999' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {about && !showForm && (
        <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Current About Content</h3>
          <div style={{ marginBottom: '8px' }}>
            <strong>Title:</strong> {about.title || '(Not set)'}
          </div>
          {about.photo_path && (
            <div style={{ marginBottom: '8px' }}>
              <strong>Photo:</strong> {about.photo_path}
            </div>
          )}
          <div style={{ marginBottom: '8px' }}>
            <strong>Preview:</strong> {about.truncated_preview ? about.truncated_preview.substring(0, 100) + '...' : '(Not set)'}
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: 'var(--accent)', margin: 0 }}>Publications</h2>
        {!showForm && (
          <button type="button" className="btn" onClick={handleCreate}>
            Create Publication
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
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
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.is_active !== false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            {' '}Active (Show on website)
          </label>
        </div>
        <button type="submit" className="btn">
          {editing ? 'Update' : 'Create'} Publication
        </button>
        {editing && (
          <button type="button" className="btn" onClick={() => {
            setEditing(null)
            setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0, is_active: true })
            setImagePreview(null)
          }}>
            Cancel
          </button>
        )}
      </form>
      )}

      <ul className="admin-list" style={{ marginTop: '24px' }}>
        {publications.map((pub) => (
          <li key={pub.id} className="admin-list-item">
            <div>
              <strong>{pub.title}</strong> (Order: {pub.sort_order})
              {pub.is_active === false && <span style={{ color: '#999', marginLeft: '8px' }}>(Inactive)</span>}
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: 'var(--accent)', margin: 0 }}>Poems</h2>
        {!showForm && (
          <button type="button" className="btn" onClick={handleCreate}>
            Create Poem
          </button>
        )}
      </div>
      
      {(showForm || editing) && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
        <div className="form-group">
          <label>Heading (English) *</label>
          <input
            value={formData.heading_en || ''}
            onChange={(e) => setFormData({ ...formData, heading_en: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Heading (Hindi)</label>
          <input
            value={formData.heading_hi || ''}
            onChange={(e) => setFormData({ ...formData, heading_hi: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Body Text (English)</label>
          <textarea
            value={formData.body_text_en || ''}
            onChange={(e) => setFormData({ ...formData, body_text_en: e.target.value })}
            style={{ minHeight: '200px' }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#8B4513', marginBottom: '8px', display: 'block' }}>
            🖋️ पापा का पेजमेकर (PM5) कैनवस (Hindi PM5 Writing Desk)
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
        <div className="form-group">
          <label>Body Text (Hindi) *</label>
          <textarea
            value={formData.body_text_hi || ''}
            onChange={(e) => setFormData({ ...formData, body_text_hi: e.target.value })}
            required
            style={{ minHeight: '180px' }}
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
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.is_active !== false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            {' '}Active (Show on website)
          </label>
        </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn">
              {editing ? 'Update' : 'Create'} Poem
            </button>
            <button type="button" className="btn" onClick={handleCancel} style={{ background: '#999' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>All Poems ({poems.length})</h3>
        {poems.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No poems found. Click "Create Poem" to add one.</p>
        ) : (
          <ul className="admin-list">
            {poems.map((poem) => (
              <li key={poem.id} className="admin-list-item" style={{ 
                padding: '12px', 
                marginBottom: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                background: poem.is_active === false ? '#f5f5f5' : '#fff'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '16px' }}>{poem.heading_en || poem.heading_hi || poem.heading || 'Untitled'}</strong>
                    {poem.is_active === false && (
                      <span style={{ 
                        color: '#fff', 
                        background: '#999', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>INACTIVE</span>
                    )}
                    {poem.is_active !== false && (
                      <span style={{ 
                        color: '#fff', 
                        background: '#28a745', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    <strong>Sort Order:</strong> {poem.sort_order} |
                    <strong> Language:</strong> {poem.language || 'mixed'}
                  </div>
                </div>
                <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={() => handleEdit(poem)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(poem.id)}>Delete</button>
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
  const [formData, setFormData] = useState({
    phone: '',
    phone_text: '',
    whatsapp: '',
    whatsapp_text: '',
    email: '',
    email_text: '',
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
      phone: settings.phone || '+917676885989',
      phone_text: settings.phone_text || 'Call me',
      whatsapp: settings.whatsapp || 'https://wa.me/917676885989',
      whatsapp_text: settings.whatsapp_text || 'Whatsapp me',
      email: settings.email || '',
      email_text: settings.email_text || 'Email me',
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
      phone: settings.phone || '+917676885989',
      phone_text: settings.phone_text || 'Call me',
      whatsapp: settings.whatsapp || 'https://wa.me/917676885989',
      whatsapp_text: settings.whatsapp_text || 'Whatsapp me',
      email: settings.email || '',
      email_text: settings.email_text || 'Email me',
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: 'var(--accent)', margin: 0 }}>Site Settings</h2>
        {!showForm && (
          <button type="button" className="btn" onClick={handleEdit}>
            Edit Settings
          </button>
        )}
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
        <div className="form-group">
          <label>Website Logo (Square recommended)</label>
          <div style={{ marginBottom: '12px' }}>
            {logoPreview && (
              <img 
                src={logoPreview} 
                alt="Logo Preview" 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  objectFit: 'contain', 
                  borderRadius: '4px',
                  border: '1px solid var(--border-light)',
                  marginBottom: '12px',
                  background: '#f5f5f5'
                }} 
              />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploadingLogo}
          />
          {uploadingLogo && <div style={{ marginTop: '8px', color: '#666' }}>Uploading...</div>}
          {formData.logo_path && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              Current: {formData.logo_path}
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete current logo?')) {
                    try {
                      if (formData.logo_path && !formData.logo_path.startsWith('/')) {
                        await deleteImage(formData.logo_path)
                      }
                      setFormData({ ...formData, logo_path: '' })
                      setLogoPreview(null)
                      alert('Logo deleted!')
                    } catch (err) {
                      alert('Error deleting logo: ' + err.message)
                    }
                  }
                }}
                style={{
                  marginLeft: '12px',
                  padding: '4px 8px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Delete Logo
              </button>
            </div>
          )}
        </div>
        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />
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
          <label>Facebook URL</label>
          <input
            value={formData.facebook}
            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            placeholder="https://facebook.com/yourpage"
          />
        </div>
        <div className="form-group">
          <label>Instagram URL</label>
          <input
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            placeholder="https://instagram.com/yourprofile"
          />
        </div>
        <div className="form-group">
          <label>Twitter/X URL</label>
          <input
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            placeholder="https://twitter.com/yourprofile"
          />
        </div>
        <div className="form-group">
          <label>LinkedIn URL</label>
          <input
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div className="form-group">
          <label>YouTube URL</label>
          <input
            value={formData.youtube}
            onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
            placeholder="https://youtube.com/@yourchannel"
          />
        </div>
        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />
        <h3 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Hero Section</h3>
        <div className="form-group">
          <label>Hero Tagline (English)</label>
          <input
            value={formData.hero_tagline_en}
            onChange={(e) => setFormData({ ...formData, hero_tagline_en: e.target.value })}
            placeholder="Renowned for his fiery literary works"
          />
        </div>
        <div className="form-group">
          <label>Hero Tagline (Hindi)</label>
          <input
            value={formData.hero_tagline_hi}
            onChange={(e) => setFormData({ ...formData, hero_tagline_hi: e.target.value })}
            placeholder="साहित्य जगत में अपनी तेजस्वी रचनाओं से प्रसिद्ध"
          />
        </div>
        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />
        <h3 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Thank You Section</h3>
        <div className="form-group">
          <label>Thank You Title</label>
          <input
            value={formData.thank_you_title}
            onChange={(e) => setFormData({ ...formData, thank_you_title: e.target.value })}
            placeholder="Thank You"
          />
        </div>
        <div className="form-group">
          <label>Thank You Heading</label>
          <input
            value={formData.thank_you_heading}
            onChange={(e) => setFormData({ ...formData, thank_you_heading: e.target.value })}
            placeholder="Thank you for visiting!"
          />
        </div>
        <div className="form-group">
          <label>Thank You Description</label>
          <textarea
            value={formData.thank_you_description}
            onChange={(e) => setFormData({ ...formData, thank_you_description: e.target.value })}
            placeholder="Your message here..."
            rows="4"
          />
        </div>
        <div className="form-group">
          <label>Thank You Button Text</label>
          <input
            value={formData.thank_you_button_text}
            onChange={(e) => setFormData({ ...formData, thank_you_button_text: e.target.value })}
            placeholder="Close"
          />
        </div>
        <div className="form-group">
          <label>Thank You Message (Legacy - for popup)</label>
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
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="submit" className="btn">Save Settings</button>
            <button type="button" className="btn" onClick={handleCancel} style={{ background: '#999' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
          <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Current Settings</h3>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div style={{ marginBottom: '8px' }}><strong>Logo:</strong> {settings.logo_path ? 'Uploaded' : 'Not set'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Phone:</strong> {settings.phone || '(Not set)'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Email:</strong> {settings.email || '(Not set)'}</div>
            <div style={{ marginBottom: '8px' }}><strong>Default Accent:</strong> {settings.default_accent || '#964B00'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
