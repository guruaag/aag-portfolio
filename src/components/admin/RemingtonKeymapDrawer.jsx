import React, { useState } from 'react';

const REMINGTON_LAYOUT = [
  { rowName: "Number Row", keys: [
    { key: "1", char: "1 / ृ", shift: "!" },
    { key: "2", char: "2 / ्र", shift: "।" },
    { key: "3", char: "3 / ङ", shift: "॥" },
    { key: "4", char: "4 / ऋ", shift: "्" },
    { key: "5", char: "5 / ०", shift: "ज्ञ" },
    { key: "6", char: "6 / ऽ", shift: "त्र" },
    { key: "7", char: "7 / -", shift: "क्ष" },
    { key: "8", char: "8 / (", shift: "श्र" },
    { key: "9", char: "9 / )", shift: "(" },
    { key: "0", char: "0 / ०", shift: ")" },
  ]},
  { rowName: "Top Row (QWERTY)", keys: [
    { key: "q", char: "ौ", shift: "फ" },
    { key: "w", char: "ै", shift: "ॅ" },
    { key: "e", char: "ा", shift: "म्" },
    { key: "r", char: "ी", shift: "त्" },
    { key: "t", char: "ू", shift: "ज्" },
    { key: "y", char: "ब", shift: "ल्" },
    { key: "u", char: "ह", shift: "न्" },
    { key: "i", char: "ग", shift: "प्" },
    { key: "o", char: "द", shift: "व्" },
    { key: "p", char: "ज", shift: "च्" },
    { key: "[", char: "ड", shift: "ख्" },
    { key: "]", char: "़", shift: "ट्" },
  ]},
  { rowName: "Home Row (ASDF)", keys: [
    { key: "a", char: "ं", shift: "ॉ" },
    { key: "s", char: "े", shift: "ै" },
    { key: "d", char: "्", shift: "क" },
    { key: "f", char: "ि", shift: "थ" },
    { key: "g", char: "ु", shift: "भ" },
    { key: "h", char: "प", shift: "झ" },
    { key: "j", char: "र", shift: "घ" },
    { key: "k", char: "आ", shift: "ध" },
    { key: "l", char: "स", shift: "स" },
    { key: ";", char: "य", shift: "श" },
    { key: "'", char: "श", shift: "ष" },
  ]},
  { rowName: "Bottom Row (ZXCV)", keys: [
    { key: "z", char: "्र", shift: "र्" },
    { key: "x", char: "ग", shift: "ह" },
    { key: "c", char: "म", shift: "ण" },
    { key: "v", char: "न", shift: "ट" },
    { key: "b", char: "व", shift: "ठ" },
    { key: "n", char: "ल", shift: "छ" },
    { key: "m", char: "स", shift: "ड" },
    { key: ",", char: "ए", shift: "ढ" },
    { key: ".", char: "ण्", shift: "झ" },
    { key: "/", char: "ध", shift: "फ" },
  ]}
];

export default function RemingtonKeymapDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('all');
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="bg-amber-900 border-l border-amber-700/50 text-amber-100 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-amber-800/80 bg-amber-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-300 text-xl font-bold">⌨️</span>
            <div>
              <h3 className="font-bold text-lg text-amber-100 font-serif">Remington (Kruti Dev) Keyboard Map</h3>
              <p className="text-xs text-amber-300/70">Visual guide for Kruti Dev typewriter key assignments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-amber-400 hover:text-amber-100 hover:bg-amber-800/50 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-amber-950/40 border-b border-amber-800/50 flex items-center justify-between gap-3">
          <input 
            type="text"
            placeholder="Search key or Hindi char..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-amber-950/80 border border-amber-700/60 rounded-lg px-3 py-1.5 text-xs text-amber-100 placeholder-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Keymap Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-amber-700">
          {REMINGTON_LAYOUT.map((row, idx) => {
            const filteredKeys = row.keys.filter(k => 
              !filterQuery || 
              k.key.toLowerCase().includes(filterQuery.toLowerCase()) || 
              k.char.includes(filterQuery) || 
              (k.shift && k.shift.includes(filterQuery))
            );

            if (filteredKeys.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-sans">
                  {row.rowName}
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filteredKeys.map((item) => (
                    <div 
                      key={item.key} 
                      className="bg-amber-950/90 border border-amber-700/50 rounded-lg p-2 flex flex-col justify-between hover:border-amber-400 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-amber-800/50 pb-1 mb-1">
                        <span className="text-[11px] font-mono font-bold text-amber-400 uppercase bg-amber-900/60 px-1.5 py-0.5 rounded">
                          {item.key}
                        </span>
                        <span className="text-[10px] text-amber-400/60">
                          {item.shift ? `⇧+${item.key}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-sans pt-0.5">
                        <span className="text-amber-100 font-bold">{item.char}</span>
                        {item.shift && (
                          <span className="text-amber-300/80 text-xs">{item.shift}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-6 p-3 bg-amber-950/70 rounded-xl border border-amber-700/40 text-xs text-amber-300/80 space-y-1 font-sans">
            <p className="font-semibold text-amber-200">💡 Useful Remington Tips:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/70">
              <li>Type <code className="bg-amber-900 px-1 rounded text-amber-200">f</code> before consonant to add Pre-i matra (ि).</li>
              <li>Type <code className="bg-amber-900 px-1 rounded text-amber-200">z</code> for Ref (र्) or Rakar (्र).</li>
              <li>Toggle anytime using <kbd className="bg-amber-900 px-1 rounded text-amber-200">Cmd+Shift+K</kbd> or <kbd className="bg-amber-900 px-1 rounded text-amber-200">Ctrl+Shift+K</kbd>.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-amber-950/90 border-t border-amber-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Map
          </button>
        </div>

      </div>
    </div>
  );
}
