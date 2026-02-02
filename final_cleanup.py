
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Regular expression to find the last '}' and remove everything after it
import re
fixed_text = re.sub(r'\}\s*\\n\s*$', '}', text.strip())

# Make sure it ends with exactly:
#     );
# }

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(fixed_text + "\\n")

print("Successfully truncated the file at the last brace.")
