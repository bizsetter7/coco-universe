'use client';

import { useState, useEffect } from 'react';
import { Save, Search, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import shopsData from '@/lib/data/shops.json';

// Define Interface matching the JSON structure
interface Shop {
    id: string;
    name: string;
    region: string;
    phone: string;
    kakao: string;
    telegram: string;
    pay: string;
    workType: string;
    url: string;
    site: string;
    is_verified?: boolean;
    tier?: 'grand' | 'premium' | 'special' | 'basic'; // New 4-tier system
    expiryDate?: string; // For subscription management
}

export default function AdminPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Load initial data
    useEffect(() => {
        // In a real app we might fetch from API, but here we import directly for initial state
        // and then manage local state.
        // However, since we want to edit the file, we should probably fetch it or just use the imported one 
        // and treat it as initial state.

        // Cast imported data to Shop[] ensuring types
        const initialData = (shopsData as any[]).map(s => ({
            ...s,
            tier: s.tier || (s.is_premium ? 'grand' : 'basic'), // Migrate old data
            is_verified: s.is_verified || false
        }));
        setShops(initialData);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(shops),
            });

            const result = await res.json();
            if (result.success) {
                setMessage({ text: '저장 완료! GitHub Desktop에서 Push해주세요.', type: 'success' });
            } else {
                setMessage({ text: '저장 실패: ' + result.message, type: 'error' });
            }
        } catch (e) {
            setMessage({ text: '오류가 발생했습니다.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateShop = (id: string, field: keyof Shop, value: any) => {
        setShops(prev => prev.map(shop => shop.id === id ? { ...shop, [field]: value } : shop));
    };

    const filteredShops = shops.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm) ||
        s.region.includes(searchTerm)
    );

    // Tier Badge Component
    const TierBadge = ({ tier }: { tier: string }) => {
        switch (tier) {
            case 'grand': return <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-300">Grand</span>;
            case 'premium': return <span className="px-2 py-1 rounded text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">Premium</span>;
            case 'special': return <span className="px-2 py-1 rounded text-xs font-bold bg-pink-100 text-pink-700 border border-pink-300">Special</span>;
            default: return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">Basic</span>;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">👑 사장님 전용 관리자</h1>
                        <p className="text-gray-500">로컬에서 수정하고 저장하면 파일이 업데이트됩니다. 꼭 Push 하세요!</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            <Save size={20} />
                            {isSaving ? '저장 중...' : '변경사항 저장하기'}
                        </button>
                    </div>
                </header>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b flex items-center gap-4 bg-gray-50">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="업소명, 전화번호, 지역 검색..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-gray-500 font-bold">
                            총 {filteredShops.length}개 업소 (전체 {shops.length}개)
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">업소명 / 아이디</th>
                                    <th className="px-6 py-3">연락처 / 지역</th>
                                    <th className="px-6 py-3 text-center">인증(Certified)</th>
                                    <th className="px-6 py-3">광고 등급 (Tier)</th>
                                    <th className="px-6 py-3">급여 정보</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.slice(0, 100).map((shop) => (
                                    <tr key={shop.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <input
                                                type="text"
                                                value={shop.name}
                                                onChange={(e) => updateShop(shop.id, 'name', e.target.value)}
                                                className="border-none bg-transparent focus:ring-1 focus:ring-blue-500 rounded p-1 w-full font-bold"
                                            />
                                            <div className="text-[10px] text-gray-400 mt-1 truncate w-32">{shop.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={shop.phone}
                                                onChange={(e) => updateShop(shop.id, 'phone', e.target.value)}
                                                className="block w-full border-none bg-transparent focus:ring-1 p-1 mb-1"
                                            />
                                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{shop.region}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => updateShop(shop.id, 'is_verified', !shop.is_verified)}
                                                className={`p-2 rounded-full transition-colors ${shop.is_verified ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:bg-gray-100'}`}
                                            >
                                                <ShieldCheck size={20} className={shop.is_verified ? 'fill-blue-100' : ''} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={shop.tier || 'basic'}
                                                onChange={(e) => updateShop(shop.id, 'tier', e.target.value)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            >
                                                <option value="basic">Basic (일반)</option>
                                                <option value="special">Special (핫)</option>
                                                <option value="premium">Premium (프리미엄)</option>
                                                <option value="grand">Grand (그랜드)</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {shop.pay}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredShops.length > 100 && (
                        <div className="p-4 text-center text-gray-500 border-t bg-gray-50">
                            ... 외 {filteredShops.length - 100}개 항목 (검색하여 확인하세요)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
