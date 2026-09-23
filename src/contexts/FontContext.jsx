import React, { createContext, useContext, useState, useEffect } from 'react';
import { convertUniversalHindiFont, isKrutiDevText } from '../utils/hindiFontEngine.js';

const FontContext = createContext();

// Exact Kruti Dev 010 Remington Live Keymap for Single Keypresses
const REMINGTON_KEYMAP = {
  // Lowercase keys
  'q': 'ु', 'w': 'ू', 'e': 'म', 'r': 'त', 't': 'ज', 'y': 'ल', 'u': 'न', 'i': 'प', 'o': 'व', 'p': 'च',
  '[': 'ख', ']': ',', 'a': 'ं', 's': 'े', 'd': 'क', 'f': 'ि', 'g': 'ह', 'h': 'ी', 'j': 'र', 'k': 'ा',
  'l': 'स', ';': 'य', "'": 'श्', 'z': '्र', 'x': 'ग', 'c': 'ब', 'v': 'अ', 'b': 'इ', 'n': 'द', 'm': 'उ',
  ',': 'ए', '.': 'ण्', '/': 'ध्', '`': 'ृ', '=': 'त्र', '-': '-',

  // Uppercase (Shift + key)
  'Q': 'फ', 'W': 'ू', 'E': 'म्', 'R': 'त्', 'T': 'ज्', 'Y': 'य्', 'U': 'न्', 'I': 'प्', 'O': 'व्', 'P': 'च्',
  '{': 'क्ष्', '}': 'द्व', 'A': 'ँ', 'S': 'ै', 'D': 'क्', 'F': 'थ्', 'G': 'ह', 'H': 'भ्', 'J': 'श्र', 'K': 'ख्',
  'L': 'स्', ':': 'ः', '"': 'ष्', 'Z': 'र्', 'X': 'ग्', 'C': 'ब्', 'V': 'ट', 'B': 'ठ', 'N': 'छ', 'M': 'ड',
  '<': 'ढ', '>': 'झ्', '?': 'घ्', '~': '्', '+': '़', '_': 'ऋ'
};

export function FontProvider({ children }) {
  const [typingFont, setTypingFontState] = useState(() => {
    try {
      return localStorage.getItem('typingFontPreference') || 'english';
    } catch {
      return 'english';
    }
  });

  const setTypingFont = (mode) => {
    const validMode = mode === 'krutidev' ? 'krutidev' : 'english';
    setTypingFontState(validMode);
    try {
      localStorage.setItem('typingFontPreference', validMode);
    } catch (e) {
      console.warn('Could not save typing font preference to localStorage', e);
    }
  };

  const toggleTypingFont = () => {
    setTypingFont(typingFont === 'english' ? 'krutidev' : 'english');
  };

  // Helper to check if an element is excluded from Kruti Dev interception
  const isExcludedInput = (element) => {
    if (!element) return true;

    // Check closest elements for explicit exclusion classes/attributes or search type
    if (element.closest && element.closest('.no-krutidev, .canvas-search-box, .canvas-search-input, [data-no-krutidev="true"], [data-english-only="true"], [type="search"], [name="search"]')) {
      return true;
    }

    const tagName = element.tagName ? element.tagName.toUpperCase() : '';
    
    // Non-editable check
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && !element.isContentEditable) {
      return true;
    }

    if (tagName === 'INPUT') {
      const type = (element.type || '').toLowerCase();
      if (['email', 'password', 'url', 'number', 'file', 'color', 'date', 'checkbox', 'radio', 'hidden', 'range', 'search'].includes(type)) {
        return true;
      }
    }

    // Explicit exclusions via attributes or class/id names
    if (element.getAttribute && (
        element.getAttribute('data-no-krutidev') === 'true' || 
        element.getAttribute('data-english-only') === 'true')) {
      return true;
    }

    if (element.classList && (
        element.classList.contains('no-krutidev') ||
        element.classList.contains('canvas-search-input'))) {
      return true;
    }

    const nameOrId = ((element.name || '') + ' ' + (element.id || '') + ' ' + (element.className || '')).toLowerCase();
    if (/email|password|slug|url|search|code|token|key|english|canvas/.test(nameOrId)) {
      return true;
    }

    return false;
  };

  // Attach active document-level keypress & paste handlers when typingFont === 'krutidev'
  useEffect(() => {
    if (typingFont !== 'krutidev') return;

    const handleKeyDown = (e) => {
      // 1. Preserve native keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+Z, Ctrl+A, Ctrl+X, Cmd+..., Alt+...)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // 2. Ignore control keys (Backspace, Tab, Enter, Escape, Arrow keys, Shift, etc.)
      if (e.key.length !== 1) return;

      const target = e.target;
      if (isExcludedInput(target)) return;

      const key = e.key;
      const devanagariChar = REMINGTON_KEYMAP[key];
      if (!devanagariChar) return;

      // Prevent raw English character from appearing
      e.preventDefault();

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        const val = target.value;

        let insertChar = devanagariChar;
        let replaceStart = start;
        if (start > 0 && start === end) {
          const prevChar = val.charAt(start - 1);
          if (prevChar === 'ा' && key === 's') {
            insertChar = 'ो';
            replaceStart = start - 1;
          } else if (prevChar === 'ा' && key === 'S') {
            insertChar = 'ौ';
            replaceStart = start - 1;
          }
        }

        const newVal = val.slice(0, replaceStart) + insertChar + val.slice(end);

        // React controlled input setter trigger
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          target.tagName === 'INPUT' ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(target, newVal);
        } else {
          target.value = newVal;
        }

        const newCaretPos = start + devanagariChar.length;
        target.setSelectionRange(newCaretPos, newCaretPos);

        // Dispatch synthetic events so React component state updates
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (target.isContentEditable) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(devanagariChar);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    const handlePaste = (e) => {
      const target = e.target;
      if (isExcludedInput(target)) return;

      const pastedText = (e.clipboardData || window.clipboardData)?.getData('text/plain');
      if (!pastedText) return;

      // Safeguard: If pasted text is ALREADY Unicode Devanagari or standard English, DO NOT convert!
      if (!isKrutiDevText(pastedText)) {
        return;
      }

      const convertedText = convertUniversalHindiFont(pastedText, { font: 'Kruti Dev 010' });
      if (convertedText === pastedText) return;

      e.preventDefault();

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        const val = target.value;

        const newVal = val.slice(0, start) + convertedText + val.slice(end);

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          target.tagName === 'INPUT' ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(target, newVal);
        } else {
          target.value = newVal;
        }

        const newCaretPos = start + convertedText.length;
        target.setSelectionRange(newCaretPos, newCaretPos);

        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (target.isContentEditable) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(convertedText);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('paste', handlePaste, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('paste', handlePaste, true);
    };
  }, [typingFont]);

  return (
    <FontContext.Provider
      value={{
        typingFont,
        setTypingFont,
        toggleTypingFont,
        isKrutiDev: typingFont === 'krutidev',
        remingtonKeymap: REMINGTON_KEYMAP,
        isExcludedInput
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFontPreference() {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFontPreference must be used within a FontProvider');
  }
  return context;
}
