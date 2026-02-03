'use client';

import { useState, useEffect } from 'react';
import { Save, Search, Check, AlertCircle, ShieldCheck, Zap, Palette, Type, Star, Briefcase } from 'lucide-react';
import shopsData from '@/lib/data/shops.json';

// Define Interface matching the JSON structure with new Option fields
interface Shop {
    id: string;
    name: string; // This is now 'Ad Title' (홍보문구)
    realName?: string; // New: Actual Shop Name (사업자상 업소명)
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
    updatedAt?: string;

    // Upsell Options
    options?: {
        blink?: boolean;    // 반짝이
        bold?: boolean;     // 굵은글씨
        color?: string;     // 글자색
        icons?: string[];   // 아이콘 (급구, 당일지급 등)
    }
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
        const initialData = (shopsData as Shop[]).map(s => ({
            ...s,
            tier: s.tier || ((s as { is_premium?: boolean }).is_premium ? 'grand' : 'basic'),
            is_verified: s.is_verified || false,
            expiryDate: s.expiryDate || '',
            updatedAt: s.updatedAt || new Date().toISOString(),
            options: s.options || { blink: false, bold: false, color: '', icons: [] },
            realName: s.realName || '' // Initialize realName
        }));
        setShops(initialData);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '0000') {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shops),
            });

            const result = await res.json();
            if (result.success) {
                setMessage({ text: '✅ 저장 완료! GitHub Desktop에서 Push하세요.', type: 'success' });
            } else {
                setMessage({ text: '저장 실패: ' + result.message, type: 'error' });
            }
        } catch (e) {
            setMessage({ text: '오류가 발생했습니다.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateShop = (id: string, field: keyof Shop | string, value: string | boolean | string[]) => {
        setShops(prev => prev.map(shop => {
            if (shop.id !== id) return shop;

            // Handle nested options fields
            if (field.startsWith('option_')) {
                const optionKey = field.replace('option_', '');
                return {
                    ...shop,
                    options: {
                        ...shop.options,
                        [optionKey]: value
                    }
                };
            }

            return { ...shop, [field]: value };
        }));
    };

    const handleJump = (id: string) => {
        const now = new Date().toISOString();
        updateShop(id, 'updatedAt', now);
        setMessage({ text: '🚀 점프 완료!', type: 'success' });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <h2 className="text-2xl font-bold mb-6 text-center">🔒 관리자 접속</h2>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="0000" className="w-full p-3 border rounded-lg mb-4" />
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">접속하기</button>
                </form>
            </div>
        )
    }

    const filteredShops = shops.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.realName && s.realName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.phone.includes(searchTerm) ||
        s.region.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-[1800px] mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                            👑 사장님 전용 관리자 <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Local Only</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">실제 업소명과 광고 홍보문구를 구분하여 관리하세요.</p>
                    </div>
                    <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-lg ${isSaving ? 'bg-gray-400' : 'bg-blue-600'}`}>
                        <Save size={20} /> {isSaving ? '저장 중...' : '변경사항 저장하기'}
                    </button>
                </header>

                {message && <div className="p-4 rounded-lg mb-6 bg-green-100 text-green-700 font-bold text-center">{message.text}</div>}

                <div className="bg-white rounded-xl shadow border overflow-hidden">
                    <div className="p-4 border-b bg-gray-50">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="업소명(실제/광고), 전화번호 검색..." className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700 whitespace-nowrap">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 w-[300px]">업소 정보 (실제명 / 광고제목)</th>
                                    <th className="px-6 py-3 w-[150px]">등급 (Tier)</th>
                                    <th className="px-6 py-3 w-[450px]">유료 옵션 설정 (Upselling)</th>
                                    <th className="px-6 py-3">만료일 / 점프</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShops.slice(0, 50).map((shop) => (
                                    <tr key={shop.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {/* Real Shop Name */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <Briefcase size={14} className="text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="실제사업자명 입력"
                                                    value={shop.realName || ''}
                                                    onChange={(e) => updateShop(shop.id, 'realName', e.target.value)}
                                                    className="text-xs border-b border-gray-200 bg-transparent w-full focus:border-blue-500 outline-none text-gray-600"
                                                />
                                            </div>

                                            {/* Ad Title */}
                                            <input
                                                type="text"
                                                value={shop.name}
                                                onChange={(e) => updateShop(shop.id, 'name', e.target.value)}
                                                className="font-bold border rounded px-2 py-1 bg-gray-50 w-full mb-1 focus:bg-white focus:ring-2 ring-blue-100"
                                            />

                                            <div className="flex gap-1 mt-1">
                                                <input type="text" value={shop.phone} onChange={(e) => updateShop(shop.id, 'phone', e.target.value)} className="text-xs border-none bg-gray-50 rounded px-1 w-24" />
                                                <span className="text-xs bg-gray-100 px-1 rounded">{shop.region}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <select value={shop.tier || 'basic'} onChange={(e) => updateShop(shop.id, 'tier', e.target.value)}
                                                className={`border text-sm rounded p-2 font-bold w-full ${shop.tier === 'grand' ? 'bg-amber-100 text-amber-800' : shop.tier === 'premium' ? 'bg-slate-100' : 'bg-white'}`}>
                                                <option value="basic">Basic (일반)</option>
                                                <option value="special">Special (Hot)</option>
                                                <option value="premium">Premium (은)</option>
                                                <option value="grand">Grand (금)</option>
                                            </select>
                                            <label className="flex items-center gap-2 mt-2 text-xs cursor-pointer">
                                                <input type="checkbox" checked={shop.is_verified} onChange={() => updateShop(shop.id, 'is_verified', !shop.is_verified)} />
                                                <ShieldCheck size={14} className="text-blue-500" /> 인증된 업소
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Bold Option */}
                                                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${shop.options?.bold ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200'}`}>
                                                    <input type="checkbox" checked={shop.options?.bold || false} onChange={(e) => updateShop(shop.id, 'option_bold', e.target.checked)} className="hidden" />
                                                    <Type size={16} /> 굵게
                                                </label>

                                                {/* Blink Option */}
                                                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${shop.options?.blink ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white border-gray-200'}`}>
                                                    <input type="checkbox" checked={shop.options?.blink || false} onChange={(e) => updateShop(shop.id, 'option_blink', e.target.checked)} className="hidden" />
                                                    <Zap size={16} /> 반짝이
                                                </label>

                                                {/* Color Option */}
                                                <select value={shop.options?.color || ''} onChange={(e) => updateShop(shop.id, 'option_color', e.target.value)} className="col-span-2 text-xs border p-2 rounded">
                                                    <option value="">글자색 선택 (기본)</option>
                                                    <option value="text-red-600">빨강 (Red)</option>
                                                    <option value="text-blue-600">파랑 (Blue)</option>
                                                    <option value="text-green-600">초록 (Green)</option>
                                                    <option value="text-pink-600">핑크 (Pink)</option>
                                                    <option value="text-purple-600">보라 (Purple)</option>
                                                </select>

                                                {/* Icons Option */}
                                                <div className="col-span-2 flex flex-wrap gap-1 mt-1 p-2 bg-gray-50 rounded border border-dashed">
                                                    <span className="text-[10px] text-gray-400 w-full mb-1">뱃지 선택:</span>
                                                    {['급구', '당일지급', '고수익', '신규', '숙식제공'].map((icon) => (
                                                        <label key={icon} className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer flex items-center gap-1 ${shop.options?.icons?.includes(icon) ? 'bg-blue-100 text-blue-700 border-blue-300 font-bold' : 'bg-white text-gray-500 border-gray-200'}`}>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={shop.options?.icons?.includes(icon) || false}
                                                                onChange={(e) => {
                                                                    const currentIcons = shop.options?.icons || [];
                                                                    const newIcons = e.target.checked
                                                                        ? [...currentIcons, icon]
                                                                        : currentIcons.filter(i => i !== icon);
                                                                    updateShop(shop.id, 'option_icons', newIcons);
                                                                }}
                                                            />
                                                            {icon}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-2">
                                                <input type="date" value={shop.expiryDate || ''} onChange={(e) => updateShop(shop.id, 'expiryDate', e.target.value)} className="text-xs border p-1 rounded" />
                                                <button onClick={() => handleJump(shop.id)} className="bg-indigo-50 text-indigo-600 text-xs py-1 px-2 rounded font-bold hover:bg-indigo-100 border border-indigo-200">
                                                    🚀 JUMP (Update)
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
        </div>
    );
}
