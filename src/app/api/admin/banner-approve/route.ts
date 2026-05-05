import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

/**
 * [Admin API] /api/admin/banner-approve
 * 배너 이미지 승인/반려/취소/수정/직접등록 처리 (service_role 사용으로 RLS 우회)
 *
 * POST body:
 *   approve → { adId, action:'approve' }
 *   reject  → { adId, action:'reject', rejectReason? }
 *   revoke  → { adId, action:'revoke' }  (게시 취소 — banner 필드 초기화)
 *   update  → { adId, action:'update', banner_image_url?, banner_position?, banner_media_type? }
 *   create  → { adId:shopId, action:'create', banner_image_url, banner_position, banner_media_type? }
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
        const body = await request.json();
        const {
            adId,
            action,
            rejectReason,
            banner_image_url,
            banner_position,
            banner_media_type,
        } = body;

        const VALID_ACTIONS = ['approve', 'reject', 'revoke', 'update', 'create', 'cleanup'];
        if (!action || !VALID_ACTIONS.includes(action)) {
            return NextResponse.json({ error: `action은 ${VALID_ACTIONS.join('/')} 중 하나여야 합니다.` }, { status: 400 });
        }
        if (!adId) {
            return NextResponse.json({ error: 'adId(shopId)는 필수입니다.' }, { status: 400 });
        }

        const nowIso = new Date().toISOString();

        // ── cleanup: 마감/반려된 광고의 배너 일괄 정리 ──
        if (action === 'cleanup') {
            const todayKST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
            // 마감된 광고: status=CLOSED 또는 is_closed=true 또는 deadline < 오늘
            const { data: stale, error: staleErr } = await supabaseAdmin
                .from('shops')
                .select('id')
                .eq('banner_status', 'approved_banner')
                .or(`status.eq.CLOSED,is_closed.eq.true,deadline.lt.${todayKST}`);
            if (staleErr) throw staleErr;
            if (!stale || stale.length === 0) {
                return NextResponse.json({ success: true, cleaned: 0, message: '정리할 마감 배너 없음' });
            }
            const ids = stale.map(s => s.id);
            const { error: cleanErr } = await supabaseAdmin
                .from('shops')
                .update({
                    banner_status: 'none',
                    banner_image_url: null,
                    banner_position: null,
                    banner_media_type: null,
                    updated_at: new Date().toISOString(),
                })
                .in('id', ids);
            if (cleanErr) throw cleanErr;
            return NextResponse.json({ success: true, cleaned: ids.length });
        }

        // ── create: 어드민 직접 배너 등록 (즉시 approved_banner) ──
        if (action === 'create') {
            if (!banner_image_url || !banner_position) {
                return NextResponse.json({ error: 'banner_image_url, banner_position 필수' }, { status: 400 });
            }
            const { error: createErr } = await supabaseAdmin
                .from('shops')
                .update({
                    banner_image_url,
                    banner_position,
                    banner_media_type: banner_media_type || 'image',
                    banner_status: 'approved_banner',
                    updated_at: nowIso,
                })
                .eq('id', Number(adId));
            if (createErr) throw createErr;
            return NextResponse.json({ success: true, action: 'create', adId });
        }

        // 현재 광고 데이터 조회 (알림 발송용)
        const { data: shop, error: fetchError } = await supabaseAdmin
            .from('shops')
            .select('id, user_id, title, name, banner_image_url, banner_status')
            .eq('id', Number(adId))
            .single();

        if (fetchError || !shop) {
            return NextResponse.json({ error: `광고(ID: ${adId})를 찾을 수 없습니다.` }, { status: 404 });
        }

        // 배너 업데이트 데이터 구성
        const updateData: Record<string, any> = { updated_at: nowIso };

        if (action === 'approve') {
            updateData.banner_status = 'approved_banner';
        } else if (action === 'reject') {
            updateData.banner_status = 'rejected_banner';
            updateData.banner_image_url = null;
            updateData.banner_media_type = null;
        } else if (action === 'revoke') {
            updateData.banner_status = 'none';
            updateData.banner_image_url = null;
            updateData.banner_position = null;
            updateData.banner_media_type = null;
        } else if (action === 'update') {
            if (banner_image_url !== undefined) updateData.banner_image_url = banner_image_url;
            if (banner_position !== undefined) updateData.banner_position = banner_position;
            if (banner_media_type !== undefined) updateData.banner_media_type = banner_media_type;
        }

        // shops 테이블 업데이트
        const { error: updateError, count } = await supabaseAdmin
            .from('shops')
            .update(updateData, { count: 'exact' })
            .eq('id', Number(adId));

        if (updateError) throw updateError;
        if (count === 0) {
            throw new Error(`DB 업데이트 실패: 대상 광고(ID: ${adId})를 찾을 수 없습니다.`);
        }

        // 알림 발송 (approve/reject만)
        if (action === 'approve' || action === 'reject') {
            const targetUserId = shop.user_id;
            const isUuid = targetUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);
            if (isUuid) {
                const adName = shop.title || shop.name || '공고';
                await supabaseAdmin.from('notifications').insert({
                    user_id: targetUserId,
                    type: action === 'approve' ? 'BANNER_APPROVED' : 'BANNER_REJECTED',
                    title: action === 'approve' ? '배너 이미지가 승인되었습니다 ✅' : '배너 이미지가 반려되었습니다 ❌',
                    message: action === 'approve'
                        ? `'${adName}' 광고의 배너 이미지가 사이드바에 게재됩니다.`
                        : `'${adName}' 배너 이미지가 반려되었습니다. ${rejectReason ? `사유: ${rejectReason}` : '다시 업로드해 주세요.'}`,
                    read: false,
                    link: '/my-shop?view=dashboard',
                    created_at: nowIso,
                });
            }
        }

        return NextResponse.json({
            success: true,
            action,
            adId,
            banner_status: updateData.banner_status,
        });

    } catch (err: any) {
        console.error('[banner-approve] Error:', err.message);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
