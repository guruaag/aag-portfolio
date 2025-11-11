import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { getImageUrl } from '../lib/imageUtils'
import './PublicationCard.css'

function PublicationCard({ publication, index = 0 }) {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  
  const imageUrl = getImageUrl(publication.image_path)

  const handleClick = () => {
    navigate(`/publication/${publication.id}`)
  }

  return (
    <motion.div
      className="phoenix-publication-card"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        y: -8
      }}
      style={{
        cursor: 'pointer'
      }}
    >
      <div className="phoenix-publication-image-wrapper">
        {imageUrl ? (
          <>
            <motion.img 
              src={imageUrl} 
              alt={publication.image_alt || publication.title}
              className="phoenix-publication-image"
              animate={{
                scale: isHovered ? 1.08 : 1,
                filter: isHovered ? 'brightness(1.15)' : 'brightness(1)'
              }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            {/* Title Overlay - Elegant fade in */}
            <motion.div
              className="phoenix-publication-overlay"
              initial={false}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 20
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <h3 className="phoenix-publication-title-overlay">
                {publication.title}
              </h3>
              {publication.subtitle && (
                <p className="phoenix-publication-subtitle-overlay">
                  {publication.subtitle}
                </p>
              )}
            </motion.div>
            {/* Glow effect on hover */}
            <motion.div
              className="phoenix-publication-glow"
              animate={{
                opacity: isHovered ? 0.3 : 0
              }}
              transition={{ duration: 0.3 }}
            />
          </>
        ) : (
          <div className="phoenix-publication-placeholder">
            <span>{publication.title || 'Publication'}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PublicationCard
