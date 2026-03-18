/**
 * B2B 랜딩 모드 플래그
 * 환경변수 NEXT_PUBLIC_AUDIT_MODE=true 일 때 AuditLanding 컴포넌트 노출
 * - P2 (코코알바) Vercel 프로젝트: 미설정(default false) → 실제 P2 사이트 렌더링
 * - P4 (초코파트너스) Vercel 프로젝트: NEXT_PUBLIC_AUDIT_MODE=true → AuditLanding 렌더링
 */
const rawAuditMode = String(process.env.NEXT_PUBLIC_AUDIT_MODE || '').trim().toLowerCase();
export const AUDIT_MODE = rawAuditMode === 'true';

/**
 * 기업전용인증 게이트 마스터 락 (Master Lock)
 *
 * ⚠️ 기본값 = true (비활성화) — 환경변수 미설정 시에도 게이트 차단
 *
 * 판정 규칙:
 *   NEXT_PUBLIC_ADULT_GATE_DISABLED 미설정 → undefined !== 'false' = TRUE  → 게이트 차단 ✅
 *   NEXT_PUBLIC_ADULT_GATE_DISABLED=true   → 'true'    !== 'false' = TRUE  → 게이트 차단 ✅
 *   NEXT_PUBLIC_ADULT_GATE_DISABLED=false  → 'false'   !== 'false' = FALSE → 게이트 활성 (런칭 후 사용)
 *
 * 런칭 시 단계:
 *   1) 본인인증 서비스 계약 완료
 *   2) Vercel 환경변수: NEXT_PUBLIC_ADULT_GATE_DISABLED=false 설정
 *   3) 재배포
 */
export const ADULT_GATE_DISABLED = process.env.NEXT_PUBLIC_ADULT_GATE_DISABLED === 'true';

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
        tagline: '대한민국 1등 여성 엔터프라이즈 알바 플랫폼',
        theme: 'light',
    },
    /**
     * P4 초코파트너스 / 파트너스크레딧
     * - 도메인: partnerscredit.co.kr (실제 도메인 확정 시 업데이트)
     * - Vercel 환경변수: NEXT_PUBLIC_DEFAULT_BRAND_ID=choco, NEXT_PUBLIC_AUDIT_MODE=true
     */
    choco: {
        id: 'choco',
        name: '초코파트너스',
        domain: 'partnerscredit.co.kr',
        primaryColor: '#1E3A8A',
        logoText: 'CHOCO',
        displayName: '초코파트너스',
        tagline: '파트너스크레딧 — 검증된 파트너사와 함께하는 B2B 성장 플랫폼',
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
