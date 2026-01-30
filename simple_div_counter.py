
file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

open_divs = content.count('<div')
# Exclude </div> from startswith <div if simple count is used?
# No, <div is not in </div>
# But wait, content.count('<div') counts '<div' substring.
# '</div>' contains 'div', but not '<div'.
# '</div>' starts with '</'.

close_divs = content.count('</div>')

print(f"Open Divs (<div): {open_divs}")
print(f"Close Divs (</div>): {close_divs}")
print(f"Diff: {open_divs - close_divs}")
