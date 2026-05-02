-- ════════════════════════════════════════════════════════════════════════
-- Phase A: DB 일관성 + 신규 자산 + 공지사항 시스템 (2026-05-02)
-- ════════════════════════════════════════════════════════════════════════
--
-- 실행 위치: Supabase SQL Editor (chocoidea-coco 프로젝트)
-- 실행자: 대표님 (직접 실행)
-- 사전 조건:
--   1. 백업 권장 (특히 shops, payments, user_jumps)
--   2. 단계별로 실행하면서 검증 — 한 번에 다 실행 X
--
-- Refs: BRIEFING.md (Phase A) / DATA_FLOW_MAPPING.md / P-08, P-09, P-10
-- ════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────
-- ① payments.platform 컬럼 추가
-- ─────────────────────────────────────────────────────────────────────
-- 목적: 결제 발생 시 어느 플랫폼인지 명확화 (P5 야사장 어드민 통합 리스트 시각 구분)

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS platform TEXT;
COMMENT ON COLUMN public.payments.platform IS '결제 발생 플랫폼: cocoalba/waiterzone/sunsuzone/yasajang';
CREATE INDEX IF NOT EXISTS idx_payments_platform ON public.payments(platform);

-- 기존 payments 데이터 백필 — pay_type 기반 추정
-- AD/JUMP/SOS/BOOST 결제는 모두 P2 코코알바 단독으로 가정 (현재 P9/P10 결제 없음)
UPDATE public.payments
SET platform = 'cocoalba'
WHERE platform IS NULL AND pay_type IN ('AD', 'JUMP', 'SOS', 'BOOST');

-- 백필 후 검증
-- SELECT platform, COUNT(*) FROM payments GROUP BY platform;
-- → 'cocoalba'와 NULL 분포 확인. NULL 남아있으면 수동 검토.


-- ─────────────────────────────────────────────────────────────────────
-- ② shops.platform 컬럼 의무화
-- ─────────────────────────────────────────────────────────────────────
-- 목적: P5 platform-ads/update가 .eq('platform', ...) 필터하므로 채워넣기 의무화
-- 기존 데이터: 'cocoalba'로 백필 후 NOT NULL 적용

-- ② -1. 기존 shops에 platform 채워넣기 (이미 컬럼 존재 가정)
UPDATE public.shops SET platform = 'cocoalba' WHERE platform IS NULL;

-- ② -2. NOT NULL 제약 + DEFAULT 추가
ALTER TABLE public.shops ALTER COLUMN platform SET NOT NULL;
ALTER TABLE public.shops ALTER COLUMN platform SET DEFAULT 'cocoalba';

-- 검증
-- SELECT platform, COUNT(*) FROM shops GROUP BY platform;


-- ─────────────────────────────────────────────────────────────────────
-- ③ ad_jumps 신규 테이블 (광고별 점프 — 대표님 핵심 요구사항)
-- ─────────────────────────────────────────────────────────────────────
-- 목적: 점프를 광고별로 독립 관리. 광고 만료 시 잔여 소멸.

CREATE TABLE IF NOT EXISTS public.ad_jumps (
    id BIGSERIAL PRIMARY KEY,
    shop_id BIGINT NOT NULL UNIQUE REFERENCES public.shops(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    subscription_jumps INTEGER DEFAULT 0 NOT NULL,
    package_jumps INTEGER DEFAULT 0 NOT NULL,
    auto_remaining_today INTEGER DEFAULT 0 NOT NULL,
    next_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_ad_jumps_non_negative CHECK (
        subscription_jumps >= 0 AND package_jumps >= 0 AND auto_remaining_today >= 0
    )
);
CREATE INDEX IF NOT EXISTS idx_ad_jumps_user_id ON public.ad_jumps(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_jumps_platform ON public.ad_jumps(platform);
CREATE INDEX IF NOT EXISTS idx_ad_jumps_next_reset ON public.ad_jumps(next_reset_at);

COMMENT ON TABLE public.ad_jumps IS '광고별 점프 잔액 — 광고 만료 시 ON DELETE CASCADE로 자동 정리';
COMMENT ON COLUMN public.ad_jumps.subscription_jumps IS '구독 무료 분배 (만료 있음, P5 reset 영역)';
COMMENT ON COLUMN public.ad_jumps.package_jumps IS '추가 충전 (영구, P2/P9/P10 충전)';
COMMENT ON COLUMN public.ad_jumps.next_reset_at IS '구독 갱신 리셋 시점 (P5 confirm-payment 설정)';


-- ─────────────────────────────────────────────────────────────────────
-- ④ ad_boosters 신규 테이블 (광고별 부스터)
-- ─────────────────────────────────────────────────────────────────────
-- 목적: 부스터 결제 기록·기간 관리·광고 만료 시 자동 정리

CREATE TABLE IF NOT EXISTS public.ad_boosters (
    id BIGSERIAL PRIMARY KEY,
    shop_id BIGINT NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    option_type TEXT NOT NULL,    -- 'moving_icon' | 'highlighter' | 'border'
    option_detail JSONB,           -- 선택한 아이콘/색상/테두리 종류 상세
    start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_at TIMESTAMPTZ NOT NULL,
    paid_amount INTEGER NOT NULL,  -- 일할 차감 후 실제 결제액
    payment_id BIGINT REFERENCES public.payments(id),
    status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'expired' | 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_ad_boosters_option_type CHECK (
        option_type IN ('moving_icon', 'highlighter', 'border')
    ),
    CONSTRAINT chk_ad_boosters_status CHECK (
        status IN ('active', 'expired', 'cancelled')
    ),
    CONSTRAINT chk_ad_boosters_paid_amount CHECK (paid_amount >= 0)
);
CREATE INDEX IF NOT EXISTS idx_ad_boosters_shop_id ON public.ad_boosters(shop_id);
CREATE INDEX IF NOT EXISTS idx_ad_boosters_end_at ON public.ad_boosters(end_at);
CREATE INDEX IF NOT EXISTS idx_ad_boosters_status ON public.ad_boosters(status);

COMMENT ON TABLE public.ad_boosters IS '광고별 부스터 — 광고 만료 시 ON DELETE CASCADE 자동 정리';
COMMENT ON COLUMN public.ad_boosters.paid_amount IS '일할 차감 후 실제 결제액 (calcBoosterPrice 결과)';


-- ─────────────────────────────────────────────────────────────────────
-- ⑤ user_jumps에 next_reset_at 컬럼 추가 (책임 분리)
-- ─────────────────────────────────────────────────────────────────────
-- 목적: P5 confirm-payment의 reset 영역과 P2 cron의 +1 영역 명확 분리
-- (M-060 cron 정책 보강)

ALTER TABLE public.user_jumps ADD COLUMN IF NOT EXISTS next_reset_at TIMESTAMPTZ;
COMMENT ON COLUMN public.user_jumps.next_reset_at IS 'P5 confirm-payment에서 설정. P2 cron은 이 시점까지만 +1 적립';


-- ─────────────────────────────────────────────────────────────────────
-- ⑥ notices 신규 테이블 (공지사항 DB 전환)
-- ─────────────────────────────────────────────────────────────────────
-- 목적: 코드(constants/notices.ts) 하드코딩에서 DB로 전환
-- 효과: 대표님이 어드민에서 직접 작성·수정 가능

CREATE TABLE IF NOT EXISTS public.notices (
    id BIGSERIAL PRIMARY KEY,
    badge TEXT NOT NULL DEFAULT '공지',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    platforms TEXT[] DEFAULT ARRAY['cocoalba','waiterzone','sunsuzone','yasajang','bamgil']::TEXT[] NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    author_id UUID REFERENCES auth.users(id),
    view_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_notices_badge CHECK (badge IN ('공지','중요','안내','점검'))
);
CREATE INDEX IF NOT EXISTS idx_notices_published ON public.notices(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_platforms ON public.notices USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_notices_pinned ON public.notices(is_pinned, published_at DESC) WHERE is_published = TRUE;

COMMENT ON TABLE public.notices IS '공지사항 — 4개 플랫폼 공통. platforms 배열로 노출 플랫폼 제어';
COMMENT ON COLUMN public.notices.platforms IS '노출 플랫폼: cocoalba/waiterzone/sunsuzone/yasajang/bamgil';
COMMENT ON COLUMN public.notices.is_pinned IS 'TRUE면 목록 상단 고정';

-- ⑥ -1. 기존 notices.ts 데이터 마이그레이션 (백필)
-- 본문은 미정이므로 제목만 우선 INSERT, content는 추후 어드민에서 작성
INSERT INTO public.notices (badge, title, content, platforms, is_pinned, published_at)
VALUES
    ('공지', '[이벤트] 코코알바 오픈기념 상생지원 이벤트 및 이용안내', '본문 내용 (어드민에서 추가 작성)', ARRAY['cocoalba']::TEXT[], FALSE, '2026-04-02'),
    ('공지', '[안내] 프리미엄 광고 "Grand Tier" 서비스 개편 및 혜택 안내', '본문 내용 (어드민에서 추가 작성)', ARRAY['cocoalba']::TEXT[], FALSE, '2026-03-21'),
    ('공지', '[공지] PC 사이드배너 광고 시스템 정식 도입 안내', '본문 내용 (어드민에서 추가 작성)', ARRAY['cocoalba']::TEXT[], FALSE, '2026-03-15'),
    ('중요', '[중요] 카드 결제 서비스 종료 안내', '본문 내용 (어드민에서 추가 작성)', ARRAY['cocoalba']::TEXT[], FALSE, '2026-03-10'),
    ('공지', '[공지] 서비스 전면 개편 및 광고 상품 단가 확정 안내', '본문 내용 (어드민에서 추가 작성)', ARRAY['cocoalba']::TEXT[], FALSE, '2026-03-05')
ON CONFLICT DO NOTHING;

-- ⑥ -2. SERVICE_GUIDE 신규 공지 INSERT (4개 플랫폼 동시 노출, 상단 고정)
-- 본문은 SERVICE_GUIDE_2026-05-02.md 참조 (대표님이 어드민에서 본문 채우거나, 코부장이 별도 INSERT SQL 제공)
INSERT INTO public.notices (badge, title, content, platforms, is_pinned, published_at)
VALUES (
    '공지',
    '[공지] 광고 서비스 안내 — 추가광고/점프/SOS/부스터 (2026-05-02)',
    '본문은 어드민에서 작성 또는 SERVICE_GUIDE_2026-05-02.md 본문 사용',
    ARRAY['cocoalba','waiterzone','sunsuzone','yasajang','bamgil']::TEXT[],
    TRUE,
    NOW()
);


-- ─────────────────────────────────────────────────────────────────────
-- ⑦ 무결성 검증 SQL (헬스 모니터 추가용 — 별도 실행)
-- ─────────────────────────────────────────────────────────────────────
-- 아래는 실행하지 말고 헬스 모니터 코드에 추가할 SQL (참고용 주석)

-- 검증 1. shops.platform NULL 검출 (있으면 안 됨)
-- SELECT COUNT(*) AS shops_platform_null FROM shops WHERE platform IS NULL;

-- 검증 2. payments.platform NULL 검출
-- SELECT COUNT(*) AS payments_platform_null FROM payments WHERE platform IS NULL;

-- 검증 3. ad_jumps 음수 잔액 검출
-- SELECT COUNT(*) AS ad_jumps_negative FROM ad_jumps WHERE subscription_jumps < 0 OR package_jumps < 0;

-- 검증 4. user_jumps.subscription_balance > 0인데 next_reset_at NULL (P5 confirm-payment 누락)
-- SELECT COUNT(*) AS user_jumps_orphan FROM user_jumps WHERE subscription_balance > 0 AND next_reset_at IS NULL;


-- ════════════════════════════════════════════════════════════════════════
-- 실행 후 점검 순서:
--   1. payments / shops 테이블의 platform 컬럼 정상 존재 + 백필 확인
--   2. ad_jumps / ad_boosters / notices 테이블 생성 확인
--   3. notices 테이블에 6건 INSERT 확인 (5건 기존 + 1건 SERVICE_GUIDE)
--   4. user_jumps.next_reset_at 컬럼 추가 확인
--
-- 이상 없으면 → BRIEFING.md A-3, A-4 단계 코드 변경 진행
-- ════════════════════════════════════════════════════════════════════════
