'use client';

import React, { useState, useMemo } from 'react';
import { Megaphone, ChevronRight, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PRICING, getAdditionalAdLabel } from '@/data/pricing';

interface AdditionalAdViewProps {
    brand: any;
    ads: any[];
    userId: string;
    onOpenBankModal: (amount: number, title?: string) => void;
}

const DURATION_KEYS = ['1m', '3m', '6m'] as const;
type DurationKey = typeof DURATION_KEYS[number];

export const AdditionalAdView: React.FC<AdditionalAdViewProps> = ({
    brand, ads, userId, onOpenBankModal
}) => {
    const isDark = brand.theme === 'dark';
    const cardCls = `p-5 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`;
    const labelCls = `text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-400'}`;

    const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<DurationKey | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // 활성 광고 중 additional_ad_status가 none이거나 undefined인 것만 선택 가능
    const eligibleAds = useMemo(() =>
        ads.filter(a =>
            !a.isClosed &&
            a.status !== 'CLOSED' &&
            (a.additional_ad_status === 'none' || !a.additional_ad_status)
        ),
        [ads]
    );

    const selectedAd = eligibleAds.find(a => String(a.id) === String(selectedAdId));
    const selectedPrice = selectedDuration ? PRICING.additional_ad[selectedDuration].price : 0;

    // 플랫폼 ID (brand.domain에서 추출: 'cocoalba.kr' → 'cocoalba')
    const platformId = brand.domain?.split('.')[0] ?? 'cocoalba';

    const handleSubmit = async () => {
        if (!selectedAd) { alert('추가광고를 적용할 공고를 선택해주세요.'); return; }
        if (!selectedDuration) { alert('기간을 선택해주세요.'); return; }

        setSubmitting(true);
        try {
            const { error } = await supabase.from('payments').insert([{
                user_id: userId,
                shop_id: Number(selectedAd.id),
                amount: selectedPrice,
                method: 'bank_transfer',
                status: 'pending',
                pay_type: 'ADDITIONAL_AD',
                platform: platformId,
                description: `[추가광고] ${selectedAd.title || selectedAd.name} / ${selectedDuration === '1m' ? '1개월' : selectedDuration === '3m' ? '3개월' : '6개월'}`,
                metadata: {
                    type: 'additional_ad',
                    shop_id: Number(selectedAd.id),
                    ad_title: selectedAd.title || selectedAd.name,
                    duration_key: selectedDuration,
                    duration_days: PRICING.additional_ad[selectedDuration].duration_days,
                    discount_rate: PRICING.additional_ad[selectedDuration].discount_rate,
                },
                created_at: new Date().toISOString(),
            }]);

            if (error) throw error;
            onOpenBankModal(selectedPrice, `[추가광고] ${selectedAd.title || selectedAd.name}`);
            setSelectedAdId(null);
            setSelectedDuration(null);
        } catch (err: any) {
            console.error('[AdditionalAdView] payments insert 실패:', err);
            alert(`결제 신청 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[900px] mx-auto px-2 md:px-0 pb-24 space-y-6">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#0ea5e9] via-[#2563eb] to-[#4f46e5] text-white p-5 md:p-7 rounded-[24px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center border border-white/40 shadow-inner">
                        <Megaphone size={28} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-xl md:text-2xl tracking-tight">추가광고</h2>
                        <p className="text-white/80 text-xs md:text-sm font-bold mt-0.5">업체정보 리스트 + 최신구인정보 섹션에 추가 노출!</p>
                    </div>
                </div>
            </div>

            {/* 안내 */}
            <div className={`${cardCls} space-y-2`}>
                <p className={`${labelCls} mb-1`}>서비스 안내</p>
                <ul className={`text-xs font-bold space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li className="flex items-start gap-2"><Check size={14} className="text-blue-500 mt-0.5 shrink-0" /> 구독 외 추가로 등록하는 노출권입니다.</li>
                    <li className="flex items-start gap-2"><Check size={14} className="text-blue-500 mt-0.5 shrink-0" /> 업체정보 광고리스트 + 최신구인정보 섹션 노출</li>
                    <li className="flex items-start gap-2"><Check size={14} className="text-blue-500 mt-0.5 shrink-0" /> 점프·SOS·부스터는 별도 신청 (추가광고에 미포함)</li>
                    <li className="flex items-start gap-2"><Check size={14} className="text-blue-500 mt-0.5 shrink-0" /> 광고 만료 전 재신청 불가 (만료 후 재신청 가능)</li>
                </ul>
            </div>

            {/* STEP 1: 공고 선택 */}
            <div>
                <p className={`${labelCls} mb-2`}>STEP 1 — 추가광고 적용할 공고 선택</p>
                {eligibleAds.length === 0 ? (
                    <div className={`${cardCls} text-center py-10`}>
                        <p className={`font-bold text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>신청 가능한 공고가 없습니다.</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>진행중인 공고를 먼저 등록하거나, 기존 추가광고 만료 후 재신청하세요.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {eligibleAds.map(ad => {
                            const isSelected = String(ad.id) === String(selectedAdId);
                            const tier = (ad.productType || ad.tier || ad.product_type || '').toLowerCase();
                            return (
                                <div
                                    key={ad.id}
                                    onClick={() => setSelectedAdId(String(ad.id))}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                                        ? 'border-blue-400 bg-blue-50'
                                        : `${isDark ? 'border-gray-800 bg-gray-900 hover:border-blue-700' : 'border-gray-100 bg-white hover:border-blue-200'}`
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{ad.title || ad.name || '제목 없음'}</p>
                                        <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{ad.region || ''} · {tier.toUpperCase()}</p>
                                    </div>
                                    <ChevronRight size={16} className={isSelected ? 'text-blue-500' : 'text-gray-300'} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* STEP 2: 기간 선택 */}
            {selectedAd && (
                <div>
                    <p className={`${labelCls} mb-2`}>STEP 2 — 기간 선택</p>
                    <div className="grid grid-cols-3 gap-3">
                        {DURATION_KEYS.map(key => {
                            const opt = PRICING.additional_ad[key];
                            const isSelected = selectedDuration === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedDuration(key)}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : `${isDark ? 'border-gray-800 bg-gray-900 hover:border-blue-700' : 'border-gray-100 bg-white hover:border-blue-200'}`
                                    }`}
                                >
                                    <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {key === '1m' ? '1개월' : key === '3m' ? '3개월' : '6개월'}
                                    </div>
                                    <div className="text-blue-600 font-black text-base mt-1">{opt.price.toLocaleString()}원</div>
                                    {opt.discount_rate > 0 && (
                                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            {(opt.discount_rate * 100).toFixed(0)}% 할인
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 하단 고정 결제 바 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ zIndex: 1000 }}>
                <div className="max-w-[640px] mx-auto p-3">
                    {selectedAd && selectedDuration && (
                        <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-[10px] font-bold text-gray-400">추가광고 금액</span>
                            <span className="text-base font-black text-blue-600 tracking-tight">
                                {selectedPrice.toLocaleString()}원
                            </span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!selectedAd || !selectedDuration || submitting}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Megaphone size={16} />
                        {!selectedAd ? '공고를 먼저 선택해주세요' : !selectedDuration ? '기간을 선택해주세요' : submitting ? '처리중...' : `${selectedPrice.toLocaleString()}원 결제 신청`}
                    </button>
                </div>
            </div>
        </div>
    );
};
