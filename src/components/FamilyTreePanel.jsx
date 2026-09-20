import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import FamilyTreeCanvas, { FAMILY_DATA_35 } from './FamilyTreeCanvas'
import './FamilyTreePanel.css'

export const MOCK_FAMILY_DATA = FAMILY_DATA_35

export default function FamilyTreePanel() {
  const { i18n } = useTranslation()
  const isHi = i18n.language !== 'en'
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenFocusMode = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
    setIsOpen(false)
  }

  return (
    <div className="sharma-family-cta-wrapper">
      {/* Broad Prominent Pill CTA Button */}
      <button 
        className="sharma-family-pill-btn" 
        onClick={handleOpenFocusMode}
      >
        <span className="pill-icon">🌳</span>
        <span className="pill-text">{isHi ? 'शर्मा परिवार वंशावली (Sharma Family)' : 'Sharma Family'}</span>
        <span className="pill-badge">{isHi ? '३५ सदस्य' : '35 Members'}</span>
      </button>

      {/* Fullscreen Interactive Family Tree Modal in Focus Mode */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="family-tree-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div 
              className="family-tree-modal-container"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Canvas Component Auto-Triggering Fullscreen & Focus Mode */}
              <div className="family-modal-body">
                <FamilyTreeCanvas 
                  rootId="f-201" 
                  selectedNodeId="f-201" 
                  autoFullscreen={true} 
                  onClose={handleClose} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
