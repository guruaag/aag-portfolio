import React from 'react'
import { useTranslation } from 'react-i18next'
import FamilyTreeCanvas, { FAMILY_DATA_35 } from './FamilyTreeCanvas'
import './FamilyTreePanel.css'

export const MOCK_FAMILY_DATA = FAMILY_DATA_35

export default function FamilyTreePanel() {
  const { i18n } = useTranslation()
  const isHi = i18n.language !== 'en'

  return (
    <div className="phoenix-family-panel">
      {/* Header Banner & Title */}
      <div className="phoenix-family-header" style={{ marginBottom: '16px' }}>
        <h2 className="phoenix-about-subheading" style={{ marginBottom: '6px' }}>
          {isHi ? 'वंशवृक्ष एवं परिवार (Family Tree)' : 'Family Tree & Lineage'}
        </h2>
        <p className="phoenix-family-subtitle">
          {isHi 
            ? 'कवि गुरुप्रताप शर्मा "आग" के ४ पीढ़ियों का पावन वंशावली आलेख (३५ सदस्य)' 
            : '4-Generation Lineage & Interactive Graph of Kavi Gurupratap Sharma "Aag" Family (35 Members)'}
        </p>
      </div>

      {/* 1:1 Enterprise Interactive Family Tree Canvas */}
      <FamilyTreeCanvas />
    </div>
  )
}
