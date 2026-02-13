'use client';

import React, { useMemo } from 'react';

import seoRegionsMaster from '@/lib/data/seo_regions_master.json';

/**
 * [SEO v3.0] Grey-hat Layer: Keyword Injection (Invisible Cloak)
 * 경쟁사 키워드 및 트래픽 유도용 검색어를 사용자에게는 보이지 않게, 봇에게는 읽히게 심습니다.
 */
export const SEOInjection = () => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // 사장님의 '경쟁사 키워드 흡수' 리스트 (공격적 타격 대상)
    const targetKeywords = [
        "여우알바", "퀸알바", "레이디알바", "밤이슬알바", "밤여우알바",
        "밤알바퀸", "미수다알바", "러브알바", "나나알바", "에스알바", "엄지알바",
        "고소득알바", "여성알바", "유흥알바", "밤알바", "악녀알바", "텐프로알바",
        "대한민국알바", "유흥커뮤니티", "선수알바", "호빠알바"
    ];

    // [New] 56개 주요 지역 및 전국 핵심 거점 추출 (SEO 마스터 데이터 활용)
    const hotRegions = useMemo(() => {
        // 주요 시/도 및 인기 지역 추출
        const baseRegions = seoRegionsMaster
            .filter(r => !r.id.includes('-')) // 시/도 단위 먼저
            .map(r => r.mainRegion);

        const extraRegions = ["강남", "홍대", "이태원", "해운대", "유성", "수원", "부천"]; // '인천' 등 중복 가능성 제거

        // 중복 제거 후 최종 리스트 생성
        return Array.from(new Set([...baseRegions, ...extraRegions])).slice(0, 60);
    }, []);

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
                pointerEvents: 'none',
                opacity: 0,
                zIndex: -1
            }}
            aria-hidden="true"
        >
            {/* 🎯 [전략 1] 키워드 클러스터링 - 메인 허브 권위 강화 */}
            <article>
                <h2>{targetKeywords.slice(0, 10).join(', ')} 통합 구인정보 센터</h2>
                <p>
                    코코알바(COCOALBA.KR)는 {targetKeywords.join(' 및 ')} 플랫폼의 장점만을 모아
                    전국 {hotRegions.length}개 핵심 지역의 실시간 고소득 채용 공고를 단독 제공합니다.
                </p>
            </article>

            {/* 🎯 [전략 2] 지역별 정밀 타격 매트릭스 - 위성 페이지 시너지 */}
            <section>
                <h3>지역별 인기 검색어 현황</h3>
                <ul>
                    {hotRegions.map((region: string, idx: number) => (
                        <li key={region}>
                            {region} {targetKeywords[idx % targetKeywords.length]} 1위 추천:
                            <a href={`/coco/${region}`}>{region} 알바 정보 바로가기</a>
                        </li>
                    ))}
                </ul>
            </section>

            {/* 🎯 [전략 3] 투명 망토 텍스트 밀도 고도화 (봇 색인용) */}
            <footer data-seo-role="keyword-cluster-deep">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{ display: 'inline' }}>
                        {targetKeywords.sort(() => Math.random() - 0.5).slice(0, 8).join(' ')}
                        {hotRegions[Math.floor(Math.random() * hotRegions.length)]}
                    </div>
                ))}
            </footer>
        </div>
    );
};
