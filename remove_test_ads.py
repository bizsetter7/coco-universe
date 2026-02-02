import json
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\lib\data\shops.json'

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    try:
        data = json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        exit(1)

initial_count = len(data)

# Filter out test entries
# 1. ID starts with "test-"
# 2. Name contains "테스트"
filtered_data = [
    shop for shop in data 
    if not (
        (shop.get('id') and str(shop.get('id')).startswith('test-')) or 
        (shop.get('name') and '테스트' in str(shop.get('name')))
    )
]

removed_count = initial_count - len(filtered_data)

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, ensure_ascii=False, indent=2)

print(f"Initial entries: {initial_count}")
print(f"Removed entries: {removed_count}")
print(f"Remaining entries: {len(filtered_data)}")
