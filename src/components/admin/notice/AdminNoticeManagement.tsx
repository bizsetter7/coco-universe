'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Pin, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useBrand } from '@/components/BrandProvider';

interface Notice {
    id: number;
    badge: string;
    title: string;
    content: string;
    platforms: string[];
    is_pinned: boolean;
    is_published: boolean;
    published_at: string;
    expires_at: string | null;
    created_at: string;
}

const BADGE_OPTS = ['공지', '중요', '안내', '점검'];
const ALL_PLATFORMS = ['cocoalba', 'waiterzone', 'sunsuzone', 'yasajang', 'bamgil'];

const emptyForm = {
    badge: '공지',
    title: '',
    content: '',
    platforms: ALL_PLATFORMS,
    is_pinned: false,
    is_published: true,
    expires_at: '',
};

async function getToken() {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.session?.access_token) return refreshed.session.access_token;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
}

export function AdminNoticeManagement() {
    const brand = useBrand();
    const isDark = brand.theme === 'dark';
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const res = await fetch('/api/admin/notices', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const { notices: data } = await res.json();
            setNotices(data ?? []);
        } catch {
            setMsg({ type: 'err', text: '목록 조회 실패' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const openNew = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setShowForm(true);
    };

    const openEdit = (n: Notice) => {
        setEditingId(n.id);
        setForm({
            badge: n.badge,
            title: n.title,
            content: n.content,
            platforms: n.platforms ?? ALL_PLATFORMS,
            is_pinned: n.is_pinned,
            is_published: n.is_published,
            expires_at: n.expires_at ? n.expires_at.slice(0, 10) : '',
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.content.trim()) {
            setMsg({ type: 'err', text: '제목과 내용을 입력하세요' });
            return;
        }
        setSaving(true);
        try {
            const token = await getToken();
            const body = {
                ...form,
                expires_at: form.expires_at ? new Date(form.expires_at + 'T23:59:59+09:00').toISOString() : null,
                ...(editingId ? { id: editingId } : {}),
            };
            const res = await fetch('/api/admin/notices', {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setMsg({ type: 'ok', text: editingId ? '공지 수정 완료' : '공지 등록 완료' });
            setShowForm(false);
            fetchNotices();
        } catch (e: any) {
            setMsg({ type: 'err', text: e.message });
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async (n: Notice) => {
        try {
            const token = await getToken();
            await fetch('/api/admin/notices', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id: n.id, is_published: !n.is_published }),
            });
            fetchNotices();
        } catch { setMsg({ type: 'err', text: '상태 변경 실패' }); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('공지를 삭제하시겠습니까?')) return;
        try {
            const token = await getToken();
            await fetch('/api/admin/notices', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ id }),
            });
            fetchNotices();
        } catch { setMsg({ type: 'err', text: '삭제 실패' }); }
    };

    const togglePlatform = (p: string) => {
        setForm(f => ({
            ...f,
            platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
        }));
    };

    const card = `rounded-2xl border p-4 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`;
    const input = `w-full rounded-xl border px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-400 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`;

    return (
        <div className="space-y-4 pb-20">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>공지사항 관리</h2>
                <div className="flex gap-2">
                    <button onClick={fetchNotices} className="p-2 rounded-xl border text-gray-400 hover:text-blue-500 transition-colors">
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-xl font-black text-sm hover:bg-blue-600 transition-colors">
                        <Plus size={16} /> 새 공지
                    </button>
                </div>
            </div>

            {msg && (
                <div className={`p-3 rounded-xl text-sm font-bold ${msg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {msg.text}
                    <button className="ml-3 text-xs opacity-60 hover:opacity-100" onClick={() => setMsg(null)}>닫기</button>
                </div>
            )}

            {/* 작성/수정 폼 */}
            {showForm && (
                <div className={`${card} space-y-4`}>
                    <h3 className={`font-black text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{editingId ? '공지 수정' : '새 공지 작성'}</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-black text-gray-400 mb-1 block">배지</label>
                            <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className={input}>
                                {BADGE_OPTS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 mb-1 block">만료일 (비워두면 무기한)</label>
                            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className={input} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 mb-1 block">제목</label>
                        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="공지 제목" className={input} />
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 mb-1 block">내용</label>
                        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} placeholder="공지 내용 (줄바꿈 지원)" className={`${input} resize-none leading-relaxed`} />
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 mb-2 block">노출 플랫폼</label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_PLATFORMS.map(p => (
                                <button key={p} type="button" onClick={() => togglePlatform(p)}
                                    className={`px-3 py-1 rounded-full text-xs font-black border transition-colors ${form.platforms.includes(p) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-400 border-gray-200'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))} className="rounded" />
                            <span className="text-sm font-bold text-gray-600">상단 고정</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded" />
                            <span className="text-sm font-bold text-gray-600">즉시 게시</span>
                        </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} disabled={saving}
                            className="px-6 py-2 bg-blue-500 text-white font-black text-sm rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors">
                            {saving ? '저장 중...' : editingId ? '수정 저장' : '등록'}
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 text-gray-600 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors">취소</button>
                    </div>
                </div>
            )}

            {/* 목록 */}
            {loading ? (
                <div className="text-center py-10 text-gray-400 font-bold text-sm">불러오는 중...</div>
            ) : notices.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-bold text-sm">등록된 공지가 없습니다</div>
            ) : (
                <div className="space-y-2">
                    {notices.map(n => (
                        <div key={n.id} className={`${card} flex items-start gap-3`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-gray-900 text-white">{n.badge}</span>
                                    {n.is_pinned && <Pin size={12} className="text-blue-500" />}
                                    {!n.is_published && <span className="text-[10px] font-black text-red-400">비공개</span>}
                                    <span className="text-xs text-gray-400 font-bold">{n.published_at?.slice(0, 10)}</span>
                                </div>
                                <p className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                                <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{n.content?.slice(0, 80)}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                    {(n.platforms ?? []).map(p => (
                                        <span key={p} className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-500 border border-blue-100">{p}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => togglePublish(n)} title={n.is_published ? '비공개 전환' : '게시'} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                                    {n.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button onClick={() => openEdit(n)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
