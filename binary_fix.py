
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'rb') as f:
    data = f.read()

# Find the LAST '}' (byte 125)
last_brace_idx = data.rfind(b'}')

if last_brace_idx != -1:
    # Truncate after the last brace (include the brace)
    fixed_data = data[:last_brace_idx + 1]
    
    with open(file_path, 'wb') as f:
        f.write(fixed_data)
        f.write(b'\\n') # Add a clean newline
    
    print(f"Truncated file at byte {last_brace_idx}. Original size: {len(data)}, New size: {len(fixed_data) + 1}")
else:
    print("Could not find any brace in the file!")
