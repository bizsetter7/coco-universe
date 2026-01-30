
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: Home end (swap )} and </div>)
# Search: </div>\s*</div>\s*\)\}\s*</div>
# Replace: </div>\s*</div>\s*</div>\s*\)\}
content = re.sub(r'(</div>\s*</div>)\s*(\)\})\s*(</div>)', r'\1\3\2', content)

# Pattern 2: Signup end (add missing </div> and )} before </main>)
# Search: </div>\s*(\)\})\s*</main>
# Replace: </div>\s*\1\s*</div>\s*\)\}\s*</main>
content = re.sub(r'(</div>\s*\)\})\s*(</main>)', r'\1\n                </div>\n              )\n            }\n      \2', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Repair v3 complete.")
