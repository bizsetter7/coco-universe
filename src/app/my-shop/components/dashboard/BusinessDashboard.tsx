'use client';

import React from 'react';
import { ChevronLeft, Store, MapPin, Check, PlusSquare, RefreshCw, Calendar, List, LogOut, CreditCard, User, Settings } from 'lucide-react';

interface BusinessDashboardProps {
    brand: any;
    shopName: string;
    nickname: string;
    isVerified: boolean;
    handleAdClick: (isNew: boolean, ad?: any) => void;
    setShowDesignModal: (v: boolean) => void;
    setView: (v: any) => void;
    router: any;
    ads?: any[];
    onOpenMenu?: () => void;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
    brand, shopName, nickname, isVerified, handleAdClick, setShowDesignModal, setView, router, ads = [], onOpenMenu
}) => {
    const [activeTab, setActiveTab] = React.useState<'ongoing' | 'closed'>('ongoing');

    // Filter ads based on status (assuming closed ads have a status or isClosed property, 
    // for now we'll simulate sorting or using the prop)
    const ongoingAds = ads.filter(ad => !ad.isClosed);
    const closedAds = ads.filter(ad => ad.isClosed);
    const displayedAds = activeTab === 'ongoing' ? ongoingAds : closedAds;

    return (
        <div className="w-full space-y-3 md:space-y-6">
            <header className="flex flex-col gap-2 md:gap-4 mb-2 md:mb-4">
                <div className={`p-4 md:p-6 sm:rounded-[32px] shadow-sm border relative ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>
                    {/* Mobile Menu Button */}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
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
                            <button onClick={() => handleAdClick(true)} className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-pink-500 text-white text-sm font-black hover:bg-pink-600 shadow-lg shadow-pink-500/30 transition flex items-center justify-center gap-2 whitespace-nowrap">
                                <PlusSquare size={18} /> 새 공고 등록
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Tabs */}
            <div className="flex gap-0 overflow-hidden rounded-xl border border-gray-200 font-black text-sm">
                <button
                    onClick={() => setActiveTab('ongoing')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 border-r border-gray-200 transition-colors ${activeTab === 'ongoing' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                    진행중인 채용정보 <span className={`px-2 py-0.5 rounded text-xs ${activeTab === 'ongoing' ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>{ongoingAds.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('closed')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${activeTab === 'closed' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                    마감된 채용정보 <span className={`px-2 py-0.5 rounded text-xs ${activeTab === 'closed' ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>{closedAds.length}</span>
                </button>
            </div>

            <div className="space-y-4">
                {displayedAds.length === 0 ? (
                    <div className={`p-12 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center gap-2 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50/50 border-gray-200'} `}>
                        <List size={32} className="text-gray-300" />
                        <p className="text-gray-400 font-bold">{activeTab === 'ongoing' ? '진행중인 공고가 없습니다.' : '마감된 공고가 없습니다.'}</p>
                    </div>
                ) : (
                    displayedAds.map((ad: any) => (
                        <div key={ad.id} className={`p-6 rounded-2xl border transition shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 hover:bg-gray-800/50' : 'bg-white border-gray-100 hover:shadow-md'} `}>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex gap-2 text-[11px] items-center font-black">
                                        <span className={`${ad.status === 'PENDING_REVIEW' ? 'bg-orange-100 text-orange-500' : (activeTab === 'ongoing' ? 'bg-pink-100 text-pink-500' : 'bg-gray-200 text-gray-500')} px-2 py-0.5 rounded`}>
                                            {ad.status === 'PENDING_REVIEW' ? '심사중' : (activeTab === 'ongoing' ? '진행중' : '마감')}
                                        </span>
                                        <span className="text-gray-400">마감일: {ad.deadline || '2026-03-25'}</span>
                                    </div>
                                    <h4 className={`font-bold text-[15px] line-clamp-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} `}>
                                        🔥 {ad.title}
                                    </h4>
                                    <div className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} `}>
                                        {shopName} {nickname && <span className="text-gray-400 ml-1">({nickname})</span>}
                                        <span className="md:hidden"><br /></span>
                                        <span className="hidden md:inline"> | </span>
                                        {ad.regionCity} {ad.regionGu} | {ad.category || '룸싸롱'} | 아가씨
                                    </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0 items-center justify-center md:justify-end">
                                    <button onClick={() => handleAdClick(false, ad)} className="px-3 py-2 border border-blue-200 text-blue-500 text-xs font-bold rounded-lg hover:bg-blue-50 transition">수정</button>
                                    <button className="px-3 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition">마감</button>
                                    <button className="flex items-center gap-1.2 px-3 py-2 bg-green-500 text-white text-xs font-black rounded-lg hover:bg-green-600 shadow-sm transition">
                                        <RefreshCw size={12} /> 점프
                                    </button>
                                    <button className="flex items-center gap-1.2 px-3 py-2 bg-blue-500 text-white text-xs font-black rounded-lg hover:bg-blue-600 shadow-sm transition">
                                        <Calendar size={12} /> 연장
                                    </button>
                                    <button className="px-3 py-2 border border-red-100 text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 transition">삭제</button>
                                </div>
                            </div>

                            {/* Bottom Action Area (Applicants) */}
                            <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 mt-4 border-t ${brand.theme === 'dark' ? 'bg-gray-800/30 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                <button
                                    onClick={() => setView('applicants')}
                                    className="bg-gray-900 text-white px-4 py-2 text-[12px] font-black rounded-xl shadow-lg hover:bg-black transition active:scale-95"
                                >
                                    온라인 인재관리
                                </button>
                                <div className="flex gap-4 text-[13px] font-black">
                                    <span className="flex items-center gap-1.5 text-pink-500 bg-pink-50 dark:bg-pink-500/10 px-3 py-1 rounded-full"><User size={14} /> 지원자 {ad.applicantCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default BusinessDashboard;
