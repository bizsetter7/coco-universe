
filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Home block starts at 275 (index 274)
# Current end is at 975 (index 974)
part = "".join(lines[274:976])

div_opens = part.count("<div")
div_closes = part.count("</div>")
paren_opens = part.count("(")
paren_closes = part.count(")")
brace_opens = part.count("{")
brace_closes = part.count("}")

print(f"Divs: {div_opens} / {div_closes}")
print(f"Parens: {paren_opens} / {paren_closes}")
print(f"Braces: {brace_opens} / {brace_closes}")
