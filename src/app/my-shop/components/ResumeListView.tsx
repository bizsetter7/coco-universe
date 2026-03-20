'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Trash2, Briefcase, User, MapPin, Sparkles } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';
import { supabase } from '@/lib/supabase';
import { updatePoints, getUserPoints } from '@/lib/points';

export const ResumeListView = ({ setView, onShowDetail, authUser }: { setView: (v: any) => void, onShowDetail?: (resume: any) => void, authUser: any }) => {
    const brand = useBrand();
    // [Fix] Removed internal useAuth() to ensure consistency with main page ID
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResumes = async () => {
        setLoading(true);
        try {
            let dbResumes: any[] = [];
            const userId = authUser?.id || 'guest';

            if (userId !== 'guest' && !userId.startsWith('mock_')) {
                const { data, error } = await supabase
                    .from('resumes')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false });

                if (!error) dbResumes = data || [];
            }

            // Merge with local storage (mock data)
            const mockResumesRaw = localStorage.getItem('coco_mock_resumes');
            const mockResumes = mockResumesRaw ? JSON.parse(mockResumesRaw) : [];

            // [Sync] Ensure IDs are stable (created_at is used for mocks)
            const finalResumes = [...dbResumes, ...mockResumes].map((r) => ({
                ...r,
                id: r.id || r.created_at || `mock_${Math.random()}`
            }));

            setResumes(finalResumes);
        } catch (err) {
            console.error("Fetch resumes error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
        window.addEventListener('resume-updated', fetchResumes);
        return () => window.removeEventListener('resume-updated', fetchResumes);
    }, []);

    const handleJump = async (resume: any) => {
        if (!confirm('500 크레딧을 사용하여 이력서를 최상단으로 올리시겠습니까?')) return;

        const userId = authUser?.id;
        if (!userId || userId.startsWith('mock_')) return alert('로그인이 필요한 기능입니다.');

        const currentCredit = await getUserPoints(userId);
        if (currentCredit < 500) {
            return alert('크레딧이 부족합니다. 파트너스 활동을 통해 크레딧을 충전해 주세요!');
        }

        try {
            // 1. Credit Deduction
            const res = await updatePoints(userId, 'RESUME_JUMP');
            if (!res.success) throw new Error('Credit update failed');

            // 2. Update resume created_at to now
            const { error: jumpError } = await supabase
                .from('resumes')
                .update({ created_at: new Date().toISOString() })
                .eq('id', resume.id);

            if (jumpError) throw jumpError;

            alert('이력서가 최상단으로 노출되었습니다! ✨');
            fetchResumes();

            // Refresh Header Credit (Global event)
            window.dispatchEvent(new Event('credit-updated'));
        } catch (err) {
            console.error('Jump failed:', err);
            alert('점프 처리 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (id: any) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const isMockId = String(id).startsWith('mock_') || !isNaN(Number(id));

        try {
            if (!isMockId) {
                // Only try DB delete for real UUIDs
                await supabase.from('resumes').delete().eq('id', id);
            }

            // Always check and delete from local storage as well
            const mockResumesRaw = localStorage.getItem('coco_mock_resumes');
            if (mockResumesRaw) {
                const mockResumes = JSON.parse(mockResumesRaw);
                const newResumes = mockResumes.filter((r: any) =>
                    String(r.id) !== String(id) &&
                    String(r.created_at) !== String(id)
                );
                localStorage.setItem('coco_mock_resumes', JSON.stringify(newResumes));
            }

            alert('이력서가 삭제되었습니다.');
            fetchResumes();
        } catch (err) {
            console.error("Delete error:", err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div
            className="space-y-4 animate-in fade-in duration-500"
        >
            <div className={`p-6 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className={`text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            나의 이력서 관리
                        </h2>
                    </div>
                    <button
                        onClick={() => setView('resume-form')}
                        className="bg-[#f82b60] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-[#db2456] transition"
                    >
                        + 새 이력서 작성
                    </button>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-gray-400 font-bold">로딩 중...</div>
                ) : resumes.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <FileText size={48} className="mx-auto opacity-20" />
                        <p className="text-gray-400 font-bold">등록된 이력서가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {resumes.map((resume, idx) => (
                            <div
                                key={idx}
                                onClick={() => onShowDetail?.(resume)}
                                className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-around group hover:border-blue-200 transition cursor-pointer"
                            >
                                <div className="flex-1 space-y-1">
                                    <h3 className="text-sm md:text-base font-black text-gray-900 group-hover:text-blue-500 transition line-clamp-1">{resume.title}</h3>
                                    <div className="flex flex-col gap-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`px-2 h-6 flex items-center justify-center rounded-md text-[13px] font-black shadow-sm shrink-0 ${getPayColor(resume.pay_type || '협의')}`}>
                                                {getPayAbbreviation(resume.pay_type || '협의')}
                                            </div>
                                            <span className="text-blue-600 font-black text-sm">
                                                {(resume.pay_amount && Number(resume.pay_amount) > 0) ? `${Number(resume.pay_amount).toLocaleString()}원` : '급여협의'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 pl-1">
                                            <span>{resume.gender}</span>
                                            <span className="w-px h-2 bg-gray-200"></span>
                                            <span>{new Date().getFullYear() - parseInt(resume.birth_date?.split('-')[0] || '2000')}세</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 text-[11px] font-bold text-gray-400">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Calendar size={12} className="text-blue-400" />
                                            <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-blue-500">
                                            <MapPin size={12} />
                                            <span>{resume.region_main} {resume.region_sub}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-purple-500">
                                            <Briefcase size={12} />
                                            <span>{resume.industry_main} &gt; {resume.industry_sub}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleJump(resume);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-[10px] font-black shadow-sm hover:scale-105 transition-all"
                                        title="상단으로 점프 (500C)"
                                    >
                                        <Sparkles size={12} />
                                        점프
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setView({ id: 'resume-form', data: resume });
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-500 font-bold text-xs"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(resume.id || resume.created_at);
                                        }}
                                        className="p-2 text-gray-300 hover:text-red-500 transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
