import React from 'react';
import { supabase } from '@/lib/supabase';

interface AdminPaymentManagementProps {
    payments: any[];
    fetchData: () => void;
}

export function AdminPaymentManagement({ payments, fetchData }: AdminPaymentManagementProps) {

    const handlePaymentConfirm = async (paymentId: string, shopId: string) => {
        if (!confirm('입금을 확인하셨습니까? 승인 시 광고가 즉시 게시될 수 있습니다.')) return;

        try {
            // 1. Payment Status Change
            const { error: payError } = await supabase
                .from('payments')
                .update({ status: 'completed', updated_at: new Date().toISOString() })
                .eq('id', paymentId);

            if (payError) throw payError;

            // 2. Shop Status Change (Optional)
            if (shopId) {
                const { error: shopError } = await supabase
                    .from('shops')
                    .update({
                        status: 'active',
                        approved_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', shopId);

                if (shopError) console.error("Ad auto-approval failed:", shopError);
            }

            alert('결제 승인 및 광고 게시 처리가 완료되었습니다.');
            fetchData(); // Refresh
        } catch (err) {
            console.error('Payment confirmation error:', err);
            alert('오류가 발생했습니다.');
        }
    };

    const formatPrice = (priceInWon: number) => {
        if (priceInWon >= 10000) {
            return `${Math.floor(priceInWon / 10000)}만원`;
        }
        return `${priceInWon.toLocaleString()}원`;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-2">
                <h3 className="text-2xl font-black text-slate-950 tracking-tighter">결제 내역 관리 (Finance)</h3>
                <p className="text-sm text-slate-400 font-bold mt-1">
                    모든 결제 요청을 확인하고 승인 처리합니다.
                </p>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">결제정보</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">요청자</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">금액/유형</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">상태</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">일시</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">승인</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? (
                            payments.map((pay) => (
                                <tr key={pay.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="text-sm font-black text-slate-900">{pay.metadata?.adTitle || pay.description || '광고 결제'}</div>
                                        <div className="text-[10px] text-slate-400 font-bold">Ref: {pay.id.substring(0, 8)}</div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="text-[11px] font-black text-slate-700">{pay.profiles?.full_name || pay.depositor_name || '-'}</div>
                                        <div className="text-[10px] text-slate-400">{pay.profiles?.nickname || '-'}</div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="text-sm font-black text-slate-900 tabular-nums">{formatPrice(pay.amount)}</div>
                                        <div className="text-[9px] text-slate-500">{pay.method || '무통장입금'}</div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${pay.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {pay.status === 'completed' ? '결제완료' : '입금대기'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="text-[11px] font-bold text-slate-500">{new Date(pay.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        {pay.status !== 'completed' && (
                                            <button
                                                onClick={() => handlePaymentConfirm(pay.id, pay.shop_id)}
                                                className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black hover:bg-blue-700 transition"
                                            >
                                                승인하기
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center text-slate-400 text-xs font-bold">
                                    결제 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
