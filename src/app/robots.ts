import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://cocoalba.kr';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/my-shop/dashboard/'], // Protect internal/private routes
        },
        sitemap: `${baseUrl}/sitemap.xml`, // Next.js automatically maps sitemap.ts to sitemap.xml
    };
}
