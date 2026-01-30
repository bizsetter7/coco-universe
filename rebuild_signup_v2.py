
filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_signup = False
signup_start_line = -1

for i, line in enumerate(lines):
    ln = i + 1
    if "currentPage === 'signup' && (" in line:
        # We find the start. We want to keep everything but fix the very end.
        in_signup = True
        signup_start_line = ln
    
    if in_signup and "</main>" in line:
        # We are at the end of the signup block.
        # We need to make sure we close the div and the expressions.
        # But first, we need to remove the broken tags we added.
        # The last few lines before </main> were broken.
        while new_lines and ("</div>" in new_lines[-1] or ")} " in new_lines[-1] or ")" in new_lines[-1] or "}" in new_lines[-1]):
             new_lines.pop()
        
        new_lines.append("                  </div>\n")
        new_lines.append("                )\n")
        new_lines.append("              }\n")
        new_lines.append("      </main>\n")
        in_signup = False
        continue

    if not in_signup or (in_signup and "</main>" not in line):
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
