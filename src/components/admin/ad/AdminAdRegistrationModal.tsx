'use client';

import React, { useState } from 'react';
import {
    XCircle,
    Save,
    Zap,
    MapPin,
    CreditCard,
    FileText,
    Layout,
    PlusCircle,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { JOB_CATEGORY_MAP } from '@/constants/jobs';
import { REGIONS_MAP } from '@/constants/regions';

interface User {
    id: string;
    name?: string;
    full_name?: string;
    phone?: string;
    nickname?: string;
    // 사업자 정보 (프로필에서 자동반영)
    business_name?: string;
    business_number?: string;
    manager_kakao?: string;
    manager_telegram?: string;
}

interface AdminAdRegistrationModalProps {
    user: User;
    onClose: () => void;
    fetchData: () => void;
}

export function AdminAdRegistrationModal({ user, onClose, fetchData }: AdminAdRegistrationModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isContentOpen, setIsContentOpen] = useState(false); // 공고 상세내용 접기/펼치기

    // Form State — 사업자 정보 자동반영
    const [formData, setFormData] = useState({
        shopName: user.business_name || '',                      // ← 상호명 자동
        title: '',
        managerName: user.name || user.full_name || '',
        managerPhone: user.phone || '',
        kakao: user.manager_kakao || '',                         // ← 카카오 자동
        telegram: user.manager_telegram || '',                   // ← 텔레그램 자동
        region: '서울',
        regionGu: '강남구',
        category: '룸알바',
        categorySub: '퍼블릭',
        tier: 'grand',
        payType: '시급',
        payAmount: '100,000',
        content: '',
        mediaUrl: '',
        duration: 30,
        banner_position: 'none' as 'none' | 'left' | 'right' | 'both' | 'inner', // ← 배너 슬롯
    });

    const categories = Object.keys(JOB_CATEGORY_MAP);
    const regions = Object.keys(REGIONS_MAP);

    const handleSave = async () => {
        if (!formData.shopName || !formData.title || !formData.managerPhone) {
            alert('필수 항목(상호명, 제목, 연락처)을 입력해주세요.');
            return;
        }

        setIsSaving(true);
        try {
            const now = new Date();
            const deadline = new Date(now.getTime() + formData.duration * 24 * 60 * 60 * 1000);

            const shopId = crypto.randomUUID();
            
            const adData = {
                // [Standard Root Columns] - V4 DB 컬럼명 100% 준수 (Master Mapping)
                id: shopId,
                user_id: user.id,
                name: formData.shopName,
                title: formData.title,
                region: formData.region,
                phone: formData.managerPhone,
                kakao: formData.kakao,
                telegram: formData.telegram,
                tier: formData.tier,
                pay_type: formData.payType,
                pay: formData.payAmount,
                pay_amount: parseInt(String(formData.payAmount).replace(/,/g, '') || '0'),
                category: formData.category,
                category_sub: formData.categorySub,
                work_region_sub: formData.regionGu,
                content: formData.content,
                manager_name: formData.managerName,
                manager_phone: formData.managerPhone,
                media_url: formData.mediaUrl,
                status: 'active',
                ad_duration: formData.duration,
                deadline: deadline.toISOString().split('T')[0],
                product_type: formData.tier,
                created_at: now.toISOString(),
                updated_at: now.toISOString(),
                // 배너 슬롯 배정 (migration 06 적용 시 반영)
                ...(formData.banner_position !== 'none' ? {
                    banner_position: formData.banner_position,
                    banner_status: 'approved',  // 관리자 직접 등록 = 즉시 승인
                } : {}),
                
                // [Snapshot Bucket] - UI용 매핑 규격 통일 (camelCase)
                options: {
                    ...formData,
                    regionCity: formData.region, // Fallback 용도
                    regionGu: formData.regionGu,   // Fallback 용도
                    industryMain: formData.category,
                    industrySub: formData.categorySub,
                    payAmount: parseInt(String(formData.payAmount).replace(/,/g, '') || '0'),
                    product_period: formData.duration,
                    approved_at: now.toISOString(),
                    deadline: deadline.toISOString().split('T')[0]
                }
            };

            // 1. 등록 (Shops 테이블)
            const { error: shopError } = await supabase.from('shops').insert([adData]);
            if (shopError) throw shopError;

            // 2. 어드민 직접 등록에 따른 결제 내역 생성 (Finance 통합용)
            const { error: payError } = await supabase.from('payments').insert([{
                user_id: user.id,
                shop_id: shopId,
                amount: 0,
                status: 'completed',
                type: 'AD',
                method: 'admin_manual',
                metadata: {
                    shop_name: formData.shopName,
                    tier: formData.tier,
                    duration: formData.duration,
                    admin_id: 'internal_admin'
                }
            }]);
            if (payError) {
                console.warn('[Warning] Payment record creation failed but shop was created:', payError);
            }

            alert('광고가 성공적으로 등록 및 활성화되었습니다.');
            fetchData();
            onClose();
        } catch (error: unknown) {
            console.error('Ad registration error:', error);
            const message = error instanceof Error ? error.message : '알 수 없는 오류';
            alert('등록 중 오류가 발생했습니다: ' + message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `banners/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('job-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('job-images')
                .getPublicUrl(fileName);

            setFormData(prev => ({ ...prev, mediaUrl: publicUrl }));
        } catch (error: unknown) {
            console.error('Upload error:', error);
            const message = error instanceof Error ? error.message : '알 수 없는 오류';
            alert(`이미지 업로드 실패: ${message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10030] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0 bg-slate-950 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                            <Zap size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Direct Ad Registration</p>
                            <h3 className="text-xl font-black tracking-tighter">
                                <span className="text-blue-500">{user.name || user.full_name}</span>님을 위한 신규 광고 등록
                            </h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <XCircle size={28} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10 bg-slate-50/50">
                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout size={16} className="text-blue-600" />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">기본 상점 정보</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">상호명 *</label>
                                <input
                                    type="text"
                                    value={formData.shopName}
                                    onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                                    placeholder="상호를 입력하세요"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">공고 제목 *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="공고 리스트에 노출될 제목"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">담당자 연락처 *</label>
                                <input
                                    type="text"
                                    value={formData.managerPhone}
                                    onChange={e => setFormData({ ...formData, managerPhone: e.target.value })}
                                    placeholder="010-0000-0000"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">카카오톡 ID</label>
                                <input
                                    type="text"
                                    value={formData.kakao}
                                    onChange={e => setFormData({ ...formData, kakao: e.target.value })}
                                    placeholder="KAKAO ID"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Category & Region */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText size={16} className="text-blue-600" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">업종 분류</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value, categorySub: JOB_CATEGORY_MAP[e.target.value][0] })}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <select
                                    value={formData.categorySub}
                                    onChange={e => setFormData({ ...formData, categorySub: e.target.value })}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {JOB_CATEGORY_MAP[formData.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin size={16} className="text-blue-600" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">희망 지역</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={formData.region}
                                    onChange={e => setFormData({ ...formData, region: e.target.value, regionGu: REGIONS_MAP[e.target.value][0] })}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {regions.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                                </select>
                                <select
                                    value={formData.regionGu}
                                    onChange={e => setFormData({ ...formData, regionGu: e.target.value })}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {REGIONS_MAP[formData.region].map(gu => <option key={gu} value={gu}>{gu}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2.5: Media (Image/Banner) URL */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <PlusCircle size={16} className="text-blue-600" />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">미디어 설정 (카드 이미지/배너 URL)</h4>
                        </div>
                        <div className={`p-4 md:p-6 rounded-[32px] border-2 border-dashed transition-all ${formData.mediaUrl ? 'bg-blue-50/30 border-blue-200' : 'bg-white border-slate-200 shadow-inner'}`}>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-full md:w-48 h-32 md:h-36 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative group">
                                    {formData.mediaUrl ? (
                                        <>
                                            <img src={formData.mediaUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setFormData({ ...formData, mediaUrl: '' })}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                            <Layout size={28} strokeWidth={1.5} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Preview</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3 w-full">
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                                        카드형 광고의 메인 이미지나 <span className="text-blue-600 font-black">사이드 배너 이미지 URL</span>을 입력해주세요. <br />
                                        이미지 호스팅 주소(URL)를 입력하거나 <span className="underline">직접 파일을 업로드</span>할 수 있습니다.
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.mediaUrl}
                                            onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                                            placeholder="예: https://mysite.com/banner.jpg (이미지 주소 붙여넣기)"
                                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            disabled={isUploading}
                                        />
                                        <label className={`px-4 py-3 bg-slate-900 text-white rounded-2xl text-xs md:text-sm font-black hover:bg-slate-800 transition active:scale-95 shadow-lg whitespace-nowrap cursor-pointer flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {isUploading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" /> 업로드 중...
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon size={14} /> 파일 선택
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold">
                                        * 카드 광고: 800x600 권장 | 사이드 배너: 가로 200px~ 권장
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Ad Tier & Duration */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={16} className="text-blue-600" />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">광고 상품 및 기간</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">상품 등급</label>
                                <select
                                    value={formData.tier}
                                    onChange={e => setFormData({ ...formData, tier: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="grand">그랜드 (T1)</option>
                                    <option value="premium">프리미엄 (T2)</option>
                                    <option value="deluxe">디럭스 (T3)</option>
                                    <option value="special">스페셜 (T4)</option>
                                    <option value="urgent">오늘의공고 (T5)</option>
                                    <option value="side_banner">사이드 배너</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">게시 기간</label>
                                <select
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value={30}>30일</option>
                                    <option value={60}>60일</option>
                                    <option value={90}>90일</option>
                                    <option value={365}>1년 (특별)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">급여 정보</label>
                                <div className="flex gap-2">
                                    <select
                                        value={formData.payType}
                                        onChange={e => setFormData({ ...formData, payType: e.target.value })}
                                        className="w-24 px-3 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="시급">시급</option>
                                        <option value="일급">일급</option>
                                        <option value="월급">월급</option>
                                        <option value="협의">협의</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={formData.payAmount}
                                        onChange={e => setFormData({ ...formData, payAmount: e.target.value })}
                                        placeholder="100,000"
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Banner Slot */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout size={16} className="text-blue-600" />
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">배너 슬롯 배정</h4>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">관리자 직접 배정 시 즉시 활성화</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {[
                                { value: 'none',  label: '배정 안함', desc: '목록만 노출' },
                                { value: 'left',  label: '좌측 사이드', desc: '그랜드/프리미엄' },
                                { value: 'right', label: '우측 사이드', desc: '그랜드/프리미엄' },
                                { value: 'both',  label: '좌+우 세트', desc: '그랜드 전용' },
                                { value: 'inner', label: '내부 사이드바', desc: '디럭스/스페셜' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, banner_position: opt.value as any })}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center ${
                                        formData.banner_position === opt.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200'
                                    }`}
                                >
                                    <span className="text-[11px] font-black">{opt.label}</span>
                                    <span className="text-[9px] mt-0.5 opacity-70">{opt.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section 5: Content (선택사항 — 접기/펼치기) */}
                    <div className="space-y-3 pb-10">
                        <button
                            type="button"
                            onClick={() => setIsContentOpen(v => !v)}
                            className="flex items-center gap-2 w-full text-left group"
                        >
                            <FileText size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                                공고 상세 내용
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">선택사항 — 나중에 수정 가능</span>
                            <span className={`ml-auto text-slate-400 transition-transform duration-200 ${isContentOpen ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {isContentOpen && (
                            <textarea
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="공고 내용을 입력해 주세요 (HTML 사용 가능). 비워두면 클릭 시 기본 정보만 표시됩니다."
                                className="w-full h-40 px-6 py-5 bg-white border border-slate-200 rounded-3xl text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none shadow-inner"
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-50 bg-white flex gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-sm font-black hover:bg-slate-200 transition active:scale-95"
                    >
                        취소하기
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? '등록 중...' : <><Save size={18} /> 광고 즉시 등록 및 활성화</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
