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

// --- Components (Refactored) ---
import { WarningModal } from './components/WarningModal';
import { DesignRequestModal } from './components/DesignRequestModal';
import { ExampleModal } from './components/ExampleModal';
import { AdDetailModal } from './components/AdDetailModal';
import { BusinessMobileMenu } from './components/BusinessMobileMenu';
import { BusinessSidebar } from './components/BusinessSidebar';
import { MemberInfoForm } from './components/MemberInfoForm';
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
                <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-red-50 text-red-600 p-10 font-bold overflow-auto bg-opacity-100">
                    <h2 className="text-3xl mb-4">💥 미리보기 중 오류 발생</h2>
                    <p className="text-xl text-black mb-4">아래 오류 메시지를 개발자에게 캡처해서 전달해주세요.</p>
                    <pre className="bg-white p-6 rounded-xl border border-red-200 shadow-xl text-left max-w-4xl w-full overflow-auto text-sm text-gray-800">
                        {this.state.error?.toString()}
                        <br />
                        {this.state.error?.stack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-8 py-4 bg-red-600 text-white rounded-xl font-black hover:bg-red-700 transition"
                    >
                        페이지 새로고침
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
import { PaymentsView } from './components/PaymentsView';
import { ApplicantsView } from './components/ApplicantsView';
import { PersonalMobileMenu } from './components/PersonalMobileMenu';
import { PersonalMemberEdit } from './components/PersonalMemberEdit';
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
    const [view, _setView] = useState<'dashboard' | 'form' | 'member-info' | 'resume-form' | 'member-edit' | 'ongoing-ads' | 'closed-ads' | 'payments' | 'applicants' | 'resume-list' | 'scrap-jobs' | 'payment-history' | 'excluded-shops' | 'custom-jobs' | 'my-posts' | 'block-settings' | 'post-bookmarks'>('dashboard');
    const [userType, setUserType] = useState<'corporate' | 'individual' | 'admin' | 'guest' | null>(null);
    const [isNewEntry, setIsNewEntry] = useState(false);
    const [editingAdId, setEditingAdId] = useState<number | null>(null);

    // Business Data States
    const [registeredAds, setRegisteredAds] = useState<any[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // --- Data Fetching (Supabase) ---
    const fetchRegisteredAds = async () => {
        if (!authUser?.id || authUser.id === 'guest') return;

        try {
            // [Fix] ownerId 컬럼이 없거나 타입이 안 맞으면 에러가 날 수 있으므로 감싸줌
            const { data, error } = await supabase
                .from('shops')
                .select('*')
                .eq('ownerId', authUser.id) // DB 컬럼명이 ownerId인 경우
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Supabase fetch ads error (fallback to local):", error.message || error);
                // 모의 계정인 경우 에러를 띄우지 않고 로컬/빈 데이터로 진행
                if (authUser.id.startsWith('mock_')) {
                    setRegisteredAds([]);
                    setIsDataLoaded(true);
                    return;
                }
                throw error;
            }

            if (data) {
                const dbAds = data.map((ad: any) => ({
                    ...ad,
                    deadline: ad.deadline || '2026-03-25'
                }));

                // [Mock Persistence] 로컬에 저장된 모의 공고가 있다면 합치기
                const mockAdsRaw = localStorage.getItem('coco_mock_ads');
                const mockAds = mockAdsRaw ? JSON.parse(mockAdsRaw) : [];

                setRegisteredAds([...dbAds, ...mockAds]);
            }
        } catch (err) {
            console.error("Critical fetch ads error:", err);
            // 최후의 수단: 빈 배열로 초기화하여 로딩 무한 루프 방지
            setRegisteredAds([]);
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

            if (error) {
                console.warn("Supabase fetch payments error:", error.message || error);
                // Fallback for safety during transition
                const savedPayments = localStorage.getItem('my_site_payment_history');
                if (savedPayments) {
                    setPaymentHistory(JSON.parse(savedPayments));
                } else {
                    setPaymentHistory([]);
                }
                return;
            }

            if (data) {
                // UI 포맷에 맞춰 데이터 변환
                setPaymentHistory(data.map((p: any) => ({
                    id: p.id,
                    desc: p.description || '광고 결제',
                    price: (p.amount || 0).toLocaleString() + '원',
                    method: p.method === 'bank_transfer' ? '무통장입금' : p.method,
                    date: new Date(p.created_at).toLocaleString(),
                    status: p.status === 'completed' ? '결제완료' : '대기',
                    type: p.ad_type || 'AD'
                })));
            }
        } catch (err) {
            console.error("Critical fetch payments error:", err);
            setPaymentHistory([]);
        }
    };

    const [resumeCount, setResumeCount] = useState(0);

    const fetchResumeCount = async () => {
        if (!authUser?.id || authUser.id === 'guest') return;
        try {
            const { count, error } = await supabase
                .from('resumes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', authUser.id);

            if (!error && count !== null) setResumeCount(count);
        } catch (e) {
            console.warn("Resume fetch failed (table may be missing):", e);
        }
    };

    useEffect(() => {
        if (authUser?.id && authUser.id !== 'guest') {
            fetchRegisteredAds();
            fetchPaymentHistory();
            fetchResumeCount();
        }
    }, [authUser?.id]);

    const setView = (newView: any) => {
        if (newView === view) return;

        // [Persistence Fix] 기존 쿼리 파라미터(simulate 등) 유지
        const params = new URLSearchParams(searchParams.toString());
        if (newView === 'dashboard') {
            params.delete('view');
            params.delete('id'); // 상세 ID 제거
        } else {
            params.set('view', newView);
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Modal States
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showExampleModal, setShowExampleModal] = useState(false);
    const [exampleType, setExampleType] = useState<any>(null);
    const [selectedAdForModal, setSelectedAdForModal] = useState<any>(null);

    // Form State (Hook)
    const formState = useAdFormState();

    // Body Scroll Lock (ALL MODALS)
    useBodyScrollLock(!!selectedAdForModal || showDesignModal || showMobileMenu || showExampleModal);

    // Prevent Leave
    usePreventLeave(formState.isDirty && view === 'form');

    // --- Auth & Init (Synced with useAuth) ---
    useEffect(() => {
        const simulate = searchParams.get('simulate');
        const viewParam = searchParams.get('view');

        if (authUserType) {
            // [New] 관리자인데 시뮬레이션/폼 진입이 아닌 경우에만 리다이렉트
            if (authUserType === 'admin' && !simulate && !viewParam) {
                router.replace('/admin');
                return;
            }

            // 관리자인 경우 시뮬레이션 파라미터에 따라 타입 설정 (기본값 corporate)
            if (authUserType === 'admin') {
                setUserType(simulate === 'individual' ? 'individual' : 'corporate');
            } else {
                setUserType(authUserType);
            }

            // [Fix] 값이 비어 있을 때만 초기화 (닉네임 입력 잠김 방지)
            if (authUser.name && !formState.shopName) formState.setShopName(authUser.name);
            if (authUser.nickname && !formState.nickname) formState.setNickname(authUser.nickname);
        }
    }, [authUserType, authUser.id, authUser.name, authUser.nickname, router, searchParams]);

    // --- View Sync from URL ---
    useEffect(() => {
        const viewParam = (searchParams.get('view') || 'dashboard') as any;
        if (viewParam !== view) {
            _setView(viewParam);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [searchParams, view]);

    // --- Mobile Menu Toggle handling ---
    useEffect(() => {
        const handleToggle = () => setShowMobileMenu(true);
        window.addEventListener('toggle-mobile-menu', handleToggle);
        return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
    }, []);

    // --- Restore Edit State from URL (Fix for Mobile/Refresh) ---
    useEffect(() => {
        const adIdParam = searchParams.get('id');
        if (view === 'form' && adIdParam && isDataLoaded && registeredAds.length > 0) {
            const adId = adIdParam; // Supabase uses UUID/String usually, check ad.id type
            const ad = registeredAds.find(a => String(a.id) === String(adId));
            if (ad) {
                setEditingAdId(adId as any);
                setIsNewEntry(false);
                if (!formState.title) {
                    formState.loadAdData(ad);
                }
            }
        }
    }, [searchParams, view, isDataLoaded, registeredAds, editingAdId, formState]);

    // Handlers
    const onPreview = () => {
        console.log("onPreview Triggered - Parsing Real Data");

        // Map formState to Ad structure
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
            ageMin: formState.ageMin,
            ageMax: formState.ageMax,
            payType: formState.payType || '시급',
            payAmount: formState.payAmount || 0,
            content: formState.editorRef.current?.innerHTML || '<p>내용이 없습니다.</p>',
            keywords: formState.selectedKeywords || [],
            updateDate: new Date().toISOString().split('T')[0],
            deadline: new Date(Date.now() + (Number(formState.selectedAdPeriod) || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            applicantCount: 0, unreadCount: 0, scrapCount: 0, prePassCount: 0,
            status: 'PENDING_REVIEW',
            productType: formState.selectedAdProduct || '그랜드',
            productPeriod: formState.selectedAdPeriod,
            options: {
                icon: formState.selectedIcon,
                iconPeriod: formState.iconPeriod,
                highlighter: formState.selectedHighlighter,
                highlighterPeriod: formState.highlighterPeriod,
                borderOption: formState.borderOption,
                borderPeriod: formState.borderPeriod,
                paySuffixes: formState.paySuffixes
            }
        };

        try {
            setSelectedAdForModal(newAd);
        } catch (e) {
            console.error("Error setting modal state:", e);
        }
    };

    const handleSave = async () => {
        // --- Validation ---
        const {
            title, shopName, managerName, managerPhone, industryMain, industrySub,
            regionCity, regionGu, payType, payAmount
        } = formState;

        if (!shopName?.trim()) { alert('상호명을 입력해주세요.'); return; }
        if (!managerName?.trim()) { alert('담당자 성함을 입력해주세요.'); return; }
        if (!managerPhone?.trim()) { alert('담당자 연락처를 입력해주세요.'); return; }
        if (!title?.trim()) { alert('공고 제목을 입력해주세요.'); return; }
        if (!industryMain || !industrySub) { alert('직종(1차/2차)을 모두 선택해주세요.'); return; }
        if (!regionCity || !regionGu) { alert('근무 지역(시/구)을 모두 선택해주세요.'); return; }
        if (payType === '종류선택') { alert('급여 종류를 선택해주세요.'); return; }
        if (payType !== '협의' && (!payAmount || payAmount === '0')) { alert('급여 금액을 입력해주세요.'); return; }

        // [Mapping Fix] Supabase 실제 스키마(shops 테이블)에 맞춰 데이터 구성
        const adData: any = {
            name: formState.shopName,
            title: formState.title,
            region: `${formState.regionCity} ${formState.regionGu}`,
            phone: formState.managerPhone,
            kakao: formState.messengers.kakao,
            telegram: formState.messengers.telegram,
            pay: `${formState.payType} ${formState.payAmount}`,
            pay_type: formState.payType,
            work_type: formState.industryMain,
            site: brand.displayName,
            tier: formState.selectedAdProduct || 'grand',
            status: 'pending',
            ownerId: authUser.id, // [New] 최상위 컬럼으로 추가 (shops 테이블 ownerId 대응)
            options: {
                nickname: formState.nickname,
                managerName: formState.managerName,
                messengers: formState.messengers,
                categorySub: formState.industrySub,
                age: [formState.ageMin, formState.ageMax],
                product_type: formState.selectedAdProduct,
                product_period: formState.selectedAdPeriod,
                payAmount: Number(formState.payAmount) || 0,
                content: formState.editorRef.current?.innerHTML || '',
                keywords: formState.selectedKeywords,
            },
            updated_at: new Date().toISOString()
        };

        if (isNewEntry) {
            if (confirm('공고를 등록하시겠습니까? 무통장 입금 확인 후 승인 처리됩니다.')) {
                // ID 자동 생성 (UUID 지원)
                const newId = `AD_${Date.now()}`;
                const { data: shopData, error: shopError } = await supabase
                    .from('shops')
                    .insert([{ ...adData, id: newId, created_at: new Date().toISOString() }])
                    .select();

                if (shopError) {
                    console.error("Ad Save Error:", shopError);
                    // 스키마 에러인 경우 사용자에게 가이드 제공
                    const isSchemaError =
                        shopError.message.includes("column \"status\" does not exist") ||
                        shopError.message.includes("Could not find") ||
                        shopError.message.includes("schema cache");

                    if (isSchemaError) {
                        if (confirm('DB 스키마가 현재 버전과 맞지 않습니다. 임시 모드로 등록하시겠습니까?\n(근본 해결을 위해 제공된 SQL 스크립트 실행이 권장됩니다.)')) {
                            const mockAdsRaw = localStorage.getItem('coco_mock_ads');
                            const mockAds = mockAdsRaw ? JSON.parse(mockAdsRaw) : [];
                            const finalAd = { ...adData, id: newId, isMock: true };
                            localStorage.setItem('coco_mock_ads', JSON.stringify([finalAd, ...mockAds]));

                            alert('임시 등록되었습니다. 관리자에게 DB 업데이트를 요청해주세요.');
                            fetchRegisteredAds();
                            setView('dashboard');
                            formState.resetAdStates();
                            return;
                        }
                        return;
                    }

                    alert('공고 등록 중 오류가 발생했습니다: ' + shopError.message);
                    return;
                }

                const newShopId = shopData?.[0]?.id;

                // 2. 결제 대기 내역 생성 (무통장 입금용)
                if (newShopId) {
                    const { error: payError } = await supabase
                        .from('payments')
                        .insert([{
                            user_id: authUser.id,
                            shop_id: newShopId,
                            amount: 100000,
                            method: 'bank_transfer',
                            status: 'pending',
                            description: `[${adData.tier}] ${adData.name} 공고 신청`,
                            ad_type: adData.tier,
                            created_at: new Date().toISOString()
                        }]);

                    if (payError) console.error("Payment log creation failed:", payError);
                }

                alert('공고가 성공적으로 등록 되었습니다! 관리자 확인 후 승인됩니다.');
                fetchRegisteredAds();
                fetchPaymentHistory();
                setView('dashboard');
                formState.resetAdStates();
            }
        } else {
            if (editingAdId && confirm('공고 수정을 완료하시겠습니까?')) {
                const { error } = await supabase
                    .from('shops')
                    .update(adData)
                    .eq('id', editingAdId);

                if (error) {
                    alert('공고 수정 중 오류가 발생했습니다: ' + error.message);
                    return;
                }

                alert('공고 수정이 완료되었습니다.');
                fetchRegisteredAds();
                setView('dashboard');
                setEditingAdId(null);
                formState.resetAdStates();
            }
        }
    };

    const handleBack = () => {
        if (formState.isDirty) {
            if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
                setView('dashboard');
                formState.resetAdStates();
            }
        } else {
            setView('dashboard');
        }
    };

    if (userType === null) {
        return <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`} />;
    }

    if (userType === 'individual') {
        return <PersonalDashboard view={view} setView={setView} resumeCount={resumeCount} />;
    }



    // Helper functions for AdForm (extracted from original logic)
    const execCmd = (cmd: string, val?: string) => {
        formState.restoreSelection();
        document.execCommand(cmd, false, val);
        formState.updateToolbarStatus();
        formState.syncEditorHtml();
    };

    const insertEmoji = (emoji: string) => {
        formState.restoreSelection();
        document.execCommand('insertText', false, emoji);
        formState.syncEditorHtml();
    };

    const handlePayTypeChange = (e: any) => formState.setPayType(e.target.value);
    const handlePayAmountChange = (e: any) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        formState.setPayAmount(value);
    };
    const togglePaySuffix = (s: string) => {
        if (formState.paySuffixes.includes(s)) {
            formState.setPaySuffixes(formState.paySuffixes.filter(x => x !== s));
        } else {
            if (formState.paySuffixes.length >= 6) {
                alert('급여 추가 옵션은 최대 6개(기본 1개 포함)까지만 선택 가능합니다.');
                return;
            }
            formState.setPaySuffixes([...formState.paySuffixes, s]);
        }
    };

    return (
        <div className={`h-auto ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} pb-24`}>
            {/* Modals */}
            {showWarningModal && (
                <WarningModal
                    brand={brand}
                    onClose={() => setShowWarningModal(false)}
                    onConfirm={() => {
                        if (isNewEntry) {
                            formState.resetAdStates(); // Only reset if NEW
                            setView('form');
                        } else {
                            // Edit Mode: Ensure ID is passed in URL
                            if (editingAdId) {
                                router.push(`?view=form&id=${editingAdId}`, { scroll: false });
                            } else {
                                setView('form');
                            }
                        }
                        setShowWarningModal(false);
                    }}
                />
            )}
            {showDesignModal && <DesignRequestModal brand={brand} onClose={() => setShowDesignModal(false)} />}
            {/* Removed separate PreviewModal to ensure 100% consistency with AdDetailModal */}
            {showExampleModal && <ExampleModal show={showExampleModal} type={exampleType} onClose={() => setShowExampleModal(false)} brand={brand} />}
            {selectedAdForModal && (
                <ErrorBoundary>
                    <AdDetailModal
                        ad={selectedAdForModal}
                        onClose={() => setSelectedAdForModal(null)}
                    />
                </ErrorBoundary>
            )}
            {showMobileMenu && (
                <BusinessMobileMenu
                    brand={brand}
                    onClose={() => setShowMobileMenu(false)}
                    setView={setView}
                    shopName={formState.shopName}
                    nickname={formState.nickname}
                    router={router}
                />
            )}

            {/* Content View */}
            {view !== 'form' && (
                <div className="max-w-6xl mx-auto px-4 md:px-6">

                    <div className={`grid grid-cols-1 ${(userType as string) === 'individual' ? '' : 'md:grid-cols-4'} gap-4 md:py-6`}>
                        {/* PC Sidebar Persistence for business views (excluding AdForm) */}
                        {(userType === 'corporate' || userType === 'admin') && (
                            <BusinessSidebar
                                brand={brand}
                                shopName={formState.shopName}
                                nickname={formState.nickname}
                                view={view}
                                setView={setView}
                            />
                        )}

                        <div className={(userType as string) === 'individual' ? 'w-full' : 'col-span-1 md:col-span-3' + ' space-y-4'}>
                            {view === 'member-info' && (
                                <MemberInfoForm
                                    {...formState}
                                    brand={brand}
                                    setView={setView}
                                    onOpenMenu={() => setShowMobileMenu(true)} // Add this
                                />
                            )}
                            {view === 'ongoing-ads' && (
                                <OngoingAdsView
                                    setView={setView}
                                    userName={formState.shopName}
                                    ads={registeredAds}
                                    onShowAdDetail={(ad) => setSelectedAdForModal(ad)}
                                    onOpenMenu={() => setShowMobileMenu(true)} // Add this
                                    onEditAd={(ad) => {
                                        // Reuse handleAdClick logic for editing
                                        setIsNewEntry(false);
                                        setEditingAdId(ad.id);
                                        formState.loadAdData(ad);
                                        setShowWarningModal(true);
                                    }}
                                />
                            )}
                            {view === 'closed-ads' && (
                                <ClosedAdsView
                                    setView={setView}
                                    userName={formState.shopName}
                                    ads={registeredAds.filter(ad => ad.isClosed)}
                                    onShowAdDetail={(ad) => setSelectedAdForModal(ad)}
                                    onOpenMenu={() => setShowMobileMenu(true)}
                                />
                            )}
                            {view === 'payments' && (
                                <PaymentsView
                                    setView={setView}
                                    userName={formState.shopName}
                                    payments={paymentHistory}
                                    onShowAdDetail={(adId) => {
                                        const ad = registeredAds.find(a => a.id === adId);
                                        if (ad) setSelectedAdForModal(ad);
                                        else alert('해당 공고 상세 정보를 찾을 수 없습니다.');
                                    }}
                                    onOpenMenu={() => setShowMobileMenu(true)} // Add this
                                />
                            )}
                            {view === 'applicants' && <ApplicantsView setView={setView} userName={formState.shopName} onOpenMenu={() => setShowMobileMenu(true)} />}

                            {view === 'dashboard' && (
                                <BusinessDashboard
                                    brand={brand}
                                    shopName={formState.shopName}
                                    nickname={formState.nickname}
                                    isVerified={formState.isVerified}
                                    handleAdClick={(isNew, ad) => {
                                        setIsNewEntry(isNew);
                                        if (!isNew && ad) {
                                            setEditingAdId(ad.id);
                                            formState.loadAdData(ad);
                                        } else {
                                            setEditingAdId(null);
                                            formState.resetAdStates();
                                        }
                                        setShowWarningModal(true);
                                    }}
                                    setShowDesignModal={setShowDesignModal}
                                    setView={setView}
                                    router={router}
                                    ads={registeredAds}
                                    onOpenMenu={() => setShowMobileMenu(true)}
                                    onShowAdDetail={(ad) => setSelectedAdForModal(ad)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {view === 'form' ? (
                <div className="w-full">
                    <AdForm
                        {...formState}
                        isNewEntry={isNewEntry}
                        brand={brand}
                        setShowDesignModal={setShowDesignModal}
                        handleEditorInteract={formState.updateToolbarStatus}
                        saveSelection={formState.saveSelection}
                        execCmd={execCmd}
                        insertEmoji={insertEmoji}
                        handlePayTypeChange={handlePayTypeChange}
                        handlePayAmountChange={handlePayAmountChange}
                        togglePaySuffix={togglePaySuffix}
                        setExampleType={setExampleType}
                        setShowExampleModal={setShowExampleModal}
                        onSave={handleSave}
                        onBack={handleBack}
                        onPreview={onPreview}
                        setSelectedAdPeriod={(v: number) => formState.setSelectedAdPeriod(v as 30 | 60 | 90)}
                        setBorderOption={(v: string) => formState.setBorderOption(v as 'none' | 'color' | 'glow' | 'sparkle')}
                        setBorderPeriod={(v: number) => formState.setBorderPeriod(v as 30 | 60 | 90)}
                        setIconPeriod={(v: number) => formState.setIconPeriod(v as 30 | 60 | 90)}
                        setHighlighterPeriod={(v: number) => formState.setHighlighterPeriod(v as 30 | 60 | 90)}
                    />
                </div>
            ) : null}
        </div>
    );
}
