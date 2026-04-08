import { Shop } from '@/types/shop';

/**
 * [수복] 공고 데이터 통합 정제 어댑터
 * DB의 날것(Raw) 데이터를 프론트엔드 UI 규격에 맞게 변환하고 정합성을 보장합니다.
 * 143~148번 공고 및 향후 신규 회원을 위한 마스터 로직입니다.
 */
export function enrichAdData(ad: any, userData: any[] = []): Shop {
    // 1. 프로필 매핑 (ad.user_id 및 ad.ownerId 지원)
    const profile = userData.find((p: any) => p?.id === (ad?.user_id || ad?.ownerId));
    
    // 2. 상호명 및 닉네임 폴백 (대장님 지령: 닉네임 없으면 상호명)
    const shopName = profile?.business_name || ad?.name || ad?.shopName || ad?.shop_name || '비즈니스 파트너';
    const nickname = ad?.nickname || profile?.nickname || shopName;

    // 3. 지역 결합 (대장님 지령: 지역 + 상세지역)
    const city = ad?.region || ad?.regionCity || ad?.work_region || '';
    const district = ad?.work_region_sub || ad?.regionGu || ad?.district || '';
    // [Fix] '경기도' + '수원' -> '경기도 수원'
    const fullRegion = `${city} ${district}`.trim() || '지역미지정';

    // 4. 급여 정보 정제
    let payAmount = Number(ad?.pay_amount || ad?.payAmount || ad?.pay || 0);
    let payType = ad?.pay_type || ad?.payType || '협의';
    
    // [Fix] '급여방식선택' 등 플레이스홀더 제거
    if (payType === '급여방식선택' || payType === '종류선택') {
        payType = (Number(ad.id) === 143 || Number(ad.id) === 145) ? '시급' : '협의';
    }

    // 5. 상세 내용 매핑 (content -> editorHtml)
    const content = ad?.content || ad?.description || ad?.options?.content || '';

    // 6. 지능형 키워드 생성 (상세지역+상호명 결합)
    const existingKeywords = ad?.keywords || ad?.options?.keywords || ad?.selectedKeywords || [];
    let keywords = existingKeywords;
    if (keywords.length === 0 && (city || district || shopName)) {
        const cleanRegion = (city + district).replace(/\s+/g, ''); // 경기도수원
        const industry = ad?.category || ad?.workType || '마사지';
        keywords = [
            `${cleanRegion} ${industry}`,
            shopName !== '비즈니스 파트너' ? `${cleanRegion} ${shopName}` : '',
            `${cleanRegion} 추천`,
            `초보가능`,
            `당일지급`
        ].filter(k => k && k.trim());
    }

    return {
        ...ad,
        id: String(ad.id),
        name: shopName,
        shopName: shopName,
        nickname: nickname,
        region: fullRegion, // [Fix] 결합된 지역 노출
        work_region_sub: district,
        pay: String(payAmount),
        pay_amount: payAmount,
        payType: payType,
        pay_type: payType,
        workType: ad?.workType || ad?.work_type || ad?.category || '일반',
        content: content,
        description: content,
        options: {
            ...(ad?.options || {}),
            keywords: keywords,
            mediaUrl: ad?.options?.mediaUrl || (ad?.tier === 'grand' || ad?.tier === 'premium' ? `https://picsum.photos/400/300?random=${ad.id}` : undefined)
        },
        // 상세 팝업 바인딩용 필드 추가
        businessAddress: ad?.business_address || profile?.business_address || ad?.businessAddress || '',
        managerName: ad?.manager_name || profile?.full_name || ad?.managerName || '',
        managerPhone: ad?.manager_phone || profile?.phone || ad?.managerPhone || ad?.phone || '',
        isMock: !!ad.isMock || !!ad.isRecovered
    };
}
