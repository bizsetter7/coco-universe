import { NextResponse } from 'next/server';
import { supabase as supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────
// 나이스평가정보 화이트셀(White Cell) 본인인증 연동 포인트
//
// 필요 환경변수 (.env.local):
//   NICE_CLIENT_ID      : 나이스 API 클라이언트 ID
//   NICE_CLIENT_SECRET  : 나이스 API 클라이언트 시크릿
//   NICE_PRODUCT_ID     : 화이트셀 상품 ID (예: 01000000000408)
//
// 연동 흐름:
//   1. 클라이언트에서 암호화 토큰 요청 → NICE 서버 → enc_data 수신
//   2. NICE 팝업창 호출 (form POST → https://nice.checkplus.co.kr/...)
//   3. 인증 완료 후 NICE 서버가 success_url 로 token_version_id, enc_data, integrity_value 전달
//   4. 이 API 라우트에서 NICE 복호화 API 호출 → 실명·생년월일 수신
//   5. 만 19세 이상 검증 후 Supabase profiles 업데이트
//
// 참고: https://developers.niceid.co.kr/identity-verification
// ─────────────────────────────────────────────────────────────────

function calcAge(birthDateStr: string): number {
    // YYYYMMDD 또는 YYYY-MM-DD 형식 모두 처리
    const normalized = birthDateStr.replace(/-/g, '');
    const birthYear  = parseInt(normalized.substring(0, 4), 10);
    const birthMonth = parseInt(normalized.substring(4, 6), 10);
    const birthDay   = parseInt(normalized.substring(6, 8), 10);

    const today = new Date();
    let age = today.getFullYear() - birthYear;

    // 생일이 아직 지나지 않았으면 1살 차감
    if (
        today.getMonth() + 1 < birthMonth ||
        (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)
    ) {
        age -= 1;
    }
    return age;
}

export async function POST(request: Request) {
    try {
        // TODO: 나이스 화이트셀 연동 시 클라이언트에서 전달받을 파라미터로 교체
        // 현재는 { token_version_id, enc_data, integrity_value, userId } 수신 예정
        const { token_version_id, enc_data, integrity_value, userId } = await request.json();

        // ── [NICE 화이트셀 연동 포인트] ──────────────────────────────
        // TODO: 아래 주석 블록을 실제 연동 코드로 교체하세요.
        //
        // const NICE_CLIENT_ID     = process.env.NICE_CLIENT_ID;
        // const NICE_CLIENT_SECRET = process.env.NICE_CLIENT_SECRET;
        // const NICE_PRODUCT_ID    = process.env.NICE_PRODUCT_ID;
        //
        // if (!NICE_CLIENT_ID || !NICE_CLIENT_SECRET || !NICE_PRODUCT_ID) {
        //     return NextResponse.json({ success: false, message: 'NICE 환경변수가 설정되지 않았습니다.' }, { status: 500 });
        // }
        //
        // // 1. NICE OAuth 액세스 토큰 발급
        // const tokenRes = await fetch('https://svc.niceid.co.kr/oauth2.0/token', { ... });
        // const { access_token } = await tokenRes.json();
        //
        // // 2. NICE 복호화 API 호출 (token_version_id, enc_data, integrity_value 전달)
        // const decryptRes = await fetch('https://svc.niceid.co.kr/digital/niceid/api/v1.0/name/crypto-token', {
        //     method: 'POST',
        //     headers: { Authorization: `bearer ${access_token}`, 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ dataHeader: { CNTY_CD: 'ko' }, dataBody: { token_version_id, enc_data, integrity_value } }),
        // });
        // const niceData = await decryptRes.json();
        //
        // // 3. 복호화 결과에서 실명·생년월일 추출
        // const birthDateStr = niceData.dataBody.birthdate; // YYYYMMDD
        // const fullName     = niceData.dataBody.utf8_name;
        // ─────────────────────────────────────────────────────────────

        // ── 임시: 연동 전까지 해당 엔드포인트 비활성화 ───────────────
        if (!token_version_id || !enc_data || !integrity_value) {
            return NextResponse.json(
                { success: false, message: '나이스 화이트셀 연동이 아직 완료되지 않았습니다.' },
                { status: 501 }
            );
        }
        // ─────────────────────────────────────────────────────────────

        // ── 아래는 NICE 연동 완료 후 실제로 사용할 로직 (골격 유지) ──
        const birthDateStr = ''; // TODO: niceData.dataBody.birthdate 로 교체
        const fullName = '';     // TODO: niceData.dataBody.utf8_name 로 교체

        // 만 19세 정확 검증 (생일 월/일까지 반영)
        const age = calcAge(birthDateStr);
        if (age < 19) {
            return NextResponse.json({ success: false, message: '만 19세 미만 청소년은 이용할 수 없습니다.' });
        }

        // Supabase 업데이트
        if (userId && !userId.startsWith('mock_')) {
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    is_adult_verified: true,
                    birth_date: birthDateStr,
                    full_name: fullName,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (updateError) {
                console.error('DB Update Error:', updateError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server Verification Error:', error);
        return NextResponse.json({ success: false, message: '서버 오류 발생' }, { status: 500 });
    }
}
