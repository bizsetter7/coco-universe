'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    Heart,
    MessageSquare,
    Lock,
    PenLine,
    User,
    ShieldAlert,
    Sparkles,
    Apple,
    Info,
    Moon,
    ThumbsUp,
    ChevronRight,
    Calculator,
    Star,
    Eye
} from 'lucide-react';
import { CATEGORIES, MOCK_POSTS } from '@/constants/community';
import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { supabase } from '@/lib/supabase';

// --- Types ---
type UserType = 'individual' | 'corporate' | 'admin' | 'guest';

export default function CommunityContent() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">데이터를 불러오는 중...</div>}>
            <CommunityContentInner />
        </Suspense>
    );
}

import { Post } from '@/types/community';

function CommunityContentInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // [Hydration Optimization] Derive activeTab directly from URL params to prevent flashing
    const activeTab = searchParams.get('category') || '전체';

    const [mounted, setMounted] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    // [Fix] Use reactive userType from useAuth instead of fragile local state
    const { isLoggedIn, userType } = useAuth();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);
    const brand = useBrand();
    const primaryStyle = { color: brand.primaryColor };

    useEffect(() => {
        setMounted(true);
        fetchPosts();
        // [Cleanup] Removed manual localStorage check for user_type
    }, []);

    // [Optimization] Prevent background scroll when modal is open (Fixes jitter)
    useBodyScrollLock(loginModalOpen || isCorporateModalOpen);

    const [posts, setPosts] = useState<Post[]>([]);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('community_posts')
                .select('*')
                .order('created_at', { ascending: false });

            let finalPosts: Post[] = [];

            if (data && data.length > 0) {
                // [Persistence Logic] Merge DB posts with ALL MOCK_POSTS
                // Mocks are used as base, DB posts override or add to the list
                const postsMap = new Map<number, Post>();

                // 1. Load Mocks first
                MOCK_POSTS.forEach(p => postsMap.set(p.id, p));

                // 2. Override/Add with DB data
                data.forEach((p: any) => postsMap.set(p.id, p as Post));

                // 3. Convert back to array and sort by created_at or ID desc
                finalPosts = Array.from(postsMap.values()).sort((a, b) => b.id - a.id);

                localStorage.setItem('community_posts_backup', JSON.stringify(finalPosts));
            } else {
                finalPosts = MOCK_POSTS;
                localStorage.removeItem('community_posts_backup');
            }

            setPosts(finalPosts);
        } catch (err) {
            console.error('[Community] Critical error in fetchPosts:', err);
            setPosts(MOCK_POSTS);
        }
    };

    // 탭 변경 시 URL 즉시 업데이트 및 스크롤 핸들링
    const handleTabChange = (cat: string) => {
        const params = new URLSearchParams(window.location.search);
        if (cat === '전체') {
            params.delete('category');
        } else {
            params.set('category', cat);
        }

        // 프리미엄 라운지 탭을 누르면 항상 라운지 메인으로 복귀하도록 lounge 파라미터 삭제
        if (cat === '프리미엄 라운지') {
            params.delete('lounge');
        }

        // URL 업데이트 (Next.js router.push가 searchParams를 업데이트하여 컴포넌트 리랜더링 유도)
        window.scrollTo({ top: 0, behavior: 'auto' });
        setCurrentPage(1); // Reset to first page
        router.push(`${pathname}?${params.toString()}`, { scroll: false });

        // 사이드바 워프 등 필요한 커스텀 이벤트 발생
        window.dispatchEvent(new CustomEvent('sidebar-warp'));
    };

    const filteredPosts = React.useMemo(() => {
        return activeTab === '전체'
            ? posts
            : posts.filter(post => post.category === activeTab);
    }, [activeTab, posts]);

    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePostClick = (postId: number) => {
        if (!isLoggedIn) {
            setLoginModalOpen(true);
            return;
        }

        // [Security] Strict check for corporate users
        if (userType === 'corporate') {
            setIsCorporateModalOpen(true);
        } else {
            router.push(`/community/${postId}`);
        }
    };

    const handleWriteClick = () => {
        if (!isLoggedIn) {
            setLoginModalOpen(true);
            return;
        }
        if (userType === 'corporate') {
            setIsCorporateModalOpen(true);
            return;
        }
        router.push('/community/write');
    };

    if (!mounted) return <div className="min-h-screen" />;

    return (
        <div className={`min-h-screen will-change-scroll ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'} ${isCorporateModalOpen ? 'overflow-hidden h-screen pointer-events-none' : ''}`}>
            {/* Removed redundant security blur layer to prevent additive blur effect */}
            {/* 모바일 전용: 현재 카테고리 타이틀 표시 (서브페이지일 때 누르면 라운지 메인으로) */}
            <div className="flex md:hidden items-center px-4 py-5">
                <h2
                    onClick={() => {
                        if (activeTab === '프리미엄 라운지' && searchParams.get('lounge')) {
                            const params = new URLSearchParams(window.location.search);
                            params.delete('lounge');
                            router.push(`${pathname}?${params.toString()}`, { scroll: false });
                        }
                    }}
                    className={`text-xl font-black text-blue-600 transition-all duration-300 ${activeTab === '프리미엄 라운지' && searchParams.get('lounge') ? 'cursor-pointer active:scale-95' : ''}`}
                >
                    {activeTab}
                </h2>
            </div>

            {/* '비밀스러운 대화' 배너 - 프리미엄 라운지가 아닐 때만 표시 */}
            {activeTab !== '프리미엄 라운지' && (
                <div className="bg-gradient-to-r from-blue-500 to-rose-500 p-6 text-white relative overflow-hidden shadow-xl">
                    <div className="max-w-[1200px] mx-auto relative z-10">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <ShieldAlert size={120} />
                        </div>
                        <div className="relative z-20">
                            <h4 className="text-xl md:text-2xl font-black mb-2">그녀들만의 비밀스러운 대화 🤫</h4>
                            <p className="text-white/90 text-sm mb-4 leading-relaxed font-bold max-w-md">
                                익명이 보장되는 안전한 공간에서<br />
                                더 깊은 이야기를 나누고 싶다면 커뮤니티 게시판을 이용하세요.
                            </p>
                            <button onClick={() => handleTabChange('전체')} className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all outline-none">
                                수다 떨러 가기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PC용 카테고리 탭 (Restored to original md) */}
            <div className={`sticky top-[56px] left-0 right-0 z-30 backdrop-blur-md min-h-[48px] py-1 hidden md:block ${brand.theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'}`}>
                <div className="max-w-[1200px] mx-auto flex flex-wrap justify-center px-4 h-full gap-2 py-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleTabChange(cat.name)}
                            className={`px-3 py-2 text-sm font-bold border-b-2 transition-all duration-200 flex items-center whitespace-nowrap ${activeTab === cat.name
                                ? 'border-blue-500 text-blue-500'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-2 md:pt-4 pb-20">
                <main className="max-w-[1200px] mx-auto px-0 sm:px-4 space-y-4">



                    {activeTab === '프리미엄 라운지' ? (
                        /* Lounge View */
                        <LoungeContent brand={brand} primaryStyle={primaryStyle} posts={posts} handlePostClick={handlePostClick} userType={userType} isLoggedIn={isLoggedIn} />
                    ) : (
                        /* Post List & Write Button Area */
                        <>
                            {/* [NEW] Desktop/Mobile Top Action Bar */}
                            <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
                                <h3 className="text-lg font-black text-gray-800">최신 게시글</h3>
                                {userType !== 'corporate' && (
                                    <button
                                        onClick={handleWriteClick}
                                        className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <PenLine size={18} /> 글쓰기
                                    </button>
                                )}
                            </div>

                            {/* [NEW] Community-native Partners Credit Banner */}
                            <div
                                onClick={() => window.open('https://partners-credit.vercel.app', '_blank')}
                                className="mb-6 p-6 rounded-[32px] bg-slate-900 border-2 border-blue-500/50 cursor-pointer shadow-xl hover:scale-[1.01] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute -right-4 -top-4 w-32 h-32 bg-yellow-400 opacity-5 blur-3xl group-hover:opacity-20 transition-opacity"></div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-2xl shadow-lg shadow-yellow-500/20">
                                            <Sparkles size={28} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-yellow-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                                                Exclusive Opportunity
                                            </p>
                                            <h4 className="text-white font-black text-lg md:text-xl leading-tight">
                                                언니들의 <span className="text-yellow-400">리얼 수익 창출</span> 노하우!<br />
                                                <span className="text-gray-400 text-sm font-bold">지금 파트너스 활동하고 출금까지 원스톱 💰</span>
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end gap-2">
                                        <div className="px-5 py-2.5 bg-yellow-500 text-slate-900 rounded-full font-black text-sm flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 group-hover:bg-yellow-400">
                                            참여하기 <ChevronRight size={16} strokeWidth={3} />
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold whitespace-nowrap">현재 1,248명 활동 중</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {paginatedPosts.map((post, idx) => {
                                    const isAdPos = (idx + 1) % 4 === 0;

                                    return (
                                        <React.Fragment key={post.id}>
                                            <div
                                                onClick={() => handlePostClick(post.id)}
                                                className={`p-6 sm:rounded-[32px] shadow-sm border active:scale-[0.98] transition-all cursor-pointer hover:border-blue-200 group ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[11px] font-black group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                        {post.category}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 font-bold">{post.time}</span>
                                                </div>

                                                <h3 className={`font-black mb-1 lg:text-xl leading-snug ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                    {post.isHot && <span className="text-red-600 mr-2 inline-flex items-center gap-1"><ShieldAlert size={16} className="fill-red-600 text-white" /> HOT</span>}
                                                    {post.title}
                                                </h3>

                                                <p className={`text-sm line-clamp-2 mb-5 font-black group-hover:opacity-100 transition-opacity ${brand.theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>
                                                    <span className={(userType === 'corporate' || !isLoggedIn) ? 'blur-[5px] select-none opacity-50' : ''}>
                                                        {post.content}
                                                    </span>
                                                </p>

                                                <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-inner">
                                                            <User size={16} />
                                                        </div>
                                                        <span className={`font-black ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>{post.author}</span>
                                                    </div>
                                                    <div className="flex gap-5">
                                                        <span className="flex items-center gap-1.5 text-blue-600 font-black">
                                                            <Heart size={16} className="fill-current" /> {post.likes}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-blue-600 font-black">
                                                            <MessageSquare size={16} className="fill-current" /> {post.comments}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-gray-400 font-black">
                                                            <Eye size={16} /> {post.views || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 커뮤니티 네이티브 광고 (4번째 게시글마다 삽입) */}
                                            {isAdPos && (
                                                <div className="bg-gradient-to-br from-rose-50 to-orange-50 border-y sm:border border-orange-100 sm:rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group">
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

                            {/* [NEW] Pagination UI - Always Show if posts exist */}
                            {filteredPosts.length > 0 && (
                                <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                                    <button
                                        onClick={() => {
                                            setCurrentPage(prev => Math.max(1, prev - 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${currentPage === 1 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        이전
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => {
                                                setCurrentPage(i + 1);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className={`w-10 h-10 rounded-xl font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:bg-gray-100'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${currentPage === totalPages ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}
                                    >
                                        다음
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Login Required Modal (z-200 -> z-20000) */}
            {/* Login Required Modal (z-200 -> z-20000) */}
            {
                mounted && loginModalOpen && createPortal(
                    <div className="fixed inset-0 z-[20000] flex items-center justify-center px-4">
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm md:backdrop-blur-lg" onClick={() => setLoginModalOpen(false)}></div>
                        <div className={`rounded-[32px] md:rounded-[45px] w-[90%] md:w-full max-w-sm p-8 md:p-12 relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-white/20'}`}>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 md:mb-10 text-blue-500 ring-8 ring-blue-50 shadow-inner">
                                    <Lock size={32} className="md:w-12 md:h-12" strokeWidth={2.5} />
                                </div>
                                <h3 className={`text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>그녀들만의 비밀 커뮤니티 🤫</h3>
                                <p className={`mb-8 md:mb-12 leading-relaxed font-bold text-xs md:text-sm ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    이곳은 <span className="text-blue-600 font-black underline underline-offset-4 decoration-4">인증된 여성 회원</span>들만<br />
                                    입장하실 수 있는 안전한 공간입니다.<br />
                                    <br />
                                    <span className={`px-4 py-2 rounded-2xl border text-[11px] md:text-xs ${brand.theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-200'}`}>로그인하고 실시간 핫이슈를 확인하세요! 🔥</span>
                                </p>
                                <div className="grid grid-cols-1 w-full gap-3">
                                    <button
                                        onClick={() => router.push('/?page=signup')}
                                        className="w-full py-4 md:py-5 bg-blue-600 text-white rounded-2xl md:rounded-3xl font-black text-base md:text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-200 outline-none"
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
                    </div>,
                    document.body
                )
            }

            {/* 🔒 Corporate Access Denied Modal (Portal 적용으로 헤더 위로 띄움) */}
            {
                mounted && isCorporateModalOpen && createPortal(
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 overflow-hidden h-[100dvh]">
                        {/* Backdrop: bg-black/60 with blur */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCorporateModalOpen(false);
                            }}
                        ></div>

                        <div className={`
                        rounded-[32px] md:rounded-[40px] w-[90%] md:w-full max-w-sm p-8 md:p-12
                        relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border
                        animate-in slide-in-from-bottom-4 zoom-in-95 duration-300
                        ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-white/20'}
                    `}>
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className={`p-4 rounded-full ${brand.theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                                    <Info size={32} className="text-blue-500" />
                                </div>

                                <div className="space-y-3 max-w-[240px] mx-auto">
                                    <h3 className="text-[22px] font-black text-gray-900 tracking-tight">접근 권한 제한</h3>
                                    <p className="text-gray-600 text-[15px] font-medium leading-[1.6] break-keep">
                                        사장님 회원은 구직자들의 소통 공간을 열람하실 수 없습니다. 🙏
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCorporateModalOpen(false);
                                    }}
                                    className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg active:scale-95 transition-transform cursor-pointer relative z-20"
                                >
                                    확인했습니다
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* Floating Action Button (Always visible on mobile for better accessibility) */}
            {
                userType !== 'corporate' && activeTab !== '프리미엄 라운지' && (
                    <button
                        onClick={handleWriteClick}
                        className="fixed bottom-24 right-5 md:right-10 bg-blue-600 text-white p-5 rounded-full shadow-2xl hover:bg-blue-700 active:scale-90 transition-all z-50 hover:shadow-blue-300/50"
                    >
                        <PenLine size={28} />
                    </button>
                )
            }
        </div >
    );
}

// LoungeContent 컴포넌트 정의
interface LoungeContentProps {
    brand: ReturnType<typeof useBrand>;
    primaryStyle: { color: string };
    posts: Post[];
    handlePostClick: (id: number) => void;
    userType: UserType;
    isLoggedIn: boolean;
}

function LoungeContent({ brand, primaryStyle, posts, handlePostClick, userType, isLoggedIn }: LoungeContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // URL 파라미터(?lounge=...) 기반으로 탭 상태 결정
    const activeLoungeTab = searchParams.get('lounge') || 'main';
    const [showLoungeResult, setShowLoungeResult] = useState(false);

    // 탭 변경 함수 (URL 업데이트를 통해 브라우저 히스토리 지원)
    const handleLoungeTabChange = (tab: string) => {
        const params = new URLSearchParams(window.location.search);
        if (tab === 'main') {
            params.delete('lounge');
        } else {
            params.set('lounge', tab);
        }

        // 결과창 초기화
        setShowLoungeResult(false);

        // 스크롤 최상단 이동 및 URL 업데이트
        window.scrollTo({ top: 0, behavior: 'auto' });
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // 탭 변경 시 스크롤을 최상단으로 이동 (useEffect 방식에서 탭 변경 시 바로 핸들링으로 변경)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeLoungeTab]);

    return (
        <div className="space-y-4 md:space-y-8">
            {activeLoungeTab === 'main' && (
                <div className="space-y-2 md:space-y-8">
                    {/* 상단 배너 */}
                    <div className="relative overflow-hidden sm:rounded-3xl h-[240px] md:h-[300px] flex items-center px-4 md:px-8 text-white shadow-xl">
                        {/* 로컬 이미지 배경 (원본 복구) */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/lounge_hero_premium.png"
                                alt="Premium Lounge"
                                fill
                                className="object-cover opacity-80"
                                priority
                            />
                        </div>

                        {/* 텍스트 오버레이 가독성을 위한 그라데이션 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10"></div>

                        <div className="relative z-20 space-y-2">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase">Premium Membership</span>
                            <h2 className="text-2xl md:text-3xl font-black">당신만을 위한<br /><span style={primaryStyle}>특별한 휴식 공간</span></h2>
                            <p className="text-sm text-gray-100 opacity-90 max-w-[200px] md:max-w-none">언니들의 지친 일상을 케어하는 고품격 리텐션 서비스</p>
                        </div>
                    </div>

                    {/* 통계 섹션 */}
                    <div className={`p-6 rounded-2xl border ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-stone-100'} shadow-sm text-center`}>
                        <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Lounge Statistics</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-2xl font-black mb-1" style={primaryStyle}>98%</div>
                                <div className="text-[10px] text-gray-500">사용자 만족도</div>
                            </div>
                            <div className={`border-x ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="text-2xl font-black mb-1" style={primaryStyle}>1.2k</div>
                                <div className="text-[10px] text-gray-500">오늘의 방문자</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black mb-1" style={primaryStyle}><ThumbsUp size={24} className="inline mr-1" /></div>
                                <div className="text-[10px] text-gray-500">리위 베스트</div>
                            </div>
                        </div>
                    </div>

                    {/* 서비스 카드 리스트 */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-6">
                        <LoungeServiceCard
                            title={<>식단 &<br className="md:hidden" /> BMI 관리</>}
                            desc="나의 체형분석과 맞춤형 식단 정보를 무료로 받아보세요."
                            buttonText={<>분석<br className="md:hidden" /> 시작하기</>}
                            icon={<Apple size={28} />}
                            color="bg-emerald-500"
                            shadowColor="shadow-emerald-500/50"
                            btnBg="bg-emerald-50"
                            btnText="text-emerald-600"
                            onClick={() => handleLoungeTabChange('diet')}
                            brand={brand}
                        />
                        <LoungeServiceCard
                            title="오늘의 사주 & 운세"
                            desc="재물운, 연애운, 건강운까지 코콜알바에서 확인하세요."
                            buttonText="운세 보러가기"
                            icon={<Moon size={28} />}
                            color="bg-amber-500"
                            shadowColor="shadow-amber-500/50"
                            btnBg="bg-amber-50"
                            btnText="text-amber-600"
                            onClick={() => handleLoungeTabChange('fortune')}
                            brand={brand}
                        />
                        <LoungeServiceCard
                            title={<>성향 & 컬러<br className="md:hidden" /> 테스트</>}
                            desc="나에게 맞는 메이크업과 최적의 직종을 찾아드립니다."
                            buttonText={<>테스트<br className="md:hidden" /> 시작</>}
                            icon={<Sparkles size={28} />}
                            color="bg-blue-500"
                            shadowColor="shadow-blue-500/50"
                            btnBg="bg-blue-50"
                            btnText="text-blue-600"
                            onClick={() => handleLoungeTabChange('mbti')}
                            brand={brand}
                        />
                    </div>
                </div>
            )}

            {/* 식단 관리 페이지 */}
            {activeLoungeTab === 'diet' && (
                <div>
                    <div className="hidden md:flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleLoungeTabChange('main')}>
                        <ChevronRight size={24} className={`rotate-180 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                        <span className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>프리미엄 라운지</span>
                    </div>
                    <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-stone-100'}`}>
                        {!showLoungeResult ? (
                            <>
                                <div className="text-center mb-8">
                                    <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg shadow-emerald-500/10">
                                        <Apple size={40} />
                                    </div>
                                    <p className="text-gray-500 text-sm">과학적인 BMI 분석과 맞춤 식단으로 관리하세요.</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Height (cm)</label>
                                            <div className="relative">
                                                <input type="number" placeholder="165" className={`w-full p-4 pl-12 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-stone-50 border-stone-200'}`} />
                                                <Calculator size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Weight (kg)</label>
                                            <div className="relative">
                                                <input type="number" placeholder="50" className={`w-full p-4 pl-12 rounded-2xl border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-stone-50 border-stone-200'}`} />
                                                <Heart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        style={{ backgroundColor: '#10b981' }}
                                        className="w-full text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[0.98] transition-transform text-lg"
                                        onClick={() => setShowLoungeResult(true)}
                                    >
                                        맞춤형 식단 리포트 받기
                                    </button>

                                    <div className={`p-4 rounded-xl text-xs leading-relaxed ${brand.theme === 'dark' ? 'bg-emerald-900/10 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`}>
                                        💡 **Tip**: 균형 잡힌 식단은 피부 건강과 체력 유지의 핵심입니다. 무리한 단식보다는 규칙적인 연어, 견과류 섭취를 추천드려요!
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <h3 className="text-2xl font-black mb-6">분석 결과: <span className="text-emerald-500">정상체중</span></h3>
                                <div className="space-y-4 text-left">
                                    <div className={`p-4 rounded-2xl ${brand.theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-50'}`}>
                                        <p className="font-bold text-emerald-600 mb-1">📋 맞춤 가이드</p>
                                        <p className="text-sm text-gray-600">현재 매우 건강한 상태입니다. 근육량 유지를 위해 단백질 위주의 식단을 추천합니다.</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                        <p className="font-bold text-gray-700 mb-1">🥦 오늘의 추천 식단</p>
                                        <p className="text-sm text-gray-500">아침: 귀리 요거트 / 점심: 닭가슴살 샐러드 / 저녁: 구운 생선과 야채</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowLoungeResult(false)} className="mt-8 text-sm text-gray-400 underline">다시 계산하기</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MBTI 성향 테스트 */}
            {activeLoungeTab === 'mbti' && (
                <div>
                    <div className="hidden md:flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleLoungeTabChange('main')}>
                        <ChevronRight size={24} className={`rotate-180 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                        <span className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>프리미엄 라운지</span>
                    </div>
                    <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-stone-100'}`}>
                        <div className="text-center mb-10">
                            <div className="bg-purple-100 text-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/10 scale-110">
                                <Sparkles size={40} />
                            </div>
                            <p className="text-gray-500 text-sm">나의 퍼스널 컬러와 직업적 케미를 확인해보세요.</p>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center ${brand.theme === 'dark' ? 'border-purple-900/50 bg-purple-900/5' : 'border-purple-100 bg-purple-50/30'}`}>
                                <Star className="text-purple-300 mb-4 animate-bounce" size={48} />
                                <p className="text-purple-400 font-bold">당신을 분석할 12가지 질문</p>
                                <p className="text-[10px] text-purple-300 mt-1">소요시간 약 2분</p>
                            </div>

                            <button
                                style={{ backgroundColor: '#a855f7' }}
                                className="w-full text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-[0.98] transition-transform text-lg"
                                onClick={() => alert('본 테스트는 회원가입 후 이용 가능합니다!')}
                            >
                                테스트 시작하기 (무료)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 사주/운세 */}
            {activeLoungeTab === 'fortune' && (
                <div>
                    <div className="hidden md:flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleLoungeTabChange('main')}>
                        <ChevronRight size={24} className={`rotate-180 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
                        <span className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>프리미엄 라운지</span>
                    </div>
                    <div className={`p-8 rounded-3xl shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-stone-100'}`}>
                        {!showLoungeResult ? (
                            <>
                                <div className="text-center mb-10">
                                    <div className="bg-amber-100 text-amber-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
                                        <Moon size={40} />
                                    </div>
                                    <p className="text-gray-500 text-sm">재물, 연애, 비즈니스 운세를 매일 아침 확인하세요.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Birth Date</label>
                                        <input type="date" className={`w-full p-5 rounded-2xl border text-lg ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-stone-50 border-stone-200'} outline-none focus:border-amber-500 transition-all`} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button className={`p-4 rounded-xl border-2 font-black transition-all ${brand.theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-stone-100 text-stone-400'}`}>오전 생</button>
                                        <button className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50 text-amber-600 font-black shadow-md shadow-amber-500/10">오후 생</button>
                                    </div>

                                    <button
                                        style={{ backgroundColor: '#f59e0b' }}
                                        className="w-full text-white font-black py-5 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[0.98] transition-transform text-lg"
                                        onClick={() => setShowLoungeResult(true)}
                                    >
                                        지금 운세 확인하기
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <div className="text-5xl mb-6">💰</div>
                                <h3 className="text-2xl font-black mb-4">오늘의 재물운: <span className="text-amber-500">최상(★★★★★)</span></h3>
                                <div className={`p-6 rounded-3xl text-left border ${brand.theme === 'dark' ? 'bg-amber-900/10 border-amber-900/40' : 'bg-amber-50 border-amber-100'}`}>
                                    <p className="font-bold text-amber-700 mb-2 italic">&quot;동쪽에서 귀인이 나타나 큰 재물을 가져다줄 기운입니다.&quot;</p>
                                    <p className={`text-sm leading-relaxed ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>오늘은 새로운 인연보다는 기존의 인연에서 큰 득이 있을 날입니다. 오후 3시에서 5시 사이가 가장 길한 시간대이니 참고하세요.</p>
                                </div>
                                <button onClick={() => setShowLoungeResult(false)} className="mt-8 text-sm text-gray-400 underline">다른 생일로 확인하기</button>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}

// LoungeServiceCard 컴포넌트 정의
interface LoungeServiceCardProps {
    title: React.ReactNode;
    desc: string;
    buttonText: React.ReactNode;
    icon: React.ReactNode;
    color: string;
    shadowColor: string;
    btnBg: string;
    btnText: string;
    onClick: () => void;
    brand: ReturnType<typeof useBrand>;
}

function LoungeServiceCard({ title, desc, buttonText, icon, color, shadowColor, btnBg, btnText, onClick, brand }: LoungeServiceCardProps) {
    return (
        <div
            onClick={onClick}
            className={`group p-4 md:p-8 rounded-[32px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm border flex flex-col items-start text-left gap-4 md:gap-6 ${brand.theme === 'dark' ? `bg-gray-800 border-gray-700` : `bg-white border-gray-100`}`}
        >
            <div className={`text-white ${color} ${shadowColor} w-10 h-10 md:w-16 md:h-16 rounded-2xl md:rounded-[20px] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6`}>
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5 md:w-8 md:h-8' })}
            </div>

            <div className="space-y-1.5 md:space-y-3 flex-1">
                <h4 className={`font-black text-[13px] md:text-xl leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
                <p className="text-[10px] md:text-sm text-gray-400 font-bold leading-relaxed">{desc}</p>
            </div>

            <div className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-black transition-colors ${btnBg} ${btnText}`}>
                {buttonText} <ChevronRight size={14} className="md:w-5 md:h-5 shrink-0" />
            </div>
        </div>
    )
}
