import { MOCK_POSTS } from '@/constants/community';
import CommunityDetailClient from './CommunityDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = MOCK_POSTS.find(p => p.id.toString() === id);

    if (!post) return { title: '게시글을 찾을 수 없습니다 - 코코알바' };

    const title = `${post.title} - 커뮤니티 | 코코알바`;
    const description = `${post.content.slice(0, 100)}... 코코알바 커뮤니티에서 더 많은 이야기를 확인하세요.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://cocoalba.kr/community/${id}`,
            siteName: '코코알바',
            type: 'article',
        }
    };
}

export async function generateStaticParams() {
    return MOCK_POSTS.map((post) => ({
        id: post.id.toString(),
    }));
}

export default async function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <CommunityDetailClient id={id} />;
}
