'use client';

import React from 'react';
import Image from 'next/image';
import { Megaphone, Zap, Crown, Star, FileText, CheckCircle2, ChevronRight, PhoneCall, MessageCircle } from 'lucide-react';
import { AD_TIERS, DETAILED_PRICING } from './constants';
import { ExposureItem } from './ExposureItem';

interface Brand {
    name: string;
    theme: string;
}

interface AdGuideTabProps {
    brand: Brand;
    setPaymentInitialTier: (tier: string) => void;
    setIsPaymentPopupOpen: (open: boolean) => void;
    setSelectedImage: (src: string) => void;
}

export const AdGuideTab = ({ brand, setPaymentInitialTier, setIsPaymentPopupOpen, setSelectedImage }: AdGuideTabProps) => {
    return (
        <div className="space-y-8">
            <div className="text-center py-6 md:py-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-[40px] text-white shadow-xl shadow-pink-200/50 relative overflow-hidden border border-pink-400">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Zap size={150} strokeWidth={3} className="text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tighter text-white">효과적인 구인의 시작 🚀</h2>
                <p className="text-pink-50 text-[13px] md:text-sm font-black tracking-tight opacity-90">가장 확실한 구인은 {brand.name} 프리미엄 광고와 함께하세요.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {AD_TIERS.map((tier) => (
                    <div
                        key={tier.id}
                        onClick={() => {
                            setPaymentInitialTier(tier.id);
                            setIsPaymentPopupOpen(true);
                        }}
                        className={`w-full md:w-auto p-3.5 md:p-4 rounded-[28px] border shadow-sm flex flex-col transition-all hover:scale-[1.02] active:scale-95 cursor-pointer hover:border-pink-500 hover:shadow-md hover:z-10 relative ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${tier.id === 'grand' ? (brand.theme === 'dark' ? 'border-pink-900/50 shadow-lg shadow-pink-900/20 hover:bg-pink-900/30' : 'border-pink-300 shadow-lg shadow-pink-100/50 hover:bg-pink-50') : (brand.theme === 'dark' ? 'border-gray-700 hover:bg-pink-900/30' : 'border-gray-200 hover:bg-pink-50')}`}
                    >
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className={`p-3 md:p-3.5 rounded-2xl shadow-inner text-pink-600 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-pink-50'}`}>
                                <tier.icon size={22} />
                            </div>
                            {tier.id === 'grand' && <span className="bg-pink-600 text-white text-[9px] md:text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest">Top Tier</span>}
                        </div>
                        <h3 className={`text-lg md:text-lg font-black mb-1 tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                        <p className="text-pink-600 font-black text-base md:text-base mb-4 md:mb-6 tracking-tighter leading-none">{tier.price.split(' ')[0]}</p>

                        <div className="flex-1 space-y-2 md:space-y-2.5 mb-4">
                            {tier.benefits.map((benefit, i) => (
                                <p key={i} className={`text-xs md:text-xs flex items-start gap-2.5 font-bold leading-relaxed ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}`}>
                                    <CheckCircle2 size={14} className="text-pink-600 shrink-0 mt-0.5" />
                                    <span>{benefit}</span>
                                </p>
                            ))}
                        </div>
                        <div className={`mt-auto pt-4 border-t ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-50'} flex items-center justify-between group/btn`}>
                            <span className={`text-[11px] font-black ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} group-hover/btn:text-pink-600 transition-colors`}>상세보기</span>
                            <ChevronRight size={14} className={`${brand.theme === 'dark' ? 'text-gray-600' : 'text-gray-300'} group-hover/btn:text-pink-600 group-hover/btn:translate-x-1 transition-all`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className={`rounded-[45px] border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-100 shadow-xl shadow-gray-100/30'}`}>
                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="space-y-2">
                            <span className="text-pink-600 text-xs font-black uppercase tracking-widest">Detailed Pricing</span>
                            <h3 className={`text-2xl md:text-4xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>광고 상품 상세 단가표 💎</h3>
                        </div>
                        <div className="bg-pink-50 dark:bg-pink-900/20 px-4 py-2 rounded-full border border-pink-100 dark:border-pink-800">
                            <p className="text-pink-600 text-xs font-black italic">VAT 포함 최종 결제 금액 기준입니다.</p>
                        </div>
                    </div>

                    <div className="hidden md:block overflow-hidden rounded-[30px] border border-gray-200 dark:border-gray-800 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-8 py-5">노출 영역</th>
                                    <th className="px-8 py-5">광고 상품명</th>
                                    <th className="px-8 py-5 text-center">30일 권</th>
                                    <th className="px-8 py-5 text-center">60일 권 (10%↓)</th>
                                    <th className="px-8 py-5 text-center">90일 권 (20%↓)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {DETAILED_PRICING.map((item, idx) => (
                                    <tr key={idx} className={`${brand.theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-pink-50/20'} transition-colors`}>
                                        <td className="px-8 py-6 font-black text-pink-600 text-[11px] uppercase tracking-tighter">{item.type}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className={`text-[15px] font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</span>
                                                <span className="text-[11px] text-gray-400 font-medium leading-tight whitespace-pre-line mt-1">{item.benefit}</span>
                                            </div>
                                        </td>
                                        <td className={`px-8 py-6 text-center font-black ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{item.d30.toLocaleString()}원</td>
                                        <td className="px-8 py-6 text-center font-black text-pink-600">
                                            <div className="flex flex-col">
                                                <span>{item.d60.toLocaleString()}원</span>
                                                <span className="text-[10px] opacity-70">(-{(item.d30 * 2 - item.d60).toLocaleString()}원)</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center font-black text-rose-600">
                                            <div className="flex flex-col">
                                                <span>{item.d90.toLocaleString()}원</span>
                                                <span className="text-[10px] opacity-70">(-{(item.d30 * 3 - item.d90).toLocaleString()}원)</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden grid grid-cols-2 gap-2">
                        {DETAILED_PRICING.map((item, idx) => (
                            <div key={idx} className={`p-2.5 rounded-[24px] border flex flex-col justify-between shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-pink-600 uppercase tracking-tighter">{item.type}</span>
                                    <p className={`text-[12px] font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200/50 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400">30일</span>
                                        <span className={`text-[11px] font-black ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{item.d30.toLocaleString()}원</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 italic">BEST</span>
                                        <span className="text-[11px] font-black text-pink-600">{(item.d60 / 2).toLocaleString()}원/月</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-12 py-10">
                <div className="text-center space-y-4">
                    <h3 className={`text-3xl md:text-4xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>압도적인 노출 영역 안내 📢</h3>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                        <p className="text-gray-400 font-bold text-[13px] tracking-widest uppercase">Placement Guide</p>
                        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                    </div>
                </div>

                <div className="space-y-8 md:space-y-12">
                    <ExposureItem
                        title="메인 페이지 전국/지역 최상단 (그랜드 티어)"
                        pcSrc="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070"
                        mobileSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071"
                        desc={`메인 페이지 접속 시 가장 먼저 시선이 머무는 전국 및 지역별 최상단 독점 구좌입니다.\n가장 확실한 클릭수와 압도적인 구인 속도를 보장합니다.`}
                        brandTheme={brand.theme}
                        onImageClick={setSelectedImage}
                    />
                    <ExposureItem
                        title="지역별 프리미엄 배너 리스트 (프리미엄 티어)"
                        pcSrc="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070"
                        mobileSrc="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015"
                        desc={`설정하신 주요 타겟 지역 검색 시 리스트 상단에 배너 형태로 노출됩니다.\n이미지와 텍스트가 조화롭게 배치되어 주목도가 매우 높습니다.`}
                        brandTheme={brand.theme}
                        onImageClick={setSelectedImage}
                    />
                </div>
            </div>

            <div className={`p-8 md:p-12 rounded-[45px] border ${brand.theme === 'dark' ? 'bg-pink-900/10 border-pink-900/30' : 'bg-pink-50/50 border-pink-100'} text-center space-y-8`}>
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-full text-xs font-black uppercase tracking-widest animate-pulse">Hot Feature</div>
                    <h3 className={`text-2xl md:text-3xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>성공적인 구인을 위한 AI 타겟 노출 🤖</h3>
                    <p className={`text-sm md:text-base font-bold leading-relaxed opacity-80 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        광고를 올리시면 인근 지역 구직자들에게 앱 푸시 및 AI 추천 알림이 자동 발생합니다.<br />
                        시간과 비용을 낭비하지 마세요. 지금 바로 효과를 경험해보세요.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <button className="w-full md:w-auto px-10 py-5 bg-gray-900 text-white rounded-[24px] text-base font-black shadow-2xl hover:bg-black transition scale-105 active:scale-100">지금 바로 광고 신청하기 🚀</button>
                    <button className="w-full md:w-auto px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[24px] text-base font-black hover:bg-slate-50 transition">수익형 광고 제휴 문의</button>
                </div>
            </div>
        </div>
    );
};

export const TermsTab = ({ brand }: { brand: Brand }) => {
    return (
        <div className="space-y-10">
            <section id="terms" className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-6 bg-slate-50/10 dark:bg-white/5 p-2 rounded-xl md:bg-white/40 md:p-4 md:rounded-2xl md:border md:border-gray-100/50 md:dark:border-gray-800/50">
                    <div className="w-2 h-8 bg-pink-600 rounded-full"></div>
                    <h3 className={`text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>서비스 이용약관</h3>
                </div>
                <div className={`p-8 rounded-[30px] border leading-relaxed text-[14px] font-medium ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-600 shadow-sm'}`}>
                    <p className="mb-4 font-black text-gray-900 dark:text-white">제 1조 (목적)</p>
                    <p className="mb-6 ml-2 text-gray-500">본 약관은 {brand.name}(이하 &quot;회사&quot;)가 제공하는 온라인 구인구직 플랫폼 및 관련 제반 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
                    {/* ... other terms etc ... (I'll keep them condensed or just simplified) */}
                    <p className="mb-4 font-black text-gray-900 dark:text-white">제 2조 (서비스의 내용)</p>
                    <p className="mb-6 ml-2 text-gray-500">1. 회사가 제공하는 서비스는 구인공고 등록, 이력서 등록, 광고 대행, 인재 매칭 지원 서비스 등이 포함됩니다.<br />2. 회사는 서비스의 품질 향상을 위해 필요한 경우 서비스의 내용을 변경하거나 중단할 수 있습니다.</p>
                </div>
            </section>
            {/* Privacy and Youth can be added similarly */}
        </div>
    );
};
