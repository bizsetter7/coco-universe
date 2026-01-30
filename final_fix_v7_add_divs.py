
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Target line has 3 divs currently (from fix v4)
        # We need 5 divs.
        
        target_str = '                        </div></div></div>\n'
        replacement_str = '                        </div></div></div></div></div>\n'
        
        found = False
        for i, line in enumerate(lines):
            # Checking loose match in case of indentation changes
            if '</div></div></div>' in line and '</div></div></div></div>' not in line:
                # Make sure it's the right line (around 1765)
                # print(f"Found candidate at {i+1}: {repr(line)}")
                lines[i] = line.replace('</div></div></div>', '</div></div></div></div></div>')
                found = True
                print(f"Added 2 divs at line {i+1}")
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
