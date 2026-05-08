// Sentry 초기화 — Next.js 15 App Router instrumentation hook
// Node.js 런타임: API Routes + Server Components
// Edge 런타임: middleware

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('../sentry.server.config');
    }
    if (process.env.NEXT_RUNTIME === 'edge') {
        await import('../sentry.edge.config');
    }
}
