'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { Button } from '@/components/ui/button';
import { ChevronLeft, House, MessageCircle, Menu, LogOut, User, ShieldCheck, ArrowRight } from 'lucide-react';

import { PaymentPopup } from '../home/PaymentPopup';
import MessageModal from '../message/MessageModal';
import { CATEGORIES } from '@/constants/community';
import { NoteService } from '@/lib/noteService';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAuth } from '@/hooks/useAuth';

interface MainHeaderProps {
    showBackButton?: boolean;
    title?: string;
    showHomeButton?: boolean;
}

function MainHeaderContent({ showBackButton, title: propTitle }: MainHeaderProps) {
    const brand = useBrand();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoggedIn, user, userType, logout, isLoading, isSimulated } = useAuth();
    const page = searchParams.get('page');

    const userRole = userType;

    const [isMounted, setIsMounted] = React.useState(false);
    const [showMessageModal, setShowMessageModal] = React.useState(false);
    const [initialReceiver, setInitialReceiver] = React.useState('');
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    useBodyScrollLock(showMessageModal || showMobileMenu || showPaymentPopup);

    React.useEffect(() => {
        setIsMounted(true);

        const handleOpenNote = (e: any) => {
            const receiver = e.detail?.receiver;
            if (receiver) setInitialReceiver(String(receiver));
            setShowMessageModal(true);
        };

        const updateUnreadCount = () => {
            const unread = NoteService.getUnread();
            setUnreadCount(unread.length);
        };

        window.addEventListener('open-note-modal', handleOpenNote);
        window.addEventListener('notes-updated', updateUnreadCount);
        updateUnreadCount();

        return () => {
            window.removeEventListener('open-note-modal', handleOpenNote);
            window.removeEventListener('notes-updated', updateUnreadCount);
        };
    }, [pathname]);

    const handleLogout = async () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            await logout();
        }
    };

    const isHome = pathname === '/' && !searchParams.get('page');
    const isRegistration = pathname === '/my-shop' && searchParams.get('view') === 'form';
    const shouldShowBackButton = showBackButton !== undefined ? showBackButton : !isHome;

    const getHeaderContent = () => {
        if (propTitle) {
            return (
                <span className={`text-lg md:text-xl font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {propTitle}
                </span>
            );
        }

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

        if (pathname?.startsWith('/my-shop')) {
            const isRegForm = searchParams.get('view') === 'form';
            return (
                <span className={`text-lg md:text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {isRegForm ? '공고등록페이지' : '마이페이지'}
                </span>
            );
        }

        if (pathname?.startsWith('/community')) {
            return (
                <div className="flex items-center gap-1.5">
                    <MessageCircle size={24} className="text-pink-500 fill-pink-500" />
                    <span className="text-lg md:text-xl font-black text-pink-500">그녀들의수다</span>
                </div>
            );
        }

        if (pathname?.startsWith('/admin')) {
            return (
                <div className="flex items-center gap-2">
                    <ShieldCheck size={22} className="text-blue-600 animate-pulse" />
                    <span className="text-lg md:text-xl font-black text-blue-600 tracking-tighter">시스템 관리 센터</span>
                </div>
            );
        }

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

        return (
            <span className={`text-xl md:text-2xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {brand.displayName?.split(' ')[0] || 'COCO'}
                <span className="ml-0.5" style={{ color: brand.primaryColor || '#fbbf24' }}>
                    {brand.displayName?.split(' ').slice(1).join(' ') || 'ALBA'}
                </span>
            </span>
        );
    };

    return (
        <React.Fragment>
            <header className={`sticky top-0 z-[10000] w-full h-[56px] border-b ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="w-full max-w-[1432px] h-full flex items-center justify-between mx-auto px-4 xl:px-[192px]">
                    <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                        {shouldShowBackButton && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    isRegistration ? router.push('/my-shop') : router.push('/');
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                            >
                                <ChevronLeft size={24} />
                            </div>
                        )}
                        <div onClick={() => isHome ? window.scrollTo({ top: 0, behavior: 'smooth' }) : window.location.reload()}>
                            {getHeaderContent()}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden md:flex items-center gap-3 min-w-[120px] justify-end">
                            {isMounted && !isLoading ? (
                                <>
                                    {!isLoggedIn ? (
                                        <span onClick={() => router.push('/?page=login')} className="cursor-pointer text-xs font-bold text-gray-500 hover:text-pink-500 flex items-center gap-1">
                                            <User size={14} /> 로그인 / 회원가입
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setShowMessageModal(true)} className="p-1.5 text-gray-500 hover:text-pink-500 relative">
                                                <MessageCircle size={20} />
                                                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />}
                                            </button>

                                            {(userRole === 'admin' || isSimulated) && (
                                                <div
                                                    onClick={() => {
                                                        localStorage.removeItem('coco_sim_mode');
                                                        window.location.href = '/admin';
                                                    }}
                                                    className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all group"
                                                >
                                                    <div className="w-6 h-6 rounded-lg bg-slate-950 text-blue-400 flex items-center justify-center border border-slate-800 group-hover:scale-105 transition-transform">
                                                        <ShieldCheck size={14} className="animate-pulse" />
                                                    </div>
                                                    <div className="flex flex-col -space-y-0.5">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Master</span>
                                                        <span className="text-xs font-black text-slate-900 group-hover:text-white">
                                                            {isSimulated ? '어드민 복귀' : '시스템 관리자'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {userRole === 'corporate' && (
                                                <div onClick={() => router.push('/my-shop')} className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
                                                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                                                        <span className="text-[10px] font-black">B</span>
                                                    </div>
                                                    <div className="flex flex-col -space-y-0.5">
                                                        <span className="text-[10px] font-bold text-gray-400">사장님</span>
                                                        <span className="text-xs font-black text-gray-900">기업회원</span>
                                                    </div>
                                                </div>
                                            )}

                                            {userRole === 'individual' && (
                                                <div onClick={() => router.push('/my-shop?view=member-info')} className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-xl hover:bg-pink-50 border border-transparent hover:border-pink-100 transition-all group">
                                                    <div className="w-6 h-6 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 group-hover:scale-105 transition-transform">
                                                        <span className="text-[10px] font-black">P</span>
                                                    </div>
                                                    <span className="text-xs font-black text-gray-900">개인회원</span>
                                                </div>
                                            )}

                                            <div className="w-px h-3 bg-gray-300" />
                                            <button onClick={handleLogout} className="text-xs font-bold text-gray-500 hover:text-red-600">로그아웃</button>
                                        </div>
                                    )}
                                </>
                            ) : isMounted && (
                                <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>

                        <div className="md:hidden flex items-center gap-3">
                            {isMounted && isLoggedIn && !isLoading && (
                                <button onClick={() => setShowMessageModal(true)} className="p-1.5 text-gray-500 relative">
                                    <MessageCircle size={22} />
                                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />}
                                </button>
                            )}
                            {(pathname?.startsWith('/customer-center') || pathname?.startsWith('/my-shop') || pathname?.startsWith('/community') || !!page || isSimulated) && !pathname?.startsWith('/admin') && (
                                <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(true)} className={brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                    <Menu size={24} />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {showPaymentPopup && (
                <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} initialTier="grand" />
            )}
            <MessageModal isOpen={showMessageModal} onClose={() => { setShowMessageModal(false); setInitialReceiver(''); }} initialReceiver={initialReceiver} />

            {showMobileMenu && (
                <div className="fixed inset-0 z-[20000] md:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
                    <div className="fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg dark:text-white">
                                {pathname?.startsWith('/community') ? '커뮤니티 메뉴' :
                                    (pathname?.startsWith('/customer-center') || page === 'support' || page === 'faq' || page === 'inquiry') ? '고객센터 메뉴' :
                                        pathname?.startsWith('/my-shop') ? '마이메뉴' : '메뉴'}
                            </span>
                            <button onClick={() => setShowMobileMenu(false)} className="p-1 text-gray-500"><ChevronLeft size={24} className="rotate-180" /></button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {pathname?.startsWith('/community') && (
                                <div className="space-y-1">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                const params = new URLSearchParams();
                                                if (cat.name !== '전체') params.set('category', cat.name);
                                                router.push(`/community?${params.toString()}`);
                                                setShowMobileMenu(false);
                                            }}
                                            className={`w-full text-left py-3 px-4 rounded-xl font-bold ${searchParams.get('category') === cat.name || (!searchParams.get('category') && cat.name === '전체') ? 'bg-pink-50 text-pink-600' : 'text-gray-600'}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                    <div className="h-px bg-gray-100 my-2" />
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
                                            className={`w-full text-left py-3 px-4 rounded-xl font-bold ${(searchParams.get('tab') === item.id || (page === 'support' && item.id === 'notice') || page === item.id) ? 'bg-pink-50 text-pink-600' : 'text-gray-600'}`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                    <div className="h-px bg-gray-100 my-2" />
                                    <button onClick={() => { router.push('/'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 font-bold text-gray-500">홈으로</button>
                                </div>
                            )}

                            {pathname?.startsWith('/my-shop') && (
                                <div className="space-y-1">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-4">
                                        <div className="flex items-center gap-1.5 sm:gap-4 justify-center">
                                            {isMounted && !isLoading ? (
                                                <>
                                                    {!isLoggedIn ? (
                                                        <div className="flex gap-2 w-full">
                                                            <button onClick={() => router.push('/?page=login')} className="flex-1 py-2 text-xs font-black rounded-lg border bg-white text-gray-700">로그인</button>
                                                            <button onClick={() => router.push('/?page=signup')} className="flex-1 py-2 text-xs font-black rounded-lg text-white" style={{ backgroundColor: brand.primaryColor }}>회원가입</button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between w-full">
                                                            <div onClick={() => { router.push(userRole === 'admin' ? '/admin' : '/my-shop'); setShowMobileMenu(false); }} className="flex items-center gap-2 cursor-pointer">
                                                                {userRole === 'admin' ? <ShieldCheck size={14} className="text-blue-400" /> : <User size={14} className="text-purple-500" />}
                                                                <span className="text-sm font-black">{userRole === 'admin' ? '관리자' : (user?.name || '내 정보')}</span>
                                                            </div>
                                                            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500"><LogOut size={16} /></button>
                                                        </div>
                                                    )}
                                                </>
                                            ) : isMounted && (
                                                <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </div>
                                    </div>

                                    {userRole === 'individual' && (
                                        <div className="space-y-1">
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
                                                    onClick={() => { router.push(`/my-shop?view=${item.id}`); setShowMobileMenu(false); }}
                                                    className={`w-full text-left py-3 px-4 rounded-xl font-bold ${searchParams.get('view') === item.id ? 'bg-pink-50 text-pink-600' : 'text-gray-600'}`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {userRole === 'corporate' && (
                                        <div className="space-y-1">
                                            <button onClick={() => { router.push('/my-shop?view=applicants'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-gray-600 flex items-center justify-between group">
                                                <span>지원자 관리</span>
                                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                            <button onClick={() => { router.push('/my-shop?view=payments'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-gray-600">결제 내역</button>
                                            <button onClick={() => { router.push('/my-shop?view=member-info'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-gray-600">회원정보 수정</button>
                                        </div>
                                    )}

                                    {userRole === 'admin' && (
                                        <div className="space-y-1">
                                            <button onClick={() => { router.push('/admin'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-black text-blue-600 bg-blue-50/50 flex items-center gap-2">
                                                <ShieldCheck size={16} /> 어드민 센터 이동
                                            </button>
                                            <button onClick={() => { router.push('/admin?tab=ads'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-slate-600">광고 심사 관리</button>
                                            <button onClick={() => { router.push('/admin?tab=users'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-slate-600">전체 회원 관리</button>
                                        </div>
                                    )}

                                    <div className="h-px bg-gray-100 my-2" />
                                    <button onClick={() => { router.push('/'); setShowMobileMenu(false); }} className="w-full text-left py-3 px-4 font-bold text-gray-500">홈으로</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
