'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ImageIcon, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PendingBannerShop {
    id: number;
    name: string;
    title: string;
    tier: string;
    banner_image_url: string;
    banner_position: string;
    banner_media_type: string;
    banner_status: string;
    user_id: string;
    updated_at: string;
}

const POSITION_LABEL: Record<string, string> = {
    sidebar_left: '좌측 사이드',
    sidebar_right: '우측 사이드',
    both: '좌우 사이드 (양쪽)',
    inner_top: '내부 상단',
    inner_bottom: '내부 하단',
};

export function AdminBannerManagement() {
    const [pending, setPending] = useState<PendingBannerShop[]>([]);
    const [approved, setApproved] = useState<PendingBannerShop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectTarget, setRejectTarget] = useState<number | null>(null);
    const [view, setView] = useState<'pending' | 'approved'>('pending');

    const fetchBanners = useCallback(async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('shops')
            .select('id, name, title, tier, banner_image_url, banner_position, banner_media_type, banner_status, user_id, updated_at')
            .in('banner_status', ['pending_banner', 'approved_banner'])
            .order('updated_at', { ascending: false });

        if (data) {
            setPending(data.filter(s => s.banner_status === 'pending_banner') as PendingBannerShop[]);
            setApproved(data.filter(s => s.banner_status === 'approved_banner') as PendingBannerShop[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchBanners(); }, [fetchBanners]);

    const handleAction = async (shopId: number, action: 'approve' | 'reject') => {
        if (action === 'reject' && rejectTarget !== shopId) {
            setRejectTarget(shopId);
            return;
        }

        setProcessing(shopId);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;
            const res = await fetch('/api/admin/banner-approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    adId: String(shopId),
                    action,
                    rejectReason: action === 'reject' ? rejectReason : undefined,
                }),
            });
            if (res.ok) {
                setRejectTarget(null);
                setRejectReason('');
                fetchBanners();
            } else {
                const err = await res.json();
                alert(`처리 실패: ${err.error || '알 수 없는 오류'}`);
            }
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
                    <p className="text-sm text-slate-400 mt-0.5">사장님이 신청한 배너 이미지를 심사하고 승인/반려합니다.</p>
                </div>
                <button
                    onClick={fetchBanners}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50 transition"
                >
                    <RefreshCw size={14} /> 새로고침
                </button>
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
                                {shop.banner_media_type === 'video' ? (
                                    <video
                                        src={shop.banner_image_url}
                                        className="w-full h-full object-cover"
                                        muted autoPlay loop playsInline
                                    />
                                ) : (
                                    <img
                                        src={shop.banner_image_url}
                                        alt={shop.name}
                                        className="w-full h-full object-cover"
                                        onError={e => { (e.target as HTMLImageElement).src = ''; }}
                                    />
                                )}
                                {/* Status badge */}
                                <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${shop.banner_status === 'pending_banner' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                    {shop.banner_status === 'pending_banner' ? '심사중' : '게시중'}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <p className="font-black text-slate-900 text-sm truncate">{shop.name || shop.title}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                        {POSITION_LABEL[shop.banner_position] || shop.banner_position}
                                    </span>
                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase">
                                        {shop.tier}
                                    </span>
                                    {shop.banner_media_type === 'video' && (
                                        <span className="text-[10px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">VIDEO</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    신청: {new Date(shop.updated_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>

                                {/* Image full-size link */}
                                <a
                                    href={shop.banner_image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-black text-blue-500 hover:underline mt-1"
                                >
                                    <ExternalLink size={10} /> 원본 이미지 보기
                                </a>

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
                                {view === 'pending' && (
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleAction(shop.id, 'approve')}
                                            disabled={processing === shop.id}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 transition disabled:opacity-50"
                                        >
                                            <CheckCircle size={13} />
                                            {processing === shop.id ? '처리중...' : '승인'}
                                        </button>
                                        <button
                                            onClick={() => rejectTarget === shop.id
                                                ? handleAction(shop.id, 'reject')
                                                : setRejectTarget(shop.id)
                                            }
                                            disabled={processing === shop.id}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-400 transition disabled:opacity-50"
                                        >
                                            <XCircle size={13} />
                                            {rejectTarget === shop.id ? '반려 확인' : '반려'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
