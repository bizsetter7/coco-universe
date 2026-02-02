
import re

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    # Match non-self-closing tags
    matches = re.finditer(r'<(div|section|main|aside)\b(?![^>]*/>)|</(div|section|main|aside)>', line)
    for m in matches:
        if m.group(1): # Opening
            stack.append((i+1, m.group(1)))
        elif m.group(2): # Closing
            if stack:
                pos, tag = stack.pop()
                if tag != m.group(2):
                    print(f"ERROR: </{m.group(2)}> at line {i+1} closes <{tag}> from line {pos}")
            else:
                print(f"ERROR: Extra </{m.group(2)}> at line {i+1}")

if stack:
    print(f"Final Unclosed stack: {stack}")
else:
    print("All tags are balanced.")
