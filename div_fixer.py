
filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to remove 4 divs.
# Currently we likely have 7 divs in a row: </div></div></div></div></div></div></div>)}</main>
# We want 3 divs: </div></div></div>)}</main>

target = "</div></div></div></div></div></div></div>)}</main>"
replacement = "</div></div></div>)}</main>"

if target in content:
    content = content.replace(target, replacement)
    print("Fixed div imbalance: Removed 4 excess divs.")
else:
    print("Target sequence not found. Trying regex or fuzzy match.")
    # Fallback: maybe spaces?
    import re
    # Remove 4 </div> from the end of the div sequence before )}</main>
    # Find sequence of </div> followed by )}</main>
    match = re.search(r'(</div>)+(\)\}</main>)', content)
    if match:
        divs = match.group(0)
        # count how many divs
        count = divs.count('</div>')
        print(f"Found {count} divs before main.")
        if count >= 4:
            new_divs = '</div>' * (count - 4)
            new_content = content[:match.start()] + new_divs + match.group(2) + content[match.end():]
            content = new_content
            print("Fixed div imbalance via regex.")
        else:
            print("Not enough divs to remove.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
