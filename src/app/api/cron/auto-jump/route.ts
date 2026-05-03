import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return null;
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

// 야사장 구독 플랜 기준 자동 점프 설정 (M-060 정책표)
// premium: 8회/일(3h), deluxe: 6회/일(4h), special: 3회/일(8h), standard/basic: 0
const JUMP_AUTO_CONFIG: Record<string, { auto: number; intervalHours: number }> = {
    premium:  { auto: 8, intervalHours: 3 },
    deluxe:   { auto: 6, intervalHours: 4 },
    special:  { auto: 3, intervalHours: 8 },
    standard: { auto: 0, intervalHours: 0 },
    basic:    { auto: 0, intervalHours: 0 },
};

function resolveAutoJumpConfig(rawTier: string) {
    const key = (rawTier || '').toLowerCase().trim();
    return (
        JUMP_AUTO_CONFIG[key] ??
        JUMP_AUTO_CONFIG[rawTier.trim()] ?? // 한글 원본 그대로
        { auto: 0, intervalHours: 0 }       // 매핑 실패 → 자동 점프 없음
    );
}

// Security: Use CRON_SECRET to verify the request comes from Vercel
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    try {
        // 활성 광고 중 auto_jump_enabled === true 인 것만 조회
        const { data: shops, error } = await supabaseAdmin
            .from('shops')
            .select('id, user_id, status, product_type, options')
            .neq('status', 'CLOSED')
            .neq('status', 'closed')
            .neq('status', 'REJECTED')
            .neq('status', 'rejected');

        if (error) throw error;
        if (!shops) return NextResponse.json({ jumped: 0 });

        let jumpCount = 0;
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
        const nowMs = Date.now();

        for (const shop of shops) {
            const options = shop.options || {};

            // [B방안] 사용자가 자동 점프를 명시적으로 ON 해야만 실행
            if (!options.auto_jump_enabled) continue;

            const rawTier = shop.product_type || options.product_type || 'p7';
            const { auto: maxAutoJumps, intervalHours } = resolveAutoJumpConfig(rawTier);

            if (maxAutoJumps === 0) continue; // T6, T7 — 자동 점프 미지원

            let currentAutoJumps = options.daily_auto_jump_count || 0;
            if (options.last_auto_jump_date !== today) {
                currentAutoJumps = 0; // 날짜 바뀌면 리셋
            }

            if (currentAutoJumps >= maxAutoJumps) continue; // 오늘 한도 소진

            const lastTimestamp = options.last_auto_jump_timestamp || 0;
            const hoursSinceLast = (nowMs - lastTimestamp) / (1000 * 60 * 60);

            // 인터벌 허용 오차 5% (cron 실행 지연 대응)
            if (lastTimestamp !== 0 && hoursSinceLast < intervalHours * 0.95) continue;

            const newOptions = {
                ...options,
                daily_auto_jump_count: currentAutoJumps + 1,
                last_auto_jump_date: today,
                last_auto_jump_timestamp: nowMs,
            };
            const nowIso = new Date().toISOString();

            await supabaseAdmin
                .from('shops')
                .update({
                    created_at: nowIso,
                    updated_at: nowIso,
                    options: newOptions,
                })
                .eq('id', shop.id);

            jumpCount++;
        }

        return NextResponse.json({ success: true, jumpedCount: jumpCount });
    } catch (err: any) {
        console.error('Auto-jump cron error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
