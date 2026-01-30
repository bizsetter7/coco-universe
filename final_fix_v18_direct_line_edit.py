
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # Verify content at expected lines to avoid catastrophic misalignment
        line_134 = lines[133] # 0-indexed
        if 'if (!isMounted) {' not in line_134:
            print(f"Sanity check failed at line 134: {line_134}")
            return

        line_240 = lines[239] # 0-indexed, but lines might shift if we delete first?
        # No, we haven't deleted yet.
        if 'return (' not in line_240:
             # Try surrounding lines
             found_ret = False
             for i in range(235, 245):
                 if 'return (' in lines[i]:
                     line_240 = lines[i]
                     print(f"Found return at index {i}")
                     found_ret = True
                     break
             if not found_ret:
                 print(f"Sanity check failed at line 240: {line_240}")
                 return
        
        # Safe to proceed.
        # 1. Clear lines 134-136 (indices 133-135)
        # Instead of deleting (shifting indices), let's replace with newlines or comments.
        # But we want to insert elsewhere.
        
        is_mounted_block = "".join(lines[133:136]) # Capture for insertion
        
        lines[133] = "" # 134
        lines[134] = "" # 135
        lines[135] = "" # 136
        
        # 2. Insert before return (
        # Find index of return ( again
        ret_idx = -1
        for i, line in enumerate(lines):
            if 'return (' in line:
                ret_idx = i
                break
        
        if ret_idx != -1:
            lines[ret_idx] = is_mounted_block + "\n" + lines[ret_idx]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Successfully moved isMounted block.")
        else:
            print("Could not find return statement for insertion.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
