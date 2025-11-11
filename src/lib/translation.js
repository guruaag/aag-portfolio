/**
 * Translation Utilities
 * Handles Google Translate API integration and translation caching
 */

const GOOGLE_TRANSLATE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2'

// Cache for translations to avoid redundant API calls
const translationCache = new Map()

/**
 * Translate text using Google Translate API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code ('hi' or 'en')
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string>} Translated text
 */
export async function translateText(text, targetLang = 'hi', sourceLang = 'en') {
  if (!text || !text.trim()) return text
  
  // If target is same as source, return original
  if (targetLang === sourceLang) return text

  // Check cache first
  const cacheKey = `${sourceLang}-${targetLang}-${text}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }

  // If no API key, return original text with a note
  if (!GOOGLE_TRANSLATE_API_KEY) {
    console.warn('Google Translate API key not configured. Returning original text.')
    return text
  }

  try {
    const response = await fetch(`${TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    })

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const data = await response.json()
    const translatedText = data.data?.translations?.[0]?.translatedText || text

    // Cache the translation
    translationCache.set(cacheKey, translatedText)

    return translatedText
  } catch (error) {
    console.error('Translation error:', error)
    // Return original text on error
    return text
  }
}

/**
 * Translate an object of text fields
 * @param {Object} obj - Object with text fields to translate
 * @param {string} targetLang - Target language
 * @param {Array<string>} fields - Field names to translate
 * @returns {Promise<Object>} Object with translated fields
 */
export async function translateObject(obj, targetLang = 'hi', fields = []) {
  if (!obj || targetLang === 'en') return obj

  const translated = { ...obj }
  const fieldsToTranslate = fields.length > 0 ? fields : Object.keys(obj)

  await Promise.all(
    fieldsToTranslate.map(async (field) => {
      if (obj[field] && typeof obj[field] === 'string') {
        translated[field] = await translateText(obj[field], targetLang)
      }
    })
  )

  return translated
}

/**
 * Clear translation cache
 */
export function clearTranslationCache() {
  translationCache.clear()
}

/**
 * Pre-translate content and store in Supabase
 * This should be run for static content that doesn't change often
 */
export async function preTranslateContent(content, supabase) {
  // This would be called during content creation/update
  // Store both EN and HI versions in database
  // Implementation depends on your schema design
  console.log('Pre-translation not yet implemented')
}

