
import os
import re

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        old_content = content
        
        # Remove spaces in closing tags
        # regex is safer for variable spaces
        content = re.sub(r'</div\s+>', '</div>', content)
        content = re.sub(r'</nav\s+>', '</nav>', content)
        content = re.sub(r'</footer\s+>', '</footer>', content)
        
        # fix opening tag spaces if any left
        content = re.sub(r'<\s+footer', '<footer', content)
        content = re.sub(r'<\s+nav', '<nav', content)
        
        if content != old_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Successfully cleaned up tags.")
        else:
            print("No malformed tags found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
