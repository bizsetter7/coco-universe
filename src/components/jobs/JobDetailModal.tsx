import React, { useEffect } from 'react';
import { X, MessageSquare, Phone } from 'lucide-react';
import { Shop } from '@/types/shop';

interface JobDetailModalProps {
    shop: Shop | null;
    onClose: () => void;
}

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

const JobDetailModal: React.FC<JobDetailModalProps> = ({ shop, onClose }) => {
    useEffect(() => {
        if (shop) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [shop]);

    if (!shop) return null;

    return (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            {/* Modal Container: Mobile 90-100%, Tablet 600px, PC 800px */}
            <div
                className="
                    bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden relative flex flex-col 
                    w-full md:w-[600px] lg:w-[800px] 
                    max-h-[90vh] lg:max-h-[80vh]
                    animate-in fade-in zoom-in duration-200
                "
                onClick={e => e.stopPropagation()}
            >

                {/* Modal Header */}
                <div className={`p-6 md:p-8 text-center relative shrink-0 ${shop.tier && TIER_GRADIENTS[shop.tier]
                    ? `${TIER_GRADIENTS[shop.tier]} text-white`
                    : 'bg-white text-gray-900 border-b border-gray-100'
                    }`}>
                    <button onClick={onClose} className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${shop.tier && ['grand', 'premium', 'special'].includes(shop.tier) ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                        <X size={24} />
                    </button>

                    <div className="mb-2">
                        <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold mb-3 ${shop.tier && ['grand', 'premium', 'special'].includes(shop.tier) ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {shop.workType}
                        </span>
                    </div>
                    <h2 className={`text-2xl md:text-3xl font-black mb-2 leading-tight ${shop.tier && ['grand', 'premium', 'special'].includes(shop.tier) ? 'text-white' : 'text-gray-900'}`}>
                        {shop.realName || shop.name}
                    </h2>
                    <p className={`font-medium ${shop.tier && ['grand', 'premium', 'special'].includes(shop.tier) ? 'text-white/80' : 'text-gray-500'}`}>
                        {shop.region}
                    </p>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white dark:bg-gray-900">

                    {/* Key Info Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl text-center border border-red-100 dark:border-red-900/30 flex flex-col justify-center gap-1.5">
                            <p className="text-xs text-red-500 font-bold mb-0.5">급여</p>
                            <p className="text-red-600 dark:text-red-400 font-black text-xl truncate leading-tight">
                                {(() => {
                                    const payVal = shop.pay || '';
                                    if (!isNaN(Number(payVal))) {
                                        return `${Number(payVal).toLocaleString()}원`;
                                    }
                                    return payVal;
                                })()}
                            </p>
                            {shop.options?.paySuffixes && shop.options.paySuffixes.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-center mt-0.5">
                                    {shop.options.paySuffixes.map((suffix, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-red-100/50 text-red-600 text-[9px] rounded font-bold border border-red-200/50 leading-none">
                                            {suffix}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl text-center border border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 font-bold mb-1">근무시간</p>
                            <p className="text-gray-900 dark:text-gray-100 font-black text-lg truncate">시간협의</p>
                        </div>
                    </div>

                    {/* Detailed Recruitment Content */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-black flex items-center gap-2 text-gray-900 dark:text-white">
                            <MessageSquare size={20} className="text-gray-400" />
                            상세 모집내용
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-sm md:text-base leading-relaxed text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap border border-gray-100 dark:border-gray-700">
                            {shop.title || '등록된 상세 모집 내용이 없습니다.'}
                            {'\n\n'}
                            {/* Mocking long text for better visualization if content is short */}
                            {(!shop.title || shop.title.length < 50) &&
                                `가족같이 편안한 분위기에서 함께 일하실 분 모십니다!\n\n[자격요건]\n- 성별 무관\n- 초보 가능 (친절하게 알려드립니다)\n- 경력자 우대\n\n[근무조건]\n- 근무기간: 3개월 이상\n- 근무요일: 요일협의\n- 근무시간: 시간협의\n\n저희와 함께 즐겁게 일하실 분들의 많은 지원 부탁드립니다. 궁금한 점은 언제든지 문의주세요!`}
                        </div>
                    </div>

                    {/* Contact Info (Kakao) */}
                    {shop.kakao && (
                        <div className="flex items-center justify-between p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900">
                                    <MessageSquare size={20} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-bold">카카오톡 아이디</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">{shop.kakao}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { navigator.clipboard.writeText(shop.kakao || ''); alert('복사되었습니다!'); }}
                                className="px-4 py-2 bg-white dark:bg-gray-800 text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                복사하기
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Footer (Sticky) */}
                <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                    <a
                        href={`tel:${shop.phone}`}
                        className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-xl text-xl shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all"
                    >
                        <Phone size={24} className="mr-2" />
                        전화로 문의하기
                    </a>
                </div>

            </div>
        </div>
    );
};

export default JobDetailModal;
