
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        # We need to find the line with 5 closing divs (1767 in prev view)
        # And the line with )} (1766 in prev view)
        
        div_line_idx = -1
        paren_line_idx = -1
        
        # Scan last 100 lines
        start_scan = max(0, len(lines) - 200)
        
        for i in range(start_scan, len(lines)):
            line = lines[i]
            if '</div></div></div></div></div>' in line:
                div_line_idx = i
            if line.strip() == ')}': # strict match might fail if indentation
                paren_line_idx = i
            elif line.strip() == '))}' and paren_line_idx == -1: # backup in case v8 failed?
                 paren_line_idx = i
            elif '))}' in line: # loose match
                 pass # Be careful
            elif ')}' in line and i < div_line_idx: # Found paren BEFORE div line
                 paren_line_idx = i
                 
        if div_line_idx != -1 and paren_line_idx != -1:
            if paren_line_idx < div_line_idx:
                # Swap or Move
                # We want divs BEFORE paren
                # Current: paren ... divs
                # Goal: divs ... paren
                
                div_content = lines[div_line_idx].strip() # </div>...</div>
                paren_content = lines[paren_line_idx] # '              )}\n'
                
                # We can just put divs into paren line
                # But paren line has indent.
                # Let's verify paren line is truly the one closing 1477.
                # Assuming yes.
                
                # New paren line: '              ' + div_content + ')}\n'
                # And remove div line.
                
                indent = paren_content[:paren_content.find(')')]
                new_line = indent + div_content + ')}\n'
                
                lines[paren_line_idx] = new_line
                lines.pop(div_line_idx) # Remove old div line
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                print(f"Moved divs from {div_line_idx+1} to {paren_line_idx+1}")
            else:
                print("Divs are already before paren? Or indices mixed up.")
                print(f"Div line: {div_line_idx+1}, Paren line: {paren_line_idx+1}")
        else:
            print("Could not find target lines.")
            print(f"Div line idx: {div_line_idx}")
            print(f"Paren line idx: {paren_line_idx}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
