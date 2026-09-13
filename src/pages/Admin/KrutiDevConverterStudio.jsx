import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  convertUniversalHindiFont, 
  detectLegacyFont 
} from '../../utils/hindiFontEngine';
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb';

export default function KrutiDevConverterStudio() {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState(`Hkz"Vkpkj u gksrk vxj vxj u gksrk Hkz"VkpkjA

dkj[kkuksa esa u <y ikrs laLFkku ;s fo|k ds]
dqaMyh ekjs cSBs gSa ftl ij lkys usrk dsA
[kksy gh ikrk ugha vke vkneh mldk }kj]
oukZ gj cPpk ik tkrk f'k{kk dk vf/kdkjA`);

  const [convertedText, setConvertedText] = useState('');
  const [detectedFont, setDetectedFont] = useState('Unknown');
  const [copied, setCopied] = useState(false);

  // Formatting options state
  const [options, setOptions] = useState({
    normalizeNukta: true,
    fixMatra: true,
    cleanControlChars: true,
    digitMode: 'original' // 'original', 'toDevanagari', 'toASCII'
  });

  // Convert on rawText or options change
  useEffect(() => {
    if (!rawText) {
      setConvertedText('');
      setDetectedFont('None');
      return;
    }

    const font = detectLegacyFont(rawText);
    setDetectedFont(font);

    let converted = convertUniversalHindiFont(rawText, {
      font,
      normalizeNukta: options.normalizeNukta,
      fixMatra: options.fixMatra,
      digits: options.digitMode
    });

    setConvertedText(converted);
  }, [rawText, options]);

  // Handle Copy to Clipboard
  const handleCopy = () => {
    if (!convertedText) return;
    navigator.clipboard.writeText(convertedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Download Converted File
  const handleDownload = () => {
    if (!convertedText) return;
    const blob = new Blob([convertedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_unicode_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format Verse & Stanzas
  const handleFormatStanzas = () => {
    if (!convertedText) return;
    let formatted = convertedText
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    setConvertedText(formatted);
  };

  // Send Direct to Kavya Sangrah New Poem Editor
  const handleSendToKavyaSangrah = () => {
    navigate('/admin/kavya-sangrah/new', { state: { prefilledBody: convertedText } });
  };

  // Stats calculation
  const charCount = convertedText.length;
  const wordCount = convertedText.trim() ? convertedText.trim().split(/\s+/).length : 0;
  const lineCount = convertedText ? convertedText.split('\n').length : 0;
  const stanzaCount = convertedText ? convertedText.split(/\n\s*\n/).filter(Boolean).length : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      {/* Top Header & Breadcrumbs */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <AdminBreadcrumb items={[{ label: 'कन्वर्टर स्टूडियो (Legacy Font Studio)' }]} />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3 mt-2">
              <span>✨</span>
              फॉन्ट कनवर्टर स्टुडियो (Legacy Font Studio)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              100% Accurate High-Precision Converter for Kruti Dev, Devlys, Chanakya & PageMaker 5.0 Archives.
            </p>
          </div>

          {/* Detected Font Badge */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-2">
              <span>🔤</span>
              <span>Detected: {detectedFont}</span>
            </div>

            <button
              onClick={handleSendToKavyaSangrah}
              disabled={!convertedText}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <span>✒️</span>
              <span>काव्य संग्रह में भेजें</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Controls */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span>⚙️</span>
              क्लीन-अप ऑप्शंस:
            </span>

            <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/60 border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors">
              <input
                type="checkbox"
                checked={options.normalizeNukta}
                onChange={e => setOptions(prev => ({ ...prev, normalizeNukta: e.target.checked }))}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 bg-slate-950"
              />
              <span>नुक़्ता शुद्धि (Nukta Clean)</span>
            </label>

            <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/60 border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors">
              <input
                type="checkbox"
                checked={options.fixMatra}
                onChange={e => setOptions(prev => ({ ...prev, fixMatra: e.target.checked }))}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 bg-slate-950"
              />
              <span>मात्रा शुद्धि (Matra Fix)</span>
            </label>

            <select
              value={options.digitMode}
              onChange={e => setOptions(prev => ({ ...prev, digitMode: e.target.value }))}
              className="px-3 py-1.5 rounded-md bg-slate-900/60 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="original">अंक (Original Digits)</option>
              <option value="toDevanagari">देवनागरी अंक (०-९)</option>
              <option value="toASCII">अंग्रेजी अंक (0-9)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormatStanzas}
              className="px-3 py-1.5 rounded-md bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Clean paragraph & stanza linebreaks"
            >
              <span>🔄</span>
              <span>फॉर्मेट छंद</span>
            </button>

            <button
              onClick={() => setRawText('')}
              className="px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>🗑️</span>
              <span>साफ़ करें</span>
            </button>
          </div>
        </div>

        {/* Dual Pane Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Pane: Raw Input */}
          <div className="flex flex-col bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>📄</span>
                <span className="font-semibold text-sm text-slate-200">
                  मूल लेगेसी टेक्स्ट (PageMaker / Kruti Dev Raw Input)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {rawText.length} chars
              </span>
            </div>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="यहाँ Raw Kruti Dev / PageMaker 5.0 टेक्स्ट पेस्ट करें..."
              className="w-full h-96 p-4 bg-slate-950/60 text-slate-200 font-mono text-sm leading-relaxed focus:outline-none resize-none"
            />
          </div>

          {/* Right Pane: Converted Devanagari Output */}
          <div className="flex flex-col bg-slate-800/50 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span className="font-semibold text-sm text-amber-300">
                  100% शुद्ध देवनागरी यूनिकोड आउटपुट (Converted Unicode)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!convertedText}
                  className="px-3 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <span>{copied ? '✅' : '📋'}</span>
                  <span>{copied ? 'कॉपी हो गया!' : 'कॉपी करें'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!convertedText}
                  className="px-3 py-1 rounded bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <span>📥</span>
                  <span>डाउनलोड</span>
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={convertedText}
              placeholder="रूपांतरित देवनागरी पाठ यहाँ दिखाई देगा..."
              className="w-full h-96 p-4 bg-slate-950/80 text-amber-100 font-sans text-base leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Live Conversion Stats Bar */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">अक्षर (Characters)</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{charCount}</p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">शब्द (Words)</p>
            <p className="text-xl font-bold text-orange-400 mt-1">{wordCount}</p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">पंक्तियाँ (Lines)</p>
            <p className="text-xl font-bold text-rose-400 mt-1">{lineCount}</p>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">छंद / बंद (Stanzas)</p>
            <p className="text-xl font-bold text-amber-300 mt-1">{stanzaCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
