import json
import os
import sys

def update_shadow_seo():
    # P2 (Brand Integration System) path
    base_path = r'C:\My-site\p2.브랜드_통합_시스템'
    json_path = os.path.join(base_path, 'src', 'lib', 'data', 'Shadow_SEO_Master.json')
    
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    try:
        # 1. UTF-8로 안전하게 로드 (json 라이브러리 사용)
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print("Success: JSON loaded safely via json.load()")

        # 2. 데이터 업데이트 (논칙 기반 객체 수정)
        # 타켓 키워드 확장
        target_keywords = [
            "20대 여자알바", "30대 여자알바", 
            "대학생알바", "취준생알바", "투잡알바"
        ]
        
        # 중복 제거 및 추가
        current_keywords = data.get('metadata', {}).get('keywords', [])
        new_keywords = current_keywords + [kw for kw in target_keywords if kw not in current_keywords]
        data['metadata']['keywords'] = new_keywords
        
        # 랜드마크 롱테일 추가
        landmarks = ["수원 인계동 고수익", "강남 룸알바", "부산 노래방알바"]
        final_keywords = data['metadata']['keywords'] + [lm for lm in landmarks if lm not in data['metadata']['keywords']]
        data['metadata']['keywords'] = final_keywords

        # 3. UTF-8로 안전하게 저장 (ensure_ascii=False 필수)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print("Success: JSON updated and saved safely without structural corruption.")

    except Exception as e:
        print(f"Update failed: {e}")

if __name__ == "__main__":
    update_shadow_seo()
