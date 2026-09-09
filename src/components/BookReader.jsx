import React, { useState, useEffect, useRef } from 'react';
import './BookReader.css';

export default function BookReader({
  title = '',
  content = '',
  author = "गुरुप्रताप शर्मा 'आग'",
  collection = 'काव्य संग्रह: अग्नि कलश',
  year = '१९८५',
  chapter = 'अध्याय १',
  part = 'भाग १',
  audioUrl = null
}) {
  // Convert English digits to Hindi Devanagari numerals
  const toHindiNumerals = (num) => {
    const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(num).replace(/[0-9]/g, (w) => hindiDigits[+w]);
  };

  // 1. DATABASE COMPATIBILITY ADAPTER
  // Automatically split plain string text into ~12 line pages if not already a structured page array
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
        if (currentChunk.length >= 12 || i === rawLines.length - 1) {
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
  const [theme, setTheme] = useState('parchment'); // 'parchment', 'night', 'ivory'
  const [fontSizeScale, setFontSizeScale] = useState(100); // 100%, 115%, 130%
  const [focusActive, setFocusActive] = useState(false);
  const [showToc, setShowToc] = useState(false);
  const [animClass, setAnimClass] = useState('turning-sheet');
  const [audioPlaying, setAudioPlaying] = useState(false);

  const audioRef = useRef(null);
  const bookStageRef = useRef(null);

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

  // Web Audio API Synthetic Paper Sound
  const playPaperSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const bufferSize = ctx.sampleRate * 0.16;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  };

  const turnPage = (dir) => {
    const step = 1; // Strictly one page at a time
    const maxIdx = totalPages - 1;
    const nextIdx = currentIdx + dir * step;

    if (nextIdx < 0 || nextIdx > maxIdx) return;

    playPaperSound();
    setAnimClass('turning-sheet ' + (dir > 0 ? 'animate-corner-next' : 'animate-corner-prev'));

    setTimeout(() => {
      setCurrentIdx(nextIdx);
      setAnimClass('turning-sheet');
    }, 500);
  };

  const toggleUnifiedFocusMode = () => {
    const elem = bookStageRef.current;
    if (!focusActive) {
      if (elem && elem.requestFullscreen) elem.requestFullscreen();
      else if (elem && elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      setFocusActive(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setFocusActive(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFocusActive(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation & lock inside inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowRight') turnPage(1);
      if (e.key === 'ArrowLeft') turnPage(-1);
      if (e.key === 'Escape' && focusActive) setFocusActive(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, focusActive]);

  // Touch Swipe Gesture
  const touchStartXRef = useRef(0);
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartXRef.current - 40) turnPage(1);
    if (touchEndX > touchStartXRef.current + 40) turnPage(-1);
  };

  const shareStanzaWhatsApp = () => {
    const currentText = pages[currentIdx] || '';
    const shareText = `*${title || author}*\n\n"${currentText.trim()}"\n\n— ${author}\n\n📖 गुरुप्रताप शर्मा 'आग' डिजिटल साहित्य ग्रंथालय`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
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

  // Render left and right page contents
  const leftPageText = pages[currentIdx] || '';
  const rightPageText = pages[currentIdx + 1];

  return (
    <div className={`book-reader-root theme-${theme}`} style={{ fontSize: `${fontSizeScale}%` }}>
      
      {/* TOOLBAR CONTROLS ABOVE BOOK */}
      <div className="book-reader-top-controls">
        {/* Paper Themes */}
        <div className="theme-switcher">
          <span className="control-label">कागज़ रंग:</span>
          <button className={`theme-btn parchment ${theme === 'parchment' ? 'active' : ''}`} onClick={() => setTheme('parchment')} title="ऋषि ग्रंथ">📜 ग्रंथ</button>
          <button className={`theme-btn night ${theme === 'night' ? 'active' : ''}`} onClick={() => setTheme('night')} title="रात्रि ध्यान">🌙 रात्रि</button>
          <button className={`theme-btn ivory ${theme === 'ivory' ? 'active' : ''}`} onClick={() => setTheme('ivory')} title="शाही प्रपत्र">🏛️ शाही</button>
        </div>

        {/* Text Scaler */}
        <div className="font-scaler">
          <span className="control-label">अक्षर आकार:</span>
          <button className={`scale-btn ${fontSizeScale === 100 ? 'active' : ''}`} onClick={() => setFontSizeScale(100)}>सामान्य</button>
          <button className={`scale-btn ${fontSizeScale === 115 ? 'active' : ''}`} onClick={() => setFontSizeScale(115)}>बड़ा</button>
          <button className={`scale-btn ${fontSizeScale === 130 ? 'active' : ''}`} onClick={() => setFontSizeScale(130)}>विशाल</button>
        </div>

        {/* Table of Contents & Share */}
        <div className="utility-btns">
          <button className="util-btn" onClick={() => setShowToc(true)} title="अनुक्रमणिका खोलें">📑 अनुक्रमणिका</button>
          <button className="util-btn whatsapp-share" onClick={shareStanzaWhatsApp} title="व्हाट्सएप पर शेयर करें">📱 व्हाट्सएप शेयर</button>
        </div>
      </div>

      {/* 3D BOOK CONTAINER STAGE */}
      <div className="book-stage" ref={bookStageRef}>
        <div className="book-spread" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="book-spine-shadow"></div>

          {/* LEFT PAGE */}
          <div className="page left-page">
            <div className="page-head">
              <span>{author}</span>
              <span>{collection}</span>
            </div>

            <div className="page-body">
              {currentIdx === 0 && title && <div className="poem-title">{title}</div>}
              <div className="poem-stanzas">{leftPageText}</div>
            </div>

            <div className="page-foot">
              <button
                className="corner-nav-btn"
                onClick={() => turnPage(-1)}
                disabled={currentIdx === 0}
                title="पिछला पृष्ठ"
              >
                &larr;
              </button>
              <span className="page-num">पृष्ठ {toHindiNumerals(currentIdx + 1)}</span>
              <span className="chapter-tag">{chapter}</span>
            </div>
          </div>

          {/* RIGHT PAGE (DESKTOP) */}
          <div className="page right-page">
            <div className="page-head">
              <span>प्रकाशन वर्ष: {year}</span>
              <span className="counter-text">
                {rightPageText
                  ? `पृष्ठ ${toHindiNumerals(currentIdx + 1)} - ${toHindiNumerals(currentIdx + 2)} / ${toHindiNumerals(totalPages)}`
                  : `पृष्ठ ${toHindiNumerals(currentIdx + 1)} / ${toHindiNumerals(totalPages)}`}
              </span>
            </div>

            <div className="page-body">
              {rightPageText ? (
                <div className="poem-stanzas">{rightPageText}</div>
              ) : (
                <div className="poem-stanzas end-notice">
                  {"\n\n— समाप्त —\n(अग्नि कलश संस्करण)"}
                </div>
              )}
            </div>

            <div className="page-foot">
              <span className="chapter-tag">{part}</span>
              <span className="page-num">{rightPageText ? `पृष्ठ ${toHindiNumerals(currentIdx + 2)}` : '—'}</span>
              <button
                className="corner-nav-btn"
                onClick={() => turnPage(1)}
                disabled={currentIdx + (isMobile() ? 1 : 2) >= totalPages}
                title="अगला पृष्ठ"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* 3D TURNING PAGE ANIMATION LAYER */}
          <div className={animClass}>
            <div className="turning-sheet-front"></div>
            <div className="turning-sheet-back"></div>
          </div>
        </div>
      </div>

      {/* OPTIONAL RECITATION AUDIO PLAYER BAR */}
      {audioUrl && (
        <div className="book-audio-bar">
          <audio ref={audioRef} src={audioUrl} onEnded={() => setAudioPlaying(false)} />
          <button className="audio-play-btn" onClick={toggleAudio}>
            {audioPlaying ? '⏸️ विराम दें' : '▶️ काव्य पाठ सुनें (Listen Recitation)'}
          </button>
        </div>
      )}

      {/* UNIFIED FOCUS MODE BUTTON IN DOCK TOOLBAR */}
      <div className="outer-book-dock">
        <button className="unified-focus-dock-btn" onClick={toggleUnifiedFocusMode}>
          {focusActive ? '📖 ✖ सामान्य मोड (Exit Focus)' : '🎯 ⛶ एकाग्र मोड (Focus View)'}
        </button>
      </div>

      {/* TABLE OF CONTENTS MODAL (अनुक्रमणिका) */}
      {showToc && (
        <div className="toc-modal-overlay" onClick={() => setShowToc(false)}>
          <div className="toc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="toc-header">
              <h3>📑 अनुक्रमणिका (Table of Contents)</h3>
              <button className="toc-close-btn" onClick={() => setShowToc(false)}>✖</button>
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
                  <span className="toc-num">📄 पृष्ठ {toHindiNumerals(i + 1)}</span>
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
