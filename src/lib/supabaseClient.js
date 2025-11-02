import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getAboutContent() {
  const { data, error } = await supabase
    .from('about_content')
    .select('*')
    .limit(1)
    .single()
  
  if (error) throw error
  return data
}

export async function getPublications() {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getPublication(id) {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getPoems() {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data
}

export async function getPoem(id) {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getSetting(key) {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  
  if (error) throw error
  return data?.value
}

