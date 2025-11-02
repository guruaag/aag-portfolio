import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getCategories, getAboutContent, getPublications, getPoems } from '../../lib/supabaseClient'

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('categories')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    categories: [],
    about: null,
    publications: [],
    poems: []
  })

  useEffect(() => {
    // Check auth
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      navigate('/admin')
      return
    }

    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [cats, about, pubs, poems] = await Promise.all([
        getCategories(),
        getAboutContent(),
        getPublications(),
        getPoems()
      ])
      setData({ categories: cats, about, publications: pubs, poems })
    } catch (err) {
      console.error('Error loading admin data:', err)
      alert('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
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
    truncated_preview: ''
  })

  useEffect(() => {
    if (about) {
      setFormData(about)
    }
  }, [about])

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
          <label>Body Text (Markdown) *</label>
          <textarea
            value={formData.body_text}
            onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
            required
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await supabase.from('publications').update(formData).eq('id', editing)
      } else {
        await supabase.from('publications').insert(formData)
      }
      onUpdate()
      setEditing(null)
      setFormData({ title: '', subtitle: '', image_path: '', image_alt: '', description: '', sort_order: 0 })
    } catch (err) {
      alert('Error saving publication')
    }
  }

  const handleEdit = (pub) => {
    setEditing(pub.id)
    setFormData(pub)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this publication?')) return
    try {
      await supabase.from('publications').delete().eq('id', id)
      onUpdate()
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
          <label>Image Path (e.g., publications/123/cover.jpg) *</label>
          <input
            value={formData.image_path}
            onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
            required
            placeholder="publications/{id}/cover.jpg"
          />
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

export default AdminDashboard

