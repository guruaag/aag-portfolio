import re

def update_app_routes():
    app_path = '/Users/sankalpg/Documents/Project/aag/src/App.jsx'
    with open(app_path, 'r', encoding='utf-8') as f:
        content = f.read()

    routes_target = """  <Route path="/admin/home" element={<AdminDashboard tab="home" initialSubTab="hero" />} />
  <Route path="/admin/home/hero" element={<AdminDashboard tab="home" initialSubTab="hero" />} />
  <Route path="/admin/home/intro" element={<AdminDashboard tab="home" initialSubTab="about" />} />
  <Route path="/admin/home/featured" element={<AdminDashboard tab="home" initialSubTab="featured" />} />
  <Route path="/admin/home/highlights" element={<AdminDashboard tab="home" initialSubTab="highlights" />} />"""

    routes_replacement = """  <Route path="/admin/home" element={<AdminDashboard tab="home" initialSubTab="hero" />} />
  <Route path="/admin/home/hero" element={<AdminDashboard tab="home" initialSubTab="hero" />} />
  <Route path="/admin/home/banner" element={<AdminDashboard tab="home" initialSubTab="hero" />} />
  <Route path="/admin/home/intro" element={<AdminDashboard tab="home" initialSubTab="about" />} />
  <Route path="/admin/home/about" element={<AdminDashboard tab="home" initialSubTab="about" />} />
  <Route path="/admin/home/featured" element={<AdminDashboard tab="home" initialSubTab="featured" />} />
  <Route path="/admin/home/poetry" element={<AdminDashboard tab="home" initialSubTab="featured" />} />
  <Route path="/admin/home/books" element={<AdminDashboard tab="home" initialSubTab="books" />} />"""

    if routes_target in content:
        content = content.replace(routes_target, routes_replacement, 1)
        with open(app_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("App.jsx routes updated successfully!")
    else:
        print("App.jsx target routes not found!")

def update_dashboard():
    dashboard_path = '/Users/sankalpg/Documents/Project/aag/src/pages/Admin/Dashboard.jsx'
    with open(dashboard_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace Sidebar sub-nav for Home
    sidebar_target = """  {/* Nested Sub-categories for Home Page */}
  <div className="admin-sub-nav">
  <button
  className={`admin-sub-tab-btn ${activeTab === 'home' && homeSubTab === 'hero' ? 'active' : ''}`}
  onClick={() => switchTab('home', '/admin/home/hero', 'hero')}
  >
  1. {tLabel('हीरो बैनर', 'Hero Banner')}
  </button>
  <button
  className={`admin-sub-tab-btn ${activeTab === 'home' && (homeSubTab === 'about' || homeSubTab === 'intro') ? 'active' : ''}`}
  onClick={() => switchTab('home', '/admin/home/intro', 'about')}
  >
  2. {tLabel('परिचय सारांश', 'Bio Excerpt')}
  </button>
  <button
  className={`admin-sub-tab-btn ${activeTab === 'home' && homeSubTab === 'featured' ? 'active' : ''}`}
  onClick={() => switchTab('home', '/admin/home/featured', 'featured')}
  >
  3. {tLabel('प्रमुख रचनाएं व पुस्तकें', 'Featured Works')}
  </button>
  <button
  className={`admin-sub-tab-btn ${activeTab === 'home' && homeSubTab === 'highlights' ? 'active' : ''}`}
  onClick={() => switchTab('home', '/admin/home/highlights', 'highlights')}
  >
  4. {tLabel('मुख्य उपलब्धियां', 'Highlights & Awards')}
  </button>
  </div>"""

    sidebar_replacement = """  {/* Nested Sub-categories for Home Page */}
  <div className="admin-sub-nav">
  <button
  className={`admin-sub-tab-btn ${activeTab === 'home' && (homeSubTab === 'hero' || homeSubTab === 'banner') ? 'active' : ''}`}
  onClick={() => switchTab('home', '/admin/home/hero', 'hero')}
  >
  1. {tLabel('बैनर', 'Banner')}
  </button>
  <button
  className={`admin-sub-tab-btn ${activeTab === 'home' && (homeSubTab === 'about' || homeSubTab === 'intro') ? 'active' : ''}`}
  onClick={() => switchTab('home', '/admin/home/intro', 'about')}
  >
  2. {tLabel('परिचय', 'About')}
  </button>
  <button
  className={`admin-sub-tab-btn ${activeTab === 'home' && (homeSubTab === 'featured' || homeSubTab === 'poetry') ? 'active' : ''}`}
  onClick={() => switchTab('home', '/admin/home/featured', 'featured')}
  >
  3. {tLabel('विशेष कविताएं', 'Featured Poetry')}
  </button>
  <button
  className={`admin-sub-tab-btn ${activeTab === 'home' && homeSubTab === 'books' ? 'active' : ''}`}
  onClick={() => switchTab('home', '/admin/home/books', 'books')}
  >
  4. {tLabel('विशेष पुस्तकें', 'Featured Books')}
  </button>
  </div>"""

    if sidebar_target in content:
        content = content.replace(sidebar_target, sidebar_replacement, 1)
        print("Dashboard.jsx sidebar sub-nav updated!")
    else:
        print("Dashboard.jsx sidebar_target not found!")

    # 2. Update HomeManager module structure
    # Replace MODULE 1 title
    content = content.replace("{tLabel('हीरो बैनर', 'Hero Banner')}", "{tLabel('बैनर', 'Banner')}")
    content = content.replace("{tLabel('परिचय सारांश', 'Bio Excerpt')}", "{tLabel('परिचय', 'About')}")

    # Write back dashboard
    with open(dashboard_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    update_app_routes()
    update_dashboard()
