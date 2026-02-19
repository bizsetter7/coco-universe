import { NextResponse } from 'next/server';
import { supabase as supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { campaignId, message, targets, channel } = body;

        if (!campaignId || !message || !targets || targets.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
        }

        // 1. (Optional) Validate Admin Session here if not handled by middleware
        // For now, we trust the caller (Admin UI) passing a valid session token or check via header if needed.
        // Simplified for this context.

        // 2. Mock Mode Check (If keys are missing, lib/sms.ts handles it safely, 
        // but we can also check here to provide explicit feedback)
        const isMock = !process.env.SOLAPI_API_KEY || !process.env.SOLAPI_SENDER_NUMBER;

        // 3. Send Messages
        let successCount = 0;
        let failedCount = 0;
        let errorMsg = '';

        try {
            // Extract phone numbers
            const phoneNumbers = targets.map((t: any) => t.phone_number).filter((p: any) => p);

            // Only send if we have numbers
            if (phoneNumbers.length > 0) {
                const result = await sendSMS(phoneNumbers, message);

                if (result.success) {
                    if (result.type === 'mock') {
                        // Mock success
                        successCount = phoneNumbers.length;
                    } else {
                        // Real success
                        successCount = result.successCount || (result.result ? 1 : 0);
                        failedCount = result.failCount || 0;
                    }
                } else {
                    failedCount = phoneNumbers.length;
                    errorMsg = result.error || 'Sending failed';
                }
            }
        } catch (e: any) {
            console.error('API Send Error:', e);
            failedCount = targets.length;
            errorMsg = e.message;
        }

        // 4. Update Database
        await supabaseAdmin
            .from('marketing_campaigns')
            .update({
                status: 'completed',
                success_count: successCount,
                failed_count: failedCount,
                error_log: errorMsg ? errorMsg : null,
                sent_at: new Date().toISOString()
            })
            .eq('id', campaignId);

        return NextResponse.json({
            success: true,
            isMock,
            summary: { total: targets.length, success: successCount, failed: failedCount }
        });

    } catch (error: any) {
        console.error('Server Internal Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
