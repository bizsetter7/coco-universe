import React from 'react';
import { Metadata } from 'next';
import shopsData from '@/lib/data/shops.json';
import JobClient from './JobClient';

// Constant from page.tsx
const JOB_TYPES = ['룸알바', '노래주점', '텐프로/쩜오', '요정', '바(Bar)', '엔터', '다방', '카페', '마사지', '기타'];

export const metadata: Metadata = {
    title: '업종별 채용 - 1위 여성알바 코코알바',
    description: '원하는 업종별로 쉽고 빠르게 채용 공고를 찾아보세요. 룸알바, 노래방알바, 바(Bar) 등 다양한 직종의 고소득 알바 정보.',
    keywords: '업종별알바, 여성알바, 룸알바, 노래방알바, 밤알바, 고소득알바',
};

export default function JobPage() {
    // Pass raw shops data to client for filtering
    const shops = shopsData as any[];

    return <JobClient shops={shops} jobTypes={JOB_TYPES} />;
}
