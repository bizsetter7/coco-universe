export interface Shop {
    name: string;
    nickname?: string;
    realName?: string;
    title?: string;
    region: string;
    phone: string;
    kakao: string;
    telegram: string;
    pay: string;
    payType?: string;
    workType: string;
    url: string;
    site: string;
    id: string;
    is_placeholder: boolean;
    is_premium?: boolean;
    is_verified?: boolean;
    recommended?: boolean;
    tier?: 'grand' | 'premium' | 'deluxe' | 'special' | 'urgent' | 'recommended' | 'native' | 'common' | 'basic';
    updatedAt?: string;
    options?: {
        blink?: boolean;
        bold?: boolean;
        color?: string;
        icons?: string[];
        mediaUrl?: string;
        paySuffixes?: string[];
        border?: 'none' | 'color' | 'glow';
        effect?: 'neon' | 'none' | 'rainbow' | 'bounce' | 'disco' | 'flash';
    }
}
