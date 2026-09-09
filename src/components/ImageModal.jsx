import { motion, AnimatePresence } from 'framer-motion'
import './ImageModal.css'

function ImageModal({ isOpen, imageUrl, alt, onClose }) {
  if (!isOpen || !imageUrl) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="phoenix-image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="phoenix-image-modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="phoenix-image-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
            <img src={imageUrl} alt={alt || 'Image'} className="phoenix-image-modal-img" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ImageModal

