import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

/**
 * [Admin API] /api/admin/grant-balance
 * 어드민 수동 포인트/점프 지급 — service role key로 RLS 완전 우회
 * AdminPaymentManagement.handlePointGrant에서 호출
 */
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    try {
        const { userId, amount, type } = await request.json();

        if (!userId || !amount || !type) {
            return NextResponse.json({ error: 'userId, amount, type은 필수입니다.' }, { status: 400 });
        }
        if (type !== 'points' && type !== 'jump_balance') {
            return NextResponse.json({ error: 'type은 points 또는 jump_balance만 허용됩니다.' }, { status: 400 });
        }

        const now = new Date().toISOString();
        let newTotal = 0;

        if (type === 'points') {
            // 포인트 — profiles.points 사용 (P2 코코알바 레거시 유지)
            const { data: profile, error: fetchError } = await supabaseAdmin
                .from('profiles')
                .select('points')
                .eq('id', userId)
                .single();
            if (fetchError) throw fetchError;

            const current = profile?.points || 0;
            newTotal = current + Number(amount);

            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ points: newTotal, updated_at: now })
                .eq('id', userId);
            if (updateError) throw updateError;

            // point_logs 기록
            const { error: logError } = await supabaseAdmin
                .from('point_logs')
                .insert({ user_id: userId, amount: Number(amount), reason: 'ADMIN_GRANT' });
            if (logError) {
                // 로그 실패 시 포인트 롤백
                await supabaseAdmin
                    .from('profiles')
                    .update({ points: current, updated_at: now })
                    .eq('id', userId);
                throw new Error(`point_logs 기록 실패: ${logError.message}`);
            }
        } else {
            // 점프 — user_jumps.package_balance 사용 (2026-04-30 신규 시스템)
            // 어드민 지급 = 패키지 충전과 동일 취급 (만료 없음)
            const { data: existing } = await supabaseAdmin
                .from('user_jumps')
                .select('package_balance')
                .eq('user_id', userId)
                .maybeSingle();

            const current = existing?.package_balance ?? 0;
            newTotal = current + Number(amount);

            if (existing) {
                const { error: updateError } = await supabaseAdmin
                    .from('user_jumps')
                    .update({ package_balance: newTotal, updated_at: now })
                    .eq('user_id', userId);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabaseAdmin
                    .from('user_jumps')
                    .insert({ user_id: userId, package_balance: newTotal });
                if (insertError) throw insertError;
            }

            // 점프 로그도 point_logs 재활용
            await supabaseAdmin
                .from('point_logs')
                .insert({ user_id: userId, amount: Number(amount), reason: 'ADMIN_JUMP_GRANT' });
        }

        return NextResponse.json({ success: true, newTotal });

    } catch (err: any) {
        console.error('[grant-balance] Error:', err.message);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
