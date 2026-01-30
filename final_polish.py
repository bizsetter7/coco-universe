
filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Fix main closing tag
    line = line.replace('}</main >', '}</main>')
    
    # Fix footer extra brace
    if line.strip() == '}>':
        line = line.replace('}>', '>')
        
    # Fix broken tailwind classes
    line = line.replace('text - ', 'text-')
    line = line.replace('cursor - ', 'cursor-')
    line = line.replace('whitespace - ', 'whitespace-')
    line = line.replace('font - ', 'font-')
    line = line.replace('border - ', 'border-')
    line = line.replace('bg - ', 'bg-')
    line = line.replace('justify - ', 'justify-')
    line = line.replace('py - ', 'py-')
    line = line.replace('transition - ', 'transition-')
    
    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Final polish complete.")
