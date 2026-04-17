/**
 * 구글 이미지 SEO 유틸리티
 *
 * - generateShopImageAlt()     광고 이미지 alt 텍스트 자동 생성
 * - generateShopImageFilename() SEO 최적화 파일명 생성
 * - buildImageSitemapEntry()   이미지 사이트맵 항목 생성
 *
 * 전략 근거:
 *   경쟁사 전부 alt="" 또는 업체명만 → 파일명 UUID → SEO 0점
 *   코코알바 자동생성: "강남 룸알바 월급 350만원 이상 초보환영 채용공고 - 코코알바"
 */

const BASE_URL = 'https://www.cocoalba.kr';

/** 급여 방식 한글 표시 */
const PAY_TYPE_LABEL: Record<string, string> = {
    TC:       '일당',
    시급:     '시급',
    일급:     '일당',
    일당:     '일당',
    월급:     '월급',
    주급:     '주급',
    연봉:     '연봉',
    협의:     '급여협의',
};

/** 업종 슬러그 → 한글 */
const WORK_TYPE_LABEL: Record<string, string> = {
    '룸알바':     '룸알바',
    '룸살롱':     '룸살롱',
    '단란주점':   '단란주점',
    '바텐더':     '바텐더',
    '노래방':     '노래방',
    '클럽':       '클럽',
    '유흥알바':   '유흥알바',
    '젬오알바':   '젬오알바',
    '노래빠':     '노래빠',
};

interface ShopLike {
    id?: string | number;
    name?: string;
    title?: string;
    region?: string;
    category?: string;
    work_type?: string;
    pay?: string;
    pay_type?: string;
    pay_amount?: number;
    media_url?: string;
    banner_image_url?: string;
}

/**
 * 광고 이미지 alt 텍스트 자동 생성
 *
 * 패턴: "{지역} {업종} {급여방식} {급여} 이상 초보환영 채용공고 - 코코알바"
 * 예시: "강남 룸알바 월급 350만원 이상 초보환영 채용공고 - 코코알바"
 */
export function generateShopImageAlt(shop: ShopLike): string {
    const region   = (shop.region || '').replace(/[\[\]]/g, '').trim();
    const workType = shop.work_type || shop.category || '';
    const payType  = PAY_TYPE_LABEL[shop.pay_type || ''] || '';
    const pay      = shop.pay || (shop.pay_amount ? `${shop.pay_amount.toLocaleString()}원` : '');

    const parts: string[] = [];
    if (region)   parts.push(region);
    if (workType) parts.push(WORK_TYPE_LABEL[workType] || workType);
    if (payType)  parts.push(payType);
    if (pay)      parts.push(`${pay} 이상`);
    parts.push('초보환영 채용공고');

    return `${parts.join(' ')} - 코코알바`;
}

/**
 * SEO 최적화 이미지 파일명 생성 (업로드 시 사용)
 *
 * 패턴: "{지역}-{업종}-{급여}-코코알바.webp"
 * 예시: "강남-룸알바-월급350만원-코코알바.webp"
 */
export function generateShopImageFilename(shop: ShopLike): string {
    const region   = (shop.region || '').replace(/[\[\]\s]/g, '').trim();
    const workType = (shop.work_type || shop.category || '').trim();
    const payType  = PAY_TYPE_LABEL[shop.pay_type || ''] || '';
    const pay      = (shop.pay || '').replace(/\s+/g, '').replace(/,/g, '');

    const parts: string[] = [];
    if (region)             parts.push(region);
    if (workType)           parts.push(workType);
    if (payType && pay)     parts.push(`${payType}${pay}`);
    parts.push('코코알바');

    return `${parts.join('-')}.webp`;
}

/**
 * 이미지 사이트맵용 항목 생성
 * sitemap.xml에 <image:image> 태그로 삽입
 */
export interface ImageSitemapEntry {
    loc:     string; // 이미지 URL
    title:   string;
    caption: string;
}

export function buildShopImageSitemapEntry(shop: ShopLike): ImageSitemapEntry | null {
    const imageUrl = shop.banner_image_url || shop.media_url;
    if (!imageUrl) return null;

    const region   = (shop.region || '').replace(/[\[\]]/g, '').trim();
    const workType = shop.work_type || shop.category || '';
    const pay      = shop.pay || '';

    return {
        loc:     imageUrl,
        title:   `${region} ${workType} ${pay} - 코코알바 채용공고`,
        caption: generateShopImageAlt(shop),
    };
}

/**
 * 광고 상세 페이지 URL 생성
 */
export function buildShopPageUrl(shop: ShopLike, regionSlug: string): string {
    return `${BASE_URL}/coco/${regionSlug}/${shop.id}`;
}
