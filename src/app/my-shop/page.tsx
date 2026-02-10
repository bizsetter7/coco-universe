'use client';

import React, { useState, useEffect } from 'react';
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
    WarningModal, DesignRequestModal, PreviewModal, ExampleModal,
    BusinessMobileMenu, MemberInfoForm
} from './page_sub_components';

// --- Constants (Exported for sub-components) ---
import { JOB_CATEGORY_MAP as INDUSTRY_DATA_MAP } from '@/constants/jobs';
import { REGIONS_MAP as REGION_DATA_MAP } from '@/constants/regions';
import { PAY_TYPES as PAY_TYPES_CONST } from '@/constants/job-options';

export const INDUSTRY_DATA = INDUSTRY_DATA_MAP;
export const REGION_DATA = REGION_DATA_MAP;
export const PAY_TYPES = PAY_TYPES_CONST;

export default function MyShopPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const brand = useBrand();

    // View States
    const [view, _setView] = useState<'dashboard' | 'form' | 'member-info' | 'resume-form' | 'member-edit' | 'resume-list' | 'scrap-jobs' | 'payment-history' | 'excluded-shops' | 'custom-jobs' | 'my-posts' | 'block-settings' | 'post-bookmarks'>('dashboard');
    const [userType, setUserType] = useState<'business' | 'personal' | null>(null);

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
        const viewParam = searchParams.get('view') || 'dashboard';
        if (viewParam !== view) {
            _setView(viewParam as any);
            // Only scroll to top on actual view change to prevent jitter
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
        alert('저장 및 심사 요청이 완료되었습니다!');
        setView('dashboard');
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const handleBack = () => {
        if (formState.isDirty) {
            if (confirm('작성 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?')) {
                setView('dashboard');
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        } else {
            setView('dashboard');
            window.scrollTo({ top: 0, behavior: 'instant' });
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
    const handlePayAmountChange = (e: any) => formState.setPayAmount(e.target.value.replace(/[^0-9]/g, ''));
    const togglePaySuffix = (s: string) => {
        if (formState.paySuffixes.includes(s)) {
            formState.setPaySuffixes(formState.paySuffixes.filter(x => x !== s));
        } else {
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
                    onConfirm={() => { setView('form'); setShowWarningModal(false); }}
                />
            )}
            {showDesignModal && <DesignRequestModal brand={brand} onClose={() => setShowDesignModal(false)} />}
            {showPreviewModal && <PreviewModal brand={brand} onClose={() => setShowPreviewModal(false)} formData={currentFormData} />}
            {showExampleModal && <ExampleModal show={showExampleModal} type={exampleType} onClose={() => setShowExampleModal(false)} brand={brand} />}
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
            {view === 'member-info' && (
                <MemberInfoForm
                    {...formState}
                    brand={brand}
                    setView={setView}
                />
            )}
            {view === 'form' && (
                <AdForm
                    {...formState}
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
            )}
            {view === 'dashboard' && (
                <BusinessDashboard
                    brand={brand}
                    shopName={formState.shopName}
                    nickname={formState.nickname}
                    isVerified={formState.isVerified}
                    handleAdClick={(isNew) => isNew ? setShowWarningModal(true) : setView('form')}
                    setShowDesignModal={setShowDesignModal}
                    router={router}
                />
            )}
        </div>
    );
}
