'use client';

import React, { useState, useEffect } from 'react';
import { List, Star, CreditCard, AlertTriangle, Briefcase, FileText, User, LogOut, ChevronRight, Home, Settings } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { PersonalMemberEdit } from '../PersonalMemberEdit';
import { ResumeForm } from '../ResumeForm';


// Placeholder for missing components from main page
const ComingSoonView = ({ title }: { title: string }) => {
    const brand = useBrand();
    return (
        <div className={`p-10 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center text-center ${brand.theme === 'dark' ? 'bg-gray-900/20 border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
            <Settings size={48} className="mb-4 opacity-20" />
            <h3 className="text-xl font-black mb-1">{title}</h3>
            <p className="text-sm font-bold opacity-60">현재 준비 중인 서비스입니다.</p>
        </div>
    );
};

export function PersonalSidebar({ view, setView }: { view: string, setView: (v: any) => void }) {
    const brand = useBrand();
    const [userName, setUserName] = useState('회원님');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) setUserName(storedName);
    }, []);

    const menuItems = [
        { id: 'resume-list', label: '이력서 리스트', icon: <List size={16} /> },
        { id: 'scrap-jobs', label: '채용정보 스크랩', icon: <Star size={16} /> },
        { id: 'payment-history', label: '유료결제 내역', icon: <CreditCard size={16} /> },
        { id: 'excluded-shops', label: '열람불가 업소설정', icon: <AlertTriangle size={16} /> },
        { id: 'custom-jobs', label: '맞춤구인정보', icon: <Briefcase size={16} /> },
        { id: 'my-posts', label: '내가 작성한 게시글', icon: <FileText size={16} /> },
        { id: 'block-settings', label: '회원 차단 설정', icon: <User size={16} /> },
        { id: 'post-bookmarks', label: '즐겨찾기한 게시글', icon: <Star size={16} /> },
    ];

    return (
        <aside className="col-span-1 space-y-4">
            <div className={`p-6 rounded-[32px] border shadow-sm text-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
                <div className="w-20 h-20 bg-pink-50 rounded-full mx-auto mb-4 flex items-center justify-center text-pink-500 border-2 border-pink-100">
                    <User size={32} />
                </div>
                <h2 className="font-black text-xl mb-1">{userName}</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black rounded uppercase">General</span>
                </div>
                <button
                    onClick={() => setView('member-edit')}
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2"
                >
                    프로필 관리
                </button>
            </div>

            <nav className={`hidden md:block p-3 rounded-[32px] border shadow-sm space-y-1 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition group ${view === item.id ? 'bg-pink-500 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={view === item.id ? 'text-white' : 'text-gray-400 group-hover:text-pink-500'}>{item.icon}</span>
                            <span className="text-xs font-black">{item.label}</span>
                        </div>
                        <ChevronRight size={14} className={view === item.id ? 'text-white/50' : 'text-gray-300'} />
                    </button>
                ))}
            </nav>

            <button
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                className={`hidden md:flex w-full p-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition ${brand.theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
            >
                <LogOut size={16} /> 로그아웃
            </button>
        </aside>
    );
}

export function PersonalDashboardHome({ setView, resumeCount = 0 }: { setView: (v: any) => void, resumeCount?: number }) {
    const brand = useBrand();
    const [userName, setUserName] = useState('회원님');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) setUserName(storedName);
    }, []);

    return (
        <div className="space-y-6">
            {/* 1. 기존 통계 그리드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: '스크랩한 공고', val: '12', icon: <Star className="text-yellow-400" /> },
                    { label: '열람한 기업', val: '45', icon: <Home className="text-blue-400" /> },
                    { label: '지원한 내역', val: '3', icon: <FileText className="text-pink-400" /> }
                ].map((item, idx) => (
                    <div key={idx} className={`p-6 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-gray-50 rounded-xl dark:bg-gray-800">{item.icon}</span>
                            <span className="text-sm font-black">{item.label}</span>
                        </div>
                        <div className="text-3xl font-black">{item.val}<span className="text-sm text-gray-400 ml-1">건</span></div>
                    </div>
                ))}
            </div>

            {/* 2. 구직활동 요약 섹션 (배너 바로 위, 중간 배치) */}
            <div className={`p-6 md:p-8 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50 dark:border-gray-800">
                    <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                        <FileText size={18} />
                    </div>
                    <h3 className={`text-lg font-black ${brand.theme === 'dark' ? 'text-white' : 'text-[#334155]'}`}>{userName} 님의 구직활동</h3>
                </div>

                <div className="flex items-center justify-around py-4 relative">
                    {/* 세로 구분선 */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800 hidden md:block"></div>

                    <div className="text-center space-y-2">
                        <div className="text-xs md:text-sm font-black text-gray-500">이력서 등록수</div>
                        <div className="text-3xl md:text-5xl font-black text-pink-500 flex items-baseline justify-center gap-1">
                            {resumeCount}<span className="text-sm md:text-lg text-gray-400 font-bold">개</span>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <div className="text-xs md:text-sm font-black text-gray-500">공개중인 이력서</div>
                        <div className="text-3xl md:text-5xl font-black text-pink-500 flex items-baseline justify-center gap-1">
                            {resumeCount}<span className="text-sm md:text-lg text-gray-400 font-bold">개</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 하단 배너 섹션 (기존 상단 섹션 이동 + 버튼 텍스트 수정) */}
            <div className={`p-6 md:p-8 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-200">
                            <User size={32} className="md:w-10 md:h-10" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-black mb-1">관심 공고를 확인하세요!</h2>
                            <p className="text-sm text-gray-500 font-bold">회원님만을 위한 맞춤 취업 정보를 제공합니다.</p>
                        </div>
                    </div>
                    <button onClick={() => setView('resume-form')} className="w-full md:w-auto py-4 px-10 bg-pink-500 text-white rounded-2xl font-black hover:bg-pink-600 shadow-xl shadow-pink-200 transition-all flex items-center justify-center gap-2 active:scale-95">
                        <span className="text-lg">+</span> 이력서 등록하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PersonalDashboard({ view, setView, resumeCount = 0 }: { view: string, setView: (v: any) => void, resumeCount?: number }) {
    const brand = useBrand();

    return (
        <div className="max-w-6xl mx-auto p-3 md:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <PersonalSidebar view={view} setView={setView} />
            <main className="col-span-1 md:col-span-3">
                {(view === 'member-info' || view === 'dashboard' || view === 'resume-list') && <PersonalDashboardHome setView={setView} resumeCount={resumeCount} />}
                {view === 'member-edit' && <PersonalMemberEdit setView={setView} />}
                {view === 'resume-form' && <ResumeForm setView={setView} />}

                {view === 'scrap-jobs' && <ComingSoonView title="채용정보 스크랩" />}
                {view === 'payment-history' && <ComingSoonView title="유료결제 내역" />}
                {view === 'excluded-shops' && <ComingSoonView title="열람불가 업소설정" />}
                {view === 'custom-jobs' && <ComingSoonView title="맞춤구인정보" />}
                {view === 'my-posts' && <ComingSoonView title="내가 작성한 게시글" />}
                {view === 'block-settings' && <ComingSoonView title="회원 차단 설정" />}
                {view === 'post-bookmarks' && <ComingSoonView title="즐겨찾기한 게시글" />}
            </main>
        </div>
    );
}
