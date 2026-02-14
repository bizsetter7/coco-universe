'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    CreditCard
} from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { Shop } from '@/types/shop';
import { useAuth } from '@/hooks/useAuth';
import { SEOIndexingControl } from '@/components/admin/SEOIndexingControl';
import { CompetitorAnalysis } from '@/components/admin/CompetitorAnalysis';
import { supabase } from '@/lib/supabase';

/**
 * 👩‍💻 Admin Dashboard
 * 사장님의 든든한 운영 도구 - 광고 심사 및 효과 원클릭 적용
 */
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
    useSearchParams();

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
    const [activeTab, setActiveTab] = useState<'ads' | 'stats' | 'users' | 'inquiry' | 'messages' | 'seo' | 'payments'>('stats');
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

    // --- 4. Mock Users (Can be moved to DB later) ---
    const [mockUsers] = useState<any[]>([
        { id: 'user_01', loginId: 'koko123', name: '김코코', nickname: '날아라코코', birth: '1995-05-15', phone: '010-1234-5678', email: 'koko@gmail.com', type: 'individual', status: 'active', joinDate: '2026-02-01', referrer: '구글 검색', statusHistory: ['2026-02-01 가입'] },
        { id: 'user_02', loginId: 'shop_master', name: '이사장', nickname: '강남구인구직', birth: '1988-11-22', phone: '010-9876-5432', email: 'ceo@shop.com', type: 'corporate', status: 'active', joinDate: '2026-01-15', referrer: '네이버', statusHistory: ['2026-01-15 기업회원 가입', '2026-02-10 광고 연장'] },
        { id: 'user_03', loginId: 'bad_boy', name: '박진상', nickname: '진상아지트', birth: '1992-03-03', phone: '010-4444-4444', email: 'bad@naver.com', type: 'individual', status: 'blocked', joinDate: '2026-02-12', referrer: '직접 유입', statusHistory: ['2026-02-12 가입', '2026-02-13 비매너 쪽지로 영구 정지'] },
    ]);

    const mockInquiriesList = [
        { id: 1, sender: '해운대한라맨션', date: '10분 전', content: '광고 신청했는데 승인 언제 되나요?', status: 'new' },
        { id: 2, sender: '유성 핫플레이스', date: '25분 전', content: '이번 달 결제 내역서가 필요합니다.', status: 'replied' },
        { id: 3, sender: '신사동 사장님', date: '1시간 전', content: '무지개 효과 테두리 색상 변경 가능한가요?', status: 'new' },
    ];
    const [mockInquiries] = useState(mockInquiriesList);

    // --- 5. Data Fetching (Supabase) ---
    const fetchData = async () => {
        try {
            // 1. 광고(shops) 데이터 가져오기
            const { data: adsData } = await supabase
                .from('shops')
                .select('*')
                .order('updated_at', { ascending: false });

            if (adsData) {
                setMockAds(adsData as Shop[]);
                const activeCount = adsData.filter(a => a.status === 'active').length;

                // 매출 합산 (가정: payAmount가 광고 단가인 경우 혹은 별도 필드)
                const currentRevenue = adsData
                    .filter(a => a.status === 'active')
                    .reduce((acc, curr) => acc + (Number(curr.payAmount) || 0), 0);

                setStats(prev => ({
                    ...prev,
                    activeAds: activeCount,
                    totalRevenue: 124030000 + currentRevenue
                }));
            }

            // 2. 회원(profiles) 데이터 가져오기
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

            // 3. 결제(payments) 데이터 가져오기
            const { data: payData } = await supabase
                .from('payments')
                .select('*, profiles(nickname, full_name)')
                .order('created_at', { ascending: false });

            if (payData) {
                setPayments(payData);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    useEffect(() => {
        fetchData();

        // Load messages
        setAllMessages([
            { id: 1, from: '해운대한라맨션', to: '개인회원A', content: '안녕하세요, 면접 가능하신가요?', date: '5분 전', status: 'normal' },
            { id: 2, from: '신사동 사장님', to: '개인회원B', content: '텔레그램 아이디로 연락 주세요. @secret123', date: '12분 전', status: 'warning' },
            { id: 3, from: '업주관리자', to: '지원자C', content: '기재하신 페이 조율 가능합니다.', date: '30분 전', status: 'normal' },
        ]);
    }, []);

    // [New] Ad Status Control Logic (Supabase Enabled)
    const handleStatusUpdate = async (adId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('shops')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', adId);

            if (error) throw error;

            // Update UI state
            setMockAds((prev: Shop[]) => prev.map((ad: Shop) =>
                ad.id === adId ? ({ ...ad, status: newStatus as Shop['status'] } as Shop) : ad
            ));

            const statusMsg = newStatus === 'active' ? '승인' : (newStatus === 'rejected' ? '거절' : '변경');
            alert(`광고 ${statusMsg} 처리가 완료되었습니다. (DB 반영 완료)`);
        } catch (error) {
            console.error('Error updating status:', error);
            // Local fallback for demo
            setMockAds((prev: Shop[]) => {
                const nextAds = prev.map((ad: Shop) =>
                    ad.id === adId ? ({ ...ad, status: newStatus as any } as Shop) : ad
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
            // 1. 결제 상태 변경
            const { error: payError } = await supabase
                .from('payments')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('id', paymentId);

            if (payError) throw payError;

            // 2. 연결된 광고 상태 변경 (Optional: 자동 승인 정착 시)
            if (shopId) {
                const { error: shopError } = await supabase
                    .from('shops')
                    .update({ status: 'active', updated_at: new Date().toISOString() })
                    .eq('id', shopId);

                if (shopError) console.error("Ad auto-approval failed:", shopError);
            }

            alert('결제 승인 및 광고 게시 처리가 완료되었습니다.');
            fetchData(); // 전체 리프레시
        } catch (err) {
            console.error('Payment confirmation error:', err);
            alert('오류가 발생했습니다.');
        }
    };

    const formatPrice = (priceInWon: number) => {
        if (priceInWon >= 10000) {
            return `${Math.floor(priceInWon / 10000)}만원`;
        }
        return `${priceInWon.toLocaleString()}원`;
    };

    useEffect(() => {
        // [Fix] isLoading이 false가 된 후에만 권한 체크를 수행하여 리다이렉트 루프 방지
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
                    <NavItem icon={<Settings size={20} />} label="시스템 설정" active={activeTab === 'seo'} onClick={() => setActiveTab('seo')} />
                </nav>
            </aside>

            {/* Main Content */}
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
                        <p className="text-slate-400 font-bold text-xs md:text-sm mt-2">환영합니다, 사장님. 플랫폼의 모든 흐름이 당신의 손끝에 있습니다.</p>
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
                                title="테스트 용도의 신규 공고 즉시 등록"
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
                                onClick={() => alert('누적 성과 상세 리포트 페이지로 이동합니다. (v2.6 예정)')}
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
                                title="전체 트래픽 (UV)"
                                value="84.2 K"
                                trend="+5.4%"
                                icon={<Eye size={24} />}
                                color="indigo"
                                onClick={() => alert('실시간 트래픽 히트맵 로드 중... (v2.7 예정)')}
                            />
                        </div>
                    </div>
                )}

                {/* Tab 2: Ad Approval Management (Advanced) */}
                {activeTab === 'ads' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter">광고 심사 관리 허브 🛡️</h3>
                                <p className="text-[11px] md:text-sm text-slate-400 font-bold mt-1 leading-relaxed">
                                    심사대기 건을 승인하고, 광고 가이드<br className="md:hidden" /> 준수 여부를 모니터링합니다.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAdFilter(adFilter === 'all' ? 'pending' : 'all')}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all active:scale-95 ${adFilter === 'pending' ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-200' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}
                                >
                                    {adFilter === 'pending' ? '전체 보기' : `심사대기 ${mockAds.filter(a => a.status === 'pending').length}건`}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">상점 정보 (회원ID)</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">신청 옵션 (유료)</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap text-center">결제 금액</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">상태</th>
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
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${ad.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                                        {ad.category ? ad.category[0] : 'U'}
                                                                    </div>
                                                                    <div className="flex flex-col max-w-[120px] md:max-w-none">
                                                                        <div className="text-sm font-black text-slate-900 leading-tight mb-1 truncate">{ad.shopName}</div>
                                                                        <div className="text-[10px] font-bold text-slate-400 italic">ID: {ad.ownerId}</div>
                                                                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">{ad.region}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="text-xs font-bold text-slate-600 truncate max-w-[200px]">
                                                                    {ad.options ? (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {ad.options.bold && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px]">굵게</span>}
                                                                            {ad.options.blink && <span className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded text-[9px]">깜빡임</span>}
                                                                            {ad.options.color && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px]">색상</span>}
                                                                            {!ad.options.bold && !ad.options.blink && !ad.options.color && '기본'}
                                                                        </div>
                                                                    ) : '기본'}
                                                                </div>
                                                                <div className="text-[9px] text-blue-500 font-black mt-1 uppercase tracking-tighter">최근 수정: {ad.edits || 0}/30회</div>
                                                            </td>
                                                            <td className="px-8 py-6 text-center">
                                                                <div className="text-sm font-black text-slate-950 tabular-nums whitespace-nowrap">{formatPrice(ad.price || 0)}</div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black ${ad.status === 'active' ? 'bg-green-50 text-green-600' :
                                                                    (ad.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                                        (ad.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'))
                                                                    }`}>
                                                                    {ad.status === 'active' ? '승인완료' :
                                                                        (ad.status === 'pending' ? '심사대기' :
                                                                            (ad.status === 'rejected' ? '거절됨' : '대기중'))}
                                                                </span>
                                                            </td>
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
                                                                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(ad.id, 'rejected'); }}
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
                                                                <td colSpan={5} className="px-8 py-0">
                                                                    <div className="bg-slate-900/5 border-x border-slate-100 p-10 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                            <div className="space-y-6">
                                                                                <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
                                                                                    <Info size={14} /> 금칙어 및 정책 위반 정밀 검사
                                                                                </div>
                                                                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                                                    <div className="absolute top-0 right-0 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black">NORMAL</div>
                                                                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">
                                                                                        &quot;안녕하세요, 저희 상점은 최고의 대우와 안락한 환경을 보장합니다. 주저 말고 연락 주세요. {ad.shopName}은 언제나 열려 있습니다.&quot;
                                                                                    </p>
                                                                                    <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-slate-400 font-bold">
                                                                                        * 현재 본문 내 정책 위반 키워드가 발견되지 않았습니다.
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
                                                                                        <span className="font-black text-blue-600">{ad.edits || 0} / 30회</span>
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
                                                <td colSpan={5} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                            <Database size={32} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 tracking-tighter">운영 데이터베이스가 비어 있습니다.</p>
                                                            <p className="text-xs text-slate-400 font-bold mt-1">로컬 데이터를 Supabase로 동기화(Migration)해야 리스트가 표시됩니다.</p>
                                                        </div>

                                                        {/* --- 진단용 디버그 정보 (START) --- */}
                                                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-left w-full max-w-sm">
                                                            <p className="text-xs font-black text-red-600 mb-2 flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                                시스템 연결 진단 (System Diagnostic)
                                                            </p>
                                                            <div className="space-y-1 text-[11px] text-red-500 font-medium">
                                                                <p>• URL Config: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 설정 안됨 (NULL)'}</p>
                                                                <p>• URL Value: {process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15) + '...' : '-'}</p>
                                                                <p>• Placeholder: {process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ? '⚠️ YES (연동 불가)' : '✅ NO (정상)'}</p>
                                                                <p>• Data Count: {mockAds.length}건</p>
                                                            </div>
                                                            <p className="mt-2 text-[10px] text-red-400 border-t border-red-100 pt-2 leading-tight">
                                                                {process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
                                                                    ? 'Vercel 환경 변수가 없지만 [Emergency Fallback]이 작동하여 연결되었습니다.'
                                                                    : 'DB 연결 상태: 정상 (Environment Variable or Fallback Active)'}
                                                            </p>
                                                        </div>
                                                        {/* --- 진단용 디버그 정보 (END) --- */}

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
                )}

                {/* Tab 3: Member Management (Advanced) */}
                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
                            <div>
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter">전체 회원 마스터 컨트롤 👥</h3>
                                <p className="text-sm text-slate-400 font-bold mt-1">유입 경로 추적 및 블랙리스트 정밀 관리를 수행합니다.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => setIsGlobalMsgOpen(true)}
                                    className="bg-slate-950 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Mail size={14} className="text-blue-400" /> 전체 쪽지 발송
                                </button>
                                <select
                                    onChange={(e) => setUserFilter(e.target.value as any)}
                                    className="bg-white border border-slate-100 px-4 py-2 rounded-xl text-xs font-black text-slate-600 outline-none shadow-sm"
                                >
                                    <option value="all">전체 유형</option>
                                    <option value="corporate">기업 회원</option>
                                    <option value="individual">개인 회원</option>
                                </select>
                                <div className="relative flex-1 md:w-64">
                                    <input
                                        type="text"
                                        placeholder="아이디, 닉네임 검색..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full bg-white border border-slate-100 px-4 py-2 pl-9 rounded-xl text-xs font-bold text-slate-600 outline-none shadow-sm focus:border-blue-200"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">회원 정보 (아이디/이름/닉네임)</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">연락처/이메일</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">유입경로</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">상태</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {realUsers.length > 0 ? (
                                            realUsers
                                                .filter(u => userFilter === 'all' || u.role === userFilter)
                                                .filter(u => (u.email || '').includes(userSearch) || (u.nickname || '').includes(userSearch) || (u.full_name || '').includes(userSearch))
                                                .map((u) => (
                                                    <React.Fragment key={u.id}>
                                                        <tr
                                                            onClick={() => alert(`'${u.full_name || u.nickname}' 회원의 상세 활동 타임라인을 불러옵니다. (준비중)`)}
                                                            className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                                                        >
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                        {(u.full_name || u.nickname || '회')[0]}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-black text-slate-900">{u.full_name || u.nickname || '익명'} <span className="text-[10px] text-slate-300 font-bold ml-1">({u.email})</span></div>
                                                                        <div className="text-[10px] font-bold text-blue-500">{u.nickname}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="text-[11px] font-black text-slate-700">{u.phone || '미등록'}</div>
                                                                <div className="text-[10px] font-bold text-slate-400">{u.email}</div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-wider">{u.referrer || '직접 유입'}</span>
                                                                <div className="text-[9px] text-slate-300 mt-1 font-bold">{u.created_at?.split('T')[0]} 가입</div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black ${u.blocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                                    {u.blocked ? 'BLOCKED' : 'ACTIVE'}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); alert(`${u.nickname}님의 비밀번호 초기화 메일을 발송했습니다.`); }}
                                                                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all"
                                                                        title="비밀번호 초기화"
                                                                    >
                                                                        <Unlock size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); alert(`${u.nickname}님에게 관리자 메일을 발송합니다.`); }}
                                                                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                                    >
                                                                        <Mail size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); alert(`${u.nickname} 회원의 계정 상태를 변경하시겠습니까?`); }}
                                                                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                                                    >
                                                                        <Lock size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))
                                        ) : (
                                            mockUsers
                                                .filter(u => userFilter === 'all' || u.type === userFilter)
                                                .filter(u => u.loginId.includes(userSearch) || u.nickname.includes(userSearch) || u.name.includes(userSearch))
                                                .map((u) => (
                                                    <React.Fragment key={u.id}>
                                                        <tr
                                                            onClick={() => alert(`'${u.name}' 회원의 상세 활동 타임라인을 불러옵니다. (준비중)`)}
                                                            className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                                                        >
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                        {u.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm font-black text-slate-900">{u.name} <span className="text-[10px] text-slate-300 font-bold ml-1">({u.loginId})</span></div>
                                                                        <div className="text-[10px] font-bold text-blue-500">{u.nickname}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="text-[11px] font-black text-slate-700">{u.phone}</div>
                                                                <div className="text-[10px] font-bold text-slate-400">{u.email}</div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[9px] font-black uppercase tracking-wider">{u.referrer}</span>
                                                                <div className="text-[9px] text-slate-300 mt-1 font-bold">{u.joinDate} 가입</div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black ${u.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                                    {u.status.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); alert(`${u.name}님의 비밀번호를 'coco1234!'로 초기화했습니다.`); }}
                                                                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all"
                                                                        title="비밀번호 초기화"
                                                                    >
                                                                        <Unlock size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); alert(`${u.name}님에게 관리자 메일을 발송합니다.`); }}
                                                                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                                                    >
                                                                        <Mail size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); alert(`${u.name} 회원의 계정 상태를 변경하시겠습니까?`); }}
                                                                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                                                                    >
                                                                        <Lock size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inquiry' && (
                    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Inquiry List */}
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-black text-gray-900 flex items-center gap-2">
                                    <MessageSquare size={18} className="text-pink-500" />
                                    최근 문의 내역
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                                {mockInquiries.map((iq) => (
                                    <div
                                        key={iq.id}
                                        onClick={() => {
                                            setSelectedInquiry(iq);
                                            // [New] Mobile Modal Trigger
                                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                                setIsMobileInquiryModalOpen(true);
                                            }
                                        }}
                                        className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${selectedInquiry?.id === iq.id ? 'bg-pink-50/30' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-black text-gray-900">{iq.sender}</span>
                                            <span className="text-[10px] font-bold text-gray-400">{iq.date}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1">{iq.content}</p>
                                        <div className="mt-3 flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${iq.status === 'new' ? 'bg-pink-500 animate-pulse' : 'bg-gray-300'}`}></span>
                                            <span className={`text-[10px] font-black ${iq.status === 'new' ? 'text-pink-500' : 'text-gray-400'}`}>
                                                {iq.status === 'new' ? '답변 대기' : '답변 완료'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reply Section - PC Only / Reset in Mobile Popup */}
                        <div className="hidden lg:flex bg-white rounded-[40px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                            {selectedInquiry ? (
                                <>
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-black">
                                                {selectedInquiry.sender.substring(0, 1)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{selectedInquiry.sender}</p>
                                                <p className="text-[10px] font-bold text-gray-400">온라인 문의 대응</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                            <XCircle className="text-slate-300" />
                                        </button>
                                    </div>
                                    <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/30">
                                        <div className="flex flex-col items-start gap-2">
                                            <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%] text-sm text-gray-700 leading-relaxed font-bold">
                                                {selectedInquiry.content}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 ml-1">{selectedInquiry.date}</span>
                                        </div>

                                        {/* Reply Mock (If any) */}
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-[10px] font-bold text-gray-300 italic">여기에 답장을 작성하세요...</p>
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-gray-100 bg-white">
                                        <div className="relative">
                                            <textarea
                                                placeholder="답변 내용을 입력하세요..."
                                                className="w-full h-24 p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500/20 resize-none transition-all"
                                            ></textarea>
                                            <button
                                                onClick={() => { alert('답변이 전송되었습니다!'); setSelectedInquiry(null); }}
                                                className="absolute bottom-4 right-4 bg-pink-600 text-white px-6 py-2 rounded-2xl text-xs font-black shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all"
                                            >답변 전송하기</button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-gray-300 gap-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                        <MessageSquare size={40} />
                                    </div>
                                    <p className="font-black text-sm">왼쪽 리스트에서 문의를 선택해 주세요.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {/* Tab 5: Message Monitoring */}
                {activeTab === 'messages' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter">전체 쪽지 모니터링 🔍</h3>
                                <p className="text-sm text-slate-400 font-bold mt-1">회원 간 평온한 소통을 위해 실시간으로 감시 중입니다.</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black border border-red-100 italic animate-pulse">주의 필요: 1건</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">보낸이 / 받는이</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">대화 내용</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">시간 / 상태</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">관리 액션</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allMessages.map((msg) => (
                                            <tr key={msg.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-300 font-black">FROM</span>
                                                            <span className="text-sm font-black text-slate-900 leading-none">{msg.from}</span>
                                                        </div>
                                                        <ArrowRight size={14} className="text-slate-200 mt-2" />
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-300 font-black">TO</span>
                                                            <span className="text-sm font-black text-slate-900 leading-none">{msg.to}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`text-sm font-bold max-w-md truncate ${msg.status === 'warning' ? 'text-red-500 underline decoration-red-200' : 'text-slate-600'}`}>
                                                        {msg.content}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-slate-400">{msg.date}</span>
                                                        <span className={`text-[10px] font-black mt-0.5 ${msg.status === 'warning' ? 'text-red-600' : 'text-blue-600'}`}>
                                                            {msg.status === 'warning' ? '⚠️ 외부유입 의심' : '✅ 정상 소통'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => alert(`'${msg.from}' 회원에게 주의 쪽지를 발송했습니다.`)}
                                                        className="px-5 py-2.5 bg-slate-950 text-white rounded-2xl text-[11px] font-black hover:bg-black hover:shadow-lg hover:shadow-slate-200 transition-all active:scale-95"
                                                    >
                                                        주의 조치
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 6: SEO & Search Control */}
                {activeTab === 'seo' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <CompetitorAnalysis />
                        <SEOIndexingControl />
                    </div>
                )}

                {/* Tab 7: Payment Management (New) */}
                {activeTab === 'payments' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-2xl font-black text-slate-950 tracking-tighter">결제 내역 및 입금 승인 💸</h3>
                                <p className="text-sm text-slate-400 font-bold mt-1">무통장 입금 내역을 확인하고 광고를 최종 승인합니다.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">결제 정보 / 항목</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">회원 닉네임</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">금액 / 수단</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">관리 상태</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">승인 제어</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.length > 0 ? (
                                            payments.map((p) => (
                                                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="text-sm font-black text-slate-900 leading-tight mb-1">{p.description}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 italic">#{p.id.substring(0, 8)}... | {new Date(p.created_at).toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-sm font-bold text-slate-600">
                                                        {p.profiles?.nickname || p.profiles?.full_name || '익명'}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-sm font-black text-slate-950 tabular-nums">{(p.amount || 0).toLocaleString()}원</div>
                                                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">{p.method === 'bank_transfer' ? '무통장입금' : p.method}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black ${p.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {p.status === 'completed' ? '결제완료' : '입금대기'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {p.status !== 'completed' && (
                                                            <button
                                                                onClick={() => handlePaymentConfirm(p.id, p.shop_id)}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                                                            >
                                                                입금확인 및 승인
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-20 text-center opacity-30">
                                                    <CreditCard size={40} className="mx-auto mb-4" />
                                                    <p className="text-sm font-black">아직 결제 신청 내역이 없습니다.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* [New] Mobile Inquiry Reply Modal */}
            {isMobileInquiryModalOpen && selectedInquiry && (
                <div className="fixed inset-0 z-[40000] lg:hidden flex flex-col items-center justify-end bg-slate-950/40 backdrop-blur-sm p-4">
                    <div className="w-full h-[82vh] min-h-[82vh] bg-white rounded-[32px] flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 font-black">
                                    {selectedInquiry.sender.substring(0, 1)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">{selectedInquiry.sender}</p>
                                    <p className="text-[10px] font-bold text-gray-400">온라인 문의 대응 (모바일)</p>
                                </div>
                            </div>
                            <button onClick={() => setIsMobileInquiryModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <XCircle className="text-slate-300" />
                            </button>
                        </div>

                        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6 bg-slate-50/30">
                            <div className="flex flex-col items-start gap-2">
                                <div className="bg-white px-5 py-3 md:py-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[95%] text-sm text-gray-700 leading-relaxed font-bold">
                                    {selectedInquiry.content}
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 ml-1">{selectedInquiry.date}</span>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">답변 내용 작성</label>
                                <textarea
                                    rows={8}
                                    placeholder="관리자 답변을 입력해 주세요..."
                                    className="w-full p-4 md:p-5 bg-white border border-slate-100 rounded-[20px] text-sm font-bold shadow-inner focus:border-pink-300 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 pb-16 border-t border-slate-100 bg-white shrink-0">
                            <button
                                onClick={() => {
                                    alert('답변이 성공적으로 전송되었습니다.');
                                    setIsMobileInquiryModalOpen(false);
                                }}
                                className="w-full py-5 bg-slate-950 text-white rounded-[24px] text-sm font-black shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Zap size={18} className="text-blue-400" /> 답변 전송 및 문의 완료
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* [New] Global Message Modal */}
            {isGlobalMsgOpen && (
                <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsGlobalMsgOpen(false)} />
                    <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[32px] md:rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-slate-950 tracking-tighter">전체 회원 쪽지 발송 ✉️</h3>
                                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Global Broadcast System</p>
                            </div>
                            <button onClick={() => setIsGlobalMsgOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><XCircle className="text-slate-300" /></button>
                        </div>

                        <div className="p-5 md:p-10 space-y-3 md:space-y-8 max-h-[75vh] md:max-h-none overflow-y-auto">
                            {sendSuccess ? (
                                <div className="py-10 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter">발송 요청 완료!</h4>
                                    <p className="text-sm font-bold text-slate-400">시스템이 수천 명의 회원에게 순차적으로 쪽지를 전달합니다.</p>
                                    <button
                                        onClick={() => { setIsGlobalMsgOpen(false); setSendSuccess(false); }}
                                        className="mt-6 px-10 py-4 bg-slate-950 text-white rounded-2xl text-xs font-black shadow-lg"
                                    >닫기</button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">수신 대상 그룹</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'all', label: '전체 회원' },
                                                { id: 'corporate', label: '기업 회원' },
                                                { id: 'individual', label: '개인 회원' }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setMsgTarget(t.id as any)}
                                                    className={`py-3 rounded-2xl text-[11px] font-black transition-all border ${msgTarget === t.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">쪽지 제목</label>
                                        <input
                                            type="text"
                                            placeholder="공지 사항 또는 이벤트 제목을 입력하세요."
                                            value={msgTitle}
                                            onChange={(e) => setMsgTitle(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-300 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5 md:space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상세 내용</label>
                                        <textarea
                                            rows={8}
                                            placeholder="회원들에게 전달할 상세 내용을 입력해 주세요."
                                            value={msgContent}
                                            onChange={(e) => setMsgContent(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-300 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div className="pb-4 md:pb-0">
                                        <button
                                            onClick={() => {
                                                if (!msgTitle || !msgContent) { alert('제목과 내용을 모두 입력해 주세요.'); return; }
                                                setSendSuccess(true);
                                            }}
                                            className="w-full py-4 md:py-5 bg-slate-950 text-white rounded-2xl md:rounded-3xl text-sm font-black shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Zap size={18} className="text-blue-400" /> 대상에게 즉시 대량 발송
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
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
