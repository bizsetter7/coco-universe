import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for DB updates
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // In production, consider using a service_role key for admin updates
);

export async function POST(request: Request) {
    try {
        const { identityVerificationId, userId } = await request.json();

        if (!identityVerificationId) {
            return NextResponse.json({ success: false, message: '인증 ID가 누락되었습니다.' }, { status: 400 });
        }

        const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;

        // Skip actual API call if secret is missing (for local dev convenience)
        if (!PORTONE_API_SECRET || PORTONE_API_SECRET === 'YOUR_PORTONE_SECRET') {
            console.warn('⚠️ PORTONE_API_SECRET is missing. Returning MOCK success for dev.');

            // Even in mock mode, try to update DB if userId is provided
            if (userId && !userId.startsWith('mock_')) {
                await supabaseAdmin
                    .from('profiles')
                    .update({ is_adult_verified: true, updated_at: new Date().toISOString() })
                    .eq('id', userId);
            }

            return NextResponse.json({ success: true, message: 'Dev Mock Success (Secret missing)' });
        }

        // 1. Fetch verification data from PortOne
        const response = await fetch(`https://api.portone.io/identity-verifications/${encodeURIComponent(identityVerificationId)}`, {
            headers: {
                Authorization: `PortOne ${PORTONE_API_SECRET}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ success: false, message: errorData.message || '인증 정보 조회 실패' }, { status: response.status });
        }

        const data = await response.json();

        // 2. Check if status is VERIFIED
        if (data.status !== 'VERIFIED') {
            return NextResponse.json({ success: false, message: '인증이 완료되지 않았습니다.' });
        }

        // 3. Age Validation (Min 19)
        if (data.verifiedCustomer && data.verifiedCustomer.birthDate) {
            const birthDateStr = data.verifiedCustomer.birthDate; // YYYY-MM-DD
            const birthYear = parseInt(birthDateStr.substring(0, 4));
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;

            if (age < 19) {
                return NextResponse.json({ success: false, message: '만 19세 미만 청소년은 이용할 수 없습니다.' });
            }

            // 4. Update Database if user is logged in
            if (userId && !userId.startsWith('mock_')) {
                const { error: updateError } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        is_adult_verified: true,
                        birth_date: birthDateStr,
                        full_name: data.verifiedCustomer.name,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (updateError) {
                    console.error('DB Update Error:', updateError);
                    // We don't necessarily fail the whole request if DB update fails, 
                    // but it's good to know.
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server Verification Error:', error);
        return NextResponse.json({ success: false, message: '서버 오류 발생' }, { status: 500 });
    }
}
