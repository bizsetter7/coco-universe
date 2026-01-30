
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    line_num = i + 1
    # Simple regex to find <tag, </tag, and self-closing <tag />
    # We ignore contents of strings or comments for now as a first pass
    tokens = re.finditer(r'<(/?)([a-zA-Z0-9]+)(\s|/?>)|/>', line)
    for match in tokens:
        full = match.group(0)
        if full == '/>':
            if stack and stack[-1][0].startswith('<'):
                stack.pop() # Close recent tag
            continue
        
        is_closing = match.group(1) == '/'
        tag_name = match.group(2)
        
        if is_closing:
            if not stack:
                print(f"Error: Stray closing tag </{tag_name}> at line {line_num}")
            else:
                top_name, top_line = stack.pop()
                if top_name != tag_name:
                    print(f"Error: Mismatched tag </{tag_name}> at line {line_num}, expected </{top_name}> (opened at {top_line})")
        else:
            if not full.endswith('/>'):
                # Check for common self-closing html tags
                if tag_name.lower() not in ['img', 'br', 'hr', 'input', 'link', 'meta', 'p', 'span', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'a', 'label']: # Actually, p and span are not self-closing but often used simply. Let's keep common ones.
                    if tag_name.lower() in ['img', 'br', 'hr', 'input', 'link', 'meta', 'wbr']:
                        continue
                    stack.append((tag_name, line_num))

if stack:
    print("Unclosed tags:")
    for name, line in stack:
        print(f"  <{name}> opened at line {line}")
