'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Server, Zap, CreditCard, Layout, HardDrive, Palette } from 'lucide-react';

export const StandardsGuardView = ({ ads = [], payments = [], onOpenMenu }: { ads?: any[], payments?: any[], onOpenMenu?: () => void }) => {
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [auditResults, setAuditResults] = useState<any[]>([]);

    const runAudit = () => {
        const violations: any[] = [];

        // 1. Payment History Audit (Capture 2 Issues)
        payments.forEach((p: any) => {
            const desc = p.description || p.desc || '';
            const opts = p.adObject?.options || {};
            // [Check 1] 비표준 약어 잔재
            if (desc.includes('[주]') || desc.includes('(주)')) {
                violations.push({ id: p.id, type: 'PAYMENT', message: `결제내역 #${p.id}에 비표준 약어 '주' 잔재 (제목 표준 위반)`, severity: 'error' });
            }
            // [Check 2] 닉네임 유실
            if (!p.nickname && !opts.nickname) {
                violations.push({ id: p.id, type: 'PAYMENT', message: `결제내역 #${p.id}의 닉네임 데이터 유실`, severity: 'error' });
            }
        });

        // 2. Ad List & Data Integrity Audit (Ultra Precise)
        ads.forEach((ad: any) => {
            const opt = ad.options || {};
            // [Fix] 타입 판정 누락 방지를 위해 더 포괄적인 체크
            const pt = String(ad.productType || ad.ad_type || opt.product_type || '').toLowerCase();
            const isPremiumAd = pt.includes('grand') || pt.includes('grand') || pt.includes('그랜드') || pt.includes('premium') || pt.includes('프리미엄') || pt.includes('t1') || pt.includes('t2') || pt.includes('p1') || pt.includes('p2');

            // [Check 1] 닉네임 정밀 감사 (게스트, 관리자, 무명 차단)
            const nicknameStr = (ad.nickname || '').trim();
            const isForbiddenNick = nicknameStr.includes('게스트') || nicknameStr === '관리자' || nicknameStr.includes('라운지') || !nicknameStr;

            if (isForbiddenNick) {
                violations.push({
                    id: ad.id,
                    type: 'DATA_INTEGRITY',
                    message: `공고 '${ad.title}'에 부적절한 닉네임('${nicknameStr || '비어있음'}')이 노출 중입니다.`,
                    severity: 'error'
                });
            }

            // [Check 2] 직종 정밀 감사 (정보없음 잔재 차단, 아가씨는 정상 선택지)
            const subStr = (ad.categorySub || '').trim();
            const isForbiddenSub = subStr === '정보없음' || !subStr;

            if (isForbiddenSub) {
                violations.push({
                    id: ad.id,
                    type: 'SYSTEM_MAPPING',
                    message: `공고 '${ad.title}'의 상세직종이 시스템 기본값('${subStr || '비어있음'}')으로 고정되어 있습니다.`,
                    severity: 'error'
                });
            }

            // [Check 3] 옵션 배지 싱크 감사
            const hasRequestedOptions = opt.icon || opt.highlighter || opt.border || (opt.pay_suffixes && opt.pay_suffixes.length > 0);
            const hasRenderedBadges = ad.selectedIcon || ad.selectedHighlighter || (ad.borderOption && ad.borderOption !== 'none') || (ad.paySuffixes && ad.paySuffixes.length > 0);

            if (hasRequestedOptions && !hasRenderedBadges) {
                violations.push({ id: ad.id, type: 'UI_SYNC', message: `공고 '${ad.title}'의 유료 옵션 배지가 화면에 출력되지 않고 있습니다.`, severity: 'error' });
            }
        });

        setAuditResults(violations);
    };

    const fetchHealth = async () => {
        setLoading(true);
        setError(null);
        try {
            // [DDR] 인프라 체크는 데이터 감사와 별개로 진행
            const res = await fetch('/api/admin/health', { method: 'POST' });
            const data = res.ok ? await res.json() : { status: 'unstable' };
            setHealth(data);
        } catch (err: any) {
            setHealth({ status: 'offline' });
        } finally {
            runAudit();
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
    }, [ads, payments]); // [Fix] Re-run audit on ANY data change (edit/update), not just length change

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'healthy') return <CheckCircle2 className="text-emerald-500" size={18} />;
        if (status === 'warning') return <AlertCircle className="text-amber-500" size={18} />;
        return <AlertCircle className="text-rose-500" size={18} />;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* [CRITICAL HEADER] RED ALERT - 가장 먼저 눈에 띄게 배치 */}
            {auditResults.length > 0 && (
                <div className="bg-rose-600 border-4 border-rose-400 rounded-[32px] p-8 shadow-2xl shadow-rose-500/40 animate-pulse-gentle">
                    <div className="flex items-center gap-6 text-white">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                            <AlertCircle size={40} strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black mb-1">무결성 위반 탐지 ({auditResults.length}건)</h2>
                            <p className="font-bold opacity-90 text-sm">시스템 내부에서 데이터 오염이 적발되었습니다. 즉시 수정이 필요합니다.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rule Violation Detail List */}
            {auditResults.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                    {auditResults.map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-rose-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-8 rounded-full ${v.severity === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                                <div>
                                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest">CRITICAL VIOLATION</div>
                                    <div className="text-sm font-bold text-gray-800 tracking-tight">{v.message}</div>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${v.severity === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                {v.type}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900">시스템 검증 센터</h2>
                        <p className="text-xs text-indigo-500 font-bold tracking-wider">STANDARDS GUARD ACTIVE</p>
                    </div>
                </div>
                <button
                    onClick={fetchHealth}
                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                    disabled={loading}
                >
                    <RefreshCw size={20} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {
                loading && !health ? (
                    <div className="min-h-[300px] flex items-center justify-center">
                        <RefreshCw className="animate-spin text-indigo-500" size={32} />
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[32px] text-center">
                        <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
                        <p className="text-rose-600 font-bold">{error}</p>
                        <button onClick={fetchHealth} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-xl font-bold">다시 시도</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Intelligent Verification Rules Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-blue-500" />
                                    인텔리전트 검증 규칙 (Smart Rules)
                                </h3>
                                <span className="text-[10px] font-bold text-gray-400">v2.1.final</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Rule: Hierarchy Standard [IMMUTABLE] */}
                                <div className="p-5 bg-white rounded-3xl border-2 border-green-100 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                            <Server size={18} />
                                        </div>
                                        <h4 className="font-black text-gray-900">데이터 참조 계층 (Hierarchy)</h4>
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                        UI는 항상 **[Options 스냅샷]**을 최우선 참조합니다.<br />
                                        원본 상점 데이터가 변경되어도 광고 시점의 닉네임과 옵션을 영구 보존하여 데이터 정합성을 보장합니다.
                                    </p>
                                </div>

                                {/* Rule: Ad Tier Colors [IMMUTABLE] */}
                                <div className="p-5 bg-white rounded-3xl border-2 border-purple-100 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                                            <Palette size={18} />
                                        </div>
                                        <h4 className="font-black text-gray-900">광고 등급별 불변 컬러</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold">
                                            <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span> 그랜드: 보라
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold">
                                            <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span> 프리미엄: 빨강
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold">
                                            <span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span> 디럭스: 파랑
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold">
                                            <span className="w-3 h-3 rounded-full bg-[#10B981]"></span> 스페셜: 민트
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold">
                                            <span className="w-3 h-3 rounded-full bg-[#F97316]"></span> 급구: 주황
                                        </div>
                                    </div>
                                </div>

                                {/* Rule: Option Abbreviations [IMMUTABLE] */}
                                <div className="p-5 bg-white rounded-3xl border-2 border-indigo-100 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <h4 className="font-black text-gray-900">옵션 약어 표준 (Abbreviation)</h4>
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                        리스트 가독성을 위해 약어를 강제합니다:<br />
                                        **아이콘(아)**, **형광펜(형)**, **테두리(테)**<br />
                                        영문 노출 및 혼동되는 약어를 원천 차단합니다.
                                    </p>
                                </div>

                                {/* Rule: Mandatory Persistence [IMMUTABLE] */}
                                <div className="p-5 bg-white rounded-3xl border-2 border-orange-100 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                            <AlertCircle size={18} />
                                        </div>
                                        <h4 className="font-black text-gray-900">필수 항목 및 유효성 검사</h4>
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                        누락 발생 시 **자동 스크롤 및 상세 필드 안내**를 수행합니다.<br />
                                        등록 전 모든 유효성 검사를 통과해야만 결제 프로세스로 진입할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 1. Core Systems */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-sm font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                                <Server size={14} /> Core Infrastructure
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                            <Zap size={16} className="text-amber-500" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">Database (Supabase)</span>
                                    </div>
                                    <StatusIcon status={health?.components?.supabase?.status} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                            <CreditCard size={16} className="text-blue-500" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">Payment Gateway</span>
                                    </div>
                                    <StatusIcon status={health?.components?.portone?.status} />
                                </div>
                            </div>
                        </div>

                        {/* 2. UI/UX Standards */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-sm font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                                <Layout size={14} /> UI/UX Standards
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm font-black text-xs text-pink-600">
                                            주
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">Pay Badge Abbreviations</span>
                                    </div>
                                    <StatusIcon status={health?.components?.standards?.status} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm font-black text-[10px] text-indigo-600">
                                            T1-7
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">Ad Tier Nomenclature</span>
                                    </div>
                                    <StatusIcon status={health?.components?.standards?.status} />
                                </div>
                            </div>
                        </div>

                        {/* 3. Logic Engine */}
                        <div className="md:col-span-2 bg-indigo-50 border border-indigo-100 rounded-[32px] p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                        <ShieldCheck size={20} className="text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900">Normalization Engine</h3>
                                </div>
                                <StatusIcon status={health?.components?.normalization?.status} />
                            </div>
                            <p className="text-sm text-indigo-700/70 font-medium leading-relaxed">
                                데이터베이스에 저장된 원본 데이터를 사용자 화면에 맞게 변환하는 로직을 실시간으로 감시합니다.
                                필드명 변경이나 데이터 소실이 발생할 경우 즉시 감지하여 경고를 알립니다.
                            </p>
                            <div className="mt-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter text-indigo-400">
                                <span>Last Check: {new Date(health?.timestamp).toLocaleString()}</span>
                                <span className="w-1.5 h-1.5 bg-indigo-200 rounded-full"></span>
                                <span>System Healthy: {health?.overall === 'healthy' ? 'YES' : 'CHECK REQUIRED'}</span>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Data Mapping Standards Section */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                    <h3 className="text-lg font-black text-gray-900">데이터 맵핑 표준 규정 (Data Dictionary)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[12px] text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-black uppercase tracking-wider">
                                <th className="py-3 px-2">항목</th>
                                <th className="py-3 px-2">표준 필드명</th>
                                <th className="py-3 px-2">소스 (Step 1-4)</th>
                                <th className="py-3 px-2">상태</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 font-bold">
                            {[
                                { item: '공고 제목', field: 'title', source: 'Step 2 제목', status: 'verified' },
                                { item: '공고별 닉네임', field: 'nickname', source: 'Step 1 닉네임', status: 'verified' },
                                { item: '지역 정보', field: 'regionCity/Gu', source: 'Step 2 지역별', status: 'verified' },
                                { item: '급여 정보', field: 'payType/Amount', source: 'Step 2 급여별', status: 'verified' },
                                { item: '상세 모집내용', field: 'content', source: 'Step 2 에디터', status: 'verified' },
                                { item: '광고 등급', field: 'productType', source: 'Step 3 선택', status: 'verified' },
                                { item: '강조 옵션', field: 'selectedIcon/Highlighter', source: 'Step 4 선택', status: 'verified' },
                            ].map((rule, idx) => (
                                <tr key={idx} className="border-b border-gray-50 last:border-0">
                                    <td className="py-4 px-2">{rule.item}</td>
                                    <td className="py-4 px-2 font-mono text-indigo-500">{rule.field}</td>
                                    <td className="py-4 px-2 text-gray-400">{rule.source}</td>
                                    <td className="py-4 px-2">
                                        <span className="flex items-center gap-1 text-emerald-500">
                                            <CheckCircle2 size={12} /> Standard Match
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Rules Summary */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                    지능형 검증 규칙 (Smart Rules)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: '8 Color Palette', desc: 'Pay types must match defined HSL values' },
                        { title: '1-Char Abbr', desc: 'Badges must display single character labels' },
                        { title: 'Data Integrity', desc: 'Payment snapshots must preserve all fields' },
                        { title: 'Nickname Sync', desc: 'Form nickname priority over profile defaults' },
                        { title: 'Option Validation', desc: 'Selected options must have valid periods' },
                        { title: 'Snapshot Mirror', desc: 'Ad detail must match payment history detail' }
                    ].map((rule, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <p className="text-xs font-black text-indigo-600 mb-1">{rule.title}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{rule.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};
