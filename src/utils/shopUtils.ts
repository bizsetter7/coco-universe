import { ICONS } from '@/constants/job-options';

/**
 * 🧹 공고 제목 정제 유틸리티
 * 대괄호[], 소괄호(), 중괄호{} 및 내부 텍스트를 제거하고 트림합니다.
 */
export const cleanShopTitle = (title?: string, name?: string): string => {
    const rawTitle = title || name || '공고 정보';
    const cleaned = rawTitle.replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim();
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
