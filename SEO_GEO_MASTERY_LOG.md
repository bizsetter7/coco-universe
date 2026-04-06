# 🛡️ SEO/GEO Mastery & Accountability Log

이 문서는 대장님의 지시에 따라 **실수를 방지하고, 모든 타사 분석 결과와 SEO 전략이 100% 정밀하게 반영되도록 기록하는 마스터 로그**입니다. 향후 어떤 에이전트(안티그래비티, 클로드 등)가 작업을 하더라도 이 로그를 반드시 확인하고 업데이트해야 합니다.

## 📋 핵심 원칙 (Core SEO Principles)
1. **[정밀 타격] 301 리다이렉트 원칙**: 레거시 경로나 도메인 이전 시 `rewrite`가 아닌 `301 Permanent Redirect`를 사용하여 SEO 점수(Juice) 파손을 원천 차단한다.
2. **[무결성] Canonical 강제화**: 모든 페이지는 고유한 표준 URL(Canonical)을 명시적으로 가져야 하며, 파라미터나 환경변수에 의해 인덱싱이 분산되는 것을 방지한다.
3. **[공격적 노출] Soft Gate 무결성**: 성인인증 게이트는 사용자에게는 '유리문(Overlay)'이지만, 검색 봇에게는 '투명한 유리(Crawling Allowed)'여야 한다.

---

## 📅 작업 기록 (2026-04-06) - [100% 집도 완료]

### 🚨 [현안] GSC 색인 정체 및 도메인 파편화 복구 타격 건

#### [진단 결과]
- **원인 1 (도메인 파편화)**: P2(`www`)에서 P3(`region`)로의 연결이 `rewrite`로 설정되어 구글이 동일 콘텐츠를 두 도메인에서 각각 인식함 (Duplicate Content).
- **원인 2 (Canonical 부재)**: P2 메인 레이아웃에 표준 URL 태그가 명시되지 않아 색인 우선순위가 뒤섞임.
- **원인 3 (레거시 하드코딩)**: P3 73개 지역 페이지의 JSON-LD 및 내부 주소에 Vercel 임시 주소(`coco-inky...`)가 1,000건 이상 잔존.

#### [조치 내역 - 정밀 타격 결과]
1.  **[P2] 도메인 교통정리 완결**: `next.config.ts`에서 `rewrites`를 제거하고 **`301 Permanent Redirect`**를 도입. 이제 `/coco/*` 및 `/region/*` 접속 시 즉시 `region.cocoalba.kr`로 이동하여 SEO 점수를 단일화함.
2.  **[P2] Canonical 강제 주입**: `src/app/layout.tsx`에 동적 `alternates.canonical` 태그를 추가하여 구글에게 "이 페이지의 주인은 `www.cocoalba.kr`이다"라고 명확히 선언함.
3.  **[P3] 전수 자동 복구 완료**: `fix_p3_seo.js` (Node.js) 자동화 스크립트를 가동하여 **73개 지역 전 페이지**의 `og:url`, `canonical`, `JSON-LD`를 `https://region.cocoalba.kr` 및 개별 지역 슬러그로 100% 동기화함. (Vercel 레거시 주소 완전 박멸)
4.  **[P2] 봇 투명성 확보**: `LayoutWrapper.tsx`에 `isBot` 감지 로직을 추가. 구글봇 접속 시 'Soft Gate'의 시각적 제약(`blur`, `overflow-hidden`)을 제거하여 100% 클린 텍스트 크롤링을 허용함.

---

## 📈 검증 보고서 (Verification Result)
- [x] **[P2] 301 리다이렉트 응답 확인**: `www.cocoalba.kr/coco/` 접속 시 `HTTP/1.1 301 Moved Permanently` 정상 출력 확인.
- [x] **[P2] Canonical 태그 삽입 확인**: 소스 코드 레벨에서 `<link rel="canonical" href="...">` 동적 생성 확인.
- [x] **[P3] 지역 슬러그 정격화 확인**: `suwon-ingye`, `yongin-suji`, `gangnam` 등 각 지역 페이지가 자신의 슬러그에 맞는 `canonical` 주소를 가짐을 전수 검증 완료.

---
