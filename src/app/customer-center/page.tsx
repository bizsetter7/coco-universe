'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
    Headphones,
    ChevronDown,
    ChevronUp,
    PhoneCall,
    MessageSquare,
    ArrowLeft,
    Home,
    Megaphone,
    Search,
    ShoppingBag,
    HelpCircle,
    Info,
    CheckCircle2,
    Briefcase,
    UserCheck,
    ArrowRight,
    MessageCircle,
    Clock,
    FileText,
    Star,
    Zap,
    Crown
} from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';

// --- Mock Data ---
const NOTICES = [
    { id: 5, title: '[안내] PC버전 사이드배너 광고 노출 시스템 도입 안내', date: '2026-01-25', isNew: true, category: '공지' },
    { id: 4, title: '[공지] 여성 전용 1:1 실시간 채팅 상담 상담원 증설 안내', date: '2026-01-15', isNew: true, category: '공지' },
    { id: 3, title: '[안내] 프리미엄 광고 "Grand Tier" 서비스 개편 및 혜택 안내', date: '2026-01-10', isNew: false, category: '점검' },
    { id: 2, title: '[공지] 허위 구인 공고 근절을 위한 자격 증명 시스템 업데이트', date: '2025-12-28', isNew: false, category: '공지' },
    { id: 1, title: '[이벤트] 신규 가입 업소 대상 3개월 무료 광고 이벤트 (진행중)', date: '2025-12-20', isNew: false, category: '이벤트' },
];

const FAQS = [
    { id: 1, question: '광고비 결제는 어떻게 하나요?', answer: '현재 무통장 입금과 카드 결제를 지원하고 있습니다. 마이페이지 > 광고관리에서 결제 수단을 선택해주세요.' },
    { id: 2, question: '게시글이 삭제되었어요.', answer: '커뮤니티 운영 정책에 위반되는 게시글(욕설, 비방, 광고 등)은 관리자에 의해 예고 없이 삭제될 수 있습니다.' },
    { id: 3, question: '비밀번호를 잊어버렸어요.', answer: '로그인 화면 하단의 "비밀번호 찾기"를 이용해주세요. 이메일 인증 후 재설정이 가능합니다.' },
    { id: 4, question: '업소 회원 승인은 얼마나 걸리나요?', answer: '사업자등록증 제출 후 영업일 기준 24시간 이내에 승인 처리가 완료됩니다.' },
    { id: 5, question: '이력서 열람권이 무엇인가요?', answer: '광고를 등록한 사장님들께 제공되는 혜택으로, 구직자들의 이력서를 사전에 확인하고 개별 면접 제의를 할 수 있는 권한입니다.' },
];

const AD_TIERS = [
    {
        id: 'grand',
        name: 'Grand Premium',
        icon: <Crown className="text-amber-500" />,
        price: '300,000원 / 1개월',
        benefits: ['메인 페이지 최상단 고정 노출', '지역별 검색 리스트 1순위 노출', '블링블링 효과 및 굵은 폰트 적용', '인재열람권 무제한 제공']
    },
    {
        id: 'premium',
        name: 'Premium',
        icon: <Zap className="text-pink-500" />,
        price: '150,000원 / 1개월',
        benefits: ['지역별 검색 리스트 상단 노출', '인증 마크(Shield) 부여', '강조 색상 텍스트 적용', '실시간 채팅 지원']
    },
    {
        id: 'basic',
        name: 'Basic Ad',
        icon: <Star className="text-gray-400" />,
        price: '50,000원 / 1개월',
        benefits: ['지역별 리스트 일반 노출', '기본 업소 정보 제공', '전화/카톡 연결 버튼 활성']
    },
];

export default function CustomerCenterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">로딩 중...</div>}>
            <CustomerCenterContent />
        </Suspense>
    );
}

function CustomerCenterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const brand = useBrand();

    // URL 파라미터로부터 탭 ID 실시간 도출 (Resilience 강화)
    const activeTab = React.useMemo(() => {
        if (typeof window === 'undefined') return '공지사항';
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'notice') return '공지사항';
        if (tab === 'ad') return '광고안내';
        if (tab === 'guide') return '이용방법';
        if (tab === 'faq') return '자주묻는질문';
        if (tab === 'inquiry') return '1:1문의';
        return '공지사항';
    }, [searchParams]);

    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    // 탭 변경 시 URL 강제 동기화
    const handleTabChange = (tabName: string) => {
        const params = new URLSearchParams(window.location.search);
        let tabParam = 'notice';
        if (tabName === '공지사항') tabParam = 'notice';
        else if (tabName === '광고안내') tabParam = 'ad';
        else if (tabName === '이용방법') tabParam = 'guide';
        else if (tabName === '자주묻는질문') tabParam = 'faq';
        else if (tabName === '1:1문의') tabParam = 'inquiry';

        params.set('tab', tabParam);
        window.history.pushState({}, '', `${pathname}?${params.toString()}`);

        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            window.dispatchEvent(new CustomEvent('sidebar-warp'));
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    const primaryBgStyle = { backgroundColor: brand.primaryColor };

    const TABS = [
        { id: '공지사항', icon: <Megaphone size={16} /> },
        { id: '광고안내', icon: <ShoppingBag size={16} /> },
        { id: '이용방법', icon: <Info size={16} /> },
        { id: '자주묻는질문', icon: <HelpCircle size={16} /> },
        { id: '1:1문의', icon: <MessageSquare size={16} /> },
    ];

    return (
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} pb-20`}>
            {/* [Fixed Mastery] Header */}
            <header className={`fixed top-0 left-0 right-0 z-[60] border-b ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'} h-14`}>
                <div className="max-w-[1020px] mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-800 hover:text-black transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1
                            onClick={() => router.push('/')}
                            className="text-lg md:text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <span className="text-pink-600">■</span> 고객지원센터
                        </h1>
                    </div>
                    <button onClick={() => router.push('/')} className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <Home size={24} />
                    </button>
                </div>
            </header>

            <main className="max-w-[1020px] mx-auto px-4 pt-[80px] md:pt-[100px]">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Mobile Nav (Sticky 지원) */}
                    <aside className="md:w-64 shrink-0 sticky top-14 md:top-[80px] h-fit md:h-fit z-[45]">
                        <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden`}>
                            <div className="hidden md:block p-5 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-[15px] text-gray-900 dark:text-gray-100 font-black uppercase tracking-widest">MENU</p>
                            </div>
                            {/* Mobile Grid Layout vs Desktop List Layout */}
                            <nav className="grid grid-cols-2 md:flex md:flex-col overflow-x-auto md:overflow-visible scrollbar-hide">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex flex-col md:flex-row items-center md:items-start md:gap-4 px-4 py-4 md:px-6 md:py-5 text-[13px] md:text-sm font-black transition-all whitespace-nowrap border-b border-r md:border-r-0 md:border-b-0 md:border-l-4 ${activeTab === tab.id
                                            ? 'bg-pink-50 text-pink-600 border-pink-500 dark:bg-pink-900/20'
                                            : 'text-gray-600 border-gray-100 md:border-transparent hover:text-gray-900 dark:hover:text-white dark:border-gray-700'}`}
                                    >
                                        <div className={`mb-1 md:mb-0 ${activeTab === tab.id ? 'text-pink-600' : 'text-gray-400'}`}>
                                            {tab.icon}
                                        </div>
                                        {tab.id}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Customer Service Box (Desktop Only) */}
                        <div className={`hidden md:block mt-6 p-7 rounded-[32px] border-2 border-gray-900 bg-white dark:bg-gray-800 shadow-xl`}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gray-900">
                                    <PhoneCall size={20} />
                                </div>
                                <span className="font-black text-black dark:text-white text-lg">고객센터</span>
                            </div>
                            <p className="text-3xl font-black mb-2 text-black dark:text-white tracking-tighter">1544-5568</p>
                            <p className="text-[13px] text-black dark:text-gray-200 leading-relaxed font-black">
                                평일 09:30 ~ 19:00<br />
                                점심 12:00 ~ 13:30<br />
                                <span className="text-pink-600 font-black mt-1 block">공휴일 / 주말 휴무</span>
                            </p>
                            <a href="https://t.me/your_telegram" className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-sky-500 text-white rounded-2xl text-sm font-black hover:bg-sky-600 transition shadow-lg">
                                <MessageCircle size={18} /> 텔레그렘 실시간 상담
                            </a>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 pb-20">
                        {/* 1. Notice Board */}
                        {activeTab === '공지사항' && (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">공지사항</h2>
                                    <span className="text-xs bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 px-3 py-1 rounded-full font-black">총 {NOTICES.length}건</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                    {NOTICES.map((notice, idx) => (
                                        <div
                                            key={notice.id}
                                            className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${idx !== NOTICES.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`px-2.5 py-1 rounded text-[11px] font-black ${notice.category === '공지' ? 'bg-blue-600 text-white' : notice.category === '점검' ? 'bg-amber-500 text-white' : 'bg-pink-600 text-white'}`}>
                                                    {notice.category}
                                                </span>
                                                <span className={`text-[15px] font-black truncate max-w-[220px] sm:max-w-md ${notice.isNew ? 'text-gray-900 dark:text-gray-100' : 'text-gray-800 dark:text-gray-300'}`}>
                                                    {notice.title}
                                                </span>
                                                {notice.isNew && <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>}
                                            </div>
                                            <span className="text-xs text-gray-600 font-bold flex items-center gap-1.5">
                                                <Clock size={16} /> {notice.date}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Ad Guide: Mobile Detox Design */}
                        {activeTab === '광고안내' && (
                            <div className="space-y-8">
                                <div className="text-center py-12 bg-gray-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden border border-gray-800">
                                    <div className="absolute top-0 right-0 p-10 opacity-10">
                                        <Zap size={150} strokeWidth={3} />
                                    </div>
                                    <h2 className="text-3xl font-black mb-3 tracking-tighter">효과적인 구인의 시작 🚀</h2>
                                    <p className="text-gray-100 text-sm font-black tracking-tight opacity-90">가장 확실한 구인은 {brand.name} 프리미엄 광고와 함께하세요.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {AD_TIERS.map((tier) => (
                                        <div key={tier.id} className={`bg-white dark:bg-gray-800 p-8 rounded-[32px] border-2 shadow-sm flex flex-col transition-transform hover:scale-[1.02] ${tier.id === 'grand' ? 'border-amber-400' : 'border-gray-200 dark:border-gray-700'}`}>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl shadow-inner">
                                                    {tier.icon}
                                                </div>
                                                {tier.id === 'grand' && <span className="bg-amber-400 text-white text-[11px] px-3 py-1 rounded-full font-black">TOP TIAR</span>}
                                            </div>
                                            <h3 className="text-xl font-black mb-2 text-gray-900 dark:text-white">{tier.name}</h3>
                                            <p className="text-red-600 font-black text-lg mb-8">{tier.price}</p>

                                            <div className="flex-1 space-y-4 mb-8">
                                                {tier.benefits.map((benefit, i) => (
                                                    <p key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2.5 font-bold">
                                                        <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
                                                        {benefit}
                                                    </p>
                                                ))}
                                            </div>

                                            <button className={`w-full py-4 rounded-2xl text-sm font-black transition ${tier.id === 'grand' ? 'bg-amber-400 text-white shadow-xl shadow-amber-100/50 hover:bg-amber-500' : 'bg-gray-900 text-white hover:bg-black dark:bg-gray-700'}`}>
                                                광고 신청하기
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Sidebar Ad Card Section (No Table for Mobile) */}
                                <div className="bg-white dark:bg-gray-800 rounded-[40px] border-2 border-gray-100 dark:border-gray-800 p-8 md:p-10 shadow-sm space-y-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/20 rounded-[22px] flex items-center justify-center text-pink-600 shadow-inner">
                                            <Zap size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">사이드 배너 광고</h3>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-black">PC/모바일 공통 고정 노출 상품</p>
                                        </div>
                                    </div>

                                    {/* Responsive Card Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {[
                                            { pos: '좌측 고정 배너', type: 'PC 스크롤 고정형', size: '120 x 600', price: '500,000원' },
                                            { pos: '우측 고정 배너', type: 'PC 스크롤 고정형', size: '120 x 600', price: '500,000원' },
                                            { pos: '모바일 상단 롤링', type: '메인 상단 롤링형', size: '720 x 150', price: '300,000원' },
                                        ].map((row, i) => (
                                            <div key={i} className="p-7 rounded-[30px] bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 flex flex-col justify-between group hover:border-pink-500 transition-colors">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-lg font-black text-gray-900 dark:text-white">{row.pos}</span>
                                                        <span className="text-[10px] bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-bold text-gray-900">{row.size}</span>
                                                    </div>
                                                    <p className="text-xs font-black text-gray-700 dark:text-gray-400">{row.type}</p>
                                                </div>
                                                <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700">
                                                    <p className="text-[10px] text-gray-500 font-black mb-1 uppercase tracking-widest">Montly Pricing</p>
                                                    <p className="text-2xl font-black text-pink-600">{row.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-6 bg-pink-50/50 dark:bg-pink-900/10 rounded-3xl flex items-start gap-4 border border-pink-100/50 dark:border-pink-900/30">
                                            <Info size={20} className="text-pink-600 shrink-0 mt-0.5" />
                                            <p className="text-[13px] text-gray-900 dark:text-gray-300 leading-relaxed font-bold">
                                                <strong className="text-pink-600">사이드 배너 특전:</strong><br />
                                                배너 진행 시 지역 상단 우대등록 및 강조 효과를 무료로 적용해 드립니다.
                                            </p>
                                        </div>
                                        <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl flex items-start gap-4 border border-indigo-100/50 dark:border-indigo-900/30">
                                            <Megaphone size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                                            <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed font-black">
                                                <strong className="text-indigo-600">한정 구좌 운영:</strong><br />
                                                클린한 구인 환경을 위해 매월 한정 수량만 판매되며, 연장 우선순위가 적용됩니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Usage Guide */}
                        {activeTab === '이용방법' && (
                            <div className="space-y-12">
                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-8 bg-pink-600 rounded-full shadow-lg shadow-pink-200"></div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Job-Seeker Guide</h3>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { step: '01', title: '회원가입', icon: <UserCheck />, desc: 'SNS 연동 간편 가입' },
                                            { step: '02', title: '이력서 등록', icon: <FileText />, desc: '자유 형식의 강점 어필' },
                                            { step: '03', title: '업소 서칭', icon: <Search />, desc: '맞춤 필터링 시스템' },
                                            { step: '04', title: '1:1 상담', icon: <MessageSquare />, desc: '안심 면접을 위한 소통' },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-[30px] border border-gray-200 dark:border-gray-700 text-center relative overflow-hidden group hover:shadow-xl transition-all">
                                                <span className="absolute -top-3 -left-3 text-5xl font-black text-gray-50 dark:text-gray-700 group-hover:text-pink-50/50 transition-colors pointer-events-none">{item.step}</span>
                                                <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 shadow-inner">
                                                    {item.icon}
                                                </div>
                                                <h4 className="font-black text-[15px] mb-1 relative z-10 text-gray-900 dark:text-white">{item.title}</h4>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-400 relative z-10 font-bold">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-8 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Employer Guide</h3>
                                    </div>
                                    <div className="bg-gray-900 dark:bg-gray-800 p-10 rounded-[45px] text-white shadow-2xl space-y-10">
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="w-24 h-24 bg-white/10 text-blue-400 rounded-[30px] flex items-center justify-center shrink-0 border border-white/10">
                                                <Briefcase size={40} />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h4 className="text-xl font-black mb-2 tracking-tight">사장님, 안심하고 이용하세요!</h4>
                                                <p className="text-sm text-gray-400 font-bold leading-relaxed">철저한 사업자 인증을 통해 클린하고 신뢰할 수 있는 구인 공고 문화를 만들어갑니다.</p>
                                            </div>
                                            <button className="md:ml-auto px-10 py-5 bg-blue-600 text-white rounded-[22px] text-base font-black shadow-2xl shadow-blue-900/50 hover:bg-blue-700 transition">
                                                사업자 인증하러 가기
                                            </button>
                                        </div>
                                        <div className="h-px bg-white/10 w-full" />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                            {[
                                                { num: '1', title: '상품 선택', sub: '효율적인 광고 상품을 직접 픽업하세요.' },
                                                { num: '2', title: '공고 등록', sub: '상세한 업소 정보는 채용 성공률을 높입니다.' },
                                                { num: '3', title: '컨택 & 매칭', sub: '열람권을 통해 적합한 인재를 먼저 선점하세요.' }
                                            ].map((box, i) => (
                                                <div key={i} className="flex gap-5">
                                                    <span className="text-4xl font-black text-blue-500/30">{box.num}</span>
                                                    <div>
                                                        <h5 className="font-black text-lg mb-1">{box.title}</h5>
                                                        <p className="text-sm text-gray-400 font-bold leading-relaxed">{box.sub}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* 4. FAQ */}
                        {activeTab === '자주묻는질문' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-8">자주 묻는 질문</h2>
                                <div className="space-y-4">
                                    {FAQS.map(faq => (
                                        <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-[28px] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all">
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className="w-full p-7 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <span className="font-black text-[15px] text-gray-900 dark:text-white flex gap-4 pr-4">
                                                    <span className="text-pink-600">Q.</span> {faq.question}
                                                </span>
                                                {expandedFaq === faq.id ? <ChevronUp size={24} className="text-gray-900 dark:text-white" /> : <ChevronDown size={24} className="text-gray-400" />}
                                            </button>
                                            {expandedFaq === faq.id && (
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-8 border-t border-gray-100 dark:border-gray-700 text-[15px] text-gray-800 dark:text-gray-300 leading-loose font-bold">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. 1:1 Inquiry */}
                        {activeTab === '1:1문의' && (
                            <div className="space-y-10">
                                <div className="bg-white dark:bg-gray-800 p-10 rounded-[45px] border-2 border-gray-900 shadow-xl flex flex-col md:flex-row items-center gap-8">
                                    <div className="p-5 bg-gray-100 dark:bg-gray-900 rounded-[30px] text-gray-900 shadow-inner">
                                        <MessageCircle size={36} />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">무엇을 도와드릴까요?</h3>
                                        <p className="text-sm text-gray-900 dark:text-gray-400 leading-relaxed font-black">궁금한 점을 남겨주시면 24시간 이내에 전문가가 답변을 드립니다.</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 p-10 rounded-[45px] border border-gray-200 dark:border-gray-700 shadow-sm space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-xs font-black text-gray-900 dark:text-white mb-3 ml-2 uppercase tracking-widest">문의 유형 <span className="text-pink-600">*</span></label>
                                            <select className="w-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none appearance-none cursor-pointer">
                                                <option>광고 상품 문의 (사장님)</option>
                                                <option>채용 관련 문의 (구직자)</option>
                                                <option>신고 및 운영 정책</option>
                                                <option>기타 제휴 문의</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-900 dark:text-white mb-3 ml-2 uppercase tracking-widest">연락처/회신처 <span className="text-pink-600">*</span></label>
                                            <input type="text" placeholder="회신 받을 번호나 메일을 적어주세요" className="w-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-900 dark:text-white mb-3 ml-2 uppercase tracking-widest">문의 제목 <span className="text-pink-600">*</span></label>
                                        <input type="text" placeholder="핵심 내용을 한 문장으로 요약해주세요" className="w-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-900 dark:text-white mb-3 ml-2 uppercase tracking-widest">상세 내용 <span className="text-pink-600">*</span></label>
                                        <textarea placeholder="구체적인 상황을 적어주시면 더 정확한 답변이 가능합니다." className="w-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-[35px] p-8 text-sm font-black h-60 resize-none focus:ring-4 focus:ring-pink-500/10 outline-none" />
                                    </div>

                                    <button
                                        className="w-full bg-gray-900 text-white font-black py-6 rounded-[28px] text-xl shadow-2xl transition-all hover:bg-black hover:scale-[1.01] active:scale-95 outline-none"
                                        onClick={() => alert('접수되었습니다. 담당자 확인 후 빠르게 답변 드리겠습니다!')}
                                    >
                                        상담 등록하기
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Customer Service Box (Mobile Lower Position) */}
                        <div className={`md:hidden mt-10 p-8 rounded-[40px] border-4 border-gray-900 bg-white dark:bg-gray-800 shadow-2xl`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gray-900">
                                    <PhoneCall size={24} />
                                </div>
                                <span className="font-black text-gray-900 dark:text-white text-xl">고객센터</span>
                            </div>
                            <p className="text-4xl font-black mb-3 text-gray-900 dark:text-white tracking-tighter">1544-5568</p>
                            <p className="text-[14px] text-gray-900 dark:text-gray-200 leading-relaxed font-black">
                                평일 09:30 ~ 19:00 / 점심 12:00 ~ 13:30<br />
                                <span className="text-pink-600 font-black mt-2 block">공휴일 / 주말 휴무 (텔레그램 상시 대기)</span>
                            </p>
                            <a href="https://t.me/your_telegram" className="mt-8 flex items-center justify-center gap-3 w-full py-5 bg-sky-500 text-white rounded-[24px] text-base font-black hover:bg-sky-600 transition shadow-xl">
                                <MessageCircle size={20} /> 텔레그렘 실시간 상담
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
