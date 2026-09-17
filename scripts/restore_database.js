import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return {}
  const content = fs.readFileSync(envPath, 'utf-8')
  const envMap = {}
  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=')
      if (idx > -1) {
        const key = trimmed.substring(0, idx).trim()
        let val = trimmed.substring(idx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1)
        }
        envMap[key] = val
      }
    }
  })
  return envMap
}

const env = loadEnv()
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function restoreDatabase() {
  const targetFileArg = process.argv[2]
  const backupDir = path.join(process.cwd(), 'db_backups')
  const filePath = targetFileArg 
    ? path.resolve(targetFileArg)
    : path.join(backupDir, 'latest_backup.json')

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Backup file not found at: ${filePath}`)
    process.exit(1)
  }

  console.log(`🔄 Reading backup file: ${filePath}`)
  const rawData = fs.readFileSync(filePath, 'utf-8')
  const backupData = JSON.parse(rawData)

  for (const [table, rows] of Object.entries(backupData)) {
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`⏭️ Skipping table '${table}' (0 rows)`)
      continue
    }

    console.log(`⏳ Restoring ${rows.length} rows into table '${table}'...`)
    const onConflictCol = table === 'settings' ? 'key' : 'id'

    for (const row of rows) {
      try {
        const { error } = await supabase.from(table).upsert(row, { onConflict: onConflictCol })
        if (error) {
          console.warn(`  ⚠️ Row restore error on '${table}':`, error.message)
        }
      } catch (err) {
        console.error(`  ❌ Error restoring row on '${table}':`, err)
      }
    }
    console.log(`✓ Table '${table}' restoration complete`)
  }

  console.log(`\n🎉 Database restoration finished successfully!`)
}

restoreDatabase()
