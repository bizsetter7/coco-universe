'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck,
    Zap,
    Bell,
    CreditCard,
    MessageSquare
} from 'lucide-react';

import { Shop } from '@/types/shop';
import { useAuth } from '@/hooks/useAuth';
import { HealthDashboard } from '@/components/admin/HealthDashboard';
import { supabase } from '@/lib/supabase';
import { StandardsGuardView } from './components/StandardsGuardView';
import { AdminTab } from '@/components/admin/AdminSidebar';
import { AdminStatsOverview } from '@/components/admin/dashboard/AdminStatsOverview';
import { useSearchParams } from 'next/navigation';


import { AdminInquiryManagement } from '@/components/admin/inquiry/AdminInquiryManagement';
import { AdminMemberManagement } from '@/components/admin/member/AdminMemberManagement';
import { AdminPaymentManagement } from '@/components/admin/payment/AdminPaymentManagement';
import { AdminAdManagement } from '@/components/admin/ad/AdminAdManagement';
import { BusinessVerifyView } from '@/components/admin/BusinessVerifyView';
import { AdminApplicationManagement } from '@/components/admin/applications/AdminApplicationManagement';

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

    // --- 1. Core State Section ---
    const [mockAds, setMockAds] = useState<Shop[]>([]);
    const [realUsers, setRealUsers] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [pendingApplications, setPendingApplications] = useState(0);
    const [healthIssueCount, setHealthIssueCount] = useState(0);
    const [stats, setStats] = useState({
        totalRevenue: 124030000,
        activeAds: 0,
        newUserToday: 0,
        totalUsers: 0
    });
    const searchParams = useSearchParams();
    const initialTab = (searchParams?.get('tab') as AdminTab) || 'stats';
    const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);


    // Update activeTab if URL changes
    useEffect(() => {
        const tab = searchParams?.get('tab') as AdminTab;
        if (tab) setActiveTab(tab);
    }, [searchParams]);


    const [isAuthorized, setIsAuthorized] = useState(false);


    // --- 2. Filter & UI State ---

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [allMessages, setAllMessages] = useState<any[]>([]);




    // --- 4. Mock Users (Can be moved to DB later) ---
    const [mockUsers] = useState<any[]>([
        { id: 'user_01', loginId: 'daesun123', name: '김대순', nickname: '마스터관리자', birth: '1975-05-15', phone: '010-1234-5678', email: 'bizsetter7@gmail.com', type: 'individual', status: 'active', joinDate: '2026-02-01', referrer: '직접 유입', statusHistory: ['2026-02-01 가입'] },
        { id: 'user_02', loginId: 'shop_master', name: '이사장', nickname: '강남구인구직', birth: '1988-11-22', phone: '010-9876-5432', email: 'ceo@shop.com', type: 'corporate', status: 'active', joinDate: '2026-01-15', referrer: '네이버', statusHistory: ['2026-01-15 기업회원 가입', '2026-02-10 광고 연장'] },
        { id: 'user_03', loginId: 'bad_boy', name: '박진상', nickname: '진상입니다', birth: '1992-03-03', phone: '010-4444-4444', email: 'bad@naver.com', type: 'individual', status: 'blocked', joinDate: '2026-02-12', referrer: '직접 유입', statusHistory: ['2026-02-12 가입', '2026-02-13 비매너 행위로 영구 정지'] },
    ]);

    const [realInquiries, setRealInquiries] = useState<any[]>([]);


    // [Safety] Force cleanup on mount to prevent stuck scroll from previous navigation
    useEffect(() => {
        document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // --- 5. Data Fetching (Supabase) ---
    const fetchData = React.useCallback(async () => {
        try {
            // 0. Fetch Inquiries
            const { data: inqData } = await supabase
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);
            if (inqData) setRealInquiries(inqData);

            // 1. Fetch Shops
            const { data: adsData } = await supabase
                .from('shops')
                .select('*')
                .order('updated_at', { ascending: false })
                .limit(500);

            // 2. Fetch Profiles
            const { data: userData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1000);
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

            // 3-1. Fetch Applications count (pending)
            const { count: appCount } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            setPendingApplications(appCount || 0);

            // 4. Fetch Messages
            // [Fix] 공백이 포함된 관리자 앨리어스(시스템 관리자 등)를 위해 따옴표(\") 처리 추가 (Supabase .or() 문법 준수)
            const ADMIN_ALIASES = ['시스템 관리자', '운영자', '관리자', 'admin', '마스터관리자', 'admin_user', 'Admin'];
            const adminQuery = ADMIN_ALIASES.map(a => `sender_name.eq.\"${a}\",receiver_name.eq.\"${a}\"`).join(',');
            const { data: msgData } = await supabase
                .from('messages')
                .select('*')
                .or(adminQuery)
                .order('created_at', { ascending: false })
                .limit(500);

            // Local Data Merging
            const localMessagesRaw = localStorage.getItem('coco_local_messages');
            let localMessages: any[] = [];
            if (localMessagesRaw) {
                try {
                    localMessages = JSON.parse(localMessagesRaw).map((m: any) => ({
                        ...m,
                        created_at: m.created_at || new Date().toISOString(),
                        id: m.id || `local_${Math.random()}`
                    }));
                } catch (e) { }
            }

            const combinedMessages = [...(msgData || []), ...localMessages].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setAllMessages(combinedMessages.map((m: any) => ({
                ...m,
                from: m.sender_name || '시스템',
                to: m.receiver_name || '관리자',
                date: new Date(m.created_at).toLocaleString('ko-KR', {
                    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
                }),
                is_read: m.is_read || false
            })));

            const localMockPaymentsRaw = localStorage.getItem('my_site_payment_history');
            let localPayments: any[] = [];
            if (localMockPaymentsRaw) {
                try { localPayments = JSON.parse(localMockPaymentsRaw).map((p: any) => ({ ...p, isMock: true })); } catch (e) { }
            }
            const allPaymentsComp = [...(payData || []), ...localPayments];
            setPayments(allPaymentsComp.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

            // Enrich Ads with prices logic (Simplified integration)
            const localMockAdsRaw = localStorage.getItem('coco_mock_ads');
            let localMockAds: any[] = [];
            if (localMockAdsRaw) {
                try {
                    localMockAds = JSON.parse(localMockAdsRaw).map((ad: any) => ({
                        ...ad, isMock: true, status: ad.status || 'pending', created_at: ad.created_at || new Date().toISOString()
                    }));
                } catch (e) { }
            }

            const rawAllAds = [...(adsData || []), ...localMockAds];
            const uniqueAdsMap = new Map();
            rawAllAds.forEach(ad => { if (ad.id) uniqueAdsMap.set(String(ad.id), ad); });
            const allAdsComp = Array.from(uniqueAdsMap.values());

            const enrichedAds = allAdsComp.map(ad => {
                // [Fix] 광고주 프로필 매핑 (상호명·로그인ID)
                const profile = (userData || []).find((p: any) => p.id === ad.user_id);

                let adPrice = Number((ad.options as any)?.ad_price || ad.ad_price || ad.adPrice || ad.price || 0);
                if (!adPrice) {
                    const lastPayment = allPaymentsComp.find(p => String(p.shop_id || p.shopId || (p as any).metadata?.shop_id || '') === String(ad.id));
                    if (lastPayment) adPrice = Number((lastPayment as any).amount || (lastPayment as any).price || 0);
                }
                const opt = ad.options || {};
                return {
                    ...ad,
                    ad_price: adPrice,
                    // [Fix] 인증 상호명 우선 (profiles.business_name → DB name)
                    shopName: profile?.business_name || ad.name || '—',
                    // [Fix] 로그인 아이디 (profiles.username → nickname 순서로 폴백)
                    username: profile?.username || profile?.nickname || '',
                    payStatus: ad.pay_status || (ad as any).payStatus || '',
                    categorySub: ad.category_sub || opt.categorySub || '',
                    selectedIcon: opt.icon || (ad as any).selectedIcon,
                    selectedHighlighter: opt.highlighter || (ad as any).selectedHighlighter,
                    borderOption: opt.border || (ad as any).border || 'none',
                    paySuffixes: opt.pay_suffixes || opt.paySuffixes || [],
                    selectedKeywords: opt.keywords || ad.keywords || [],
                    payType: ad.pay_type || opt.payType || '협의'
                };
            });

            setMockAds(enrichedAds);
            setStats(prev => ({
                ...prev,
                activeAds: enrichedAds.filter(a => a.status === 'active').length,
                totalRevenue: 124030000 + enrichedAds.filter(a => a.status === 'active').reduce((acc, curr) => acc + (Number(curr.ad_price) || 0), 0)
            }));

        } catch (error) {
            console.error('Data fetch error:', error);
        }
    }, []);

    // --- 6. Handlers ---
    // [New] Ad Status Control Logic (Supabase Enabled)











    // 헬스체크 폴링 (어드민 진입 시 + 5분마다)
    useEffect(() => {
        if (!isAuthorized) return;

        const runHealthCheck = async () => {
            try {
                // 실 세션 토큰 포함 (mock 세션이면 null → 쿠키로 통과)
                const { data: sessionData } = await supabase.auth.getSession();
                const token = sessionData.session?.access_token;
                const headers: HeadersInit = token
                    ? { Authorization: `Bearer ${token}` }
                    : {};
                const res = await fetch('/api/admin/health', { method: 'GET', headers });
                const data = await res.json();
                setHealthIssueCount(data.issueCount || 0);
            } catch {
                setHealthIssueCount(1); // 연결 실패도 이슈로 처리
            }
        };

        runHealthCheck();
        const interval = setInterval(runHealthCheck, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isAuthorized]);

    useEffect(() => {
        if (isAuthorized) {
            fetchData();

            window.addEventListener('notes-updated', fetchData);

            // Debounce: Realtime 이벤트가 연속 발생해도 1초에 한 번만 fetchData 실행
            let debounceTimer: ReturnType<typeof setTimeout> | null = null;
            const debouncedFetch = () => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(fetchData, 1000);
            };

            const channel = supabase
                .channel('admin-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, debouncedFetch)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, debouncedFetch)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, debouncedFetch)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, debouncedFetch)
                .subscribe();

            return () => {
                if (debounceTimer) clearTimeout(debounceTimer);
                window.removeEventListener('notes-updated', fetchData);
                supabase.removeChannel(channel);
            };
        }
    }, [isAuthorized, fetchData]);

    useEffect(() => {
        if (isLoading) return;

        if (!isLoggedIn || userType !== 'admin') {
            alert('관리자 권한이 필요합니다.');
            router.push('/');
            return;
        }
        setIsAuthorized(true);
    }, [isLoggedIn, userType, router, isLoading]);

    if (!isAuthorized) return null;

    // --- [New] Badge Counter Calculations ---
    const pendingAdsCount = mockAds.filter(a => a.status === 'pending').length;
    const pendingInquiriesCount = realInquiries.filter(i => i.status === 'new').length;
    const pendingPaymentsCount = payments.filter(p => p.status !== 'completed').length;
    const totalNotifications = pendingAdsCount + pendingInquiriesCount + pendingPaymentsCount + pendingApplications;

    return (
        <div className="p-5 md:p-10 pb-20">
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
                    {/* 홈으로 */}
                    <button
                        onClick={() => router.push('/')}
                        title="사이트 홈으로"
                        className="w-9 h-9 md:w-10 md:h-10 rounded-2xl border border-slate-100 bg-white text-slate-500 flex items-center justify-center shadow-sm hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95 text-base font-black text-xs"
                    >
                        홈
                    </button>
                    {/* Role Simulator Icons */}
                    <div className="flex -space-x-2 mr-2">
                        <div
                            onClick={() => {
                                localStorage.setItem('coco_sim_mode', 'corporate');
                                router.push('/my-shop?simulate=corporate');
                            }}
                            title="기업 회원 시뮬레이션 (광고 등록/관리)"
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[9px] md:text-[10px] font-black text-blue-600 shadow-sm z-30 cursor-pointer hover:scale-110 hover:z-40 transition-all"
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
                                <button
                                    onClick={() => router.push('/auth/update-password')}
                                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    🔑 비밀번호 변경
                                </button>
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
                            {totalNotifications > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute top-14 right-0 w-72 md:w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[10010] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <p className="text-xs font-black text-slate-900">실시간 알림</p>
                                    <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-black">
                                        {totalNotifications}
                                    </span>
                                </div>
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                    {/* 광고 알림 */}
                                    {mockAds.filter(a => a.status === 'pending').map(ad => (
                                        <div key={ad.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => { setActiveTab('ads'); setIsNotificationOpen(false); }}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Zap size={12} className="text-amber-500" />
                                                <p className="text-[11px] font-black text-slate-900">신규 광고 신청</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold leading-tight">
                                                [{ad.region}] {ad.shopName} 사장님이 승인을 기다리고 있습니다.
                                            </p>
                                        </div>
                                    ))}
                                    {/* 문의 알림 */}
                                    {realInquiries.filter(i => i.status === 'new').map(inq => (
                                        <div key={inq.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => { setActiveTab('inquiry'); setIsNotificationOpen(false); }}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <MessageSquare size={12} className="text-blue-500" />
                                                <p className="text-[11px] font-black text-slate-900">신규 1:1 문의</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold leading-tight">
                                                [{inq.type}] {inq.title}
                                            </p>
                                        </div>
                                    ))}
                                    {/* 결제 알림 */}
                                    {payments.filter(p => p.status !== 'completed').map(pay => (
                                        <div key={pay.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => { setActiveTab('payments'); setIsNotificationOpen(false); }}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CreditCard size={12} className="text-blue-500" />
                                                <p className="text-[11px] font-black text-slate-900">미결제 내역 확인</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold leading-tight">
                                                {pay.depositor_name || pay.amount.toLocaleString() + '원'} 입금 대기 중입니다.
                                            </p>
                                        </div>
                                    ))}
                                    {totalNotifications === 0 && (
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
                <AdminStatsOverview
                    stats={stats}
                    userStats={realUsers}
                    adStats={mockAds}
                    setActiveTab={setActiveTab}
                />
            )}
            {/* Tab 2: Ad Approval Management (Advanced) */}
            {activeTab === 'ads' && (
                <AdminAdManagement
                    mockAds={mockAds}
                    setMockAds={setMockAds}
                    fetchData={fetchData}
                />
            )}

            {/* Tab 3: User Management */}
            {
                activeTab === 'users' && (
                    <AdminMemberManagement
                        users={realUsers}
                        mockUsers={mockUsers}
                        fetchData={fetchData}
                    />
                )
            }
            {/* Tab 4: Payment Management */}
            {
                activeTab === 'payments' && (
                    <AdminPaymentManagement
                        payments={payments}
                        fetchData={fetchData}
                    />
                )
            }
            {/* Tab 5: Inquiry & Messages */}
            {
                (activeTab === 'inquiry' || activeTab === 'messages') && (
                    <AdminInquiryManagement
                        inquiries={realInquiries}
                        messages={allMessages}
                        fetchData={fetchData}
                    />
                )
            }
            {/* Tab 6: Business Verification */}
            {activeTab === 'business' && (
                <BusinessVerifyView />
            )}
            {/* Tab: Applications */}
            {activeTab === 'applications' && (
                <AdminApplicationManagement fetchData={fetchData} />
            )}
            {/* Tab 7: 시스템 설정 */}
            {activeTab === 'seo' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                    <HealthDashboard />
                </div>
            )}

            {/* Tab 7: System Health / Verification Center */}
            {
                activeTab === 'health' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <StandardsGuardView ads={mockAds} payments={payments} />
                    </div>
                )
            }






        </div >
    );
}




