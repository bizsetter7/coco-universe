import React from 'react';
import { Metadata } from 'next';
import shopsData from '@/lib/data/shops.json';
import JobClient from './JobClient';
import { Shop } from '@/types/shop';

// The JOB_TYPES constant is not used in this file or passed to JobClient, so it is removed.

export const metadata: Metadata = {
    title: '업종별 채용 - 1위 여성알바 코코알바',
    description: '원하는 업종별로 쉽고 빠르게 채용 공고를 찾아보세요. 룸알바, 노래방알바, 바(Bar) 등 다양한 직종의 고소득 알바 정보.',
    keywords: '업종별알바, 여성알바, 룸알바, 노래방알바, 밤알바, 고소득알바',
};

export default function JobPage() {
    // Assuming 'shops' is defined elsewhere or will be fetched.
    // For now, using shopsData as a placeholder if it's meant to be used directly.
    // If shopsData is not meant to be used here, then the JobClient component would need to fetch its own data.
    // Based on the original code, shopsData is imported but not used.
    // The instruction does not specify how 'shops' should be obtained, only to remove 'jobTypes'.
    // Let's assume 'shops' is meant to be passed from shopsData for now to keep the component functional.
    const shops: Shop[] = shopsData as Shop[]; // Type assertion for shopsData
    return <JobClient shops={shops} />;
}
