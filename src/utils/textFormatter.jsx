import React from 'react';

/**
 * Handles Cmd+B (Bold) and Cmd+I (Italic) keyboard shortcuts on textareas.
 */
export function handleFormattingShortcut(e, textValue, updateValue) {
  const isCmdOrCtrl = e.metaKey || e.ctrlKey;
  if (!isCmdOrCtrl) return false;

  const key = e.key.toLowerCase();
  if (key !== 'b' && key !== 'i') return false;

  e.preventDefault();
  const target = e.target;
  const start = target.selectionStart ?? 0;
  const end = target.selectionEnd ?? 0;
  const current = textValue || '';

  const selectedText = current.substring(start, end);
  const wrapper = key === 'b' ? '**' : '*';

  const newText =
    current.substring(0, start) +
    `${wrapper}${selectedText || (key === 'b' ? 'Bold Text' : 'Italic Text')}${wrapper}` +
    current.substring(end);

  updateValue(newText);

  // Restore cursor position inside the wrapper
  setTimeout(() => {
    if (target.setSelectionRange) {
      const newCursorPos = selectedText
        ? end + wrapper.length * 2
        : start + wrapper.length;
      target.setSelectionRange(newCursorPos, newCursorPos);
    }
  }, 0);

  return true;
}

/**
 * Renders text containing line breaks, bold (**text** or <b>text</b>), and italics (*text* or <i>text</i>) safely.
 */
export function renderFormattedText(content) {
  if (!content) return null;
  if (typeof content !== 'string') return content;

  // Split into lines first to preserve line breaks
  const lines = content.split('\n');

  return lines.map((line, lineIdx) => {
    // Parse inline bold (**bold**) and italic (*italic*) or standard <b>/<i> tags
    const parts = parseInlineFormatting(line);

    return (
      <React.Fragment key={lineIdx}>
        {parts}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function parseInlineFormatting(text) {
  if (!text) return [];

  // Regex to tokenize markdown bold (**text**), markdown italic (*text*), <b>text</b>, <i>text</i>, <strong>text</strong>, <em>text</em>
  const regex = /(\*\*.*?\*\*|\*.*?\*|<b>.*?<\/b>|<i>.*?<\/i>|<strong>.*?<\/strong>|<em>.*?<\/em>)/g;
  const tokens = text.split(regex);

  return tokens.map((token, idx) => {
    if (!token) return null;

    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return <strong key={`b-${idx}`}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 3) {
      return <em key={`i-${idx}`}>{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('<b>') && token.endsWith('</b>')) {
      return <strong key={`b-html-${idx}`}>{token.slice(3, -4)}</strong>;
    }
    if (token.startsWith('<strong>') && token.endsWith('</strong>')) {
      return <strong key={`str-${idx}`}>{token.slice(8, -9)}</strong>;
    }
    if (token.startsWith('<i>') && token.endsWith('</i>')) {
      return <em key={`i-html-${idx}`}>{token.slice(3, -4)}</em>;
    }
    if (token.startsWith('<em>') && token.endsWith('</em>')) {
      return <em key={`em-${idx}`}>{token.slice(4, -5)}</em>;
    }

    return <React.Fragment key={`txt-${idx}`}>{token}</React.Fragment>;
  });
}
