import { PAY_BADGE_STANDARDS } from '@/constants/standards';

export const getPayColor = (payType: string = '') => {
    const type = payType.trim();
    const standard = PAY_BADGE_STANDARDS.find(s =>
        type.startsWith(s.name) || type.startsWith(s.abbr) || s.id === type
    );

    if (standard) return `${standard.tw} text-white`;

    // Special handling for TC/T
    if (type.startsWith('T') || type.includes('TC')) {
        return 'bg-emerald-500 text-white';
    }

    return 'bg-[#6B7280] text-white'; // 협의 / 기본값 (Gray)
};

export const getPayAbbreviation = (payType: string = '') => {
    if (!payType) return '협';
    const type = payType.trim();
    if (type.startsWith('TC') || type.startsWith('T')) return 'T';
    if (type.includes('시') || type.includes('시급')) return '시';
    if (type.includes('일') || type.includes('일급')) return '일';
    if (type.includes('주') || type.includes('주급')) return '주';
    if (type.includes('월') || type.includes('월급')) return '월';
    if (type.includes('연') || type.includes('연봉')) return '연';
    if (type.includes('건') || type.includes('건별')) return '건';
    if (type.includes('협') || type.includes('협의')) return '협';
    return type.substring(0, 1) || '협';
};
