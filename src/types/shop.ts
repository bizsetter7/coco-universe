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
}
