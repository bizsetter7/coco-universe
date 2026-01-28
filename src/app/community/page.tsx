'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
    const pathname = usePathname();
    // [새로고침 무결성] URL 파라미터로부터 현재 탭을 강제 도출
    // 클라이언트 사이드에서 즉각적으로 반영되도록 useMemo로 래핑
    const [activeTab, setActiveTab] = useState('전체');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category') || '전체';
        setActiveTab(cat);
    }, [searchParams]);

    const [userType, setUserType] = useState<UserType>('individual');
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate login state
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);
    const brand = useBrand();

    // 탭 변경 시 URL 즉시 업데이트 및 스크롤 핸들링
    const handleTabChange = (cat: string) => {
        const params = new URLSearchParams(window.location.search);
        if (cat === '전체') {
            params.delete('category');
        } else {
            params.set('category', cat);
        }

        // window.history를 사용하여 강제로 URL을 동기화하여 Hydration 이슈 차단
        window.history.pushState({}, '', `${pathname}?${params.toString()}`);

        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            window.dispatchEvent(new CustomEvent('sidebar-warp'));
            // pushState는 searchParams를 즉시 트리거하지 않으므로 강제 리랜더링 유도 (Next.js router.push 병행 가능)
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        });
    };

    const filteredPosts = React.useMemo(() => {
        return activeTab === '전체'
            ? MOCK_POSTS
            : MOCK_POSTS.filter(post => post.category === activeTab);
    }, [activeTab]);

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
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'}`}>
            {/* 
                [Fixed Mastery] 
                커뮤니티 전용 레이아웃: 
                기존 Sticky 방식 대신 Fixed 방식을 사용하여 스크롤 유실 문제를 원천 봉쇄함. 
            */}

            {/* 1단 상단바 (Fixed z-60) - 보더 제거로 개방감 확보 */}
            <div className={`fixed top-0 left-0 right-0 z-[60] shadow-sm h-14 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="max-w-[1020px] mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.push('/')} className={`p-2 -ml-2 transition-colors ${brand.theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}>
                            <ArrowLeft size={24} />
                        </button>
                        <h1
                            onClick={() => router.push('/')}
                            className={`text-xl font-black flex items-center gap-2 tracking-tighter cursor-pointer hover:opacity-80 transition-opacity ${brand.theme === 'dark' ? 'text-pink-400' : 'text-pink-500'}`}
                        >
                            <MessageCircle className={`${brand.theme === 'dark' ? 'fill-pink-400' : 'fill-pink-500'}`} size={24} />
                            그녀들의 수다
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => router.push('/')} className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                            <Home size={24} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors">
                            <Search size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2단 카테고리 탭 (Fixed z-50, top-14) - 보더 제거로 일체감 조성 */}
            <div className={`fixed top-14 left-0 right-0 z-50 backdrop-blur-md min-h-[48px] py-1 ${brand.theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'}`}>
                <div className="max-w-[1020px] mx-auto flex flex-wrap justify-start px-4 h-full gap-y-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleTabChange(cat)}
                            className={`px-3 py-2 text-sm font-bold border-b-2 transition-all duration-200 flex items-center ${activeTab === cat
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Body: Fixed 헤더 높이(56+48=104px) 만큼 패딩 부여 */}
            <div className="pt-[115px] pb-20">
                {/* Admin/Mock Controls */}
                <div className="max-w-[1020px] mx-auto mb-4 px-4">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-[11px] text-indigo-700">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-900">🔑 상태 테스트:</span>
                            <button
                                onClick={() => setIsLoggedIn(!isLoggedIn)}
                                className={`px-2 py-1 rounded font-black transition ${isLoggedIn ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-600 shadow-sm'}`}
                            >
                                {isLoggedIn ? '로그인 됨' : '로그인 안 됨'}
                            </button>
                            <button
                                onClick={() => setUserType(userType === 'individual' ? 'corporate' : 'individual')}
                                className={`px-2 py-1 rounded font-black bg-white border border-indigo-200 text-indigo-600 shadow-sm`}
                            >
                                전환: {userType === 'individual' ? '개인' : '업소'}
                            </button>
                        </div>
                        <span className="font-bold text-indigo-600 hidden sm:inline">비로그인 시에는 게시글 내용이 블러처리 됩니다. 🤫</span>
                    </div>
                </div>

                <main className="max-w-[1020px] mx-auto px-0 sm:px-4 space-y-4">
                    {/* 커뮤니티 상단 브랜드 광고 (Brand Slider 대용) */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 sm:rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group mb-6 cursor-pointer">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded-lg bg-white/20 text-[10px] font-black mb-2 tracking-widest uppercase">Community Prime Ad</span>
                                <h3 className="text-lg md:text-xl font-black mb-1 leading-tight">그녀들의 이야기가<br />수익이 되는 순간! 💰</h3>
                                <p className="text-[10px] md:text-[12px] opacity-80 font-bold">광고 문의하고 커뮤니티 상단 선점하세요</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full group-hover:scale-110 transition-transform">
                                <MessageCircle size={32} />
                            </div>
                        </div>
                    </div>

                    {activeTab === '프리미엄 라운지' ? (
                        /* Lounge View */
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="fill-amber-500 text-amber-500" size={20} />
                                <h3 className={`text-xl font-black underline decoration-amber-400 decoration-8 underline-offset-[-2px] ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>프리미엄 라운지</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link href="/lounge" className={`p-6 rounded-3xl shadow-sm hover:scale-[1.02] transition-all group border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <div className="bg-green-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20 group-hover:rotate-6 transition-transform">
                                        <Apple size={28} />
                                    </div>
                                    <h4 className={`font-black text-lg mb-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>식단 & BMI 관리</h4>
                                    <p className={`text-xs leading-relaxed mb-4 font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>나의 체형분석과 맞춤형 식단 정보를 무료로 받아보세요.</p>
                                    <div className="flex items-center text-xs font-black text-green-600 ring-1 ring-green-100 rounded-full w-fit px-3 py-1.5 bg-green-50">
                                        분석 시작하기 <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </Link>

                                <Link href="/lounge" className={`p-6 rounded-3xl shadow-sm hover:scale-[1.02] transition-all group border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <div className="bg-amber-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20 group-hover:rotate-6 transition-transform">
                                        <Moon size={28} />
                                    </div>
                                    <h4 className={`font-black text-lg mb-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>오늘의 사주 & 운세</h4>
                                    <p className={`text-xs leading-relaxed mb-4 font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>재물운, 연애운, 건강운까지 {brand.name}에서 확인하세요.</p>
                                    <div className="flex items-center text-xs font-black text-amber-600 ring-1 ring-amber-100 rounded-full w-fit px-3 py-1.5 bg-amber-50">
                                        운세 보러가기 <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </Link>

                                <Link href="/lounge" className={`p-6 rounded-3xl shadow-sm hover:scale-[1.02] transition-all group border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                    <div className="bg-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                                        <Sparkles size={28} />
                                    </div>
                                    <h4 className={`font-black text-lg mb-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>성향 & 컬러 테스트</h4>
                                    <p className={`text-xs leading-relaxed mb-4 font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>나에게 맞는 메이크업과 최적의 직종을 찾아드립니다.</p>
                                    <div className="flex items-center text-xs font-black text-blue-600 ring-1 ring-blue-100 rounded-full w-fit px-3 py-1.5 bg-blue-50">
                                        테스트 시작 <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </Link>
                            </div>

                            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <ShieldAlert size={120} />
                                </div>
                                <h4 className="text-2xl font-black mb-2">그녀들만의 비밀스러운 대화 🤫</h4>
                                <p className="text-white/90 text-sm mb-6 leading-relaxed font-bold">
                                    익명이 보장되는 안전한 공간에서<br />
                                    더 깊은 이야기를 나누고 싶다면 커뮤니티 게시판을 이용하세요.
                                </p>
                                <button onClick={() => handleTabChange('전체')} className="bg-white text-pink-600 px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-pink-900/20 active:scale-95 transition-all outline-none">
                                    수다 떨러 가기
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Post List */
                        <div className="grid grid-cols-1 gap-4">
                            {filteredPosts.map((post, idx) => {
                                const isAdPos = (idx + 1) % 4 === 0;

                                return (
                                    <React.Fragment key={post.id}>
                                        <div
                                            onClick={() => handlePostClick(post.id)}
                                            className={`p-6 sm:rounded-[32px] shadow-sm border active:scale-[0.98] transition-all cursor-pointer hover:border-pink-200 group ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[11px] font-black group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                                                    {post.category}
                                                </span>
                                                <span className="text-[11px] text-gray-500 font-bold">{post.time}</span>
                                            </div>

                                            <h3 className={`font-black mb-1 lg:text-xl leading-snug ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {post.isHot && <span className="text-red-600 mr-2 inline-flex items-center gap-1"><ShieldAlert size={16} className="fill-red-600 text-white" /> HOT</span>}
                                                {post.title}
                                            </h3>

                                            <p className={`text-sm line-clamp-2 mb-5 font-black group-hover:opacity-100 transition-opacity ${brand.theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>
                                                <span className={userType === 'corporate' || !isLoggedIn ? 'blur-[5px] select-none' : ''}>
                                                    {post.content}
                                                </span>
                                            </p>

                                            <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 shadow-inner">
                                                        <User size={16} />
                                                    </div>
                                                    <span className={`font-black ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{post.author}</span>
                                                </div>
                                                <div className="flex gap-5">
                                                    <span className="flex items-center gap-1.5 text-pink-600 font-black">
                                                        <Heart size={16} className="fill-current" /> {post.likes}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-blue-600 font-black">
                                                        <MessageSquare size={16} className="fill-current" /> {post.comments}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 커뮤니티 네이티브 광고 (4번째 게시글마다 삽입) */}
                                        {isAdPos && (
                                            <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-orange-100 rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                                        <Sparkles size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Sponsored Content</p>
                                                        <h4 className={`font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>[VIP 추천] {brand.name} 런칭 기념<br />역대급 혜택 받는 법! ✨</h4>
                                                    </div>
                                                </div>
                                                <button className="bg-orange-600 text-white text-[11px] font-black px-6 py-3 rounded-2xl group-hover:scale-105 transition-transform shadow-lg shadow-orange-200/50">지금 확인하기</button>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Login Required Modal (z-100) */}
            {loginModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-lg" onClick={() => setLoginModalOpen(false)}></div>
                    <div className={`rounded-[45px] w-full max-w-sm p-12 relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-white/20'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-10 text-pink-500 ring-8 ring-pink-50 shadow-inner">
                                <Lock size={48} strokeWidth={2.5} />
                            </div>
                            <h3 className={`text-2xl font-black mb-4 tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>그녀들만의 비밀 커뮤니티 🤫</h3>
                            <p className={`mb-12 leading-relaxed font-bold text-sm ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                이곳은 <span className="text-pink-600 font-black underline underline-offset-4 decoration-4">인증된 여성 회원</span>들만<br />
                                입장하실 수 있는 안전한 공간입니다.<br />
                                <br />
                                <span className={`px-4 py-2 rounded-2xl border ${brand.theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-200'}`}>로그인하고 실시간 핫이슈를 확인하세요! 🔥</span>
                            </p>
                            <div className="grid grid-cols-1 w-full gap-3">
                                <button
                                    onClick={() => router.push('/?page=signup')}
                                    className="w-full py-5 bg-pink-600 text-white rounded-3xl font-black text-lg hover:bg-pink-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-pink-200 outline-none"
                                >
                                    지금 가입하고 확인하기
                                </button>
                                <button
                                    onClick={() => setLoginModalOpen(false)}
                                    className={`w-full py-4 font-black transition-colors ${brand.theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    다음에 할게요
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Corporate Access Denied Modal (z-100) */}
            {isCorporateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-lg" onClick={() => setIsCorporateModalOpen(false)}></div>
                    <div className={`rounded-[40px] w-full max-w-xs p-10 relative z-10 shadow-2xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-inner">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className={`text-xl font-black mb-3 underline decoration-blue-200 decoration-4 underline-offset-4 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>접근 권한 제한</h3>
                            <p className={`text-sm mb-8 leading-relaxed font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                                사장님 회원은 구직자들의 소통 공간을<br />
                                열람하실 수 없습니다. 🙏
                            </p>
                            <button
                                onClick={() => setIsCorporateModalOpen(false)}
                                className={`w-full py-4 rounded-2xl font-black transition-all outline-none ${brand.theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                            >
                                확인했습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button (z-40) */}
            {isLoggedIn && userType !== 'corporate' && activeTab !== '프리미엄 라운지' && (
                <button
                    onClick={() => alert('게시글 작성은 정식 출시 후 가능합니다!')}
                    className="fixed bottom-24 right-6 bg-pink-600 text-white p-5 rounded-full shadow-2xl hover:bg-pink-700 active:scale-90 transition-all z-40 lg:right-12"
                >
                    <PenLine size={28} />
                </button>
            )}
        </div>
    );
}
