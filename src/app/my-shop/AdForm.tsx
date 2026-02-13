'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Step1BasicInfo } from './components/form/steps/Step1BasicInfo';
import { Step2JobDetail } from './components/form/steps/Step2JobDetail';
import { Step3ProductSelect } from './components/form/steps/Step3ProductSelect';
import { Step4Extras } from './components/form/steps/Step4Extras';

import { BrandConfig } from '@/lib/brand-config';

interface AdFormProps {
    brand: BrandConfig;
    shopName: string; setShopName: (v: string) => void;
    isVerified: boolean;
    nickname: string; setNickname: (v: string) => void;
    managerName: string; setManagerName: (v: string) => void;
    managerPhone: string; setManagerPhone: (v: string) => void;
    messengers: { kakao: string; telegram: string }; setMessengers: (v: any) => void;
    title: string; setTitle: (v: string) => void;
    industryMain: string; setIndustryMain: (v: string) => void;
    industrySub: string; setIndustrySub: (v: string) => void;
    ageMin: number; setAgeMin: (v: number) => void;
    ageMax: number; setAgeMax: (v: number) => void;
    regionCity: string; setRegionCity: (v: string) => void;
    regionGu: string; setRegionGu: (v: string) => void;
    payType: string; handlePayTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    payAmount: string; handlePayAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedKeywords: string[]; setSelectedKeywords: (v: string[]) => void;
    setShowDesignModal: (v: boolean) => void;
    editorRef: React.RefObject<HTMLDivElement | null>;
    handleEditorInteract: () => void;
    setIsEditorDirty: (v: boolean) => void;
    saveSelection: () => void;
    restoreSelection: () => void;
    syncEditorHtml: () => void;
    editorHtml: string;
    toolbarStatus: Record<string, boolean | string>;
    execCmd: (cmd: string, val?: string) => void;
    updateToolbarStatus: () => void;
    showFontMenu: boolean; setShowFontMenu: (v: boolean) => void;
    showFontSizeMenu: boolean; setShowFontSizeMenu: (v: boolean) => void;
    showForeColorMenu: boolean; setShowForeColorMenu: (v: boolean) => void;
    showHiliteColorMenu: boolean; setShowHiliteColorMenu: (v: boolean) => void;
    showEmojiMenu: boolean; setShowEmojiMenu: (v: boolean) => void;
    insertEmoji: (emoji: string) => void;
    selectedAdProduct: string | null; setSelectedAdProduct: (v: string) => void;
    selectedAdPeriod: number; setSelectedAdPeriod: (v: number) => void;
    paySuffixes: string[]; togglePaySuffix: (v: string) => void;
    borderOption: string; setBorderOption: (v: string) => void;
    borderPeriod: number; setBorderPeriod: (v: number) => void;
    selectedIcon: number | null; setSelectedIcon: (v: number | null) => void;
    iconPeriod: number; setIconPeriod: (v: number) => void;
    selectedHighlighter: number | null; setSelectedHighlighter: (v: number | null) => void;
    highlighterPeriod: number; setHighlighterPeriod: (v: number) => void;
    totalAmount: number;
    setExampleType: (v: string) => void;
    setShowExampleModal: (v: boolean) => void;
    onSave?: () => void;
    onPreview?: () => void;
    onBack?: () => void;
    isNewEntry?: boolean;
}

export default function AdForm(props: AdFormProps) {
    const { brand } = props;

    return (
        <div className="w-full max-w-[1120px] mx-auto space-y-2 md:space-y-5 pb-8 pt-2.5 px-2 md:px-3 xl:px-0 relative mb-3">
            {/* Recruitment Registration Header (Capture 3) */}
            <div className={`p-4 md:p-5 rounded-[24px] md:rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>
                <div className="flex items-start gap-2 md:gap-4 mb-0.5 md:mb-2 text-left">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-pink-500 rounded-full shrink-0"></div>
                    <h1 className={`text-xl md:text-3xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} `}>채용공고등록</h1>
                </div>
                <p className={`${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} font-bold text-[11px] md:text-base ml-0 leading-tight md:leading-normal`}>
                    <span className="mr-0.5 text-pink-500 font-extrabold">*</span> 표시 항목은 필수 입력입니다. 정확히 입력해주세요.
                </p>
            </div>

            <Step1BasicInfo {...props} />
            <Step2JobDetail {...props} />
            {/* Step 3 & 4: Restricted in Edit Mode */}
            <div className="relative group space-y-2 md:space-y-5">
                {!props.isNewEntry && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 rounded-[32px] pointer-events-none animate-in fade-in duration-500">
                        <div className="bg-white/90 shadow-xl border border-pink-100 p-6 rounded-3xl text-center max-w-sm">
                            <div className="flex items-center justify-center gap-2 mb-2 text-pink-600">
                                <MessageCircle size={20} fill="currentColor" />
                                <span className="font-black text-sm uppercase tracking-wider">Product Info</span>
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-1">상품 및 추가 옵션 변경 안내</h3>
                            <p className="text-[12px] text-gray-500 font-bold leading-relaxed mb-4">
                                이미 등록된 공고의 상품 등급 및 옵션은 직접 수정이 불가능합니다. <br />
                                <span className="text-pink-600 font-black underline">관리자 1:1 문의</span>를 통해 요청해주세요.
                            </p>
                            <button className="pointer-events-auto px-5 py-2 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg">
                                고객센터 문의하기
                            </button>
                        </div>
                    </div>
                )}
                <div className={`space-y-5 transition-all duration-300 ${!props.isNewEntry ? 'opacity-40 grayscale-[0.3] pointer-events-none' : ''}`}>
                    <Step3ProductSelect {...props} />
                    <Step4Extras
                        {...props}
                        selectedKeywords={props.selectedKeywords}
                        setSelectedKeywords={props.setSelectedKeywords}
                        selectedAdProduct={props.selectedAdProduct}
                        setExampleType={props.setExampleType}
                        setShowExampleModal={props.setShowExampleModal}
                    />
                </div>
            </div>

            {/* Total Amount Display (Redesigned matching Capture 1/2) */}
            <div className="max-w-[900px] mx-auto w-full px-4 md:px-0">
                <div className="bg-[#e0007b] text-white py-3 px-4 md:p-8 rounded-[24px] shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="text-center md:text-left z-10 shrink-0">
                        <div className="font-black text-base md:text-xl">결제는 PC와 모바일 모두 가능합니다.</div>
                        <div className="text-[10px] md:text-xs opacity-80 mt-1 font-bold">모든 광고 상품은 결제 및 심사 후 즉시 자동 적용되어 노출됩니다.</div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 w-full md:w-auto z-10">
                        <div className="font-black text-base md:text-lg whitespace-nowrap opacity-90">총 신청 금액</div>
                        <div className="bg-white/20 border border-white/20 p-2 md:p-5 rounded-2xl min-w-[180px] md:min-w-[240px] text-center shadow-inner">
                            <span className="text-2xl md:text-5xl font-black tracking-tighter">{props.totalAmount.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Navigation (Capture 3/4/5 Style) */}
            <div className="fixed bottom-0 left-0 right-0 z-[1000] p-4 md:p-6 bg-white/90 pointer-events-none">
                <div className="max-w-[1120px] mx-auto flex flex-row gap-2 md:gap-4 pointer-events-auto">
                    <button
                        type="button" // Explicitly set type to button to prevent form submission
                        onClick={() => {
                            console.log("AdForm: Button Clicked local");
                            props.onPreview?.();
                        }}
                        className="flex-[1.5] md:w-40 py-4 rounded-2xl bg-slate-800 text-white font-black text-xs md:text-lg hover:bg-slate-900 transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        보기
                    </button>
                    <button
                        onClick={() => props.onBack?.()}
                        className="flex-1 md:w-32 py-4 rounded-2xl bg-white text-gray-500 font-black text-xs md:text-lg hover:bg-gray-50 transition shadow-lg border border-gray-200 active:scale-95 whitespace-nowrap"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => props.onSave?.()}
                        className="flex-[3] md:flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs md:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20 active:scale-[0.98] transition-all hover:brightness-110 whitespace-nowrap"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        저장 및 심사 저장
                    </button>
                </div>
            </div>
        </div>
    );
}
