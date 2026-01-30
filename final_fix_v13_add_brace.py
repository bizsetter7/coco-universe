
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Target: line with just )
        # Content: '            )\n' (indentation varies)
        # Goal:    '            )}\n'
        
        # We need to be careful not to change other ) lines
        # But 1766 is right before the div chain.
        
        found = False
        for i, line in enumerate(lines):
            # Check context: next line has div chain
            if i + 1 < len(lines) and '</div></div></div>)' in lines[i+1]:
                 if line.strip() == ')':
                     lines[i] = line.replace(')', ')}')
                     found = True
                     print(f"Added brace at line {i+1}")
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
