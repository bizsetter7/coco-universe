import React from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Settings,
    ShieldCheck,
    Zap,
    Megaphone,
    Database,
    CreditCard,
    XCircle,
    LogOut,
    Building2,
    ClipboardList
} from 'lucide-react';

export type AdminTab = 'stats' | 'ads' | 'users' | 'inquiry' | 'messages' | 'seo' | 'payments' | 'health' | 'marketing' | 'business' | 'applications';

interface AdminSidebarProps {
    activeTab: AdminTab | string;
    counts?: {
        ads?: number;
        inquiries?: number;
        payments?: number;
        business?: number;
        applications?: number;
    };
    onNavigate: (tab: AdminTab) => void;
    className?: string;
}

interface AdminMobileSidebarProps extends AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NavItem = ({ icon, label, active, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: number, onClick?: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-900 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`shrink-0 ${active ? 'text-white' : 'text-slate-600 opacity-60'}`}>
                    {icon}
                </div>
                <span>{label}</span>
            </div>
            {badge !== undefined && badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black ${active ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                    {badge}
                </span>
            )}
        </button>
    );
};

export const AdminSidebar = ({ activeTab, counts, onNavigate, className = '' }: AdminSidebarProps) => {
    const router = useRouter();

    const handleNav = (tab: AdminTab) => {
        if (tab === 'marketing') {
            router.push('/admin/marketing');
        } else if (tab === 'stats') {
            // If we are not on the main admin page, we might need to push
            // But if this component is used in admin/page, onNavigate handles it.
            // We'll let the parent handle the logic mostly, but marketing usually implies a page change.
            onNavigate(tab);
        } else {
            onNavigate(tab);
        }
    };

    return (
        <aside className={`hidden md:flex w-64 bg-slate-950 text-white flex-col border-r border-slate-900 z-[10001] sticky top-0 min-h-screen shrink-0 ${className}`}>
            <div className="p-6 border-b border-slate-900">
                <h1 className="text-xl font-black text-blue-400 tracking-tighter">COCO ADMIN</h1>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Master Control Hub</p>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    label="대시보드"
                    active={activeTab === 'stats'}
                    onClick={() => handleNav('stats')}
                />
                <NavItem
                    icon={<Zap size={20} />}
                    label="광고 심사 관리"
                    active={activeTab === 'ads'}
                    badge={counts?.ads}
                    onClick={() => handleNav('ads')}
                />
                <NavItem
                    icon={<CreditCard size={20} />}
                    label="결제 내역 관리"
                    active={activeTab === 'payments'}
                    badge={counts?.payments}
                    onClick={() => handleNav('payments')}
                />
                <NavItem
                    icon={<MessageSquare size={20} />}
                    label="통합 문의 관리"
                    active={activeTab === 'inquiry'}
                    badge={counts?.inquiries}
                    onClick={() => handleNav('inquiry')}
                />
                <NavItem
                    icon={<Users size={20} />}
                    label="회원 관리"
                    active={activeTab === 'users'}
                    onClick={() => handleNav('users')}
                />
                <NavItem
                    icon={<Building2 size={20} className="text-amber-400" />}
                    label="사업자 인증 심사"
                    active={activeTab === 'business'}
                    badge={counts?.business}
                    onClick={() => handleNav('business')}
                />
                <NavItem
                    icon={<ClipboardList size={20} className="text-emerald-400" />}
                    label="지원자 관리"
                    active={activeTab === 'applications'}
                    badge={counts?.applications}
                    onClick={() => handleNav('applications')}
                />
                <NavItem
                    icon={<Megaphone size={20} />}
                    label="마케팅 자동화"
                    active={activeTab === 'marketing'}
                    onClick={() => router.push('/admin/marketing')}
                />
                <NavItem
                    icon={<ShieldCheck size={20} className="text-emerald-500" />}
                    label="시스템 검증 센터"
                    active={activeTab === 'health'}
                    onClick={() => router.push('/admin/system-verification')}
                />
                <NavItem
                    icon={<Settings size={20} />}
                    label="시스템 설정"
                    active={activeTab === 'seo'}
                    onClick={() => handleNav('seo')}
                />
            </nav>
        </aside>
    );
};

export const AdminMobileSidebar = ({ activeTab, counts, onNavigate, isOpen, onClose }: AdminMobileSidebarProps) => {
    const router = useRouter();

    if (!isOpen) return null;

    const handleNav = (tab: AdminTab) => {
        if (tab === 'marketing') {
            router.push('/admin/marketing');
        } else {
            onNavigate(tab);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10005] md:hidden">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
            <aside className="absolute right-0 top-0 bottom-0 w-[280px] bg-slate-950 border-l border-slate-900 p-6 pt-16 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-xl font-black text-blue-400 tracking-tighter">COCO ADMIN</h1>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Navigation Menu</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-900 rounded-full transition-colors">
                        <XCircle className="text-slate-400" />
                    </button>
                </div>
                <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="대시보드"
                        active={activeTab === 'stats'}
                        onClick={() => handleNav('stats')}
                    />
                    <NavItem
                        icon={<Zap size={20} />}
                        label="광고 심사 관리"
                        active={activeTab === 'ads'}
                        badge={counts?.ads}
                        onClick={() => handleNav('ads')}
                    />
                    <NavItem
                        icon={<CreditCard size={20} />}
                        label="결제 관리"
                        active={activeTab === 'payments'}
                        badge={counts?.payments}
                        onClick={() => handleNav('payments')}
                    />
                    <NavItem
                        icon={<MessageSquare size={20} />}
                        label="통합 문의 관리"
                        active={activeTab === 'inquiry'}
                        badge={counts?.inquiries}
                        onClick={() => handleNav('inquiry')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="회원 관리"
                        active={activeTab === 'users'}
                        onClick={() => handleNav('users')}
                    />
                    <NavItem
                        icon={<Building2 size={20} className="text-amber-400" />}
                        label="사업자 인증 심사"
                        active={activeTab === 'business'}
                        badge={counts?.business}
                        onClick={() => handleNav('business')}
                    />
                    <NavItem
                        icon={<Megaphone size={20} />}
                        label="마케팅 자동화"
                        active={activeTab === 'marketing'}
                        onClick={() => router.push('/admin/marketing')}
                    />
                    <NavItem
                        icon={<ShieldCheck size={20} className="text-emerald-500" />}
                        label="시스템 검증 센터"
                        active={activeTab === 'health'}
                        onClick={() => { router.push('/admin/system-verification'); onClose(); }}
                    />
                    <NavItem
                        icon={<Settings size={20} />}
                        label="시스템 설정"
                        active={activeTab === 'seo'}
                        onClick={() => handleNav('seo')}
                    />
                </nav>
                <div className="pt-6 border-t border-slate-900">
                    <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-sm hover:bg-slate-900 rounded-xl transition-all">
                        <LogOut size={18} /> 홈페이지로 이동
                    </button>
                </div>
            </aside>
        </div>
    );
};
