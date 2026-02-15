'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Home,
    Heart,
    MessageSquare,
    User,
    MoreVertical,
    Share2,
    ShieldCheck,
    Lock,
    Trash2,
    Edit,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import { MOCK_POSTS, MOCK_COMMENTS } from '@/constants/community';
import { supabase } from '@/lib/supabase';
import { Post, Comment } from '@/types/community';
import { createPortal } from 'react-dom';

export default function CommunityDetailClient({ id }: { id: string }) {
    const router = useRouter();
    const postId = parseInt(id);
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // [Edit/Delete Actions]
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
    const [password, setPassword] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
                    // Fallback to mock only if explicitly enabled or dev env? 
                    // Keeping mock behavior for now as per existing codebase
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

    const handlePasswordAction = async () => {
        if (!password) return alert('비밀번호를 입력해주세요.');
        setIsActionLoading(true);

        try {
            if (actionType === 'delete') {
                // Call RPC for secure delete
                const { data, error } = await supabase.rpc('delete_post_with_password', {
                    p_id: postId,
                    p_password: password
                });

                if (error) throw error;
                if (data === true) {
                    alert('게시글이 삭제되었습니다.');
                    router.push('/community');
                } else {
                    alert('비밀번호가 일치하지 않거나 삭제 권한이 없습니다.');
                }
            } else if (actionType === 'edit') {
                // Edit flow is complex (needs move to write page with data). 
                // For now, let's verify password first then redirect?
                // Or simply redirect to /write?mode=edit&id=... and ask password there?
                // Better: Verify here, then redirect with a short-lived token or simply pass state?
                // Simplest for now: Just alert feature implementation or basic check.
                // User requirement: "Need password for modify".
                // Let's implement Delete first as it's destructive. Edit might redirect.
                alert('게시글 수정 기능은 준비 중입니다. (삭제 후 다시 작성해주세요)');
            }
        } catch (err: any) {
            console.error(err);
            alert(`오류 발생: ${err.message}`);
        } finally {
            setIsActionLoading(false);
            setPassword('');
            setActionType(null); // Close modal
        }
    };

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
                <p className="text-gray-500 font-bold mb-4">존재하지 않는 게시글이거나 비밀글입니다.</p>
                <button onClick={() => router.back()} className="text-pink-500 font-bold underline">뒤로 가기</button>
            </div>
        );
    }

    return (
        <div className="min-h-0 bg-white pb-20 font-sans relative">
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
                <article className="py-6 border-b border-gray-100 relative">
                    {/* Secret Badge */}
                    {post.is_secret && (
                        <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                            <Lock size={10} /> 비밀글
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 ring-2 ring-pink-50">
                                <User size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-black text-gray-900">{post.author_nickname || post.author}</span>
                                    {post.likes > 20 && (
                                        <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
                                            <ShieldCheck size={10} /> BEST
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 font-medium">{post.created_at?.substring(0, 10) || post.time} · 조회 1.2k</span>
                            </div>
                        </div>

                        {/* Action Menu Trigger */}
                        <div className="relative">
                            <button
                                onClick={() => setShowActionMenu(!showActionMenu)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {/* Dropdown Menu */}
                            {showActionMenu && (
                                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        onClick={() => { setActionType('edit'); setShowActionMenu(false); }}
                                        className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Edit size={14} /> 수정하기
                                    </button>
                                    <button
                                        onClick={() => { setActionType('delete'); setShowActionMenu(false); }}
                                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> 삭제하기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-6 leading-tight">
                        {post.isHot && <span className="text-red-500 mr-2">🔥</span>}
                        {post.title}
                    </h2>

                    <div className="text-gray-700 leading-loose text-lg mb-10 whitespace-pre-wrap break-words">
                        {post.content}
                    </div>

                    <div className="flex items-center gap-6 py-4 px-6 bg-gray-50 rounded-3xl w-fit">
                        <button className="flex items-center gap-2 text-pink-500 font-black hover:scale-110 transition-transform">
                            <Heart size={20} className={post.likes > 10 ? 'fill-pink-500' : ''} />
                            {post.likes || 0}
                        </button>
                        <button className="flex items-center gap-2 text-blue-500 font-black">
                            <MessageSquare size={20} />
                            {post.comments || comments.length}
                        </button>
                    </div>
                </article>

                {/* Comments Section */}
                <section className="py-8">
                    <h4 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                        댓글 <span className="text-pink-500">{comments.length}</span>
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
                                            <span className="text-[10px] text-gray-400">{comment.created_at || comment.time}</span>
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

            {/* Password Verification Modal */}
            {actionType && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActionType(null)}></div>
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-black mb-2 text-gray-900">
                            {actionType === 'delete' ? '게시글 삭제' : '게시글 수정'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            게시글 작성 시 설정한 비밀번호를 입력해주세요.
                        </p>

                        <div className="relative mb-6">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 transition-colors"
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setActionType(null)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handlePasswordAction}
                                disabled={isActionLoading}
                                className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors shadow-lg ${actionType === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-pink-500 hover:bg-pink-600 shadow-pink-200'}`}
                            >
                                {isActionLoading ? '확인 중...' : '확인'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
