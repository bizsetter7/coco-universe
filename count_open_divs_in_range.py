
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_line = 1477
end_line = 1743

open_count = 0
close_count = 0

print(f"Checking divs in lines {start_line} to {end_line}")

for i in range(start_line - 1, end_line):
    line = lines[i]
    open_count += line.count('<div')
    close_count += line.count('</div>')

print(f"Open: {open_count}")
print(f"Close: {close_count}")
print(f"Net Open: {open_count - close_count}")
