
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        found_start = False
        found_anchor = False
        fixed_count = 0
        
        for i, line in enumerate(lines):
            # 1. Find start of businessLicense block
            if '{businessLicense ? (' in line and '<>' not in line:
                lines[i] = line.replace('{businessLicense ? (', '{businessLicense ? (<>')
                found_start = True
                print(f"Injecting <> at line {i+1}")
                fixed_count += 1
                
            # 2. Find anchor text
            if '사업자등록증 첨부 (필수)' in line:
                found_anchor = True
                
            # 3. Find closing )} AFTER start and anchor
            if found_start and found_anchor and ')}' in line and '</>' not in line:
                # Check indentation or context to be sure it's the right )}
                # The target )} should be seemingly alone or at end of check
                # line 1670 is '                                )}'
                
                # Careful not to match other )}
                # We can verify it is close to the anchor.
                # Anchor is at ~1668. This matched line should be around i ~ 1670
                
                lines[i] = line.replace(')}', '</>)}')
                print(f"Injecting </> at line {i+1}")
                fixed_count += 1
                
                # Reset flags to prevent double matching if there are multiple similar blocks (unlikely here)
                found_start = False
                found_anchor = False
                
        if fixed_count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print("Successfully patched file.")
        else:
            print("No patterns matched. File unchanged.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
