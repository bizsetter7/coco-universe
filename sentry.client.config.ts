import * as Sentry from '@sentry/nextjs';

// 클라이언트 사이드 Sentry 초기화 (브라우저 JS 에러 추적)
// DSN: Vercel 환경변수 NEXT_PUBLIC_SENTRY_DSN 설정 필요
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'production',

    // 성능 트레이싱 — 10% 샘플링 (프로덕션 부하 최소화)
    tracesSampleRate: 0.1,

    // 오류 재현용 세션 리플레이 — 오류 발생 시 100%, 일반 세션 5%
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.05,

    // 프로덕션 환경에서만 활성화 (로컬 개발 노이즈 방지)
    enabled: process.env.NODE_ENV === 'production',

    debug: false,
});
