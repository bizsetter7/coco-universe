
import re

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    # Find all div opening and closing tags on this line
    # Simplified regex that handles <div ...> and </div>
    matches = re.finditer(r'<(div\b)|</div\b>', line)
    for m in matches:
        if m.group(1): # Opening <div
            stack.append(i+1)
        else: # Closing </div>
            if stack:
                stack.pop()
            else:
                print(f"ERROR: Extra closing </div> at line {i+1}")

if stack:
    print(f"ERROR: Unclosed <div> tags starting at lines: {stack}")
else:
    print("All <div> tags are balanced.")
