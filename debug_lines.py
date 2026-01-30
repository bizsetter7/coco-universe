
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    start_line = 1760
    end_line = 1840
    
    print(f"--- Printing lines {start_line} to {end_line} ---")
    for i in range(start_line - 1, min(len(lines), end_line)):
        print(f"{i+1}: {repr(lines[i])}")
        
except Exception as e:
    print(f"Error: {e}")
