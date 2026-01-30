
import os
import re

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        new_lines = []
        count = 0
        
        # Modifiers list
        modifiers = [
            'sm', 'md', 'lg', 'xl', '2xl', 
            'hover', 'focus', 'active', 'visited', 'disabled', 
            'group-hover', 'focus-within', 'dark',
            'first', 'last', 'odd', 'even'
        ]
        
        for line in lines:
            if 'className' in line:
                original = line
                fixed = line
                
                # 1. Fix "mod: class" -> "mod:class"
                for mod in modifiers:
                    # Replace "sm: " with "sm:"
                    # Be careful if it matches text content? 
                    # Generally "sm: " inside className is meant to be a modifier.
                    fixed = fixed.replace(f'{mod}: ', f'{mod}:')
                    
                    # Also "sm : " -> "sm:" (if space before colon still exists)
                    fixed = fixed.replace(f'{mod} : ', f'{mod}:')
                    fixed = fixed.replace(f'{mod} :', f'{mod}:')

                # 2. Fix merged classes after bracket "]-sm:" -> "] sm:"
                # Regex: `]([a-zA-Z])` -> `] \1`
                fixed = re.sub(r'\]([a-zA-Z])', r'] \1', fixed)
                
                # 3. Fix "sm:p-4" space? (Already handled by 1)
                
                # 4. Check for " - " again just in case?
                fixed = fixed.replace(' - ', '-')
                
                if fixed != original:
                    count += 1
                    line = fixed
            
            new_lines.append(line)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
            
        print(f"Refined styles in {count} lines.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
