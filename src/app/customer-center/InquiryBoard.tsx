'use client';

import React from 'react';
import { Megaphone, Paperclip, Lock, ShieldCheck, UserCheck, MessageSquare, PenBox, List, Search, RefreshCw, ChevronLeft, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InquiryBoardProps {
    inquiryMode: 'list' | 'write' | 'detail';
    setInquiryMode: (mode: 'list' | 'write' | 'detail') => void;
    inquiries: any[];
    totalCount: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    searchType: string;
    setSearchType: (t: string) => void;
    handleSearch: () => void;
    isSearching: boolean;
    viewingInquiry: any;
    setViewingInquiry: (inq: any) => void;
    inquiryThread: any[];
    setInquiryThread: (thread: any[]) => void;
    isPasswordVerified: boolean;
    setIsPasswordVerified: (v: boolean) => void;
    passwordInput: string;
    setPasswordInput: (p: string) => void;
    inquiryTitle: string;
    setInquiryTitle: (t: string) => void;
    inquiryContent: string;
    setInquiryContent: (c: string) => void;
    inquiryContact: string;
    setInquiryContact: (c: string) => void;
    isSecretInquiry: boolean;
    setIsSecretInquiry: (s: boolean) => void;
    isInquirySubmitting: boolean;
    handleSubmitInquiry: () => void;
    handleSubmitComment: () => void;
    isAdmin: boolean;
    brand: { theme: string };
    isLoggedIn: boolean;
    contentPlaceholder: string;
}

export const InquiryBoard = (props: InquiryBoardProps) => {
    const {
        inquiryMode, setInquiryMode, inquiries, totalCount, currentPage, setCurrentPage,
        itemsPerPage, searchQuery, setSearchQuery, searchType, setSearchType, handleSearch,
        isSearching, viewingInquiry, setViewingInquiry, inquiryThread, setInquiryThread,
        isPasswordVerified, setIsPasswordVerified, passwordInput, setPasswordInput,
        inquiryTitle, setInquiryTitle, inquiryContent, setInquiryContent,
        inquiryContact, setInquiryContact, isSecretInquiry, setIsSecretInquiry,
        isInquirySubmitting, handleSubmitInquiry, handleSubmitComment,
        isAdmin, brand, isLoggedIn, contentPlaceholder
    } = props;

    // Helper for determining canBypass (Moved out of individual render for diet)
    const canViewSecret = isAdmin;

    return (
        <div className="space-y-6">
            {inquiryMode === 'list' && (
                <div className="space-y-6 px-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h4 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{searchQuery ? '검색 결과' : '1:1 맞춤 상담 내역'} <span className="text-pink-600 ml-1">{totalCount}</span></h4>
                        </div>
                        <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                            <button onClick={() => setInquiryMode('write')} className="px-5 py-3 bg-gray-900 text-white rounded-xl text-[13px] font-black hover:bg-black transition shadow-lg flex items-center gap-1.5"><PenBox size={16} /> 글쓰기</button>
                            <button onClick={() => { setSearchQuery(''); handleSearch(); }} className="px-5 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl text-[13px] font-black hover:bg-gray-50 transition shadow-sm flex items-center gap-1.5"><List size={16} /> 글목록</button>
                        </div>
                    </div>

                    <div className={`rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="overflow-hidden p-0 md:p-1">
                            <table className="w-full text-left table-fixed border-collapse">
                                <thead>
                                    <tr className={`border-b text-[8.5px] md:text-[10px] font-black uppercase tracking-[0.05em] ${brand.theme === 'dark' ? 'bg-gray-700/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                        <th className="px-1 py-2 w-8 md:w-16 text-center">번호</th>
                                        <th className="px-2 py-2">제목</th>
                                        <th className="px-1 py-2 w-14 md:w-28 text-center">등록인</th>
                                        <th className="px-1 py-2 w-14 md:w-32 text-center">등록일</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-700' : 'divide-gray-50'}`}>
                                    {inquiries.length > 0 ? inquiries.map((inq, idx) => (
                                        <tr key={inq.id} onClick={() => {
                                            setViewingInquiry(inq);
                                            setInquiryMode('detail');
                                            if (inq.is_secret && !canViewSecret) {
                                                setIsPasswordVerified(false);
                                            } else {
                                                setIsPasswordVerified(true);
                                            }
                                        }} className={`cursor-pointer border-b last:border-0 transition-colors ${brand.theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-pink-50/30'}`}>
                                            <td className="px-1 py-1.5 md:py-3.5 text-center text-[9px] md:text-[10px] font-bold text-gray-400 italic">
                                                {inq.type === '공지' ? <Megaphone size={11} className="text-pink-600 mx-auto" /> : (totalCount - ((currentPage - 1) * itemsPerPage + idx))}
                                            </td>
                                            <td className="px-2 py-1.5 md:py-3.5">
                                                <div className="flex items-center gap-1 overflow-hidden">
                                                    {inq.parent_id && <span className="ml-0.5 md:ml-4 text-[12px] font-thin opacity-50">↳</span>}
                                                    {inq.file_url && <Paperclip size={10} className="text-pink-500/60" />}
                                                    <span className={`text-[11px] md:text-[12.5px] tracking-tight truncate ${inq.type === '공지' ? 'font-black text-pink-700 underline underline-offset-4 decoration-pink-200' : 'text-gray-900 font-bold'}`}>
                                                        {inq.title}
                                                    </span>
                                                    {inq.is_secret && <Lock size={8} className="text-gray-300 ml-0.5" />}
                                                    <div className="flex items-center gap-1 ml-1.5 shrink-0">
                                                        {inq.status === 'completed' ? <span className="px-1 py-0.5 bg-blue-100 text-blue-600 text-[8px] md:text-[9px] rounded font-black">답변완료</span> : <span className="px-1 py-0.5 bg-gray-100 text-gray-400 text-[8px] md:text-[9px] rounded font-black">답변대기</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-0.5 py-1.5 md:py-3.5 text-[10px] md:text-[11.5px] text-center font-black truncate">{inq.writer_name}</td>
                                            <td className="px-0.5 py-1.5 md:py-3.5 text-[9px] md:text-[10.5px] text-center font-medium text-gray-400 tabular-nums">
                                                {new Date(inq.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/-/g, '.')}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-bold">{isSearching ? <RefreshCw className="animate-spin mx-auto text-pink-600" size={24} /> : '등록된 문의 내역이 없습니다.'}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-8 py-4">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1).map((pageNum) => (
                                <button key={pageNum} onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 0, behavior: 'instant' }); }} className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black transition-all ${currentPage === pageNum ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-white border border-gray-100 text-gray-400 hover:border-pink-200 hover:text-pink-600'}`}>{pageNum}</button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-gray-50 rounded-[28px] border border-gray-100">
                            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black outline-none focus:border-pink-500">
                                <option value="title">제목</option><option value="content">내용</option><option value="writer">등록인</option>
                            </select>
                            <div className="relative flex-1 min-w-[200px]">
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-full px-5 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-sm font-black outline-none focus:border-pink-500" placeholder="검색어를 입력해 주세요" />
                                <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600 transition"><Search size={20} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {inquiryMode === 'write' && (
                <div className="px-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setInquiryMode('list')} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft /></button>
                        <h4 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>문의 작성하기</h4>
                    </div>
                    {/* Simplified write form */}
                    <div className={`p-6 md:p-10 rounded-[45px] border shadow-sm space-y-6 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {/* Title & Contact Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={inquiryTitle} onChange={(e) => setInquiryTitle(e.target.value)} className="w-full border-2 rounded-2xl p-4 text-sm font-black outline-none" placeholder="문의 제목" />
                            <input value={inquiryContact} onChange={(e) => setInquiryContact(e.target.value)} className="w-full border-2 rounded-2xl p-4 text-sm font-black outline-none" placeholder="연락처 (이메일/번호)" />
                        </div>
                        <textarea value={inquiryContent} onChange={(e) => setInquiryContent(e.target.value)} className="w-full border-2 rounded-[35px] p-6 text-sm font-black h-56 resize-none outline-none" placeholder={contentPlaceholder} />
                        <div className="flex gap-4">
                            <button onClick={() => setInquiryMode('list')} className="flex-1 py-5 rounded-2xl font-black bg-gray-100">취소</button>
                            <button onClick={handleSubmitInquiry} disabled={isInquirySubmitting} className="flex-[2] py-5 bg-pink-600 text-white rounded-2xl font-black shadow-lg">
                                {isInquirySubmitting ? <RefreshCw className="animate-spin mx-auto" size={20} /> : '문의 등록하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {inquiryMode === 'detail' && viewingInquiry && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setInquiryMode('list')} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft /></button>
                        <h4 className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>문의 내용 확인</h4>
                    </div>

                    {!isPasswordVerified ? (
                        <div className="p-10 rounded-[45px] border text-center space-y-8 bg-white border-gray-200">
                            <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-3xl flex items-center justify-center mx-auto"><Lock size={32} /></div>
                            <div className="space-y-2"><h5 className="text-xl font-black text-gray-900">비밀글입니다.</h5><p className="text-sm font-bold text-gray-400">비밀번호를 입력해주세요.</p></div>
                            <div className="max-w-xs mx-auto space-y-4">
                                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full border-2 rounded-2xl p-4 text-center text-lg font-black outline-none" />
                                <button onClick={() => { if (passwordInput === viewingInquiry.password || isAdmin) setIsPasswordVerified(true); else alert('틀렸습니다.'); }} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black">확인</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className={`p-6 md:p-10 rounded-[30px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                <h4 className="text-xl font-black mb-4">{viewingInquiry.title}</h4>
                                <div className="text-sm border-t pt-4 whitespace-pre-wrap">{viewingInquiry.content}</div>
                            </div>
                            {/* Comments */}
                            <div className="p-6 rounded-[30px] bg-gray-50">
                                <h5 className="font-black mb-4 flex items-center gap-2"><MessageSquare size={18} /> 답변 및 댓글</h5>
                                <div className="space-y-4 mb-6">
                                    {inquiryThread.filter(t => t.id !== viewingInquiry.id).map(c => (
                                        <div key={c.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-2"><span className="font-black text-xs">{c.writer_name}</span><span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleString()}</span></div>
                                            <p className="text-xs">{c.content}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input value={inquiryContent} onChange={(e) => setInquiryContent(e.target.value)} className="flex-1 p-3 border rounded-xl text-xs" placeholder="댓글 입력..." />
                                    <button
                                        onClick={async () => {
                                            if (!inquiryContent.trim()) {
                                                alert('내용을 입력해주세요.');
                                                return;
                                            }
                                            if (!confirm('댓글을 등록하시겠습니까?')) return;

                                            try {
                                                const rootId = viewingInquiry.parent_id || viewingInquiry.id;
                                                const writerName = isAdmin ? '운영팀' : (isLoggedIn ? inquiryContact.split('|')[1] : inquiryContact.split('|')[1] || '손님');

                                                const { error } = await supabase.from('inquiries').insert([{
                                                    type: viewingInquiry.type,
                                                    writer_name: writerName,
                                                    password: viewingInquiry.password,
                                                    contact: viewingInquiry.contact,
                                                    shop_name: '',
                                                    title: `RE: ${viewingInquiry.title}`,
                                                    content: inquiryContent,
                                                    status: 'new',
                                                    is_secret: viewingInquiry.is_secret,
                                                    parent_id: rootId
                                                }]);

                                                if (error) throw error;
                                                alert('등록되었습니다.');
                                                setInquiryContent('');
                                                handleSubmitComment(); // Callback to refresh thread
                                            } catch (e) {
                                                console.error(e);
                                                alert('등록 실패');
                                            }
                                        }}
                                        className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-black"
                                    >
                                        등록
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
