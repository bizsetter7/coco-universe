'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { useBrand } from '@/components/BrandProvider';
import { ArrowLeft, Home, Search, MapPin, Clock, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

    return (
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md dark:bg-gray-900/80 dark:border-gray-800 transition-all duration-300">
                <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <span className="text-lg md:text-xl font-black tracking-tight text-gray-900 dark:text-white">
                            인재정보
                        </span>
                    </div>

                    <button onClick={() => router.push('/')} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <Home size={24} />
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 pb-20 max-w-[1020px]">
                {/* Search & Filter */}
                <div className="mb-8 space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="지역, 키워드로 인재를 찾아보세요"
                            className={`w-full py-4 pl-12 pr-4 rounded-2xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-pink-500 outline-none font-bold transition-shadow shadow-sm`}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주'].map((region, i) => (
                            <button key={i} className={`px-4 py-2 rounded-full text-sm font-black whitespace-nowrap transition-colors ${i === 0 ? 'bg-pink-600 text-white shadow-md shadow-pink-200' : (brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-500 border border-gray-200')}`}>
                                {region}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Talent List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_TALENTS.map((talent, index) => (
                        <div key={index} className={`p-6 rounded-3xl border transition-all hover:shadow-lg cursor-pointer group ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-pink-900' : 'bg-white border-gray-100 hover:border-pink-100'}`}>
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
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${brand.theme === 'dark' ? 'bg-gray-900 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                                    {talent.time}
                                </span>
                            </div>

                            <p className={`text-sm font-medium mb-4 line-clamp-2 ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {talent.intro}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {talent.tags.map((tag, i) => (
                                    <span key={i} className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${brand.theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'}`}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination / Load More */}
                <div className="mt-8 text-center">
                    <button className={`w-full py-4 rounded-xl font-black text-sm transition-colors ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        더 많은 인재 보기
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
}
