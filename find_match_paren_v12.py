
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

targets = [1766, 1767]

for target_line in targets:
    stack = []
    found_match = None
    
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '(':
                stack.append((i + 1, j + 1))
            elif char == ')':
                if stack:
                    opener = stack.pop()
                    if (i + 1) == target_line:
                        # Print all matches on this line?
                        # Or just the one closing the block we care about?
                        # 1767 has '</div></div></div>)' -> It's at the end.
                        found_match = opener
                        print(f"Paren at {i+1},{j+1} closes {opener}")
                        
    if not found_match:
        print(f"Target paren at line {target_line} not found or not matched?")
