import React from 'react';
import { Metadata } from 'next';
import GuideClient from './GuideClient';

export const metadata: Metadata = {
    title: '이용가이드 - 코코알바 (룸알바·노래방알바·유흥알바 초보 가이드)',
    description: '여성알바 구인구직 1위 코코알바 이용 방법. 룸알바, 노래방알바, 유흥알바를 안전하고 현명하게 구하는 팁과 고객센터 이용 안내.',
    keywords: ['코코알바가이드', '유흥알바가이드', '밤알바꿀팁', '초보알바가이드', '노래방알바팁', '룸알바팁'],
    alternates: {
        canonical: 'https://www.cocoalba.kr/guide',
    },
    openGraph: {
        title: '이용가이드 - 코코알바',
        description: '여성알바 성공을 위한 첫걸음, 코코알바 이용 가이드를 확인해보세요.',
        url: 'https://www.cocoalba.kr/guide',
        siteName: '코코알바',
        images: [{ url: 'https://www.cocoalba.kr/og-image.jpg', width: 1200, height: 630 }],
        type: 'website',
    },
};

export default function GuidePage() {
    return <GuideClient />;
}
