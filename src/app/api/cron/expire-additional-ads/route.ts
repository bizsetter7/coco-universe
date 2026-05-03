import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * [Cron] /api/cron/expire-additional-ads — 매일 자정 1회 실행 (Vercel)
 *
 * shops 테이블에서 additional_ad_expires_at이 지났고
 * additional_ad_status='active'인 레코드를 'none'으로 전환.
 *
 * Refs: Phase F (추가광고 결제 시스템)
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
            .from('shops')
            .update({ additional_ad_status: 'none', additional_ad_expires_at: null })
            .eq('additional_ad_status', 'active')
            .lt('additional_ad_expires_at', nowIso)
            .select('id');

        if (error) throw error;

        const expiredCount = data?.length ?? 0;
        return NextResponse.json({ success: true, expired: expiredCount });
    } catch (err: any) {
        console.error('[expire-additional-ads] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
