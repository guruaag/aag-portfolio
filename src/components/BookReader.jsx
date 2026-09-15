import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderFormattedText } from '../utils/textFormatter';
import './BookReader.css';

export default function BookReader({
  title = '',
  content = '',
  author = "गुरुप्रताप शर्मा 'आग'",
  collection = 'प्रकाशित कृति',
  year = '१९८५',
  audioUrl = null,
  onBack = null
}) {
  const navigate = useNavigate();

  // Convert English digits to Hindi Devanagari numerals
  const toHindiNumerals = (num) => {
    const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(num).replace(/[0-9]/g, (w) => hindiDigits[+w]);
  };

  // Parse plain text or array into ~15 line pages
  const parsePages = (rawContent) => {
    if (Array.isArray(rawContent) && rawContent.length > 0) {
      return rawContent;
    }
    if (typeof rawContent === 'string' && rawContent.trim().length > 0) {
      const rawLines = rawContent.split('\n');
      const pages = [];
      let currentChunk = [];

      for (let i = 0; i < rawLines.length; i++) {
        currentChunk.push(rawLines[i]);
        if (currentChunk.length >= 15 || i === rawLines.length - 1) {
          pages.push(currentChunk.join('\n'));
          currentChunk = [];
        }
      }
      return pages.length > 0 ? pages : [rawContent];
    }
    return ['(कोई सामग्री नहीं)'];
  };

  const pages = parsePages(content);
  const totalPages = pages.length;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('reader_theme') || 'parchment');
  const [fontSizeScale, setFontSizeScale] = useState(() => {
    const saved = localStorage.getItem('reader_font_scale');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [showToc, setShowToc] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const audioRef = useRef(null);
  const bodyRef = useRef(null);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('reader_theme', newTheme);
  };

  const handleFontScaleChange = (newScale) => {
    setFontSizeScale(newScale);
    localStorage.setItem('reader_font_scale', String(newScale));
  };

  // Synthetic paper sound on page turn
  const playPaperSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const sr = ctx.sampleRate;
      const dur = 0.14;
      const buffer = ctx.createBuffer(1, Math.floor(sr * dur), sr);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      filter.Q.value = 2.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  };

  const turnPage = (dir) => {
    const nextIdx = currentIdx + dir;
    if (nextIdx < 0 || nextIdx >= totalPages) return;

    playPaperSound();
    setCurrentIdx(nextIdx);
    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') turnPage(1);
      if (e.key === 'ArrowLeft') turnPage(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, totalPages]);

  // Touch Swipe Gesture (horizontal threshold 45px)
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.changedTouches[0].screenX;
    touchStartYRef.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const dx = touchEndX - touchStartXRef.current;
    const dy = touchEndY - touchStartYRef.current;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
      if (dx < 0) turnPage(1);
      else turnPage(-1);
    }
  };

  const shareWhatsApp = () => {
    const currentText = pages[currentIdx] || '';
    const shareText = `*${title || author}*\n\n"${currentText.trim()}"\n\n— ${author}\n\nगुरुप्रताप शर्मा 'आग' डिजिटल साहित्य ग्रंथालय`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  const progressPct = totalPages > 1 ? ((currentIdx + 1) / totalPages) * 100 : 100;
  const currentText = pages[currentIdx] || '';

  return (
    <div className={`book-reader-root theme-${theme}`} style={{ fontSize: `${fontSizeScale}%` }}>
      
      {/* AMBER READING PROGRESS BAR */}
      <div className="book-reader-progress" style={{ width: `${progressPct}%` }} aria-hidden="true" />

      {/* TOP HEADER & CONTROLS BAR */}
      <header className="book-reader-header">
        {/* Left: Back Button */}
        <button className="book-reader-back-btn" onClick={handleBack} title="वापस जाएं">
          ← वापस
        </button>

        {/* Center: Title & Collection */}
        <div className="book-reader-title-center">
          <h1 className="book-reader-title">{title}</h1>
          {collection && <span className="book-reader-collection">{collection}</span>}
        </div>

        {/* Right: Controls (Theme, Font, Share) */}
        <div className="book-reader-controls-right">
          <div className="theme-switcher">
            <button className={`theme-btn parchment ${theme === 'parchment' ? 'active' : ''}`} onClick={() => handleThemeChange('parchment')} title="ग्रंथ थीम">ग्रंथ</button>
            <button className={`theme-btn night ${theme === 'night' ? 'active' : ''}`} onClick={() => handleThemeChange('night')} title="रात्रि थीम">रात्रि</button>
            <button className={`theme-btn ivory ${theme === 'ivory' ? 'active' : ''}`} onClick={() => handleThemeChange('ivory')} title="शाही थीम">शाही</button>
          </div>

          <div className="font-scaler">
            <button className={`scale-btn ${fontSizeScale === 100 ? 'active' : ''}`} onClick={() => handleFontScaleChange(100)}>अ</button>
            <button className={`scale-btn ${fontSizeScale === 115 ? 'active' : ''}`} onClick={() => handleFontScaleChange(115)}>अ+</button>
          </div>

          <button className="util-btn whatsapp-share" onClick={shareWhatsApp} title="शेयर करें">
            शेयर
          </button>
        </div>
      </header>

      {/* READING CANVAS STAGE */}
      <main 
        className="book-stage"
        ref={bodyRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="book-page-canvas">
          <div className="book-content-text">
            {renderFormattedText(currentText)}
          </div>
        </div>
      </main>

      {/* RECITATION AUDIO PLAYER BAR (IF AVAILABLE) */}
      {audioUrl && (
        <div className="book-audio-bar">
          <audio ref={audioRef} src={audioUrl} onEnded={() => setAudioPlaying(false)} />
          <button className="audio-play-btn" onClick={toggleAudio}>
            {audioPlaying ? ' विराम दें' : ' काव्य पाठ सुनें (Listen)'}
          </button>
        </div>
      )}

      {/* BOTTOM PAGE NAVIGATION (STANDARDIZED BADGE + PADDING) */}
      {totalPages > 1 && (
        <footer className="book-reader-footer">
          <button
            className="book-page-btn"
            onClick={() => turnPage(-1)}
            disabled={currentIdx === 0}
            aria-label="पिछला पृष्ठ"
          >
            ← पिछला पृष्ठ
          </button>

          <div className="book-badge-center">
            <span className="book-badge-text">
              {toHindiNumerals(currentIdx + 1)} / {toHindiNumerals(totalPages)} · {author}
            </span>
          </div>

          <button
            className="book-page-btn"
            onClick={() => turnPage(1)}
            disabled={currentIdx >= totalPages - 1}
            aria-label="अगला पृष्ठ"
          >
            अगला पृष्ठ →
          </button>
        </footer>
      )}

      {/* TABLE OF CONTENTS MODAL */}
      {showToc && (
        <div className="toc-modal-overlay" onClick={() => setShowToc(false)}>
          <div className="toc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="toc-header">
              <h3>अनुक्रमणिका (Table of Contents)</h3>
              <button className="toc-close-btn" onClick={() => setShowToc(false)}>✕</button>
            </div>
            <div className="toc-list">
              {pages.map((pText, i) => (
                <div
                  key={i}
                  className={`toc-item ${i === currentIdx ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentIdx(i);
                    setShowToc(false);
                  }}
                >
                  <span className="toc-num">पृष्ठ {toHindiNumerals(i + 1)}</span>
                  <span className="toc-snippet">{pText.trim().substring(0, 35)}...</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
