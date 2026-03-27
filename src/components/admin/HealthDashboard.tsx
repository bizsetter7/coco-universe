'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    XCircle,
    RefreshCw,
    Terminal,
    Database,
    Lock,
    Cpu,
    Server,
    FileText,
    Clock,
    MessageSquare,
    CreditCard,
    Phone,
    MessageCircle,
    Tag,
    ShieldCheck
} from 'lucide-react';

interface HealthStatus {
    timestamp: string;
    overall: 'healthy' | 'warning' | 'error';
    components: {
        [key: string]: {
            status: 'healthy' | 'warning' | 'error' | 'loading';
            message: string;
        }
    }
}

export const HealthDashboard = () => {
    const [status, setStatus] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogId, setShowLogId] = useState<string | null>(null);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/health', { method: 'POST' });
            const data = await res.json();
            setStatus(data);
        } catch (err) {
            console.error('Failed to fetch health status:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
    }, []);

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'healthy': return <CheckCircle2 className="text-emerald-500" size={24} />;
            case 'warning': return <AlertCircle className="text-amber-500" size={24} />;
            case 'error': return <XCircle className="text-rose-500" size={24} />;
            default: return <RefreshCw className="text-slate-300 animate-spin" size={24} />;
        }
    };

    const getStatusBg = (s: string) => {
        switch (s) {
            case 'healthy': return 'bg-emerald-50/50 border-emerald-100';
            case 'warning': return 'bg-amber-50/50 border-amber-100';
            case 'error': return 'bg-rose-50/50 border-rose-100';
            default: return 'bg-slate-50/50 border-slate-100';
        }
    };

    const getComponentIcon = (id: string) => {
        switch (id) {
            case 'supabase': return <Database size={18} />;
            case 'db_points': return <Database size={18} />;
            case 'db_point_logs': return <Database size={18} />;
            case 'db_applications': return <Database size={18} />;
            case 'title_length': return <FileText size={18} />;
            case 'pending_ads': return <Clock size={18} />;
            case 'unanswered_inquiries': return <MessageSquare size={18} />;
            case 'pending_payments': return <CreditCard size={18} />;
            case 'env_sms': return <Phone size={18} />;
            case 'env_kakao': return <MessageCircle size={18} />;
            case 'portone': return <Lock size={18} />;
            case 'standards': return <Tag size={18} />;
            case 'normalization': return <Cpu size={18} />;
            default: return <Activity size={18} />;
        }
    };

    const labelMap: Record<string, string> = {
        supabase: 'Supabase DB 연결',
        db_points: 'DB 스키마 — profiles.points',
        db_point_logs: 'DB 스키마 — point_logs 테이블',
        db_applications: 'DB 스키마 — applications 테이블',
        title_length: '공고 제목 26자 규격',
        pending_ads: '심사 대기 광고 (24h+)',
        unanswered_inquiries: '미답변 문의 (24h+)',
        pending_payments: '결제 미처리 (72h+)',
        env_sms: 'SMS 환경변수 (알리고)',
        env_kakao: '카카오 알림톡 환경변수',
        portone: '포트원 결제 설정',
        standards: '급여 뱃지 표준 (약어·색상)',
        normalization: '데이터 정규화 엔진',
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with Overall Status */}
            <div className={`p-6 md:p-8 rounded-[32px] md:rounded-[40px] border flex flex-col md:flex-row justify-between items-center gap-6 ${status ? getStatusBg(status.overall) : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-4 md:gap-6 text-center md:text-left">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${status?.overall === 'healthy' ? 'bg-emerald-500 text-white' : status?.overall === 'warning' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {loading ? <RefreshCw size={32} className="animate-spin" /> : <Activity size={32} />}
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-950 tracking-tighter italic">SYSTEM CORE HEALTH</h2>
                        <p className="text-[11px] md:text-sm font-bold text-slate-500 mt-1 max-w-[400px]">
                            {loading ? '시스템 각 노드를 정밀 진단하고 있습니다...' :
                                status?.overall === 'healthy' ? '훌륭합니다! 모든 핵심 시스템이 완벽하게 가동 중입니다.' :
                                    status?.overall === 'warning' ? '주의가 필요합니다. 일부 설정값이 누락되었거나 안전 모드로 작동 중입니다.' :
                                        '경고: 치명적인 시스템 오류가 발견되었습니다. 즉시 확인이 필요합니다.'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchHealth}
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-950 text-white rounded-2xl font-black text-xs hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 실시간 재진단
                </button>
            </div>

            {/* Component Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {(status?.components ? Object.entries(status.components) : []).map(([id, comp]: [string, any]) => (
                    <div key={id} className={`p-6 rounded-3xl border transition-all hover:shadow-xl hover:shadow-slate-200/50 ${getStatusBg(comp.status)}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl ${comp.status === 'healthy' ? 'bg-emerald-100 text-emerald-600' : comp.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                {getComponentIcon(id)}
                            </div>
                            {getStatusIcon(comp.status)}
                        </div>
                        <h3 className="text-sm font-black text-slate-950 mb-1">{labelMap[id] || id}</h3>
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-4">{comp.message}</p>

                        <button
                            onClick={() => setShowLogId(showLogId === id ? null : id)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            <Terminal size={12} /> {showLogId === id ? 'HIDE LOG' : 'VIEW DIAGNOSTIC LOG'}
                        </button>

                        {showLogId === id && (
                            <div className="mt-4 p-4 bg-slate-950 rounded-2xl overflow-x-auto shadow-inner">
                                <pre className="text-[10px] text-emerald-400 font-mono leading-tight whitespace-pre-wrap">
                                    {`>>> [${status?.timestamp}] INITIATING_${id.toUpperCase()}_CHECK\n`}
                                    {`>>> [${status?.timestamp}] STATUS: ${comp.status.toUpperCase()}\n`}
                                    {`>>> [${status?.timestamp}] LOG: ${comp.message}\n`}
                                    {`>>> [${status?.timestamp}] DIAGNOSTIC_COMPLETE`}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}

                {loading && !status && [1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse" />
                ))}
            </div>

        </div>
    );
};
