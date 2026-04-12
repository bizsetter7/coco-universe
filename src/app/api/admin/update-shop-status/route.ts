import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/requireAdmin';

/**
 * [Admin API] /api/admin/update-shop-status
 * 공고 승인/반려 상태 변경 및 결제 내역 동기화 (service_role 사용으로 RLS 우회)
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
        const { adId, status, rejectionReason, adData } = await request.json();

        if (!adId || !status) {
            return NextResponse.json({ error: 'adId와 status는 필수입니다.' }, { status: 400 });
        }

        const nowIso = new Date().toISOString();
        const updateData: any = {
            status: status,
            updated_at: nowIso
        };

        if (status === 'active') {
            updateData.approved_at = nowIso;
        } else if (status === 'rejected') {
            updateData.rejection_reason = rejectionReason;
            
            // 반려 히스토리 추가를 위해 현재 데이터 조회
            const { data: currentShop } = await supabaseAdmin
                .from('shops')
                .select('options')
                .eq('id', String(adId))
                .single();
            
            const currentOptions = currentShop?.options || {};
            const currentHistory = (currentOptions as any).rejection_history || [];
            const newHistoryItem = {
                reason: rejectionReason || '심사 기준 미달',
                date: nowIso,
                index: currentHistory.length + 1
            };
            
            updateData.options = {
                ...currentOptions,
                rejection_history: [...currentHistory, newHistoryItem]
            };
        }

        // 1. Shops 테이블 업데이트 (int8 ID → Number로 매칭)
        // [Strict Update] 업데이트 건수를 명확히 체크하여 0건일 경우 에러 발생 (RLS/ID 불일치 감지)
        const { error: shopError, count } = await supabaseAdmin
            .from('shops')
            .update(updateData, { count: 'exact' })
            .eq('id', Number(adId));

        if (shopError) throw shopError;
        
        // 중요: 업데이트된 행이 0개라면 ID 매칭 실패 또는 권한(Service Role Key) 누락 가능성
        if (count === 0) {
            const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
            throw new Error(`DB 업데이트 실패: 대상 공고(ID: ${adId})를 찾을 수 없습니다. ${!hasServiceKey ? "(서버 Service Key 누락 의심)" : "(ID 불일치 의심)"}`);
        }

        // 2. 결제 내역 동기화 (status가 active일 때 입금확인 처리)
        if (status === 'active') {
            // [M-015 Fix] ad_price: shops 루트 컬럼 → options.ad_price → price 순 폴백
            const adPrice = Number(
                adData?.ad_price ||
                adData?.adPrice ||
                (adData?.options as any)?.ad_price ||
                adData?.price ||
                0
            );
            const userId = adData?.user_id || adData?.ownerId;

            // [M-015 Fix] shop_id는 payments 테이블에서 TEXT 타입 → String()으로 통일
            const { data: existingPayment } = await supabaseAdmin
                .from('payments')
                .select('id')
                .eq('shop_id', String(adId))
                .maybeSingle();

            if (existingPayment) {
                // 기존 내역이 있으면 'completed'로 상태 업데이트 및 금액 최종 동기화
                const { error: updatePayErr } = await supabaseAdmin
                    .from('payments')
                    .update({
                        status: 'completed',
                        type: 'AD',
                        amount: adPrice,
                        updated_at: nowIso,
                        description: `[시스템승인] ${adData?.name || '공고'} 결제 승인 완료`
                    })
                    .eq('id', existingPayment.id);
                if (updatePayErr) console.error('[update-shop-status] 결제 업데이트 실패:', updatePayErr.message);
            } else if (userId) {
                // 내역이 전혀 없으면 강제로 'completed' 내역 생성 (관리자 리스트 노출용)
                const shopName = adData?.shopName || adData?.name || adData?.shop_name || '비즈니스 업체';
                const adTitle = adData?.title || adData?.adTitle || '공고 내역';
                
                const { error: insertPayErr } = await supabaseAdmin.from('payments').insert([{
                    shop_id: String(adId),
                    user_id: userId,
                    amount: adPrice,
                    status: 'completed',
                    type: 'AD',
                    method: 'bank_transfer',
                    description: `[관리자승인] ${shopName} 결제 완료`,
                    created_at: nowIso,
                    updated_at: nowIso,
                    metadata: {
                        shopName: shopName,
                        adTitle: adTitle,
                        product_type: adData?.tier || adData?.product_type || 'p7'
                    }
                }]);
                if (insertPayErr) console.error('[update-shop-status] 결제 생성 실패:', insertPayErr.message);
            }

            // 3. 알림 쪽지 발송 (status === 'active')
            const targetUserId = adData?.user_id || adData?.ownerId;
            if (targetUserId) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetUserId);
                if (isUuid) {
                    await supabaseAdmin.from('notifications').insert({
                        user_id: targetUserId,
                        type: 'AD_APPROVED',
                        title: '광고가 승인되었습니다 ✅',
                        message: `'${adData.title || adData.name || '공고'}'가 심사를 통과하여 정상 게재 중입니다.`,
                        read: false,
                        link: '/my-shop?view=dashboard',
                        created_at: nowIso,
                    });
                }
            }
        }

        return NextResponse.json({ success: true, status });

    } catch (err: any) {
        console.error('[update-shop-status] Error:', err.message);
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
