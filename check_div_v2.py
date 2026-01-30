
import re

with open('C:/My-site/통합사이트/브랜드_통합_시스템/src/app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_balance(start_l, end_l):
    balance = 0
    for i in range(start_l - 1, end_l):
        line = lines[i]
        opens = len(re.findall(r'<div', line))
        closes = len(re.findall(r'</div', line))
        balance += opens
        balance -= closes
    return balance

print(f"Start (1125): {get_balance(1, 1125)}") # Expected 1 or 2 (depends on main/header)
print(f"After W1 (1126): {get_balance(1, 1126)}")
print(f"After W2 (1180): {get_balance(1, 1180)}")
print(f"Before Latest Job Info (1566): {get_balance(1, 1566)}")
print(f"Inside mt-8 (1567): {get_balance(1, 1567)}")
print(f"End of Region (1670): {get_balance(1, 1670)}")
