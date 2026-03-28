'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// ── 에러 전송 헬퍼 ─────────────────────────────────────────────────────────────
async function sendError(payload: {
    tier: string;
    error_type: string;
    severity?: string;
    path?: string;
    message: string;
    stack?: string;
    meta?: Record<string, any>;
    user_id?: string;
}) {
    try {
        await fetch('/api/monitor/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true, // 페이지 이탈 시에도 전송
        });
    } catch { /* 모니터링 전송 실패는 무시 */ }
}

// ── 성능 지표 전송 헬퍼 ────────────────────────────────────────────────────────
async function sendVitals(payload: {
    path: string;
    user_id?: string;
    lcp?: number; fid?: number; cls?: number; fcp?: number; ttfb?: number;
    device?: string;
}) {
    try {
        await fetch('/api/monitor/vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
        });
    } catch { /* 무시 */ }
}

// ── Dead Click 감지 ────────────────────────────────────────────────────────────
function getElementLabel(el: Element | null): string {
    if (!el) return 'unknown';
    const btn = el.closest('button, a, [role="button"]');
    if (!btn) return el.tagName.toLowerCase();
    return (
        (btn as HTMLElement).innerText?.slice(0, 40).trim() ||
        btn.getAttribute('aria-label') ||
        btn.getAttribute('title') ||
        btn.tagName.toLowerCase()
    );
}

// ── 메인 훅 ───────────────────────────────────────────────────────────────────
export function useMonitor(userId?: string) {
    const pathname = usePathname();
    const vitalsRef = useRef<Record<string, number>>({});
    const hasReportedVitals = useRef(false);

    // ── 1. 글로벌 JS 에러 감지 ─────────────────────────────────────────────
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            sendError({
                tier: 'browser',
                error_type: 'js_error',
                severity: 'error',
                path: pathname || window.location.pathname,
                message: event.message || 'Unknown JS error',
                stack: event.error?.stack?.slice(0, 500),
                meta: { filename: event.filename, lineno: event.lineno, colno: event.colno },
                user_id: userId,
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const msg = event.reason?.message || String(event.reason) || 'Unhandled Promise Rejection';
            sendError({
                tier: 'browser',
                error_type: 'unhandled_rejection',
                severity: 'error',
                path: pathname || window.location.pathname,
                message: msg.slice(0, 300),
                stack: event.reason?.stack?.slice(0, 500),
                user_id: userId,
            });
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [pathname, userId]);

    // ── 2. Dead Click 감지 (클릭 → 300ms 내 반응 없으면 기록) ─────────────
    useEffect(() => {
        let clickTimer: ReturnType<typeof setTimeout> | null = null;
        let pendingElement: string | null = null;
        let pendingPath: string | null = null;

        const handleMouseDown = (e: MouseEvent) => {
            pendingElement = getElementLabel(e.target as Element);
            pendingPath = window.location.pathname;
            clickTimer = setTimeout(() => {
                // 300ms 내 반응(rerender/navigate)이 없으면 dead click
                if (pendingElement && pendingElement !== 'unknown') {
                    sendError({
                        tier: 'browser',
                        error_type: 'dead_click',
                        severity: 'warning',
                        path: pendingPath || '/',
                        message: `응답 없는 클릭: "${pendingElement}"`,
                        meta: { element: pendingElement },
                        user_id: userId,
                    });
                }
                clickTimer = null;
            }, 600); // 600ms로 여유 있게 설정 (느린 기기 고려)
        };

        const cancelDeadClick = () => {
            if (clickTimer) { clearTimeout(clickTimer); clickTimer = null; }
        };

        // 클릭 후 DOM 변경이나 네비게이션이 일어나면 dead click 아님
        const observer = new MutationObserver(cancelDeadClick);
        observer.observe(document.body, { childList: true, subtree: true, attributes: false });

        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            if (clickTimer) clearTimeout(clickTimer);
            observer.disconnect();
        };
    }, [pathname, userId]);

    // ── 3. Web Vitals 수집 ─────────────────────────────────────────────────
    useEffect(() => {
        hasReportedVitals.current = false;
        vitalsRef.current = {};

        const device = window.innerWidth < 768 ? 'mobile' : 'desktop';

        // PerformanceObserver로 LCP, FID, CLS, FCP 수집
        const observers: PerformanceObserver[] = [];

        try {
            // LCP
            const lcpObs = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length > 0) {
                    vitalsRef.current.lcp = entries[entries.length - 1].startTime;
                }
            });
            lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
            observers.push(lcpObs);
        } catch { /* 브라우저 미지원 무시 */ }

        try {
            // FID (First Input Delay)
            const fidObs = new PerformanceObserver((list) => {
                const entry = list.getEntries()[0] as any;
                if (entry) vitalsRef.current.fid = entry.processingStart - entry.startTime;
            });
            fidObs.observe({ type: 'first-input', buffered: true });
            observers.push(fidObs);
        } catch { /* 무시 */ }

        try {
            // CLS (Cumulative Layout Shift)
            let clsTotal = 0;
            const clsObs = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry: any) => {
                    if (!entry.hadRecentInput) clsTotal += entry.value;
                });
                vitalsRef.current.cls = clsTotal;
            });
            clsObs.observe({ type: 'layout-shift', buffered: true });
            observers.push(clsObs);
        } catch { /* 무시 */ }

        // FCP & TTFB — navigation timing에서 추출
        try {
            const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
            if (navEntries.length > 0) {
                vitalsRef.current.ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
            }
            const paintEntries = performance.getEntriesByName('first-contentful-paint');
            if (paintEntries.length > 0) {
                vitalsRef.current.fcp = paintEntries[0].startTime;
            }
        } catch { /* 무시 */ }

        // 페이지 숨겨질 때 / 5초 후 최종 전송
        const reportVitals = () => {
            if (hasReportedVitals.current) return;
            hasReportedVitals.current = true;
            const v = vitalsRef.current;
            if (Object.keys(v).length === 0) return;
            sendVitals({ path: pathname || '/', user_id: userId, device, ...v });
        };

        const timer = setTimeout(reportVitals, 5000);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') reportVitals();
        }, { once: true });

        return () => {
            clearTimeout(timer);
            observers.forEach(obs => { try { obs.disconnect(); } catch { /* 무시 */ } });
        };
    }, [pathname, userId]);

    // ── 4. 렌더링 버벅임 (Long Task) 감지 ────────────────────────────────
    useEffect(() => {
        let obs: PerformanceObserver | null = null;
        try {
            obs = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 100) { // 100ms 이상 블로킹
                        sendError({
                            tier: 'browser',
                            error_type: 'long_task',
                            severity: entry.duration > 300 ? 'warning' : 'info',
                            path: pathname || '/',
                            message: `렌더링 버벅임: ${Math.round(entry.duration)}ms 블로킹`,
                            meta: { duration_ms: Math.round(entry.duration), start: Math.round(entry.startTime) },
                            user_id: userId,
                        });
                    }
                });
            });
            obs.observe({ type: 'longtask', buffered: false });
        } catch { /* longtask 미지원 브라우저 무시 */ }

        return () => { if (obs) try { obs.disconnect(); } catch { /* 무시 */ } };
    }, [pathname, userId]);
}
