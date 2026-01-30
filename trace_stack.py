
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

target_line = 1833
stack = []

# Simple parser: ignores comments/strings for speed, assuming syntax structure is main issue
# If comments/strings are unbalanced, this might give false positives, but let's try.

for i, line in enumerate(lines):
    if (i + 1) > target_line:
        break
        
    for j, char in enumerate(line):
        if char in '({[':
            stack.append((char, i + 1, j + 1))
        elif char in ')}]':
            if not stack:
                continue # Parsing error or extra closer, ignore for now
                
            last = stack[-1]
            if (last[0] == '(' and char == ')') or \
               (last[0] == '{' and char == '}') or \
               (last[0] == '[' and char == ']'):
                stack.pop()
            else:
                # Mismatch?
                pass

print(f"Stack at end of line {target_line}:")
for item in stack:
    print(f"Open {item[0]} at Line {item[1]}, Col {item[2]}")
