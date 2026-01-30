
import re

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def count_tokens(text):
    braces = 0
    parens = 0
    tags = []
    
    # Simple regex for tags
    tag_pattern = re.compile(r'<(/?)([a-zA-Z0-9]+)(\s|/?>)')
    
    lines = text.split('\n')
    for i, line in enumerate(lines):
        line_num = i + 1
        for char in line:
            if char == '{': braces += 1
            if char == '}': braces -= 1
            if char == '(': parens += 1
            if char == ')': parens -= 1
        
        # Tag check (very simplified)
        for match in tag_pattern.finditer(line):
            is_closing = match.group(1) == '/'
            tag_name = match.group(2)
            is_self_closing = match.group(0).endswith('/>')
            
            if is_self_closing:
                continue
            if is_closing:
                if tags and tags[-1] == tag_name:
                    tags.pop()
                else:
                    print(f"Error: Unexpected closing tag </{tag_name}> at line {line_num}")
            else:
                # Ignore some common self-closing or problematic ones for this simple check
                if tag_name not in ['img', 'br', 'hr', 'input', 'link', 'meta']:
                    tags.append(tag_name)

    print(f"Final Balance: Braces={braces}, Parens={parens}")
    if tags:
        print(f"Unclosed tags: {tags}")

count_tokens(content)
