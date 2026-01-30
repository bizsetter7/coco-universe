
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Target line around 1766
        # Content: '              ))}\n'
        # We want: '              )}\n'
        
        found = False
        for i, line in enumerate(lines):
            # Check range to be safe (1760 ~ 1780)
            if 1760 <= i <= 1780:
                if '))}' in line:
                    lines[i] = line.replace('))}', ')}')
                    found = True
                    print(f"Fixed paren at line {i+1}")
                    break
        
        if found:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Successfully patched file.")
        else:
            print("Target paren pattern not found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
