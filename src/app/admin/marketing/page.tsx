'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMarketingTargets, upsertMarketingTarget, updateMarketingTarget, sendCampaignMessage, uploadMarketingTargets, deleteMarketingTarget, deleteMarketingTargets, getUploadHistory, removeMarketingTargetLink, deleteUploadBatch, updateUploadBatchName, MarketingTarget } from '@/services/marketingService';
import { Send, Users, Filter, Plus, MessageSquare, RefreshCw, Upload, FileDown, Trash2, ArrowUpDown, ChevronUp, ChevronDown, CheckSquare, Square, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BarChart3, Clock, AlertCircle, ExternalLink, X, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { REGION_DATA, INDUSTRY_DATA } from '@/constants/marketing-data';

export default function MarketingPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        region_city: '',
        region_gu: '',
        industry: '',
        industry_detail: '',
        status: '',
        search: '',
        is_adult: '',
        batch_id: '' // 회차별 필터 추가
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ total: number, count: number, duplicates: number } | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, asc: boolean }>({ key: 'created_at', asc: false });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // --- Queries ---
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['marketing-targets', page, filters, sortConfig],
        queryFn: () => getMarketingTargets({
            page,
            limit: 20,
            ...filters,
            orderBy: sortConfig.key,
            orderAsc: sortConfig.asc
        }),
    });

    const { data: uploadHistory } = useQuery({
        queryKey: ['marketing-upload-history'],
        queryFn: () => getUploadHistory(),
    });

    // --- Mutations ---
    const sendMutation = useMutation({
        mutationFn: async (campaign: any) => {
            if (!data?.data || data.data.length === 0) throw new Error('No targets selected');
            return sendCampaignMessage(campaign, data.data);
        },
        onSuccess: () => {
            toast.success('캠페인 발송이 완료되었습니다!');
            setShowSendModal(false);
            queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] }); // If we had a campaign list
        },
        onError: (err: any) => {
            toast.error(`발송 실패: ${err.message}`);
        }
    });

    // --- UI State ---
    const [showSendModal, setShowSendModal] = useState(false);
    const [campaignForm, setCampaignForm] = useState({
        title: '',
        message: '',
        channel: 'sms'
    });

    // --- Handlers ---
    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value };
            // Reset dependent filters
            if (key === 'region_city') next.region_gu = '';
            if (key === 'industry') next.industry_detail = '';
            return next;
        });
        setPage(1); // Reset to page 1 on filter
    };

    const handleDownloadTemplate = async () => {
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.json_to_sheet([
            {
                '이름': '홍길동',
                '전화번호': '010-1234-5678',
                '업체명': '강남스타일',
                '업종': '룸알바',
                '상세업종': '퍼블릭',
                '시도': '서울',
                '군구': '강남구',
                '유입경로': '네이버'
            }
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "업로드양식");
        XLSX.writeFile(wb, "마케팅_타겟_업로드_양식.xlsx");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm(`'${file.name}' 파일을 업로드 하시겠습니까?`)) {
            e.target.value = ''; // Reset input
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadMarketingTargets(file);
            setUploadResult({
                total: result.total,
                count: result.count,
                duplicates: result.duplicates
            });
            toast.success('업로드 완료!');
            refetch(); // Refresh list
            queryClient.invalidateQueries({ queryKey: ['marketing-upload-history'] });
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(`업로드 실패: ${error.message}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            asc: prev.key === key ? !prev.asc : false
        }));
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`'${name}' 대상을 삭제하시겠습니까?`)) return;

        try {
            await deleteMarketingTarget(id);
            toast.success('삭제되었습니다.');
            setSelectedIds(prev => prev.filter(curr => curr !== id));
            refetch();
        } catch (error: any) {
            toast.error(`삭제 실패: ${error.message}`);
        }
    };

    const handleRemoveLink = async (id: string, url: string) => {
        if (!confirm('이 수집 경로 링크를 삭제하시겠습니까?')) return;

        try {
            await removeMarketingTargetLink(id, url);
            toast.success('링크가 삭제되었습니다.');

            // Local cache update to prevent jumpy UI/refetch
            queryClient.setQueryData(['marketing-targets', page, filters, sortConfig], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((t: MarketingTarget) =>
                        t.id === id
                            ? { ...t, source_urls: (t.source_urls || []).filter(u => u !== url) }
                            : t
                    )
                };
            });
        } catch (error: any) {
            toast.error(`링크 삭제 실패: ${error.message}`);
        }
    };

    const handleQuickEdit = async (id: string, field: string, label: string, currentVal: string) => {
        const newVal = prompt(`${label}을(를) 수정하시겠습니까?`, currentVal);
        if (newVal === null || newVal === currentVal) return;

        try {
            await updateMarketingTarget(id, { [field]: newVal });
            toast.success('수정되었습니다.');

            // Local cache update to prevent jumpy UI/refetch
            queryClient.setQueryData(['marketing-targets', page, filters, sortConfig], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map((t: MarketingTarget) =>
                        t.id === id ? { ...t, [field]: newVal } : t
                    )
                };
            });
        } catch (error: any) {
            toast.error(`수정 실패: ${error.message}`);
        }
    };

    const handleDeleteBatch = async () => {
        const batchId = filters.batch_id;
        if (!batchId) return;

        const batch = uploadHistory?.find((h: any) => h.id === batchId);
        const fileName = batch?.filename || '해당 회차';

        if (!confirm(`'${fileName}' 업로드 회차와 연결된 모든 데이터를 삭제하시겠습니까?`)) return;

        try {
            await deleteUploadBatch(batchId);
            toast.success('해당 회차 데이터가 모두 삭제되었습니다.');
            handleFilterChange('batch_id', '');
            queryClient.invalidateQueries({ queryKey: ['marketing-upload-history'] });
            refetch();
        } catch (error: any) {
            toast.error(`삭제 실패: ${error.message}`);
        }
    };

    const handleRenameBatch = async () => {
        const batchId = filters.batch_id;
        if (!batchId) return;

        const batch = uploadHistory?.find((h: any) => h.id === batchId);
        const currentName = batch?.filename || '';
        const newName = prompt('회차 이름을 변경하시겠습니까?', currentName);

        if (!newName || newName === currentName) return;

        try {
            await updateUploadBatchName(batchId, newName);
            toast.success('이름이 변경되었습니다.');
            queryClient.invalidateQueries({ queryKey: ['marketing-upload-history'] });
        } catch (error: any) {
            toast.error(`이름 변경 실패: ${error.message}`);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`선택한 ${selectedIds.length}개의 대상을 삭제하시겠습니까?`)) return;

        try {
            await deleteMarketingTargets(selectedIds);
            toast.success('삭제되었습니다.');
            setSelectedIds([]);
            refetch();
        } catch (error: any) {
            toast.error(`삭제 실패: ${error.message}`);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = data?.data.map(t => t.id) || [];
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectToggle = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(curr => curr !== id) : [...prev, id]
        );
    };

    const handleSendSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm(`정말로 ${data?.count || 0}명의 대상에게 ${campaignForm.channel.toUpperCase()} 메시지를 발송하시겠습니까?`)) return;

        sendMutation.mutate({
            title: campaignForm.title,
            message_content: campaignForm.message,
            channel: campaignForm.channel
        });
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-red-500" />
                        마케팅 자동화 관리
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                        크롤링된 잠재 고객 데이터를 관리하고 메시지를 발송합니다.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => refetch()}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        title="새로고침"
                    >
                        <RefreshCw size={20} />
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                    />
                    <button
                        onClick={handleDownloadTemplate}
                        className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100 transition-colors"
                        title="업로드 양식 다운로드"
                    >
                        <FileDown size={20} />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                        {isUploading ? '업로드 중...' : '데이터 업로드'}
                    </button>

                    <button
                        onClick={() => setShowSendModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors shadow-lg shadow-gray-900/20"
                    >
                        <Send size={16} />
                        캠페인 발송
                    </button>
                </div>
            </div>

            {/* Stats Cards (Mock) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">전체 타겟</p>
                    <p className="text-2xl font-black text-gray-900">{data?.count || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">전환 완료</p>
                    <p className="text-2xl font-black text-green-600">0</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">문자 발송</p>
                    <p className="text-2xl font-black text-blue-600">0</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">발송 실패</p>
                    <p className="text-2xl font-black text-red-500">0</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mr-2">
                    <Filter size={16} /> 필터:
                </div>
                {/* 1. Region Filter (City -> Gu) */}
                <select
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none"
                    value={filters.region_city}
                    onChange={(e) => handleFilterChange('region_city', e.target.value)}
                >
                    <option value="">전체 시/도</option>
                    {Object.keys(REGION_DATA).map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                {filters.region_city && (
                    <select
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none animate-in fade-in zoom-in-95 duration-200"
                        value={filters.region_gu}
                        onChange={(e) => handleFilterChange('region_gu', e.target.value)}
                    >
                        <option value="">전체 시/구/군</option>
                        {REGION_DATA[filters.region_city]?.map(gu => (
                            <option key={gu} value={gu}>{gu}</option>
                        ))}
                    </select>
                )}

                {/* 2. Industry Filter (Category -> Detail) */}
                <select
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none"
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                >
                    <option value="">전체 1차 업종</option>
                    {Object.keys(INDUSTRY_DATA).map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                    ))}
                </select>
                {filters.industry && (
                    <select
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none animate-in fade-in zoom-in-95 duration-200"
                        value={filters.industry_detail}
                        onChange={(e) => handleFilterChange('industry_detail', e.target.value)}
                    >
                        <option value="">전체 2차 업종</option>
                        {INDUSTRY_DATA[filters.industry]?.map(detail => (
                            <option key={detail} value={detail}>{detail}</option>
                        ))}
                    </select>
                )}
                <select
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">전체 상태</option>
                    <option value="new">신규</option>
                    <option value="contacted">접촉</option>
                    <option value="converted">전환</option>
                </select>

                <div className="flex items-center gap-1 group/batch">
                    <select
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none max-w-[150px] transition-all"
                        value={filters.batch_id}
                        onChange={(e) => handleFilterChange('batch_id', e.target.value)}
                    >
                        <option value="">전체 업로드 회차</option>
                        {uploadHistory?.map((h: any) => (
                            <option key={h.id} value={h.id}>
                                {new Date(h.created_at).toLocaleDateString()} - {h.filename} ({h.unique_count}건)
                            </option>
                        ))}
                    </select>
                    {filters.batch_id && (
                        <>
                            <button
                                onClick={handleRenameBatch}
                                className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all opacity-0 group-hover/batch:opacity-100"
                                title="이 회차 이름 변경"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={handleDeleteBatch}
                                className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all opacity-0 group-hover/batch:opacity-100"
                                title="이 회차 데이터 전체 삭제"
                            >
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>

                <select
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none"
                    value={(filters as any).is_adult}
                    onChange={(e) => handleFilterChange('is_adult', e.target.value)}
                >
                    <option value="">전체 회원</option>
                    <option value="true">성인 인증 회원 (19+)</option>
                    <option value="false">미인증 회원</option>
                </select>

                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="ml-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-black flex items-center gap-1 hover:bg-red-100 transition-colors border border-red-100"
                    >
                        <Trash2 size={14} />
                        선택 삭제 ({selectedIds.length})
                    </button>
                )}

                <div className="ml-auto relative">
                    <input
                        type="text"
                        placeholder="이름, 전화번호 검색..."
                        className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:border-red-500 outline-none w-48"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <Users size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-gray-50/50 text-xs font-black text-gray-500 uppercase tracking-wider text-center">
                        <tr>
                            <th className="p-4 border-b border-gray-100 w-[50px]">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                    onChange={handleSelectAll}
                                    checked={data?.data.length !== 0 && selectedIds.length === data?.data.length}
                                />
                            </th>
                            <th className="p-4 border-b border-gray-100 w-[60px]">No.</th>
                            <th className="p-4 border-b border-gray-100 w-[100px]">
                                <button onClick={() => handleSort('status')} className="flex items-center justify-center gap-1 hover:text-gray-900 transition-colors mx-auto">
                                    상태 {sortConfig.key === 'status' ? (sortConfig.asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={12} />}
                                </button>
                            </th>
                            <th className="p-4 border-b border-gray-100 text-left w-[180px]">
                                <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                                    이름 / 연락처 {sortConfig.key === 'name' ? (sortConfig.asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={12} />}
                                </button>
                            </th>
                            <th className="p-4 border-b border-gray-100 text-left w-[140px]">SNS (카톡/텔레)</th>
                            <th className="p-4 border-b border-gray-100 text-left">
                                <button onClick={() => handleSort('shop_name')} className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                                    업체 정보 {sortConfig.key === 'shop_name' ? (sortConfig.asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={12} />}
                                </button>
                            </th>
                            <th className="p-4 border-b border-gray-100 text-left w-[150px]">지역</th>
                            <th className="p-4 border-b border-gray-100 text-left w-[100px]">유입 경로</th>
                            <th className="p-4 border-b border-gray-100 w-[120px]">
                                <button onClick={() => handleSort('created_at')} className="flex items-center justify-center gap-1 hover:text-gray-900 transition-colors mx-auto">
                                    등록일 {sortConfig.key === 'created_at' ? (sortConfig.asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={12} />}
                                </button>
                            </th>
                            <th className="p-4 border-b border-gray-100 w-[70px]">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                        {isLoading ? (
                            <tr><td colSpan={10} className="p-8 text-center text-gray-400">데이터를 불러오는 중...</td></tr>
                        ) : data?.data.length === 0 ? (
                            <tr><td colSpan={10} className="p-8 text-center text-gray-400">검색 결과가 없습니다. 필터를 변경하거나 데이터를 추가하세요.</td></tr>
                        ) : (
                            data?.data.map((target: MarketingTarget, index: number) => (
                                <tr key={target.id} className={`hover:bg-gray-50/50 transition-colors group text-center ${selectedIds.includes(target.id) ? 'bg-red-50/30' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                            checked={selectedIds.includes(target.id)}
                                            onChange={() => handleSelectToggle(target.id)}
                                        />
                                    </td>
                                    <td className="p-4 text-xs font-mono text-gray-400">
                                        {(page - 1) * 20 + index + 1}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${target.status === 'new' ? 'bg-blue-50 text-blue-600' :
                                            target.status === 'contacted' ? 'bg-yellow-50 text-yellow-600' :
                                                target.status === 'converted' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {target.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-left">
                                        <div
                                            className="font-bold text-gray-900 flex items-center gap-1 cursor-pointer hover:text-blue-600 group/field"
                                            onClick={() => handleQuickEdit(target.id, 'name', '이름', target.name || '')}
                                        >
                                            {target.name && target.name !== 'Unknown' ? target.name : target.shop_name || 'Unknown'}
                                            <Edit2 size={10} className="opacity-0 group-hover/field:opacity-100 transition-opacity" />
                                            {target.is_adult && (
                                                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-black" title="Adult Verified">19</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 font-mono tracking-tight">{target.phone_number}</div>
                                    </td>
                                    <td className="p-4 text-left">
                                        <div className="flex flex-col gap-1">
                                            <div
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit cursor-pointer group/field flex items-center gap-1 ${target.kakao_id ? 'text-yellow-600 bg-yellow-50' : 'text-gray-300 bg-gray-50 border border-dashed border-gray-200'}`}
                                                onClick={() => handleQuickEdit(target.id, 'kakao_id', '카카오 ID', target.kakao_id || '')}
                                            >
                                                K: {target.kakao_id || '없음'}
                                                <Edit2 size={8} className="opacity-0 group-hover/field:opacity-100" />
                                            </div>
                                            <div
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit cursor-pointer group/field flex items-center gap-1 ${target.telegram_id ? 'text-blue-600 bg-blue-50' : 'text-gray-300 bg-gray-50 border border-dashed border-gray-200'}`}
                                                onClick={() => handleQuickEdit(target.id, 'telegram_id', '텔레그램 ID', target.telegram_id || '')}
                                            >
                                                T: {target.telegram_id || '없음'}
                                                <Edit2 size={8} className="opacity-0 group-hover/field:opacity-100" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-left">
                                        <div
                                            className="font-bold max-w-[150px] truncate cursor-pointer hover:text-blue-600 group/field flex items-center gap-1"
                                            title={target.shop_name || undefined}
                                            onClick={() => handleQuickEdit(target.id, 'shop_name', '업체명', target.shop_name || '')}
                                        >
                                            {target.shop_name || '-'}
                                            <Edit2 size={10} className="opacity-0 group-hover/field:opacity-100" />
                                        </div>
                                        <div
                                            className="text-xs text-gray-400 truncate cursor-pointer hover:text-blue-600 group/field2 flex items-center gap-1"
                                            onClick={() => handleQuickEdit(target.id, 'industry', '직종', target.industry || '')}
                                        >
                                            {target.industry || '-'}
                                            <Edit2 size={8} className="opacity-0 group-hover/field2:opacity-100" />
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-left">
                                        {target.region_city} {target.region_gu}
                                    </td>
                                    <td className="p-4 text-xs text-gray-400 text-left">
                                        <div className="flex flex-wrap gap-1">
                                            {target.source_urls && target.source_urls.length > 0 ? (
                                                target.source_urls.map((url: string, i: number) => (
                                                    <div key={i} className="group/link flex items-center gap-0 bg-gray-50 text-[10px] text-gray-500 rounded border border-gray-100 transition-colors hover:border-blue-200">
                                                        <a
                                                            href={url.startsWith('http') ? url : `https://${url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-0.5 px-1.5 py-0.5 hover:text-blue-600 hover:bg-blue-50/50 rounded-l"
                                                        >
                                                            링크{i + 1}
                                                            <ExternalLink size={8} />
                                                        </a>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); handleRemoveLink(target.id, url); }}
                                                            className="px-1 py-0.5 border-l border-gray-100 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-r transition-colors"
                                                            title="링크 삭제"
                                                        >
                                                            <X size={8} />
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                target.source_url ? (
                                                    <a
                                                        href={target.source_url.startsWith('http') ? target.source_url : `https://${target.source_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-50 text-[10px] text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded border border-gray-100 transition-colors"
                                                    >
                                                        링크1
                                                        <ExternalLink size={8} />
                                                    </a>
                                                ) : target.source_site || '-'
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-400">
                                        {new Date(target.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDelete(target.id, target.name || target.shop_name || '대상')}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="bg-gray-50/30 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-400 font-bold">
                        전체 {data?.count || 0}개 데이터 중 {Math.min((page - 1) * 20 + 1, data?.count || 0)} - {Math.min(page * 20, data?.count || 0)} 표시
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="첫 페이지"
                        >
                            <ChevronsLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {(() => {
                            const totalPages = Math.ceil((data?.count || 0) / 20);
                            const maxVisible = 5;
                            let start = Math.max(1, page - Math.floor(maxVisible / 2));
                            let end = Math.min(totalPages, start + maxVisible - 1);

                            if (end - start + 1 < maxVisible) {
                                start = Math.max(1, end - maxVisible + 1);
                            }

                            return Array.from({ length: end - start + 1 }, (_, i) => {
                                const pageNum = start + i;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${page === pageNum
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                            : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            });
                        })()}

                        <button
                            onClick={() => setPage(p => Math.min(Math.ceil((data?.count || 0) / 20), p + 1))}
                            disabled={page >= Math.ceil((data?.count || 0) / 20)}
                            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => setPage(Math.ceil((data?.count || 0) / 20))}
                            disabled={page >= Math.ceil((data?.count || 0) / 20)}
                            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="마지막 페이지"
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Send Modal */}
            {showSendModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-gray-900">캠페인 시작</h3>
                            <p className="text-sm text-gray-500">
                                <span className="text-red-600 font-bold">{data?.count || 0}</span>명의 선택된 잠재 고객에게 발송합니다.
                            </p>
                        </div>

                        <form onSubmit={handleSendSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">캠페인 제목</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:border-red-500 outline-none"
                                    placeholder="예: 11월 특별 프로모션"
                                    value={campaignForm.title}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">발송 채널</label>
                                <div className="flex gap-2">
                                    {['sms', 'lms', 'kakao', 'telegram'].map(ch => (
                                        <label key={ch} className={`flex-1 px-3 py-2 border rounded-lg text-center text-xs font-black cursor-pointer transition-all ${campaignForm.channel === ch ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                                            }`}>
                                            <input
                                                type="radio" className="hidden"
                                                name="channel"
                                                value={ch}
                                                checked={campaignForm.channel === ch}
                                                onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value as any })}
                                            />
                                            {ch.toUpperCase()}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">메시지 내용</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:border-red-500 outline-none resize-none"
                                    placeholder="메시지 내용을 입력하세요..."
                                    value={campaignForm.message}
                                    onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                                />
                                <div className="text-right text-[10px] text-gray-400 font-bold mt-1">
                                    {campaignForm.message.length} 자
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSendModal(false)}
                                    className="py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendMutation.isPending}
                                    className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sendMutation.isPending ? '발송 중...' : '발송하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Result Modal */}
            {uploadResult && (
                <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckSquare size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-gray-900">데이터 업로드 결과</h3>
                            <p className="text-gray-500 text-sm font-medium">업로드된 파일 분석 결과입니다.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-4">
                            <div className="p-3 bg-gray-50 rounded-2xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">총 항목</p>
                                <p className="text-lg font-black text-gray-900">{uploadResult.total}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">신규/수정</p>
                                <p className="text-lg font-black text-blue-600 text-[16px]">{uploadResult.count}</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-2xl">
                                <p className="text-[10px] font-black text-yellow-500 uppercase mb-1">중복됨</p>
                                <p className="text-lg font-black text-yellow-600 text-[16px]">{uploadResult.duplicates}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl flex items-start gap-2 text-left">
                            <AlertCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                                동일한 전화번호의 데이터는 최신 정보로 업데이트되었으며, 파일 내 중복된 내용은 하나로 합쳐졌습니다.
                            </p>
                        </div>

                        <button
                            onClick={() => setUploadResult(null)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-gray-900/20"
                        >
                            확인 완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
