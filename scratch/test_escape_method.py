# -*- coding: utf-8 -*-
import io

# "테스트" -> \ud14c\uc2a4\ud2b8
content = u"\ud14c\uc2a4\ud2b8"

with io.open('D:/토탈프로젝트/My-site/p2.브랜드_통합_시스템/scratch/test_escape.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
