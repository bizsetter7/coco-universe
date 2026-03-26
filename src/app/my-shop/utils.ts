
import { ICONS } from '@/constants/job-options';

// --- Helper Functions ---

export const normalizeAd = (ad: any) => {
    // Basic fields
    const safeAd = { ...ad };

    // 1. Price Normalization (Prioritize options.ad_price > ad_price > price)
    let adPrice = 0;
    if (ad.options?.ad_price !== undefined) adPrice = Number(ad.options.ad_price);
    else if (ad.ad_price !== undefined) adPrice = Number(ad.ad_price);
    else if (ad.price !== undefined) adPrice = Number(ad.price);

    safeAd.ad_price = adPrice;
    safeAd.price = adPrice; // Legacy compat

    // 3. Region & Industry Mapping (DB -> UI)
    // [CRITICAL SAFEGUARD] Never remove or break these mappings.
    // Dashboard header address must remain "서울 강남구 테헤란로" in BusinessDashboard.tsx.
    safeAd.regionCity = ad.regionCity || ad.region || '';
    safeAd.regionGu = ad.regionGu || ad.work_region_sub || '';
    safeAd.category = ad.category || ad.industryMain || '';
    safeAd.categorySub = ad.categorySub || ad.category_sub || ad.industrySub || '';
    safeAd.nickname = ad.nickname || ad.options?.nickname || '';

    // 4. Tier Normalization for T1-T7 Standard
    const rawTier = (ad.tier || ad.productType || ad.ad_type || ad.options?.product_type || 'p7').toLowerCase();
    if (rawTier.includes('grand') || rawTier === 'p1' || rawTier.includes('그랜드')) safeAd.productType = 'p1';
    else if (rawTier.includes('premium') || rawTier === 'p2' || rawTier.includes('프리미엄')) safeAd.productType = 'p2';
    else if (rawTier.includes('deluxe') || rawTier === 'p3' || rawTier.includes('디럭스')) safeAd.productType = 'p3';
    else if (rawTier.includes('special') || rawTier === 'p4' || rawTier.includes('스페셜')) safeAd.productType = 'p4';
    else if (rawTier.includes('recommended') || rawTier === 'p5' || rawTier.includes('급구')) safeAd.productType = 'p5';
    else if (rawTier.includes('native') || rawTier === 'p6' || rawTier.includes('네이티브')) safeAd.productType = 'p6';
    else safeAd.productType = 'p7';

    // 5. [Fix] Icon Normalization — emoji string → numeric ID (레거시 호환 + 최상위 필드 추가)
    // DB에 options.icon = "🔥" (emoji) 또는 options.icon = 2 (ID) 모두 처리
    const rawIcon = ad.options?.icon ?? ad.selectedIcon ?? null;
    if (rawIcon !== null && rawIcon !== undefined && rawIcon !== 0 && rawIcon !== '') {
        const iconObj = ICONS.find(i => String(i.id) === String(rawIcon) || i.icon === String(rawIcon));
        if (iconObj) {
            safeAd.selectedIcon = iconObj.id; // 최상위 필드 (항상 숫자 ID)
            safeAd.options = { ...(ad.options || {}), icon: iconObj.id }; // options.icon도 숫자 ID로 표준화
        }
    }

    return safeAd;
};

export const normalizePayment = (payment: any, shopName?: string) => {
    const amount = Number(payment.amount || payment.price || payment.total_amount || 0);
    return {
        ...payment,
        amount: amount,
        price: amount, // [Fix] Compatibility for PaymentsView which uses .price
        pay_type: payment.pay_type || payment.payType || payment.metadata?.product_type || '', // [Fix] Badge Sync
        shopName: payment.metadata?.shopName || shopName || '알 수 없음',
        adTitle: payment.metadata?.adTitle || '광고 결제',
        status: payment.status || 'completed',
        date: payment.created_at || new Date().toISOString()
    };
};
