font_context_path = '/Users/sankalpg/Documents/Project/aag/src/contexts/FontContext.jsx'
with open(font_context_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update import to include isKrutiDevText
if 'isKrutiDevText' not in content:
    content = content.replace(
        "import { convertUniversalHindiFont } from '../utils/hindiFontEngine.js';",
        "import { convertUniversalHindiFont, isKrutiDevText } from '../utils/hindiFontEngine.js';"
    )

# 2. Add safeguard in handlePaste
old_paste_logic = """      // If pasted text contains Kruti Dev ASCII signatures, convert to Unicode
      const convertedText = convertUniversalHindiFont(pastedText, { font: 'Kruti Dev 010' });
      if (convertedText === pastedText) return;"""

new_paste_logic = """      // Safeguard: If pasted text is ALREADY Unicode Devanagari or standard English, DO NOT convert!
      if (!isKrutiDevText(pastedText)) {
        return;
      }

      const convertedText = convertUniversalHindiFont(pastedText, { font: 'Kruti Dev 010' });
      if (convertedText === pastedText) return;"""

if old_paste_logic in content:
    content = content.replace(old_paste_logic, new_paste_logic, 1)
    with open(font_context_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("FontContext.jsx paste safeguard successfully applied!")
else:
    print("Could not find old_paste_logic in FontContext.jsx")
