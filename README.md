# Gurupratap Sharma | AAG - Portfolio Website

A modern portfolio website showcasing poems, publications, and writings by Gurupratap Sharma. Built with React (Vite), Supabase, and deployed on Vercel.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Storage)
- **Hosting**: Vercel
- **Styling**: CSS Variables + Responsive Design
- **Markdown**: marked (for About content)

## Features

- 📱 Responsive design with mobile-first approach (no viewport scrolling on mobile)
- 🎨 Dynamic color theming with 7 color swatches
- 📚 Content management: About, Publications, Writings/Poems
- 🔐 Admin panel for CRUD operations
- 🔗 Deep linking for all poems and publications
- 🌐 SEO-friendly with meta tags and sitemap
- ♿ WCAG AA accessibility compliance

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Vercel account
- GitHub account

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration file: `migrations/001_init.sql`
3. Go to Storage and create a bucket named `public-assets` (set to public)
4. Copy your Supabase URL and anon key from Settings > API

### 3. Local Development

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Add your Supabase credentials to .env:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_ADMIN_USER=aag
# VITE_ADMIN_PASSWORD=1234

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

### 4. Build for Production

```bash
npm run build
```

Output will be in the `dist` folder.

### 5. Vercel Deployment

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to link project
```

#### Option B: GitHub Integration

1. Push code to GitHub repository
2. Go to Vercel dashboard
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_USER` (default: `aag`)
   - `VITE_ADMIN_PASSWORD` (default: `1234`)
5. Deploy

### 6. Admin Subdomain Setup

For admin subdomain (`admin.gurupratapsharma.com`):

1. In Vercel, add a new project or redirect rule
2. Configure subdomain routing to point to `/admin` route
3. Alternatively, use Vercel's rewrites feature

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | Required |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Required |
| `VITE_ADMIN_USER` | Admin login username | `aag` |
| `VITE_ADMIN_PASSWORD` | Admin login password | `1234` |

## Project Structure

```
aag/
├── public/
│   ├── logo.png          # Site logo (fire image)
│   └── robots.txt        # SEO robots file
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components
│   ├── lib/             # Utilities (Supabase client)
│   ├── styles/          # CSS files
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── migrations/          # SQL migration files
├── package.json
├── vite.config.js
└── README.md
```

## Database Schema

The app uses the following Supabase tables:

- `categories` - Content categories (About, Publications, Writings)
- `about_content` - About page content (supports Markdown)
- `publications` - Book/publication details with images
- `poems` - Poem/writing entries
- `settings` - Site settings (phone, WhatsApp, accent color)

See `migrations/001_init.sql` for full schema.

## Admin Panel

Access the admin panel at `/admin` (or `admin.yourdomain.com`):

- **Login**: `aag` / `1234` (default, configurable via env vars)
- **Features**:
  - CRUD for Categories
  - Edit About content
  - Manage Publications (upload images to Supabase Storage)
  - Manage Poems/Writings

## Color Themes

The app includes 7 preset color themes:
- Dark Orange (#964B00) - default
- Maroon/Red (#A52A2A)
- Black (#000000)
- Grey (#808080)
- Olive (#808000)
- Purple (#800080)
- Blue (#0000FF)

Selected theme persists in localStorage.

## SEO & Metadata

- Dynamic meta tags for each page
- OpenGraph tags for social sharing
- Sitemap generation (to be implemented via API route)
- `robots.txt` for search engine indexing

## Mobile Behavior

On mobile (≤768px):
- No viewport-level scrolling
- Content fits within viewport height
- Header/footer compressed to 48px
- Content area is internally scrollable
- Truncated previews with "View more" links

On desktop (>768px):
- Standard vertical scrolling allowed
- Full-height header/footer (64px/56px)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private project for Auspicious Beginning Pvt. Ltd.

## Support

For issues or questions:
- Call: +917676885989
- WhatsApp: https://wa.me/917676885989

---

**Version**: 1.0.0  
**Last Updated**: 2024

