'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, MousePointer2, Highlighter, Palette, Zap, Radio, ChevronRight } from 'lucide-react';
import {
    ICONS, HIGHLIGHTERS, PAY_SUFFIX_OPTIONS, STEP4_CONVENIENCE_KEYWORDS
} from '../constants';

interface BoostingViewProps {
    brand: any;
    ads: any[];
    onOpenBankModal: (amount: number, title?: string) => void;
    setExampleType: (v: string) => void;
    setShowExampleModal: (v: boolean) => void;
}

const PERIOD_OPTS = [0, 30, 60, 90] as const;
const PERIOD_PRICE = (p: number) => p === 30 ? 30000 : p === 60 ? 55000 : p === 90 ? 70000 : 0;

export const BoostingView: React.FC<BoostingViewProps> = ({
    brand, ads, onOpenBankModal, setExampleType, setShowExampleModal
}) => {
    const isDark = brand.theme === 'dark';
    const cardCls = `p-5 rounded-2xl border shadow-sm ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`;
    const labelCls = `text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-400'}`;

    // 선택된 공고
    const [selectedAdId, setSelectedAdId] = useState<string | null>(null);

    // Step4 옵션 상태
    const [paySuffixes, setPaySuffixes] = useState<string[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<number | null>(null);
    const [iconPeriod, setIconPeriod] = useState<0 | 30 | 60 | 90>(0);
    const [selectedHighlighter, setSelectedHighlighter] = useState<number | null>(null);
    const [highlighterPeriod, setHighlighterPeriod] = useState<0 | 30 | 60 | 90>(0);
    const [borderOption, setBorderOption] = useState<'none' | 'color' | 'glow' | 'sparkle' | 'rainbow'>('none');
    const [borderPeriod, setBorderPeriod] = useState<0 | 30 | 60 | 90>(0);

    const activeAds = useMemo(() =>
        ads.filter(a => !a.isClosed && a.status !== 'CLOSED'),
        [ads]
    );

    const selectedAd = activeAds.find(a => String(a.id) === String(selectedAdId));

    // 총 금액 계산
    const totalAmount = useMemo(() => {
        let total = 0;
        if (selectedIcon !== null && iconPeriod > 0) total += PERIOD_PRICE(iconPeriod);
        if (selectedHighlighter !== null && highlighterPeriod > 0) total += PERIOD_PRICE(highlighterPeriod);
        if (borderOption !== 'none' && borderPeriod > 0) total += PERIOD_PRICE(borderPeriod);
        if (paySuffixes.length > 1) total += (paySuffixes.length - 1) * 5000;
        return total;
    }, [selectedIcon, iconPeriod, selectedHighlighter, highlighterPeriod, borderOption, borderPeriod, paySuffixes]);

    const togglePaySuffix = (s: string) => {
        if (paySuffixes.includes(s)) {
            setPaySuffixes(paySuffixes.filter(x => x !== s));
        } else {
            if (paySuffixes.length >= 6) { alert('최대 6개까지만 선택가능합니다'); return; }
            setPaySuffixes([...paySuffixes, s]);
        }
    };

    const toggleKeyword = (kw: string) => {
        if (selectedKeywords.includes(kw)) {
            setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
        } else {
            if (selectedKeywords.length >= 10) { alert('최대 10개까지만 선택가능합니다'); return; }
            setSelectedKeywords([...selectedKeywords, kw]);
        }
    };

    const handleSubmit = () => {
        if (!selectedAd) { alert('부스팅을 적용할 공고를 선택해주세요.'); return; }
        if (totalAmount === 0) { alert('적용할 부스팅 옵션을 1개 이상 선택해주세요.'); return; }
        if (selectedIcon !== null && iconPeriod === 0) { alert("아이콘의 기간을 선택해주세요."); return; }
        if (selectedHighlighter !== null && highlighterPeriod === 0) { alert("형광펜의 기간을 선택해주세요."); return; }
        if (borderOption !== 'none' && borderPeriod === 0) { alert("테두리 효과의 기간을 선택해주세요."); return; }
        onOpenBankModal(totalAmount, `[부스팅] ${selectedAd.title || selectedAd.name}`);
    };

    const renderPeriodSelector = (current: number, setter: (v: any) => void) => (
        <div className="grid grid-cols-4 gap-1 w-full">
            {PERIOD_OPTS.map(p => (
                <button
                    key={p}
                    type="button"
                    onClick={() => setter(p)}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-lg border transition-all ${current === p
                        ? 'bg-blue-50 text-blue-600 border-blue-400 ring-1 ring-blue-400'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                >
                    {p === 0 ? (
                        <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full border-2 mb-1 flex items-center justify-center ${current === 0 ? 'border-blue-500 bg-blue-500' : 'border-gray-200'}`}>
                                {current === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-[10px] font-black">안함</span>
                        </div>
                    ) : (
                        <>
                            <div className={`w-3 h-3 rounded-full border-2 mb-1 flex items-center justify-center ${current === p ? 'border-blue-500 bg-blue-500' : 'border-gray-200'}`}>
                                {current === p && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-[10px] font-black">{p}일</span>
                            <div className="text-[8px] opacity-70 font-bold">+{p === 30 ? '3' : p === 60 ? '5.5' : '7'}만원</div>
                        </>
                    )}
                </button>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-[900px] mx-auto px-2 md:px-0 pb-24 space-y-6">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#9333ea] via-[#a855f7] to-[#ec4899] text-white p-5 md:p-7 rounded-[24px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/30 rounded-2xl flex items-center justify-center border border-white/40 shadow-inner">
                        <Sparkles size={28} className="text-white animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-black text-xl md:text-2xl tracking-tight">광고 부스팅</h2>
                        <p className="text-white/80 text-xs md:text-sm font-bold mt-0.5">진행중인 공고에 노출 강화 옵션을 추가하세요!</p>
                    </div>
                </div>
            </div>

            {/* STEP 1: 공고 선택 */}
            <div>
                <p className={`${labelCls} mb-2`}>STEP 1 — 부스팅할 공고 선택</p>
                {activeAds.length === 0 ? (
                    <div className={`${cardCls} text-center py-10`}>
                        <p className={`font-bold text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>진행중인 공고가 없습니다.</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>공고를 먼저 등록해주세요.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {activeAds.map(ad => {
                            const isSelected = String(ad.id) === String(selectedAdId);
                            const tier = (ad.productType || ad.tier || ad.product_type || '').toLowerCase();
                            return (
                                <div
                                    key={ad.id}
                                    onClick={() => setSelectedAdId(String(ad.id))}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                                        ? 'border-purple-400 bg-purple-50'
                                        : `${isDark ? 'border-gray-800 bg-gray-900 hover:border-purple-700' : 'border-gray-100 bg-white hover:border-purple-200'}`
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{ad.title || ad.name || '제목 없음'}</p>
                                        <p className={`text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{ad.region || ''} · {tier.toUpperCase()}</p>
                                    </div>
                                    <ChevronRight size={16} className={isSelected ? 'text-purple-500' : 'text-gray-300'} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* STEP 2: 부스팅 옵션 (공고 선택 후 표시) */}
            {selectedAd && (
                <div className="space-y-6">
                    <p className={`${labelCls} mb-2`}>STEP 2 — 부스팅 옵션 선택</p>

                    {/* 급여 추가 옵션 */}
                    <div className={cardCls}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                <Zap size={14} fill="currentColor" />
                            </div>
                            <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>급여 추가 옵션</h3>
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">+5,000원</span>
                            <span className="text-[9px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">1개 무료, 추가 5개 유료</span>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
                            {PAY_SUFFIX_OPTIONS.map(s => {
                                const isSelected = paySuffixes.includes(s);
                                const count = paySuffixes.length;
                                const activeClass = count >= 2 ? 'bg-purple-600 border-purple-600' : 'bg-blue-500 border-blue-500';
                                return (
                                    <button key={s} type="button" onClick={() => togglePaySuffix(s)}
                                        className={`flex items-center justify-center h-9 rounded-lg text-[10.5px] font-bold transition border-2 ${isSelected ? `text-white ${activeClass} shadow-sm` : 'bg-white border-gray-100 text-gray-500 hover:border-amber-200'}`}>
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 편의사항 키워드 */}
                    <div className={cardCls}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                    <Sparkles size={14} fill="currentColor" />
                                </div>
                                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>편의사항 및 키워드 (최대 10개)</h3>
                                <span className="text-[10px] font-bold text-cyan-500 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100">무료</span>
                            </div>
                            <span className="text-xs font-black text-blue-500">{selectedKeywords.length}/10</span>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
                            {STEP4_CONVENIENCE_KEYWORDS.map(kw => (
                                <button key={kw} type="button" onClick={() => toggleKeyword(kw)}
                                    className={`flex items-center justify-center h-9 rounded-lg text-[10.5px] font-bold transition border-2 ${selectedKeywords.includes(kw) ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}>
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 아이콘 + 형광펜 */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* 아이콘 */}
                        <div className={`rounded-2xl border-2 overflow-hidden ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} shadow-sm`}>
                            <div className="bg-gray-600 text-white p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                                        <MousePointer2 size={16} fill="currentColor" className="rotate-90" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black">10종 무빙 아이콘</h3>
                                        <p className="text-[10px] font-bold opacity-80">제목앞 아이콘으로 주목도 UP</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setExampleType('step4_pay'); setShowExampleModal(true); }}
                                    className="px-2 py-1 text-[10px] font-black bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition">
                                    예시보기
                                </button>
                            </div>
                            <div className="p-3 space-y-3">
                                {renderPeriodSelector(iconPeriod, setIconPeriod)}
                                <div className="grid grid-cols-5 gap-2">
                                    {ICONS.map(item => (
                                        <button key={item.id} type="button"
                                            onClick={() => setSelectedIcon(selectedIcon === item.id ? null : item.id)}
                                            className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all border-2 ${selectedIcon === item.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-transparent bg-gray-50/30 hover:bg-gray-50'}`}
                                        >
                                            {item.icon === 'NEW' ? (
                                                <span className="inline-flex items-center justify-center px-1.5 h-[18px] bg-red-600 text-white text-[9px] font-black rounded-[6px] tracking-tighter shrink-0 mb-1">NEW</span>
                                            ) : (
                                                <span className="text-xl mb-1 animate-seesaw inline-block origin-bottom">{item.icon}</span>
                                            )}
                                            <span className={`text-[8px] font-black ${selectedIcon === item.id ? 'text-blue-600' : 'text-gray-400'}`}>{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 형광펜 */}
                        <div className={`rounded-2xl border-2 overflow-hidden ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} shadow-sm`}>
                            <div className="bg-gray-600 text-white p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Highlighter size={16} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black">10종 형광펜</h3>
                                        <p className="text-[10px] font-bold opacity-80">제목에 시각적 강조 효과</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => { setExampleType('step2_list'); setShowExampleModal(true); }}
                                    className="px-2 py-1 text-[10px] font-black bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition">
                                    예시보기
                                </button>
                            </div>
                            <div className="p-3 space-y-3">
                                {renderPeriodSelector(highlighterPeriod, setHighlighterPeriod)}
                                <div className="grid grid-cols-4 gap-2">
                                    {HIGHLIGHTERS.map(item => (
                                        <button key={item.id} type="button"
                                            onClick={() => setSelectedHighlighter(selectedHighlighter === item.id ? null : item.id)}
                                            className={`py-1.5 px-1 rounded-lg transition-all border-2 flex items-center justify-center ${selectedHighlighter === item.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-transparent bg-gray-50/30 hover:bg-gray-50'}`}
                                        >
                                            <span className="w-full py-1 rounded text-[9px] font-black"
                                                style={item.color === 'rainbow' ? {
                                                    background: 'linear-gradient(to right, #ef5350, #f48fb1, #7e57c2, #2196f3, #26c6da, #43a047, #eeff41, #f9a825, #ff5722)',
                                                    color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                } : item.color === 'blink' ? {
                                                    backgroundColor: '#ffff00', color: '#000'
                                                } : { backgroundColor: item.color, color: '#333' }}>
                                                {item.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 테두리 효과 */}
                    <div className={`rounded-2xl border-2 overflow-hidden ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} shadow-sm`}>
                        <div className="bg-gray-600 text-white p-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                                <Radio size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black">테두리 효과</h3>
                                <p className="text-[10px] font-bold opacity-80">테두리/특수효과로 나만의 광고를 돋보이세요</p>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {renderPeriodSelector(borderPeriod, setBorderPeriod)}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    { id: 'color', label: '컬러 테두리' },
                                    { id: 'glow', label: 'Glow 효과' },
                                    { id: 'sparkle', label: '반짝이 효과' },
                                    { id: 'rainbow', label: '무지개 효과' }
                                ].map(opt => (
                                    <button key={opt.id} type="button"
                                        onClick={() => setBorderOption(borderOption === opt.id ? 'none' : opt.id as any)}
                                        className={`py-3 px-2 rounded-xl border-2 transition-all font-black text-xs ${borderOption === opt.id ? 'bg-purple-100 text-purple-700 border-purple-400' : 'bg-white border-gray-100 text-gray-400 hover:border-purple-200'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {/* 미리보기 */}
                            <div className={`h-20 rounded-xl border-2 flex items-center justify-center transition-all duration-300 bg-gray-50/50 ${borderOption === 'color' ? 'border-blue-500 border-4 shadow-sm' : borderOption === 'glow' ? 'border-cyan-400 border-4 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : borderOption === 'sparkle' ? 'border-yellow-400 border-4 shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-pulse' : borderOption === 'rainbow' ? 'animate-rainbow-border shadow-lg' : 'border-gray-200 border-dashed'}`}>
                                <div className="text-center">
                                    <Palette size={18} className={`mx-auto mb-1 ${borderOption !== 'none' ? 'text-blue-500' : 'text-gray-300'}`} />
                                    <span className={`text-[11px] font-black ${borderOption !== 'none' ? 'text-gray-900' : 'text-gray-400'}`}>노출 효과 예시</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 하단 고정 결제 바 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ zIndex: 1000 }}>
                <div className="max-w-[640px] mx-auto p-3">
                    {selectedAd && totalAmount > 0 && (
                        <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-[10px] font-bold text-gray-400">부스팅 총 금액</span>
                            <span className="text-base font-black text-[#9333ea] tracking-tight">
                                {totalAmount.toLocaleString()}원
                            </span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!selectedAd || totalAmount === 0}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={16} />
                        {!selectedAd ? '공고를 먼저 선택해주세요' : totalAmount === 0 ? '옵션을 선택해주세요' : `${totalAmount.toLocaleString()}원 결제 신청`}
                    </button>
                </div>
            </div>
        </div>
    );
};
