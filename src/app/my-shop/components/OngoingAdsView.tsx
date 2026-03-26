import React from 'react';
import { List, RefreshCw, Calendar, User, ChevronLeft, Zap } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';
import { getHighlighterStyle } from '@/utils/highlighter';
import { IconBadge } from '@/components/common/IconBadge';
import { DETAILED_PRICING } from '../constants';

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
    setView, ads = [], userName = '', jumpBalance = 0, onShowAdDetail, onOpenMenu, onEditAd, onDeleteAd, onJumpAd
}: {
    setView: (v: any) => void,
    ads?: any[],
    userName?: string,
    jumpBalance?: number,
    onShowAdDetail?: (ad: any) => void,
    onOpenMenu?: () => void,
    onEditAd?: (ad: any) => void,
    onDeleteAd?: (adId: any) => void,
    onJumpAd?: (adId: any) => void,
}) => {
    const brand = useBrand();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // KST timezone today calculation
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

    // Helper to get tier label
    const getTierLabel = (ad: any) => {
        if (!ad) return 'T7';
        const pt = (ad.productType || ad.ad_type || ad.options?.product_type || 'p7').toLowerCase();
        if (pt.includes('grand') || pt === 'p1' || pt.includes('그랜드')) return 'T1';
        if (pt.includes('premium') || pt === 'p2' || pt.includes('프리미엄')) return 'T2';
        if (pt === 'p3') return 'T3';
        if (pt === 'p4') return 'T4';
        if (pt === 'p5') return 'T5';
        if (pt === 'p6') return 'T6';
        return 'T7';
    };

    if (!isMounted) return <div className="p-12 text-center text-gray-400 font-bold min-h-screen">로딩 중...</div>;

    const activeAds = ads.filter(ad => ad.status !== 'CLOSED' && ad.status !== 'closed');

    return (
        <div className="space-y-4 md:space-y-6 pb-20">
            {/* Header with Jump Balance Info */}
            <div className={`p-4 md:p-6 sm:rounded-[32px] shadow-sm border mb-5 mt-2 md:mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className={`text-xl md:text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userName} 공고 현황</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-xs text-gray-400 font-bold">실시간 진행중인 공고 관리</p>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-4 ${brand.theme === 'dark' ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/20">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">My Jump Balance</p>
                        <p className="text-lg font-black text-blue-600">
                            {jumpBalance.toLocaleString()} <span className="text-xs text-gray-400 ml-0.5">회</span>
                        </p>
                    </div>
                    <button onClick={() => setView('buy-points')} className="ml-2 px-4 py-2 bg-gray-900 text-white text-[12px] font-black rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200">
                        충전하기
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {activeAds.length === 0 ? (
                    <div className={`p-16 rounded-[32px] border border-dashed text-center flex flex-col items-center justify-center gap-4 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50/50 border-gray-200'}`}>
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                           <List size={32} />
                        </div>
                        <p className="text-gray-400 font-bold">현재 진행 중인 채용정보가 없습니다.</p>
                        <button onClick={() => setView('form')} className="px-6 py-2.5 bg-[#f82b60] text-white rounded-xl font-black text-sm hover:translate-y-[-2px] transition-transform shadow-lg shadow-rose-200">첫 공고 등록하기</button>
                    </div>
                ) : (
                    activeAds.map((ad) => {
                        const tLabel = getTierLabel(ad);
                        const limit = (tLabel === 'T1' || tLabel === 'T2') ? 15 : (tLabel === 'T3' || tLabel === 'T4') ? 10 : (tLabel === 'T5' || tLabel === 'T6') ? 8 : 5;
                        const options = ad.options || {};
                        const lastDate = options.last_manual_jump_date || ad.last_manual_jump_date || ad.last_jump_date;
                        const usedCount = lastDate === today ? (options.daily_manual_jump_count || ad.daily_manual_jump_count || 0) : 0;
                        const remainCount = Math.max(0, limit - usedCount);
                        const isExhausted = remainCount <= 0;

                        return (
                            <div key={ad.id} className={`p-6 rounded-[32px] border transition-all duration-300 shadow-sm overflow-hidden group ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 hover:bg-gray-800/50' : 'bg-white border-gray-100 hover:shadow-xl hover:border-blue-100 hover:translate-y-[-2px]'}`}>
                                <div className="flex flex-col md:flex-row justify-between gap-6 relative">
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <span className="bg-gray-900 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black shadow-sm uppercase tracking-tighter">
                                                {tLabel} 등급
                                            </span>
                                            <span className={`${ad.status === 'rejected' || ad.status === 'REJECTED' ? 'bg-red-100 text-red-500' : 
                                                ad.status === 'PENDING_REVIEW' || ad.status === 'pending' ? 'bg-orange-100 text-orange-500' : 
                                                'bg-blue-100 text-blue-500'} px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm`}>
                                                {ad.status === 'rejected' || ad.status === 'REJECTED' ? '반려' : 
                                                 ad.status === 'PENDING_REVIEW' || ad.status === 'pending' ? '심사중' : '진행중'}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                                                <Calendar size={12} /> {ad.approved_at ? new Date(ad.approved_at).toLocaleDateString() : '심사 대기'}
                                            </span>
                                        </div>

                                        <h4
                                            onClick={() => onShowAdDetail?.(ad)}
                                            className={`font-black text-xl md:text-2xl cursor-pointer hover:text-blue-500 transition-colors leading-tight line-clamp-1 break-all flex items-center gap-1.5 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                            style={getHighlighterStyle(options.highlighter || ad.selectedHighlighter)}
                                        >
                                            {(options.icon || ad.selectedIcon) && (
                                                <IconBadge iconId={options.icon || ad.selectedIcon} />
                                            )}
                                            {ad.title}
                                        </h4>

                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 flex-wrap">
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                <span className="text-gray-400">월간 수정</span>
                                                <span className={`${(ad.edit_count || 0) >= 28 ? 'text-red-600 animate-pulse' : (ad.edit_count || 0) >= 20 ? 'text-orange-500' : 'text-gray-900'} font-black`}>
                                                    {ad.edit_count || 0}/30
                                                </span>
                                            </div>
                                            <div className="h-4 w-px bg-gray-200 hidden md:block" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-400">마감일</span>
                                                <span className="text-gray-600 font-black">{ad.deadline || '상시채용'}</span>
                                            </div>
                                            <div className="h-4 w-px bg-gray-200 hidden md:block" />
                                            <div className="flex items-center gap-1.5">
                                                <User size={14} className="text-blue-500" />
                                                <span className="text-gray-400">지원자</span>
                                                <span className="text-blue-600 font-black">{ad.applicantCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Area */}
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        {/* Jump Status Card */}
                                        <div className={`p-4 rounded-2xl border min-w-[200px] shadow-sm ${isExhausted ? 'bg-gray-50 border-gray-200' : 'bg-blue-50/30 border-blue-100'} `}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Free Daily Jump</span>
                                                <span className={`text-xs font-black ${isExhausted ? 'text-gray-500' : 'text-blue-600'}`}>{usedCount}/{limit}</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3 shadow-inner">
                                                <div 
                                                    className={`h-full transition-all duration-700 ease-out ${isExhausted ? 'bg-gray-400' : 'bg-blue-500'} `} 
                                                    style={{ width: `${Math.min(100, (usedCount / limit) * 100)}%` }}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => onJumpAd?.(ad.id)}
                                                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black transition-all active:scale-95 ${isExhausted ? 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'} `}
                                            >
                                                <RefreshCw size={14} className={usedCount > 0 && !isExhausted ? 'animate-spin-slow' : ''} /> 
                                                {isExhausted ? '유료 점프 사용' : '무료 점프 실행'}
                                            </button>
                                            {isExhausted && jumpBalance > 0 && (
                                                <p className="text-[10px] text-center mt-2 font-bold text-gray-400 italic">
                                                    유료 잔여: {jumpBalance.toLocaleString()}회
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2 w-full">
                                            <button onClick={() => onEditAd?.(ad)} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all font-black">수정</button>
                                            <button onClick={() => onDeleteAd?.(ad.id)} className="px-4 py-2 bg-white border border-red-100 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all font-black">삭제</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
