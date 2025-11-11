# Image Upload Fix - Complete Guide

## ✅ What Was Fixed

The application was receiving a **403 Forbidden** error when uploading images because the Row-Level Security (RLS) policy on Supabase Storage requires file paths to start with the authenticated user's UUID.

### Changes Made:

1. **Updated `src/lib/imageUtils.js`**
   - Modified `uploadImage()` function to automatically prepend the authenticated user's UUID to all file paths
   - Updated `deleteImage()` function to verify authentication
   - Added clear error messages if user is not authenticated

2. **Updated `src/pages/Admin/Login.jsx`**
   - Added Supabase Auth authentication during admin login
   - Automatically creates Supabase user on first login if it doesn't exist
   - Maintains backward compatibility with existing localStorage auth

3. **Updated `src/pages/Admin/Dashboard.jsx`**
   - Added session check on dashboard load
   - Updated logout to properly sign out from Supabase Auth

## 🔧 Setup Steps Required

### Step 1: Configure Environment Variables (Optional)

If you want to use custom Supabase Auth credentials, add these to your `.env` file:

```env
VITE_ADMIN_EMAIL=admin@yourdomain.com
VITE_ADMIN_SUPABASE_PASSWORD=your-secure-password
```

**Note:** If not set, the system will use:
- Email: `{VITE_ADMIN_USER}@admin.local` (default: `aag@admin.local`)
- Password: Same as `VITE_ADMIN_PASSWORD` (default: `1234`)

### Step 2: Verify Supabase Auth Settings

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Ensure **Email Auth** is enabled
4. (Optional) Disable **Confirm email** for admin users if you want immediate access

### Step 3: First Login (Auto-Creation)

The system will automatically create the Supabase Auth user on first login:

1. Log in to the admin panel with your existing credentials
2. The system will attempt to:
   - Sign in with Supabase Auth
   - If user doesn't exist, automatically create it
   - Sign in after creation

**Note:** If auto-creation fails (e.g., email confirmation required), you'll need to manually create the user (see Step 4).

### Step 4: Manual User Creation (If Needed)

If auto-creation doesn't work, manually create the admin user:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - **Email**: `aag@admin.local` (or your custom email)
   - **Password**: `1234` (or your custom password)
   - **Auto Confirm User**: ✅ (check this)
4. Click **Create User**

### Step 5: Test Image Upload

1. Log in to the admin panel
2. Go to **Publications** tab
3. Click **Create Publication** or **Edit** an existing one
4. Click **Upload Image** and select an image file
5. The upload should now work without 403 errors!

## 📁 File Path Structure

After the fix, uploaded files will be stored with this structure:

```
PUBLIC-ASSETS/
  └── {user-uuid}/
      └── publications/
          └── {publication-id}/
              └── cover.jpg
```

**Example:**
```
PUBLIC-ASSETS/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── publications/
          └── 1/
              └── cover.jpg
```

The database will store the full path: `{user-uuid}/publications/{publication-id}/cover.jpg`

## 🔍 Troubleshooting

### Error: "Authentication required. Please ensure you are logged in with Supabase Auth."

**Solution:**
1. Log out and log back in to refresh the Supabase session
2. Check browser console for detailed error messages
3. Verify the Supabase Auth user exists in your Supabase Dashboard

### Error: "Invalid login credentials" during login

**Solution:**
1. The system will try to auto-create the user
2. If that fails, manually create the user in Supabase Dashboard (see Step 4)
3. Ensure email confirmation is disabled or confirm the email if required

### Images still not uploading

**Solution:**
1. Check browser console for error messages
2. Verify RLS policy in Supabase:
   - Go to **Storage** → **Policies** → **public-assets**
   - Ensure the INSERT policy has: `(bucket_id = 'PUBLIC-ASSETS') AND ((storage.foldername(name))[1] = (auth.uid())::text)`
3. Verify you're logged in with Supabase Auth (check Network tab for auth requests)

### Existing Images Not Displaying

If you have existing images uploaded before this fix:
- They may have paths without the user UUID prefix
- The `getImageUrl()` function should still work if the bucket is public
- If images don't display, you may need to re-upload them with the new path structure

## 🎯 Summary

The fix ensures that:
- ✅ All upload paths start with the authenticated user's UUID
- ✅ RLS policy requirements are satisfied
- ✅ Backward compatibility is maintained
- ✅ Auto-setup on first login
- ✅ Clear error messages for debugging

## 📝 Next Steps

1. **Test the upload functionality** in the admin panel
2. **Verify images display correctly** on the frontend
3. **Update any existing publications** by re-uploading images if needed
4. **Monitor for any issues** and check browser console for errors

---

**Need Help?** Check the browser console for detailed error messages. Most issues are related to Supabase Auth configuration or RLS policies.

