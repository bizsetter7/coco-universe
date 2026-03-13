import { NextResponse } from 'next/server';
import { supabase as supabaseAdmin } from '@/lib/supabase';
import { sendSMS, isSMSMock } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { campaignId, message, targets, channel } = body;

        if (!campaignId || !message || !targets || targets.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid payload' },
                { status: 400 }
            );
        }

        // ── Mock 모드 판단 ────────────────────────────────────────────────
        // lib/sms.ts 의 isSMSMock(환경변수 누락 여부)를 단일 진실 공급원으로 사용.
        // SOLAPI_* 참조 완전 제거 → ALIGO_* 기반으로 통일.
        const isMock = isSMSMock;

        // ── 발송 ─────────────────────────────────────────────────────────
        let successCount = 0;
        let failedCount  = 0;
        let errorMsg     = '';

        try {
            const phoneNumbers: string[] = targets
                .map((t: any) => t.phone_number as string)
                .filter((p: string) => p?.trim());

            if (phoneNumbers.length > 0) {
                const result = await sendSMS(phoneNumbers, message, {
                    // LMS 채널이면 제목 주입 (90자 이하도 LMS 강제)
                    title   : channel === 'lms' ? '[코코알바]' : undefined,
                    // ALIGO_TEST_MODE=true 이면 testmode_yn=Y → 과금 없음
                    testmode: process.env.ALIGO_TEST_MODE === 'true',
                });

                if (result.success) {
                    switch (result.type) {
                        case 'mock':
                        case 'aligo-test':
                            // Mock 또는 알리고 테스트 모드: 전원 성공 처리
                            successCount = phoneNumbers.length;
                            break;
                        default:
                            // 실제 발송: 알리고 집계값 사용
                            successCount = result.successCount ?? 0;
                            failedCount  = result.failCount    ?? 0;
                    }
                    // 부분 실패 경고 (성공이지만 일부 오류)
                    if (result.error) {
                        console.warn('[API/marketing/send] 부분 실패:', result.error);
                        errorMsg = result.error;
                    }
                } else {
                    failedCount = phoneNumbers.length;
                    errorMsg    = result.error || '알리고 발송 실패';
                }
            }
        } catch (e: any) {
            console.error('[API/marketing/send] 발송 예외:', e);
            failedCount = targets.length;
            errorMsg    = e.message;
        }

        // ── DB 업데이트 ──────────────────────────────────────────────────
        await supabaseAdmin
            .from('marketing_campaigns')
            .update({
                status       : 'completed',
                success_count: successCount,
                failed_count : failedCount,
                error_log    : errorMsg || null,
                sent_at      : new Date().toISOString(),
            })
            .eq('id', campaignId);

        return NextResponse.json({
            success : true,
            isMock,
            provider: 'aligo',
            summary : {
                total  : targets.length,
                success: successCount,
                failed : failedCount,
            },
        });

    } catch (error: any) {
        console.error('[API/marketing/send] Internal Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
