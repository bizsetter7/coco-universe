'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, Home, Store, MapPin, Phone, MessageCircle, Camera, Check,
    Briefcase, Clock, DollarSign, Save, AlertTriangle, Search, X,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette,
    FileText, User, CreditCard, LogOut, Settings, Bell,
    LayoutDashboard, List, PlusSquare, ChevronDown, HelpCircle, Laptop,
    RefreshCw, Calendar, Eye, Highlighter, Smile, Menu, MousePointerClick,
    Zap, Star, Crown, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { usePreventLeave } from '@/hooks/usePreventLeave';
import { useBrand } from '@/components/BrandProvider';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

import { JOB_CATEGORY_MAP as INDUSTRY_DATA } from '@/constants/jobs';
import { REGIONS_MAP as REGION_DATA } from '@/constants/regions';



import {
    PAY_SUFFIX_OPTIONS, CONVENIENCE_KEYWORDS,
    AGES, FONTS, FONT_SIZES, TEXT_COLORS, BG_COLORS, PAY_TYPES
} from '@/constants/job-options';

// shared Pricing Data
const DETAILED_PRICING = [
    { id: 'p1', name: '그랜드 (Grand)', desc: '메인 독점! 최상단 0순위에 배치됩니다. (전 지역 검색 결과 압도적 선점 / Glow 효과)', d30: 350000, d60: 630000, d90: 840000, isMain: true, disabled: false },
    { id: 'p2', name: '프리미엄 (Premium)', desc: '메인 중단의 가장 눈에 띄는 위치에 배치됩니다. (실버 보더 적용 / 자동점프 일 30회)', d30: 200000, d60: 360000, d90: 480000, isMain: true, disabled: false },
    { id: 'p3', name: '디럭스 (Deluxe)', desc: '메인페이지 프리미엄 하단의 위치에 배치됩니다. (블루 보더 적용 / 자동점프 일 30회)', d30: 180000, d60: 324000, d90: 432000, isMain: true, disabled: false },
    { id: 'p4', name: '스페셜 (Special)', desc: '리스트 중간 상단에 배치됩니다. (핑크 보더 적용 / 자동점프 일 20회)', d30: 150000, d60: 270000, d90: 360000, isMain: true, disabled: false },
    { id: 'p5', name: '급구/추천 (Urgent/Rec)', desc: '강렬한 빨간 제목과 추천 배지로 주목도를 높입니다. (목록 강조 노출 / 자동점프 일 20회)', d30: 120000, d60: 216000, d90: 288000, isMain: true, disabled: false },
    { id: 'p6', name: '네이티브 (Native)', desc: '리스트 하단에 배치됩니다. (지역 1개 노출/네이티브 스타일/자동점프 일 10회 설정 제공)', d30: 100000, d60: 180000, d90: 240000, isMain: true, disabled: false },
    { id: 'p7', name: '베이직/줄광고 (Basic)', desc: '일반 리스트 노출 (실속형 구인 상품 / 자동점프 일 5회 설정 제공)', d30: 60000, d60: 100000, d90: 140000, isMain: true, disabled: false },
    { id: 'p8', name: '강조옵션 (Icon/Highlighter)', desc: '아이콘 및 형광펜 효과로 시선을 사로잡으세요. (목록 옵션 노출)', d30: 30000, d60: 55000, d90: 70000, isMain: true, disabled: false },
    { id: 'bold', name: '굵은글씨 적용', desc: '채용정보의 제목을 굵게 표시되어 어디든 눈에 띌 수 있도록 표시', d30: 30000, d60: 55000, d90: 70000, isMain: false, disabled: false },
];

const AD_ICONS = [
    { id: 1, name: '초보환영', icon: '❤️' },
    { id: 2, name: '원룸제공', icon: '👄' },
    { id: 3, name: '최고급시설', icon: '💥' },
    { id: 4, name: '블랙관리', icon: '⬛', bg: 'black', color: 'white' },
    { id: 5, name: '꽁비지급', icon: '😜' },
    { id: 6, name: '사이즈X', icon: '❌', color: 'red' },
    { id: 7, name: '셋트환영', icon: '👯' },
    { id: 8, name: '픽업가능', icon: '🚗' },
    { id: 9, name: '회원제운영', icon: '❗', color: 'orange' },
    { id: 10, name: '급전가능', icon: '✨' },
];

const AD_HIGHLIGHTERS = [
    { id: 1, name: '연두', color: '#ccff00' },
    { id: 2, name: '초록', color: '#00ff00' },
    { id: 3, name: '하늘', color: '#00ffff' },
    { id: 4, name: '보라', color: '#cc99ff' },
    { id: 5, name: '오렌지', color: '#ffcc00' },
    { id: 6, name: '연파랑', color: '#99ccff' },
    { id: 7, name: '분홍', color: '#ff99ff' },
    { id: 8, name: '핫핑크', color: '#ff00ff' },
];

const FORBIDDEN_WORDS = [
    '키스방', '대딸', '마사지', '안마', '보도방', '노래방', '풀싸롱', '룸싸롱',
    '성매매', '조건만남', '애인대행', '유사성행위', '오피', '핸플', '마무리',
    '소액결제', '내구제', '대출', '마약', '떨', '아이스', '작대기',
    '도우미', '여우알바', '밤알바', '유흥알바'
];

export default function MyShopPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const brand = useBrand();
    const [view, setView] = useState<'dashboard' | 'form' | 'member-info' | 'resume-form' | 'member-edit' | 'resume-list' | 'scrap-jobs' | 'payment-history' | 'excluded-shops' | 'custom-jobs' | 'my-posts' | 'block-settings' | 'post-bookmarks'>('dashboard');
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Body Scroll Lock for Modals
    useBodyScrollLock(showWarningModal || showDesignModal || showPreviewModal || showMobileMenu);

    // [Event] Listen for Hamburger Click from MainHeader
    useEffect(() => {
        const handleToggle = () => setShowMobileMenu(true);
        window.addEventListener('toggle-mobile-menu', handleToggle);
        return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
    }, []);

    // [View Sync] URL Parameter to State
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam) {
            setView(viewParam as any);
        }
    }, [searchParams]);

    // Reset Form Logic
    const resetForm = () => {
        setShopName('코코 라운지');
        setIsVerified(true);
        setNickname('');
        setManagerName('');
        setManagerPhone('');
        setMessengers({ kakao: '', line: '', telegram: '' });
        setTitle('');
        setRegionCity('');
        setRegionGu('');
        setAddressDetail('');
        setIndustryMain('');
        setIndustrySub('');
        setAgeMin(20);
        setAgeMax(35);
        setPayType('종류선택');
        setPayAmount('0');
        setWorkTime('');
        setSelectedConvenience([]);
        setSelectedKeywords([]);
        if (editorRef.current) editorRef.current.innerHTML = '';
        setSeoTags([]);
        setSelectedAdProduct(null);
        setSelectedAdPeriod(30);
        setSelectedIcon(null);
        setIconPeriod(0);
        setSelectedHighlighter(null);
        setHighlighterPeriod(0);
        setSelectedOptions([]);
        setOptionPeriods({});
        setTotalAmount(0);
        setIsEditorDirty(false);
        // Reset New Fields
        setMediaUrl('');
        setPaySuffixes([]);
        setBorderOption('none');
        // Reset steps if any custom step logic existed
    };

    // [Auth] Check User Role and Set Layout
    const [userTypeForLayout, setUserTypeForLayout] = useState<string | null>(null);

    useEffect(() => {
        const userType = localStorage.getItem('user_type');
        if (userType === 'personal') {
            setUserTypeForLayout('personal');
            setView('member-info'); // Default to Member Info
        } else {
            setUserTypeForLayout('business');
        }
    }, []);

    // Loading check moved to bottom to prevent Hook violation

    // --- Form States ---
    const [shopName, setShopName] = useState('코코 라운지');
    const [isVerified, setIsVerified] = useState(true);
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [smsConsent, setSmsConsent] = useState(false);

    // Manager Info
    const [managerName, setManagerName] = useState('');
    const [managerPhone, setManagerPhone] = useState('');
    const [messengers, setMessengers] = useState({ kakao: '', line: '', telegram: '' });

    // Recruitment Info
    const [title, setTitle] = useState('');

    // Region
    const [regionCity, setRegionCity] = useState('');
    const [regionGu, setRegionGu] = useState('');
    const [addressDetail, setAddressDetail] = useState('');

    // Industry
    const [industryMain, setIndustryMain] = useState('');
    const [industrySub, setIndustrySub] = useState('');

    // Age
    const [ageMin, setAgeMin] = useState(20);
    const [ageMax, setAgeMax] = useState(35);

    // Pay
    const [payType, setPayType] = useState('종류선택');
    const [payAmount, setPayAmount] = useState('0');
    const [workTime, setWorkTime] = useState('');

    // Keywords
    const [selectedConvenience, setSelectedConvenience] = useState<string[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

    // Editor State
    // Editor State
    const editorRef = useRef<HTMLDivElement>(null);
    const selectionRange = useRef<Range | null>(null);

    // Editor Styles Binding States
    const [currentFont, setCurrentFont] = useState('sans-serif');
    const [currentFontSize, setCurrentFontSize] = useState('');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [currentForeColor, setCurrentForeColor] = useState('#000000');
    const [currentHiliteColor, setCurrentHiliteColor] = useState('transparent');

    // SEO Tags
    const [seoTags, setSeoTags] = useState<string[]>([]);

    // --- Ad Product Selection States ---
    const [selectedAdProduct, setSelectedAdProduct] = useState<string | null>(null);
    const [selectedAdPeriod, setSelectedAdPeriod] = useState<30 | 60 | 90>(30);

    const [selectedIcon, setSelectedIcon] = useState<number | null>(null);
    const [iconPeriod, setIconPeriod] = useState<30 | 60 | 90 | 0>(0); // 0 means not using icon

    const [selectedHighlighter, setSelectedHighlighter] = useState<number | null>(null);
    const [highlighterPeriod, setHighlighterPeriod] = useState<30 | 60 | 90 | 0>(0);

    const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // Bold etc
    const [optionPeriods, setOptionPeriods] = useState<Record<string, 30 | 60 | 90>>({});

    // New Ad Fields
    const [mediaUrl, setMediaUrl] = useState('');
    const [paySuffixes, setPaySuffixes] = useState<string[]>([]);
    const [borderOption, setBorderOption] = useState<'none' | 'color' | 'glow'>('none');

    const [totalAmount, setTotalAmount] = useState(0);

    // --- Prevent Leave Logic ---
    // --- Prevent Leave Logic ---
    // 에디터 내용 변경 감지 상태
    const [isEditorDirty, setIsEditorDirty] = useState(false);

    const isDirty = view === 'form' && (
        (shopName !== '' && shopName !== '코코 라운지') ||
        managerName !== '' ||
        managerPhone !== '' ||
        title !== '' ||
        industryMain !== '' ||
        regionCity !== '' ||
        payAmount !== '0' ||
        isEditorDirty ||
        selectedKeywords.length > 0 ||
        selectedConvenience.length > 0
    );

    usePreventLeave(isDirty);

    // --- Auth Guard (My Page Restricted Access) ---
    useEffect(() => {
        // Simple Mock Auth Check
        const isLoggedIn = localStorage.getItem('user_session') || localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            alert('로그인이 필요한 서비스입니다.');
            router.replace('/?page=login');
        }
    }, [router]);

    // --- Effects & Logic ---

    // Manage body class for layout focus (hiding scroll/dimming)
    useEffect(() => {
        const isAnyModalOpen = showWarningModal || showDesignModal || showPreviewModal;
        const isFormView = view === 'form';

        if (isAnyModalOpen) {
            // modal-active is now handled by useBodyScrollLock hook
        } else {
            // modal-active is now handled by useBodyScrollLock hook
        }

        if (isFormView) {
            document.body.classList.add('form-mode');
        } else {
            document.body.classList.remove('form-mode');
        }

        // User requested Banners to be VISIBLE in Form View.
        // Only hide if a Modal is open (to prevent Z-index overlap).
        if (isAnyModalOpen) {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('toggle-side-banner', { detail: { visible: false } }));
            }
        } else {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('toggle-side-banner', { detail: { visible: true } }));
            }
        }

        return () => {
            document.body.classList.remove('modal-active');
            document.body.classList.remove('form-mode');
            // Reset Banners on Unmount
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('toggle-side-banner', { detail: { visible: true } }));
            }
        };
    }, [showWarningModal, showDesignModal, showPreviewModal, view]);
    useEffect(() => {
        // Enable CSS-based styling for cleaner HTML and better sync
        document.execCommand('styleWithCSS', false, 'true');
    }, []);

    useEffect(() => {
        setRegionGu('');
    }, [regionCity]);

    useEffect(() => {
        setIndustrySub('');
    }, [industryMain]);

    // Check for query params (view=form&tier=...)
    useEffect(() => {
        const viewParam = searchParams.get('view');
        const tierParam = searchParams.get('tier');

        if (viewParam === 'form') {
            setView('form');
            if (tierParam) {
                // Map tier names to IDs (p1..p8)
                const tierMap: Record<string, string> = {
                    'grand': 'p1',
                    'premium': 'p2',
                    'deluxe': 'p3',
                    'special': 'p4',
                    'urgent': 'p5',
                    'native': 'p6',
                    'basic': 'p7',
                    'extract': 'p8'
                };
                const productId = tierMap[tierParam];
                if (productId) {
                    setSelectedAdProduct(productId);
                }
            }
            // Optional: Scroll to form top
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    }, [searchParams]);

    // Auto SEO Tags
    useEffect(() => {
        const siteName = '코코';
        const fixedSeoTag = `#20대_30대_여자_유흥_밤_당일알바_여우알바_퀸알바_${siteName}알바`;

        const tags = [
            regionCity ? `#${regionCity}` : '',
            regionGu ? `#${regionGu}` : '',
            industryMain ? `#${industryMain}` : '',
            industrySub ? `#${industrySub}` : '',
            ...selectedKeywords.map(t => `#${t}`),
            ...selectedConvenience.map(t => `#${t}`),
            payAmount && payAmount !== '0' && payType !== '종류선택' ? `#${payType}${payAmount}` : '',
            fixedSeoTag
        ].filter(Boolean);
        setSeoTags(tags);
    }, [regionCity, regionGu, industryMain, industrySub, selectedKeywords, selectedConvenience, payType, payAmount]);

    // Calculate Total Amount
    useEffect(() => {
        let total = 0;

        // Main Ad
        if (selectedAdProduct) {
            const product = DETAILED_PRICING.find(p => p.id === selectedAdProduct);
            if (product) {
                const key = `d${selectedAdPeriod}` as keyof typeof product;
                total += product[key] as number;
            }
        }

        // Icon
        if (selectedIcon && iconPeriod > 0) {
            const iconPrice = iconPeriod === 30 ? 30000 : iconPeriod === 60 ? 55000 : 70000;
            total += iconPrice;
        }

        // Highlighter
        if (selectedHighlighter && highlighterPeriod > 0) {
            const hlPrice = highlighterPeriod === 30 ? 30000 : highlighterPeriod === 60 ? 55000 : 70000;
            total += hlPrice;
        }

        // Other Options (Bold etc)
        selectedOptions.forEach(optId => {
            const opt = DETAILED_PRICING.find(p => p.id === optId);
            if (opt) {
                const period = optionPeriods[optId] || 30;
                const key = `d${period}` as keyof typeof opt;
                total += opt[key] as number;
            }
        });

        setTotalAmount(total);
    }, [selectedAdProduct, selectedAdPeriod, selectedIcon, iconPeriod, selectedHighlighter, highlighterPeriod, selectedOptions, optionPeriods]);

    // --- Handlers ---
    const validateContent = (text: string) => {
        if (!text) return [];
        return FORBIDDEN_WORDS.filter(word => text.includes(word));
    };


    // --- Handlers ---
    // 급여 추가 옵션 (Pay Suffixes) - 1 Free + 5 Paid
    const togglePaySuffix = (item: string) => {
        if (paySuffixes.includes(item)) {
            setPaySuffixes(paySuffixes.filter(t => t !== item));
        } else {
            // Logic: 1 free, rest paid. Warn if over limit? System says "Default 1 provided, add up to 5 (paid)".
            // For now, let's just limit total to 6 (1+5) and warn if needed, or just allow selection and calculate price later.
            // Simplified: Just limit to 6 for now.
            if (paySuffixes.length >= 6) return alert('급여 추가옵션은 최대 6개(기본1 + 추가5)까지 선택 가능합니다.');
            setPaySuffixes([...paySuffixes, item]);
        }
    };

    // 편의사항 키워드 (Keywords) - Max 10
    const toggleKeyword = (item: string) => {
        if (selectedKeywords.includes(item)) {
            setSelectedKeywords(selectedKeywords.filter(t => t !== item));
        } else {
            if (selectedKeywords.length >= 10) return alert('키워드는 총 10개까지만 선택 가능합니다.');
            setSelectedKeywords([...selectedKeywords, item]);
        }
    };

    const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value) {
            setPayAmount(Number(value).toLocaleString());
        } else {
            setPayAmount('0');
        }
    };

    const handlePayTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        setPayType(type);
        if (type === '협의') {
            setPayAmount('면접후결정');
        } else if (payAmount === '면접후결정') {
            setPayAmount('0');
        }
    };

    const resetAdStates = () => {
        setSelectedAdProduct(null);
        setSelectedAdPeriod(30);
        setSelectedIcon(null);
        setIconPeriod(0);
        setSelectedHighlighter(null);
        setHighlighterPeriod(0);
        setSelectedOptions([]);
        setOptionPeriods({});
    };

    const handleAdClick = (isNew: boolean = true) => {
        if (isNew) {
            resetAdStates();
        }
        setShowWarningModal(true);
    };

    const proceedToForm = () => {
        setShowWarningModal(false);
        setView('form');

        // Prevent sidebar-warp by resetting layout and scrolling to top safely
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
        });
    };

    const validateForm = () => {
        const required = [
            { val: shopName, msg: '상호명을 입력해주세요.' },
            { val: managerName, msg: '담당자 성함을 입력해주세요.' },
            { val: managerPhone, msg: '연락처를 입력해주세요.' },
            { val: title, msg: '공고 제목을 입력해주세요.' },
            { val: industryMain, msg: '1차 직종을 선택해주세요.' },
            { val: industrySub, msg: '2차 직종을 선택해주세요.' },
            { val: regionCity, msg: '근무 지역(시/도)을 선택해주세요.' },
            { val: regionGu, msg: '근무 지역(구/군)을 선택해주세요.' },
            { val: payType !== '종류선택' ? payType : null, msg: '급여 방식을 선택해주세요.' },
            { val: payAmount !== '0' ? payAmount : null, msg: '급여액을 입력해주세요.' },
        ];

        for (const field of required) {
            if (!field.val) {
                alert(field.msg);
                return false;
            }
        }

        if (!editorRef.current || editorRef.current.innerText.trim() === '') {
            alert('상세 모집 내용을 입력해주세요.');
            return false;
        }

        return true;
    }

    const handleSave = () => {
        // Forbidden Words Check
        const badWordsTitle = validateContent(title);
        const badWordsContent = validateContent(editorRef.current?.innerText || '');

        if (badWordsTitle.length > 0 || badWordsContent.length > 0) {
            const allBadWords = Array.from(new Set([...badWordsTitle, ...badWordsContent]));
            alert(`사용할 수 없는 단어가 포함되어 있습니다.\n금칙어: ${allBadWords.join(', ')}`);
            return;
        }

        if (validateForm()) {
            alert('저장 및 심사 요청이 완료되었습니다!');
            setView('dashboard');
            requestAnimationFrame(() => {
                window.scrollTo({ top: 0, behavior: 'auto' });
            });
        }
    };

    const handlePreview = () => {
        if (validateForm()) {
            setShowPreviewModal(true);
        }
    }

    // --- Editor Logic ---
    const rgbToHex = (rgb: string) => {
        if (!rgb || !rgb.startsWith('rgb')) return rgb;
        const matches = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        if (!matches) return rgb;

        // Handle transparency
        if (matches[4] && parseFloat(matches[4]) === 0) return 'transparent';

        const r = parseInt(matches[1]);
        const g = parseInt(matches[2]);
        const b = parseInt(matches[3]);
        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        return hex;
    };

    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
                selectionRange.current = range.cloneRange();
            }
        }
    };

    const restoreSelection = () => {
        const selection = window.getSelection();
        if (selectionRange.current && editorRef.current) {
            selection?.removeAllRanges();
            selection?.addRange(selectionRange.current);
        } else if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    // --- Editor State Sync ---
    const updateToolbarState = () => {
        if (typeof document === 'undefined') return;

        try {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            let node = range.startContainer;
            if (node.nodeType === 3) { // Text node
                node = node.parentElement as Node;
            }

            // Ensure we are inside the editor
            if (node && editorRef.current && editorRef.current.contains(node)) {
                const element = node as HTMLElement;
                const style = window.getComputedStyle(element);

                // 1. Bold
                const fontWeight = style.fontWeight;
                const isBold = fontWeight === 'bold' || fontWeight === 'bolder' || parseInt(fontWeight) >= 700;
                setIsBold(isBold);

                // 2. Italic
                setIsItalic(style.fontStyle === 'italic');

                // 3. Underline
                setIsUnderline(style.textDecorationLine.includes('underline'));

                // 4. Font Family
                let fontName = style.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
                const normalizedFont = fontName.toLowerCase();
                const fontExists = FONTS.find(f => f.toLowerCase() === normalizedFont);
                setCurrentFont(fontExists || fontName);

                // 5. Font Size (Handle px)
                const fontSize = style.fontSize; // e.g., "16px"
                if (fontSize) {
                    // Check if it matches our options
                    const sizeExists = FONT_SIZES.find(s => s === fontSize);
                    setCurrentFontSize(sizeExists || fontSize);
                } else {
                    // Fallback
                    setCurrentFontSize('');
                }

                // 6. Fore Color
                const foreColor = style.color; // rgb(...)
                const hexFore = rgbToHex(foreColor).toUpperCase();
                const foreExists = TEXT_COLORS.find(c => c.value.toUpperCase() === hexFore);
                setCurrentForeColor(foreExists ? foreExists.value : hexFore);

                // 7. Hilite Color (Walk up recursively)
                let hiliteColor = 'transparent';
                let bgNode: HTMLElement | null = element;

                while (bgNode && editorRef.current.contains(bgNode) && bgNode !== editorRef.current) {
                    const bgStyle = window.getComputedStyle(bgNode);
                    const bg = bgStyle.backgroundColor;

                    if (bg && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)')) {
                        hiliteColor = bg;
                        break;
                    }
                    bgNode = bgNode.parentElement;
                }

                if (hiliteColor !== 'transparent') {
                    const hexHilite = rgbToHex(hiliteColor).toUpperCase();
                    const hiliteExists = BG_COLORS.find(c => c.value.toUpperCase() === hexHilite);
                    setCurrentHiliteColor(hiliteExists ? hiliteExists.value : hexHilite);
                } else {
                    setCurrentHiliteColor('transparent');
                }
            }
        } catch (e) {
            console.error("Editor sync error:", e);
        }
    };

    // --- Editor Commands ---
    const execCmd = (command: string, value: string | undefined = undefined) => {
        if (editorRef.current) {
            editorRef.current.focus(); // Make sure editor is ready
        }
        restoreSelection(); // Put the cursor/selection back where it was

        // Use CSS styling for better support of pixels and colors
        if (document.queryCommandSupported('styleWithCSS')) {
            document.execCommand('styleWithCSS', false, 'true');
        }

        if (command === 'fontSize' && value) {
            // Special handling for legacy fontSize command to support pixels
            // 1. Apply size 7 (largest standard size) as a temporary marker
            document.execCommand('fontSize', false, '7');

            // 2. Find the newly applied styles and force the pixel value
            if (editorRef.current) {
                // Selectors for various browser implementations of "Size 7"
                const elements = editorRef.current.querySelectorAll('font[size="7"], span[style*="font-size: -webkit-xxx-large"], span[style*="font-size: xxx-large"], span[style*="font-size: 3rem"]');
                elements.forEach((el) => {
                    const htmlEl = el as HTMLElement;
                    htmlEl.removeAttribute('size');
                    htmlEl.style.fontSize = value;
                });
            }
        } else {
            document.execCommand(command, false, value);
        }

        if (editorRef.current) {
            editorRef.current.focus();
        }
        saveSelection();
        updateToolbarState();
    };

    const insertEmoji = (emoji: string) => {
        execCmd('insertText', emoji);
    }

    const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const font = e.target.value;
        setCurrentFont(font);
        execCmd('fontName', font);
    }

    // Capture selection & Sync Toolbar (Optimized)
    const handleEditorInteract = (e?: React.KeyboardEvent | React.MouseEvent) => {
        // Filter KeyUp: Only sync on navigation or modifying keys
        if (e && e.type === 'keyup') {
            const key = (e as React.KeyboardEvent).key;
            const ignoreKeys = ['Process', 'Shift', 'Control', 'Alt', 'Meta', 'Escape', 'Tab']; // And common typing?
            // Actually, we SHOULD sync if user typed something that inherits style.
            // But reflow on every char is heavy.
            // Navigation keys are most important for "clicking away and back".
            // If I type 'a', it inherits previous.
            // If I backspace, I might land in new style.
            const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete', 'Enter', 'Home', 'End', 'PageUp', 'PageDown'];
            if (!allowedKeys.includes(key)) return;
        }

        saveSelection();
        updateToolbarState();
    }

    // --- Components ---

    const WarningModal = () => {
        if (typeof document === 'undefined') return null; return createPortal(
            <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
                <div className={`rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center space-y-6 transform animate-in fade-in zoom-in duration-200 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 border-4 shadow-sm ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-pink-50 border-white'}`}>
                        <AlertTriangle size={40} className="text-pink-500" />
                    </div>
                    <h3 className={`text-2xl font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>게시글 작성 전 필독! 📢</h3>
                    <div className={`text-left text-[13px] p-6 rounded-2xl space-y-3 leading-relaxed border font-bold ${brand.theme === 'dark' ? 'bg-gray-800/50 text-gray-300 border-gray-700' : 'bg-gray-50/80 text-gray-700 border-gray-100'}`}>
                        <p className="flex gap-3">
                            <span className="text-pink-500 font-black shrink-0">1.</span>
                            <span>월 수정횟수는 <strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-black'} font-black`}>30회</strong> 입니다.</span>
                        </p>
                        <p className="flex gap-3">
                            <span className="text-pink-500 font-black shrink-0">2.</span>
                            <span>금칙어 사용 시 <strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-black'} font-black`}>통보 없이 삭제</strong>될 수 있습니다.</span>
                        </p>
                        <p className="flex gap-3">
                            <span className="text-pink-500 font-black shrink-0">3.</span>
                            <span>본문 내용은 <strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-black'} font-black`}>1000자 이내</strong>로 작성해주세요.</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button onClick={() => setShowWarningModal(false)} className={`py-4 rounded-xl border-2 font-bold transition-colors ${brand.theme === 'dark' ? 'border-gray-800 text-gray-500 hover:bg-gray-800' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}>취소</button>
                        <button onClick={proceedToForm} className="py-4 rounded-xl bg-[#ff3399] text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-pink-100/10">확인 후 작성</button>
                    </div>
                </div>
            </div>
            , document.body);
    };

    const DesignRequestModal = () => {
        if (typeof document === 'undefined') return null; return createPortal(
            <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
                <div className={`rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center space-y-6 transform animate-in fade-in zoom-in duration-200 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 border-4 shadow-sm ${brand.theme === 'dark' ? 'bg-blue-900/30 border-gray-800' : 'bg-blue-50 border-white'}`}>
                        <Laptop size={40} className="text-blue-500" />
                    </div>
                    <h3 className={`text-2xl font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>상세페이지 디자인 의뢰</h3>
                    <p className={`${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-800'} text-sm leading-relaxed`}>
                        전문 디자이너가 사장님만의 <br />
                        <strong className="text-pink-500 font-black text-lg">고퀄리티 상세페이지</strong>를 제작해드립니다.
                    </p>
                    <div className={`p-6 rounded-2xl text-left space-y-3 text-xs md:text-sm border font-bold ${brand.theme === 'dark' ? 'bg-blue-900/10 text-blue-200 border-blue-900/30' : 'bg-blue-50/50 text-gray-700 border-blue-100'}`}>
                        <p className="flex items-center gap-2">• 브랜드 전용 1:1 맞춤형 고해상도 디자인</p>
                        <p className="flex items-center gap-2">• 7단계 노출 등급에 최적화된 레이아웃 제공</p>
                        <p className="flex items-center gap-2">• 움직이는 GIF 및 프리미엄 움짤 무료 제작</p>
                        <p className="flex items-center gap-2">• 제작 기간: 영업일 기준 평균 1~2일</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pt-2">
                        <button onClick={() => alert('고객센터로 디자인 제작 문의가 접수되었습니다.')} className="py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-100/10 transition-all flex items-center justify-center gap-2">
                            실시간 1:1 문의 / 고객센터 연결
                        </button>
                        <button onClick={() => setShowDesignModal(false)} className="py-3 text-gray-400 font-bold hover:text-gray-600">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
            , document.body);
    };

    const PreviewModal = () => {
        if (typeof document === 'undefined') return null;

        return createPortal(
            <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className={`rounded-[32px] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] transform animate-in fade-in fill-mode-both duration-300 ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
                    <div className={`p-6 border-b flex justify-between items-center rounded-t-[32px] ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50/50'}`}>
                        <h3 className={`font-black text-xl flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><Eye size={24} className="text-pink-500" /> 채용공고 최종 미리보기</h3>
                        <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-6">
                        <div>
                            <span className="inline-block px-2 py-1 bg-pink-100 text-pink-600 text-xs font-bold rounded mb-2">{industrySub}</span>
                            <h2 className={`text-2xl font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                            <p className="text-sm text-gray-500 mt-1">{shopName} | {regionCity} {regionGu}</p>
                        </div>

                        <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl text-sm ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                            <div><span className="text-gray-500 block text-xs">급여</span><strong className="text-blue-600 text-lg">{payType} {payAmount}</strong></div>
                            <div><span className="text-gray-500 block text-xs">나이</span><strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ageMin}세 ~ {ageMax}세</strong></div>
                            <div><span className="text-gray-500 block text-xs">담당자 / 연락처</span><strong className={`${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{managerName} / {managerPhone}</strong></div>
                            <div>
                                <span className="text-gray-500 block text-xs">메신저</span>
                                <div className="flex flex-col gap-1 mt-1">
                                    {messengers.kakao && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-yellow-100 text-[10px] text-yellow-800 rounded font-bold">카카오</span><span className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{messengers.kakao}</span></div>}
                                    {messengers.line && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-green-100 text-[10px] text-green-800 rounded font-bold">라인</span><span className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{messengers.line}</span></div>}
                                    {messengers.telegram && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-blue-100 text-[10px] text-blue-800 rounded font-bold">텔레그램</span><span className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{messengers.telegram}</span></div>}
                                    {!messengers.kakao && !messengers.line && !messengers.telegram && <span className="text-gray-500 text-xs">-</span>}
                                </div>
                            </div>
                        </div>

                        {/* Pay Suffixes Preview */}
                        {paySuffixes.length > 0 && (
                            <div className={`p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">급여 추가 옵션</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {paySuffixes.map((suffix, i) => (
                                        <span key={i} className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg">{suffix}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-6 text-left">
                            <h4 className="font-bold text-gray-900 mb-4">상세내용</h4>
                            <div
                                className="prose prose-sm max-w-none text-gray-900 leading-relaxed whitespace-pre-wrap text-left"
                                style={{ fontFamily: 'inherit' }}
                                dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '' }}
                            />
                        </div>
                    </div>

                    <div className={`p-4 border-t text-left ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">Keyword & Info</p>
                        <div className="flex flex-wrap gap-1 text-[10px] text-gray-500">
                            {selectedKeywords.map(k => <span key={k} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mr-1">#{k}</span>)}
                        </div>
                    </div>

                    <div className={`p-4 border-t rounded-b-2xl text-right ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <button onClick={() => setShowPreviewModal(false)} className={`px-6 py-3 font-bold rounded-xl transition ${brand.theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>닫기</button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const MobileMenu = () => {
        if (typeof document === 'undefined') return null; return createPortal(
            <div className="fixed inset-0 z-[20000] flex justify-end">
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
                <div className={`relative w-72 h-full shadow-2xl p-6 transform animate-in slide-in-from-right duration-300 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                    <button onClick={() => setShowMobileMenu(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>

                    <div className="mt-8 text-center">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 flex items-center justify-center text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-pink-100'}`}>
                            <Store size={32} />
                        </div>
                        <h2 className={`font-black text-lg ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{shopName}</h2>
                        <p className="text-sm text-gray-500 mb-6">프리미엄 회원</p>
                        <button className={`w-full py-2 rounded-lg text-xs font-bold transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            사진 등록/수정
                        </button>
                    </div>

                    <nav className={`mt-8 space-y-2 text-sm font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div onClick={() => { setView('dashboard'); setShowMobileMenu(false); }} className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><List size={18} /> 진행중인 공고</div>
                        <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><LogOut size={18} /> 마감된 공고</div>
                        <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><CreditCard size={18} /> 유료 결제 내역</div>
                        <div onClick={() => { setView('member-info'); setShowMobileMenu(false); }} className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><User size={18} /> 회원 정보 수정</div>
                    </nav>
                </div>
            </div>
            , document.body);
    };

    const MemberInfoForm = () => (
        <div className={`max-w-4xl mx-auto p-6 md:p-10 rounded-[32px] shadow-xl border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <h2 className={`text-2xl font-black mb-8 pb-4 border-b ${brand.theme === 'dark' ? 'text-white border-gray-800' : 'text-gray-900 border-gray-100'}`}>
                회원 정보 수정
            </h2>

            <div className="space-y-8">
                {/* ID / Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-sm font-bold mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>아이디</label>
                        <input type="text" value="bizsetter" disabled className={`w-full p-4 rounded-xl font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`} />
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>비밀번호 변경</label>
                        <div className="flex gap-2">
                            <input type="password" placeholder="변경할 비밀번호 입력" className={`flex-1 p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-pink-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-200 text-gray-900 focus:border-pink-500'}`} />
                            <button className={`px-4 rounded-xl font-bold whitespace-nowrap ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>변경</button>
                        </div>
                    </div>
                </div>

                {/* Nickname & Business Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-sm font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            닉네임 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            maxLength={10}
                            onChange={(e) => setNickname(e.target.value)}
                            className={`w-full p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-pink-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-200 text-gray-900 focus:border-pink-500'}`}
                        />
                        <p className="text-[11px] text-pink-500 mt-1.5 font-bold flex items-center gap-1">
                            <span className="w-1 h-1 bg-pink-500 rounded-full"></span>
                            최대 10자 (공백 포함) / 구인 리스트에 노출됩니다.
                        </p>
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            상호명 (고정) <Check size={14} className="text-green-500" />
                        </label>
                        <input
                            type="text"
                            value={shopName}
                            disabled
                            className={`w-full p-4 rounded-xl font-bold border opacity-70 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}
                        />
                        <p className="text-[11px] text-green-600 mt-1.5 font-bold">
                            * 사업자등록증 기반으로 인증된 상호명입니다.
                        </p>
                    </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-sm font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            이메일
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full p-4 rounded-xl font-bold border transition focus:ring-2 focus:ring-pink-500/20 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-200 text-gray-900 focus:border-pink-500'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-2 flex items-center gap-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            휴대폰 번호 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value="010-3838-4335"
                                readOnly
                                className={`flex-1 p-4 rounded-xl font-bold border outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-900'}`}
                            />
                            <button className={`px-4 rounded-xl font-bold whitespace-nowrap bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition`}>
                                재인증
                            </button>
                        </div>
                    </div>
                </div>

                {/* SMS Consent */}
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div
                        onClick={() => setSmsConsent(!smsConsent)}
                        className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer transition ${smsConsent ? 'bg-pink-500 border-pink-500 text-white' : 'bg-white border-gray-300'}`}
                    >
                        {smsConsent && <Check size={16} />}
                    </div>
                    <label className={`cursor-pointer font-bold select-none ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} onClick={() => setSmsConsent(!smsConsent)}>
                        [필수] SMS 수신 동의 (중요 알림 및 공지사항)
                    </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => setView('dashboard')} className={`px-8 py-4 rounded-xl font-bold transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        취소
                    </button>
                    <button onClick={() => { alert('회원 정보가 수정되었습니다.'); setView('dashboard'); }} className="px-8 py-4 rounded-xl bg-pink-500 text-white font-black hover:bg-pink-600 shadow-xl shadow-pink-500/20 transition">
                        회원정보 수정하기
                    </button>
                </div>
            </div>
        </div>
    );

    // Personal Mobile Menu Component
    function PersonalMobileMenu({ onClose, setView }: { onClose: () => void, setView: (v: 'member-info' | 'member-edit' | 'resume-form' | 'dashboard' | 'form') => void }) {
        const menuItems = [
            { id: 'resume-list', label: '이력서 리스트', icon: <List size={16} /> },
            { id: 'scrap', label: '채용정보 스크랩', icon: <Star size={16} /> },
            { id: 'payment', label: '유료결제 내역', icon: <CreditCard size={16} /> },
            { id: 'excluded', label: '열람불가 업소설정', icon: <AlertTriangle size={16} /> },
            { id: 'custom-job', label: '맞춤구인정보', icon: <Briefcase size={16} /> },
            { id: 'my-posts', label: '내가 작성한 게시글', icon: <FileText size={16} /> },
            { id: 'block', label: '회원 차단 설정', icon: <User size={16} /> },
            { id: 'bookmark', label: '즐겨찾기한 게시글', icon: <Star size={16} /> },
        ];

        return (
            createPortal(
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                    <div className={`absolute top-0 right-0 w-[80%] max-w-[300px] h-full shadow-2xl animate-in slide-in-from-right duration-300 ${brand.theme === 'dark' ? 'bg-gray-900 border-l border-gray-800' : 'bg-white'}`}>
                        <div className="p-4 flex justify-between items-center border-b dark:border-gray-800">
                            <h2 className={`font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>마이페이지 메뉴</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                                <X size={20} className={brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                            </button>
                        </div>
                        <div className="p-4 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === 'resume-list') setView('member-info');
                                        else alert('준비 중인 기능입니다.');
                                        onClose();
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl flex items-center gap-3 transition ${brand.theme === 'dark' ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        {/* Global Links for Mobile */}
                        <div className="p-4 border-t dark:border-gray-800 space-y-1">
                            <button onClick={() => router.push('/')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                                <Home size={16} /> 홈으로
                            </button>
                            <button onClick={() => router.push('/community')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                                <MessageCircle size={16} /> 커뮤니티
                            </button>
                            <button onClick={() => {
                                if (confirm('로그아웃 하시겠습니까?')) {
                                    localStorage.clear();
                                    window.location.href = '/';
                                }
                            }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3">
                                <LogOut size={16} /> 로그아웃
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )
        );
    }

    if (userTypeForLayout === null) {
        return <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`} />;
    }

    if (userTypeForLayout === 'personal') {
        return (
            <div className={`h-auto ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} pb-24`}>
                {showMobileMenu && <PersonalMobileMenu onClose={() => setShowMobileMenu(false)} setView={setView} />}

                {/* Header is Global now */}

                <div className="max-w-6xl mx-auto p-3 md:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <PersonalSidebar view={view} setView={setView} />
                    <main className="col-span-1 md:col-span-3">
                        {(view === 'member-info' || view === 'dashboard') && <PersonalDashboardHome setView={setView} />}
                        {view === 'member-edit' && <PersonalMemberEdit setView={setView} />}
                        {view === 'resume-form' && <ResumeForm setView={setView} />}

                        {/* New View Placeholders */}
                        {view === 'resume-list' && <PersonalDashboardHome setView={setView} />} {/* Placeholder reusing dashboard */}
                        {view === 'scrap-jobs' && <ComingSoonView title="채용정보 스크랩" />}
                        {view === 'payment-history' && <ComingSoonView title="유료결제 내역" />}
                        {view === 'excluded-shops' && <ComingSoonView title="열람불가 업소설정" />}
                        {view === 'custom-jobs' && <ComingSoonView title="맞춤구인정보" />}
                        {view === 'my-posts' && <ComingSoonView title="내가 작성한 게시글" />}
                        {view === 'block-settings' && <ComingSoonView title="회원 차단 설정" />}
                        {view === 'post-bookmarks' && <ComingSoonView title="즐겨찾기한 게시글" />}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-auto ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} pb-24`}>
            {showWarningModal && <WarningModal />}
            {showDesignModal && <DesignRequestModal />}
            {showPreviewModal && <PreviewModal />}
            {showMobileMenu && <MobileMenu />}



            {view === 'dashboard' ? (
                <div className="max-w-6xl mx-auto p-3 md:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar (PC Only) */}
                    <aside className="hidden md:block col-span-1 space-y-2">
                        <div className={`p-6 rounded-2xl border shadow-sm text-center flex flex-col justify-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <div className={`w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-pink-100'}`}>
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={32} /></div>
                            </div>
                            <div>
                                <h2 className={`font-black text-xl tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shopName}</h2>
                                {nickname && <p className={`text-sm font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{nickname}</p>}
                                <p className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>프리미엄 인증 업소</p>
                            </div>
                            <button className={`w-full py-2 rounded-lg text-xs font-bold transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                사진 등록/수정
                            </button>
                        </div>
                    </aside>

                    {/* Main Content (Dashboard) */}
                    <div className="col-span-1 md:col-span-3 space-y-6">
                        <header className="flex flex-col gap-4 mb-8">
                            <div className={`p-6 sm:rounded-[32px] shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-pink-600'}`}>
                                            <Store size={32} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className={`text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{shopName}</h2>
                                                {isVerified && <Check size={16} className="text-blue-500" strokeWidth={3} />}
                                            </div>
                                            <p className="text-sm text-gray-500 font-bold flex items-center gap-1">
                                                <MapPin size={14} /> 서울 강남구 테헤란로
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button onClick={() => setShowDesignModal(true)} className={`flex-1 md:flex-none py-3 px-5 rounded-xl text-sm font-bold border transition ${brand.theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                            디자인 의뢰
                                        </button>
                                        <button onClick={() => handleAdClick(true)} className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-pink-500 text-white text-sm font-black hover:bg-pink-600 shadow-lg shadow-pink-500/30 transition flex items-center justify-center gap-2">
                                            <PlusSquare size={18} /> 새 공고 등록
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-3 gap-2 md:gap-4 h-24 md:h-auto">
                            <div className={`p-2 md:p-4 rounded-2xl border shadow-sm text-center flex flex-col justify-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <div className="text-[11px] md:text-sm font-black mb-1 text-black">채용공고 등록수</div>
                                <div className="text-lg md:text-3xl font-black text-pink-500">1<span className="text-xs text-gray-400 ml-1">개</span></div>
                            </div>
                            <div className={`p-2 md:p-4 rounded-2xl border shadow-sm text-center flex flex-col justify-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <div className="text-[11px] md:text-sm font-black mb-1 text-black">진행중인 공고</div>
                                <div className="text-lg md:text-3xl font-black text-blue-500">1<span className="text-xs text-gray-400 ml-1">개</span></div>
                            </div>
                            <div className={`p-2 md:p-4 rounded-2xl border shadow-sm text-center opacity-60 flex flex-col justify-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <div className="text-[11px] md:text-sm font-black mb-1 text-black">마감된 공고</div>
                                <div className="text-lg md:text-3xl font-black text-gray-500">0<span className="text-xs text-gray-400 ml-1">개</span></div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleAdClick(true)}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-black rounded-xl shadow-lg shadow-blue-200 hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                            <PlusSquare size={24} />
                            채용공고 등록하기
                        </button>

                        {/* Media URL Section Removed - Moved to Editor Toolbar */}

                        <div className={`rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>

                            {/* 1. Recruitment Info */}
                            <div className={`p-4 border-b transition ${brand.theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex gap-2 text-xs items-center">
                                            <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-black">진행중</span>
                                            <span className="text-gray-400">마감일: 2026-02-25</span>
                                        </div>
                                        <h4 className={`font-bold line-clamp-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🔥 [강남 쩜오] 갯수보장 / 팁별도 / 당일지급 확실합니다!</h4>
                                        <div className={`text-xs ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {shopName} {nickname && <span className="text-xs text-gray-400 ml-1">({nickname})</span>} | 서울 강남구 | 룸싸롱 | 아가씨
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0 items-center justify-center md:justify-end">
                                        <button onClick={() => handleAdClick(false)} className={`px-3 py-2 border text-xs font-bold rounded transition ${brand.theme === 'dark' ? 'border-blue-500/50 text-blue-400 hover:bg-blue-900/20' : 'border-blue-500 text-blue-600 hover:bg-blue-50'}`}>수정</button>
                                        <button className={`px-3 py-2 border text-xs font-bold rounded transition ${brand.theme === 'dark' ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>마감</button>
                                        <button className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 shadow-sm">
                                            <RefreshCw size={12} /> 점프
                                        </button>
                                        <button className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 shadow-sm">
                                            <Calendar size={12} /> 연장
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto p-3 md:py-8">
                    {/* Inner Forms Logic */}
                    {view === 'member-info' ? (
                        <MemberInfoForm />
                    ) : (
                        // Form View
                        <>
                            <div className="space-y-3">
                                <div className={`p-6 rounded-[32px] shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
                                        <h2 className={`text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>채용공고등록</h2>
                                    </div>
                                    <p className={`text-sm ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <strong className="text-pink-500">*</strong> 표시는 필수 입력 항목입니다. 정확한 정보를 입력해주세요.
                                    </p>
                                    {/* Form Content */}
                                </div>
                                {/* Start of existing Form Content */}
                                {/* Start of existing Form Content */}
                                <section className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
                                    <h2 className="font-black text-gray-800 mb-2.5 flex items-center gap-2 text-sm">
                                        <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                                        기본 정보
                                    </h2>
                                    <div className="space-y-2.5">
                                        <div>
                                            <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>상호명</label>
                                            <input
                                                type="text"
                                                value={shopName}
                                                onChange={(e) => setShopName(e.target.value)}
                                                className={`w-full border rounded-lg p-2 text-sm font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-900/50' : 'bg-gray-50 border-gray-200 text-black focus:ring-purple-500'} ${isVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                readOnly={isVerified}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>닉네임</label>
                                            <input
                                                type="text"
                                                placeholder="닉네임을 입력하세요"
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value)}
                                                className={`w-full border rounded-lg p-2 text-sm font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-purple-900/50' : 'bg-gray-50 border-gray-200 text-black focus:ring-purple-500'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>사업자 인증</label>
                                            {isVerified ? (
                                                <div className="w-full py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-bold flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                    인증 완료
                                                </div>
                                            ) : (
                                                <button className={`w-full py-2 border border-dashed rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                                                    <Camera size={16} /> 촬영/업로드
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className={`p-3 md:p-4 rounded-xl shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <h2 className={`font-black mb-2.5 flex items-center gap-2 text-sm ${brand.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                                        담당자 정보
                                    </h2>
                                    <div className="space-y-2.5">
                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>성함</label>
                                                <input type="text" placeholder="김실장" value={managerName} onChange={(e) => setManagerName(e.target.value)} className={`w-full border rounded-lg p-2 text-base placeholder-gray-400 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-white border-gray-200 text-black focus:ring-blue-500'}`} />
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>연락처</label>
                                                <input type="tel" placeholder="010-0000-0000" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} className={`w-full border rounded-lg p-2 text-base placeholder-gray-400 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-900/50' : 'bg-white border-gray-200 text-black focus:ring-blue-500'}`} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xs font-black text-yellow-600 ml-1">카톡</span>
                                                <input type="text" placeholder="ID" value={messengers.kakao} onChange={e => setMessengers({ ...messengers, kakao: e.target.value })} className={`w-full border rounded-md p-1.5 text-sm placeholder-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xs font-black text-green-600 ml-1">라인</span>
                                                <input type="text" placeholder="ID" value={messengers.line} onChange={e => setMessengers({ ...messengers, line: e.target.value })} className={`w-full border rounded-md p-1.5 text-sm placeholder-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xs font-black text-blue-600 ml-1">텔레</span>
                                                <input type="text" placeholder="ID" value={messengers.telegram} onChange={e => setMessengers({ ...messengers, telegram: e.target.value })} className={`w-full border rounded-md p-1.5 text-sm placeholder-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className={`p-3 md:p-4 rounded-xl shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <h2 className={`font-black mb-2.5 flex items-center gap-2 text-sm ${brand.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        <span className="w-1.5 h-4 bg-pink-500 rounded-full"></span>
                                        채용 공고 정보
                                    </h2>
                                    <div className="space-y-2.5">
                                        <div>
                                            <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>공고 제목</label>
                                            <input type="text" placeholder="EX) 강남 1등 가게! 갯수 보장!" value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full border rounded-lg p-2 text-base font-black placeholder-gray-400 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:ring-pink-900/50' : 'bg-white border-gray-200 text-black focus:ring-pink-500'}`} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>직종</label>
                                                <div className="flex gap-1.5">
                                                    <select value={industryMain} onChange={e => setIndustryMain(e.target.value)} className={`w-full border rounded-lg p-2 text-base outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                                        <option value="">1차</option>
                                                        {Object.keys(INDUSTRY_DATA).map(i => <option key={i} value={i}>{i}</option>)}
                                                    </select>
                                                    <select value={industrySub} onChange={e => setIndustrySub(e.target.value)} className={`w-full border rounded-lg p-2 text-sm outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                                        <option value="">2차</option>
                                                        {INDUSTRY_DATA[industryMain]?.map(j => <option key={j} value={j}>{j}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>연령</label>
                                                <div className="flex items-center gap-1.5">
                                                    <select value={ageMin} onChange={e => setAgeMin(Number(e.target.value))} className={`w-full border rounded-lg p-2 text-base outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                                        {AGES.map(a => <option key={a} value={a}>{a}세</option>)}
                                                    </select>
                                                    <span className="text-gray-300 text-[10px]">-</span>
                                                    <select value={ageMax} onChange={e => setAgeMax(Number(e.target.value))} className={`w-full border rounded-lg p-2 text-sm outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                                        {AGES.map(a => <option key={a} value={a}>{a}세</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>근무 지역</label>
                                                <div className="flex gap-1.5">
                                                    <select value={regionCity} onChange={e => setRegionCity(e.target.value)} className={`w-full border rounded-lg p-2 text-base outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                                        <option value="">시/도</option>
                                                        {Object.keys(REGION_DATA).map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                    <select value={regionGu} onChange={e => setRegionGu(e.target.value)} className={`w-full border rounded-lg p-2 text-sm outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                                        <option value="">구/군</option>
                                                        {REGION_DATA[regionCity]?.map(g => <option key={g} value={g}>{g}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>근무시간</label>
                                                <input type="text" placeholder="협의" value={workTime} onChange={(e) => setWorkTime(e.target.value)} className={`w-full border rounded-lg p-2 text-base placeholder-gray-400 outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            <div>
                                                <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>급여 방식</label>
                                                <select value={payType} onChange={handlePayTypeChange} className={`w-full border rounded-lg p-2 text-base outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                                    {PAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>급여액</label>
                                                <input type="text" placeholder="0" value={payAmount} onChange={handlePayAmountChange} disabled={payType === '협의'} className={`w-full border rounded-lg p-2 text-base font-black text-right outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} ${payType === '협의' ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`} />
                                            </div>
                                            <div className="col-span-2 mt-1">
                                                <label className={`block text-xs font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>급여 추가 옵션</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {PAY_SUFFIX_OPTIONS.map(suffix => (
                                                        <button
                                                            key={suffix}
                                                            onClick={() => {
                                                                if (paySuffixes.includes(suffix)) {
                                                                    setPaySuffixes(paySuffixes.filter(s => s !== suffix));
                                                                } else {
                                                                    setPaySuffixes([...paySuffixes, suffix]);
                                                                }
                                                            }}
                                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${paySuffixes.includes(suffix) ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200' : (brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50')}`}
                                                        >
                                                            {suffix}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between items-center">
                                                <label className="block text-sm font-black text-gray-500 uppercase tracking-tighter">편의사항 및 키워드 (최대 10개)</label>
                                                <span className={`text-xs font-bold ${selectedKeywords.length >= 10 ? 'text-red-500' : 'text-pink-500'}`}>
                                                    {selectedKeywords.length}/10
                                                </span>
                                            </div>
                                            <div className={`p-4 rounded-xl border border-dashed flex flex-wrap gap-2 max-h-[150px] overflow-y-auto custom-scrollbar ${brand.theme === 'dark' ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50/50 border-gray-200'}`}>
                                                {CONVENIENCE_KEYWORDS.map(item => (
                                                    <button
                                                        key={item}
                                                        onClick={() => toggleKeyword(item)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedKeywords.includes(item)
                                                            ? 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-200 dark:shadow-none'
                                                            : (brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700')
                                                            }`}
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-gray-400 text-center">
                                                * 선택하신 키워드는 검색 필터와 매칭되어 노출 효율을 높여줍니다.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* 에디터와 상세 정보 미리보기는 전체 너비로 배치하여 수직 공간 효율 극대화 */}
                                {/* 에디터와 상세 정보 미리보기는 전체 너비로 배치하여 수직 공간 효율 극대화 */}
                                <section className={`p-3 md:p-4 rounded-xl shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className={`font-black flex items-center gap-2 text-sm ${brand.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                            <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                                            상세내용 (에디터)
                                        </h2>
                                        <button onClick={() => setShowDesignModal(true)} className="text-xs font-black text-blue-500 flex items-center gap-1 hover:underline">
                                            <HelpCircle size={12} /> 디자인이 필요한가요?
                                        </button>
                                    </div>
                                    <div className="border rounded-xl overflow-hidden">
                                        <div className={`border-b p-1.5 flex gap-1 flex-wrap items-center ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                            <select onChange={handleFontChange} value={currentFont} className={`h-6 text-[10px] border rounded px-1 outline-none w-16 ${brand.theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
                                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <select onChange={(e) => execCmd('fontSize', e.target.value)} value={currentFontSize} className={`h-6 text-[10px] border rounded px-1 outline-none w-12 ${brand.theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
                                                {FONT_SIZES.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <div className={`w-px h-3 mx-0.5 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className={`p-1 rounded ${isBold ? 'bg-gray-300' : (brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100')}`}><Bold size={14} /></button>
                                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className={`p-1 rounded ${isItalic ? 'bg-gray-300' : (brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100')}`}><Italic size={14} /></button>
                                            <button onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} className={`p-1 rounded ${isUnderline ? 'bg-gray-300' : (brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100')}`}><Underline size={14} /></button>
                                            <div className={`w-px h-3 mx-0.5 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                            <select value={currentForeColor} onChange={(e) => execCmd('foreColor', e.target.value)} className={`h-6 text-[10px] outline-none w-16 border rounded ${brand.theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
                                                <option value="black">글자색</option>
                                                {TEXT_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                            <select value={currentHiliteColor} onChange={(e) => execCmd('hiliteColor', e.target.value)} className={`h-6 text-[10px] outline-none w-16 border rounded ${brand.theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
                                                <option value="transparent">배경색</option>
                                                {BG_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                            <div className={`w-px h-3 mx-0.5 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                            <button onClick={() => execCmd('justifyLeft')} className={`p-1 rounded ${brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}><AlignLeft size={14} /></button>
                                            <button onClick={() => execCmd('justifyCenter')} className={`p-1 rounded ${brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}><AlignCenter size={14} /></button>
                                            <button onClick={() => execCmd('justifyRight')} className={`p-1 rounded ${brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}><AlignRight size={14} /></button>
                                            <div className={`w-px h-3 mx-0.5 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                            <button
                                                onClick={() => {
                                                    const url = window.prompt('이미지 또는 영상 URL을 입력하세요', mediaUrl);
                                                    if (url !== null) {
                                                        setMediaUrl(url);
                                                    }
                                                }}
                                                className={`p-1 rounded flex items-center gap-1 ${brand.theme === 'dark' ? 'hover:bg-gray-700 text-pink-400' : 'hover:bg-pink-50 text-pink-500'}`}
                                                title="대표 미디어 설정"
                                            >
                                                <Camera size={14} />
                                                <span className="text-[10px] font-bold">미디어</span>
                                            </button>
                                        </div>
                                        <div
                                            ref={editorRef}
                                            contentEditable
                                            className={`w-full h-[180px] md:h-[220px] p-3 text-sm outline-none overflow-y-auto leading-relaxed ${brand.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                                            suppressContentEditableWarning={true}
                                            onMouseUp={handleEditorInteract}
                                            onKeyUp={handleEditorInteract}
                                            onInput={() => {
                                                if (!isEditorDirty) setIsEditorDirty(true);
                                            }}
                                            onBlur={saveSelection}
                                        />
                                    </div>
                                </section>

                                <div className={`p-3 md:p-4 rounded-xl border flex items-center justify-between ${brand.theme === 'dark' ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="flex items-center gap-2">
                                        <Search size={16} className="text-blue-500" />
                                        <span className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>SEO 태그 프리뷰:</span>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {seoTags.map((tag, idx) => <span key={idx} className={`text-[10px] px-1.5 py-0.5 rounded border ${brand.theme === 'dark' ? 'bg-gray-800 text-blue-400 border-blue-900/50' : 'bg-white text-blue-600 border-blue-200'}`}>#{tag}</span>)}
                                        </div>
                                    </div>
                                </div>

                                <section className={`p-0 rounded-xl shadow-sm border-2 overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-950 border-pink-900/30' : 'bg-white border-pink-100'}`}>
                                    <div className="bg-gradient-to-r from-purple-700 to-pink-600 text-white p-2.5 flex justify-between items-center">
                                        <h2 className="font-black text-xs flex items-center gap-2">
                                            <Crown size={14} className="text-yellow-400" />
                                            광고 등급 서비스 선택 (7-Tier System)
                                        </h2>
                                        <div className="flex items-center gap-2 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                            <span className="text-[11px] font-bold">실시간 노출 최적화 적용됨</span>
                                        </div>
                                    </div>

                                    <div className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                        {DETAILED_PRICING.filter(p => p.isMain).map((product, idx) => (
                                            <div key={product.id} className={`flex ${product.id === 'p8' ? 'flex-row items-center' : 'flex-col sm:flex-row sm:items-center'} p-3 gap-3 transition-colors ${brand.theme === 'dark' ? 'hover:bg-pink-900/10' : 'hover:bg-pink-50/10'} ${product.disabled ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className={`w-14 h-14 sm:w-16 sm:h-20 rounded border flex-shrink-0 flex flex-col items-center justify-center text-[8px] sm:text-[10px] font-black ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-700' : 'bg-gray-50 border-gray-100 text-gray-300'}`}>
                                                        IMG
                                                    </div>
                                                    <div className="flex-1 min-w-0 py-0.5 sm:py-1">
                                                        <div className="flex items-center gap-1.5 mb-1 sm:mb-0.5">
                                                            <span className={`text-sm sm:text-base font-black leading-tight ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{idx + 1}. {product.name}</span>
                                                            {product.id === 'p6' && <span className="text-[9px] sm:text-[10px] bg-red-500 text-white px-1.5 font-black rounded uppercase shrink-0">Best</span>}
                                                        </div>
                                                        <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
                                                            {(() => {
                                                                if (!product.desc.includes('. (')) return product.desc;
                                                                const [main, sub] = product.desc.split('. (');
                                                                return (
                                                                    <>
                                                                        <span className="block mb-0.5 sm:mb-0">{main}.</span>
                                                                        <span className="flex items-start gap-1 text-pink-500/90 sm:text-gray-400 text-[10px] sm:text-xs font-black">
                                                                            <span className="sm:hidden shrink-0 mt-0.5 text-[8px]">✨</span>
                                                                            <span>({sub}</span>
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`${product.id === 'p8' ? 'flex w-auto mt-0' : 'grid grid-cols-3 sm:flex w-full sm:w-auto mt-1 sm:mt-0'} gap-1.5 sm:gap-2 shrink-0`}>
                                                    {product.id === 'p8' ? (
                                                        <div className={`flex-1 flex items-center justify-center border border-dashed rounded-xl text-[10px] md:text-xs font-bold py-3 px-4 w-full sm:w-auto sm:min-w-[270px] sm:h-[48px] text-centerleading-tight ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'}`}>
                                                            <span className="hidden sm:inline">▼ 아래 항목에서 선택해주세요 ▼</span>
                                                            <span className="sm:hidden">▼ 아래 항목에서<br />선택해주세요 ▼</span>
                                                        </div>
                                                    ) : (
                                                        [30, 60, 90].map((days) => (
                                                            <label key={days} className={`flex flex-col items-center justify-center flex-1 sm:w-[85px] h-[44px] sm:h-[48px] rounded-xl cursor-pointer border-2 transition-all relative overflow-hidden ${selectedAdProduct === product.id && selectedAdPeriod === days ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-md ring-2 ring-pink-100' : (brand.theme === 'dark' ? 'border-gray-800 bg-gray-900 text-gray-500 hover:border-pink-900' : 'border-gray-100 bg-white text-gray-400 hover:border-pink-200')} ${product.id === 'p8' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                onClick={(e) => {
                                                                    if (product.id === 'p8') {
                                                                        e.preventDefault();
                                                                        alert('아이콘선택 또는 형광펜을 선택 가능해주세요');
                                                                    }
                                                                }}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    className="hidden"
                                                                    checked={selectedAdProduct === product.id && selectedAdPeriod === days}
                                                                    onChange={() => {
                                                                        if (product.id !== 'p8') {
                                                                            setSelectedAdProduct(product.id);
                                                                            setSelectedAdPeriod(days as 30 | 60 | 90);
                                                                        }
                                                                    }}
                                                                />
                                                                {selectedAdProduct === product.id && selectedAdPeriod === days && (
                                                                    <div className="absolute top-0 right-0 bg-pink-500 text-white p-0.5 rounded-bl-lg">
                                                                        <Check size={9} strokeWidth={4} />
                                                                    </div>
                                                                )}
                                                                <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-none mb-0.5 sm:mb-1">{days}일</span>
                                                                <span className={`text-[11px] sm:text-xs font-black tracking-tighter ${selectedAdProduct === product.id && selectedAdPeriod === days ? 'text-pink-600' : (brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}`}>{(product as Record<string, any>)[`d${days}`].toLocaleString()}원</span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <section className={`rounded-xl shadow-sm border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                        <div className={`p-2.5 px-3 flex justify-between items-center ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-[#666] text-white'}`}>
                                            <h2 className="font-black text-xs md:text-sm flex items-center gap-2">8번 - 아이콘 선택</h2>
                                        </div>
                                        <div className="p-3">
                                            <div className="grid grid-cols-4 gap-1.5 mb-3">
                                                {[0, 30, 60, 90].map(d => (
                                                    <label key={d} className={`flex flex-col items-center justify-center gap-1 cursor-pointer px-1 py-2 rounded-lg border transition-all ${iconPeriod === d ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                        onClick={(e) => {
                                                            if (!selectedAdProduct) {
                                                                e.preventDefault();
                                                                alert('메인광고(1~7번)을 선택한 후, 신청가능합니다.');
                                                            }
                                                        }}
                                                    >
                                                        <input type="radio" checked={iconPeriod === d} onChange={() => { if (selectedAdProduct) setIconPeriod(d as 30 | 60 | 90); }} className="hidden" />
                                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${iconPeriod === d ? 'border-pink-500' : 'border-gray-300'}`}>
                                                            {iconPeriod === d && <div className="w-2 h-2 rounded-full bg-pink-500" />}
                                                        </div>
                                                        <span className={`text-[10px] md:text-xs text-center ${iconPeriod === d ? 'font-bold' : ''}`}>
                                                            {d === 0 ? '안함' : (
                                                                <span className="flex flex-col items-center leading-tight">
                                                                    <span>{d}일</span>
                                                                    <span className="text-[9px] opacity-80">+{d === 30 ? '30,000원' : d === 60 ? '55,000원' : '70,000원'}</span>
                                                                </span>
                                                            )}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-5 gap-1.5">
                                                {AD_ICONS.slice(0, 10).map(icon => (
                                                    <label
                                                        key={icon.id}
                                                        onClick={(e) => {
                                                            if (!selectedAdProduct) {
                                                                e.preventDefault();
                                                                alert('메인광고(1~7번)을 선택한 후, 신청가능합니다.');
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all cursor-pointer ${selectedIcon === icon.id ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-100' : (brand.theme === 'dark' ? 'border-gray-800 hover:border-pink-900' : 'border-gray-50 hover:border-pink-100')} ${!selectedAdProduct ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            checked={selectedIcon === icon.id}
                                                            onChange={() => {
                                                                if (selectedAdProduct) setSelectedIcon(icon.id);
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <span className="text-xl mb-1">{icon.icon}</span>
                                                        <span className={`font-black whitespace-nowrap w-full text-center leading-none ${selectedIcon === icon.id ? 'text-pink-600' : (brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-700')} ${icon.name.length >= 5 ? 'text-[8px] sm:text-[9px]' : 'text-[10px] md:text-xs'}`}>
                                                            {icon.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    <section className={`rounded-xl shadow-sm border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                        <div className={`p-2.5 px-3 flex justify-between items-center ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-[#666] text-white'}`}>
                                            <h2 className="font-black text-xs md:text-sm flex items-center gap-2">8번 - 형광펜 선택</h2>
                                        </div>
                                        <div className="p-3">
                                            <div className="grid grid-cols-4 gap-1.5 mb-3">
                                                {[0, 30, 60, 90].map(d => (
                                                    <label key={d} className={`flex flex-col items-center justify-center gap-1 cursor-pointer px-1 py-2 rounded-lg border transition-all ${highlighterPeriod === d ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                                        onClick={(e) => {
                                                            if (!selectedAdProduct) {
                                                                e.preventDefault();
                                                                alert('메인광고(1~7번)을 선택한 후, 신청가능합니다.');
                                                            }
                                                        }}
                                                    >
                                                        <input type="radio" checked={highlighterPeriod === d} onChange={() => { if (selectedAdProduct) setHighlighterPeriod(d as 30 | 60 | 90); }} className="hidden" />
                                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${highlighterPeriod === d ? 'border-pink-500' : 'border-gray-300'}`}>
                                                            {highlighterPeriod === d && <div className="w-2 h-2 rounded-full bg-pink-500" />}
                                                        </div>
                                                        <span className={`text-[10px] md:text-xs text-center ${highlighterPeriod === d ? 'font-bold' : ''}`}>
                                                            {d === 0 ? '안함' : (
                                                                <span className="flex flex-col items-center leading-tight">
                                                                    <span>{d}일</span>
                                                                    <span className="text-[9px] opacity-80">+{d === 30 ? '30,000원' : d === 60 ? '55,000원' : '70,000원'}</span>
                                                                </span>
                                                            )}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-4 gap-1.5">
                                                {AD_HIGHLIGHTERS.map(hl => (
                                                    <label
                                                        key={hl.id}
                                                        onClick={(e) => {
                                                            if (!selectedAdProduct) {
                                                                e.preventDefault();
                                                                alert('메인광고(1~7번)을 선택한 후, 신청가능합니다.');
                                                            }
                                                        }}
                                                        className={`flex items-center justify-center p-2 rounded-lg border-2 transition-all cursor-pointer ${selectedHighlighter === hl.id ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-100' : (brand.theme === 'dark' ? 'border-gray-800 hover:border-pink-900' : 'border-gray-50 hover:border-pink-100')} ${!selectedAdProduct ? 'opacity-50 grayscale-[0.5]' : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            checked={selectedHighlighter === hl.id}
                                                            onChange={() => {
                                                                if (selectedAdProduct) setSelectedHighlighter(hl.id);
                                                            }}
                                                            className="hidden"
                                                        />
                                                        <span className="text-[11px] md:text-sm font-black text-gray-800 w-[45px] text-center" style={{ backgroundColor: hl.color, padding: '2px 0px', borderRadius: '4px' }}>{hl.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Emphasis Options Section */}
                                <section className={`rounded-xl shadow-sm border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                    <div className={`p-2.5 px-3 flex justify-between items-center ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-[#666] text-white'}`}>
                                        <h2 className="font-black text-xs md:text-sm flex items-center gap-2">추가 강조 효과 (테두리/특수효과)</h2>
                                    </div>
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-xs font-bold mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>테두리 효과</label>
                                            <div className="flex gap-2">
                                                {['none', 'color', 'glow'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => setBorderOption(opt as 'none' | 'color' | 'glow')}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition capitalize ${borderOption === opt ? 'bg-purple-100 border-purple-500 text-purple-700 ring-2 ring-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-900/50' : (brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500')}`}
                                                    >
                                                        {opt === 'none' ? '없음' : opt === 'color' ? '컬러 테두리' : 'Glow 효과'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-xs font-bold mb-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>프리미엄 미리보기</label>
                                            <div className={`h-10 rounded-lg flex items-center justify-center font-bold text-xs ${borderOption === 'glow' ? 'border-2 border-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]' : borderOption === 'color' ? 'border-2 border-pink-500' : 'border border-gray-200'}`}>
                                                효과 미리보기
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="bg-[#e6007e] p-4 sm:p-5 text-white flex flex-col md:flex-row justify-between items-center rounded-2xl shadow-xl border-2 border-white/20 gap-3 md:gap-0">
                                    <div className="flex flex-col gap-0.5 text-center md:text-left">
                                        <p className="text-xs sm:text-sm font-black opacity-90 leading-tight">결제는 PC와 모바일 모두 가능합니다.</p>
                                        <p className="text-[10px] font-bold opacity-70">모든 광고 상품은 결제 및 심사 후 즉시 자동 적용되어 노출됩니다.</p>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-6 w-full md:w-auto">
                                        <span className="text-xs sm:text-base font-black opacity-80">총 신청 금액</span>
                                        <span className="text-2xl sm:text-4xl font-black bg-white/20 px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl border border-white/30 text-center w-full md:w-auto shadow-inner">{totalAmount.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`fixed bottom-0 left-0 right-0 border-t p-3 sm:p-4 z-20 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                                <div className="max-w-5xl mx-auto flex gap-2 sm:gap-3">
                                    <button onClick={handlePreview} className="flex-1 sm:flex-[2] py-3.5 sm:py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs sm:text-base">
                                        <Eye size={16} className="sm:w-[18px]" /> <span className="hidden xs:inline">미리보기</span><span className="xs:hidden">보기</span>
                                    </button>
                                    <button onClick={() => {
                                        if (isDirty && !window.confirm('작성 중인 내용이 저장되지 않았습니다. 정말 취소하시겠습니까?')) return;
                                        resetForm();
                                        setView('dashboard');
                                        window.scrollTo(0, 0);
                                    }} className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition text-xs sm:text-base">취소</button>
                                    <button onClick={handleSave} className="flex-[2] sm:flex-[3] py-3.5 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition flex items-center justify-center gap-1.5 text-xs sm:text-base">
                                        <Save size={16} className="sm:w-[18px]" /> <span className="xs:inline">저장 및 심사</span><span className="xs:hidden">저장</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Personal Member Components ---

function PersonalSidebar({ view, setView }: { view: string, setView: (v: any) => void }) {
    const brand = useBrand();
    const router = useRouter(); // Added router hook
    const [userName, setUserName] = useState('회원님');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) setUserName(storedName);
    }, []);

    const menuItems = [
        { id: 'resume-list', label: '이력서 리스트', icon: <List size={16} /> },
        { id: 'scrap-jobs', label: '채용정보 스크랩', icon: <Star size={16} /> },
        { id: 'payment-history', label: '유료결제 내역', icon: <CreditCard size={16} /> },
        { id: 'excluded-shops', label: '열람불가 업소설정', icon: <AlertTriangle size={16} /> },
        { id: 'custom-jobs', label: '맞춤구인정보', icon: <Briefcase size={16} /> },
        { id: 'my-posts', label: '내가 작성한 게시글', icon: <FileText size={16} /> },
        { id: 'block-settings', label: '회원 차단 설정', icon: <User size={16} /> },
        { id: 'post-bookmarks', label: '즐겨찾기한 게시글', icon: <Star size={16} /> },
    ];

    return (
        <aside className="col-span-1 space-y-4">
            {/* Profile Box */}
            <div className={`p-6 rounded-2xl border shadow-sm text-center flex flex-col justify-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className={`w-20 h-20 rounded-lg mx-auto mb-4 overflow-hidden border-2 flex items-center justify-center ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={40} className="opacity-50" />
                    </div>
                </div>
                <div>
                    <p className={`text-sm font-bold mb-1 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>일반 회원님</p>
                    <h2 className={`font-black text-xl tracking-tight mb-3 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{userName}</h2>
                </div>
                <div className="flex gap-1 w-full">
                    <button className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        <Camera size={12} /> 사진등록/수정
                    </button>
                    <button
                        onClick={() => setView('member-edit')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        <Settings size={12} /> 회원정보 수정
                    </button>
                </div>
            </div>

            {/* Menu - Hidden on Mobile, accessible via Hamburger */}
            <div className={`hidden md:block rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => router.push(`/my-shop?view=${item.id}`)}
                        className={`w-full text-left px-5 py-3.5 text-sm font-bold border-b last:border-0 flex items-center gap-3 transition ${brand.theme === 'dark' ? 'border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white' : 'border-gray-50 text-gray-600 hover:bg-gray-50 hover:text-gray-900'} ${view === item.id ? 'bg-pink-50 text-pink-600 dark:bg-gray-800 dark:text-pink-400' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>


        </aside>
    );
}

function PersonalDashboardHome({ setView }: { setView: (v: 'member-info' | 'member-edit' | 'resume-form' | 'dashboard' | 'form') => void }) {
    const brand = useBrand();
    const router = useRouter();
    const [userName, setUserName] = useState('회원님');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) setUserName(storedName);
    }, []);

    const handleLogout = () => {
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.clear();
            window.location.href = '/';
        }
    };

    const menuItems = [
        { label: '이력서 관리', icon: <FileText size={24} />, action: () => setView('resume-form'), color: 'text-blue-500' },
        { label: '스크랩 공고', icon: <Star size={24} />, action: () => alert('준비중입니다'), color: 'text-amber-500' },
        { label: '결제/이용권', icon: <CreditCard size={24} />, action: () => alert('준비중입니다'), color: 'text-purple-500' },
        { label: '차단 상점', icon: <AlertTriangle size={24} />, action: () => alert('준비중입니다'), color: 'text-red-500' },
        { label: '맞춤알바', icon: <Briefcase size={24} />, action: () => alert('준비중입니다'), color: 'text-emerald-500' },
        { label: '내가 쓴 글', icon: <MessageCircle size={24} />, action: () => router.push('/community?my=true'), color: 'text-pink-500' },
        { label: '회원정보', icon: <Settings size={24} />, action: () => setView('member-info'), color: 'text-gray-500' },
        // { label: '로그아웃', icon: <LogOut size={24} />, action: handleLogout, color: 'text-gray-400' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Resume Status */}
            <div className={`p-5 rounded-2xl border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <FileText size={18} className="text-gray-400" />
                    <h2 className={`text-base font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userName} 회원님의 구직활동</h2>
                </div>
                <div className="flex divide-x dark:divide-gray-800">
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="text-xs font-bold text-gray-500 mb-2">이력서 등록수</div>
                        <div className="text-3xl font-black text-red-500">0<span className="text-sm text-gray-400 ml-1">개</span></div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="text-xs font-bold text-gray-500 mb-2">공개중인 이력서</div>
                        <div className="text-3xl font-black text-red-500">0<span className="text-sm text-gray-400 ml-1">개</span></div>
                    </div>
                </div>
            </div>

            {/* Dashboard Status Summary - Original */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <span className="text-[11px] text-gray-400 font-bold">이력서 열람</span>
                    <span className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>0</span>
                </div>
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <span className="text-[11px] text-gray-400 font-bold">면접 제의</span>
                    <span className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>0</span>
                </div>
                <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <span className="text-[11px] text-gray-400 font-bold">스크랩</span>
                    <span className={`text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>0</span>
                </div>
            </div>

            {/* Resume List Placeholder (Visible if view matches) */}
            <div className="space-y-4">
                <div className={`p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center gap-3 ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}>
                    <FileText className="text-gray-300" size={48} />
                    <div>
                        <p className="text-gray-500 font-bold">등록된 이력서가 없습니다.</p>
                        <button
                            onClick={() => setView('resume-form')}
                            className="mt-4 px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95"
                        >
                            + 이력서 등록하기
                        </button>
                    </div>
                </div>
            </div>
            {/* Mobile Logout Button */}
            <div className="md:hidden">
                <button
                    onClick={handleLogout}
                    className="w-full py-4 text-gray-400 font-bold text-sm underline hover:text-red-500 transition-colors"
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
}

function PersonalMemberEdit({ setView }: { setView: (v: 'member-info' | 'member-edit' | 'resume-form' | 'dashboard' | 'form') => void }) {
    const brand = useBrand();
    const [userName, setUserName] = useState('회원님');

    // Form Data
    const [formData, setFormData] = useState({
        id: 'admin_user',
        password: '',
        passwordConfirm: '',
        realName: '김여우',
        nickname: '회원님',
        birthdate: '1998-08-13',
        gender: '여성', // Default
        email: 'user@example.com',
        phone: '010-0000-0000',
        smsConsent: true
    });

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
            setUserName(storedName);
            setFormData(prev => ({ ...prev, nickname: storedName }));
        }
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (formData.password && formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        localStorage.setItem('user_name', formData.nickname);
        alert('회원정보가 수정되었습니다.');
        setView('member-info');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className={`p-6 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <Settings size={20} className="text-gray-400" />
                    <h2 className={`text-lg font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>회원정보 수정</h2>
                </div>

                <div className="space-y-5">
                    {/* ID (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">아이디</label>
                        <div className="md:col-span-9">
                            <input type="text" value={formData.id} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">비밀번호</label>
                        <div className="md:col-span-9">
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                placeholder="변경할 비밀번호를 입력하세요"
                                className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-bold outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Password Confirm */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">비밀번호 확인</label>
                        <div className="md:col-span-9">
                            <input
                                type="password"
                                value={formData.passwordConfirm}
                                onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                                placeholder="비밀번호를 다시 입력하세요"
                                className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-bold outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Real Name (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">이름</label>
                        <div className="md:col-span-9">
                            <input type="text" value={formData.realName} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                        </div>
                    </div>

                    {/* Nickname (Editable) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">닉네임</label>
                        <div className="md:col-span-9">
                            <input
                                type="text"
                                value={formData.nickname}
                                onChange={(e) => handleChange('nickname', e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-bold outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Birthdate (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">생년월일</label>
                        <div className="md:col-span-9">
                            <input type="text" value={formData.birthdate} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                        </div>
                    </div>

                    {/* Gender (Read Only) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">성별</label>
                        <div className="md:col-span-9">
                            <input type="text" value={formData.gender} readOnly className="w-full bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                        </div>
                    </div>

                    {/* Email (Editable) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">이메일</label>
                        <div className="md:col-span-9">
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded p-2 text-sm font-bold outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Phone (Read Only + Certify) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-start">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500 mt-2.5">휴대폰</label>
                        <div className="md:col-span-9 space-y-2">
                            <div className="flex gap-2">
                                <input type="text" value={formData.phone} readOnly className="flex-1 bg-gray-100 border border-gray-200 rounded p-2 text-sm font-bold text-gray-500 outline-none" />
                                <button className="px-3 text-xs font-bold bg-gray-800 text-white rounded hover:bg-gray-900 transition flex-shrink-0">휴대폰 인증</button>
                            </div>
                            <p className="text-[11px] text-blue-500 font-bold">* 연락처 변경은 '휴대폰인증'이 필요합니다.</p>
                        </div>
                    </div>

                    {/* SMS Consent */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-2 md:gap-y-0 items-center">
                        <label className="md:col-span-3 text-xs font-bold text-gray-500">SMS 수신동의</label>
                        <div className="md:col-span-9 flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.smsConsent}
                                onChange={(e) => handleChange('smsConsent', e.target.checked)}
                                id="smsConsent"
                                className="w-4 h-4 accent-purple-500"
                            />
                            <label htmlFor="smsConsent" className="text-sm font-bold text-gray-700 cursor-pointer">동의합니다</label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
                        <button onClick={() => setView('member-info')} className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition">취소</button>
                        <button onClick={handleSave} className="px-8 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition shadow-lg">정보 수정완료</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ResumeForm({ setView }: { setView: (v: 'member-info' | 'resume-form' | 'dashboard' | 'form') => void }) {
    const brand = useBrand();
    const router = useRouter();

    // User Info State
    const [userName, setUserName] = useState('회원님');
    const [userId, setUserId] = useState('admin_user');

    // Form States
    const [selectedIndustryMain, setSelectedIndustryMain] = useState('');
    const [selectedIndustrySub, setSelectedIndustrySub] = useState('');
    const [selectedRegionMain, setSelectedRegionMain] = useState('');
    const [selectedRegionSub, setSelectedRegionSub] = useState('');
    const [payType, setPayType] = useState('급여협의'); // Default match corporate

    // Contact State
    const [contactMethod, setContactMethod] = useState('');
    const [contactValue, setContactValue] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        const storedId = localStorage.getItem('user_id');
        if (storedName) setUserName(storedName);
        if (storedId) setUserId(storedId);
    }, []);

    const handleContactMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const method = e.target.value;
        setContactMethod(method);
        if (method === 'phone') {
            setContactValue('010-0000-0000'); // Mock verified phone
        } else if (method === 'site_msg') {
            setContactValue('site_msg');
        } else {
            setContactValue(''); // Clear for ID input
        }
    };

    // PAY_TYPES is assumed to be imported or defined globally/in a parent scope.
    // const PAY_TYPES = ['급여협의', '시급', '일당', '월급', '건별']; // Removed as per instruction

    return (
        <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500`}>

            {/* Warning Banner */}
            <div
                onClick={() => router.push('/customer-center?tab=notice')}
                className="w-full bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-red-100/50 transition group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-red-500 border border-red-100">
                        <AlertTriangle size={24} fill="currentColor" strokeWidth={0} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 mb-0.5">이력서 등록 시</div>
                        <div className="text-xl font-black text-red-500 tracking-tight">구직자 주의사항!</div>
                    </div>
                </div>
                <div className="text-sm font-bold text-gray-500 flex items-center gap-1 group-hover:text-red-500 transition">
                    자세히 보기 <ChevronRight size={16} />
                </div>
            </div>

            <div className={`p-6 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className={`text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <span className="text-pink-500">{userName}</span> 회원 이력서 등록
                    </h2>
                    <div className="text-xs font-bold text-gray-400">MY PERSONAL HISTORY</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                    {/* Photo Area */}
                    <div className="md:col-span-3 flex flex-col items-center sm:items-stretch gap-2">
                        <div className="w-28 sm:w-full aspect-[3/4] rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 text-gray-300">
                            <User size={32} className="sm:w-[48px] sm:h-[48px]" />
                        </div>
                    </div>

                    {/* Basic Info Fields */}
                    <div className="md:col-span-9 space-y-4">
                        {/* ID - ReadOnly */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">아이디</label>
                            <div className="sm:col-span-9 text-sm font-bold truncate w-full">{userId}</div>
                        </div>
                        {/* Nickname - Editable */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">이름(닉네임) <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={userName}
                                    maxLength={10}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="10자 이내 입력"
                                    className={`flex-1 border rounded p-1.5 text-xs font-bold outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:border-pink-500 min-w-0`}
                                />
                            </div>
                        </div>
                        {/* Birthdate/Sex */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">성별/생년월일 <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 flex flex-wrap gap-2 items-center w-full">
                                <select className="border border-gray-300 rounded p-1.5 text-xs font-bold bg-white text-gray-700 outline-none flex-shrink-0">
                                    <option>여성</option>
                                    <option>남성</option>
                                </select>
                                <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                                    <input type="number" defaultValue="2000" className="w-[60px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">년</span>
                                    <input type="number" defaultValue="1" className="w-[45px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">월</span>
                                    <input type="number" defaultValue="1" className="w-[45px] border border-gray-300 rounded p-1.5 text-xs text-center outline-none" /> <span className="text-xs">일</span>
                                </div>
                            </div>
                        </div>
                        {/* Contact Method - Dynamic Input */}
                        <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-1 sm:gap-0">
                            <label className="sm:col-span-3 text-xs font-bold text-gray-500">연락방법 <span className="text-red-500">*</span></label>
                            <div className="sm:col-span-9 space-y-2 w-full">
                                <select
                                    value={contactMethod}
                                    onChange={handleContactMethodChange}
                                    className="w-full border border-gray-300 rounded p-1.5 text-xs font-bold bg-white text-gray-700 outline-none"
                                >
                                    <option value="">연락방법 선택</option>
                                    <option value="phone">휴대폰 (안심번호)</option>
                                    <option value="kakao">카카오톡</option>
                                    <option value="line">라인</option>
                                    <option value="telegram">텔레그램</option>
                                    <option value="site_msg">사이트 메세지</option>
                                </select>

                                {contactMethod === 'phone' && (
                                    <>
                                        <input type="text" value={contactValue} readOnly className="w-full bg-gray-100 border border-gray-300 rounded p-1.5 text-[11px] text-gray-500 font-bold outline-none" />
                                        <p className="text-[10px] text-blue-500 leading-tight">* 안심번호를 선택하면 입력하신 전화번호는 노출되지 않습니다.</p>
                                    </>
                                )}

                                {['kakao', 'line', 'telegram'].includes(contactMethod) && (
                                    <input
                                        type="text"
                                        value={contactValue}
                                        onChange={(e) => setContactValue(e.target.value)}
                                        placeholder={`${contactMethod === 'kakao' ? '카카오톡' : contactMethod === 'line' ? '라인' : '텔레그램'} ID를 입력해주세요`}
                                        className={`w-full border rounded p-1.5 text-[11px] font-bold outline-none focus:border-pink-500 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    />
                                )}

                                {contactMethod === 'site_msg' && (
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-[10px] text-gray-500 text-center font-bold">
                                        구직자에게 사이트 내 쪽지로 연락을 받습니다. (연락처 비공개)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Divider */}
                <div className="border-t border-dashed border-gray-200 my-6"></div>

                {/* Resume Content */}
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-red-400 rounded-full"></span> 이력서 제목 <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="제목을 입력하세요" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-pink-500" />
                    </div>
                    {/* Pay - Corporate Mapping */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-blue-400 rounded-full"></span> 희망 급여</label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <select
                                value={payType}
                                onChange={(e) => setPayType(e.target.value)}
                                className="border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white text-gray-700 outline-none flex-shrink-0"
                            >
                                {/* Assuming PAY_TYPES is available in this scope */}
                                {PAY_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 pr-8 text-sm font-bold outline-none focus:border-pink-500"
                                    placeholder="금액 입력"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">원</span>
                            </div>
                        </div>
                    </div>
                    {/* Industry */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-purple-400 rounded-full"></span> 희망 분야 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <select
                                value={selectedIndustryMain}
                                onChange={(e) => {
                                    setSelectedIndustryMain(e.target.value);
                                    setSelectedIndustrySub('');
                                }}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                            >
                                <option value="">1차 업종 선택</option>
                                {Object.keys(INDUSTRY_DATA).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select
                                value={selectedIndustrySub}
                                onChange={(e) => setSelectedIndustrySub(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                                disabled={!selectedIndustryMain}
                            >
                                <option value="">2차 업종 선택</option>
                                {selectedIndustryMain && INDUSTRY_DATA[selectedIndustryMain]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Region */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-green-400 rounded-full"></span> 업무 가능 지역 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <select
                                value={selectedRegionMain}
                                onChange={(e) => {
                                    setSelectedRegionMain(e.target.value);
                                    setSelectedRegionSub('');
                                }}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                            >
                                <option value="">지역 선택</option>
                                {Object.keys(REGION_DATA).map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                            <select
                                value={selectedRegionSub}
                                onChange={(e) => setSelectedRegionSub(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-xs font-bold bg-white text-gray-700 outline-none"
                                disabled={!selectedRegionMain}
                            >
                                <option value="">세부 지역 선택</option>
                                {selectedRegionMain && REGION_DATA[selectedRegionMain]?.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Intro */}
                    <div>
                        <label className="block text-xs font-black mb-2 flex items-center gap-1"><span className="w-1.5 h-3 bg-orange-400 rounded-full"></span> 자기소개 <span className="text-red-500">*</span></label>
                        <textarea className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-pink-500 resize-none" placeholder="내용을 입력하세요"></textarea>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-center gap-3">
                    <button onClick={() => setView('member-info')} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition">취소</button>
                    <button onClick={() => { alert('이력서가 등록되었습니다.'); setView('member-info'); }} className="px-8 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-900 transition shadow-lg">이력서 등록완료</button>
                </div>
            </div>
        </div>
    );
}
// --- Utility Components ---

function ComingSoonView({ title }: { title: string }) {
    const brand = useBrand();
    return (
        <div className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center gap-4 min-h-[400px] ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Settings size={32} />
            </div>
            <div>
                <h2 className={`text-xl font-black mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                <p className="text-gray-500 font-bold">서비스 준비 중입니다.</p>
            </div>
        </div>
    );
}
