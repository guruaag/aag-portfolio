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

  return (
    <div className="sharma-family-cta-wrapper">
      {/* Broad Prominent Pill CTA Button */}
      <button 
        className="sharma-family-pill-btn" 
        onClick={() => setIsOpen(true)}
      >
        <span className="pill-icon">🌳</span>
        <span className="pill-text">{isHi ? 'शर्मा परिवार वंशावली (Sharma Family)' : 'Sharma Family'}</span>
        <span className="pill-badge">{isHi ? '३५ सदस्य' : '35 Members'}</span>
      </button>

      {/* Interactive Family Tree Modal in Focus Mode */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="family-tree-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              className="family-tree-modal-container"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="family-modal-header">
                <div className="modal-title-group">
                  <h3>🌳 {isHi ? 'शर्मा परिवार वंशावली' : 'Sharma Family Lineage'}</h3>
                  <span className="modal-sub-tag">🎯 {isHi ? 'फोकस मोड' : 'Focus Mode'}</span>
                </div>
                <button className="modal-close-btn" onClick={() => setIsOpen(false)} title="Close">✕</button>
              </div>

              {/* Canvas Component */}
              <div className="family-modal-body">
                <FamilyTreeCanvas rootId="f-201" selectedNodeId="f-201" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
