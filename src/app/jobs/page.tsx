import React from 'react';
import { Metadata } from 'next';
import shopsData from '@/lib/data/shops.json';
import JobClient from './JobClient';
import { Shop } from '@/types/shop';

export const metadata: Metadata = {
    title: '업종별 채용 - 1위 여성알바 코코알바',
    description: '원하는 업종별로 쉽고 빠르게 채용 공고를 찾아보세요. 프라이빗 매칭, 노래방알바, 바(Bar) 등 다양한 직종의 엔터프라이즈 알바 정보.',
    keywords: '업종별알바, 여성알바, 프라이빗 매칭, 노래방알바, 엔터프라이즈 인재 솔루션, 엔터프라이즈알바',
};

export default function JobPage() {
    const shops: Shop[] = shopsData as Shop[];
    return <JobClient shops={shops} />;
}
