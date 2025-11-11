# 🚨 URGENT FIX - Do This Right Now

## The Problem

The `storage.foldername()` function in your RLS policy is unreliable. We need to use `split_part()` instead.

---

## ✅ IMMEDIATE ACTION (5 Minutes)

### Copy and paste this ENTIRE SQL into Supabase SQL Editor and RUN:

```sql
-- ============================================
-- FIX: Replace unreliable storage.foldername() 
-- with reliable split_part()
-- ============================================

-- Step 1: Drop old policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Step 2: Create new policy using split_part()
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
  AND split_part(name, '/', 1) = (auth.uid())::text
);

-- Step 3: Verify it worked
SELECT 
  policyname, 
  cmd, 
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND cmd = 'INSERT';
```

---

## ✅ TEST IT

1. **Go to your admin panel**
2. **Try uploading an image**
3. **It should work now!**

---

## 🔍 What Changed?

**OLD (Not Working):**
```sql
(storage.foldername(name))[1] = (auth.uid())::text
```

**NEW (Working):**
```sql
split_part(name, '/', 1) = (auth.uid())::text
```

The `split_part()` function extracts the first folder from the path:
- Path: `eb30612c-4bad-4771-bb79-b696b426d149/publications/cover.jpg`
- `split_part(name, '/', 1)` returns: `eb30612c-4bad-4771-bb79-b696b426d149`
- This matches `auth.uid()` ✅

---

## ✅ Verification

After running the SQL, check the output. You should see:
- `policyname`: "Allow authenticated uploads"
- `cmd`: "INSERT"  
- `with_check`: Should contain `split_part(name, '/', 1)`

---

**That's it! Run the SQL above and test your upload. It should work now.**

