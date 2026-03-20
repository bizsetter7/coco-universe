# 🚨 AntiGravity 긴급 브리핑 & 업무 재정립
> 발행: 2026-03-21 | 작성: Claude Code
> **이 문서를 작업 시작 전 반드시 전문 숙지할 것. 이해 안 되는 부분은 즉시 대표님께 질문.**

---

## ⚠️ 먼저 이것부터: 최근에 무슨 일이 있었나

AntiGravity가 **대표님 지시 없이** 아래 항목들을 임의 수정하여 데이터 오염이 발생했다.

| 오염 항목 | 오염 내용 | 올바른 값 |
|---------|---------|---------|
| `PAY_BADGE_STANDARDS` 주급 색상 | `bg-[#EC4899]` (분홍) | `bg-blue-500` |
| `PAY_BADGE_STANDARDS` 연봉 색상 | `bg-[#EF4444]` (빨강) | `bg-green-600` |
| `PAY_BADGE_STANDARDS` 건별 색상 | `bg-emerald-500` | `bg-slate-500` |
| `JobListView` TC 색상 | `bg-indigo-600` | `bg-emerald-500` |

이로 인해 **Claude Code가 전체 재검토 후 교정**하는 추가 작업이 발생했다.

> 🔴 **대표님 말씀**: "안티그래비티가 작업할 때 갑자기 바보가 돼서 지 멋대로 수정을 해버린 탓"

이 브리핑은 같은 일이 다시 발생하지 않도록 작성된 것이다.
앞으로는 **지시 없는 임의 수정 = 즉각 롤백 + 보고 의무**.

---

## 📋 PART 1. P2 코코알바 — 현재 상태 완전 숙지

### 1-1. PROTECTED 항목 목록 (절대 변경 금지)

아래 항목들은 **대표님 명시적 지시 없이는 1바이트도 수정 금지**다.

| 코드 | 파일 | 보호 이유 |
|-----|------|---------|
| P-01 | `src/constants/jobs.ts` | 직종 드롭다운 데이터 — 대표님 확정 10개 업종 |
| P-02 | `src/constants/regions.ts` | 지역 드롭다운 + REGION_BRACKET_MAP — SEO/필터 연동 |
| P-03 | `src/constants/job-options.ts` | 사이드바 키워드/아이콘 목록 |
| P-04 | `src/constants/standards.ts` → `PAY_BADGE_STANDARDS` | 급여 배지 색상·약어 (v1.0 확정) |
| P-05 | `src/constants/standards.ts` → `AD_TIER_STANDARDS` | 광고 등급 비주얼 표준 |
| P-06 | `.env.local` / Supabase RLS 정책 | 환경변수·보안 정책 |

**의심스러우면 건드리지 마라. 질문 먼저.**

---

### 1-2. 급여 배지 표준 (Pay Badge Standards v1.0) — PROTECTED

`src/constants/standards.ts`의 `PAY_BADGE_STANDARDS`가 단일 소스다.
**이 파일 하나만 수정하면 전체 반영된다.** 다른 파일에서 색상 하드코딩 금지.

| 급여 종류 | 약어 | Tailwind | 비고 |
|---------|-----|---------|-----|
| 시급 | **시** | `bg-cyan-500` | |
| 일급 | **일** | `bg-blue-500` | |
| 주급 | **주** | `bg-blue-500` | 일급과 동일색 |
| 월급 | **월** | `bg-purple-500` | |
| 연봉 | **연** | `bg-green-600` | |
| TC | **T** | `bg-emerald-500` | 테이블차지 전용 |
| 건별/건당 | **건** | `bg-slate-500` | |
| 협의 | **협** | `bg-gray-400` | 기본값 |

관련 파일 연관도:
```
standards.ts (PAY_BADGE_STANDARDS) ← 단일 소스 (수정은 여기만)
  ├── utils/payColors.ts (getPayColor, getPayAbbreviation)
  │     └── JobDetailModal.tsx
  └── components/jobs/JobListView.tsx (getPayBadgeInfo — 동기화 유지)
```

`JobListView.tsx`의 `getPayBadgeInfo`는 별도 로컬 로직이다.
`standards.ts` 수정 시 `JobListView.tsx`도 반드시 동시 수정할 것.

---

### 1-3. 공고번호(adNo) 표기 규칙

모든 광고 상세 팝업(JobDetailModal)에 **누락 없이** 표시되어야 한다.

```
표기 형식: No.{adNo}
예시: No.1024

우선순위:
1순위 → shop.adNo (DB 필드)
2순위 → shop.id UUID 앞 4자리
3순위 → 기본값 '1004'

폰트: font-mono / 색상: text-gray-400 / 위치: 본문 우측 상단
```

---

### 1-4. 광고 등급별 노출 컴포넌트 매핑 — PROTECTED

| 등급 | 컴포넌트 | 배너 | 급여옵션 최대 |
|-----|---------|-----|------------|
| 그랜드 | `AdBannerCard` | ✅ 대형 | **3개** |
| 프리미엄 | `AdBannerCard` | ✅ 대형 | **3개** |
| 디럭스 | `ShopCard (Image Mode)` | ✅ 중형 | **2개** |
| 스페셜 | `ShopCard (Image Mode)` | ✅ 중형 | **2개** |
| 급구 | `ShopCard (Text Only)` | ❌ | **4개** |
| 추천 | `ShopCard (Text Only)` | ❌ | **4개** |
| 베이직/네이티브 | `JobListView` | ❌ | **2개** (모바일) |

> 이미지가 없어도 텍스트 배너(Gradient) 방식 강제 적용. fallback UI 절대 없음.
> `NEW` 배지: `shop.options.blink` 값 있으면 좌상단 리본 최우선 노출.

---

### 1-5. 오늘본공고 저장 포맷 (2026-03-21 변경)

기존 `Shop[]` 포맷 → **`{ shop: Shop; timestamp: number }[]`** 로 변경됨.
24시간(86,400,000ms) 경과 시 자동 만료.

```typescript
// ✅ 올바른 저장 방식
const entries = [
    { shop, timestamp: Date.now() },
    ...이전항목들.filter(e => e.shop?.id !== shop.id && (now - e.timestamp) < 86400000),
].slice(0, 50);
localStorage.setItem('viewed_shops', JSON.stringify(entries));
```

구형 포맷(`Shop[]`) 호환 처리는 이미 적용되어 있다. **포맷 다시 바꾸지 말 것.**

---

### 1-6. 지역 사이드바 표기 (2026-03-21 변경)

`LeftSidebar.tsx`의 `REGION_BUTTONS`는 `{ label, value }[]` 구조다.

```typescript
// label: 화면 표시용 2글자
// value: 전체명 (REGION_BRACKET_MAP 연동용) — 절대 변경 금지
{ label: '경기', value: '경기도' }
{ label: '경남', value: '경상남도' }
// ... 등 17개
```

`value`를 2글자로 바꾸면 필터링이 깨진다. **label만 표시이고 value는 내부 키다.**

---

### 1-7. 공지사항 관리 방법 (2026-03-21 신규)

`src/constants/notices.ts` 파일로 관리한다.
**배열 맨 앞 항목이 자동으로 최신 공지**로 업종별/지역별 채용페이지에 노출된다.

```typescript
// 새 공지 추가 시 → 배열 맨 앞에 추가
export const NOTICES: NoticeItem[] = [
    { id: 6, badge: '공지', title: '새로운 공지 내용', date: '2026-03-22', link: '/customer-center?tab=notice' },
    // ... 이하 기존 공지
];
```

Supabase 연동 시 이 파일을 API 호출로 교체 예정.

---

## 📋 PART 2. P7 PRICESHOT — 확정 마스터플랜 숙지

**기준 문서**: `C:/My-site/p7. PRICESHOT/PRICESHOT_SOP_v5.md`
**이 문서가 모든 이전 논의를 종결하는 유일한 기준이다.**

### 2-1. 기술 스택 (확정 불변)

```
모바일:  RN New Architecture + Reanimated 3 + @shopify/react-native-skia
웹 SEO:  Next.js (앱과 완전 독립)
백엔드:  Supabase (P7 전용 신규) + Node.js Worker (P2 재사용 70%)
크롤링:  Python + Playwright (서버 전용)
AI:      Phase1 이동평균 → Phase2 GPT Function → Phase3 몬테카를로
```

> Flutter 아니다. 이유: P2 코드 70% 재사용 + CodePush 긴급패치.
> 다시 Flutter 언급하지 말 것.

### 2-2. AntiGravity 담당 개발 범위

```
✅ RN 모바일 앱 전체 (UI/UX, 세미-오토 카트, 알림)
✅ Node.js Worker + Supabase 백엔드
✅ Python + Playwright 크롤러 (Layer 3)
✅ 코드 내 금지 표현 자체 검수
```

### 2-3. 코드 레벨 절대 금지 (위반 시 즉각 롤백)

```
❌ 쿠키인젝션 / 세션하이재킹 / 클로킹 / 위장 / 기망
❌ 사용자 동의 없는 외부 서버 데이터 전송
❌ WebView에서 파트너스 링크 외 쿠키 조작
❌ 앱스토어 심사 회피 목적 조건부 코드 분기
```

코드 주석, 슬랙 메시지, PR 설명에도 위 표현 포함 금지.

### 2-4. 세미-오토 카트 구현 핵심 원칙

```
✅ 유저 탭 1회 액션 반드시 포함 (자동 구매 = ToS 위반)
✅ WebView + 파트너스 링크 자동 치환 방식
❌ 쿠키인젝션 방식 — 영구 폐기
```

### 2-5. AdMob 노출 위치 (TestSprite 검증 항목)

```
✅ 허용: 피드 카드 사이(3개마다 1개), 가격히스토리 하단, 마이페이지 하단
❌ 절대 금지: 알림 클릭 직후, 담기 완료 직후, 목표가 달성 축하 화면
❌ Pro 구독자 화면: 광고 미노출
```

---

## 📋 PART 3. 팀 운영 규칙

### 3-1. 작업 전 체크리스트 (AntiGravity 필수)

```
□ 수정하려는 파일이 PROTECTED 목록에 있는가?
  → 있으면: 작업 중단 → 대표님 확인 후 진행
□ 급여 색상/약어를 수정하려는가?
  → standards.ts만 수정 + JobListView.tsx 동시 수정
□ 지역/직종 데이터를 수정하려는가?
  → 절대 금지 (대표님 지시 없이)
□ 새 컴포넌트 추가 시 adNo 표시가 있는가?
  → 상세 팝업/관리자 리스트에 No.{adNo} 누락 없이
```

### 3-2. SOP 문서 구조

```
P2: C:/My-site/p2. 브랜드_통합_시스템/SOP_개발표준_20260319.md
  - 섹션 13: PROTECTED 데이터 명세 (P-01~P-06)
  - 섹션 15: AI 에이전트 안전장치
  - TC-A~G: TestSprite 검증 체크리스트

P7: C:/My-site/p7. PRICESHOT/PRICESHOT_SOP_v5.md
  - 전략·기술·법무·QA 총람 (섹션 1~14)
```

Claude Code와 TestSprite도 이 문서를 공유 기준으로 삼는다.

### 3-3. Claude Code와의 역할 분리

```
AntiGravity: 개발(코드 작성, 빌드, 배포)
Claude Code: 전략·문서·법무·SOP 관리·코드 리뷰
TestSprite:  E2E 검증·QA

→ 서로의 영역 침범 금지
→ Claude Code가 수정한 파일을 AntiGravity가 되돌리는 행위 금지
```

---

## 📋 PART 1-8. 공고 등록 데이터 ↔ 광고 카드 매핑 규칙 (v1.0) — 숙지 필수

> **관련 파일**: `AdForm.tsx`, `AdBannerCard.tsx`, `ShopCard.tsx`, `JobDetailModal.tsx`
> **SOP 기준**: TC-H 참조

### 입력 필드 → 카드 매핑 (단방향 데이터 흐름)

```
[Step 1] 기본 정보
  nickname      → 모든 카드 업체명 (최우선 / shopName보다 우선)
  shopName      → nickname 없을 때 fallback
  phone/messenger → 상세 모달 연락 버튼

[Step 2] 상세 내용
  title         → 카드 메인 타이틀 (cleanShopTitle 정제 후, 2줄 제한)
  industryMain/Sub → 카드 우측 상단 업종 배지 (서브 우선)
  regionCity/Gu → 카드 좌측 상단 지역 배지 (Gu 단위 우선)
  payType/Amount → 급여 배지(약어) + formatKoreanMoney() 금액
  editorHtml    → 상세 모달 본문 (HTML 스타일 유지)

[Step 3] 상품 선택
  selectedAdProduct (p1~p7) → AdBannerCard vs ShopCard 분기
    p1(그랜드)/p2(프리미엄) → AdBannerCard
    p3(디럭스)/p4(스페셜) → ShopCard Image Mode
    p5(급구)/p6(추천) → ShopCard Text Only
    p7(베이직) → JobListView

[Step 4] 추가 옵션
  selectedKeywords → 상세 모달 #해시태그
  paySuffixes      → 급여 옆 배지 (등급별 최대: 그랜드3 / 디럭스2 / 급구4 / 베이직2)
  selectedIcon     → 카드 제목 왼쪽 아이콘
  selectedHighlighter → 제목 형광펜 효과
  borderOption     → 상세 모달 Glow/Sparkle 효과
  adNo             → 상세 모달 우측 상단 No.XXXX (누락 시 즉각 수정)
```

### 핵심 정제 규칙

| 규칙 | 내용 |
|-----|------|
| 닉네임 우선 | nickname 있으면 반드시 닉네임 표시 |
| 지역 내부/UI 분리 | 내부 `경기도` → UI `경기` (2글자 축약, value 변경 금지) |
| 제목 정제 | `[]`, `()`, `{}` 내부 텍스트 자동 제거 |
| adNo 필수 | **모든 광고 상세 팝업에 No. 누락 없이 표시** |
| 등급별 paySuffixes 상한 | 그랜드/프리미엄: 3개 / 디럭스/스페셜: 2개 / 급구/추천: 4개 / 베이직: 2개 |

---

## 📋 PART 1-9. 기업회원 대시보드 노출 규칙 (v1.0) — 숙지 필수

> **관련 파일**: `BusinessDashboard.tsx`, `OngoingAdsView.tsx`, `PaymentsView.tsx`
> **SOP 기준**: TC-K 참조

### 진행중 탭 — 상태 배지 매핑

| status 값 | 배지 | 색상 |
|----------|-----|------|
| `pending` / `PENDING_REVIEW` | 심사중 | 오렌지 |
| `rejected` / `REJECTED` | 반려 | 빨강 + `rejection_reason` 카드 내 즉시 노출 |
| `active` | 진행중 | 파랑 (실서비스 라이브) |

### 특수 노출 규칙

```
edit_count / 30  → 월간 수정 횟수 카운팅
                    25회 초과 시 → 빨간색 경고
유료 옵션 배지:  아(아이콘) / 형(형광펜) / 테(테두리) / 급(급여옵션)
rejection_history: 반려 이력 배열 → 날짜+사유 리스트로 노출 (어드민)
지원자 수:       공고 ID 기준 이력서 접수 수 실시간 카운팅
```

### 마감 탭 — 시각적 처리

```
분류 기준: ad.isClosed === true
처리:      카드 전체 Grayscale + 투명도 75%
배지:      '마감됨' 고정
```

### 결제내역 — 날짜 표기 원칙

```
승인 완료 →  '승인완료' (파랑) + 승인일 + 마감일
결제 후 심사중 → '결제완료' + '심사중' 병기 + 신청 일시(분 단위)
실시간 반영:   결제내역에서도 공고 제목/닉네임 최신값 표시 (스냅샷 ❌)
```

---

## 📋 PART 1-10. 어드민 공고관리 & 등급별 컬러 규칙 (v1.0) — PROTECTED 숙지 필수

> **관련 파일**: `AdminAdManagement.tsx`, `src/constants/standards.ts`
> **SOP 기준**: TC-L 참조
> ⚠️ 등급 컬러·ID 임의 변경 절대 금지

### 어드민 열 구성

| 항목 | 규칙 |
|-----|------|
| No. | `adNo` 우선 / 없으면 `id` 앞 8자리 (예: `8b50e2dd`) |
| 상태 | pending(주황) / active(초록) / rejected(빨강) |
| rejection_history | 반려 이력 날짜+사유 리스트 전체 노출 |
| 정책 위반 | `[NORMAL]` 배지 시각화 |
| edit_count | `X / 30` 표시 |
| ad_price | `Price: X,XXX원` 어드민 상단 노출 |

### 광고 등급 컬러 (AD_TIER_STANDARDS) — PROTECTED

```
T1 (grand/p1)       → bg-amber-500   골드
T2 (premium/p2)     → bg-red-600     레드
T3 (deluxe/p3)      → bg-blue-600    블루
T4 (special/p4)     → bg-emerald-600 에메랄드
T5 (recommended/p5) → bg-orange-500  오렌지 (급구)
T6 (native/p6)      → bg-slate-600   슬레이트 (추천)
T7 (basic/p7)       → bg-slate-900   블랙
```

### 유료 옵션 미니 배지 (PAID_OPTION_STANDARDS) — PROTECTED

```
아 (아이콘)  → bg-indigo-500
형 (형광펜)  → bg-gray-600
테 (테두리)  → bg-blue-500
급 (급여옵션) → bg-blue-500
```

---

## 🎯 결론

**지금까지 발생한 문제의 패턴:**
1. 대표님 지시 없이 PROTECTED 데이터 임의 수정
2. 색상 표준 오염 (분홍/빨강으로 무단 변경)
3. 결과: Claude Code 재검토 + 교정 + 추가 작업 발생

**앞으로 하나만 기억해라:**
> **"모르면 멈추고 물어봐라. 확신 없으면 건드리지 마라."**

대표님이 이 브리핑을 전달하는 이유는 신뢰를 회복하기 위해서다.
다음 작업부터는 이 문서 기준으로 움직여라.

---
*Claude Code 작성 | 2026-03-21*
