import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import JobDetailModal, { JobDetailContent } from '@/components/jobs/JobDetailModal';
import { Metadata } from 'next';
import { slugify } from '@/utils/shopUtils';
import shadowRegionsData from '@/lib/data/Shadow_SEO_Regions.json';
import {
    isWorkTypeSlug,
    WORK_TYPE_INFO,
    WORK_TYPE_SLUGS,
    getRegionPayData,
} from '@/lib/data/work-type-guide';
import WorkTypeGuidePage from '@/components/guide/WorkTypeGuidePage';

interface Props {
    params: Promise<{ region: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id, region } = await params;
    const decodedId = decodeURIComponent(id).normalize('NFC');
    const decodedRegionSlug = decodeURIComponent(region).normalize('NFC');

    // ── 업종 가이드 페이지 메타데이터 ──
    if (isWorkTypeSlug(decodedId)) {
        const workTypeInfo = WORK_TYPE_INFO[decodedId];
        const regionData = shadowRegionsData.find(r => slugify(r.id) === decodedRegionSlug);
        const regionName = regionData?.mainRegion ?? decodedRegionSlug;
        const title = `${regionName} ${workTypeInfo.name} 완전 가이드 2026 — 평균 급여·용어·FAQ | 코코알바`;
        const description = `${regionName} ${workTypeInfo.name} 평균 TC·시급·일급 정보와 업종 특징, 초보자 FAQ를 한눈에 확인하세요. 코코알바 검증 업소 공고도 바로 확인 가능합니다.`;
        return {
            title,
            description,
            keywords: [`${regionName} ${decodedId}`, `${regionName} ${workTypeInfo.name}`, `${decodedId} 급여`, `${regionName} 유흥알바`, '여성알바', '밤알바', '고수익알바'],
            openGraph: {
                title,
                description,
                url: `https://cocoalba.kr/coco/${decodedRegionSlug}/${decodedId}`,
                siteName: '코코알바',
                images: [{ url: 'https://cocoalba.kr/og-image.jpg', width: 1200, height: 630, alt: '코코알바' }],
                type: 'website',
            },
        };
    }

    // ── 광고 상세 페이지 메타데이터 ──
    const shop = (shopsData as Shop[]).find((s) => s.id === decodedId);

    if (!shop) {
        return {
            title: '업소를 찾을 수 없습니다 - 코코알바',
            robots: { index: false, follow: false },
        };
    }

    // 콘텐츠가 없는 thin 페이지 → noindex (크롤 예산 보호 + 품질 신호 유지)
    const hasTitle = (shop.title || '').trim().length > 4;
    const hasDesc = (shop.description || '').trim().length > 20;
    const isThinContent = !hasTitle && !hasDesc;

    if (isThinContent) {
        return {
            title: `${shop.name} - 코코알바`,
            robots: { index: false, follow: true },
        };
    }

    // [SEO 무결성] 지역 데이터에서 강제로 Shadow SEO(하이엔드) 키워드 추출
    const shadowRegionData = shadowRegionsData.find(r => slugify(r.id) === decodedRegionSlug) || {
        mainRegion: decodedRegionSlug.replace(/-/g, ' '),
        keywords: [`${decodedRegionSlug.replace(/-/g, ' ')} 여성알바`, '고수익알바', '유흥알바']
    };

    const title = `${shop.name} - ${shadowRegionData.mainRegion} 최고의 ${shadowRegionData.keywords[0]} | 코코알바`;
    const description = `${shadowRegionData.mainRegion} ${shop.name}에서 함께할 가족을 찾습니다. ${shop.payType || ''} ${shop.pay} 이상. 확실한 고수익과 안전을 보장합니다. 지금 바로 확인하세요.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://cocoalba.kr/coco/${slugify(shop.region)}/${shop.id}`,
            images: shop.options?.mediaUrl ? [
                {
                    url: shop.options.mediaUrl,
                    width: 1200,
                    height: 630,
                    alt: shop.name || '업소 이미지',
                },
            ] : [
                {
                    url: 'https://cocoalba.kr/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: '코코알바',
                },
            ],
            type: 'website',
        },
        keywords: [shop.name || '', ...shadowRegionData.keywords, '여성알바', '고수익알바', '당일지급', '밤알바', '텐프로'],
    };
}

export async function generateStaticParams() {
    // 1. 기존 광고 상세 페이지
    const shopParams = (shopsData as Shop[]).map((shop) => ({
        region: slugify(shop.region || '전체'),
        id: shop.id.toString(),
    }));

    // 2. 지역×업종 가이드 랜딩 페이지 (예: /coco/서울/룸알바)
    const guideParams = shadowRegionsData.flatMap((regionData) =>
        WORK_TYPE_SLUGS.map((workType) => ({
            region: slugify(regionData.id),
            id: workType,
        }))
    );

    return [...shopParams, ...guideParams];
}

export default async function ShopDetailPage({ params }: Props) {
    const { id, region } = await params;
    const decodedId = decodeURIComponent(id).normalize('NFC');
    const decodedRegionSlug = decodeURIComponent(region).normalize('NFC');

    // ── 업종 가이드 페이지 렌더링 ──
    if (isWorkTypeSlug(decodedId)) {
        const workTypeInfo = WORK_TYPE_INFO[decodedId];
        const regionData = shadowRegionsData.find(r => slugify(r.id) === decodedRegionSlug);
        const regionName = regionData?.mainRegion ?? decodedRegionSlug;
        const regionPayData = getRegionPayData(decodedRegionSlug);

        const faqSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: workTypeInfo.faqs.map(faq => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
        };
        const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: '홈', item: 'https://cocoalba.kr' },
                { '@type': 'ListItem', position: 2, name: `${regionName} 알바`, item: `https://cocoalba.kr/coco/${decodedRegionSlug}` },
                { '@type': 'ListItem', position: 3, name: `${regionName} ${workTypeInfo.name}`, item: `https://cocoalba.kr/coco/${decodedRegionSlug}/${decodedId}` },
            ],
        };

        return (
            <>
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
                <WorkTypeGuidePage
                    regionSlug={decodedRegionSlug}
                    regionName={regionName}
                    workTypeSlug={decodedId}
                    workTypeInfo={workTypeInfo}
                    regionPayData={regionPayData}
                />
            </>
        );
    }

    // ── 광고 상세 페이지 렌더링 ──
    const shop = (shopsData as Shop[]).find((s) => s.id === decodedId);

    if (!shop) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-gray-500">정보가 존재하지 않는 업소입니다.</p>
            </div>
        );
    }

    // [JSON-LD 매핑] 잡포스팅(JobPosting) 스키마에 정화되지 않은 하이엔드 키워드 주입
    const shadowRegionData = shadowRegionsData.find(r => slugify(r.id) === decodedRegionSlug);
    const mainKeyword = shadowRegionData ? shadowRegionData.keywords[0] : '여성알바';

    const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": `${shop.name} - ${mainKeyword} 모집`,
        "description": `${shop.name}에서 ${mainKeyword}를 모집합니다. 최고의 대우와 확실한 수익을 보장합니다.`,
        "hiringOrganization": {
            "@type": "Organization",
            "name": shop.name,
            "sameAs": `https://cocoalba.kr/coco/${slugify(shop.region)}/${shop.id}`
        },
        "employmentType": "FULL_TIME",
        "datePosted": new Date().toISOString().split('T')[0],
        "validThrough": new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": shop.region,
                "addressRegion": "KR",
                "addressCountry": "KR"
            }
        },
        "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": "KRW",
            "value": {
                "@type": "QuantitativeValue",
                "value": shop.pay ? shop.pay.replace(/[^0-9]/g, '') || '50000' : '50000',
                "unitText": shop.payType === '시급' ? 'HOUR' : shop.payType === '일급' ? 'DAY' : 'MONTH'
            }
        }
    };

    return (
        <div className="max-w-[800px] mx-auto min-h-screen bg-white shadow-lg">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <JobDetailContent shop={shop} />
        </div>
    );
}
