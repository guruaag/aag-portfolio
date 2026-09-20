import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions with localStorage snapshot caching for zero public downtime

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) {
      const active = data.filter(cat => cat.is_active !== false && cat.is_deleted !== true)
      try { localStorage.setItem('cache_categories', JSON.stringify(active)) } catch (e) {}
      return active
    }
  } catch (e) {
    console.warn('Error fetching categories:', e)
  }
  try {
    const cached = localStorage.getItem('cache_categories')
    if (cached) return JSON.parse(cached)
  } catch (e) {}
  return []
}

export async function getAboutContent() {
  try {
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .limit(1)
      .maybeSingle()
    if (!error && data) {
      try { localStorage.setItem('cache_about_content', JSON.stringify(data)) } catch (e) {}
      return data
    }
  } catch (e) {
    console.warn('Error fetching about content:', e)
  }
  try {
    const cached = localStorage.getItem('cache_about_content')
    if (cached) return JSON.parse(cached)
  } catch (e) {}
  return null
}

export async function getPublications() {
  try {
    const { data, error } = await supabase
      .from('publications')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) {
      const active = data.filter(pub => pub.is_active !== false && pub.is_deleted !== true)
      try { localStorage.setItem('cache_publications', JSON.stringify(active)) } catch (e) {}
      return active
    }
  } catch (e) {
    console.warn('Error fetching publications:', e)
  }
  try {
    const cached = localStorage.getItem('cache_publications')
    if (cached) return JSON.parse(cached)
  } catch (e) {}
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
    if (!error && data && data.length > 0) {
      const active = data.filter(poem => poem.is_active !== false && poem.is_deleted !== true)
      try { localStorage.setItem('cache_poems', JSON.stringify(active)) } catch (e) {}
      return active
    }
  } catch (e) {
    console.warn('Error fetching poems:', e)
  }
  try {
    const cached = localStorage.getItem('cache_poems')
    if (cached) return JSON.parse(cached)
  } catch (e) {}
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
    if (!error && data && data.length > 0) {
      try { localStorage.setItem('cache_settings', JSON.stringify(data)) } catch (e) {}
      return data
    }
  } catch (e) {
    console.warn('Error fetching all settings:', e)
  }
  try {
    const cached = localStorage.getItem('cache_settings')
    if (cached) return JSON.parse(cached)
  } catch (e) {}
  return []
}

export async function getTimeline() {
  try {
    const { data, error } = await supabase
      .from('timeline_milestones')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) {
      const active = data.filter(item => item.is_deleted !== true)
      try { localStorage.setItem('cache_timeline', JSON.stringify(active)) } catch (e) {}
      return active
    }
  } catch (e) {}

  try {
    const cached = localStorage.getItem('cache_timeline') || localStorage.getItem('app_timeline_milestones')
    if (cached) return JSON.parse(cached)
  } catch (e) {}

  return []
}

export async function getAwards() {
  try {
    const { data, error } = await supabase
      .from('awards_honors')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error && data && data.length > 0) {
      const active = data.filter(item => item.is_deleted !== true)
      try { localStorage.setItem('cache_awards', JSON.stringify(active)) } catch (e) {}
      return active
    }
  } catch (e) {}

  try {
    const cached = localStorage.getItem('cache_awards') || localStorage.getItem('app_awards_honors')
    if (cached) return JSON.parse(cached)
  } catch (e) {}

  return []
}
