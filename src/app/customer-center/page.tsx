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
import { useRouter, useSearchParams } from 'next/navigation';
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
    const brand = useBrand();

    const [activeTab, setActiveTab] = useState('공지사항');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'notice') setActiveTab('공지사항');
        else if (tab === 'ad') setActiveTab('광고안내');
        else if (tab === 'guide') setActiveTab('이용방법');
        else if (tab === 'faq') setActiveTab('자주묻는질문');
        else if (tab === 'inquiry') setActiveTab('1:1문의');
    }, [searchParams]);

    const primaryStyle = { color: brand.primaryColor };
    const primaryBgStyle = { backgroundColor: brand.primaryColor };
    const borderColorStyle = { borderColor: brand.primaryColor };

    const TABS = [
        { id: '공지사항', icon: <Megaphone size={16} /> },
        { id: '광고안내', icon: <ShoppingBag size={16} /> },
        { id: '이용방법', icon: <Info size={16} /> },
        { id: '자주묻는질문', icon: <HelpCircle size={16} /> },
        { id: '1:1문의', icon: <MessageSquare size={16} /> },
    ];

    return (
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} pb-20`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <div className="max-w-[1020px] mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 pt-2">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            고객지원센터
                        </h1>
                    </div>
                    <button onClick={() => router.push('/')} className="p-2 text-gray-400 hover:text-gray-600">
                        <Home size={24} />
                    </button>
                </div>
            </header>

            <main className="max-w-[1020px] mx-auto p-4 md:py-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar (Desktop) / Top Nav (Mobile) */}
                    <aside className="md:w-64 shrink-0">
                        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden`}>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">메뉴</p>
                            </div>
                            <nav className="flex md:flex-col overflow-x-auto md:overflow-visible scrollbar-hide">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2 md:border-b-0 md:border-l-4 ${activeTab === tab.id
                                            ? 'bg-pink-50/30 text-pink-500 border-pink-500 dark:bg-pink-900/10'
                                            : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-200'}`}
                                        style={activeTab === tab.id ? { color: brand.primaryColor, borderColor: brand.primaryColor, backgroundColor: `${brand.primaryColor}08` } : {}}
                                    >
                                        <span className={activeTab === tab.id ? '' : 'text-gray-300'}>{tab.icon}</span>
                                        {tab.id}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Customer Service Box */}
                        <div className={`mt-6 p-6 rounded-2xl border-2 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm`}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={primaryBgStyle}>
                                    <PhoneCall size={16} />
                                </div>
                                <span className="font-extrabold text-sm">고객행복센터</span>
                            </div>
                            <p className="text-2xl font-black mb-1">1544-5568</p>
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                평일 09:30 ~ 19:00<br />
                                점심 12:00 ~ 13:30<br />
                                * 공휴일 및 토, 일요일은 휴무입니다.
                            </p>
                            <a href="https://t.me/your_telegram" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition">
                                <MessageCircle size={14} /> 텔레그렘 상담
                            </a>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* 1. Notice Board */}
                        {activeTab === '공지사항' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-black">공지사항</h2>
                                    <span className="text-xs text-gray-400">총 {NOTICES.length}건</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                                    {NOTICES.map((notice, idx) => (
                                        <div
                                            key={notice.id}
                                            className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${idx !== NOTICES.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${notice.category === '공지' ? 'bg-blue-100 text-blue-600' : notice.category === '점검' ? 'bg-orange-100 text-orange-600' : 'bg-pink-100 text-pink-600'}`}>
                                                    {notice.category}
                                                </span>
                                                <span className={`text-sm font-bold truncate max-w-[200px] sm:max-w-md ${notice.isNew ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
                                                    {notice.title}
                                                </span>
                                                {notice.isNew && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                                            </div>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock size={12} /> {notice.date}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Ad Guide */}
                        {activeTab === '광고안내' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="text-center py-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[32px] text-white shadow-xl mb-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-10">
                                        <Zap size={150} />
                                    </div>
                                    <h2 className="text-3xl font-black mb-2">효과적인 구인의 시작 🚀</h2>
                                    <p className="text-gray-400 text-sm">{brand.name}만의 프리미엄 광고 시스템을 경험하세요.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    {AD_TIERS.map((tier) => (
                                        <div key={tier.id} className={`bg-white dark:bg-gray-800 p-6 rounded-[24px] border-2 shadow-sm flex flex-col transition-transform hover:scale-[1.02] ${tier.id === 'grand' ? 'border-amber-400' : 'border-gray-100 dark:border-gray-700'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                                                    {tier.icon}
                                                </div>
                                                {tier.id === 'grand' && <span className="bg-amber-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">BEST</span>}
                                            </div>
                                            <h3 className="text-xl font-black mb-1">{tier.name}</h3>
                                            <p className="text-red-500 font-bold mb-6">{tier.price}</p>

                                            <div className="flex-1 space-y-3 mb-8">
                                                {tier.benefits.map((benefit, i) => (
                                                    <p key={i} className="text-xs text-gray-500 flex items-start gap-2">
                                                        <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                                                        {benefit}
                                                    </p>
                                                ))}
                                            </div>

                                            <button className={`w-full py-3 rounded-xl text-sm font-bold transition ${tier.id === 'grand' ? 'bg-amber-400 text-white shadow-lg shadow-amber-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
                                                상품 신청하기
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Side Banner Section */}
                                <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">사이드 배너 광고 (PC/모바일 공통)</h3>
                                            <p className="text-xs text-gray-400">모든 페이지 측면에 고정 노출되어 압도적인 클릭률을 기록합니다.</p>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                    <th className="px-4 py-4 text-left font-bold rounded-l-xl">광고 위치</th>
                                                    <th className="px-4 py-4 text-left font-bold">노출 방식</th>
                                                    <th className="px-4 py-4 text-left font-bold">규격 (px)</th>
                                                    <th className="px-4 py-4 text-left font-bold rounded-r-xl">단가 (1개월)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                                <tr>
                                                    <td className="px-4 py-5 font-bold">좌측 고정 배너</td>
                                                    <td className="px-4 py-5 text-gray-500">스크롤 고정형 (PC)</td>
                                                    <td className="px-4 py-5 font-mono text-gray-400">120 x 600</td>
                                                    <td className="px-4 py-5 font-black text-pink-500">500,000원</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-5 font-bold">우측 고정 배너</td>
                                                    <td className="px-4 py-5 text-gray-500">스크롤 고정형 (PC)</td>
                                                    <td className="px-4 py-5 font-mono text-gray-400">120 x 600</td>
                                                    <td className="px-4 py-5 font-black text-pink-500">500,000원</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-5 font-bold">모바일 상단 롤링</td>
                                                    <td className="px-4 py-5 text-gray-500">롤링형 (Mobile)</td>
                                                    <td className="px-4 py-5 font-mono text-gray-400">720 x 150</td>
                                                    <td className="px-4 py-5 font-black text-pink-500">300,000원</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex items-start gap-3">
                                            <Info size={16} className="text-gray-400 mt-0.5" />
                                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                                <strong>사이드 배너 고시 혜택:</strong><br />
                                                우대등록, 프리미엄 줄광고 배경색/아이콘/점프 기능을 무료로 제공합니다.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl flex items-start gap-3">
                                            <Megaphone size={16} className="text-gray-400 mt-0.5" />
                                            <p className="text-[11px] text-gray-500 leading-relaxed">
                                                <strong>한정 수량 운영:</strong><br />
                                                본 광고는 퀄리티 유지를 위해 한정된 수량만 운영됩니다. 신청 전 고객센터 상담이 필수입니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Usage Guide */}
                        {activeTab === '이용방법' && (
                            <div className="space-y-10 animate-in fade-in duration-300">
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                                        <h3 className="text-xl font-black">구직자 이용 가이드</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        {[
                                            { step: '01', title: '1분 회원가입', icon: <UserCheck />, desc: 'SNS 연동으로 간편하게' },
                                            { step: '02', title: '이력서 등록', icon: <FileText />, desc: '나의 강점을 어필하세요' },
                                            { step: '03', title: '지역/업종 탐색', icon: <Search />, desc: '원하는 조건을 필터링' },
                                            { step: '04', title: '안심 면접', icon: <MessageSquare />, desc: '플랫폼 내 상담 후 지원' },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden group">
                                                <span className="absolute -top-2 -left-2 text-4xl font-black text-gray-50 dark:text-gray-700/50 group-hover:text-pink-50 transition-colors">{item.step}</span>
                                                <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
                                                    {item.icon}
                                                </div>
                                                <h4 className="font-bold text-sm mb-1 relative z-10">{item.title}</h4>
                                                <p className="text-[10px] text-gray-400 relative z-10">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                                        <h3 className="text-xl font-black">기업회원(사장님) 이용 가이드</h3>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center shrink-0">
                                                <Briefcase size={32} />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <h4 className="text-lg font-black mb-1">인증된 사장님만 공고 등록이 가능합니다.</h4>
                                                <p className="text-xs text-gray-400">깨끗하고 안전한 구인구직 환경을 위해 사업자등록증 확인 절차를 진행하고 있습니다.</p>
                                            </div>
                                            <button className="md:ml-auto px-6 py-3 bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-100 whitespace-nowrap">
                                                사업자 인증하러 가기
                                            </button>
                                        </div>
                                        <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="flex gap-4">
                                                <span className="text-2xl font-black text-blue-200">1</span>
                                                <div>
                                                    <h5 className="font-bold text-sm mb-1">광고 상품 선택</h5>
                                                    <p className="text-xs text-gray-400">Grand, Premium 중 노출 효율에 맞는 상품을 선택하세요.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-2xl font-black text-blue-200">2</span>
                                                <div>
                                                    <h5 className="font-bold text-sm mb-1">공고 등록 & 승인</h5>
                                                    <p className="text-xs text-gray-400">업소 정보와 급여를 상세히 적어주세요. 관리자 승인 후 즉시 노출됩니다.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-2xl font-black text-blue-200">3</span>
                                                <div>
                                                    <h5 className="font-bold text-sm mb-1">인재 직접 컨택</h5>
                                                    <p className="text-xs text-gray-400">이력서 열람권을 통해 우리 업소에 딱 맞는 인재에게 먼저 연락하세요.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* 4. FAQ */}
                        {activeTab === '자주묻는질문' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <h2 className="text-2xl font-black mb-6">자주 묻는 질문</h2>
                                <div className="space-y-3">
                                    {FAQS.map(faq => (
                                        <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <span className="font-bold text-sm text-gray-700 dark:text-gray-200 flex gap-3">
                                                    <span className="text-pink-500">Q.</span> {faq.question}
                                                </span>
                                                {expandedFaq === faq.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                            </button>
                                            {expandedFaq === faq.id && (
                                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 leading-relaxed animate-in slide-in-from-top-2 duration-300">
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
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="bg-pink-50 dark:bg-pink-900/10 p-6 rounded-3xl border border-pink-100 dark:border-pink-800/30 flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                                        <MessageCircle className="text-pink-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-800 dark:text-gray-100 mb-1">궁금한 점이 있으신가요?</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            궁금하신 사항을 남겨주시면 담당자가 확인 후 영업일 기준 24시간 이내에 답변해 드립니다.<br />
                                            긴급한 광고 문의는 <span className="font-black text-pink-500">전화 상담(1544-5568)</span>을 이용해 주세요.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">문의 유형 <span className="text-red-500">*</span></label>
                                            <select className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500/20 outline-none appearance-none cursor-pointer">
                                                <option>광고 상품 문의 (사장님)</option>
                                                <option>구인구직 관련 문의 (개인)</option>
                                                <option>신고 및 게시글 관리</option>
                                                <option>기타 문의</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">연락처/이메일 <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="식별 가능한 정보를 입력해주세요" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500/20 outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">문의 제목 <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="제목을 입력해주세요" className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-500/20 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">상세 내용 <span className="text-red-500">*</span></label>
                                        <textarea placeholder="구체적인 상황과 궁금한 점을 적어주세요." className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-3xl p-6 text-sm h-48 resize-none focus:ring-2 focus:ring-pink-500/20 outline-none" />
                                    </div>

                                    <button
                                        className="w-full text-white font-black py-5 rounded-[24px] text-lg shadow-xl shadow-pink-100 transition-all hover:scale-[1.01] active:scale-95"
                                        style={primaryBgStyle}
                                        onClick={() => alert('문의가 성공적으로 접수되었습니다. 곧 답변 드리겠습니다!')}
                                    >
                                        문의 등록하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
