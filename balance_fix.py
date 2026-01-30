
filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Target the specific line we cleaned up earlier
target = "    </div></div></div></div></main>"
# Add 3 divs, 1 }, 1 )
# Note: Adding } and ) might be tricky if they don't match strict structure, 
# but given the delta, they are expected.
# However, usually } and ) come after content. 
# Let's try adding them before the divs if logical, or after?
# If the structure is <main> ... { ... ( ... <div> ...
# Then closing order is </div> ... ) ... } ... </main>
# So they should be inside main.
replacement = "    </div></div></div></div></div></div></div>)}</main>" 

if target in content:
    content = content.replace(target, replacement)
    print("Applied balance fix: Added 3 divs, 1 ), 1 }")
else:
    print("Target line not found. attempting partial match...")
    target_partial = "</div></div></div></div></main>"
    if target_partial in content:
        content = content.replace(target_partial, "</div></div></div></div></div></div></div>)}</main>")
        print("Applied partial match fix.")
    else:
        print("Failed to find target line.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
