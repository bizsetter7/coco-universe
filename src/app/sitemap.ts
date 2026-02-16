import { MetadataRoute } from 'next';
import shopsData from '@/lib/data/shops.json';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';

export const dynamic = 'force-static'; // Cache for performance, revalidate if needed

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cocoalba.kr';

    // 1. Static Routes
    const routes = [
        '',
        '/about',
        '/login',
        '/signup',
        '/community',
        '/talent',
        '/my-shop',
        '/favorites',
        '/notice/card-payment-termination', // Important notice
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }));

    // 2. Region Pages (SEO Landing Pages) - High Priority
    // Carpet Bombing Strategy: 17,000+ regions might be too big for a single sitemap in some cases,
    // but Next.js splits them automatically or we can handle it.
    // For now, let's prioritize the main SEO regions from master data.
    const regionRoutes = seoRegionsMaster.map((region) => ({
        url: `${baseUrl}/coco/${region.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // 3. Shop Detail Pages
    // Dynamic generation based on active shops
    const shopRoutes = shopsData.map((shop) => ({
        url: `${baseUrl}/coco/${shop.region}/${shop.id}`, // Access via region
        lastModified: new Date(), // In real app, use shop.updated_at
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 4. Community Posts (Example if dynamic)
    // const communityRoutes = ...

    return [...routes, ...regionRoutes, ...shopRoutes];
}
