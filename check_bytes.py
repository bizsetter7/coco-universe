
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'rb') as f:
    f.seek(0, os.SEEK_END)
    size = f.tell()
    f.seek(max(0, size - 100))
    last_bytes = f.read()

print(f"Last bytes: {last_bytes}")
print(f"Last bytes (ORD): {[int(b) for b in last_bytes]}")
