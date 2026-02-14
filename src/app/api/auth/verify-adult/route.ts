import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { identityVerificationId } = await request.json();

        if (!identityVerificationId) {
            return NextResponse.json({ success: false, message: '인증 ID가 누락되었습니다.' }, { status: 400 });
        }

        // [PortOne V2] Single Verification Data Fetch API
        // Documentation: https://api.portone.io/openapi/identity-verification/getIdentityVerification

        // 실제 발급받으신 Secret Key 반영
        const PORTONE_API_SECRET = 'dXRuhTtDXXTwKeH7H9s8Y6lRTwvAz5EOvsq3mjwVu4iqsBnn4hf9xrFyRKGYYoB2LMXo9uxRmXS3UVI7';

        // Skip actual API call if secret is missing (for local dev convenience)
        if (!PORTONE_API_SECRET) {
            console.warn('⚠️ PORTONE_API_SECRET is missing. Returning MOCK success for dev.');
            return NextResponse.json({ success: true, message: 'Dev Mock Success (Secret missing)' });
        }

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

        // Check if status is VERIFIED
        if (data.status !== 'VERIFIED') {
            return NextResponse.json({ success: false, message: '인증이 완료되지 않았습니다.' });
        }

        // Age Validation (Min 19)
        if (data.verifiedCustomer && data.verifiedCustomer.birthDate) {
            const birthDateStr = data.verifiedCustomer.birthDate; // YYYY-MM-DD
            const birthYear = parseInt(birthDateStr.substring(0, 4));
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;

            if (age < 19) {
                return NextResponse.json({ success: false, message: '만 19세 미만 청소년은 이용할 수 없습니다.' });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server Verification Error:', error);
        return NextResponse.json({ success: false, message: '서버 오류 발생' }, { status: 500 });
    }
}
