
def check_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                stack.append(i + 1)
            elif char == '}':
                if not stack:
                    print(f"Extra '}}' found at line {i + 1}")
                else:
                    stack.pop()
    
    if stack:
        print(f"Unclosed '{{' found starting at lines: {stack}")

if __name__ == "__main__":
    check_braces(r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx")
