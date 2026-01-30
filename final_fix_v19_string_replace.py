
import os

file_path = r'C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx'

def fix_file():
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Block to remove (from view_file 11932)
        # Note: indentation might vary, so let's try to match flexible whitespace if possible, 
        # or just exact string from view_file.
        
        # Exact string construction:
        # Line 134:   if (!isMounted) {\n
        # Line 135:     return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;\n
        # Line 136:   }\n
        
        block_to_remove = """  if (!isMounted) {
    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;
  }
"""
        # Try finding it first
        if block_to_remove not in content:
            # Maybe indentation is different (2 spaces vs 4 spaces?)
            # view_file showed 2 spaces indent for '  if'.
            print("Exact block not found. Trying strict match failed.")
            # Let's try to construct it carefully.
            # print first 100 chars of block to debug?
            pass
        
        # Let's use string replacement.
        new_content = content.replace(block_to_remove, "")
        
        if len(new_content) == len(content):
            print("Block removal failed (string not found). checking part of it.")
            if "if (!isMounted) {" in content:
                print("Found 'if (!isMounted) {'")
            return
            
        # Block to insert
        block_to_insert = """
  if (!isMounted) {
    return <div className={`w-full min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}`} />;
  }
"""
        # Insert before 'return ('
        # Be careful, there might be multiple 'return (' (e.g. inside useEffect?)
        # But we verified useEffect has 'return () =>'.
        # The main return is '  return ('
        
        if "  return (" in new_content:
            final_content = new_content.replace("  return (", block_to_insert + "\n  return (", 1) # count=1 to replace first occurrence?
            # actually we want the main component return.
            # usually it's the last one? or the one with big indentation?
            # It's at line 240.
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(final_content)
            print("Successfully moved isMounted block via string replace.")
        else:
            print("Main return statement not found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_file()
