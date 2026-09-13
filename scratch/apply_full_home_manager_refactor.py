dashboard_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update HomeManager tabs definition
old_home_form_start = """  <form
  id="admin-active-form"
  onSubmit={handleSubmit}
  onChange={() => setIsDirty && setIsDirty(true)}
  onInput={() => setIsDirty && setIsDirty(true)}
  className="admin-form-container"
  >
  {/* MODULE 1: HERO & BANNER */}
  {activeTab === 'hero' && ("""

new_home_form_start = """  <form
  id="admin-active-form"
  onSubmit={handleSubmit}
  onChange={() => setIsDirty && setIsDirty(true)}
  onInput={() => setIsDirty && setIsDirty(true)}
  className="admin-form-container"
  >
  {/* Home Manager Sub-Tab Navigation Bar */}
  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid rgba(226, 215, 197, 0.4)', paddingBottom: '12px', flexWrap: 'wrap' }}>
  <button
  type="button"
  className={`admin-btn ${activeTab === 'hero' || activeTab === 'banner' ? 'phoenix-btn-primary' : 'admin-btn-secondary'}`}
  onClick={() => setActiveTab('hero')}
  style={{ padding: '6px 16px', fontSize: '0.88rem', fontWeight: 600 }}
  >
  1. {tLabel('बैनर', 'Banner')}
  </button>
  <button
  type="button"
  className={`admin-btn ${activeTab === 'about' || activeTab === 'intro' ? 'phoenix-btn-primary' : 'admin-btn-secondary'}`}
  onClick={() => setActiveTab('about')}
  style={{ padding: '6px 16px', fontSize: '0.88rem', fontWeight: 600 }}
  >
  2. {tLabel('परिचय', 'About')}
  </button>
  <button
  type="button"
  className={`admin-btn ${activeTab === 'featured' || activeTab === 'poetry' ? 'phoenix-btn-primary' : 'admin-btn-secondary'}`}
  onClick={() => setActiveTab('featured')}
  style={{ padding: '6px 16px', fontSize: '0.88rem', fontWeight: 600 }}
  >
  3. {tLabel('विशेष कविताएं', 'Featured Poetry')}
  </button>
  <button
  type="button"
  className={`admin-btn ${activeTab === 'books' ? 'phoenix-btn-primary' : 'admin-btn-secondary'}`}
  onClick={() => setActiveTab('books')}
  style={{ padding: '6px 16px', fontSize: '0.88rem', fontWeight: 600 }}
  >
  4. {tLabel('विशेष पुस्तकें', 'Featured Books')}
  </button>
  </div>

  {/* MODULE 1: BANNER */}
  {(activeTab === 'hero' || activeTab === 'banner') && ("""

if old_home_form_start in content:
    content = content.replace(old_home_form_start, new_home_form_start, 1)
    print("Top tab bar added to HomeManager!")
else:
    print("old_home_form_start not found")

# Replace MODULE 3 & 4 with split Featured Poetry, Featured Books, and remove Highlights & Awards
featured_and_highlights_old = """  {/* MODULE 3: FEATURED WORKS SHOWCASE */}
  {activeTab === 'featured' && (
  <div>
  <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px' }}>
  {tLabel('प्रमुख रचनाएं एवं पुस्तकें (Featured Works Showcase)', 'Featured Poems & Books Showcase')}
  </h3>

  {/* Single Row Limits Configuration */}
  <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)', marginBottom: '24px' }}>
  <h4 style={{ margin: '0 0 12px 0', fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
  {tLabel('प्रदर्शन सीमा', 'Display Limits')}
  </h4>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '10px' }}>
  <div>
  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b' }}>
  {tLabel('काव्य संग्रह कार्ड सीमा (Max Poems on Home Page)', 'Max Poems on Home Page')}
  </label>
  <input
  type="number"
  min="1"
  max="10"
  className="admin-input"
  value={poemsLimit}
  onChange={(e) => {
  setPoemsLimit(Math.max(1, parseInt(e.target.value || '1', 10)))
  if (setIsDirty) setIsDirty(true)
  }}
  />
  </div>
  <div>
  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b' }}>
  {tLabel('प्रकाशन कार्ड सीमा (Max Books on Home Page)', 'Max Books on Home Page')}
  </label>
  <input
  type="number"
  min="1"
  max="10"
  className="admin-input"
  value={pubsLimit}
  onChange={(e) => {
  setPubsLimit(Math.max(1, parseInt(e.target.value || '1', 10)))
  if (setIsDirty) setIsDirty(true)
  }}
  />
  </div>
  </div>
  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
  {tLabel('होम पेज पर केवल एक पंक्ति (single row) में दिखने वाले कार्ड्स की अधिकतम संख्या set करें।', 'Set the maximum number of cards displayed in a single row on the public home page.')}
  </p>
  </div>

  {/* Featured Poems Sub-Section */}
  <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)', marginBottom: '24px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
  <h4 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
  ️ {tLabel('1. मुख्य पृष्ठ काव्य रचनाएं (Featured Poems)', '1. Featured Poems')}
  </h4>
  <span className="admin-toolbar-count">
  {featuredPoems.length}/6 {tLabel('रचनाएं चयनित', 'Poems Selected')}
  </span>
  </div>

  {/* Search Picker for Adding Poems */}
  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
  <select
  className="admin-input"
  style={{ flex: 1 }}
  value=""
  onChange={(e) => {
  const id = e.target.value
  if (id && !featuredPoems.includes(id)) {
  if (featuredPoems.length >= 6) {
  alert(tLabel('अधिकतम 6 रचनाएं ही चुनी जा सकती हैं।', 'Maximum 6 poems allowed.'))
  return
  }
  setFeaturedPoems([...featuredPoems, id])
  if (setIsDirty) setIsDirty(true)
  }
  }}
  >
  <option value="">-- {tLabel('काव्य संग्रह से रचना चुनें व जोड़ें...', 'Select poem to add to featured list...')} --</option>
  {safePoems
  .filter(p => !featuredPoems.includes(p.id))
  .map(p => (
  <option key={p.id} value={p.id}>
  {p.heading_hi || p.heading_en || p.heading || 'Untitled'}
  </option>
  ))}
  </select>
  </div>

  {/* Selected Featured Poems Ordered List */}
  {featuredPoems.length === 0 ? (
  <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>{tLabel('कोई रचना चयनित नहीं है।', 'No featured poems selected.')}</p>
  ) : (
  <ul className="admin-item-list">
  {featuredPoems.map((id, index) => {
  const poemObj = safePoems.find(p => p.id === id)
  return (
  <li key={id} className="admin-item-card" style={{ justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <span style={{ fontWeight: 700, width: '24px', height: '24px', background: 'var(--leona-terracotta)', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
  {index + 1}
  </span>
  <span style={{ fontWeight: 600, color: 'var(--leona-charcoal)' }}>
  {poemObj ? (poemObj.heading_hi || poemObj.heading_en || poemObj.heading) : `Poem ID: ${id}`}
  </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPoems(moveItemInArray(featuredPoems, index, 'up'))} disabled={index === 0}>
  ⬆️
  </button>
  <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPoems(moveItemInArray(featuredPoems, index, 'down'))} disabled={index === featuredPoems.length - 1}>
  ⬇️
  </button>
  <button type="button" className="admin-btn-danger" onClick={() => { setFeaturedPoems(featuredPoems.filter(item => item !== id)); if (setIsDirty) setIsDirty(true); }}>
  
  </button>
  </div>
  </li>
  )
  })}
  </ul>
  )}
  </div>

  {/* Featured Publications Sub-Section */}
  <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
  <h4 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
  {tLabel('2. मुख्य पृष्ठ पुस्तकें (Featured Books)', '2. Featured Publications')}
  </h4>
  <span className="admin-toolbar-count">
  {featuredPubs.length}/6 {tLabel('पुस्तकें चयनित', 'Books Selected')}
  </span>
  </div>

  {/* Search Picker for Adding Publications */}
  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
  <select
  className="admin-input"
  style={{ flex: 1 }}
  value=""
  onChange={(e) => {
  const id = e.target.value
  if (id && !featuredPubs.includes(id)) {
  if (featuredPubs.length >= 6) {
  alert(tLabel('अधिकतम 6 पुस्तकें ही चुनी जा सकती हैं।', 'Maximum 6 publications allowed.'))
  return
  }
  setFeaturedPubs([...featuredPubs, id])
  if (setIsDirty) setIsDirty(true)
  }
  }}
  >
  <option value="">-- {tLabel('प्रकाशन सूची से पुस्तक चुनें व जोड़ें...', 'Select publication to add to featured list...')} --</option>
  {safePubs
  .filter(p => !featuredPubs.includes(p.id))
  .map(p => (
  <option key={p.id} value={p.id}>
  {p.title_hi || p.title_en || p.title || 'Untitled'}
  </option>
  ))}
  </select>
  </div>

  {/* Selected Featured Publications Ordered List */}
  {featuredPubs.length === 0 ? (
  <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>{tLabel('कोई पुस्तक चयनित नहीं है।', 'No featured publications selected.')}</p>
  ) : (
  <ul className="admin-item-list">
  {featuredPubs.map((id, index) => {
  const pubObj = safePubs.find(p => p.id === id)
  return (
  <li key={id} className="admin-item-card" style={{ justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <span style={{ fontWeight: 700, width: '24px', height: '24px', background: 'var(--leona-terracotta)', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
  {index + 1}
  </span>
  <span style={{ fontWeight: 600, color: 'var(--leona-charcoal)' }}>
  {pubObj ? (pubObj.title_hi || pubObj.title_en || pubObj.title) : `Publication ID: ${id}`}
  </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPubs(moveItemInArray(featuredPubs, index, 'up'))} disabled={index === 0}>
  ⬆️
  </button>
  <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPubs(moveItemInArray(featuredPubs, index, 'down'))} disabled={index === featuredPubs.length - 1}>
  ⬇️
  </button>
  <button type="button" className="admin-btn-danger" onClick={() => { setFeaturedPubs(featuredPubs.filter(item => item !== id)); if (setIsDirty) setIsDirty(true); }}>
  
  </button>
  </div>
  </li>
  )
  })}
  </ul>
  )}
  </div>
  </div>
  )}"""

# We search until the end of activeTab === 'highlights'
highlights_end_regex = r"\{\/\* MODULE 4: HIGHLIGHTS & AWARDS \*\/\}.*?\}\)\}\n  </div>\n  \)\}"

new_featured_and_books = """  {/* MODULE 3: FEATURED POETRY */}
  {(activeTab === 'featured' || activeTab === 'poetry') && (
  <div>
  <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px' }}>
  {tLabel('विशेष कविताएं (Featured Poetry)', 'Featured Poetry')}
  </h3>

  {/* Single Row Limit Configuration */}
  <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)', marginBottom: '24px' }}>
  <div style={{ maxWidth: '300px' }}>
  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b' }}>
  {tLabel('काव्य संग्रह कार्ड सीमा (Max Poems on Home Page)', 'Max Poems on Home Page')}
  </label>
  <input
  type="number"
  min="1"
  max="10"
  className="admin-input"
  value={poemsLimit}
  onChange={(e) => {
  setPoemsLimit(Math.max(1, parseInt(e.target.value || '1', 10)))
  if (setIsDirty) setIsDirty(true)
  }}
  />
  </div>
  <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
  {tLabel('होम पेज पर दिखने वाले काव्य कार्ड्स की अधिकतम संख्या set करें।', 'Set the maximum number of poem cards displayed on the public home page.')}
  </p>
  </div>

  {/* Featured Poems List */}
  <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
  <h4 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
  {tLabel('मुख्य पृष्ठ काव्य रचनाएं (Featured Poems)', 'Featured Poems')}
  </h4>
  <span className="admin-toolbar-count">
  {featuredPoems.length}/6 {tLabel('रचनाएं चयनित', 'Poems Selected')}
  </span>
  </div>

  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
  <select
  className="admin-input"
  style={{ flex: 1 }}
  value=""
  onChange={(e) => {
  const id = e.target.value
  if (id && !featuredPoems.includes(id)) {
  if (featuredPoems.length >= 6) {
  alert(tLabel('अधिकतम 6 रचनाएं ही चुनी जा सकती हैं।', 'Maximum 6 poems allowed.'))
  return
  }
  setFeaturedPoems([...featuredPoems, id])
  if (setIsDirty) setIsDirty(true)
  }
  }}
  >
  <option value="">-- {tLabel('काव्य संग्रह से रचना चुनें व जोड़ें...', 'Select poem to add to featured list...')} --</option>
  {safePoems
  .filter(p => !featuredPoems.includes(p.id))
  .map(p => (
  <option key={p.id} value={p.id}>
  {p.heading_hi || p.heading_en || p.heading || 'Untitled'}
  </option>
  ))}
  </select>
  </div>

  {featuredPoems.length === 0 ? (
  <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>{tLabel('कोई रचना चयनित नहीं है।', 'No featured poems selected.')}</p>
  ) : (
  <ul className="admin-item-list">
  {featuredPoems.map((id, index) => {
  const poemObj = safePoems.find(p => p.id === id)
  return (
  <li key={id} className="admin-item-card" style={{ justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <span style={{ fontWeight: 700, width: '24px', height: '24px', background: 'var(--leona-terracotta)', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
  {index + 1}
  </span>
  <span style={{ fontWeight: 600, color: 'var(--leona-charcoal)' }}>
  {poemObj ? (poemObj.heading_hi || poemObj.heading_en || poemObj.heading) : `Poem ID: ${id}`}
  </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPoems(moveItemInArray(featuredPoems, index, 'up'))} disabled={index === 0}>
  ⬆️
  </button>
  <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPoems(moveItemInArray(featuredPoems, index, 'down'))} disabled={index === featuredPoems.length - 1}>
  ⬇️
  </button>
  <button type="button" className="admin-btn-danger" onClick={() => { setFeaturedPoems(featuredPoems.filter(item => item !== id)); if (setIsDirty) setIsDirty(true); }}>
  🗑️
  </button>
  </div>
  </li>
  )
  })}
  </ul>
  )}
  </div>
  </div>
  )}

  {/* MODULE 4: FEATURED BOOKS (NEW TAB) */}
  {activeTab === 'books' && (
  <div>
  <h3 style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', color: 'var(--leona-charcoal)', marginBottom: '16px' }}>
  {tLabel('विशेष पुस्तकें (Featured Books)', 'Featured Books')}
  </h3>

  {/* Single Row Limit Configuration */}
  <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)', marginBottom: '24px' }}>
  <div style={{ maxWidth: '300px' }}>
  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: '#1e293b' }}>
  {tLabel('प्रकाशन कार्ड सीमा (Max Books on Home Page)', 'Max Books on Home Page')}
  </label>
  <input
  type="number"
  min="1"
  max="10"
  className="admin-input"
  value={pubsLimit}
  onChange={(e) => {
  setPubsLimit(Math.max(1, parseInt(e.target.value || '1', 10)))
  if (setIsDirty) setIsDirty(true)
  }}
  />
  </div>
  <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
  {tLabel('होम पेज पर दिखने वाले पुस्तक कार्ड्स की अधिकतम संख्या set करें।', 'Set the maximum number of book cards displayed on the public home page.')}
  </p>
  </div>

  {/* Featured Publications List */}
  <div style={{ background: '#FFF', padding: '18px', borderRadius: '10px', border: '1px solid rgba(226, 215, 197, 0.8)' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
  <h4 style={{ margin: 0, fontFamily: 'Lora, serif', fontSize: '1.05rem', color: 'var(--leona-charcoal)' }}>
  {tLabel('मुख्य पृष्ठ पुस्तकें (Featured Books)', 'Featured Publications')}
  </h4>
  <span className="admin-toolbar-count">
  {featuredPubs.length}/6 {tLabel('पुस्तकें चयनित', 'Books Selected')}
  </span>
  </div>

  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
  <select
  className="admin-input"
  style={{ flex: 1 }}
  value=""
  onChange={(e) => {
  const id = e.target.value
  if (id && !featuredPubs.includes(id)) {
  if (featuredPubs.length >= 6) {
  alert(tLabel('अधिकतम 6 पुस्तकें ही चुनी जा सकती हैं।', 'Maximum 6 publications allowed.'))
  return
  }
  setFeaturedPubs([...featuredPubs, id])
  if (setIsDirty) setIsDirty(true)
  }
  }}
  >
  <option value="">-- {tLabel('प्रकाशन सूची से पुस्तक चुनें व जोड़ें...', 'Select publication to add to featured list...')} --</option>
  {safePubs
  .filter(p => !featuredPubs.includes(p.id))
  .map(p => (
  <option key={p.id} value={p.id}>
  {p.title_hi || p.title_en || p.title || 'Untitled'}
  </option>
  ))}
  </select>
  </div>

  {featuredPubs.length === 0 ? (
  <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>{tLabel('कोई पुस्तक चयनित नहीं है।', 'No featured publications selected.')}</p>
  ) : (
  <ul className="admin-item-list">
  {featuredPubs.map((id, index) => {
  const pubObj = safePubs.find(p => p.id === id)
  return (
  <li key={id} className="admin-item-card" style={{ justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <span style={{ fontWeight: 700, width: '24px', height: '24px', background: 'var(--leona-terracotta)', color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
  {index + 1}
  </span>
  <span style={{ fontWeight: 600, color: 'var(--leona-charcoal)' }}>
  {pubObj ? (pubObj.title_hi || pubObj.title_en || pubObj.title) : `Publication ID: ${id}`}
  </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPubs(moveItemInArray(featuredPubs, index, 'up'))} disabled={index === 0}>
  ⬆️
  </button>
  <button type="button" className="admin-btn-secondary" onClick={() => setFeaturedPubs(moveItemInArray(featuredPubs, index, 'down'))} disabled={index === featuredPubs.length - 1}>
  ⬇️
  </button>
  <button type="button" className="admin-btn-danger" onClick={() => { setFeaturedPubs(featuredPubs.filter(item => item !== id)); if (setIsDirty) setIsDirty(true); }}>
  🗑️
  </button>
  </div>
  </li>
  )
  })}
  </ul>
  )}
  </div>
  </div>
  )}"""

# Replace from MODULE 3 to end of MODULE 4
pattern = r"\{\/\* MODULE 3: FEATURED WORKS SHOWCASE \*\/\}.*?\{\/\* MODULE 4: HIGHLIGHTS & AWARDS \*\/\}.*?\}\)\}\n  <\/div>\n  \)\}"
if re.search(pattern, content, flags=re.DOTALL):
    content = re.sub(pattern, new_featured_and_books, content, flags=re.DOTALL)
    print("Featured Poetry & Featured Books updated, Highlights & Awards deleted!")
else:
    print("Regex match for MODULE 3 & 4 failed!")

with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(content)
