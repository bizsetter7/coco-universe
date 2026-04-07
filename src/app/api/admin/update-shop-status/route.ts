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

        // 1. Shops 테이블 업데이트 (TEXT ID이므로 String으로 확실히 매칭)
        const { error: shopError } = await supabaseAdmin
            .from('shops')
            .update(updateData)
            .eq('id', String(adId));

        if (shopError) throw shopError;

        // 2. 결제 내역 동기화 (status가 active일 때 입금확인 처리)
        if (status === 'active') {
            // 기존 결제 시도 내역이 있는지 확인
            const { data: existingPayments } = await supabaseAdmin
                .from('payments')
                .select('id')
                .eq('shop_id', String(adId));

            if (existingPayments && existingPayments.length > 0) {
                // 기존 내역 승인
                await supabaseAdmin
                    .from('payments')
                    .update({ status: 'completed', updated_at: nowIso })
                    .eq('shop_id', String(adId));
            } else if (adData) {
                // 내역이 없으면 새로 생성 (AdManagement에서 넘겨준 adData 기반)
                const adPrice = Number(adData.ad_price || adData.adPrice || 0);
                const userId = adData.user_id || adData.ownerId;
                
                if (userId) {
                    await supabaseAdmin.from('payments').insert([{
                        shop_id: String(adId),
                        user_id: userId,
                        amount: adPrice,
                        status: 'completed',
                        method: 'bank_transfer',
                        description: `[시스템승인] ${adData.name || '공고'} 결제 완료`,
                        metadata: {
                            shopName: adData.name,
                            adTitle: adData.title,
                            product_type: adData.tier || adData.product_type
                        }
                    }]);
                }
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
