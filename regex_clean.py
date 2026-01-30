
import re
import os

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Regex Cleanup of Tags
content = re.sub(r'<\s*footer', '<footer', content)
content = re.sub(r'<\s*/\s*footer\s*>', '</footer>', content)
content = re.sub(r'<\s*nav', '<nav', content)
content = re.sub(r'<\s*/\s*nav\s*>', '</nav>', content)
content = re.sub(r'<\s*main', '<main', content)
content = re.sub(r'<\s*/\s*main\s*>', '</main>', content)
content = re.sub(r'<\s*div', '<div', content)
content = re.sub(r'<\s*/\s*div\s*>', '</div>', content)

# 2. Fix known bad patterns
content = content.replace('text - ', 'text-')
content = content.replace('cursor - ', 'cursor-')
content = content.replace('className =', 'className=')

# 3. Check Balance
opens = content.count('{')
closes = content.count('}')
delta = opens - closes

print(f"Braces Delta before fix: {delta}")

if delta == -1:
    # One extra closing brace. Likely near </main> or end of file.
    # We look for `}</main>` or `)}</main>` and change to `</main>` or `)</main>`
    # But wait, we fixed this before?
    if '}</main>' in content:
        content = content.replace('}</main>', '</main>', 1)
        print("Removed extra } before </main>")
    elif ')}</main>' in content:
        # If ) is also extra? parens delta?
        p_opens = content.count('(')
        p_closes = content.count(')')
        p_delta = p_opens - p_closes
        print(f"Parens Delta: {p_delta}")
        if p_delta == 0:
            # Parens balanced, but brace extra.
            content = content.replace(')}</main>', ')</main>', 1)
            print("Removed extra } from )}</main>")
        else:
            # Maybe removing ) and } is needed?
            pass

# 4. Remove duplicate )} if exists
content = content.replace(')})', '))') # rare but possible

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Regex clean complete. New len: {len(content)}")
