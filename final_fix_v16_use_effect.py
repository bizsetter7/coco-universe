
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # 1. Remove if (!isMounted) ... from useEffect
        # Pattern: if (!isMounted) { ... return <div ... /> ... }
        # It's multi-line.
        
        # 2. Insert it before return (
        # Pattern: const primaryBgStyle = ...;
        
        is_mounted_block = []
        start_idx = -1
        end_idx = -1
        
        # Scan for isMounted block
        for i, line in enumerate(lines):
            if 'if (!isMounted) {' in line:
                start_idx = i
            if start_idx != -1 and '}' in line and i > start_idx: # simple heuristic for one-block closure
                # Check if it contains return <div
                # lines[start_idx:i+1]
                content = "".join(lines[start_idx:i+1])
                if 'return <div' in content:
                    end_idx = i
                    is_mounted_block = lines[start_idx:i+1]
                    break
        
        if start_idx != -1 and end_idx != -1:
            print(f"Found isMounted block at {start_idx+1}-{end_idx+1}")
            
            # Remove lines from start_idx to end_idx
            # But we need to insert them somewhere else.
            # Insert point: before 'return ('
            
            insert_idx = -1
            for i, line in enumerate(lines):
                if 'return (' in line:
                    insert_idx = i
                    break
            
            # Check if valid insert point found
            if insert_idx != -1:
                 # Modify lines list
                 # First delete (be careful with indices shifting)
                 # Better to create new list
                 
                 new_lines = []
                 for i, line in enumerate(lines):
                     if i >= start_idx and i <= end_idx:
                         continue # Skip removed lines
                     
                     if i == insert_idx:
                         # Insert block here
                         new_lines.extend(is_mounted_block)
                         new_lines.append('\n') # Add spacing
                         new_lines.append(line) # Add the return ( line
                     else:
                         new_lines.append(line)
                 
                 with open(file_path, 'w', encoding='utf-8') as f:
                     f.writelines(new_lines)
                 print(f"Moved block to line {insert_idx+1}")
            else:
                print("Insert point (return () pattern) not found.")
        else:
            print("isMounted block not found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
