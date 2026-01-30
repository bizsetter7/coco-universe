
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Target lines based on debug output (1-indexed to 0-indexed)
        # 1764: '              )}\n'
        # 1765: '                        </div></div></div></div></div></div></div>\n'
        
        # Adjust indices if needed. 1764 -> index 1763
        line_1764_idx = 1763
        line_1765_idx = 1764
        
        # Verify content to be super safe
        if ')}' in lines[line_1764_idx] and '</div></div></div></div></div></div></div>' in lines[line_1765_idx]:
             lines[line_1764_idx] = lines[line_1764_idx].replace(')}', '))}')
             lines[line_1765_idx] = lines[line_1765_idx].replace('</div></div></div></div></div></div></div>', '</div></div></div></div></div></div></div></div></div></div></div>')
             
             with open(file_path, 'w', encoding='utf-8') as f:
                 f.writelines(lines)
             print("Successfully patched file.")
        else:
             print("Target lines mismatch.")
             print(f"1764: {repr(lines[line_1764_idx])}")
             print(f"1765: {repr(lines[line_1765_idx])}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
