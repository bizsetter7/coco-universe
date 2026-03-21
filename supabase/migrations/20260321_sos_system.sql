-- =====================================================
-- SOS 긴급구인 알림 시스템 + 포인트 보강
-- 작성일: 2026-03-21
-- 실행 위치: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. profiles 테이블에 points 컬럼 확인 (없으면 추가)
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;

-- 1-1. points 기본값 0으로 업데이트 (NULL 방지)
UPDATE public.profiles SET points = 0 WHERE points IS NULL;

-- 2. push_subscriptions 테이블 생성 (Web Push 구독 정보)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    regions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2-1. 인덱스: 지역 필터링 성능
CREATE INDEX IF NOT EXISTS idx_push_subs_regions ON public.push_subscriptions USING GIN(regions);
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON public.push_subscriptions(user_id);

-- 3. sos_alerts 테이블 생성 (SOS 발송 이력)
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    message TEXT NOT NULL CHECK (char_length(message) <= 50),
    target_regions TEXT[] DEFAULT '{}',
    point_deducted INT NOT NULL DEFAULT 0,
    recipient_count INT NOT NULL DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3-1. 인덱스: shop_id로 이력 조회
CREATE INDEX IF NOT EXISTS idx_sos_alerts_shop_id ON public.sos_alerts(shop_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_sent_at ON public.sos_alerts(sent_at DESC);

-- 4. point_logs 테이블 확인 (없으면 생성)
CREATE TABLE IF NOT EXISTS public.point_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_logs_user_id ON public.point_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_point_logs_created_at ON public.point_logs(created_at DESC);

-- 5. RLS (Row Level Security) 정책

-- push_subscriptions: 본인만 조회/수정
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subs_own" ON public.push_subscriptions;
CREATE POLICY "push_subs_own" ON public.push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Service Role은 전체 접근 허용 (SOS 발송 시 구독자 전체 조회 필요)
DROP POLICY IF EXISTS "push_subs_service" ON public.push_subscriptions;
CREATE POLICY "push_subs_service" ON public.push_subscriptions
    FOR SELECT USING (auth.role() = 'service_role');

-- sos_alerts: 본인 이력 조회 + 서비스롤 전체 접근
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sos_alerts_own" ON public.sos_alerts;
CREATE POLICY "sos_alerts_own" ON public.sos_alerts
    FOR SELECT USING (auth.uid() = shop_id);

DROP POLICY IF EXISTS "sos_alerts_service" ON public.sos_alerts;
CREATE POLICY "sos_alerts_service" ON public.sos_alerts
    FOR ALL USING (auth.role() = 'service_role');

-- point_logs: 본인 조회 + 서비스롤 전체
ALTER TABLE public.point_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "point_logs_own" ON public.point_logs;
CREATE POLICY "point_logs_own" ON public.point_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "point_logs_service" ON public.point_logs;
CREATE POLICY "point_logs_service" ON public.point_logs
    FOR ALL USING (auth.role() = 'service_role');

-- 6. SOS 발송 이력 조회 함수 (API에서 사용)
CREATE OR REPLACE FUNCTION public.get_sos_history(p_shop_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE (
    id UUID,
    message TEXT,
    target_regions TEXT[],
    point_deducted INT,
    recipient_count INT,
    sent_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.id, sa.message, sa.target_regions,
        sa.point_deducted, sa.recipient_count, sa.sent_at
    FROM public.sos_alerts sa
    WHERE sa.shop_id = p_shop_id
    ORDER BY sa.sent_at DESC
    LIMIT p_limit;
END;
$$;

-- 7. 완료 확인
SELECT 'SOS 시스템 마이그레이션 완료' AS status;
