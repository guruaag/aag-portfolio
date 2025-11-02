# Setup Guide - Step by Step

This guide will walk you through setting up the Gurupratap Sharma | AAG portfolio website.

## Step 1: Supabase Setup

### Create Project
1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `gurupratap-sharma-aag` (or your preferred name)
   - **Database Password**: Save this securely (you'll need it)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for setup (~2 minutes)

### Run Migration
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `migrations/001_init.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify tables were created (check Table Editor)

### Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click "New bucket"
3. Name: `public-assets`
4. Check **Public bucket** (important!)
5. Click "Create bucket"

### Get API Credentials
1. Go to **Settings** > **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the long string under "Project API keys")

Save these for Step 3!

## Step 2: GitHub Repository

### Create Repo
1. Go to https://github.com and sign in
2. Click "+" > "New repository"
3. Name: `gurupratap-sharma-aag` (or your preferred name)
4. Choose **Private** (recommended)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### Push Code
```bash
# In the project directory
cd /Users/sankalp/Desktop/project/aag

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Portfolio website setup"

# Add remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push
git branch -M main
git push -u origin main
```

## Step 3: Local Development Setup

### Install Dependencies
```bash
cd /Users/sankalp/Desktop/project/aag
npm install
```

### Create Environment File
```bash
# Copy example file
cp .env.example .env
```

Edit `.env` and add:
```env
VITE_SUPABASE_URL=your_supabase_project_url_from_step_1
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_from_step_1
VITE_ADMIN_USER=aag
VITE_ADMIN_PASSWORD=1234
```

### Add Logo
1. Place your fire logo image in `/public/logo.png`
2. Supported formats: PNG, SVG, JPG
3. Recommended size: 48x48px or larger (will be scaled)

### Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 - you should see the site!

## Step 4: Vercel Deployment

### Connect Repository
1. Go to https://vercel.com and sign in
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project

### Configure Environment Variables
In Vercel project settings, add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL from Step 1 |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 1 |
| `VITE_ADMIN_USER` | `aag` (or your preferred username) |
| `VITE_ADMIN_PASSWORD` | `1234` (or your preferred password) |

### Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your site will be live at: `https://your-project.vercel.app`

### Custom Domain (Optional)
1. In Vercel project, go to **Settings** > **Domains**
2. Add your domain (e.g., `gurupratapsharma.com`)
3. Follow DNS instructions from Vercel

## Step 5: Admin Subdomain Setup

### Option A: Vercel Subdomain (Recommended)
1. In Vercel, create a new project for admin OR use rewrites
2. Add domain: `admin.yourdomain.com`
3. Point it to the same project
4. Add rewrite rule in `vercel.json` (already included):
   ```json
   {
     "rewrites": [
       { "source": "/admin", "destination": "/admin" }
     ]
   }
   ```

### Option B: Separate Subdomain Project
1. Create a new Vercel project
2. Link to same GitHub repo
3. Add domain: `admin.yourdomain.com`
4. Same environment variables

## Step 6: Verify Everything Works

### Test Public Site
- [ ] Home page loads
- [ ] Categories display
- [ ] Can navigate to poem detail
- [ ] Can navigate to publication detail
- [ ] Menu overlay opens
- [ ] Color swatches change theme
- [ ] Footer buttons work (Back, Thank You, Share)

### Test Admin Panel
1. Go to `/admin` (or `admin.yourdomain.com`)
2. Login with `aag` / `1234`
3. Test CRUD operations:
   - [ ] Create a poem
   - [ ] Edit a publication
   - [ ] Update about content
   - [ ] Delete an item

### Test Mobile
1. Open site on mobile device
2. Verify:
   - [ ] Page fits in viewport (no scroll)
   - [ ] Content is scrollable within content area
   - [ ] Header/footer are compressed
   - [ ] Menu shows phone number

## Step 7: Upload Images

### For Publications
1. Go to Supabase **Storage** > `public-assets`
2. Create folder: `publications/{publication_id}/`
3. Upload cover image as `cover.jpg`
4. In admin panel, set image path: `publications/{publication_id}/cover.jpg`

### For Logo
1. Upload logo to `authors/logo.png` in Supabase Storage
2. Or place directly in `/public/logo.png` in repo

## Troubleshooting

### "Content not available" error
- Check Supabase connection (URL and key)
- Verify tables exist in Supabase
- Check browser console for errors

### Images not loading
- Verify bucket is public
- Check image path matches storage path
- Verify image exists in Supabase Storage

### Admin login not working
- Check environment variables in Vercel
- Verify `.env` file has correct values locally
- Clear localStorage and try again

### Build fails on Vercel
- Check all environment variables are set
- Verify `package.json` has correct dependencies
- Check build logs in Vercel dashboard

## Next Steps

1. **Customize Content**: Update categories, about, poems via admin panel
2. **Upload Real Images**: Replace placeholder images with actual book covers
3. **SEO**: Verify sitemap.xml is accessible at `/sitemap.xml`
4. **Analytics** (if needed): Add Google Analytics or similar
5. **Domain**: Point your custom domain to Vercel

## Support

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- React Router: https://reactrouter.com

---

**Need help?** Call +917676885989 or WhatsApp: https://wa.me/917676885989

