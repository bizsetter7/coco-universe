export const getPayColor = (payType: string = '') => {
    if (payType.startsWith('시')) return 'bg-cyan-500 text-white';        // 청록
    if (payType.startsWith('일')) return 'bg-blue-600 text-white';        // 블루
    if (payType.startsWith('주')) return 'bg-pink-500 text-white';        // 핑크
    if (payType.startsWith('월')) return 'bg-purple-600 text-white';      // 보라
    if (payType.startsWith('연')) return 'bg-green-600 text-white';       // 그린
    if (payType.startsWith('TC') || payType.startsWith('T')) return 'bg-indigo-600 text-white'; // 인디고
    if (payType.startsWith('건')) return 'bg-emerald-500 text-white';     // 민트 (에메랄드)
    return 'bg-gray-400 text-white'; // 협의 / 기본값 (그레이)
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
