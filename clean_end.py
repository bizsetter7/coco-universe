
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Clean Up: replace any stray '\n' or ' \n' at the very end with just '}' and a clean newline
# The pattern should be the ending of the component:
#     );
# }

import re
fixed_text = re.sub(r'\}\s*\\n\s*$', '}\\n', text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(fixed_text.strip() + "\\n")

print("Successfully cleaned up the end of the file.")
