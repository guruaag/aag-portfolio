import React, { useState, useEffect } from 'react';
import './PM5WritingDesk.css';

export default function PM5WritingDesk({ initialPages = [''], onSave = null, initialTitle = '', lang = 'hi' }) {
  const MAX_EFFECTIVE_LINES = 12;
  const CHARS_PER_LINE = 36;
  const isEn = lang === 'en' || lang === 'EN';

  const toHindiNumerals = (num) => {
    if (isEn) return String(num);
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
      alert(isEn ? 'At least one page is required!' : 'कम से कम एक पृष्ठ रहना आवश्यक है!');
      return;
    }
    const confirmMsg = isEn ? `Delete Page ${idx + 1}?` : `क्या आप पृष्ठ ${toHindiNumerals(idx + 1)} हटाना चाहते हैं?`;
    if (window.confirm(confirmMsg)) {
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
      
      {/* Top Bar with Undo / Redo (Type="button" explicitly set to prevent form submission) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
        <button type="button" className="pm5-undo-btn" onClick={handleUndo} disabled={historyPointer === 0} title={isEn ? 'Undo (Ctrl+Z)' : 'पूर्ववत करें (Ctrl+Z)'}>
          ↩️ {isEn ? 'Undo' : 'पूर्ववत (Undo)'}
        </button>
        <button type="button" className="pm5-undo-btn" onClick={handleRedo} disabled={historyPointer === history.length - 1} title={isEn ? 'Redo (Ctrl+Y)' : 'पुनः करें (Ctrl+Y)'}>
          ↪️ {isEn ? 'Redo' : 'पुनः (Redo)'}
        </button>
      </div>

      {/* CANVAS GRID */}
      <div className="pm5-canvas-grid">
        
        {/* LEFT PAGE THUMBNAILS SIDEBAR */}
        <div className="pm5-sidebar-pages">
          <div className="pm5-sidebar-title">
            📄 {isEn ? 'Pages Navigation' : 'पृष्ठ सूची'}
          </div>

          {pages.map((pText, i) => (
            <div
              key={i}
              className={`pm5-thumb-card ${i === activeIdx ? 'active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <div className="pm5-thumb-actions">
                <span className="pm5-action-btn move" onClick={(e) => movePage(e, i, -1)} title={isEn ? 'Move Up' : 'ऊपर ले जाएं'}>⬆️</span>
                <span className="pm5-action-btn move" onClick={(e) => movePage(e, i, 1)} title={isEn ? 'Move Down' : 'नीचे ले जाएं'}>⬇️</span>
                <span className="pm5-action-btn delete" onClick={(e) => deletePage(e, i)} title={isEn ? 'Delete Page' : 'पृष्ठ हटाएं'}>🗑️</span>
              </div>
              <div className="pm5-thumb-num">
                📄 {isEn ? `Page ${i + 1}` : `पृष्ठ ${toHindiNumerals(i + 1)}`} {i === activeIdx ? (isEn ? '(Active)' : '(सक्रिय)') : ''}
              </div>
              <div className="pm5-thumb-preview">{pText.trim() ? pText.substring(0, 26) + '...' : (isEn ? '(Empty Page)' : '(खाली पृष्ठ)')}</div>
            </div>
          ))}

          <button type="button" className="pm5-sidebar-add-btn" onClick={addNewPage}>
            + {isEn ? 'Add New Page' : 'नया पृष्ठ जोड़ें'}
          </button>

          {onSave && (
            <button type="button" className="pm5-publish-btn" onClick={() => onSave(pages, title)}>
              ✓ {isEn ? 'Save & Apply Canvas' : 'सहेजें और लागू करें'}
            </button>
          )}
        </div>

        {/* CENTERED PAGEMAKER PAPER SHEET */}
        <div className="pm5-canvas-area">
          <div className="pm5-sheet">
            <div className="pm5-margin-guide" title="Page Margin Bounds (DTP Bounds)"></div>

            <div className="pm5-sheet-header">
              — {isEn ? `PAGE ${activeIdx + 1} CANVAS` : `पृष्ठ ${toHindiNumerals(activeIdx + 1)}`} —
            </div>

            {/* Poem Title Input */}
            <input
              type="text"
              className="pm5-editor-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEn ? 'Enter title here...' : 'यहाँ शीर्षक लिखें...'}
            />

            {/* Textarea with Paste Auto-Flow */}
            <textarea
              id="pm5ActiveTextarea"
              className="pm5-editor-textarea"
              value={currentText}
              onChange={(e) => updatePageContent(e.target.value)}
              onPaste={handlePasteAutoFlow}
              placeholder={isEn ? 'Write or paste poem verses here...' : 'यहाँ कविता लिखें या पेस्ट करें...'}
            />

            {/* Bottom Status Bar */}
            <div className="pm5-sheet-footer">
              <span>{isEn ? 'Effective lines:' : 'प्रभावी पंक्तियां:'} <strong>{toHindiNumerals(currentLinesCount)} / {toHindiNumerals(MAX_EFFECTIVE_LINES)}</strong></span>
              <span className={`limit-status ${currentLinesCount > MAX_EFFECTIVE_LINES ? 'exceeded' : 'safe'}`}>
                {currentLinesCount > MAX_EFFECTIVE_LINES 
                  ? (isEn ? '⛔ Page limit reached' : '⛔ पृष्ठ सीमा पूर्ण!') 
                  : (isEn ? '✓ Safe bounds' : '✓ सीमा के भीतर')}
              </span>
              <span>{isEn ? `Page ${activeIdx + 1}` : `पृष्ठ ${toHindiNumerals(activeIdx + 1)}`}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
