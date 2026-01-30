
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Target: line with 3 closing divs AND a closing paren )
        # Content: '            </div></div></div>)\n'
        # Goal:    '            </div>)\n'
        
        found = False
        for i, line in enumerate(lines):
            if '</div></div></div>)' in line:
                lines[i] = line.replace('</div></div></div>)', '</div>)')
                found = True
                print(f"Reduced divs to 1 at line {i+1}")
                break
                
        if found:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Successfully patched file.")
        else:
            print("Target line not found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
