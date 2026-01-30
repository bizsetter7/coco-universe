
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    ln = i + 1
    # Remove strings and comments to avoid confusion
    clean_line = re.sub(r'\{/\*.*?\*/\}', '', line)
    clean_line = re.sub(r'".*?"', '""', clean_line)
    clean_line = re.sub(r'`.?`', '``', clean_line)
    
    # Simple tag regex
    tags = re.finditer(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)(\s|/?>)|/>', clean_line)
    for m in tags:
        full = m.group(0)
        if full == '/>':
            if stack: stack.pop()
            continue
        
        closing = m.group(1) == '/'
        name = m.group(2)
        
        if closing:
            if not stack:
                print(f"Error: Stray </{name}> at line {ln}")
            else:
                top_name, top_ln = stack.pop()
                if top_name != name:
                    print(f"Error: Mismatched </{name}> at line {ln}, expected </{top_name}> (opened at {top_ln})")
        else:
            if not full.endswith('/>') and name.lower() not in ['img', 'br', 'hr', 'input', 'link', 'meta', 'wbr']:
                stack.append((name, ln))

print("Unclosed stack:")
for name, ln in stack:
    print(f"  <{name}> at line {ln}")
