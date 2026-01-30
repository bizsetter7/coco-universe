
import os

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.readlines()

new_content = []
skippable = {269, 270, 271, 272, 273, 274, 1760, 1761}

for i, line in enumerate(content):
    ln = i + 1
    
    # 1. isMounted shield
    if ln == 234:
        new_content.append("  if (!isMounted) {\n")
        new_content.append("    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`} />;\n")
        new_content.append("  }\n\n")
        new_content.append("  return (\n")
        continue

    # 2. Root div background
    if ln == 235:
        line = line.replace("pb-20 overflow-x-hidden`}", "pb-20 overflow-x-hidden ${brand.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}")
        new_content.append(line)
        continue

    # 3. Skip internal ternary tags
    if ln in skippable:
        continue

    # 4. Fix footer space
    if ln == 1765:
        line = line.replace("< footer", "<footer")
        new_content.append(line)
        continue

    new_content.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_content)

print(f"Restoration complete. Processed {len(new_content)} lines.")
