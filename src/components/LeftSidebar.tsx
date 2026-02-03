'use client';

import { useBrand } from '@/components/BrandProvider';
import {
    Phone, ChevronRight, Star, Flame, Zap, Gift, Crown, User, Sparkles, List, FileText
} from 'lucide-react';

interface LeftSidebarProps {
    selectedRegion: string;
    setSelectedRegion: (region: string) => void;
    setSelectedSubRegion: (subRegion: string) => void;
    selectedJobType: string;
    setSelectedJobType: (jobType: string) => void;
    onLoginClick: () => void;
    onSignupClick: () => void;
    onPaymentClick: (tier: string) => void;
    isLoggedIn?: boolean;
    userName?: string;
    userType?: 'corporate' | 'individual';
    userPoints?: number;
}

// 새로운 지역 목록 (17개)
const REGION_BUTTONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

// 새로운 직종 목록 (10개)
const JOB_TYPE_BUTTONS = ['룸알바', '노래주점', '텐프로/쩜오', '요정', '바(Bar)', '엔터', '다방', '카페', '마사지', '기타'];

// 편의사항/키워드 목록 (36개)
const KEYWORD_OPTIONS = [
    '출퇴근지원', '순번확실', '원룸제공', '만근비지원', '출퇴근자유', '식사제공',
    '팁별도', '인센티브', '홀복지원', '갯수보장', '지명우대', '고수익',
    '초이스없음', '해외여행지원', '뒷방없음', '따당가능', '푸쉬가능', '밀방없음',
    '칼퇴보장', '텃세없음', '지명비있음', '선불가능', '성형지원', '숙식제공',
    '경력우대', '당일지급', '초보가능', '파트타임', '주말알바', '당일알바',
    '주간알바', '투잡알바', '평일알바', '야간알바', '단기알바', '신입환영'
];

const CATEGORY_LINKS = [
    { icon: Crown, label: '그랜드', color: 'text-amber-500', tier: 'grand' },
    { icon: Star, label: '프리미엄', color: 'text-purple-500', tier: 'premium' },
    { icon: Zap, label: '디럭스', color: 'text-blue-500', tier: 'deluxe' },
    { icon: Sparkles, label: '스페셜', color: 'text-pink-500', tier: 'special' },
    { icon: Flame, label: '급구', color: 'text-red-500', tier: 'urgent' },
    { icon: Gift, label: '추천', color: 'text-emerald-500', tier: 'urgent' },
    { icon: List, label: '리스트네이티브', color: 'text-cyan-500', tier: 'native' },
    { icon: FileText, label: '베이직(줄광고)', color: 'text-gray-500', tier: 'basic' },
];

export default function LeftSidebar({
    selectedRegion,
    setSelectedRegion,
    setSelectedSubRegion,
    selectedJobType,
    setSelectedJobType,
    onLoginClick,
    onSignupClick,
    onPaymentClick,
    isLoggedIn = false,
    userName = '케이(K)',
    userType = 'corporate',
    userPoints = 0,
}: LeftSidebarProps) {
    const brand = useBrand();


    return (
        <div className="hidden lg:block w-[220px] flex-shrink-0 space-y-4">
            {/* 1. MEMBER LOGIN / 로그인 상태 박스 */}
            <div className={`p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {isLoggedIn ? (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                                <User size={16} className="text-gray-500" />
                            </div>
                            <div>
                                <p className={`text-xs font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                    {userName} 님 <span className="text-gray-400">☆</span> [1]
                                </p>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-2 text-center">
                            회원님은 <span className="text-purple-600 font-bold">{userType === 'corporate' ? '기업회원' : '일반회원'}</span> 입니다.
                        </p>
                        <div className={`flex items-center gap-1 mb-3 p-2 rounded-lg ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <span className="text-[11px] text-gray-500">P</span>
                            <span className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{userPoints.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <button className="py-2 bg-purple-100 text-purple-600 rounded text-[10px] font-bold hover:bg-purple-200 transition">마이페이지</button>
                            <button className={`py-2 rounded text-[10px] font-bold transition ${brand.theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>회원수정</button>
                            <button className={`py-2 rounded text-[10px] font-bold transition ${brand.theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>로그아웃</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h4 className={`text-xs font-black mb-3 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>MEMBER LOGIN</h4>
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="ID"
                                className={`w-full px-3 py-2 rounded-lg text-xs border ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400'}`}
                            />
                            <input
                                type="password"
                                placeholder="PASSWORD"
                                className={`w-full px-3 py-2 rounded-lg text-xs border ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400'}`}
                            />
                            <button
                                onClick={onLoginClick}
                                className="w-full py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition"
                            >
                                로그인
                            </button>
                        </div>
                        <div className="flex justify-center gap-2 mt-3 text-[10px] text-gray-500">
                            <button onClick={onSignupClick} className="hover:text-pink-600 transition">회원가입</button>
                            <span>|</span>
                            <button className="hover:text-pink-600 transition">아이디/패스워드 찾기</button>
                        </div>
                    </>
                )}
            </div>

            {/* 2. 광고 배너 슬롯 */}
            <div className="h-[100px] rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                <div className="text-center">
                    <p className="text-lg font-black">하루 200보장</p>
                    <p className="text-[10px] opacity-80">코코알바 프리미엄 배너</p>
                </div>
            </div>

            {/* 3. 지역별 채용정보 */}
            <div className={`p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`text-sm font-black mb-3 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <span className="text-purple-600">지역별</span> 채용정보
                </h4>
                <div className="grid grid-cols-4 gap-1">
                    {REGION_BUTTONS.map((reg) => (
                        <button
                            key={reg}
                            onClick={() => { setSelectedRegion(reg); setSelectedSubRegion('전체'); }}
                            className={`px-1 py-1.5 rounded text-[10px] font-bold transition ${selectedRegion === reg
                                ? 'bg-purple-600 text-white'
                                : brand.theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {reg}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. 업직종별 채용정보 */}
            <div className={`p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`text-sm font-black mb-3 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    <span className="text-purple-600">업직종별</span> 채용정보
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                    {JOB_TYPE_BUTTONS.map((job) => (
                        <button
                            key={job}
                            onClick={() => setSelectedJobType(job)}
                            className={`px-2 py-1.5 rounded text-[10px] font-bold transition ${selectedJobType === job
                                ? 'bg-purple-600 text-white'
                                : brand.theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            · {job}
                        </button>
                    ))}
                </div>
            </div>

            {/* 5. 편의사항/키워드 (최대 5개 선택) */}
            <div className={`p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <span className="text-purple-600">편의사항</span> 키워드
                    </h4>
                    <span className="text-[10px] text-gray-500">
                        필터
                    </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-[200px] overflow-y-auto">
                    {KEYWORD_OPTIONS.map((kw) => (
                        <button
                            key={kw}
                            onClick={() => { }}
                            className={`px-2 py-1 rounded text-[9px] font-bold transition ${brand.theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {kw}
                        </button>
                    ))}
                </div>
            </div>

            {/* 6. 카테고리 링크 + 광고신청 */}
            <div className={`rounded-xl border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {CATEGORY_LINKS.map((cat, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between px-3 py-2.5 border-b last:border-b-0 ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}
                    >
                        <div className="flex items-center gap-2">
                            <cat.icon size={14} className={cat.color} />
                            <span className={`text-[11px] font-bold ${brand.theme === 'dark' ? 'text-gray-200' : 'text-black'}`}>{cat.label}</span>
                        </div>
                        <button
                            onClick={() => onPaymentClick(cat.tier)}
                            className="px-2 py-1 bg-gray-100 hover:bg-pink-100 text-gray-500 hover:text-pink-600 rounded text-[9px] font-bold transition"
                        >
                            광고신청
                        </button>
                    </div>
                ))}
            </div>

            {/* 7. 고객지원센터 */}
            <div className={`p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-xs font-black flex items-center gap-1 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <Phone size={12} />
                        고객지원센터
                    </h4>
                    <button className="text-[10px] text-gray-400 hover:text-pink-600 flex items-center gap-0.5 transition">
                        MORE <ChevronRight size={10} />
                    </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-black text-black">
                        TALK
                    </div>
                    <div>
                        <p className={`text-xs font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>CocoAlba</p>
                        <p className="text-lg font-black text-purple-600">1544-5568</p>
                    </div>
                </div>
                <p className="text-[9px] text-gray-500 mb-2">평일 09:30~19:00 점심 12:00~13:30<br />*공휴일 토,일은 근무하지 않습니다.</p>
                <div className="flex gap-2 text-[10px]">
                    <button className={`hover:text-pink-600 transition ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>➤ FAQ 도움말</button>
                    <button className={`hover:text-pink-600 transition ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>➤ 광고문의 & 일반문의</button>
                </div>
            </div>

            {/* 8. 광고 슬롯 1 */}
            <div className="h-[200px] rounded-xl bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg overflow-hidden">
                <div className="text-center p-4">
                    <p className="text-2xl font-black mb-1">도파민</p>
                    <p className="text-2xl font-black mb-2">마동석</p>
                    <p className="text-sm font-bold opacity-90">대표</p>
                    <p className="text-lg font-black mt-2">순수 테이블</p>
                </div>
            </div>

            {/* 9. 광고 슬롯 2 */}
            <div className="h-[200px] rounded-xl bg-gradient-to-b from-pink-400 to-pink-600 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-2 right-2 text-2xl">🎉</div>
                <div className="text-center p-4">
                    <p className="text-sm font-bold text-pink-200">이태곤대표</p>
                    <p className="text-xs text-pink-200 mb-2">(강남캐모)</p>
                    <p className="text-xl font-black">010 5310 5882</p>
                    <p className="text-lg font-bold mt-1">순수테이블</p>
                    <p className="text-sm font-bold">2시간 40만원</p>
                    <p className="text-xs mt-2 opacity-90">지원금 지원<br />당일지급<br />뮤초진행</p>
                </div>
            </div>
        </div >
    );
}
