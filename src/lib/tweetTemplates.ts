/**
 * 트윗 템플릿 엔진
 *
 * 3가지 콘텐츠 타입:
 *   TYPE_A — 신규 구인 공고 알림 (DB 연동)
 *   TYPE_B — 지역 시세 정보 (DB 집계)
 *   TYPE_C — 정보성 가이드 콘텐츠 (work-type-guide 기반)
 *
 * 전략: 구인공고 직접 노출 최소화, 정보성 콘텐츠로 제재 리스크 우회
 */

import { buildHashtags, formatHashtags } from './snsHashtags';
import { slugify } from '@/utils/shopUtils';

const BASE_URL = 'https://www.cocoalba.kr';

// ─── TYPE_A: 신규 구인 공고 알림 ─────────────────────────────────────────────

export interface NewJobTweetData {
    shopId:    string | number;
    name:      string;
    region:    string;          // 원본 region값 (예: "[서울]강남구")
    regionSlug:string;          // slugified (예: "서울-강남구")
    workType:  string;
    pay:       string | number;
    payType:   string;          // "시급" | "일급" | "TC" | "면접후결정"
    conditions:string[];        // 근무 조건 요약 배열 (예: ["당일지급", "숙식제공"])
}

export function buildNewJobTweet(data: NewJobTweetData): string {
    const { shopId, name, regionSlug, workType, pay, payType, conditions } = data;

    const payDisplay = String(pay) === '면접후결정'
        ? '💬 면접 후 결정'
        : `💰 ${payType} ${Number(pay).toLocaleString()}원`;

    const condStr = conditions.slice(0, 2).join(' · ');
    const hashtags = formatHashtags(buildHashtags(regionSlug, workType));
    const url = `${BASE_URL}/coco/${encodeURIComponent(regionSlug)}/${shopId}`;

    const lines = [
        `🆕 ${workType} 신규 구인`,
        `📍 ${name}`,
        payDisplay,
        condStr ? `✅ ${condStr}` : '',
        '',
        `▶ 상세 보기 ${url}`,
        '',
        hashtags,
    ].filter(l => l !== undefined);

    return lines.join('\n');
}

// ─── TYPE_B: 지역 시세 정보 ───────────────────────────────────────────────────

export interface SalaryInfoTweetData {
    regionSlug:  string;
    regionName:  string;
    workType:    string;
    avgPay:      number;
    maxPay:      number;
    shopCount:   number;
    payType:     string;
}

export function buildSalaryInfoTweet(data: SalaryInfoTweetData): string {
    const { regionSlug, regionName, workType, avgPay, maxPay, shopCount, payType } = data;

    const hashtags = formatHashtags(buildHashtags(regionSlug, workType));
    const url = `${BASE_URL}/coco/${encodeURIComponent(regionSlug)}/${encodeURIComponent(workType)}`;

    const lines = [
        `📊 ${regionName} ${workType} 이번 주 시세`,
        ``,
        `평균 ${payType}: ${avgPay.toLocaleString()}원`,
        `최고 ${payType}: ${maxPay.toLocaleString()}원`,
        `구인 업소: ${shopCount}개`,
        ``,
        `💡 전체 보기 ${url}`,
        ``,
        hashtags,
    ];

    return lines.join('\n');
}

// ─── TYPE_C: 정보성 가이드 콘텐츠 ────────────────────────────────────────────

export interface GuideTweetData {
    workType:   string;
    regionSlug: string;
    regionName: string;
    tip:        string;   // 핵심 정보 1줄
    guideUrl?:  string;   // 가이드 페이지 URL (없으면 자동 생성)
}

// 업종별 정보성 팁 로테이션 (날짜 기반으로 자동 선택)
const GUIDE_TIPS: Record<string, string[]> = {
    '룸알바':    [
        '첫 면접 전 TC 단가와 지정비 조건을 반드시 확인하세요',
        '당일지급 가능 여부는 면접 시 서면으로 확인하는 게 안전합니다',
        '풀묶 시스템이 있는 업소는 단기에 높은 수입을 기대할 수 있습니다',
        '계약서 없이 출근 시 수익 분쟁 발생 가능 — 서명 전 조건 꼼꼼히 확인',
    ],
    '텐프로':    [
        '텐프로 입문 전 텐카페 경험을 먼저 쌓으면 적응이 쉽습니다',
        'TC 2시간 기준 단가를 기준으로 업소를 비교하세요',
        'VIP 손님 대응 경험이 수입에 직결됩니다',
        '선불 강요 업소는 사기 가능성 높음 — 즉시 피하세요',
    ],
    '쩜오알바':  [
        '쩜오는 텐프로보다 진입 장벽이 낮고 추가 수입 기회가 많습니다',
        '블렌딩 매칭 시스템으로 안정적인 수입이 가능한 업종입니다',
        '강남·대전 유성이 단가 최고 지역입니다',
    ],
    '텐카페':    [
        '텐카페는 초보자도 매니저 케어로 빠르게 적응 가능합니다',
        '테이블 회전이 빠른 업소일수록 단기 수입에 유리합니다',
        '시급제와 TC제 중 어느 쪽이 유리한지 면접 시 계산해보세요',
    ],
    '노래주점':  [
        '노래주점은 유흥업종 중 진입 장벽이 가장 낮은 편입니다',
        '당일 퇴근 후 현금 지급이 기본입니다',
        '단 몇 시간 단기 근무도 가능한 유연한 업종입니다',
    ],
    '바알바':    [
        '정바·룸바·토킹바 등 본인 성향에 맞는 형태를 선택하세요',
        '음주 능력보다 대화 능력이 수입에 더 영향을 줍니다',
    ],
    '마사지':    [
        '마사지 기술 교육을 지원하는 업소가 많으니 초보도 도전 가능합니다',
        '예약제 운영으로 규칙적인 수입이 가능한 안정적인 업종입니다',
        'TC 1건당 수당 방식이므로 기술 향상이 곧 수입 향상입니다',
    ],
};

export function buildGuideTweet(data: GuideTweetData): string {
    const { workType, regionSlug, regionName, guideUrl } = data;

    // 날짜 기반으로 팁 자동 로테이션
    const tips   = GUIDE_TIPS[workType] ?? ['업소 면접 전 계약 조건을 반드시 확인하세요'];
    const dayIdx = new Date().getDate() % tips.length;
    const tip    = data.tip || tips[dayIdx];

    const hashtags = formatHashtags(buildHashtags(regionSlug, workType));
    const url      = guideUrl ?? `${BASE_URL}/coco/${encodeURIComponent(regionSlug)}/${encodeURIComponent(workType)}`;

    const lines = [
        `💡 ${regionName} ${workType} 꿀팁`,
        ``,
        tip,
        ``,
        `📖 ${workType} 가이드 전체 보기`,
        url,
        ``,
        hashtags,
    ];

    return lines.join('\n');
}

// ─── 시간대별 콘텐츠 타입 결정 ───────────────────────────────────────────────

export type TweetType = 'new_job' | 'salary_info' | 'guide' | 'manual';

/**
 * 현재 KST 시간 기반으로 발행할 콘텐츠 타입 결정
 * Vercel Cron은 UTC 기준이므로 KST(+9) 변환
 */
export function getTweetTypeByHour(): TweetType {
    const kstHour = (new Date().getUTCHours() + 9) % 24;
    if (kstHour >= 7  && kstHour < 10)  return 'salary_info';  // 08:00 KST — 지역 시세
    if (kstHour >= 11 && kstHour < 14)  return 'new_job';      // 12:00 KST — 신규 공고
    if (kstHour >= 17 && kstHour < 20)  return 'guide';        // 18:00 KST — 가이드
    if (kstHour >= 21 && kstHour < 24)  return 'new_job';      // 22:00 KST — 마감 임박 공고
    return 'guide'; // 기본값
}

// ─── 지역 로테이션 (요일 기반) ────────────────────────────────────────────────

const REGION_ROTATION = [
    { slug: '서울-강남구',    name: '강남' },
    { slug: '부산-해운대구',  name: '해운대' },
    { slug: '대전-유성구',    name: '대전 유성' },
    { slug: '경기-수원시',    name: '수원' },
    { slug: '대구-수성구',    name: '대구 수성' },
    { slug: '광주-서구',      name: '광주 상무' },
    { slug: '서울-마포구',    name: '홍대' },
    { slug: '서울-영등포구',  name: '영등포' },
    { slug: '경기-성남시',    name: '분당·성남' },
    { slug: '부산-부산진구',  name: '서면' },
    { slug: '경기-부천시',    name: '부천' },
    { slug: '충남-천안시',    name: '천안' },
    { slug: '충북-청주시',    name: '청주' },
    { slug: '전북-전주시',    name: '전주' },
];

/** 오늘 요일(0~6)에 맞는 대표 지역 반환 */
export function getTodayRegion(): { slug: string; name: string } {
    const dayOfWeek = new Date().getDay();
    return REGION_ROTATION[dayOfWeek % REGION_ROTATION.length];
}

// ─── 업종 로테이션 (날짜 기반) ───────────────────────────────────────────────

const WORKTYPE_ROTATION = ['룸알바', '텐프로', '텐카페', '쩜오알바', '바알바', '마사지', '노래주점', '노래빠알바'];

/** 오늘 날짜(1~31)에 맞는 대표 업종 반환 */
export function getTodayWorkType(): string {
    const dayOfMonth = new Date().getDate();
    return WORKTYPE_ROTATION[(dayOfMonth - 1) % WORKTYPE_ROTATION.length];
}
