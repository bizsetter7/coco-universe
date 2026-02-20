'use client';

import { createPortal } from 'react-dom';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';
import { Search, MapPin, Clock, Star, MessageSquare, ShieldAlert, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { updatePoints } from '@/lib/points';
import { supabase } from '@/lib/supabase';

// Mock Data for Talent (Reused from HomeClient or similar)
const MOCK_TALENTS = [
    { name: '김민O', age: '23세', region: '서울 강남구', intro: '성실하고 밝은 성격입니다! 야간 근무 가능해요.', time: '10분 전', tags: ['야간', '서빙'] },
    { name: '이수O', age: '25세', region: '경기 수원시', intro: '경력 1년 있습니다. 바로 출근 가능합니다.', time: '25분 전', tags: ['경력자', '주말'] },
    { name: '박지O', age: '21세', region: '인천 부평구', intro: '초보지만 열심히 배우겠습니다!', time: '1시간 전', tags: ['초보가능', '단기'] },
    { name: '최혜O', age: '24세', region: '서울 서초구', intro: '평일 오후 파트타임 구합니다. 카페 경험 있어요.', time: '2시간 전', tags: ['파트타임', '평일'] },
    { name: '정유O', age: '23세', region: '부산 해운대구', intro: '주말 고정 알바 찾고 있어요. 할말이 많아요.', time: '3시간 전', tags: ['주말', '고정'] },
    { name: '한소O', age: '22세', region: '대구 동구', intro: '밝은 미소로 손님을 맞이하겠습니다.', time: '4시간 전', tags: ['미소', '서비스'] },
    { name: '오영O', age: '26세', region: '서울 마포구', intro: '책임감 있게 일하겠습니다.', time: '5시간 전', tags: ['책임감', '장기'] },
    { name: '강지O', age: '20세', region: '대전 서구', intro: '대학생 알바 구합니다.', time: '6시간 전', tags: ['대학생', '방학'] },
];

export default function TalentPage() {
    const router = useRouter();
    const brand = useBrand();
    const { isLoggedIn, user, userType } = useAuth();
    const [accessDeniedModal, setAccessDeniedModal] = React.useState(false);

    // Pagination Logic
    const [currentPage, setCurrentPage] = React.useState(1);
    const ITEMS_PER_PAGE = 6;
    const totalPages = Math.ceil(MOCK_TALENTS.length / ITEMS_PER_PAGE);

    const currentTalents = MOCK_TALENTS.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // [Business Logic] Talent Info only for Paid Corporate Members or Admin
    // For demo: Admin bypass enabled.
    const hasTalentAccess = userType === 'admin' || (userType === 'corporate' && (user.id === 'admin_shop' || user.points > 100000));

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!hasTalentAccess) {
            setAccessDeniedModal(true);
            return;
        }
        // Proceed with note/proposal logic
        alert('면접 제안을 보냈습니다!');
    };

    // Inside TalentPage component...
    const [isResumeModalOpen, setIsResumeModalOpen] = React.useState(false);
    const [isRegistering, setIsRegistering] = React.useState(false);

    const handleResumeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoggedIn) return alert('로그인이 필요합니다.');

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const age = formData.get('age') as string;
        const region = formData.get('region') as string;
        const intro = formData.get('intro') as string;

        setIsRegistering(true);
        try {
            const { error } = await supabase.from('resumes').insert([{
                user_id: user.id,
                name,
                age,
                region,
                intro,
                tags: []
            }]);

            if (error) throw error;

            // [Gamification] Award points for resume registration
            await updatePoints(user.id as string, 'RESUME_UPLOAD');
            alert('이력서가 성공적으로 등록되었습니다! 5,000포인트가 적립되었습니다. ✨');
            setIsResumeModalOpen(false);
        } catch (err: any) {
            console.error(err);
            alert(`등록 실패: ${err.message}`);
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className={`h-auto min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* Header Title Section */}
            <div className="bg-white border-b border-gray-100 py-6 px-4">
                <div className="container mx-auto max-w-[1020px]">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                        인재(이력서)정보 <span className="text-pink-600 text-sm font-bold bg-pink-50 px-2 py-0.5 rounded-lg">PRO</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-bold mt-1">유료 광고 이용 사장님들께만 제공되는 프리미엄 인재 리스트입니다.</p>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 pb-20 max-w-[1020px]">

                {/* [New] Individual Member - Resume Registration CTA */}
                {userType !== 'corporate' && (
                    <div className="mb-8 p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-xl shadow-purple-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                            <Sparkles size={120} className="text-white" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">
                                    이력서 등록하고 <br className="md:hidden" />
                                    <span className="text-yellow-300">쇼핑 포인트 5,000P </span> 즉시 받기! 🛍️
                                </h2>
                                <p className="text-white/80 text-sm font-bold">
                                    코코알바 파트너 매장에서 현금처럼 사용 가능 (지그재그, 에이블리 제휴 중)
                                </p>
                            </div>
                            <button
                                onClick={() => setIsResumeModalOpen(true)}
                                className="px-8 py-4 bg-white text-purple-700 rounded-2xl font-black text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                내 이력서 등록하기
                            </button>
                        </div>
                    </div>
                )}

                {/* Search & Filter */}
                <div className="mb-8 space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="지역, 키워드로 인재를 찾아보세요"
                            disabled={!hasTalentAccess}
                            className={`w-full py-4 pl-12 pr-4 rounded-2xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-pink-500 outline-none font-bold transition-shadow shadow-sm ${!hasTalentAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {/* Talent List (Blurred for non-access users) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    {currentTalents.map((talent, index) => (
                        <div
                            key={index}
                            onClick={() => !hasTalentAccess && setAccessDeniedModal(true)}
                            className={`p-6 rounded-3xl border transition-all hover:shadow-lg cursor-pointer group ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${brand.theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-pink-50 text-pink-600'}`}>
                                        {talent.name.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h3 className={`font-black text-lg ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {talent.name} <span className="text-sm font-medium text-gray-400 ml-1">({talent.age})</span>
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                            <MapPin size={12} /> {talent.region}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className={`text-sm font-medium mb-4 line-clamp-2 text-gray-500 ${!hasTalentAccess ? 'blur-[5px] select-none opacity-50' : ''}`}>{talent.intro}</p>

                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!hasTalentAccess) setAccessDeniedModal(true);
                                        else alert('면접 제안을 보냈습니다!');
                                    }}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${brand.theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-pink-50 text-pink-600'}`}
                                >
                                    <MessageSquare size={16} />
                                    면접 제안 / 쪽지
                                </button>
                            </div>
                        </div>
                    ))}
                    {!hasTalentAccess && (
                        <div className="absolute inset-0 z-10" onClick={() => setAccessDeniedModal(true)}></div>
                    )}
                </div>


                {/* Pagination */}
                <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border ${brand.theme === 'dark' ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-300'} hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl font-black transition-all ${currentPage === page
                                ? (brand.theme === 'dark' ? 'bg-pink-600 text-white border-pink-600' : 'bg-black text-white border-black')
                                : (brand.theme === 'dark' ? 'border-gray-800 text-gray-400 hover:text-white' : 'border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 border')
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border ${brand.theme === 'dark' ? 'border-gray-800 text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>

            {/* 🔒 Access Denied Modal (Portal-ready) */}
            {accessDeniedModal && createPortal(
                <div className="fixed inset-0 z-[20000] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setAccessDeniedModal(false)}></div>
                    <div className="bg-white rounded-[40px] w-full max-w-sm p-10 relative z-10 shadow-2xl text-center border-white/20">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8 text-blue-500">
                            <ShieldAlert size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-3">인재정보 열람 권한 제한</h3>
                        <p className="text-gray-600 text-sm font-bold leading-relaxed mb-10 break-keep">
                            인재(이력서) 정보 및 면접 제안은<br />
                            <span className="text-blue-600 underline underline-offset-4 decoration-2">유료광고 신청 중인 사장님</span>들만<br />
                            이용하실 수 있는 유료 서비스입니다. 💼
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/my-shop?page=ads')}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200 active:scale-95 transition-transform"
                            >
                                광고 신청하고 권한 얻기
                            </button>
                            <button
                                onClick={() => setAccessDeniedModal(false)}
                                className="w-full py-4 text-gray-400 font-bold text-sm"
                            >
                                다음에 할게요
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* 📝 Resume Registration Modal (Portal) */}
            {isResumeModalOpen && createPortal(
                <div className="fixed inset-0 z-[20001] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsResumeModalOpen(false)}></div>
                    <div className={`relative z-10 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative">
                            <button onClick={() => setIsResumeModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                            <h3 className="text-2xl font-black mb-1">이력서 등록</h3>
                            <p className="text-white/70 text-sm font-bold">5,000포인트를 즉시 적립해 드립니다! ✨</p>
                        </div>

                        <form onSubmit={handleResumeSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">이름</label>
                                    <input
                                        name="name" required placeholder="예: 김코코"
                                        className={`w-full px-5 py-3.5 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">나이</label>
                                    <input
                                        name="age" required placeholder="예: 25세"
                                        className={`w-full px-5 py-3.5 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">활동 가능 지역</label>
                                <input
                                    name="region" required placeholder="예: 서울 강남구 / 서초구"
                                    className={`w-full px-5 py-3.5 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">자기소개 (강점/경력 등)</label>
                                <textarea
                                    name="intro" required placeholder="사장님들께 어필할 수 있는 나만의 매력과 경력을 적어주세요!"
                                    className={`w-full h-32 px-5 py-4 rounded-2xl border font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isRegistering}
                                className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-lg shadow-xl hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isRegistering ? '등록 중...' : '이력서 등록 완료 (5,000P 받기)'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
