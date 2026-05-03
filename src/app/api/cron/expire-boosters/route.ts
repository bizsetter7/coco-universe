import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * [Cron] /api/cron/expire-boosters — 매일 자정 1회 실행 (Vercel)
 *
 * ad_boosters 테이블에서 end_at이 지났고 status='active'인 레코드를 'expired'로 전환.
 * 광고 만료와 별개로 부스터 기간이 끝났을 때 자동 정리.
 *
 * Refs: A-6 (부스터 만료 자동화), BRIEFING.md
 */

function getAdmin() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return null;
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    const nowIso = new Date().toISOString();

    try {
        const { data, error } = await supabaseAdmin
            .from('ad_boosters')
            .update({ status: 'expired' })
            .eq('status', 'active')
            .lt('end_at', nowIso)
            .select('id');

        if (error) throw error;

        const expiredCount = data?.length ?? 0;
        return NextResponse.json({ success: true, expired: expiredCount });
    } catch (err: any) {
        console.error('[expire-boosters] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
