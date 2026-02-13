export const getPayColor = (payType: string = '') => {
    if (payType.startsWith('시')) return 'bg-cyan-500 text-white';
    if (payType.startsWith('일')) return 'bg-blue-600 text-white';
    if (payType.startsWith('주')) return 'bg-pink-500 text-white';
    if (payType.startsWith('월')) return 'bg-purple-600 text-white';
    if (payType.startsWith('연')) return 'bg-green-600 text-white';
    if (payType.startsWith('TC') || payType.startsWith('T')) return 'bg-indigo-600 text-white';
    if (payType.startsWith('건')) return 'bg-emerald-500 text-white';
    return 'bg-gray-400 text-white'; // 협의 / 기본값
};
