
import sys

def check_jsx_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    line_num = 0
    for line in lines:
        line_num += 1
        # Simple JSX pairing check
        for char in line:
            if char == '(':
                stack.append(('(', line_num))
            elif char == ')':
                if not stack or stack[-1][0] != '(':
                    print(f"Mismatch: extra ) at line {line_num}")
                else:
                    stack.pop()
            elif char == '{':
                stack.append(('{', line_num))
            elif char == '}':
                if not stack or stack[-1][0] != '{':
                    print(f"Mismatch: extra }} at line {line_num}")
                else:
                    stack.pop()
    
    for item, l_num in stack:
        print(f"Unclosed {item} from line {l_num}")

if __name__ == "__main__":
    check_jsx_balance('src/app/page.tsx')
