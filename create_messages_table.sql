CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT,
    sender_name TEXT,
    receiver_id TEXT,
    receiver_name TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화 및 관리자/사용자 정책 설정 (단순화: 일단 모두 허용)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access messages" ON public.messages;
CREATE POLICY "Public full access messages" ON public.messages FOR ALL USING (true);
