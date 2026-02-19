CREATE TABLE IF NOT EXISTS public.marketing_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID, -- Added for tracking upload sessions
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    shop_name TEXT,
    industry TEXT,
    industry_detail TEXT,
    region_city TEXT,
    region_gu TEXT,
    kakao_id TEXT,
    telegram_id TEXT,
    line_id TEXT,
    source_urls TEXT[] DEFAULT '{}', -- Added for multi-link aggregation
    source_url TEXT, -- Added for primary URL
    status TEXT DEFAULT 'new',
    source_site TEXT DEFAULT 'Upload',
    is_adult BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message_content TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    recipient_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    error_log TEXT,
    target_filter JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Idempotent Policies
DROP POLICY IF EXISTS "Admin full access targets" ON public.marketing_targets;
CREATE POLICY "Admin full access targets" ON public.marketing_targets FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin full access campaigns" ON public.marketing_campaigns;
CREATE POLICY "Admin full access campaigns" ON public.marketing_campaigns FOR ALL USING (true);

-- 3. Marketing Upload History
CREATE TABLE IF NOT EXISTS public.marketing_upload_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    total_count INTEGER DEFAULT 0,
    unique_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.marketing_upload_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access history" ON public.marketing_upload_history;
CREATE POLICY "Admin full access history" ON public.marketing_upload_history FOR ALL USING (true);
