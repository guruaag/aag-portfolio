# Deployment Checklist - Go Live

## ✅ Pre-Deployment Fixes (Completed)

- [x] Header and Footer fixed to viewport (position: fixed)
- [x] Content duplication issue resolved
- [x] Category cards have block styling
- [x] Logo integration ready
- [x] Default theme color set to dark orange (#964B00)

---

## Step-by-Step Deployment Process

### Step 1: Verify Local Setup

```bash
# Ensure you're in the project directory
cd /Users/sankalp/Desktop/project/aag

# Install dependencies (if not done)
npm install

# Verify environment variables
cat .env
# Should contain:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key
# VITE_ADMIN_USER=aag
# VITE_ADMIN_PASSWORD=1234

# Test locally
npm run dev
# Visit http://localhost:3000 and verify everything works
```

---

### Step 2: Add Logo Image

**Important:** Place your fire logo image in the public folder:

1. Copy your fire logo image file
2. Place it at: `/public/logo.png`
3. Supported formats: PNG, SVG, JPG
4. Recommended size: 96x96px or larger (will auto-scale to 48px)

**If logo doesn't exist yet:**
- The site will show a placeholder
- You can add it later and redeploy

---

### Step 3: Initialize Git Repository (if not done)

```bash
# Check if git is initialized
git status

# If not initialized, run:
git init
git add .
git commit -m "Initial commit: Portfolio website with all fixes"
```

---

### Step 4: Push to GitHub

```bash
# If you haven't created a GitHub repo yet:
# 1. Go to https://github.com → New Repository
# 2. Name it (e.g., "gurupratap-sharma-aag")
# 3. Don't initialize with README (we already have one)

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push code
git branch -M main
git push -u origin main
```

---

### Step 5: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Build Settings:**
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
   - Click "Deploy"

4. **Add Environment Variables:**
   After deployment starts, go to **Settings** → **Environment Variables** and add:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `VITE_ADMIN_USER` | `aag` (or your preference) |
   | `VITE_ADMIN_PASSWORD` | `1234` (or your preference) |
   
   - Click "Add" for each
   - Click "Save"
   - **Redeploy** to apply environment variables

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: gurupratap-sharma-aag (or your choice)
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_ADMIN_USER
vercel env add VITE_ADMIN_PASSWORD

# Deploy to production
vercel --prod
```

---

### Step 6: Verify Deployment

1. **Visit your Vercel URL:**
   - Should be: `https://your-project.vercel.app`
   - Or custom domain if configured

2. **Test Key Features:**
   - [ ] Home page loads
   - [ ] Header and footer are fixed (don't scroll)
   - [ ] Logo displays (if added)
   - [ ] Category cards have block styling
   - [ ] "About" content shows only once
   - [ ] Theme is dark orange by default
   - [ ] Menu overlay works
   - [ ] Footer buttons work (Back, Thank You, Share)
   - [ ] Can navigate to poem/publication pages

3. **Test Admin Panel:**
   - [ ] Visit `/admin`
   - [ ] Login with `aag` / `1234`
   - [ ] Dashboard loads
   - [ ] Can create/edit/delete content

---

### Step 7: Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to **Settings** → **Domains**
   - Add your domain (e.g., `gurupratapsharma.com`)
   - Follow DNS configuration instructions

2. **For Admin Subdomain:**
   - Add `admin.gurupratapsharma.com`
   - Point to same project
   - Or use Vercel rewrites (already configured in `vercel.json`)

---

### Step 8: Final Verification

**Production Checklist:**
- [ ] Site loads on production URL
- [ ] All environment variables are set
- [ ] Supabase connection works
- [ ] Images load from Supabase Storage
- [ ] Admin panel accessible
- [ ] Mobile responsive (header/footer fixed)
- [ ] SEO meta tags present
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] robots.txt accessible

---

## Environment Variables Summary

**Required in Vercel:**

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ADMIN_USER=aag
VITE_ADMIN_PASSWORD=1234
```

---

## Post-Deployment Tasks

1. **Populate Content:**
   - Use Admin Panel to add real content
   - Upload publication images to Supabase Storage
   - Replace placeholder poems with actual content
   - Update About section with final text

2. **SEO Setup:**
   - Verify sitemap.xml is accessible
   - Submit to Google Search Console
   - Test OpenGraph tags with social media preview

3. **Monitor:**
   - Check Vercel analytics
   - Monitor Supabase usage
   - Set up error tracking (optional)

---

## Troubleshooting

**Build Fails:**
- Check Vercel build logs
- Verify all environment variables are set
- Ensure `package.json` has correct dependencies

**Site Shows "Content not available":**
- Verify Supabase URL and key in Vercel env vars
- Check Supabase project is active
- Verify tables exist and have data

**Images Not Loading:**
- Check `public-assets` bucket is public
- Verify image paths in database
- Check Supabase Storage permissions

**Admin Panel Not Working:**
- Verify `VITE_ADMIN_USER` and `VITE_ADMIN_PASSWORD` are set
- Clear browser localStorage
- Check browser console for errors

---

## Support

**Contact:**
- Phone: +917676885989
- WhatsApp: https://wa.me/917676885989

**Documentation:**
- Content Population: `CONTENT_POPULATION_GUIDE.md`
- Setup Guide: `SETUP.md`
- README: `README.md`

---

**Ready to Deploy!** 🚀

Follow the steps above and your site will be live!

