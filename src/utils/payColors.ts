export const getPayColor = (payType: string = '') => {
    if (payType.startsWith('시')) return 'bg-cyan-500 text-white dark:bg-cyan-600';
    if (payType.startsWith('일')) return 'bg-blue-600 text-white dark:bg-blue-700'; // Standard List Ad Blue
    if (payType.startsWith('주')) return 'bg-pink-500 text-white dark:bg-pink-600';
    if (payType.startsWith('월')) return 'bg-purple-600 text-white dark:bg-purple-700';
    if (payType.startsWith('연')) return 'bg-green-600 text-white dark:bg-green-700';
    if (payType.startsWith('TC') || payType.startsWith('T')) return 'bg-indigo-600 text-white dark:bg-indigo-700';
    if (payType.startsWith('건')) return 'bg-teal-600 text-white dark:bg-teal-700';
    return 'bg-gray-500 text-white dark:bg-gray-600'; // Default/협의 - Dark Gray
};
