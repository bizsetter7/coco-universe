'use client';

import { useState, useRef, useEffect } from 'react';
import { DETAILED_PRICING, FORBIDDEN_WORDS } from './constants';

export function useAdFormState() {
    // --- Form States ---
    const [shopName, setShopName] = useState('코코 라운지');
    const [isVerified, setIsVerified] = useState(true);
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
            selectionRange.current = sel.getRangeAt(0);
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
    const [borderOption, setBorderOption] = useState<'none' | 'color' | 'glow' | 'sparkle'>('none');
    const [borderPeriod, setBorderPeriod] = useState<30 | 60 | 90 | 0>(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const resetAdStates = () => {
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
        setPayType('급여방식선택');
        setPayAmount('0');
        setIsEditorDirty(false);
        setSelectedAdProduct(null);
        setSelectedAdPeriod(30);
        setSelectedIcon(null);
        setIconPeriod(0);
        setSelectedHighlighter(null);
        setHighlighterPeriod(0);
        setBorderPeriod(0);
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
        setManagerName(ad.managerName || '');
        setManagerPhone(ad.managerPhone || '');
        setMessengers(ad.messengers || { kakao: '', line: '', telegram: '' });
        setTitle(ad.title || '');
        setNickname(ad.nickname || '');
        setIndustryMain(ad.category || '');
        setIndustrySub(ad.categorySub || '');
        setRegionCity(ad.regionCity || '');
        setRegionGu(ad.regionGu || '');
        setAgeMin(ad.ageMin || 20);
        setAgeMax(ad.ageMax || 35);
        setPayType(ad.payType || '급여방식선택');
        setPayAmount(ad.payAmount || '0');
        setSelectedKeywords(ad.keywords || []);
        setEditorHtml(ad.content || '');
        if (editorRef.current) {
            editorRef.current.innerHTML = ad.content || '';
        }

        // Ad Options
        setSelectedAdProduct(ad.productType || null);
        setSelectedAdPeriod(ad.productPeriod || 30);
        setSelectedIcon(ad.options?.icon || null);
        setIconPeriod(ad.options?.iconPeriod || 0);
        setSelectedHighlighter(ad.options?.highlighter || null);
        setHighlighterPeriod(ad.options?.highlighterPeriod || 0);
        setBorderOption(ad.options?.borderOption || 'none');
        setBorderPeriod(ad.options?.borderPeriod || 0);
        setPaySuffixes(ad.options?.paySuffixes || []);
    };

    return {
        shopName, setShopName, isVerified, setIsVerified, nickname, setNickname,
        managerName, setManagerName,
        managerPhone, setManagerPhone, messengers, setMessengers, title, setTitle,
        regionCity, setRegionCity, regionGu, setRegionGu, addressDetail, setAddressDetail,
        industryMain, setIndustryMain, industrySub, setIndustrySub, ageMin, setAgeMin,
        ageMax, setAgeMax, payType, setPayType,
        payAmount, setPayAmount,
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
