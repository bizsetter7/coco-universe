// [Total Reset] Robust Helper
// 빈 문자열, null, undefined, 기본값(0, '지역', '업종') 등을 걸러내고 실제 유효한 데이터를 우선 선택합니다.
const getValid = (v1: any, v2: any, defaultValue: any = '') => {
    const invalidValues = [null, undefined, '', '지역', '업종', '시급', '급여방식선택', '자유직종', '정보없음'];
    if (!invalidValues.includes(v1)) return v1;
    if (!invalidValues.includes(v2)) return v2;
    return defaultValue;
};

// [Total Reset] Number Helper (0을 유효값으로 보되, 더 큰 값을 우선하거나 Snapshot 우선)
const getValidNum = (n1: any, n2: any, defaultValue: number = 0) => {
    const val1 = (n1 !== undefined && n1 !== null && n1 !== '') ? Number(n1) : -1;
    const val2 = (n2 !== undefined && n2 !== null && n2 !== '') ? Number(n2) : -1;
    if (val1 > val2) return val1;
    if (val2 >= 0) return val2;
    return defaultValue;
};

export const normalizeAd = (ad: any) => {
    if (!ad) return null;
    const opt = ad.options || {};

    // [Total Reset] Polyfill Mapping
    // 어떤 필드명을 쓰더라도 데이터가 존재하도록 상호 매핑하며,
    // root 컬럼이 비어있으면 options Snapshot에서 즉시 복구합니다.
    const normalized = {
        id: ad.id,
        // 제목
        title: getValid(ad.title, opt.title, '제목 없음'),
        jobTitle: getValid(ad.title, opt.title, '제목 없음'),

        // 닉네임 / 관리자명
        nickname: getValid(ad.nickname, opt.nickname, '관리자'),
        managerNickname: getValid(ad.nickname, opt.nickname, '관리자'),
        managerName: getValid(ad.manager_name || ad.managerName, opt.managerName, ''),

        // 상호명
        name: getValid(ad.name || ad.shopName, opt.shopName, '상호명 없음'),
        shopName: getValid(ad.name || ad.shopName, opt.shopName, '상호명 없음'),

        // 연락처
        managerPhone: getValid(ad.manager_phone || ad.phone || ad.managerPhone, opt.managerPhone, ''),
        phone: getValid(ad.manager_phone || ad.phone || ad.managerPhone, opt.managerPhone, ''),
        kakao: getValid(ad.kakao_id || ad.kakao, opt.kakao || opt.messengers?.kakao, ''),
        telegram: getValid(ad.telegram_id || ad.telegram, opt.telegram || opt.messengers?.telegram, ''),
        line: getValid(ad.line_id || ad.line, opt.line || opt.messengers?.line, ''),
        messengers: {
            kakao: getValid(ad.kakao_id || ad.kakao, opt.kakao || opt.messengers?.kakao, ''),
            telegram: getValid(ad.telegram_id || ad.telegram, opt.telegram || opt.messengers?.telegram, ''),
            line: getValid(ad.line_id || ad.line, opt.line || opt.messengers?.line, '')
        },

        // 지역
        regionCity: getValid(ad.region || ad.regionCity || ad.work_region, opt.regionCity, '지역'),
        work_region: getValid(ad.region || ad.regionCity || ad.work_region, opt.regionCity, '지역'),
        regionGu: getValid(ad.regionGu || ad.work_region_sub, opt.regionGu, ''),
        work_region_sub: getValid(ad.regionGu || ad.work_region_sub, opt.regionGu, ''),
        addressDetail: getValid(ad.work_address || ad.addressDetail, opt.addressDetail, ''),
        work_address: getValid(ad.work_address || ad.addressDetail, opt.addressDetail, ''),

        // 업종
        category: getValid(ad.category || ad.industryMain, opt.category, '업종'),
        industryMain: getValid(ad.category || ad.industryMain, opt.category, '업종'),
        categorySub: getValid(ad.category_sub || ad.categorySub || ad.industrySub, opt.categorySub, ''),
        industrySub: getValid(ad.category_sub || ad.categorySub || ad.industrySub, opt.categorySub, ''),

        // 급여
        payType: getValid(ad.pay_type || ad.payType, opt.payType, '시급'),
        pay_type: getValid(ad.pay_type || ad.payType, opt.payType, '시급'),
        payAmount: getValidNum(ad.pay_amount || ad.payAmount || ad.pay, opt.payAmount, 0),
        pay_amount: getValidNum(ad.pay_amount || ad.payAmount || ad.pay, opt.payAmount, 0),
        pay: getValidNum(ad.pay_amount || ad.payAmount || ad.pay, opt.payAmount, 0),

        // 본문 및 기타
        content: getValid(ad.content, opt.content || ad.jobContent, ''),
        jobContent: getValid(ad.content, opt.content || ad.jobContent, ''),
        deadline: ad.deadline || opt.deadline || '2026-03-25',
        status: ad.status || opt.status || '진행중',
        rejection_reason: ad.rejection_reason || opt.rejection_reason || '',

        // 상품 및 디자인 옵션
        productType: ad.tier || ad.productType || opt.product_type || ad.ad_type || 'p1',
        tier: ad.tier || ad.productType || opt.product_type || ad.ad_type || 'p1',
        ad_type: ad.tier || ad.productType || opt.product_type || ad.ad_type || 'p1',

        selectedIcon: opt.icon || ad.icon || null,
        selectedHighlighter: opt.highlighter || ad.selectedHighlighter || ad.highlighter || null,
        borderOption: opt.border || ad.borderOption || ad.border || 'none',
        // [Critical Fix] Ensure both camelCase and snake_case are handled
        paySuffixes: opt.pay_suffixes || opt.paySuffixes || ad.pay_suffixes || ad.paySuffixes || [],

        // 카운터 (중요 필드) - 월이 바뀌었으면 0으로 리셋하여 반환 (Fallback: updated_at)
        edit_count: (() => {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const count = getValidNum(ad.edit_count, opt.edit_count, 0);

            let month = ad.last_edit_month || opt.last_edit_month;

            // [Smart Recovery] If monthly tracker is missing but updated_at is this month, recover the count
            if (!month && ad.updated_at) {
                try {
                    const updatedDate = new Date(ad.updated_at);
                    const updatedMonth = `${updatedDate.getFullYear()}-${String(updatedDate.getMonth() + 1).padStart(2, '0')}`;
                    if (updatedMonth === currentMonth) {
                        month = currentMonth;
                    }
                } catch (e) { /* ignore invalid date */ }
            }

            return month === currentMonth ? Number(count) : 0;
        })(),
        last_edit_month: ad.last_edit_month || opt.last_edit_month || '',

        // 원본 옵션 보관
        options: opt,
        isMock: ad.isMock || String(ad.id).startsWith('AD_MOCK_')
    };

    return normalized;
};

/**
 * 결제 내역 데이터를 정규화합니다.
 */
export const normalizePayment = (p: any, defaultUserName: string = '관리자') => {
    const adMetadata = p.metadata || {};
    const opt = adMetadata.options || p.options || {};

    // [Fix] Flat mapping with snapshot priority
    const finalAdObject = {
        id: p.shop_id || p.shopId,
        title: opt.title || adMetadata.adTitle || adMetadata.title || p.desc || p.description || '구인 공고',
        nickname: opt.nickname || adMetadata.nickname || p.nickname || defaultUserName,
        name: opt.shopName || adMetadata.shopName || p.shopName || defaultUserName,
        payType: opt.payType || adMetadata.pay_type || adMetadata.payType || '시급',
        payAmount: opt.payAmount || adMetadata.pay_amount || adMetadata.payAmount || 0,
        content: opt.content || adMetadata.content || '',
        regionCity: opt.regionCity || adMetadata.work_region || '지역',
        regionGu: opt.regionGu || adMetadata.work_region_sub || '',
        category: opt.category || adMetadata.category || '업종',
        categorySub: opt.categorySub || adMetadata.category_sub || '',
        options: opt,
        productType: opt.product_type || adMetadata.ad_type || '그랜드'
    };

    return {
        id: p.id,
        amount: p.amount || 0,
        price: p.price || p.amount,
        method: p.method,
        status: p.status,
        date: new Date(p.created_at || Date.now()).toLocaleString(),
        description: p.description,
        type: opt.product_type || adMetadata.ad_type || p.ad_type || 'AD',
        nickname: finalAdObject.nickname,
        adTitle: finalAdObject.title,
        adObject: finalAdObject
    };
};
