'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Store, List, User, LogOut, CreditCard, MessageCircle,
    Home, Briefcase, Star, AlertTriangle, FileText,
    PlusSquare, AlignLeft, LayoutDashboard, Settings, Menu
} from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import { usePreventLeave } from '@/hooks/usePreventLeave';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

// --- Components ---
import BusinessDashboard from './components/dashboard/BusinessDashboard';
import PersonalDashboard from './components/dashboard/PersonalDashboard';
import AdForm from './AdForm';
import { useAdFormState } from './useAdFormState';
import {
    WarningModal, DesignRequestModal, PreviewModal, ExampleModal, AdDetailModal,
    BusinessMobileMenu, BusinessSidebar, MemberInfoForm,
    OngoingAdsView, ClosedAdsView, PaymentsView, ApplicantsView
} from './page_sub_components';

// --- Constants (Exported for sub-components) ---
import { JOB_CATEGORY_MAP as INDUSTRY_DATA_MAP } from '@/constants/jobs';
import { REGIONS_MAP as REGION_DATA_MAP } from '@/constants/regions';
import { PAY_TYPES as PAY_TYPES_CONST } from '@/constants/job-options';

export const INDUSTRY_DATA = INDUSTRY_DATA_MAP;
export const REGION_DATA = REGION_DATA_MAP;
export const PAY_TYPES = PAY_TYPES_CONST;

export default function MyShopPage() {
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

    // View States
    const [view, _setView] = useState<'dashboard' | 'form' | 'member-info' | 'resume-form' | 'member-edit' | 'ongoing-ads' | 'closed-ads' | 'payments' | 'applicants' | 'resume-list' | 'scrap-jobs' | 'payment-history' | 'excluded-shops' | 'custom-jobs' | 'my-posts' | 'block-settings' | 'post-bookmarks'>('dashboard');
    const [userType, setUserType] = useState<'business' | 'personal' | null>(null);
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
                setRegisteredAds(JSON.parse(savedAds));
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
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showExampleModal, setShowExampleModal] = useState(false);
    const [exampleType, setExampleType] = useState<any>(null);
    const [selectedAdForModal, setSelectedAdForModal] = useState<any>(null);

    // Form State (Hook)
    const formState = useAdFormState();

    // Body Scroll Lock
    useBodyScrollLock(showWarningModal || showDesignModal || showPreviewModal || showMobileMenu || showExampleModal);

    // Prevent Leave
    usePreventLeave(formState.isDirty && view === 'form');

    // --- Auth & Init ---
    useEffect(() => {
        const storedUserType = localStorage.getItem('user_type');
        setUserType(storedUserType === 'personal' ? 'personal' : 'business');

        const isLoggedIn = localStorage.getItem('user_session') || localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            alert('로그인이 필요한 서비스입니다.');
            router.replace('/?page=login');
        }
    }, [router]);

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

    // Handlers
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
                    applicantCount: 0, unreadCount: 0, scrapCount: 0, prePassCount: 0,
                    status: 'PENDING_REVIEW', // 심사중 
                    productType: formState.selectedAdProduct,
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

                // Simulate payment history entry
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
                            options: {
                                ...ad.options,
                                paySuffixes: formState.paySuffixes
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
                setEditingAdId(null);
                alert('공고 수정이 완료되었습니다.');
            }
            formState.resetAdStates();
            setView('dashboard');
        }
    };

    const handleBack = () => {
        if (formState.isDirty) {
            if (confirm('작성 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?')) {
                formState.resetAdStates();
                setView('dashboard');
            }
        } else {
            formState.resetAdStates();
            setView('dashboard');
        }
    };

    if (userType === null) {
        return <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`} />;
    }

    if (userType === 'personal') {
        return <PersonalDashboard view={view} setView={setView} />;
    }

    const currentFormData = {
        ...formState,
        editorHtml: formState.editorRef.current?.innerHTML || ''
    };

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
                        if (isNewEntry) formState.resetAdStates(); // Only reset if NEW
                        setView('form');
                        setShowWarningModal(false);
                    }}
                />
            )}
            {showDesignModal && <DesignRequestModal brand={brand} onClose={() => setShowDesignModal(false)} />}
            {showPreviewModal && <PreviewModal brand={brand} onClose={() => setShowPreviewModal(false)} formData={currentFormData} />}
            {showExampleModal && <ExampleModal show={showExampleModal} type={exampleType} onClose={() => setShowExampleModal(false)} brand={brand} />}
            {selectedAdForModal && (
                <AdDetailModal
                    brand={brand}
                    ad={selectedAdForModal}
                    onClose={() => setSelectedAdForModal(null)}
                />
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
                    <div className={`grid grid-cols-1 ${(userType as string) === 'personal' ? '' : 'md:grid-cols-4'} gap-6 md:py-8`}>
                        {/* PC Sidebar Persistence for business views (excluding AdForm) */}
                        {(userType as string) === 'business' && (
                            <BusinessSidebar
                                brand={brand}
                                shopName={formState.shopName}
                                nickname={formState.nickname}
                                view={view}
                                setView={setView}
                            />
                        )}

                        <div className={(userType as string) === 'personal' ? 'w-full' : 'col-span-1 md:col-span-3' + ' space-y-6'}>
                            {view === 'member-info' && (
                                <MemberInfoForm
                                    {...formState}
                                    brand={brand}
                                    setView={setView}
                                />
                            )}
                            {view === 'ongoing-ads' && (
                                <OngoingAdsView
                                    setView={setView}
                                    userName={formState.shopName}
                                    ads={registeredAds}
                                    onShowAdDetail={(ad) => setSelectedAdForModal(ad)}
                                />
                            )}
                            {view === 'closed-ads' && <ClosedAdsView setView={setView} userName={formState.shopName} ads={[]} />}
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
                                />
                            )}
                            {view === 'applicants' && <ApplicantsView setView={setView} userName={formState.shopName} />}

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
                        onPreview={() => setShowPreviewModal(true)}
                        onBack={handleBack}
                    />
                </div>
            ) : null}
        </div>
    );
}
