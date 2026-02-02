
import os

file_path = r'c:\My-site\통합사이트\브랜드_통합_시스템\src\app\customer-center\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Look for the double </div> after the sidebar section
for i in range(len(lines) - 5):
    if "한정 광고주의 연장 우선권" in lines[i]:
        # We found the sidebar text. The </div> is shortly after.
        for j in range(i, i + 10):
            if "</div>" in lines[j] and "</div>" in lines[j+1]:
                print(f"Found double </div> at lines {j+1} and {j+2}")
                # Remove lines[j+1]
                del lines[j+1]
                break
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Successfully removed the extra div.")
