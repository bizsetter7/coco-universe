'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Server, Zap, CreditCard, Layout, Palette, Search, ChevronDown, ChevronUp } from 'lucide-react';
import {
    AD_TIER_STANDARDS,
    PAY_BADGE_STANDARDS,
    PAID_OPTION_STANDARDS,
    NORMALIZATION_STANDARDS,
    DATA_MAPPING_STANDARDS
} from '@/constants/standards';

const EMPTY_ARRAY: any[] = [];

export const StandardsGuardView = ({ ads = EMPTY_ARRAY, payments = EMPTY_ARRAY }: { ads?: any[], payments?: any[] }) => {
    // Audit function is memoized to satisfy hooks dependency
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [auditResults, setAuditResults] = useState<any[]>([]);
    const [openSection, setOpenSection] = useState<string | null>(null);

    const runAudit = React.useCallback(() => {
        const violations: any[] = [];

        // 1. Payment History Audit (Refined for V4 Schema)
        payments.forEach((p: any) => {
            const desc = p.description || p.desc || '';
            const tier = p.pay_type || p.payType || p.metadata?.product_type || '';

            // [Check 1] 비표준 약칭 감지
            if (desc.includes('[주]') || desc.includes('(주)')) {
                violations.push({ id: p.id, type: 'DATA_INTEGRITY', message: `결제 #${p.id}: 제목에 비표준 약어(주)가 포함됨 (플랫폼 가이드 위반)`, severity: 'error' });
            }

            // [Check 2] 광고 등급 약속 준수 (T1~T7)
            if (tier && !AD_TIER_STANDARDS.find(s => s.id === tier || s.altId === tier)) {
                violations.push({ id: p.id, type: 'SYSTEM_MAPPING', message: `결제 #${p.id}: 정의되지 않은 결제 등급 타입 '${tier}' 탐지 ('AD' 배지 노출 위험)`, severity: 'error' });
            }

            // [Check 3] 결제 방식 표준 (method 사용 여부)
            if (p.payment_method && !p.method) {
                violations.push({ id: p.id, type: 'SYSTEM_MAPPING', message: `결제 #${p.id}: 잘못된 결제 방식 필드명 사용 (payment_method -> method 로 수정 필요)`, severity: 'warning' });
            }
        });

        // 2. Ad Content & Structure Audit (Intelligent Engine)
        ads.forEach((ad: any) => {
            const opt = ad.options || {};
            const adTitle = ad.title || '제목 없음';

            // [Check 1] 지능형 광고 등급 필터 (P1~P7 외 가짜 등급/P8 등 탐지)
            const pt = String(ad.productType || ad.ad_type || opt.product_type || ad.selectedAdProduct || '').toLowerCase();
            const isValidTier = AD_TIER_STANDARDS.some(s => pt.includes(s.id) || pt.includes(s.altId));

            if (pt && !isValidTier) {
                violations.push({
                    id: ad.id,
                    type: 'SYSTEM_MAPPING',
                    message: `공고 '${adTitle}': 비표준 광고 등급 '${pt}' 사용 중 (P1~P7 규정 위반)`,
                    severity: 'error'
                });
            }

            // [Check 2] 닉네임 유실 검사 (admin_user 외 일반 사용자 대상)
            // (admin_user ID는 시스템에서 별도 프리패스로 관리됨)
            const nicknameStr = (ad.nickname || '').trim();

            if (!nicknameStr) {
                violations.push({
                    id: ad.id,
                    type: 'DATA_INTEGRITY',
                    message: `공고 '${adTitle}': 닉네임 유실 탐지`,
                    severity: 'error'
                });
            }

            // [Check 3] 정규화 필터 (NORMALIZATION_STANDARDS 기반)
            NORMALIZATION_STANDARDS.forEach(s => {
                const val = ad[s.checkKey];
                const isUnnormalized = val === '정보없음' || !val || (Array.isArray(val) && val.length === 0 && s.to !== 'none / []');

                if (isUnnormalized && s.target !== '강조 옵션') { // 옵션은 빈 배열이 정상일 수 있음
                    violations.push({
                        id: ad.id,
                        type: 'SYSTEM_MAPPING',
                        message: `공고 '${adTitle}': ${s.target} 정규화 누약 (예상: '${s.to}')`,
                        severity: 'warning'
                    });
                }
            });

            // [Check 4] 유료 옵션 렌더링 동기화 (UI_SYNC 고도화)
            PAID_OPTION_STANDARDS.forEach(standard => {
                const hasValueInDB = opt[standard.dbKey] || ad[standard.dbKey];
                const hasValueInUI = ad[standard.key];

                if (hasValueInDB && !hasValueInUI) {
                    violations.push({
                        id: ad.id,
                        type: 'UI_SYNC',
                        message: `공고 '${adTitle}': 유료 옵션('${standard.name}') 데이터 유실 (DB 필드 '${standard.dbKey}'는 존재하나 UI 속성 '${standard.key}'이 비어있음)`,
                        severity: 'error'
                    });
                }
            });

            // [Check 5] 필수 비즈니스 데이터 무결성 (금액/업종 누락)
            if (!ad.industryMain && !ad.category) {
                violations.push({ id: ad.id, type: 'DATA_INTEGRITY', message: `공고 '${adTitle}': 업종 정보(industryMain) 누락 (필터링 불가능)`, severity: 'error' });
            }
            if (ad.payType !== '협의' && !(ad.payAmount || ad.pay_amount)) {
                violations.push({ id: ad.id, type: 'DATA_INTEGRITY', message: `공고 '${adTitle}': 급여 타입이 설정되었으나 금액(payAmount) 정보가 0이거나 누락됨`, severity: 'warning' });
            }

            // [Check 6] 급여 타입 동기화 (UI_SYNC 확장)
            const dbPayType = ad.pay_type || opt.pay_type || opt.payType;
            if (dbPayType && dbPayType !== 'nego' && ad.payType === '협의') {
                violations.push({
                    id: ad.id,
                    type: 'UI_SYNC',
                    message: `공고 '${adTitle}': 급여 종류 동기화 누락 (DB: '${dbPayType}', UI: '협의'로 표시됨)`,
                    severity: 'error'
                });
            }
        });

        setAuditResults(violations);
    }, [ads, payments]);

    const fetchHealth = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // [DDR] 인프라 체크는 데이터 감사와 별개로 진행
            const res = await fetch('/api/admin/health', { method: 'POST' });
            const data = res.ok ? await res.json() : { status: 'unstable' };
            setHealth(data);
        } catch (err: any) {
            console.error('Health fetch error:', err);
            setHealth({ status: 'offline' });
        } finally {
            runAudit();
            setLoading(false);
        }
    }, [runAudit]);

    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);

    useEffect(() => {
        runAudit();
    }, [ads, payments, runAudit]);


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
                    <div className="grid grid-cols-1 gap-6">
                        {/* Intelligent Verification Rules Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-blue-500" />
                                    인텔리전트 검증 규칙 (Smart Rules)
                                </h3>
                                <span className="text-[10px] font-bold text-gray-400">v2.1.final</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                        {AD_TIER_STANDARDS.slice(0, 5).map((t, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[10px] font-bold">
                                                <span className={`w-3 h-3 rounded-full ${t.tw}`}></span> {t.name.split(' ')[1].replace('(', '').replace(')', '')}: {t.name.split(' ')[0]}
                                            </div>
                                        ))}
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
                                        {PAID_OPTION_STANDARDS.map((o, i) => (
                                            <React.Fragment key={i}>
                                                **{o.name}({o.abbr})**: <span className={o.tw.replace('bg-', 'text-')}>{o.tw}</span><br />
                                            </React.Fragment>
                                        ))}
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* [New] Unified Technical Blueprint (Accordion System) */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                                    <h3 className="text-lg font-black text-gray-900 italic tracking-tighter uppercase">Unified Technical Blueprint</h3>
                                </div>
                                <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">Single Source of Truth</span>
                            </div>

                            <div className="space-y-3">
                                {/* Section 1: Ad Tiers */}
                                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-100 transition-colors">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'tiers' ? null : 'tiers')}
                                        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'tiers' ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${openSection === 'tiers' ? 'bg-white shadow-sm text-indigo-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <Palette size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 tracking-tight">1. 광고 등급(Ad Tier) 비주얼 표준</span>
                                        </div>
                                        {openSection === 'tiers' ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-slate-300" />}
                                    </button>
                                    {openSection === 'tiers' && (
                                        <div className="p-6 bg-white border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                                            <table className="w-full text-[11px] text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                                        <th className="py-2">등급명</th>
                                                        <th className="py-2">코드(ID)</th>
                                                        <th className="py-2">Tailwind 클래스</th>
                                                        <th className="py-2 text-right">Preview</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {AD_TIER_STANDARDS.map((t, i) => (
                                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 font-black text-slate-900">{t.name}</td>
                                                            <td className="py-3 font-mono text-slate-50">{t.id} / {t.altId}</td>
                                                            <td className="py-3 font-mono text-indigo-500 font-bold">{t.tw}</td>
                                                            <td className="py-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <span className="text-[9px] text-slate-400 font-mono">{t.hex}</span>
                                                                    <div className={`w-10 h-3 rounded-full ${t.tw} shadow-sm border border-white`}></div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Section 2: Pay Badges */}
                                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-pink-100 transition-colors">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'pay' ? null : 'pay')}
                                        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'pay' ? 'bg-pink-50/50' : 'bg-white hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${openSection === 'pay' ? 'bg-white shadow-sm text-pink-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <CreditCard size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 tracking-tight">2. 급여 배지(Pay Badge) 약어 및 컬러 표준</span>
                                        </div>
                                        {openSection === 'pay' ? <ChevronUp size={14} className="text-pink-500" /> : <ChevronDown size={14} className="text-slate-300" />}
                                    </button>
                                    {openSection === 'pay' && (
                                        <div className="p-6 bg-white border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                                            <table className="w-full text-[11px] text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                                        <th className="py-2">급여 종류</th>
                                                        <th className="py-2">코드(ID)</th>
                                                        <th className="py-2">약어 프리뷰</th>
                                                        <th className="py-2 text-right">Color Hex</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {PAY_BADGE_STANDARDS.map((p, i) => (
                                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 font-black text-slate-900">{p.name}</td>
                                                            <td className="py-3 font-mono text-slate-50">{p.id}</td>
                                                            <td className="py-3">
                                                                <div className={`w-[18px] h-[18px] flex items-center justify-center rounded-[3px] text-white text-[9px] font-black shadow-sm ${p.tw}`}>
                                                                    {p.abbr}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <span className="text-[9px] text-slate-400 font-mono">{p.hex}</span>
                                                                    <div className={`w-8 h-2 rounded-full ${p.tw} opacity-40`}></div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="mt-4 p-4 bg-slate-50 rounded-xl text-[9px] font-bold text-slate-400 leading-relaxed italic border border-slate-100/50">
                                                * 디자인 스펙: 18x18px Square, 10px Bold Font, 3px Rounded (Center Alignment)
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section 3: Data Mapping (Data Dictionary) */}
                                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-100 transition-colors">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'mapping' ? null : 'mapping')}
                                        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'mapping' ? 'bg-emerald-50/50' : 'bg-white hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${openSection === 'mapping' ? 'bg-white shadow-sm text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <Layout size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 tracking-tight">3. 데이터 맵핑 & 딕셔너리 명세 (DB to UI)</span>
                                        </div>
                                        {openSection === 'mapping' ? <ChevronUp size={14} className="text-emerald-500" /> : <ChevronDown size={14} className="text-slate-300" />}
                                    </button>
                                    {openSection === 'mapping' && (
                                        <div className="p-6 bg-white border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                                            <table className="w-full text-[11px] text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                                        <th className="py-2">포트폴리오 항목</th>
                                                        <th className="py-2">DB 필드 (Source)</th>
                                                        <th className="py-2">UI 속성 (Camel)</th>
                                                        <th className="py-2 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {DATA_MAPPING_STANDARDS.map((m, i) => (
                                                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-emerald-50/30 transition-colors">
                                                            <td className="py-3 font-black text-slate-900">{m.item}</td>
                                                            <td className="py-3 font-mono text-slate-400">{m.db}</td>
                                                            <td className="py-3 font-mono text-emerald-600 font-black">{m.ui}</td>
                                                            <td className="py-3 text-right">
                                                                <span className="text-[9px] font-black italic text-emerald-500">{m.required ? 'REQUIRED' : 'OPTIONAL'}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Section 4: Normalization & Business Logic */}
                                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-amber-100 transition-colors">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'logic' ? null : 'logic')}
                                        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'logic' ? 'bg-amber-50/50' : 'bg-white hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${openSection === 'logic' ? 'bg-white shadow-sm text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <Zap size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 tracking-tight">4. 데이터 정규화 & 비즈니스 로직 약속</span>
                                        </div>
                                        {openSection === 'logic' ? <ChevronUp size={14} className="text-amber-500" /> : <ChevronDown size={14} className="text-slate-300" />}
                                    </button>
                                    {openSection === 'logic' && (
                                        <div className="p-6 bg-white border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {NORMALIZATION_STANDARDS.map((l, i) => (
                                                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group hover:bg-white hover:border-amber-200 transition-all">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-md">{l.target} 보정</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 mb-1">
                                                            <span className="text-slate-400 line-through decoration-slate-300 decoration-1 text-[11px]">{l.from}</span>
                                                            <ChevronDown size={12} className="-rotate-90 text-amber-400" />
                                                            <span className="text-amber-600 underline decoration-amber-200 decoration-2 underline-offset-4">{l.to}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-bold leading-tight">{l.reason}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section 5: Audit & Integrity Policy */}
                                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-rose-100 transition-colors">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'audit' ? null : 'audit')}
                                        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'audit' ? 'bg-rose-50/50' : 'bg-white hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${openSection === 'audit' ? 'bg-white shadow-sm text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <ShieldCheck size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 tracking-tight">5. 시스템 무결성 검증 및 감사 정책 (Audit)</span>
                                        </div>
                                        {openSection === 'audit' ? <ChevronUp size={14} className="text-rose-500" /> : <ChevronDown size={14} className="text-slate-300" />}
                                    </button>
                                    {openSection === 'audit' && (
                                        <div className="p-6 bg-white border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-4">
                                                {[
                                                    { tag: 'SYSTEM_MAPPING', title: '데이터 매핑 누락 및 잔재 검사', desc: 'DB 필드가 정상적으로 파싱되지 않거나 기본값(정보없음)이 노출되는 경우를 즉시 적발하여 관리 리스트의 품질을 유지합니다.' },
                                                    { tag: 'UI_SYNC', title: '유료 옵션 렌더링 동기화 검사', desc: '결제된 강조 옵션(아이콘, 형광펜, 테두리 등)이 실제 리스트 렌더링 필드에 반영되지 않는 렌더링 병목 현상을 진단합니다.' },
                                                    { tag: 'DATA_INTEGRITY', title: '민감 데이터 유실 및 표준 위반 검사', desc: '닉네임 유실, 비표준 약어([주] 등)의 잔재, 금지된 텍스트 패턴 노출을 감사하여 플랫폼의 정체성을 보호합니다.' },
                                                ].map((a, i) => (
                                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-rose-50/30 border border-rose-100 group">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[9px] font-black text-white bg-rose-500 px-1.5 py-0.5 rounded uppercase">{a.tag}</span>
                                                                <h4 className="text-xs font-black text-slate-900 tracking-tighter">{a.title}</h4>
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{a.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section 6: Detail Ad Card & SEO Policy */}
                                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:border-blue-100 transition-colors">
                                    <button
                                        onClick={() => setOpenSection(openSection === 'seo' ? null : 'seo')}
                                        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'seo' ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${openSection === 'seo' ? 'bg-white shadow-sm text-blue-500' : 'bg-slate-50 text-slate-400'}`}>
                                                <Search size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 tracking-tight">6. 상세 광고 카드 레이아웃 및 SEO 정책</span>
                                        </div>
                                        {openSection === 'seo' ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-slate-300" />}
                                    </button>
                                    {openSection === 'seo' && (
                                        <div className="p-6 bg-white border-t border-slate-50 animate-in slide-in-from-top-2 duration-300 space-y-6">
                                            {/* 6.1 Layout */}
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                                    상세 광고 카드(Modal) 레이아웃
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <strong className="block text-slate-700 mb-1">2.1 전체 구조 (Flex-Col)</strong>
                                                        <ul className="list-disc list-inside text-slate-500 space-y-1 text-[11px]">
                                                            <li>Height: h-full (화면 전체)</li>
                                                            <li>Content: Scrollable (Overflow-y-auto)</li>
                                                            <li>Header/Footer: Sticky/Fixed</li>
                                                        </ul>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <strong className="block text-slate-700 mb-1">2.4 하단 컨택 바 (Footer)</strong>
                                                        <ul className="list-disc list-inside text-slate-500 space-y-1 text-[11px]">
                                                            <li>Position: Sticky Bottom-0</li>
                                                            <li>Shadow: Top Shadow 구분감</li>
                                                            <li>Composition: 3분할 (쪽지/메신저/전화)</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 6.2 SEO */}
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                                    SEO 상세 페이지 및 메타데이터
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-dashed border-indigo-200 rounded-lg">
                                                        <div className="text-indigo-600 font-black text-[10px] whitespace-nowrap mt-0.5">URL 구조</div>
                                                        <div className="text-slate-600 text-[11px] font-mono">/jobs/[id] (SSR Rendering)</div>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-dashed border-indigo-200 rounded-lg">
                                                        <div className="text-indigo-600 font-black text-[10px] whitespace-nowrap mt-0.5">Title</div>
                                                        <div className="text-slate-600 text-[11px] font-mono">[업소명] - [지역] [업종]알바 채용정보 | 코코알바</div>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-dashed border-indigo-200 rounded-lg">
                                                        <div className="text-indigo-600 font-black text-[10px] whitespace-nowrap mt-0.5">Keywords</div>
                                                        <div className="text-slate-600 text-[11px] font-mono">generateSEOKeywords(region) 자동 생성 태그</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Bottom Principle Summary */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                                지능형 검증 규칙 (Smart Rules)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { title: 'Data Dictionary', desc: 'DB(Snake) to UI(Camel) strict mapping rules' },
                                    { title: 'Normalization', desc: 'Auto-fallback logic for missing industry/nicknames' },
                                    { title: 'Visual Standard', desc: '18px fixed badges for all paid options (아/형/테/급)' },
                                    { title: 'Color Invariant', desc: 'Ad Tiers (p1-p7) follow official HSL palettes' },
                                    { title: 'Integrity Audit', desc: 'Detects orphaned orphaned snapshots or outdated labels' },
                                    { title: 'Standard Sync', desc: 'All fields must match the unified standards guide' },
                                    { title: 'Ad Number', desc: 'Fixed at Top-Right (Body relative) for visibility' },
                                    { title: 'Address Logic', desc: 'Business Address (Sign-up) > Ad Region (Fallback)' },
                                    { title: 'Popup Header', desc: '3-Row Layout: Badge / Title / Nickname' },
                                    { title: 'Keyword Logic', desc: 'Step4 Options + Auto-Tags (#[Region]Woman/Fox/Room) Merge' }
                                ].map((rule, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-xs font-black text-indigo-600 mb-1">{rule.title}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{rule.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 7. Ad Specs & Typography (Source of Truth) */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
                                광고 UI 표준 (Ad Specs & Typography)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* 7.1 List View */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                        <h4 className="text-xs font-black text-slate-700">List View (Table)</h4>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Row Padding</span>
                                            <span className="font-mono font-bold text-slate-700">py-4 (1rem)</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Region Font</span>
                                            <span className="font-mono font-bold text-slate-700">13px Bold</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Title Font</span>
                                            <span className="font-mono font-bold text-slate-700">14px Bold</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Pay Text</span>
                                            <span className="font-mono font-bold text-slate-700">12px Black</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Badge Size</span>
                                            <span className="font-mono font-bold text-slate-700">18x18px</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 7.2 Grid View */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                        <h4 className="text-xs font-black text-slate-700">Grid View (Card)</h4>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-4 space-y-2 border border-blue-100">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Image Ratio</span>
                                            <span className="font-mono font-bold text-slate-700">4:3 (Aspect)</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Container</span>
                                            <span className="font-mono font-bold text-slate-700">p-2 Rounded-2xl</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Region Font</span>
                                            <span className="font-mono font-bold text-slate-700">11px Bold</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Title Font</span>
                                            <span className="font-mono font-bold text-slate-700">14px Bold</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Pay Text</span>
                                            <span className="font-mono font-bold text-slate-700">12px Black</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 7.3 Popup View */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                                        <h4 className="text-xs font-black text-slate-700">Popup (Detail)</h4>
                                    </div>
                                    <div className="bg-pink-50 rounded-xl p-4 space-y-2 border border-pink-100">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-500">Header Color</span>
                                            <span className="font-mono font-bold text-slate-700">Dynamic (7 Types)</span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-[11px] border-t border-pink-100 pt-2 mt-1">
                                            <span className="text-slate-500 font-bold mb-0.5">Header Layout (3-Row)</span>
                                            <div className="flex justify-between pl-2"><span className="text-slate-400">Row 1</span> <span className="font-mono font-bold text-slate-700">Region | Job Type</span></div>
                                            <div className="flex justify-between pl-2"><span className="text-slate-400">Row 2</span> <span className="font-mono font-bold text-slate-700">Icon+Highlighter+Title</span></div>
                                            <div className="flex justify-between pl-2"><span className="text-slate-400">Row 3</span> <span className="font-mono font-bold text-slate-700">Nickname (Step1 Input)</span></div>
                                        </div>
                                        <div className="flex flex-col gap-1 text-[11px] border-t border-pink-100 pt-2 mt-1">
                                            <span className="text-slate-500 font-bold mb-0.5">Body Logic</span>
                                            <div className="flex justify-between pl-2"><span className="text-slate-400">Location</span> <span className="font-mono font-bold text-slate-700">Business Address (Sign-up)</span></div>
                                            <div className="flex justify-between pl-2"><span className="text-slate-400">Search</span> <span className="font-mono font-bold text-slate-700">Filter by Ad Region</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 8. Ad Card Layout Standards (The Bible) */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                                광고 카드 레이아웃 표준 (Ad Card Layouts)
                            </h3>

                            {/* 8.1 General Rules */}
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mb-6">
                                <h4 className="text-xs font-black text-purple-700 mb-2">공통 규칙 (General Rules)</h4>
                                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                                    <li><strong>상세 팝업 일관성</strong>: 미리보기, 마이페이지, 결제내역, 관리자심사 등 모든 경로에서 동일한 디자인/로직 적용</li>
                                    <li><strong>제목 줄바꿈</strong>: 카드형 최대 2줄(line-clamp-2), PC 리스트형 1줄(truncate)</li>
                                    <li><strong>모바일 아이콘</strong>: 아이콘 이미지 대신 텍스트 배지(Text Badge) 형태로 간소화</li>
                                    <li><strong>제목 배치</strong>: 아이콘 + 제목은 항상 <strong>가로(Horizontal)</strong> 배치 (세로 금지)</li>
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 8.2 Standard Card (Grand~Special) */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                        <h4 className="text-xs font-black text-slate-700">Standard Card (Grand~Special)</h4>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 border-b border-slate-200">PC / Mobile Common Structure</div>
                                        <div className="p-3 space-y-2 text-[11px]">
                                            <div className="bg-gray-100 text-center py-4 text-gray-400 rounded">1. Main Image (4:3)</div>
                                            <div className="flex justify-between text-slate-600 font-bold"><span>2. Region (Detail)</span><span>Job (Detail)</span></div>
                                            <div className="text-slate-500">3. Nickname</div>
                                            <div className="bg-yellow-50 p-1 border border-yellow-100 rounded text-slate-800">
                                                4. [Icon/TextBadge] + [Highlighter] + Title (Max 2 lines)
                                            </div>
                                            <div className="font-bold text-slate-700">5. [PayBadge] + Amount</div>
                                            <div className="text-slate-400 text-[10px]">6. Pay Options</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 8.3 Urgent Card */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        <h4 className="text-xs font-black text-slate-700">Urgent / Recommended Card</h4>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                        <div className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 border-b border-slate-200">No Image Structure</div>
                                        <div className="p-3 space-y-2 text-[11px]">
                                            <div className="flex justify-between text-slate-600 font-bold border-b pb-2"><span>1. Region (Detail)</span><span>Job (Detail)</span></div>
                                            <div className="text-slate-500">2. Nickname</div>
                                            <div className="bg-yellow-50 p-1 border border-yellow-100 rounded text-slate-800">
                                                3. [Icon/TextBadge] + [Highlighter] + Title (Max 2 lines)
                                            </div>
                                            <div className="font-bold text-slate-700">4. [PayBadge] + Amount</div>
                                            <div className="text-slate-400 text-[10px]">5. Pay Options</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 8.4 Latest List (PC) */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                        <h4 className="text-xs font-black text-slate-700">Latest List (PC Table)</h4>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200 p-3 text-[11px] space-y-1 font-mono">
                                        <div className="flex gap-2 border-b pb-1 mb-1">
                                            <span className="w-1/6">Region</span>
                                            <span className="w-1/6">Name</span>
                                            <span className="w-1/6">Job</span>
                                            <span className="w-2/6">Title(1line) + Options</span>
                                            <span className="w-1/6 text-right">Pay + Opt</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 8.5 Latest List (Mobile) */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                        <h4 className="text-xs font-black text-slate-700">Latest List (Mobile Card)</h4>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200 p-3 text-[11px] space-y-2">
                                        <div className="font-bold text-slate-800 border-b pb-1">1. [Icon] + [High] + Title (Max 2 lines)</div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>2. Region + Job</span>
                                            <span>Nickname</span>
                                        </div>
                                        <div className="font-bold text-slate-700">3. [PayBadge] + Amount + Options</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 9. Responsive & Fallback Logic (New) */}
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-teal-500 rounded-full"></span>
                                반응형 레이아웃 및 리소스 방어 로직 (Responsive & Fallback)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 9.1 Sidebar Grid Adaptation */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                                        <h4 className="text-xs font-black text-slate-700">Sidebar Grid Adaptation</h4>
                                    </div>
                                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-100 space-y-2">
                                        <div className="flex justify-between text-[11px] items-center">
                                            <span className="text-slate-500 font-bold">Standard Page (No Sidebar)</span>
                                            <span className="bg-white px-2 py-1 rounded text-teal-600 font-mono font-bold border border-teal-200">Col-6 (PC)</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] items-center">
                                            <span className="text-slate-500 font-bold">Sidebar Page (Job/Region)</span>
                                            <span className="bg-white px-2 py-1 rounded text-teal-600 font-mono font-bold border border-teal-200">Col-4 (PC)</span>
                                        </div>
                                        <div className="text-[10px] text-teal-600 font-bold mt-2 pt-2 border-t border-teal-200/50">
                                            * `hasSidebar` prop controls `AdSection` grid columns automatically.
                                        </div>
                                    </div>
                                </div>

                                {/* 9.2 Image Resource Defense */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                                        <h4 className="text-xs font-black text-slate-700">Image Resource Defense (Fallback)</h4>
                                    </div>
                                    <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 space-y-2">
                                        <div className="flex justify-between text-[11px] items-center">
                                            <span className="text-slate-500 font-bold">Image Load Error</span>
                                            <span className="font-bold text-rose-500">Trigger `onError`</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] items-center">
                                            <span className="text-slate-500 font-bold">Fallback UI</span>
                                            <span className="font-bold text-slate-700">[Icon] + [WorkType]</span>
                                        </div>
                                        <div className="text-[10px] text-rose-600 font-bold mt-2 pt-2 border-t border-rose-200/50">
                                            * Prevents broken image icons. Maintains layout integrity (4:3 aspect ratio).
                                        </div>
                                    </div>
                                </div>

                                {/* 9.3 Layout Integrity */}
                                <div className="space-y-3 md:col-span-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                        <h4 className="text-xs font-black text-slate-700">Visual Integrity Standards</h4>
                                    </div>
                                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="text-[11px] space-y-1">
                                            <strong className="block text-indigo-700 mb-1">Height Synchronization</strong>
                                            <p className="text-slate-600">All cards in a row must share equal height (`h-full` + `flex-1`).</p>
                                        </div>
                                        <div className="text-[11px] space-y-1">
                                            <strong className="block text-indigo-700 mb-1">Text Alignment</strong>
                                            <p className="text-slate-600">Row content uses `justify-between` to prevent squashing.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* 10. Integrated Inquiry System (New) */}
                            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
                                <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
                                    통합 문의 관리 시스템 (Inquiry System Architecture)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 10.1 List View Logic */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                            <h4 className="text-xs font-black text-slate-700">List View Logic (2-Row)</h4>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                                            <div className="flex items-start gap-3 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">Badge</div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                                    <div className="h-1.5 w-1/2 bg-slate-100 rounded"></div>
                                                </div>
                                            </div>
                                            <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4">
                                                <li><strong>Row 1</strong>: [Type Badge] + Title (Truncated)</li>
                                                <li><strong>Row 2</strong>: ShopName + UserID + Contact</li>
                                                <li><strong>Sort</strong>: Latest Activity (Created or Replied)</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 10.2 Detail View Logic */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            <h4 className="text-xs font-black text-slate-700">Detail View (Chat Thread)</h4>
                                        </div>
                                        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex justify-end"><div className="bg-indigo-100 text-indigo-800 text-[9px] px-2 py-1 rounded-lg">Admin Reply</div></div>
                                                <div className="flex justify-start"><div className="bg-white text-slate-700 text-[9px] px-2 py-1 rounded-lg border border-slate-200">User Inquiry</div></div>
                                            </div>
                                            <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4">
                                                <li><strong>Thread</strong>: Grouped by `parent_id` or `partner_id`</li>
                                                <li><strong>Input</strong>: Fixed Bottom (Sticky)</li>
                                                <li><strong>Optimistic UI</strong>: Immediate update on send</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};
