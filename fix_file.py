
import os

filepath = r"C:\My-site\통합사이트\브랜드_통합_시스템\src\app\page.tsx"
with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Duplication started around "Mobile Nav"
# Let's find the FIRST occurrence of "Mobile Nav" and keep everything before it.
# Then append the correct Nav and Closing tags.

nav_start_line = -1
for i, line in enumerate(lines):
    if "{/* Mobile Nav */}" in line:
        nav_start_line = i
        break

if nav_start_line != -1:
    new_content = lines[:nav_start_line + 1]
    new_content.append('        <nav className={`md:hidden fixed bottom-0 left-0 right-0 w-full border-t flex justify-around py-3 z-40 text-[10px] text-gray-400 ${brand.theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>\n')
    new_content.append('          <button onClick={() => setCurrentPage("home")} className="flex flex-col items-center gap-1 hover:text-brand-primary active:text-brand-primary transition-colors">\n')
    new_content.append('            <Home size={20} /> 홈\n')
    new_content.append('          </button>\n')
    new_content.append('          <button onClick={() => router.push("/community")} className="flex flex-col items-center gap-1 hover:text-brand-primary transition-colors">\n')
    new_content.append('            <MessageCircle size={20} /> 커뮤니티\n')
    new_content.append('          </button>\n')
    new_content.append('          <button onClick={() => setCurrentPage("payment")} className="flex flex-col items-center gap-1 font-bold group" style={{ color: brand.primaryColor }}>\n')
    new_content.append('            <PlusCircle size={36} className="-mt-6 bg-white rounded-full shadow-lg border-4 border-white group-active:scale-95 transition-transform" />\n')
    new_content.append('            <span className="mt-1">광고등록</span>\n')
    new_content.append('          </button>\n')
    new_content.append('          <Link href="/lounge" className="flex flex-col items-center gap-1 hover:text-brand-primary transition-colors">\n')
    new_content.append('            <Sparkles size={20} /> 라운지\n')
    new_content.append('          </Link>\n')
    new_content.append('          <button onClick={() => setCurrentPage("login")} className="flex flex-col items-center gap-1 hover:text-brand-primary transition-colors">\n')
    new_content.append('            <User size={20} /> MY\n')
    new_content.append('          </button>\n')
    new_content.append('        </nav>\n')
    new_content.append('      </div>\n')
    new_content.append('    );\n')
    new_content.append('  }\n')
    new_content.append('}\n')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_content)
    print("File restored successfully.")
else:
    print("Could not find 'Mobile Nav' tag.")
