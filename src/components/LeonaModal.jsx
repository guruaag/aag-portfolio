import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './LeonaModal.css'

export default function LeonaModal({
  isOpen,
  title,
  message,
  type = 'confirm', // 'confirm' or 'alert'
  confirmText = 'स्वीकार करें (Confirm)',
  cancelText = 'रद्द करें (Cancel)',
  onConfirm,
  onCancel,
  isDanger = false
}) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="leona-modal-overlay" onClick={onCancel}>
        <motion.div
          className="leona-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="leona-modal-header">
            <div className="leona-modal-brand-badge">
              <img src="/logo.png" alt="AAG" className="leona-modal-logo" />
              <span>गुरु प्रताप शर्मा 'आग'</span>
            </div>
            {onCancel && (
              <button className="leona-modal-close" onClick={onCancel} aria-label="Close">
                ✕
              </button>
            )}
          </div>

          <div className="leona-modal-body">
            {title && <h3 className="leona-modal-title">{title}</h3>}
            <p className="leona-modal-message">{message}</p>
          </div>

          <div className="leona-modal-actions">
            {type === 'confirm' && onCancel && (
              <button className="leona-btn-modal-secondary" onClick={onCancel}>
                {cancelText}
              </button>
            )}
            <button
              className={`leona-btn-modal-primary ${isDanger ? 'danger' : ''}`}
              onClick={onConfirm}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
