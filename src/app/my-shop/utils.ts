
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

    // 2. Options Normalization
    safeAd.options = safeAd.options || {};

    // Ensure critical display fields exist in options for badges
    if (!safeAd.options.ad_price) safeAd.options.ad_price = adPrice;

    return safeAd;
};

export const normalizePayment = (payment: any, shopName?: string) => {
    const amount = Number(payment.amount || payment.price || payment.total_amount || 0);
    return {
        ...payment,
        amount: amount,
        price: amount, // [Fix] Compatibility for PaymentsView which uses .price
        shopName: payment.metadata?.shopName || shopName || '알 수 없음',
        adTitle: payment.metadata?.adTitle || '광고 결제',
        status: payment.status || 'completed',
        date: payment.created_at || new Date().toISOString()
    };
};
