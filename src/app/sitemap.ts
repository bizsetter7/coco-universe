import { MetadataRoute } from 'next';
import shopsData from '@/lib/data/shops.json';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';
import { MOCK_POSTS } from '@/constants/community';
import { supabase } from '@/lib/supabase';

// Dynamic so sitemap includes latest DB posts
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Re-generate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://cocoalba.kr';

    // 1. Static Routes
    const routes = [
        '',
        '/jobs',
        '/region',
        '/community',
        '/talent',
        '/guide',
        '/customer-center',
        '/favorites',
        '/notice/card-payment-termination',
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
        url: `${baseUrl}/coco/${shop.region}/${shop.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 4. [SAFE] Mock Community Posts - 항상 포함되는 안전장치
    const mockPostRoutes = MOCK_POSTS.map((post) => ({
        url: `${baseUrl}/community/${post.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    // 5. [NEW] Real DB Community Posts - 실제 유저 글도 자동 포함
    let dbPostRoutes: MetadataRoute.Sitemap = [];
    try {
        const { data: dbPosts } = await supabase
            .from('community_posts')
            .select('id, created_at')
            .eq('is_secret', false)
            .order('created_at', { ascending: false })
            .limit(500); // 최대 500개

        if (dbPosts && dbPosts.length > 0) {
            // Mock IDs 제외 (중복 방지)
            const mockIds = new Set(MOCK_POSTS.map(p => p.id));
            dbPostRoutes = dbPosts
                .filter(p => !mockIds.has(p.id))
                .map((post) => ({
                    url: `${baseUrl}/community/${post.id}`,
                    lastModified: new Date(post.created_at),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                }));
        }
    } catch (e) {
        // DB 오류 시 Mock만 사용 (안전장치)
        console.warn('Sitemap: DB fetch failed, using mock only.');
    }

    return [...routes, ...regionRoutes, ...shopRoutes, ...mockPostRoutes, ...dbPostRoutes];
}
