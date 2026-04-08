import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
    const svc = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    try {
        const { adIds, amount, userId } = await request.json();
        
        if (!adIds || !Array.isArray(adIds)) {
            return NextResponse.json({ success: false, error: 'Invalid adIds' }, { status: 400 });
        }

        const stats = { updatedShops: 0, insertedPayments: 0 };

        for (const adId of adIds) {
            // 1. Update Shop status to 'active'
            const { data: shop, error: shopErr } = await svc
                .from('shops')
                .update({ 
                    status: 'active',
                    ad_price: amount || 0,
                    ad_duration: 30, // Default for backfill
                    updated_at: new Date().toISOString()
                })
                .eq('id', adId)
                .select()
                .single();

            if (!shopErr && shop) stats.updatedShops++;

            // 2. Insert Payment record
            if (shop) {
                const { error: payErr } = await svc.from('payments').insert([{
                    user_id: userId,
                    shop_id: adId,
                    amount: amount || 0,
                    status: 'completed',
                    type: 'AD',
                    method: 'admin_manual',
                    description: `[T1] ${shop.title} (대장님 직접 등록/0원 소급)`,
                    metadata: {
                        shop_name: shop.name || '',
                        tier: shop.tier || 'grand',
                        duration: 30,
                        admin_id: 'internal_agent_fix'
                    },
                    created_at: new Date().toISOString()
                }]);
                if (!payErr) stats.insertedPayments++;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `${stats.updatedShops}개 광고 수복 및 ${stats.insertedPayments}개 결제 내역 생성 완료`,
            stats 
        });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
