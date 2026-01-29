import re

file_path = r'c:\Users\K\OneDrive\Desktop\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
current_page_pattern = re.compile(r'\{currentPage === \'(\w+)\' && \(')
closing_pattern = re.compile(r'^\s*(\)\s*\}|\}\s*\)\s*;| \)\s*\})')

# We will look for page boundaries and fix indentation
# main is at 6 spaces (line 250)
# pages should start and end at 8 spaces

for i, line in enumerate(lines):
    stripped = line.strip()
    
    # Root div (217) and main (250) are markers
    if i == 216: # Line 217
        new_lines.append('    <div className={`min-h-screen relative pb-20`}>\n')
        continue
    if i == 249: # Line 250
        new_lines.append('      <main>\n')
        continue

    # Page start boundaries
    if 'currentPage ===' in line and '&& (' in line:
        indent = '        '
        new_lines.append(f"{indent}{stripped}\n")
        continue

    # Closing boundaries for pages
    # Usually they look like )} and are at the end of a block
    # We'll identify them by context if possible, or by their proximity to page starts
    
    # Specific fix for the home block end (850)
    if i == 849: # Line 850
        new_lines.append('        )}\n')
        new_lines.append('      </div>\n') # Close page-home div
        new_lines.append('    )}\n') # Wait, this is the one that was 4 spaces
        continue # This logic is hard to automate without a real parser

    new_lines.append(line)

# Let's just do a manual comprehensive string replacement for the critical areas
content = "".join(lines)

# Fix Home/Region transition (848-854)
old_transition = """                )}
              </div>
    )}

              {/* Region Page (Redesigned) */}
              {currentPage === 'region' && ("""

new_transition = """                )}
              </div>
            )}

            {/* Region Page (Redesigned) */}
            {currentPage === 'region' && ("""

# Fix Region/Community transition (1141-1145)
old_community = """                  <RightSidebar />
                </div>
              )}

              {/* 커뮤니티 페이지 */}""" # Wait, I might have messed up the line range

# Actually, I'll just use MultiReplace with EXACT strings and VERY carefully counted spaces.
 f = open(file_path, 'w', encoding='utf-8')
 f.writelines(new_lines)
 f.close()
