
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Full Audit Report:")
for i, line in enumerate(lines):
    if "!isMounted" in line:
        print(f"Line {i+1}: {line.strip()}")
        # Show context
        for j in range(max(0, i-2), min(len(lines), i+3)):
            print(f"  {j+1}: {lines[j].strip()}")

print("\n--- Tag Balance Check ---")
content = "".join(lines)
opens = len(re.findall(r'<div', content))
closes = len(re.findall(r'</div>', content))
print(f"Divs: {opens} / {closes}")

parens = content.count("(") - content.count(")")
braces = content.count("{") - content.count("}")
print(f"Parens delta: {parens}")
print(f"Braces delta: {braces}")
