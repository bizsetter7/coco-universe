
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_line = 1477
end_line = 1743

print(f"Checking lines {start_line} to {end_line}")

balance = 0
stack = []

for i in range(start_line - 1, end_line):
    line = lines[i]
    for j, char in enumerate(line):
        if char == '(':
            balance += 1
            stack.append((i + 1, j + 1))
        elif char == ')':
            balance -= 1
            if stack:
                stack.pop()

print(f"Balance in range: {balance}")
if balance > 0:
    print("Unclosed Parens in range:")
    for pos in stack:
        print(f"Line {pos[0]}, Col {pos[1]}")
