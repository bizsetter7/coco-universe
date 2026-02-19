-- 'messages' 테이블의 컬럼이 누락되었을 수 있으므로 강제로 추가합니다.
-- 이미 존재하는 컬럼은 무시됩니다 (IF NOT EXISTS).

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'normal';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 'inquiries' 테이블도 혹시 모르니 체크
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID,
    type TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    writer_name TEXT,
    password TEXT,
    contact TEXT,
    is_secret BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'new',
    reply_content TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화 및 정책 설정 (messages)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access messages" ON public.messages;
CREATE POLICY "Public full access messages" ON public.messages FOR ALL USING (true);

-- RLS 활성화 및 정책 설정 (inquiries)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access inquiries" ON public.inquiries;
CREATE POLICY "Public full access inquiries" ON public.inquiries FOR ALL USING (true);
