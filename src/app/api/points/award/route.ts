import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// [Security] Service role key — 서버에서만 사용, RLS 완전 우회
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

const POINT_AMOUNTS: Record<string, number> = {
    JOIN: 100,
    RESUME_UPLOAD: 500,
    COMMUNITY_POST: 20,
    COMMUNITY_COMMENT: 5,
    COUPON_EXCHANGE: -2000,
    RESUME_JUMP: 0,
    SHOP_JUMP: 0,
    SOS_SEND_SMALL: -500,
    SOS_SEND_MEDIUM: -1000,
    SOS_SEND_LARGE: -1500,
    SOS_SEND_XLARGE: -2000,
    ADMIN_GRANT: 0,
    ATTENDANCE_CHECK: 3,
};

export async function POST(request: NextRequest) {
    try {
        const { userId, reason, customAmount } = await request.json();

        if (!userId || !reason) {
            return NextResponse.json({ error: 'userId and reason are required' }, { status: 400 });
        }

        const amount = customAmount ?? POINT_AMOUNTS[reason];
        if (amount === undefined) {
            return NextResponse.json({ error: `Unknown point reason: ${reason}` }, { status: 400 });
        }

        // 1. 현재 포인트 조회
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('points')
            .eq('id', userId)
            .maybeSingle();

        if (profileError) {
            console.error('[award-points] Profile fetch error:', profileError.message);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        const newTotal = (profile?.points || 0) + amount;

        // 2. 포인트 업데이트
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ points: newTotal, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (updateError) {
            console.error('[award-points] Profile update error:', updateError.message);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 3. 포인트 로그 기록 (service role → RLS 우회)
        const { error: logError } = await supabaseAdmin
            .from('point_logs')
            .insert({ user_id: userId, amount, reason });

        if (logError) {
            console.error('[award-points] Log insert error:', logError.message);
            // 로그 실패해도 포인트 업데이트는 완료됐으므로 경고만
            return NextResponse.json({ success: true, newTotal, warning: 'Log failed: ' + logError.message });
        }

        return NextResponse.json({ success: true, newTotal });

    } catch (err: any) {
        console.error('[award-points] Unexpected error:', err.message);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
