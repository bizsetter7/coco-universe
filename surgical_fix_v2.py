
import os

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_indices = set()

for i, line in enumerate(lines):
    # 1. Top level shield insertion
    if "  return (" in line and i < 300: # Ensure we are in the main component return
        new_lines.append("  if (!isMounted) {\n")
        new_lines.append("    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;\n")
        new_lines.append("  }\n\n")
        new_lines.append("  return (\n")
        continue

    # 2. Root div background & theme fix
    if 'className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden`}' in line:
        new_lines.append('    <div className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden ${brand.theme === \'dark\' ? \'bg-gray-900 text-white\' : \'bg-white text-black\'}`}>\n')
        continue

    # 3. Handle the main ternary removal
    if '<main className="w-full">' in line:
        new_lines.append(line)
        # Skip the next 6 lines of the ternary if they match
        if "!isMounted ?" in lines[i+1]:
            skip_indices.update(range(i+1, i+7))
        continue

    # 4. Handle the messy end of main
    if '</div></div></div></div>)' in line and '</main>' in line:
        # Replace the mess with clean closing for the last page block (signup)
        new_lines.append("                </div>\n")
        new_lines.append("              )}\n")
        new_lines.append("      </main>\n")
        continue

    # 5. Skip lines marked for removal
    if i in skip_indices:
        continue
        
    # 6. Cleanup previous messed up lines (if any)
    if "</>" in line and i > 1700:
        continue
    if ")}" in line and i > 1700 and "</main>" in "".join(lines[i:i+5]):
        continue

    # 7. General cleanup
    line = line.replace('</footer >', '</footer>')
    line = line.replace('</nav >', '</nav>')
    line = line.replace('</div >', '</div>')
    
    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Structural repair v2 complete. Processed {len(new_lines)} lines.")
