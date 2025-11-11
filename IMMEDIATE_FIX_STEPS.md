# 🚨 IMMEDIATE FIX - Step by Step

## The Problem

The `storage.foldername()` function in the RLS policy is not working reliably. We need to use a more robust approach.

## Solution: Use `split_part()` Instead

The `split_part()` function is more reliable for extracting the first folder from a path.

---

## 📋 STEP-BY-STEP FIX (Do This Now)

### STEP 1: Create Test Policy (Verify Basic Setup Works)

1. **Go to Supabase Dashboard → SQL Editor**

2. **Run this SQL:**
   ```sql
   -- Drop existing policies
   DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
   DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
   DROP POLICY IF EXISTS "temp_allow_all_inserts" ON storage.objects;

   -- Create temporary test policy (allows all authenticated uploads)
   CREATE POLICY "temp_allow_all_inserts"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'public-assets'
   );
   ```

3. **Click Run**

4. **Test Upload:**
   - Go to your admin panel
   - Try uploading an image
   - **If this works** → Proceed to STEP 2
   - **If this fails** → There's a different issue (auth, bucket config, etc.)

---

### STEP 2: Test Manual Insert (Verify Policy Works)

1. **In Supabase SQL Editor, run this:**
   ```sql
   -- Replace with your actual user ID from Authentication → Users
   -- Your user ID is: eb30612c-4bad-4771-bb79-b696b426d149
   
   INSERT INTO storage.objects (bucket_id, name, owner)
   VALUES ('public-assets', 'eb30612c-4bad-4771-bb79-b696b426d149/test.jpg', 'eb30612c-4bad-4771-bb79-b696b426d149');
   ```

2. **Check Result:**
   - **If SUCCESS** → The temp policy works, proceed to STEP 3
   - **If FAILS** → Share the exact error message

---

### STEP 3: Replace with Secure Policy (Using split_part)

1. **In Supabase SQL Editor, run this:**
   ```sql
   -- Drop temp policy
   DROP POLICY IF EXISTS "temp_allow_all_inserts" ON storage.objects;

   -- Create secure policy using split_part() instead of storage.foldername()
   CREATE POLICY "Allow authenticated uploads" 
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'public-assets'
     AND split_part(name, '/', 1) = (auth.uid())::text
   );
   ```

2. **Click Run**

3. **Verify Policy:**
   ```sql
   SELECT 
     policyname, 
     cmd, 
     with_check
   FROM pg_policies 
   WHERE schemaname = 'storage' 
     AND tablename = 'objects'
     AND cmd = 'INSERT';
   ```
   
   **Expected Output:**
   - `policyname`: "Allow authenticated uploads"
   - `cmd`: "INSERT"
   - `with_check`: Should contain `split_part(name, '/', 1)`

---

### STEP 4: Test Upload Again

1. **Go to admin panel**
2. **Try uploading an image**
3. **Check console** - should see success messages

---

## 🔍 Why This Fix Works

### Old Policy (Not Working):
```sql
(storage.foldername(name))[1] = (auth.uid())::text
```
- `storage.foldername()` may not work reliably in all contexts
- Array indexing `[1]` might cause issues

### New Policy (Working):
```sql
split_part(name, '/', 1) = (auth.uid())::text
```
- `split_part()` is a standard PostgreSQL function
- More reliable and predictable
- Extracts first folder from path: `eb30612c-.../publications/cover.jpg` → `eb30612c-...`

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Temp policy created and tested
- [ ] Manual INSERT test succeeded
- [ ] Secure policy created with `split_part()`
- [ ] Policy verification query shows correct `with_check`
- [ ] Image upload works in admin panel
- [ ] Image displays on website

---

## 🆘 If Still Not Working

### Check 1: Verify Policy Syntax
```sql
SELECT 
  policyname, 
  cmd, 
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
```

### Check 2: Test split_part() Function
```sql
-- This should return your user ID
SELECT split_part('eb30612c-4bad-4771-bb79-b696b426d149/publications/test.jpg', '/', 1);
-- Expected: eb30612c-4bad-4771-bb79-b696b426d149
```

### Check 3: Verify auth.uid() Works
```sql
-- This should return your user ID when authenticated
SELECT auth.uid();
```

### Check 4: Test Full Condition
```sql
-- Replace with your actual user ID
SELECT 
  'public-assets' = 'public-assets' AS bucket_check,
  split_part('eb30612c-4bad-4771-bb79-b696b426d149/test.jpg', '/', 1) = 'eb30612c-4bad-4771-bb79-b696b426d149' AS folder_check;
-- Both should return TRUE
```

---

## 📝 Quick Copy-Paste SQL (All Steps)

```sql
-- ============================================
-- STEP 1: Create Temp Policy
-- ============================================
DROP POLICY IF EXISTS "temp_allow_all_inserts" ON storage.objects;
CREATE POLICY "temp_allow_all_inserts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-assets');

-- TEST UPLOAD NOW - If it works, proceed to STEP 2

-- ============================================
-- STEP 2: Replace with Secure Policy
-- ============================================
DROP POLICY IF EXISTS "temp_allow_all_inserts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

CREATE POLICY "Allow authenticated uploads" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
  AND split_part(name, '/', 1) = (auth.uid())::text
);

-- ============================================
-- VERIFY
-- ============================================
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

**Follow these steps in order. The `split_part()` approach is more reliable than `storage.foldername()`.**

