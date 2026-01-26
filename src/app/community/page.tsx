'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    MessageCircle,
    Heart,
    MessageSquare,
    AlertCircle,
    Lock,
    Search,
    PenLine,
    Home,
    ArrowLeft,
    User,
    ShieldAlert,
    Sparkles,
    Apple,
    Moon,
    ArrowRight
} from 'lucide-react';
import { CATEGORIES, MOCK_POSTS } from '@/constants/community';
import Link from 'next/link';
import { useBrand } from '@/components/BrandProvider';

// --- Types ---
type UserType = 'individual' | 'corporate' | 'admin';

export default function CommunityPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">데이터를 불러오는 중...</div>}>
            <CommunityContent />
        </Suspense>
    );
}

function CommunityContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('전체');
    const [userType, setUserType] = useState<UserType>('individual');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate login state
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);
    const brand = useBrand();

    // Sync tab with URL param
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat && CATEGORIES.includes(cat)) {
            setActiveTab(cat);
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: 'auto' });
                window.dispatchEvent(new CustomEvent('sidebar-warp'));
            });
        }
    }, [searchParams]);

    const filteredPosts = activeTab === '전체'
        ? MOCK_POSTS
        : MOCK_POSTS.filter(post => post.category === activeTab);

    const handlePostClick = (postId: number) => {
        if (!isLoggedIn) {
            setLoginModalOpen(true);
            return;
        }

        if (userType === 'corporate') {
            setIsCorporateModalOpen(true);
        } else {
            router.push(`/community/${postId}`);
        }
    };

    return (
        <div className="relative bg-gray-50 pb-20">
            {/* 2단 독립 Sticky Header 시스템 (확정 버전 - 래퍼 제거 및 구조 최적화) */}

            {/* 1단 상단바: 로고 및 홈 버튼 (sticky top-0) */}
            <div className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all shadow-sm">
                <div className="max-w-[1020px] mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 pt-2">
                        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-600">
                            <ArrowLeft size={24} />
                        </button>
                        <h1
                            onClick={() => router.push('/')}
                            className="text-xl font-black text-pink-500 flex items-center gap-2 tracking-tighter cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <MessageCircle className="fill-pink-500" size={24} />
                            그녀들의 수다
                        </h1>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => router.push('/')} className="p-2 text-gray-400 hover:text-gray-600">
                            <Home size={24} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Search size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2단 카테고리 탭: 스크롤 시 상단바 바로 밑에 고정 (sticky top-14) */}
            <div className="bg-white/95 backdrop-blur-md border-b sticky top-14 z-50 overflow-x-auto scrollbar-hide">
                <div className="max-w-[1020px] mx-auto flex px-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveTab(cat);
                                requestAnimationFrame(() => {
                                    window.scrollTo({ top: 0, behavior: 'auto' });
                                    window.dispatchEvent(new CustomEvent('sidebar-warp'));
                                });
                            }}
                            className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === cat
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Admin/Mock Controls */}
            <div className="max-w-[1020px] mx-auto p-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-[11px] text-indigo-700">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-800">🔑 상태 테스트:</span>
                    <button
                        onClick={() => setIsLoggedIn(!isLoggedIn)}
                        className={`px-2 py-1 rounded font-bold transition ${isLoggedIn ? 'bg-indigo-500 text-white' : 'bg-white border border-indigo-200'}`}
                    >
                        {isLoggedIn ? '로그인 됨' : '로그인 안 됨'}
                    </button>
                    <button
                        onClick={() => setUserType(userType === 'individual' ? 'corporate' : 'individual')}
                        className={`px-2 py-1 rounded font-bold bg-white border border-indigo-200`}
                    >
                        전환: {userType === 'individual' ? '개인' : '업소'}
                    </button>
                </div>
                <span className="opacity-80 text-indigo-500 hidden sm:inline">로그인 안 됨 상태에서 게시글을 클릭해보세요!</span>
            </div>

            <main className="max-w-[1020px] mx-auto p-4 space-y-4">
                {activeTab === '프리미엄 라운지' ? (
                    /* Lounge View within Community */
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-amber-500" size={20} />
                            <h3 className="text-xl font-black text-gray-900">프리미엄 라운지</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/lounge" className="p-6 rounded-3xl bg-white border border-green-100 shadow-sm hover:scale-[1.02] transition-all group">
                                <div className="bg-green-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20 group-hover:rotate-6 transition-transform">
                                    <Apple size={28} />
                                </div>
                                <h4 className="font-black text-lg mb-2">식단 & BMI 관리</h4>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">나의 체형분석과 맞춤형 식단 정보를 무료로 받아보세요.</p>
                                <div className="flex items-center text-xs font-black text-green-500 ring-1 ring-green-100 rounded-full w-fit px-3 py-1.5 bg-green-50/30">
                                    분석 시작하기 <ArrowRight size={14} className="ml-1" />
                                </div>
                            </Link>

                            <Link href="/lounge" className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm hover:scale-[1.02] transition-all group">
                                <div className="bg-amber-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20 group-hover:rotate-6 transition-transform">
                                    <Moon size={28} />
                                </div>
                                <h4 className="font-black text-lg mb-2">오늘의 사주 & 운세</h4>
                                <p className="text-xs text-gray-400 leading-relaxed mb-4">재물운, 연애운, 건강운까지 {brand.name}에서 확인하세요.</p>
                                <div className="flex items-center text-xs font-black text-amber-500 ring-1 ring-amber-100 rounded-full w-fit px-3 py-1.5 bg-amber-50/30">
                                    운세 보러가기 <ArrowRight size={14} className="ml-1" />
                                </div>
                            </Link>

                            <Link href="/lounge" className="p-6 rounded-3xl bg-white border border-blue-100 shadow-sm hover:scale-[1.02] transition-all group">
                                <div className="bg-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                                    <Sparkles size={28} />
                                </div>
                                <h4 className="font-black text-lg mb-2">성향 & 컬러 테스트</h4>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">나에게 맞는 메이크업과 최적의 직종을 찾아드립니다.</p>
                                <div className="flex items-center text-xs font-black text-blue-500 ring-1 ring-blue-100 rounded-full w-fit px-3 py-1.5 bg-blue-50/30">
                                    테스트 시작 <ArrowRight size={14} className="ml-1" />
                                </div>
                            </Link>
                        </div>

                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <ShieldAlert size={120} />
                            </div>
                            <h4 className="text-2xl font-black mb-2">그녀들만의 비밀스러운 대화 🤫</h4>
                            <p className="text-white/80 text-sm mb-6 leading-relaxed font-medium">
                                익명이 보장되는 안전한 공간에서<br />
                                더 깊은 이야기를 나누고 싶다면 커뮤니티 게시판을 이용하세요.
                            </p>
                            <button onClick={() => setActiveTab('전체')} className="bg-white text-pink-500 px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-pink-900/20 active:scale-95 transition-all">
                                수다 떨러 가기
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Post List */
                    <div className="grid grid-cols-1 gap-3">
                        {filteredPosts.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => handlePostClick(post.id)}
                                className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer hover:border-pink-200 group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                                        {post.category}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">{post.time}</span>
                                </div>

                                <h3 className="font-bold text-gray-800 mb-1 lg:text-lg">
                                    {post.isHot && <span className="text-red-500 mr-2 inline-flex items-center gap-0.5"><ShieldAlert size={14} /> HOT</span>}
                                    {post.title}
                                </h3>

                                <p className="text-sm text-gray-600 line-clamp-1 mb-4 opacity-90 group-hover:opacity-100 transition-opacity">
                                    <span className={userType === 'corporate' || !isLoggedIn ? 'blur-[4px] select-none' : ''}>
                                        {post.content}
                                    </span>
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                                            <User size={12} />
                                        </div>
                                        <span className="font-bold text-gray-700">{post.author}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1.5 text-pink-500 font-black">
                                            <Heart size={14} className="fill-current" /> {post.likes}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-blue-500 font-black">
                                            <MessageSquare size={14} className="fill-current" /> {post.comments}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Login Required Modal */}
            {loginModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setLoginModalOpen(false)}></div>
                    <div className="bg-white rounded-[40px] w-full max-w-sm p-10 relative z-10 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-8 text-pink-500 ring-8 ring-pink-50">
                                <Lock size={48} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">그녀들만의 비밀 커뮤니티</h3>
                            <p className="text-gray-500 mb-10 leading-relaxed text-sm">
                                이곳은 <span className="text-pink-500 font-black underline underline-offset-4">인증된 여성 회원</span>들만<br />
                                입장하실 수 있는 비밀스러운 공간입니다.<br />
                                <br />
                                <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-full font-bold">로그인 후 실시간 핫이슈를 확인하세요! 🤫</span>
                            </p>
                            <div className="grid grid-cols-1 w-full gap-3">
                                <button
                                    onClick={() => router.push('/?page=signup')}
                                    className="w-full py-5 bg-pink-500 text-white rounded-3xl font-black text-lg hover:bg-pink-600 hover:scale-[1.02] transition-all shadow-xl shadow-pink-200"
                                >
                                    지금 가입하고 확인하기
                                </button>
                                <button
                                    onClick={() => setLoginModalOpen(false)}
                                    className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                                >
                                    다음에 할게요
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Corporate Access Denied Modal */}
            {isCorporateModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCorporateModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-xs p-8 relative z-10 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">접근 권한 제한</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                사장님 회원은 구직자들의 소통 공간을<br />
                                열람하실 수 없습니다. 🙏
                            </p>
                            <button
                                onClick={() => setIsCorporateModalOpen(false)}
                                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black hover:bg-blue-600 transition-all"
                            >
                                확인했습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {isLoggedIn && userType !== 'corporate' && activeTab !== '프리미엄 라운지' && (
                <button
                    onClick={() => alert('게시글 작성은 정식 출시 후 가능합니다!')}
                    className="fixed bottom-24 right-6 bg-pink-500 text-white p-5 rounded-full shadow-2xl hover:bg-pink-600 active:scale-90 transition-all z-20"
                >
                    <PenLine size={28} />
                </button>
            )}
        </div>
    );
}
