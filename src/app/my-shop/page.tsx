'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    PlusSquare, AlignLeft, LayoutDashboard, Settings, Menu
} from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { usePreventLeave } from '@/hooks/usePreventLeave';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// --- Components ---
import BusinessDashboard from './components/dashboard/BusinessDashboard';
import PersonalDashboard from './components/dashboard/PersonalDashboard';
import AdForm from './AdForm';
import { useAdFormState } from './useAdFormState';
import { normalizeAd, normalizePayment } from './utils';

// --- Components (Refactored) ---
import { WarningModal } from './components/WarningModal';
import { DesignRequestModal } from './components/DesignRequestModal';
import { ExampleModal } from './components/ExampleModal';
import { AdDetailModal } from './components/AdDetailModal';
import { ResumeDetailModal } from './components/ResumeDetailModal';
import { BusinessMobileMenu } from './components/BusinessMobileMenu';
import { BusinessSidebar } from './components/BusinessSidebar';
import { MemberInfoForm } from './components/MemberInfoForm';
import { AdTemplateModal } from './components/AdTemplateModal';
import { OngoingAdsView } from './components/OngoingAdsView';
import { ClosedAdsView } from './components/ClosedAdsView';

// Simple Error Boundary for debugging
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("Critical Modal Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-50">
                    <div className="p-8 bg-white rounded-2xl shadow-xl max-w-md">
                        <h2 className="text-xl font-black text-red-600 mb-4">오류 발생</h2>
                        <p className="text-sm text-gray-600 mb-4">{this.state.error?.message || '알 수 없는 오류'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
import { PaymentsView } from './components/PaymentsView';
import { ApplicantsView } from './components/ApplicantsView';
import { ResumeForm } from './components/ResumeForm';

// --- Constants (Exported for sub-components) ---
import { JOB_CATEGORY_MAP as INDUSTRY_DATA_MAP } from '@/constants/jobs';
import { REGIONS_MAP as REGION_DATA_MAP } from '@/constants/regions';
import { PAY_TYPES as PAY_TYPES_CONST } from '@/constants/job-options';

export const INDUSTRY_DATA = INDUSTRY_DATA_MAP;
export const REGION_DATA = REGION_DATA_MAP;
export const PAY_TYPES = PAY_TYPES_CONST;

export default function MyShopPage() {
    // Force rebuild
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">로딩 중...</div>}>
            <MyShopContent />
        </Suspense>
    );
}

function MyShopContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const brand = useBrand();
    const { userType: authUserType, user: authUser } = useAuth();
    const [userType, setUserType] = useState<'corporate' | 'individual' | 'admin' | 'guest' | null>(null);
    const [isNewEntry, setIsNewEntry] = useState(false);
    const [editingAdId, setEditingAdId] = useState<any | null>(null);
    const editingAdIdRef = React.useRef<string | null>(null); // [Ref Fix] Synchronous ID storage
    const [isSaving, setIsSaving] = useState(false);
    const isJustSaved = React.useRef(false); // [Ref] Prevent "ZOMBIE" data overwriting immediately after save

    const [view, _setView] = useState<any>('dashboard');
    const [lastLoadedId, setLastLoadedId] = useState<string | null>(null); // [Fix] Prevent reload loop
    // Business Data States
    const [registeredAds, setRegisteredAds] = useState<any[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // --- Data Fetching (Supabase) ---
    const fetchRegisteredAds = async () => {
        if (!authUser?.id || authUser.id === 'guest') return;

        try {
            let dbData: any[] = [];
            if (!authUser.id.startsWith('mock_')) {
                const { data, error } = await supabase
                    .from('shops')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                dbData = data || [];
            }

            const mockAdsRaw = localStorage.getItem('coco_mock_ads');
            const mockAds = mockAdsRaw ? JSON.parse(mockAdsRaw) : [];

            // [Standard] Always normalize all data sources
            const finalAds = [...dbData, ...mockAds].map(normalizeAd);

            // [ZOMBIE PROTECTION] Skip update if we just saved to prevent "Reverting" UI
            if (isJustSaved.current) {
                return;
            }

            setRegisteredAds(finalAds);

        } catch (err: any) {
            console.warn("Fetch ads failed, falling back to local mocks:", err);
            const mockAdsRaw = localStorage.getItem('coco_mock_ads');
            if (mockAdsRaw) {
                const localMocks = JSON.parse(mockAdsRaw);
                setRegisteredAds(localMocks.map(normalizeAd)); // [Fix] Normalization required here too
            }
        } finally {
            setIsDataLoaded(true);
        }
    };

    const fetchPaymentHistory = async () => {
        if (!authUser?.id || authUser.id === 'guest') return;

        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false });

            const dbPayments = data || [];

            const mockPaymentsRaw = localStorage.getItem('my_site_payment_history');
            const mockPayments = mockPaymentsRaw ? JSON.parse(mockPaymentsRaw) : [];

            const finalPayments = [...dbPayments, ...mockPayments].map((p: any) => normalizePayment(p, formState.shopName));

            // [Debug/Test] If no payments exist, add a sample one for verification
            if (finalPayments.length === 0 && authUser.id !== 'guest') {
                // Removed auto-mock to avoid confusion
            }

            setPaymentHistory(finalPayments);
        } catch (err: any) {
            console.error("Fetch payments error:", err);
        }
    };

    const [resumeCount, setResumeCount] = useState(0);

    const fetchResumeCount = async () => {
        if (!authUser?.id || authUser.id === 'guest') return;
        try {
            let total = 0;
            if (!authUser.id.startsWith('mock_')) {
                const { count } = await supabase.from('resumes').select('*', { count: 'exact', head: true }).eq('user_id', authUser.id);
                total = count || 0;
            }
            const mock = localStorage.getItem('coco_mock_resumes');
            if (mock) {
                const mockList = JSON.parse(mock);
                // Simple filtering for simulated user if needed, but currently assumes local mocks are global for browser
                total += mockList.length;
            }
            setResumeCount(total);
        } catch (e) { console.warn(e); }
    };

    useEffect(() => {
        if (authUser?.id && authUser.id !== 'guest') {
            fetchRegisteredAds();
            fetchPaymentHistory();
            fetchResumeCount();
        }
    }, [authUser?.id, fetchRegisteredAds, fetchPaymentHistory, fetchResumeCount]);

    useEffect(() => {
        const handleUpdate = () => fetchResumeCount();
        window.addEventListener('resume-updated', handleUpdate);
        return () => window.removeEventListener('resume-updated', handleUpdate);
    }, [authUser?.id]);

    const setView = (newView: any, adId?: string, isNew?: boolean) => {
        const viewId = typeof newView === 'object' ? newView.id : newView;
        if (viewId === view && !adId && isNew === undefined) return;

        // [Critical Sync] Update state IMMEDIATELY for snappy UI response
        _setView(newView);

        const params = new URLSearchParams(searchParams.toString());
        params.set('view', viewId);

        // [New Sync] Handle new entry state explicitly in URL and State
        const finalIsNew = isNew !== undefined ? isNew : isNewEntry;
        setIsNewEntry(finalIsNew);

        if (finalIsNew && viewId === 'form') {
            params.set('new', 'true');
        } else {
            params.delete('new');
        }

        // Preserve or set ID if provided or moving to form in edit mode
        if (adId) {
            params.set('id', adId);
        } else if (viewId === 'dashboard') {
            params.delete('id');
            setLastLoadedId(null);
        }

        // [Fix] Use native replaceState to avoid "Failed to fetch" on RSC data fetching during simple view transitions
        // Next.js 14.1+ officially supports this for updating query params without server roundtrips.
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);

        // [Safety Fix] Force state update again after router call to ensure it sticks
        if (finalIsNew !== isNewEntry) setIsNewEntry(finalIsNew);

        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    // [Scroll Fix] Secondary guard to ensure scroll to top when view changes via URL or internal state
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [view]);

    // Modal States
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showExampleModal, setShowExampleModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [exampleType, setExampleType] = useState<any>(null);
    const [selectedAdForModal, setSelectedAdForModal] = useState<any>(null);
    const [selectedResumeForModal, setSelectedResumeForModal] = useState<any>(null);

    // Form State (Hook)
    const formState = useAdFormState();

    useBodyScrollLock(!!selectedAdForModal || !!selectedResumeForModal || showDesignModal || showMobileMenu || showExampleModal);
    usePreventLeave(formState.isDirty && view === 'form');

    useEffect(() => {
        const simulate = searchParams.get('simulate');
        const viewParam = searchParams.get('view');
        if (authUserType) {
            if (authUserType === 'admin' && !simulate) {
                // [Security] Only redirect if absolutely NO view context exists
                if (!viewParam && !searchParams.has('view') && searchParams.toString() === '') {
                    router.replace('/admin');
                    return;
                }
            }
            setUserType(authUserType === 'admin' ? (simulate === 'individual' ? 'individual' : 'corporate') : authUserType);
        }
    }, [authUserType, authUser.id, authUser.name, authUser.nickname, searchParams]);

    useEffect(() => {
        const viewParam = (searchParams.get('view') || 'dashboard') as any;
        const currentViewId = typeof view === 'object' ? view.id : view;

        // [Critical Fix] If view is an object (contains edit data), don't overwrite it
        // with a simple string from the URL if the IDs already match.
        // [Sync Optimization] Only sync from URL if it's a fresh navigation.
        if (viewParam !== currentViewId) {
            _setView(viewParam);
        }
    }, [searchParams]); // Remove 'view' from dependencies to prevent race condition revert

    useEffect(() => {
        const handleToggle = () => setShowMobileMenu(true);
        window.addEventListener('toggle-mobile-menu', handleToggle);
        return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
    }, []);

    useEffect(() => {
        const adIdParam = searchParams.get('id');
        const viewParam = searchParams.get('view');
        const hasNewParam = searchParams.has('new');
        const isNewParam = searchParams.get('new') === 'true';

        // [Critical Fix] Only sync isNewEntry from URL if we are NOT in the middle of a view transition
        // or if the URL explicitly has the 'new' parameter.
        if (viewParam === 'form') {
            if (hasNewParam) {
                setIsNewEntry(isNewParam);
            } else if (!editingAdId && !adIdParam) {
                // If we're in form but no ID and no 'new' param, it might be a weird state, 
                // but we should default to what it was or true if it was triggered as new.
            }
        }

        setEditingAdId(adIdParam);
        if (view === 'form' && adIdParam && isDataLoaded && registeredAds.length > 0) {
            if (lastLoadedId !== adIdParam) {
                const ad = registeredAds.find(a => String(a.id) === String(adIdParam));
                if (ad) {
                    formState.loadAdData(ad);
                    setLastLoadedId(adIdParam);
                }
            }
        } else if (view !== 'form') {
            if (lastLoadedId !== null) setLastLoadedId(null);
        }
    }, [searchParams, view, isDataLoaded, registeredAds, lastLoadedId]);

    const onPreview = () => {
        const newAd = {
            id: 'preview',
            title: formState.title || '제목을 입력해주세요',
            nickname: formState.nickname || '관리자',
            managerName: formState.managerName,
            managerPhone: formState.managerPhone,
            messengers: formState.messengers || [],
            category: formState.industryMain || '업종',
            categorySub: formState.industrySub,
            regionCity: formState.regionCity || '지역',
            regionGu: formState.regionGu,
            payType: formState.payType || '시급',
            payAmount: formState.payAmount || 0,
            content: formState.editorRef.current?.innerHTML || '<p>내용이 없습니다.</p>',
            keywords: formState.selectedKeywords || [],
            updateDate: new Date().toISOString().split('T')[0],
            deadline: new Date(Date.now() + (Number(formState.selectedAdPeriod || 30)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            applicantCount: 0,
            status: 'PENDING_REVIEW',
            productType: formState.selectedAdProduct || '그랜드',
            options: {
                icon: formState.selectedIcon,
                icon_period: formState.iconPeriod,
                highlighter: formState.selectedHighlighter,
                highlighter_period: formState.highlighterPeriod,
                border: formState.borderOption,
                border_period: formState.borderPeriod,
                paySuffixes: formState.paySuffixes,
                messengers: formState.messengers,
                keywords: formState.selectedKeywords
            },
            // [Fix] Add flattened fields for AdDetailModal compatibility
            selectedIcon: formState.selectedIcon,
            selectedHighlighter: formState.selectedHighlighter,
            borderOption: formState.borderOption,
            paySuffixes: formState.paySuffixes
        };
        setSelectedAdForModal(newAd);
    };

    const handleDelete = async (adId: number | string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            // [Admin Bypass] Admin can delete any ad
            const isAdmin = userType === 'admin';

            if (!authUser.id.startsWith('mock_')) {
                // Admin uses service role to bypass RLS
                if (isAdmin) {
                    const { error } = await supabase.from('shops').delete().eq('id', adId);
                    if (error) {
                        throw error;
                    }
                } else {
                    // Regular user - RLS applies
                    const { error } = await supabase.from('shops').delete().eq('id', adId).eq('user_id', authUser.id);
                    if (error) {
                        throw error;
                    }
                }
            }

            // Also remove from localStorage
            const mockAdsRaw = localStorage.getItem('coco_mock_ads');
            if (mockAdsRaw) {
                const mockAds = JSON.parse(mockAdsRaw);
                const newMocks = mockAds.filter((a: any) => String(a.id) !== String(adId));
                localStorage.setItem('coco_mock_ads', JSON.stringify(newMocks));
            }

            // Instant UI update + DB refresh
            setRegisteredAds(prev => prev.filter(a => String(a.id) !== String(adId)));
            fetchRegisteredAds();

        } catch (err: any) {
            console.error('[DELETE] Failed:', err);
            alert("삭제 실패: " + err.message);
        }
    };

    const handleSave = async () => {
        try {
            // [Validation UX 강화] 상세 누락 항목 체크 및 자동 스크롤
            const missingFields = [];

            // [Fix] Auto-fill Manager Name if missing (Safety Net)
            let finalManagerName = formState.managerName?.trim();
            if (!finalManagerName) {
                // Priority: Real Name > '관리자'
                finalManagerName = (authUser?.name && authUser.name !== '게스트') ? authUser.name : '관리자';
                formState.setManagerName(finalManagerName); // Update State for UI
            }

            // Step 1: Shop Info
            if (!formState.shopName?.trim()) missingFields.push('상호명');
            if (!finalManagerName) missingFields.push('담당자명');
            if (!formState.managerPhone?.trim()) missingFields.push('연락처');

            // Step 2: Job Detail
            if (!formState.title?.trim()) missingFields.push('공고 제목');
            if (!formState.industryMain) missingFields.push('업종 선택');
            if (!formState.regionCity) missingFields.push('지역 선택');
            if (!formState.payType || formState.payType === '종류선택') missingFields.push('급여 방식');
            if (!formState.payAmount || Number(formState.payAmount) === 0) missingFields.push('급여 금액');

            if (missingFields.length > 0) {
                alert(`[필수 항목 누락]\n${missingFields.join(', ')} 항목을 입력해주세요.`);
                // 누락된 필드에 따라 자동 스크롤
                const targetId = (!formState.shopName || !formState.managerName || !formState.managerPhone) ? 'myshop-step-1' :
                    (!formState.title || !formState.industryMain || !formState.regionCity) ? 'myshop-step-2' : 'myshop-step-3';

                const element = document.getElementById(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }

            if (!formState.selectedAdProduct) {
                alert('메인 광고 상품을 선택해주세요.');
                document.getElementById('myshop-step-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            // selectedAdPeriod는 30|60|90 타입이므로 ! 체크가 항상 false임

            if (formState.borderOption !== 'none' && formState.borderPeriod === 0) {
                alert("'테두리 효과'의 기간을 선택해주세요.");
                document.getElementById('myshop-step-4')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            setIsSaving(true);
            // [Fix] 에디터 내용 최종 동기화 강제 (저장 직전)
            if (formState.editorRef.current) {
                formState.setEditorHtml(formState.editorRef.current.innerHTML);
            }

            // --- Step 4 Validation ---
            if (formState.selectedIcon && Number(formState.iconPeriod) === 0) {
                alert("'10종 무빙 아이콘'의 기간을 선택해주세요."); setIsSaving(false); return;
            }
            if (formState.selectedHighlighter && Number(formState.highlighterPeriod) === 0) {
                alert("'10종 형광펜'의 기간을 선택해주세요."); setIsSaving(false); return;
            }
            if (formState.borderOption !== 'none' && Number(formState.borderPeriod) === 0) {
                alert("'테두리 효과'의 기간을 선택해주세요."); setIsSaving(false); return;
            }

            // --- Monthly Edit Limit Logic ---
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const originalAd = editingAdId ? registeredAds.find(a => String(a.id) === String(editingAdId)) : null;

            // [Resilient Retrieval] Fallback to multiple potential locations for edit_count
            let editCount = originalAd?.options?.edit_count || originalAd?.edit_count || 0;
            const lastEditMonth = originalAd?.options?.last_edit_month || originalAd?.last_edit_month;

            // 월이 바뀌었으면 0으로 초기화
            if (lastEditMonth !== currentMonth) {
                editCount = 0;
            }

            if (editingAdId) {
                editCount += 1;
            }

            const isMockUser = authUser.id.startsWith('mock_');
            const isTargetMock = editingAdId ? String(editingAdId).startsWith('AD_MOCK_') : isMockUser;

            const cleanContent = formState.editorRef.current?.innerHTML || formState.editorHtml;
            const cleanNickname = formState.nickname || authUser.nickname || '관리자';

            // [Strategy] Reject if payload contains massive Base64 images
            if (cleanContent.includes('data:image/') && cleanContent.length > 800000) {
                alert("이미지 용량이 너무 큽니다. 에디터에 직접 붙여넣은 이미지는 한 개당 0.5MB를 초과할 수 없습니다. 이미지를 압축하거나 파일 업로드 기능을 이용해주세요.");
                setIsSaving(false);
                return;
            }

            // [Strategy] Preserve original product info if in edit mode
            const finalProductType = originalAd ? (originalAd.productType || originalAd.ad_type || formState.selectedAdProduct) : formState.selectedAdProduct;
            const finalDeadline = originalAd ? (originalAd.deadline || originalAd.options?.deadline) : (new Date(Date.now() + (Number(formState.selectedAdPeriod || 30)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

            // [Fix] Remove forced sanitization - let user select what they want
            const cleanCategorySub = formState.industrySub || '';

            const adData: any = {
                // [Standard Root Columns] - V4 DB 컬럼명 100% 준수
                name: formState.shopName,
                title: formState.title,
                region: formState.regionCity,
                phone: formState.managerPhone,
                kakao: formState.messengers.kakao,
                telegram: formState.messengers.telegram,
                tier: finalProductType,
                pay: String(formState.payAmount),
                pay_amount: parseInt(String(formState.payAmount).replace(/,/g, '') || '0'),
                pay_type: formState.payType,
                category: formState.industryMain,
                category_sub: cleanCategorySub,
                work_region_sub: formState.regionGu,
                content: cleanContent,
                nickname: cleanNickname,
                manager_name: formState.managerName,
                manager_phone: formState.managerPhone,
                media_url: formState.mediaUrl,
                edit_count: editCount,
                last_edit_month: currentMonth,
                ad_price: formState.totalAmount,
                updated_at: new Date().toISOString(),
                status: 'pending',
                user_id: authUser.id,
                deadline: finalDeadline,
                product_type: finalProductType,

                // [Snapshot Bucket] - UI용 핵심 정보 보관
                options: {
                    ...(originalAd?.options || {}),
                    managerName: formState.managerName,
                    managerPhone: formState.managerPhone,
                    payType: formState.payType,
                    payAmount: parseInt(String(formState.payAmount).replace(/,/g, '') || '0'),
                    product_type: finalProductType,
                    product_period: originalAd ? (originalAd.options?.product_period || originalAd.productPeriod) : formState.selectedAdPeriod,
                    status: 'pending',
                    deadline: finalDeadline,
                    keywords: formState.selectedKeywords,
                    icon: formState.selectedIcon,
                    icon_period: formState.iconPeriod,
                    highlighter: formState.selectedHighlighter,
                    highlighter_period: formState.highlighterPeriod,
                    border: formState.borderOption,
                    border_period: formState.borderPeriod,
                    pay_suffixes: formState.paySuffixes,
                    ad_price: formState.totalAmount,
                    ageMin: formState.ageMin,
                    ageMax: formState.ageMax,
                    addressDetail: formState.addressDetail,
                    regionCity: formState.regionCity,
                    regionGu: formState.regionGu,
                    mediaUrl: formState.mediaUrl
                }
            };

            let newShopId: any = editingAdId;
            if (editingAdId) {
                if (!isTargetMock) {
                    // [Critical Fix] Real DB Ad Update
                    // Remove 'ad_price' AND 'price' from DB payload as columns may not exist
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    // [Critical Fix] Strictly filter payload for 'shops' table update
                    const validColumns = [
                        'name', 'title', 'region', 'phone', 'kakao', 'telegram', 'tier',
                        'pay', 'pay_amount', 'pay_type', 'category', 'category_sub',
                        'work_region_sub', 'content', 'nickname', 'manager_name', 'manager_phone',
                        'edit_count', 'last_edit_month', 'ad_price', 'updated_at', 'status', 'user_id', 'deadline', 'options', 'product_type', 'media_url'
                    ];
                    const dbPayload: any = {};
                    validColumns.forEach(col => {
                        const val = adData[col];
                        if (val !== undefined && val !== null) {
                            // [Standard Fix] Trust Supabase-js for automatic JSON serialization
                            dbPayload[col] = val;
                        }
                    });

                    const { data, error } = await supabase.from('shops')
                        .update(dbPayload)
                        .eq('id', String(editingAdId))
                        .select()
                        .single();

                    if (error) throw new Error(`DB 업데이트 실패: ${error.message}`);
                    if (!data) throw new Error("업데이트할 공고를 찾을 수 없습니다.");
                }
                else {
                    // [Fix] Mock Ad Update (localStorage)
                    const mockAds = JSON.parse(localStorage.getItem('coco_mock_ads') || '[]');
                    const idx = mockAds.findIndex((a: any) => String(a.id) === String(editingAdId));
                    if (idx !== -1) {
                        mockAds[idx] = { ...mockAds[idx], ...adData };
                        localStorage.setItem('coco_mock_ads', JSON.stringify(mockAds));
                    } else {
                        throw new Error("수정하려는 임시 데이터를 찾을 수 없습니다.");
                    }
                }
                // [Critical Fix] Normalized Update to keep UI consistent with form fields
                setRegisteredAds(prev => prev.map(a =>
                    String(a.id) === String(editingAdId)
                        ? normalizeAd({ ...a, ...adData, options: { ...(a.options || {}), ...(adData.options || {}) } })
                        : a
                ));
            } else {
                if (!isTargetMock) {
                    // [Critical Fix] Payload Sanitization - Filter only valid shops table columns
                    const validColumns = [
                        'name', 'title', 'region', 'phone', 'kakao', 'telegram', 'tier',
                        'pay', 'pay_amount', 'pay_type', 'category', 'category_sub',
                        'work_region_sub', 'content', 'nickname', 'manager_name', 'manager_phone',
                        'edit_count', 'last_edit_month', 'ad_price', 'updated_at', 'status', 'user_id', 'deadline', 'options', 'product_type', 'media_url'
                    ];
                    const dbPayload: any = {};
                    validColumns.forEach(col => {
                        const val = adData[col];
                        if (val !== undefined && val !== null) {
                            // [Standard Fix] Trust Supabase-js for automatic JSON serialization
                            dbPayload[col] = val;
                        }
                    });

                    const { data, error } = await supabase.from('shops').insert([dbPayload]).select().single();
                    if (error) throw new Error(`DB 삽입 실패: ${error.message}`);
                    newShopId = data.id;
                    // [Added] Insert into local state with normalization
                    setRegisteredAds(prev => [normalizeAd(data), ...prev]);
                } else {
                    const newId = `AD_MOCK_${Date.now()}`;
                    const mockAds = JSON.parse(localStorage.getItem('coco_mock_ads') || '[]');
                    const newMockAd = { ...adData, id: newId, isMock: true, created_at: new Date().toISOString() };
                    localStorage.setItem('coco_mock_ads', JSON.stringify([newMockAd, ...mockAds]));
                    newShopId = newId;
                    setRegisteredAds(prev => [normalizeAd(newMockAd), ...prev]);
                }
            }

            if (!editingAdId && newShopId && formState.totalAmount > 0) {
                const paymentData = {
                    user_id: isTargetMock ? null : authUser.id,
                    shop_id: newShopId,
                    amount: formState.totalAmount,
                    // pay_type removed - stored in metadata.product_type
                    method: 'bank_transfer',               // [Standard] V4 스키마 준수 (method)
                    status: 'pending',
                    description: `[${formState.selectedAdProduct}] ${formState.shopName} 공고 결제`,
                    metadata: {
                        nickname: cleanNickname,
                        shopName: formState.shopName,
                        adTitle: formState.title,
                        product_type: finalProductType // Legacy/Audit compat
                    },
                    created_at: new Date().toISOString()
                };
                if (!isTargetMock) {
                    const { error } = await supabase.from('payments').insert([paymentData]);
                    if (error) {
                        console.error("Payment log failed", error);
                        alert(`결제 내역 생성 실패: ${error.message}`);
                    }
                }
                const localPayments = JSON.parse(localStorage.getItem('my_site_payment_history') || '[]');
                localStorage.setItem('my_site_payment_history', JSON.stringify([{ ...paymentData, id: `PAY_MOCK_${Date.now()}` }, ...localPayments]));
            }

            alert('등록/수정이 완료되었습니다.');

            // [Critical Fix] Clean up BEFORE redirect to prevent confirm dialog
            formState.resetAdStates();
            window.dispatchEvent(new CustomEvent('resume-updated'));

            // [Zombie Protection] Prevent stale re-fetch
            isJustSaved.current = true;
            setTimeout(() => { isJustSaved.current = false; }, 10000);

            // [Fix] Force hard redirect (AFTER cleanup to avoid confirm dialog)
            // [Fix] Use setView for SPA navigation to prevent browser confirm dialog
            setView('dashboard');
        } catch (err: any) {
            console.error("Save Error:", err);
            if (err.message?.includes('Failed to fetch')) {
                alert(`DB 연결 오류 (Failed to fetch): 네트워크가 불안정하거나 서버 응답 크기가 너무 큽니다.\n\n[진단 팁]\n1. 브라우저의 '광고 차단 프로그램(AdBlock 등)'을 끈 뒤 재시도해주세요.\n2. 에디터에 붙여넣은 대용량 이미지가 있다면 삭제 후 다시 작성해주세요.\n3. 계속 발생할 경우 사내망 방화벽을 확인해주세요.`);
            } else {
                alert(`오류: ${err.message}`);
            }
        }
        finally { setIsSaving(false); }
    };

    // [Feature] Auto-fill Manager Info from Auth
    useEffect(() => {
        if (view === 'form' && authUser && authUser.id !== 'guest') {
            if (!formState.managerName) {
                const name = (authUser.name && authUser.name !== '게스트') ? authUser.name : '관리자';
                formState.setManagerName(name);
            }
            // phone exists in some session structures, check and fill if available
            const userPhone = (authUser as any).phone || (authUser as any).phoneNumber;
            if (!formState.managerPhone && userPhone) {
                formState.setManagerPhone(userPhone);
            }
        }
    }, [view, authUser, formState.managerName, formState.managerPhone]);

    const handleBack = () => {
        // [Fix] Restore exit confirmation logic
        if (formState.isDirty) {
            if (!window.confirm('작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?')) {
                return;
            }
        }
        formState.resetAdStates();
        setView('dashboard');
    };

    // [Feature] Real-time Sync Payment History with Latest Ad Data
    const syncedPaymentHistory = paymentHistory.map(p => {
        const sid = String(p.shop_id || p.shopId || p.adObject?.id || '');
        const latestAd = registeredAds.find(ad => String(ad.id) === sid);
        if (latestAd) {
            return {
                ...p,
                adTitle: latestAd.title, // [Sync] Overwrite title with latest
                nickname: latestAd.nickname, // [Sync] Overwrite nickname with latest
                // [Sync] Overwrite adObject with latest data to show correct badges and edit count
                adObject: {
                    ...p.adObject,
                    ...latestAd,
                    title: latestAd.title,
                    nickname: latestAd.nickname,
                    options: {
                        ...(p.adObject?.options || {}),
                        ...(latestAd.options || {}),
                        edit_count: latestAd.edit_count || 0
                    }
                }
            };
        }
        return p;
    });

    if (!mounted || userType === null) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;

    const execCmd = (cmd: string, val?: string) => { formState.restoreSelection(); document.execCommand(cmd, false, val); formState.updateToolbarStatus(); formState.syncEditorHtml(); };
    const insertEmoji = (emoji: string) => { formState.restoreSelection(); document.execCommand('insertText', false, emoji); formState.syncEditorHtml(); };
    const handlePayTypeChange = (e: any) => formState.setPayType(e.target.value);
    const handlePayAmountChange = (e: any) => formState.setPayAmount(e.target.value.replace(/[^0-9]/g, ''));
    const togglePaySuffix = (s: string) => {
        if (formState.paySuffixes.includes(s)) formState.setPaySuffixes(formState.paySuffixes.filter(x => x !== s));
        else if (formState.paySuffixes.length < 6) formState.setPaySuffixes([...formState.paySuffixes, s]);
    };

    return (
        <div className={`h-auto ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'} pb-24`}>
            {/* Modals */}
            {showWarningModal && (
                <WarningModal
                    brand={brand}
                    onClose={() => setShowWarningModal(false)}
                    onConfirm={() => {
                        if (isNewEntry) {
                            formState.resetAdStates();
                            setView('form', undefined, true);
                        } else {
                            // [Critical Fix] Read from Ref to guarantee we have the ID regardless of render cycle
                            const targetId = editingAdIdRef.current;
                            if (targetId) {
                                setView('form', targetId, false);
                            } else {
                                // Fallback
                                setView('form', undefined, false);
                            }
                        }
                        setShowWarningModal(false);
                    }}
                />
            )}
            {showDesignModal && <DesignRequestModal brand={brand} onClose={() => setShowDesignModal(false)} />}
            {showExampleModal && <ExampleModal show={true} type={exampleType} onClose={() => setShowExampleModal(false)} brand={brand} />}
            {showTemplateModal && (
                <AdTemplateModal
                    brand={brand}
                    onClose={() => setShowTemplateModal(false)}
                    onApply={(html) => {
                        if (formState.editorRef.current) {
                            formState.editorRef.current.innerHTML = html;
                            formState.syncEditorHtml();
                            formState.setIsEditorDirty(true);
                        }
                    }}
                />
            )}

            {selectedAdForModal && (
                <ErrorBoundary>
                    <AdDetailModal ad={selectedAdForModal} onClose={() => setSelectedAdForModal(null)} />
                </ErrorBoundary>
            )}
            {selectedResumeForModal && (
                <ErrorBoundary>
                    <ResumeDetailModal resume={selectedResumeForModal} onClose={() => setSelectedResumeForModal(null)} />
                </ErrorBoundary>
            )}

            {showMobileMenu && (
                <BusinessMobileMenu
                    brand={brand}
                    onClose={() => setShowMobileMenu(false)}
                    setView={setView}
                    shopName={userType === 'individual' ? (authUser?.nickname || authUser?.name || '개인회원') : (formState.shopName || '내 상점')}
                    nickname={formState.nickname || authUser?.nickname || '회원님'}
                    router={router}
                    userType={userType}
                />
            )}

            {/* Content View */}
            {view !== 'form' && (
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    {/* Common Header */}
                    <div
                        className={`p-4 md:p-6 sm:rounded-[32px] shadow-sm border mb-5 mt-2 md:mt-4 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
                    >
                        <div className="flex justify-between items-center">
                            <h1 onClick={() => setView('dashboard')} className="text-xl md:text-2xl font-black flex items-center gap-3 cursor-pointer hover:text-blue-500 transition">
                                <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
                                마이페이지
                            </h1>
                            <div className="text-xs font-bold text-gray-400">MY DASHBOARD</div>
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 ${userType === 'individual' ? '' : 'md:grid-cols-4'} gap-4 md:pt-0 md:pb-6`}>
                        {userType === 'corporate' && (
                            <BusinessSidebar brand={brand} shopName={formState.shopName} nickname={formState.nickname || authUser?.nickname || '사장님'} view={view} setView={setView} />
                        )}

                        <div className={userType === 'individual' ? 'w-full' : 'col-span-3 space-y-4'}>
                            {userType === 'individual' ? (
                                <PersonalDashboard view={view} setView={setView} resumeCount={resumeCount} onShowResumeDetail={(r) => setSelectedResumeForModal(r)} authUser={authUser} />
                            ) : (
                                <>
                                    {view === 'dashboard' && (
                                        <BusinessDashboard
                                            brand={brand} shopName={formState.shopName} nickname={formState.nickname} isVerified={formState.isVerified}
                                            handleAdClick={(isNew, ad) => {
                                                // [Critical Fix] Synchronous State Update Sequence
                                                setIsNewEntry(isNew);
                                                if (!isNew && ad) {
                                                    setEditingAdId(ad.id);
                                                    editingAdIdRef.current = ad.id; // [Ref Fix] Store immediately
                                                    formState.loadAdData(ad);
                                                } else {
                                                    setEditingAdId(null);
                                                    editingAdIdRef.current = null;
                                                    formState.resetAdStates();
                                                }
                                                // Open modal immediately, Ref ensures safety
                                                setShowWarningModal(true);
                                            }}
                                            setShowDesignModal={setShowDesignModal} setView={setView} router={router} ads={registeredAds} onOpenMenu={() => setShowMobileMenu(true)} onShowAdDetail={(ad) => setSelectedAdForModal(ad)} onDeleteAd={handleDelete}
                                        />
                                    )}
                                    {view === 'ongoing-ads' && <OngoingAdsView setView={setView} userName={formState.shopName} ads={registeredAds} onShowAdDetail={setSelectedAdForModal} onOpenMenu={() => setShowMobileMenu(true)} onDeleteAd={handleDelete} onEditAd={(ad) => { setIsNewEntry(false); setEditingAdId(ad.id); editingAdIdRef.current = ad.id; formState.loadAdData(ad); setShowWarningModal(true); }} />}
                                    {view === 'payments' && <PaymentsView setView={setView} userName={formState.shopName} payments={syncedPaymentHistory} onShowAdDetail={(item) => { const ad = typeof item === 'object' ? item : registeredAds.find(a => String(a.id) === String(item)); if (ad) setSelectedAdForModal(ad); else alert('공고 상세 정보를 찾을 수 없습니다.'); }} onOpenMenu={() => setShowMobileMenu(true)} />}
                                    {view === 'member-info' && <MemberInfoForm {...formState} brand={brand} setView={setView} onOpenMenu={() => setShowMobileMenu(true)} />}
                                    {view === 'closed-ads' && <ClosedAdsView setView={setView} userName={formState.shopName} ads={registeredAds.filter(ad => ad.isClosed)} onShowAdDetail={setSelectedAdForModal} onOpenMenu={() => setShowMobileMenu(true)} />}
                                    {view === 'applicants' && <ApplicantsView setView={setView} userName={formState.shopName} onOpenMenu={() => setShowMobileMenu(true)} />}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {view === 'form' && (
                <div className="w-full">
                    <AdForm {...formState} isSaving={isSaving} isNewEntry={isNewEntry} brand={brand} setShowDesignModal={setShowDesignModal} setShowTemplateModal={setShowTemplateModal} handleEditorInteract={formState.updateToolbarStatus} saveSelection={formState.saveSelection} execCmd={execCmd} insertEmoji={insertEmoji} handlePayTypeChange={handlePayTypeChange} handlePayAmountChange={handlePayAmountChange} togglePaySuffix={togglePaySuffix} setExampleType={setExampleType} setShowExampleModal={setShowExampleModal} onSave={handleSave} onBack={handleBack} onPreview={onPreview} setSelectedAdPeriod={(v: any) => formState.setSelectedAdPeriod(v)} setBorderOption={(v: any) => formState.setBorderOption(v)} setBorderPeriod={(v: any) => formState.setBorderPeriod(v)} setIconPeriod={(v: any) => formState.setIconPeriod(v)} setHighlighterPeriod={(v: any) => formState.setHighlighterPeriod(v)} />
                </div>
            )}
        </div>
    );
}
