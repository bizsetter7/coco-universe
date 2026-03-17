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
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/my-shop/dashboard/'],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
