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
    if (payType.startsWith('TC') || payType.startsWith('T')) return 'T';
    if (payType.includes('시급')) return '시';
    if (payType.includes('일급')) return '일';
    if (payType.includes('주급')) return '주';
    if (payType.includes('월급')) return '월';
    if (payType.includes('연봉')) return '연';
    if (payType.includes('건별')) return '건';
    if (payType.includes('협의')) return '협';
    return payType.substring(0, 1) || '협';
};
