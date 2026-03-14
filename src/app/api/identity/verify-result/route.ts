import { NextRequest, NextResponse } from 'next/server';
import {
    verifyHmac,
    markTokenUsed,
    verifyTokenSession,
} from '../token/route';

/**
 * 본인인증 콜백 검증 API
 * POST /api/identity/verify-result
 *
 * ── 보안 규격 (심사 대응) ──────────────────────────────────────────────────────
 * [항목 2/8] 파라미터 변조 방지: 수신된 token + signature를 HMAC-SHA256으로 재검증
 * [항목 3/4] 동일인 검증: 세션 ID 교차 확인 (발급 시 바인딩된 세션과 일치해야 통과)
 * [항목 6]   토큰 재사용 방지: 이미 사용된 토큰이면 즉시 에러 반환
 */

export async function POST(req: NextRequest) {
    try {
        const {
            token,         // 인증 기관으로부터 받은 토큰
            signature,     // 발급 시 서버가 생성한 HMAC 서명
            sigPayload,    // 서명 대상 payload (발급 시 전달)
            sessionId,     // 요청자의 세션 ID (동일인 검증용)
            // 실제 NICE/다날 연동 시 아래 필드 추가
            // enc_data, integrity_value, token_version_id
        } = await req.json();

        if (!token || !signature || !sigPayload) {
            return NextResponse.json(
                { success: false, code: 'MISSING_PARAMS', message: '필수 파라미터가 누락되었습니다.' },
                { status: 400 }
            );
        }

        // ── [항목 2/8] 파라미터 변조 검증 ──────────────────────────────
        const isIntact = verifyHmac(sigPayload, signature);
        if (!isIntact) {
            console.error('[Identity/verify-result] 무결성 검증 실패 — 파라미터 변조 감지', { token });
            return NextResponse.json(
                { success: false, code: 'TAMPERED', message: '인증 결과값이 변조되었습니다. 처음부터 다시 시도하세요.' },
                { status: 403 }
            );
        }

        // ── [항목 6] 토큰 재사용 방지 ──────────────────────────────────
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
        const canUse = markTokenUsed(token, ip);
        if (!canUse) {
            console.error('[Identity/verify-result] 토큰 재사용 시도 감지', { token, ip });
            return NextResponse.json(
                { success: false, code: 'TOKEN_REUSED', message: '이미 사용된 인증 토큰입니다. 처음부터 다시 인증하세요.' },
                { status: 409 }
            );
        }

        // ── [항목 3/4] 동일인·교차 검증 ────────────────────────────────
        if (sessionId) {
            const isSessionMatch = verifyTokenSession(token, sessionId);
            if (!isSessionMatch) {
                console.error('[Identity/verify-result] 세션 불일치 — 동일인 검증 실패', { token, sessionId });
                return NextResponse.json(
                    { success: false, code: 'SESSION_MISMATCH', message: '인증 세션이 일치하지 않습니다. 다른 브라우저 또는 탭에서의 요청은 허용되지 않습니다.' },
                    { status: 403 }
                );
            }
        }

        // ── 실제 NICE/다날 연동 시 아래 블록 추가 ──────────────────────
        // const decryptedData = await decryptNiceResult(enc_data, integrity_value, token_version_id);
        // const { birthdate, utf8_name, mobileco } = decryptedData.dataBody;
        // const age = calcAge(birthdate);
        // if (age < 19) return 403
        // await updateProfileVerified(userId, birthdate, utf8_name);
        // ───────────────────────────────────────────────────────────────

        return NextResponse.json({
            success: true,
            code: 'VERIFIED',
            message: '본인인증이 정상적으로 완료되었습니다.',
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('[Identity/verify-result] error:', message);
        return NextResponse.json(
            { success: false, code: 'SERVER_ERROR', message: '검증 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
