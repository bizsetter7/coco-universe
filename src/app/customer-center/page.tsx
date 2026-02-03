'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { Footer } from '@/components/layout/Footer';
import {
    Headphones,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
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
    Crown,
    X,
    Menu,
    ShoppingCart,
    Check,
    MapPin,
    Smartphone,
    Tablet,
    Monitor
} from 'lucide-react';
import { usePreventLeave } from '@/hooks/usePreventLeave';
import { PaymentPopup } from '@/components/home/PaymentPopup';

// --- Mock Data ---
const NOTICES = [
    { id: 6, title: '[중요] 서비스 전면 개편 및 광고 상품 단가 확정 안내', date: '2026-01-27', isNew: true, category: '공지' },
    { id: 5, title: '[안내] PC버전 사이드배너 광고 노출 시스템 도입 안내', date: '2026-01-25', isNew: true, category: '공지' },
    { id: 4, title: '[공지] 여성 전용 1:1 실시간 채팅 상담 상담원 증설 안내', date: '2026-01-15', isNew: true, category: '공지' },
    { id: 3, title: '[안내] 프리미엄 광고 "Grand Tier" 서비스 개편 및 혜택 안내', date: '2026-01-10', isNew: false, category: '점검' },
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
        name: (<span>그랜드 <span className="font-normal">(Tier 1)</span></span>),
        icon: <Crown className="text-amber-600" />,
        price: '350,000원 / 30일',
        benefits: ['PC+모바일 통합 노출 패키지', '메인 최상단 0순위 고정 (Glow)', '전 지역 검색 결과 압도적 선점', '인재열람권 + 강조옵션 풀패키지']
    },
    {
        id: 'premium',
        name: (<span>프리미엄 <span className="font-normal">(Tier 2)</span></span>),
        icon: <Star className="text-purple-500" />,
        price: '200,000원 / 30일',
        benefits: ['PC+모바일 통합 노출 패키지', '메인 상단 전략적 노출', '보라색 강조 보더', '제목 강조/아이콘 효과 기본']
    },
    {
        id: 'deluxe',
        name: (<span>디럭스 <span className="font-normal">(Tier 3)</span></span>),
        icon: <Zap className="text-blue-500" />,
        price: '180,000원 / 30일',
        benefits: ['PC+모바일 통합 노출 패키지', '블루 보더 / 메인 중앙 노출', '자동 점프 30회 지원']
    },
    {
        id: 'basic',
        name: (<span>베이직(줄광고) <span className="font-normal">(Tier 7)</span></span>),
        icon: <FileText className="text-gray-400" />,
        price: '60,000원 / 30일',
        benefits: ['PC+모바일 통합 노출 패키지', '일반 리스트 기본 노출', '업소 기본 정보 제공', '자동 점프 10회 지원']
    },
];

const DETAILED_PRICING = [
    { type: '메인 독점', name: '1번 - 그랜드 (Grand)', d30: 350000, d60: 630000, d90: 840000, benefit: (<span>PC+모바일 통합 노출<br />Glow 효과<br />전 지역 검색 결과<br />압도적 선점</span>) },
    { type: '메인 상단', name: '2번 - 프리미엄 (Premium)', d30: 200000, d60: 360000, d90: 480000, benefit: (<span>PC+모바일 통합 노출<br />보라색 보더 / 상단 고정</span>) },
    { type: '메인 일반', name: '3번 - 디럭스 (Deluxe)', d30: 180000, d60: 324000, d90: 432000, benefit: (<span>PC+모바일 통합 노출<br />블루 보더 / 메인 중앙</span>) },
    { type: '리스트 상단', name: '4번 - 스페셜 (Special)', d30: 150000, d60: 270000, d90: 360000, benefit: (<span>PC+모바일 통합 노출<br />핑크 보더 / 목록 상단</span>) },
    { type: '리스트 강조', name: '5번 - 급구/추천 (Urgent/Rec)', d30: 120000, d60: 216000, d90: 288000, benefit: (<span>PC+모바일 통합 노출<br />빨간 제목 / 가독성 강화</span>) },
    { type: '리스트 네이티브', name: '6번 - 네이티브 (Native)', d30: 100000, d60: 180000, d90: 240000, benefit: (<span>PC+모바일 통합노출<br />네이티브 스타일</span>) },
    { type: '리스트 기본', name: '7번 - 베이직/줄광고 (Basic)', d30: 60000, d60: 100000, d90: 140000, benefit: (<span>PC+모바일 통합 노출<br />일반 리스트</span>) },
    { type: '리스트 옵션', name: '8번 - 강조옵션 (Icon/Highlight)', d30: 30000, d60: 55000, d90: 70000, benefit: (<span>아이콘(10종) / 형광펜(8색)<br />선택 가능</span>) },
];

export default function CustomerCenterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">로딩 중...</div>}>
            <CustomerCenterContent />
        </Suspense>
    );
}

// Simplified Ad Type Description Component
const ExposureItem = ({ rank, desc, onArrowClick }: { rank: string, desc: string, onArrowClick?: () => void }) => {
    const brand = useBrand();

    // 등급별 테마 설정
    const getTheme = (rank: string) => {
        const isDark = brand.theme === 'dark';
        switch (rank) {
            case 'GRAND': return {
                badge: 'bg-amber-500 text-white shadow-amber-200',
                box: isDark ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-100',
                text: isDark ? 'text-amber-200' : 'text-amber-900'
            };
            case 'PREMIUM': return {
                badge: 'bg-purple-600 text-white shadow-purple-200',
                box: isDark ? 'bg-purple-900/10 border-purple-900/30' : 'bg-purple-50 border-purple-100',
                text: isDark ? 'text-purple-200' : 'text-purple-900'
            };
            case 'DELUXE': return {
                badge: 'bg-blue-600 text-white shadow-blue-200',
                box: isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100',
                text: isDark ? 'text-blue-200' : 'text-blue-900'
            };
            case 'SPECIAL': return {
                badge: 'bg-pink-600 text-white shadow-pink-200',
                box: isDark ? 'bg-pink-900/10 border-pink-900/30' : 'bg-pink-50 border-pink-100',
                text: isDark ? 'text-pink-200' : 'text-pink-900'
            };
            case 'NATIVE': return {
                badge: 'bg-emerald-600 text-white shadow-emerald-200',
                box: isDark ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100',
                text: isDark ? 'text-emerald-200' : 'text-emerald-900'
            };
            default: return {
                badge: 'bg-gray-600 text-white shadow-gray-200',
                box: isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100',
                text: isDark ? 'text-gray-300' : 'text-gray-900'
            };
        }
    };

    const theme = getTheme(rank);

    return (
        <div
            onClick={() => onArrowClick && onArrowClick()}
            className={`px-3 py-2 md:px-5 md:py-2.5 border-b lg:border-b last:border-b-0 ${theme.box} transition-all duration-300 hover:brightness-95 group min-h-[65px] flex items-center justify-center lg:justify-start lg:min-h-[55px] cursor-pointer`}
        >
            <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 w-full text-center lg:text-left">
                <div className="shrink-0 w-full lg:w-[80px] flex justify-center">
                    <span className={`inline-block px-2 py-0.5 lg:px-2.5 lg:py-1 ${theme.badge} text-[8px] lg:text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm group-hover:scale-105 lg:group-hover:scale-110 transition-transform w-auto lg:w-full text-center`}>
                        {rank}
                    </span>
                </div>
                <div className="flex-1">
                    <p className={`text-[10px] md:text-[11px] lg:text-[11px] font-bold lg:font-medium leading-tight break-keep ${theme.text}`}>
                        {desc}
                    </p>
                </div>
                <div className="hidden lg:block">
                    <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${theme.text} opacity-50 group-hover:opacity-100`} />
                </div>
            </div>
        </div>
    );
};

function CustomerCenterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const brand = useBrand();

    // SSR 안전한 탭 상태 관리
    const [activeTab, setActiveTab] = useState('공지사항');
    const [isMounted, setIsMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 쿼리 스트링 변경 감지하여 탭 전환 및 스크롤 제어
    useEffect(() => {
        if (!isMounted) return;

        const tab = searchParams.get('tab');
        if (tab) {
            let targetTab = '공지사항';
            if (tab === 'notice') targetTab = '공지사항';
            else if (tab === 'ad') targetTab = '광고안내';
            else if (tab === 'guide') targetTab = '이용방법';
            else if (tab === 'faq') targetTab = '자주묻는질문';
            else if (tab === 'inquiry') targetTab = '1:1문의';
            else if (tab === 'policy') targetTab = '약관및정책';

            if (activeTab !== targetTab) {
                setActiveTab(targetTab);
            }
            // 탭 변경 시 혹은 URL 이동 시 항상 최상단으로 이동 (떨림 방지)
            window.scrollTo(0, 0);
        }
    }, [searchParams, isMounted]);

    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

    // 사장님 전용 상품 안내 팝업 상태 (PaymentPopup 연동)
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [paymentInitialTier, setPaymentInitialTier] = useState('grand');

    // Inquiry states
    const [inquiryContact, setInquiryContact] = useState('');
    const [inquiryTitle, setInquiryTitle] = useState('');
    const [inquiryContent, setInquiryContent] = useState('');

    const isDirty = activeTab === '1:1문의' && (inquiryContact !== '' || inquiryTitle !== '' || inquiryContent !== '');
    usePreventLeave(isDirty);

    useEffect(() => {
        if (selectedImage || isPaymentPopupOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [selectedImage, isPaymentPopupOpen]);

    // 탭 변경 시 URL만 변경 (상태는 useEffect가 searchParams를 감지하여 변경함)
    const handleTabChange = (tabName: string) => {
        setIsMobileMenuOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        let tabParam = 'notice';
        if (tabName === '공지사항') tabParam = 'notice';
        else if (tabName === '광고안내') tabParam = 'ad';
        else if (tabName === '이용방법') tabParam = 'guide';
        else if (tabName === '자주묻는질문') tabParam = 'faq';
        else if (tabName === '1:1문의') tabParam = 'inquiry';
        else if (tabName === '약관및정책') tabParam = 'policy';

        params.set('tab', tabParam);
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const primaryBgStyle = { backgroundColor: brand.primaryColor };

    const TABS = [
        { id: '공지사항', icon: <Megaphone size={16} /> },
        { id: '광고안내', icon: <ShoppingBag size={16} /> },
        { id: '이용방법', icon: <Info size={16} /> },
        { id: '자주묻는질문', icon: <HelpCircle size={16} /> },
        { id: '1:1문의', icon: <MessageSquare size={16} /> },
        { id: '약관및정책', icon: <FileText size={16} /> },
    ];

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* [Fixed Mastery] Integrated Sticky Header */}
            <div className="fixed top-0 z-[10000] w-full border-b bg-white dark:bg-gray-800" style={{ left: '50%', transform: 'translateX(-50%)', opacity: 1, visibility: 'visible', overflow: 'visible', display: 'flex', justifyContent: 'center' }}>
                <div className="w-full max-w-[1440px] mx-auto flex items-center justify-center relative">
                    <div className={`w-full max-w-[1280px] h-[56px] flex items-center justify-between px-4 md:backdrop-blur-md ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 md:bg-gray-800/95' : 'bg-white border-gray-100 md:bg-white/95'}`} style={{ zIndex: 9999, opacity: 1, visibility: 'visible', overflow: 'visible', display: 'flex' }}>
                        <div className="flex items-center gap-4">
                            <button onClick={() => {
                                if (isDirty && !window.confirm('작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?')) return;
                                router.back();
                            }} className="py-2 pr-2 text-gray-800 hover:text-black transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                            <h1
                                onClick={() => {
                                    if (isDirty && !window.confirm('작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?')) return;
                                    router.push('/');
                                }}
                                className={`text-[17px] md:text-xl font-black flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                                <span className="w-5 h-5 bg-pink-600 rounded-md flex items-center justify-center text-[10px] text-white shrink-0">CS</span>
                                고객지원센터
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Mobile Hamburger Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 order-2"
                            >
                                {isMobileMenuOpen ? <X size={20} className="text-pink-600" /> : <Menu size={20} className={brand.theme === 'dark' ? 'text-white' : 'text-gray-700'} />}
                            </button>
                            <button onClick={() => {
                                if (isDirty && !window.confirm('작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?')) return;
                                router.push('/');
                            }} className="py-2 pl-2 text-gray-400 hover:text-gray-900 transition-colors">
                                <Home size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 pt-6">
                <div className="flex flex-col md:flex-row gap-8 md:items-start">
                    {/* Sidebar / Mobile Nav (Sticky 지원) */}
                    <aside className="w-full md:w-64 shrink-0 h-fit sticky top-[76px] self-start z-50">
                        <div className={`rounded-2xl md:rounded-3xl shadow-sm md:border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                            {/* PC Title / Mobile Toggle Header */}
                            <div className={`p-4 md:p-5 border-b flex items-center justify-between ${brand.theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                <p className={`text-[13px] font-black uppercase tracking-widest hidden md:block ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-400'}`}>Customer Support</p>
                                {/* Mobile View: Active Tab Display Only */}
                                <div className="md:hidden flex items-center gap-2 text-sm font-black w-full justify-between">
                                    <span className={`${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activeTab}</span>
                                </div>
                            </div>

                            {/* Desktop Nav List (Hidden on mobile) */}
                            <nav className="hidden md:flex flex-col p-2 md:p-0 gap-1 md:gap-0">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`w-full flex items-center justify-start gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-5 text-[13px] md:text-sm font-black whitespace-nowrap rounded-lg md:rounded-none md:border-l-4 ${activeTab === tab.id
                                            ? `bg-pink-50 md:bg-gradient-to-br md:border-pink-500 shadow-sm md:shadow-none ${brand.theme === 'dark' ? 'from-pink-900/20 to-gray-800 text-pink-400 bg-gray-700' : 'from-pink-50 to-white text-pink-600'}`
                                            : `${brand.theme === 'dark' ? 'bg-transparent text-gray-400 hover:text-white' : 'bg-transparent text-gray-500 hover:text-gray-900'} border-transparent`}`}
                                    >
                                        <div className={` ${activeTab === tab.id ? 'text-pink-600' : 'text-gray-300'}`}>
                                            {tab.icon}
                                        </div>
                                        <span>{tab.id}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Customer Service Box (Desktop Only - Mobile version could be added if requested, but for now kept desktop only as per existing logic, but made sure it's inside the sticky aside) */}
                        <div className={`hidden md:block mt-1 p-5 rounded-[32px] border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 shadow-pink-900/10' : 'bg-white border-gray-100 shadow-pink-100/10'} shadow-xl`}>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg bg-pink-600">
                                    <PhoneCall size={20} />
                                </div>
                                <span className={`font-black text-lg ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>고객센터</span>
                            </div>
                            <p className={`text-3xl font-black mb-2 tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1544-5568</p>
                            <p className={`text-[13px] leading-relaxed font-black ${brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                                평일 09:30 ~ 19:00<br />
                                점심 12:00 ~ 13:30<br />
                                <span className="text-pink-600 font-black mt-1 block">공휴일 / 주말 휴무</span>
                            </p>
                            <a href="https://t.me/your_telegram" className="mt-6 flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-black transition shadow-lg">
                                <MessageCircle size={18} /> 텔레그렘 실시간 상담
                            </a>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 pb-20">
                        {/* 1. Notice Board */}
                        {activeTab === '공지사항' && (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between mb-4 pl-6 pr-6">
                                    <h2 className={`text-2xl font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>공지사항</h2>
                                    <span className={`text-xs px-3 py-1 rounded-full font-black ${brand.theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-900'}`}>총 {NOTICES.length}건</span>
                                </div>
                                <div className={`rounded-3xl border overflow-hidden shadow-sm ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    {NOTICES.map((notice, idx) => (
                                        <div
                                            key={notice.id}
                                            className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${brand.theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} ${idx !== NOTICES.length - 1 ? (brand.theme === 'dark' ? 'border-b border-gray-700' : 'border-b border-gray-100') : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className={`px-2.5 py-1 rounded text-[11px] font-black ${notice.category === '공지' ? 'bg-gray-900 text-white' : notice.category === '점검' ? 'bg-gray-400 text-white' : 'bg-pink-600 text-white'}`}>
                                                    {notice.category}
                                                </span>
                                                <span className={`text-[15px] font-black truncate max-w-[220px] sm:max-w-md ${notice.isNew ? (brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900') : (brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800')}`}>
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
                                <div className="text-center py-10 md:py-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-[40px] text-white shadow-xl shadow-pink-200/50 relative overflow-hidden border border-pink-400">
                                    <div className="absolute top-0 right-0 p-10 opacity-10">
                                        <Zap size={150} strokeWidth={3} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tighter text-white">효과적인 구인의 시작 🚀</h2>
                                    <p className="text-pink-50 text-[13px] md:text-sm font-black tracking-tight opacity-90">가장 확실한 구인은 {brand.name} 프리미엄 광고와 함께하세요.</p>
                                </div>

                                {/* Mobile: Horizontal Scroll / Desktop: Grid */}
                                <div className="relative group px-1">
                                    {/* Scroll Buttons (Mobile Only) */}
                                    <button onClick={scrollLeft} className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 shadow-lg rounded-full text-gray-800 border border-gray-100 active:scale-95 transition-transform" aria-label="Previous">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={scrollRight} className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 shadow-lg rounded-full text-gray-800 border border-gray-100 active:scale-95 transition-transform" aria-label="Next">
                                        <ChevronRight size={20} />
                                    </button>

                                    <div ref={scrollContainerRef} className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-hidden -mx-5 px-5 md:mx-0 md:px-0 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide scroll-smooth">
                                        {AD_TIERS.map((tier) => (
                                            <div key={tier.id} className={`flex-none w-[280px] md:w-auto p-6 md:p-8 rounded-[32px] border shadow-sm flex flex-col transition-transform hover:scale-[1.02] active:scale-95 snap-center ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${tier.id === 'grand' ? (brand.theme === 'dark' ? 'border-pink-900/50 shadow-lg shadow-pink-900/20' : 'border-pink-300 shadow-lg shadow-pink-100/50') : (brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100')}`}>
                                                <div className="flex items-center justify-between mb-5 md:mb-6">
                                                    <div className={`p-4 md:p-4 rounded-2xl shadow-inner text-pink-600 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-pink-50'}`}>
                                                        {React.cloneElement(tier.icon as React.ReactElement<{ size?: number }>, { size: 24 })}
                                                    </div>
                                                    {tier.id === 'grand' && <span className="bg-pink-600 text-white text-[10px] md:text-[11px] px-3 py-1 rounded-full font-black uppercase tracking-widest">Top Tier</span>}
                                                </div>
                                                <h3 className={`text-xl md:text-xl font-black mb-1 md:mb-2 tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                                                <p className="text-pink-600 font-black text-lg md:text-lg mb-6 md:mb-8 tracking-tighter leading-none">{tier.price.split(' ')[0]}</p>

                                                <div className="flex-1 space-y-3.5 md:space-y-4 mb-8">
                                                    {tier.benefits.map((benefit, i) => (
                                                        <p key={i} className={`text-xs md:text-xs flex items-start gap-2.5 font-bold leading-relaxed ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}`}>
                                                            <CheckCircle2 size={14} className="text-pink-600 shrink-0 mt-0.5" />
                                                            <span className="">{benefit}</span>
                                                        </p>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => { setIsPaymentPopupOpen(true); setPaymentInitialTier(tier.id); }}
                                                    className={`w-full py-4 rounded-2xl text-sm font-black transition ${tier.id === 'grand' ? 'bg-pink-600 text-white shadow-lg shadow-pink-100/50 hover:bg-pink-700' : `text-white hover:bg-black ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-900'}`}`}
                                                >
                                                    신청하기
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Detailed Pricing Table Section */}
                                <div className={`rounded-[32px] md:rounded-[40px] border p-5 md:p-8 shadow-sm space-y-6 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>상세 단가표</h3>
                                            <p className="text-[12px] md:text-[13px] text-gray-500 font-bold leading-relaxed">
                                                모든 상품은 <span className="text-pink-600">PC+모바일 통합 노출</span>되며, 리전 필터 등 최신 기술이 적용된 전략적 구좌를 제공합니다.
                                            </p>
                                        </div>
                                    </div>

                                    {/* PC View Table */}
                                    <div className="hidden md:block">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className={`border-b-2 ${brand.theme === 'dark' ? 'border-gray-700' : 'border-pink-100'}`}>
                                                    <th className="py-5 text-left text-[13px] font-black text-gray-400 uppercase tracking-widest w-24">구분</th>
                                                    <th className="py-5 text-left text-[13px] font-black text-gray-600 uppercase tracking-widest pl-4">상품명 및 혜택</th>
                                                    <th className="py-5 text-right text-[13px] font-black text-pink-600 uppercase tracking-widest pr-8 pl-8">30일</th>
                                                    <th className={`py-5 text-right text-[13px] font-black uppercase tracking-widest pr-4 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>60일 (10%↓)</th>
                                                    <th className={`py-5 text-right text-[13px] font-black uppercase tracking-widest pr-4 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>90일 (20%↓)</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-700' : 'divide-gray-50'}`}>
                                                {DETAILED_PRICING.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-pink-50/20 transition-colors group">
                                                        <td className="py-3 text-[12px] font-black text-gray-400 group-hover:text-pink-500 transition-colors">{item.type}</td>
                                                        <td className="py-3 pl-4">
                                                            <div className="flex flex-col">
                                                                <span className={`text-[15px] font-black mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                                                                <span className={`text-[11px] text-gray-400 font-bold self-start mt-0.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    {item.benefit}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-right text-[15px] font-black text-pink-600 pr-8 pl-8 tabular-nums whitespace-nowrap">{item.d30.toLocaleString()}원</td>
                                                        <td className={`py-3 text-right text-[15px] font-black pr-4 tabular-nums whitespace-nowrap ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.d60.toLocaleString()}원</td>
                                                        <td className={`py-3 text-right text-[15px] font-black pr-4 tabular-nums whitespace-nowrap ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.d90.toLocaleString()}원</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile View Cards (Remove Scroll) - 2 Columns Grid (Optimized Spacing) */}
                                    <div className="md:hidden grid grid-cols-2 gap-2">
                                        {DETAILED_PRICING.map((item, idx) => (
                                            <div key={idx} className={`p-2.5 rounded-[24px] border flex flex-col justify-between shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                                <div className="space-y-2">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center justify-between mb-0.5">
                                                            <span className="text-[9px] font-black text-pink-600 uppercase">{item.type}</span>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-pink-200"></div>
                                                        </div>
                                                        <h4 className={`text-[13px] font-black leading-tight break-keep ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                                                    </div>

                                                    <div className={`p-1.5 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                                        <p className={`text-[10px] font-bold leading-[1.4] break-keep ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {item.benefit}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className={`mt-3 pt-2.5 border-t space-y-1 font-mono ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                                                    <div className={`flex justify-between items-center px-2 py-1.5 rounded-lg ${brand.theme === 'dark' ? 'bg-pink-900/10' : 'bg-pink-50'}`}>
                                                        <span className="text-[8px] font-black text-pink-400 uppercase">30일</span>
                                                        <span className="text-[11px] font-black text-pink-600 tabular-nums">{item.d30.toLocaleString()}원</span>
                                                    </div>
                                                    <div className="flex justify-between items-center px-2 py-1 rounded-lg">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase">60일</span>
                                                        <span className={`text-[11px] font-black tabular-nums ${brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{item.d60.toLocaleString()}원</span>
                                                    </div>
                                                    <div className="flex justify-between items-center px-2 py-1 rounded-lg">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase">90일</span>
                                                        <span className={`text-[11px] font-black tabular-nums ${brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{item.d90.toLocaleString()}원</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 ${brand.theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                        <p className="text-[11px] md:text-[13px] text-gray-400 font-black">※ 모든 가격 부가세 별도 (VAT 별도)</p>
                                        <p className="text-[11px] md:text-[13px] text-gray-500 font-black">연간 패키지 결제 시 <span className="text-pink-600 font-black">25% 할인 혜택</span></p>
                                    </div>

                                </div>

                                {/* Ad Placement Guide Section - Precise Accordion Implementation */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                                        <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>노출 상세 및 영역 안내</h3>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
                                        {/* Left Side: Accordion Guide */}
                                        <div className="space-y-4">
                                            {[
                                                { id: 'pc_1', title: 'PC 가이드 (1) - 메인/사이드/전체', img: '/images/guide/pc_1.png' },
                                                { id: 'pc_2', title: 'PC 가이드 (2) - 업종별/지역별', img: '/images/guide/pc_2.png' },
                                                { id: 'pc_3', title: 'PC 가이드 (3) - 디럭스/스페셜', img: '/images/guide/pc_3.png' },
                                                { id: 'pc_4', title: 'PC 가이드 (4) - 베이직/네이티브', img: '/images/guide/pc_4.png' },
                                                { id: 'mobile', title: '모바일 가이드 - 통합 레이아웃', img: '/images/guide/모바일.png', isMobile: true }
                                            ].map((item) => (
                                                <div key={item.id} className={`overflow-hidden rounded-2xl border ${brand.theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                                    <button
                                                        onClick={() => setActiveAccordion(activeAccordion === item.id ? null : item.id)}
                                                        className={`w-full p-4 md:p-5 flex items-center justify-between transition-colors ${activeAccordion === item.id ? (brand.theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50') : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${brand.theme === 'dark' ? 'bg-gray-800 text-pink-500' : 'bg-pink-50 text-pink-600'}`}>
                                                                {item.isMobile ? <Smartphone size={16} /> : <Monitor size={16} />}
                                                            </div>
                                                            <h4 className={`text-[13px] md:text-[14px] font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                                        </div>
                                                        {activeAccordion === item.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                                    </button>

                                                    {activeAccordion === item.id && (
                                                        <div className="p-4 animate-in slide-in-from-top-4 duration-300">
                                                            <div
                                                                className={`relative cursor-pointer overflow-hidden rounded-xl border ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} ${item.isMobile ? 'max-w-[180px] mx-auto aspect-[9/16]' : 'aspect-[16/10]'}`}
                                                                onClick={() => setSelectedImage(item.img)}
                                                            >
                                                                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <span className="text-white font-black flex items-center gap-1.5 bg-pink-600 px-3 py-1.5 rounded-full text-[10px] shadow-xl">
                                                                        <Search size={12} /> 확대
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 flex items-center justify-center gap-1.5 text-gray-400 text-[10px] font-bold">
                                                                <Info size={12} /> 클릭 시 확대
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right Side: Product Exposure Item List */}
                                        <div className="lg:sticky lg:top-24 space-y-4">
                                            <div className={`rounded-3xl border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                                <div className={`p-4 border-b ${brand.theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                                    <h4 className={`text-[13px] font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>상품별 상세 노출 요약</h4>
                                                </div>
                                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-px bg-gray-100 dark:bg-gray-800">
                                                    <ExposureItem
                                                        rank="GRAND"
                                                        desc="메인 최상단 특수배너 및 사이드 고정 전 영역 노출"
                                                        onArrowClick={() => setSelectedImage('/images/guide/pc_1.png')}
                                                    />
                                                    <ExposureItem
                                                        rank="PREMIUM"
                                                        desc="업종/지역별 상단 전략적 노출 및 보라색 효과"
                                                        onArrowClick={() => setSelectedImage('/images/guide/pc_1.png')}
                                                    />
                                                    <ExposureItem
                                                        rank="DELUXE"
                                                        desc="메인 중앙 및 리스트 상단 블루 색상 강조"
                                                        onArrowClick={() => setSelectedImage('/images/guide/pc_3.png')}
                                                    />
                                                    <ExposureItem
                                                        rank="SPECIAL"
                                                        desc="리스트 상단 핑크 테두리 강조 가독성 확보"
                                                        onArrowClick={() => setSelectedImage('/images/guide/pc_3.png')}
                                                    />
                                                    <ExposureItem
                                                        rank="BASIC"
                                                        desc="일반 리스트 기본 노출 및 업소 정보 안내"
                                                        onArrowClick={() => setSelectedImage('/images/guide/pc_4.png')}
                                                    />
                                                    <ExposureItem
                                                        rank="NATIVE"
                                                        desc="리스트 중간 삽입형 네이티브 광고 스타일"
                                                        onArrowClick={() => setSelectedImage('/images/guide/pc_4.png')}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-gray-400 font-bold px-2">
                                                ※ 상세 디자인은 가이드라인에 따라 제공됩니다.
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`p-6 rounded-3xl border ${brand.theme === 'dark' ? 'bg-pink-900/10 border-pink-900/30' : 'bg-pink-50/50 border-pink-100'}`}>
                                        <p className={`text-[13px] leading-relaxed font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <strong className="text-pink-600">※ 통합 노출 정책:</strong> 모든 광고 상품은 PC와 모바일 버전에 최적화된 형태로 동시 노출됩니다. 사이드 배너의 경우 PC에서는 스크롤 고정형으로, 모바일에서는 메인 상단 롤링 배너 형태로 전략적 변환 노출됩니다.
                                        </p>
                                    </div>
                                </section>



                                {/* Design Guide Section */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                                        <div className="flex items-center gap-2">
                                            <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>이미지 제작 가이드</h3>
                                        </div>
                                    </div>
                                    <div className={`p-8 md:p-10 rounded-[32px] md:rounded-[45px] border shadow-xl space-y-8 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 shadow-pink-900/10' : 'bg-white border-gray-100 shadow-pink-100/10'}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className={`p-6 md:p-8 rounded-[32px] border ${brand.theme === 'dark' ? 'bg-gray-700/30 border-pink-900/30' : 'bg-pink-50/50 border-pink-100'}`}>
                                                <h4 className={`text-[17px] font-black mb-6 flex items-center gap-2.5 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    <div className="p-2 bg-pink-600 text-white rounded-xl shadow-sm"><Clock size={16} /></div> <span className="whitespace-nowrap">이미지 제작 기반 안내</span>
                                                </h4>
                                                <ul className="space-y-4 text-[13px] md:text-[14px] text-gray-500 font-bold leading-relaxed">
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0"></div>
                                                        <span className="break-keep">상세설명란에 구인 내용을 적어주시면 디자인 작업을 해드립니다.</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0"></div>
                                                        <span className="break-keep">이미지 작업 및 등록은 결제일로부터 <span className="text-gray-900 font-black underline decoration-pink-200 underline-offset-4">영업일 기준 1~2일</span> 소요됩니다.</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0"></div>
                                                        <span className="break-keep">공고는 결제 즉시 작성하신 내용으로 바로 노출됩니다.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className={`p-6 md:p-8 rounded-[32px] border ${brand.theme === 'dark' ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                                                <h4 className={`text-[17px] font-black mb-6 flex items-center gap-2.5 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    <div className={`p-2 rounded-xl shadow-sm ${brand.theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-900 text-white'}`}><CheckCircle2 size={16} /></div> <span className="whitespace-nowrap">수정 및 유의사항</span>
                                                </h4>
                                                <ul className="space-y-4 text-[13px] md:text-[14px] text-gray-500 font-bold leading-relaxed">
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                                                        <span className="break-keep">단순 텍스트(가격, 전번 등) 수정은 공고 기간 내 <span className="text-gray-900 font-black">상시 가능</span>합니다.</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                                                        <span className="break-keep">레이아웃 전체가 변경되는 수정사항은 <span className="text-gray-900 font-black">1회에 한하여</span> 가능합니다.</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                                                        <span className="break-keep">작업된 이미지는 당사 채널 내에서만 사용 가능합니다.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div
                                                onClick={() => handleTabChange('inquiry')}
                                                className="p-6 bg-pink-600 rounded-3xl text-white shadow-lg shadow-pink-200 flex items-center justify-between group cursor-pointer hover:bg-pink-700 transition"
                                            >
                                                <div>
                                                    <p className="text-[11px] font-bold opacity-80">디자인이 필요하신가요?</p>
                                                    <p className="text-[17px] font-black">기본 페이지 디자인 <span className="text-[13px] opacity-90 pl-1">5만원</span></p>
                                                </div>
                                                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                            <div
                                                onClick={() => handleTabChange('inquiry')}
                                                className="p-6 bg-gray-900 rounded-3xl text-white shadow-lg shadow-gray-200 flex items-center justify-between group cursor-pointer hover:bg-black transition"
                                            >
                                                <div>
                                                    <p className="text-[11px] font-bold opacity-80">더 특별한 홍보를 위해!</p>
                                                    <p className="text-[17px] font-black">프리미엄 GIF 구성 <span className="text-[13px] opacity-90 pl-1">10만원</span></p>
                                                </div>
                                                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </section>



                                {/* AI Geo-Targeting Section */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full shadow-[0_0_15px_rgba(219,39,119,0.3)]"></div>
                                        <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>지역 기반 스마트 매칭</h3>
                                    </div>
                                    <div className="bg-gradient-to-br from-pink-600 to-pink-500 p-8 md:p-10 rounded-[32px] md:rounded-[45px] text-white shadow-2xl shadow-pink-200 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 opacity-20 transform translate-x-1/4 -translate-y-1/4">
                                            <Home size={180} />
                                        </div>
                                        <div className="relative z-10 space-y-6">
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/30 backdrop-blur-md">
                                                    신규 기술 연동 정책
                                                </div>
                                                <h4 className="text-2xl md:text-3xl font-black leading-tight">사용자의 현재 위치를 찾아내는<br />AI 스마트 노출 시스템 🛰️</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                <div className="space-y-2">
                                                    <p className="text-[16px] font-black">1. 자동 지역 매칭</p>
                                                    <p className="text-pink-50 text-[13px] font-bold leading-relaxed opacity-90">유저가 직접 지역을 선택하지 않아도, 접속 리전을 자동으로 감지하여 가장 가까운 업소 배너를 우선 노출합니다.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[16px] font-black">2. 배너 인벤토리 효율 극대화</p>
                                                    <p className="text-pink-50 text-[13px] font-bold leading-relaxed opacity-90">서울 유저에겐 서울 배너를, 대구 유저에겐 대구 배너를! 하나의 배너 구좌를 다수의 지역 광고주가 공유하여 효율을 높입니다.</p>
                                                </div>
                                            </div>
                                            <div className="h-px bg-white/20 w-full"></div>
                                            <p className="text-[12px] md:text-[13px] font-bold text-pink-50 italic">
                                                ※ 본 시스템은 유저의 검색 편의성을 높이며 광고주의 광고 도달률을 비약적으로 상승시킵니다. 타 지역 추가 노출 옵션을 통해 전국구 홍보도 가능합니다.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Jump Service Guide Section */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                                        <h3 className={`text-xl md:text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>점프 서비스</h3>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-10 rounded-[32px] md:rounded-[45px] text-white shadow-2xl space-y-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 opacity-10">
                                            <Zap size={120} className="text-pink-500" />
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className="text-xl md:text-2xl font-black mb-2">구인 효과를 극대화하는 '점프' ⚡</h4>
                                            <p className="text-gray-400 text-[13px] md:text-sm font-bold mb-8">내 업소를 리스트 최상단으로 끌어올려 보세요.</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { count: '200회', price: '10,000' },
                                                    { count: '450회', price: '20,000' },
                                                    { count: '700회', price: '30,000' },
                                                    { count: '1,200회', price: '50,000' },
                                                    { count: '2,000회', price: '80,000' }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 hover:border-pink-500/50 transition-colors">
                                                        <span className="text-[14px] md:text-[16px] font-black">{item.count} 점프 충전</span>
                                                        <span className="text-pink-500 font-black tabular-nums">{item.price}원</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-8 text-[11px] md:text-xs text-gray-500 font-bold">
                                                ※ 모든 상품 기본 점프 외에 추가로 구매 가능한 유료 옵션입니다.<br />
                                                ※ 마이페이지 {'>'} 점프옵션 구매하기 메뉴에서 실시간 충전 가능합니다.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Sidebar Ad Card Section (Remove Table for Mobile) */}
                                <div className={`rounded-[32px] md:rounded-[40px] border p-8 md:p-10 shadow-sm space-y-8 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-pink-600 shadow-inner ${brand.theme === 'dark' ? 'bg-pink-900/20' : 'bg-pink-50'}`}>
                                                <Megaphone size={28} />
                                            </div>
                                            <div>
                                                <h3 className={`text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>사이드 배너 광고</h3>
                                                <p className={`text-sm font-black ${brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>PC/모바일 통합 고정 노출 시스템</p>
                                            </div>
                                        </div>
                                        <div className="bg-pink-600 text-white px-4 py-2 rounded-2xl text-[11px] font-black animate-pulse shadow-lg shadow-pink-200 inline-flex items-center gap-2">
                                            <MapPin size={14} /> 위치 기반 인텔리전스 노출 적용
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-900 rounded-[32px] text-white space-y-3 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Search size={100} />
                                        </div>
                                        <p className="text-xs font-bold text-pink-400 uppercase tracking-widest">Smart Marketing Point</p>
                                        <h4 className="text-[15px] md:text-xl font-black leading-tight"><span className="whitespace-nowrap">사용자의 현재 위치를 찾아내는</span><br />AI 스마트 노출 시스템 🛰️</h4>
                                        <p className="text-[13px] text-gray-300 font-medium leading-relaxed max-w-2xl">
                                            사장님의 업소가 위치한 지역의 구직자들에게 가장 먼저 배너가 노출됩니다.
                                            유저의 접속 지역을 실시간으로 감지하여 광고 효율을 극대화하는 {brand.name}만의 기술력을 경험하세요.
                                        </p>
                                    </div>

                                    {/* Responsive Card Layout - Now 2 Columns for better visibility */}
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-5">
                                        {[
                                            {
                                                tier: 'grand',
                                                pos: (<>그랜드<br />사이드 배너</>),
                                                type: 'PC 스크롤 좌우측 동시 고정 노출',
                                                size: '120 x 600 (PC) / 720 x 150 (M)',
                                                price: '350,000원',
                                                feature: (<span>최상위 고정<br />압도적 구인 효과<br />PC+모바일 통합</span>)
                                            },
                                            {
                                                tier: 'premium',
                                                pos: (<>프리미엄<br />사이드 배너</>),
                                                type: (<>PC스크롤 좌/우 택1<br />고정노출</>),
                                                size: '120 x 600 (PC) / 720 x 150 (M)',
                                                price: '200,000원',
                                                feature: (<span>시선 집중<br />높은 가성비 전략<br />PC+모바일 통합</span>)
                                            },
                                            {
                                                tier: 'deluxe',
                                                pos: (<>디럭스<br />사이드 배너</>),
                                                type: '지역별/업종별 채용페이지 사이드바 고객지원센터 영역 하단 노출',
                                                size: '250 x 250 (PC) / 720 x 150 (M)',
                                                price: '180,000원',
                                                feature: (<span>타겟 지역 집중<br />전략적 배너 노출<br />PC+모바일 통합</span>)
                                            },
                                            {
                                                tier: 'special',
                                                pos: (<>스페셜<br />사이드 배너</>),
                                                type: '지역별/업종별 채용페이지 사이드바 고객지원센터 영역 하단 노출',
                                                size: '250 x 250 (PC) / 720 x 150 (M)',
                                                price: '150,000원',
                                                feature: (<span>가성비 최우선<br />실속형 배너 노출<br />PC+모바일 통합</span>)
                                            },
                                        ].map((row, i) => (
                                            <div
                                                key={i}
                                                onClick={() => { setIsPaymentPopupOpen(true); setPaymentInitialTier(row.tier); }}
                                                className={`p-3 md:p-6 rounded-[24px] md:rounded-[35px] border-2 flex flex-col justify-between group hover:border-pink-500 transition-all shadow-sm hover:shadow-xl hover:shadow-pink-100/20 cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}
                                            >
                                                <div className="space-y-2.5">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-0.5">
                                                            <span className={`text-[13px] md:text-xl font-black block leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{row.pos}</span>
                                                            <span className="text-[8px] md:text-[10px] text-pink-500 font-bold uppercase tracking-wider leading-tight block pt-1">{row.feature}</span>
                                                        </div>
                                                        <span className={`hidden md:block text-[9px] px-2 py-1 rounded-lg border font-black ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>{row.size.split(' ')[0]}</span>
                                                    </div>
                                                    <p className={`text-[11px] md:text-[13px] font-bold leading-tight md:leading-relaxed ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{row.type}</p>
                                                </div>
                                                <div className={`mt-3 md:mt-5 pt-3 md:pt-4 border-t flex items-center justify-between ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-[8px] md:text-[9px] text-gray-400 font-black mb-0.5 uppercase tracking-widest leading-none">30일 기준</p>
                                                        <p className="text-sm md:text-2xl font-black text-pink-600 leading-none tabular-nums">{row.price}</p>
                                                    </div>
                                                    <div className={`hidden sm:flex w-10 h-10 rounded-full border-2 items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600 transition-all shadow-sm ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`p-6 rounded-[32px] flex items-start gap-4 border ${brand.theme === 'dark' ? 'bg-pink-900/10 border-pink-900/30' : 'bg-pink-50/50 border-pink-100/50'}`}>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-pink-600 shadow-sm shrink-0 ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                                <Star size={20} />
                                            </div>
                                            <p className={`text-[13px] leading-relaxed font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                <strong className="text-pink-600">사이드 배너 광고 특전:</strong><br />
                                                배너 광고를 진행하시면 해당 지역의 <span className="text-gray-900 font-black">최상단 우대등록 및 반짝이 아이콘 효과</span>를 무료로 지원해 드립니다.
                                            </p>
                                        </div>
                                        <div className={`p-6 rounded-[32px] flex items-start gap-4 border ${brand.theme === 'dark' ? 'bg-gray-900/10 border-gray-900/30' : 'bg-gray-50/50 border-gray-100/50'}`}>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'}`}>
                                                <Crown size={20} />
                                            </div>
                                            <p className={`text-[13px] leading-relaxed font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                <strong className="text-gray-900">한정 구좌 우선순위:</strong><br />
                                                사이드 배너는 쾌적한 사이트 환경을 위해 지역별 한정 수량만 판매되며, <span className="text-pink-600">기존 광고주의 연장 우선권</span>이 보장됩니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Real-time Exposure Form Reference Section (New) */}
                                <section className="space-y-6 py-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                                        <div className="flex items-baseline gap-2">
                                            <h3 className={`text-xl md:text-2xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>실시간 노출 폼 레퍼런스</h3>
                                            <span className="text-gray-400 text-sm font-bold">(개발중)</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                        {/* 카드 1: GRAND / REGION TOP */}
                                        <div className="space-y-2">
                                            <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest pl-2 font-sans">GRAND / REGION TOP</p>
                                            <div className="relative group rounded-[30px] border-[2px] border-amber-400 bg-white shadow-lg shadow-amber-100/10 flex items-center justify-start p-5 transition-transform hover:scale-[1.02] gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                                                    <span className="text-2xl">🏆</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="text-[15px] font-black text-gray-900 leading-tight mb-0.5">우리 업소 무조건 1위</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 leading-tight">골드 보더 + 상단 고정 효과</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 카드 2: COMMUNITY / LIST NATIVE */}
                                        <div className="space-y-2">
                                            <p className="text-[11px] font-black text-pink-500 uppercase tracking-widest pl-2 font-sans">COMMUNITY / LIST NATIVE</p>
                                            <div className="relative rounded-[30px] border-[1.5px] border-dashed border-pink-300 bg-pink-100/60 flex items-center justify-start p-5 transition-transform hover:scale-[1.02] gap-4">
                                                <div className="w-10 h-10 rounded-[18px] bg-pink-500 flex items-center justify-center shadow-md shadow-pink-200 shrink-0">
                                                    <span className="text-xl text-white">✨</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="text-[14px] font-black text-gray-900 leading-tight">사장님, 광고 한 칸<br />어떠세요?</h4>
                                                    <p className="text-[9px] font-black text-pink-500 uppercase mt-1 tracking-widest font-sans">RECOMMENDED AD</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 카드 3: LOUNGE / STAR MEMBERSHIP */}
                                        <div className="space-y-2">
                                            <p className="text-[11px] font-black text-purple-600 uppercase tracking-widest pl-2 font-sans">LOUNGE / STAR MEMBERSHIP</p>
                                            <div className="relative rounded-[30px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-200/30 flex items-center justify-start p-5 transition-transform hover:scale-[1.02] gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner shrink-0">
                                                    <span className="text-2xl text-amber-300 drop-shadow-lg">⭐</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="text-[14px] font-black text-white leading-tight">그녀들의 워너비,<br />스타 회원이 되세요!</h4>
                                                    <p className="text-[9px] font-black text-purple-300 uppercase mt-1 tracking-widest font-sans">STAR MEMBER VIP</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-1 md:pt-4 flex justify-center">
                                        <p className="text-[11px] md:text-[13px] text-gray-400 font-bold flex items-center gap-2 text-center break-keep">
                                            ※ 상세한 노출 방식과 디자인은 상품별 가이드라인에 따라 제공됩니다.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* 3. Usage Guide */}
                        {activeTab === '이용방법' && (
                            <div className="space-y-12">
                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-8 bg-pink-600 rounded-full shadow-lg shadow-pink-200"></div>
                                        <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>구직자 이용가이드</h3>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { step: '01', title: '회원가입', icon: <UserCheck />, desc: 'SNS 연동 간편 가입' },
                                            { step: '02', title: '이력서 등록', icon: <FileText />, desc: '자유 형식의 강점 어필' },
                                            { step: '03', title: '업소 서칭', icon: <Search />, desc: '맞춤 필터링 시스템' },
                                            { step: '04', title: '1:1 상담', icon: <MessageSquare />, desc: '안심 면접을 위한 소통' },
                                        ].map((item, i) => (
                                            <div key={i} className={`p-6 rounded-[30px] border text-center relative overflow-hidden group hover:shadow-xl transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                                <span className={`absolute -top-3 -left-3 text-5xl font-black transition-colors pointer-events-none ${brand.theme === 'dark' ? 'text-gray-700' : 'text-gray-50'} group-hover:text-pink-50/50`}>{item.step}</span>
                                                <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 shadow-inner">
                                                    {item.icon}
                                                </div>
                                                <h4 className={`font-black text-[15px] mb-1 relative z-10 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                                <p className={`text-[11px] relative z-10 font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-2 h-8 bg-pink-600 rounded-full shadow-lg shadow-pink-200"></div>
                                        <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>구인자(사장님) 가이드</h3>
                                    </div>
                                    <div className={`p-8 md:p-10 rounded-[45px] border shadow-xl shadow-pink-100/10 space-y-10 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-[28px] flex items-center justify-center shrink-0 border border-pink-100">
                                                <Briefcase size={36} />
                                            </div>
                                            <div className="text-center md:text-left flex flex-col items-center md:items-start">
                                                <h4 className="text-xl md:text-2xl font-black mb-3 md:mb-2 tracking-tight text-gray-900 whitespace-nowrap">사장님, 안심하고 이용하세요!</h4>
                                                <div className="text-[14px] md:text-[15px] text-gray-500 font-bold leading-relaxed flex flex-col items-center md:items-start">
                                                    <span className="whitespace-nowrap">철저한 사업자 인증을 통해 클린하고 신뢰할 수 있는</span>
                                                    <span className="whitespace-nowrap">구인 공고 문화를 만들어갑니다.</span>
                                                </div>
                                            </div>
                                            <button className="w-full md:w-auto md:ml-auto px-8 py-4 bg-gray-900 text-white rounded-2xl text-[15px] font-black shadow-xl hover:bg-black transition">
                                                사업자 인증하러 가기
                                            </button>
                                        </div>
                                        <div className="h-px bg-gray-100 w-full" />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                                            {[
                                                { num: '1', title: '상품 선택', sub: '효율적인 광고 상품을 직접 픽업하세요.' },
                                                { num: '2', title: '공고 등록', sub: '상세한 업소 정보는 채용 성공률을 높입니다.' },
                                                { num: '3', title: '컨택 & 매칭', sub: '열람권을 통해 적합한 인재를 먼저 선점하세요.' }
                                            ].map((box, i) => (
                                                <div key={i} className={`flex items-start gap-4 md:gap-5 p-6 md:p-0 rounded-3xl border md:border-0 ${brand.theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 md:bg-transparent border-gray-100'}`}>
                                                    <span className="text-4xl md:text-5xl font-black text-pink-500/20 shrink-0 leading-none w-[36px] md:w-12 text-center">{box.num}</span>
                                                    <div className="flex flex-col items-start text-left pt-1 md:pt-2">
                                                        <h5 className="font-black text-base md:text-lg text-gray-900 leading-none mb-2">{box.title}</h5>
                                                        <p className="text-[12px] md:text-[13px] text-gray-500 font-bold leading-relaxed break-keep">
                                                            {box.sub}
                                                        </p>
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
                                <h2 className={`text-2xl font-black tracking-tight mb-8 pl-7 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>자주 묻는 질문</h2>
                                <div className="space-y-4">
                                    {FAQS.map(faq => (
                                        <div key={faq.id} className={`rounded-[28px] shadow-sm border overflow-hidden transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className={`w-full p-7 flex items-center justify-between text-left transition-colors ${brand.theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                                            >
                                                <span className={`font-black text-[15px] flex gap-4 pr-4 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    <span className="text-pink-600">Q.</span> {faq.question}
                                                </span>
                                                {expandedFaq === faq.id ? <ChevronUp size={24} className={brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} /> : <ChevronDown size={24} className="text-gray-400" />}
                                            </button>
                                            {expandedFaq === faq.id && (
                                                <div className={`p-8 border-t text-[15px] leading-loose font-bold ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
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
                                <div className="bg-gradient-to-br from-pink-50 to-white p-8 md:p-10 rounded-[40px] border border-pink-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                                    <div className={`p-5 rounded-[30px] text-pink-600 shadow-sm border border-pink-100 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                        <MessageCircle size={36} />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className={`text-2xl font-black mb-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>무엇을 도와드릴까요?</h3>
                                        <p className={`text-[14px] leading-relaxed font-black ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>궁금한 점을 남겨주시면 24시간 이내에 전문가가 답변을 드립니다.</p>
                                    </div>
                                </div>

                                <div className={`p-10 rounded-[45px] border shadow-sm space-y-10 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className={`block text-xs font-black mb-3 ml-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>문의 유형 <span className="text-pink-600">*</span></label>
                                            <select
                                                className={`w-full border-2 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none appearance-none cursor-pointer ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-900'}`}
                                                onChange={(e) => setInquiryTitle(`[${e.target.value}] ` + (inquiryTitle || ''))}
                                            >
                                                <option>광고 상품 문의 (사장님)</option>
                                                <option>채용 관련 문의 (구직자)</option>
                                                <option>신고 및 운영 정책</option>
                                                <option>기타 제휴 문의</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-black mb-3 ml-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>연락처/회신처 <span className="text-pink-600">*</span></label>
                                            <input
                                                type="text"
                                                value={inquiryContact}
                                                onChange={(e) => setInquiryContact(e.target.value)}
                                                placeholder="회신 받을 번호나 메일을 적어주세요"
                                                className={`w-full border-2 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-900'}`}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-black mb-3 ml-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>문의 제목 <span className="text-pink-600">*</span></label>
                                        <input
                                            type="text"
                                            value={inquiryTitle}
                                            onChange={(e) => setInquiryTitle(e.target.value)}
                                            placeholder="핵심 내용을 한 문장으로 요약해주세요"
                                            className={`w-full border-2 rounded-[22px] p-5 text-sm font-black focus:ring-4 focus:ring-pink-500/10 outline-none ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-black mb-3 ml-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>상세 내용 <span className="text-pink-600">*</span></label>
                                        <textarea
                                            value={inquiryContent}
                                            onChange={(e) => setInquiryContent(e.target.value)}
                                            placeholder="구체적인 상황을 적어주시면 더 정확한 답변이 가능합니다."
                                            className={`w-full border-2 rounded-[35px] p-8 text-sm font-black h-60 resize-none focus:ring-4 focus:ring-pink-500/10 outline-none ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-900'}`}
                                        />
                                    </div>

                                    <button
                                        className={`w-full font-black py-6 rounded-[28px] text-xl shadow-2xl transition-all hover:scale-[1.01] active:scale-95 outline-none ${brand.theme === 'dark' ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                                        onClick={() => alert('접수되었습니다. 담당자 확인 후 빠르게 답변 드리겠습니다!')}
                                    >
                                        상담 등록하기
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 6. 약관 및 정책 */}
                        {activeTab === '약관및정책' && (
                            <div className="space-y-10">
                                <section id="terms" className="scroll-mt-32">
                                    <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                                        <h3 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>서비스 이용약관</h3>
                                    </div>
                                    <div className={`p-8 rounded-[30px] border leading-relaxed text-[14px] font-medium ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-600 shadow-sm'}`}>
                                        <p className="mb-4 font-black text-gray-900 dark:text-white">제 1조 (목적)</p>
                                        <p className="mb-6 ml-2 text-gray-500">본 약관은 코코알바(이하 "회사")가 제공하는 온라인 구인구직 플랫폼 및 관련 제반 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>

                                        <p className="mb-4 font-black text-gray-900 dark:text-white">제 2조 (서비스의 내용)</p>
                                        <p className="mb-6 ml-2 text-gray-500">1. 회사가 제공하는 서비스는 구인공고 등록, 이력서 등록, 광고 대행, 인재 매칭 지원 서비스 등이 포함됩니다.<br />2. 회사는 서비스의 품질 향상을 위해 필요한 경우 서비스의 내용을 변경하거나 중단할 수 있습니다.</p>

                                        <p className="mb-4 font-black text-gray-900 dark:text-white">제 3조 (이용자의 의무)</p>
                                        <p className="ml-2 text-gray-500">회원은 관계 법령, 본 약관의 규정, 이용 가이드 및 서비스와 관련하여 공지한 주의사항을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 해서는 안 됩니다.</p>
                                    </div>
                                </section>

                                <section id="privacy" className="scroll-mt-32">
                                    <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                                        <h3 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>개인정보처리방침</h3>
                                    </div>
                                    <div className={`p-8 rounded-[30px] border leading-relaxed text-[14px] font-medium ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-600 shadow-sm'}`}>
                                        <p className="mb-6 text-gray-500 italic">"코코알바"는 회원의 개인정보를 보호하고 관련 법령을 준수하기 위해 다음과 같은 처리 방침을 수립하여 운영하고 있습니다.</p>

                                        <p className="mb-4 font-black text-gray-900 dark:text-white">1. 개인정보의 수집 및 이용 목적</p>
                                        <p className="mb-6 ml-2 text-gray-500">회사는 회원가입, 원활한 고객 상담, 각종 서비스 제공을 위해 최소한의 개인정보를 수집하며, 수집된 정보는 회원 식별 및 공고 관리 목적으로만 사용됩니다.</p>

                                        <p className="mb-4 font-black text-gray-900 dark:text-white">2. 보유 및 이용 기간</p>
                                        <p className="ml-2 text-gray-500">회원의 개인정보는 원칙적으로 회원 탈퇴 시 즉시 파기되나, 관계 법령에 의해 보존할 필요가 있는 경우 법정 기간 동안 안전하게 보관됩니다.</p>
                                    </div>
                                </section>

                                <section id="youth" className="scroll-mt-32">
                                    <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="w-1.5 h-6 bg-pink-600 rounded-full"></div>
                                        <h3 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>청소년 보호정책</h3>
                                    </div>
                                    <div className={`p-8 rounded-[30px] border leading-relaxed text-[14px] font-medium ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-600 shadow-sm'}`}>
                                        <p className="mb-6 text-gray-500">회사는 청소년이 건전한 인격체로 성장할 수 있도록 정보통신망 이용촉진 및 정보보호 등에 관한 법률 및 청소년 보호법에 근거하여 청소년 보호정책을 시행하고 있습니다.</p>

                                        <p className="mb-4 font-black text-gray-900 dark:text-white">1. 청소년 유해정보에 대한 금지행위</p>
                                        <p className="mb-6 ml-2 text-gray-500">청소년에게 유해한 영향을 미칠 수 있는 게시물이나 광고는 엄격히 금지되며, 상시 모니터링을 통해 즉각적인 조치를 취하고 있습니다.</p>

                                        <p className="mb-4 font-black text-gray-900 dark:text-white">2. 유해환경으로부터의 차단</p>
                                        <p className="ml-2 text-gray-500">성인 인증 시스템과 필터링 기능을 통해 청소년이 의도치 않게 유해 정보에 노출되지 않도록 최선의 기술적 조치를 다하고 있습니다.</p>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Customer Service Box (Mobile Lower Position) */}
                        <div className={`md:hidden mt-6 p-5 rounded-[30px] border shadow-xl shadow-pink-100/10 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-pink-50/30 border-pink-100'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg bg-pink-600">
                                    <PhoneCall size={20} />
                                </div>
                                <span className={`font-black text-lg ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>고객센터</span>
                            </div>
                            <p className={`text-3xl font-black mb-2 tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1544-5568</p>
                            <p className={`text-[12px] leading-relaxed font-black ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                평일 09:30 ~ 19:00 / 점심 12:00 ~ 13:30<br />
                                <span className="text-pink-600 font-black mt-1 block">공휴일 / 주말 휴무 (텔레그램 상시 대기)</span>
                            </p>
                            <a href="https://t.me/your_telegram" className="mt-6 flex items-center justify-center gap-3 w-full py-4 bg-pink-600 text-white rounded-[20px] text-sm font-black hover:bg-pink-700 transition shadow-xl shadow-pink-100">
                                <MessageCircle size={18} /> 텔레그렘 실시간 상담
                            </a>
                        </div>
                    </div>
                </div>

                {/* [Modal] 사장님 전용 상품 안내 (PaymentPopup) */}
                <PaymentPopup
                    isOpen={isPaymentPopupOpen}
                    onClose={() => setIsPaymentPopupOpen(false)}
                    initialTier={paymentInitialTier}
                />

                {/* Image Zoom Modal */}
                {
                    selectedImage && (
                        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                            <div className="relative max-w-5xl w-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                                {/* Centered Header for Image Modal as requested */}
                                <div className="mb-6 text-center">
                                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2">노출 상세 및 영역 안내</h3>
                                    <div className="w-12 h-1 bg-pink-600 mx-auto rounded-full"></div>
                                </div>

                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img src={selectedImage || undefined} alt="Ad Placement Guide Full" className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10" />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute -top-12 md:-top-10 right-0 md:-right-16 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/20 shadow-lg"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
                <Footer />
            </div>

            {/* Mobile Drawer UI */}
            <div
                className={`fixed inset-0 z-[11000] md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}
                style={{ isolation: 'isolate' }}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Drawer Content */}
                <div
                    className={`absolute right-0 top-0 h-full w-[280px] bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="p-6 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-pink-600 rounded-md flex items-center justify-center text-[10px] text-white shrink-0">CS</span>
                            <span className={`font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>고객지원센터</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[15px] font-black transition-all ${activeTab === tab.id
                                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/20'
                                        : `${brand.theme === 'dark' ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}`}
                                >
                                    <div className={activeTab === tab.id ? 'text-white' : 'text-gray-400'}>
                                        {tab.icon}
                                    </div>
                                    {tab.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-t bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-3 mb-2">
                            <PhoneCall size={18} className="text-pink-600" />
                            <span className={`font-black text-sm ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>24시간 상담 가능</span>
                        </div>
                        <p className="text-[12px] text-gray-500 font-medium">관리자에게 문의하시면 신속하게 답변해 드립니다.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
