/**
 * /image-sitemap.xml — 이미지 전용 사이트맵
 *
 * 구글 이미지 검색 상위노출 핵심 파일.
 * 광고 이미지(media_url, banner_image_url)를 구글에 명시적으로 전달.
 *
 * GSC에 이미지 사이트맵 등록 방법:
 *   구글 서치 콘솔 → Sitemaps → https://www.cocoalba.kr/image-sitemap.xml 입력
 *
 * 참고: https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { slugify } from '@/utils/shopUtils';
import { generateShopImageAlt } from '@/lib/imageUtils';

export const dynamic = 'force-dynamic'; // 매 요청마다 새로 생성 (캐시 없음)

const BASE_URL = 'https://www.cocoalba.kr';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    try {
        // 이미지가 있는 active 광고만 조회
        const { data: shops } = await supabase
            .from('shops')
            .select('id, region, category, work_type, pay, pay_type, pay_amount, media_url, banner_image_url, title, updated_at')
            .eq('status', 'active')
            .or('media_url.not.is.null,banner_image_url.not.is.null')
            .order('updated_at', { ascending: false })
            .limit(500);

        const urlEntries: string[] = [];

        for (const shop of shops ?? []) {
            const regionRaw = (shop.region || '').replace(/[\[\]]/g, '').trim();
            const regionSlug = slugify(regionRaw);
            if (!regionSlug) continue;

            const pageUrl   = `${BASE_URL}/coco/${regionSlug}/${shop.id}`;
            const imageUrl  = shop.banner_image_url || shop.media_url;
            if (!imageUrl) continue;

            const alt = generateShopImageAlt({
                region:     shop.region,
                work_type:  shop.work_type || shop.category,
                pay:        shop.pay,
                pay_type:   shop.pay_type,
                pay_amount: shop.pay_amount,
            });

            const title = escapeXml(
                shop.title
                    ? `${regionRaw} ${shop.work_type || shop.category || ''} - ${shop.title} | 코코알바`
                    : alt
            );

            urlEntries.push(`
  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${escapeXml(alt)}</image:caption>
    </image:image>
  </url>`);
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries.join('')}
</urlset>`;

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('[image-sitemap]', error);
        return new NextResponse('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>', {
            status: 200,
            headers: { 'Content-Type': 'application/xml' },
        });
    }
}
