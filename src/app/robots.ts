import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cocoalba.kr';
    const isCloneSite = siteUrl.includes('d386') || siteUrl.includes('vercel.app');

    // d386 복제사이트: 구글 색인 완전 차단 (SEO 중복 페이지 방지)
    if (isCloneSite) {
        return {
            rules: {
                userAgent: '*',
                disallow: '/', // 전체 크롤링 차단
            },
        };
    }

    // 본 사이트(www.cocoalba.kr): 정상 색인 허용
    // ⚠️ 참고: public/robots.txt가 이 파일보다 우선 적용됨 (Next.js static 파일 우선)
    // public/robots.txt를 단독 진실 원천으로 유지 — 이 파일은 복제사이트 차단용으로만 유효
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/my-shop/dashboard/',
                '/static/media/',
                // ⛔ /_next/static/ 차단 금지 — Googlebot이 JS 번들을 못 로드하면 페이지 색인 거부됨
                '/fonts/',
                '/shop/',          // 레거시 URL 크롤링 중복 방지 (리다이렉트 처리됨)
            ],
        },
        sitemap: [
            `${siteUrl}/sitemap.xml`,
            `${siteUrl}/image-sitemap.xml`,
        ],
    };
}
