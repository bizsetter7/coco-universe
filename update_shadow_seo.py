import json
import base64

PATH = r"c:\My-site\p2.브랜드_통합_시스템\src\lib\data\Shadow_SEO_Master.json"

def encode_b64(text):
    return base64.b64encode(text.encode('utf-8')).decode('utf-8')

# 주입할 고화력 데이터 (수원 인계동 등 핵심 상권 타겟팅)
NEW_TITLE = "코코알바(COCOALBA) - 수원 인계동 밤알바 · 노래방알바 · BJ알바 1등 플랫폼"
NEW_DESC = "대한민국 1등 고소득 여성알바 코코알바. 수원 인계동 노래방알바, 인계동 밤알바, 전국 BJ알바 정보를 실시간 확인하세요. 일급 50만원 이상, 당일지급 100% 보장!"
NEW_KEYWORDS = ["수원 인계동 밤알바", "인계동 노래방알바", "인계동 유흥알바", "노래방알바", "BJ알바", "엔터알바", "당일지급1위", "고소득알바", "밤알바 1위"]

def update():
    with open(PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 1. Metadata 업데이트
    data['metadata']['title'] = encode_b64(NEW_TITLE)
    data['metadata']['description'] = encode_b64(NEW_DESC)
    
    # 기존 키워드와 합치기 (새 키워드 우선)
    current_kws = data['metadata'].get('keywords', [])
    updated_kws = [encode_b64(kw) for kw in NEW_KEYWORDS] + [kw for kw in current_kws if kw not in [encode_b64(n) for n in NEW_KEYWORDS]]
    data['metadata']['keywords'] = updated_kws
    
    # 2. Schema 업데이트 (JobPosting title/desc)
    for schema in data.get('schemas', []):
        if schema.get('@type') == 'JobPosting':
            schema['title'] = encode_b64(f"전국 고소득 노래방알바 · BJ알바 · 엔터알바 통합 채용")
            schema['description'] = encode_b64(f"대한민국 No.1 여성 고소득 알바 플랫폼 코코알바. 노래방알바, BJ알바, 엔터알바 상시 채용 중. 당일지급 보장.")

    with open(PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Successfully updated P2 Shadow SEO with high-firepower keywords.")

if __name__ == "__main__":
    update()
