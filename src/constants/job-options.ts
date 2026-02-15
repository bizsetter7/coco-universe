export const PAY_SUFFIX_OPTIONS = [
    '보도', '고정아가씨', '+α', '보너스', '팁별도', '고수익', '고액알바',
    '갯수보장', '만근비지원', '출퇴근지원', '고정구함', '초보가능',
    '선불가능', '급전가능', '성형지원', '따당가능', '순번확실', '푸쉬가능',
    '대학생알바', '지명우대', '친구동반우대', '가족같은분위기',
    '밀방없음', '뒷방없음', '칼퇴보장', '텃세없음', '당일지급', '면접비지원',
    '회식활발', '출퇴근자유', '홀복지원', '해외여행지원', 'BJ알바',
    '숙식제공', '식사제공', '교통비지원', '인센티브', '인플루언서', '남자실장', '여자실장'
];

export const CONVENIENCE_KEYWORDS = [
    '초보가능', '당일지급', '당일알바', '평일알바', '주말알바', '주간알바', '초이스없음', '20대알바', '30대알바', '40대알바',
    '밤알바', '유흥알바', '투잡알바', '야간알바', '단기알바', '경력우대', '파트타임', '여성알바', '여자알바',
    '모델알바', '룸알바', '보도알바', '고수익', '고액알바'
];

export const SIDEBAR_KEYWORDS = Array.from(new Set([...PAY_SUFFIX_OPTIONS, ...CONVENIENCE_KEYWORDS]));

export const AGES = Array.from({ length: 50 }, (_, i) => i + 20); // 20세~69세

export const FONTS = ['Pretendard', 'Nanum Gothic', 'Nanum Myeongjo', 'Hahmlet', 'Gowun Batang', 'Arial', 'system-ui'];
export const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px'];

export const TEXT_COLORS = [
    { label: '검정', value: '#000000' },
    { label: '흰색', value: '#ffffff' },
    { label: '빨강', value: '#ef4444' },
    { label: '파랑', value: '#3b82f6' },
    { label: '초록', value: '#22c55e' },
    { label: '노랑', value: '#eab308' },
    { label: '보라', value: '#a855f7' },
    { label: '핑크', value: '#ec4899' },
    { label: '회색', value: '#6b7280' },
];

export const BG_COLORS = [
    { label: '검정', value: '#000000' },
    { label: '빨강', value: '#FCA5A5' }, // Red-300
    { label: '파랑', value: '#93C5FD' }, // Blue-300
    { label: '초록', value: '#86EFAC' }, // Green-300
    { label: '노랑', value: '#FDE047' }, // Yellow-300
    { label: '보라', value: '#D8B4FE' }, // Purple-300
    { label: '핑크', value: '#F9A8D4' }, // Pink-300
    { label: '회색', value: '#D1D5DB' }, // Gray-300
];

export const PAY_TYPES = ['시급', '일급', '주급', '월급', '연봉', 'TC', '건별', '협의'];

// Helper to keep old reference working if strictly needed, 
// though we usually replace it with CONVENIENCE_KEYWORDS.
export const CONVENIENCE_ITEMS = CONVENIENCE_KEYWORDS;

export const KEYWORDS = CONVENIENCE_KEYWORDS;

export const ICONS = [
    { id: 1, name: '초보환영', icon: '❤️' },
    { id: 2, name: '원룸제공', icon: '👄' },
    { id: 3, name: '최고급시설', icon: '💥' },
    { id: 4, name: '블랙관리', icon: '⬛' },
    { id: 5, name: '꽁비지급', icon: '😜' },
    { id: 6, name: '사이즈X', icon: '❌' },
    { id: 7, name: '셋트환영', icon: '👯' },
    { id: 8, name: '픽업가능', icon: '🚗' },
    { id: 9, name: '회원제운영', icon: '❗' },
    { id: 10, name: '급전가능', icon: '✨' },
];

export const HIGHLIGHTERS = [
    { id: 1, name: '연두', color: '#ccff00' },
    { id: 2, name: '초록', color: '#00ff00' },
    { id: 3, name: '하늘', color: '#00ffff' },
    { id: 4, name: '보라', color: '#cc99ff' },
    { id: 5, name: '오렌지', color: '#ffcc00' },
    { id: 6, name: '연파랑', color: '#99ccff' },
    { id: 7, name: '분홍', color: '#ff99ff' },
    { id: 8, name: '핫핑크', color: '#ff00ff' },
];
