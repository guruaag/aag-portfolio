import React, { useEffect } from 'react';

export default function TypingToolbar({ activeMode, setMode, onToggleKeymap, onOpenBatchPaste }) {
  // Global Hotkey Listener: Ctrl+Shift+K or Cmd+Shift+K cycles active mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMode((prev) => {
          if (prev === 'off') return 'phonetic';
          if (prev === 'phonetic') return 'remington';
          return 'off';
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMode]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FAF7F2',
        border: '1.5px solid #E2D7C5',
        borderRadius: '12px',
        padding: '10px 16px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        flexWrap: 'wrap',
        gap: '10px'
      }}
    >
      {/* Left: Mode Selection Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1B18', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⌨️ टाइपिंग मोड (Typing Engine):
        </span>

        <div style={{ display: 'flex', background: '#EFEAE1', padding: '3px', borderRadius: '8px', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMode('off')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeMode === 'off' ? '#FFFFFF' : 'transparent',
              color: activeMode === 'off' ? '#1E1B18' : '#666',
              fontWeight: activeMode === 'off' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeMode === 'off' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            मानक (Off)
          </button>
          <button
            type="button"
            onClick={() => setMode('phonetic')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeMode === 'phonetic' ? '#B85C38' : 'transparent',
              color: activeMode === 'phonetic' ? '#FFFFFF' : '#666',
              fontWeight: activeMode === 'phonetic' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeMode === 'phonetic' ? '0 2px 6px rgba(184,92,56,0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            ध्वन्यात्मक (Phonetic)
          </button>
          <button
            type="button"
            onClick={() => setMode('remington')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: activeMode === 'remington' ? '#D4AF37' : 'transparent',
              color: activeMode === 'remington' ? '#1E1B18' : '#666',
              fontWeight: activeMode === 'remington' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeMode === 'remington' ? '0 2px 6px rgba(212,175,55,0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            रेमिंगटन (Kruti Layout)
          </button>
        </div>

        <span style={{ fontSize: '0.78rem', color: '#888', marginLeft: '4px' }}>
          [शॉर्टकट: <code>Ctrl+Shift+K</code> / <code>Cmd+Shift+K</code>]
        </span>
      </div>

      {/* Right: Tools & Keymap Modal Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onOpenBatchPaste && (
          <button
            type="button"
            onClick={onOpenBatchPaste}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1.5px solid #B85C38',
              background: '#FFFFFF',
              color: '#B85C38',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📋 PM5 बैच पेस्ट (Batch Paste)
          </button>
        )}

        {activeMode === 'remington' && onToggleKeymap && (
          <button
            type="button"
            onClick={onToggleKeymap}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #D4AF37',
              background: '#FFFDF5',
              color: '#1E1B18',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🗺️ कीमैप नक्शा (Keymap)
          </button>
        )}
      </div>
    </div>
  );
}
