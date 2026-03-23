import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { getSosPointReason } from '@/lib/points';

function getAdmin() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return null;
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

const POINT_COST_MAP: Record<string, number> = {
    SOS_SEND_SMALL: 500,
    SOS_SEND_MEDIUM: 1000,
    SOS_SEND_LARGE: 1500,
    SOS_SEND_XLARGE: 2000,
};

// POST /api/sos/send
// body: { shopId, shopName, message, regions: string[] }
export async function POST(request: Request) {
    const supabaseAdmin = getAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
    }

    const vapidEmail = process.env.VAPID_EMAIL;
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (!vapidEmail || !vapidPublic || !vapidPrivate) {
        return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 503 });
    }

    webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

    try {
        const { shopId, shopName, message, regions } = await request.json();

        if (!shopId || !shopName || !message || !regions?.length) {
            return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 });
        }

        if (message.length > 50) {
            return NextResponse.json({ error: '메시지는 50자 이내로 작성해주세요.' }, { status: 400 });
        }

        // 1. 해당 지역 구독자 조회
        const { data: subscribers, error: subError } = await supabaseAdmin
            .from('push_subscriptions')
            .select('user_id, subscription')
            .overlaps('regions', regions);

        if (subError) throw subError;

        const recipientCount = subscribers?.length ?? 0;

        // 2. 포인트 확인 및 차감
        const pointReason = getSosPointReason(recipientCount);
        const pointCost = POINT_COST_MAP[pointReason];

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('points')
            .eq('id', shopId)
            .single();

        if (profileError) throw profileError;

        const currentPoints = profile?.points ?? 0;
        if (currentPoints < pointCost) {
            return NextResponse.json({
                error: `포인트가 부족합니다. 필요: ${pointCost}P, 보유: ${currentPoints}P`
            }, { status: 402 });
        }

        // 포인트 차감
        const { error: deductError } = await supabaseAdmin
            .from('profiles')
            .update({
                points: currentPoints - pointCost,
                updated_at: new Date().toISOString()
            })
            .eq('id', shopId);

        if (deductError) throw deductError;

        // point_logs 기록
        await supabaseAdmin.from('point_logs').insert({
            user_id: shopId,
            amount: -pointCost,
            reason: pointReason,
            note: `[SOS] ${shopName} → ${regions.join(', ')} (${recipientCount}명)`,
        });

        // 3. SOS 발송 이력 저장
        const { data: alertData, error: alertError } = await supabaseAdmin
            .from('sos_alerts')
            .insert({
                shop_id: shopId,
                shop_name: shopName,
                message,
                target_regions: regions,
                point_deducted: pointCost,
                recipient_count: recipientCount,
            })
            .select('id')
            .single();

        if (alertError) throw alertError;

        const alertId = alertData?.id;

        // 4. Web Push 발송 (Stealth 정책 적용)
        const pushPayload = JSON.stringify({
            stealth: true,
            title: '새 알림이 있습니다',
            body: `${shopName}: ${message}`,
            url: `/shops?sos=${alertId}`,
            alertId,
            tag: `sos-${alertId}`,
        });

        let successCount = 0;
        let failCount = 0;

        const sendPromises = (subscribers ?? []).map(async (sub) => {
            try {
                await webpush.sendNotification(sub.subscription, pushPayload);
                successCount++;
            } catch (err: any) {
                failCount++;
                if (err.statusCode === 410) {
                    await supabaseAdmin
                        .from('push_subscriptions')
                        .delete()
                        .eq('user_id', sub.user_id);
                }
            }
        });

        await Promise.allSettled(sendPromises);

        return NextResponse.json({
            success: true,
            recipientCount,
            successCount,
            failCount,
            pointDeducted: pointCost,
            remainingPoints: currentPoints - pointCost,
        });

    } catch (err: any) {
        console.error('SOS send error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
