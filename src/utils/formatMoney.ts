
export const formatKoreanMoney = (amount: number | string): string => {
    // 1. Clean input
    const num = typeof amount === 'string' ? Number(amount.replace(/,/g, '')) : amount;

    // 2. Validate
    if (isNaN(num) || num === 0) return String(amount);

    // 3. Formatting Rules
    // 1억 이상
    if (num >= 100000000) {
        const eok = Math.floor(num / 100000000);
        const remainder = num % 100000000;
        if (remainder === 0) return `${eok.toLocaleString()}억원`;
        const man = Math.floor(remainder / 10000);
        return `${eok.toLocaleString()}억 ${man > 0 ? man.toLocaleString() + '만원' : '원'}`;
    }

    // 100만원 이상 (User Request: 100단위부터 만원)
    if (num >= 1000000) {
        const man = Math.floor(num / 10000);
        const remainder = num % 10000;
        if (remainder === 0) return `${man.toLocaleString()}만원`;
        return `${man.toLocaleString()}만 ${remainder.toLocaleString()}원`;
    }

    // 그 미만 (예: 160,000원) - Apply comma formatted string
    return `${num.toLocaleString()}원`;
};
