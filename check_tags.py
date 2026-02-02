
import re

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Improved regex
tags = re.findall(r'<(div|section)|</(div|section)>', content)

opened = {'div': 0, 'section': 0}
closed = {'div': 0, 'section': 0}

for tag in tags:
    if tag[0]: # Opening
        opened[tag[0]] += 1
    elif tag[1]: # Closing
        closed[tag[1]] += 1

print(f"Divs: Open={opened['div']}, Close={closed['div']} (Diff={opened['div'] - closed['div']})")
print(f"Sections: Open={opened['section']}, Close={closed['section']} (Diff={opened['section'] - closed['section']})")

# Find line of first section mismatch
lines = content.split('\\n')
stack = []
for i, line in enumerate(lines):
    matches = re.findall(r'<(section)|</(section)>', line)
    for m in matches:
        if m[0]:
            stack.append(i+1)
        elif m[1]:
            if stack:
                stack.pop()
            else:
                print(f"Extra closing section at line {i+1}")

if stack:
    print(f"Sections not closed starting from: {stack}")
