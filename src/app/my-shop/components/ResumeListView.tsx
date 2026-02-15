'use client';

import React, { useState, useEffect } from 'react';
import { Plus, List, Search, MapPin, User, ChevronRight, FileText, Calendar, Trash2 } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';
import { supabase } from '@/lib/supabase';

export const ResumeListView = ({ setView, onShowDetail, authUser }: { setView: (v: any) => void, onShowDetail?: (resume: any) => void, authUser: any }) => {
    const brand = useBrand();
    // [Fix] Removed internal useAuth() to ensure consistency with main page ID
    const [resumes, setResumes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchResumes = async () => {
        if (!authUser?.id || authUser.id === 'guest') {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let dbResumes: any[] = [];

            if (!authUser.id.startsWith('mock_')) {
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

            // [Sync] Ensure IDs are unique and present
            const finalResumes = [...dbResumes, ...mockResumes].map((r, i) => ({
                ...r,
                id: r.id || `mock_${i}_${r.created_at}`
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

    const handleDelete = async (id: any) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        // Try DB delete
        await supabase.from('resumes').delete().eq('id', id);

        // Delete from local
        const mockResumesRaw = localStorage.getItem('coco_mock_resumes');
        if (mockResumesRaw) {
            const mockResumes = JSON.parse(mockResumesRaw);
            const newResumes = mockResumes.filter((r: any) => String(r.id) !== String(id) && String(r.created_at) !== String(id));
            localStorage.setItem('coco_mock_resumes', JSON.stringify(newResumes));
        }

        fetchResumes();
    };

    return (
        <div
            className="space-y-4 animate-in fade-in duration-500"
        >
            <div className={`p-6 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView('dashboard')}
                            className="px-3 py-1.5 bg-white border border-gray-200 hover:border-pink-200 hover:text-pink-500 text-gray-600 rounded-xl text-[11px] font-black transition flex items-center gap-1.5 shadow-sm group"
                        >
                            <ChevronRight size={14} className="rotate-180 text-gray-300 group-hover:text-pink-300" /> 대시보드
                        </button>
                        <h2 className={`text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            나의 이력서 관리
                        </h2>
                    </div>
                    <button
                        onClick={() => setView('resume-form')}
                        className="bg-pink-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-pink-600 transition"
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
                                className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-around group hover:border-pink-200 transition cursor-pointer"
                            >
                                <div className="flex-1 space-y-1">
                                    <h3 className="text-sm md:text-base font-black text-gray-900 group-hover:text-pink-500 transition line-clamp-1">{resume.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <div className={`w-6 h-6 flex items-center justify-center rounded-md text-[13px] font-black shadow-sm shrink-0 ${getPayColor(resume.pay_type)}`}>
                                            {getPayAbbreviation(resume.pay_type)}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <span>{resume.gender}</span>
                                            <span className="w-px h-2 bg-gray-200"></span>
                                            <span>{new Date().getFullYear() - parseInt(resume.birth_date?.split('-')[0] || '2000')}세</span>
                                            <span className="w-px h-2 bg-gray-200"></span>
                                            <span className="text-gray-900">{resume.region_main} {resume.region_sub}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(resume.created_at).toLocaleDateString()}</span>
                                        <span className="w-px h-2 bg-gray-200"></span>
                                        <span>{resume.region_main} {resume.region_sub}</span>
                                        <span className="w-px h-2 bg-gray-200"></span>
                                        <span>{resume.industry_main}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
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
