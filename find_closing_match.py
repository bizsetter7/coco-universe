
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

target_line = 1766 
# Note: target_line is 1-based index from grep/view. 
# But in python list it is lines[1765].
# Also debug output step 11243 showed:
# 1765: '...</div>\n'
# 1766: '}</main>\n'
# So the closing brace is indeed on line 1766.

stack = []
found_match = None

for i, line in enumerate(lines):
    for j, char in enumerate(line):
        if char == '{':
            stack.append((i + 1, j + 1))
        elif char == '}':
            if stack:
                opener = stack.pop()
                # Check if this closer is the one at target_line
                if (i + 1) == target_line and char == '}':
                    # Assuming it's the first brace on the line?
                    # The line is '}</main>\n'. The brace is at index 0.
                    # Let's confirm column.
                    if j == 0:
                        found_match = opener
                        print(f"Brace at {i+1},{j+1} closes {opener}")

if not found_match:
    print("Target brace not found or not matched?")
