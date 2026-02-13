import React from 'react';
import { List } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

export const ClosedAdsView = ({ setView, ads = [], userName = '', onOpenMenu, onShowAdDetail }: { setView: (v: any) => void, ads?: any[], userName?: string, onOpenMenu?: () => void, onShowAdDetail?: (ad: any) => void }) => {
    const brand = useBrand();

    return (
        <div className="space-y-4 md:space-y-6">
            <div className={`relative p-5 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>

                <div className="flex items-center gap-3 md:gap-4 pr-10 md:pr-0">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-600'} `}>
                        <List size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className={`text-lg md:text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>마감된 채용정보</h2>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 md:pt-10">
                {ads.length === 0 ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center">
                        <p className={`text-lg font-black ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-900'}`}>마감된 구인정보가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {ads.map((ad: any) => (
                            <div key={ad.id} className={`${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden relative shadow-sm opacity-75 grayscale-[0.5]`}>
                                <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex flex-wrap gap-3 text-[13px] font-bold text-gray-400 items-center">
                                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-black border border-gray-200">마감됨</span>
                                        <span>마감일 <span className="ml-1 text-gray-500">{ad.deadline || ad.updateDate || '-'}</span></span>
                                    </div>
                                </div>
                                <div className="p-5 md:p-6 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <span className="w-12 shrink-0 text-[11px] font-black text-gray-300 dark:text-gray-600 mt-1 uppercase tracking-tighter">◆ 제목</span>
                                        <h3
                                            onClick={() => onShowAdDetail?.(ad)}
                                            className={`flex-1 font-black text-[16px] md:text-lg leading-snug cursor-pointer hover:text-pink-500 transition ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                                        >
                                            {ad.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
