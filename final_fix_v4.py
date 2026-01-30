
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Line 1765 (0-indexed 1764) has 11 divs.
        # We need to reduce it to 3 divs.
        
        target_idx = 1764
        original_line = lines[target_idx]
        
        if '</div></div></div></div></div></div></div></div></div></div></div>' in original_line:
            # Replace 11 divs with 3 divs
            new_line = original_line.replace(
                '</div></div></div></div></div></div></div></div></div></div></div>',
                '</div></div></div>'
            )
            lines[target_idx] = new_line
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Successfully reduced divs to 3.")
        else:
            print("Target div chain not found.")
            print(f"Line content: {repr(original_line)}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
