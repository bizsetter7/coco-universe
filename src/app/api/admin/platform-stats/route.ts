import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

/**
 * GET /api/admin/platform-stats
 *
 * shops/payments 테이블의 platform 컬럼 값 분포 조회 (어드민 진단용).
 * 기존 코코알바 직접입점 vs 야사장 경유 광고 구분 현황 확인.
 */
export async function GET(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(SB_URL, SR_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    try {
        const { data: shops } = await supabaseAdmin
            .from('shops')
            .select('platform')
            .limit(5000);
        const { data: payments } = await supabaseAdmin
            .from('payments')
            .select('platform')
            .limit(5000);

        const tally = (rows: any[] | null) => {
            const counts: Record<string, number> = {};
            (rows || []).forEach(r => {
                const p = r.platform || '(NULL)';
                counts[p] = (counts[p] || 0) + 1;
            });
            return counts;
        };

        return NextResponse.json({
            shops: tally(shops),
            shopsTotal: shops?.length || 0,
            payments: tally(payments),
            paymentsTotal: payments?.length || 0,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Unknown' }, { status: 500 });
    }
}
