import React, { useState, useEffect } from 'react';
import { convertKrutiDevToUnicode, isKrutiDevText } from '../../utils/krutiDevEngine';

export default function PM5BatchPasteModal({ isOpen, onClose, onImport }) {
  const [rawInput, setRawInput] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [parsedTitle, setParsedTitle] = useState('');
  const [parsedContext, setParsedContext] = useState('');
  const [parsedBody, setParsedBody] = useState('');
  const [isLegacyDetected, setIsLegacyDetected] = useState(false);

  useEffect(() => {
    if (!rawInput.trim()) {
      setConvertedText('');
      setParsedTitle('');
      setParsedContext('');
      setParsedBody('');
      setIsLegacyDetected(false);
      return;
    }

    // Check if input contains Kruti Dev patterns
    const detected = isKrutiDevText(rawInput);
    setIsLegacyDetected(detected);

    // Perform conversion
    const unicode = convertKrutiDevToUnicode(rawInput);
    setConvertedText(unicode);

    // Heuristic parsing of Title, Context, and Body
    const lines = unicode.split('\n').map(l => l.trim());
    const nonEmptyLines = lines.filter(l => l.length > 0);

    if (nonEmptyLines.length > 0) {
      // First non-empty line is Title
      const titleCandidate = nonEmptyLines[0];
      setParsedTitle(titleCandidate);

      let bodyStartIndex = 1;
      let contextCandidate = '';

      // Check if second non-empty line looks like context/year (e.g., in brackets, or short metadata)
      if (nonEmptyLines.length > 1) {
        const secondLine = nonEmptyLines[1];
        if (
          secondLine.startsWith('(') || 
          secondLine.startsWith('[') || 
          secondLine.includes('19') || 
          secondLine.includes('20') ||
          secondLine.length < 40
        ) {
          contextCandidate = secondLine;
          bodyStartIndex = 2;
        }
      }

      setParsedContext(contextCandidate);

      // Remaining lines form the poem body, preserving original blank lines/stanzas
      const firstLineIndexInRaw = lines.indexOf(titleCandidate);
      const secondLineIndexInRaw = contextCandidate ? lines.indexOf(contextCandidate) : -1;

      const skipUntilIndex = secondLineIndexInRaw !== -1 ? secondLineIndexInRaw + 1 : firstLineIndexInRaw + 1;
      const bodyLines = lines.slice(skipUntilIndex);
      setParsedBody(bodyLines.join('\n').replace(/^\n+/, ''));
    }
  }, [rawInput]);

  if (!isOpen) return null;

  const handleApplyImport = () => {
    onImport({
      title: parsedTitle,
      context: parsedContext,
      content: parsedBody
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-amber-950 border border-amber-700/60 text-amber-100 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-amber-900/80 border-b border-amber-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 text-2xl font-bold">📄</span>
            <div>
              <h3 className="font-serif font-bold text-xl text-amber-100">PageMaker 5.0 Batch Archive Converter</h3>
              <p className="text-xs text-amber-300/70">Paste bulk text from PageMaker 5.0 to auto-parse Title, Context & Stanzas into Unicode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-amber-400 hover:text-amber-100 hover:bg-amber-800/60 rounded-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Detection Status Badge */}
        {rawInput.trim() && (
          <div className={`px-5 py-2 text-xs font-medium border-b flex items-center justify-between ${
            isLegacyDetected 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            <span>
              {isLegacyDetected 
                ? '⚡ Legacy Kruti Dev / Devlys ASCII detected! Auto-converting to Unicode Devanagari...' 
                : '✓ Standard Unicode / English text detected.'}
            </span>
            <span className="text-[10px] opacity-75">Instant 2-pass Engine</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Input Textarea */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                1. Paste Raw PageMaker Text (Kruti Dev ASCII)
              </label>
              {rawInput && (
                <button 
                  onClick={() => setRawInput('')} 
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Clear Input
                </button>
              )}
            </div>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste raw PageMaker 5.0 block here (e.g. j'âjk dky\'k&#10;(1985)&#10;j'âjk dky\'k dh f'k[kkvksa esa...)"
              rows={16}
              className="w-full flex-1 bg-amber-950/80 border border-amber-700/60 rounded-xl p-3.5 text-xs text-amber-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-amber-600/50 resize-none shadow-inner"
            />
          </div>

          {/* Right: Parsed Fields & Unicode Preview */}
          <div className="flex flex-col space-y-4">
            <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              2. Parsed Fields Preview (Unicode Hindi)
            </label>

            {/* Parsed Title */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-amber-400 font-medium">
                <span>Poem Title (शीर्षक)</span>
                <span className="text-[10px] text-amber-500">Auto-extracted Line 1</span>
              </div>
              <input
                type="text"
                value={parsedTitle}
                onChange={(e) => setParsedTitle(e.target.value)}
                placeholder="Parsed poem title"
                className="w-full bg-amber-900/50 border border-amber-700/60 rounded-lg px-3 py-2 text-sm text-amber-100 font-serif focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Parsed Context */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-amber-400 font-medium">
                <span>Context / Year (प्रसंग / वर्ष)</span>
                <span className="text-[10px] text-amber-500">Auto-extracted Line 2</span>
              </div>
              <input
                type="text"
                value={parsedContext}
                onChange={(e) => setParsedContext(e.target.value)}
                placeholder="Parsed context or year"
                className="w-full bg-amber-900/50 border border-amber-700/60 rounded-lg px-3 py-2 text-xs text-amber-100 font-sans focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Parsed Poem Body */}
            <div className="flex-1 flex flex-col space-y-1">
              <div className="flex justify-between items-center text-[11px] text-amber-400 font-medium">
                <span>Poem Body & Stanzas (कविता)</span>
                <span className="text-[10px] text-amber-500">Preserved Stanza Spacing</span>
              </div>
              <textarea
                value={parsedBody}
                onChange={(e) => setParsedBody(e.target.value)}
                placeholder="Parsed stanzas will appear here"
                rows={8}
                className="w-full flex-1 bg-amber-900/50 border border-amber-700/60 rounded-lg p-3 text-xs text-amber-100 font-serif focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
              />
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-amber-900/90 border-t border-amber-700/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-700/50 text-amber-300 rounded-xl text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleApplyImport}
            disabled={!parsedTitle && !parsedBody}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl text-xs transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Import Parsed Devanagari to Form</span>
            <span>➔</span>
          </button>
        </div>

      </div>
    </div>
  );
}
