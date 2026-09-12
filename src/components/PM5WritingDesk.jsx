import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './PM5WritingDesk.css';

export function paginateTextIntoPages(fullText, linesPerPage = 20) {
  if (!fullText || !fullText.trim()) return [''];
  const rawLines = fullText.split('\n');
  const pages = [];
  let currentPageLines = [];

  for (let line of rawLines) {
    currentPageLines.push(line);
    if (currentPageLines.length >= linesPerPage) {
      pages.push(currentPageLines.join('\n'));
      currentPageLines = [];
    }
  }

  if (currentPageLines.length > 0) {
    pages.push(currentPageLines.join('\n'));
  }

  return pages.length > 0 ? pages : [''];
}

export default function PM5WritingDesk({ initialPages = [''], onSave = null, onClose = null, initialTitle = '', lang = 'hi', initialFullscreen = false }) {
  const isEn = lang === 'en' || lang === 'EN';

  const toHindiNumerals = (num) => {
    if (isEn) return String(num);
    const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(num).replace(/[0-9]/g, (w) => hindiDigits[+w]);
  };

  const [pages, setPages] = useState(() => {
    if (Array.isArray(initialPages) && initialPages.length > 0) return initialPages;
    if (typeof initialPages === 'string' && initialPages.trim()) return paginateTextIntoPages(initialPages, 20);
    return [''];
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [title, setTitle] = useState(initialTitle);
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // '' | 'saving' | 'saved'

  const handleExitDesk = () => {
    setIsFullscreen(false);
    if (onClose) onClose();
  };

  // Ref to track component mount
  const isInitialMount = useRef(true);

  // Body Scroll Lock for Fullscreen Portal
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  // Debounced Auto-Save Effect (2 seconds)
  useEffect(() => {
    if (!isDirty) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      if (onSave) {
        onSave(pages, title);
      }
      setIsDirty(false);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pages, title, isDirty, onSave]);

  // Fullscreen Keyboard Listener (Escape key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleExitDesk();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // History Stack for Undo/Redo
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
      setIsDirty(true);
    }
  };

  const handleRedo = () => {
    if (historyPointer < history.length - 1) {
      const nextPages = history[historyPointer + 1];
      setHistoryPointer(historyPointer + 1);
      setPages(nextPages);
      setIsDirty(true);
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

  // Strict 20-line Dynamic Auto-Pagination
  const updatePageContent = (text) => {
    const lines = text.split('\n');
    const MAX_LINES = 20;

    if (lines.length > MAX_LINES) {
      const page1Lines = lines.slice(0, MAX_LINES);
      const overflowLines = lines.slice(MAX_LINES);

      const updatedPages = [...pages];
      updatedPages[activeIdx] = page1Lines.join('\n');

      if (activeIdx + 1 < updatedPages.length) {
        const nextText = updatedPages[activeIdx + 1];
        const combined = overflowLines.join('\n') + (nextText ? '\n' + nextText : '');
        updatedPages[activeIdx + 1] = combined;
      } else {
        updatedPages.splice(activeIdx + 1, 0, overflowLines.join('\n'));
      }

      setPages(updatedPages);
      pushHistory(updatedPages);
      setIsDirty(true);
      setActiveIdx(activeIdx + 1);
      return;
    }

    const updatedPages = [...pages];
    updatedPages[activeIdx] = text;
    setPages(updatedPages);
    pushHistory(updatedPages);
    setIsDirty(true);
  };

  // Manual Page Break Button Handler
  const handlePageBreak = () => {
    const textarea = document.getElementById('pm5ActiveTextarea');
    const updatedPages = [...pages];
    
    if (textarea && typeof textarea.selectionStart === 'number') {
      const start = textarea.selectionStart;
      const current = pages[activeIdx] || '';
      
      const textBefore = current.substring(0, start);
      const textAfter = current.substring(start);
      
      updatedPages[activeIdx] = textBefore;
      updatedPages.splice(activeIdx + 1, 0, textAfter);
      
      setPages(updatedPages);
      pushHistory(updatedPages);
      setIsDirty(true);
      setActiveIdx(activeIdx + 1);
    } else {
      addNewPage();
    }
  };

  const handlePasteAutoFlow = (e) => {
    const pastedText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    if (!pastedText) return;

    const rawLines = pastedText.split('\n');

    if (rawLines.length > 20) {
      e.preventDefault();
      const paginatedPastedPages = paginateTextIntoPages(pastedText, 20);
      
      const newPages = [...pages];
      newPages.splice(activeIdx, 1, ...paginatedPastedPages);
      
      setPages(newPages);
      pushHistory(newPages);
      setIsDirty(true);
    }
  };

  const addNewPage = () => {
    const updated = [...pages, ''];
    setPages(updated);
    setActiveIdx(updated.length - 1);
    pushHistory(updated);
    setIsDirty(true);
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
      const newActive = Math.max(0, idx - 1);
      setActiveIdx(newActive);
      pushHistory(updated);
      setIsDirty(true);
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
    setIsDirty(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const currentText = pages[activeIdx] || '';
  const currentLinesCount = currentText ? currentText.split('\n').length : 0;

  const deskContent = (
    <div className={`pm5-desk-root ${isFullscreen ? 'pm5-fullscreen' : ''}`}>
      
      {/* Top Bar with Undo / Redo & Page Break & Fullscreen & AutoSave Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
        <div className="pm5-top-bar-info" style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>📐 {isEn ? 'Format: Max 20 Lines/Page • Auto-Flow & Line Wrap' : 'प्रारूप: अधिकतम २० पंक्तियाँ/पृष्ठ • स्वचालित पृष्ठ विभाजन'}</span>
          {autoSaveStatus === 'saving' && (
            <span className="pm5-autosave-badge saving">⏳ {isEn ? 'Saving...' : 'सहेजा जा रहा है...'}</span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="pm5-autosave-badge success">💾 {isEn ? 'Auto-saved' : 'स्वतः सहेजा गया'}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isFullscreen && (
            <button
              type="button"
              className="pm5-undo-btn"
              onClick={toggleFullscreen}
              title={isEn ? 'Distraction-Free Fullscreen' : 'डिस्ट्रेक्शन-फ्री पूर्ण स्क्रीन'}
            >
              ⛶ Fullscreen
            </button>
          )}
          <button type="button" className="pm5-undo-btn" onClick={handleUndo} disabled={historyPointer === 0} title={isEn ? 'Undo (Ctrl+Z)' : 'पूर्ववत करें (Ctrl+Z)'}>
            ↩️ {isEn ? 'Undo' : 'पूर्ववत'}
          </button>
          <button type="button" className="pm5-undo-btn" onClick={handleRedo} disabled={historyPointer === history.length - 1} title={isEn ? 'Redo (Ctrl+Y)' : 'पुनः करें (Ctrl+Y)'}>
            ↪️ {isEn ? 'Redo' : 'पुनः'}
          </button>
          <button type="button" className="pm5-undo-btn pm5-page-break-btn" onClick={handlePageBreak} title={isEn ? 'Insert Page Break' : 'मैनुअल पृष्ठ विभाजन'}>
            📄 {isEn ? 'Page Break' : 'पृष्ठ ब्रेक'}
          </button>
          {isFullscreen && (
            <button
              type="button"
              className="pm5-undo-btn pm5-exit-fullscreen-toolbar-btn"
              onClick={handleExitDesk}
              title={isEn ? 'Exit Fullscreen (Esc)' : 'पूर्ण स्क्रीन बंद करें (Esc)'}
            >
              ✕ {isEn ? 'Exit Fullscreen' : 'पूर्ण स्क्रीन बंद करें'}
            </button>
          )}
        </div>
      </div>

      {/* CANVAS GRID */}
      <div className="pm5-canvas-grid">
        
        {/* LEFT PAGE THUMBNAILS SIDEBAR */}
        <div className="pm5-sidebar-pages">
          <div className="pm5-sidebar-title">
            📄 {isEn ? 'Pages Navigation' : 'पृष्ठ सूची'}
          </div>

          {/* Sticky Save & Apply Bar Pinned Directly Below Header */}
          {onSave && (
            <div className="pm5-sticky-save-bar">
              <button
                type="button"
                className="pm5-publish-btn"
                onClick={() => {
                  onSave(pages, title);
                  setIsDirty(false);
                  setAutoSaveStatus('saved');
                  alert(isEn ? '✓ Canvas saved & applied to full verse text!' : '✓ कैनवस सफलतापूर्वक सहेजा गया!');
                }}
              >
                💾 {isEn ? 'Save & Apply Canvas' : 'सहेजें और लागू करें'}
              </button>
            </div>
          )}

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
        </div>

        {/* CENTERED PAGEMAKER PAPER SHEET */}
        <div className="pm5-canvas-area">
          <div className="pm5-sheet">
            <div className="pm5-margin-guide" title="Page Margin Bounds (DTP Bounds)"></div>

            <div className="pm5-sheet-header">
              — {isEn ? `PAGE ${activeIdx + 1} CANVAS (MAX 20 LINES)` : `पृष्ठ ${toHindiNumerals(activeIdx + 1)} (अधिकतम २० पंक्तियाँ)`} —
            </div>

            {/* Poem Title Input */}
            <input
              type="text"
              className="pm5-editor-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
              }}
              placeholder={isEn ? 'Enter title here...' : 'यहाँ शीर्षक लिखें...'}
            />

            {/* Textarea with Paste & Auto-Flow 20-Line Limit */}
            <textarea
              id="pm5ActiveTextarea"
              className="pm5-editor-textarea"
              value={currentText}
              onChange={(e) => updatePageContent(e.target.value)}
              onPaste={handlePasteAutoFlow}
              placeholder={isEn ? 'Write or paste poem verses here (Max 20 lines/page)...' : 'यहाँ कविता लिखें या पेस्ट करें (अधिकतम २० पंक्तियाँ/पृष्ठ)...'}
            />

            {/* Bottom Status Bar */}
            <div className="pm5-sheet-footer">
              <span>{isEn ? 'Page lines:' : 'कुल पंक्तियाँ:'} <strong className={currentLinesCount >= 20 ? 'limit-status exceeded' : 'limit-status safe'}>{toHindiNumerals(currentLinesCount)} / {toHindiNumerals(20)}</strong></span>
              <span>{isEn ? 'Characters:' : 'कुल अक्षर:'} <strong>{toHindiNumerals(currentText.length)}</strong></span>
              <span>{isEn ? `Page ${activeIdx + 1}` : `पृष्ठ ${toHindiNumerals(activeIdx + 1)}`}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );

  if (isFullscreen) {
    return createPortal(deskContent, document.body);
  }

  return deskContent;
}
