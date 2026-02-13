'use client';

import React from 'react';

/**
 * [SEO v3.0] White-hat Layer: JSON-LD Structured Data
 * 구글 봇에게 사이트의 전문성과 신뢰도를 기술적으로 입증합니다.
 */
export const SEOManager = () => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const mainSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "COCOALBA (코코알바)",
        "url": "https://cocoalba.com",
        "logo": "https://cocoalba.com/logo.png",
        "sameAs": [
            "https://www.facebook.com/cocoalba",
            "https://www.instagram.com/cocoalba"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+82-10-0000-0000",
            "contactType": "customer service",
            "areaServed": "KR",
            "availableLanguage": "Korean"
        }
    };

    const jobPlatformSchema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": "전국 고소득 알바 채용 정보",
        "description": "대한민국 No.1 여성 고소득 알바 플랫폼 코코알바. 여우알바, 퀸알바 보다 빠른 매칭.",
        "identifier": {
            "@type": "PropertyValue",
            "name": "COCOALBA",
            "value": "MAIN_ADS"
        },
        "datePosted": "2026-01-01T00:00:00Z", // Fixed date for stability
        "validThrough": "2027-01-01T00:00:00Z", // Fixed date for stability
        "hiringOrganization": {
            "@type": "Organization",
            "name": "COCOALBA",
            "sameAs": "https://cocoalba.com"
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Seoul",
                "addressRegion": "KR",
                "streetAddress": "Gangnam-gu",
                "postalCode": "06000"
            }
        }
    };

    if (!mounted) return null;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(mainSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPlatformSchema) }}
            />
        </>
    );
};
