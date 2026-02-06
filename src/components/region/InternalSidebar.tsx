import React from 'react';
import { useBrand } from '../BrandProvider';
import { ChevronRight, Filter } from 'lucide-react';

import { useBannerControl } from '@/hooks/useBannerControl';

export const InternalSidebar = () => {
    const brand = useBrand();
    const isVisible = useBannerControl();

    if (!isVisible) return null;

    const isDark = brand.theme === 'dark';

    const boxStyle = `rounded-xl border p-4 mb-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`;
    const titleStyle = `text-xs font-black mb-3 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-900'}`;

    return (
        <div className="flex flex-col gap-2">
            {/* Login Box */}
            <div className={boxStyle}>
                <h3 className={titleStyle}>MEMBER LOGIN</h3>
                <div className="flex flex-col gap-2">
                    <input type="text" placeholder="ID" className={`w-full px-3 py-2 rounded text-xs border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-1 focus:ring-purple-500`} />
                    <input type="password" placeholder="PASSWORD" className={`w-full px-3 py-2 rounded text-xs border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-1 focus:ring-purple-500`} />
                    <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded transition-colors">
                        로그인
                    </button>
                    <div className="flex justify-center gap-2 text-[10px] text-gray-400 mt-1">
                        <span className="cursor-pointer hover:underline">회원가입</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:underline">아이디/비번 찾기</span>
                    </div>
                </div>
            </div>

            {/* Premium Banner */}
            <div className="rounded-xl overflow-hidden mb-4 shadow-md bg-gradient-to-br from-purple-500 to-indigo-600 p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform">
                <p className="text-white font-black text-lg leading-tight mb-1">하루 200보장</p>
                <p className="text-white/80 text-xs text-[10px]">코코알바 프리미엄 배너</p>
            </div>

            {/* Region Links */}
            <div className={boxStyle}>
                <h3 className={titleStyle}>지역별 채용정보</h3>
                <div className="grid grid-cols-4 gap-2 text-[11px] font-medium text-center">
                    {['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map(r => (
                        <div key={r} className={`cursor-pointer hover:text-purple-500 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {r}
                        </div>
                    ))}
                </div>
            </div>

            {/* Job Type Links */}
            <div className={boxStyle}>
                <h3 className={titleStyle}>엄직종별 채용정보</h3>
                <div className="grid grid-cols-2 gap-y-2 text-[11px] font-medium">
                    {['룸알바', '노래주점', '텐프로/쩜오', '요정', '바(Bar)', '헌터', '다방', '카페', '마사지', '기타'].map(j => (
                        <div key={j} className={`flex items-center gap-1 cursor-pointer hover:text-purple-500 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            {j}
                        </div>
                    ))}
                </div>
            </div>

            {/* Keywords */}
            <div className={boxStyle}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`${titleStyle} mb-0`}>편의사항 키워드</h3>
                    <Filter size={10} className="text-gray-400" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {['초보자가능', '숙식제공', '당일지급', '선불제공', '차량지원', '동반근무', '알바가능', '대학생', '주말알바', '투잡가능'].map(k => (
                        <span key={k} className={`px-2 py-1 rounded text-[10px] cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 transition-colors ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            {k}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
