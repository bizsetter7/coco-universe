'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';
import { Search, MapPin, Clock, Star, MessageSquare, ShieldAlert } from 'lucide-react';

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

    return (
        <div className={`h-auto min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} ${!hasTalentAccess ? 'overflow-hidden max-h-screen' : ''}`}>

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
                    {MOCK_TALENTS.map((talent, index) => (
                        <div
                            key={index}
                            onClick={() => !hasTalentAccess && setAccessDeniedModal(true)}
                            className={`p-6 rounded-3xl border transition-all hover:shadow-lg cursor-pointer group ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} ${!hasTalentAccess ? 'blur-[8px] opacity-40 select-none' : ''}`}
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
                            <p className="text-sm font-medium mb-4 line-clamp-2 text-gray-500">{talent.intro}</p>

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

                {/* Pagination (Hidden for non-access) */}
                {hasTalentAccess && (
                    <div className="mt-8 text-center">
                        <button className="w-full py-4 rounded-xl font-black text-sm bg-gray-100 text-gray-500 hover:bg-gray-200">
                            더 많은 인재 보기
                        </button>
                    </div>
                )}
            </main>

            {/* 🔒 Access Denied Modal (Portal-ready) */}
            {accessDeniedModal && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center px-4">
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
                </div>
            )}
        </div>
    );
}
