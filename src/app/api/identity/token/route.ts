import { NextRequest, NextResponse } from 'next/server';
import type {
    IdentityVerifyTokenRequest,
    IdentityVerifyTokenResponse,
} from '@/types/identity-verify';

/**
 * 본인인증 토큰 발급 API
 * POST /api/identity/token
 *
 * ── Danal (다날) ─────────────────────────────────────────────────────────────
 * 필요 환경변수:
 *   DANAL_CPR_NUM      - 다날 가맹점 CPR 번호
 *   DANAL_SERVICE_ID   - 다날 서비스 ID
 *   DANAL_CP_ID        - CP 식별자 (다날 발급)
 *
 * ── NICE평가정보 ──────────────────────────────────────────────────────────────
 * 필요 환경변수:
 *   NICE_SITE_CODE     - 나이스 사이트 코드
 *   NICE_SITE_PASSWORD - 나이스 사이트 비밀번호
 *   NICE_CLIENT_ID     - 나이스 클라이언트 ID
 *   NICE_CLIENT_SECRET - 나이스 클라이언트 시크릿
 *
 * ── 공통 ──────────────────────────────────────────────────────────────────────
 * 위 환경변수가 없으면 Mock 토큰 반환 (개발 환경)
 */

function isDanalConfigured(): boolean {
    return !!(
        process.env.DANAL_CPR_NUM &&
        process.env.DANAL_SERVICE_ID &&
        process.env.DANAL_CP_ID
    );
}

function isNiceConfigured(): boolean {
    return !!(
        process.env.NICE_SITE_CODE &&
        process.env.NICE_SITE_PASSWORD &&
        process.env.NICE_CLIENT_ID &&
        process.env.NICE_CLIENT_SECRET
    );
}

async function generateDanalToken(returnUrl: string, errorUrl: string): Promise<IdentityVerifyTokenResponse> {
    // TODO: 다날 SDK 연동 시 아래 주석 해제
    // const Danal = require('@danal/identity'); // 다날 공식 SDK (npm i @danal/identity)
    // const token = await Danal.createToken({
    //     cprNum: process.env.DANAL_CPR_NUM,
    //     serviceId: process.env.DANAL_SERVICE_ID,
    //     cpId: process.env.DANAL_CP_ID,
    //     returnUrl,
    //     errorUrl,
    // });
    // return { encryptedToken: token.encData, authUrl: 'https://cert.teledit.com/TASS/PASS/popup', expiresIn: 300 };

    // [Placeholder] 실제 다날 API 키 설정 전 개발용 Mock
    console.warn('[Identity/Danal] 환경변수 미설정 — Mock 모드');
    return {
        encryptedToken: 'DANAL_MOCK_TOKEN',
        authUrl: '#',
        expiresIn: 300,
    };
}

async function generateNiceToken(returnUrl: string, errorUrl: string): Promise<IdentityVerifyTokenResponse> {
    // TODO: NICE CheckPlus SDK 연동 시 아래 주석 해제
    // const { encryptData } = require('checkplus_nice'); // NICE 제공 모듈
    // const encData = encryptData({
    //     siteCode: process.env.NICE_SITE_CODE,
    //     sitePassword: process.env.NICE_SITE_PASSWORD,
    //     returnUrl,
    //     errorUrl,
    // });
    // return { encryptedToken: encData, authUrl: 'https://nice.checkplus.co.kr/CheckPlusSafeModel/checkplus.cb', expiresIn: 300 };

    // [Placeholder] 실제 NICE API 키 설정 전 개발용 Mock
    console.warn('[Identity/NICE] 환경변수 미설정 — Mock 모드');
    return {
        encryptedToken: 'NICE_MOCK_TOKEN',
        authUrl: '#',
        expiresIn: 300,
    };
}

export async function POST(req: NextRequest) {
    try {
        const body: IdentityVerifyTokenRequest = await req.json();
        const { provider, returnUrl, errorUrl } = body;

        if (!provider || !returnUrl || !errorUrl) {
            return NextResponse.json(
                { error: 'provider, returnUrl, errorUrl 필드가 필요합니다.' },
                { status: 400 }
            );
        }

        if (provider !== 'danal' && provider !== 'nice') {
            return NextResponse.json(
                { error: '지원하지 않는 제공업체입니다. danal 또는 nice를 선택하세요.' },
                { status: 400 }
            );
        }

        let result: IdentityVerifyTokenResponse;
        if (provider === 'danal') {
            if (!isDanalConfigured()) {
                console.warn('[Identity] Danal 환경변수 미설정 — Mock');
            }
            result = await generateDanalToken(returnUrl, errorUrl);
        } else {
            if (!isNiceConfigured()) {
                console.warn('[Identity] NICE 환경변수 미설정 — Mock');
            }
            result = await generateNiceToken(returnUrl, errorUrl);
        }

        return NextResponse.json(result);

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('[Identity/token] error:', message);
        return NextResponse.json(
            { error: '인증 토큰 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
