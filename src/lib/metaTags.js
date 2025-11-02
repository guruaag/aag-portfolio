// Utility for managing meta tags for SEO

export function updateMetaTags({ title, description, image, url }) {
  // Update title
  if (title) {
    document.title = title
  }

  // Update or create meta description
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.name = 'description'
    document.head.appendChild(metaDesc)
  }
  if (description) {
    metaDesc.content = description
  }

  // Update or create OpenGraph tags
  const ogTags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url || window.location.href },
    { property: 'og:image', content: image },
    { property: 'og:type', content: 'website' }
  ]

  ogTags.forEach(({ property, content }) => {
    if (!content) return
    
    let meta = document.querySelector(`meta[property="${property}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('property', property)
      document.head.appendChild(meta)
    }
    meta.content = content
  })

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url || window.location.href
}

