
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
found_mismatch = False

for i, line in enumerate(lines):
    for j, char in enumerate(line):
        if char in '({[':
            stack.append((char, i + 1, j + 1))
        elif char in ')}]':
            if not stack:
                # Stack underflow
                print(f"Stack underflow at Line {i+1}, Col {j+1} with {char}")
                found_mismatch = True
                break
            
            last = stack[-1]
            opener = last[0]
            
            match = False
            if opener == '(' and char == ')': match = True
            elif opener == '{' and char == '}': match = True
            elif opener == '[' and char == ']': match = True
            
            if match:
                stack.pop()
            else:
                print(f"Mismatch at Line {i+1}, Col {j+1}: Expected closing for {opener} (from {last[1]},{last[2]}), got {char}")
                # Don't break, keep going to show subsequent errors?
                # Or break to show first error? First error is most important.
                found_mismatch = True
                break
    if found_mismatch:
        break

if not found_mismatch:
    print("No mismatches found.")
    if stack:
        print("Stack not empty at end:")
        for item in stack:
            print(f"{item[0]} at {item[1]},{item[2]}")
