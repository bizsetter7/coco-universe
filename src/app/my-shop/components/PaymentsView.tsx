import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

export const PaymentsView = ({ setView, payments = [], userName = '', onShowAdDetail, onOpenMenu }: { setView: (v: any) => void, payments?: any[], userName?: string, onShowAdDetail?: (adId: any) => void, onOpenMenu?: () => void }) => {
    const brand = useBrand();

    return (
        <div className="space-y-3 md:space-y-6">
            <div className={`relative p-3 md:p-6 rounded-[20px] md:rounded-[32px] shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} `}>

                <div className="flex items-center gap-4 pr-10 md:pr-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-green-600'} `}>
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 md:inline block">결제 내역</h2>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                    <div className="flex items-center gap-2 mb-6">
                        <ArrowRight size={14} className="text-pink-500 shrink-0" />
                        <span className={`font-black text-sm ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>유료 결제 내역 (최신순)</span>
                    </div>

                    {payments.length === 0 ? (
                        <div className={`min-h-[200px] flex flex-col items-center justify-center border rounded-[24px] ${brand.theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-100'}`}>
                            <CreditCard size={40} className="text-gray-200 mb-3" />
                            <p className="text-gray-400 font-bold">결제 내역이 아직 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            {/* PC View (Table) */}
                            <div className="hidden md:block overflow-hidden rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm transition hover:shadow-md">
                                <table className="w-full text-center border-collapse text-[13px]">
                                    <thead className={`${brand.theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-50 text-gray-500'} font-black border-b border-gray-100 dark:border-gray-800 whitespace-nowrap`}>
                                        <tr>
                                            <th className="py-4 px-2">번호</th>
                                            <th className="py-4 px-2 text-left">구매 항목</th>
                                            <th className="py-4 px-2">결제 금액</th>
                                            <th className="py-4 px-2">결제 방식</th>
                                            <th className="py-4 px-2">닉네임</th>
                                            <th className="py-4 px-2">결제일</th>
                                            <th className="py-4 px-2">상태</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {payments.map((p: any) => (
                                            <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition">
                                                <td className="py-5 px-2 font-mono text-gray-400 text-[11px]">{p.id}</td>
                                                <td className="py-5 px-2">
                                                    <div className="flex flex-col gap-1.5 text-left">
                                                        <div className="flex flex-wrap gap-1">
                                                            <span className="bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm shrink-0">
                                                                {p.type?.includes('p') ? p.type.toUpperCase() : 'VIP'}
                                                            </span>
                                                            {p.options?.icon && <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm">아이콘</span>}
                                                            {p.options?.highlighter && <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm">형광펜</span>}
                                                            {p.options?.border && <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black shadow-sm">테두리</span>}
                                                        </div>
                                                        <span
                                                            onClick={() => onShowAdDetail?.(p.id)}
                                                            className={`font-black text-[14px] hover:text-pink-500 cursor-pointer transition line-clamp-1 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                                        >
                                                            {p.desc}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-2 font-black text-pink-500">{p.price}</td>
                                                <td className="py-5 px-2 text-[11px] font-bold text-gray-400">{p.method}</td>
                                                <td className="py-5 px-2 font-black">{p.nickname || userName}</td>
                                                <td className="py-5 px-2 text-[11px] text-gray-400 font-mono leading-tight">
                                                    <div className="flex flex-col">
                                                        <span>{p.date.split(' ').slice(0, 3).join(' ')}</span>
                                                        <span className="text-[10px] opacity-70">{p.date.split(' ').slice(3).join(' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="py-5 px-2">
                                                    <span className={`px-2 py-1 text-white text-[10px] font-black rounded-lg ${p.status === '결제완료' ? 'bg-green-500' : 'bg-orange-500'} shadow-sm`}>
                                                        {p.status || '대기'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View (Cards) */}
                            <div className="md:hidden space-y-4">
                                {payments.map((p: any) => (
                                    <div key={p.id} className={`${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border rounded-[24px] p-5 shadow-sm space-y-4`}>
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap gap-1">
                                                    <span className={`${brand.theme === 'dark' ? 'bg-pink-500' : 'bg-gray-900'} text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black uppercase`}>
                                                        {p.type?.includes('p') ? p.type.toUpperCase() : 'AD'}
                                                    </span>
                                                    {p.options?.icon && <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-black">아이콘</span>}
                                                </div>
                                                <h3
                                                    onClick={() => onShowAdDetail?.(p.id)}
                                                    className={`text-[15px] font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} active:text-pink-500`}
                                                >
                                                    {p.desc}
                                                </h3>
                                            </div>
                                            <span className={`shrink-0 px-2 py-1 text-white text-[10px] font-black rounded-lg ${p.status === '결제완료' ? 'bg-green-500' : 'bg-orange-500'}`}>
                                                {p.status || '대기'}
                                            </span>
                                        </div>

                                        <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl ${brand.theme === 'dark' ? 'bg-black/20 text-gray-400' : 'bg-gray-50 text-gray-500'} text-[11px] font-bold`}>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-gray-400">결제일시</p>
                                                <p className={`${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} leading-tight`}>
                                                    {p.date.split(' ').slice(0, 3).join(' ')}<br />
                                                    <span className="text-[10px] text-gray-400">{p.date.split(' ').slice(3).join(' ')}</span>
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-gray-400">결제 금액</p>
                                                <p className={`text-sm font-black ${brand.theme === 'dark' ? 'text-white' : 'text-pink-600'}`}>{p.price}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-gray-400">결제 방식</p>
                                                <p className={`text-sm font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{p.method}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-gray-400">결제 번호</p>
                                                <p className="font-mono">#{p.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center items-center gap-1 mt-10">
                                <button className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] ${brand.theme === 'dark' ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>&lt;</button>
                                <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-[11px] font-black shadow-lg shadow-pink-500/30">1</span>
                                <button className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] ${brand.theme === 'dark' ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>&gt;</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
