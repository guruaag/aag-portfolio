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

export async function getFamilyTree() {
  try {
    const [membersRes, relsRes] = await Promise.all([
      supabase.from('family_members').select('*').order('sort_order', { ascending: true }),
      supabase.from('family_relationships').select('*')
    ])

    if (!membersRes.error && membersRes.data && membersRes.data.length > 0) {
      const activeMembers = membersRes.data.filter(m => m.is_deleted !== true && m.is_active !== false && !m.deleted_at)
      const relationships = relsRes.data || []

      const formattedMembers = activeMembers.map(m => {
        const key = m.member_key || m.id
        const parentIds = relationships
          .filter(r => r.person_key === key && r.relationship_type === 'parent')
          .map(r => r.related_key)
        const spouseIds = relationships
          .filter(r => r.person_key === key && r.relationship_type === 'spouse')
          .map(r => r.related_key)
        const childrenIds = relationships
          .filter(r => r.person_key === key && r.relationship_type === 'child')
          .map(r => r.related_key)

        return {
          id: key,
          db_id: m.id,
          name_hi: m.name_hi,
          name_en: m.name_en,
          relation_hi: m.relation_hi || '',
          relation_en: m.relation_en || '',
          generation: m.generation || 1,
          gender: m.gender || 'male',
          isDeceased: m.is_deceased || false,
          birthDate: m.birth_date || '',
          deathDate: m.death_date || '',
          phone: m.phone || '',
          city: m.city || 'Jaipur',
          photoUrl: m.photo_url || '',
          bio: m.bio || '',
          parentIds,
          spouseIds,
          childrenIds
        }
      })

      try { localStorage.setItem('cache_family_tree', JSON.stringify(formattedMembers)) } catch (e) {}
      return formattedMembers
    }
  } catch (e) {
    console.warn('Error fetching family tree:', e)
  }

  try {
    const cached = localStorage.getItem('cache_family_tree')
    if (cached) return JSON.parse(cached)
  } catch (e) {}

  return null
}

export async function saveFamilyMember(member) {
  try {
    const memberKey = member.id || `f-${Date.now()}`
    const payload = {
      member_key: memberKey,
      name_hi: member.name_hi,
      name_en: member.name_en,
      relation_hi: member.relation_hi || '',
      relation_en: member.relation_en || '',
      gender: member.gender || 'male',
      is_deceased: Boolean(member.isDeceased),
      birth_date: member.birthDate || '',
      death_date: member.deathDate || '',
      generation: member.generation || 1,
      city: member.city || 'Jaipur',
      phone: member.phone || '',
      photo_url: member.photoUrl || '',
      bio: member.bio || '',
      is_deleted: false,
      is_active: true,
      deleted_at: null,
      updated_at: new Date().toISOString()
    }

    let memberRes
    if (member.db_id) {
      memberRes = await supabase
        .from('family_members')
        .update(payload)
        .eq('id', member.db_id)
        .select()
        .single()
    } else {
      memberRes = await supabase
        .from('family_members')
        .upsert(payload, { onConflict: 'member_key' })
        .select()
        .single()
    }

    // PGRST204 Fallback: If remote schema cache is missing optional columns (e.g. bio), retry with core payload
    if (memberRes.error && memberRes.error.code === 'PGRST204') {
      console.warn('PGRST204 Schema mismatch detected. Retrying upsert with core payload:', memberRes.error.message)
      const corePayload = {
        member_key: memberKey,
        name_hi: member.name_hi,
        name_en: member.name_en,
        relation_hi: member.relation_hi || '',
        relation_en: member.relation_en || '',
        gender: member.gender || 'male',
        is_deceased: Boolean(member.isDeceased),
        birth_date: member.birthDate || '',
        death_date: member.deathDate || '',
        generation: member.generation || 1,
        city: member.city || 'Jaipur',
        phone: member.phone || '',
        photo_url: member.photoUrl || '',
        is_deleted: false,
        is_active: true,
        updated_at: new Date().toISOString()
      }

      if (member.db_id) {
        memberRes = await supabase
          .from('family_members')
          .update(corePayload)
          .eq('id', member.db_id)
          .select()
          .single()
      } else {
        memberRes = await supabase
          .from('family_members')
          .upsert(corePayload, { onConflict: 'member_key' })
          .select()
          .single()
      }
    }

    if (memberRes.error) {
      console.error('Error saving family member to Supabase:', memberRes.error)
      return { success: false, error: memberRes.error }
    }

    // Invalidate local cache & notify all components via event
    try { localStorage.removeItem('cache_family_tree') } catch (e) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('familyTreeDataChanged'))
    }

    // Update relationships in family_relationships
    if (Array.isArray(member.spouseIds) || Array.isArray(member.parentIds)) {
      // Clear outbound relationships for this member_key
      await supabase
        .from('family_relationships')
        .delete()
        .eq('person_key', memberKey)

      // Clear stale spouse links pointing TO this member_key to prevent orphaned spouse rows
      await supabase
        .from('family_relationships')
        .delete()
        .eq('related_key', memberKey)
        .eq('relationship_type', 'spouse')

      const relsToInsert = []
      if (Array.isArray(member.spouseIds)) {
        member.spouseIds.forEach(spKey => {
          // Outbound spouse link (A -> B)
          relsToInsert.push({ person_key: memberKey, related_key: spKey, relationship_type: 'spouse' })
          // Reciprocal spouse link (B -> A) for bidirectional graph symmetry
          relsToInsert.push({ person_key: spKey, related_key: memberKey, relationship_type: 'spouse' })
        })
      }
      if (Array.isArray(member.parentIds)) {
        member.parentIds.forEach(pKey => {
          relsToInsert.push({ person_key: memberKey, related_key: pKey, relationship_type: 'parent' })
        })
      }

      if (relsToInsert.length > 0) {
        await supabase.from('family_relationships').upsert(relsToInsert, { onConflict: 'person_key,related_key,relationship_type' })
      }
    }

    return { success: true, data: memberRes.data }
  } catch (err) {
    console.error('Exception saving family member:', err)
    return { success: false, error: err }
  }
}

export async function deleteFamilyMember(memberKey) {
  try {
    const nowIso = new Date().toISOString()
    const { error } = await supabase
      .from('family_members')
      .update({
        is_deleted: true,
        is_active: false,
        deleted_at: nowIso,
        updated_at: nowIso
      })
      .or(`member_key.eq.${memberKey},id.eq.${memberKey}`)
    
    if (error) {
      console.error('Error soft-deleting family member in Supabase:', error)
      return { success: false, error }
    }

    // Invalidate local cache & notify all components via event
    try { localStorage.removeItem('cache_family_tree') } catch (e) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('familyTreeDataChanged'))
    }

    // Clean up relationship edges associated with deleted member
    await Promise.all([
      supabase.from('family_relationships').delete().eq('person_key', memberKey),
      supabase.from('family_relationships').delete().eq('related_key', memberKey)
    ]).catch(() => {})

    return { success: true }
  } catch (err) {
    console.error('Exception soft-deleting family member:', err)
    return { success: false, error: err }
  }
}
