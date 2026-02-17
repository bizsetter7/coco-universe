'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Server, Zap, CreditCard, Layout, HardDrive, Palette, Search, ChevronDown, ChevronUp } from 'lucide-react';

// --- 플랫폼 통합 기술 표준 (Single Source of Truth) ---
const AD_TIER_STANDARDS = [
    { name: 'T1 (Grand)', id: 'p1', altId: 'grand', tw: 'bg-amber-500', hex: '#F59E0B' },
    { name: 'T2 (Premium)', id: 'p2', altId: 'premium', tw: 'bg-red-600', hex: '#DC2626' },
    { name: 'T3 (Deluxe)', id: 'p3', altId: 'deluxe', tw: 'bg-blue-600', hex: '#2563EB' },
    { name: 'T4 (Special)', id: 'p4', altId: 'special', tw: 'bg-emerald-600', hex: '#059669' },
    { name: 'T5 (Recommended)', id: 'p5', altId: 'recommended', tw: 'bg-orange-500', hex: '#F97316' },
    { name: 'T6 (Native)', id: 'p6', altId: 'native', tw: 'bg-slate-600', hex: '#475569' },
    { name: 'T7 (Basic)', id: 'p7', altId: 'basic', tw: 'bg-slate-900', hex: '#0F172A' },
];

const PAY_BADGE_STANDARDS = [
    { name: '월급', id: 'monthly', abbr: '월', hex: '#7C3AED', tw: 'bg-[#7C3AED]' },
    { name: '주급', id: 'weekly', abbr: '주', hex: '#EC4899', tw: 'bg-[#EC4899]' },
    { name: '일급', id: 'daily', abbr: '일', hex: '#3B82F6', tw: 'bg-[#3B82F6]' },
    { name: '시급', id: 'hourly', abbr: '시', hex: '#10B981', tw: 'bg-[#10B981]' },
    { name: '건당', id: 'per_job', abbr: '건', hex: '#F59E0B', tw: 'bg-[#F59E0B]' },
    { name: '연봉', id: 'yearly', abbr: '연', hex: '#EF4444', tw: 'bg-[#EF4444]' },
    { name: '협의', id: 'nego', abbr: '협', hex: '#6B7280', tw: 'bg-[#6B7280]' },
];

const PAID_OPTION_STANDARDS = [
    { name: '아이콘', abbr: '아', tw: 'bg-indigo-500', key: 'selectedIcon', dbKey: 'icon' },
    { name: '형광펜', abbr: '형', tw: 'bg-gray-600', key: 'selectedHighlighter', dbKey: 'highlighter' },
    { name: '테두리', abbr: '테', tw: 'bg-blue-500', key: 'borderOption', dbKey: 'border' },
    { name: '급여수식어', abbr: '급', tw: 'bg-pink-500', key: 'paySuffixes', dbKey: 'pay_suffixes' },
];

const NORMALIZATION_STANDARDS = [
    { target: '상세직종', from: '정보없음 / NULL', to: '일반', reason: 'UX 가용성 확보 및 미려한 텍스트 유지', checkKey: 'categorySub' },
    { target: '닉네임', from: 'NULL / 공백', to: '상호명 (Fallback)', reason: '게시자 식별성 및 신뢰도 보장', checkKey: 'nickname' },
    { target: '강조 옵션', from: 'NULL / 미정', to: 'none / []', reason: '렌더링 에러 방지 및 기본값 고정', checkKey: 'options' },
    { target: '급여 타입', from: 'NULL', to: '협의', reason: '데이터 무결성(SYSTEM_MAPPING) 준수', checkKey: 'payType' },
];

const DATA_MAPPING_STANDARDS = [
    { item: '공고 제목', db: 'title', ui: 'title', required: true },
    { item: '업종 정보', db: 'category', ui: 'industryMain', required: true },
    { item: '상세 직종', db: 'category_sub', ui: 'categorySub', required: false },
    { item: '급여 타입', db: 'pay_type', ui: 'payType', required: true },
    { item: '급여 금액', db: 'pay_amount', ui: 'payAmount', required: true },
    { item: '광고 등급', db: 'tier / ad_type', ui: 'selectedAdProduct', required: true },
    { item: '강조 아이콘', db: 'options.icon', ui: 'selectedIcon', required: false },
    { item: '하이라이터', db: 'options.highlighter', ui: 'selectedHighlighter', required: false },
    { item: '테두리 옵션', db: 'options.border', ui: 'borderOption', required: false },
    { item: '급여 수식어', db: 'options.pay_suffixes', ui: 'paySuffixes', required: false },
];

export const StandardsGuardView = ({ ads = [], payments = [], onOpenMenu: _onOpenMenu }: { ads?: any[], payments?: any[], onOpenMenu?: () => void }) => {
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [auditResults, setAuditResults] = useState<any[]>([]);
    const [openSection, setOpenSection] = useState<string | null>(null);

    const runAudit = () => {
        const violations: any[] = [];

        // 1. Payment History Audit (Refined)
        payments.forEach((p: any) => {
            const desc = p.description || p.desc || '';
            const opts = p.adObject?.options || {};

            // [Check 1] 비표준 약칭 감지
            if (desc.includes('[주]') || desc.includes('(주)')) {
                violations.push({ id: p.id, type: 'DATA_INTEGRITY', message: `결제 #${p.id}: 제목에 비표준 약어(주)가 포함됨 (플랫폼 가이드 위반)`, severity: 'error' });
            }

            // [Check 2] 급여 타입 표준 준수 여부
            const payType = p.pay_type || p.payType;
            if (payType && !PAY_BADGE_STANDARDS.find(s => s.id === payType)) {
                violations.push({ id: p.id, type: 'SYSTEM_MAPPING', message: `결제 #${p.id}: 정의되지 않은 급여 타입 '${payType}' 탐지 (표준 외 데이터)`, severity: 'error' });
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

            // [Check 2] 닉네임 유실 및 금지 패턴 (운영자/게스트 등)
            const nicknameStr = (ad.nickname || '').trim();
            const forbiddenNames = ['게스트', '관리자', '운영자', '라운지'];
            const isForbidden = forbiddenNames.some(name => nicknameStr.includes(name));

            if (!nicknameStr || isForbidden) {
                violations.push({
                    id: ad.id,
                    type: 'DATA_INTEGRITY',
                    message: `공고 '${adTitle}': 부적절하거나 누락된 닉네임('${nicknameStr || 'NULL'}')`,
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
    }, []);

    useEffect(() => {
        runAudit();
    }, [ads, payments]);

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
                                    { title: 'Integrity Audit', desc: 'Detects orphaned snapshots or outdated labels' },
                                    { title: 'Standard Sync', desc: 'All fields must match the unified standards guide' }
                                ].map((rule, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <p className="text-xs font-black text-indigo-600 mb-1">{rule.title}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{rule.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};
