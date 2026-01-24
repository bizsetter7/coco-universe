'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    MessageCircle,
    Heart,
    MessageSquare,
    AlertCircle,
    Lock,
    Search,
    PenLine,
    ChevronRight,
    User,
    Briefcase
} from 'lucide-react';

// --- Mock Data & Types ---
type UserType = 'individual' | 'corporate' | 'admin';

interface Post {
    id: number;
    category: string;
    title: string;
    content: string;
    author: string;
    time: string;
    likes: number;
    comments: number;
    isHot?: boolean;
}

const CATEGORIES = [
    '밤 문화 Talk',
    '같이일할단짝',
    '뷰티·패션·이벤트',
    '무료법률상담'
];

const MOCK_POSTS: Post[] = [
    {
        id: 1,
        category: '밤 문화 Talk',
        title: '언니들 오늘 손님 진상 썰 푼다...ㅠㅠ',
        content: '진짜 오늘 역대급이었어.. 들어보실?',
        author: '익명123',
        time: '10분 전',
        likes: 12,
        comments: 5,
        isHot: true,
    },
    {
        id: 2,
        category: '같이일할단짝',
        title: '강남 지역 같이 출근하실 분 구해요!',
        content: '혼자 가기 너무 심심해요 ㅠㅠ',
        author: '귀요미',
        time: '30분 전',
        likes: 5,
        comments: 2,
    },
    {
        id: 3,
        category: '뷰티·패션·이벤트',
        title: '이번에 새로 나온 립스틱 발색 대박임',
        content: '사진 첨부했어 봐봐',
        author: '코덕',
        time: '1시간 전',
        likes: 24,
        comments: 10,
        isHot: true,
    },
    {
        id: 4,
        category: '무료법률상담',
        title: '급여가 계속 밀리는데 어떡하죠?',
        content: '도와주세요 변호사님',
        author: '고민녀',
        time: '2시간 전',
        likes: 3,
        comments: 1,
    },
    {
        id: 5,
        category: '밤 문화 Talk',
        title: '요즘 경기도 어때? 옮길까 고민중',
        content: '서울 너무 빡세다..',
        author: '이동중',
        time: '3시간 전',
        likes: 8,
        comments: 4,
    },
];

export default function CommunityPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('밤 문화 Talk');
    const [userType, setUserType] = useState<UserType>('individual'); // Default to individual for dev
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter posts by active tab
    const filteredPosts = MOCK_POSTS.filter(post => post.category === activeTab);

    const handlePostClick = (postId: number) => {
        if (userType === 'corporate') {
            setIsModalOpen(true);
        } else {
            // Navigate to detail page
            router.push(`/community/${postId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* --- Top Navigation / Header --- */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <h1 className="text-xl font-black text-pink-500 flex items-center gap-2">
                        <MessageCircle className="fill-pink-500" size={24} />
                        그녀들의 수다
                    </h1>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Search size={24} />
                    </button>
                </div>

                {/* Categories (Horizontal Scroll) */}
                <div className="max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
                    <div className="flex px-4 border-b">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors duration-200 whitespace-nowrap ${activeTab === cat
                                    ? 'border-pink-500 text-pink-500'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* --- Dev Tool: User Type Toggle (For Verification) --- */}
            <div className="max-w-4xl mx-auto p-2 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between text-xs text-yellow-800">
                <span className="font-bold">👀 [관리자 모드] 현재 접속 권한:</span>
                <div className="flex gap-1">
                    <button
                        onClick={() => setUserType('individual')}
                        className={`px-2 py-1 rounded ${userType === 'individual' ? 'bg-pink-500 text-white' : 'bg-white border'}`}
                    >
                        개인(구직)
                    </button>
                    <button
                        onClick={() => setUserType('corporate')}
                        className={`px-2 py-1 rounded ${userType === 'corporate' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
                    >
                        업소(구인)
                    </button>
                </div>
            </div>

            {/* --- Main Content --- */}
            <main className="max-w-4xl mx-auto p-4 space-y-4">

                {/* Notice Banner (Optional) */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 flex items-start gap-3">
                    <div className="bg-pink-100 p-2 rounded-full text-pink-500 shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-1">깨끗한 커뮤니티를 만들어주세요!</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            비방, 욕설, 광고성 게시글은 관리자에 의해 삭제될 수 있습니다.
                            {userType === 'corporate' && <span className="block mt-1 text-red-500 font-bold">* 사장님 회원은 게시글 열람이 제한됩니다.</span>}
                        </p>
                    </div>
                </div>

                {/* Post List */}
                <div className="space-y-3">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => handlePostClick(post.id)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {post.category}
                                </span>
                                <span className="text-[10px] text-gray-400">{post.time}</span>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">
                                {post.isHot && <span className="text-red-500 mr-1">HOT</span>}
                                {post.title}
                            </h3>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                                {/* Blur content slightly if corporate user to tease content */}
                                <span className={userType === 'corporate' ? 'blur-[3px] select-none opacity-50' : ''}>
                                    {post.content}
                                </span>
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
                                <span className="flex items-center gap-1">
                                    <User size={12} /> {userType === 'corporate' ? '익명' : post.author}
                                </span>
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1 text-pink-400">
                                        <Heart size={12} /> {post.likes}
                                    </span>
                                    <span className="flex items-center gap-1 text-blue-400">
                                        <MessageSquare size={12} /> {post.comments}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            <p>아직 등록된 게시글이 없어요 🥲</p>
                            <p className="text-sm mt-1">첫 번째 글을 남겨보세요!</p>
                        </div>
                    )}
                </div>
            </main>

            {/* --- Floating Action Button (Write) --- */}
            {userType !== 'corporate' && (
                <button
                    onClick={() => router.push('/community/write')}
                    className="fixed bottom-24 right-4 bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 transition-colors z-20"
                >
                    <PenLine size={24} />
                </button>
            )}

            {/* --- Access Denied Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-xs p-6 relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-500">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-lg font-black text-gray-800 mb-2">접근 제한</h3>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                이곳은 <span className="text-pink-500 font-bold">여성회원(구직자)</span>들만의<br />
                                비밀스러운 소통 공간입니다.<br />
                                <span className="text-xs text-gray-400 mt-2 block">(사장님은 입장하실 수 없어요 🤫)</span>
                            </p>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition"
                            >
                                네, 알겠습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
