'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar, AdminMobileSidebar, AdminTab } from '@/components/admin/AdminSidebar';
import { ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoggedIn, userType, isLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Auth Check
    useEffect(() => {
        if (isLoading) return;
        if (!isLoggedIn || userType !== 'admin') {
            // Wait for child components to handle redirect or show alert
            // But we can check authorization here
        } else {
            setIsAuthorized(true);
        }
    }, [isLoading, isLoggedIn, userType]);

    // Determine Active Tab
    const getCurrentTab = (): AdminTab => {
        if (pathname?.startsWith('/admin/marketing')) return 'marketing';
        const tab = searchParams?.get('tab');
        return (tab as AdminTab) || 'stats';
    };

    const activeTab = getCurrentTab();

    // Counts State
    const [counts, setCounts] = useState({
        ads: 0,
        inquiries: 0,
        payments: 0,
        business: 0
    });

    const fetchCounts = React.useCallback(async () => {
        try {
            // Fetch Pending Ads
            const { count: adsCount } = await supabase
                .from('shops')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // Fetch New Inquiries
            const { count: inqCount } = await supabase
                .from('inquiries')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'new');

            // Fetch Pending Payments
            const { count: payCount } = await supabase
                .from('payments')
                .select('*', { count: 'exact', head: true })
                .neq('status', 'completed');

            // Fetch Pending Business Verifications
            const { count: bizCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('business_verify_status', 'pending');

            // Merge Local Mocks
            const localMockAdsRaw = localStorage.getItem('coco_mock_ads');
            let localPendingAds = 0;
            if (localMockAdsRaw) {
                try {
                    const localAds = JSON.parse(localMockAdsRaw);
                    localPendingAds = localAds.filter((a: any) => a.status === 'pending').length;
                } catch (e) { }
            }

            setCounts({
                ads: (adsCount || 0) + localPendingAds,
                inquiries: inqCount || 0,
                payments: payCount || 0,
                business: bizCount || 0
            });
        } catch (e) {
            console.error('Error fetching admin counts:', e);
        }
    }, []);

    useEffect(() => {
        if (isAuthorized) {
            fetchCounts();

            // Listen for internal NoteService updates
            window.addEventListener('notes-updated', fetchCounts);

            // Supabase Realtime Subscriptions
            const channel = supabase
                .channel('admin-counts-all')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, fetchCounts)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, fetchCounts)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchCounts)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchCounts)
                .subscribe();

            return () => {
                window.removeEventListener('notes-updated', fetchCounts);
                supabase.removeChannel(channel);
            };
        }
    }, [isAuthorized, fetchCounts]);

    const handleNavigate = (tab: AdminTab) => {
        if (tab === 'marketing') {
            router.push('/admin/marketing');
        } else {
            router.push(`/admin?tab=${tab}`);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold">로딩 중...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative font-sans">
            {/* Mobile Header */}
            <header className="md:hidden bg-slate-950 text-white p-4 flex justify-between items-center sticky top-0 z-[10002] shrink-0 shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    <span className="font-black tracking-tighter italic text-lg">COCO ADMIN</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-900 rounded-xl transition-colors">
                    <LayoutDashboard size={24} className="text-blue-400" />
                </button>
            </header>

            {/* Mobile Sidebar */}
            <AdminMobileSidebar
                activeTab={activeTab}
                counts={counts}
                onNavigate={handleNavigate}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Desktop Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                counts={counts}
                onNavigate={handleNavigate}
                className="shadow-2xl shadow-slate-900/10"
            />

            {/* Main Content */}
            <main className="flex-1 w-full p-4 md:p-8 lg:p-12 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
