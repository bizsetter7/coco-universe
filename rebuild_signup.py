
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_mode = False
for i, line in enumerate(lines):
    ln = i + 1
    if "currentPage === 'signup' && (" in line:
        new_lines.append("        {\n")
        new_lines.append("          currentPage === 'signup' && (\n")
        new_lines.append('            <div className="max-w-3xl mx-auto px-4 py-8">\n')
        # Skip original until we find something we know is after
        skip_mode = True
        continue
    
    if skip_mode:
        if "Step 3: 가입완료" in line:
            # Reconstruct the rest manually or find a safe point
            # Let's just fix the closing sequence
            pass
        if "</main>" in line:
            # End of skip
            new_lines.append("            </div>\n")
            new_lines.append("          )\n")
            new_lines.append("        }\n")
            new_lines.append("      </main>\n")
            skip_mode = False
            continue
        if skip_mode:
            new_lines.append(line)
            continue

    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
