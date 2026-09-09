import React, { useState, useEffect } from 'react';
import './PM5WritingDesk.css';

export default function PM5WritingDesk({ initialPages = [''], onSave = null, initialTitle = '' }) {
  const MAX_EFFECTIVE_LINES = 12;
  const CHARS_PER_LINE = 36;

  const toHindiNumerals = (num) => {
    const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(num).replace(/[0-9]/g, (w) => hindiDigits[+w]);
  };

  const [pages, setPages] = useState(() => {
    if (Array.isArray(initialPages) && initialPages.length > 0) return initialPages;
    if (typeof initialPages === 'string' && initialPages.trim()) return [initialPages];
    return [''];
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [title, setTitle] = useState(initialTitle);
  const [saveBadgeText, setSaveBadgeText] = useState('✓ स्वतः सहेजा गया (Auto-saved)');
  const [saveBadgeStatus, setSaveBadgeStatus] = useState('success'); // 'success', 'saving'

  // Undo / Redo History Stack
  const [history, setHistory] = useState([pages]);
  const [historyPointer, setHistoryPointer] = useState(0);

  const pushHistory = (newPages) => {
    const nextHistory = history.slice(0, historyPointer + 1);
    nextHistory.push(newPages);
    setHistory(nextHistory);
    setHistoryPointer(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevPages = history[historyPointer - 1];
      setHistoryPointer(historyPointer - 1);
      setPages(prevPages);
      setActiveIdx(Math.min(activeIdx, prevPages.length - 1));
    }
  };

  const handleRedo = () => {
    if (historyPointer < history.length - 1) {
      const nextPages = history[historyPointer + 1];
      setHistoryPointer(historyPointer + 1);
      setPages(nextPages);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyPointer, history, activeIdx]);

  // Insert Devanagari Symbols into current textarea at cursor position
  const insertSymbol = (symbol) => {
    const textarea = document.getElementById('pm5ActiveTextarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = pages[activeIdx] || '';
    const newText = currentText.substring(0, start) + symbol + currentText.substring(end);

    updatePageContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 50);
  };

  const updatePageContent = (text) => {
    const rawLines = text.split('\n');
    let totalEffectiveLines = 0;
    let trimmedLines = [];

    for (let line of rawLines) {
      let visualLinesNeeded = Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));
      if (totalEffectiveLines + visualLinesNeeded <= MAX_EFFECTIVE_LINES) {
        totalEffectiveLines += visualLinesNeeded;
        trimmedLines.push(line);
      } else {
        let allowedChars = (MAX_EFFECTIVE_LINES - totalEffectiveLines) * CHARS_PER_LINE;
        if (allowedChars > 0) {
          trimmedLines.push(line.substring(0, allowedChars));
        }
        break;
      }
    }

    const finalString = trimmedLines.join('\n');
    const updatedPages = [...pages];
    updatedPages[activeIdx] = finalString;

    setPages(updatedPages);
    pushHistory(updatedPages);
    triggerAutoSave(updatedPages);
  };

  const handlePasteAutoFlow = (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const lines = pastedText.split('\n');

    let pageChunks = [];
    let lineChunk = [];

    for (let i = 0; i < lines.length; i++) {
      lineChunk.push(lines[i]);
      if (lineChunk.length >= MAX_EFFECTIVE_LINES || i === lines.length - 1) {
        pageChunks.push(lineChunk.join('\n'));
        lineChunk = [];
      }
    }

    setPages(pageChunks);
    setActiveIdx(0);
    pushHistory(pageChunks);
    triggerAutoSave(pageChunks);
    alert(`✅ आपकी लम्बी कविता स्वतः ${toHindiNumerals(pageChunks.length)} पृष्ठों में विभाजित कर दी गई है!`);
  };

  const triggerAutoSave = (currentPages) => {
    setSaveBadgeStatus('saving');
    setSaveBadgeText('✍️ सहेजा जा रहा है...');

    setTimeout(() => {
      try {
        localStorage.setItem('aag_pm5_draft_pages', JSON.stringify(currentPages));
      } catch (e) {}
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSaveBadgeStatus('success');
      setSaveBadgeText(`✓ स्वतः सहेजा गया ${timeStr}`);
    }, 600);
  };

  const addNewPage = () => {
    const updated = [...pages, ''];
    setPages(updated);
    setActiveIdx(updated.length - 1);
    pushHistory(updated);
  };

  const deletePage = (e, idx) => {
    e.stopPropagation();
    if (pages.length <= 1) {
      alert('कम से कम एक पृष्ठ रहना आवश्यक है!');
      return;
    }
    if (window.confirm(`क्या आप पृष्ठ ${toHindiNumerals(idx + 1)} हटाना चाहते हैं?`)) {
      const updated = pages.filter((_, i) => i !== idx);
      setPages(updated);
      setActiveIdx(Math.max(0, idx - 1));
      pushHistory(updated);
    }
  };

  const movePage = (e, idx, dir) => {
    e.stopPropagation();
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= pages.length) return;

    const updated = [...pages];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    setPages(updated);
    setActiveIdx(targetIdx);
    pushHistory(updated);
  };

  const currentText = pages[activeIdx] || '';
  const currentLinesCount = currentText ? currentText.split('\n').length : 0;

  return (
    <div className="pm5-desk-root">
      
      {/* PM5 TOOLBAR */}
      <div className="pm5-top-toolbar">
        <div className="pm5-title-area">
          <strong className="pm5-brand-title">🖋️ पेजमेकर (PM5) राइटिंग कैनवस V8</strong>
          <span className="pm5-subtitle-tag">(DTP Grid, Dynamic Thumbnails & Hindi Toolbar)</span>
        </div>

        {/* Undo / Redo Controls */}
        <div className="pm5-undo-controls">
          <button className="pm5-undo-btn" onClick={handleUndo} disabled={historyPointer === 0} title="पूर्ववत करें (Undo Ctrl+Z)">
            ↩️ Undo
          </button>
          <button className="pm5-undo-btn" onClick={handleRedo} disabled={historyPointer === history.length - 1} title="पुनः करें (Redo Ctrl+Y)">
            ↪️ Redo
          </button>
        </div>

        <div className={`pm5-autosave-badge ${saveBadgeStatus}`}>
          {saveBadgeText}
        </div>
      </div>

      {/* DEVANAGARI SYMBOLS ACCENT TOOLBAR */}
      <div className="pm5-symbols-bar">
        <span className="symbol-label">हिंदी चिह्न सहायिका (Hindi Punctuation):</span>
        <button className="symbol-btn" onClick={() => insertSymbol('।')} title="पूर्ण विराम">। पूर्ण विराम</button>
        <button className="symbol-btn" onClick={() => insertSymbol('॥')} title="दीर्घ विराम">॥ दीर्घ विराम</button>
        <button className="symbol-btn" onClick={() => insertSymbol('‘')} title="उद्धरण प्रारंभ">‘</button>
        <button className="symbol-btn" onClick={() => insertSymbol('’')} title="उद्धरण अंत">’</button>
        <button className="symbol-btn" onClick={() => insertSymbol('ॐ')} title="ॐ ओम्">ॐ</button>
        <button className="symbol-btn" onClick={() => insertSymbol('🔥')} title="आग मुहर signature">🔥 आग</button>
      </div>

      {/* CANVAS GRID */}
      <div className="pm5-canvas-grid">
        
        {/* LEFT PAGE THUMBNAILS SIDEBAR */}
        <div className="pm5-sidebar-pages">
          <div className="pm5-sidebar-title">📑 पृष्ठ सूची (Pages Nav)</div>

          {pages.map((pText, i) => (
            <div
              key={i}
              className={`pm5-thumb-card ${i === activeIdx ? 'active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <div className="pm5-thumb-actions">
                <span className="pm5-action-btn move" onClick={(e) => movePage(e, i, -1)} title="ऊपर ले जाएं">⬆️</span>
                <span className="pm5-action-btn move" onClick={(e) => movePage(e, i, 1)} title="नीचे ले जाएं">⬇️</span>
                <span className="pm5-action-btn delete" onClick={(e) => deletePage(e, i)} title="पृष्ठ हटाएं">🗑️</span>
              </div>
              <div className="pm5-thumb-num">📄 पृष्ठ {toHindiNumerals(i + 1)} {i === activeIdx ? '(सक्रिय)' : ''}</div>
              <div className="pm5-thumb-preview">{pText.trim() ? pText.substring(0, 26) + '...' : '(खाली पृष्ठ)'}</div>
            </div>
          ))}

          <button className="pm5-sidebar-add-btn" onClick={addNewPage}>➕ नया पृष्ठ जोड़ें</button>

          {onSave && (
            <button className="pm5-publish-btn" onClick={() => onSave(pages, title)}>
              ✅ सहेजें और प्रकाशित करें
            </button>
          )}
        </div>

        {/* CENTERED PAGEMAKER PAPER SHEET */}
        <div className="pm5-canvas-area">
          <div className="pm5-sheet">
            <div className="pm5-margin-guide" title="Page Margin Bounds (DTP Bounds)"></div>

            <div className="pm5-sheet-header">
              — पृष्ठ {toHindiNumerals(activeIdx + 1)} (PAGE {activeIdx + 1} CANVAS) —
            </div>

            {/* Poem Title Input */}
            <input
              type="text"
              className="pm5-editor-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="यहाँ शीर्षक लिखें..."
            />

            {/* Textarea with Paste Auto-Flow */}
            <textarea
              id="pm5ActiveTextarea"
              className="pm5-editor-textarea"
              value={currentText}
              onChange={(e) => updatePageContent(e.target.value)}
              onPaste={handlePasteAutoFlow}
              placeholder="यहाँ कविता लिखें या पेस्ट करें..."
            />

            {/* Bottom Status Bar */}
            <div className="pm5-sheet-footer">
              <span>प्रभावी पंक्तियां: <strong>{toHindiNumerals(currentLinesCount)} / {toHindiNumerals(MAX_EFFECTIVE_LINES)}</strong></span>
              <span className={`limit-status ${currentLinesCount > MAX_EFFECTIVE_LINES ? 'exceeded' : 'safe'}`}>
                {currentLinesCount > MAX_EFFECTIVE_LINES ? '⛔ पृष्ठ सीमा पूर्ण!' : '✓ सीमा के भीतर (Safe Line Bounds)'}
              </span>
              <span>पृष्ठ {toHindiNumerals(activeIdx + 1)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
