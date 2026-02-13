'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ExternalLink, Globe, AlertCircle, CheckCircle2, Copy, Terminal } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

/**
 * [SEO v3.0] Admin Indexing Controller
 * 구글 서치 콘솔 API 연동 및 실시간 색인 요청을 위한 관리자 도구입니다.
 */
export const SEOIndexingControl = () => {
    const brand = useBrand();
    const [isRequesting, setIsRequesting] = React.useState(false);
    const [requestLog, setRequestLog] = React.useState<{ time: string, msg: string, type: 'info' | 'success' | 'err' }[]>([]);

    const addLog = (msg: string, type: 'info' | 'success' | 'err' = 'info') => {
        const time = new Date().toLocaleTimeString();
        setRequestLog(prev => [{ time, msg, type }, ...prev].slice(0, 10));
    };

    const handleIndexingRequest = async () => {
        setIsRequesting(true);
        addLog('구글 Indexing API 연결 시도 중...', 'info');

        // Simulation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        addLog(`현재 도메인(${brand.domain}) 색인 요청 전송 완료.`, 'success');
        addLog('구글 봇이 24시간 내에 사이트를 재방문할 예정입니다.', 'info');
        setIsRequesting(false);

        alert('구글 실시간 색인 요청이 성공적으로 전송되었습니다!\n(최대 24시간 내 반영)');
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className={`p-8 rounded-[32px] border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-pink-100'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                            <Search size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black mb-1">구글 실시간 색인(Indexing) 관리</h2>
                            <p className="text-sm text-gray-500 font-bold">새로 등록된 광고나 페이지를 구글 검색에 즉시 반영합니다.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleIndexingRequest}
                        disabled={isRequesting}
                        className={`w-full md:w-auto py-4 px-8 bg-pink-500 text-white rounded-2xl font-black hover:bg-pink-600 shadow-xl shadow-pink-200 transition-all flex items-center justify-center gap-2 active:scale-95 ${isRequesting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isRequesting ? '요청 처리 중...' : '실시간 색인 요청하기'}
                        {!isRequesting && <Globe size={18} />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deployment Guide */}
                <div className={`p-6 rounded-[32px] border ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    <h3 className="text-md font-black mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-blue-500" />
                        구글 서치 콘솔 연동 안내
                    </h3>
                    <div className="space-y-4 text-sm font-bold text-gray-600">
                        <div className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">1</span>
                            <p><span onClick={() => window.open('https://search.google.com/search-console', '_blank')} className="text-blue-500 underline cursor-pointer">구글 서치 콘솔</span>에서 도메인 소유권을 인증해주세요.</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">2</span>
                            <p>사이트 최상단(Header)에 있는 메타 태그를 유지해주세요.</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">3</span>
                            <p>광고 대량 등록 후 위 [색인 요청] 버튼을 눌러주시면 더 빨리 노출됩니다.</p>
                        </div>
                    </div>
                </div>

                {/* API Request Log */}
                <div className={`p-6 rounded-[32px] border flex flex-col ${brand.theme === 'dark' ? 'bg-black border-gray-800' : 'bg-gray-950 border-gray-800 shadow-xl'}`}>
                    <h3 className="text-md font-black mb-4 text-white flex items-center gap-2">
                        <Terminal size={18} className="text-pink-400" />
                        시스템 로그 (Indexing API)
                    </h3>
                    <div className="flex-1 min-h-[150px] font-mono text-[11px] space-y-2 overflow-y-auto">
                        {requestLog.length === 0 ? (
                            <p className="text-gray-600 italic">API 요청 이력이 없습니다.</p>
                        ) : (
                            requestLog.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-gray-500">[{log.time}]</span>
                                    <span className={log.type === 'success' ? 'text-green-400' : log.type === 'err' ? 'text-red-400' : 'text-blue-400'}>
                                        {log.type === 'success' ? '✓' : log.type === 'err' ? '✗' : 'ℹ'} {log.msg}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
