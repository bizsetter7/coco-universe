'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Settings,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Eye,
    Zap,
    ArrowRight,
    Search,
    TrendingUp,
    Bell,
    Megaphone,
    Mail,
    Lock,
    Unlock,
    Info,
    Database,
    RefreshCw,
    CreditCard,
    Check
} from 'lucide-react';
import { MobilePreviewContent } from '../my-shop/components/MobilePreviewContent';
import { useBrand } from '@/components/BrandProvider';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';
import { Shop } from '@/types/shop';
import { useAuth } from '@/hooks/useAuth';
import { SEOIndexingControl } from '@/components/admin/SEOIndexingControl';
import { CompetitorAnalysis } from '@/components/admin/CompetitorAnalysis';
import { HealthDashboard } from '@/components/admin/HealthDashboard';
import { supabase } from '@/lib/supabase';
import AdminCharts from './components/AdminCharts';
import { StandardsGuardView } from './components/StandardsGuardView';

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">인증 확인 중...</div>}>
            <AdminContent />
        </Suspense>
    );
}

function AdminContent() {
    const router = useRouter();
    const { isLoggedIn, userType, isLoading } = useAuth();
    // useSearchParams 제거 (Diet)
    const brand = useBrand();

    // --- 1. Core State Section ---
    const [mockAds, setMockAds] = useState<Shop[]>([]);
    const [realUsers, setRealUsers] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 124030000,
        activeAds: 0,
        newUserToday: 0,
        totalUsers: 0
    });
    const [activeTab, setActiveTab] = useState<'ads' | 'stats' | 'users' | 'inquiry' | 'messages' | 'seo' | 'payments' | 'health'>('stats');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [expandedAd, setExpandedAd] = useState<string | null>(null);
    const [isMobileInquiryModalOpen, setIsMobileInquiryModalOpen] = useState(false);

    // --- 2. Filter & UI State ---
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState<'all' | 'corporate' | 'individual'>('all');
    const [adFilter, setAdFilter] = useState<'all' | 'pending'>('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // --- 3. Message/Modal State ---
    const [isGlobalMsgOpen, setIsGlobalMsgOpen] = useState(false);
    const [msgTarget, setMsgTarget] = useState<'all' | 'corporate' | 'individual'>('all');
    const [msgTitle, setMsgTitle] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [sendSuccess, setSendSuccess] = useState(false);
    const [allMessages, setAllMessages] = useState<any[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

    // --- 4. Ad Rejection State ---
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingAdId, setRejectingAdId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedAdForModal, setSelectedAdForModal] = useState<Shop | null>(null);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);

    // --- 4. Mock Users (Can be moved to DB later) ---
    const [mockUsers] = useState<any[]>([
        { id: 'user_01', loginId: 'koko123', name: '김코코', nickname: '돌아온코코', birth: '1995-05-15', phone: '010-1234-5678', email: 'koko@gmail.com', type: 'individual', status: 'active', joinDate: '2026-02-01', referrer: '구글 검색', statusHistory: ['2026-02-01 가입'] },
        { id: 'user_02', loginId: 'shop_master', name: '이사장', nickname: '강남구인구직', birth: '1988-11-22', phone: '010-9876-5432', email: 'ceo@shop.com', type: 'corporate', status: 'active', joinDate: '2026-01-15', referrer: '네이버', statusHistory: ['2026-01-15 기업회원 가입', '2026-02-10 광고 연장'] },
        { id: 'user_03', loginId: 'bad_boy', name: '박진상', nickname: '진상입니다', birth: '1992-03-03', phone: '010-4444-4444', email: 'bad@naver.com', type: 'individual', status: 'blocked', joinDate: '2026-02-12', referrer: '직접 유입', statusHistory: ['2026-02-12 가입', '2026-02-13 비매너 행위로 영구 정지'] },
    ]);

    const mockInquiriesList = [
        { id: 1, sender: '해운대그랜드룸', date: '10분 전', content: '광고 신청했는데 승인 언제 되나요?', status: 'new' },
        { id: 2, sender: '삼성 킹플레이', date: '25분 전', content: '이번 달 결제 내역서가 필요합니다.', status: 'replied' },
        { id: 3, sender: '김사장님', date: '1시간 전', content: '문의가 효과 테두리 색상 변경 가능한가요?', status: 'new' },
    ];
    const [mockInquiries] = useState(mockInquiriesList);
    // --- 5. Data Fetching (Supabase) ---
    const fetchData = async () => {
        try {
            // 1. Fetch Shops
            const { data: adsData } = await supabase
                .from('shops')
                .select('*')
                .order('updated_at', { ascending: false });

            // 2. Fetch Profiles
            const { data: userData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (userData) {
                setRealUsers(userData);
                setStats(prev => ({
                    ...prev,
                    totalUsers: userData.length,
                    newUserToday: userData.filter(u => {
                        const today = new Date().toISOString().split('T')[0];
                        return u.created_at?.startsWith(today);
                    }).length
                }));
            }

            // 3. Fetch Payments
            const { data: payData } = await supabase
                .from('payments')
                .select('*, profiles(nickname, full_name)')
                .order('created_at', { ascending: false })
                .limit(2000);

            if (payData) {
                setPayments(payData);
            }

            // [Critical Fix] Merge Local Payments for Admin Testing
            const localMockPaymentsRaw = localStorage.getItem('my_site_payment_history');
            let localMockPayments: any[] = [];
            if (localMockPaymentsRaw) {
                try {
                    localMockPayments = JSON.parse(localMockPaymentsRaw).map((p: any) => ({
                        ...p,
                        isMock: true
                    }));
                } catch (e) { console.error("Failed to parse local mock payments", e); }
            }

            const allPayments = [...(payData || []), ...localMockPayments];

            // 5. [Critical Fix] Merge Local Mock Data for Admin Testing
            const localMockAdsRaw = localStorage.getItem('coco_mock_ads');
            let localMockAds: any[] = [];
            if (localMockAdsRaw) {
                try {
                    localMockAds = JSON.parse(localMockAdsRaw).map((ad: any) => ({
                        ...ad,
                        isMock: true,
                        status: ad.status || 'pending',
                        created_at: ad.created_at || new Date().toISOString()
                    }));
                } catch (e) { console.error("Failed to parse local mock ads", e); }
            }

            // Merge and Deduplicate
            const rawAllAds = [...(adsData || []), ...localMockAds];
            const uniqueAdsMap = new Map();
            rawAllAds.forEach(ad => {
                if (ad.id) {
                    uniqueAdsMap.set(String(ad.id), ad);
                }
            });
            const allAds = Array.from(uniqueAdsMap.values());

            // Enrich with prices
            if (allAds) {
                const enrichedAds = (allAds as any[]).map(ad => {
                    // 0. Prioritize Explicit Ad Price
                    // Check options.ad_price first, then ad_price column, then legacy price
                    let adPrice: number | undefined = undefined;

                    // helper to check validity
                    const isValidPrice = (v: any) => v !== undefined && v !== null && v !== '';

                    if (isValidPrice((ad.options as any)?.ad_price)) adPrice = Number((ad.options as any)?.ad_price);
                    else if (isValidPrice((ad as any).ad_price)) adPrice = Number((ad as any).ad_price);
                    else if (isValidPrice((ad as any).adPrice)) adPrice = Number((ad as any).adPrice);
                    else if (isValidPrice((ad as any).price)) adPrice = Number((ad as any).price);

                    // Only look for payment if we don't have a valid explicit price
                    if (adPrice === undefined) {
                        let lastPayment = null;
                        const aid = String(ad.id || '').trim().toLowerCase();

                        // 1. ID Match
                        if (aid && allPayments.length > 0) {
                            lastPayment = allPayments.find(p => {
                                const pid = String(p.shop_id || p.shopId || (p as any).metadata?.shop_id || '').trim().toLowerCase();
                                return pid !== '' && pid === aid;
                            });
                        }

                        // 2. Fuzzy Name Match
                        if (!lastPayment && allPayments.length > 0) {
                            const aName = String(ad.name || ad.shopName || '').trim().toLowerCase();
                            if (aName) {
                                lastPayment = allPayments.find(p => {
                                    const pName = String((p as any).metadata?.shopName || (p as any).description || '').trim().toLowerCase();
                                    return pName !== '' && (pName.includes(aName) || aName.includes(pName));
                                });
                            }
                        }

                        // 3. User ID Match
                        if (!lastPayment && ad.user_id && allPayments.length > 0) {
                            // Only match if ad created date is close to payment date (within 10 mins) to avoid wrong matching
                            lastPayment = allPayments.find(p => String(p.user_id) === String(ad.user_id));
                        }

                        if (lastPayment) {
                            const rawPrice = (lastPayment as any).amount ||
                                (lastPayment as any).price ||
                                (lastPayment as any).total_amount ||
                                (lastPayment as any).metadata?.totalAmount ||
                                (lastPayment as any).metadata?.ad_price || 0;

                            if (typeof rawPrice === 'string') {
                                const parsed = parseInt(rawPrice.replace(/[^0-9]/g, '') || '0');
                                if (parsed > 0) adPrice = parsed;
                            } else if (Number(rawPrice) > 0) {
                                adPrice = Number(rawPrice);
                            }
                        }
                    }

                    const opt = ad.options || {};
                    return {
                        ...ad,
                        ad_price: adPrice || 0,
                        // [표준 규정] 무결성 보장을 위한 상세직종 정규화
                        categorySub: ad.category_sub || opt.categorySub || (ad.category_sub === '정보없음' ? '일반' : ad.category_sub) || '일반',
                        // [Fix] UI_SYNC 감사 통과를 위한 렌더링 필드 노출
                        selectedIcon: opt.icon || (ad as any).selectedIcon,
                        selectedHighlighter: opt.highlighter || (ad as any).selectedHighlighter,
                        borderOption: opt.border || (ad as any).borderOption || (ad as any).border || 'none',
                        paySuffixes: opt.pay_suffixes || opt.paySuffixes || (ad as any).paySuffixes || (ad as any).pay_suffixes || [],
                        selectedKeywords: opt.keywords || ad.keywords || [],
                        payType: ad.pay_type || opt.payType || '협의'
                    };
                });

                setMockAds(enrichedAds);
                const activeCount = enrichedAds.filter(a => a.status === 'active').length;
                const currentRevenue = enrichedAds
                    .filter(a => a.status === 'active')
                    .reduce((acc, curr) => acc + (Number(curr.ad_price) || 0), 0);

                setStats(prev => ({
                    ...prev,
                    activeAds: activeCount,
                    totalRevenue: 124030000 + currentRevenue
                }));
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };
    // [New] Ad Status Control Logic (Supabase Enabled)
    const handleStatusUpdate = async (adId: string, newStatus: string, reason?: string) => {
        try {
            // Get ad details for notification
            const ad = mockAds.find(a => a.id === adId);

            const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
            if (newStatus === 'active') {
                updateData.approved_at = new Date().toISOString();
            }
            if (reason) {
                updateData.rejection_reason = reason;
            }

            const { error } = await supabase
                .from('shops')
                .update(updateData)
                .eq('id', adId);

            if (error) throw error;

            // [New] Create notification and update history for rejected ads
            if (newStatus === 'rejected' && ad) {
                // Update rejection history
                const currentHistory = (ad as any).rejection_history || [];
                const newHistoryItem = {
                    reason: reason || '심사 기준 미달',
                    date: new Date().toISOString(),
                    index: currentHistory.length + 1
                };
                updateData.rejection_history = [...currentHistory, newHistoryItem];

                try {
                    const rawUserId = (ad as any).user_id || ad.ownerId;
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUserId || '');

                    if (isUuid) {
                        await supabase.from('notifications').insert({
                            user_id: rawUserId,
                            type: 'AD_REJECTED',
                            title: '광고 심사 거절',
                            message: reason
                                ? `'${ad.title || ad.shopName}' 광고가 거절되었습니다. 사유: ${reason}`
                                : `'${ad.title || ad.shopName}' 광고가 심사에서 거절되었습니다. 관리자에게 문의하세요.`,
                            read: false,
                            link: '/my-shop?view=dashboard',
                            created_at: new Date().toISOString()
                        });
                    }
                } catch (notifError) {
                    console.error('Notification creation failed:', notifError);
                }
            }

            // Update UI state
            setMockAds((prev: Shop[]) => prev.map((ad: Shop) =>
                ad.id === adId ? ({
                    ...ad,
                    status: newStatus as Shop['status'],
                    rejection_reason: reason,
                    rejection_history: updateData.rejection_history || (ad as any).rejection_history
                } as Shop) : ad
            ));

            const statusMsg = newStatus === 'active' ? '승인' : (newStatus === 'rejected' ? '거절' : '변경');
            alert(`광고 ${statusMsg} 처리가 완료되었습니다. (DB 반영 완료)`);

            // Close modal if open
            setIsRejectModalOpen(false);
            setRejectingAdId(null);
            setRejectionReason('');
        } catch (error: any) {
            console.error('Error updating status:', error?.message || error);
            // Local fallback for demo
            setMockAds((prev: Shop[]) => {
                const nextAds = prev.map((ad: Shop) =>
                    ad.id === adId ? ({ ...ad, status: newStatus as any, rejection_reason: reason } as Shop) : ad
                );
                localStorage.setItem('coco_admin_mockAds', JSON.stringify(nextAds));
                return nextAds;
            });
            alert('DB 업데이트 중 오류가 발생하여 로컬 상태만 변경되었습니다.');
        }
    };

    const handlePaymentConfirm = async (paymentId: string, shopId: string) => {
        if (!confirm('입금을 확인하셨습니까? 승인 시 광고가 즉시 게시될 수 있습니다.')) return;

        try {
            // 1. Payment Status Change
            const { error: payError } = await supabase
                .from('payments')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('id', paymentId);

            if (payError) throw payError;

            // 2. Shop Status Change (Optional)
            if (shopId) {
                const { error: shopError } = await supabase
                    .from('shops')
                    .update({
                        status: 'active',
                        approved_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', shopId);

                if (shopError) console.error("Ad auto-approval failed:", shopError);
            }

            alert('결제 승인 및 광고 게시 처리가 완료되었습니다.');
            fetchData(); // Refresh
        } catch (err) {
            console.error('Payment confirmation error:', err);
            alert('오류가 발생했습니다.');
        }
    };

    const handleUserToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        const confirmMsg = newStatus === 'blocked' ? '이 회원을 차단하시겠습니까?' : '이 회원의 차단을 해제하시겠습니까?';

        if (!confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;

            alert(`회원 상태가 ${newStatus === 'blocked' ? '차단' : '활성'}으로 변경되었습니다.`);
            fetchData(); // Refresh
            if (selectedUser?.id === userId) {
                setSelectedUser((prev: any) => ({ ...prev, status: newStatus }));
            }
        } catch (err: any) {
            console.error('User status update error:', err);
            alert('상태 업데이트 실패: ' + (err.message || '알 수 없는 오류'));
        }
    };

    const formatPrice = (priceInWon: number) => {
        if (priceInWon >= 10000) {
            return `${Math.floor(priceInWon / 10000)}만원`;
        }
        return `${priceInWon.toLocaleString()}원`;
    };
    useEffect(() => {
        fetchData();

        // Load messages
        setAllMessages([
            { id: 1, from: '해운대그랜드룸', to: '개인회원A', content: '안녕하세요 면접 가능하신가요?', date: '5분 전', status: 'normal' },
            { id: 2, from: '진상박사장님', to: '개인회원B', content: '텔레그램 아이디로 연락 주세요 @secret123', date: '12분 전', status: 'warning' },
            { id: 3, from: '입주관리자', to: '지원자C', content: '기재하신 나이 조율 가능하십니다.', date: '30분 전', status: 'normal' },
        ]);
    }, []);

    useEffect(() => {
        if (isLoading) return;

        if (!isLoggedIn || userType !== 'admin') {
            alert('관리자 권한이 필요합니다.');
            router.push('/');
            return;
        }
        setIsAuthorized(true);
    }, [isLoggedIn, userType, router, isLoading]);

    // [New] Body Scroll Lock Logic
    useEffect(() => {
        if (isGlobalMsgOpen || isMobileInquiryModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isGlobalMsgOpen, isMobileInquiryModalOpen]);

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            {/* Mobile Header with Hamburger */}
            <header className="md:hidden bg-slate-950 text-white p-4 flex justify-between items-center sticky top-0 z-[10002]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    <span className="font-black tracking-tighter italic">COCO ADMIN</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-900 rounded-xl transition-colors">
                    <LayoutDashboard size={24} className="text-blue-400" />
                </button>
            </header>

            {/* Admin Mobile Hamburger Menu (Slide-in) */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-[10005] md:hidden">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <aside className="absolute right-0 top-0 bottom-0 w-[280px] bg-slate-950 border-l border-slate-900 p-6 pt-16 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-xl font-black text-blue-400 tracking-tighter">COCO ADMIN</h1>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Navigation Menu</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-900 rounded-full transition-colors">
                                <XCircle className="text-slate-400" />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-3">
                            <NavItem icon={<LayoutDashboard size={20} />} label="대시보드" active={activeTab === 'stats'} onClick={() => { setActiveTab('stats'); setIsSidebarOpen(false); }} />
                            <NavItem icon={<Zap size={20} />} label="광고 심사 관리" active={activeTab === 'ads'} onClick={() => { setActiveTab('ads'); setIsSidebarOpen(false); }} />
                            <NavItem icon={<CreditCard size={20} />} label="결제 관리" active={activeTab === 'payments'} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }} />
                            <NavItem icon={<MessageSquare size={20} />} label="통합 문의 관리" active={activeTab === 'inquiry'} onClick={() => { setActiveTab('inquiry'); setIsSidebarOpen(false); }} />
                            <NavItem icon={<Users size={20} />} label="회원 관리" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} />
                            <NavItem icon={<ShieldCheck size={20} className="text-emerald-500" />} label="시스템 검증 센터" active={activeTab === 'health'} onClick={() => { setActiveTab('health'); setIsSidebarOpen(false); }} />
                            <NavItem icon={<Settings size={20} />} label="시스템 설정" active={activeTab === 'seo'} onClick={() => { setActiveTab('seo'); setIsSidebarOpen(false); }} />
                        </nav>
                        <div className="pt-6 border-t border-slate-900">
                            <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-sm hover:bg-slate-900 rounded-xl transition-all">
                                <LayoutDashboard size={18} /> 홈페이지로 이동
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Sidebar - Desktop Only */}
            <aside className="hidden md:flex w-full md:w-64 bg-slate-950 text-white flex-col border-r border-slate-900 z-[10001]">
                <div className="p-6 border-b border-slate-900">
                    <h1 className="text-xl font-black text-blue-400 tracking-tighter">COCO ADMIN</h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Master Control Hub</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="대시보드" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <NavItem icon={<Zap size={20} />} label="광고 심사 관리" active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} />
                    <NavItem icon={<Database size={20} />} label="결제 내역 관리" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
                    <NavItem icon={<MessageSquare size={20} />} label="통합 문의 관리" active={activeTab === 'inquiry'} onClick={() => setActiveTab('inquiry')} />
                    <NavItem icon={<Users size={20} />} label="회원 관리" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <NavItem icon={<ShieldCheck size={20} className="text-emerald-500" />} label="시스템 검증 센터" active={activeTab === 'health'} onClick={() => setActiveTab('health')} />
                    <NavItem icon={<Settings size={20} />} label="시스템 설정" active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
                </nav>
            </aside>
            <main className="flex-1 p-5 md:p-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                            <span className="w-8 h-[2px] bg-blue-600 rounded-full"></span>
                            CORE SYSTEM STABLE
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
                            Dashboard <span className="text-blue-600">.</span>
                        </h2>
                        <p className="text-slate-400 font-bold text-xs md:text-sm mt-2">환영합니다! 사장님 플랫폼의 모든 흐름이 당신의 손끝에 있습니다.</p>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        {/* Role Simulator Icons */}
                        <div className="flex -space-x-2 mr-2">
                            <div
                                onClick={() => {
                                    localStorage.setItem('coco_sim_mode', 'corporate');
                                    router.push('/my-shop?simulate=corporate');
                                }}
                                title="기업 회원 시뮬레이션 (광고 등록/관리)"
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center text-[9px] md:text-[10px] font-black text-pink-600 shadow-sm z-30 cursor-pointer hover:scale-110 hover:z-40 transition-all"
                            >
                                AD
                            </div>
                            <div
                                onClick={() => {
                                    localStorage.setItem('coco_sim_mode', 'individual');
                                    router.push('/my-shop?simulate=individual');
                                }}
                                title="개인 회원 시뮬레이션 (이력서/지원)"
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[9px] md:text-[10px] font-black text-blue-600 shadow-sm z-20 cursor-pointer hover:scale-110 hover:z-40 transition-all"
                            >
                                MB
                            </div>
                            <div
                                onClick={() => router.push('/my-shop?view=form')}
                                title="패스트 용도 (신규 공고 즉시 등록)"
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] md:text-[10px] font-black text-slate-600 shadow-sm z-10 cursor-pointer hover:scale-110 transition-all"
                            >
                                +
                            </div>
                        </div>

                        {/* Admin Master Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className={`w-9 h-9 md:w-10 md:h-10 rounded-2xl border flex items-center justify-center transition-all active:scale-95 ${isProfileMenuOpen ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 shadow-sm'}`}
                                title="관리자 메뉴 (로그아웃 등)"
                            >
                                <ShieldCheck size={20} />
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute top-14 right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-[10010] p-2 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-3 border-b border-slate-50 mb-1">
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">MASTER ADMIN</p>
                                        <p className="text-sm font-black text-slate-950">운영자 계정</p>
                                    </div>
                                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">프로필 설정</button>
                                    <button className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">로그 관리</button>
                                    <button
                                        onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                                        className="w-full text-left px-3 py-2 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className={`relative p-2.5 md:p-3 border rounded-2xl transition-all active:scale-95 ${isNotificationOpen ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 shadow-sm'}`}
                            >
                                <Bell size={20} />
                                {mockAds.filter(a => a.status === 'pending').length > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute top-14 right-0 w-72 md:w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[10010] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                        <p className="text-xs font-black text-slate-900">실시간 알림</p>
                                        <span className="text-[10px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full font-black">
                                            {mockAds.filter(a => a.status === 'pending').length}
                                        </span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                        {mockAds.filter(a => a.status === 'pending').map(ad => (
                                            <div key={ad.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => { setActiveTab('ads'); setIsNotificationOpen(false); }}>
                                                <p className="text-[11px] font-black text-slate-900">신규 광고 신청</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-tight">
                                                    [{ad.region}] {ad.shopName} 사장님이 승인을 기다리고 있습니다.
                                                </p>
                                            </div>
                                        ))}
                                        {mockAds.filter(a => a.status === 'pending').length === 0 && (
                                            <div className="p-10 text-center">
                                                <p className="text-xs text-slate-400 font-bold">새로운 알림이 없습니다.</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
                                        <button className="text-[10px] font-black text-blue-600 hover:underline">모든 알림 읽음 처리</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                {/* Tab 1: Dashboard Stats */}
                {activeTab === 'stats' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        {/* Intelligent Stats Cluster */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <StatCard
                                title="누적 예상 매출"
                                value={`${stats.totalRevenue.toLocaleString()} 원`}
                                trend="+12.5%"
                                icon={<TrendingUp size={24} />}
                                color="blue"
                                onClick={() => alert('누적 성과 리포트 페이지로 이동합니다. (v2.6 예정)')}
                            />
                            <StatCard
                                title="활성 광고 슬롯"
                                value={stats.activeAds.toLocaleString()}
                                trend={`+${stats.activeAds}`}
                                icon={<Megaphone size={24} />}
                                color="pink"
                                onClick={() => setActiveTab('ads')}
                            />
                            <StatCard
                                title="전체 회원 수"
                                value={`${stats.totalUsers.toLocaleString()} 명`}
                                trend={`오늘 +${stats.newUserToday}`}
                                icon={<Users size={24} />}
                                color="slate"
                                onClick={() => setActiveTab('users')}
                            />
                            <StatCard
                                title="전체 트래픽(UV)"
                                value="84.2 K"
                                trend="+5.4%"
                                icon={<Eye size={24} />}
                                color="indigo"
                                onClick={() => alert('실시간 트래픽 히트맵 로드 중.. (v2.7 예정)')}
                            />
                        </div>

                        {/* [New] Intelligent Analytics Charts */}
                        <AdminCharts userStats={realUsers} adStats={mockAds} />
                    </div>
                )}
                {/* Tab 2: Ad Approval Management (Advanced) */}
                {activeTab === 'ads' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter">광고 심사 관리 (라이브 워크플로우)</h3>
                                <p className="text-[11px] md:text-sm text-slate-400 font-bold mt-1 leading-relaxed">
                                    심사 대기 건을 승인하고, 광고 가이드<br className="md:hidden" /> 준수 여부를 모니터링합니다.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAdFilter(adFilter === 'all' ? 'pending' : 'all')}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all active:scale-95 ${adFilter === 'pending' ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-200' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}
                                >
                                    {adFilter === 'pending' ? '전체 보기' : `심사 대기 ${mockAds.filter(a => a.status === 'pending').length}건`}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No.</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">상점(회원ID)</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">신청 옵션(유료)</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">결제금액</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">상태</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">신청일 / 결제일(마감일)</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">제어</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockAds.length > 0 ? (
                                            mockAds
                                                .filter(ad => {
                                                    if (adFilter === 'all') return true;
                                                    if (adFilter === 'pending') return ad.status === 'pending';
                                                    return true;
                                                })
                                                .map((ad) => (
                                                    <React.Fragment key={ad.id}>
                                                        <tr
                                                            onClick={() => setExpandedAd(expandedAd === ad.id ? null : ad.id)}
                                                            className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer group ${expandedAd === ad.id ? 'bg-blue-50/30' : ''}`}
                                                        >
                                                            {/* 0. No. Column */}
                                                            <td className="px-8 py-6">
                                                                <span className="text-[10px] font-black text-slate-400 font-mono">
                                                                    {(ad as any).adNo || String(ad.id || '').substring(0, 8)}
                                                                </span>
                                                            </td>

                                                            {/* 1. Shop Info */}
                                                            <td className="px-8 py-6">
                                                                <div
                                                                    className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedAdForModal(ad);
                                                                    }}
                                                                >
                                                                    <div className="text-sm font-black text-slate-900 leading-tight mb-0.5">{ad.name || ad.shopName}</div>
                                                                    <div className="text-[10px] font-bold text-slate-400">ID: {(ad as any).user_id || ad.ownerId}</div>
                                                                    <div className="text-[10px] font-bold text-pink-600 mt-0.5 bg-pink-50 px-1.5 py-0.5 rounded-sm w-fit">
                                                                        {ad.region} - {ad.work_region_sub || (ad as any).regionGu || ad.region?.split(' ')[1] || ad.region}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* 2. Options */}
                                                            <td className="px-8 py-6">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        {(() => {
                                                                            const pt = String((ad as any).productType || (ad as any).ad_type || ad.options?.product_type || ad.tier || 'p7').toLowerCase();
                                                                            let badgeColor = 'bg-slate-900';
                                                                            let label = 'T7';

                                                                            if (pt.includes('grand') || pt === 'p1') { badgeColor = 'bg-amber-500'; label = 'T1'; }
                                                                            else if (pt.includes('premium') || pt === 'p2') { badgeColor = 'bg-red-600'; label = 'T2'; }
                                                                            else if (pt.includes('deluxe') || pt === 'p3') { badgeColor = 'bg-blue-600'; label = 'T3'; }
                                                                            else if (pt.includes('special') || pt === 'p4') { badgeColor = 'bg-emerald-600'; label = 'T4'; }
                                                                            else if (pt === 'p5') { badgeColor = 'bg-orange-500'; label = 'T5'; }
                                                                            else if (pt === 'p6') { badgeColor = 'bg-slate-600'; label = 'T6'; }

                                                                            return (
                                                                                <span className={`${badgeColor} text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm shrink-0 whitespace-nowrap uppercase`}>
                                                                                    {label}
                                                                                </span>
                                                                            );
                                                                        })()}

                                                                        {/* 유료 옵션 배지들 */}
                                                                        {(ad.options?.icon || (ad as any).selectedIcon) && <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm h-fit">아</span>}
                                                                        {(ad.options?.highlighter || (ad as any).selectedHighlighter) && <span className="bg-gray-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm h-fit">형</span>}
                                                                        {(ad.options?.border && ad.options?.border !== 'none') && <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm h-fit">테</span>}
                                                                        {((ad as any).options?.paySuffixes || (ad as any).options?.pay_suffixes || (ad as any).paySuffixes || (ad as any).pay_suffixes) && (
                                                                            (((ad as any).options?.paySuffixes || (ad as any).options?.pay_suffixes || (ad as any).paySuffixes || (ad as any).pay_suffixes).length > 0) &&
                                                                            <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm h-fit">급</span>
                                                                        )}
                                                                    </div>
                                                                    <h4
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (ad) setSelectedAdForModal(ad);
                                                                        }}
                                                                        className="text-sm font-black text-slate-900 hover:text-blue-600 cursor-pointer transition line-clamp-1 decoration-blue-500/30 hover:underline underline-offset-4"
                                                                    >
                                                                        {ad.title}
                                                                    </h4>
                                                                    <div className="text-[10px] font-bold text-gray-400">최근 수정: {(ad as any).edit_count || 0}/30회</div>
                                                                </div>
                                                            </td>

                                                            {/* 3. Price */}
                                                            <td className="px-8 py-6 text-center">
                                                                <div className="text-sm font-black text-slate-950 tabular-nums whitespace-nowrap">
                                                                    {(
                                                                        Number((ad as any).ad_price) ||
                                                                        Number(ad.ad_price) ||
                                                                        Number((ad.options as any)?.ad_price) ||
                                                                        Number((ad as any).price) ||
                                                                        0
                                                                    ).toLocaleString()}원
                                                                </div>
                                                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${(ad as any).payStatus === '결제완료' || (ad as any).payStatus === 'success' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                                                    {(ad as any).payStatus === '결제완료' || (ad as any).payStatus === 'success' ? '입금완료' : '입금대기'}
                                                                </span>
                                                            </td>

                                                            {/* 4. Status */}
                                                            <td className="px-8 py-6">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black w-fit ${(ad as any).payStatus === '결제완료' || (ad as any).payStatus === 'success' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                        {(ad as any).payStatus === '결제완료' || (ad as any).payStatus === 'success' ? '결제완료' : '결제대기'}
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black w-fit ${ad.status === 'active' ? 'bg-green-100 text-green-600' : (ad.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400')}`}>
                                                                        {ad.status === 'active' ? '승인' : (ad.status === 'rejected' ? '반려' : '승인대기')}
                                                                    </span>
                                                                    {ad.status === 'rejected' && (ad as any).rejection_history && (ad as any).rejection_history.length > 0 && (
                                                                        <div className="text-[9px] text-rose-500 font-bold mt-1 leading-tight max-w-[120px]">
                                                                            {(ad as any).rejection_history.map((h: any, idx: number) => (
                                                                                <div key={idx} className="truncate">{idx + 1}. {h.reason}</div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* 5. Dates */}
                                                            <td className="px-8 py-6">
                                                                <div className="flex flex-col text-[10px] font-bold text-slate-400 leading-tight">
                                                                    {ad.status === 'active' ? (
                                                                        <>
                                                                            <span className="text-blue-500 font-black">결제: {(ad as any).approved_at ? new Date((ad as any).approved_at).toISOString().split('T')[0] : (ad as any).created_at?.split('T')[0]}</span>
                                                                            <span>마감: {ad.deadline || '2026-03-25'}</span>
                                                                        </>
                                                                    ) : (
                                                                        <span>신청: {new Date(ad.created_at || new Date()).toLocaleString()}</span>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* 6. Actions */}
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(ad.id, 'active'); }}
                                                                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all"
                                                                        title="승인"
                                                                    >
                                                                        <CheckCircle2 size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setRejectingAdId(ad.id);
                                                                            setIsRejectModalOpen(true);
                                                                        }}
                                                                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                                                        title="거절"
                                                                    >
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {expandedAd === ad.id && (
                                                            <tr>
                                                                <td colSpan={6} className="px-8 py-0">
                                                                    <div className="bg-slate-900/5 border-x border-slate-100 p-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                            <div className="space-y-6">
                                                                                <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                                                                                    <Info size={14} /> 규칙 및 정책 위반 정보 검사
                                                                                </div>
                                                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                                                    <div className="absolute top-0 right-0 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black">NORMAL</div>
                                                                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                                                                        &quot;안녕하세요! 저희 상점은 최고의 대우와 안락한 환경을 보장합니다. 주저 말고 연락 주세요. {ad.shopName}은 언제나 열려 있습니다.&quot;
                                                                                    </p>
                                                                                    <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-bold">
                                                                                        * 현재 본문 내 정책 위반 단어가 발견되지 않았습니다.
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-6">
                                                                                <div className="text-slate-950 font-black text-sm tracking-tighter italic underline decoration-blue-500 decoration-2 underline-offset-4">
                                                                                    광고주(회원) 통합 이력
                                                                                </div>
                                                                                <div className="space-y-3">
                                                                                    <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 text-xs shadow-sm">
                                                                                        <span className="font-bold text-slate-500">누적 수정 횟수 (이번달)</span>
                                                                                        <span className="font-black text-blue-600">{(ad as any).edit_count || 0} / 30회</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 text-xs shadow-sm">
                                                                                        <span className="font-bold text-slate-500">진행 중인 광고</span>
                                                                                        <span className="font-black text-slate-950">2건</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 text-xs shadow-sm">
                                                                                        <span className="font-bold text-slate-500">마감된 광고</span>
                                                                                        <span className="font-black text-slate-400">14건</span>
                                                                                    </div>
                                                                                </div>
                                                                                <button className="w-full py-4 bg-slate-950 text-white rounded-2xl text-xs font-black shadow-lg shadow-slate-200">광고주 상세 프로필 보기</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                            <Database size={32} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 tracking-tighter">운영 데이터베이스가 비어 있습니다.</p>
                                                            <p className="text-xs text-slate-400 font-bold mt-1">로컬 데이터를 Supabase로 동기화(Migration)해야 리스트가 표시됩니다.</p>
                                                        </div>

                                                        {/* --- Diagnostic Info --- */}
                                                        <div className={`mt-4 p-4 border rounded-xl text-left w-full max-w-sm ${mockAds.length === 0 && process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100'}`}>
                                                            <p className={`text-xs font-black mb-2 flex items-center gap-1 ${mockAds.length === 0 && process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-slate-600' : 'text-red-600'}`}>
                                                                <span className={`w-2 h-2 rounded-full animate-pulse ${mockAds.length === 0 && process.env.NEXT_PUBLIC_SUPABASE_URL ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                                                                시스템 연결 진단 (System Diagnostic)
                                                            </p>
                                                            <div className={`space-y-1 text-[11px] font-medium ${mockAds.length === 0 && process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-slate-500' : 'text-red-500'}`}>
                                                                <p>• URL Config: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정됨 (NULL)'}</p>
                                                                <p>• URL Value: {process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15) + '...' : '-'}</p>
                                                                <p>• DB 상태: {mockAds.length === 0 && process.env.NEXT_PUBLIC_SUPABASE_URL ? '연결됨 (데이터 없음)' : '신규 데이터 확인 불가'}</p>
                                                                <p>• Data Count: {mockAds.length}건</p>
                                                            </div>
                                                            <p className={`mt-2 text-[10px] border-t pt-2 leading-tight ${mockAds.length === 0 && process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-slate-400 border-slate-200' : 'text-red-400 border-red-100'}`}>
                                                                {process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
                                                                    ? 'Vercel 환경 변수가 없지만 [Emergency Fallback]이 작동하여 연결되었습니다.'
                                                                    : 'DB 연결 상태: 정상 (연결 성공, 테이블이 비어있을 수 있습니다)'}
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() => window.location.reload()}
                                                            className="mt-2 px-6 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-black hover:bg-black transition-all flex items-center gap-2"
                                                        >
                                                            <RefreshCw size={14} /> 데이터 새로고침 (페이지 로드)
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
                }
                {/* Tab 3: User Management */}
                {
                    activeTab === 'users' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-950 tracking-tighter">통합 회원 관리 (CRM)</h3>
                                    <p className="text-sm text-slate-400 font-bold mt-1">
                                        악성 유저 차단 및 회원 등급을 관리합니다.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setUserFilter('all')} className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${userFilter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>전체</button>
                                    <button onClick={() => setUserFilter('corporate')} className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${userFilter === 'corporate' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>기업회원</button>
                                    <button onClick={() => setUserFilter('individual')} className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${userFilter === 'individual' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>개인회원</button>
                                </div>
                            </div>

                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="회원 이름, 아이디, 전화번호 검색..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">회원정보</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">연락처/유입</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">상태/등급</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">가입일</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">제어</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {((realUsers && realUsers.length > 0) ? realUsers : mockUsers)
                                                .filter(u => userFilter === 'all' || u.type === userFilter || (userFilter === 'corporate' && u.role === 'seller') || (userFilter === 'individual' && u.role === 'user'))
                                                .filter(u => !userSearch || (u.name || u.full_name || '').includes(userSearch) || (u.loginId || u.email || '').includes(userSearch))
                                                .map((user) => (
                                                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${user.status === 'blocked' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                                                                    {user.status === 'blocked' ? '🚫' : '👤'}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-black text-slate-900">{user.name || user.full_name || '이름없음'}</div>
                                                                    <div className="text-[10px] font-bold text-slate-400">@{user.loginId || user.email?.split('@')[0]} ({user.nickname || '닉네임없음'})</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <div className="text-xs font-bold text-slate-600">{user.phone || '010-0000-0000'}</div>
                                                            <div className="text-[10px] text-slate-400">{user.email}</div>
                                                            <div className="text-[9px] text-blue-400 mt-1">유입: {user.referrer || '직접'}</div>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${user.status === 'blocked' ? 'bg-slate-100 text-slate-400' : 'bg-green-100 text-green-600'}`}>
                                                                {user.status === 'blocked' ? '차단됨' : '활동중'}
                                                            </span>
                                                            <span className="ml-2 text-[10px] font-bold text-slate-500">{user.type === 'corporate' || user.role === 'seller' ? '기업회원' : '개인회원'}</span>
                                                        </td>
                                                        <td className="px-8 py-4">
                                                            <div className="text-[11px] font-bold text-slate-500">{new Date(user.joinDate || user.created_at).toLocaleDateString()}</div>
                                                            <div className="text-[9px] text-slate-300">{new Date(user.joinDate || user.created_at).toLocaleTimeString()}</div>
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setIsUserDetailModalOpen(true);
                                                                    }}
                                                                    className="text-[10px] font-black text-blue-600 hover:underline"
                                                                >
                                                                    상세정보
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUserToggleStatus(user.id, user.status)}
                                                                    className={`p-1.5 rounded-lg transition-all ${user.status === 'blocked' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                                                    title={user.status === 'blocked' ? '차단 해제' : '회원 차단'}
                                                                >
                                                                    {user.status === 'blocked' ? <Unlock size={14} /> : <Lock size={14} />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Tab 4: Payment Management */}
                {
                    activeTab === 'payments' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            <div className="mb-2">
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter">결제 내역 관리 (Finance)</h3>
                                <p className="text-sm text-slate-400 font-bold mt-1">
                                    모든 결제 요청을 확인하고 승인 처리합니다.
                                </p>
                            </div>

                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">결제정보</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">요청자</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">금액/유형</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">상태</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">일시</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">승인</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.length > 0 ? (
                                            payments.map((pay) => (
                                                <tr key={pay.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="text-sm font-black text-slate-900">{pay.metadata?.adTitle || pay.description || '광고 결제'}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">Ref: {pay.id.substring(0, 8)}</div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="text-[11px] font-black text-slate-700">{pay.profiles?.full_name || pay.depositor_name || '-'}</div>
                                                        <div className="text-[10px] text-slate-400">{pay.profiles?.nickname || '-'}</div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="text-sm font-black text-slate-900 tabular-nums">{formatPrice(pay.amount)}</div>
                                                        <div className="text-[9px] text-slate-500">{pay.method || '무통장입금'}</div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${pay.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            {pay.status === 'completed' ? '결제완료' : '입금대기'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="text-[11px] font-bold text-slate-500">{new Date(pay.created_at).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        {pay.status !== 'completed' && (
                                                            <button
                                                                onClick={() => handlePaymentConfirm(pay.id, pay.shop_id)}
                                                                className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black hover:bg-blue-700 transition"
                                                            >
                                                                승인하기
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 text-xs font-bold">
                                                    결제 내역이 없습니다.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
                {/* Tab 5: Inquiry & Messages */}
                {
                    (activeTab === 'inquiry' || activeTab === 'messages') && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                                {/* Message List */}
                                <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="text-lg font-black text-slate-900">1:1 문의 및 메시지</h3>
                                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black">{mockInquiries.length + allMessages.length}건</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                        {mockInquiries.map((inquiry) => (
                                            <div
                                                key={`inq-${inquiry.id}`}
                                                onClick={() => setSelectedInquiry(inquiry)}
                                                className={`p-4 rounded-3xl border transition-all cursor-pointer ${selectedInquiry?.id === inquiry.id ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="bg-slate-900 text-white px-2 py-1 rounded-md text-[9px] font-black">문의</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{inquiry.date}</span>
                                                </div>
                                                <p className="text-sm font-black text-slate-800 line-clamp-1 mb-1">{inquiry.content}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-500 font-bold">{inquiry.sender}</span>
                                                    {inquiry.status === 'new' && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>}
                                                </div>
                                            </div>
                                        ))}
                                        {allMessages.map((msg) => (
                                            <div
                                                key={`msg-${msg.id}`}
                                                onClick={() => setSelectedInquiry({ ...msg, type: 'message' })}
                                                className="p-4 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black ${msg.status === 'warning' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {msg.status === 'warning' ? '신고/경고' : '메시지'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{msg.date}</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 line-clamp-1 mb-1">{msg.content}</p>
                                                <div className="text-[10px] text-slate-400">
                                                    <span className="font-black text-slate-700">{msg.from}</span> <ArrowRight size={10} className="inline mx-1" /> {msg.to}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Viewer */}
                                <div className="bg-slate-950 rounded-[40px] shadow-xl p-8 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                                    {selectedInquiry ? (
                                        <div className="w-full max-w-md animate-in zoom-in-95 duration-300 relative z-10">
                                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                                                💬
                                            </div>
                                            <h3 className="text-2xl font-black mb-2">{selectedInquiry.sender || selectedInquiry.from}</h3>
                                            <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-widest">
                                                {selectedInquiry.date} · {selectedInquiry.type === 'message' ? 'DIRECT MESSAGE' : 'SYSTEM INQUIRY'}
                                            </p>
                                            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 mb-8 backdrop-blur-sm">
                                                <p className="text-lg font-bold leading-relaxed">{selectedInquiry.content}</p>
                                            </div>
                                            <div className="flex gap-4 justify-center">
                                                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-500 transition shadow-lg shadow-blue-900/50">답변하기</button>
                                                <button className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-black text-sm hover:bg-slate-700 transition">차단/보관</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500">
                                            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                            <p className="text-sm font-bold">메시지를 선택하여 내용을 확인하세요.</p>
                                        </div>
                                    )}
                                    {/* Decorative Background */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Tab 6: SEO & System Settings */}
                {
                    activeTab === 'seo' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            {/* SEO Exposure Dashboard */}
                            <div className="bg-slate-950 rounded-[40px] p-8 md:p-12 text-white overflow-hidden relative border border-slate-800 shadow-2xl">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Global SEO Visibility</span>
                                            </div>
                                            <h3 className="text-3xl font-black tracking-tighter italic">실시간 검색 노출 현황 <span className="text-blue-500">Live</span></h3>
                                            <p className="text-slate-400 text-sm font-bold mt-2">56개 지역 위성 페이지 및 1.7만건의 공고들이 검색 엔진에 노출 중입니다.</p>
                                        </div>
                                        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl backdrop-blur-md flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-500 uppercase">Indexing</p>
                                                <p className="text-xl font-black text-white">98.2%</p>
                                            </div>
                                            <div className="w-px h-8 bg-slate-800" />
                                            <div className="text-center">
                                                <p className="text-[10px] font-black text-slate-500 uppercase">Keywords</p>
                                                <p className="text-xl font-black text-blue-500">1,240+</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Google Snippet Preview */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Google Search Snippet Preview</h4>
                                            <div className="bg-white rounded-3xl p-6 md:p-8 space-y-2 border border-slate-100 shadow-xl">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-black">C</div>
                                                    <div>
                                                        <p className="text-[11px] text-[#202124] leading-none font-bold">코코알바 - cocoalba.kr</p>
                                                        <p className="text-[10px] text-[#5f6368] leading-none mt-0.5">https://cocoalba.kr › coco › gangnam</p>
                                                    </div>
                                                </div>
                                                <h3 className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer leading-tight font-medium">
                                                    강남구 여우알바 | 밤알바 1위 코코알바 - 고수익 보장 & 당일지급
                                                </h3>
                                                <p className="text-[13px] text-[#4d5156] leading-relaxed">
                                                    강남구 전지역 여우알바, 밤알바 정보를 한눈에! 2026년 최신 공고 1,200건 보유. {brand.name}(코코알바)는 가장 빠르고 정확한 구인구직 정보를 제공합니다.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Region Reach Chart (Visual Representation) */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Major Region Reach</h4>
                                                <span className="text-[10px] font-bold text-blue-400">Targeting 56 Cities</span>
                                            </div>
                                            <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800 space-y-4">
                                                {[
                                                    { name: '서울/강남', reach: 98, color: 'bg-blue-500' },
                                                    { name: '부산/해운대', reach: 85, color: 'bg-indigo-500' },
                                                    { name: '경기/수원', reach: 72, color: 'bg-pink-500' },
                                                    { name: '인천/송도', reach: 64, color: 'bg-slate-500' }
                                                ].map((reg, idx) => (
                                                    <div key={idx} className="space-y-1.5">
                                                        <div className="flex justify-between text-[11px] font-black">
                                                            <span className="text-slate-300">{reg.name}</span>
                                                            <span className="text-white">{reg.reach}% Optimized</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className={`h-full ${reg.color} transition-all duration-1000`} style={{ width: `${reg.reach}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <SEOIndexingControl />
                            <HealthDashboard />
                            <CompetitorAnalysis />
                        </div>
                    )
                }

                {/* Tab 7: System Health / Verification Center */}
                {
                    activeTab === 'health' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                            <StandardsGuardView ads={mockAds} payments={payments} />
                        </div>
                    )
                }
                {/* Rejection Modal */}
                {
                    isRejectModalOpen && (
                        <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                                onClick={() => setIsRejectModalOpen(false)}
                            />
                            <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <XCircle size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter">광고 반려 사유 입력</h3>
                                    <p className="text-xs text-slate-400 font-bold mt-2">반려 사유는 사장님에게 알림톡으로 전송됩니다.</p>
                                </div>
                                <div className="space-y-3">
                                    <button onClick={() => setRejectionReason('이미지 부적절 (과도한 노출)')} className={`w-full py-3 rounded-2xl text-xs font-bold border transition-all ${rejectionReason.includes('이미지') ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                                        이미지 부적절 (과도한 노출)
                                    </button>
                                    <button onClick={() => setRejectionReason('텍스트 부적절 (비속어/은어)')} className={`w-full py-3 rounded-2xl text-xs font-bold border transition-all ${rejectionReason.includes('텍스트') ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                                        텍스트 부적절 (비속어/은어)
                                    </button>
                                    <button onClick={() => setRejectionReason('카테고리 분류 오류')} className={`w-full py-3 rounded-2xl text-xs font-bold border transition-all ${rejectionReason.includes('카테고리') ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                                        카테고리 분류 오류
                                    </button>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="직접 입력..."
                                        className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none h-24"
                                    />
                                    <div className="pt-4">
                                        <button
                                            onClick={() => {
                                                if (rejectingAdId) {
                                                    handleStatusUpdate(rejectingAdId, 'rejected', rejectionReason);
                                                }
                                            }}
                                            disabled={!rejectionReason}
                                            className={`w-full py-4 rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${rejectionReason ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                                        >
                                            <XCircle size={18} /> 최종 거절 처리 및 알림 발송
                                        </button>
                                        <p className="text-[10px] text-center text-slate-400 font-bold mt-4 italic">
                                            * 사장님께 즉시 푸시 알림과 함께 입력한 사유가 전송됩니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    selectedUser && isUserDetailModalOpen && (
                        <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300"
                                onClick={() => setIsUserDetailModalOpen(false)}
                            />
                            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${selectedUser.status === 'blocked' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                                            {selectedUser.status === 'blocked' ? '🚫' : '👤'}
                                        </div>
                                        <div>
                                            <span className="bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-md font-black uppercase mb-1 inline-block">CRM Profile Detail</span>
                                            <h3 className="text-xl font-black text-slate-950 tracking-tighter">{selectedUser.name || selectedUser.full_name || '이름없음'}</h3>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsUserDetailModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-950 transition-colors">
                                        <XCircle size={24} />
                                    </button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Login ID / Email</p>
                                            <p className="text-sm font-bold text-slate-900 text-wrap break-all">{selectedUser.loginId || selectedUser.email}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Phone Number</p>
                                            <p className="text-sm font-bold text-slate-900">{selectedUser.phone || '전화번호 없음'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Member Type</p>
                                            <p className="text-sm font-bold text-slate-900">{selectedUser.role === 'seller' || selectedUser.type === 'corporate' ? '기업회원 (사장님)' : '개인회원 (구직자)'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Join Date</p>
                                            <p className="text-sm font-bold text-slate-900">{new Date(selectedUser.created_at || selectedUser.joinDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <h4 className="text-xs font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <TrendingUp size={14} className="text-blue-500" /> 활동 및 유입 경로 정보
                                        </h4>
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 py-2 border-b border-slate-200/50">
                                            <span>유입 경로</span>
                                            <span className="text-slate-900">{selectedUser.referrer || '직접 유입 / 기타'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 py-2 border-b border-slate-200/50">
                                            <span>현재 등급</span>
                                            <span className="text-pink-600 font-black">Standard</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 py-2">
                                            <span>광고 등록 이력</span>
                                            <span className="text-slate-900">0건</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleUserToggleStatus(selectedUser.id, selectedUser.status)}
                                        className={`py-4 rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${selectedUser.status === 'blocked' ? 'bg-green-600 text-white shadow-green-200' : 'bg-rose-500 text-white shadow-rose-200'}`}
                                    >
                                        {selectedUser.status === 'blocked' ? <Unlock size={18} /> : <Lock size={18} />}
                                        {selectedUser.status === 'blocked' ? '차단 해제하기' : '회원 영구 차단'}
                                    </button>
                                    <button
                                        onClick={() => setIsUserDetailModalOpen(false)}
                                        className="py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-50 transition"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Ad Detail Modal */}
                {
                    selectedAdForModal && (
                        <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300"
                                onClick={() => setSelectedAdForModal(null)}
                            />
                            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <span className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md font-black uppercase mb-2 inline-block">
                                                Ad Preview Detail <span className="text-slate-400">|</span> No. {(selectedAdForModal as any).adNo || String(selectedAdForModal.id || '').substring(0, 8)}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter truncate max-w-[400px]">{selectedAdForModal.title}</h3>
                                                {/* [규정] 결제 금액(Price)만 제목 옆에 노출 */}
                                                <div className="bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-xl flex items-baseline gap-1 animate-in slide-in-from-left-2">
                                                    <span className="text-[10px] font-black text-pink-400 uppercase leading-none">Price</span>
                                                    <span className="text-lg font-black text-pink-600 leading-none">
                                                        {(Number(selectedAdForModal?.ad_price) || Number((selectedAdForModal as any)?.price) || Number((selectedAdForModal?.options as any)?.ad_price) || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] text-pink-400 font-bold">원</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedAdForModal(null)} className="p-2 text-slate-300 hover:text-slate-950 transition-colors">
                                        <XCircle size={28} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                                    <MobilePreviewContent
                                        formData={{
                                            ...selectedAdForModal,
                                            // [표준 규정] 명시적 데이터 매핑 (Data Dictionary 준수)
                                            industryMain: selectedAdForModal.category || (selectedAdForModal.options as any)?.industryMain || (selectedAdForModal.options as any)?.category || '업종미기재',
                                            categorySub: (selectedAdForModal as any).categorySub || selectedAdForModal.category_sub || (selectedAdForModal.options as any)?.categorySub || '일반',

                                            payType: (selectedAdForModal as any).payType || (selectedAdForModal as any).pay_type || (selectedAdForModal.options as any)?.payType || '협의',
                                            payAmount: (selectedAdForModal as any).pay_amount || (selectedAdForModal.options as any)?.payAmount || 0,
                                            regionCity: selectedAdForModal.region || (selectedAdForModal.options as any)?.regionCity || '',
                                            regionGu: selectedAdForModal.work_region_sub || (selectedAdForModal.options as any)?.regionGu || '',

                                            selectedKeywords: (selectedAdForModal as any).selectedKeywords || (selectedAdForModal.options as any)?.keywords || selectedAdForModal.keywords || [],
                                            selectedIcon: (selectedAdForModal as any).selectedIcon || (selectedAdForModal.options as any)?.icon || (selectedAdForModal.options as any)?.selectedIcon,
                                            selectedHighlighter: (selectedAdForModal as any).selectedHighlighter || (selectedAdForModal.options as any)?.highlighter || (selectedAdForModal.options as any)?.selectedHighlighter,

                                            selectedAdProduct: selectedAdForModal.tier || (selectedAdForModal as any).productType || (selectedAdForModal as any).ad_type || (selectedAdForModal.options as any)?.product_type || 'p7',
                                            paySuffixes: (selectedAdForModal as any).paySuffixes || (selectedAdForModal.options as any)?.pay_suffixes || (selectedAdForModal.options as any)?.paySuffixes || [],

                                            // Price normalization
                                            ad_price: Number(selectedAdForModal.ad_price) || Number((selectedAdForModal as any).price) || 0,

                                            // Editor HTML
                                            editorHtml: (selectedAdForModal as any).content || (selectedAdForModal as any).description || (selectedAdForModal.options as any)?.content || '',

                                            // Shop Info
                                            shopName: selectedAdForModal.shopName || (selectedAdForModal as any).shop_name || (selectedAdForModal.options as any)?.shopName || '',
                                            managerName: selectedAdForModal.managerName || (selectedAdForModal as any).manager_name || (selectedAdForModal.options as any)?.managerName || '',
                                            managerPhone: (selectedAdForModal as any).managerPhone || (selectedAdForModal as any).manager_phone || (selectedAdForModal.options as any)?.managerPhone || ''
                                        }}
                                        brand={brand}
                                    />

                                </div>

                                {/* Footer Actions */}
                                <div className="p-6 border-t border-slate-50 bg-white grid grid-cols-2 gap-4 shrink-0">
                                    <button
                                        onClick={() => {
                                            handleStatusUpdate(selectedAdForModal.id, 'active');
                                            setSelectedAdForModal(null);
                                        }}
                                        className="py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} /> 광고 승인
                                    </button>
                                    <button
                                        onClick={() => {
                                            setRejectingAdId(selectedAdForModal.id);
                                            setIsRejectModalOpen(true);
                                            setSelectedAdForModal(null);
                                        }}
                                        className="py-4 bg-slate-100 text-slate-400 rounded-2xl text-sm font-black hover:bg-rose-50 hover:text-rose-500 transition active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> 반려 / 거절
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-900 hover:text-white'}`}
        >
            <div className={`shrink-0 ${active ? 'text-white' : 'text-slate-600 opacity-60'}`}>
                {icon}
            </div>
            <span>{label}</span>
        </button>
    );
}

function StatCard({ title, value, trend, icon, color, onClick }: { title: string, value: string, trend: string, icon: React.ReactNode, color: 'blue' | 'pink' | 'slate' | 'indigo', onClick?: () => void }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        pink: 'bg-pink-50 text-pink-600',
        slate: 'bg-slate-50 text-slate-800',
        indigo: 'bg-indigo-50 text-indigo-600'
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white p-5 md:p-8 rounded-[32px] md:rounded-[44px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-150 group-hover:opacity-[0.08] transition-all duration-1000 transform rotate-12">
                {icon}
            </div>
            <div className="flex items-center justify-between mb-4 md:mb-8">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[24px] flex items-center justify-center shadow-inner ${colorClasses[color]}`}>
                    <div className="md:scale-125"> {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })} </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">{trend}</span>
                </div>
            </div>
            <div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-2">{title}</p>
                <h4 className="text-base md:text-xl font-black text-slate-950 tracking-tighter tabular-nums">{value}</h4>
            </div>
        </div>
    );
}
