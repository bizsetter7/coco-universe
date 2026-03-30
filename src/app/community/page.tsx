
import React from 'react';
import { Metadata } from 'next';
import CommunityContent from './CommunityContent';

export const metadata: Metadata = {
    title: '커뮤니티 & 후기 - 코코알바 (여우/퀸/지역별 인재 솔루션 솔직 썰)',
    description: '언니들의 솔직한 알바 후기와 꿀팁, 고민상담. 익명 보장, 100% 리얼 후기.',
    openGraph: {
        title: '커뮤니티 & 후기 - 코코알바',
        description: '언니들의 솔직한 알바 후기와 꿀팁, 고민상담. 익명 보장, 100% 리얼 후기.',
        url: 'https://cocoalba.kr/community',
        siteName: '코코알바',
        type: 'website',
    },
};

export default function CommunityPage() {
    return <CommunityContent />;
}
