'use client';

import { useState, useRef, useEffect } from 'react';
import { DETAILED_PRICING, FORBIDDEN_WORDS } from './constants';

// [Total Reset] Robust Helper
const getValid = (v1: any, v2: any, defaultValue: any = '') => {
    const invalidValues = [null, undefined, '', 0, '0', '지역', '업종', '시급', '급여방식선택', '자유직종', '정보없음'];
    if (!invalidValues.includes(v1)) return v1;
    if (!invalidValues.includes(v2)) return v2;
    return defaultValue;
};

export function useAdFormState() {
    // ... (States remain same)
    // --- Form States ---
    const [shopName, setShopName] = useState('코코 라운지');
    const [isVerified, setIsVerified] = useState(false);
    const [nickname, setNickname] = useState('');

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
    const [payType, setPayType] = useState('급여방식선택');
    const [payAmount, setPayAmount] = useState('0');
    const [mediaUrl, setMediaUrl] = useState('');

    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

    // Editor State
    const editorRef = useRef<HTMLDivElement>(null);
    const selectionRange = useRef<Range | null>(null);
    const [isEditorDirty, setIsEditorDirty] = useState(false);
    const [editorHtml, setEditorHtml] = useState('');

    const [toolbarStatus, setToolbarStatus] = useState({
        isBold: false,
        isItalic: false,
        isUnderline: false,
        textAlign: 'left',
        currentFont: 'Pretendard',
        currentFontSize: '16px',
        currentForeColor: '#000000',
        currentHiliteColor: 'transparent'
    });

    const [showFontMenu, setShowFontMenu] = useState(false);
    const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
    const [showForeColorMenu, setShowForeColorMenu] = useState(false);
    const [showHiliteColorMenu, setShowHiliteColorMenu] = useState(false);
    const [showEmojiMenu, setShowEmojiMenu] = useState(false);

    // Sync Editor HTML
    const syncEditorHtml = () => {
        if (editorRef.current) {
            setEditorHtml(editorRef.current.innerHTML);
            setIsEditorDirty(true);
        }
    };

    // Update Toolbar Status based on selection
    const updateToolbarStatus = () => {
        const sel = window.getSelection();
        let fontSize = '16px';
        let foreColor = '#000000';
        let hiliteColor = 'transparent';
        let fontName = 'Pretendard';

        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const parent = range.commonAncestorContainer.nodeType === 1
                ? range.commonAncestorContainer as HTMLElement
                : range.commonAncestorContainer.parentElement;

            if (parent) {
                const style = window.getComputedStyle(parent);
                fontSize = parent.style.fontSize || style.fontSize;
                foreColor = parent.style.color || style.color;
                // 배경색은 여러 속성이 가능하므로 실젯값 확인
                hiliteColor = parent.style.backgroundColor || style.backgroundColor;
                fontName = (parent.style.fontFamily || style.fontFamily).replace(/"/g, '').split(',')[0];
            }
        }

        setToolbarStatus({
            isBold: document.queryCommandState('bold'),
            isItalic: document.queryCommandState('italic'),
            isUnderline: document.queryCommandState('underline'),
            textAlign: document.queryCommandValue('justifyLeft') === 'true' ? 'left' :
                document.queryCommandValue('justifyCenter') === 'true' ? 'center' :
                    document.queryCommandValue('justifyRight') === 'true' ? 'right' : 'left',
            currentFont: fontName || 'Pretendard',
            currentFontSize: fontSize || '16px',
            currentForeColor: foreColor || '#000000',
            currentHiliteColor: hiliteColor || 'transparent'
        });
    };

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            // [Fix] cloneRange() — live reference 저장 시 removeAllRanges() 후 무효화 방지 (2026-03-22)
            selectionRange.current = sel.getRangeAt(0).cloneRange();
        }
    };

    const restoreSelection = () => {
        if (selectionRange.current) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(selectionRange.current);
            }
        }
    };

    // Ad Selection
    const [selectedAdProduct, setSelectedAdProduct] = useState<string | null>(null);
    const [selectedAdPeriod, setSelectedAdPeriod] = useState<30 | 60 | 90>(30);
    const [selectedIcon, setSelectedIcon] = useState<number | null>(null);
    const [iconPeriod, setIconPeriod] = useState<30 | 60 | 90 | 0>(0);
    const [selectedHighlighter, setSelectedHighlighter] = useState<number | null>(null);
    const [highlighterPeriod, setHighlighterPeriod] = useState<30 | 60 | 90 | 0>(0);
    const [paySuffixes, setPaySuffixes] = useState<string[]>([]);
    const [borderOption, setBorderOption] = useState<'none' | 'color' | 'glow' | 'sparkle' | 'rainbow'>('none');
    const [borderPeriod, setBorderPeriod] = useState<30 | 60 | 90 | 0>(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const resetAdStates = () => {
        setShopName('코코 라운지');
        setIsVerified(false);
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
        setPayType('급여방식선택');
        setPayAmount('0');
        setMediaUrl('');
        setSelectedKeywords([]);

        // Editor Reset
        setIsEditorDirty(false);
        setEditorHtml('');
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
        }

        // [Fix] Reset all paid options to StandardsGuard defaults to ensure clean UI
        setSelectedAdProduct(null);
        setSelectedAdPeriod(30);
        setSelectedIcon(null);
        setIconPeriod(0);
        setSelectedHighlighter(null);
        setHighlighterPeriod(0);
        setPaySuffixes([]);
        setBorderOption('none');
        setBorderPeriod(0);
        setTotalAmount(0);
    };

    // Total Amount Calculation
    useEffect(() => {
        let total = 0;
        if (selectedAdProduct) {
            const product = DETAILED_PRICING.find(p => p.id === selectedAdProduct);
            if (product) {
                const key = `d${selectedAdPeriod}` as keyof typeof product;
                total += product[key] as number;
            }
        }
        if (selectedIcon && iconPeriod > 0) {
            total += iconPeriod === 30 ? 30000 : iconPeriod === 60 ? 55000 : 70000;
        }
        if (selectedHighlighter && highlighterPeriod > 0) {
            total += highlighterPeriod === 30 ? 30000 : highlighterPeriod === 60 ? 55000 : 70000;
        }
        if (borderOption !== 'none' && borderPeriod > 0) {
            total += borderPeriod === 30 ? 30000 : borderPeriod === 60 ? 55000 : 70000;
        }
        if (paySuffixes.length > 1) {
            total += (paySuffixes.length - 1) * 5000;
        }
        setTotalAmount(total);
    }, [selectedAdProduct, selectedAdPeriod, selectedIcon, iconPeriod, selectedHighlighter, highlighterPeriod, paySuffixes, borderOption, borderPeriod]);

    const isDirty = (
        (shopName !== '' && shopName !== '코코 라운지') ||
        managerName !== '' ||
        managerPhone !== '' ||
        messengers.kakao !== '' || messengers.line !== '' || messengers.telegram !== '' ||
        title !== '' ||
        industryMain !== '' ||
        industrySub !== '' ||
        ageMin !== 20 ||
        ageMax !== 35 ||
        regionCity !== '' ||
        regionGu !== '' ||
        payType !== '급여방식선택' ||
        payAmount !== '0' ||
        isEditorDirty ||
        selectedKeywords.length > 0 ||
        selectedAdProduct !== null ||
        selectedAdPeriod !== 30 ||
        paySuffixes.length > 0 ||
        borderOption !== 'none' ||
        selectedIcon !== null ||
        selectedHighlighter !== null
    );

    const loadAdData = (ad: any) => {
        if (!ad) return;
        const opts = ad.options || {};

        // [Total Reset] Robust Loading Logic using getValid
        const norm = {
            shopName: getValid(ad.name || ad.shopName, opts.shopName, '상호명 없음'),
            nickname: getValid(ad.nickname, opts.nickname, ''),
            managerName: getValid(ad.manager_name || ad.managerName, opts.managerName, ''),
            managerPhone: getValid(ad.manager_phone || ad.phone || ad.managerPhone, opts.managerPhone, ''),
            kakao: getValid(ad.kakao_id || ad.kakao, opts.kakao || opts.messengers?.kakao, ''),
            telegram: getValid(ad.telegram_id || ad.telegram, opts.telegram || opts.messengers?.telegram, ''),
            line: getValid(ad.line_id || ad.line, opts.line || opts.messengers?.line, ''),
            content: getValid(ad.content, opts.content || ad.jobContent, ''),
            title: getValid(ad.title, opts.title || ad.jobTitle, ''),
            regionCity: getValid(ad.region || ad.regionCity || ad.work_region, opts.regionCity, ''),
            regionGu: getValid(ad.regionGu || ad.work_region_sub, opts.regionGu, ''),
            addressDetail: getValid(ad.work_address || ad.addressDetail, opts.addressDetail, ''),
            category: getValid(ad.category || ad.industryMain, opts.category, ''),
            industrySub: getValid(ad.category_sub || ad.categorySub, opts.categorySub || opts.industrySub, ''),
            payType: getValid(ad.pay_type || ad.payType, opts.payType, '급여방식선택'),
            payAmount: String(getValid(ad.pay_amount || ad.payAmount || ad.pay, opts.payAmount, '0')),
            ageMin: ad.age_min || ad.ageMin || opts.ageMin || 20,
            ageMax: ad.age_max || ad.ageMax || opts.ageMax || 35,
            mediaUrl: getValid(ad.media_url || ad.mediaUrl, opts.mediaUrl || opts.media_url, ''),
            keywords: opts.keywords || ad.keywords || [],
            productType: ad.tier || ad.productType || opts.product_type || ad.ad_type || null,
            productPeriod: opts.product_period || ad.productPeriod || 30,
            icon: opts.icon || ad.icon || null,
            icon_period: opts.icon_period || ad.icon_period || 0,
            highlighter: opts.highlighter || ad.highlighter || null,
            highlighter_period: opts.highlighter_period || ad.highlighter_period || 0,
            border: opts.border || opts.border_option || ad.border || 'none',
            border_period: opts.border_period || ad.border_period || 0,
            pay_suffixes: opts.pay_suffixes || ad.pay_suffixes || []
        };

        // Apply to States
        setShopName(norm.shopName);
        setNickname(norm.nickname);
        setManagerName(norm.managerName);
        setManagerPhone(norm.managerPhone);
        setMessengers({
            kakao: norm.kakao,
            telegram: norm.telegram,
            line: norm.line
        });

        setTitle(norm.title);
        setIndustryMain(norm.category);
        setIndustrySub(norm.industrySub);
        setRegionCity(norm.regionCity);
        setRegionGu(norm.regionGu);
        setAddressDetail(norm.addressDetail);

        setAgeMin(norm.ageMin);
        setAgeMax(norm.ageMax);

        setPayType(norm.payType);
        setPayAmount(norm.payAmount);
        setMediaUrl(norm.mediaUrl);

        // Editor
        setEditorHtml(norm.content);
        if (editorRef.current) {
            editorRef.current.innerHTML = norm.content;
        }

        setSelectedKeywords(norm.keywords);
        setSelectedAdProduct(norm.productType);
        setSelectedAdPeriod(norm.productPeriod);

        setSelectedIcon(norm.icon);
        setIconPeriod(norm.icon_period);
        setSelectedHighlighter(norm.highlighter);
        setHighlighterPeriod(norm.highlighter_period);
        setBorderOption(norm.border as any);
        setBorderPeriod(norm.border_period);
        setPaySuffixes(norm.pay_suffixes);
    };

    return {
        shopName, setShopName, isVerified, setIsVerified, nickname, setNickname,
        managerName, setManagerName,
        managerPhone, setManagerPhone, messengers, setMessengers, title, setTitle,
        regionCity, setRegionCity, regionGu, setRegionGu, addressDetail, setAddressDetail,
        industryMain, setIndustryMain, industrySub, setIndustrySub, ageMin, setAgeMin,
        ageMax, setAgeMax, payType, setPayType,
        payAmount, setPayAmount,
        mediaUrl, setMediaUrl,
        selectedKeywords, setSelectedKeywords, editorRef, selectionRange, isEditorDirty, setIsEditorDirty,
        editorHtml, setEditorHtml, syncEditorHtml, updateToolbarStatus, saveSelection, restoreSelection,
        toolbarStatus, setToolbarStatus, showFontMenu, setShowFontMenu, showFontSizeMenu, setShowFontSizeMenu,
        showForeColorMenu, setShowForeColorMenu, showHiliteColorMenu, setShowHiliteColorMenu,
        showEmojiMenu, setShowEmojiMenu, selectedAdProduct, setSelectedAdProduct,
        selectedAdPeriod, setSelectedAdPeriod, selectedIcon, setSelectedIcon, iconPeriod, setIconPeriod,
        selectedHighlighter, setSelectedHighlighter, highlighterPeriod, setHighlighterPeriod,
        paySuffixes, setPaySuffixes, borderOption, setBorderOption, borderPeriod, setBorderPeriod,
        totalAmount, setTotalAmount, resetAdStates, loadAdData, isDirty
    };
}
