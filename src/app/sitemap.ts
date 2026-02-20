import { MetadataRoute } from 'next';
import shopsData from '@/lib/data/shops.json';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';
import { MOCK_POSTS } from '@/constants/community';

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
    const regionRoutes = seoRegionsMaster.map((region) => ({
        url: `${baseUrl}/coco/${region.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // 3. Shop Detail Pages
    const shopRoutes = shopsData.map((shop) => ({
        url: `${baseUrl}/coco/${shop.region}/${shop.id}`, // Access via region
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 4. Community Posts (Dynamic)
    const communityRoutes = MOCK_POSTS.map((post) => ({
        url: `${baseUrl}/community/${post.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...regionRoutes, ...shopRoutes, ...communityRoutes];
}
