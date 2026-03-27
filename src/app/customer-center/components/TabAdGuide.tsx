'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useBrand } from '@/components/BrandProvider';
import { PaymentPopup } from '@/components/home/PaymentPopup';
import { ExposureItem } from './ExposureItem';
import {
    Zap,
    Star,
    Crown,
    FileText,
    Search,
    Monitor,
    Smartphone,
    ChevronUp,
    ChevronDown,
    Info,
    ArrowRight,
    MapPin,
    Megaphone,
    CheckCircle2,
    Clock,
    Home,
    X,
} from 'lucide-react';

const AD_TIERS = [
    {
        id: 'grand',
        name: (<span>그랜드<br /><span className="font-normal">(Grand)</span></span>),
        icon: <Crown className="text-amber-600" />,
        price: '350,000원 / 30일',
        benefits: ['메인 최상단 노출', '압도적 광고 효과']
    },
    {
        id: 'premium',
        name: (<span>프리미엄<br /><span className="font-normal">(Premium)</span></span>),
        icon: <Star className="text-purple-500" />,
        price: '200,000원 / 30일',
        benefits: ['상단 시선 집중', '높은 효율성 노출']
    },
    {
        id: 'deluxe',
        name: (<span>디럭스<br /><span className="font-normal">(Deluxe)</span></span>),
        icon: <Zap className="text-[#f82b60]" />,
        price: '180,000원 / 30일',
        benefits: ['타겟 지역 집중', '전략적 배너 노출']
    },
    {
        id: 'basic',
        name: (<span>베이직<br /><span className="font-normal">(줄광고)</span></span>),
        icon: <FileText className="text-gray-400" />,
        price: '60,000원 / 30일',
        benefits: ['최신 구인정보 리스트', '(실속형 구인 상품)']
    },
];

const DETAILED_PRICING = [
    { type: '메인 독점',    name: '타입1. 그랜드(Grand)',      d30: 350000, d60: 630000, d90: 840000, jumpManual: 15, jumpAuto: 8,  benefit: (<span>메인 최상단 노출 및<br />압도적 광고 효과</span>) },
    { type: '메인 상단',    name: '타입2. 프리미엄(Premium)',  d30: 200000, d60: 360000, d90: 480000, jumpManual: 15, jumpAuto: 8,  benefit: (<span>상단 시선 집중<br />높은 효율성 노출</span>) },
    { type: '메인 일반',    name: '타입3. 디럭스(Deluxe)',     d30: 180000, d60: 324000, d90: 432000, jumpManual: 10, jumpAuto: 6,  benefit: (<span>타겟 지역 집중<br />전략적 배너 노출</span>) },
    { type: '리스트 상단',  name: '타입4. 스페셜(Special)',    d30: 150000, d60: 270000, d90: 360000, jumpManual: 10, jumpAuto: 6,  benefit: (<span>가성비 최우선<br />실속형 배너 노출</span>) },
    { type: '리스트 강조',  name: '타입5. 급구/추천(Urgent)',  d30: 120000, d60: 216000, d90: 288000, jumpManual: 8,  jumpAuto: 3,  benefit: (<span>급구/추천 배지 노출로<br />주목도 실속형</span>) },
    { type: '리스트 네이티브', name: '타입6. 네이티브(Native)', d30: 100000, d60: 180000, d90: 240000, jumpManual: 6,  jumpAuto: 0,  benefit: (<span>리스트 광고에 배치<br />랜덤 상단노출효과</span>) },
    { type: '리스트 기본',  name: '타입7. 베이직(줄광고)',      d30: 60000,  d60: 100000, d90: 140000, jumpManual: 5,  jumpAuto: 0,  benefit: (<span>최신 구인정보 리스트<br />(실속형 구인 상품)</span>) },
    { type: '리스트 옵션',  name: '8번-강조옵션(Emphasis)',    d30: 30000,  d60: 55000,  d90: 70000,  jumpManual: 0,  jumpAuto: 0,  benefit: (<span>아이콘/형광펜<br />테두리/급여추가 선택가능<br />(주목도 200% 상승)</span>) },
];

interface TabAdGuideProps {
    onTabChange: (tabName: string) => void;
}

export function TabAdGuide({ onTabChange }: TabAdGuideProps) {
    const brand = useBrand();
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
    const [paymentInitialTier, setPaymentInitialTier] = useState('grand');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => { if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' }); };
    const scrollRight = () => { if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' }); };

    useEffect(() => {
        if (selectedImage) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [selectedImage]);

    return (
        <div className="space-y-8">
            <div className="text-center py-10 md:py-12 bg-gradient-to-br from-[#f82b60] to-[#db2456] rounded-[40px] text-white shadow-xl shadow-rose-200/50 relative overflow-hidden border border-rose-400">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Zap size={150} strokeWidth={3} className="text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tighter text-white">효과적인 구인의 시작 🚀</h2>
                <p className="text-rose-50 text-[13px] md:text-sm font-black tracking-tight opacity-90">가장 확실한 구인은 {brand.name} 프리미엄 광고와 함께하세요.</p>
            </div>

            {/* Mobile: Horizontal Scroll / Desktop: Grid */}
            <div className="relative group px-1">
                <div ref={scrollContainerRef} className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                    {AD_TIERS.map((tier) => (
                        <div
                            key={tier.id}
                            onClick={() => {
                                setPaymentInitialTier(tier.id);
                                setIsPaymentPopupOpen(true);
                            }}
                            className={`w-full md:w-auto p-4 md:p-5 rounded-[28px] border shadow-sm flex flex-col transition-all hover:scale-[1.02] active:scale-95 cursor-pointer hover:border-[#f82b60] hover:shadow-md hover:z-10 relative ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${tier.id === 'grand' ? (brand.theme === 'dark' ? 'border-rose-900/50 shadow-lg shadow-rose-900/20 hover:bg-rose-900/30' : 'border-rose-300 shadow-lg shadow-rose-100/50 hover:bg-rose-50') : (brand.theme === 'dark' ? 'border-gray-700 hover:bg-rose-900/30' : 'border-gray-200 hover:bg-rose-50')}`}
                        >
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <div className={`p-4 md:p-4 rounded-2xl shadow-inner text-[#f82b60] ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-rose-50'}`}>
                                    {React.cloneElement(tier.icon as React.ReactElement<{ size?: number }>, { size: 24 })}
                                </div>
                                {tier.id === 'grand' && <span className="bg-[#f82b60] text-white text-[10px] md:text-[11px] px-3 py-1 rounded-full font-black uppercase tracking-widest">Top Tier</span>}
                            </div>
                            <h3 className={`text-xl md:text-xl font-black mb-1 md:mb-2 tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                            <p className="text-[#f82b60] font-black text-lg md:text-lg mb-6 md:mb-8 tracking-tighter leading-none">{tier.price.split(' ')[0]}</p>

                            <div className="flex-1 space-y-2.5 md:space-y-3 mb-6">
                                {tier.benefits.map((benefit, i) => (
                                    <p key={i} className={`text-xs md:text-xs flex items-start gap-2.5 font-bold leading-relaxed ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}`}>
                                        <CheckCircle2 size={14} className="text-[#f82b60] shrink-0 mt-0.5" />
                                        <span className="leading-tight break-keep tracking-tight">{benefit}</span>
                                    </p>
                                ))}
                            </div>

                            <button
                                className={`w-full py-3 rounded-xl text-sm font-black transition ${tier.id === 'grand' ? 'bg-[#f82b60] text-white shadow-lg shadow-rose-100/50 hover:bg-[#db2456]' : `text-white hover:bg-black ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-900'}`}`}
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
                    <div className="w-2 h-8 bg-[#f82b60] rounded-full"></div>
                    <div className="flex flex-col gap-1">
                        <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>상세 단가표</h3>
                        <p className="text-[12px] md:text-[13px] text-gray-500 font-bold leading-relaxed">
                            모든 상품은 <span className="text-[#f82b60]">PC+모바일 통합 노출</span>되며, 리전 필터 등 최신 기술이 적용된 전략적 구좌를 제공합니다.
                        </p>
                    </div>
                </div>

                {/* PC View Table */}
                <div className="hidden md:block">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className={`border-b-2 ${brand.theme === 'dark' ? 'border-gray-700' : 'border-rose-100'}`}>
                                <th className="py-5 text-left text-[13px] font-black text-gray-400 uppercase tracking-widest w-36">구분</th>
                                <th className="py-5 text-left text-[13px] font-black text-gray-600 uppercase tracking-widest pl-4 w-[40%]">상품명 및 혜택</th>
                                <th className="py-5 text-right text-[13px] font-black text-[#f82b60] uppercase tracking-widest pr-8 pl-8">30일</th>
                                <th className={`py-5 text-right text-[13px] font-black uppercase tracking-widest pr-4 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>60일 (10%↓)</th>
                                <th className={`py-5 text-right text-[13px] font-black uppercase tracking-widest pr-4 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>90일 (20%↓)</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-700' : 'divide-gray-50'}`}>
                            {DETAILED_PRICING.map((item, idx) => (
                                <tr key={idx} className="hover:bg-rose-50/20 transition-colors group">
                                    <td className="py-3 text-[12px] font-black text-gray-400 group-hover:text-[#f82b60] transition-colors whitespace-nowrap">{item.type}</td>
                                    <td className="py-3 pl-4">
                                        <div className="flex flex-col">
                                            <span className={`text-[15px] font-black mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                                            <span className={`text-[11px] font-bold self-start mt-0.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {item.benefit}
                                            </span>
                                            {item.jumpManual > 0 && (
                                                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                                    <span className="text-[10px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                        수동 {item.jumpManual}회/일
                                                    </span>
                                                    {item.jumpAuto > 0 ? (
                                                        <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                            자동 {item.jumpAuto}회/일
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                            자동없음
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 text-right text-[15px] font-black text-[#f82b60] pr-8 pl-8 tabular-nums whitespace-nowrap">{item.d30.toLocaleString()}원</td>
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
                                        <span className="text-[9px] font-black text-[#f82b60] uppercase">{item.type}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-200"></div>
                                    </div>
                                    <h4 className={`text-[13px] font-black leading-tight break-keep ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                                </div>

                                <div className={`p-1.5 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <p className={`text-[10px] font-bold leading-[1.4] break-keep ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {item.benefit}
                                    </p>
                                </div>
                                {item.jumpManual > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap mt-1">
                                        <span className="text-[9px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                            수동 {item.jumpManual}회
                                        </span>
                                        {item.jumpAuto > 0 ? (
                                            <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                자동 {item.jumpAuto}회
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                자동없음
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={`mt-3 pt-2.5 border-t space-y-1 ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                                <div className={`flex justify-between items-center px-2 py-1.5 rounded-lg ${brand.theme === 'dark' ? 'bg-rose-900/10' : 'bg-rose-50'}`}>
                                    <span className="text-[8px] font-black text-rose-400 uppercase">30일</span>
                                    <span className="text-[11px] font-black text-[#f82b60] tabular-nums">{item.d30.toLocaleString()}원</span>
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
                    <p className="text-[11px] md:text-[13px] text-gray-500 font-black">연간 패키지 결제 시 <span className="text-[#f82b60] font-black">25% 할인 혜택</span></p>
                </div>

            </div>

            {/* Ad Placement Guide Section - Precise Accordion Implementation */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#f82b60] rounded-full"></div>
                    <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>노출 상세 및 영역 안내</h3>
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
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${brand.theme === 'dark' ? 'bg-gray-800 text-[#f82b60]' : 'bg-rose-50 text-[#f82b60]'}`}>
                                            {item.isMobile ? <Smartphone size={16} /> : <Monitor size={16} />}
                                        </div>
                                        <h4 className={`text-[13px] md:text-[14px] font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                    </div>
                                    {activeAccordion === item.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                </button>

                                {activeAccordion === item.id && (
                                    <div className="p-4">
                                        <div
                                            className={`relative cursor-pointer overflow-hidden rounded-xl border ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} ${item.isMobile ? 'max-w-[180px] mx-auto aspect-[9/16]' : 'aspect-[16/10]'}`}
                                            onClick={() => setSelectedImage(item.img)}
                                        >
                                            <Image
                                                src={item.img}
                                                alt={item.title}
                                                width={item.isMobile ? 180 : 800}
                                                height={item.isMobile ? 320 : 500}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white font-black flex items-center gap-1.5 bg-[#f82b60] px-3 py-1.5 rounded-full text-[10px] shadow-xl">
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
                                    desc="메인 최상단 노출 및 압도적 광고 효과"
                                    onArrowClick={() => {
                                        setActiveAccordion('pc_1');
                                        setSelectedImage('/images/guide/pc_1.png');
                                    }}
                                />
                                <ExposureItem
                                    rank="PREMIUM"
                                    desc="상단 시선 집중 높은 효율성 노출"
                                    onArrowClick={() => {
                                        setActiveAccordion('pc_1');
                                        setSelectedImage('/images/guide/pc_1.png');
                                    }}
                                />
                                <ExposureItem
                                    rank="DELUXE"
                                    desc="타겟 지역 집중 전략적 배너 노출"
                                    onArrowClick={() => {
                                        setActiveAccordion('pc_3');
                                        setSelectedImage('/images/guide/pc_3.png');
                                    }}
                                />
                                <ExposureItem
                                    rank="SPECIAL"
                                    desc="가성비 최우선 실속형 배너 노출"
                                    onArrowClick={() => {
                                        setActiveAccordion('pc_3');
                                        setSelectedImage('/images/guide/pc_3.png');
                                    }}
                                />
                                <ExposureItem
                                    rank="BASIC"
                                    desc="최신 구인정보 리스트 (실속형 구인 상품)"
                                    onArrowClick={() => {
                                        setActiveAccordion('pc_4');
                                        setSelectedImage('/images/guide/pc_4.png');
                                    }}
                                />
                                <ExposureItem
                                    rank="NATIVE"
                                    desc="리스트 광고에 배치 랜덤 상단노출효과"
                                    onArrowClick={() => {
                                        setActiveAccordion('pc_4');
                                        setSelectedImage('/images/guide/pc_4.png');
                                    }}
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold px-2">
                            ※ 상세 디자인은 가이드라인에 따라 제공됩니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Design Guide Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#f82b60] rounded-full"></div>
                    <div className="flex items-center gap-2">
                        <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>이미지 제작 가이드</h3>
                    </div>
                </div>
                <div className={`p-8 md:p-10 rounded-[32px] md:rounded-[45px] border shadow-xl space-y-8 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 shadow-rose-900/10' : 'bg-white border-gray-100 shadow-rose-100/10'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={`p-6 md:p-8 rounded-[32px] border ${brand.theme === 'dark' ? 'bg-gray-700/30 border-rose-900/30' : 'bg-rose-50/50 border-rose-100'}`}>
                            <h4 className={`text-[17px] font-black mb-6 flex items-center gap-2.5 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                <div className="p-2 bg-[#f82b60] text-white rounded-xl shadow-sm"><Clock size={16} /></div> <span className="whitespace-nowrap">이미지 제작 기반 안내</span>
                            </h4>
                            <ul className="space-y-4 text-[13px] md:text-[14px] text-gray-500 font-bold leading-relaxed">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#f82b60] mt-2 shrink-0"></div>
                                    <span className="break-keep">상세설명란에 구인 내용을 적어주시면 디자인 작업을 해드립니다.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#f82b60] mt-2 shrink-0"></div>
                                    <span className="break-keep">이미지 작업 및 등록은 결제일로부터 <span className="text-gray-900 font-black underline decoration-pink-200 underline-offset-4">영업일 기준 1~2일</span> 소요됩니다.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#f82b60] mt-2 shrink-0"></div>
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
                            onClick={() => onTabChange('1:1 문의')}
                            className="p-6 bg-[#f82b60] rounded-3xl text-white shadow-lg shadow-rose-200 flex items-center justify-between group cursor-pointer hover:bg-[#db2456] transition"
                        >
                            <div>
                                <p className="text-[11px] font-bold opacity-80">디자인이 필요하신가요?</p>
                                <p className="text-[17px] font-black">기본 페이지 디자인 <span className="text-[13px] opacity-90 pl-1">5만원</span></p>
                            </div>
                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div
                            onClick={() => onTabChange('1:1 문의')}
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
                    <div className="w-2 h-8 bg-[#f82b60] rounded-full shadow-[0_0_15px_rgba(219,39,119,0.3)]"></div>
                    <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>지역 기반 스마트 매칭</h3>
                </div>
                <div className="bg-gradient-to-br from-[#f82b60] to-[#db2456] p-8 md:p-10 rounded-[32px] md:rounded-[45px] text-white shadow-2xl shadow-rose-200 relative overflow-hidden">
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
                                <p className="text-rose-50 text-[13px] font-bold leading-relaxed opacity-90">유저가 직접 지역을 선택하지 않아도, 접속 리전을 자동으로 감지하여 가장 가까운 업소 배너를 우선 노출합니다.</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[16px] font-black">2. 배너 인벤토리 효율 극대화</p>
                                <p className="text-rose-50 text-[13px] font-bold leading-relaxed opacity-90">서울 유저에겐 서울 배너를, 대구 유저에겐 대구 배너를! 하나의 배너 구좌를 다수의 지역 광고주가 공유하여 효율을 높입니다.</p>
                            </div>
                        </div>
                        <div className="h-px bg-white/20 w-full"></div>
                        <p className="text-[12px] md:text-[13px] font-bold text-rose-50 italic">
                            ※ 본 시스템은 유저의 검색 편의성을 높이며 광고주의 광고 도달률을 비약적으로 상승시킵니다. 타 지역 추가 노출 옵션을 통해 전국구 홍보도 가능합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Jump Service Guide Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#f82b60] rounded-full"></div>
                    <h3 className={`text-2xl font-black uppercase tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>점프 서비스</h3>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-black p-8 md:p-10 rounded-[32px] md:rounded-[45px] text-white shadow-2xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Zap size={120} className="text-[#f82b60]" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-xl md:text-2xl font-black mb-2">구인 효과를 극대화하는 &apos;점프&apos; ⚡</h4>
                        <p className="text-gray-400 text-[13px] md:text-sm font-bold mb-8">내 업소를 리스트 최상단으로 끌어올려 보세요.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { count: '200회', price: '10,000' },
                                { count: '450회', price: '20,000' },
                                { count: '700회', price: '30,000' },
                                { count: '1,200회', price: '50,000' },
                                { count: '2,000회', price: '80,000' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 hover:border-[#f82b60]/50 transition-colors">
                                    <span className="text-[14px] md:text-[16px] font-black">{item.count} 점프 충전</span>
                                    <span className="text-rose-400 font-black tabular-nums">{item.price}원</span>
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
                        <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-[#f82b60] shadow-inner ${brand.theme === 'dark' ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
                            <Megaphone size={28} />
                        </div>
                        <div>
                            <h3 className={`text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>사이드 배너 광고</h3>
                            <p className={`text-sm font-black ${brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>PC/모바일 통합 고정 노출 시스템</p>
                        </div>
                    </div>
                    <div className="bg-[#f82b60] text-white px-4 py-2 rounded-2xl text-[11px] font-black animate-pulse shadow-lg shadow-rose-200 inline-flex items-center gap-2">
                        <MapPin size={14} /> 위치 기반 인텔리전스 노출 적용
                    </div>
                </div>

                <div className="p-6 bg-gray-900 rounded-[32px] text-white space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Search size={100} />
                    </div>
                    <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Smart Marketing Point</p>
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
                            onClick={() => {
                                setPaymentInitialTier(row.tier);
                                setIsPaymentPopupOpen(true);
                            }}
                            className={`p-3 md:p-6 rounded-[24px] md:rounded-[35px] border-2 flex flex-col justify-between group hover:border-[#f82b60] transition-all shadow-sm hover:shadow-xl hover:shadow-rose-100/20 cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800 hover:bg-rose-900/30' : 'bg-gray-50 border-gray-100 hover:bg-rose-50'}`}
                        >
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <span className={`text-[13px] md:text-xl font-black block leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{row.pos}</span>
                                        <span className="text-[8px] md:text-[10px] text-[#f82b60] font-bold uppercase tracking-wider leading-tight block pt-1">{row.feature}</span>
                                    </div>
                                    <span className={`hidden md:block text-[9px] px-2 py-1 rounded-lg border font-black ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>{row.size.split(' ')[0]}</span>
                                </div>
                                <p className={`text-[11px] md:text-[13px] font-bold leading-tight md:leading-relaxed ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{row.type}</p>
                            </div>
                            <div className={`mt-3 md:mt-5 pt-3 md:pt-4 border-t flex items-center justify-between ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex-1 text-left">
                                    <p className="text-[8px] md:text-[9px] text-gray-400 font-black mb-0.5 uppercase tracking-widest leading-none">30일 기준</p>
                                    <p className="text-sm md:text-2xl font-black text-[#f82b60] leading-none tabular-nums">{row.price}</p>
                                </div>
                                <div className={`hidden sm:flex w-10 h-10 rounded-full border-2 items-center justify-center text-[#f82b60] group-hover:bg-[#f82b60] group-hover:text-white group-hover:border-[#f82b60] transition-all shadow-sm ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-6 rounded-[32px] flex items-start gap-4 border ${brand.theme === 'dark' ? 'bg-rose-900/10 border-rose-900/30' : 'bg-rose-50/50 border-rose-100/50'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[#f82b60] shadow-sm shrink-0 ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                            <Star size={20} />
                        </div>
                        <p className={`text-[13px] leading-relaxed font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                            <strong className="text-[#f82b60]">사이드 배너 광고 특전:</strong><br />
                            배너 광고를 진행하시면 해당 지역의 <span className="text-gray-900 font-black">최상단 우대등록 및 반짝이 아이콘 효과</span>를 무료로 지원해 드립니다.
                        </p>
                    </div>
                    <div className={`p-6 rounded-[32px] flex items-start gap-4 border ${brand.theme === 'dark' ? 'bg-gray-900/10 border-gray-900/30' : 'bg-gray-50/50 border-gray-100/50'}`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-900'}`}>
                            <Crown size={20} />
                        </div>
                        <p className={`text-[13px] leading-relaxed font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                            <strong className="text-gray-900">한정 구좌 우선순위:</strong><br />
                            사이드 배너는 쾌적한 사이트 환경을 위해 지역별 한정 수량만 판매되며, <span className="text-[#f82b60]">기존 광고주의 연장 우선권</span>이 보장됩니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* Real-time Exposure Form Reference Section (New) */}
            <section className="space-y-6 py-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-[#f82b60] rounded-full"></div>
                    <div className="flex items-baseline gap-2">
                        <h3 className={`text-2xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>실시간 노출 폼 레퍼런스</h3>
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
                                <h4 className="text-[15px] font-black text-gray-900 leading-tight mb-0.5 whitespace-nowrap">우리 업소 무조건 1위</h4>
                                <p className="text-[10px] font-bold text-gray-400 leading-tight">골드 보더 + 상단 고정 효과</p>
                            </div>
                        </div>
                    </div>

                    {/* 카드 2: COMMUNITY / LIST NATIVE */}
                    <div className="space-y-2">
                        <p className="text-[11px] font-black text-[#f82b60] uppercase tracking-widest pl-2 font-sans">COMMUNITY / LIST NATIVE</p>
                        <div className="relative rounded-[30px] border-[1.5px] border-dashed border-rose-300 bg-rose-100/60 flex items-center justify-start p-5 transition-transform hover:scale-[1.02] gap-4">
                            <div className="w-10 h-10 rounded-[18px] bg-[#f82b60] flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
                                <span className="text-xl text-white">✨</span>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="text-[14px] font-black text-gray-900 leading-tight">사장님, 광고 한 칸<br />어떠세요?</h4>
                                <p className="text-[9px] font-black text-[#f82b60] uppercase mt-1 tracking-widest font-sans">RECOMMENDED AD</p>
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

            {/* PaymentPopup */}
            {isPaymentPopupOpen && (
                <PaymentPopup
                    isOpen={isPaymentPopupOpen}
                    onClose={() => setIsPaymentPopupOpen(false)}
                    initialTier={paymentInitialTier}
                />
            )}

            {/* selectedImage Modal */}
            {selectedImage && createPortal(
                <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl w-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
                        <div className="mb-6 text-center">
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-2">노출 상세 및 영역 안내</h3>
                            <div className="w-12 h-1 bg-[#f82b60] mx-auto rounded-full"></div>
                        </div>

                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src={selectedImage || ''}
                                alt="Ad Placement Guide Full"
                                width={1000}
                                height={1500}
                                className="max-width-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 md:-top-10 right-0 md:-right-16 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/20 shadow-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
