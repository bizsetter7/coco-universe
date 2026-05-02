# BRIEFING — Phase A: DB 일관성 + 신규 자산 테이블 + 가격 단일 출처 + 공지사항 시스템

> **작성**: 2026-05-02 코부장
> **수신**: 안티그래비티
> **결재**: 대표님 (검토 후 진행)
> **우선순위**: 🔴 최우선 — 이후 Phase B/C/D의 기반
> **예상 소요**: 1주
> **영향 범위**: P2 / P9 / P10 / P5 (4개 플랫폼)

---

## 📋 작업 개요

이번 Phase A는 **데이터 뒤죽박죽 박멸의 토대**입니다. DB 일관성을 확보하지 않으면 이후 어드민 분리·뱃지 표시·결제 통합 모두 사상누각이 됩니다.

**5가지 목표:**
1. 가격 정책 단일 출처 파일 (`pricing.ts`) 신설 — 4개 플랫폼
2. DB 충돌 3건 해소 — `shops.platform` / `payments.platform` / `user_jumps` 책임 분리
3. 광고별 자산 테이블 신설 — `ad_jumps` / `ad_boosters`
4. 부스터 결제 기록 + 일할 차감 + 만료 자동화 (현재 UI만 있음)
5. 공지사항 DB 전환 + 어드민 작성·수정 기능 (대표님 직접 게시 가능)

---

## 🎯 적용 PATTERNS (의무 적용)

작업 전 반드시 읽고 적용. `D:\토탈프로젝트\My-site\p1.choco-idea\PATTERNS\` 참조.

- [ ] **P-01** Supabase service_role + requireAdmin 가드 — 신규 admin API 모두
- [ ] **P-02** Signup auth.email = 실제 이메일 (이미 적용됨, 회귀 방지만)
- [ ] **P-04** Tier 판별 이중 체크 — shops 데이터 핸들링 시
- [ ] **P-05** 결제 흐름 표준 — `payments` insert/update 시
- [ ] **P-06** GitHub Actions commit validation (자동 — 모든 커밋에 M·P 참조 필수)

---

## 🚫 회피 MISTAKES (의무 점검)

작업 전 반드시 읽기. `D:\토탈프로젝트\My-site\p1.choco-idea\MISTAKES_LOG.md`.

- [ ] **M-014** profiles.role 매핑 (corporate/individual/employee 혼재)
- [ ] **M-015** shop_id 타입 (bigint, `Number()` 사용)
- [ ] **M-020** payments 스키마 (type/updated_at 컬럼 없음)
- [ ] **M-022** JUMP 충전 라우팅 (metadata.type 조건)
- [ ] **M-026** 빌드 미확인 "완료" 허위 보고 금지
- [ ] **M-038** 한국어 PowerShell 인코딩 파손
- [ ] **M-060** 점프 cron 정책 (premium 한정 +1)
- [ ] **M-062** fake email 패턴

---

## 📐 참조 문서 (작업 중 수시 확인)

| 문서 | 위치 | 용도 |
|------|------|------|
| DATA_FLOW_MAPPING.md | `p1.choco-idea/` | 7개 도메인 입력→저장→표시 매핑 |
| admin_redesign_FINAL_decisions | `~/.claude/.../memory/` | 어드민 체계화 결정 사항 |
| PROJECT_MASTER.md | `p1.choco-idea/` | 도메인·DB 진실의 원천 |
| PATTERNS/INDEX.md | `p1.choco-idea/` | P-01~P-06 |
| MISTAKES_LOG.md | `p1.choco-idea/` | M-001~M-062 |

---

## 🔧 단계별 작업

### A-1: `pricing.ts` 신설 — 가격 정책 단일 출처

**목적**: 추가광고·부스터·점프·SOS 가격을 코드 한 곳에서 관리. 향후 변경 시 한 파일만 수정.

**작업 위치 (4개 플랫폼 모두 동일 파일 생성)**:
- `p2.브랜드_통합_시스템/src/data/pricing.ts`
- `p9.웨이터존/waiterzone/src/data/pricing.ts`
- `p10.선수존/sunsuzone/src/data/pricing.ts`
- `p5.야사장/src/data/pricing.ts` (참조용 — 야사장은 추가광고·부스터 사용 안 함, 표시용으로만 import)

**파일 내용**:
```ts
// src/data/pricing.ts
// 단일 출처 — 가격 변경 시 4개 플랫폼 모두 수정 필요 (P-10)

export const PRICING = {
    additional_ad: {
        // 단순 노출권. 점프·SOS·부스터 미포함. 4개 플랫폼 동일 가격.
        '1m': { price: 66000,  duration_days: 30,  discount_rate: 0    },
        '3m': { price: 188100, duration_days: 90,  discount_rate: 0.05 },
        '6m': { price: 356400, duration_days: 180, discount_rate: 0.10 },
    },
    booster: {
        // 광고 보유 필수. 단독 구매 불가. 광고 잔여일 일할 차감.
        moving_icon: { '30d': 30000, '60d': 55000, '90d': 70000 },
        highlighter: { '30d': 30000, '60d': 55000, '90d': 70000 },
        border:      { '30d': 30000, '60d': 55000, '90d': 70000 },
        pay_suffix_extra: 5000,  // 첫 1개 무료, 추가당
    },
    sos: {
        // 추후 정의 (현재는 하드코딩 유지)
        per_message: null,  // TODO
    },
    jump: {
        // 추가 충전 패키지 추후 정의
        package: null,  // TODO
    },
} as const;

// 부스터 일할 계산 — 광고 잔여일이 옵션 기간보다 짧을 때만 적용
export function calcBoosterPrice(
    basePrice: number,
    optionDays: number,
    adRemainingDays: number
): number {
    const effectiveDays = Math.min(optionDays, adRemainingDays);
    return Math.floor(basePrice * effectiveDays / optionDays);
}
```

**적용**: 기존 하드코딩된 가격(`BoostingView.tsx` `PERIOD_PRICE` 등) 모두 `pricing.ts` import로 교체.

**커밋 메시지**: `feat: pricing.ts 단일 출처 신설 [P-10]`

---

### A-2: DB 마이그레이션 SQL 작성

**목적**: `shops.platform` 의무화 + `payments.platform` 추가 + `ad_jumps`/`ad_boosters` 신규 + `notices` 신규.

**파일 위치**: `p2.브랜드_통합_시스템/migrations/PhaseA_2026-05-02.sql`

**SQL 작성** (대표님이 Supabase SQL Editor에서 직접 실행):
```sql
-- ════════════════════════════════════════════════════════
-- Phase A: DB 일관성 + 신규 자산 + 공지사항 (2026-05-02)
-- 실행 순서대로
-- ════════════════════════════════════════════════════════

-- ─── ① payments.platform 컬럼 추가 ───
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS platform TEXT;
COMMENT ON COLUMN public.payments.platform IS 'cocoalba/waiterzone/sunsuzone/yasajang';
CREATE INDEX IF NOT EXISTS idx_payments_platform ON public.payments(platform);

-- 기존 payments 데이터 백필 — pay_type별 추정 (추후 수동 검토 가능)
-- AD/JUMP/SOS/BOOST는 P2 코코알바 단독으로 가정 (현재 P9/P10 결제 미존재)
UPDATE public.payments
SET platform = 'cocoalba'
WHERE platform IS NULL AND pay_type IN ('AD', 'JUMP', 'SOS', 'BOOST');

-- ─── ② shops.platform 컬럼 의무화 (이미 존재한다면 NOT NULL 추가) ───
-- 기존 데이터 백필 먼저
UPDATE public.shops SET platform = 'cocoalba' WHERE platform IS NULL;
ALTER TABLE public.shops ALTER COLUMN platform SET NOT NULL;
ALTER TABLE public.shops ALTER COLUMN platform SET DEFAULT 'cocoalba';

-- ─── ③ ad_jumps 신규 테이블 (광고별 점프) ───
CREATE TABLE IF NOT EXISTS public.ad_jumps (
    id BIGSERIAL PRIMARY KEY,
    shop_id BIGINT NOT NULL UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    subscription_jumps INTEGER DEFAULT 0,
    package_jumps INTEGER DEFAULT 0,
    auto_remaining_today INTEGER DEFAULT 0,
    next_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ad_jumps_user_id ON public.ad_jumps(user_id);
CREATE INDEX idx_ad_jumps_platform ON public.ad_jumps(platform);

-- ─── ④ ad_boosters 신규 테이블 (광고별 부스터) ───
CREATE TABLE IF NOT EXISTS public.ad_boosters (
    id BIGSERIAL PRIMARY KEY,
    shop_id BIGINT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    option_type TEXT NOT NULL,  -- 'moving_icon' | 'highlighter' | 'border'
    option_detail JSONB,         -- 선택한 아이콘/색상/테두리 종류
    start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_at TIMESTAMPTZ NOT NULL,
    paid_amount INTEGER NOT NULL,
    payment_id BIGINT REFERENCES public.payments(id),
    status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'expired' | 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ad_boosters_shop_id ON public.ad_boosters(shop_id);
CREATE INDEX idx_ad_boosters_end_at ON public.ad_boosters(end_at);

-- ─── ⑤ notices 신규 테이블 (공지사항 DB 전환) ───
CREATE TABLE IF NOT EXISTS public.notices (
    id BIGSERIAL PRIMARY KEY,
    badge TEXT NOT NULL DEFAULT '공지',  -- '공지' | '중요' | '안내' | '점검'
    title TEXT NOT NULL,
    content TEXT NOT NULL,                 -- Markdown 또는 HTML
    platforms TEXT[] DEFAULT ARRAY['cocoalba','waiterzone','sunsuzone','yasajang','bamgil'],
    is_pinned BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    author_id UUID REFERENCES auth.users(id),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notices_published ON public.notices(is_published, published_at DESC);
CREATE INDEX idx_notices_platforms ON public.notices USING GIN(platforms);

-- 기존 notices.ts 데이터를 notices 테이블로 백필 — 안티가 별도 INSERT SQL 작성

-- ─── ⑥ 무결성 검증 SQL (헬스 모니터에 추가용) ───
-- 1. shops.platform NULL 검출
-- SELECT COUNT(*) FROM shops WHERE platform IS NULL;
-- 2. payments.platform NULL 검출
-- SELECT COUNT(*) FROM payments WHERE platform IS NULL;
-- 3. ad_jumps 음수 잔액 검출
-- SELECT * FROM ad_jumps WHERE subscription_jumps < 0 OR package_jumps < 0;
```

**커밋 메시지**: `feat: PhaseA DB 마이그레이션 SQL [P-08, P-09]`

---

### A-3: P2/P9/P10 my-shop 코드 변경 — `platform` 명시

**목적**: 공고 등록 시 `shops.platform` 컬럼 채워넣기 의무화.

**작업 파일** (각 플랫폼):
- `src/app/my-shop/page.tsx` 또는 공고 저장 API
- `src/app/api/ad/create/route.ts` (있는 경우)

**변경 패턴**:
```ts
// BEFORE
await supabase.from('shops').insert({ user_id, title, region, ... });

// AFTER
await supabase.from('shops').insert({
    user_id,
    title,
    region,
    platform: 'cocoalba',  // ⭐ P2는 'cocoalba', P9는 'waiterzone', P10은 'sunsuzone'
    ...
});
```

**검증**:
```sql
-- 작업 후 신규 공고 1건 등록 → shops.platform 채워졌는지 확인
SELECT id, title, platform FROM shops ORDER BY created_at DESC LIMIT 5;
```

**커밋 메시지**: `fix: P2/P9/P10 my-shop platform 명시 저장 [DATA_FLOW_MAPPING 도메인 3]`

---

### A-4: payments insert 시 `platform` 명시

**목적**: 결제 발생 시 어느 플랫폼인지 명확히.

**작업 파일** (P2/P9/P10 결제 관련 모든 코드):
- `src/app/api/admin/update-shop-status/route.ts`
- `src/app/api/sos/send/route.ts`
- 기타 `payments.insert` 호출하는 모든 위치 (grep으로 전수 검색)

**변경 패턴**:
```ts
// BEFORE
await supabase.from('payments').insert({ user_id, shop_id, pay_type: 'AD', ... });

// AFTER
await supabase.from('payments').insert({
    user_id,
    shop_id,
    pay_type: 'AD',
    platform: 'cocoalba',  // ⭐ 플랫폼 명시
    ...
});
```

**P5 야사장 결제는 `subscriptions` 테이블 사용 — payments.platform 영향 없음** (참고).

**커밋 메시지**: `fix: payments insert platform 명시 [P-05, M-020]`

---

### A-5: `user_jumps` 책임 분리 (P5 reset / P2 cron +1)

**목적**: P5 confirm-payment과 P2 daily-jump-tasks cron이 같은 `subscription_balance` 컬럼 다투는 것 해소.

**현재 충돌**:
- P5: 구독 갱신 시 `subscription_balance = 30` 직접 SET
- P2 cron: 매일 밤 `subscription_balance + 1` (premium 한정)
- 결과: P5가 갱신한 +1이 cron 시점에 무시되거나 덮어쓰임

**해결**:
1. `user_jumps`에 `next_reset_at` 컬럼 추가:
   ```sql
   ALTER TABLE public.user_jumps ADD COLUMN IF NOT EXISTS next_reset_at TIMESTAMPTZ;
   ```
2. P5 `confirm-payment`: `subscription_balance` SET + `next_reset_at = now() + 30일` 동시 설정
3. P2 cron `daily-jump-tasks`:
   ```ts
   // 변경 전: subscription_balance += 1 (무조건)
   // 변경 후: subscription_balance += 1 ONLY WHEN now < next_reset_at
   if (new Date() < new Date(userJumps.next_reset_at)) {
       // +1 적립 (premium만)
   } else {
       // reset 영역 — P5 책임. cron은 건드리지 않음.
   }
   ```

**커밋 메시지**: `fix: user_jumps subscription_balance P5/P2 책임 분리 [M-060]`

---

### A-6: 부스터 결제·일할 차감·만료 자동화

**목적**: 현재 BoostingView가 UI만 있고 DB 저장 안 됨. 결제 흐름 완성.

**작업 단계**:

1. **`BoostingView.tsx` 수정** (`p2/src/app/my-shop/components/`):
   - `pricing.ts`에서 가격 import
   - 광고 잔여일 계산: `adRemainingDays = (shops.deadline - today)`
   - 일할 적용: `finalPrice = calcBoosterPrice(basePrice, optionDays, adRemainingDays)`
   - 결제 완료 시 `ad_boosters` insert + `payments` insert (platform 명시, pay_type='BOOST')

2. **부스터 만료 cron 신설**: `src/app/api/cron/expire-boosters/route.ts`
   ```ts
   // 매일 1회 실행
   // ad_boosters WHERE end_at < NOW() AND status = 'active' → status = 'expired'
   ```
   `vercel.json`에 cron 등록.

3. **광고 만료 시 부스터 자동 정리**: 광고 deadline 도달 시 ad_boosters status='expired' 동시 처리.

**커밋 메시지**: `feat: 부스터 결제·일할·만료 자동화 [P-09, P-11]`

---

### A-7: 공지사항 DB 전환 + 어드민 작성·수정 UI

**목적**: 대표님이 코드 수정 없이 공지사항 작성·수정 가능.

**작업 단계**:

1. **`notices` 테이블** (A-2 SQL에서 이미 생성)

2. **기존 `notices.ts` 데이터 마이그레이션 SQL**:
   ```sql
   INSERT INTO public.notices (badge, title, content, platforms, published_at)
   VALUES
   ('공지', '[이벤트] 코코알바 오픈기념 상생지원 이벤트 및 이용안내',
    '...본문...', ARRAY['cocoalba','waiterzone','sunsuzone','yasajang','bamgil'], '2026-04-02'),
   -- 기존 notices.ts 항목 모두 INSERT
   ;
   ```

3. **신규 SERVICE_GUIDE 공지 INSERT** (`p1.choco-idea/SERVICE_GUIDE_2026-05-02.md` 본문 사용):
   ```sql
   INSERT INTO public.notices (badge, title, content, platforms, is_pinned, published_at)
   VALUES (
       '공지',
       '[공지] 광고 서비스 안내 — 추가광고/점프/SOS/부스터 (2026-05-02)',
       '...SERVICE_GUIDE_2026-05-02.md 본문...',
       ARRAY['cocoalba','waiterzone','sunsuzone','yasajang','bamgil'],
       TRUE,  -- 상단 고정
       NOW()
   );
   ```

4. **공지사항 조회 API**: `src/app/api/notices/route.ts`
   ```ts
   // GET /api/notices?platform=cocoalba&pinned=true
   // notices 테이블에서 platforms 배열에 platform 포함된 것만 조회
   ```

5. **기존 페이지 교체**:
   - `customer-center/components/TabNotice.tsx` → DB 조회로 변경
   - `constants/notices.ts` deprecation (당분간 유지, 나중에 삭제)

6. **어드민 공지사항 관리 UI** (P2 어드민에 신규 메뉴):
   - `src/app/admin/components/AdminNoticeManagement.tsx`
   - 공지 목록 + 작성 + 수정 + 삭제 + 게시/숨김 토글
   - `src/app/api/admin/notices/route.ts` — service_role + requireAdmin
   - 에디터: 간단한 마크다운 또는 textarea (rich text는 Phase 후순위)

7. **P9/P10/P5에는 어드민 메뉴 추가 X** — 공지사항 작성은 P2 어드민 단일 출처 (다른 플랫폼은 platforms 배열로 노출만)

**커밋 메시지**: `feat: 공지사항 DB 전환 + 어드민 관리 UI [P-08]`

---

### A-8: 헬스 모니터 무결성 검증 SQL 추가

**목적**: 이번에 해결한 데이터 일관성이 향후 깨지는 걸 자동 감지.

**작업 파일**: `p2/src/app/api/admin/health/route.ts`

**추가 검사 항목**:
```ts
// 신규 헬스 항목 (모두 healthy / warning / error 형태)
{
    id: 'shops_platform_null',
    label: 'shops.platform NULL 행 검출',
    sql: 'SELECT COUNT(*) FROM shops WHERE platform IS NULL',
    threshold: { warning: 1, error: 10 }
},
{
    id: 'payments_platform_null',
    label: 'payments.platform NULL 행 검출',
    sql: 'SELECT COUNT(*) FROM payments WHERE platform IS NULL',
    threshold: { warning: 1, error: 10 }
},
{
    id: 'ad_jumps_negative',
    label: 'ad_jumps 음수 잔액 검출',
    sql: 'SELECT COUNT(*) FROM ad_jumps WHERE subscription_jumps < 0 OR package_jumps < 0',
    threshold: { warning: 0, error: 1 }
},
{
    id: 'user_jumps_subscription_drift',
    label: 'user_jumps.next_reset_at 미설정 (P5 confirm-payment 누락)',
    sql: 'SELECT COUNT(*) FROM user_jumps WHERE subscription_balance > 0 AND next_reset_at IS NULL',
    threshold: { warning: 1, error: 10 }
},
```

**커밋 메시지**: `feat: 헬스 모니터 데이터 무결성 검증 추가`

---

## ✅ 완료 기준 (DoD)

- [ ] 모든 단계(A-1 ~ A-8) 완료
- [ ] `npx tsc --noEmit` 에러 0 (P2 / P9 / P10 / P5)
- [ ] `npm run build` Exit 0 (P2 / P9 / P10 / P5)
- [ ] DB 마이그레이션 SQL 대표님 승인 후 실행 (Supabase SQL Editor)
- [ ] 신규 공고 1건 등록 테스트 → `shops.platform` 채워졌는지 확인
- [ ] SERVICE_GUIDE 공지가 4개 플랫폼 공지사항 페이지에 노출되는지 확인
- [ ] 어드민에서 공지 1건 작성·수정·삭제 테스트
- [ ] 헬스 모니터에서 신규 검증 항목이 'healthy' 표시 확인
- [ ] **REPORT.md 작성** — 수정 파일·커밋 해시·검증 결과 포함

---

## 🚨 작업 중 주의사항

1. **모든 커밋 메시지에 M·P 참조 필수** (P-06 GitHub Actions가 자동 검증, 누락 시 빌드 실패)
2. **shops·payments 변경 시 신규 공고 1건씩 테스트** (M-020 회귀 방지)
3. **DB 마이그레이션은 대표님이 직접 실행** — 안티는 SQL 파일만 작성
4. **`docs/archive/`로 이 BRIEFING.md 이동 후 작업 완료** (검수 끝나면)
5. **모든 작업 완료 후 P2 루트에 `REPORT.md` 작성** (TEMPLATES/REPORT_template.md 양식)

---

## 🔄 진행 흐름

```
대표님 결재 → 안티 작업 시작 (A-1부터 순차)
  ↓
각 단계 완료 시 commit + push (M·P 참조)
  ↓
A-2 SQL은 대표님이 Supabase에서 직접 실행
  ↓
모든 단계 완료 → REPORT.md 작성 → 대표님이 코부장에게 캡처 공유
  ↓
코부장이 메모리 갱신 (PATTERNS·MISTAKES_LOG·SESSION_STATE)
  ↓
이 BRIEFING.md를 docs/archive/2026-05-02_PhaseA_BRIEFING.md로 이동
```

---

## ❓ 안티 시작 전 확인 사항

- [ ] DATA_FLOW_MAPPING.md 7개 도메인 정독 (특히 도메인 3·4·6)
- [ ] PATTERNS/INDEX.md (P-01·P-04·P-05·P-06 정독)
- [ ] MISTAKES_LOG.md M-014·M-015·M-020·M-022·M-026·M-060·M-062 정독
- [ ] PROJECT_MASTER.md DB 스키마 섹션 확인 (현재 컬럼 vs 신규 추가)
- [ ] **모든 단계가 명확한가?** 모호한 부분이 있으면 **작업 시작 전 코부장에게 질문**

---

**작성**: 코부장 / 2026-05-02
**다음 단계**: 대표님 결재 → 안티 작업 시작
