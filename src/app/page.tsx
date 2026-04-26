import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import HomePortalClient from './HomePortalClient';
import { WORK_TYPE_SLUGS, WORK_TYPE_INFO } from '@/lib/data/work-type-guide';

// 홈 내부 링크에 노출할 대표 지역 (검색량 상위)
const HOME_GUIDE_REGIONS = [
  { slug: '서울', name: '서울' },
  { slug: '인천', name: '인천' },
  { slug: '수원', name: '수원' },
  { slug: '부산', name: '부산' },
  { slug: '대전', name: '대전' },
  { slug: '대구', name: '대구' },
  { slug: '광주', name: '광주' },
  { slug: '유성', name: '유성' },
];

export const metadata: Metadata = {
  title: '룸알바·유흥알바·밤알바·여자알바 1위 코코알바',
  description: '코코알바는 전국 유흥알바, 룸알바, 밤알바, 노래방알바, 여자알바, 당일지급알바 구인구직 1위 플랫폼입니다. 20대·30대·미씨 환영, 당일지급·숙식제공 보장 업체를 지금 바로 확인하세요.',
  keywords: [
    '코코알바', '룸알바', '유흥알바', '밤알바', '여자알바', '여성알바',
    '노래빠알바', '노래방알바', '당일지급알바', '단기알바', '주말알바', '평일알바',
    '20대여자알바', '30대여자알바', '미씨알바', '대학생알바', '여우알바',
    '텐프로', '쩜오알바', '바알바', '마사지', '고소득알바', '당일알바',
    '서울밤알바', '인천유흥알바', '수원룸알바', '부산밤알바', '대전유흥알바',
  ],
  alternates: {
    canonical: 'https://www.cocoalba.kr',
  },
  openGraph: {
    title: '룸알바·유흥알바·밤알바·여자알바 1위 코코알바',
    description: '전국 유흥알바·밤알바·여자알바·당일지급 구인정보 No.1 코코알바. 20대·30대·미씨 환영!',
    url: 'https://www.cocoalba.kr',
    siteName: '코코알바',
  },
};

export default function HomePortal() {
  return (
    <>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <HomePortalClient />
      </Suspense>

      {/* ── 지역×업종 가이드 내부 링크 (서버사이드 — 구글봇 크롤 경로 확보) ── */}
      <nav aria-label="지역별 업종 가이드" className="sr-only">
        <h2 className="text-sm font-bold text-gray-400 mb-4">📍 지역별 알바 가이드</h2>
        <div className="space-y-3">
          {HOME_GUIDE_REGIONS.map(({ slug, name }) => (
            <div key={slug}>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">{name}</p>
              <div className="flex flex-wrap gap-1.5">
                {WORK_TYPE_SLUGS.map((workType) => (
                  <Link
                    key={workType}
                    href={`/coco/${encodeURIComponent(slug)}/${workType}`}
                    className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-[11px] text-gray-500 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                  >
                    {name} {WORK_TYPE_INFO[workType].name.replace(/\s*\(.*\)$/, '')}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
