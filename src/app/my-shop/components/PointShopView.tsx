'use client';

import React, { useState } from 'react';
import { BrandConfig } from '@/lib/brand-config';

interface PointShopViewProps {
    brand: BrandConfig;
    shopName: string;
    userId: string;
    onOpenMenu?: () => void;
}

const POINT_PACKAGES = [
    { id: 'mini',   label: '미니',   points: 2000,  price: 10000,  tag: null },
    { id: 'small',  label: '스몰',   points: 5000,  price: 22000,  tag: '10% 보너스' },
    { id: 'medium', label: '미디엄', points: 12000, price: 49000,  tag: '15% 보너스' },
    { id: 'large',  label: '라지',   points: 30000, price: 110000, tag: '20% 보너스' },
    { id: 'xl',     label: '엑스라지',points: 60000, price: 150000, tag: '최대할인 25%' },
];

export function PointShopView({ brand, shopName, userId, onOpenMenu }: PointShopViewProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);
    const isDark = brand.theme === 'dark';

    const pkg = POINT_PACKAGES.find(p => p.id === selected);

    const copyAccount = () => {
        navigator.clipboard.writeText('1002-4683-1712').then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleSubmit = () => {
        if (!pkg) return;
        setSubmitted(true);
    };

    return (
        <div className={`rounded-2xl border shadow-sm p-5 md:p-8 ${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>포인트 충전</h2>
                    <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>SOS 긴급구인 · 점프이용권 등에 사용됩니다</p>
                </div>
                <button onClick={onOpenMenu} className="md:hidden p-2 rounded-lg border">☰</button>
            </div>

            {!submitted ? (
                <>
                    {/* Package Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                        {POINT_PACKAGES.map((pkg) => {
                            const isSelected = selected === pkg.id;
                            const perPoint = (pkg.price / pkg.points).toFixed(1);
                            return (
                                <button
                                    key={pkg.id}
                                    onClick={() => setSelected(pkg.id)}
                                    className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                                            : isDark
                                                ? 'border-gray-700 bg-gray-800 hover:border-gray-500'
                                                : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                                    }`}
                                >
                                    {pkg.tag && (
                                        <span className="absolute top-3 right-3 text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                                            {pkg.tag}
                                        </span>
                                    )}
                                    <p className={`text-xs font-bold mb-1 ${isSelected ? 'text-blue-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.label}</p>
                                    <p className={`text-2xl font-black ${isSelected ? 'text-blue-600' : isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {pkg.points.toLocaleString()}P
                                    </p>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <p className={`text-base font-black ${isSelected ? 'text-blue-500' : isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {pkg.price.toLocaleString()}원
                                        </p>
                                        <p className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            (1P당 {perPoint}원)
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Usage Guide */}
                    <div className={`rounded-2xl p-4 mb-6 text-xs font-bold space-y-1 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-blue-800'}`}>
                        <p className="font-black text-sm mb-2">포인트 사용처</p>
                        <p>🆘 SOS 긴급구인 발송 — 수신자 수에 따라 200P ~ 800P</p>
                        <p>⚡ 점프이용권 — 1회 500P (공고 최상단 노출)</p>
                        <p>📌 포인트는 충전 후 환불되지 않습니다.</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!selected}
                        className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
                            selected
                                ? 'bg-gradient-to-r from-blue-500 to-rose-600 text-white shadow-lg hover:brightness-110 active:scale-[0.98]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {selected && pkg ? `${pkg.points.toLocaleString()}P 충전 신청 (${pkg.price.toLocaleString()}원)` : '상품을 선택해주세요'}
                    </button>
                </>
            ) : (
                /* 입금 안내 */
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-500 to-rose-600 text-white rounded-2xl p-5 text-center">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="font-black text-lg">충전 신청이 완료됐습니다!</p>
                        <p className="text-white/80 text-sm mt-1">아래 계좌로 입금하시면 확인 후 포인트를 지급합니다.</p>
                    </div>

                    {/* Amount */}
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                        <p className="text-xs font-bold text-rose-500 mb-1">입금 금액</p>
                        <p className="text-3xl font-black text-rose-600">{pkg!.price.toLocaleString()}원</p>
                        <p className="text-sm font-bold text-rose-400 mt-1">충전 포인트: {pkg!.points.toLocaleString()}P</p>
                    </div>

                    {/* Bank Info */}
                    <div className={`rounded-2xl p-4 space-y-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400">은행</span>
                            <span className="font-black">토스뱅크</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400">계좌번호</span>
                            <button onClick={copyAccount} className="flex items-center gap-2 font-black hover:text-blue-600 transition-colors">
                                <span>1002-4683-1712</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${copied ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {copied ? '복사됨' : '복사'}
                                </span>
                            </button>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400">예금주</span>
                            <span className="font-black">고남우(초코아이디어)</span>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                        <p className="text-xs font-bold text-yellow-700 leading-relaxed">
                            📌 입금 시 예금주에 <span className="font-black">해당 아이디</span>를 적어주세요.<br />
                            입금 확인 후 <span className="font-black">바로</span> 포인트가 지급됩니다.<br />
                            문의:{' '}
                            <a href="https://t.me/cocoalba_cs" target="_blank" rel="noopener noreferrer" className="underline font-black">텔레그램 @cocoalba_cs</a>
                            {' '}또는 1:1 문의
                        </p>
                    </div>

                    <button
                        onClick={() => { setSubmitted(false); setSelected(null); }}
                        className={`w-full py-3 rounded-2xl font-black text-sm border transition ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        다른 상품 선택
                    </button>
                </div>
            )}
        </div>
    );
}
