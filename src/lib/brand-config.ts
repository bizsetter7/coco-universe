/**
 * PG 심사 대응용 독립 랜딩 모드 플래그
 * true 설정 시: 루트 경로에서 AuditLanding 컴포넌트만 노출
 */
export const AUDIT_MODE = true;

/**
 * 하위 호환성을 위해 유지 (곧 제거 예정)
 */
export const IS_SAFE_MODE = false;

export type BrandConfig = {
    id: string;
    name: string;
    domain: string;
    primaryColor: string;
    logoText: string;
    displayName: string;
    tagline: string;
    theme: 'dark' | 'light';
};

export const BRANDS: Record<string, BrandConfig> = {
    coco: {
        id: 'coco',
        name: '코코알바',
        domain: 'cocoalba.kr',
        primaryColor: '#D4AF37',
        logoText: 'COCO',
        displayName: 'COCO 코코알바',
        tagline: '대한민국 1등 여성 고소득 알바 플랫폼',
        theme: 'light',
    },
    bibi: {
        id: 'bibi',
        name: '비비알바',
        domain: 'bibialba.com',
        primaryColor: '#FF1493',
        logoText: 'BIBI',
        displayName: 'BIBI 비비알바',
        tagline: '센스있는 언니들의 선택, 비비알바',
        theme: 'dark',
    },
    lulu: {
        id: 'lulu',
        name: '루루알바',
        domain: 'lulualba.com',
        primaryColor: '#8A2BE2',
        logoText: 'LULU',
        displayName: 'LULU 루루알바',
        tagline: '일상이 화보가 되는 곳, 루루알바',
        theme: 'light',
    },
    luna: {
        id: 'luna',
        name: '루나알바',
        domain: 'lunaalba.com',
        primaryColor: '#C0C0C0',
        logoText: 'LUNA',
        displayName: 'LUNA 루나알바',
        tagline: '밤하늘의 달처럼 빛나는 당신, 루나알바',
        theme: 'dark',
    },
};

export const DEFAULT_BRAND = BRANDS.coco;
