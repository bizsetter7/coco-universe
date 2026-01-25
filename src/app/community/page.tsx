'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    MessageCircle,
    Heart,
    MessageSquare,
    AlertCircle,
    Lock,
    Search,
    PenLine,
    Home,
    ArrowLeft,
    User
} from 'lucide-react';

// --- Types ---
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
    '전체',
    '밤 문화 Talk',
    '같이일할단짝',
    '중고거래',
    '무료법률상담',
    '친구찾기',
    '뷰티·패션·이벤트'
];

const MOCK_POSTS: Post[] = [
    {
        id: 1,
        category: '밤 문화 Talk',
        title: '언니들 오늘 손님 진상 썰 푼다...ㅠㅠ',
        content: '진짜 오늘 역대급이었어.. 들어보실? 상상 그 이상임',
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
        content: '혼자 가기 너무 심심해요 ㅠㅠ 같이 화이팅해요! 텃세 없는 곳임',
        author: '귀요미',
        time: '30분 전',
        likes: 5,
        comments: 2,
    },
    {
        id: 3,
        category: '뷰티·패션·이벤트',
        title: '이번에 새로 나온 립스틱 발색 대박임',
        content: '사진 첨부했어 봐봐.. 이거 진짜 톤 상관없이 다 잘어울릴듯. 강추함!',
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
        content: '도와주세요 변호사님.. 벌써 한 달째에요. 노동청 가야하나?',
        author: '고민녀',
        time: '2시간 전',
        likes: 3,
        comments: 1,
    },
    {
        id: 5,
        category: '중고거래',
        title: '샤넬 립스틱 새거 싸게 팔아요',
        content: '선물 받았는데 제가 안쓰는 색이라서요 ㅠㅠ 연락주세요. 미개봉 새제품!',
        author: '미니멀',
        time: '3시간 전',
        likes: 7,
        comments: 3,
    },
    {
        id: 6,
        category: '친구찾기',
        title: '강남 쪽 술 한잔 하실 분 계신가요?',
        content: '일 끝나고 너무 심심해서요! 건전하게 한잔해요. 소주 한잔 고?',
        author: '술친구',
        time: '4시간 전',
        likes: 9,
        comments: 6,
    },
    {
        id: 7,
        category: '밤 문화 Talk',
        title: '팁으로만 100만원 찍은 썰 ㅋㅋ',
        content: '진짜 운 좋았다 오늘... 에이스 대우 제대로 받음. 노하우 공유해줌?',
        author: '럭키걸',
        time: '5시간 전',
        likes: 45,
        comments: 18,
        isHot: true,
    },
    {
        id: 8,
        category: '무료법률상담',
        title: '퇴직금 정산 문제로 고민입니다',
        content: '이거 노동청 신고해야 하나요? 조언 부탁드려요. 실업급여도 가능한지..',
        author: '직장인A',
        time: '6시간 전',
        likes: 4,
        comments: 2,
    },
    {
        id: 9,
        category: '뷰티·패션·이벤트',
        title: '성형외과 추천 좀 해주세요! 코 수술 예정',
        content: '자연스럽게 잘하는 곳 아시는 분? 리얼 후기 부탁해요. 비주 무너지지 않게!',
        author: '예비여신',
        time: '7시간 전',
        likes: 12,
        comments: 15,
    },
    {
        id: 10,
        category: '중고거래',
        title: '시스템 다이어리 팝니다',
        content: '상태 깨끗해요! 직거래 선호합니다. 작년 연말에 샀어요.',
        author: '정리퀸',
        time: '8시간 전',
        likes: 2,
        comments: 0,
    },
    {
        id: 11,
        category: '밤 문화 Talk',
        title: '가게 옮길까 고민중인 언니들 필독',
        content: '현재 경기도권 시세 정리해준다... 참고해. 낚이지 말고!',
        author: '베테랑',
        time: '9시간 전',
        likes: 31,
        comments: 22,
        isHot: true,
    },
    {
        id: 12,
        category: '친구찾기',
        title: '운동 같이 시작할 언니 구함!',
        content: '필라테스 등록했는데 혼자 다니기 민망해요. 같이 등록해요!',
        author: '운동덕후',
        time: '10시간 전',
        likes: 8,
        comments: 4,
    },
    {
        id: 13,
        category: '같이일할단짝',
        title: '대구 지역 고수익 출장 파트너 급구',
        content: '페이 보장합니다 DM 주세요! 숙식 제공 가능.',
        author: '실장님',
        time: '11시간 전',
        likes: 1,
        comments: 1,
    },
    {
        id: 14,
        category: '밤 문화 Talk',
        title: '[블랙] 강남 ㅇㅇ가게 대기할 때 조심',
        content: '거기 실장 양아치임.. 내 돈 떼먹으려고 함. 조심해 언니들!',
        author: '정의구현',
        time: '12시간 전',
        likes: 88,
        comments: 34,
        isHot: true,
    },
    {
        id: 15,
        category: '무료법률상담',
        title: '성추행 관련 법적 대응 가능한가요?',
        content: '손님이 선을 넘어서요.. 증거 수집 끝났습니다. 형사 고소 절차 알려주세요.',
        author: '강해지자',
        time: '13시간 전',
        likes: 15,
        comments: 8,
    },
];

export default function CommunityPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">데이터를 불러오는 중...</div>}>
            <CommunityContent />
        </Suspense>
    );
}

function CommunityContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('전체');
    const [userType, setUserType] = useState<UserType>('individual');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sync tab with URL param on mount and when params change
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat && CATEGORIES.includes(cat)) {
            setActiveTab(cat);
        }
    }, [searchParams]);

    const filteredPosts = activeTab === '전체'
        ? MOCK_POSTS
        : MOCK_POSTS.filter(post => post.category === activeTab);

    const handlePostClick = (postId: number) => {
        if (userType === 'corporate') {
            setIsModalOpen(true);
        } else {
            router.push(`/community/${postId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 pt-2">
                        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-600">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-black text-pink-500 flex items-center gap-2 tracking-tighter">
                            <MessageCircle className="fill-pink-500" size={24} />
                            그녀들의 수다
                        </h1>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => router.push('/')} className="p-2 text-gray-400 hover:text-gray-600">
                            <Home size={24} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Search size={24} />
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
                    <div className="flex px-4 border-b">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`flex-shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === cat
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

            {/* Admin Tool Toggle */}
            <div className="max-w-4xl mx-auto p-2 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between text-[10px] text-yellow-800">
                <span className="font-bold">👀 [권한 테스트]</span>
                <div className="flex gap-1">
                    <button onClick={() => setUserType('individual')} className={`px-2 py-0.5 rounded ${userType === 'individual' ? 'bg-pink-500 text-white' : 'bg-white border'}`}>개인</button>
                    <button onClick={() => setUserType('corporate')} className={`px-2 py-0.5 rounded ${userType === 'corporate' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>업소</button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-4 space-y-4">
                {/* Post List */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            onClick={() => handlePostClick(post.id)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.99] transition-all cursor-pointer hover:border-pink-200"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {post.category}
                                </span>
                                <span className="text-[10px] text-gray-400">{post.time}</span>
                            </div>

                            <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 text-base">
                                {post.isHot && <span className="text-red-500 mr-1">HOT</span>}
                                {post.title}
                            </h3>

                            <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                                <span className={userType === 'corporate' ? 'blur-[3px] select-none opacity-50' : ''}>
                                    {post.content}
                                </span>
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
                                <span className="flex items-center gap-1">
                                    <User size={12} /> {post.author}
                                </span>
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1 text-pink-400 font-bold">
                                        <Heart size={12} /> {post.likes}
                                    </span>
                                    <span className="flex items-center gap-1 text-blue-400 font-bold">
                                        <MessageSquare size={12} /> {post.comments}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Floating Action Button */}
            {userType !== 'corporate' && (
                <button
                    onClick={() => alert('게시글 작성은 로그인 후 가능합니다!')}
                    className="fixed bottom-24 right-4 bg-pink-500 text-white p-4 rounded-full shadow-xl hover:bg-pink-600 transition-all z-20 scale-110"
                >
                    <PenLine size={24} />
                </button>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-xs p-8 relative z-10 shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4 text-pink-500">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">여성 전용 공간</h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                이곳은 <span className="text-pink-500 font-bold underline underline-offset-4">익명 보장 여성 전용</span> 소통방입니다.<br />
                                <span className="text-xs text-gray-400 mt-2 block">사장님은 구직자들의 솔직한<br />이야기를 엿볼 수 없어요 🤫</span>
                            </p>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
                            >
                                네, 확인했습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
