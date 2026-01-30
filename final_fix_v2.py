
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        old_content = content
        
        # 1. Fix the specific div chain with spaces and trailing paren
        target_div_chain = '</div></div ></div ></div ></div ></div ></div >)'
        replacement_div_chain = '            </div></div></div></div></div></div></div>'
        content = content.replace(target_div_chain, replacement_div_chain)
        
        # 2. Fix main closing tag
        content = content.replace('}</main >', '}</main>')
        
        # 3. Fix footer and nav tags (spaces)
        content = content.replace('< footer', '<footer')
        content = content.replace('</footer >', '</footer>')
        content = content.replace('< nav', '<nav')
        content = content.replace('</nav >', '</nav>')
        
        # 4. Fix general div closing tags with spaces
        content = content.replace('</div >', '</div>')
        
        if content != old_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Successfully patched file.")
        else:
            print("No patterns matched. File unchanged.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
