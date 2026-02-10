'use client';

import React from 'react';
import { ChevronLeft, Store, MapPin, Check, PlusSquare, RefreshCw, Calendar, List, LogOut, CreditCard, User, Settings } from 'lucide-react';

interface BusinessDashboardProps {
    brand: any;
    shopName: string;
    nickname: string;
    isVerified: boolean;
    handleAdClick: (isNew: boolean) => void;
    setShowDesignModal: (v: boolean) => void;
    router: any;
}

interface BusinessDashboardProps {
    brand: any;
    shopName: string;
    nickname: string;
    isVerified: boolean;
    handleAdClick: (isNew: boolean) => void;
    setShowDesignModal: (v: boolean) => void;
    setView: (v: any) => void;
    router: any;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
    brand, shopName, nickname, isVerified, handleAdClick, setShowDesignModal, setView, router
}) => {
    return (
        <div className="w-full p-3 md:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar (PC Only) */}
            <aside className="hidden md:block col-span-1 space-y-4">
                <div className={`p-6 rounded-2xl border shadow-sm text-center flex flex-col justify-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>
                    <div className={`w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-pink-100'} `}>
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={32} /></div>
                    </div>
                    <div className="mb-4">
                        <h2 className={`font-black text-xl tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-black'} `}>{shopName || '내 상점'}</h2>
                        {nickname && <p className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} `}>{nickname}</p>}
                        <p className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} `}>프리미엄 인증 업소</p>
                    </div>
                    <button className={`w-full py-2 rounded-lg text-xs font-bold transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} `}>
                        사진 등록/수정
                    </button>
                </div>

                <nav className={`p-4 rounded-2xl border shadow-sm space-y-1 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-100 text-gray-600'} `}>
                    <div onClick={() => setView('dashboard')} className="flex items-center gap-3 p-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer font-bold text-sm">
                        <List size={18} /> 진행중인 채용정보
                    </div>
                    <div onClick={() => setView('closed-ads')} className="flex items-center gap-3 p-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer font-bold text-sm">
                        <LogOut size={18} /> 마감된 채용정보
                    </div>
                    <div onClick={() => setView('applicants')} className="flex items-center gap-3 p-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer font-bold text-sm">
                        <User size={18} /> 지원자 관리
                    </div>
                    <div onClick={() => setView('payments')} className="flex items-center gap-3 p-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer font-bold text-sm">
                        <CreditCard size={18} /> 결제 내역
                    </div>
                    <div onClick={() => setView('member-info')} className="flex items-center gap-3 p-3 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer font-bold text-sm border-t mt-2">
                        <Settings size={18} /> 회원정보 수정
                    </div>
                </nav>
            </aside>

            {/* Main Content (Dashboard) */}
            <div className="col-span-1 md:col-span-3 space-y-6">
                <header className="flex flex-col gap-4 mb-8">
                    <div className={`p-6 sm:rounded-[32px] shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-pink-600'} `}>
                                    <Store size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className={`text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} `}>{shopName}</h2>
                                        {isVerified && <Check size={16} className="text-blue-500" strokeWidth={3} />}
                                    </div>
                                    <p className="text-sm text-gray-500 font-bold flex items-center gap-1">
                                        <MapPin size={14} /> 서울 강남구 테헤란로
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={() => setShowDesignModal(true)} className={`flex-1 md:flex-none py-3 px-5 rounded-xl text-sm font-bold border transition ${brand.theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} `}>
                                    디자인 의뢰
                                </button>
                                <button onClick={() => handleAdClick(true)} className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-pink-500 text-white text-sm font-black hover:bg-pink-600 shadow-lg shadow-pink-500/30 transition flex items-center justify-center gap-2">
                                    <PlusSquare size={18} /> 새 공고 등록
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Progress Tabs (Capture 4 style simulation) */}
                <div className="flex gap-0 overflow-hidden rounded-xl border border-gray-200 font-black text-sm">
                    <button onClick={() => setView('dashboard')} className="flex-1 py-4 bg-gray-600 text-white flex items-center justify-center gap-2 border-r border-gray-100/10">
                        진행중인 채용정보 <span className="bg-white/20 px-2 py-0.5 rounded text-xs">1</span>
                    </button>
                    <button onClick={() => setView('closed-ads')} className="flex-1 py-4 bg-gray-200 text-gray-500 flex items-center justify-center gap-2">
                        마감된 채용정보 <span className="bg-gray-300 text-gray-600 px-2 py-0.5 rounded text-xs">0</span>
                    </button>
                </div>

                <div className={`rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>
                    {/* 1. Recruitment Info Placeholder for now */}
                    <div className={`p-4 border-b transition ${brand.theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50'} `}>
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex gap-2 text-xs items-center">
                                    <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-black">진행중</span>
                                    <span className="text-gray-400">마감일: 2026-02-25</span>
                                </div>
                                <h4 className={`font-bold line-clamp-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} `}>🔥 [강남 쩜오] 갯수보장 / 팁별도 / 당일지급 확실합니다!</h4>
                                <div className={`text-xs ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} `}>
                                    {shopName} {nickname && <span className="text-xs text-gray-400 ml-1">({nickname})</span>} | 서울 강남구 | 룸싸롱 | 아가씨
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0 items-center justify-center md:justify-end">
                                <button onClick={() => handleAdClick(false)} className={`px-3 py-2 border text-xs font-bold rounded transition ${brand.theme === 'dark' ? 'border-blue-500/50 text-blue-400 hover:bg-blue-900/20' : 'border-blue-500 text-blue-600 hover:bg-blue-50'} `}>수정</button>
                                <button className={`px-3 py-2 border text-xs font-bold rounded transition ${brand.theme === 'dark' ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} `}>마감</button>
                                <button className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 shadow-sm">
                                    <RefreshCw size={12} /> 점프
                                </button>
                                <button className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 shadow-sm">
                                    <Calendar size={12} /> 연장
                                </button>
                                <button className={`px-3 py-2 border text-xs font-bold rounded transition ${brand.theme === 'dark' ? 'border-red-900/50 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-500 hover:bg-red-50'} `}>삭제</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default BusinessDashboard;
