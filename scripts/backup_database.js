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

const TABLES = [
  'categories',
  'about_content',
  'poems',
  'publications',
  'timeline_milestones',
  'awards_honors',
  'settings',
  'contact_submissions'
]

async function backupDatabase() {
  console.log('📦 Starting Supabase Database Backup...')
  const backupData = {}
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select('*')
      if (error) {
        console.warn(`⚠️ Warning fetching table ${table}:`, error.message)
        backupData[table] = []
      } else {
        backupData[table] = data || []
        console.log(`✓ Fetched ${backupData[table].length} rows from table '${table}'`)
      }
    } catch (e) {
      console.error(`❌ Error querying table ${table}:`, e)
      backupData[table] = []
    }
  }

  const outputDir = path.join(process.cwd(), 'db_backups')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filePath = path.join(outputDir, `backup_${timestamp}.json`)
  const latestPath = path.join(outputDir, `latest_backup.json`)

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8')
  fs.writeFileSync(latestPath, JSON.stringify(backupData, null, 2), 'utf-8')

  console.log(`\n✅ Backup successfully saved to:\n  - ${filePath}\n  - ${latestPath}`)
}

backupDatabase()
