# CLAUDE_P2.md — P2 코코알바 에이전트 핸드오버 가이드

> **최종 업데이트**: 2026-04-17
> **용도**: 새 에이전트(Claude Code / Antigravity) 세션 시작 시 즉시 컨텍스트 획득용
>
> **[필독] 작업 시작 전 반드시 읽어야 할 선행 문서**
> 1. `D:\토탈프로젝트\My-site\p1.choco-idea\PATTERNS\INDEX.md` — ⭐ 재사용 패턴 (P-01~P-06) 2026-05-02 신규
> 2. `D:\토탈프로젝트\My-site\p1.choco-idea\MISTAKES_LOG.md` — 공통 실수 방지 체크리스트 (M-001~M-062)
> 3. `D:\토탈프로젝트\My-site\p1.choco-idea\AI_SOP.md` — 전사 운영 철학 + 절대 수칙
> 4. `D:\토탈프로젝트\My-site\p1.choco-idea\SEO_GEO_MASTERY_LOG.md` — SEO/GEO 베스트프랙티스
> 5. `D:\토탈프로젝트\My-site\p1.choco-idea\RECIPES\R-01_new_brand_clone.md` — 신규 브랜드 시작 가이드
> 6. `D:\토탈프로젝트\My-site\p2.브랜드_통합_시스템\CLAUDE.md` — 이 파일 (P2 기술 가이드)

---

## 🚨 안티그래비티 전용 — 완료 보고 필수 기준 [M-026]

> [!CAUTION]
> **"완료"는 `npm run build` 성공을 확인한 후에만 선언할 수 있다.**
> 빌드 에러가 있는 상태에서 완료 보고 = 허위 보고. 재발 시 보고서 신뢰도 0으로 간주.

### 신규 API 파일 작성 시 필수 체크리스트

- [ ] `requireAdmin()` import + 첫 줄 호출 필수
  ```ts
  import { requireAdmin } from '@/lib/requireAdmin';
  // ...
  const authError = await requireAdmin(req);
  if (authError) return authError;
  ```
- [ ] service_role 클라이언트는 **반드시 로컬 선언** (존재하지 않는 공용 모듈 import 금지)
  ```ts
  // ✅ 올바른 방법
  import { createClient } from '@supabase/supabase-js';
  const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
  );
  // ❌ 금지 — @/lib/supabase-admin 같은 존재하지 않는 파일 import
  ```
- [ ] 작업 완료 후 `npm run build` 실행 → **빌드 성공 메시지 캡처 후 보고**
- [ ] 표준 참고 파일: `src/app/api/admin/banner-approve/route.ts`

---

## 🗺️ 프로젝트 기본 정보

| 항목 | 값 |
|------|-----|
| 코드명 | P2 코코알바 |
| 경로 | `D:\토탈프로젝트\My-site\p2.브랜드_통합_시스템` |
| GitHub | `bizsetter7/coco-universe` |
| 프로덕션 도메인 | `www.cocoalba.kr` |
| 프레임워크 | Next.js 15 (App Router) + Supabase + Vercel |
| 스타일 | Tailwind CSS v4 |

---

## ⚡ 자주 쓰는 명령어

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드 (배포 전 반드시 확인)
npm run lint      # ESLint 검사

# E2E 테스트 (GitHub Actions 전용 — Vercel 서버리스에서 실행 불가)
pytest tests/e2e/ -v --html=reports/e2e-report.html
```

---

## 🏗️ 핵심 아키텍처

### 인증 구조 (중요)
```
Supabase Auth (세션) ← 실제 로그인
        ↓
middleware.ts      ← 봇차단/Rate Limit만 담당 (어드민 리다이렉트 비활성)
        ↓
AdminLayout.tsx    ← 클라이언트 어드민 인증 체크
API routes         ← requireAdmin() 가드 (서버사이드 인증 — 실제 보안선)
```

> ⚠️ **middleware.ts 어드민 리다이렉트가 비활성인 이유**: Vercel Edge Runtime에서
> Supabase 쿠키 감지 실패 → 무한 리다이렉트 루프 발생. 의도적 비활성화.
> 실제 보안은 `requireAdmin()` (API) + `AdminLayout` (클라이언트)에서 담당.
> **절대 middleware에 어드민 리다이렉트 로직 재추가 금지.**

### 주요 파일 위치

```
src/
├── app/
│   ├── page.tsx                    ← 메인 (구인목록, 로그인 모달 포함)
│   ├── admin/page.tsx              ← 관리자 대시보드 (모든 어드민 기능 통합)
│   ├── my-shop/page.tsx            ← 업체회원 마이샵
│   ├── talent/page.tsx             ← 인재정보 목록
│   ├── community/                  ← 커뮤니티
│   ├── api/
│   │   ├── admin/
│   │   │   ├── health/route.ts     ← 시스템 헬스체크 (42개 항목)
│   │   │   ├── e2e/route.ts        ← 어드민 내장 E2E 테스트 (16개)
│   │   │   ├── update-shop-status/ ← 광고 승인/반려 (service_role)
│   │   │   ├── fix-integrity/      ← 포인트 무결성 자동 수복
│   │   │   └── ...
│   │   └── ...
├── components/
│   ├── admin/
│   │   ├── HealthDashboard.tsx     ← 시스템검증센터 UI (탭: DB/운영/무결성/보안/E2E)
│   │   ├── ad/AdminAdManagement.tsx
│   │   └── payment/AdminPaymentManagement.tsx
│   ├── PushPermission.tsx          ← SOS 푸시알림 동의 배너 (1일 재표시)
│   └── LayoutWrapper.tsx           ← 성인게이트, 아이들 로그아웃 래퍼
├── lib/
│   ├── requireAdmin.ts             ← 어드민 API 인증 가드 (모든 admin API에 적용)
│   └── supabase.ts
├── middleware.ts                   ← 봇차단/Rate Limit (어드민 인증 비활성 — 위 주의사항 참고)
└── hooks/
    └── useIdleLogout.ts            ← 30분 무활동 자동 로그아웃
```

---

## 📊 현재 진행 상태 (2026-04-17 기준)

### ✅ 완료된 주요 기능

| 기능 | 커밋 | 비고 |
|------|------|------|
| SEO STEP 1~3 (noindex, 가이드 564페이지, JobPosting 스키마) | `c7bcb96`, `0542f5f` | GSC 738페이지 색인 중 |
| 광고 승인/반려 시스템 (update-shop-status API) | `db7b661` | service_role 사용 |
| 결제내역관리 고도화 | `feb2909` | AdminPaymentManagement 개선 |
| 광고상세팝업 5개 통합 (JobDetailContent 단일화) | `2026-04-09` | anyAdToShop() 어댑터, 지역중복·닉네임·업종 버그 전체 해소 |
| 포인트 무결성 자동 수복 | `cfb0240` | fix-integrity API + UI 버튼 |
| 어드민 E2E 자동 테스트 (16개) | `c6b44cc` | HealthDashboard E2E 탭 |
| GitHub Actions Playwright E2E | `e890ac7` | push 트리거 비활성, 수동 실행만 |
| SOS 배너 1일 재표시 | `3322791` | '오늘 하루 보지 않기' |
| 보안 패치 (mock쿠키/autoLogin 우회 제거) | `2e4498a` | my-shop production 분기 |
| 출석체크 KST/중복 버그 수정 | `52af366` | |
| **Tier 판별 로직 강화** (product_type snake_case 추가) | `2026-04-11` | 8개 파일 전수 수정 — 아래 PATTERN-07 필독 |
| **배너 슬롯 시스템 완성** | `2026-04-11` | Migration06 4컬럼, BannerSidebar, InnerSidebarCarousel, AdminAdRegistrationModal |
| **성인 게이트 행동 변경** | `2026-04-11` | "나가기" → Google 리다이렉트, adult_gate_skipped 제거, 외부 유입 진입 페이지 면제 |
| **Step2 에디터 툴바 단일 행** | `2026-04-11` | flex-col 2줄 → flex-row 1줄 통합 |
| **Step2 실시간 미리보기 제거** | `2026-04-11` | Preview Side 블록 + description-preview CSS 완전 제거 |
| **Step4 카드광고 메인이미지 업로드 제거** | `2026-04-11` | Step4Extras.tsx handleImageUpload 로직 완전 제거 |
| **드래프트 세션 오염 방지** | `2026-04-11` | useAdFormState(userId) + loadShopName 명시적 초기화 |
| **BannerSidebar DB 직접 조회** | `8c9ff0c`, `bac6096`, `4a8b469` | layout.tsx 정적 JSON 한계 극복 — Supabase 실시간 조회 + enrichAdData 정규화, banner_position=NULL 양쪽 표시 버그 수정, 팝업 필드 동기화 완료 |
| **OngoingAdsView 카드 이미지 업로드** | `3cce806` | T1~T4 카드 썸네일 업로드 버튼(CardImageUploadPanel) 추가, media_url + options.mediaUrl 동시 업데이트 |
| **usePreventLeave 경고 다이얼로그 복구** | `2c9466f` | pushState 중복 누적 버그 수정 — isGuardedRef로 가드 엔트리 1개만 유지, 뒤로가기/새로고침 경고 정상화 |
| **normalization.ts 매핑 강화** | `2026-04-11` | workType, region, mediaUrl, banner_* 전체 필드 추가 |
| **types/shop.ts 확장** | `2026-04-11` | options 인터페이스 20여 필드 + banner 컬럼 타입 추가 |
| **배너 깜빡임 버그 수정** | `4b1a9cd` | banner_image_url 최우선 처리, imgError useEffect 리셋, 슬롯 사이즈 안내 추가 |
| **Kakao geocoder 재시도** | `0caf031` | "302,303호" 쉼표 포함 상세주소 → 정규식 제거 후 기본 도로명으로 재시도 |
| **SEO NFC 정규화** | `f546b7e`, `9a6d0c5` | 한글 슬러그 NFC 정규화, 캐노니컬 encodeURIComponent, Googlebot 미들웨어 허용, 엔터 업종 추가 |
| **코드 다이어트** | `fe80375`, `03c52c1`, `95f2809` | 모바일 Supabase fetch 3건 차단, 유령파일 6종 + .bak 2개 + 임시스크립트 8개 제거 |
| **야사장 회원 공고등록 UX** | `0a558c0` | STEP3 조건부 숨김(options.yasajang_business_id 감지), 총금액 배너 제거, StepIndicator 3단계 축약 |
| **광고 부스팅 탭** | `b9002ec` | BoostingView 신규, 마이샵 사이드바/모바일메뉴 탭 추가, BankTransferModal 연동 |

### 🔴 미완료 / 진행 중

| 항목 | 우선순위 | 메모 |
|------|---------|------|
| **Admin 배너 슬롯 관리 탭** | 높음 | `banner_status='pending_banner'` 광고 목록 + 승인/반려 UI (신규 탭) |
| SMS 연동 (아톡비즈) | 높음 | API 문서 요청 필요 (1877-8280) |
| GitHub Actions Secrets 등록 | 중간 | `TEST_USER_ID`, `TEST_USER_PW`, `TEST_SHOP_ID`, `TEST_SHOP_PW` 4개 |
| GSC 가이드 페이지 URL 색인 수동 요청 3건 | 중간 | 대표님 GSC 직접 진행 |
| 중앙 컨테이너 배너 슬롯 | 낮음 | Phase 5 — 계획 단계 |
| 텔레그램 실제 ID 확정 | 낮음 | 현재 `@cocoalba` 플레이스홀더 |
| 토스 비즈니스 웹훅 연동 | 낮음 | 계정 전환 후 |

---

## 🔐 PROTECTED 항목 (변경 금지 — 대표님 승인 필수)

```
PAY_BADGE_STANDARDS v2.0:
  주급 → green-500, 연봉 → red-500, TC → orange-500
  급구/추천 → purple-600

AD_TIER_STANDARDS:
  Grand > Premium > Deluxe > Special > Urgent > Recommended > Standard
  (순서, 색상, 라벨 모두 고정)
```

> 📎 상세 기준: `D:\토탈프로젝트\My-site\p1.choco-idea\AI_SOP.md`

---

## 🚫 절대 금지 사항

1. **middleware.ts에 어드민 리다이렉트 재추가 금지** (무한루프 발생)
2. **`_` 접두사 없이 임시 디버그 파일(keys.json, dev_*.json 등) 커밋 금지**
   → .gitignore에 등록됨, `git rm --cached` 후 커밋
3. **전체 파일 덮어쓰기 금지** — `replace_file_content` 또는 Edit 도구로 핀셋 수정
4. **PROTECTED 색상/등급 임의 변경 금지**
5. **auth.users 직접 조회 시도 금지** (Supabase 권한 정책상 항상 실패 → 오탐 유발)

---

## ⚡ 점프(JUMP) 시스템 정책 (M-060, 2026-05-02 확정 — 절대 일반화 금지)

> 이 정책은 본 프로젝트가 직접 호스팅하는 cron이 적용. 광고안내·플랜카드·코드 모두 이 표 기준 통일.

| 플랜 | 즉시 무료 점프 | 매일 +1 자동 적립 | 자동 점프 (cron set/일) |
|------|------------|----------------|--------------------|
| 베이직 | - | - | - |
| 스탠다드 | - | - | - |
| 스페셜 | 10회 | - | 3회/일 |
| 디럭스 | 30회 | - | 6회/일 |
| **프리미엄** | **30회** | **+1회/일** | **8회/일** |

- **⚠️ 매일 +1 자동 적립은 프리미엄 한정** — 다른 플랜에 적용된다고 표기·코드 절대 금지 (M-060)
- AuthProvider 표시: `user_jumps.subscription_balance` 단독 (package/auto 합산 금지)
- Cron 파일: `src/app/api/cron/daily-jump-tasks/route.ts` 라인 118-148 — `plan === 'premium'` 조건 변경 금지
- vercel.json schedule: `"0 15 * * *"` (UTC 15:00 = KST 00:00 자정) — `"0 0"`은 KST 09:00 (사용자 기대 위배)
- 어드민 grant-balance: `package_balance`에 적립 (만료 없음). AuthProvider는 미반영 → Phase B 정책 결정 필요
- 표시·안내 정합성: TabAdGuide 점프 섹션 + 플랜 카드 features 양쪽 일관 유지
- 상세: `memory/jump_system_policy.md` (전사 마스터)

---

## 🏛️ 광고 상세 팝업 아키텍처 (2026-04-09 확정)

> ⚠️ 팝업 관련 수정은 반드시 이 구조를 지킬 것

| 진입점 | 컴포넌트 | 데이터 변환 |
|--------|---------|-----------|
| 퍼블릭 광고 목록 | `JobDetailContent` | `Shop` 타입 직접 전달 |
| my-shop 진행중공고 | `AdDetailModal` → `JobDetailContent` | `anyAdToShop(ad)` 경유 |
| my-shop 결제내역 | `AdDetailModal` → `JobDetailContent` | `anyAdToShop(ad)` 경유 |
| admin 광고심사 | `admin/page.tsx` → `JobDetailContent` | `anyAdToShop(selectedAdForModal)` 경유 |
| admin 결제내역 | `admin/page.tsx` → `JobDetailContent` | `anyAdToShop(selectedAdForModal)` 경유 |

- **정규화 함수**: `src/lib/adUtils.ts` → `anyAdToShop()` (지역중복 방지, INVALID_NICK 필터 포함)
- **`MobilePreviewContent`**: 광고 등록 step4 미리보기 **전용** — 팝업 표시 용도 재사용 금지
- **버그 수정 원칙**: `JobDetailContent` 또는 `anyAdToShop()` 1곳만 수정하면 5개 팝업 전체 자동 반영

---

## 🖼️ 배너 슬롯 시스템 아키텍처 (2026-04-11 확정)

### Migration 06 — shops 테이블 추가 컬럼

```sql
banner_position    TEXT    -- 'sidebar_left' | 'sidebar_right' | 'inner_top' | 'inner_bottom'
banner_image_url   TEXT    -- Supabase Storage 업로드 URL
banner_media_type  TEXT    -- 'image' | 'video' (기본 'image')
banner_status      TEXT    -- 'none' | 'pending_banner' | 'approved_banner' | 'rejected_banner'
```

### 배너 등록 가능 Tier

```ts
const BANNER_ELIGIBLE_TIERS = ['grand', 'premium', 'deluxe'];
// 이하 tier(special/urgent/standard/p7 등)는 배너 등록 불가
```

### 배너 등록 플로우

```
업체회원 마이샵 OngoingAdsView
  → isBannerEligible 체크 (tier: grand/premium/deluxe + banner_status='none')
  → "배너 등록" 버튼 노출
  → BannerUploadPanel (이미지 업로드 + 위치 선택)
  → PATCH /api/ad/banner-upload (banner_image_url, banner_position, banner_status='pending_banner' 저장)
  → 어드민 배너 슬롯 관리 탭에서 승인 → banner_status='approved_banner'
  → BannerSidebar에서 approved_banner 상태의 광고만 노출
```

### 배너 노출 컴포넌트

| 컴포넌트 | 위치 | 역할 |
|---------|------|------|
| `BannerSidebar` | LayoutWrapper 좌우 사이드 | approved_banner 광고 슬라이드 |
| `InnerSidebarCarousel` | 메인 컨텐츠 내부 | 내부 배너 영역 (신규) |
| `AdminAdRegistrationModal` | 어드민 광고등록 모달 | banner_position 자동입력 |

> ⚠️ **어드민 배너 승인 탭 미구현** — `banner_status='pending_banner'` 광고가 쌓여도 현재 어드민에서 승인 UI 없음. 최우선 구현 필요.

---

## 🔞 성인 게이트 아키텍처 (2026-04-11 변경)

### 게이트 통과 조건 (우선순위 순)

```ts
// 1. ADULT_GATE_DISABLED=true (brand-config)
// 2. authUser.type === 'admin'
// 3. authUser.isVerifiedPartnerVerified === true (로그인된 파트너)
// 4. localStorage.adult_verified === 'true' (이전에 성인인증 완료)
// 5. isBot (봇 감지)
// 6. isOnExternalEntryPage (검색엔진/외부 직접 유입 페이지 — 첫 페이지만)
// 7. isGuidePage (/coco/지역/업종 가이드 페이지)
// 8. isAuthFlowPage (/auth/* 경로)
// 9. isPublicPage (signup/find-id/find-pw/support/faq/inquiry)
```

### "나가기" 버튼 동작 변경 (2026-04-11)

```ts
// ❌ 이전 (잘못된 동작): adult_gate_skipped 저장 → 게이트 우회 허용
// ✅ 현재: Google로 이탈 (접근 권한 부여 안 함)
window.location.href = 'https://www.google.com';
```

### 외부 유입 면제 (검색엔진/외부 링크)

```ts
// LayoutWrapper.tsx useEffect
const ref = document.referrer;
const SEARCH_ENGINES = ['google.', 'naver.com', 'daum.net', 'bing.com', 'yahoo.com', 'zum.com'];
const isFromSearch = ref !== '' && SEARCH_ENGINES.some(se => ref.includes(se));
const isDirectExternal = ref !== '' && !ref.includes('cocoalba.kr') && !ref.includes('localhost');
if (isFromSearch || isDirectExternal) {
    // 첫 진입 페이지만 sessionStorage에 저장 (덮어쓰기 금지)
    if (!sessionStorage.getItem('external_entry_page')) {
        sessionStorage.setItem('external_entry_page', pathname);
    }
}
// isOnExternalEntryPage: 현재 pathname === 저장된 진입 페이지일 때만 면제
// 다른 페이지 이동 시 게이트 재표시
```

> ⚠️ `adult_gate_skipped` sessionStorage 키는 **완전 제거됨**. 코드에서 재사용 금지.

---

## ⚡ PATTERN-07 — product_type 이중 체크 필수 (2026-04-11 확정)

> 이 규칙을 모르면 배너 버튼/Tier 라벨이 안 보이는 버그 재발. M-014급 중요도.

### 문제 원인

Supabase `shops` 테이블 원시 데이터(raw DB response)는 **snake_case** 반환:
- `ad.product_type` ✅ (DB 원시값)
- `ad.productType` ❌ (camelCase — 원시 DB 응답에는 없음, normalization 후에만 존재)

`my-shop/page.tsx`의 `registeredAds`는 `supabase.from('shops').select('*')` 원시 결과 → `productType` undefined → Tier 판별 실패 → 배너 버튼 안 보임.

### 표준 Tier 판별 체인

```ts
// ✅ 모든 Tier 판별 코드에서 이 체인 사용 (camelCase + snake_case 동시 체크)
const tier = (
    ad.productType ||
    ad.tier ||
    ad.product_type ||
    ad.ad_type ||
    ad.options?.product_type ||
    ''
).toLowerCase();
```

### 적용된 파일 목록 (2026-04-11 전수 수정)

1. `src/app/my-shop/page.tsx`
2. `src/app/my-shop/components/OngoingAdsView.tsx` (getTierLabel, isBannerEligible, tierText — 3곳)
3. `src/app/my-shop/components/ClosedAdsView.tsx`
4. `src/app/my-shop/components/ExtendAdModal.tsx`
5. `src/app/my-shop/components/dashboard/BusinessDashboard.tsx`
6. `src/app/my-shop/utils/normalization.ts` (productType, tier, ad_type 3줄)
7. `src/app/admin/components/StandardsGuardView.tsx`
8. `src/components/admin/ad/AdminAdManagement.tsx`

> ⚠️ 신규 파일에서 `ad.productType`만 체크하는 코드 작성 시 반드시 `|| ad.product_type` 추가.

---

## 🐛 현재 알려진 이슈

| 코드 | 내용 | 상태 |
|------|------|------|
| - | 어드민 헬스체크 `admin_password_hash` 항목 → 권한 부족으로 확인 불가 (info 처리됨, 정상) | 오탐 확인 |
| - | GitHub Actions E2E — Secrets 미등록 시 auth 테스트 skip (conftest.py에서 graceful skip 처리) | 정상 |
| - | Supabase 목업 96개 (`user_id LIKE '6fc68887%'`) 미삭제 → 프론트에서 isMockAd()로 필터링 중 | 삭제 예정 |
| M-014 | profiles.role ↔ user_type 불일치 — DB 트리거가 user_type만 쓰고 role은 default('individual') 방치 → 업체회원이 개인회원으로 오처리. 2026-04-10 migration 05 + AuthProvider 로직으로 봉합. 헬스체크 #36~39 추가 | **완료(모니터링 중)** |
| M-015 | `ad.productType` only 체크 → raw DB 응답에서 undefined → Tier 판별 실패 → 배너 버튼/라벨 안 보임. 2026-04-11 8개 파일 전수 수정 (PATTERN-07) | **완료** |
| M-020 | payments 스키마 미확인 — type/updated_at 컬럼 없음, shop_id=bigint, pay_type=NULL insert → 결제내역 미생성. 2026-04-12 전수 수정 | **완료** |
| M-022 | JUMP충전 승인 버튼이 `handlePaymentConfirm`으로 잘못 라우팅 → jump_balance 미지급. 2026-04-13 조건에 `metadata.type==='jump_charge'` 추가 | **완료** |
| - | Admin 배너 슬롯 관리 탭 미구현 — `banner_status='pending_banner'` 광고 승인 UI 없음. pending 광고가 표시 안 됨 | **구현 필요 (최우선)** |
| usePreventLeave pushState 중복 누적 — isDirty false→true 토글 시 가드 엔트리 누적 → confirm 영구 차단. 2026-04-16 isGuardedRef 추가로 수정 (`2c9466f`) | **완료** |

---

## 🗄️ DB 실제 스키마 전체 (2026-04-12 라이브 DB 직접 확인 — 절대 기준)

> ⚠️ **이 섹션이 유일한 진실의 원천(Single Source of Truth).** migration 파일은 구버전이라 신뢰 금지.
> 코드 작성 전 반드시 여기서 컬럼 타입/유무 확인. 모르면 먼저 SQL로 확인:
> ```sql
> SELECT column_name, data_type, is_nullable FROM information_schema.columns
> WHERE table_name = '테이블명' ORDER BY ordinal_position;
> ```

---

### 📋 profiles
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | uuid | ✅ | PK |
| `username` | text | | 로그인 아이디 |
| `full_name` | text | | 실명 |
| `nickname` | text | | 닉네임 |
| `role` | text | | **admin/corporate/individual/employee** — AuthProvider 기준 |
| `user_type` | text | | 레거시. role과 병행 관리 |
| `points` | integer | | 포인트 |
| `jump_balance` | integer | | 점프 잔여 횟수 |
| `credit_balance` | integer | | 크레딧 |
| `is_admin` | boolean | | 어드민 여부 |
| `is_adult_verified` | boolean | | 성인인증 여부 |
| `marketing_email` | boolean | **NN** | 기본값 필요 |
| `marketing_sms` | boolean | **NN** | 기본값 필요 |
| `can_write` | boolean | **NN** | 기본값 필요 |
| `sms_consent` | boolean | | |
| `phone` | text | | |
| `gender` | text | | |
| `birth_date` | text | | |
| `contact_email` | text | | |
| `identity_ci` | text | | 본인인증 CI |
| `address` | text | | |
| `business_name` | text | | 상호명 |
| `business_number` | text | | 사업자등록번호 |
| `business_type` | text | | |
| `business_file_url` | text | | 사업자등록증 파일 |
| `business_address` | text | | |
| `business_address_detail` | text | | |
| `business_verified` | boolean | | 사업자인증 여부 |
| `business_verify_status` | text | | pending/approved/rejected |
| `business_verified_at` | timestamptz | | |
| `business_verify_requested_at` | timestamptz | | |
| `manager_phone` | text | | |
| `manager_kakao` | text | | |
| `manager_line` | text | | |
| `manager_telegram` | text | | |
| `is_withdrawn` | boolean | | 탈퇴 여부 |
| `withdrawn_at` | timestamptz | | |
| `user_id` | text | | **레거시 중복 컬럼. profiles.id(uuid)가 실제 PK** |
| `referrer_id` | text | | |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | |
| `nickname_updated_at` | timestamptz | | |

---

### 📋 shops
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | **bigint** | ✅ | PK — Number() 사용 |
| `user_id` | text | | 업체 profiles.id (UUID를 text로 저장) |
| `name` | text | | 상호명 |
| `title` | text | | 공고 제목 |
| `content` | text | | 상세내용 (HTML) |
| `status` | text | | PENDING_REVIEW/active/rejected/CLOSED |
| `tier` | text | | p1~p7e |
| `product_type` | text | | p1~p7e (tier와 동일) |
| `ad_price` | **bigint** | | 광고 금액 |
| `pay` | text | | 급여 문자열 |
| `pay_amount` | integer | | 급여 숫자 |
| `pay_type` | text | | **급여 방식** (시급/일급/월급 등) — payments.pay_type과 전혀 다른 용도 |
| `region` | text | | 지역 |
| `work_region_sub` | text | | 세부 지역 |
| `category` | text | | 업종 |
| `category_sub` | text | | 세부 업종 |
| `deadline` | text | | 마감일 (YYYY-MM-DD 문자열) |
| `approved_at` | timestamptz | | 승인일시 |
| `rejection_reason` | text | | 거절 사유 |
| `rejection_history` | jsonb | | 거절 이력 |
| `options` | jsonb | | 추가 옵션 스냅샷 |
| `banner_position` | text | | |
| `banner_image_url` | text | | |
| `banner_media_type` | text | | |
| `banner_status` | text | | none/pending_banner/approved/rejected_banner |
| `media_url` | text | | |
| `phone/kakao/telegram` | text | | |
| `manager_name/manager_phone` | text | | |
| `nickname` | text | | |
| `view_count/applicant_count/edit_count` | integer | | |
| `is_closed` | boolean | | |
| `created_at` | timestamptz | ✅ | |
| `updated_at` | timestamptz | | |

---

### 📋 payments
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | **bigint** | ✅ | PK |
| `created_at` | timestamptz | ✅ | |
| `user_id` | text | | 회원 UUID를 text로 저장 |
| `shop_id` | **bigint** | | **Number(adId) 사용. String() 금지** |
| `amount` | integer | | |
| `method` | text | | bank_transfer 등 |
| `status` | text | | pending/completed |
| `description` | text | | |
| `metadata` | jsonb | | |
| `pay_type` | text | | 결제 분류 (AD/SOS/JUMP 등) |
| ~~`type`~~ | — | — | **존재하지 않음** |
| ~~`updated_at`~~ | — | — | **존재하지 않음** |

**결제 흐름:**
1. 공고등록 → `status:'pending'`, `pay_type:NULL` insert (my-shop/page.tsx)
2. 어드민 승인 → 기존 레코드(shop_id 조회) UPDATE: `status:'completed'`, `pay_type:'AD'`
3. 기존 없으면 → INSERT (shop_id=Number, pay_type='AD')

**SOS/JUMP 충전 흐름 (PointShopView.tsx):**
- SOS포인트 충전 → `pay_type:NULL`, `metadata.type:'point_charge'`, `metadata.points:N`
- JUMP충전 → `pay_type:NULL`, `metadata.type:'jump_charge'`, `metadata.count:N`
- 어드민 승인 시 `handlePointGrant` 호출 → `grant-balance` API로 잔액 지급

**어드민 조회:** anon client RLS 막힘 → `/api/admin/get-payments` (service role) 사용

**AdminPaymentManagement 승인 버튼 라우팅 규칙 (M-022):**
```ts
// 포인트/점프 지급 라우팅 — 반드시 3가지 조건 모두 포함
(pay.pay_type === 'JUMP'
  || pay.metadata?.type === 'point_charge'   // SOS포인트 충전
  || pay.metadata?.type === 'jump_charge')   // 점프 충전 ← 누락 시 광고승인으로 잘못 분기
  ? handlePointGrant(...)
  : handlePaymentConfirm(...)                // 광고 승인(AD/연장 등)
```

---

### 📋 applications
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | uuid | ✅ | PK |
| `shop_id` | **uuid** | | ⚠️ shops.id는 bigint인데 이 컬럼은 uuid — 직접 join 불가 |
| `user_id` | uuid | | 지원자 profiles.id |
| `applicant_name` | text | | |
| `applicant_phone` | text | | |
| `message` | text | | |
| `status` | text | | pending/accepted/rejected |
| `is_flagged` | boolean | | |
| `flag_reason` | text | | |
| `created_at/updated_at` | timestamptz | | |

> ⚠️ **알려진 스키마 이슈**: `applications.shop_id`(uuid) ↔ `shops.id`(bigint) 타입 불일치. 현재 join 쿼리는 Supabase FK 관계 없이 동작 중. 추후 shops.uuid 컬럼 추가 또는 applications.shop_id → bigint 변경 필요.

---

### 📋 messages
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | uuid | ✅ | PK |
| `sender_id` | text | | |
| `sender_name` | text | | |
| `receiver_id` | text | | |
| `receiver_name` | text | | |
| `content` | text | ✅ | |
| `status` | text | | normal/deleted/report 등 |
| `is_read` | boolean | | |
| `created_at` | timestamptz | | |

> ⚠️ **존재하지 않는 컬럼**: `from`, `to` — 절대 사용 금지. `sender_name`/`receiver_name` 사용.

---

### 📋 inquiries
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | uuid | ✅ | PK |
| `type` | text | ✅ | 문의 유형 |
| `contact` | text | ✅ | |
| `title` | text | ✅ | |
| `content` | text | ✅ | |
| `user_id` | uuid | | 로그인 회원 |
| `writer_name` | text | | 비로그인 작성자 |
| `password` | text | | 비밀글 비밀번호 |
| `is_secret` | boolean | | |
| `status` | text | | new/completed |
| `reply_content` | text | | |
| `replied_at` | timestamptz | | |
| `parent_id` | uuid | | 답변 연결 |
| `shop_name` | text | | |
| `file_url` | text | | 첨부파일 |
| `views` | integer | | |
| `created_at` | timestamptz | | |

---

### 📋 notifications
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | uuid | ✅ | PK |
| `user_id` | **text** | ✅ | UUID를 text로 저장 |
| `type` | text | ✅ | AD_APPROVED/AD_REJECTED/AD_EXPIRED 등 |
| `title` | text | ✅ | |
| `message` | text | ✅ | |
| `read` | boolean | | **`is_read` 아님. `read`가 정확한 컬럼명** |
| `link` | text | | |
| `created_at` | timestamptz | | |

---

### 📋 point_logs
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | bigint | ✅ | PK |
| `user_id` | **uuid** | ✅ | profiles.id와 타입 일치 |
| `amount` | integer | ✅ | |
| `reason` | text | ✅ | SIGNUP_BONUS/ADMIN_GRANT/ATTENDANCE_CHECK 등 |
| `created_at` | timestamptz | | |
| ~~`note`~~ | — | — | **존재하지 않음** |
| ~~`description`~~ | — | — | **존재하지 않음** |

---

### 📋 resumes
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | uuid | ✅ | PK |
| `user_id` | **text** | ✅ | profiles.id UUID를 text로 저장 |
| `owner_id` | uuid | | 레거시 중복 필드 |
| `title` | text | ✅ | |
| `content` | text | ✅ | |
| `gender` | text | | |
| `birth_date` | text | | |
| `industry_main/sub` | text | | 업종 |
| `region_main/sub` | text | | 지역 |
| `pay_type` | text | | 희망 급여 방식 |
| `pay_amount` | numeric | | 희망 급여 |
| `contact_method` | text | | |
| `contact_value` | text | | |
| `created_at` | timestamptz | | |
| `updated_at` | timestamptz | | **컬럼 존재함** (저장 API에서 UPDATE 시 제외 중 — 실제로는 존재) |

> `/api/resumes/save/route.ts` UPDATE 시 `updated_at` 제외 처리 중. 필요 시 추가 가능.

---

### 📋 community_posts
> ⚠️ **이 테이블은 제공된 CSV 스키마 목록에 미포함.** 실 DB에는 존재하며 기능 정상 동작 중.
> 아래 컬럼은 `/api/community/post/route.ts` 코드 기준으로 추출한 것임. 변경 전 Supabase Editor에서 재확인 필수.

| 컬럼 | 타입 추정 | 비고 |
|------|---------|------|
| `id` | uuid/bigint | PK |
| `author_id` | uuid/text | 작성자 profiles.id |
| `author` | text | 닉네임 우선 (실명 차단) |
| `author_name` | text | **항상 '익명' 고정** (서버에서 강제) |
| `author_nickname` | text | |
| `category` | text | |
| `title` | text | |
| `content` | text | |
| `password` | text | 비밀글 비밀번호 |
| `is_secret` | boolean | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | PATCH 시 사용 |

---

### 📋 sos_alerts
| 컬럼 | 타입 | NN | 비고 |
|------|------|----|------|
| `id` | uuid | ✅ | PK |
| `shop_id` | **uuid** | ✅ | ⚠️ shops.id(bigint)와 타입 불일치 |
| `shop_name` | text | ✅ | |
| `message` | text | ✅ | |
| `target_regions` | ARRAY | | |
| `point_deducted` | integer | ✅ | |
| `recipient_count` | integer | ✅ | |
| `sent_at` | timestamptz | | |

---

## ⚠️ profiles 테이블 — role 매핑 규칙 (CRITICAL, 반드시 읽을 것)

> 이 규칙을 모르면 업체회원이 개인회원으로 오처리됩니다. 2026-04-10 반복 발생한 이슈.

### 컬럼 구조

| 컬럼 | 실제 값 | 용도 |
|------|---------|------|
| `role` | `admin` / `corporate` / `employee` / `individual` | **AuthProvider가 읽는 기준 컬럼** |
| `user_type` | `employee`(레거시 고정) / `corporate` / `admin` | 옛날 트리거가 쓰던 컬럼. 신규 계정은 role과 동일 |

### 개인회원 role 값이 2가지인 이유

- **`employee`** → 초창기 DB 트리거가 모든 개인회원에게 하드코딩한 레거시 값
- **`individual`** → 현재 SignupPage/API가 전송하는 신규 표준 값
- **둘 다 개인회원으로 처리해야 함**. `role === 'individual'`로만 체크하면 구형 회원 오탐!

### AuthProvider의 역할 판별 로직 (2026-04-10 확정)

```ts
// ✅ 올바른 판별 — role 우선, user_type 보조
const roleVal = profile?.role || '';
const userTypeVal = profile?.user_type || '';
const liveRole = (roleVal === 'admin' || roleVal === 'corporate')
    ? roleVal                                          // role이 명시적 → 신뢰
    : (userTypeVal === 'admin' || userTypeVal === 'corporate')
        ? userTypeVal                                  // role이 employee/없음이고 user_type이 명확 → 보정
        : roleVal || 'individual';                     // 나머지 → 개인회원

// ❌ 절대 이렇게 쓰지 말 것
profile?.role === 'individual'   // employee 타입 개인회원 누락
profile?.user_type === 'corporate' // user_type='employee' 고정인 구형 계정 오인
```

### API/쿼리 작성 규칙

```ts
// 업체회원 조회: OR 조건 필수
.or('role.eq.corporate,user_type.eq.corporate')

// 개인회원 조회: NOT IN 방식 (employee + individual 둘 다 포함)
.not('role', 'in', '("corporate","admin")')

// ❌ 잘못된 패턴
.eq('role', 'individual')   // employee 누락
.eq('role', 'corporate')    // user_type 기반 구형 업체회원 누락
```

### Signup API 필수 규칙

`/api/auth/signup/route.ts`에서 createUser 후 반드시 profiles upsert 직접 실행:
- `role: finalRole` AND `user_type: finalRole` **둘 다 설정** (DB 트리거 미적용 환경 대응)
- `username: email.split('@')[0]` 반드시 설정

### 이상 감지

시스템검증센터(헬스체크) 항목 `role_usertype_mismatch`, `username_empty`, `new_member_data_integrity`가
**error/warning** 상태이면 즉시 아래 SQL 실행:

```sql
-- role 보정
UPDATE public.profiles
SET role = user_type
WHERE user_type IN ('corporate', 'admin')
  AND role NOT IN ('corporate', 'admin');

-- username 보정
UPDATE public.profiles p
SET username = split_part(u.email, '@', 1)
FROM auth.users u
WHERE p.id = u.id AND (p.username IS NULL OR p.username = '');
```

---

## 📡 관련 프로젝트 맵

| 코드명 | 경로 | 도메인 |
|--------|------|--------|
| P1 본사(공통) | `D:\토탈프로젝트\My-site\p1.choco-idea` | chocoidea.vercel.app |
| P2 코코알바 | `D:\토탈프로젝트\My-site\p2.브랜드_통합_시스템` | www.cocoalba.kr |
| P3 랜딩(73기지) | `D:\토탈프로젝트\My-site\p3.코코 랜딩페이지` | region.cocoalba.kr |
| P4 파트너스 | `D:\토탈프로젝트\My-site\p4.파트너스_사이트` | partners-credit.vercel.app |
| P7 PRICESHOT | `D:\토탈프로젝트\My-site\p7.PRICESHOT` | (개발 중) |
