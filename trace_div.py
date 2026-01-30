
import re

with open('C:/My-site/통합사이트/브랜드_통합_시스템/src/app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines):
    opens = len(re.findall(r'<div', line))
    closes = len(re.findall(r'</div', line))
    balance += opens
    balance -= closes
    if 1120 <= i + 1 <= 1680:
        print(f"{i+1}: Bal={balance} | {line.strip()[:60]}")
