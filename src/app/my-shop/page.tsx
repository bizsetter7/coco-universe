'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Home, Store, MapPin, Phone, MessageCircle, Camera, Check,
    Briefcase, Clock, DollarSign, Save, AlertTriangle, Search, X,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette,
    FileText, User, CreditCard, LogOut, Settings, Bell,
    LayoutDashboard, List, PlusSquare, ChevronDown, HelpCircle, Laptop,
    RefreshCw, Calendar, Eye, Highlighter, Smile, Menu, MousePointerClick,
    Zap, Star, Crown
} from 'lucide-react';
import { usePreventLeave } from '@/hooks/usePreventLeave';
import { useBrand } from '@/components/BrandProvider';

import { JOB_CATEGORY_MAP as INDUSTRY_DATA } from '@/constants/jobs';

const REGION_DATA: Record<string, string[]> = {
    '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '경기': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    '인천': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
    '대구': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '광주': ['광산구', '남구', '동구', '북구', '서구'],
    '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
    '울산': ['남구', '동구', '북구', '울주군', '중구'],
    '세종': ['세종시'],
    '강원': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    '충북': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
    '충남': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
    '전북': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
    '전남': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '경북': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
    '경남': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
    '제주': ['서귀포시', '제주시']
};

const PAY_TYPES = ['종류선택', '시급(TC)', '일급', '주급', '월급', '건별 (협의)'];

const CONVENIENCE_ITEMS = [
    '출퇴근지원', '순번확실', '원룸제공', '만근비지원', '출퇴근자유',
    '식사제공', '팁별도', '인센티브', '홀복지원', '갯수보장',
    '지명우대', '초이스없음', '해외여행지원', '뒷방없음', '따당가능',
    '푸쉬가능', '밀방없음', '칼퇴보장', '텃세없음', '지명비있음'
];

const KEYWORDS = [
    '선불가능', '성형지원', '숙식제공', '경력우대', '당일지급',
    '초보가능', '파트타임', '주말알바', '당일알바', '주간알바',
    '투잡알바', '평일알바', '야간알바', '단기알바', '고수익'
];

const AGES = Array.from({ length: 41 }, (_, i) => 20 + i);

const TEXT_COLORS = [
    { name: '검정', value: '#000000' },
    { name: '흰색', value: '#FFFFFF' },
    { name: '빨강', value: '#FF0000' },
    { name: '파랑', value: '#0000FF' },
    { name: '초록', value: '#008000' },
    { name: '보라', value: '#800080' },
    { name: '분홍', value: '#FF00FF' },
    { name: '주황', value: '#FFA500' },
    { name: '회색', value: '#808080' },
];

const BG_COLORS = [
    { name: '없음', value: 'transparent' },
    { name: '노랑', value: '#FFFF00' },
    { name: '연두', value: '#90EE90' },
    { name: '하늘', value: '#ADD8E6' },
    { name: '분홍', value: '#FFC0CB' },
];

// Merged Fonts: Old (Korean Generic) + New (Web Generic)
const FONTS = [
    { name: '기본서체', value: 'sans-serif' },
    { name: '돋움', value: 'Dotum' },
    { name: '굴림', value: 'Gulim' },
    { name: '궁서', value: 'Gungsuh' },
    { name: '바탕', value: 'Batang' },
    { name: '명조체', value: 'serif' },
    { name: '필기체', value: 'cursive' },
];

const FONT_SIZES = [
    { name: '크기', value: '' },
    { name: '1', value: '1' },
    { name: '2', value: '2' },
    { name: '3', value: '3' },
    { name: '4', value: '4' },
    { name: '5', value: '5' },
    { name: '6', value: '6' },
    { name: '7', value: '7' },
];

const EMOJIS = ['❤️', '⭐', '✨', '🔥', '💰', '👍', '✔️', '👑', '💎', '📢', '🎵', '👀', '🎁', '🚀', '✅', '🎶', '🎀'];

// shared Pricing Data
const AD_TIERS = [
    {
        id: 'grand',
        name: 'Grand (Tier 1)',
        price: '350,000원 / 30일',
        benefits: ['메인 최상단 0순위 고정', '검색 리스트 최상단 노출', '블링블링 Glow/굵은폰트', '인재열람권 무제한 제공']
    },
    {
        id: 'premium',
        name: 'Premium (Tier 2)',
        price: '200,000원 / 30일',
        benefits: ['메인 상단 전략적 노출', '실버/연금색 강조 보더', '제목 강조/아이콘 효과 기본', '실시간 채팅 지원']
    },
];

const DETAILED_PRICING = [
    { id: 'p1', name: '그랜드 (Grand)', desc: '메인 독점! 최상단 0순위에 배치됩니다. (전 지역 검색 결과 압도적 선점 / Glow 효과)', d30: 350000, d60: 630000, d90: 840000, isMain: true },
    { id: 'p2', name: '프리미엄 (Premium)', desc: '메인 중단의 가장 눈에 띄는 위치에 배치됩니다. (실버 보더 적용 / 자동점프 일 30회)', d30: 200000, d60: 360000, d90: 480000, isMain: true },
    { id: 'p3', name: '디럭스 (Deluxe)', desc: '메인페이지 프리미엄 하단의 위치에 배치됩니다. (블루 보더 적용 / 자동점프 일 30회)', d30: 180000, d60: 324000, d90: 432000, isMain: true },
    { id: 'p4', name: '스페셜 (Special)', desc: '리스트 중간 상단에 배치됩니다. (핑크 보더 적용 / 자동점프 일 20회)', d30: 150000, d60: 270000, d90: 360000, isMain: true },
    { id: 'p5', name: '급구/추천 (Urgent/Rec)', desc: '강렬한 빨간 제목과 추천 배지로 주목도를 높입니다. (목록 강조 노출 / 자동점프 일 20회)', d30: 120000, d60: 216000, d90: 288000, isMain: true },
    { id: 'p6', name: '네이티브 (Native)', desc: '리스트 하단에 배치됩니다. (지역 1개 노출/네이티브 스타일/자동점프 일 10회 설정 제공)', d30: 100000, d60: 180000, d90: 240000, isMain: true },
    { id: 'p7', name: '베이직/줄광고 (Basic)', desc: '일반 리스트 노출 (실속형 구인 상품 / 자동점프 일 5회 설정 제공)', d30: 60000, d60: 100000, d90: 140000, isMain: true },
    { id: 'p8', name: '강조옵션 (Icon/Highlighter)', desc: '아이콘 및 형광펜 효과로 시선을 사로잡으세요. (목록 옵션 노출)', d30: 30000, d60: 55000, d90: 70000, isMain: true },
    { id: 'bold', name: '굵은글씨 적용', desc: '채용정보의 제목을 굵게 표시되어 어디든 눈에 띌 수 있도록 표시', d30: 30000, d60: 55000, d90: 70000, isMain: false },
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

export default function MyShopPage() {
    const router = useRouter();
    const brand = useBrand();
    const [view, setView] = useState<'dashboard' | 'form'>('dashboard');
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // --- Form States ---
    const [shopName, setShopName] = useState('코코 라운지');
    const [isVerified, setIsVerified] = useState(true);

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
    const [content, setContent] = useState('');
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

    // --- Effects & Logic ---

    // Manage body class for layout focus (hiding scroll/dimming)
    useEffect(() => {
        const isAnyModalOpen = showWarningModal || showDesignModal || showPreviewModal;
        const isFormView = view === 'form';

        if (isAnyModalOpen) {
            document.body.classList.add('modal-active');
        } else {
            document.body.classList.remove('modal-active');
        }

        if (isFormView) {
            document.body.classList.add('form-mode');
        } else {
            document.body.classList.remove('form-mode');
        }

        return () => {
            document.body.classList.remove('modal-active');
            document.body.classList.remove('form-mode');
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
    const toggleConvenience = (item: string) => {
        if (selectedConvenience.includes(item)) {
            setSelectedConvenience(selectedConvenience.filter(t => t !== item));
        } else {
            if (selectedConvenience.length + selectedKeywords.length >= 10) return alert('키워드는 총 10개까지만 선택 가능합니다.');
            setSelectedConvenience([...selectedConvenience, item]);
        }
    };

    const toggleKeyword = (item: string) => {
        if (selectedKeywords.includes(item)) {
            setSelectedKeywords(selectedKeywords.filter(t => t !== item));
        } else {
            if (selectedConvenience.length + selectedKeywords.length >= 10) return alert('키워드는 총 10개까지만 선택 가능합니다.');
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

    const handleAdClick = () => {
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
        if (!document.queryCommandSupported('bold')) return;

        try {
            const selection = window.getSelection();
            let fontName = '';
            let fontSize = '';
            let foreColor = '#000000';
            let hiliteColor = 'transparent';
            let boldState = false;
            let italicState = false;
            let underlineState = false;

            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                let node = range.startContainer.nodeType === 1 ? (range.startContainer as HTMLElement) : range.startContainer.parentElement;

                if (node && editorRef.current?.contains(node)) {
                    const style = window.getComputedStyle(node);

                    // 1. Bold Detection (Numeric weight is more reliable)
                    const weight = style.fontWeight;
                    boldState = weight === 'bold' || weight === 'bolder' || parseInt(weight) >= 600;

                    // 2. Italic/Underline
                    italicState = style.fontStyle === 'italic';
                    underlineState = style.textDecoration.includes('underline');

                    // 3. Font Family (Clean first font)
                    fontName = style.fontFamily.replace(/['"]/g, '').split(',')[0].trim();

                    // 4. Fore Color
                    foreColor = style.color;

                    // 5. Hilite Color (Walk up ONLY until editor boundary)
                    let bgNode: HTMLElement | null = node;
                    while (bgNode && editorRef.current?.contains(bgNode) && bgNode !== editorRef.current) {
                        const bgStyle = window.getComputedStyle(bgNode);
                        const bg = bgStyle.backgroundColor;
                        // Avoid transparent/inherited backgrounds
                        if (bg && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)') && !bg.includes('rgba(255, 255, 255, 0)')) {
                            hiliteColor = bg;
                            break;
                        }
                        bgNode = bgNode.parentElement;
                    }
                }
            } else {
                // No selection -> Use document commands as fallback or defaults
                boldState = document.queryCommandState('bold');
                italicState = document.queryCommandState('italic');
                underlineState = document.queryCommandState('underline');
            }

            // Apply synced states to UI
            setIsBold(boldState);
            setIsItalic(italicState);
            setIsUnderline(underlineState);

            // Font Mapping
            if (!fontName) fontName = document.queryCommandValue('fontName').replace(/['"]/g, '');
            if (fontName) {
                const normalized = fontName.toLowerCase();
                const exists = FONTS.find(f => f.value.toLowerCase() === normalized || f.name.toLowerCase() === normalized);
                setCurrentFont(exists ? exists.value : fontName);
            }

            // FontSize Mapping (Keep 1-7 command value for consistency)
            const fSizeCmd = document.queryCommandValue('fontSize');
            setCurrentFontSize(fSizeCmd || '');

            // Color Normalization
            const finalFore = rgbToHex(foreColor).toUpperCase();
            const foreExists = TEXT_COLORS.find(c => c.value.toUpperCase() === finalFore);
            setCurrentForeColor(foreExists ? foreExists.value : finalFore);

            if (hiliteColor && hiliteColor !== 'transparent') {
                const finalHilite = rgbToHex(hiliteColor).toUpperCase();
                const hiliteExists = BG_COLORS.find(c => c.value.toUpperCase() === finalHilite);
                setCurrentHiliteColor(hiliteExists ? hiliteExists.value : finalHilite);
            } else {
                setCurrentHiliteColor('transparent');
            }

        } catch (e) {
            console.log("Editor sync error:", e);
        }
    };

    // --- Editor Commands ---
    const execCmd = (command: string, value: string | undefined = undefined) => {
        if (editorRef.current) {
            editorRef.current.focus(); // Make sure editor is ready
        }
        restoreSelection(); // Put the cursor/selection back where it was

        document.execCommand(command, false, value);

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

    // Capture selection & Sync Toolbar
    const handleEditorInteract = () => {
        saveSelection();
        updateToolbarState();
    }

    // --- Components ---

    const WarningModal = () => (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
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
    );

    const DesignRequestModal = () => (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
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
    );

    const PreviewModal = () => (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
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
                        {selectedConvenience.map(c => <span key={c}>#{c}</span>)}
                        {selectedKeywords.map(k => <span key={k}>#{k}</span>)}
                    </div>
                </div>

                <div className={`p-4 border-t rounded-b-2xl text-right ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <button onClick={() => setShowPreviewModal(false)} className={`px-6 py-3 font-bold rounded-xl transition ${brand.theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>닫기</button>
                </div>
            </div>
        </div>
    );

    const MobileMenu = () => (
        <div className="fixed inset-0 z-50 flex justify-end">
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
                    <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><List size={18} /> 진행중인 공고</div>
                    <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><LogOut size={18} /> 마감된 공고</div>
                    <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><CreditCard size={18} /> 유료 결제 내역</div>
                    <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><User size={18} /> 회원 정보 수정</div>
                </nav>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} pb-24`}>
            {showWarningModal && <WarningModal />}
            {showDesignModal && <DesignRequestModal />}
            {showPreviewModal && <PreviewModal />}
            {showMobileMenu && <MobileMenu />}

            {/* Header */}
            <header className={`sticky top-0 z-50 border-b ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="max-w-[1020px] mx-auto px-3 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => {
                            if (isDirty && !window.confirm('작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?')) return;
                            router.back();
                        }} className={`p-2 rounded-full transition-colors ${brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-stone-50 text-gray-800'}`}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                            MY SHOP <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">Admin</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 hidden md:block">
                            <Home size={24} />
                        </button>
                        <button onClick={() => setShowMobileMenu(true)} className="text-gray-600 md:hidden">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {view === 'dashboard' ? (
                <div className="max-w-6xl mx-auto p-3 md:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar (PC Only) */}
                    <aside className="hidden md:block col-span-1 space-y-2">
                        <div className={`p-6 rounded-2xl border shadow-sm text-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <div className={`w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-pink-100'}`}>
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={32} /></div>
                            </div>
                            <div>
                                <h2 className={`font-black text-xl tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shopName}</h2>
                                <p className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>프리미엄 인증 업소</p>
                            </div>
                            <button className={`w-full py-2 rounded-lg text-xs font-bold transition ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                사진 등록/수정
                            </button>
                        </div>
                        <nav className={`rounded-2xl border shadow-sm overflow-hidden text-sm font-bold ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-100 text-gray-600'}`}>
                            <div className="p-4 hover:bg-pink-50 hover:text-pink-500 border-l-4 border-transparent hover:border-pink-500 transition cursor-pointer flex items-center gap-3"><List size={18} /> 진행중인 공고</div>
                            <div className="p-4 hover:bg-pink-50 hover:text-pink-500 border-l-4 border-transparent hover:border-pink-500 transition cursor-pointer flex items-center gap-3"><LogOut size={18} /> 마감된 공고</div>
                            <div className="p-4 hover:bg-pink-50 hover:text-pink-500 border-l-4 border-transparent hover:border-pink-500 transition cursor-pointer flex items-center gap-3"><CreditCard size={18} /> 유료 결제 내역</div>
                            <div className="p-4 hover:bg-pink-50 hover:text-pink-500 border-l-4 border-transparent hover:border-pink-500 transition cursor-pointer flex items-center gap-3"><User size={18} /> 회원 정보 수정</div>
                        </nav>
                    </aside>

                    {/* Main Content */}
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
                                        <button className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-sm transition ${brand.theme === 'dark' ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                            정보수정
                                        </button>
                                        <button onClick={() => setView('form')} className="flex-1 md:flex-none px-6 py-2.5 bg-pink-600 text-white rounded-xl font-black text-sm shadow-lg shadow-pink-200 hover:bg-pink-700 transition">
                                            공고등록
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
                            onClick={handleAdClick}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-black rounded-xl shadow-lg shadow-blue-200 hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                            <PlusSquare size={24} />
                            채용공고 등록하기
                        </button>

                        <div className={`rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <div className={`p-4 border-b flex justify-between items-center ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                <h3 className={`font-bold ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>진행중인 채용 정보</h3>
                                <span className="text-xs text-gray-400">최근 12개월 내역만 표시됩니다.</span>
                            </div>

                            <div className={`p-4 border-b transition ${brand.theme === 'dark' ? 'border-gray-800 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex gap-2 text-xs items-center">
                                            <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-black">진행중</span>
                                            <span className="text-gray-400">마감일: 2026-02-25</span>
                                        </div>
                                        <h4 className={`font-bold line-clamp-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🔥 [강남 쩜오] 갯수보장 / 팁별도 / 당일지급 확실합니다!</h4>
                                        <div className={`text-xs ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {shopName} | 서울 강남구 | 룸싸롱 | 아가씨
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0 items-center">
                                        <button className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 shadow-sm">
                                            <RefreshCw size={12} /> 점프
                                        </button>
                                        <button className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 shadow-sm">
                                            <Calendar size={12} /> 연장
                                        </button>
                                        <span className={`w-px h-3 mx-1 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></span>
                                        <button onClick={handleAdClick} className={`px-3 py-2 border text-xs font-bold rounded transition ${brand.theme === 'dark' ? 'border-blue-500/50 text-blue-400 hover:bg-blue-900/20' : 'border-blue-500 text-blue-600 hover:bg-blue-50'}`}>수정</button>
                                        <button className={`px-3 py-2 border text-xs font-bold rounded transition ${brand.theme === 'dark' ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>마감</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto p-4 md:py-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-3">
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
                        </div>

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
                                        <select value={payType} onChange={(e) => setPayType(e.target.value)} className={`w-full border rounded-lg p-2 text-base outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                                            {PAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-black mb-1.5 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-black'}`}><span className="text-red-500 mr-1">*</span>급여액</label>
                                        <input type="text" placeholder="0" value={payAmount} onChange={handlePayAmountChange} className={`w-full border rounded-lg p-2 text-base font-black text-right outline-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-sm font-black text-gray-500 uppercase tracking-tighter">편의사항 및 키워드</label>
                                        <span className="text-xs text-pink-500 font-bold">{selectedConvenience.length + selectedKeywords.length}/10</span>
                                    </div>
                                    <div className={`flex flex-wrap gap-1.5 p-2 rounded-lg border max-h-[100px] overflow-y-auto ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                        {CONVENIENCE_ITEMS.map(item => (
                                            <button key={item} onClick={() => toggleConvenience(item)} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${selectedConvenience.includes(item) ? 'bg-blue-500 text-white border-blue-500' : (brand.theme === 'dark' ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-white text-gray-400 border-gray-200')}`}>
                                                {item}
                                            </button>
                                        ))}
                                        {KEYWORDS.map(item => (
                                            <button key={item} onClick={() => toggleKeyword(item)} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${selectedKeywords.includes(item) ? 'bg-pink-500 text-white border-pink-500' : (brand.theme === 'dark' ? 'bg-gray-800 text-gray-500 border-gray-700' : 'bg-white text-gray-400 border-gray-200')}`}>
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 에디터와 상세 정보 미리보기는 전체 너비로 배치하여 수직 공간 효율 극대화 */}
                    <div className="space-y-4">
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
                                        {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                    </select>
                                    <select onChange={(e) => execCmd('fontSize', e.target.value)} value={currentFontSize} className={`h-6 text-[10px] border rounded px-1 outline-none w-12 ${brand.theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
                                        {FONT_SIZES.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                    </select>
                                    <div className={`w-px h-3 mx-0.5 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                    <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className={`p-1 rounded ${isBold ? 'bg-gray-300' : (brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100')}`}><Bold size={14} /></button>
                                    <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className={`p-1 rounded ${isItalic ? 'bg-gray-300' : (brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100')}`}><Italic size={14} /></button>
                                    <button onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} className={`p-1 rounded ${isUnderline ? 'bg-gray-300' : (brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100')}`}><Underline size={14} /></button>
                                    <div className={`w-px h-3 mx-0.5 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                    <select value={currentForeColor} onChange={(e) => execCmd('foreColor', e.target.value)} className={`h-6 text-[10px] outline-none w-16 border rounded ${brand.theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
                                        <option value="black">글자색</option>
                                        {TEXT_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                    </select>
                                    <select onChange={(e) => execCmd('hiliteColor', e.target.value)} className={`h-6 text-[10px] outline-none w-16 border rounded ${brand.theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
                                        <option value="transparent">배경색</option>
                                        {BG_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                    </select>
                                    <div className={`w-px h-3 mx-0.5 ${brand.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                                    <button onClick={() => execCmd('justifyLeft')} className={`p-1 rounded ${brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}><AlignLeft size={14} /></button>
                                    <button onClick={() => execCmd('justifyCenter')} className={`p-1 rounded ${brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}><AlignCenter size={14} /></button>
                                    <button onClick={() => execCmd('justifyRight')} className={`p-1 rounded ${brand.theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}><AlignRight size={14} /></button>
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
                                {DETAILED_PRICING.filter(p => p.isMain).map((product: any, idx) => (
                                    <div key={product.id} className={`flex flex-col sm:flex-row sm:items-center p-3 gap-3 transition-colors ${brand.theme === 'dark' ? 'hover:bg-pink-900/10' : 'hover:bg-pink-50/10'} ${product.disabled ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
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
                                        <div className="grid grid-cols-3 sm:flex gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
                                            {[30, 60, 90].map((days) => (
                                                <label key={days} className={`flex flex-col items-center justify-center flex-1 sm:w-[85px] h-[44px] sm:h-[48px] rounded-xl cursor-pointer border-2 transition-all relative overflow-hidden ${selectedAdProduct === product.id && selectedAdPeriod === days ? 'bg-pink-50 border-pink-500 text-pink-600 shadow-md ring-2 ring-pink-100' : (brand.theme === 'dark' ? 'border-gray-800 bg-gray-900 text-gray-500 hover:border-pink-900' : 'border-gray-100 bg-white text-gray-400 hover:border-pink-200')}`}>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        checked={selectedAdProduct === product.id && selectedAdPeriod === days}
                                                        onChange={() => {
                                                            setSelectedAdProduct(product.id);
                                                            setSelectedAdPeriod(days as any);
                                                        }}
                                                    />
                                                    {selectedAdProduct === product.id && selectedAdPeriod === days && (
                                                        <div className="absolute top-0 right-0 bg-pink-500 text-white p-0.5 rounded-bl-lg">
                                                            <Check size={9} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-none mb-0.5 sm:mb-1">{days}일</span>
                                                    <span className={`text-[11px] sm:text-xs font-black tracking-tighter ${selectedAdProduct === product.id && selectedAdPeriod === days ? 'text-pink-600' : (brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600')}`}>{(product as any)[`d${days}`].toLocaleString()}원</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <section className={`rounded-xl shadow-sm border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <div className={`p-2.5 px-3 ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-[#666] text-white'}`}>
                                    <h2 className="font-black text-xs md:text-sm flex items-center gap-2">7번 - 아이콘 선택</h2>
                                </div>
                                <div className="p-3">
                                    <div className="flex items-center gap-3 text-xs md:text-sm font-black border-b border-gray-50 pb-2.5 mb-3 overflow-x-auto whitespace-nowrap">
                                        {[0, 30, 60, 90].map(d => (
                                            <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                                                <input type="radio" checked={iconPeriod === d} onChange={() => setIconPeriod(d as any)} className="w-4 h-4 text-pink-500" />
                                                {d === 0 ? '안함' : `${d}일`}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {AD_ICONS.slice(0, 10).map(icon => (
                                            <label key={icon.id} className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all cursor-pointer ${selectedIcon === icon.id ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-100' : (brand.theme === 'dark' ? 'border-gray-800 hover:border-pink-900' : 'border-gray-50 hover:border-pink-100')}`}>
                                                <input type="radio" checked={selectedIcon === icon.id} onChange={() => setSelectedIcon(icon.id)} className="hidden" />
                                                <span className="text-xl mb-1">{icon.icon}</span>
                                                <span className={`text-[10px] md:text-xs font-black truncate w-full text-center leading-none ${selectedIcon === icon.id ? 'text-pink-600' : (brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-700')}`}>{icon.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className={`rounded-xl shadow-sm border overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <div className={`p-2.5 px-3 ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-[#666] text-white'}`}>
                                    <h2 className="font-black text-xs md:text-sm flex items-center gap-2">7번 - 형광펜 선택</h2>
                                </div>
                                <div className="p-3">
                                    <div className="flex items-center gap-3 text-xs md:text-sm font-black border-b border-gray-50 pb-2.5 mb-3 overflow-x-auto whitespace-nowrap">
                                        {[0, 30, 60, 90].map(d => (
                                            <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                                                <input type="radio" checked={highlighterPeriod === d} onChange={() => setHighlighterPeriod(d as any)} className="w-4 h-4 text-pink-500" />
                                                {d === 0 ? '안함' : `${d}일`}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {AD_HIGHLIGHTERS.map(hl => (
                                            <label key={hl.id} className={`flex items-center justify-center p-2 rounded-lg border-2 transition-all cursor-pointer ${selectedHighlighter === hl.id ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-100' : (brand.theme === 'dark' ? 'border-gray-800 hover:border-pink-900' : 'border-gray-50 hover:border-pink-100')}`}>
                                                <input type="radio" checked={selectedHighlighter === hl.id} onChange={() => setSelectedHighlighter(hl.id)} className="hidden" />
                                                <span className="text-[11px] md:text-sm font-black text-gray-800 w-[45px] text-center" style={{ backgroundColor: hl.color, padding: '2px 0px', borderRadius: '4px' }}>{hl.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>

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
                                setView('dashboard');
                                window.scrollTo(0, 0);
                            }} className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition text-xs sm:text-base">취소</button>
                            <button onClick={handleSave} className="flex-[2] sm:flex-[3] py-3.5 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition flex items-center justify-center gap-1.5 text-xs sm:text-base">
                                <Save size={16} className="sm:w-[18px]" /> <span className="xs:inline">저장 및 심사</span><span className="xs:hidden">저장</span>
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div>
    );
}
