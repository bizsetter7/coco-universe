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
    tier?: 'grand' | 'premium' | 'special' | 'basic';
    expiryDate?: string;
    updatedAt?: string; // For Jump feature
}

export default function AdminPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    // Load initial data
    useEffect(() => {
        const initialData = (shopsData as any[]).map(s => ({
            ...s,
            tier: s.tier || (s.is_premium ? 'grand' : 'basic'),
            is_verified: s.is_verified || false,
            expiryDate: s.expiryDate || '',
            updatedAt: s.updatedAt || new Date().toISOString(),
        }));
        setShops(initialData);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '0000') { // Simple PIN for local use
            setIsAuthenticated(true);
        } else {
            alert('비밀번호가 틀렸습니다. (초기값: 0000)');
        }
    };

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
                setMessage({ text: '✅ 저장 완료! 이제 GitHub Desktop을 열어 "Commit" & "Push" 하세요.', type: 'success' });
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

    const handleJump = (id: string) => {
        const now = new Date().toISOString();
        updateShop(id, 'updatedAt', now);
        setMessage({ text: '🚀 점프 완료! 저장 시 상단으로 올라갑니다.', type: 'success' });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <h2 className="text-2xl font-bold mb-6 text-center">🔒 관리자 접속</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="비밀번호 (0000)"
                        className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                        접속하기
                    </button>
                </form>
            </div>
        )
    }

    const filteredShops = shops.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm) ||
        s.region.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                            👑 사장님 전용 관리자
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">Local Only</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            ⚠️ 주의: 여기서 저장 후 반드시 <strong className="text-blue-600">GitHub Desktop에서 Push</strong>해야 실서버에 반영됩니다.
                        </p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            <Save size={20} />
                            {isSaving ? '저장 중...' : '변경사항 저장하기'}
                        </button>
                    </div>
                </header>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b flex flex-col md:flex-row items-center gap-4 bg-gray-50">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="업소명, 전화번호, 지역 검색..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-gray-500 font-bold whitespace-nowrap">
                            총 {filteredShops.length}개 업소
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 w-40">업소명 / 점프</th>
                                    <th className="px-6 py-3 w-40">연락처 / 지역</th>
                                    <th className="px-6 py-3 text-center w-20">인증</th>
                                    <th className="px-6 py-3 w-40">광고 등급 (Tier)</th>
                                    <th className="px-6 py-3 w-40">만료일 (Expiry)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.slice(0, 50).map((shop) => (
                                    <tr key={shop.id} className={`bg-white border-b hover:bg-gray-50 ${shop.tier === 'grand' ? 'bg-amber-50/50' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <input
                                                type="text"
                                                value={shop.name}
                                                onChange={(e) => updateShop(shop.id, 'name', e.target.value)}
                                                className="border-none bg-transparent focus:ring-1 focus:ring-blue-500 rounded p-1 w-full font-bold mb-1"
                                            />
                                            <button
                                                onClick={() => handleJump(shop.id)}
                                                className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold hover:bg-indigo-200 transition"
                                            >
                                                🚀 JUMP
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={shop.phone}
                                                onChange={(e) => updateShop(shop.id, 'phone', e.target.value)}
                                                className="block w-full border-none bg-transparent focus:ring-1 p-1 mb-1 text-xs"
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
                                                className={`border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 font-bold ${shop.tier === 'grand' ? 'bg-amber-100 border-amber-300 text-amber-800' :
                                                        shop.tier === 'premium' ? 'bg-slate-100 border-slate-300 text-slate-800' :
                                                            shop.tier === 'special' ? 'bg-pink-50 border-pink-200 text-pink-700' :
                                                                'bg-white border-gray-300'
                                                    }`}
                                            >
                                                <option value="basic">Basic (일반)</option>
                                                <option value="special">Special (핫)</option>
                                                <option value="premium">Premium (은)</option>
                                                <option value="grand">Grand (금)</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="date"
                                                value={shop.expiryDate || ''}
                                                onChange={(e) => updateShop(shop.id, 'expiryDate', e.target.value)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredShops.length > 50 && (
                        <div className="p-4 text-center text-gray-500 border-t bg-gray-50">
                            ... 외 {filteredShops.length - 50}개 항목 (검색하여 확인하세요)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
