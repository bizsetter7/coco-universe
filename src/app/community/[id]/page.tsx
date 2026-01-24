'use client';

import React, { useState } from 'react';
import {
    ArrowLeft,
    MoreVertical,
    Heart,
    MessageSquare,
    Share2,
    Send,
    Home
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

// Mock Data for a single post (In a real app, fetch by ID)
const MOCK_POST_DETAIL = {
    id: 1,
    category: '밤 문화 Talk',
    title: '언니들 오늘 손님 진상 썰 푼다...ㅠㅠ',
    content: `오늘 진짜 역대급 진상을 만났어...\n
아니 들어오자마자 반말은 기본이고, 술 따르라면서 잔을 던지듯이 주는거야.\n
진짜 참다 참다 실장님 불렀는데, 실장님이 잘 처리해주셔서 다행이지\n
안그랬으면 나 진짜 오늘 멘탈 터져서 그만둘 뻔 했어 ㅠㅠ\n
다들 이런 손님 만나면 어떻게 대처해? 꿀팁 좀 공유해줘... 휴`,
    author: '익명123',
    time: '10분 전',
    views: 128,
    likes: 12,
    isLiked: false,
    comments: [
        { id: 1, author: '지나가던언니', content: '헐 진짜 고생했어 ㅠㅠ 맛있는거 먹고 털어버려!', time: '5분 전', likes: 2 },
        { id: 2, author: '멘탈갑', content: '난 그냥 무시하고 웃으면서 영혼없이 대해줌 ㅋㅋ', time: '8분 전', likes: 5 },
    ]
};

export default function PostDetailPage() {
    const router = useRouter();
    const params = useParams(); // Get ID from URL
    const [post, setPost] = useState(MOCK_POST_DETAIL);
    const [commentText, setCommentText] = useState('');

    const handleLike = () => {
        setPost(prev => ({
            ...prev,
            likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
            isLiked: !prev.isLiked
        }));
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = {
            id: Date.now(),
            author: '나(익명)',
            content: commentText,
            time: '방금 전',
            likes: 0
        };

        setPost(prev => ({
            ...prev,
            comments: [...prev.comments, newComment]
        }));
        setCommentText('');
    };

    return (
        <div className="min-h-screen bg-white pb-20">

            {/* Header */}
            <header className="sticky top-0 bg-white border-b z-10 flex items-center justify-between px-4 h-14">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-base font-bold text-gray-800 truncate max-w-[200px] pt-1">{post.category}</h1>
                <div className="flex gap-1">
                    <button onClick={() => router.push('/')} className="p-2 text-gray-400 hover:text-gray-600">
                        <Home size={24} />
                    </button>
                    <button className="p-2 -mr-2 text-gray-400">
                        <MoreVertical size={24} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto">
                <div className="p-5 border-b-8 border-gray-50">
                    {/* Post Info */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold text-xs">
                            익명
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-sm">{post.author}</div>
                            <div className="text-xs text-gray-400 flex gap-2">
                                <span>{post.time}</span>
                                <span>조회 {post.views}</span>
                            </div>
                        </div>
                    </div>

                    {/* Title & Body */}
                    <h2 className="text-xl font-bold text-gray-900 mb-4 leading-snug">{post.title}</h2>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm min-h-[100px] mb-6">
                        {post.content}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${post.isLiked
                                ? 'border-pink-500 text-pink-500 bg-pink-50'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Heart size={16} className={post.isLiked ? 'fill-pink-500' : ''} />
                            공감 {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border border-gray-200 text-gray-500 hover:bg-gray-50">
                            <MessageSquare size={16} />
                            댓글 {post.comments.length}
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        댓글 <span className="text-pink-500">{post.comments.length}</span>
                    </h3>

                    <div className="space-y-6">
                        {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-[10px] shrink-0">
                                    익명
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-gray-700">{comment.author}</span>
                                        <span className="text-[10px] text-gray-400">{comment.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-r-lg rounded-bl-lg">
                                        {comment.content}
                                    </p>
                                    <div className="flex gap-4 mt-1.5 ml-1">
                                        <button className="text-[10px] text-gray-400 font-bold hover:text-gray-600">답글달기</button>
                                        <button className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1">
                                            <Heart size={10} /> {comment.likes > 0 ? comment.likes : '좋아요'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Comment Input Bar (Fixed Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 pb-8 sm:pb-3 max-w-4xl mx-auto">
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                    <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="따뜻한 댓글을 남겨주세요 :)"
                        className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm focus:ring-1 focus:ring-pink-500 outline-none transition-shadow"
                    />
                    <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white shrink-0 disabled:bg-gray-300 transition-colors"
                    >
                        <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
                    </button>
                </form>
            </div>
        </div>
    );
}
