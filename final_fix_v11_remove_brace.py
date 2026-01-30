
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Target: line ending with )}
        # We want to change it to )
        
        found = False
        for i, line in enumerate(lines):
            if '</div></div></div></div></div>)}' in line:
                # Replace last )} with )
                lines[i] = line.replace(')}', ')')
                found = True
                print(f"Removed redundant brace at line {i+1}")
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
