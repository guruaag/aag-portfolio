import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { sanitizeText } from '../lib/dataSanitizer'
import { renderFormattedText } from '../utils/textFormatter'
import './PoetryFocusView.css'

/* ─────────────────────────────────────────────────────
   BookFocusView — full-screen immersive book & story reader
   Shares exact same styling, physics, gestures, and audio
   as PoetryFocusView for 100% visual and functional parity.
   ───────────────────────────────────────────────────── */

// ── Synthetic paper-turn sound via Web Audio API ──────
function playPaperSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const sr = ctx.sampleRate
    const dur = 0.14
    const buf = ctx.createBuffer(1, Math.floor(sr * dur), sr)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.22))
    }

    const src = ctx.createBufferSource()
    src.buffer = buf

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
  } catch (_) {}
}

// ── Parse book/story content into pages of ≤18 lines ──
function parsePages(raw) {
  if (Array.isArray(raw) && raw.length > 0) return raw
  if (typeof raw === 'string' && raw.trim()) {
    const lines = raw.split('\n')
    const pages = []
    let chunk = []
    for (let i = 0; i < lines.length; i++) {
      chunk.push(lines[i])
      if (chunk.length >= 18 || i === lines.length - 1) {
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

function BookFocusView({ publication, onClose }) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  const bodyRef = useRef(null)
  const cardRef = useRef(null)
  const touchX  = useRef(null)
  const touchY  = useRef(null)

  // ── Parse content pages ───────────────────────────────
  const rawContent =
    publication?.pages || publication?.description || publication?.subtitle || publication?.full_text || ''
  const pages      = parsePages(rawContent)
  const totalPages = pages.length

  const [pageIdx, setPageIdx] = useState(0)

  useEffect(() => {
    setPageIdx(0)
    bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [publication?.id])

  // ── Card Nudge Animation ──────────────────────────────
  const nudgeCard = useCallback((dir) => {
    const el = cardRef.current
    if (!el) return
    el.removeAttribute('data-nudge')
    void el.offsetHeight
    el.setAttribute('data-nudge', dir)
    setTimeout(() => el.removeAttribute('data-nudge'), 300)
  }, [])

  // ── Turn Page ─────────────────────────────────────────
  const turnPage = useCallback((dir) => {
    const next = pageIdx + dir
    if (next < 0 || next >= totalPages) return

    playPaperSound()
    nudgeCard(dir > 0 ? 'left' : 'right')

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

  // ── Scroll Lock ───────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── Touch Swipe ───────────────────────────────────────
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
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
      turnPage(dx < 0 ? 1 : -1)
    }
  }

  if (!publication) return null

  const title = sanitizeText(publication.title) || (isHi ? 'अज्ञात पुस्तक' : 'Untitled')
  const pageText = pages[pageIdx] || ''
  const authorLabel = isHi ? "गुरुप्रताप शर्मा 'आग'" : "Guru Pratap Sharma 'Aag'"

  const pageLabel = isHi
    ? `${toHindi(pageIdx + 1)} / ${toHindi(totalPages)}`
    : `${pageIdx + 1} / ${totalPages}`

  const progressPct = totalPages > 1 ? ((pageIdx + 1) / totalPages) * 100 : 100

  return (
    <AnimatePresence>
      <motion.div
        className="pfv-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={onClose}
      >
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
          {/* Amber Progress Bar */}
          <div
            className="pfv-progress"
            style={{ width: `${progressPct}%` }}
            aria-hidden="true"
          />

          {/* Header */}
          <div className="pfv-card-header">
            <div className="pfv-header-left" aria-hidden="true" />

            <h2 className="pfv-poem-title" title={title}>{title}</h2>

            <button
              className="pfv-close-btn"
              onClick={onClose}
              title={isHi ? 'बंद करें (Esc)' : 'Close (Esc)'}
              aria-label={isHi ? 'पाठक बंद करें' : 'Close reader'}
            >
              ✕
            </button>
          </div>

          <div className="pfv-title-rule" aria-hidden="true" />

          {/* Body */}
          <div className="pfv-poem-body" ref={bodyRef}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${publication.id}__p${pageIdx}`}
                className="pfv-poem-text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {renderFormattedText(pageText)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Nav */}
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

export default BookFocusView
