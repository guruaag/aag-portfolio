// Vercel serverless function to generate sitemap.xml
// Place in /api/sitemap.js for Vercel to recognize it
// Note: Vercel will automatically detect this as a serverless function

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send('Missing Supabase configuration')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://gurupratapsharma.com' // Update with your actual domain

  try {
    // Fetch all poems and publications
    const [poemsResult, publicationsResult] = await Promise.all([
      supabase.from('poems').select('id, updated_at').order('sort_order'),
      supabase.from('publications').select('id, updated_at').order('sort_order')
    ])

    const poems = poemsResult.data || []
    const publications = publicationsResult.data || []

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/category</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${poems.map(poem => `
  <url>
    <loc>${baseUrl}/poem/${poem.id}</loc>
    <lastmod>${new Date(poem.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${publications.map(pub => `
  <url>
    <loc>${baseUrl}/publication/${pub.id}</loc>
    <lastmod>${new Date(pub.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate')
    return res.status(200).send(sitemap)
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return res.status(500).send('Error generating sitemap')
  }
}

