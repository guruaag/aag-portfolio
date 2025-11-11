/**
 * Migration Script: Move Files from UUID Folders to Simplified Structure
 * 
 * This script moves files from:
 *   {uuid}/publications/{id}/cover.jpg
 * to:
 *   publications/{id}/cover.jpg
 * 
 * Usage:
 *   1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *   2. Run: node scripts/migrate-storage-files.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateFiles() {
  try {
    console.log('🔄 Starting file migration...')
    
    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from('public-assets')
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })
    
    if (listError) {
      throw listError
    }
    
    console.log(`📁 Found ${files.length} items in root`)
    
    // Find UUID folders
    const uuidFolders = files.filter(file => 
      file.name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    )
    
    console.log(`📦 Found ${uuidFolders.length} UUID folders`)
    
    let movedCount = 0
    let errorCount = 0
    
    for (const folder of uuidFolders) {
      const uuidPath = folder.name
      console.log(`\n📂 Processing folder: ${uuidPath}`)
      
      // List files in UUID folder
      const { data: uuidFiles, error: uuidListError } = await supabase.storage
        .from('public-assets')
        .list(uuidPath, {
          limit: 1000,
          recursive: true
        })
      
      if (uuidListError) {
        console.error(`❌ Error listing ${uuidPath}:`, uuidListError)
        errorCount++
        continue
      }
      
      // Process each file
      for (const file of uuidFiles) {
        if (file.id) {
          // It's a file, not a folder
          const oldPath = `${uuidPath}/${file.name}`
          const newPath = file.name // Remove UUID prefix
          
          try {
            // Copy file to new location
            const { data: copyData, error: copyError } = await supabase.storage
              .from('public-assets')
              .copy(oldPath, newPath)
            
            if (copyError) {
              console.error(`❌ Error copying ${oldPath}:`, copyError)
              errorCount++
            } else {
              console.log(`✅ Moved: ${oldPath} → ${newPath}`)
              movedCount++
              
              // Delete old file
              const { error: deleteError } = await supabase.storage
                .from('public-assets')
                .remove([oldPath])
              
              if (deleteError) {
                console.warn(`⚠️  Could not delete ${oldPath}:`, deleteError)
              }
            }
          } catch (err) {
            console.error(`❌ Error processing ${oldPath}:`, err)
            errorCount++
          }
        }
      }
    }
    
    console.log(`\n✅ Migration complete!`)
    console.log(`   Moved: ${movedCount} files`)
    console.log(`   Errors: ${errorCount} files`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateFiles()

