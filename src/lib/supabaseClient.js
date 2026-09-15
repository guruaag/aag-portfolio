import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data) return data.filter(cat => cat.is_active !== false)
  } catch (e) {
    console.warn('Error fetching categories:', e)
  }
  return []
}

export async function getAboutContent() {
  try {
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .limit(1)
      .maybeSingle()
    if (!error && data) return data
  } catch (e) {
    console.warn('Error fetching about content:', e)
  }
  return null
}

export async function getPublications() {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data) return data.filter(pub => pub.is_active !== false)
  } catch (e) {
    console.warn('Error fetching publications:', e)
  }
  return []
}

export async function getPublication(id) {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (!error && data) return data
  } catch (e) {
    console.warn('Error fetching publication:', e)
  }
  return null
}

export async function getPoems() {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data) return data.filter(poem => poem.is_active !== false)
  } catch (e) {
    console.warn('Error fetching poems:', e)
  }
  return []
}

export async function getPoem(id) {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (!error && data) return data
  } catch (e) {
    console.warn('Error fetching poem:', e)
  }
  return null
}

export async function getSetting(key) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    if (!error && data) return data.value
  } catch (e) {
    console.warn('Error fetching setting:', e)
  }
  return null
}

export async function getAllSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
    if (!error && data) return data
  } catch (e) {
    console.warn('Error fetching all settings:', e)
  }
  return []
}

export async function getTimeline() {
  try {
    const { data, error } = await supabase
      .from('timeline')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) return data
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('timeline_milestones')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) return data
  } catch (e) {}

  try {
    const cached = localStorage.getItem('app_timeline_milestones')
    if (cached) return JSON.parse(cached)
  } catch (e) {}

  return []
}

export async function getAwards() {
  try {
    const { data, error } = await supabase
      .from('awards')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) return data
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('awards_honors')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) return data
  } catch (e) {}

  try {
    const cached = localStorage.getItem('app_awards_honors')
    if (cached) return JSON.parse(cached)
  } catch (e) {}

  return []
}


