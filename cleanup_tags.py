
filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix sloppy tags
content = content.replace('</div >', '</div>')
content = content.replace('</footer >', '</footer>')
content = content.replace('</nav >', '</nav>')
content = content.replace('< footer', '<footer')
content = content.replace('< nav', '<nav')
content = content.replace('className =', 'className=')

# Fix specfic lines if they are still broken
content = content.replace('</div></div></main>', '</div></div></div></div></div></div></div></main>') # Ensure balance if reverted
# Actually, relying on exact match is risky. Just clean tags.

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Tag cleanup complete.")
