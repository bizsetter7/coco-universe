
import os

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    ln = i + 1
    
    # 1. Remove redundant ternaries at the start of <main>
    if ln == 269:
        if "{!isMounted ? (" in lines[i]:
            # Skip until the start of home block (line 275)
            # Lines to skip: 269, 270, 271, 272, 273, 274
            i += 6
            continue
    
    # 2. Cleanup transition between Home and Payment (stray curly/paren)
    if ln == 984:
        if lines[i].strip() == ")" and lines[i+1].strip() == "}":
            i += 2
            continue

    # 3. Cleanup messy closing at the end of signup
    if ln == 1760:
        if "</>" in lines[i] and ")}" in lines[i+1]:
            i += 2
            continue

    # 4. Critical fix for the "mess" line
    if ln == 1762:
        new_lines.append("      </main>\n")
        i += 1
        continue
    
    # 5. Fix Footer spaces
    curr_line = lines[i]
    if "< footer" in curr_line:
        curr_line = curr_line.replace("< footer", "<footer")
    
    # Also fix any extra closing tags in mobile nav that might have been added by mistake
    if ln == 1825:
        curr_line = curr_line.replace("</nav >", "</nav>")
    if ln == 1826:
        curr_line = curr_line.replace("</div >", "</div>")
    if ln == 1830:
        curr_line = curr_line.replace("</div >", "</div>")

    new_lines.append(curr_line)
    i += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Structural repair complete. Processed {len(new_lines)} lines.")
