
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

blocks = []
in_main = False
main_start = -1

for i, line in enumerate(lines):
    ln = i + 1
    if '<main' in line:
        main_start = ln
        in_main = True
    
    # Simple pattern for currentPage blocks
    match = re.search(r"currentPage === '([a-z]+)' && \(", line)
    if match:
        page_name = match.group(1)
        blocks.append({'name': page_name, 'start': ln})

print(f"Main starts at: {main_start}")
for b in blocks:
    print(f"Block: {b['name']} starts at {b['start']}")

# Find where main ends
for i in range(len(lines) - 1, -1, -1):
    if '</main>' in lines[i]:
        print(f"Main ends at: {i + 1}")
        break

# Find where footer starts
for i, line in enumerate(lines):
    if '<footer' in line:
        print(f"Footer starts at: {i + 1}")
        break
