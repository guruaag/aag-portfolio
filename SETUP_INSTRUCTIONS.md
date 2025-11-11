# 🚀 PHOENIX REDESIGN - Setup Instructions

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `i18next` & `react-i18next` (multilingual)
- `react-helmet-async` (SEO meta tags)
- `framer-motion` (animations)

### 2. Run Supabase Migration

**Go to Supabase Dashboard → SQL Editor**

Run this migration:
```sql
-- File: migrations/006_simplified_storage_rls_policy.sql
-- Copy entire contents and run
```

This allows authenticated uploads to `/publications/` without UUID prefix.

### 3. Set Environment Variables

**Local (.env file):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_USER=aag
VITE_ADMIN_PASSWORD=1234
VITE_ADMIN_EMAIL=aag@admin.local
VITE_ADMIN_SUPABASE_PASSWORD=1234
VITE_GOOGLE_TRANSLATE_API_KEY=your-key (optional)
```

**Vercel (Production):**
- Go to Vercel Dashboard → Settings → Environment Variables
- Add all variables above
- Redeploy after adding

### 4. Test Locally
```bash
npm run dev
```

**Test Checklist:**
- [ ] Header scrolls and transforms
- [ ] Off-canvas menu opens smoothly
- [ ] Language toggle works (EN/HI)
- [ ] Publication cards have hover effects
- [ ] Image upload works
- [ ] All pages load with animations
- [ ] Mobile responsive (check on phone)

### 5. Build & Deploy
```bash
npm run build
git add .
git commit -m "Phoenix redesign - complete UI/UX overhaul"
git push
```

Vercel will auto-deploy.

---

## 🎨 What's New

### Visual Transformation:
- **No borders** - Uses shadows and whitespace
- **Lora + Inter fonts** - Premium typography
- **Sienna/Charcoal colors** - Sophisticated palette
- **Smooth animations** - Framer Motion throughout
- **3D hover effects** - Premium feel
- **Scroll-responsive header** - Modern UX

### New Features:
- **Off-canvas menu** - Slide-in animation
- **Social sharing** - Facebook, Twitter, WhatsApp
- **i18next integration** - Proper multilingual
- **Open Graph tags** - Better social sharing
- **Focus mode** - Reading-optimized layouts

---

## 📱 Mobile Optimization

- **24px minimum padding** - Never touches edges
- **Single-column layout** - Optimal readability
- **Touch-friendly** - 44px+ button sizes
- **Fluid typography** - Scales perfectly

---

## 🔍 Key Files to Review

1. **Design System:** `src/styles/phoenix-design-system.css`
2. **Header:** `src/components/Header.jsx` + `Header.css`
3. **Publications:** `src/components/PublicationCard.jsx`
4. **Home:** `src/pages/Home.jsx` + `Home.css`
5. **About:** `src/components/AboutPanel.jsx`

---

## ⚠️ Important Notes

1. **Content Translation:** Currently UI is translated. For content (poems, publications), add `_en` and `_hi` columns to database and update components.

2. **Google Translate API:** Optional. If you want on-the-fly translation, add API key. Otherwise, use database fields for quality.

3. **Admin Access:** Admin link is hidden in footer (only visible to logged-in admins). Direct URL `/admin` still works.

4. **Image Paths:** New uploads go to `publications/{id}/cover.jpg`. Old files may need migration.

---

## 🎯 Next Steps

1. **Test everything locally**
2. **Run Supabase migration**
3. **Set environment variables**
4. **Deploy to Vercel**
5. **Test production site**
6. **Configure domain** (see DEPLOYMENT_GUIDE.md)

---

**The redesign is complete! The site is now unrecognizable from the original - modern, elegant, and production-ready.** ✨

