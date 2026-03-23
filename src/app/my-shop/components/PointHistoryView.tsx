'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Coins, AlertCircle, ShoppingBag, Zap, CreditCard, MessageSquare, UserPlus, FileText } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

export function PointHistoryView({ userId }: { userId: string }) {
    const brand = useBrand();
    const isDark = brand.theme === 'dark';
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('point_logs')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (!error && data) {
                setLogs(data);
            }
            setLoading(false);
        };
        fetchLogs();
    }, [userId]);

    const getIcon = (reason: string) => {
        switch (reason) {
            case 'JOIN': return <UserPlus size={16} className="text-blue-500" />;
            case 'RESUME_UPLOAD': return <FileText size={16} className="text-purple-500" />;
            case 'COMMUNITY_POST': return <MessageSquare size={16} className="text-green-500" />;
            case 'COMMUNITY_COMMENT': return <MessageSquare size={16} className="text-emerald-500" />;
            case 'SHOP_JUMP': return <Zap size={16} className="text-amber-500" />;
            case 'COUPON_EXCHANGE': return <ShoppingBag size={16} className="text-rose-500" />;
            default: return <CreditCard size={16} className="text-gray-400" />;
        }
    };

    const getReasonLabel = (log: any) => {
        if (log.note && !log.note.startsWith('[COCO]')) return log.note;
        
        switch (log.reason) {
            case 'JOIN': return '회원가입 축하 포인트';
            case 'RESUME_UPLOAD': return '이력서 등록 혜택';
            case 'COMMUNITY_POST': return '커뮤니티 글 작성';
            case 'COMMUNITY_COMMENT': return '커뮤니티 댓글 작성';
            case 'SHOP_JUMP': return '공고 최상단 점프';
            case 'COUPON_EXCHANGE': return '상품권 교환 신청';
            case 'SOS_SEND_SMALL':
            case 'SOS_SEND_MEDIUM':
            case 'SOS_SEND_LARGE':
            case 'SOS_SEND_XLARGE': return 'SOS 긴급구인 발송';
            default: return log.reason || '포인트 변동';
        }
    };

    return (
        <div className={`p-6 md:p-10 rounded-[32px] border shadow-sm ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-blue-50 text-gray-900'}`}>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Coins size={24} />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black">포인트 및 점프 내역</h2>
                    <p className={`text-sm font-bold mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>적립 및 사용된 포인트의 상세 히스토리입니다.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-gray-400 font-bold">내역을 불러오는 중...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                    <AlertCircle size={40} className="text-gray-200 mb-3" />
                    <p className="text-gray-400 font-bold">포인트 이용 내역이 아직 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div key={log.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:shadow-md ${isDark ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-gray-50/50 border-gray-100 hover:border-blue-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
                                    {getIcon(log.reason)}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-black text-[15px]">{getReasonLabel(log)}</h3>
                                    <p className="text-[11px] font-bold text-gray-400">
                                        {new Date(log.created_at).toLocaleString('ko-KR', {
                                            year: 'numeric', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-lg font-black shrink-0 ${log.amount > 0 ? 'text-blue-600' : 'text-rose-500'}`}>
                                {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()} <span className="text-xs">P</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
