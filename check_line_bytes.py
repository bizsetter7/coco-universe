
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def print_line_bytes(line_num):
    if line_num <= len(lines):
        line = lines[line_num - 1]
        print(f"Line {line_num}: {repr(line)}")
        print(f"Bytes: {[ord(c) for c in line]}")

print_line_bytes(1009)
print_line_bytes(1108)
print_line_bytes(1109)
