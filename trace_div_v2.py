
import re

with open('C:/My-site/통합사이트/브랜드_통합_시스템/src/app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines):
    opens = len(re.findall(r'<div', line))
    closes = len(re.findall(r'</div', line))
    balance += opens
    balance -= closes
    # Only print interesting range
    if 1125 <= i + 1 <= 1130 or 1175 <= i + 1 <= 1200 or 1550 <= i + 1 <= 1580 or 1660 <= i + 1 <= 1675:
        print(f"{i+1}: Bal={balance} | {line.strip()[:80]}")
