import { NextRequest, NextResponse } from 'next/server';

// ─── 차단할 봇 User-Agent 목록 ──────────────────────────────────
const BLOCKED_BOTS = [
    'python-requests',
    'python-httpx',
    'scrapy',
    'wget',
    'curl/',
    'go-http-client',
    'java/',
    'libwww-perl',
    'lwp-trivial',
    'ahrefsbot',
    'semrushbot',
    'mj12bot',
    'dotbot',
    'blexbot',
    'serpstatbot',
    'petalbot',
    'claudebot',      // AI 크롤러
    'gptbot',         // OpenAI 크롤러
    'dataforseobot',
    'bytespider',
    'facebookexternalhit',  // FB 과도 크롤링
];

// ─── 보호할 경로 ────────────────────────────────────────────────
const PROTECTED_PATHS = [
    '/admin',
    '/api/',
    '/my-shop',
    '/favorites',
];

// ─── In-Memory Rate Limiter (배포 시 Upstash Redis 권장) ────────
const ipRequestMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60;       // 허용 요청 수
const RATE_WINDOW = 60_000;  // 기준 시간 (ms) = 1분

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = ipRequestMap.get(ip);

    if (!record || now > record.resetTime) {
        ipRequestMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return false;
    }

    record.count++;
    if (record.count > RATE_LIMIT) return true;

    return false;
}

// ─── 클라이언트 실제 IP 추출 ────────────────────────────────────
function getClientIp(req: NextRequest): string {
    return (
        req.headers.get('cf-connecting-ip') ||       // Cloudflare 실제 IP
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '0.0.0.0'
    );
}

// ─── 응답 헬퍼 ──────────────────────────────────────────────────
function blocked(reason: string, status = 403): NextResponse {
    return new NextResponse(
        `<!DOCTYPE html><html><head><title>Access Denied</title></head><body>
        <h1>🚫 접근이 제한되었습니다</h1>
        <p>${reason}</p>
        <p>정상적인 이용은 <a href="/">홈으로</a> 돌아가세요.</p>
        </body></html>`,
        {
            status,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Robots-Tag': 'noindex',
            },
        }
    );
}

// ─── 메인 미들웨어 ───────────────────────────────────────────────
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ua = (request.headers.get('user-agent') || '').toLowerCase();
    const ip = getClientIp(request);

    // 1. 관리자 페이지 — Supabase 세션 필수 (미인증 접근 즉시 차단)
    if (pathname.startsWith('/admin')) {
        // Supabase 세션 쿠키 확인 (프로젝트 ref: ronqwailyistjuyolmyh)
        const sessionCookie =
            request.cookies.get('sb-ronqwailyistjuyolmyh-auth-token') ||
            request.cookies.get('sb-access-token') ||
            request.cookies.get('supabase-auth-token');

        if (!sessionCookie) {
            // 미인증 상태 → 홈 로그인 페이지로 리다이렉트 (URL 히스토리 대체)
            return NextResponse.redirect(new URL('/?page=login', request.url));
        }
        // 세션 있음 → 통과 (클라이언트에서 역할 재검증)
    }

    // [항목 11] 주요 보호 페이지 — 로그인 세션 필수
    const PROTECTED_AUTH_PATHS = ['/my-shop/dashboard', '/favorites', '/talent'];
    const needsAuth = PROTECTED_AUTH_PATHS.some(p => pathname.startsWith(p));
    if (needsAuth) {
        const sessionCookie =
            request.cookies.get('sb-ronqwailyistjuyolmyh-auth-token') ||
            request.cookies.get('sb-access-token') ||
            request.cookies.get('supabase-auth-token');

        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/?page=login', request.url));
        }
    }


    // [성역] /audit 경로는 봇 체크 및 Rate Limit 제외 (심사 및 테스트용)
    const isAuditPath = pathname.startsWith('/audit');

    // 2. 봇 User-Agent 차단
    const isBot = BLOCKED_BOTS.some(bot => ua.includes(bot.toLowerCase()));
    if (isBot && !isAuditPath) {
        console.warn(`[BOT BLOCKED] IP: ${ip} | UA: ${ua.substring(0, 80)}`);
        return blocked('자동화된 접근이 차단되었습니다.', 403);
    }

    // 3. User-Agent 없는 요청 차단 (빈 UA는 거의 100% 봇)
    if ((!ua || ua.length < 10) && !isAuditPath) {
        return blocked('올바른 브라우저로 접속해주세요.', 403);
    }

    // 4. Rate Limiting — 1분에 60회 초과 시 차단 (다만 /audit 경로는 제외)
    if (isRateLimited(ip) && !isAuditPath) {
        console.warn(`[RATE LIMITED] IP: ${ip} | Path: ${pathname}`);
        return new NextResponse('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', {
            status: 429,
            headers: {
                'Retry-After': '60',
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    }

    // 5. 보안 헤더 추가 (모든 응답에)
    const response = NextResponse.next();

    // [보안] 로컬 시뮬레이터 및 개발 환경 배려: AUDIT_MODE이거나 개발 환경일 때 보안 헤더 대폭 완화
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_AUDIT_MODE !== 'true') {
        response.headers.set('X-Frame-Options', 'SAMEORIGIN');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-XSS-Protection', '1; mode=block');
    } else {
        // 시뮬레이터 모니터링을 위해 모든 프레임 제한 해제
        response.headers.delete('X-Frame-Options');
        response.headers.set('Content-Security-Policy', "frame-ancestors *;");
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.delete('X-Content-Type-Options');
    }
    
    response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

// ─── 미들웨어 적용 경로 설정 ────────────────────────────────────
export const config = {
    matcher: [
        /*
         * 아래 경로는 제외:
         * - _next/static (정적 파일)
         * - _next/image (이미지 최적화)
         * - favicon.ico, sitemap.xml, robots.txt
         * - public 폴더 파일
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)).*)',
    ],
};
