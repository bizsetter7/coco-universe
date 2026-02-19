import React from 'react';
import {
    Users,
    Eye,
    Megaphone,
    TrendingUp,
} from 'lucide-react';
import AdminCharts from '@/app/admin/components/AdminCharts';
import { AdminTab } from '@/components/admin/AdminSidebar';

interface AdminStatsOverviewProps {
    stats: {
        totalRevenue: number;
        activeAds: number;
        newUserToday: number;
        totalUsers: number;
    };
    userStats: any[];
    adStats: any[];
    setActiveTab: (tab: AdminTab) => void;
}

export function AdminStatsOverview({ stats, userStats, adStats, setActiveTab }: AdminStatsOverviewProps) {
    return (
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
            <AdminCharts userStats={userStats} adStats={adStats} />
        </div>
    );
}

function StatCard({ title, value, trend, icon, color, onClick }: { title: string, value: string, trend: string, icon: React.ReactNode, color: 'blue' | 'pink' | 'slate' | 'indigo', onClick?: () => void }) {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-600',
        pink: 'bg-pink-50 text-pink-600',
        slate: 'bg-slate-100 text-slate-600',
        indigo: 'bg-indigo-50 text-indigo-600'
    };

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <div className={`scale-150 transform translate-x-1/4 -translate-y-1/4 ${color === 'blue' ? 'text-blue-600' : color === 'pink' ? 'text-pink-600' : color === 'indigo' ? 'text-indigo-600' : 'text-slate-600'}`}>
                    {icon}
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${colorStyles[color]} ring-4 ring-white`}>
                        {icon}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend}
                    </span>
                </div>
                <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-1">{title}</h3>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
        </div>
    );
}
