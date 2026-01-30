
import os

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_indices = set()

# Targeted search for the main ternary
for i, line in enumerate(lines):
    if '<main className="w-full">' in line:
        # Check next lines for the ternary
        if '!isMounted ? (' in lines[i+1]:
            # This is the block we want to clean
            skip_indices.add(i+1) # {!isMounted ? (
            skip_indices.add(i+2) # <div min-h-screen...
            skip_indices.add(i+3) # {/* Simple...
            skip_indices.add(i+4) # </div>
            skip_indices.add(i+5) # ) : (
            skip_indices.add(i+6) # <>
            
            # Find the closing part (usually at the end of the file)
            for j in range(len(lines)-1, i, -1):
                if '</main>' in lines[j]:
                    if ')}' in lines[j-1] and '</>' in lines[j-2]:
                        skip_indices.add(j-1)
                        skip_indices.add(j-2)
                        break

for i, line in enumerate(lines):
    if i in skip_indices:
        continue
    
    # Apply flicker fix at the top return
    if "  return (" in line and "if (!isMounted)" not in "".join(new_lines[-5:]):
        new_lines.append("  if (!isMounted) {\n")
        new_lines.append("    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;\n")
        new_lines.append("  }\n\n")
        
    if 'className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden`}' in line:
        line = line.replace('className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden`}', 
                            'className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden ${brand.theme === \'dark\' ? \'bg-gray-900 text-white\' : \'bg-white text-black\'}`}')
    
    if '< footer' in line:
        line = line.replace('< footer', '<footer')

    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Super cleaner v2 finished. Processed {len(new_lines)} lines.")
