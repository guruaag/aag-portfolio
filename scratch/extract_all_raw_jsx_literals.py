import os
import re
import json

src_dir = "/Users/sankalpg/Documents/Project/aag/src"

extracted = []
seen = set()

# Regex patterns to capture:
# 1. JSX text content: >Some String<
# 2. JSX string attributes: placeholder="...", title="...", alt="...", label="..."
# 3. String literals in ternary expressions or JS objects inside JSX: '...' or "..."

jsx_text_pattern = re.compile(r'>\s*([^<>{}\n][^<>{}]*?)\s*<')
attr_pattern = re.compile(r'(placeholder|title|alt|aria-label|label|heading|subtitle|description|helperText)\s*=\s*(?:["\']([^"\']+)["\']|\{\s*["\']([^"\']+)["\']\s*\})')
tlabel_pattern = re.compile(r'tLabel\(\s*(["\'])(.*?)\1\s*,\s*(["\'])(.*?)\3\s*\)')
t_pattern = re.compile(r't\(\s*(["\'])(.*?)\1\s*\)')
raw_quote_pattern = re.compile(r'(?:[\:\=\?\(]\s*)(["\'])([\u0900-\u097FA-Za-z0-9\s\,\.\!\?\-\–\—\:\;\(\)\[\]\/\#\*\&\%\$\@\_]{3,120})\1')

for root, dirs, files in os.walk(src_dir):
    for file in sorted(files):
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, src_dir)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 1. tLabel calls
            for match in tlabel_pattern.finditer(content):
                hi = match.group(2).strip()
                en = match.group(4).strip()
                key = f"tlabel_{len(extracted) + 1}"
                if (hi, en, rel_path) not in seen:
                    seen.add((hi, en, rel_path))
                    extracted.append({
                        "id": len(extracted) + 1,
                        "file": rel_path,
                        "type": "tLabel Call",
                        "hindi_text": hi,
                        "english_text": en,
                        "raw_snippet": match.group(0)[:80]
                    })
                    
            # 2. JSX Text Nodes
            for match in jsx_text_pattern.finditer(content):
                text = match.group(1).strip()
                # Skip comments, single symbols, or empty spaces
                if text and len(text) > 1 and not text.startswith('//') and not text.startswith('/*') and not text.startswith('const') and not text.startswith('import'):
                    if (text, rel_path) not in seen:
                        seen.add((text, rel_path))
                        extracted.append({
                            "id": len(extracted) + 1,
                            "file": rel_path,
                            "type": "JSX Text Node",
                            "hindi_text": text if any('\u0900' <= c <= '\u097F' for c in text) else "",
                            "english_text": text if not any('\u0900' <= c <= '\u097F' for c in text) else "",
                            "raw_snippet": text[:80]
                        })

            # 3. Attributes (placeholder, title, alt, label, etc.)
            for match in attr_pattern.finditer(content):
                attr_name = match.group(1)
                attr_val = match.group(2) or match.group(3)
                if attr_val and len(attr_val.strip()) > 1:
                    val_clean = attr_val.strip()
                    if (val_clean, rel_path) not in seen:
                        seen.add((val_clean, rel_path))
                        extracted.append({
                            "id": len(extracted) + 1,
                            "file": rel_path,
                            "type": f"Attribute ({attr_name})",
                            "hindi_text": val_clean if any('\u0900' <= c <= '\u097F' for c in val_clean) else "",
                            "english_text": val_clean if not any('\u0900' <= c <= '\u097F' for c in val_clean) else "",
                            "raw_snippet": f'{attr_name}="{val_clean}"'[:80]
                        })

# Save output JSON
json_out = "/Users/sankalpg/.gemini/antigravity/brain/3dbd3969-1cd6-4e71-962f-b33cd47893d0/raw_jsx_strings_export.json"
md_out = "/Users/sankalpg/.gemini/antigravity/brain/3dbd3969-1cd6-4e71-962f-b33cd47893d0/raw_jsx_strings_export.md"

with open(json_out, 'w', encoding='utf-8') as f:
    json.dump(extracted, f, ensure_ascii=False, indent=2)

# Generate flat Markdown report
md_lines = [
    f"# 📄 Raw JSX String Extraction Report ({len(extracted)} Total Found)\n",
    "This report lists every string literal, helper text, tooltip, placeholder, modal heading, and sub-tab title extracted directly from all `.jsx` files in `/src`.\n\n",
    "| ID | File | Element Type | Hindi String | English String | Raw Snippet |\n",
    "| --- | --- | --- | --- | --- | --- |\n"
]

for item in extracted:
    hi = item['hindi_text'].replace('|', '\\|')
    en = item['english_text'].replace('|', '\\|')
    snip = item['raw_snippet'].replace('\n', ' ').replace('|', '\\|')
    md_lines.append(f"| `{item['id']}` | `{item['file']}` | {item['type']} | {hi} | {en} | `{snip}` |\n")

with open(md_out, 'w', encoding='utf-8') as f:
    f.writelines(md_lines)

print(f"Extraction complete! Found {len(extracted)} raw string literals across `/src` files.")
