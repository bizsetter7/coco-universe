'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Upload, X, Search, Loader2, AlertCircle, Building2, Clock, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { IdentityVerifyModal } from '@/components/auth/IdentityVerifyModal';
import type { IdentityVerifyResult } from '@/types/identity-verify';
import { JOB_CATEGORIES } from '@/constants/jobs';
import { formatBizNumber } from '../utils';

/**
 * 기업회원 회원정보수정 폼
 * - 아이디(고정), 비밀번호 변경
 * - 이메일(수정), 휴대폰(재인증), SMS 수신동의
 * - 담당자(성함), 생년월일, 성별 (본인인증 값, 수정불가)
 * - 사업자 인증 신청 섹션 (신규)
 */
export const MemberInfoForm = ({ brand, setView, onOpenMenu, shopName }: any) => {
    const { user } = useAuth();
    const isDark = brand?.theme === 'dark';
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showIdentityModal, setShowIdentityModal] = useState(false);

    // 기본 폼
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        managerName: '',   // full_name
        birthDate: '',     // birth_date
        gender: '',        // gender
        smsConsent: true,  // SMS 수신 동의 (마케팅 활용)
        newPassword: '',
        newPasswordConfirm: '',
    });

    // 사업자 인증 폼
    const [bizData, setBizData] = useState({
        businessName: '',
        businessNumber: '',
        businessType: '',
        businessAddress: '',
        businessAddressDetail: '',
        managerPhone: '',
        kakao: '',
        line: '',
        telegram: '',
    });
    const [bizVerifyStatus, setBizVerifyStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
    const [bizDocFile, setBizDocFile] = useState<File | null>(null);
    const [bizFileUrl, setBizFileUrl] = useState<string | null>(null);
    const [bizNumberStatus, setBizNumberStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
    const [bizNumberText, setBizNumberText] = useState('');
    const [isSubmittingBiz, setIsSubmittingBiz] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 아이디 = email 에서 @cocoalba.kr 앞 부분
    const username = user?.email?.replace('@cocoalba.kr', '') || user?.name || '';

    useEffect(() => {
        if (!user?.id || user.id === 'guest') {
            setFormData(prev => ({
                ...prev,
                email: user?.email || '',
            }));
            setIsLoaded(true);
            return;
        }

        const loadProfile = async () => {
            const [{ data: profile }, { data: { user: authUser } }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('phone, full_name, birth_date, gender, business_name, business_number, business_type, business_address, business_address_detail, business_file_url, manager_phone, manager_kakao, manager_line, manager_telegram, business_verify_status')
                    .eq('id', user.id)
                    .single(),
                supabase.auth.getUser(),
            ]);

            // user_metadata를 fallback으로 활용 (profiles 데이터가 없을 경우 대비)
            const meta = authUser?.user_metadata || {};

            setFormData(prev => ({
                ...prev,
                email: user?.email || '',
                phone: (profile as any)?.phone || meta.phone || '',
                managerName: (profile as any)?.full_name || meta.full_name || user?.name || '',
                birthDate: (profile as any)?.birth_date || meta.birthdate || '',
                gender: (profile as any)?.gender || meta.gender || '',
            }));

            // 사업자 정보 로드
            if (profile) {
                const p = profile as any;
                setBizData({
                    businessName: p.business_name || '',
                    businessNumber: p.business_number || '',
                    businessType: p.business_type || '',
                    businessAddress: p.business_address || '',
                    businessAddressDetail: p.business_address_detail || '',
                    managerPhone: p.manager_phone || '',
                    kakao: p.manager_kakao || '',
                    line: p.manager_line || '',
                    telegram: p.manager_telegram || '',
                });
                setBizFileUrl(p.business_file_url || null);
                setBizVerifyStatus(p.business_verify_status || 'none');
            }

            setIsLoaded(true);
        };

        loadProfile();
    }, [user?.id]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBizChange = (field: string, value: string) => {
        setBizData(prev => ({ ...prev, [field]: value }));
    };

    // 사업자번호 NTS 조회
    const handleBizNumberVerify = async () => {
        const raw = bizData.businessNumber.replace(/\D/g, '');
        if (raw.length !== 10) {
            setBizNumberStatus('invalid');
            setBizNumberText('10자리 사업자 등록번호를 입력해주세요.');
            return;
        }
        setBizNumberStatus('loading');
        try {
            const res = await fetch('/api/nts/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessNumber: raw }),
            });
            const data = await res.json();
            if (data.status === '정상') {
                setBizNumberStatus('valid');
                setBizNumberText('국세청 인증 완료 (계속사업자)');
            } else {
                setBizNumberStatus('invalid');
                setBizNumberText(data.message || '등록되지 않은 사업자번호입니다.');
            }
        } catch {
            setBizNumberStatus('invalid');
            setBizNumberText('조회 중 오류가 발생했습니다.');
        }
    };

    // 파일 업로드 → Supabase Storage
    const uploadBizFile = async (file: File): Promise<string | null> => {
        if (!user?.id) return null;
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('business-docs').upload(path, file, { upsert: true });
        if (error) {
            console.error('[uploadBizFile]', error.message);
            return null;
        }
        const { data } = supabase.storage.from('business-docs').getPublicUrl(path);
        return data?.publicUrl || null;
    };

    // 사업자 인증 신청
    const handleBizSubmit = async () => {
        if (!bizData.businessName.trim()) { alert('상호명을 입력해주세요.'); return; }
        if (!bizData.businessType) { alert('업종을 선택해주세요.'); return; }
        if (!bizData.businessNumber.trim()) { alert('사업자등록번호를 입력해주세요.'); return; }
        if (!bizData.managerPhone.trim()) { alert('담당자 연락처를 입력해주세요.'); return; }
        if (!bizDocFile && !bizFileUrl) { alert('사업자등록증 파일을 첨부해주세요.'); return; }

        setIsSubmittingBiz(true);
        try {
            let fileUrl = bizFileUrl;

            // 새 파일 있으면 업로드
            if (bizDocFile) {
                fileUrl = await uploadBizFile(bizDocFile);
                if (!fileUrl) {
                    alert('파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
                    return;
                }
            }

            const { error } = await supabase.from('profiles').update({
                business_name: bizData.businessName,
                business_number: bizData.businessNumber.replace(/\D/g, ''),
                business_type: bizData.businessType,
                business_address: bizData.businessAddress || null,
                business_address_detail: bizData.businessAddressDetail || null,
                business_file_url: fileUrl,
                manager_phone: bizData.managerPhone,
                manager_kakao: bizData.kakao,
                manager_line: bizData.line,
                manager_telegram: bizData.telegram,
                business_verify_status: 'pending',
                business_verify_requested_at: new Date().toISOString(),
            }).eq('id', user!.id);

            if (error) throw error;

            setBizVerifyStatus('pending');
            setBizFileUrl(fileUrl);
            alert('사업자 인증 신청이 완료되었습니다.\n관리자 검토 후 승인 알림을 보내드립니다.');
            setView('dashboard');
        } catch (e: any) {
            alert('신청 중 오류: ' + (e.message || '잠시 후 다시 시도해주세요.'));
        } finally {
            setIsSubmittingBiz(false);
        }
    };

    const handleSave = async () => {
        if (!user?.id || user.id === 'guest') {
            alert('로그인이 필요합니다.');
            return;
        }
        if (formData.newPassword && formData.newPassword !== formData.newPasswordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (formData.newPassword && formData.newPassword.length < 6) {
            alert('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        setIsSaving(true);
        try {
            if (!user.id.startsWith('mock_')) {
                if (formData.newPassword) {
                    const { error: pwError } = await supabase.auth.updateUser({
                        password: formData.newPassword,
                    });
                    if (pwError) throw pwError;
                }
            }
            alert('회원 정보가 수정되었습니다.');
            setView('dashboard');
        } catch (e: any) {
            alert('수정 중 오류가 발생했습니다: ' + (e.message || '잠시 후 다시 시도해주세요.'));
        } finally {
            setIsSaving(false);
        }
    };

    const inputCls = `w-full p-3 md:p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-blue-500/20 outline-none ${
        isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
    }`;
    const disabledCls = `w-full p-3 md:p-4 rounded-xl font-bold border ${
        isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
    }`;
    const labelCls = `block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`;
    const bizInputCls = `w-full p-3 rounded-xl font-bold border transition outline-none focus:ring-2 focus:ring-blue-500/20 ${
        isDark ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
    }`;

    if (!isLoaded) {
        return (
            <div className={`max-w-4xl mx-auto p-10 rounded-[32px] border text-center ${isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-400'}`}>
                정보를 불러오는 중...
            </div>
        );
    }

    const isBizApproved = bizVerifyStatus === 'approved';
    const isBizPending = bizVerifyStatus === 'pending';
    const isBizRejected = bizVerifyStatus === 'rejected';

    return (
        <div className={`max-w-4xl mx-auto p-3 md:p-10 rounded-[24px] md:rounded-[32px] shadow-xl border relative ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-lg md:text-2xl font-black mb-3 md:mb-10 pb-3 md:pb-5 border-b flex items-center gap-2 md:gap-3 ${isDark ? 'text-white border-gray-800' : 'text-gray-950 border-gray-100'}`}>
                <span className="w-2 h-8 bg-blue-500 rounded-full hidden md:block" />
                회원 정보 수정
            </h2>

            <div className="space-y-6 md:space-y-8">

                {/* ── 아이디 / 비밀번호 변경 ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelCls}>아이디</label>
                        <input type="text" value={username} disabled className={disabledCls} />
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>비밀번호 변경 <span className="font-normal text-gray-400">(변경하지 않으면 비워두세요)</span></label>
                        <input
                            type="password"
                            placeholder="새 비밀번호 (6자 이상)"
                            value={formData.newPassword}
                            onChange={(e) => handleChange('newPassword', e.target.value)}
                            className={inputCls}
                        />
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            value={formData.newPasswordConfirm}
                            onChange={(e) => handleChange('newPasswordConfirm', e.target.value)}
                            className={inputCls}
                        />
                        {formData.newPasswordConfirm && formData.newPassword !== formData.newPasswordConfirm && (
                            <p className="text-[10px] text-red-500 font-bold">비밀번호가 일치하지 않습니다.</p>
                        )}
                    </div>
                </div>

                {/* ── 이메일 / 휴대폰 ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelCls}>이메일</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={inputCls}
                            placeholder="이메일 주소 입력"
                        />
                    </div>
                    <div>
                        <label className={`${labelCls} flex items-center gap-1`}>
                            휴대폰 번호 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={formData.phone || '미등록'}
                                readOnly
                                className={`w-full sm:flex-1 p-3 md:p-4 rounded-xl font-bold border outline-none ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            />
                            <button
                                onClick={() => setShowIdentityModal(true)}
                                className="w-full sm:w-auto px-6 py-3 md:py-4 rounded-xl font-bold whitespace-nowrap bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition"
                            >
                                재인증
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── 담당자 정보 (본인인증 값, 수정불가) ── */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-50/50 border-blue-100'}`}>
                    <p className={`text-xs font-black mb-4 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-blue-700'}`}>
                        <span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />
                        담당자 정보 (본인인증 확인 값)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>담당자(성함)</label>
                            <input type="text" value={formData.managerName} disabled className={disabledCls} />
                        </div>
                        <div>
                            <label className={labelCls}>생년월일</label>
                            <input type="text" value={formData.birthDate} disabled className={disabledCls} placeholder="본인인증 후 자동 입력" />
                        </div>
                        <div>
                            <label className={labelCls}>성별</label>
                            <input type="text" value={formData.gender === 'M' ? '남성' : formData.gender === 'F' ? '여성' : (formData.gender === '남성' || formData.gender === '여성') ? formData.gender : ''} disabled className={disabledCls} placeholder="본인인증 후 자동 입력" />
                        </div>
                    </div>
                    <p className="text-[10px] text-blue-500 mt-2 font-bold">* 본인인증으로 확인된 정보로 임의 수정이 불가합니다.</p>
                </div>

                {/* ── SMS 수신동의 ── */}
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div
                        onClick={() => handleChange('smsConsent', !formData.smsConsent)}
                        className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer transition ${formData.smsConsent ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300'}`}
                    >
                        {formData.smsConsent && <Check size={16} />}
                    </div>
                    <label
                        className={`cursor-pointer font-bold select-none ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                        onClick={() => handleChange('smsConsent', !formData.smsConsent)}
                    >
                        [필수] SMS 수신 동의 (중요 알림 및 공지사항)
                    </label>
                </div>

                {/* ── 저장 버튼 ── */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setView('dashboard')}
                        className={`order-2 sm:order-1 px-8 py-4 rounded-2xl font-black transition ${isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="order-1 sm:order-2 px-8 py-4 rounded-2xl bg-blue-500 text-white font-black hover:bg-blue-600 shadow-xl shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? '저장 중...' : '회원정보 수정하기'}
                    </button>
                </div>

                {/* ══════════════════════════════════════════════
                    사업자 인증 신청 섹션
                ══════════════════════════════════════════════ */}
                <div className={`mt-2 rounded-[24px] border-2 overflow-hidden ${
                    isBizApproved
                        ? isDark ? 'border-green-800 bg-green-950/30' : 'border-green-200 bg-green-50/50'
                        : isBizPending
                            ? isDark ? 'border-amber-800 bg-amber-950/30' : 'border-amber-200 bg-amber-50/50'
                            : isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
                }`}>
                    {/* 섹션 헤더 */}
                    <div className={`p-5 flex items-center justify-between ${
                        isBizApproved
                            ? 'bg-green-500'
                            : isBizPending
                                ? 'bg-amber-500'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    } text-white`}>
                        <div className="flex items-center gap-3">
                            <Building2 size={22} />
                            <div>
                                <h3 className="font-black text-base">사업자 인증</h3>
                                <p className="text-xs opacity-80 font-bold">
                                    {isBizApproved ? '인증이 완료되었습니다. 공고 등록 시 자동으로 반영됩니다.' :
                                        isBizPending ? '인증 신청이 접수되어 심사 중입니다. 최대 1~2 영업일 소요됩니다.' :
                                            isBizRejected ? '인증이 반려되었습니다. 서류를 확인하고 재신청해주세요.' :
                                                '사업자 정보를 등록하면 공고 등록 시 자동으로 반영됩니다.'}
                                </p>
                            </div>
                        </div>
                        <div>
                            {isBizApproved && <CheckCircle2 size={28} className="text-white opacity-80" />}
                            {isBizPending && <Clock size={28} className="text-white opacity-80" />}
                            {isBizRejected && <XCircle size={28} className="text-white opacity-80" />}
                        </div>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* 1행: 상호명 + 업종 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`${labelCls} flex items-center gap-1`}>
                                    <span className="text-red-500">*</span> 상호명
                                </label>
                                <input
                                    type="text"
                                    placeholder="사업자등록증의 상호명"
                                    value={bizData.businessName}
                                    onChange={(e) => handleBizChange('businessName', e.target.value)}
                                    disabled={isBizApproved || isBizPending}
                                    className={`${bizInputCls} ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <div>
                                <label className={`${labelCls} flex items-center gap-1`}>
                                    <span className="text-red-500">*</span> 업종
                                </label>
                                <select
                                    value={bizData.businessType}
                                    onChange={(e) => handleBizChange('businessType', e.target.value)}
                                    disabled={isBizApproved || isBizPending}
                                    className={`${bizInputCls} ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <option value="">업종선택</option>
                                    {JOB_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 2행: 사업자번호 + 파일첨부 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`${labelCls} flex items-center gap-1`}>
                                    <span className="text-red-500">*</span> 사업자등록번호
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="000-00-00000"
                                        value={bizData.businessNumber}
                                        onChange={(e) => { handleBizChange('businessNumber', formatBizNumber(e.target.value)); setBizNumberStatus('idle'); }}
                                        disabled={isBizApproved || isBizPending}
                                        maxLength={12}
                                        className={`${bizInputCls} flex-1 ${bizNumberStatus === 'invalid' ? 'border-red-400' : bizNumberStatus === 'valid' ? 'border-green-400' : ''} ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    />
                                    {!isBizApproved && !isBizPending && (
                                        <button
                                            type="button"
                                            onClick={handleBizNumberVerify}
                                            disabled={bizNumberStatus === 'loading'}
                                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shrink-0 flex items-center gap-1 transition disabled:opacity-50"
                                        >
                                            {bizNumberStatus === 'loading' ? <><Loader2 size={12} className="animate-spin" /> 조회중</> : <><Search size={12} /> 조회</>}
                                        </button>
                                    )}
                                </div>
                                {bizNumberStatus === 'valid' && (
                                    <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1"><Check size={10} /> {bizNumberText}</p>
                                )}
                                {bizNumberStatus === 'invalid' && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={10} /> {bizNumberText}</p>
                                )}
                            </div>

                            <div>
                                <label className={`${labelCls} flex items-center gap-1`}>
                                    <span className="text-red-500">*</span> 사업자등록증 첨부
                                    <span className="font-normal text-gray-400 ml-1">(PDF/JPG/PNG)</span>
                                </label>
                                {isBizApproved || isBizPending ? (
                                    <div className={`p-3 rounded-xl border font-bold text-sm flex items-center gap-2 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                        <FileIconSmall />
                                        {bizFileUrl
                                            ? <a href={bizFileUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline hover:text-blue-700 text-xs">첨부파일 확인</a>
                                            : '첨부됨'}
                                    </div>
                                ) : (
                                    <div>
                                        {bizDocFile ? (
                                            <div className={`p-3 rounded-xl border flex items-center gap-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                                <span className="text-xs font-bold text-green-600 truncate flex-1">{bizDocFile.name}</span>
                                                <button type="button" onClick={() => { setBizDocFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                                            </div>
                                        ) : bizFileUrl ? (
                                            <div className="flex items-center gap-2">
                                                <a href={bizFileUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline hover:text-blue-700 text-xs font-bold">기존 파일 보기</a>
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className={`px-3 py-2 border border-dashed rounded-xl text-xs font-bold flex items-center gap-1 transition ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                                                    <Upload size={12} /> 재업로드
                                                </button>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full p-3 border border-dashed rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-blue-400'}`}>
                                                <Upload size={14} /> 파일 선택
                                            </button>
                                        )}
                                        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setBizDocFile(e.target.files?.[0] || null)} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3행: 사업장 주소 (다음 주소 검색) */}
                        <div>
                            <label className={`${labelCls} flex items-center gap-1`}>
                                사업장 주소
                                <span className="text-gray-400 font-normal text-[10px] ml-1">(공고 지도에 반영)</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="주소 검색 버튼을 눌러 입력하세요"
                                    value={bizData.businessAddress}
                                    readOnly
                                    disabled={isBizApproved || isBizPending}
                                    className={`${bizInputCls} flex-1 cursor-default bg-gray-50 ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                                {!isBizApproved && !isBizPending && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const script = document.createElement('script');
                                            script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
                                            script.onload = () => {
                                                new (window as any).daum.Postcode({
                                                    oncomplete: (data: any) => {
                                                        const addr = data.roadAddress || data.jibunAddress;
                                                        handleBizChange('businessAddress', addr);
                                                    },
                                                }).open();
                                            };
                                            if ((window as any).daum?.Postcode) {
                                                new (window as any).daum.Postcode({
                                                    oncomplete: (data: any) => {
                                                        const addr = data.roadAddress || data.jibunAddress;
                                                        handleBizChange('businessAddress', addr);
                                                    },
                                                }).open();
                                            } else {
                                                document.head.appendChild(script);
                                            }
                                        }}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shrink-0 flex items-center gap-1 transition"
                                    >
                                        <MapPin size={12} /> 주소 검색
                                    </button>
                                )}
                            </div>
                            {bizData.businessAddress && (
                                <input
                                    type="text"
                                    placeholder="상세주소 입력 (예: 지하1층, 2호)"
                                    value={bizData.businessAddressDetail || ''}
                                    onChange={(e) => handleBizChange('businessAddressDetail', e.target.value)}
                                    disabled={isBizApproved || isBizPending}
                                    className={`${bizInputCls} mt-2 ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            )}
                        </div>

                        {/* 4행: 담당자 연락처 + 메신저 */}
                        <div>
                            <label className={`${labelCls} flex items-center gap-1`}>
                                <span className="text-red-500">*</span> 담당자 연락처
                            </label>
                            <input
                                type="text"
                                placeholder="010-0000-0000"
                                value={bizData.managerPhone}
                                onChange={(e) => handleBizChange('managerPhone', e.target.value)}
                                disabled={isBizApproved || isBizPending}
                                className={`${bizInputCls} ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] font-black mb-1.5 text-yellow-600">카카오톡 ID</label>
                                <input type="text" placeholder="ID" value={bizData.kakao} onChange={(e) => handleBizChange('kakao', e.target.value)} disabled={isBizApproved || isBizPending}
                                    className={`w-full border rounded-lg p-2.5 text-xs font-bold outline-none ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'} ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black mb-1.5 text-green-600">라인 ID</label>
                                <input type="text" placeholder="ID" value={bizData.line} onChange={(e) => handleBizChange('line', e.target.value)} disabled={isBizApproved || isBizPending}
                                    className={`w-full border rounded-lg p-2.5 text-xs font-bold outline-none ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'} ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black mb-1.5 text-blue-600">텔레그램 ID</label>
                                <input type="text" placeholder="ID" value={bizData.telegram} onChange={(e) => handleBizChange('telegram', e.target.value)} disabled={isBizApproved || isBizPending}
                                    className={`w-full border rounded-lg p-2.5 text-xs font-bold outline-none ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'} ${(isBizApproved || isBizPending) ? 'opacity-60 cursor-not-allowed' : ''}`} />
                            </div>
                        </div>

                        {/* 액션 영역 */}
                        {isBizApproved && (
                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                                <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                                <div>
                                    <p className="font-black text-green-700 text-sm">인증 완료</p>
                                    <p className="text-xs text-green-600 font-bold">공고 등록 시 인증된 정보가 자동으로 반영됩니다.</p>
                                </div>
                                <button
                                    onClick={() => setBizVerifyStatus('none')}
                                    className="ml-auto text-[10px] text-gray-400 hover:text-gray-600 font-bold underline shrink-0"
                                >
                                    재신청
                                </button>
                            </div>
                        )}
                        {isBizPending && (
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                <Clock size={20} className="text-amber-500 shrink-0" />
                                <div>
                                    <p className="font-black text-amber-700 text-sm">심사 진행 중</p>
                                    <p className="text-xs text-amber-600 font-bold">관리자 검토 후 최대 1~2 영업일 내 결과를 알려드립니다.</p>
                                </div>
                            </div>
                        )}
                        {(bizVerifyStatus === 'none' || isBizRejected) && (
                            <div className="pt-2">
                                {isBizRejected && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
                                        <XCircle size={16} className="text-red-500 shrink-0" />
                                        <p className="text-xs text-red-600 font-bold">인증이 반려되었습니다. 서류 재확인 후 다시 신청해주세요.</p>
                                    </div>
                                )}
                                <button
                                    onClick={handleBizSubmit}
                                    disabled={isSubmittingBiz}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmittingBiz ? (
                                        <><Loader2 size={16} className="animate-spin" /> 신청 중...</>
                                    ) : (
                                        <><Building2 size={16} /> {isBizRejected ? '재신청하기' : '사업자 인증 신청하기'}</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 재인증 모달 */}
            {showIdentityModal && (
                <IdentityVerifyModal
                    onClose={() => setShowIdentityModal(false)}
                    onVerified={(result: IdentityVerifyResult) => {
                        setShowIdentityModal(false);
                        if (result.phone) {
                            setFormData(prev => ({ ...prev, phone: result.phone || prev.phone }));
                        }
                    }}
                />
            )}
        </div>
    );
};

// 파일 아이콘 소형
function FileIconSmall() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}
