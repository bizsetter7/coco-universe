
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # 1. Clean up useEffect (lines ~132-136 based on view_file)
        # Content to remove:
        #     }
        # 
        #     if (!isMounted) {
        #       return <div ... />;
        # 
        
        # We can iterate and find lines to remove.
        # But indices change.
        # We'll build a new list.
        
        new_lines = []
        is_mounted_code = [] # To store for insertion
        
        # We know exactly what to insert, so we don't need to extract it dynamically if we are sure.
        # But scanning is safer.
        
        skip = False
        
        for i, line in enumerate(lines):
            # Identification of garbage lines
            if line.strip() == '}' and i > 130 and i < 135: # line 132
                continue
            if 'if (!isMounted) {' in line and i > 130 and i < 140:
                # This is the block to move.
                # Capture subsequent lines until }
                # Actually, based on view 11886:
                # 134: if (!isMounted) {
                # 135:   return <div ... />
                # 136: 
                # It doesn't show closing } in view 11886. 
                # Ah, line 135 ends with />; 
                # Did it have a separate } line?
                # view_file 11886 shows: 
                # 135: return <div ... />;
                # 136: 
                # 137: return () => ...
                # Where is the closing } for if?
                # Maybe it was on line 135? `... /> }`? Or missing?
                # If missing, that's another syntax error.
                
                # Let's just skip these lines and construct valid code for insertion later.
                skip = True
                continue
            
            if skip:
                if 'return () =>' in line:
                    skip = False
                    new_lines.append(line)
                else:
                    # check if current line is the closing }
                    if line.strip() == '}':
                        pass # skip
                    elif 'return <div' in line:
                         # extract brand theme logic if possible, or just use hardcoded string based on view
                         pass
            else:
                new_lines.append(line)
                
        # Now insert before return (
        final_lines = []
        inserted = False
        
        insert_code = """
  if (!isMounted) {
    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;
  }
"""

        for line in new_lines:
            if 'return (' in line and not inserted:
                final_lines.append(insert_code)
                final_lines.append(line)
                inserted = True
            else:
                final_lines.append(line)
                
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(final_lines)
        print("Patched file successfully.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
