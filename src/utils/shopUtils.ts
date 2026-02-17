import { ICONS } from '@/constants/job-options';

/**
 * 🧹 공고 제목 정제 유틸리티
 * 대괄호[], 소괄호(), 중괄호{} 및 내부 텍스트를 제거하고 트림합니다.
 */
export const cleanShopTitle = (title?: string, name?: string): string => {
    const rawTitle = title || name || '공고 정보';
    // 1단계: [], (), {} 및 내부 텍스트 제거
    // 2단계: 연속된 공백을 하나로 합치고 트림
    const cleaned = rawTitle.replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, ' ').replace(/\s+/g, ' ').trim();
    // 정제 후 너무 짧아지면 원본 반환 (시인성 확보)
    return cleaned.length < 2 ? rawTitle : cleaned;
};

/**
 * 🔍 아이콘 객체 조회 유틸리티
 * ID를 통해 ICONS 상수에서 아이콘 정보를 찾습니다.
 */
export const getIconById = (id?: number | string | null) => {
    if (!id) return null;
    return ICONS.find(icon => String(icon.id) === String(id)) || null;
};
/**
 * 🔗 URL Slug 생성 유틸리티
 * 지역명 등을 URL에 안전한 형태로 변환합니다.
 */
export const slugify = (str: string): string => {
    if (!str) return 'all';
    return str
        .replace(/[\[\]\>\<\(\)\{\}]/g, '') // 특수문자 제거
        .replace(/[\s\/]+/g, '-')           // 공백 및 슬래시를 하이픈으로 변경
        .replace(/-+/g, '-')                // 중복 하이픈 제거
        .trim();
};
