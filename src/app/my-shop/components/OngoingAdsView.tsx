import React from 'react';
import { List, RefreshCw, Calendar, User } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';
import { getHighlighterStyle } from '../../../utils/highlighter';
import { DETAILED_PRICING } from '../constants';
import { IconBadge } from '@/components/common/IconBadge';

const TIER_GRADIENTS: Record<string, string> = {
    grand: 'bg-[#8B5CF6]',       // 보라 (Purple/Violet)
    premium: 'bg-[#EF4444]',     // 빨강 (Red)
    p1: 'bg-[#8B5CF6]',
    p2: 'bg-[#EF4444]',
    p3: 'bg-[#3B82F6]',
    p4: 'bg-[#10B981]',
    p5: 'bg-[#F97316]',
    p6: 'bg-[#94A3B8]',
    p7: 'bg-[#E2E8F0]'
};

export const OngoingAdsView = ({
    setView, ads = [], userName = '', onShowAdDetail, onOpenMenu, onEditAd, onDeleteAd
}: {
    setView: (v: any) => void,
    ads?: any[],
    userName?: string,
    onShowAdDetail?: (ad: any) => void,
    onOpenMenu?: () => void,
    onEditAd?: (ad: any) => void,
    onDeleteAd?: (adId: any) => void
}) => {
    const brand = useBrand();

    // Helper to get tier label
    const getTierLabel = (ad: any) => {
        const pt = (ad.tier || ad.productType || ad.ad_type || ad.options?.product_type || 'p7').toLowerCase();
        if (pt.includes('grand') || pt === 'p1' || pt.includes('그랜드')) return 'T1';
        if (pt.includes('premium') || pt === 'p2' || pt.includes('프리미엄')) return 'T2';
        if (pt === 'p3') return 'T3';
        if (pt === 'p4') return 'T4';
        if (pt === 'p5') return 'T5';
        if (pt === 'p6') return 'T6';
        return 'T7';
    };

    const getTierColor = (ad: any) => {
        const pt = (ad.tier || ad.productType || ad.ad_type || ad.options?.product_type || 'p7').toLowerCase();
        if (pt.includes('grand') || pt === 'p1' || pt.includes('그랜드')) return TIER_GRADIENTS.grand;
        if (pt.includes('premium') || pt === 'p2' || pt.includes('프리미엄')) return TIER_GRADIENTS.premium;
        if (pt === 'p3') return TIER_GRADIENTS.p3;
        if (pt === 'p4') return TIER_GRADIENTS.p4;
        if (pt === 'p5') return TIER_GRADIENTS.p5;
        return TIER_GRADIENTS.p7;
    };

    return (
        <div className="space-y-4 md:space-y-6 pb-20">
            <div className="relative p-1 rounded-[24px] md:rounded-[32px] shadow-sm border bg-white border-gray-100">
                <div className="bg-white rounded-[20px] md:rounded-[28px] p-4 md:p-5 relative shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 md:gap-4 pr-10 md:pr-0">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white bg-blue-600`}>
                            <List size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className={`text-lg md:text-xl font-black !text-gray-900`}>진행중인 채용정보</h2>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6 md:pt-10">
                    {ads.length === 0 ? (
                        <div className="min-h-[300px] flex flex-col items-center justify-center">
                            <List size={48} className="text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold">진행중인 공고가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 px-4 md:px-8 pb-8">
                            {ads.filter(ad => ad.status !== 'CLOSED' && ad.status !== 'closed').map((ad) => (
                                <div
                                    key={ad.id}
                                    className={`group relative p-5 md:p-6 rounded-[28px] border transition-all duration-300 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 hover:shadow-xl hover:border-blue-100'}`}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-5">
                                        <div className="flex-1 min-w-0">
                                            {/* Status Badge Line */}
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className={`${ad.status === 'rejected' || ad.status === 'REJECTED' ? 'bg-red-100 text-red-500' :
                                                    ad.status === 'PENDING_REVIEW' || ad.status === 'pending' ? 'bg-orange-100 text-orange-500' :
                                                        'bg-blue-100 text-blue-500'
                                                    } px-2 py-0.5 rounded text-[10px] font-black shrink-0 uppercase tracking-tighter shadow-sm`}>
                                                    {ad.status === 'rejected' || ad.status === 'REJECTED' ? '반려' :
                                                        ad.status === 'PENDING_REVIEW' || ad.status === 'pending' ? '심사중' :
                                                            '진행중'}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                                    마감일: {ad.deadline || '2026-03-25'}
                                                </span>
                                            </div>

                                            {/* Title & Product Badges (Stacked Layout) */}
                                            <div className="flex flex-col gap-2 mb-3">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="bg-gray-900 text-white text-[9.5px] px-2 py-0.5 rounded-sm font-black shadow-sm shrink-0 whitespace-nowrap tracking-tighter">
                                                        {getTierLabel(ad)}
                                                    </span>
                                                    {ad.selectedIcon && <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black">아</span>}
                                                    {ad.selectedHighlighter && <span className="bg-gray-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black">형</span>}
                                                    {ad.borderOption && ad.borderOption !== 'none' && <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black">테</span>}
                                                    {ad.paySuffixes && ad.paySuffixes.length > 0 && <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black">급</span>}
                                                </div>
                                                <h3
                                                    onClick={() => onShowAdDetail?.(ad)}
                                                    className={`text-[17px] md:text-[19px] font-black leading-tight cursor-pointer hover:text-blue-500 transition-colors line-clamp-1 break-all ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                                    style={getHighlighterStyle(ad.selectedHighlighter)}
                                                >
                                                    {ad.title}
                                                </h3>

                                                {/* [New] Rejection Reason Display */}
                                                {(ad.status === 'rejected' || ad.status === 'REJECTED') && ad.rejection_reason && (
                                                    <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl animate-in slide-in-from-top-1 duration-300">
                                                        <div className="flex gap-2">
                                                            <span className="text-[9px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded shadow-sm h-fit shrink-0">거절 사유</span>
                                                            <p className="text-[11px] font-bold text-red-700 leading-snug">
                                                                {ad.rejection_reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className={`flex flex-wrap items-center gap-2 text-xs font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <span className="text-blue-600 font-extrabold text-[13px]">
                                                        {(() => {
                                                            const nick = ad.nickname || '';
                                                            if (nick.includes('게스트') || nick === '관리자' || !nick) return '사업자';
                                                            return nick;
                                                        })()}
                                                    </span>
                                                    <span className="w-px h-2.5 bg-gray-300 mx-0.5"></span>
                                                    <span className="shrink-0">{ad.regionCity || '지역 정보 없음'} {ad.regionGu || ''}</span>
                                                    <span className="w-px h-2.5 bg-gray-300 mx-0.5"></span>
                                                    <span className="truncate">
                                                        {ad.category} | {ad.categorySub || '자유직종'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action 영역: 수정 횟수와 버튼들 */}
                                            <div className="flex flex-col items-start md:items-end gap-2 mt-4">
                                                {/* [Feature] Monthly Edit Tracker - Always Visible */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-gray-200 bg-gray-50 shadow-sm">
                                                    <span className="text-[14px]">📝</span>
                                                    <span className="text-[11px] font-black text-gray-500">월간 수정:</span>
                                                    <span className={`text-[12px] font-black ${(ad.edit_count || 0) >= 25 ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {ad.edit_count || 0}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-gray-400">/ 30회</span>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5 shrink-0 items-center justify-start md:justify-end pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEditAd?.(ad); }}
                                                        className="px-3 py-2 border border-blue-200 text-blue-500 text-xs font-bold rounded-lg hover:bg-blue-50 transition"
                                                    >
                                                        수정
                                                    </button>
                                                    <button className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white text-xs font-black rounded-lg hover:bg-green-600 shadow-sm transition">
                                                        <RefreshCw size={12} /> 점프
                                                    </button>
                                                    <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white text-xs font-black rounded-lg hover:bg-blue-600 shadow-sm transition">
                                                        <Calendar size={12} /> 연장
                                                    </button>
                                                    <button
                                                        data-delete-btn="v2026021606"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                                                            if (onDeleteAd) {
                                                                onDeleteAd(ad.id);
                                                            }
                                                        }} style={{
                                                            position: 'relative',
                                                            zIndex: 9999,
                                                            pointerEvents: 'auto',
                                                            touchAction: 'auto',
                                                            backgroundColor: '#ef4444',
                                                            color: 'white',
                                                            border: '2px solid #dc2626',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        삭제🔴
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Section (Applicants) */}
                                    <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 mt-4 -mx-5 md:-mx-6 border-t ${brand.theme === 'dark' ? 'bg-gray-800/30 border-gray-800' : 'bg-gray-50 border-gray-100'} rounded-b-[28px]`}>
                                        <button
                                            onClick={() => setView('applicants')}
                                            className="bg-gray-900 text-white px-4 py-2 text-[12px] font-black rounded-xl shadow-lg hover:bg-black transition active:scale-95"
                                        >
                                            온라인 인재관리
                                        </button>
                                        <div className="flex gap-4 text-[13px] font-black">
                                            <span className="flex items-center gap-1.5 text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full">
                                                <User size={14} /> 지원자 {ad.applicantCount || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// Force rebuild 20260216070628
