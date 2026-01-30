
import re
import os

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"

print(f"Reading {filepath}...")
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Cleaner Pass: Remove bad isMounted blocks
cleaned_lines = []
skip = 0
for line in lines:
    if skip > 0:
        skip -= 1
        continue
    # Identify the bad blocks (including the one we want to replace properly)
    if "if (!isMounted) {" in line:
        skip = 2 # Skip this line and the next 2 lines (return ...; and })
        continue
    
    # Remove the placeholder div if it's lingering
    if '<div className="min-h-screen bg-white md:bg-gray-50 flex items-center justify-center">' in line:
        skip = 2 # Skip this and the closing div
        continue
        
    cleaned_lines.append(line)

content = "".join(cleaned_lines)

# 2. String Replacements for Main Ternary Removal
# We remove the wrapper logic so main contains content directly
content = content.replace('{!isMounted ? (', '')
content = content.replace(') : (', '')
content = content.replace('<>', '')
content = content.replace('</>', '')
content = content.replace('{/* Simple invisible placeholder to prevent flashes */}', '')

# 3. Fix the closing mess at the end of main
# We expect various forms of closing mess
content = content.replace(')}      </main>', '</main>')
content = content.replace(')} </main>', '</main>')
content = content.replace(')}</main>', '</main>')
content = content.replace(') }      </main>', '</main>')
content = content.replace('</div></div></div></div>) }', '</div></div></div></div>')

# 4. Insert Single Correct Shield
# Look for the main return
if "  return (" in content:
    # Define the shield
    shield = """
  if (!isMounted) {
    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;
  }

  return ("""
    # Replace the first occurrence of "  return (" with shield + "  return ("
    content = content.replace("  return (", shield, 1)

# 5. Fix Footer Typo
content = content.replace("< footer", "<footer")

# 6. Apply Root Div Theme (if not already there)
if 'className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden`}' in content:
    content = content.replace(
        'className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden`}', 
        'className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden ${brand.theme === \'dark\' ? \'bg-gray-900 text-white\' : \'bg-white text-black\'}\'}'
    )
# Fix double brace if accidentally added
content = content.replace("}}'}", "}}")

# 7. Final Cleanup of potential artifacts
content = content.replace('            \n', '') # Empty lines

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Ultimate fix applied successfully.")
