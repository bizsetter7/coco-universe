
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert isMounted shield
# Find 'const primaryBgStyle = { backgroundColor: brand.primaryColor };'
shield_insertion = r"""
  if (!isMounted) {
    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;
  }

  return ("""

content = content.replace("  return (", shield_insertion, 1)

# 2. Fix root div background
content = content.replace('className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden`}', 
                          'className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden ${brand.theme === \'dark\' ? \'bg-gray-900 text-white\' : \'bg-white text-black\'}`}')

# 3. Remove internal ternary and fragment entirely
# We look for the <main> start and its ternary
pattern = re.compile(r'(<main className="w-full">)\s*\{!isMounted \? \(.*?\)\s*:\s*\(\s*<>\s*(.*?)\s*</>\s*\)\s*\}\s*(</main>)', re.DOTALL)
content = pattern.sub(r'\1\n\2\n      \3', content)

# 4. Fix footer space
content = content.replace("< footer", "<footer")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Perfect restore complete.")
