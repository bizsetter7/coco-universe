export interface Shop {
    name: string;
    nickname?: string;
    realName?: string;
    managerName?: string; // Business Owner Name
    title?: string;
    region: string;
    phone: string;
    kakao: string;
    telegram: string;
    pay: string;
    payType?: string;
    workType: string;
    // [Added] Missing properties for UI
    businessAddress?: string; // Business Registration Address
    workTime?: string;
    gender?: string;
    age?: string;
    keywords?: string[];
    url: string;
    site: string;
    id: string;
    adNo?: number; // Unique Ad Number for easy identification
    is_placeholder: boolean;
    is_premium?: boolean;
    is_verified?: boolean;
    recommended?: boolean;
    tier?: 'grand' | 'premium' | 'deluxe' | 'special' | 'urgent' | 'recommended' | 'native' | 'common' | 'basic';
    color?: string;
    updatedAt?: string;
    date?: string;
    description?: string;
    options?: {
        blink?: boolean;
        bold?: boolean;
        color?: string;
        icons?: string[];
        mediaUrl?: string;
        paySuffixes?: string[];
        icon?: number | string;
        highlighter?: number | string;
        keywords?: string[];
        border?: 'none' | 'color' | 'glow';
        effect?: 'neon' | 'none' | 'rainbow' | 'bounce' | 'disco' | 'flash';
        product_type?: string;
    };
    // [Added] Admin/Ad Management
    status?: 'pending' | 'approved' | 'rejected' | 'active' | 'expired';
    category?: string;
    shopName?: string;
    ownerId?: string;
    edits?: number;
    adStartDate?: string;
    adEndDate?: string;
    adDuration?: 30 | 60 | 90;
    adPrice?: number;
    price?: number; // Legacy/Fallback
    lat?: number;
    lng?: number;
    // [Added] External Scraping Source Info
    sourceUrl?: string;
    sourceSite?: string;
    // [Added] Detailed Ad Info
    user_id?: string;
    regionCity?: string;
    regionGu?: string;
    productType?: string;
    ad_type?: string;
    selectedIcon?: string | number;
    selectedHighlighter?: string | number;
    paySuffixes?: string[];
    payStatus?: string;
    rejection_history?: { reason: string; date: string; rejectedBy?: string }[];
    edit_count?: number;
    approved_at?: string;
    created_at?: string;
    deadline?: string;
    pay_amount?: number;
    work_region_sub?: string;
    category_sub?: string;
    ad_price?: number;
}
