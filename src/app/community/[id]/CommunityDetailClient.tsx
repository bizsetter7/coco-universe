'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Home,
    Heart,
    MessageSquare,
    User,
    MoreVertical,
    Share2,
    ShieldCheck
} from 'lucide-react';
import { MOCK_POSTS, MOCK_COMMENTS } from '@/constants/community';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

import { Post, Comment } from '@/types/community';

export default function CommunityDetailClient({ id }: { id: string }) {
    const router = useRouter();
    const postId = parseInt(id);
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                // Fetch Post
                const { data: postData, error: postError } = await supabase
                    .from('community_posts')
                    .select('*')
                    .eq('id', postId)
                    .single();

                if (postData) setPost(postData as Post);
                else {
                    const mock = MOCK_POSTS.find(p => p.id === postId);
                    if (mock) setPost(mock);
                }

                // Fetch Comments
                const { data: commentData } = await supabase
                    .from('community_comments')
                    .select('*')
                    .eq('post_id', postId);

                if (commentData) setComments(commentData as Comment[]);
                else setComments(MOCK_COMMENTS.filter(c => c.postId === postId) as Comment[]);

            } catch (error) {
                console.error('Error fetching detail:', error);
                const mockP = MOCK_POSTS.find(p => p.id === postId);
                if (mockP) setPost(mockP);
                setComments(MOCK_COMMENTS.filter(c => c.postId === postId) as Comment[]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [postId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse font-black text-pink-500">게시글을 불러오는 중...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 font-bold mb-4">존재하지 않는 게시글입니다.</p>
                <button onClick={() => router.back()} className="text-pink-500 font-bold underline">뒤로 가기</button>
            </div>
        );
    }

    return (
        <div className="min-h-0 bg-white pb-20 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <span className="font-black text-lg text-gray-900 truncate max-w-[150px]">{post.category}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => router.push('/')} className="p-2 text-gray-500 hover:text-gray-900">
                            <Home size={22} />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-900">
                            <Share2 size={22} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto pt-6 px-4">
                {/* Post Content */}
                <article className="py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 ring-2 ring-pink-50">
                                <User size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-black text-gray-900">{post.author}</span>
                                    {post.likes > 20 && (
                                        <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                                            <ShieldCheck size={10} /> BEST
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 font-medium">{post.time} · 조회 1.2k</span>
                            </div>
                        </div>
                        <button className="p-2 text-gray-400">
                            <MoreVertical size={20} />
                        </button>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-6 leading-tight">
                        {post.isHot && <span className="text-red-500 mr-2">🔥</span>}
                        {post.title}
                    </h2>

                    <div className="text-gray-700 leading-loose text-lg mb-10 whitespace-pre-wrap break-words">
                        {post.content}
                        <br /><br />
                        진짜 다들 어떻게 생각하세요? 너무 궁금해서 남겨봅니다 ㅠㅠ
                        비슷한 경험 있으신 분들 댓글 좀 달아주세요!
                    </div>

                    <div className="flex items-center gap-6 py-4 px-6 bg-gray-50 rounded-3xl w-fit">
                        <button className="flex items-center gap-2 text-pink-500 font-black hover:scale-110 transition-transform">
                            <Heart size={20} className={post.likes > 10 ? 'fill-pink-500' : ''} />
                            {post.likes}
                        </button>
                        <button className="flex items-center gap-2 text-blue-500 font-black">
                            <MessageSquare size={20} />
                            {post.comments}
                        </button>
                    </div>
                </article>

                {/* Comments Section */}
                <section className="py-8">
                    <h4 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                        댓글 <span className="text-pink-500">{comments.length > 0 ? comments.length : post.comments}</span>
                    </h4>

                    {comments.length > 0 ? (
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1 space-y-1 bg-gray-50/50 p-4 rounded-2xl group-hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-sm text-gray-800">{comment.author}</span>
                                            <span className="text-[10px] text-gray-400">{comment.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-3xl">
                            <p className="text-gray-400 text-sm font-bold">첫 번째 댓글을 남겨보세요! 💬</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Comment Input Sticky */}
            <div className="fixed bottom-0 w-full bg-white border-t p-3 max-w-4xl mx-auto left-0 right-0 z-40">
                <div className="flex gap-3 items-center">
                    <input
                        type="text"
                        placeholder="따뜻한 댓글을 남겨주세요."
                        className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-pink-500 outline-none transition-shadow"
                    />
                    <button className="bg-pink-100 text-pink-600 font-black px-6 py-3.5 rounded-2xl hover:bg-pink-500 hover:text-white transition-all shadow-sm">
                        등록
                    </button>
                </div>
            </div>
        </div>
    );
}
