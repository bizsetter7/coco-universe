import React, { Suspense } from 'react';
import { Metadata } from 'next';
import HomePortalClient from './HomePortalClient';

export const metadata: Metadata = {
  title: '코코알바 - 룸알바·노래방알바·유흥알바 1위 밤알바 사이트',
  description: '코코알바는 전국 노래방알바, 룸알바, 유흥알바, 밤알바 구인구직 정보를 제공하는 1위 플랫폼입니다. 당일지급, 숙식제공 보장 업체 정보를 확인하세요.',
  keywords: ['코코알바', '노래방알바', '룸알바', '유흥알바', '밤알바', '여성알바', '고소득알바'],
  alternates: {
    canonical: 'https://www.cocoalba.kr',
  },
  openGraph: {
    title: '코코알바 - 룸알바·노래방알바·유흥알바 1위 밤알바',
    description: '전국 고소득 여성알바 정보 No.1 코코알바. 당일지급 보장 업체 상시 모집!',
    url: 'https://www.cocoalba.kr',
    siteName: '코코알바',
  },
};

export default function HomePortal() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HomePortalClient />
    </Suspense>
  );
}
