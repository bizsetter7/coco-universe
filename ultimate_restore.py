
import os

src = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(src, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = {269, 270, 271, 272, 273, 274, 1758, 1759}

for i, line in enumerate(lines):
    ln = i + 1
    
    if ln == 234:
        new_lines.append("  if (!isMounted) {\n")
        new_lines.append("    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;\n")
        new_lines.append("  }\n\n")
        new_lines.append("  return (\n")
        continue

    if ln == 235:
        line = line.replace("pb-20 overflow-x-hidden`}", "pb-20 overflow-x-hidden ${brand.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}")
        new_lines.append(line)
        continue
    
    if ln in skip:
        continue
    
    if ln == 1763:
        line = line.replace("< footer", "<footer")
        new_content = line
        new_lines.append(new_content)
        continue

    # Clean up the very end
    if ln >= 1831:
        continue

    new_lines.append(line)

new_lines.append("    </div>\n")
new_lines.append("  );\n")
new_lines.append("}\n")

with open(src, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
