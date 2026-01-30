
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

target_line = 1766

stack = []
found_match = None

for i, line in enumerate(lines):
    for j, char in enumerate(line):
        if char == '(':
            stack.append((i + 1, j + 1))
        elif char == ')':
            if stack:
                opener = stack.pop()
                # Check if this closer is the one at target_line
                if (i + 1) == target_line:
                    # Depending on indentation, we want the first ')'
                    # line content expected: '              )}\n'
                    # ) is at index ~14?
                    found_match = opener
                    print(f"Paren at {i+1},{j+1} closes {opener}")
                    # We only care about the first one for now
                    break
    if found_match:
        break

if not found_match:
    print("Target paren not found or not matched?")
