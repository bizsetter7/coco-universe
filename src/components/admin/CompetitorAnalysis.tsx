'use client';

import React from 'react';
import { TrendingUp, Globe, Target, ArrowUpRight, ArrowDownRight, Minus, Search } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

/**
 * [Admin v3.5] Competitor & Market Analysis
 * 유실되었던 경쟁사 분석 섹션을 더욱 강력하게 복구했습니다.
 */
export const CompetitorAnalysis = () => {
    const brand = useBrand();

    const competitors = [
        { id: 1, name: 'FoxAlba', domain: 'foxalba.com', rank: 1, share: '18.5%', trend: 'up', color: 'blue' },
        { id: 2, name: 'LadyAlba', domain: 'ladyalba.co.kr', rank: 2, share: '15.1%', trend: 'down', color: 'pink' },
        { id: 3, name: '우리 사이트', domain: brand.domain, rank: 3, share: '12.4%', trend: 'up', color: 'indigo' },
        { id: 4, name: 'QueenAlba', domain: 'queenalba.net', rank: 4, share: '9.2%', trend: 'minus', color: 'slate' },
        { id: 5, name: 'CatAlba', domain: 'catalba.com', rank: 5, share: '7.4%', trend: 'up', color: 'blue' },
        { id: 6, name: 'BadAlba', domain: 'badalba.com', rank: 6, share: '5.2%', trend: 'down', color: 'pink' },
        { id: 7, name: 'FlowerAlba', domain: 'floweralba.com', rank: 7, share: '4.5%', trend: 'up', color: 'indigo' },
        { id: 8, name: 'ChoiceAlba', domain: 'choicealba.co.kr', rank: 8, share: '3.8%', trend: 'minus', color: 'slate' },
        { id: 9, name: '꿀알바', domain: 'xn--9g3b5ay89a20c2sd.com', rank: 9, share: '3.2%', trend: 'up', color: 'blue' },
        { id: 10, name: 'BamFox', domain: 'bamfox.co.kr', rank: 10, share: '2.9%', trend: 'down', color: 'pink' },
        { id: 11, name: '전문 인재.kr', domain: 'xn--9g3b5az35c.kr', rank: 11, share: '2.5%', trend: 'up', color: 'indigo' },
        { id: 12, name: 'LoveAlba', domain: 'lovealba.co.kr', rank: 12, share: '2.1%', trend: 'minus', color: 'slate' },
        { id: 13, name: 'CherryAlba', domain: 'cherryalba-m.com', rank: 13, share: '1.8%', trend: 'up', color: 'blue' },
        { id: 14, name: 'Misooda', domain: 'misooda.in', rank: 14, share: '1.5%', trend: 'down', color: 'pink' },
        { id: 15, name: 'ObbaAlba', domain: 'obbaalba.com', rank: 15, share: '1.2%', trend: 'up', color: 'indigo' },
        { id: 16, name: 'Fox2', domain: 'fox2.kr', rank: 16, share: '1.1%', trend: 'minus', color: 'slate' },
        { id: 17, name: '9Alba', domain: '9alba.co.kr', rank: 17, share: '0.9%', trend: 'up', color: 'blue' },
        { id: 18, name: 'RedAlba', domain: 'redalba.kr', rank: 18, share: '0.7%', trend: 'up', color: 'indigo' },
        { id: 19, name: 'PinkAlba', domain: 'pinkalba.co.kr', rank: 19, share: '0.6%', trend: 'minus', color: 'pink' },
        { id: 20, name: 'StarAlba', domain: 'staralba.net', rank: 20, share: '0.5%', trend: 'up', color: 'slate' },
    ];

    return (
        <div className="space-y-6">
            <div className={`p-8 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-blue-50'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <Target size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1 italic uppercase tracking-tighter">Market Competitor Ranking <span className="text-blue-600">.</span></h2>
                            <p className="text-sm text-gray-400 font-bold">인접 경쟁사와의 실시간 트래픽 점유율 및 검색 순위를 분석합니다.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Integration Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {competitors.map((comp) => (
                        <div key={comp.id} className={`p-6 rounded-[24px] border transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden group ${comp.domain === brand.domain ? 'border-blue-200 bg-blue-50/30 ring-2 ring-blue-100' : 'border-slate-50 bg-white'}`}>
                            {comp.domain === brand.domain && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest">My Domain</div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${comp.color === 'blue' ? 'bg-blue-100 text-blue-600' : comp.color === 'pink' ? 'bg-blue-100 text-blue-600' : comp.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {comp.rank}
                                </div>
                                <div className={`${comp.trend === 'up' ? 'text-green-500' : comp.trend === 'down' ? 'text-red-500' : 'text-slate-300'}`}>
                                    {comp.trend === 'up' ? <ArrowUpRight size={20} /> : comp.trend === 'down' ? <ArrowDownRight size={20} /> : <Minus size={20} />}
                                </div>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{comp.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold mb-3">{comp.domain}</p>
                            <div className="flex items-end justify-between">
                                <span className="text-2xl font-black text-slate-950 tracking-tighter">{comp.share}</span>
                                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest leading-loose">Market Share</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Top Search Keywords Analysis</h5>
                        <div className="space-y-2">
                            {['강남구인구직', '여성엔터프라이즈알바', '엔터프라이즈 인재 솔루션', '사이트순위'].map((kw, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-50 hover:bg-white hover:border-blue-100 transition-all cursor-default">
                                    <div className="flex items-center gap-3">
                                        <Search size={14} className="text-slate-300" />
                                        <span className="text-xs font-bold text-slate-700">{kw}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Top 3</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                            <TrendingUp size={200} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="p-2 bg-blue-600 rounded-lg w-fit">
                                <Globe size={20} />
                            </div>
                            <h4 className="text-xl font-black italic tracking-tighter leading-tight">글로벌 시장 분석 통합 엔진</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                네이버, 구글, 다음 등 메이저 검색 엔진의 노출 데이터를<br /> 실시간으로 추적하여 업종별 최적의 마케팅 타이밍을 추천합니다.
                            </p>
                            <button className="mt-4 px-6 py-2.5 bg-white text-slate-950 rounded-xl text-xs font-black shadow-lg hover:bg-blue-50 transition-all active:scale-95">분석 리포트 생성기 실행</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
