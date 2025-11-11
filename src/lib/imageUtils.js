import { supabase } from './supabaseClient'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

/**
 * Get the full URL for an image stored in Supabase Storage
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
  
  // Construct full URL
  return `${supabaseUrl}/storage/v1/object/public/public-assets/${cleanPath}`
}

/**
 * Upload image to Supabase Storage
 * Uses simplified folder structure: /publications/ or /authors/ directly
 * No UUID prefix required - RLS policy allows authenticated uploads to these folders
 */
export async function uploadImage(file, folderPath, fileName) {
  try {
    // Verify authentication (required by RLS policy)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required. Please ensure you are logged in with Supabase Auth.')
    }
    
    // Ensure folder path doesn't have leading/trailing slashes
    const cleanFolderPath = folderPath.replace(/^\/+|\/+$/g, '')
    const cleanFileName = fileName || file.name
    
    // Simplified path structure: folderPath/fileName (no UUID prefix)
    // Example: publications/123/cover.jpg or authors/about-photo.jpg
    const filePath = cleanFolderPath 
      ? `${cleanFolderPath}/${cleanFileName}` 
      : cleanFileName
    
    // Upload file
    const { data, error } = await supabase.storage
      .from('public-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        throw new Error(
          `RLS Policy Error: ${error.message}\n\n` +
          `Please ensure the RLS policy allows authenticated uploads to: ${cleanFolderPath || 'root'}`
        )
      }
      throw error
    }
    
    // Return the path that should be stored in database
    return filePath
  } catch (err) {
    console.error('Error uploading image:', err)
    throw err
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(imagePath) {
  try {
    if (!imagePath) return
    
    // Get the authenticated user's UUID (required by RLS policy)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required. Please ensure you are logged in with Supabase Auth.')
    }
    
    const { error } = await supabase.storage
    .from('public-assets')
      .remove([imagePath])
    
    if (error) {
      console.error('Delete error:', error)
      throw error
    }
  } catch (err) {
    console.error('Error deleting image:', err)
    throw err
  }
}


