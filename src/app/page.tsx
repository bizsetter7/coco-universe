import React, { Suspense } from 'react';
import { Metadata } from 'next';
import HomePortalClient from './HomePortalClient';

export const metadata: Metadata = {
  title: '룸알바·유흥룸알바·노래빠알바·여자유흥알바 1위 코코알바',
  description: '코코알바는 전국 유흥룸알바, 룸알바, 노래빠알바, 여자유흥알바, 여자노래빠알바, 여자노래방알바 구인구직 1위 플랫폼입니다. 당일지급·숙식제공 보장 업체를 지금 바로 확인하세요.',
  keywords: [
    '코코알바', '룸알바', '유흥룸알바', '유흥알바', '노래빠알바', '노래방알바',
    '여자유흥알바', '여자노래빠알바', '여자노래방알바', '밤알바', '여성알바',
    '고소득알바', '당일지급알바', '텐프로', '쩜오알바', '바알바',
  ],
  alternates: {
    canonical: 'https://www.cocoalba.kr',
  },
  openGraph: {
    title: '룸알바·유흥룸알바·노래빠알바·여자유흥알바 1위 코코알바',
    description: '전국 유흥룸알바·여자노래빠알바·여자유흥알바 구인정보 No.1 코코알바. 당일지급 보장!',
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
