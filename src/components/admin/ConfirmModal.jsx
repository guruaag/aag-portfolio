import { motion, AnimatePresence } from 'framer-motion'

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, isDanger = true }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 13, 11, 0.65)',
            backdropFilter: 'blur(4px)'
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'relative',
            zIndex: 10000,
            width: '100%',
            maxWidth: '420px',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            border: '1px solid #E2D7C5'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: isDanger ? '#FFF0ED' : '#F4EFE6',
              color: isDanger ? '#D95343' : '#B85C38',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              flexShrink: 0
            }}>
              {isDanger ? '⚠️' : '❓'}
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#1E1B18', fontWeight: 700 }}>
                {title || 'पुष्टि करें (Confirm Action)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#555', lineHeight: '1.5' }}>
                {message || 'क्या आप निश्चित हैं? यह क्रिया वापस नहीं ली जा सकती।'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onCancel}
              className="admin-btn-secondary"
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {cancelText || 'रद्द करें (Cancel)'}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: isDanger ? '#D95343' : '#B85C38',
                color: '#FFFFFF',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(217, 83, 67, 0.25)'
              }}
            >
              {confirmText || 'हाँ, हटाएं (Delete)'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ConfirmModal
