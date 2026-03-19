'use client';

import React from 'react';
import { useBrand } from '@/components/BrandProvider';
import { Megaphone, Zap, Search, ArrowRight, PhoneCall } from 'lucide-react';

interface TabHomeProps {
    onTabChange: (tabName: string) => void;
}

export const TabHome = ({ onTabChange }: TabHomeProps) => {
    const brand = useBrand();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Hero Section */}
            <div className="bg-slate-950 rounded-[50px] p-10 md:p-16 text-white overflow-hidden relative border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="bg-[#f82b60] text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">Professional Support</span>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Customer Center 2.0</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-[1.1]">
                        무엇을 <span className="text-[#f82b60]">도와드릴까요?</span><br />
                        코코플러스가 해결해 드립니다.
                    </h2>
                    <p className="text-slate-400 text-base md:text-lg font-bold leading-relaxed mb-10 opacity-80">
                        광고 효과를 극대화하는 전략부터 안전한 채용을 위한<br className="hidden md:block" />
                        운영 정책까지, 모든 궁금증을 한곳에서 해결하세요.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => onTabChange('1:1 문의')} className="px-8 py-4 bg-[#f82b60] rounded-2xl font-black text-[15px] hover:bg-[#db2456] transition-colors shadow-lg shadow-rose-900/20">
                            지금 문의하기
                        </button>
                        <button onClick={() => onTabChange('자주묻는질문')} className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black text-[15px] hover:bg-slate-800 transition-colors">
                            자주 묻는 질문
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Notice Summary */}
                <div onClick={() => onTabChange('공지사항')} className={`p-8 rounded-[40px] border group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="w-12 h-12 bg-rose-50 text-[#f82b60] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Megaphone size={24} />
                    </div>
                    <h3 className="text-xl font-black mb-2">공지사항</h3>
                    <p className="text-gray-400 text-sm font-bold leading-relaxed mb-6">최신 업데이트와 중요한 정책 변경 사항을 확인하세요.</p>
                    <div className="flex items-center gap-2 text-[#f82b60] text-xs font-black uppercase tracking-widest">
                        View All <ArrowRight size={14} />
                    </div>
                </div>

                {/* Ad Guide Summary */}
                <div onClick={() => onTabChange('광고안내')} className={`p-8 rounded-[40px] border group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100 shadow-sm shadow-rose-100/10'}`}>
                    <div className="w-12 h-12 bg-rose-50 text-[#f82b60] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-black mb-2">광고 가이드</h3>
                    <p className="text-gray-400 text-sm font-bold leading-relaxed mb-6">최고의 광고 효과를 위한 위치별 단가 및 상품 안내입니다.</p>
                    <div className="flex items-center gap-2 text-[#f82b60] text-xs font-black uppercase tracking-widest">
                        View Price <ArrowRight size={14} />
                    </div>
                </div>

                {/* FAQ Summary */}
                <div onClick={() => onTabChange('자주묻는질문')} className={`p-8 rounded-[40px] border group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Search size={24} />
                    </div>
                    <h3 className="text-xl font-black mb-2">FAQ</h3>
                    <p className="text-gray-400 text-sm font-bold leading-relaxed mb-6">궁금해 하시는 질문들을 카테고리별로 모았습니다.</p>
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest">
                        Solve Fast <ArrowRight size={14} />
                    </div>
                </div>
            </div>

            {/* Support Info Card */}
            <div className={`p-10 rounded-[50px] border flex flex-col md:flex-row items-center justify-between gap-8 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-[24px] flex items-center justify-center shrink-0">
                        <PhoneCall size={30} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-gray-900 italic">1877-1442</h4>
                        <p className="text-sm font-bold text-gray-400 mt-1">평일 10:00 - 18:00 (점심 12:00 - 13:00)</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="p-4 bg-gray-50 rounded-2xl text-center min-w-[100px]">
                        <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Telegram</p>
                        <p className="text-[13px] font-black text-[#f82b60]">@cocoplus_ad</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center min-w-[100px]">
                        <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Kakao</p>
                        <p className="text-[13px] font-black text-yellow-600">COCOPLUS</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
