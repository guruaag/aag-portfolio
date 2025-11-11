# 🚀 Complete Image Upload Fix - Step-by-Step Guide

## ⚠️ CRITICAL: Follow These Steps in Order

This guide will fix the RLS policy error and ensure images upload AND display correctly on your website.

---

## 📋 STEP 1: Fix Supabase RLS Policy (MUST DO FIRST)

### Option A: Using SQL Editor (Recommended)

1. **Go to Supabase Dashboard**
   - Open your project
   - Click **SQL Editor** in the left sidebar

2. **Create New Query**
   - Click **New Query**

3. **Copy and Paste This SQL:**
   ```sql
   -- Drop existing policies
   DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
   DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

   -- Create correct INSERT policy
   CREATE POLICY "Allow authenticated uploads" 
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'public-assets'
     AND (storage.foldername(name))[1] = (auth.uid())::text
   );

   -- Ensure public read policy exists
   DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_policies 
       WHERE schemaname = 'storage' 
       AND tablename = 'objects' 
       AND policyname = 'Allow public read'
     ) THEN
       CREATE POLICY "Allow public read"
       ON storage.objects
       FOR SELECT
       TO public
       USING (bucket_id = 'public-assets');
     END IF;
   END $$;
   ```

4. **Run the Query**
   - Click **Run** (or press Cmd/Ctrl + Enter)
   - You should see: "Success. No rows returned"

5. **Verify Policies**
   - Run this verification query:
   ```sql
   SELECT policyname, cmd, qual, with_check 
   FROM pg_policies 
   WHERE schemaname = 'storage' AND tablename = 'objects';
   ```
   - You should see TWO policies:
     - `Allow public read` (SELECT)
     - `Allow authenticated uploads` (INSERT)

### Option B: Using Migration File

1. **Open the migration file:**
   - File: `migrations/003_fix_storage_rls_policy.sql`
   - Copy the entire contents

2. **Paste into Supabase SQL Editor** and run it

---

## 📋 STEP 2: Create/Verify Supabase Auth User

1. **Go to Supabase Dashboard → Authentication → Users**

2. **Check if user exists:**
   - Look for email: `aag@admin.local` (or your `VITE_ADMIN_EMAIL`)

3. **If user DOES NOT exist:**
   - Click **Add User** → **Create new user**
   - **Email:** `aag@admin.local`
   - **Password:** `1234` (or your password)
   - ✅ **Check "Auto Confirm User"** (IMPORTANT!)
   - Click **Create User**

4. **If user EXISTS but not confirmed:**
   - Click on the user
   - Click **Confirm User** button

---

## 📋 STEP 3: Verify Environment Variables

1. **Check your `.env` file:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_ADMIN_USER=aag
   VITE_ADMIN_PASSWORD=1234
   VITE_ADMIN_EMAIL=aag@admin.local
   VITE_ADMIN_SUPABASE_PASSWORD=1234
   ```

2. **If deploying to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add/Update all the above variables
   - **Redeploy** after adding variables

---

## 📋 STEP 4: Test Upload (Local Development)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser console:**
   - Press F12 or Cmd/Ctrl + Shift + I
   - Go to **Console** tab
   - Keep it open to see debug logs

3. **Log in to Admin Panel:**
   - Go to `http://localhost:5173/admin` (or your dev URL)
   - Enter username: `aag`
   - Enter password: `1234`
   - Click **Login**

4. **Check console for:**
   ```
   ✅ Logged into Supabase Auth: aag@admin.local
   ```

5. **Go to Publications:**
   - Click **Publications** tab
   - Click **Create Publication** (or Edit an existing one)

6. **Upload an Image:**
   - Fill in Title (required)
   - Click **Choose File** under "Cover Image"
   - Select an image file (JPG, PNG, etc.)
   - **Watch the console** for debug logs

7. **Expected Console Output:**
   ```
   🔵 Checking Supabase Auth session...
   ✅ Authenticated user ID: 123e4567-e89b-12d3-a456-426614174000
   🔵 UPLOAD DEBUG → userId: 123e4567-e89b-12d3-a456-426614174000
   🔵 UPLOAD DEBUG → filePath: 123e4567-.../publications/temp-1234567890/cover.jpg
   🔵 UPLOAD DEBUG → bucket: public-assets
   ✅ UPLOAD SUCCESS → Path: 123e4567-.../publications/temp-1234567890/cover.jpg
   ✅ UPLOAD SUCCESS → Full URL: https://...supabase.co/storage/v1/object/public/public-assets/...
   ```

8. **If you see an error:**
   - Copy the FULL error message from console
   - Check which step failed
   - See Troubleshooting section below

9. **Save the Publication:**
   - Fill in other fields (Subtitle, Description, etc.)
   - Click **Create Publication**
   - You should see "Saved!" alert

---

## 📋 STEP 5: Verify Image in Supabase Dashboard

1. **Go to Supabase Dashboard → Storage → public-assets**

2. **You should see:**
   ```
   public-assets/
     └── {your-user-uuid}/
         └── publications/
             └── {publication-id}/
                 └── cover.jpg
   ```

3. **Click on the image** to verify it uploaded correctly

---

## 📋 STEP 6: Verify Image Displays on Website

1. **Go to your website homepage:**
   - `http://localhost:5173` (or your dev URL)

2. **Check Publications Section:**
   - The uploaded image should appear in the publication card
   - If not, check browser console for image loading errors

3. **Click on the Publication:**
   - Navigate to the publication detail page
   - The full-size image should display

4. **Check Image URL:**
   - Right-click on image → "Inspect" or "Inspect Element"
   - Check the `src` attribute
   - Should be: `https://your-project.supabase.co/storage/v1/object/public/public-assets/{user-uuid}/publications/{id}/cover.jpg`

---

## 📋 STEP 7: Deploy to Production (Vercel)

1. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Fix RLS policy for image uploads"
   git push
   ```

2. **Vercel will auto-deploy**

3. **After deployment:**
   - Go to your production URL
   - Test login and upload again
   - Verify images display correctly

---

## 🔍 Troubleshooting

### Error: "Authentication required"

**Solution:**
1. Log out and log back in
2. Check browser console for auth errors
3. Verify Supabase user exists and is confirmed
4. Check environment variables are set correctly

### Error: "new row violates row-level security policy"

**Solution:**
1. **Verify RLS policy was applied:**
   - Run this in Supabase SQL Editor:
   ```sql
   SELECT policyname, cmd, with_check 
   FROM pg_policies 
   WHERE schemaname = 'storage' AND tablename = 'objects';
   ```
   - Should show "Allow authenticated uploads" policy

2. **Check the policy condition:**
   - The `with_check` should contain: `(storage.foldername(name))[1] = (auth.uid())::text`

3. **Verify user is authenticated:**
   - Check console for: `✅ Authenticated user ID: ...`
   - If missing, re-login

### Error: "Invalid login credentials"

**Solution:**
1. Verify Supabase user exists in Dashboard
2. Check email matches `VITE_ADMIN_EMAIL`
3. Try resetting password in Supabase Dashboard
4. Update `VITE_ADMIN_SUPABASE_PASSWORD` if changed

### Image Uploads but Doesn't Display

**Solution:**
1. **Check the path in database:**
   - Go to Supabase Dashboard → Table Editor → publications
   - Check `image_path` column
   - Should start with user UUID: `{uuid}/publications/...`

2. **Check image URL:**
   - Open browser console
   - Look for 404 errors on image requests
   - Verify the URL is correct

3. **Check bucket is public:**
   - Supabase Dashboard → Storage → public-assets
   - Settings → Should be "Public bucket"

### Still Getting Errors?

1. **Check browser console** for full error details
2. **Check Supabase Logs:**
   - Dashboard → Logs → API Logs
   - Look for storage-related errors
3. **Verify all steps completed:**
   - RLS policy applied ✅
   - User created and confirmed ✅
   - Environment variables set ✅
   - Authenticated successfully ✅

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] RLS policy applied in Supabase (2 policies visible)
- [ ] Supabase Auth user exists and is confirmed
- [ ] Can log in to admin panel
- [ ] Console shows: "Logged into Supabase Auth"
- [ ] Can upload image without errors
- [ ] Console shows: "UPLOAD SUCCESS"
- [ ] Image appears in Supabase Storage under `{user-uuid}/publications/...`
- [ ] Image displays on website homepage
- [ ] Image displays on publication detail page
- [ ] Works in both local and production

---

## 🎯 Quick Test Script

Run this in browser console after logging in:

```javascript
// Test 1: Check auth
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user?.id, user?.email)

// Test 2: Check session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session ? 'Active' : 'None')

// Test 3: Try upload (replace with actual file)
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
const userId = user.id
const testPath = `${userId}/test/test.jpg`
console.log('Test path:', testPath)

// This should work if RLS is correct
const { data, error } = await supabase.storage
  .from('public-assets')
  .upload(testPath, file)
  
if (error) {
  console.error('❌ Upload failed:', error)
} else {
  console.log('✅ Upload test passed!')
  // Clean up
  await supabase.storage.from('public-assets').remove([testPath])
}
```

---

## 📞 Need More Help?

If you're still stuck:

1. **Share the exact error message** from browser console
2. **Share the output** of the verification SQL query
3. **Share a screenshot** of Supabase Storage showing the folder structure
4. **Check Supabase Status Page** for any service issues

---

**Once all steps are complete, your image upload should work perfectly!** 🎉

