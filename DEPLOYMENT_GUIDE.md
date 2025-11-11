# 🚀 Vercel Deployment & Domain Setup Guide

## Prerequisites

- ✅ GitHub repository connected to Vercel
- ✅ Domain: `gurupratapsharma.com` (Namecheap)
- ✅ Supabase project configured

---

## Step 1: Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Admin Credentials
VITE_ADMIN_USER=aag
VITE_ADMIN_PASSWORD=1234
VITE_ADMIN_EMAIL=aag@admin.local
VITE_ADMIN_SUPABASE_PASSWORD=1234

# Google Translate API (Optional - for multilingual)
VITE_GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
```

**Important:** 
- Add these for **Production**, **Preview**, and **Development** environments
- After adding, **Redeploy** your project

---

## Step 2: Supabase RLS Policy Setup

1. **Go to Supabase Dashboard → SQL Editor**

2. **Run this migration:**
   - Open file: `migrations/006_simplified_storage_rls_policy.sql`
   - Copy entire contents
   - Paste and run in SQL Editor

3. **Verify policies:**
   ```sql
   SELECT policyname, cmd, with_check 
   FROM pg_policies 
   WHERE schemaname = 'storage' AND tablename = 'objects';
   ```
   Should show:
   - `Allow authenticated uploads` (INSERT)
   - `Allow public read` (SELECT)

---

## Step 3: Domain Configuration in Namecheap

### Current State
- Domain: `gurupratapsharma.com`
- DNS: Namecheap BasicDNS
- Parking page active

### Steps to Configure

1. **Log in to Namecheap**

2. **Go to Domain List → Manage `gurupratapsharma.com`**

3. **Delete Existing Records:**
   - Remove parking page CNAME
   - Remove any redirect records

4. **Add Vercel DNS Records:**

   **For www subdomain:**
   - Type: `CNAME`
   - Host: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: Automatic

   **For root domain:**
   - Type: `A`
   - Host: `@`
   - Value: `76.76.21.21`
   - TTL: Automatic

5. **Save Changes**

---

## Step 4: Add Domain in Vercel

1. **Go to Vercel Dashboard → Your Project → Settings → Domains**

2. **Add Domain:**
   - Enter: `gurupratapsharma.com`
   - Click **Add**

3. **Add www subdomain:**
   - Enter: `www.gurupratapsharma.com`
   - Click **Add**

4. **Configure Redirect:**
   - Vercel will automatically redirect `gurupratapsharma.com` → `www.gurupratapsharma.com`
   - Or configure in `vercel.json` if needed

---

## Step 5: SSL Certificate

- ✅ Vercel automatically provisions SSL certificates
- Wait 5-10 minutes after domain configuration
- Check **Settings → Domains** for SSL status
- Should show: ✅ **Valid Configuration**

---

## Step 6: Verify Deployment

1. **Check Vercel Build:**
   - Go to **Deployments** tab
   - Ensure latest deployment is successful
   - Check build logs for errors

2. **Test Domain:**
   - Wait 24-48 hours for DNS propagation
   - Visit: `https://www.gurupratapsharma.com`
   - Should load your site

3. **Test Admin Panel:**
   - Visit: `https://www.gurupratapsharma.com/admin`
   - Login and test image upload

---

## Step 7: Post-Deployment Checklist

- [ ] Domain resolves correctly
- [ ] SSL certificate active (HTTPS)
- [ ] All environment variables set
- [ ] Supabase RLS policies applied
- [ ] Image uploads work
- [ ] Admin panel accessible
- [ ] Language toggle works
- [ ] Mobile responsive

---

## Troubleshooting

### Domain Not Resolving

1. **Check DNS Propagation:**
   - Use: https://dnschecker.org
   - Enter: `gurupratapsharma.com`
   - Should show Vercel IPs globally

2. **Verify Namecheap Records:**
   - Ensure CNAME and A records are correct
   - TTL should be Automatic or 3600

3. **Clear DNS Cache:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```

### SSL Certificate Issues

- Wait 10-15 minutes after domain configuration
- Check Vercel dashboard for SSL status
- Ensure DNS records are correct

### Build Errors

- Check Vercel build logs
- Verify all environment variables are set
- Ensure `package.json` scripts are correct

---

## Google Translate API Setup (Optional)

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com

2. **Enable Translation API:**
   - APIs & Services → Enable APIs
   - Search: "Cloud Translation API"
   - Click **Enable**

3. **Create API Key:**
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Copy the key

4. **Add to Vercel:**
   - Environment Variables → `VITE_GOOGLE_TRANSLATE_API_KEY`
   - Value: Your API key

5. **Set Usage Limits (Recommended):**
   - Go to API Key settings
   - Set daily/monthly limits to control costs

---

## Next Steps After Deployment

1. **Test all features:**
   - Image uploads
   - Content management
   - Language toggle
   - Mobile responsiveness

2. **Monitor:**
   - Vercel Analytics
   - Supabase Dashboard
   - Error logs

3. **Optimize:**
   - Image optimization
   - Caching strategies
   - Performance metrics

---

**Your site should be live at `https://www.gurupratapsharma.com` within 24-48 hours!** 🎉

