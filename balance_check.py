
import sys
import re

def count_tags(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Count <div, <section, <aside, <main, <header, <footer, <article, <nav
        # and their closing counterparts
        tags = ['div', 'section', 'aside', 'main', 'header', 'footer', 'article', 'nav', 'ul', 'li', 'button', 'a']
        
        print(f"--- Balance Report for {file_path} ---")
        for tag in tags:
            # Match <tag but not followed by /> or </tag
            # A simpler way: count all <tag, then subtract all <tag ... />
            all_open = len(re.findall(rf'<{tag}(\s|>)', content))
            self_closing = len(re.findall(rf'<{tag}[^>]*/>', content))
            actual_open = all_open - self_closing
            close_count = len(re.findall(rf'</{tag}>', content))
            diff = actual_open - close_count
            status = "OK" if diff == 0 else "MISMATCH"
            print(f"{tag.upper():8} | Open: {actual_open:4} | Close: {close_count:4} | Diff: {diff:3} | {status}")
            
        # Also check braces { } and parens ( )
        open_brace = content.count('{')
        close_brace = content.count('}')
        print(f"{'BRACE':8} | Open: {open_brace:4} | Close: {close_brace:4} | Diff: {open_brace - close_brace:3}")
        
        open_paren = content.count('(')
        close_paren = content.count(')')
        print(f"{'PAREN':8} | Open: {open_paren:4} | Close: {close_paren:4} | Diff: {open_paren - close_paren:3}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        count_tags(sys.argv[1])
    else:
        print("Usage: python balance_check.py <file_path>")
