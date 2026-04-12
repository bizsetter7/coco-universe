import React from 'react';
import { Metadata } from 'next';
import TalentClient from './TalentClient';

export const metadata: Metadata = {
    title: '인재정보(이력서) - 1위 여성알바 코코알바 (룸알바·노래방알바·유흥알바)',
    description: '전국 고소득 여성알바 인재 정보. 룸알바, 노래방알바, 유흥알바 구직자들의 이력서를 확인하고 면접 제안을 보내세요. 당일지급 보장 업체 전용 서비스.',
    keywords: ['인재정보', '이력서조회', '여성알바구직', '유흥알바인재', '밤알바구직', '룸알바인재', '코코알바'],
    alternates: {
        canonical: 'https://www.cocoalba.kr/talent',
    },
    openGraph: {
        title: '인재정보(이력서) - 코코알바',
        description: '실시간 여성알바 인재 리스트. 사장님을 위한 맞춤형 인력 관리 서비스.',
        url: 'https://www.cocoalba.kr/talent',
        siteName: '코코알바',
        images: [{ url: 'https://www.cocoalba.kr/og-image.jpg', width: 1200, height: 630 }],
        type: 'website',
    },
};

export default function TalentPage() {
    return <TalentClient />;
}
