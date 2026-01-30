
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
stack = []

for i, line in enumerate(lines):
    for j, char in enumerate(line):
        if char == '{':
            balance += 1
            stack.append((i + 1, j + 1))
        elif char == '}':
            balance -= 1
            if stack:
                stack.pop()

print(f"Brace Balance: {balance}")
if balance > 0:
    print("Unclosed Braces at:")
    for pos in stack[-balance:]:
        print(f"Line {pos[0]}, Col {pos[1]}")
elif balance < 0:
    print(f"Extra closing braces found (count: {-balance})")
    # Finding location of extra brace is harder without tracking pops, but negative balance indicates it.
