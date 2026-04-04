'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Activity, CheckCircle2, AlertCircle, XCircle, RefreshCw,
    Terminal, Database, Lock, Cpu, Server, FileText, Clock,
    MessageSquare, CreditCard, Phone, MessageCircle, Tag,
    ShieldCheck, Zap, Bug, BarChart2, Eye, EyeOff, Wifi,
    AlertTriangle, MousePointerClick, TrendingUp, Package, Layout
} from 'lucide-react';

// ── 타입 ──────────────────────────────────────────────────────────────────────
type Severity = 'healthy' | 'warning' | 'error' | 'loading';

interface ComponentResult {
    status: Severity;
    message: string;
    count?: number;
}

interface HealthStatus {
    timestamp: string;
    overall: 'healthy' | 'warning' | 'error';
    issueCount: number;
    components: Record<string, ComponentResult>;
}

interface ErrorLog {
    id: string;
    created_at: string;
    tier: string;
    error_type: string;
    severity: string;
    path: string;
    message: string;
    user_id: string | null;
    meta: Record<string, any> | null;
    resolved: boolean;
}

interface PerfStat {
    path: string;
    avg_lcp: number;
    avg_fid: number;
    avg_cls: number;
    count: number;
}

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────
const getStatusIcon = (s: string, size = 20) => {
    switch (s) {
        case 'healthy': return <CheckCircle2 className="text-emerald-500 shrink-0" size={size} />;
        case 'warning': return <AlertCircle className="text-amber-500 shrink-0" size={size} />;
        case 'error':   return <XCircle className="text-rose-500 shrink-0" size={size} />;
        default:        return <RefreshCw className="text-slate-300 animate-spin shrink-0" size={size} />;
    }
};

const getStatusBg = (s: string) => {
    switch (s) {
        case 'healthy': return 'bg-emerald-50/60 border-emerald-100';
        case 'warning': return 'bg-amber-50/60 border-amber-100';
        case 'error':   return 'bg-rose-50/60 border-rose-100';
        default:        return 'bg-slate-50/60 border-slate-100';
    }
};

const getSeverityColor = (s: string) => {
    switch (s) {
        case 'critical': return 'text-rose-600 bg-rose-50 border-rose-200';
        case 'error':    return 'text-rose-500 bg-rose-50 border-rose-100';
        case 'warning':  return 'text-amber-600 bg-amber-50 border-amber-200';
        default:         return 'text-slate-500 bg-slate-50 border-slate-200';
    }
};

const componentIcon = (id: string) => {
    const map: Record<string, React.ReactNode> = {
        supabase: <Database size={16} />, db_points: <Database size={16} />,
        db_point_logs: <Database size={16} />, db_applications: <Database size={16} />,
        db_messages: <MessageSquare size={16} />, db_resumes: <FileText size={16} />,
        db_contact_email: <Package size={16} />,
        title_length: <FileText size={16} />, pending_ads: <Clock size={16} />,
        unanswered_inquiries: <MessageSquare size={16} />, pending_payments: <CreditCard size={16} />,
        env_sms: <Phone size={16} />, env_kakao: <MessageCircle size={16} />,
        portone: <Lock size={16} />, standards: <Tag size={16} />,
        normalization: <Cpu size={16} />, negative_points: <AlertTriangle size={16} />,
        orphaned_shops: <Bug size={16} />, stale_active_ads: <Clock size={16} />,
        payment_ad_mismatch: <CreditCard size={16} />, point_log_integrity: <BarChart2 size={16} />,
        duplicate_username: <AlertTriangle size={16} />, jump_abuse: <Zap size={16} />,
        message_orphans: <MessageCircle size={16} />, application_orphans: <FileText size={16} />,
        new_join_no_points: <AlertTriangle size={16} />, admin_role_sync: <ShieldCheck size={16} />,
        active_without_approval: <AlertTriangle size={16} />, sitemap_accessible: <Wifi size={16} />,
        z_index_standard: <Layout size={16} />,
    };
    return map[id] || <Activity size={16} />;
};

const labelMap: Record<string, string> = {
    supabase: 'Supabase DB 연결', db_points: 'DB — profiles.points',
    db_point_logs: 'DB — point_logs', db_applications: 'DB — applications',
    db_messages: 'DB — messages', db_resumes: 'DB — resumes',
    db_contact_email: 'DB — contact_email 컬럼',
    title_length: '공고 제목 26자 규격', pending_ads: '심사 대기 광고 (24h+)',
    unanswered_inquiries: '미답변 문의 (24h+)', pending_payments: '결제 미처리 (72h+)',
    env_sms: 'SMS 환경변수', env_kakao: '카카오 알림톡', portone: '포트원 결제',
    standards: '급여 뱃지 표준', normalization: '정규화 엔진',
    negative_points: '포인트 음수 회원', orphaned_shops: '고아 공고',
    stale_active_ads: '만료일 지난 활성 공고', payment_ad_mismatch: '결제↔공고 상태 불일치',
    point_log_integrity: '포인트 로그 무결성', duplicate_username: '중복 username',
    jump_abuse: '점프 남용 탐지', message_orphans: '수신자 없는 쪽지',
    application_orphans: '삭제 공고에 달린 지원서', new_join_no_points: '가입 포인트 미적립',
    admin_role_sync: '어드민 권한 동기화', active_without_approval: '무승인 활성 공고',
    sitemap_accessible: '사이트맵 접근성',
    z_index_standard: 'z-index 계층 표준',
};

// 체크 항목 카테고리 분류
const CATEGORY_MAP: Record<string, string[]> = {
    'DB 스키마': ['supabase', 'db_points', 'db_point_logs', 'db_applications', 'db_messages', 'db_resumes', 'db_contact_email'],
    '운영 현황': ['pending_ads', 'unanswered_inquiries', 'pending_payments'],
    '데이터 무결성': ['negative_points', 'orphaned_shops', 'stale_active_ads', 'payment_ad_mismatch', 'point_log_integrity', 'duplicate_username', 'jump_abuse', 'message_orphans', 'application_orphans', 'new_join_no_points'],
    '보안': ['admin_role_sync', 'active_without_approval'],
    '표준 검증': ['title_length', 'standards', 'normalization', 'sitemap_accessible', 'z_index_standard'],
    '환경변수': ['env_sms', 'env_kakao', 'portone'],
};

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────
type TabId = 'health' | 'errors' | 'performance';

export const HealthDashboard = () => {
    const [activeTab, setActiveTab] = useState<TabId>('health');
    const [status, setStatus] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastChecked, setLastChecked] = useState<Date | null>(null);
    const [showLogId, setShowLogId] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // 에러 로그
    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
    const [errorLoading, setErrorLoading] = useState(false);
    const [errorFilter, setErrorFilter] = useState<'all' | 'unresolved'>('unresolved');

    // 성능 통계
    const [perfStats, setPerfStats] = useState<PerfStat[]>([]);
    const [perfLoading, setPerfLoading] = useState(false);

    // 세션 토큰 캐시 (매 요청마다 getSession 호출 최소화)
    const tokenRef = useRef<string | null>(null);

    /** Supabase 세션 토큰 반환 — mock 세션이면 null (쿠키로 통과) */
    const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
        try {
            if (!tokenRef.current) {
                const { data } = await supabase.auth.getSession();
                tokenRef.current = data.session?.access_token || null;
            }
        } catch { /* ignore */ }
        return tokenRef.current
            ? { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenRef.current}` }
            : { 'Content-Type': 'application/json' };
    }, []);

    // ── 헬스체크 ────────────────────────────────────────────────────────────
    const fetchHealth = useCallback(async () => {
        setLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/admin/health', { method: 'POST', headers });
            const data = await res.json();
            setStatus(data);
            setLastChecked(new Date());
        } catch (err) {
            console.error('Health fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    // 5분마다 자동 갱신
    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchHealth, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchHealth]);

    // ── 에러 로그 조회 ───────────────────────────────────────────────────────
    const fetchErrors = useCallback(async () => {
        setErrorLoading(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch('/api/monitor/errors', { headers });
            const data = await res.json();
            setErrorLogs(data.logs || []);
        } catch { setErrorLogs([]); } finally { setErrorLoading(false); }
    }, [getAuthHeaders]);

    // ── 성능 통계 조회 ───────────────────────────────────────────────────────
    const fetchPerf = useCallback(async () => {
        setPerfLoading(true);
        try {
            const res = await fetch('/api/monitor/vitals');
            const data = await res.json();
            setPerfStats(data.stats || []);
        } catch { setPerfStats([]); } finally { setPerfLoading(false); }
    }, []);

    useEffect(() => {
        if (activeTab === 'errors') fetchErrors();
        if (activeTab === 'performance') fetchPerf();
    }, [activeTab, fetchErrors, fetchPerf]);

    // ── 에러 해결 처리 ───────────────────────────────────────────────────────
    const resolveError = async (id: string) => {
        try {
            const headers = await getAuthHeaders();
            await fetch('/api/monitor/errors', { method: 'PATCH', body: JSON.stringify({ id }), headers });
            setErrorLogs(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
        } catch { /* ignore */ }
    };

    // ── 헬스 요약 계산 ───────────────────────────────────────────────────────
    const errorCount = status ? Object.values(status.components).filter(c => c.status === 'error').length : 0;
    const warningCount = status ? Object.values(status.components).filter(c => c.status === 'warning').length : 0;
    const totalChecks = status ? Object.keys(status.components).length : 0;
    const healthyCount = totalChecks - errorCount - warningCount;
    const unresolvedErrors = errorLogs.filter(e => !e.resolved).length;

    // ── 탭 메뉴 ─────────────────────────────────────────────────────────────
    const tabs: { id: TabId; label: string; badge?: number }[] = [
        { id: 'health', label: '🛡️ DB·규칙 감시', badge: errorCount + warningCount },
        { id: 'errors', label: '🔴 실시간 에러', badge: unresolvedErrors },
        { id: 'performance', label: '⚡ 성능 지표' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── 전체 상태 헤더 ── */}
            <div className={`p-5 md:p-7 rounded-[28px] border flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all ${status ? getStatusBg(status.overall) : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg ${status?.overall === 'healthy' ? 'bg-emerald-500' : status?.overall === 'warning' ? 'bg-amber-500' : 'bg-rose-500'} text-white`}>
                        {loading ? <RefreshCw size={28} className="animate-spin" /> : <Activity size={28} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h2 className="text-lg md:text-xl font-black text-slate-950 tracking-tight">SYSTEM CORE HEALTH</h2>
                            {autoRefresh && <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">AUTO 5MIN</span>}
                        </div>
                        <p className="text-xs font-bold text-slate-500">
                            {loading ? '진단 중...' : status?.overall === 'healthy' ? '✅ 모든 시스템 정상' : status?.overall === 'warning' ? `⚠️ 주의 ${warningCount}건` : `🔴 에러 ${errorCount}건`}
                            {lastChecked && !loading && <span className="text-slate-400 ml-2">· {lastChecked.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* 요약 뱃지 */}
                    <div className="flex gap-2 mr-2">
                        <div className="text-center px-3 py-1.5 bg-emerald-100 rounded-xl">
                            <div className="text-lg font-black text-emerald-700">{healthyCount}</div>
                            <div className="text-[9px] font-black text-emerald-500">정상</div>
                        </div>
                        <div className="text-center px-3 py-1.5 bg-amber-100 rounded-xl">
                            <div className="text-lg font-black text-amber-700">{warningCount}</div>
                            <div className="text-[9px] font-black text-amber-500">경고</div>
                        </div>
                        <div className="text-center px-3 py-1.5 bg-rose-100 rounded-xl">
                            <div className="text-lg font-black text-rose-700">{errorCount}</div>
                            <div className="text-[9px] font-black text-rose-500">오류</div>
                        </div>
                    </div>

                    <button onClick={() => setAutoRefresh(v => !v)}
                        className={`p-2.5 rounded-xl border text-xs font-black transition-all ${autoRefresh ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                        title={autoRefresh ? '자동갱신 ON' : '자동갱신 OFF'}>
                        {autoRefresh ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={fetchHealth} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-white rounded-xl font-black text-xs hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-lg">
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> 재진단
                    </button>
                </div>
            </div>

            {/* ── 탭 네비게이션 ── */}
            <div className="flex gap-2 border-b border-slate-100 pb-0">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`relative px-4 py-2.5 text-xs font-black rounded-t-xl transition-all ${activeTab === tab.id ? 'bg-slate-950 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>
                        {tab.label}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black flex items-center justify-center ${activeTab === tab.id ? 'bg-rose-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── 탭 1: DB·규칙 감시 ── */}
            {activeTab === 'health' && (
                <div className="space-y-6">
                    {Object.entries(CATEGORY_MAP).map(([category, keys]) => {
                        const items = keys
                            .filter(k => status?.components[k])
                            .map(k => ({ id: k, ...status!.components[k] }));
                        if (items.length === 0 && !loading) return null;

                        const catError = items.filter(i => i.status === 'error').length;
                        const catWarn = items.filter(i => i.status === 'warning').length;

                        return (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-3">
                                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{category}</h3>
                                    {catError > 0 && <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full">{catError} 오류</span>}
                                    {catWarn > 0 && <span className="text-[9px] font-black text-amber-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">{catWarn} 경고</span>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {loading && !status ? (
                                        keys.slice(0, 2).map(k => <div key={k} className="h-20 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />)
                                    ) : (
                                        items.map(item => (
                                            <div key={item.id} className={`p-4 rounded-2xl border transition-all hover:shadow-md ${getStatusBg(item.status)}`}>
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg ${item.status === 'healthy' ? 'bg-emerald-100 text-emerald-600' : item.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                                            {componentIcon(item.id)}
                                                        </div>
                                                        <span className="text-xs font-black text-slate-800">{labelMap[item.id] || item.id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {item.count !== undefined && item.count > 0 && (
                                                            <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">{item.count}건</span>
                                                        )}
                                                        {getStatusIcon(item.status, 18)}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{item.message}</p>
                                                <button onClick={() => setShowLogId(showLogId === item.id ? null : item.id)}
                                                    className="mt-2 flex items-center gap-1 text-[9px] font-black text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-widest">
                                                    <Terminal size={10} /> {showLogId === item.id ? 'CLOSE LOG' : 'DIAG LOG'}
                                                </button>
                                                {showLogId === item.id && (
                                                    <div className="mt-2 p-3 bg-slate-950 rounded-xl overflow-x-auto">
                                                        <pre className="text-[9px] text-emerald-400 font-mono leading-tight whitespace-pre-wrap">
                                                            {`[${status?.timestamp}] CHECK: ${item.id.toUpperCase()}\n[${status?.timestamp}] STATUS: ${item.status.toUpperCase()}\n[${status?.timestamp}] MSG: ${item.message}`}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── 탭 2: 실시간 에러 ── */}
            {activeTab === 'errors' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {(['all', 'unresolved'] as const).map(f => (
                                <button key={f} onClick={() => setErrorFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all ${errorFilter === f ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    {f === 'all' ? '전체' : '미해결'}
                                </button>
                            ))}
                        </div>
                        <button onClick={fetchErrors} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-200 transition-all">
                            <RefreshCw size={11} className={errorLoading ? 'animate-spin' : ''} /> 새로고침
                        </button>
                    </div>

                    {errorLoading ? (
                        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />)}</div>
                    ) : errorLogs.length === 0 ? (
                        <div className="text-center py-16">
                            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                            <p className="font-black text-slate-400 text-sm">수집된 에러 없음</p>
                            <p className="text-xs text-slate-400 mt-1">프론트엔드 감시 훅이 활성화되면 여기에 실시간으로 표시됩니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {errorLogs
                                .filter(e => errorFilter === 'all' || !e.resolved)
                                .map(log => (
                                    <div key={log.id} className={`p-4 rounded-2xl border transition-all ${log.resolved ? 'opacity-40 bg-slate-50 border-slate-100' : getSeverityColor(log.severity)}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-2 flex-1 min-w-0">
                                                <div className="shrink-0 mt-0.5">
                                                    {log.severity === 'critical' || log.severity === 'error'
                                                        ? <XCircle size={16} className="text-rose-500" />
                                                        : <AlertCircle size={16} className="text-amber-500" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{log.error_type}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold">{log.path}</span>
                                                        {log.user_id && <span className="text-[9px] font-bold text-blue-500">user:{log.user_id.slice(0,8)}</span>}
                                                    </div>
                                                    <p className="text-[11px] font-bold text-slate-700 break-words">{log.message}</p>
                                                    {log.meta && Object.keys(log.meta).length > 0 && (
                                                        <p className="text-[10px] text-slate-400 mt-1 font-mono">{JSON.stringify(log.meta)}</p>
                                                    )}
                                                    <p className="text-[9px] text-slate-400 mt-1">{new Date(log.created_at).toLocaleString('ko-KR')}</p>
                                                </div>
                                            </div>
                                            {!log.resolved && (
                                                <button onClick={() => resolveError(log.id)}
                                                    className="shrink-0 px-2 py-1 text-[9px] font-black bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all">
                                                    해결
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── 탭 3: 성능 지표 ── */}
            {activeTab === 'performance' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'LCP', desc: '최대 콘텐츠 표시', good: 2500, unit: 'ms', key: 'avg_lcp' },
                            { label: 'FID', desc: '첫 입력 지연', good: 100, unit: 'ms', key: 'avg_fid' },
                            { label: 'CLS', desc: '레이아웃 이동', good: 0.1, unit: '', key: 'avg_cls' },
                        ].map(metric => {
                            const avg = perfStats.length > 0
                                ? perfStats.reduce((s, p) => s + ((p as any)[metric.key] || 0), 0) / perfStats.length
                                : null;
                            const isGood = avg !== null && avg <= metric.good;
                            return (
                                <div key={metric.key} className={`p-4 rounded-2xl border text-center ${avg === null ? 'bg-slate-50 border-slate-100' : isGood ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                    <div className={`text-xl md:text-2xl font-black mb-1 ${avg === null ? 'text-slate-300' : isGood ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {avg === null ? '—' : metric.key === 'avg_cls' ? avg.toFixed(3) : Math.round(avg)}{metric.unit}
                                    </div>
                                    <div className="text-[10px] font-black text-slate-600">{metric.label}</div>
                                    <div className="text-[9px] text-slate-400">{metric.desc}</div>
                                    <div className="text-[9px] text-slate-400 mt-0.5">권장: {metric.key === 'avg_cls' ? `< ${metric.good}` : `< ${metric.good}${metric.unit}`}</div>
                                </div>
                            );
                        })}
                    </div>

                    {perfLoading ? (
                        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />)}</div>
                    ) : perfStats.length === 0 ? (
                        <div className="text-center py-12">
                            <TrendingUp size={36} className="text-slate-300 mx-auto mb-3" />
                            <p className="font-black text-slate-400 text-sm">수집된 성능 데이터 없음</p>
                            <p className="text-xs text-slate-400 mt-1">실회원이 페이지를 방문하면 자동으로 측정됩니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">페이지별 LCP</h4>
                            {[...perfStats].sort((a, b) => b.avg_lcp - a.avg_lcp).map(stat => (
                                <div key={stat.path} className={`flex items-center gap-3 p-3 rounded-xl border ${stat.avg_lcp > 2500 ? 'bg-rose-50 border-rose-100' : stat.avg_lcp > 1800 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-bold text-slate-700 truncate block">{stat.path}</span>
                                        <span className="text-[9px] text-slate-400">{stat.count}회 측정</span>
                                    </div>
                                    <div className={`text-sm font-black ${stat.avg_lcp > 2500 ? 'text-rose-600' : stat.avg_lcp > 1800 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {Math.round(stat.avg_lcp)}ms
                                    </div>
                                    {getStatusIcon(stat.avg_lcp > 2500 ? 'error' : stat.avg_lcp > 1800 ? 'warning' : 'healthy', 16)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
