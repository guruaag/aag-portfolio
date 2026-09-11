/**
 * Data Sanitizer Utility for Gurupratap Sharma 'Aag' Portfolio
 * Filters out technical test strings, dirty placeholder filenames, and hardcoded numerical prefixes.
 */

export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text
    // Strip dirty test placeholder substrings
    .replace(/jjjpg|1jpg|test33tit|ssssss|2My Writings|33tit/gi, '')
    // Strip leading digits like "2 ", "3 ", "1. " from titles
    .replace(/^[0-9]+[\s\.\-]/, '')
    .trim();

  return cleaned;
}

export function sanitizePoem(poem) {
  if (!poem) return null;

  const rawHi = poem.heading_hi || poem.heading || poem.title || '';
  const rawEn = poem.heading_en || poem.heading || poem.title_en || poem.title || '';

  return {
    ...poem,
    heading_hi: sanitizeText(rawHi) || rawHi,
    heading_en: sanitizeText(rawEn) || rawEn,
    description: sanitizeText(poem.description || ''),
    body_text_hi: sanitizeText(poem.body_text_hi || poem.full_text || ''),
    body_text_en: sanitizeText(poem.body_text_en || poem.full_text || '')
  };
}

export function sanitizePublication(pub) {
  if (!pub) return null;

  const rawTitle = pub.title || pub.heading_hi || pub.name || '';

  return {
    ...pub,
    title: sanitizeText(rawTitle) || rawTitle,
    subtitle: sanitizeText(pub.subtitle || ''),
    description: sanitizeText(pub.description || '')
  };
}

