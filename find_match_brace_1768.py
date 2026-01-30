
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

target_line = 1768
# Adjust target line if needed based on recent file views.
# Check content first.

found_brace = False
for i, line in enumerate(lines):
    if (i + 1) == target_line and '}' in line:
        found_brace = True
        break
    if (i + 1) > target_line + 5: # search a bit around
        break
    if (i + 1) >= target_line and '}' in line:
        target_line = i + 1
        found_brace = True
        print(f"Adjusted target line to {target_line}: {repr(line)}")
        break

if not found_brace:
    print(f"No brace found around line {target_line}")
    exit()

stack = []
found_match = None

for i, line in enumerate(lines):
    for j, char in enumerate(line):
        if char == '{':
            stack.append((i + 1, j + 1))
        elif char == '}':
            if stack:
                opener = stack.pop()
                if (i + 1) == target_line and char == '}': # Assuming first brace
                     # If the line is '}</main>', it's the first char.
                     found_match = opener
                     print(f"Brace at {i+1},{j+1} closes {opener}")
                     break
    if found_match:
        break

if not found_match:
    print("Target brace not found or not matched?")
