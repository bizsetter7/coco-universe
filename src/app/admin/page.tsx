'use client';

import React, { useState, useEffect } from 'react';
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
    Palette,
    Zap,
    Rainbow,
    Smartphone
} from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { Shop } from '@/types/shop';
import shopsData from '@/lib/data/shops.json';
import { useAuth } from '@/hooks/useAuth';

/**
 * 👩‍💻 Admin Dashboard
 * 사장님의 든든한 운영 도구 - 광고 심사 및 효과 원클릭 적용
 */
export default function AdminPage() {
    const brand = useBrand();
    const router = useRouter();
    const { isLoggedIn, user } = useAuth();
    const [shops, setShops] = useState<Shop[]>([]);
    const [activeTab, setActiveTab] = useState<'ads' | 'stats' | 'users'>('ads');
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // 관리자 권한 체크 (데모용: 로컬 스토리지 또는 mock 데이터 기반)
        const checkAuth = () => {
            // 잠시 딜레이를 주어 useAuth가 초기화될 시간을 줍니다.
            // 실제 프로덕션에서는 서버 사이드 체크나 미들웨어를 권장합니다.
            if (!isLoggedIn || user.type !== 'admin') {
                // 개발 편의성을 위해 로컬스토리지 직접 체크도 병행 (useAuth 업데이트 딜레이 방지)
                const localType = localStorage.getItem('user_type');
                if (localType !== 'admin') {
                    alert('관리자 권한이 필요합니다.');
                    router.push('/');
                    return;
                }
            }
            setIsAuthorized(true);
        };

        const timer = setTimeout(checkAuth, 100);
        return () => clearTimeout(timer);
    }, [isLoggedIn, user, router]);

    useEffect(() => {
        // 실제 운영 시에는 API에서 호출하겠지만, 현재는 로컬 데이터를 불러옵니다.
        setShops((shopsData as Shop[]).slice(0, 50));
    }, []);

    // 광고 효과 적용 핸들러
    const toggleEffect = (id: string, effect: string) => {
        setShops(prev => prev.map(shop => {
            if (shop.id === id) {
                let newTitle = shop.title || shop.name;
                const tag = `[${effect}]`;

                if (newTitle.includes(tag)) {
                    newTitle = newTitle.replace(tag, '').trim();
                } else {
                    newTitle = `${tag} ${newTitle}`;
                }
                return { ...shop, title: newTitle };
            }
            return shop;
        }));
        // TODO: 실제 서버 저장 로직
        alert(`광고 효과 '${effect}'가 적용/해제 되었습니다!`);
    };

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-black text-pink-400">COCO ADMIN</h1>
                    <p className="text-[10px] text-slate-400 mt-1">Management System v1.0</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="대시보드" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <NavItem icon={<Zap size={20} />} label="광고 심사 관리" active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} />
                    <NavItem icon={<Users size={20} />} label="회원 관리" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <NavItem icon={<Settings size={20} />} label="시스템 설정" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">광고 심사 관리 ⚡️</h2>
                        <p className="text-gray-500 mt-2">기업 회원이 신청한 광고를 검토하고 화려한 효과를 즉시 입히세요.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold">심사 완료</p>
                                <p className="text-xl font-black text-gray-900">1,248건</p>
                            </div>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold">대기 중</p>
                                <p className="text-xl font-black text-gray-900">12건</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Ads Table */}
                <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">상점 정보</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">지역/급여</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">신청 옵션 (유료)</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none text-right">관리 액션</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {shops.slice(0, 10).map((shop) => (
                                <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                {shop.options?.mediaUrl ? (
                                                    <img src={shop.options.mediaUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Eye size={20} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{shop.name}</p>
                                                <p className="font-bold text-pink-500 text-[11px] mt-1 line-clamp-1">{shop.title || shop.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-bold text-gray-500">{shop.region}</p>
                                        <p className="text-sm font-black text-blue-600 mt-1">{shop.pay}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => toggleEffect(shop.id, '네온')}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${shop.title?.includes('[네온]') ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-200' : 'bg-gray-100 text-gray-400 hover:bg-cyan-50'}`}
                                            >
                                                NEON
                                            </button>
                                            <button
                                                onClick={() => toggleEffect(shop.id, '무지개')}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${shop.title?.includes('[무지개]') ? 'bg-purple-500 text-white shadow-lg shadow-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-purple-50'}`}
                                            >
                                                RAINBOW
                                            </button>
                                            <button
                                                onClick={() => toggleEffect(shop.id, '반짝')}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${shop.title?.includes('[반짝]') ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-gray-100 text-gray-400 hover:bg-amber-50'}`}
                                            >
                                                GLITTER
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors" title="심사 승인">
                                                <CheckCircle2 size={20} />
                                            </button>
                                            <button className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="거절/반려">
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
