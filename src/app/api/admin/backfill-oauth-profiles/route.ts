import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

/**
 * POST /api/admin/backfill-oauth-profiles
 *
 * 기존 OAuth 가입자(username='신규회원' 등 placeholder 잔존) 일괄 보정.
 *
 * 동작:
 * - profiles에서 placeholder/누락 데이터 식별
 * - auth.users에서 email/metadata 추출하여 본문 채움
 * - businesses 테이블에 매칭 row 있으면 business_name/phone 동기화
 * - 개인회원이고 SIGNUP_BONUS 로그 없으면 100p 지급 + 로그 기록
 *
 * 응답: { processed, granted, skipped, errors }
 */
export async function POST(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SR_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(SB_URL, SR_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    let processed = 0;
    let granted = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
        // placeholder 후보 조회: username='신규회원' OR full_name 비어있음
        const { data: candidates, error: cErr } = await supabaseAdmin
            .from('profiles')
            .select('id, username, full_name, nickname, role, user_type, points, business_name, phone, contact_email')
            .or('username.eq.신규회원,full_name.is.null,full_name.eq.')
            .limit(500);

        if (cErr) throw cErr;
        if (!candidates || candidates.length === 0) {
            return NextResponse.json({ processed: 0, granted: 0, skipped: 0, message: '보정 대상 없음' });
        }

        for (const p of candidates) {
            try {
                // auth.users에서 email + metadata 가져오기
                const { data: auData } = await supabaseAdmin.auth.admin.getUserById(p.id);
                const authUser = auData?.user;
                if (!authUser) {
                    skipped++;
                    continue;
                }
                const email = authUser.email || '';
                const meta = (authUser.user_metadata || {}) as Record<string, any>;
                const googleName = meta.full_name || meta.name || '';

                // businesses 매칭 (업체회원인 경우 상호명/전화 보강)
                let bizName: string | null = null;
                let bizPhone: string | null = null;
                if (p.role === 'corporate' || p.user_type === 'corporate') {
                    const { data: biz } = await supabaseAdmin
                        .from('businesses')
                        .select('name, phone')
                        .eq('owner_id', p.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    bizName = biz?.name ?? null;
                    bizPhone = biz?.phone ?? null;
                }

                const finalUsername =
                    p.username && p.username !== '신규회원'
                        ? p.username
                        : (email.split('@')[0] || `user_${p.id.slice(0, 8)}`);
                const finalFullName = p.full_name || googleName || bizName || '';
                const finalNickname = p.nickname || googleName || finalUsername;
                const finalRole = p.role || 'individual';

                const payload: Record<string, any> = {
                    id: p.id,
                    username: finalUsername,
                    full_name: finalFullName,
                    nickname: finalNickname,
                    role: finalRole,
                    user_type: p.user_type || finalRole,
                    contact_email: p.contact_email || email,
                };
                if (bizName) payload.business_name = p.business_name || bizName;
                if (bizPhone || p.phone) payload.phone = p.phone || bizPhone;

                const { error: upErr } = await supabaseAdmin
                    .from('profiles')
                    .upsert(payload, { onConflict: 'id' });
                if (upErr) {
                    errors.push(`${p.id.slice(0, 8)}: ${upErr.message}`);
                    continue;
                }

                // 100포인트 보너스 (개인회원 + SIGNUP_BONUS 로그 없을 때만)
                if (finalRole === 'individual') {
                    const { data: existingBonus } = await supabaseAdmin
                        .from('point_logs')
                        .select('id')
                        .eq('user_id', p.id)
                        .eq('reason', 'SIGNUP_BONUS')
                        .maybeSingle();

                    if (!existingBonus) {
                        const currentPoints = p.points || 0;
                        await supabaseAdmin
                            .from('profiles')
                            .update({ points: currentPoints + 100 })
                            .eq('id', p.id);
                        await supabaseAdmin
                            .from('point_logs')
                            .insert({ user_id: p.id, amount: 100, reason: 'SIGNUP_BONUS' });
                        granted++;
                    }
                }

                processed++;
            } catch (e: any) {
                errors.push(`${p.id.slice(0, 8)}: ${e?.message || 'unknown'}`);
            }
        }

        return NextResponse.json({
            processed,
            granted,
            skipped,
            errorCount: errors.length,
            errors: errors.slice(0, 20),
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err?.message || 'Unknown error' }, { status: 500 });
    }
}
