
import os
import re

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        new_lines = []
        
        # Regex patterns to fix spaces
        # 1. Hyphens: " - " -> "-"
        # 2. Colons: " : " -> ":"  (mostly for modifiers like sm:, hover:)
        # 3. Dots: " . " -> "." (for decimals like 2.5)
        # 4. Slashes: " / " -> "/" (for opacity like / 50)
        # 5. Brackets: " [ " -> "[" and " ] " -> "]" (for arbitrary values)
        
        # We only apply this to lines containing "className" to be somewhat safe.
        
        count = 0
        
        for line in lines:
            if 'className' in line:
                original = line
                
                # Apply fixes sequentially
                # Note: We must be careful not to break JS syntax if possible, 
                # but removing spaces around these symbols is generally valid JS (minified style).
                
                # Fix Hyphens: Only match if surrounded by word chars or digits or brackets?
                # Actually, in the observed broken file, it's consistent: "flex - col", "p - 2"
                # Pattern: space hyphen space
                fixed = line.replace(' - ', '-')
                
                # Fix Colons: " : " -> ":"
                # Warning: Ternary operator " ? true : false ".
                # If we make it "? true:false", it is valid.
                # But we might merge things? "a : b" -> "a:b". Valid.
                fixed = fixed.replace(' : ', ':')
                
                # Fix Dots: " . " -> "."
                fixed = fixed.replace(' . ', '.')
                
                # Fix Slashes: " / " -> "/"
                fixed = fixed.replace(' / ', '/')
                
                # Fix Brackets: " [ " -> "[", " [ " -> "[" ??
                # "rounded - [ 28px ]" -> "rounded-[ 28px ]" (after hyphen fix)
                # Need to fix spaces around brackets too.
                fixed = fixed.replace('[ ', '[')
                fixed = fixed.replace(' [', '[') # Safety
                fixed = fixed.replace(' ]', ']')
                fixed = fixed.replace('] ', ']') # Maybe? No, "text-[10px] text-white" needs space after ]
                
                # Re-add space after ] if it was merged into next class?
                # "text-[10px]text-white" -> Bad.
                # "text-[10px] text-white" -> Good.
                # If we replaced "] " with "]", we broke it.
                # Let's check the Broken File pattern.
                # Line 356: "rounded - [28px] sm: rounded - [32px]"
                # There is no space INSIDE the bracket in line 356 view.
                # But line 344: "p - 2.5".
                # Line 346: "w - 9".
                
                # Let's revert the "] " -> "]" replace, it's risky for class separation.
                # Only fix " [" -> "[" and "[ " -> "[" ?
                # "rounded - [28px]" -> after hyphen fix: "rounded-[28px]".
                # If there are spaces around brackets: "rounded - [ 32px ]"
                
                # Let's stick to the observed errors:
                # " - ", " : ", " . ", " / "
                
                # Also " ] " -> "]" might be needed if "28px ]"
                # But let's verify if `] ` is used for separation.
                # `text-[10px] text-white` -> `]` followed by space.
                # If the broken file has `text - [ 10px ] text - white`.
                # `] ` -> `]` would start merging.
                
                # So we ONLY remove space BEFORE `]`? ` ]` -> `]`.
                fixed = fixed.replace(' ]', ']')
                
                # And space AFTER `[`? `[ ` -> `[`.
                fixed = fixed.replace('[ ', '[')
                
                # And ` [` -> `[`?
                # `rounded-[` is correct.
                # `rounded - [` -> `rounded-[`.
                # `sm: [` -> `sm:[`.
                # ` [` -> `[` might be okay inside className string.
                
                # Let's compare
                if fixed != original:
                    count += 1
                    line = fixed
            
            new_lines.append(line)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
            
        print(f"Fixed spaces in {count} lines.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
