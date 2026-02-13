'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBrand } from './BrandProvider';
import { REGIONS_MAP } from '@/constants/regions'; // 경로 확인 필요
import { ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function RightSidebar() {
    const brand = useBrand();
    const router = useRouter();

    const { isLoggedIn, userName, userType, userPoints, logout } = useAuth();

    // Derived User State for compatibility with sidebar UI
    const user = {
        name: userName || '게스트',
        level: userType === 'admin' ? 99 : 1,
        type: userType === 'admin' ? '최고 관리자' : (userType === 'corporate' ? '기업회원' : '일반회원'),
        points: userPoints || 0,
    };

    const JOB_TYPES = ['룸싸롱', '나이트', '주점', '노래방', '바(Bar)', '카페', '일반음식점', 'PC방/오락실', '기타'];
    const WORK_TYPES = ['낮알바', '밤알바', '파트타임', '주말알바', '풀타임', '단기알바', '숙식제공', '당일지급'];

    return (
        <aside className="w-[250px] shrink-0 hidden lg:block space-y-3 sticky top-20 h-fit pb-10">

            {/* 1. User Info Section */}
            <div className={`rounded-xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                {/* Header */}
                <div className="bg-gray-50 border-b p-3 flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-700">{user.name} 님 <span className="text-[10px] bg-gray-200 px-1 rounded">Lv.{user.level}</span></span>
                    <Settings size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
                <div className="p-3">
                    <p className="text-xs text-center text-gray-500 mb-2">회원님은 <span className="font-bold text-blue-500">{user.type}</span>입니다.</p>
                    <div className="bg-gray-100 rounded-lg p-2 flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-gray-500">P 포인트</span>
                        <span className="text-sm font-black text-gray-800">{user.points.toLocaleString()} P</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-gray-600">
                        <button className="bg-white border rounded py-1.5 hover:bg-gray-50 transition-colors">마이페이지</button>
                        <button className="bg-white border rounded py-1.5 hover:bg-gray-50 transition-colors">회원수정</button>
                        <button className="bg-white border rounded py-1.5 hover:bg-gray-50 transition-colors text-red-500">로그아웃</button>
                    </div>
                </div>
            </div>

            {/* 2. Banner Area */}
            <div className="rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative h-24 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-center p-2">
                <div>
                    <h3 className="text-white font-black text-lg drop-shadow-md">트리거</h3>
                    <p className="text-white/90 text-xs font-bold mt-1">바로 여깁니다.</p>
                    <div className="mt-1 bg-white/20 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full inline-block">퀸알바 공식 프리미엄 광고</div>
                </div>
            </div>

            {/* 3. Regions List */}
            <div className={`rounded-xl border shadow-sm p-4 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`font-black text-sm mb-3 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    <span className="w-1 h-3 bg-blue-500 rounded-full"></span> 지역별 채용정보
                </h3>
                <div className="grid grid-cols-4 gap-y-2 gap-x-1">
                    {Object.keys(REGIONS_MAP).slice(0, 16).map(region => (
                        <button
                            key={region}
                            onClick={() => {
                                router.push(`/?region=${region}`);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`text-[11px] font-medium text-center hover:underline ${brand.theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                        >
                            {region}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. Industries List */}
            <div className={`rounded-xl border shadow-sm p-4 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`font-black text-sm mb-3 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                    <span className="w-1 h-3 bg-purple-500 rounded-full"></span> 업직종별 채용정보
                </h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                    {JOB_TYPES.map(job => (
                        <div key={job} className="flex items-center gap-1 cursor-pointer group" onClick={() => {
                            router.push(`/?region=전체&job=${job}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}>
                            <div className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-purple-500 transition-colors"></div>
                            <span className={`text-[11px] font-medium group-hover:underline ${brand.theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'}`}>{job}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Work Types List */}
            <div className={`rounded-xl border shadow-sm p-4 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <h3 className={`font-black text-sm mb-3 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="w-1 h-3 bg-gray-500 rounded-full"></span> 고용형태 채용정보
                </h3>
                <div className="grid grid-cols-2 gap-y-2 gap-x-2">
                    {WORK_TYPES.map(type => (
                        <div key={type} className="flex items-center gap-1 cursor-pointer group" onClick={() => {
                            router.push(`/?region=전체&workType=${type}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}>
                            <div className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-gray-600 transition-colors"></div>
                            <span className={`text-[11px] font-medium group-hover:underline ${brand.theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'}`}>{type}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 6. Ad Application Buttons */}
            <div className="space-y-1">
                {[
                    { label: '우대등록 채용정보', sub: '광고신청' },
                    { label: '프리미엄 채용정보', sub: '광고신청' },
                    { label: '스페셜 채용정보', sub: '광고신청' },
                    { label: '급구 채용정보', sub: '광고신청' },
                    { label: '추천 채용정보', sub: '광고신청' },
                ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] font-bold transition-all hover:shadow-sm cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <span className="flex items-center gap-1">
                            <ChevronRight size={12} className="text-gray-400" />
                            {item.label}
                        </span>
                        <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] border border-gray-200 font-extrabold hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-colors">
                            {item.sub}
                        </span>
                    </div>
                ))}
            </div>

            {/* 7. Customer Center */}
            <div className={`p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h3 className="flex items-center gap-1.5 text-xs font-black text-gray-500 mb-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 고객지원센터
                </h3>
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center font-black text-xs">TALK</div>
                    <div>
                        <p className="font-extrabold text-[10px] text-gray-400">Queenalba</p>
                        <p className={`font-black text-lg leading-none ${brand.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>1544-5568</p>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                    평일 09:30~19:00 점심 12:00~13:30<br />
                    <span className="text-gray-300">*공휴일 토, 일은 근무하지 않습니다.</span>
                </p>
                <div className="mt-3 text-[10px] flex gap-1 text-gray-400">
                    <span className="underline cursor-pointer hover:text-gray-600">FAQ 도움말</span>
                    <span>|</span>
                    <span className="underline cursor-pointer hover:text-gray-600">광고문의 & 일반문의</span>
                </div>
            </div>

            {/* 8. Right Side Vertical Ads */}
            <div className="space-y-2">
                <div className="w-full aspect-[3/4] bg-blue-100 rounded-xl border border-blue-200 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:opacity-90">
                    <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded mb-2">동탄스카이</div>
                    <h4 className="font-black text-blue-900 text-lg leading-tight">하이퍼블릭룸</h4>
                    <p className="text-2xl font-black text-blue-600 my-1">60분</p>
                    <div className="bg-yellow-400 text-black font-black px-2 py-1 rounded text-xs">TC 12만원</div>
                    <p className="text-[10px] font-bold text-gray-600 mt-1">자유복장</p>
                </div>
                <div className="w-full aspect-[3/4] bg-black rounded-xl border border-amber-500/50 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:opacity-90 relative overflow-hidden">
                    <div className="absolute inset-0 border-2 border-amber-400 m-1 rounded-lg pointer-events-none"></div>
                    <h4 className="font-black text-amber-500 text-lg">일프로</h4>
                    <p className="text-2xl font-black text-white my-1">300만</p>
                    <p className="text-amber-200 font-bold text-sm">보장</p>
                    <div className="w-full h-px bg-amber-500/50 my-2"></div>
                    <h4 className="font-black text-white text-md">텐카페</h4>
                    <p className="text-xl font-black text-amber-400">200만</p>
                    <p className="text-gray-300 font-bold text-xs">보장</p>
                </div>
                <div className="w-full aspect-[3/5] bg-yellow-300 rounded-xl border border-yellow-400 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:opacity-90">
                    <h4 className="font-black text-red-600 text-xl">OK OK</h4>
                    <p className="text-4xl font-black text-red-500 my-2 leading-none">출<br />퇴</p>
                    <div className="bg-black text-yellow-300 font-black px-2 py-1 rounded text-xs">자유 보장</div>
                </div>
            </div>

        </aside>
    );
}
