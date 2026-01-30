
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

def count_in_range(start_line, end_line):
    lines = text.splitlines()
    sub = "\n".join(lines[start_line-1:end_line])
    # Remove comments
    sub = re.sub(r'\{/\*.*?\*/\}', '', sub)
    # Remove strings
    sub = re.sub(r'".*?"', '""', sub)
    sub = re.sub(r'`.?`', '``', sub)
    
    do = len(re.findall(r'<div', sub))
    dc = len(re.findall(r'</div>', sub))
    po = sub.count("(")
    pc = sub.count(")")
    bo = sub.count("{")
    bc = sub.count("}")
    return do, dc, po, pc, bo, bc

print("Home block (275-975):")
do, dc, po, pc, bo, bc = count_in_range(275, 975)
print(f"  Divs: {do}/{dc}, Parens: {po}/{pc}, Braces: {bo}/{bc}")

print("Signup block (1471-1756):")
do, dc, po, pc, bo, bc = count_in_range(1471, 1756)
print(f"  Divs: {do}/{dc}, Parens: {po}/{pc}, Braces: {bo}/{bc}")

print("Full Main block (268-1762):")
do, dc, po, pc, bo, bc = count_in_range(268, 1762)
print(f"  Divs: {do}/{dc}, Parens: {po}/{pc}, Braces: {bo}/{bc}")
mo = len(re.findall(r'<main', text))
mc = len(re.findall(r'</main>', text))
print(f"  Main: {mo}/{mc}")
fo = len(re.findall(r'<footer', text))
fc = len(re.findall(r'</footer>', text))
print(f"  Footer: {fo}/{fc}")
