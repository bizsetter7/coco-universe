
import re

with open('C:/My-site/통합사이트/브랜드_통합_시스템/src/app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_line = 1125 # currentPage === 'region'
end_line = 1670

balance = 0
for i in range(start_line - 1, end_line):
    line = lines[i]
    opens = len(re.findall(r'<div', line))
    closes = len(re.findall(r'</div', line))
    balance += opens
    balance -= closes
    print(f"{i+1}: Balance={balance} | Line: {line.strip()[:100]}")
