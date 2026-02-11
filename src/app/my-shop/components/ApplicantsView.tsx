import React from 'react';
import { User } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

export const ApplicantsView = ({ setView, userName = '', onOpenMenu }: { setView: (v: any) => void, userName?: string, onOpenMenu?: () => void }) => {
    const brand = useBrand();
    return (
        <div className="space-y-4 md:space-y-6">
            <div className={`relative p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>

                <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-blue-600'} `}>
                        <User size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h2 className={`text-lg md:text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>온라인 지원자 관리</h2>
                </div>
            </div>

            <div className="space-y-6">
                <div className={`p-12 rounded-2xl border text-center ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    <p className="text-gray-400 font-bold">지원 현항이 없습니다.</p>
                </div>
            </div>
        </div>
    );
};
