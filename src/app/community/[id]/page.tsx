import React from 'react';
import { MOCK_POSTS } from '@/constants/community';
import CommunityDetailClient from './CommunityDetailClient';

export async function generateStaticParams() {
    return MOCK_POSTS.map((post) => ({
        id: post.id.toString(),
    }));
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <CommunityDetailClient id={id} />;
}
