import { JOB_CATEGORY_MAP } from '@/constants/jobs';
import { REGIONS_MAP } from '@/constants/regions';
import {
    PAY_TYPES as GLOBAL_PAY_TYPES,
    PAY_SUFFIX_OPTIONS as GLOBAL_PAY_SUFFIX,
    CONVENIENCE_KEYWORDS as GLOBAL_CONVENIENCE,
    AGES as GLOBAL_AGES,
    TEXT_COLORS as GLOBAL_TEXT_COLORS,
    BG_COLORS as GLOBAL_BG_COLORS,
    ICONS as GLOBAL_ICONS,
    HIGHLIGHTERS as GLOBAL_HIGHLIGHTERS
} from '@/constants/job-options';

// 기존 인터페이스 호환을 위해 명칭 맵핑
export const INDUSTRY_DATA = JOB_CATEGORY_MAP;

export const REGION_DATA: Record<string, string[]> = REGIONS_MAP;

export const AGES = GLOBAL_AGES;

export const PAY_TYPES = GLOBAL_PAY_TYPES;

export const PAY_SUFFIX_OPTIONS = [
    '보도', '고정아가씨', '+α', '보너스', '팁별도', '고수익', '고액알바', '갯수보장', '만근비지원', '출퇴근지원',
    '고정구함', '초보가능', '선불가능', '급전가능', '성형지원', '따당가능', '순번확실', '푸쉬가능', '대학생알바', '지명우대',
    '친구동반우대', '가족같은분위기', '밀방없음', '뒷방없음', '칼퇴보장', '텃세없음', '당일지급', '면접비지원', '회식활발',
    '출퇴근자유', '홀복지원', '해외여행지원', 'BJ알바', '숙식제공', '식사제공', '교통비지원', '인센티브', '인플루언서', '남자실장', '여자실장'
];

export const STEP4_CONVENIENCE_KEYWORDS = [
    '초보가능', '당일지급', '당일알바', '평일알바', '주말알바', '주간알바', '초이스없음', '20대알바', '30대알바', '40대알바',
    '밤알바', '유흥알바', '투잡알바', '야간알바', '단기알바', '경력우대', '파트타임', '여성알바', '여자알바', '모델알바',
    '룸알바', '보도알바', '고수익', '고액알바'
];

export const CONVENIENCE_KEYWORDS = GLOBAL_CONVENIENCE;

export const FONT_DISPLAY_NAMES: { [key: string]: string } = {
    'Pretendard': '프리텐다드 (기본)',
    'Nanum Gothic': '나눔고딕',
    'Nanum Myeongjo': '나눔명조',
    'Hahmlet': '함렛 (궁서체)',
    'Gowun Batang': '고운바탕 (바탕체)',
    'Arial': 'Arial (영문)',
    'system-ui': '시스템 기본'
};

export const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];

export const TEXT_COLORS = GLOBAL_TEXT_COLORS;

export const BG_COLORS = GLOBAL_BG_COLORS;

export const DETAILED_PRICING = [
    { id: 'p1', tier: '그랜드', eng: '(Grand)', name: '타입1. 그랜드 (Grand)', color: 'text-purple-600', desc: '메인 최상단 노출 및\n압도적 광고 효과', d30: 350000, d60: 630000, d90: 840000, isMain: true },
    { id: 'p2', tier: '프리미엄', eng: '(Premium)', name: '타입2. 프리미엄 (Premium)', color: 'text-pink-600', desc: '상단 시선 집중\n높은 효율성 노출', d30: 200000, d60: 360000, d90: 480000, isMain: true },
    { id: 'p3', tier: '디럭스', eng: '(Deluxe)', name: '타입3. 디럭스 (Deluxe)', color: 'text-blue-600', desc: '타겟 지역 집중\n전략적 배너 노출', d30: 180000, d60: 324000, d90: 432000, isMain: true },
    { id: 'p4', tier: '스페셜', eng: '(Special)', name: '타입4. 스페셜 (Special)', color: 'text-teal-600', desc: '가성비 최우선\n실속형 배너 노출', d30: 150000, d60: 270000, d90: 360000, isMain: true },
    { id: 'p5', tier: '급구/추천', eng: '(Urgent/Rec)', name: '타입5. 급구/추천 (Urgent)', color: 'text-orange-600', desc: '급구/추천 배지 노출로\n주목도 실속형', d30: 120000, d60: 216000, d90: 288000, isMain: true },
    { id: 'p6', tier: '네이티브', eng: '(Native)', name: '타입6. 네이티브 (Native)', color: 'text-gray-600', desc: '리스트 광고에 배치\n랜덤 상단노출효과', d30: 100000, d60: 180000, d90: 240000, isMain: true },
    { id: 'p7', tier: '베이직', eng: '(Basic)', name: '타입7. 베이직/줄광고', color: 'text-gray-400', desc: '최신 구인정보 리스트\n(실속형 구인 상품)', d30: 60000, d60: 100000, d90: 140000, isMain: true },
    { id: 'bold', tier: '굵은글씨', eng: '', name: '기타-강조옵션 (Emphasis)', color: 'text-black', desc: '아이콘/형광펜\n테두리/급여추가\n(주목도 200% 상승)', d30: 30000, d60: 55000, d90: 70000, isMain: false },
];

export const ICONS = GLOBAL_ICONS;
export const HIGHLIGHTERS = GLOBAL_HIGHLIGHTERS;

export const FORBIDDEN_WORDS = [
    '키스방', '대딸', '마사지', '안마', '보도방', '노래방', '풀싸롱', '룸싸롱',
    '성매매', '조건만남', '애인대행', '유사성행위', '오피', '핸플', '마무리',
    '소액결제', '내구제', '대출', '마약', '떨', '아이스', '작대기',
    '도우미', '여우알바', '밤알바', '유흥알바'
];
