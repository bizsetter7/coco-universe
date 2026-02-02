
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if "return (" in lines[i] and "<div className={`min-h-screen" in lines[i+1]:
        print(f"Fixing line {i+2}")
        lines[i+1] = '        <div className="w-full">\\n'
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Successfully updated the file.")
