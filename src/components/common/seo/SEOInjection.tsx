'use client';

import React from 'react';

/**
 * [SEO v3.0] Grey-hat Layer: Keyword Injection (Invisible Cloak)
 * 경쟁사 키워드 및 트래픽 유도용 검색어를 사용자에게는 보이지 않게, 봇에게는 읽히게 심습니다.
 */
export const SEOInjection = () => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // 사장님의 '경쟁사 키워드 흡수' 리스트
    const targetKeywords = [
        "여우알바", "퀸알바", "레이디알바", "밤이슬알바", "밤여우알바",
        "밤알바퀸", "미수다알바", "러브알바", "나나알바", "에스알바", "엄지알바",
        "고소득알바", "여성알바", "유흥알바", "밤알바", "악녀알바", "텐프로알바"
    ];

    const regions = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산"];

    if (!mounted) return null;

    return (
        <div
            style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0,0,0,0)',
                whiteSpace: 'nowrap',
                border: '0',
                pointerEvents: 'none'
            }}
            aria-hidden="true"
        >
            {/* 키워드 클러스터링 */}
            <h2>{targetKeywords.join(', ')} 관련 정보</h2>
            <p>
                코코알바는 {targetKeywords.join(' 및 ')} 통합 검색 결과를 제공하며
                {regions.join(', ')} 전 지역 실시간 구인정보를 업데이트합니다.
            </p>

            {/* 지역별 조합 노출 */}
            <ul>
                {regions.map(region => (
                    <li key={region}>
                        {region} {targetKeywords[Math.floor(Math.random() * targetKeywords.length)]} 추천
                    </li>
                ))}
            </ul>

            {/* 사장님의 '투명 망토' 전략 구현 - 텍스트 밀도 확보 */}
            <div data-seo-role="keyword-cluster">
                {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{targetKeywords.sort(() => Math.random() - 0.5).join(' ')} </span>
                ))}
            </div>
        </div>
    );
};
