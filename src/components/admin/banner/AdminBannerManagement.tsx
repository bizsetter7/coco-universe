'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ImageIcon, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw,
    Plus, Pencil, Trash2, X, Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BannerShop {
    id: number;
    name: string;
    title: string;
    tier: string;
    banner_image_url: string | null;
    banner_position: string | null;
    banner_media_type: string | null;
    banner_status: string;
    user_id: string;
    updated_at: string;
}

interface ShopSearchResult {
    id: number;
    name: string;
    tier: string;
    status: string;
}

const POSITION_LABEL: Record<string, string> = {
    sidebar_left: '좌측 사이드',
    sidebar_right: '우측 사이드',
    both: '좌우 사이드 (양쪽)',
    inner_top: '내부 상단',
    inner_bottom: '내부 하단',
};

const POSITIONS = Object.entries(POSITION_LABEL);

async function callApi(token: string | undefined, body: Record<string, unknown>) {
    const res = await fetch('/api/admin/banner-approve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '처리 실패');
    }
    return res.json();
}

export function AdminBannerManagement() {
    const [pending, setPending] = useState<BannerShop[]>([]);
    const [approved, setApproved] = useState<BannerShop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);
    const [view, setView] = useState<'pending' | 'approved'>('pending');

    // 반려 상태
    const [rejectTarget, setRejectTarget] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // 수정 모달
    const [editModal, setEditModal] = useState<{
        shop: BannerShop;
        imageUrl: string;
        position: string;
        mediaType: string;
    } | null>(null);

    // 직접 등록 모달
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        shopId: '',
        imageUrl: '',
        position: 'both',
        mediaType: 'image',
    });
    const [shopQuery, setShopQuery] = useState('');
    const [shopResults, setShopResults] = useState<ShopSearchResult[]>([]);
    const [shopSearching, setShopSearching] = useState(false);

    const fetchBanners = useCallback(async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('shops')
            .select('id, name, title, tier, banner_image_url, banner_position, banner_media_type, banner_status, user_id, updated_at')
            .in('banner_status', ['pending_banner', 'approved_banner'])
            .order('updated_at', { ascending: false });

        if (data) {
            setPending(data.filter(s => s.banner_status === 'pending_banner') as BannerShop[]);
            setApproved(data.filter(s => s.banner_status === 'approved_banner') as BannerShop[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchBanners(); }, [fetchBanners]);

    const getToken = async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token;
    };

    const handleAction = async (shopId: number, action: 'approve' | 'reject') => {
        if (action === 'reject' && rejectTarget !== shopId) {
            setRejectTarget(shopId);
            return;
        }
        setProcessing(shopId);
        try {
            const token = await getToken();
            await callApi(token, { adId: String(shopId), action, rejectReason: action === 'reject' ? rejectReason : undefined });
            setRejectTarget(null);
            setRejectReason('');
            fetchBanners();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setProcessing(null);
        }
    };

    const handleRevoke = async (shopId: number) => {
        if (!confirm('이 배너를 게시 취소하시겠습니까? 배너 이미지가 삭제됩니다.')) return;
        setProcessing(shopId);
        try {
            const token = await getToken();
            await callApi(token, { adId: String(shopId), action: 'revoke' });
            fetchBanners();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setProcessing(null);
        }
    };

    const handleEdit = async () => {
        if (!editModal) return;
        setProcessing(editModal.shop.id);
        try {
            const token = await getToken();
            await callApi(token, {
                adId: String(editModal.shop.id),
                action: 'update',
                banner_image_url: editModal.imageUrl || null,
                banner_position: editModal.position,
                banner_media_type: editModal.mediaType,
            });
            setEditModal(null);
            fetchBanners();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setProcessing(null);
        }
    };

    const searchShops = async () => {
        if (!shopQuery.trim()) return;
        setShopSearching(true);
        const { data } = await supabase
            .from('shops')
            .select('id, name, tier, status')
            .ilike('name', `%${shopQuery.trim()}%`)
            .eq('status', 'active')
            .limit(10);
        setShopResults((data || []) as ShopSearchResult[]);
        setShopSearching(false);
    };

    const handleCreate = async () => {
        if (!createForm.shopId || !createForm.imageUrl || !createForm.position) {
            alert('업소, 이미지 URL, 위치는 필수입니다.');
            return;
        }
        setProcessing(-1);
        try {
            const token = await getToken();
            await callApi(token, {
                adId: createForm.shopId,
                action: 'create',
                banner_image_url: createForm.imageUrl,
                banner_position: createForm.position,
                banner_media_type: createForm.mediaType,
            });
            setCreateOpen(false);
            setCreateForm({ shopId: '', imageUrl: '', position: 'both', mediaType: 'image' });
            setShopQuery('');
            setShopResults([]);
            fetchBanners();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setProcessing(null);
        }
    };

    const list = view === 'pending' ? pending : approved;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <ImageIcon size={22} className="text-amber-500" />
                        배너 심사 관리
                    </h2>
                    <p className="text-sm text-slate-400 mt-0.5">배너 이미지를 심사하고 승인/반려/수정/삭제합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-500 transition"
                    >
                        <Plus size={14} /> 직접 등록
                    </button>
                    <button
                        onClick={fetchBanners}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50 transition"
                    >
                        <RefreshCw size={14} /> 새로고침
                    </button>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setView('pending')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${view === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <Clock size={14} />
                    심사 대기
                    {pending.length > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black ${view === 'pending' ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'}`}>
                            {pending.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setView('approved')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${view === 'approved' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                    <CheckCircle size={14} />
                    승인됨
                    {approved.length > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black ${view === 'approved' ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'}`}>
                            {approved.length}
                        </span>
                    )}
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-center py-20 text-slate-400 font-bold">로딩 중...</div>
            ) : list.length === 0 ? (
                <div className="text-center py-20">
                    <ImageIcon size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-black">
                        {view === 'pending' ? '심사 대기 중인 배너가 없습니다.' : '승인된 배너가 없습니다.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {list.map(shop => (
                        <div key={shop.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Banner Image Preview */}
                            <div className="relative w-full h-40 bg-slate-100">
                                {shop.banner_image_url ? (
                                    shop.banner_media_type === 'video' ? (
                                        <video src={shop.banner_image_url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={shop.banner_image_url} alt={shop.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={40} />
                                    </div>
                                )}
                                <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${shop.banner_status === 'pending_banner' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                    {shop.banner_status === 'pending_banner' ? '심사중' : '게시중'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <p className="font-black text-slate-900 text-sm truncate">{shop.name || shop.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold">ID: {shop.id}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {shop.banner_position && (
                                        <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                            {POSITION_LABEL[shop.banner_position] || shop.banner_position}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                                        {shop.tier}
                                    </span>
                                    {shop.banner_media_type === 'video' && (
                                        <span className="text-[10px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">VIDEO</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    업데이트: {new Date(shop.updated_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {shop.banner_image_url && (
                                    <a href={shop.banner_image_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-black text-blue-500 hover:underline mt-1">
                                        <ExternalLink size={10} /> 원본 이미지 보기
                                    </a>
                                )}

                                {/* Reject reason input */}
                                {rejectTarget === shop.id && (
                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)}
                                            placeholder="반려 사유 입력 (선택)"
                                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-300"
                                        />
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {view === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleAction(shop.id, 'approve')}
                                                disabled={processing === shop.id}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 transition disabled:opacity-50"
                                            >
                                                <CheckCircle size={13} />
                                                {processing === shop.id ? '처리중...' : '승인'}
                                            </button>
                                            <button
                                                onClick={() => rejectTarget === shop.id ? handleAction(shop.id, 'reject') : setRejectTarget(shop.id)}
                                                disabled={processing === shop.id}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-400 transition disabled:opacity-50"
                                            >
                                                <XCircle size={13} />
                                                {rejectTarget === shop.id ? '반려 확인' : '반려'}
                                            </button>
                                        </>
                                    )}
                                    {/* 수정 버튼 (pending/approved 공통) */}
                                    <button
                                        onClick={() => setEditModal({ shop, imageUrl: shop.banner_image_url || '', position: shop.banner_position || 'both', mediaType: shop.banner_media_type || 'image' })}
                                        disabled={processing === shop.id}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition disabled:opacity-50"
                                    >
                                        <Pencil size={12} /> 수정
                                    </button>
                                    {/* 게시 취소 (approved만) */}
                                    {view === 'approved' && (
                                        <button
                                            onClick={() => handleRevoke(shop.id)}
                                            disabled={processing === shop.id}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-black hover:bg-rose-100 transition disabled:opacity-50"
                                        >
                                            <Trash2 size={12} /> 게시 취소
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── 수정 모달 ── */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-slate-900">배너 수정 — {editModal.shop.name}</h3>
                            <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-slate-700">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-600 mb-1 block">이미지 URL</label>
                                <input
                                    type="text"
                                    value={editModal.imageUrl}
                                    onChange={e => setEditModal(m => m ? { ...m, imageUrl: e.target.value } : m)}
                                    placeholder="https://..."
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-600 mb-1 block">노출 위치</label>
                                <select
                                    value={editModal.position}
                                    onChange={e => setEditModal(m => m ? { ...m, position: e.target.value } : m)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    {POSITIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-600 mb-1 block">미디어 타입</label>
                                <select
                                    value={editModal.mediaType}
                                    onChange={e => setEditModal(m => m ? { ...m, mediaType: e.target.value } : m)}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="image">이미지</option>
                                    <option value="video">비디오</option>
                                </select>
                            </div>
                            {editModal.imageUrl && (
                                <div className="rounded-xl overflow-hidden h-28 bg-slate-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={editModal.imageUrl} alt="미리보기" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50 transition">취소</button>
                            <button
                                onClick={handleEdit}
                                disabled={processing === editModal.shop.id}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-500 transition disabled:opacity-50"
                            >
                                {processing === editModal.shop.id ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 직접 등록 모달 ── */}
            {createOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-slate-900">배너 직접 등록</h3>
                            <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Shop 검색 */}
                            <div>
                                <label className="text-xs font-black text-slate-600 mb-1 block">업소 검색</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shopQuery}
                                        onChange={e => setShopQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && searchShops()}
                                        placeholder="업소명 입력..."
                                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                    <button onClick={searchShops} disabled={shopSearching} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-500 transition disabled:opacity-50">
                                        <Search size={14} />
                                    </button>
                                </div>
                                {shopResults.length > 0 && (
                                    <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
                                        {shopResults.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => {
                                                    setCreateForm(f => ({ ...f, shopId: String(s.id) }));
                                                    setShopQuery(s.name);
                                                    setShopResults([]);
                                                }}
                                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-50 text-left transition border-b border-slate-100 last:border-0"
                                            >
                                                <span className="text-sm font-black text-slate-800">{s.name}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full uppercase">{s.tier}</span>
                                                    <span className="text-[10px] text-slate-400">ID: {s.id}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {createForm.shopId && (
                                    <p className="text-[11px] text-emerald-600 font-black mt-1">✓ 선택됨 (ID: {createForm.shopId})</p>
                                )}
                            </div>
                            {/* 이미지 URL */}
                            <div>
                                <label className="text-xs font-black text-slate-600 mb-1 block">이미지 URL</label>
                                <input
                                    type="text"
                                    value={createForm.imageUrl}
                                    onChange={e => setCreateForm(f => ({ ...f, imageUrl: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                            {/* 위치 */}
                            <div>
                                <label className="text-xs font-black text-slate-600 mb-1 block">노출 위치</label>
                                <select
                                    value={createForm.position}
                                    onChange={e => setCreateForm(f => ({ ...f, position: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    {POSITIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                                </select>
                            </div>
                            {/* 미디어 타입 */}
                            <div>
                                <label className="text-xs font-black text-slate-600 mb-1 block">미디어 타입</label>
                                <select
                                    value={createForm.mediaType}
                                    onChange={e => setCreateForm(f => ({ ...f, mediaType: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <option value="image">이미지</option>
                                    <option value="video">비디오</option>
                                </select>
                            </div>
                            {/* 미리보기 */}
                            {createForm.imageUrl && (
                                <div className="rounded-xl overflow-hidden h-28 bg-slate-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={createForm.imageUrl} alt="미리보기" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => setCreateOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50 transition">취소</button>
                            <button
                                onClick={handleCreate}
                                disabled={processing === -1}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-500 transition disabled:opacity-50"
                            >
                                {processing === -1 ? '등록 중...' : '즉시 등록 (자동 승인)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
