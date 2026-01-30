
import re

with open('C:/My-site/통합사이트/브랜드_통합_시스템/src/app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines):
    clean_line = line.strip()
    if not clean_line: continue
    
    # Simple tag counting
    opens = len(re.findall(r'<div', clean_line))
    # Subtract self-closing divs or components if any? No, just regular divs for now.
    closes = len(re.findall(r'</div', clean_line))
    
    old_balance = balance
    balance += opens
    balance -= closes
    
    if 1120 <= i + 1 <= 1200 or 1550 <= i + 1 <= 1580 or 1660 <= i + 1 <= 1675:
        print(f"{i+1:4} | {old_balance} -> {balance} | {clean_line[:100]}")
