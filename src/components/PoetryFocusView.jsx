import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { sanitizeText } from '../lib/dataSanitizer'
import { renderFormattedText } from '../utils/textFormatter'
import './PoetryFocusView.css'

/* ─────────────────────────────────────────────────────
   PoetryFocusView — immersive full-screen poem reader

   Design principles
   • Card occupies full viewport height
   • Header: [spacer] [title] [✕ close]
   • Footer: [← prev page] [page# + author] [next page →]
   • Footer hidden when poem fits on one page
   • Top amber progress bar shows page position
   • Swipe left/right to turn pages (ref-based nudge,
     no React state conflict with Framer Motion)
   • Web Audio paper-turn sound on every page change
   • Keyboard: ← → to turn, Esc to close
   ───────────────────────────────────────────────────── */

// ── Synthetic paper-turn sound via Web Audio API ──────
function playPaperSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const sr = ctx.sampleRate
    const dur = 0.13
    const buf = ctx.createBuffer(1, Math.floor(sr * dur), sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      // White noise with sharp exponential decay
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.22))
    }

    const src = ctx.createBufferSource()
    src.buffer = buf

    // Bandpass — cuts lows and highs, keeps papery mid crinkle
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 2.5

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.22, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    src.start()
  } catch (_) {/* Silent fail — audio is non-critical */}
}

// ── Parse poem string into pages of ≤20 lines ─────────
function parsePages(raw) {
  if (Array.isArray(raw) && raw.length > 0) return raw
  if (typeof raw === 'string' && raw.trim()) {
    const lines = raw.split('\n')
    const pages = []
    let chunk = []
    for (let i = 0; i < lines.length; i++) {
      chunk.push(lines[i])
      if (chunk.length >= 20 || i === lines.length - 1) {
        pages.push(chunk.join('\n'))
        chunk = []
      }
    }
    return pages.length > 0 ? pages : [raw]
  }
  return ['']
}

// ── Hindi numeral converter ────────────────────────────
const HINDI_DIGITS = '०१२३४५६७८९'
function toHindi(n) {
  return String(n).replace(/[0-9]/g, d => HINDI_DIGITS[+d])
}

// ════════════════════════════════════════════════════════
//  Component
// ════════════════════════════════════════════════════════
function PoetryFocusView({ poem, poems = [], onClose }) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  const bodyRef   = useRef(null)
  const cardRef   = useRef(null)
  const touchX    = useRef(null)
  const touchY    = useRef(null)

  // ── Parse pages ───────────────────────────────────────
  const rawContent =
    poem?.pages || poem?.body_text_hi || poem?.body_text_en || poem?.full_text || ''
  const pages      = parsePages(rawContent)
  const totalPages = pages.length

  const [pageIdx, setPageIdx] = useState(0)

  // Reset on poem change
  useEffect(() => {
    setPageIdx(0)
    bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [poem?.id])

  // ── Nudge animation via data-attribute (no state) ─────
  // Using a data attribute avoids React re-renders that would
  // conflict with Framer Motion's own animation engine.
  const nudgeCard = useCallback((dir) => {
    const el = cardRef.current
    if (!el) return
    el.removeAttribute('data-nudge')
    // Force reflow so removing and re-adding the attr triggers the animation
    void el.offsetHeight
    el.setAttribute('data-nudge', dir)
    setTimeout(() => el.removeAttribute('data-nudge'), 300)
  }, [])

  // ── Turn page ─────────────────────────────────────────
  const turnPage = useCallback((dir) => {
    const next = pageIdx + dir
    if (next < 0 || next >= totalPages) return

    playPaperSound()
    nudgeCard(dir > 0 ? 'left' : 'right')

    // Small delay so the nudge starts before content changes
    setTimeout(() => {
      setPageIdx(next)
      bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }, 80)
  }, [pageIdx, totalPages, nudgeCard])

  // ── Keyboard ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName?.toUpperCase?.()
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') turnPage(1)
      if (e.key === 'ArrowLeft')  turnPage(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, turnPage])

  // ── Scroll lock ───────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── Touch swipe (horizontal-dominant threshold: 48px) ─
  const onTouchStart = (e) => {
    touchX.current = e.changedTouches[0].screenX
    touchY.current = e.changedTouches[0].screenY
  }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].screenX - touchX.current
    const dy = e.changedTouches[0].screenY - touchY.current
    touchX.current = null
    touchY.current = null
    // Only fire if swipe is clearly horizontal
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      turnPage(dx < 0 ? 1 : -1)
    }
  }

  // ── Derived display values ─────────────────────────────
  if (!poem) return null

  const title = sanitizeText(
    isHi
      ? (poem.heading_hi || poem.heading || poem.heading_en || '')
      : (poem.heading_en || poem.heading || poem.heading_hi || '')
  ) || (isHi ? 'अज्ञात कविता' : 'Untitled')

  const pageText    = pages[pageIdx] || ''
  const authorLabel = isHi ? "गुरुप्रताप शर्मा 'आग'" : "Guru Pratap Sharma 'Aag'"

  const pageLabel   = isHi
    ? `${toHindi(pageIdx + 1)} / ${toHindi(totalPages)}`
    : `${pageIdx + 1} / ${totalPages}`

  // Progress bar width %
  const progressPct = totalPages > 1
    ? ((pageIdx + 1) / totalPages) * 100
    : 100

  return (
    <AnimatePresence>
      {/* Backdrop — click to close */}
      <motion.div
        className="pfv-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={onClose}
      >
        {/* ── Card ───────────────────────────────────── */}
        <motion.div
          ref={cardRef}
          className="pfv-card"
          initial={{ opacity: 0, scale: 0.93, y: 22 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.95,  y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Amber reading progress bar */}
          <div
            className="pfv-progress"
            style={{ width: `${progressPct}%` }}
            aria-hidden="true"
          />

          {/* ── Header ────────────────────────────────── */}
          <div className="pfv-card-header">
            {/* Left: symmetric spacer */}
            <div className="pfv-header-left" aria-hidden="true" />

            {/* Center: poem title */}
            <h2 className="pfv-poem-title" title={title}>{title}</h2>

            {/* Right: close button */}
            <button
              className="pfv-close-btn"
              onClick={onClose}
              title={isHi ? 'बंद करें  (Esc)' : 'Close  (Esc)'}
              aria-label={isHi ? 'पाठक बंद करें' : 'Close reader'}
            >
              ✕
            </button>
          </div>

          {/* Thin decorative separator */}
          <div className="pfv-title-rule" aria-hidden="true" />

          {/* ── Poem body ─────────────────────────────── */}
          <div className="pfv-poem-body" ref={bodyRef}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${poem.id}__p${pageIdx}`}
                className="pfv-poem-text"
                initial={{ opacity: 0, y:  10 }}
                animate={{ opacity: 1, y:  0  }}
                exit={{    opacity: 0, y: -10  }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {renderFormattedText(pageText)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Page nav footer (hidden for single-page) ── */}
          <div
            className={`pfv-page-nav${totalPages <= 1 ? ' pfv-page-nav--hidden' : ''}`}
            aria-label={isHi ? 'पृष्ठ नेविगेशन' : 'Page navigation'}
          >
            <button
              className="pfv-page-btn"
              onClick={() => turnPage(-1)}
              disabled={pageIdx === 0}
              aria-label={isHi ? 'पिछला पृष्ठ' : 'Previous page'}
            >
              ← {isHi ? 'पिछला' : 'Prev'}
            </button>

            <div className="pfv-page-center" aria-live="polite">
              <span className="pfv-page-number">{pageLabel}</span>
              <span className="pfv-page-author" title={authorLabel}>{authorLabel}</span>
            </div>

            <button
              className="pfv-page-btn"
              onClick={() => turnPage(1)}
              disabled={pageIdx >= totalPages - 1}
              aria-label={isHi ? 'अगला पृष्ठ' : 'Next page'}
            >
              {isHi ? 'अगला' : 'Next'} →
            </button>
          </div>
        </motion.div>

        {/* Keyboard shortcut hint — outside card, non-interactive */}
        <p className="pfv-keyboard-hint" aria-hidden="true">
          {isHi
            ? 'Esc = बंद  ·  ← →  या  स्वाइप = पृष्ठ बदलें'
            : 'Esc to close  ·  ← →  or  swipe to turn pages'
          }
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

export default PoetryFocusView
