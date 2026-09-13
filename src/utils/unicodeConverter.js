/**
 * Kruti Dev 010 / 022 & Legacy Font -> Unicode Hindi Converter Utility
 * Re-exports the 10x Master Font Engine for backwards compatibility.
 */

export { 
  convertKrutiDevToUnicode, 
  isKrutiDevText, 
  convertUniversalHindiFont,
  detectLegacyFont,
  normalizeNuktaDevanagari,
  cleanPageMakerControlChars,
  fixMatraStacking,
  convertDigits
} from './hindiFontEngine.js';
