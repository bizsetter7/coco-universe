
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
last_popped = None
last_closer_pos = None

for i, line in enumerate(lines):
    for j, char in enumerate(line):
        if char == '(':
            stack.append((i + 1, j + 1))
        elif char == ')':
            if stack:
                last_popped = stack.pop()
                last_closer_pos = (i + 1, j + 1)

print(f"Items remaining in stack: {len(stack)}")
for item in stack:
    print(f"Unclosed: Line {item[0]}, Col {item[1]}")

if last_popped:
    print(f"Last pair closed: Open at {last_popped} by Close at {last_closer_pos}")
