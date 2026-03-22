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
            <div className={`p-8 rounded-[50px] border flex flex-col md:flex-row items-center justify-between gap-6 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                {/* 전화 정보 */}
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-pink-500 text-white rounded-[18px] flex items-center justify-center shrink-0">
                        <PhoneCall size={26} />
                    </div>
                    <div>
                        <p className={`text-xs font-bold mb-0.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>고객센터</p>
                        <h4 className={`text-3xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1877-1442</h4>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">평일 10:00 ~ 18:00</p>
                        <p className="text-xs font-bold text-gray-400">점심 12:00 ~ 13:00</p>
                        <p className="text-xs font-black text-pink-500 mt-0.5">공휴일 / 주말 휴무</p>
                    </div>
                </div>

                {/* 텔레그램 버튼 */}
                <a
                    href="https://t.me/cocoalba"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-2xl transition-all group w-full md:w-auto justify-center"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white shrink-0">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="font-black text-sm">텔레그램 실시간 상담</span>
                </a>
            </div>
        </div>
    );
};
