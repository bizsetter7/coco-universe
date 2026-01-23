export type BrandConfig = {
    id: string;
    name: string;
    domain: string;
    primaryColor: string;
    logoText: string;
    tagline: string;
    theme: 'dark' | 'light';
};

export const BRANDS: Record<string, BrandConfig> = {
    coco: {
        id: 'coco',
        name: '코코알바',
        domain: 'cocoalba.com',
        primaryColor: '#D4AF37', // Gold
        logoText: 'COCO',
        tagline: '대한민국 1등 여성 고소득 알바 플랫폼',
        theme: 'light',
    },
    bibi: {
        id: 'bibi',
        name: '비비알바',
        domain: 'bibialba.com',
        primaryColor: '#FF1493', // Deep Pink
        logoText: 'BIBI',
        tagline: '센스있는 언니들의 선택, 비비알바',
        theme: 'dark',
    },
    lulu: {
        id: 'lulu',
        name: '루루알바',
        domain: 'lulualba.com',
        primaryColor: '#8A2BE2', // Blue Violet
        logoText: 'LULU',
        tagline: '일상이 화보가 되는 곳, 루루알바',
        theme: 'light',
    },
    luna: {
        id: 'luna',
        name: '루나알바',
        domain: 'lunaalba.com',
        primaryColor: '#C0C0C0', // Silver/Sky
        logoText: 'LUNA',
        tagline: '밤하늘의 달처럼 빛나는 당신, 루나알바',
        theme: 'dark',
    },
};

export const DEFAULT_BRAND = BRANDS.coco;
