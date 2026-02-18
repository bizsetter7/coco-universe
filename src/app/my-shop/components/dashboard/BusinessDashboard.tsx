'use client';

import React from 'react';
import { ChevronLeft, Store, MapPin, Check, PlusSquare, RefreshCw, Calendar, List, LogOut, CreditCard, User, Settings } from 'lucide-react';
import { getHighlighterStyle } from '@/utils/highlighter';
import { IconBadge } from '@/components/common/IconBadge';

interface BusinessDashboardProps {
    brand: any;
    shopName: string;
    nickname: string;
    isVerified: boolean;
    handleAdClick: (isNew: boolean, ad?: any) => void;
    setShowDesignModal: (v: boolean) => void;
    setView: (v: any) => void;
    router: any;
    ads?: any[];
    onOpenMenu?: () => void;
    onShowAdDetail?: (ad: any) => void;
    onDeleteAd?: (adId: string) => void;
}

const TIER_COLORS: Record<string, string> = {
    p1: 'bg-[#8B5CF6]', // GRAND
    p2: 'bg-[#EF4444]', // PREMIUM
    p3: 'bg-[#3B82F6]', // DELUXE
    p4: 'bg-[#10B981]', // SPECIAL
    p5: 'bg-[#F97316]', // URGENT
    p7: 'bg-[#E2E8F0]'  // NORMAL
};

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
    brand, shopName, nickname, isVerified, handleAdClick, setShowDesignModal, setView, router, ads = [], onOpenMenu, onShowAdDetail, onDeleteAd
}) => {
    const [activeTab, setActiveTab] = React.useState<'ongoing' | 'closed'>('ongoing');

    const ongoingAds = ads.filter(ad => !ad.isClosed);
    const closedAds = ads.filter(ad => ad.isClosed);
    const displayedAds = activeTab === 'ongoing' ? ongoingAds : closedAds;

    // Helper to get tier label
    const getTierLabel = (ad: any) => {
        const pt = (ad.productType || ad.ad_type || ad.options?.product_type || 'p7').toLowerCase();
        if (pt.includes('grand') || pt === 'p1' || pt.includes('그랜드')) return 'T1';
        if (pt.includes('premium') || pt === 'p2' || pt.includes('프리미엄')) return 'T2';
        if (pt === 'p3') return 'T3';
        if (pt === 'p4') return 'T4';
        if (pt === 'p5') return 'T5';
        if (pt === 'p6') return 'T6';
        return 'T7';
    };

    const getTierColor = (ad: any) => {
        const pt = (ad.productType || ad.ad_type || ad.options?.product_type || 'p7').toLowerCase();
        if (pt.includes('grand') || pt === 'p1' || pt.includes('그랜드')) return TIER_COLORS.p1;
        if (pt.includes('premium') || pt === 'p2' || pt.includes('프리미엄')) return TIER_COLORS.p2;
        if (pt === 'p3') return TIER_COLORS.p3;
        if (pt === 'p4') return TIER_COLORS.p4;
        if (pt === 'p5') return TIER_COLORS.p5;
        return TIER_COLORS.p7;
    };

    return (
        <div className="w-full space-y-3 md:space-y-6 pb-20">
            <header className="flex flex-col gap-2 md:gap-4 mb-2 md:mb-4">
                <div className={`p-4 md:p-6 sm:rounded-[32px] shadow-sm border relative ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-pink-600'} `}>
                                <Store size={32} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className={`text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} `}>{shopName}</h2>
                                    {isVerified && <Check size={16} className="text-blue-500" strokeWidth={3} />}
                                </div>
                                <p className="text-sm text-gray-500 font-bold flex items-center gap-1">
                                    <MapPin size={14} /> 서울 강남구 테헤란로
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={() => setShowDesignModal(true)} className={`flex-1 md:flex-none py-3 px-5 rounded-xl text-sm font-bold border transition ${brand.theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} `}>
                                디자인 의뢰
                            </button>
                            <button onClick={() => handleAdClick(true)} className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-pink-500 text-white text-sm font-black hover:bg-pink-600 shadow-lg shadow-pink-500/30 transition flex items-center justify-center gap-2 whitespace-nowrap">
                                <PlusSquare size={18} /> 새 공고 등록
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Tabs */}
            <div className="flex gap-0 overflow-hidden rounded-xl border border-gray-200 font-black text-sm">
                <button
                    onClick={() => setActiveTab('ongoing')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 border-r border-gray-200 transition-colors ${activeTab === 'ongoing' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                    진행중인 채용정보 <span className={`px-2 py-0.5 rounded text-xs ${activeTab === 'ongoing' ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>{ongoingAds.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('closed')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'closed' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                    마감된 채용정보 <span className={`px-2 py-0.5 rounded text-xs ${activeTab === 'closed' ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>{closedAds.length}</span>
                </button>
            </div>

            <div className="space-y-4">
                {displayedAds.length === 0 ? (
                    <div className={`p-12 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center gap-2 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50/50 border-gray-200'} `}>
                        <List size={32} className="text-gray-300" />
                        <p className="text-gray-400 font-bold">{activeTab === 'ongoing' ? '진행중인 공고가 없습니다.' : '마감된 공고가 없습니다.'}</p>
                    </div>
                ) : (
                    displayedAds.map((ad: any) => (
                        <div key={ad.id} className={`p-6 rounded-2xl border transition shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 hover:bg-gray-800/50' : 'bg-white border-gray-100 hover:shadow-md'} `}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex gap-2 text-[11px] items-center font-black">
                                        <span className={`${(ad.status === 'rejected' || ad.status === 'REJECTED') ? 'bg-red-100 text-red-500' : (ad.status === 'PENDING_REVIEW' ? 'bg-orange-100 text-orange-500' : (activeTab === 'ongoing' ? 'bg-pink-100 text-pink-500' : 'bg-gray-200 text-gray-500'))} px-2 py-0.5 rounded shadow-sm`}>
                                            {(ad.status === 'rejected' || ad.status === 'REJECTED') ? '반려' : (ad.status === 'PENDING_REVIEW' ? '심사중' : (activeTab === 'ongoing' ? '진행중' : '마감'))}
                                        </span>
                                        <div className="flex flex-col text-gray-400">
                                            {ad.approved_at && (
                                                <span>게시일: {new Date(ad.approved_at).toISOString().split('T')[0]}</span>
                                            )}
                                            <span>마감일: {ad.deadline || '2026-03-25'}</span>
                                        </div>
                                    </div>

                                    {/* Title & Tier/Icon Badges (Stacked Layout) */}
                                    <div className="flex flex-col gap-2 mb-3">
                                        {/* Tier & Options Line */}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {/* Tier Code Badge (Mirroring Payments: bg-gray-900) */}
                                            <span className="bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm shrink-0 whitespace-nowrap">
                                                {(() => {
                                                    const pt = (ad.productType || ad.ad_type || ad.options?.product_type || 'p7').toLowerCase();
                                                    const adProduct = [
                                                        { id: 'p1', code: 'T1' }, { id: 'p2', code: 'T2' }, { id: 'p3', code: 'T3' },
                                                        { id: 'p4', code: 'T4' }, { id: 'p5', code: 'T5' }, { id: 'p6', code: 'T6' }, { id: 'p7', code: 'T7' }
                                                    ].find(tp => tp.id === pt || pt.includes(tp.id));

                                                    if (pt.includes('grand')) return 'T1';
                                                    if (pt.includes('premium')) return 'T2';
                                                    return adProduct?.code || (pt === 'p7' ? 'T7' : 'AD');
                                                })()}
                                            </span>

                                            {/* Option Mini Badges (PaymentsView Mapping) */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {(ad.options?.icon || ad.selectedIcon) && (
                                                    <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm">아</span>
                                                )}
                                                {(ad.options?.highlighter || ad.selectedHighlighter) && (
                                                    <span className="bg-gray-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm">형</span>
                                                )}
                                                {(ad.options?.border && ad.options?.border !== 'none' || (ad.borderOption && ad.borderOption !== 'none')) && (
                                                    <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm">테</span>
                                                )}
                                                {(ad.options?.pay_suffixes || ad.options?.paySuffixes || ad.paySuffixes?.length > 0) && (
                                                    <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm">급</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Title Line (Under Badges) */}
                                        <h4
                                            onClick={() => onShowAdDetail?.(ad)}
                                            className={`font-black text-[17px] md:text-[19px] cursor-pointer hover:text-pink-500 transition leading-tight block w-full ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} `}
                                            style={getHighlighterStyle(ad.options?.highlighter || ad.selectedHighlighter)}
                                        >
                                            {ad.title}
                                        </h4>

                                        {/* [New] Rejection Reason Display */}
                                        {(ad.status === 'rejected' || ad.status === 'REJECTED') && ad.rejection_reason && (
                                            <div className="mt-1 p-3 bg-red-50 border border-red-100 rounded-xl animate-in slide-in-from-top-1 duration-300">
                                                <div className="flex gap-2">
                                                    <span className="text-[10px] font-black text-red-600 bg-white px-1.5 py-0.5 rounded shadow-sm h-fit shrink-0">거절사유</span>
                                                    <p className="text-[12px] font-bold text-red-700 leading-snug">
                                                        {ad.rejection_reason}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} `}>
                                        <span className="text-pink-600 font-extrabold uppercase">
                                            {(() => {
                                                const nick = ad.nickname || nickname || '';
                                                if (nick.includes('게스트') || nick === '관리자' || !nick) return '사업자';
                                                return nick;
                                            })()}
                                        </span>
                                        <span className="md:hidden"><br /></span>
                                        <span className="hidden md:inline"> | </span>
                                        {ad.regionCity || '지역 정보 없음'} {ad.regionGu || ''} | {ad.category || '종류'} | {ad.categorySub || '자유직종'}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 mt-3 md:mt-0 shrink-0 w-full md:w-auto">
                                    {/* [Feature] Monthly Edit Tracker - Clean Style */}
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
                                        <span className="text-[14px]">📝</span>
                                        <span className="text-[11px] font-black text-gray-500">월간 수정:</span>
                                        <span className={`text-[12px] font-black ${(ad.edit_count || 0) >= 25 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {ad.edit_count || 0}
                                        </span>
                                        <span className="text-[11px] font-bold text-gray-400">/ 30회</span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 items-center justify-end w-full md:w-auto">
                                        <button onClick={() => handleAdClick(false, ad)} className="px-3 py-2 border border-blue-200 text-blue-500 text-xs font-bold rounded-lg hover:bg-blue-50 transition">
                                            수정
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white text-xs font-black rounded-lg hover:bg-green-600 shadow-sm transition">
                                            <RefreshCw size={12} /> 점프
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white text-xs font-black rounded-lg hover:bg-blue-600 shadow-sm transition">
                                            <Calendar size={12} /> 연장
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteAd?.(ad.id);
                                            }}
                                            style={{
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: '2px solid #dc2626'
                                            }}
                                            className="px-3 py-2 text-xs font-bold rounded-lg hover:bg-red-600 transition"
                                        >
                                            삭제🔴
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Action Area (Applicants) */}
                            <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 mt-4 -mx-6 mb-[-24px] border-t ${brand.theme === 'dark' ? 'bg-gray-800/30 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                <button
                                    onClick={() => setView('applicants')}
                                    className="bg-gray-900 text-white px-4 py-2 text-[12px] font-black rounded-xl shadow-lg hover:bg-black transition active:scale-95"
                                >
                                    온라인 인재관리
                                </button>
                                <div className="flex gap-4 text-[13px] font-black">
                                    <span className="flex items-center gap-1.5 text-pink-500 bg-pink-50 dark:bg-pink-500/10 px-3 py-1 rounded-full"><User size={14} /> 지원자 {ad.applicantCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default BusinessDashboard;
