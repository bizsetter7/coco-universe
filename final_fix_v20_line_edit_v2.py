
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Target lines based on view_file 11955:
        # 136:   if (!isMounted) {
        # 137:     return <div ...
        # 138:   }
        # indices: 135, 136, 137
        
        # Verify content to be super safe
        if 'if (!isMounted) {' not in lines[135]:
            print(f"Index mismatch at 135: {lines[135]}")
            # Try to search nearby? No, manual fix assumes static file.
            return

        # Prepare block to insert
        is_mounted_block = "".join(lines[135:138])
        
        # Clear lines
        lines[135] = ""
        lines[136] = ""
        lines[137] = ""
        
        # Target insert line based on view_file 11956:
        # 243:   return (
        # index: 242
        
        if 'return (' not in lines[242]:
             print(f"Index mismatch at 242: {lines[242]}")
             # Search for return (
             for i in range(235, 250):
                 if 'return (' in lines[i]:
                     print(f"Found return at {i}")
                     lines[i] = is_mounted_block + "\n" + lines[i]
                     break
        else:
             lines[242] = is_mounted_block + "\n" + lines[242]
             
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Patched file via v20 successfully.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
