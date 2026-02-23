'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useBrand } from '@/components/BrandProvider';
import {
    Phone, ChevronRight, Star, Flame, Zap, Gift, Crown, User, Sparkles, List, FileText, ChevronDown, Coins
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
    userCredit?: number;
}

// 새로운 지역 목록 (17개)
const REGION_BUTTONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

// 새로운 직종 목록 (10개)
const JOB_TYPE_BUTTONS = ['룸알바', '노래주점', '텐프로/쩜오', '요정', '바(Bar)', '엔터', '다방', '카페', '마사지', '기타'];

import { SIDEBAR_KEYWORDS } from '@/constants/job-options';

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

import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useMobile';

export default function LeftSidebar({
    selectedRegion,
    setSelectedRegion,
    setSelectedSubRegion,
    selectedJobType,
    setSelectedJobType,
    onLoginClick,
    onSignupClick,
    onPaymentClick,
    isLoggedIn: propIsLoggedIn,
    userName: propUserName,
    userType: propUserType,
    userCredit: propUserCredit,
}: LeftSidebarProps) {
    const isMobile = useMobile();
    const brand = useBrand();
    const router = useRouter();
    const {
        isLoggedIn: authIsLoggedIn,
        userName: authUserName,
        userType: authUserType,
        userCredit: authUserCredit,
        logout,
        login: authLogin,
        signIn
    } = useAuth();
    const [selectedKeywords, setSelectedKeywords] = React.useState<string[]>([]);
    const [isLoginOpen, setIsLoginOpen] = React.useState(false);
    const [isRegionOpen, setIsRegionOpen] = React.useState(false);
    const [isJobTypeOpen, setIsJobTypeOpen] = React.useState(false);
    const [isKeywordOpen, setIsKeywordOpen] = React.useState(false);
    const [isAdProductOpen, setIsAdProductOpen] = React.useState(false);

    const [isLoginLoading, setIsLoginLoading] = React.useState(false);
    const [loginId, setLoginId] = React.useState('');
    const [loginPw, setLoginPw] = React.useState('');

    // [Optimization] Early return for mobile after all hooks are called
    if (isMobile) return null;

    // Use auth hook values for better sync across pages if props are not explicitly updated
    const isLoggedIn = propIsLoggedIn ?? authIsLoggedIn;
    const userName = propUserName ?? authUserName;
    const userType = propUserType ?? authUserType;
    const userCredit = propUserCredit ?? authUserCredit;

    const handleLogin = async () => {
        if (!loginId || !loginPw) {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        const id = loginId.trim();
        const pw = loginPw.trim();

        setIsLoginLoading(true);
        try {
            // 1. Check for Test/Mock IDs
            if ((id === 'admin_shop' || id === 'admin_user') && pw === 'password123') {
                authLogin('admin', id, id === 'admin_shop' ? '최고관리자' : '마스터관리자', id === 'admin_shop' ? '시스템마스터' : '운영총괄');
                setIsLoginOpen(false);
                setLoginId(''); setLoginPw('');
                return;
            } else if (id === 'test_shop' && pw === 'password123') {
                authLogin('shop', id, '테스트 사장님', '번창하는조사장');
                setIsLoginOpen(false);
                setLoginId(''); setLoginPw('');
                return;
            } else if (id === 'test_user' && pw === 'password123') {
                authLogin('personal', id, '테스트 회원', '밤의요정');
                setIsLoginOpen(false);
                setLoginId(''); setLoginPw('');
                return;
            }

            // 2. Real Supabase Login
            if (id.includes('@')) {
                await signIn(id, pw);
                setIsLoginOpen(false);
                setLoginId(''); setLoginPw('');
            } else {
                alert('등록되지 않은 계정입니다.\n테스트 계정 또는 이메일 형식을 사용해주세요.');
            }
        } catch (err: any) {
            console.error('Sidebar Login error:', err);
            alert(`로그인 실패: ${err.message || '아이디 또는 비밀번호를 확인해주세요.'}`);
        } finally {
            setIsLoginLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const toggleKeyword = (kw: string) => {
        if (selectedKeywords.includes(kw)) {
            setSelectedKeywords(prev => prev.filter(k => k !== kw));
        } else {
            if (selectedKeywords.length < 5) {
                setSelectedKeywords(prev => [...prev, kw]);
            } else {
                alert('최대 5개까지만 선택 가능합니다.');
            }
        }
    };


    return (
        <div className="hidden lg:block w-full flex-shrink-0 space-y-2">
            {/* 0. Partners Credit Funnel - REMOVED (Moved to Community Banner as requested) */}
            {/* 
            <div 
                onClick={() => window.open('https://partners-credit-site.vercel.app', '_blank')}
                className="mb-2 p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 cursor-pointer shadow-md hover:scale-[1.02] transition-all border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
            >
                <div className="flex items-center gap-2">
                    <div className="bg-white/30 p-1.5 rounded-lg">
                        <Coins size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-orange-900/70 leading-none">수익형 커뮤니티</p>
                        <h4 className="text-sm font-black text-white flex items-center gap-1">
                            파트너스 활동 <ChevronRight size={12} strokeWidth={3} />
                        </h4>
                    </div>
                </div>
            </div>
            */}

            {/* 1. MEMBER LOGIN / 로그인 상태 박스 */}
            <div className={`py-2.5 px-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setIsLoginOpen(!isLoginOpen)}
                >
                    <h4 className={`text-xs font-black uppercase tracking-wider ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-900'}`}>
                        {isLoggedIn ? 'MEMBER INFO' : 'MEMBER LOGIN'}
                    </h4>
                    <ChevronDown
                        size={14}
                        className={`text-gray-400 group-hover:text-purple-500 transition-transform duration-300 ${isLoginOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                </div>

                <div className={`transition-all duration-300 overflow-hidden ${isLoginOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {isLoggedIn ? (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                                    <User size={16} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className={`text-xs font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                        {userName} 님 <span className="text-gray-400">☆</span>
                                    </p>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500 mb-2 text-center">
                                회원님은 <span className="text-purple-600 font-bold">
                                    {userType === 'admin' ? '최고 관리자' : (userType === 'corporate' ? '기업회원' : '일반회원')}
                                </span> 입니다.
                            </p>
                            <div className={`flex items-center gap-1 mb-3 p-2 rounded-lg ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <span className="text-[11px] text-gray-500">C</span>
                                <span className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{userCredit.toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    onClick={() => { setIsLoginOpen(false); router.push('/my-shop'); }}
                                    className="py-2 bg-purple-100 text-purple-600 rounded text-[10px] font-bold hover:bg-purple-200 transition"
                                >
                                    마이페이지
                                </button>
                                <button
                                    onClick={() => { setIsLoginOpen(false); logout(); }}
                                    className={`py-2 rounded text-[10px] font-bold transition ${brand.theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    로그아웃
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="ID"
                                    value={loginId}
                                    onChange={(e) => setLoginId(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className={`w-full px-3 py-2 rounded-lg text-xs border ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400'}`}
                                />
                                <input
                                    type="password"
                                    placeholder="PASSWORD"
                                    value={loginPw}
                                    onChange={(e) => setLoginPw(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className={`w-full px-3 py-2 rounded-lg text-xs border ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400'}`}
                                />
                                <button
                                    onClick={handleLogin}
                                    className="w-full py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition"
                                >
                                    로그인
                                </button>
                            </div>
                            <div className="flex justify-center gap-2 mt-3 text-[10px] text-gray-500">
                                <button onClick={() => { setIsLoginOpen(false); router.push('/?page=signup'); }} className="hover:text-pink-600 transition">회원가입</button>
                                <span>|</span>
                                <button onClick={() => setIsLoginOpen(false)} className="hover:text-pink-600 transition">아이디/패스워드 찾기</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 2. 광고 배너 슬롯 1 - 하루 200보장 */}
            <div className="group relative h-[100px] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700"></div>
                {/* Background Deco Patterns */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute -top-6 -left-6 w-20 h-20 bg-white rounded-full blur-xl animate-pulse" />
                    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-pink-400 rounded-full blur-xl animate-pulse" />
                </div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center p-3">
                    <p className="text-xl font-black drop-shadow-lg tracking-tighter">
                        하루 200보장
                    </p>
                    <div className="w-8 h-0.5 bg-white/30 my-1.5 rounded-full" />
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                        CocoAlba Premium
                    </p>
                </div>
            </div>

            {/* 3. 지역별 채용정보 */}
            <div className={`py-2.5 px-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div
                    className="flex items-center justify-between cursor-pointer group mb-1"
                    onClick={() => setIsRegionOpen(!isRegionOpen)}
                >
                    <h4 className={`text-sm font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <span className="text-purple-600">지역별</span> 채용정보
                    </h4>
                    <ChevronDown
                        size={14}
                        className={`text-gray-400 group-hover:text-purple-500 transition-transform duration-300 ${isRegionOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                </div>

                <div className={`grid grid-cols-5 gap-1 transition-all duration-300 overflow-hidden ${isRegionOpen ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {REGION_BUTTONS.map((reg) => (
                        <button
                            key={reg}
                            onClick={() => {
                                setSelectedRegion(reg);
                                setSelectedSubRegion('전체');
                                setIsRegionOpen(false); // Auto-close after selection
                            }}
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
            <div className={`py-2.5 px-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div
                    className="flex items-center justify-between cursor-pointer group mb-1"
                    onClick={() => setIsJobTypeOpen(!isJobTypeOpen)}
                >
                    <h4 className={`text-sm font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <span className="text-purple-600">업직종별</span> 채용정보
                    </h4>
                    <ChevronDown
                        size={14}
                        className={`text-gray-400 group-hover:text-purple-500 transition-transform duration-300 ${isJobTypeOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                </div>

                <div className={`grid grid-cols-2 gap-1.5 transition-all duration-300 overflow-hidden ${isJobTypeOpen ? 'max-h-[500px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {JOB_TYPE_BUTTONS.map((job) => (
                        <button
                            key={job}
                            onClick={() => {
                                setSelectedJobType(job);
                                setIsJobTypeOpen(false); // Auto-close after selection
                            }}
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



            {/* 5. 편의사항/키워드 (최대 5개 선택 -> Expanded List) */}
            <div className={`py-2.5 px-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div
                    className="flex items-center justify-between cursor-pointer group mb-1"
                    onClick={() => setIsKeywordOpen(!isKeywordOpen)}
                >
                    <h4 className={`text-sm font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <span className="text-purple-600">편의사항</span> 키워드
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">
                            {selectedKeywords.length}/5
                        </span>
                        <ChevronDown
                            size={14}
                            className={`text-gray-400 group-hover:text-purple-500 transition-transform duration-300 ${isKeywordOpen ? 'rotate-0' : '-rotate-90'}`}
                        />
                    </div>
                </div>

                <div className={`flex flex-wrap gap-1 transition-all duration-300 overflow-hidden ${isKeywordOpen ? 'max-h-[300px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {SIDEBAR_KEYWORDS.map((kw) => {
                        const isSelected = selectedKeywords.includes(kw);
                        return (
                            <button
                                key={kw}
                                onClick={() => toggleKeyword(kw)}
                                className={`px-2 py-1 rounded text-[9px] font-bold transition ${isSelected
                                    ? 'bg-pink-500 text-white shadow-md'
                                    : brand.theme === 'dark'
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {kw}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 6. 카테고리 링크 + 광고신청 */}
            <div className={`rounded-xl border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer group"
                    onClick={() => setIsAdProductOpen(!isAdProductOpen)}
                >
                    <h4 className={`text-sm font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <span className="text-purple-600">광고상품</span> 바로가기
                    </h4>
                    <ChevronDown
                        size={14}
                        className={`text-gray-400 group-hover:text-purple-500 transition-transform duration-300 ${isAdProductOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                </div>

                <div className={`transition-all duration-300 overflow-hidden ${isAdProductOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {CATEGORY_LINKS.map((cat, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center justify-between px-3 py-2.5 border-t ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}
                        >
                            <div className="flex items-center gap-2">
                                <cat.icon size={14} className={cat.color} />
                                <span className={`text-[11px] font-bold ${brand.theme === 'dark' ? 'text-gray-200' : 'text-black'}`}>{cat.label}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAdProductOpen(false); // Can auto-close on click
                                    onPaymentClick(cat.tier);
                                }}
                                className="px-2 py-1 bg-gray-100 hover:bg-pink-100 text-gray-500 hover:text-pink-600 rounded text-[9px] font-bold transition"
                            >
                                광고신청
                            </button>
                        </div>
                    ))}
                </div>
            </div>


            {/* 8. 광고 슬롯 2 - 코코알바 광고입전상담 */}
            <div
                onClick={() => router.push('/customer-center?tab=inquiry')}
                className="group relative h-[180px] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700"></div>
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
                </div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center p-4">
                    <p className="text-xs font-black text-white/70 tracking-widest mb-1 uppercase">
                        COCOALBA OFFICIAL
                    </p>
                    <h4 className="text-[24px] font-black mb-1 drop-shadow-md tracking-tighter">
                        광고입점상담
                    </h4>
                    <div className="w-10 h-1 bg-white/40 rounded-full my-3" />
                    <p className="text-[20px] font-black text-amber-300 drop-shadow-lg">
                        {'<1:1문의>'}
                    </p>
                </div>
            </div>

            {/* 9. 광고 슬롯 3 - 코코알바 광고입점상담 (스타일 2) */}
            <div
                onClick={() => router.push('/customer-center?tab=inquiry')}
                className="group relative h-[180px] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-all border-2 border-white/10"
            >
                <div className="absolute inset-0 bg-slate-950"></div>
                <div className="absolute top-3 right-3 text-xl opacity-30 animate-pulse">💎</div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center p-4">
                    <p className="text-[14px] font-bold text-gray-400 mb-2">프리미엄 채용 안내</p>
                    <h4 className="text-[20px] font-black text-white mb-4 tracking-tighter">
                        코코알바 광고상담
                    </h4>
                    <div className="bg-pink-600 text-white px-5 py-2 rounded-full text-xs font-black shadow-[0_0_15px_rgba(219,39,119,0.5)] active:scale-95 transition-all">
                        {'<1:1문의 바로가기>'}
                    </div>
                </div>
            </div>

            {/* 7. 고객지원센터 (최하단 이동) */}
            <div className={`py-2.5 px-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-xs font-black flex items-center gap-1 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <Phone size={12} />
                        고객지원센터
                    </h4>
                    <button
                        onClick={() => router.push('/?page=support')}
                        className="text-[10px] text-gray-400 hover:text-purple-600 flex items-center gap-0.5 transition"
                    >
                        MORE <ChevronRight size={10} />
                    </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-black text-black">
                        TALK
                    </div>
                    <div>
                        <p className={`text-xs font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            CocoAlba
                        </p>
                        <p className="text-lg font-black text-purple-600">1544-5568</p>
                    </div>
                </div>
                <p className="text-[9px] text-gray-500 mb-2">평일 09:30~19:00 점심 12:00~13:30<br />*공휴일 토,일은 근무하지 않습니다.</p>
                <div className="flex gap-2 text-[10px]">
                    <button
                        onClick={() => router.push('/?page=faq')}
                        className={`hover:text-purple-600 transition ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-50'}`}
                    >
                        ➤ FAQ 도움말
                    </button>
                    <button
                        onClick={() => router.push('/?page=inquiry')}
                        className={`hover:text-purple-600 transition ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-50'}`}
                    >
                        ➤ 광고문의 & 일반문의
                    </button>
                </div>
            </div>
        </div >
    );
}
