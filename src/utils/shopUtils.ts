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

/**
 * 🖼️ 업종별 기본 이미지 반환 유틸리티
 * 각 업종에 어울리는 프리미엄 이미지를 반환합니다.
 */
export const getShopDefaultImage = (workType?: string): string => {
    const type = workType || '';

    if (type.includes('바') || type.includes('Bar') || type.includes('카페')) {
        return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800'; // 프리미엄 바 이미지
    }
    if (type.includes('노래') || type.includes('가라오케') || type.includes('주점')) {
        return 'https://images.unsplash.com/photo-1525286335722-c30c6b5df541?auto=format&fit=crop&q=80&w=800'; // 가라오케/마이크 이미지
    }
    if (type.includes('룸') || type.includes('셔츠')) {
        return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800'; // 클럽/하이엔드 라운지
    }
    if (type.includes('테라피') || type.includes('마사지') || type.includes('스웨디시')) {
        return 'https://images.unsplash.com/photo-1544161515-4af6b1d8e159?auto=format&fit=crop&q=80&w=800'; // 스파/테라피 이미지
    }
    if (type.includes('해외') || type.includes('출장')) {
        return 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=800'; // 공항/여행 이미지
    }

    // 기본 리드 이미지 (Nightlife)
    return 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800';
};
/**
 * 🏷️ SEO 키워드 자동 생성 유틸리티
 * 지역명을 기반으로 검색 최적화된 키워드 배열을 반환합니다.
 */
export const generateSEOKeywords = (region?: string): string[] => {
    const regionName = region?.replace(/[\[\]]/g, '') || '전국';

    return [
        `${regionName}여자알바`,
        `${regionName}여성알바`,
        `${regionName}유흥알바`,
        `${regionName}룸알바`,
        `${regionName}밤알바`,
        `${regionName}당일알바`,
        `${regionName}20대알바`,
        `${regionName}30대알바`,
        `${regionName}고수익`,
        `${regionName}여우알바`,
        `${regionName}퀸알바`,
        `${regionName}레이디알바`,
        '코코알바'
    ];
};
