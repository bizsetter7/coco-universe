import { MetadataRoute } from 'next';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://coco-universe-d386.vercel.app';

    // 1. Static Pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/lounge`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
    ];

    // 2. Dynamic Region Pages (17,000+)
    // We map from our master data to sitemap entries
    const regionPages = seoRegionsMaster.map((region) => ({
        url: `${baseUrl}/coco/${region.id}`, // region.id is already URL-safe (e.g., 서울-송파구-잠실동)
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9, // High priority for landing pages
    }));

    return [...staticPages, ...regionPages];
}
