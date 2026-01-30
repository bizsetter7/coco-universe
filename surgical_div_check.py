
import re

with open('C:/My-site/통합사이트/브랜드_통합_시스템/src/app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

range_start = 1196
range_end = 1563

balance = 0
for i in range(range_start - 1, range_end):
    line = lines[i]
    opens = re.findall(r'<div', line)
    closes = re.findall(r'</div', line)
    
    for _ in opens: balance += 1
    for _ in closes: balance -= 1
    
    if opens or closes:
        print(f"{i+1:4} | Bal={balance:2} | {line.strip()[:60]}")

print(f"\nFinal Balance for range {range_start}-{range_end}: {balance}")
