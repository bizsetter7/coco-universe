import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return null;
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

// Security: Use CRON_SECRET to verify the request comes from Vercel
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getAdmin();
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 503 });
    }

    try {
        // Fetch all active ads
        const { data: shops, error } = await supabaseAdmin
            .from('shops')
            .select(`id, user_id, status, product_type, options`)
            .neq('status', 'CLOSED')
            .neq('status', 'closed')
            .neq('status', 'REJECTED')
            .neq('status', 'rejected');

        if (error) throw error;
        if (!shops) return NextResponse.json({ jumped: 0 });

        let jumpCount = 0;
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
        const nowMs = Date.now();

        for (const shop of shops) {
            const tier = shop.product_type || shop.options?.product_type || '베이직';
            
            // Auto Jump eligibility
            let maxAutoJumps = 0;
            let intervalHours = 0;

            if (tier.includes('그랜드') || tier.includes('프리미엄') || tier.includes('VIP') || tier === 'T1' || tier === 'T2' || tier === 'T3') {
                maxAutoJumps = 8;
                intervalHours = 3;
            } else if (tier.includes('디럭스') || tier.includes('스페셜') || tier === 'T4' || tier === 'T5') {
                maxAutoJumps = 6;
                intervalHours = 4;
            }

            if (maxAutoJumps === 0) continue; // Basic and similar tiers don't have auto jump

            const options = shop.options || {};
            let currentAutoJumps = options.daily_auto_jump_count || 0;
            if (options.last_auto_jump_date !== today) {
                currentAutoJumps = 0;
            }

            if (currentAutoJumps >= maxAutoJumps) continue; // Used up for today

            const lastTimestamp = options.last_auto_jump_timestamp || 0;
            const hoursSinceLastJump = (nowMs - lastTimestamp) / (1000 * 60 * 60);

            // Allow slightly less than interval to tolerate cron timings (e.g. 2.95 hrs instead of 3.0 hrs)
            if (lastTimestamp === 0 || hoursSinceLastJump >= (intervalHours * 0.95)) {
                // Time to jump!
                const newOptions = {
                    ...options,
                    daily_auto_jump_count: currentAutoJumps + 1,
                    last_auto_jump_date: today,
                    last_auto_jump_timestamp: nowMs
                };
                const nowIso = new Date().toISOString();

                await supabaseAdmin.from('shops')
                    .update({ 
                        created_at: nowIso, 
                        updated_at: nowIso,
                        options: newOptions 
                    })
                    .eq('id', shop.id);
                
                jumpCount++;
            }
        }

        return NextResponse.json({ success: true, jumpedCount: jumpCount });
    } catch (err: any) {
        console.error('Auto-jump cron error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
