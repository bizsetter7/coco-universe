
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Target: line with div chain and )} at the end.
        # Current state: '            </div>...</div>)}\n'
        # Goal: '            )</div>...</div>)}\n'
        
        found = False
        for i, line in enumerate(lines):
            if '</div></div></div></div></div>)}' in line:
                # Add ) before the divs? 
                # No, wait. 
                # Indentation matter?
                # The line starts with spaces.
                # We want ) to be at the start of code content.
                
                leading_spaces = line[:line.find('<')]
                rest = line[line.find('<'):]
                
                # new_line = leading_spaces + ')' + rest
                # Actually, Step 3 closing paren ) should probably be on its own line for readability, but for syntax fixing:
                
                # Let's split it nicely.
                # line i: leading_spaces + ')\n'
                # line i+1: leading_spaces + rest
                
                lines[i] = leading_spaces + ')\n' + leading_spaces + rest
                
                found = True
                print(f"Fixed structure at line {i+1}")
                break
                
        if found:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Successfully patched file.")
        else:
            print("Target div chain not found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
