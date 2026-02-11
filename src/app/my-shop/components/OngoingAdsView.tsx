const TIER_GRADIENTS: Record<string, string> = {
    grand: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    premium: 'bg-gradient-to-r from-purple-600 to-pink-500',
    deluxe: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    special: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    urgent: 'bg-gradient-to-r from-rose-500 to-orange-400',
    recommended: 'bg-gradient-to-r from-indigo-500 to-violet-400',
    native: 'bg-gray-100',
    common: 'bg-gray-50'
};

const PAY_TYPE_BADGES: Record<string, string> = {
    '시급': 'bg-red-100 text-red-600',
    '일급': 'bg-blue-100 text-blue-600',
    '주급': 'bg-green-100 text-green-600',
    '월급': 'bg-purple-100 text-purple-600',
    '건별': 'bg-gray-100 text-gray-600',
};

export const OngoingAdsView = ({
    setView, ads = [], userName = '', onShowAdDetail, onOpenMenu, onEditAd
}: {
    setView: (v: any) => void,
    ads?: any[],
    userName?: string,
    onShowAdDetail?: (ad: any) => void,
    onOpenMenu?: () => void,
    onEditAd?: (ad: any) => void
}) => {
    const brand = useBrand();
    return (
        <div className="space-y-4 md:space-y-6">
            <div className={`relative p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>

                <div className="flex items-center gap-3 md:gap-4 pr-10 md:pr-0">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-pink-600'} `}>
                        <List size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className={`text-lg md:text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>진행중인 채용정보</h2>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 md:pt-10">
                {ads.length === 0 ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center">
                        <p className={`font-bold text-lg ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>등록된 공고가 없습니다.</p>
                        <p className="text-sm text-gray-500 mt-2">새 공고를 등록하여 인재를 찾아보세요!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {ads.map((ad: any) => {
                            // Determine Tier
                            const tier = ad.productType === '그랜드' || ad.productType === 'p1' ? 'grand' :
                                ad.productType === '프리미엄' || ad.productType === 'p2' ? 'premium' :
                                    ad.productType === '스페셜' ? 'special' : 'common';

                            const headerBg = TIER_GRADIENTS[tier] || TIER_GRADIENTS['common'];
                            const isPremiumCore = tier === 'grand' || tier === 'premium';

                            return (
                                <div key={ad.id} className={`${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden relative shadow-sm transition hover:shadow-md`}>
                                    {/* Header Strip for Premium Ads */}
                                    {isPremiumCore && (
                                        <div className={`h-1.5 w-full ${headerBg}`}></div>
                                    )}

                                    <div className="p-4 md:p-6 pb-0">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="space-y-2.5">
                                                {/* Top info row */}
                                                <div className="flex gap-2 text-[11px] items-center font-black">
                                                    <span className={`${ad.status === 'PENDING_REVIEW' ? 'bg-orange-100 text-orange-500' : 'bg-pink-100 text-pink-500'} px-2 py-0.5 rounded`}>
                                                        {ad.status === 'PENDING_REVIEW' ? '심사중' : '진행중'}
                                                    </span>
                                                    <span className="text-gray-400">마감일: {ad.deadline || '2026-03-25'}</span>

                                                    {isPremiumCore && (
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] items-center gap-1 hidden md:flex ${headerBg} text-white`}>
                                                            {tier === 'grand' ? '👑 GRAND' : '🔥 PREMIUM'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h4
                                                    onClick={() => onShowAdDetail?.(ad)}
                                                    className={`font-black text-[16px] md:text-[17px] line-clamp-1 cursor-pointer hover:text-pink-500 transition ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} leading-tight`}
                                                >
                                                    {isPremiumCore && <span className="mr-1.5 text-lg">{tier === 'grand' ? '👑' : '🔥'}</span>}
                                                    {ad.title}
                                                </h4>

                                                {/* Info Badges & Text */}
                                                <div className={`flex flex-wrap items-center gap-2 text-xs font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} `}>
                                                    <span className={`px-1.5 py-0.5 rounded ${PAY_TYPE_BADGES[(ad.payType || '').substring(0, 2)] || 'bg-gray-100 text-gray-600'}`}>
                                                        {ad.payType || '급여협의'}
                                                    </span>
                                                    <span>{ad.regionCity} {ad.regionGu}</span>
                                                    <span className="w-px h-2.5 bg-gray-300 mx-0.5"></span>
                                                    <span>{ad.category}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-1.5 shrink-0 items-center justify-center md:justify-end pb-4 md:pb-0">
                                                <button
                                                    onClick={() => onEditAd?.(ad)}
                                                    className="px-3 py-2 border border-blue-200 text-blue-500 text-xs font-bold rounded-lg hover:bg-blue-50 transition"
                                                >
                                                    수정
                                                </button>
                                                <button className="px-3 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition">마감</button>
                                                <button className="flex items-center gap-1.2 px-3 py-2 bg-green-500 text-white text-xs font-black rounded-lg hover:bg-green-600 shadow-sm transition">
                                                    <RefreshCw size={12} /> 점프
                                                </button>
                                                <button className="flex items-center gap-1.2 px-3 py-2 bg-blue-500 text-white text-xs font-black rounded-lg hover:bg-blue-600 shadow-sm transition">
                                                    <Calendar size={12} /> 연장
                                                </button>
                                                <button className="px-3 py-2 border border-red-100 text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 transition">삭제</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Action Area (Applicants) */}
                                    <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 mt-4 border-t ${brand.theme === 'dark' ? 'bg-gray-800/30 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
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
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
