import React from 'react';
import { useBrand } from '../BrandProvider';
import { useRouter } from 'next/navigation';

interface MainBannerProps {
    onAdRegister?: () => void;
}

export const MainBanner = ({ onAdRegister }: MainBannerProps) => {
    const brand = useBrand();
    const router = useRouter();

    const handleClick = () => {
        if (onAdRegister) {
            onAdRegister();
        } else {
            router.push('/customer-center?tab=ad');
        }
    };

    return (
        <div
            onClick={handleClick}
            className="w-full min-h-[260px] aspect-[21/9] md:aspect-[3.2/1] bg-gray-900 sm:rounded-2xl overflow-hidden relative group cursor-pointer shadow-lg mb-0"
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 animate-gradient-x"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold mb-3 animate-bounce">
                    GRAND OPEN
                </span>

                {/* Responsive Title Layout */}
                <h2 className="text-3xl md:text-5xl font-black text-white mb-2 shadow-sm tracking-tight leading-tight">
                    <span className="block md:inline">사장님! 3개월 광고 무료</span>
                    <span className="block md:inline mt-1 md:mt-0 text-yellow-400 md:text-white"> EVENT</span>
                </h2>

                <p className="text-gray-200 font-medium mb-6 text-sm md:text-lg mt-2">
                    지금 가입하면 유료 상품 <span className="text-yellow-400 font-bold">300만원 상당이 0원!</span>
                </p>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                    }}
                    className="px-8 py-3 bg-white text-indigo-900 rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-xl text-sm md:text-base"
                >
                    무료로 광고 올리기
                </button>
            </div>

            {/* Pagination Dots (Lifted up slightly) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-6 h-1.5 bg-white rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            </div>
        </div>
    );
};
