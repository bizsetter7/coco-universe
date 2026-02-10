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
        <div className="w-full space-y-6">
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
    );
};
export default BusinessDashboard;
