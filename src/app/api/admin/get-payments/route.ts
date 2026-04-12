import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

/**
 * [Admin API] GET /api/admin/get-payments
 * service_role 클라이언트로 payments 전체 조회 (RLS 우회)
 * - admin/page.tsx에서 anon client로 조회 시 RLS에 의해 차단되는 문제 해결
 * - [M-020] 결제 미노출 원인: anon client RLS → service role로 분리
 */
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    try {
        const { data: payData, error } = await supabaseAdmin
            .from('payments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(2000);

        if (error) throw error;

        return NextResponse.json({ data: payData || [] });
    } catch (err: any) {
        console.error('[get-payments] Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
