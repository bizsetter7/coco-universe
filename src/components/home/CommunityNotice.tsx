import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Bell } from 'lucide-react';
import { useBrand } from '../BrandProvider';

export const CommunityNotice = () => {
    const brand = useBrand();
    const router = useRouter();
    const isDark = brand.theme === 'dark';

    // Subtle colored backgrounds for the containers instead of plain white/gray
    const communityContainerStyle = `flex-1 rounded-2xl p-3 md:p-5 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-pink-50/50 border-pink-100'} shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]`;
    const noticeContainerStyle = `flex-1 rounded-2xl p-3 md:p-5 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50/50 border-blue-100'} shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]`;

    const headerStyle = "flex flex-col xl:flex-row items-start xl:items-center justify-between mb-3 md:mb-4 gap-1"; // Adjusted for mobile title wrapping
    const titleStyle = `text-base md:text-lg font-black flex items-center gap-2 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`; // whitespace-nowrap fix
    const listStyle = "flex flex-col gap-2 md:gap-3";
    const itemStyle = `text-[13px] md:text-sm font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-700'}`;
    const iconBoxStyle = (color: string) => `w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-white'} ${color}`;

    return (
        <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 md:mb-12">
            {/* Community Section */}
            <div className={communityContainerStyle} onClick={() => router.push('/community')}>
                <div className={headerStyle}>
                    <h3 className={titleStyle}>
                        <MessageCircle className="text-pink-500 shrink-0" fill="currentColor" size={18} />
                        커뮤니티
                    </h3>
                    <span className="text-[10px] md:text-xs text-gray-400 cursor-pointer hover:text-gray-600 ml-0.5">자유게시판</span>
                </div>
                <div className={listStyle}>
                    {['언니들 오늘 손님 진상 썰 푼다...ㅠㅠ', '강남 지역 같이 출근하실 분 구해요!', '이번에 새로 나온 립스틱 발색 대박임'].map((txt, i) => (
                        <div key={i} className="flex items-center gap-2 md:gap-3">
                            <span className={iconBoxStyle('text-pink-500')}>💭</span>
                            <span className={itemStyle}>{txt}</span>
                        </div>
                    ))}
                </div>
                {/* Decorative Blob */}
                <div className="absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>

            {/* Notice Section */}
            <div className={noticeContainerStyle} onClick={() => router.push('/customer-center?tab=notice')}>
                <div className={headerStyle}>
                    <h3 className={titleStyle}>
                        <Bell className="text-blue-500 shrink-0" fill="currentColor" size={18} />
                        공지사항
                    </h3>
                    <span className="text-[10px] md:text-xs text-gray-400 cursor-pointer hover:text-gray-600 ml-0.5">업데이트</span>
                </div>
                <div className={listStyle}>
                    {[
                        { title: '[중요] 카드 결제 서비스 종료 및 입금 방식 전환 안내', url: '/customer-center?tab=notice', important: true },
                        { title: '[공지] 서비스 전면 개편 및 광고 상품 단가 확정 안내', url: '/customer-center?tab=notice' },
                        { title: 'PC 사이드배너 광고 시스템 정식 도입', url: '/customer-center?tab=notice' }
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 md:gap-3 group cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(item.url);
                            }}
                        >
                            <span className={iconBoxStyle('text-blue-500')}>
                                {item.important ? '🚨' : '📢'}
                            </span>
                            <span className={`${itemStyle} group-hover:underline ${item.important ? 'font-bold text-red-500 dark:text-red-400' : ''}`}>
                                {item.title}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Decorative Blob */}
                <div className="absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
        </div>
    );
};
