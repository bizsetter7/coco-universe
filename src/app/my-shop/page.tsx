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

    // --- Data Persistence (Load) ---
    useEffect(() => {
        const savedAds = localStorage.getItem('my_site_registered_ads');
        const savedPayments = localStorage.getItem('my_site_payment_history');
        if (savedAds) {
            try {
                const ads = JSON.parse(savedAds);
                setRegisteredAds(ads.map((ad: any) => ({
                    ...ad,
                    deadline: ad.deadline || '2026-03-25'
                })));
            } catch (e) {
                console.error("Failed to parse ads", e);
            }
        }
        if (savedPayments) {
            try {
                setPaymentHistory(JSON.parse(savedPayments));
            } catch (e) {
                console.error("Failed to parse payments", e);
            }
        }
        setIsDataLoaded(true);
    }, []);

    // --- Data Persistence (Save) ---
    useEffect(() => {
        if (isDataLoaded) {
            localStorage.setItem('my_site_registered_ads', JSON.stringify(registeredAds));
        }
    }, [registeredAds, isDataLoaded]);

    useEffect(() => {
        if (isDataLoaded) {
            localStorage.setItem('my_site_payment_history', JSON.stringify(paymentHistory));
        }
    }, [paymentHistory, isDataLoaded]);

    const setView = (newView: any) => {
        if (newView === view) return;
        if (newView === 'dashboard') {
            router.push('/my-shop', { scroll: false });
        } else {
            router.push(`?view=${newView}`, { scroll: false });
        }
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
        if (authUserType) {
            if (authUserType === 'admin') {
                // [Security] Admins should always use /admin for their dashboard
                router.replace('/admin');
                return;
            }
            setUserType(authUserType);
            if (authUser.name) formState.setShopName(authUser.name);
            if (authUser.nickname) formState.setNickname(authUser.nickname);
        }

        const isLoggedIn = localStorage.getItem('user_session');
        if (!isLoggedIn) {
            alert('로그인이 필요한 서비스입니다.');
            router.replace('/?page=login');
        }
    }, [authUserType, authUser, router, formState]);

    // --- View Sync from URL ---
    useEffect(() => {
        const viewParam = (searchParams.get('view') || 'dashboard') as any;
        if (viewParam !== view) {
            _setView(viewParam);
            // Only scroll to top if not returning to dashboard (dashboard handles its own scroll or prefers natural position)
            // Using 'auto' for better mobile feeling instead of 'instant' unless necessary
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
            // If we are in form view with an ID, but editingAdId is lost (e.g. refresh), restore it.
            // Or if we just navigated here via router.push with ID.
            const adId = Number(adIdParam);
            if (editingAdId !== adId) {
                const ad = registeredAds.find(a => a.id === adId);
                if (ad) {
                    setEditingAdId(adId);
                    setIsNewEntry(false);
                    // Load data if form is empty (heuristic to avoid overwriting user unsaved input during weird re-renders)
                    // But typically on first load/refresh it's empty.
                    if (!formState.title) {
                        formState.loadAdData(ad);
                    }
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

        console.log("page.tsx: Setting Preview Ad:", newAd);
        try {
            setSelectedAdForModal(newAd);
        } catch (e) {
            console.error("Error setting modal state:", e);
        }
    };

    const handleSave = () => {
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

        if (isNewEntry) {
            if (confirm('공고를 등록하시겠습니까?')) {
                // Simulate saving to state
                const newId = Math.floor(Math.random() * 90000) + 10000;

                const newAd = {
                    id: newId,
                    title: formState.title,
                    nickname: formState.nickname,
                    managerName: formState.managerName,
                    managerPhone: formState.managerPhone,
                    messengers: formState.messengers,
                    category: formState.industryMain,
                    categorySub: formState.industrySub,
                    regionCity: formState.regionCity,
                    regionGu: formState.regionGu,
                    ageMin: formState.ageMin,
                    ageMax: formState.ageMax,
                    payType: formState.payType,
                    payAmount: formState.payAmount,
                    content: formState.editorRef.current?.innerHTML || '',
                    keywords: formState.selectedKeywords,
                    updateDate: new Date().toISOString().split('T')[0],
                    deadline: new Date(Date.now() + (Number(formState.selectedAdPeriod) || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    applicantCount: 0, unreadCount: 0, scrapCount: 0, prePassCount: 0,
                    status: 'PENDING_REVIEW', // 심사중 
                    productType: formState.selectedAdProduct || '그랜드', // Default for preview
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
                setRegisteredAds(prev => [newAd, ...prev]);
                const newPayment = {
                    id: newId, // Use the same NO.
                    type: formState.selectedAdProduct || '일반등록',
                    desc: formState.title, // User wanted ad title itself
                    price: `${formState.totalAmount.toLocaleString()}원`, // Actual amount
                    method: '입금', // User specified '입금'
                    nickname: formState.nickname || '관리자',
                    date: new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    status: '심사중', // User requested '심사중'
                    isConfirmed: false,
                    options: {
                        icon: formState.selectedIcon,
                        highlighter: formState.selectedHighlighter,
                        border: formState.borderOption !== 'none'
                    }
                };
                setPaymentHistory(prev => [newPayment, ...prev]);

                alert('공고가 성공적으로 등록 되었습니다!');
                setView('dashboard');
                formState.resetAdStates();
            }
        } else {
            // Edit Mode: Update existing ad
            if (editingAdId) {
                setRegisteredAds(prev => prev.map(ad => {
                    if (ad.id === editingAdId) {
                        return {
                            ...ad,
                            title: formState.title,
                            nickname: formState.nickname,
                            managerName: formState.managerName,
                            managerPhone: formState.managerPhone,
                            messengers: formState.messengers,
                            category: formState.industryMain,
                            categorySub: formState.industrySub,
                            regionCity: formState.regionCity,
                            regionGu: formState.regionGu,
                            ageMin: formState.ageMin,
                            ageMax: formState.ageMax,
                            payType: formState.payType,
                            payAmount: formState.payAmount,
                            content: formState.editorRef.current?.innerHTML || '',
                            keywords: formState.selectedKeywords,
                            updateDate: new Date().toISOString().split('T')[0],
                            // Update deadline if period changed? Usually registration date is fixed, but let's assume update changes it if period changes.
                            // For now, keep original logic (no deadline update on edit usually unless extended)
                            options: {
                                ...ad.options,
                                paySuffixes: formState.paySuffixes,
                                icon: formState.selectedIcon, // Also update options
                                highlighter: formState.selectedHighlighter,
                                borderOption: formState.borderOption
                            }
                        };
                    }
                    return ad;
                }));
                setPaymentHistory(prev => prev.map(p => {
                    if (p.id === editingAdId) {
                        return { ...p, desc: formState.title };
                    }
                    return p;
                }));
                alert('공고 수정이 완료되었습니다.');
                setView('dashboard');
                setEditingAdId(null); // Clear editing state
                formState.resetAdStates();
            } else {
                // Fallback if editingAdId is missing but we are in edit mode (should be caught by useEffect)
                alert('수정할 공고 정보를 찾을 수 없습니다. 다시 시도해주세요.');
                setView('dashboard');
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
        return <PersonalDashboard view={view} setView={setView} />;
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
