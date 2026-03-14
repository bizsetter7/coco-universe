import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Bell } from 'lucide-react';
import { useBrand } from '../BrandProvider';
import { MOCK_POSTS } from '@/constants/community';

export const CommunityNotice = () => {
    const brand = useBrand();
    const router = useRouter();
    const isDark = brand.theme === 'dark';

    // Top 3 posts for preview
    const recentPosts = MOCK_POSTS.slice(0, 3);

    // [New] Category to Icon Mapper
    const getCategoryIcon = (category: string) => {
        if (category.includes('수다') || category.includes('썰')) return '🗣️';
        if (category.includes('밤 문화')) return '🌙';
        if (category.includes('뷰티')) return '💄';
        if (category.includes('라운지')) return '💎';
        if (category.includes('단짝')) return '👯‍♀️';
        if (category.includes('중고')) return '📦';
        if (category.includes('법률')) return '⚖️';
        if (category.includes('수입')) return '💰';
        return '✨';
    };

    // Style tokens
    const communityContainerStyle = `flex-1 rounded-2xl p-3 md:p-5 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50/50 border-blue-100'} shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]`;
    const noticeContainerStyle = `flex-1 rounded-2xl p-3 md:p-5 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50/50 border-blue-100'} shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]`;

    const headerStyle = "flex flex-col xl:flex-row items-start xl:items-center justify-between mb-3 md:mb-4 gap-1";
    const titleStyle = `text-base md:text-lg font-black flex items-center gap-2 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`;
    const listStyle = "flex flex-col gap-2 md:gap-3";
    const itemStyle = `text-[13px] md:text-sm font-medium truncate ${isDark ? 'text-gray-400' : 'text-gray-700'}`;
    const iconBoxStyle = (color: string) => `w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-700' : 'bg-white'} ${color}`;

    return (
        <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 md:mb-12">
            {/* Community Section */}
            <div className={communityContainerStyle} onClick={() => router.push('/community')}>
                <div className={headerStyle}>
                    <h3 className={titleStyle}>
                        <MessageCircle className="text-blue-500 shrink-0" fill="currentColor" size={18} />
                        커뮤니티
                    </h3>
                    <span className="text-[10px] md:text-xs text-gray-400 cursor-pointer hover:text-gray-600 ml-0.5">자유게시판</span>
                </div>
                <div className={listStyle}>
                    {recentPosts.map((post) => (
                        <div key={post.id} className="flex items-center gap-2 md:gap-3 group">
                            <span className={iconBoxStyle('text-blue-500')}>{getCategoryIcon(post.category)}</span>
                            <span className={`${itemStyle} group-hover:text-blue-600 transition-colors`}>{post.title}</span>
                        </div>
                    ))}
                </div>
                <div className="absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
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
                <div className="absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
        </div>
    );
};
