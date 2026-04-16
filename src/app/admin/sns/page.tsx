'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    Twitter, Send, Eye, Clock, Zap, CheckCircle2,
    XCircle, AlertCircle, RefreshCw, Copy, Edit3,
    Hash, MapPin, Briefcase, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface PreviewData {
    type: string;
    text: string;
    charCount: number;
    todayRegion: { slug: string; name: string };
    todayWorkType: string;
    kstHour: number;
}

interface CronSlot {
    kst: string;
    type: string;
    utc: string;
}

// ─── 업종/지역 선택 옵션 ─────────────────────────────────────────────────────

const WORK_TYPES = ['룸알바', '텐프로', '쩜오알바', '텐카페', '노래주점', '노래빠알바', '바알바', '마사지'];
const REGIONS = [
    { slug: '서울-강남구',   name: '강남' },
    { slug: '서울-마포구',   name: '홍대·마포' },
    { slug: '부산-해운대구', name: '해운대' },
    { slug: '대전-유성구',   name: '대전 유성' },
    { slug: '경기-수원시',   name: '수원' },
    { slug: '대구-수성구',   name: '대구 수성' },
    { slug: '광주-서구',     name: '광주 상무' },
    { slug: '서울',          name: '서울 전체' },
    { slug: '부산',          name: '부산 전체' },
];

const TWEET_TYPES = [
    { value: 'new_job',     label: '신규 구인 공고', icon: '🆕' },
    { value: 'salary_info', label: '지역 시세 정보', icon: '📊' },
    { value: 'guide',       label: '가이드 콘텐츠',  icon: '💡' },
];

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function SnsManagementPage() {
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();

    const [preview, setPreview]         = useState<PreviewData | null>(null);
    const [cronSlots, setCronSlots]     = useState<CronSlot[]>([]);
    const [configured, setConfigured]   = useState<boolean | null>(null);
    const [loading, setLoading]         = useState(true);

    // 수동 발행 상태
    const [manualText, setManualText]   = useState('');
    const [selectedType, setSelectedType] = useState('guide');
    const [selectedRegion, setSelectedRegion] = useState('서울-강남구');
    const [selectedWT, setSelectedWT]   = useState('룸알바');
    const [generating, setGenerating]   = useState(false);
    const [posting, setPosting]         = useState(false);
    const [lastResult, setLastResult]   = useState<{ ok: boolean; id?: string; error?: string } | null>(null);

    // ── 인증 헤더 ──────────────────────────────────────────────────────────────
    const getAuthHeader = useCallback(() => {
        const token = (user as any)?.access_token ?? (user as any)?.session?.access_token ?? '';
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, [user]);

    // ── 미리보기 로드 ─────────────────────────────────────────────────────────
    const loadPreview = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/sns/preview', {
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (data.ok) {
                setPreview(data.preview);
                setCronSlots(data.nextSlots ?? []);
                setConfigured(data.twitterConfigured);
            }
        } catch (e) {
            toast.error('미리보기 로드 실패');
        } finally {
            setLoading(false);
        }
    }, [getAuthHeader]);

    useEffect(() => { loadPreview(); }, [loadPreview]);

    // ── 트윗 텍스트 자동 생성 ─────────────────────────────────────────────────
    const generateTweet = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/sns/preview', {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type:       selectedType,
                    regionSlug: selectedRegion,
                    workType:   selectedWT,
                }),
            });
            const data = await res.json();
            if (data.ok) {
                setManualText(data.text);
                toast.success('트윗 생성 완료');
            }
        } catch (e) {
            toast.error('트윗 생성 실패');
        } finally {
            setGenerating(false);
        }
    };

    // ── 수동 발행 ──────────────────────────────────────────────────────────────
    const handlePost = async () => {
        if (!manualText.trim()) { toast.error('트윗 내용을 입력하거나 생성하세요'); return; }
        if (!confirm('지금 즉시 Twitter에 게시하시겠습니까?')) return;

        setPosting(true);
        setLastResult(null);
        try {
            const res = await fetch('/api/admin/sns/manual-post', {
                method: 'POST',
                headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: manualText }),
            });
            const data = await res.json();
            if (data.ok) {
                setLastResult({ ok: true, id: data.tweetId });
                toast.success(`트윗 발행 완료! ID: ${data.tweetId}`);
                setManualText('');
            } else {
                setLastResult({ ok: false, error: data.error });
                toast.error(data.error ?? '발행 실패');
            }
        } catch (e: any) {
            setLastResult({ ok: false, error: e.message });
            toast.error('발행 실패');
        } finally {
            setPosting(false);
        }
    };

    // ── 크론 수동 실행 ────────────────────────────────────────────────────────
    const runCron = async () => {
        if (!confirm('크론 파이프라인을 지금 즉시 실행하시겠습니까?')) return;
        try {
            const cronSecret = prompt('CRON_SECRET 입력:');
            if (!cronSecret) return;
            const res = await fetch('/api/cron/twitter-post', {
                headers: { Authorization: `Bearer ${cronSecret}` },
            });
            const data = await res.json();
            if (data.ok) {
                toast.success(`자동 트윗 발행 완료! (${data.tweetType})`);
            } else {
                toast.error(data.error ?? data.message ?? '크론 실행 실패');
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    // ── 문자 수 카운터 ────────────────────────────────────────────────────────
    const charCount = [...manualText.replace(/https?:\/\/\S+/g, '?'.repeat(23))].length;
    const isOver = charCount > 280;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-sky-500/20 rounded-xl">
                            <Twitter size={24} className="text-sky-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white">SNS 자동화 관리</h1>
                            <p className="text-xs text-slate-400">Twitter/X 자동 발행 파이프라인</p>
                        </div>
                    </div>
                    <button onClick={loadPreview} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                        <RefreshCw size={16} className="text-slate-400" />
                    </button>
                </div>

                {/* Twitter 설정 상태 */}
                <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
                    configured === null ? 'bg-slate-800/50 border-slate-700' :
                    configured ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}>
                    {configured === null ? <AlertCircle size={18} className="text-slate-400" /> :
                     configured ? <CheckCircle2 size={18} className="text-emerald-400" /> :
                     <XCircle size={18} className="text-red-400" />}
                    <div>
                        <p className={`font-bold text-sm ${configured ? 'text-emerald-300' : configured === false ? 'text-red-300' : 'text-slate-300'}`}>
                            Twitter API {configured ? '연결됨' : configured === false ? '미설정' : '확인 중...'}
                        </p>
                        {configured === false && (
                            <p className="text-xs text-slate-400 mt-0.5">
                                Vercel 환경변수에 TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET 를 등록하세요
                            </p>
                        )}
                    </div>
                </div>

                {/* 크론 스케줄 */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={16} className="text-slate-400" />
                        <h2 className="font-black text-sm text-slate-300">자동 발행 스케줄 (KST)</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {cronSlots.map((slot) => {
                            const icons: Record<string, string> = { new_job: '🆕', salary_info: '📊', guide: '💡' };
                            return (
                                <div key={slot.kst} className="bg-slate-800 rounded-xl p-3 text-center">
                                    <p className="text-lg font-black text-white">{slot.kst}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{icons[slot.type]} {slot.type === 'new_job' ? '신규공고' : slot.type === 'salary_info' ? '시세정보' : '가이드'}</p>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={runCron}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold text-slate-300 transition-colors"
                    >
                        <Zap size={14} /> 크론 지금 실행 (테스트)
                    </button>
                </div>

                {/* 자동 생성 미리보기 */}
                {preview && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Eye size={16} className="text-slate-400" />
                                <h2 className="font-black text-sm text-slate-300">다음 자동 트윗 미리보기</h2>
                            </div>
                            <span className="text-xs px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full font-bold">
                                {preview.type === 'new_job' ? '신규공고' : preview.type === 'salary_info' ? '시세정보' : '가이드'}
                            </span>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {preview.text}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs font-bold ${preview.charCount > 280 ? 'text-red-400' : 'text-slate-500'}`}>
                                {preview.charCount} / 280자
                            </p>
                            <button
                                onClick={() => { setManualText(preview.text); toast.success('편집창에 복사됨'); }}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                <Copy size={12} /> 편집창으로 복사
                            </button>
                        </div>
                    </div>
                )}

                {/* 수동 발행 */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Edit3 size={16} className="text-slate-400" />
                        <h2 className="font-black text-sm text-slate-300">수동 트윗 발행</h2>
                    </div>

                    {/* 자동 생성 옵션 */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* 트윗 타입 */}
                        <div>
                            <label className="text-xs text-slate-500 font-bold mb-1.5 block">콘텐츠 타입</label>
                            <select
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white appearance-none"
                            >
                                {TWEET_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                                ))}
                            </select>
                        </div>
                        {/* 지역 */}
                        <div>
                            <label className="text-xs text-slate-500 font-bold mb-1.5 block flex items-center gap-1">
                                <MapPin size={10} /> 지역
                            </label>
                            <select
                                value={selectedRegion}
                                onChange={e => setSelectedRegion(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white appearance-none"
                            >
                                {REGIONS.map(r => (
                                    <option key={r.slug} value={r.slug}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* 업종 */}
                        <div>
                            <label className="text-xs text-slate-500 font-bold mb-1.5 block flex items-center gap-1">
                                <Briefcase size={10} /> 업종
                            </label>
                            <select
                                value={selectedWT}
                                onChange={e => setSelectedWT(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white appearance-none"
                            >
                                {WORK_TYPES.map(w => (
                                    <option key={w} value={w}>{w}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={generateTweet}
                        disabled={generating}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-sky-600 disabled:opacity-50 rounded-xl text-sm font-bold text-white transition-colors"
                    >
                        {generating ? <RefreshCw size={14} className="animate-spin" /> : <Hash size={14} />}
                        {generating ? '생성 중...' : '트윗 자동 생성'}
                    </button>

                    {/* 텍스트 편집 */}
                    <div className="relative">
                        <textarea
                            value={manualText}
                            onChange={e => setManualText(e.target.value)}
                            placeholder="트윗 내용을 입력하거나 위에서 자동 생성하세요..."
                            rows={8}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono resize-none focus:outline-none focus:border-sky-500 transition-colors"
                        />
                        <span className={`absolute bottom-3 right-3 text-xs font-bold ${isOver ? 'text-red-400' : 'text-slate-500'}`}>
                            {charCount}/280
                        </span>
                    </div>

                    {/* 발행 버튼 */}
                    <button
                        onClick={handlePost}
                        disabled={posting || !configured || isOver}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black text-white transition-colors shadow-lg shadow-sky-500/20"
                    >
                        {posting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                        {posting ? '발행 중...' : 'Twitter에 즉시 발행'}
                    </button>

                    {/* 결과 */}
                    {lastResult && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl ${lastResult.ok ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                            {lastResult.ok
                                ? <CheckCircle2 size={16} className="text-emerald-400" />
                                : <XCircle size={16} className="text-red-400" />}
                            <p className={`text-sm font-bold ${lastResult.ok ? 'text-emerald-300' : 'text-red-300'}`}>
                                {lastResult.ok ? `발행 완료! Tweet ID: ${lastResult.id}` : `실패: ${lastResult.error}`}
                            </p>
                        </div>
                    )}
                </div>

                {/* IndexNow 섹션 */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-yellow-400" />
                        <h2 className="font-black text-sm text-slate-300">Google IndexNow (즉시 색인)</h2>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                        신규/수정 광고 URL을 Google·Bing에 즉시 색인 요청합니다. 6시간마다 자동 실행됩니다.
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                const cronSecret = prompt('CRON_SECRET 입력:');
                                if (!cronSecret) return;
                                const res = await fetch('/api/cron/indexnow', {
                                    headers: { Authorization: `Bearer ${cronSecret}` },
                                });
                                const data = await res.json();
                                if (data.ok) toast.success(`${data.submitted}개 URL 색인 요청 완료`);
                                else toast.error(data.error ?? data.message ?? '실패');
                            } catch (e: any) {
                                toast.error(e.message);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-xl text-sm font-bold text-yellow-300 transition-colors"
                    >
                        <Zap size={14} /> IndexNow 지금 실행
                    </button>
                </div>

                {/* 전략 가이드 */}
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-5">
                    <h2 className="font-black text-sm text-slate-400 mb-3">📌 운영 전략</h2>
                    <div className="space-y-2 text-xs text-slate-500">
                        <p>• <strong className="text-slate-400">포화 해시태그 금지</strong> — #밤알바 #유흥알바는 10분 내 피드에서 묻힘</p>
                        <p>• <strong className="text-slate-400">롱테일 해시태그 사용</strong> — #강남룸알바 #수원텐카페 등 지역+업종 조합</p>
                        <p>• <strong className="text-slate-400">정보성 콘텐츠 우선</strong> — 구인공고 직접 노출보다 팁/시세 정보가 제재 리스크 낮음</p>
                        <p>• <strong className="text-slate-400">일 4회 자동 발행</strong> — 08:00 / 12:00 / 18:00 / 22:00 KST</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
