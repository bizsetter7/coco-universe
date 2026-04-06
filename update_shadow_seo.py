import json

PATH = r"c:\My-site\p2.브랜드_통합_시스템\src\lib\data\Shadow_SEO_Master.json"

# [2026-04-01] 메인 페이지 메타데이터 최신화 (사용자 요청 반영)
NEW_TITLE = "룸알바·노래방알바·노래빠알바·유흥알바·BJ알바·엔터알바 정보 플랫폼 코코알바"
NEW_DESC = "대한민국 1등 고수익 여성알바 코코알바. 룸알바, 노래방알바, 유흥알바, BJ알바, 엔터알바 정보를 실시간 확인하세요. 일급 50만원 이상, 당일지급 100% 보장!"
NEW_KEYWORDS = [
    "룸알바", "노래방알바", "노래빠알바", "유흥알바", "BJ알바", "엔터알바",
    "여성알바", "밤알바", "고수익알바", "당일지급알바", "아가씨알바",
    "20대 여자알바", "30대 여자알바", "대학생알바", "취준생알바", "투잡알바",
    "수원 인계동 고수익", "강남 룸알바", "부산 노래방알바", "코코알바"
]

def update():
    with open(PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # [Fix] Base64 인코딩을 제거하고 평문으로 저장합니다. (브라우저 노출 이슈 해결)
    data['metadata']['title'] = NEW_TITLE
    data['metadata']['description'] = NEW_DESC
    data['metadata']['keywords'] = NEW_KEYWORDS
    
    # Schema 내부의 인코딩된 값들도 평문으로 교체
    for schema in data.get('schemas', []):
        if 'title' in schema:
            schema['title'] = NEW_TITLE
        if 'description' in schema:
            schema['description'] = NEW_DESC

    with open(PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Success: Shadow_SEO_Master.json updated with plain text.")

if __name__ == "__main__":
    update()
