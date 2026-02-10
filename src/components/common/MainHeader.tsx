'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { Button } from '@/components/ui/button';
import { Pencil, ChevronLeft, House, MessageCircle, Menu, LogOut, User } from 'lucide-react';

import { PaymentPopup } from '../home/PaymentPopup';
import MessageModal from '../message/MessageModal';
import { CATEGORIES } from '@/constants/community';
import {
    FileText, Star, CreditCard, AlertTriangle, Briefcase, Settings, List
} from 'lucide-react';
import { NoteService } from '@/lib/noteService';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAuth } from '@/hooks/useAuth';

interface MainHeaderProps {
    showBackButton?: boolean;
    title?: string;
    showHomeButton?: boolean;
}



function MainHeaderContent({ showBackButton, title: propTitle, showHomeButton = false }: MainHeaderProps) {
    const brand = useBrand();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoggedIn, user, logout } = useAuth();
    const page = searchParams.get('page');

    // Derive userRole for compatibility with existing logic
    const userRole = user.type === 'shop' ? 'business' : (user.type === 'personal' ? 'personal' : (user.type === 'admin' ? 'admin' : 'guest'));

    // [Auth] Role State
    const [isMounted, setIsMounted] = React.useState(false);
    const [showMessageModal, setShowMessageModal] = React.useState(false);
    const [initialReceiver, setInitialReceiver] = React.useState('');
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    // Body Scroll Lock for Modals & Mobile Menu
    useBodyScrollLock(showMessageModal || showMobileMenu || showPaymentPopup);

    React.useEffect(() => {
        setIsMounted(true);

        // Custom Event Listener for Opening Message Modal from anywhere
        const handleOpenNote = (e: any) => {
            const receiver = e.detail?.receiver;
            if (receiver) setInitialReceiver(String(receiver));
            setShowMessageModal(true);
        };

        const updateUnreadCount = () => {
            const unread = NoteService.getUnread('user');
            setUnreadCount(unread.length);
        };

        window.addEventListener('open-note-modal', handleOpenNote);
        window.addEventListener('notes-updated', updateUnreadCount);
        updateUnreadCount(); // Initial fetch

        return () => {
            window.removeEventListener('open-note-modal', handleOpenNote);
            window.removeEventListener('notes-updated', updateUnreadCount);
        };
    }, [pathname]);

    const handleAdApply = () => {
        const isLoggedIn = !!localStorage.getItem('user_session');

        if (isLoggedIn) {
            setShowPaymentPopup(true);
        } else {
            if (confirm('광고를 신청하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?')) {
                router.push('/?page=login');
            }
        }
    };

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            logout();
            window.location.href = '/';
        }
    };

    const isHome = pathname === '/' && !searchParams.get('page');
    const isSubPage = !!searchParams.get('page') && searchParams.get('page') !== 'login';
    const isRegistration = pathname === '/my-shop' && searchParams.get('view') === 'form';
    // Default to showing back button on non-home pages unless explicitly disabled
    const shouldShowBackButton = showBackButton !== undefined ? showBackButton : (!isHome || isSubPage);

    // [Header Mapping] Dynamic Title Logic
    const getHeaderContent = () => {
        // 1. If explicit title prop provided (Priority)
        if (propTitle) {
            return (
                <span className={`text-lg md:text-xl font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {propTitle}
                </span>
            );
        }

        // 2. Home Page Logo (Pink Brand)
        if (isHome) {
            return (
                <div className="flex items-center gap-1.5 mt-1">
                    <House size={22} className="text-pink-500" />
                    <span className="text-xl md:text-2xl font-black tracking-tighter text-pink-500">
                        COCOALBA
                    </span>
                </div>
            );
        }

        // 3. My Shop Title
        if (pathname?.startsWith('/my-shop')) {
            const isRegForm = searchParams.get('view') === 'form';
            return (
                <span className={`text-lg md:text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {isRegForm ? '공고등록페이지' : '마이페이지'}
                </span>
            );
        }

        // 3. Route-based Mapping
        // Community (Her Talk)
        if (pathname?.startsWith('/community')) {
            return (
                <div className="flex items-center gap-1.5">
                    <MessageCircle size={24} className="text-pink-500 fill-pink-500" />
                    <span className="text-lg md:text-xl font-black text-pink-500">그녀들의수다(커뮤니티)</span>
                </div>
            );
        }

        // Customer Center
        if (pathname?.startsWith('/customer-center') || page === 'support' || page === 'faq' || page === 'inquiry') {
            return (
                <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-pink-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-[10px] font-black leading-none">CS</span>
                    </div>
                    <span className={`text-lg md:text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        고객지원센터
                    </span>
                </div>
            );
        }

        // Other Sections
        if (pathname?.startsWith('/region') || pathname?.startsWith('/location')) return <span className="text-lg md:text-xl font-black">지역별 채용</span>;
        if (pathname?.startsWith('/jobs') || pathname?.startsWith('/industry')) return <span className="text-lg md:text-xl font-black">업종별 채용</span>;
        if (pathname?.startsWith('/talent')) return <span className="text-lg md:text-xl font-black">같이일할 단짝</span>;
        if (pathname?.startsWith('/theme')) return <span className="text-lg md:text-xl font-black">테마별 채용</span>;
        if (pathname?.startsWith('/premium')) return <span className="text-lg md:text-xl font-black">프리미엄 라운지</span>;
        if (pathname?.startsWith('/night-talk')) return <span className="text-lg md:text-xl font-black">밤문화 톡</span>;
        if (pathname?.startsWith('/legal')) return <span className="text-lg md:text-xl font-black text-pink-600">무료법률상담</span>;
        if (pathname?.startsWith('/login')) return <span className="text-lg md:text-xl font-black">로그인</span>;

        // Default Fallback
        return (
            <span className={`text-xl md:text-2xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {brand.displayName?.split(' ')[0] || 'COCO'}
                <span className="ml-0.5" style={{ color: brand.primaryColor || '#fbbf24' }}>
                    {brand.displayName?.split(' ').slice(1).join(' ') || '코코알바'}
                </span>
            </span>
        );
    };

    return (
        <React.Fragment>
            <header
                className={`sticky top-0 z-[10000] w-full h-[56px] border-b ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
            >
                <div className="w-full max-w-[1432px] h-full flex items-center justify-between mx-auto px-4 xl:px-[176px]">
                    <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                        {shouldShowBackButton && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (isRegistration) {
                                        router.push('/my-shop');
                                    } else {
                                        router.push('/');
                                    }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full animate-in fade-in duration-200"
                            >
                                <ChevronLeft size={24} />
                            </div>
                        )}

                        <div
                            onClick={() => {
                                if (isHome) {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    // 홈이 아닌 경우 현재 페이지 새로고침 (사장님 요청 사항)
                                    window.location.reload();
                                }
                            }}
                        >
                            {getHeaderContent()}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden md:flex items-center gap-3 min-w-[120px] justify-end">
                            {isMounted && userRole && (
                                <>
                                    {userRole === 'guest' && (
                                        <span onClick={() => router.push('/?page=login')} className="cursor-pointer text-xs font-bold text-gray-500 hover:text-pink-500 transition-colors flex items-center gap-1">
                                            <User size={14} /> 로그인 / 회원가입
                                        </span>
                                    )}

                                    {userRole !== 'guest' && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setShowMessageModal(true)}
                                                className="p-1.5 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-all relative"
                                                title="1:1 문의"
                                            >
                                                <MessageCircle size={20} />
                                                {unreadCount > 0 && (
                                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                                                )}
                                            </button>

                                            {userRole === 'admin' && (
                                                <div onClick={() => router.push('/admin')} className="flex items-center gap-1.5 cursor-pointer group p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                                    <div className="w-6 h-6 rounded bg-gray-900 text-white flex items-center justify-center border border-gray-700 group-hover:bg-black transition-colors">
                                                        <span className="text-[10px] font-black">A</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-900 dark:text-gray-400 group-hover:text-black transition-colors">관리자</span>
                                                </div>
                                            )}

                                            {userRole === 'business' && (
                                                <div onClick={() => router.push('/my-shop')} className="flex items-center gap-1.5 cursor-pointer group p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition-colors">
                                                        <span className="text-[10px] font-black">B</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors">기업회원</span>
                                                </div>
                                            )}

                                            {userRole === 'personal' && (
                                                <div onClick={() => router.push('/my-shop?view=member-info')} className="flex items-center gap-1.5 cursor-pointer group p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                                                    <div className="w-6 h-6 rounded bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 group-hover:bg-pink-100 transition-colors">
                                                        <span className="text-[10px] font-black">P</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 group-hover:text-pink-600 transition-colors">개인회원</span>
                                                </div>
                                            )}

                                            <div className="w-px h-3 bg-gray-300"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                                            >
                                                로그아웃
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="md:hidden flex items-center gap-3">
                            {isMounted && userRole && userRole !== 'guest' && (
                                <button
                                    onClick={() => setShowMessageModal(true)}
                                    className="p-1.5 text-gray-500 relative"
                                >
                                    <MessageCircle size={22} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                                    )}
                                </button>
                            )}
                            {(pathname?.startsWith('/customer-center') || pathname?.startsWith('/my-shop') || pathname?.startsWith('/community') || !!page) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMobileMenu(true)}
                                    className={brand.theme === 'dark' ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}
                                >
                                    <Menu size={24} />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header >

            {showPaymentPopup && (
                <PaymentPopup
                    isOpen={showPaymentPopup}
                    onClose={() => setShowPaymentPopup(false)}
                    initialTier="grand"
                />
            )}
            <MessageModal
                isOpen={showMessageModal}
                onClose={() => { setShowMessageModal(false); setInitialReceiver(''); }}
                userRole={userRole || 'guest'}
                initialReceiver={initialReceiver}
            />

            {/* Mobile Menu Drawer */}
            {
                showMobileMenu && (
                    <div className="fixed inset-0 z-[50000] md:hidden">
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowMobileMenu(false)}
                        />

                        <div className="fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col gap-6 overflow-y-auto">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg dark:text-white">
                                    {pathname?.startsWith('/community') ? '커뮤니티 메뉴' :
                                        (pathname?.startsWith('/customer-center') || page === 'support' || page === 'faq' || page === 'inquiry') ? '고객센터 메뉴' :
                                            pathname?.startsWith('/my-shop') ? '마이메뉴' : '메뉴'}
                                </span>
                                <button onClick={() => setShowMobileMenu(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                                    <ChevronLeft size={24} className="rotate-180" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {pathname?.startsWith('/community') && (
                                    <div className="space-y-1">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    const params = new URLSearchParams();
                                                    if (cat !== '전체') {
                                                        params.set('category', cat);
                                                    }
                                                    router.push(`/community?${params.toString()}`);
                                                    setShowMobileMenu(false);
                                                }}
                                                className={`w-full text-left py-3 px-4 rounded-xl font-bold transition-colors ${searchParams.get('category') === cat || (!searchParams.get('category') && cat === '전체') ? 'bg-pink-50 text-pink-600 dark:bg-gray-800 dark:text-pink-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                                        <button onClick={() => { router.push('/'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 font-bold text-gray-500">홈으로</button>
                                    </div>
                                )}

                                {(pathname?.startsWith('/customer-center') || page === 'support' || page === 'faq' || page === 'inquiry') && (
                                    <div className="space-y-1">
                                        {[
                                            { label: '공지사항', id: 'notice' },
                                            { label: '광고안내', id: 'ad' },
                                            { label: '이용방법', id: 'guide' },
                                            { label: '자주묻는질문', id: 'faq' },
                                            { label: '1:1문의', id: 'inquiry' },
                                            { label: '약관 및 정책', id: 'policy' }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    const tabUrl = page ? `/?page=${item.id === 'notice' ? 'support' : item.id}` : `/customer-center?tab=${item.id}`;
                                                    router.push(tabUrl);
                                                    setShowMobileMenu(false);
                                                }}
                                                className={`w-full text-left py-3 px-4 rounded-xl font-bold transition-colors ${(searchParams.get('tab') === item.id || (page === 'support' && item.id === 'notice') || page === item.id) ? 'bg-pink-50 text-pink-600 dark:bg-gray-800 dark:text-pink-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                                        <button onClick={() => { router.push('/'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 font-bold text-gray-500">홈으로</button>
                                    </div>
                                )}

                                {pathname?.startsWith('/my-shop') && (
                                    <div className="space-y-1">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-4">
                                            <div className="flex items-center gap-1.5 sm:gap-4 ml-auto">
                                                {isMounted && (
                                                    <>
                                                        {!isLoggedIn ? (
                                                            <>
                                                                <button
                                                                    onClick={() => router.push('/?page=login')}
                                                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-black rounded-lg transition-all active:scale-95 border ${brand.theme === 'dark'
                                                                        ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                                                                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    로그인
                                                                </button>
                                                                <button
                                                                    onClick={() => router.push('/?page=signup')}
                                                                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm text-white font-black rounded-lg transition-all active:scale-95 shadow-lg shadow-purple-500/20 hover:brightness-110"
                                                                    style={{ backgroundColor: brand.primaryColor }}
                                                                >
                                                                    회원가입
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    onClick={() => router.push('/my-shop')}
                                                                    className={`flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-pointer transition-all active:scale-95 border ${brand.theme === 'dark'
                                                                        ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                                                                        : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    <User size={14} className="text-purple-500" />
                                                                    <span className="text-[11px] sm:text-sm font-black truncate max-w-[60px] sm:max-w-none">
                                                                        {user?.name || '내 정보'}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={handleLogout}
                                                                    className={`p-1.5 sm:p-2 rounded-lg transition-all active:scale-95 border ${brand.theme === 'dark'
                                                                        ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-red-400'
                                                                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-500'
                                                                        }`}
                                                                    title="로그아웃"
                                                                >
                                                                    <LogOut size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {userRole === 'personal' && (
                                            <>
                                                {[
                                                    { label: '이력서 리스트', id: 'resume-list' },
                                                    { label: '채용정보 스크랩', id: 'scrap-jobs' },
                                                    { label: '유료결제내역', id: 'payment-history' },
                                                    { label: '열람불가 업소설정', id: 'excluded-shops' },
                                                    { label: '맞춤구인정보', id: 'custom-jobs' },
                                                    { label: '내가 작성한 게시글', id: 'my-posts' },
                                                    { label: '회원 차단 설정', id: 'block-settings' },
                                                    { label: '즐겨찾기한 게시글', id: 'post-bookmarks' },
                                                ].map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            router.push(`/my-shop?view=${item.id}`);
                                                            setShowMobileMenu(false);
                                                        }}
                                                        className={`w-full text-left py-3 px-4 rounded-xl font-bold transition-colors ${searchParams.get('view') === item.id ? 'bg-pink-50 text-pink-600 dark:bg-gray-800 dark:text-pink-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </>
                                        )}

                                        {userRole === 'business' && (
                                            <>
                                                <button onClick={() => { router.push('/my-shop?view=job-list'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50">공고 관리</button>
                                                <button onClick={() => { router.push('/my-shop?view=applicants'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50">지원자 관리</button>
                                                <button onClick={() => { router.push('/my-shop?view=payment-history'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50">결제 내역</button>
                                                <button onClick={() => { router.push('/my-shop?view=member-info'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50">회원정보 수정</button>
                                            </>
                                        )}

                                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                                        <button onClick={() => { router.push('/'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 font-bold text-gray-500">홈으로</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </React.Fragment>
    );
}

export default function MainHeader(props: MainHeaderProps) {
    return (
        <React.Suspense fallback={<div className="h-[56px] w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800" />}>
            <MainHeaderContent {...props} />
        </React.Suspense>
    );
}
