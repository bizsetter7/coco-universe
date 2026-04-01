'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBrand } from './BrandProvider';
import { REGIONS_MAP } from '@/constants/regions'; // 경로 확인 필요
import { ChevronRight, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useMobile';

export default function RightSidebar() {
    const isMobile = useMobile();
    const brand = useBrand();
    const router = useRouter();
    const { isLoggedIn, userName, userType, userCredit, logout } = useAuth();

    // [Optimization] Early return for mobile after all hooks
    if (isMobile) return null;

    // Derived User State for compatibility with sidebar UI
    const user = {
        name: userName || '게스트',
        level: userType === 'admin' ? 99 : 1,
        type: userType === 'admin' ? '최고 관리자' : (userType === 'corporate' ? '기업회원' : '일반회원'),
        credit: userCredit || 0,
    };

    const JOB_TYPES = ['룸싸롱', '나이트', '주점', '노래방', '바(Bar)', '카페', '일반음식점', 'PC방/오락실', '기타'];

    const WORK_TYPES = ['낮알바', '여성알바', '파트타임', '주말알바', '풀타임', '단기알바'];

    return (
        <aside className="w-[250px] shrink-0 hidden lg:block space-y-3 sticky top-20 h-fit pb-10">
            {/* 0. Partners Credit Promotion Banner - REMOVED (Requested) */}
            {/*
            <div 
                onClick={() => window.open('https://partners-credit-site.vercel.app', '_blank')}
                className="group relative rounded-xl overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-all bg-slate-900 border border-yellow-500/30 p-4"
            >
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Sparkles size={20} className="text-yellow-400" />
                </div>
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter mb-1">Weekly Best Income</p>
                <h4 className="text-white font-black text-sm leading-tight mb-2">
                    이번 주 <span className="text-yellow-400">120만C</span><br />출금 완료! 😲
                </h4>
                <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-400 font-bold">지금 수익 활동 시작하기</span>
                    <ChevronRight size={12} className="text-yellow-500" />
                </div>
            </div>
            */}

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
                        <span className="text-xs font-bold text-gray-500">C 크레딧</span>
                        <span className="text-sm font-black text-gray-800">{user.credit.toLocaleString()} C</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-gray-600">
                        <button className="bg-white border rounded py-1.5 hover:bg-gray-50 transition-colors">마이페이지</button>
                        <button className="bg-white border rounded py-1.5 hover:bg-gray-50 transition-colors">회원수정</button>
                        <button className="bg-white border rounded py-1.5 hover:bg-gray-50 transition-colors text-red-500">로그아웃</button>
                    </div>
                </div>
            </div>

            {/* 2. Banner Area - 트리거 */}
            <div className="group relative rounded-xl overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-all h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700"></div>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full blur-xl" />
                </div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-3 text-white">
                    <h3 className="font-black text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-tight">트리거</h3>
                    <div className="w-5 h-0.5 bg-white/40 my-1 rounded-full" />
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Premium Official</p>
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
                        <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] border border-gray-200 font-extrabold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
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
                {/* 전화번호 */}
                <div className="mb-2">
                    <p className="text-[18px] font-black text-purple-600 tracking-tighter leading-tight">1877-1442</p>
                </div>
                {/* 텔레그램 문의 */}
                <a href="https://t.me/cocoalba" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 mb-2 group">
                    <div className="w-6 h-6 rounded-full bg-[#2AABEE] flex items-center justify-center shrink-0 group-hover:brightness-110 transition">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-600 leading-tight">텔레그램 문의</p>
                        <p className="text-[10px] font-bold text-[#2AABEE] tracking-tight">@cocoalba</p>
                    </div>
                </a>
                <p className="text-[10px] text-gray-400 leading-tight">
                    평일 10:00~18:00 점심 12:00~13:00<br />
                    <span className="text-gray-300">*공휴일 토, 일은 근무하지 않습니다.</span>
                </p>
            </div>

            {/* 8. Right Side Vertical Ads */}
            <div className="space-y-4">
                {/* 동탄스카이 */}
                <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-all border border-blue-500/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900"></div>
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
                        <div className="bg-white/10 backdrop-blur-md text-[10px] font-black text-blue-200 px-2 py-0.5 rounded mb-3 border border-white/10 uppercase">
                            Dongtan Sky
                        </div>
                        <h4 className="font-black text-white text-lg leading-tight mb-1">
                            하이퍼블릭룸
                        </h4>
                        <div className="w-6 h-0.5 bg-blue-400 mx-auto my-2" />
                        <p className="text-3xl font-black text-white my-1 drop-shadow-lg tracking-tighter">
                            60분
                        </p>
                        <div className="bg-amber-400 text-black font-black px-3 py-1 rounded-full text-[11px] mt-2 shadow-glow-amber">
                            TC 12만원
                        </div>
                    </div>
                </div>

                {/* 일프로 */}
                <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-all border border-amber-500/30">
                    <div className="absolute inset-0 bg-slate-950"></div>
                    <div className="absolute inset-0 border-2 border-amber-500/40 m-1.5 rounded-lg pointer-events-none"></div>
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
                        <h4 className="font-black text-amber-500 text-xl tracking-widest mb-1">
                            일프로
                        </h4>
                        <p className="text-2xl font-black text-white tracking-tighter">
                            300
                            <span className="text-sm font-bold ml-1 text-amber-200">
                                만 보장
                            </span>
                        </p>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-3"></div>
                        <h4 className="font-black text-white/80 text-sm mb-1 uppercase tracking-tighter">
                            Ten Cafe
                        </h4>
                        <p className="text-2xl font-black text-amber-400">
                            200
                            <span className="text-xs font-bold ml-0.5 text-white/50">
                                만 보장
                            </span>
                        </p>
                    </div>
                </div>

                {/* OK OK */}
                <div className="group relative w-full aspect-[3/5] rounded-xl overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-all border border-yellow-500/20">
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 via-yellow-400 to-orange-500"></div>
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
                        <h4 className="font-black text-red-700 text-2xl tracking-tighter drop-shadow-sm mb-4">OK OK</h4>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-2">
                                <span className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-lg text-xl font-black">출</span>
                                <span className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-lg text-xl font-black">퇴</span>
                            </div>
                            <p className="text-[10px] font-black text-red-800 bg-white/50 px-2 rounded-full mt-2 uppercase tracking-wide">Freestyle Working</p>
                        </div>
                        <div className="mt-6 bg-red-600 text-white font-black px-4 py-1.5 rounded text-xs shadow-lg uppercase">
                            자유 출퇴근 보장
                        </div>
                    </div>
                </div>
            </div>

        </aside>
    );
}
