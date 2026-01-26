'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Home, Store, MapPin, Phone, MessageCircle, Camera, Check,
    Briefcase, Clock, DollarSign, Save, AlertTriangle, Search, X,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette,
    FileText, User, CreditCard, LogOut, Settings, Bell,
    LayoutDashboard, List, PlusSquare, ChevronDown, HelpCircle, Laptop,
    RefreshCw, Calendar, Eye, Highlighter, Smile, Menu, MousePointerClick
} from 'lucide-react';

// --- Data Constants ---
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

const INDUSTRY_DATA: Record<string, string[]> = {
    '룸알바': ['퍼블릭', '가라오케', '클럽', '룸싸롱'],
    '노래주점': ['아가씨', '미씨', 'TC'],
    '텐프로/쩜오': ['텐프로', '쩜오', '텐카페'],
    '요정': ['요정'],
    '바(Bar)': ['정바', '룸바', '토킹바', '섹시바', '라이브바'],
    '엔터': ['인터넷BJ'],
    '다방': ['다방'],
    '카페': ['카페'],
    '마사지': ['휴게마사지', '아로마마사지', '피부마사지', '에스테릭', '스포츠마사지', '기타마사지'],
    '기타': ['기타업종', '직업소개소', '회원제업소', '해외']
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

export default function MyShopPage() {
    const router = useRouter();
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

    // --- Effects ---
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
        window.scrollTo(0, 0); // 즉시 상단 이동
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
            window.scrollTo(0, 0); // 메인으로 돌아올 때도 즉시 상단 이동
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900">게시글 작성 전 필독!</h3>
                <div className="text-left text-sm text-gray-800 bg-gray-50 p-4 rounded-xl space-y-2">
                    <p className="flex gap-2">
                        <span className="text-red-500 font-bold">1.</span>
                        <span>월 수정한도는 <strong className="text-gray-900">30회</strong>입니다.</span>
                    </p>
                    <p className="flex gap-2">
                        <span className="text-red-500 font-bold">2.</span>
                        <span>금칙어 사용 시 <strong className="text-gray-900">삭제/차단</strong>될 수 있습니다.</span>
                    </p>
                    <p className="flex gap-2">
                        <span className="text-red-500 font-bold">3.</span>
                        <span>최적의 SEO를 위해 <strong className="text-gray-900">키워드는 10개</strong>로 제한됩니다.</span>
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={() => setShowWarningModal(false)} className="py-3 rounded-xl border font-bold text-gray-700 hover:bg-gray-100">취소</button>
                    <button onClick={proceedToForm} className="py-3 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600 shadow-lg">확인 후 작성</button>
                </div>
            </div>
        </div>
    );

    const DesignRequestModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-2">
                    <Laptop size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900">상세페이지 디자인 의뢰</h3>
                <p className="text-gray-800 text-sm">
                    전문 디자이너가 사장님만의 <br />
                    <strong>고퀄리티 상세페이지</strong>를 제작해드립니다. (유료)
                </p>
                <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2 text-sm text-gray-700">
                    <p>• 1:1 맞춤 디자인</p>
                    <p>• 움직이는 GIF 포함 가능</p>
                    <p>• 제작 기간: 1~2일 소요</p>
                </div>
                <div className="grid grid-cols-1 gap-3 pt-2">
                    <button onClick={() => alert('고객센터로 문의 접수되었습니다.')} className="py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-lg">
                        1:1 문의 / 고객센터 연결
                    </button>
                    <button onClick={() => setShowDesignModal(false)} className="py-3 rounded-xl text-gray-400 font-bold hover:text-gray-600">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );

    const PreviewModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900"><Eye size={20} className="text-pink-500" /> 채용공고 미리보기</h3>
                    <button onClick={() => setShowPreviewModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600"><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <span className="inline-block px-2 py-1 bg-pink-100 text-pink-600 text-xs font-bold rounded mb-2">{industrySub}</span>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">{title}</h2>
                        <p className="text-sm text-gray-600 mt-1">{shopName} | {regionCity} {regionGu}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm text-gray-800">
                        <div><span className="text-gray-500 block text-xs">급여</span><strong className="text-blue-600 text-lg">{payType} {payAmount}</strong></div>
                        <div><span className="text-gray-500 block text-xs">나이</span><strong className="text-gray-900">{ageMin}세 ~ {ageMax}세</strong></div>
                        <div><span className="text-gray-500 block text-xs">담당자 / 연락처</span><strong className="text-gray-900">{managerName} / {managerPhone}</strong></div>
                        <div>
                            <span className="text-gray-500 block text-xs">메신저</span>
                            <div className="flex flex-col gap-1 mt-1">
                                {messengers.kakao && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-yellow-100 text-[10px] text-yellow-800 rounded font-bold">카카오</span><span className="text-sm font-bold text-gray-900">{messengers.kakao}</span></div>}
                                {messengers.line && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-green-100 text-[10px] text-green-800 rounded font-bold">라인</span><span className="text-sm font-bold text-gray-900">{messengers.line}</span></div>}
                                {messengers.telegram && <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 bg-blue-100 text-[10px] text-blue-800 rounded font-bold">텔레그램</span><span className="text-sm font-bold text-gray-900">{messengers.telegram}</span></div>}
                                {!messengers.kakao && !messengers.line && !messengers.telegram && <span className="text-gray-400 text-xs">-</span>}
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

                <div className="p-4 bg-gray-50 border-t text-left">
                    <p className="text-[10px] text-gray-400 font-bold mb-2">KEYWORD & INFO</p>
                    <div className="flex flex-wrap gap-1 text-[10px] text-gray-400">
                        {selectedConvenience.map(c => <span key={c}>#{c}</span>)}
                        {selectedKeywords.map(k => <span key={k}>#{k}</span>)}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-2xl text-right">
                    <button onClick={() => setShowPreviewModal(false)} className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900">닫기</button>
                </div>
            </div>
        </div>
    );

    const MobileMenu = () => (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
            <div className="relative w-72 bg-white h-full shadow-2xl p-6">
                <button onClick={() => setShowMobileMenu(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="mt-8 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden border-2 border-pink-100 flex items-center justify-center text-gray-400">
                        <Store size={32} />
                    </div>
                    <h2 className="font-black text-gray-900 text-lg">{shopName}</h2>
                    <p className="text-sm text-gray-500 mb-6">프리미엄 회원</p>
                    <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700">
                        사진 등록/수정
                    </button>
                </div>

                <nav className="mt-8 space-y-2 text-sm font-bold text-gray-600">
                    <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><List size={18} /> 진행중인 공고</div>
                    <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><LogOut size={18} /> 마감된 공고</div>
                    <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><CreditCard size={18} /> 유료 결제 내역</div>
                    <div className="p-4 hover:bg-pink-50 hover:text-pink-500 rounded-xl transition cursor-pointer flex items-center gap-3"><User size={18} /> 회원 정보 수정</div>
                </nav>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {showWarningModal && <WarningModal />}
            {showDesignModal && <DesignRequestModal />}
            {showPreviewModal && <PreviewModal />}
            {showMobileMenu && <MobileMenu />}

            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => view === 'form' ? setView('dashboard') : router.back()} className="text-gray-600">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <Store className="text-purple-600" size={24} />
                            {view === 'dashboard' ? '내 가게 관리' : '공고 등록/수정'}
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
                <div className="max-w-6xl mx-auto p-4 md:py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar (PC Only) */}
                    <aside className="hidden md:block col-span-1 space-y-2">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden border-2 border-pink-100">
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={32} /></div>
                            </div>
                            <h2 className="font-black text-gray-900">{shopName}</h2>
                            <p className="text-xs text-gray-500 mb-4">프리미엄 회원</p>
                            <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700">
                                사진 등록/수정
                            </button>
                        </div>
                        <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-sm font-bold text-gray-600">
                            <div className="p-4 hover:bg-pink-50 hover:text-pink-500 border-l-4 border-transparent hover:border-pink-500 transition cursor-pointer flex items-center gap-3"><List size={18} /> 진행중인 공고</div>
                            <div className="p-4 hover:bg-pink-50 hover:text-pink-500 border-l-4 border-transparent hover:border-pink-500 transition cursor-pointer flex items-center gap-3"><LogOut size={18} /> 마감된 공고</div>
                            <div className="p-4 hover:bg-pink-50 hover:text-pink-500 border-l-4 border-transparent hover:border-pink-500 transition cursor-pointer flex items-center gap-3"><CreditCard size={18} /> 유료 결제 내역</div>
                            <div className="p-4 hover:bg-pink-50 hover:text-pink-500 border-l-4 border-transparent hover:border-pink-500 transition cursor-pointer flex items-center gap-3"><User size={18} /> 회원 정보 수정</div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="col-span-1 md:col-span-3 space-y-6">
                        <div className="grid grid-cols-3 gap-2 md:gap-4 h-24 md:h-auto">
                            <div className="bg-white p-2 md:p-4 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col justify-center">
                                <div className="text-gray-500 text-[11px] md:text-sm font-bold mb-1">채용공고 등록수</div>
                                <div className="text-lg md:text-3xl font-black text-pink-500">1<span className="text-xs text-gray-400 ml-1">개</span></div>
                            </div>
                            <div className="bg-white p-2 md:p-4 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col justify-center">
                                <div className="text-gray-500 text-[11px] md:text-sm font-bold mb-1">진행중인 공고</div>
                                <div className="text-lg md:text-3xl font-black text-blue-500">1<span className="text-xs text-gray-400 ml-1">개</span></div>
                            </div>
                            <div className="bg-white p-2 md:p-4 rounded-2xl border border-gray-100 shadow-sm text-center opacity-60 flex flex-col justify-center">
                                <div className="text-gray-500 text-[11px] md:text-sm font-bold mb-1">마감된 공고</div>
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

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">진행중인 채용 정보</h3>
                                <span className="text-xs text-gray-400">최근 12개월 내역만 표시됩니다.</span>
                            </div>

                            <div className="p-4 border-b hover:bg-gray-50 transition">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex gap-2 text-[10px] items-center">
                                            <span className="bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-bold">진행중</span>
                                            <span className="text-gray-400">마감일: 2026-02-25</span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 line-clamp-1">🔥 [강남 쩜오] 갯수보장 / 팁별도 / 당일지급 확실합니다!</h4>
                                        <div className="text-xs text-gray-600">
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
                                        <span className="w-px h-3 bg-gray-300 mx-1"></span>
                                        <button onClick={handleAdClick} className="px-3 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50">수정</button>
                                        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50">마감</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto p-4 md:py-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                    기본 정보
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>상호명</label>
                                        <input
                                            type="text"
                                            value={shopName}
                                            onChange={(e) => setShopName(e.target.value)}
                                            className="w-full border rounded-xl p-3 text-sm font-bold bg-gray-50 text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">사업자 인증</label>
                                        {isVerified ? (
                                            <div className="w-full py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-bold flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                                인증 완료된 회원입니다
                                            </div>
                                        ) : (
                                            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                                                <Camera size={18} /> 사업자등록증 촬영/업로드
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                    담당자 정보
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>담당자 성함</label>
                                        <input type="text" placeholder="김실장" value={managerName} onChange={(e) => setManagerName(e.target.value)} className="w-full border rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>연락처</label>
                                        <input type="tel" placeholder="010-0000-0000" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} className="w-full border rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500">메신저 ID (선택)</label>
                                        <div className="flex items-center gap-2">
                                            <span className="w-20 text-xs font-bold bg-yellow-100 text-yellow-800 py-2 rounded text-center shrink-0">카카오</span>
                                            <input type="text" placeholder="Kakao ID" value={messengers.kakao} onChange={e => setMessengers({ ...messengers, kakao: e.target.value })} className="w-full border rounded-lg p-2 text-sm text-gray-900 placeholder-gray-400" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-20 text-xs font-bold bg-green-100 text-green-800 py-2 rounded text-center shrink-0">라인</span>
                                            <input type="text" placeholder="Line ID" value={messengers.line} onChange={e => setMessengers({ ...messengers, line: e.target.value })} className="w-full border rounded-lg p-2 text-sm text-gray-900 placeholder-gray-400" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-20 text-xs font-bold bg-blue-100 text-blue-800 py-2 rounded text-center shrink-0">텔레그램</span>
                                            <input type="text" placeholder="Telegram ID" value={messengers.telegram} onChange={e => setMessengers({ ...messengers, telegram: e.target.value })} className="w-full border rounded-lg p-2 text-sm text-gray-900 placeholder-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-full">
                                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
                                    채용 공고 내용
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>공고 제목</label>
                                        <input type="text" placeholder="EX) 강남 1등 가게! 갯수 보장!" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-xl p-3 text-sm font-bold focus:ring-1 focus:ring-pink-500 outline-none text-gray-900 placeholder-gray-400" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>1차 직종</label>
                                            <select value={industryMain} onChange={e => setIndustryMain(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none text-gray-900">
                                                <option value="">1차 직종 선택</option>
                                                {Object.keys(INDUSTRY_DATA).map(i => <option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>2차 직종</label>
                                            <select value={industrySub} onChange={e => setIndustrySub(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none text-gray-900">
                                                <option value="">2차 직종 선택</option>
                                                {INDUSTRY_DATA[industryMain]?.map(j => <option key={j} value={j}>{j}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500"><span className="text-red-500 mr-1">*</span>근무 지역</label>
                                        <div className="flex gap-2">
                                            <select value={regionCity} onChange={e => setRegionCity(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none text-gray-900">
                                                <option value="">지역 선택</option>
                                                {Object.keys(REGION_DATA).map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                            <select value={regionGu} onChange={e => setRegionGu(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none text-gray-900">
                                                <option value="">세부지역 선택</option>
                                                {REGION_DATA[regionCity]?.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <input type="text" placeholder="상세 주소 (선택)" value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} className="w-full border rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400" />
                                    </div>

                                    <div className="grid grid-cols-[1.6fr_1fr] gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>모집 연령</label>
                                            <div className="flex items-center gap-1">
                                                <select value={ageMin} onChange={e => setAgeMin(Number(e.target.value))} className="w-full border rounded-xl p-2 md:p-3 text-sm outline-none text-gray-900">
                                                    {AGES.map(a => <option key={a} value={a}>{a}세</option>)}
                                                </select>
                                                <span className="text-gray-400">~</span>
                                                <select value={ageMax} onChange={e => setAgeMax(Number(e.target.value))} className="w-full border rounded-xl p-2 md:p-3 text-sm outline-none text-gray-900">
                                                    {AGES.map(a => <option key={a} value={a}>{a}세</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">근무시간</label>
                                            <input type="text" placeholder="협의" value={workTime} onChange={(e) => setWorkTime(e.target.value)} className="w-full border rounded-xl p-3 text-sm outline-none text-gray-900 placeholder-gray-400" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>급여 방식</label>
                                            <select value={payType} onChange={(e) => setPayType(e.target.value)} className="w-full border rounded-xl p-1.5 md:p-3 text-xs md:text-sm outline-none text-gray-900">
                                                {PAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1"><span className="text-red-500 mr-1">*</span>급여액</label>
                                            <input type="text" placeholder="0" value={payAmount} onChange={handlePayAmountChange} className="w-full border rounded-xl p-3 text-sm font-bold outline-none text-right text-gray-900" />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold text-gray-500">편의사항 및 우대사항 (총 10개 제한)</label>
                                            <span className="text-xs text-pink-500 font-bold">{selectedConvenience.length + selectedKeywords.length}/10</span>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-xl mb-3">
                                            <h4 className="text-xs font-bold text-gray-400 mb-2">편의시설 / 지원</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {CONVENIENCE_ITEMS.map(item => (
                                                    <button key={item} onClick={() => toggleConvenience(item)} className={`px-2 py-1 rounded text-[11px] font-bold border transition ${selectedConvenience.includes(item) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                                                        {selectedConvenience.includes(item) && <Check size={10} className="inline mr-1" />}{item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <h4 className="text-xs font-bold text-gray-400 mb-2">키워드 / 조건</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {KEYWORDS.map(item => (
                                                    <button key={item} onClick={() => toggleKeyword(item)} className={`px-2 py-1 rounded text-[11px] font-bold border transition ${selectedKeywords.includes(item) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-500 border-gray-200'}`}>
                                                        {selectedKeywords.includes(item) && <Check size={10} className="inline mr-1" />}{item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold text-gray-500"><span className="text-red-500 mr-1">*</span>상세내용(에디터)</label>
                                            <button onClick={() => setShowDesignModal(true)} className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline">
                                                <HelpCircle size={12} />
                                                디자인을 원하시나요?
                                            </button>
                                        </div>
                                        <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                                            {/* Toolbar Synced */}
                                            <div
                                                className="bg-gray-50 border-b p-2 flex gap-1 flex-wrap items-center select-none"
                                                onMouseDown={(e) => {
                                                    if ((e.target as HTMLElement).tagName !== 'SELECT') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <select
                                                    onChange={handleFontChange}
                                                    value={currentFont}
                                                    className="h-7 text-xs border rounded bg-white px-1 outline-none mr-1 text-gray-900 w-20"
                                                >
                                                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                                </select>

                                                <select
                                                    onChange={(e) => execCmd('fontSize', e.target.value)}
                                                    value={currentFontSize}
                                                    className="h-7 text-xs border rounded bg-white px-1 outline-none mr-1 text-gray-900 w-16"
                                                >
                                                    {FONT_SIZES.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                                                </select>

                                                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                                                <button
                                                    onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
                                                    className={`p-1.5 rounded text-gray-700 ${isBold ? 'bg-gray-300 shadow-inner' : 'hover:bg-gray-200'}`}
                                                >
                                                    <Bold size={16} />
                                                </button>
                                                <button
                                                    onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
                                                    className={`p-1.5 rounded text-gray-700 ${isItalic ? 'bg-gray-300 shadow-inner' : 'hover:bg-gray-200'}`}
                                                >
                                                    <Italic size={16} />
                                                </button>
                                                <button
                                                    onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }}
                                                    className={`p-1.5 rounded text-gray-700 ${isUnderline ? 'bg-gray-300 shadow-inner' : 'hover:bg-gray-200'}`}
                                                >
                                                    <Underline size={16} />
                                                </button>

                                                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                                                <div className="flex items-center gap-1 border rounded px-1 ml-1 group relative">
                                                    <Palette size={16} className="text-gray-600" />
                                                    <select value={currentForeColor} onChange={(e) => execCmd('foreColor', e.target.value)} className="h-7 text-xs bg-transparent outline-none w-14 text-gray-900">
                                                        <option value="black">글자색</option>
                                                        {TEXT_COLORS.map(c => <option key={c.value} value={c.value} style={{ color: c.value, backgroundColor: c.value === '#FFFFFF' ? 'black' : 'transparent' }}>{c.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="flex items-center gap-1 border rounded px-1 ml-1 group relative">
                                                    <Highlighter size={16} className="text-gray-600" />
                                                    <select onChange={(e) => execCmd('hiliteColor', e.target.value)} className="h-7 text-xs bg-transparent outline-none w-14 text-gray-900">
                                                        <option value="transparent">형광펜</option>
                                                        {BG_COLORS.map(c => <option key={c.value} value={c.value} style={{ backgroundColor: c.value }}>{c.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                                                <div className="flex items-center gap-1 border rounded px-1 hover:bg-gray-50">
                                                    <Smile size={16} className="text-gray-600" />
                                                    <select onChange={(e) => { insertEmoji(e.target.value); e.target.value = ''; }} className="h-7 text-xs bg-transparent outline-none w-10 text-gray-900">
                                                        <option value="">이모티콘</option>
                                                        {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                                                    </select>
                                                </div>

                                                <div className="w-px h-4 bg-gray-300 mx-1"></div>

                                                <button onClick={() => execCmd('justifyLeft')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><AlignLeft size={16} /></button>
                                                <button onClick={() => execCmd('justifyCenter')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><AlignCenter size={16} /></button>
                                                <button onClick={() => execCmd('justifyRight')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><AlignRight size={16} /></button>
                                            </div>
                                            <div
                                                ref={editorRef}
                                                contentEditable
                                                className="w-full h-[300px] p-4 text-sm outline-none overflow-y-auto leading-relaxed text-gray-900"
                                                suppressContentEditableWarning={true}
                                                onMouseUp={handleEditorInteract}
                                                onKeyUp={handleEditorInteract}
                                                onBlur={saveSelection}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Search size={16} className="text-blue-500" />
                                            <span className="text-xs font-bold text-blue-700">SEO 자동 태그 미리보기</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {seoTags.length > 0 ? seoTags.map((tag, idx) => <span key={idx} className="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-200 shadow-sm font-bold">{tag}</span>) : <span className="text-xs text-blue-400">입력 정보를 바탕으로 태그가 자동 생성됩니다.</span>}
                                        </div>
                                    </div>

                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
                        <div className="max-w-5xl mx-auto flex gap-3">
                            <button onClick={handlePreview} className="flex-[2] py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm md:text-base">
                                <Eye size={18} /> 미리보기
                            </button>
                            <button onClick={() => setView('dashboard')} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition text-sm md:text-base">취소</button>
                            <button onClick={handleSave} className="flex-[3] py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition flex items-center justify-center gap-2 text-sm md:text-base">
                                <Save size={18} /> 저장 및 심사 요청
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
