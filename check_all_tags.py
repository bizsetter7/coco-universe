
import re

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    # Find all div opening and closing tags on this line
    matches = re.finditer(r'<(div\b)|</div\b>', line)
    for m in matches:
        if m.group(1): # Opening <div
            stack.append((i+1, "div"))
        else: # Closing </div>
            if stack:
                pos, tag = stack.pop()
                if tag != "div":
                    print(f"ERROR: </div> at line {i+1} closes <{tag}> from line {pos}")
            else:
                print(f"ERROR: Extra </div> at line {i+1}")

# Also check other tags
stack_all = []
for i, line in enumerate(lines):
    matches = re.finditer(r'<(div|section|main|aside)\b|</(div|section|main|aside)>', line)
    for m in matches:
        if m.group(1): # Opening
            stack_all.append((i+1, m.group(1)))
        elif m.group(2): # Closing
            if stack_all:
                pos, tag = stack_all.pop()
                if tag != m.group(2):
                    print(f"ERROR: </{m.group(2)}> at line {i+1} closes <{tag}> from line {pos}")
            else:
                print(f"ERROR: Extra </{m.group(2)}> at line {i+1}")

if stack_all:
    print(f"Final Unclosed stack: {stack_all}")
