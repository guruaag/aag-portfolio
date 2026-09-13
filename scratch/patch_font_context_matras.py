font_context_path = '/Users/sankalpg/Documents/Project/aag/src/contexts/FontContext.jsx'
with open(font_context_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """        const newVal = val.slice(0, start) + devanagariChar + val.slice(end);"""

replacement = """        let insertChar = devanagariChar;
        let replaceStart = start;
        if (start > 0 && start === end) {
          const prevChar = val.charAt(start - 1);
          if (prevChar === 'ा' && key === 's') {
            insertChar = 'ो';
            replaceStart = start - 1;
          } else if (prevChar === 'ा' && key === 'S') {
            insertChar = 'ौ';
            replaceStart = start - 1;
          }
        }

        const newVal = val.slice(0, replaceStart) + insertChar + val.slice(end);"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open(font_context_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("FontContext.jsx matra combination patched successfully!")
else:
    print("Target block not found in FontContext.jsx")
