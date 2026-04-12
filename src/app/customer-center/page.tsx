import React from 'react';
import { Metadata } from 'next';
import CustomerCenterClient from './CustomerCenterClient';

export const metadata: Metadata = {
    title: '고객센터 - 코코알바 (공지사항·FAQ·1:1문의)',
    description: '코코알바 고객센터입니다. 공지사항, 자주 묻는 질문(FAQ), 1:1 문의를 통해 궁금한 점을 해결해 드립니다. 룸알바·노래방알바·유흥알바 정보 No.1 코코알바.',
    keywords: ['코코알바고객센터', '밤알바고객센터', '유흥알바문의', '공지사항', 'FAQ', '1:1문의'],
    alternates: {
        canonical: 'https://www.cocoalba.kr/customer-center',
    },
    openGraph: {
        title: '고객센터 - 코코알바',
        description: '도움이 필요하신가요? 코코알바 고객센터에서 친절하게 안내해 드립니다.',
        url: 'https://www.cocoalba.kr/customer-center',
        siteName: '코코알바',
        images: [{ url: 'https://www.cocoalba.kr/og-image.jpg', width: 1200, height: 630 }],
        type: 'website',
    },
};

export default function CustomerCenterPage() {
    return <CustomerCenterClient />;
}
