/**
 * [광고카드 이미지 생성기] /api/card/generate
 *
 * next/og ImageResponse 기반 1080×1080 PNG 생성
 *
 * 사용법:
 *   GET /api/card/generate?shopId=123&template=A&bg=white
 *   GET /api/card/generate?template=B&bg=grad-pink-purple&nickname=강남클럽&region=서울-강남구&...
 *
 * shopId 있으면 DB 자동 로드, 없으면 쿼리 파라미터 수동 입력 모드
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import React from 'react';

export const runtime = 'nodejs';

const W = 1080;
const H = 1080;
const BRAND_PINK = '#E91E8C';
const TELEGRAM_CS = '@cocoalba_cs_bot';

// ─── Supabase ────────────────────────────────────────────────────────────────

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── 배경 팔레트 (18종) ───────────────────────────────────────────────────────

const BG_MAP: Record<string, { bg?: string; grad?: string; dark: boolean }> = {
    // Solid 8
    white:              { bg: '#FFFFFF',  dark: false },
    'light-gray':       { bg: '#F4F4F5',  dark: false },
    beige:              { bg: '#F5F0E8',  dark: false },
    cream:              { bg: '#FFF8E7',  dark: false },
    'light-pink':       { bg: '#FFF0F5',  dark: false },
    'light-purple':     { bg: '#F8F0FF',  dark: false },
    navy:               { bg: '#1a1a2e',  dark: true  },
    black:              { bg: '#0D0D0D',  dark: true  },
    // Gradient 6
    'grad-pink-purple': { grad: 'linear-gradient(135deg,#FF6B9D 0%,#9B59B6 100%)', dark: true  },
    'grad-gold-orange': { grad: 'linear-gradient(135deg,#F39C12 0%,#E74C3C 100%)', dark: true  },
    'grad-navy-blue':   { grad: 'linear-gradient(135deg,#1a1a2e 0%,#0F3460 100%)', dark: true  },
    'grad-emerald':     { grad: 'linear-gradient(135deg,#00C853 0%,#00BCD4 100%)', dark: true  },
    'grad-rose-coral':  { grad: 'linear-gradient(135deg,#FF1744 0%,#FF8A65 100%)', dark: true  },
    'grad-dark-gray':   { grad: 'linear-gradient(135deg,#2D3436 0%,#636E72 100%)', dark: true  },
    // Dark 4
    'dark-black':       { bg: '#0A0A0A',  dark: true  },
    'dark-navy':        { bg: '#0F1B35',  dark: true  },
    'dark-purple':      { bg: '#1A0A2E',  dark: true  },
    charcoal:           { bg: '#2C2C2C',  dark: true  },
};

// ─── 카드 데이터 타입 ─────────────────────────────────────────────────────────

interface CardData {
    nickname:    string;
    region:      string;
    subRegion:   string;
    phone:       string;
    title:       string;
    age:         string;     // "20~30대"
    payDisplay:  string;     // "일급 30만원+α"
    category:    string;
    categorySub: string;
    keywords:    string[];   // Row 3 (user 또는 fallback)
}

// ─── Row3 키워드 폴백 ─────────────────────────────────────────────────────────

function buildKeywordFallback(region: string, workType: string): string[] {
    const clean = region.replace(/[\[\]]/g, '').trim();
    const parts = clean.split(/[-\s]+/);
    const city     = parts[0] || '';
    const district = parts[1] || '';
    const display  = district || city;
    return [
        `${display}${workType}알바`,
        `${display}여자유흥알바`,
        `${display}여자고수익알바`,
    ].filter(k => k.trim().length > 4);
}

// ─── 폰트 로딩 ───────────────────────────────────────────────────────────────

let _fontCache: ArrayBuffer | null = null;
async function loadFont(): Promise<ArrayBuffer | null> {
    if (_fontCache) return _fontCache;
    try {
        // Noto Sans KR Bold — Bunny Fonts CDN (GDPR 친화적)
        const res = await fetch(
            'https://fonts.bunny.net/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2',
            { signal: AbortSignal.timeout(4000) }
        );
        if (res.ok) _fontCache = await res.arrayBuffer();
    } catch { /* Korean 미지원 시 시스템 폰트로 폴백 */ }
    return _fontCache;
}

// ─── 템플릿 렌더링 ───────────────────────────────────────────────────────────

function renderCard(data: CardData, template: string, bgKey: string): React.ReactElement {
    const bgDef = BG_MAP[bgKey] ?? BG_MAP.white;
    const isDark       = bgDef.dark;
    const textPrimary  = isDark ? '#FFFFFF'                   : '#111827';
    const textMuted    = isDark ? 'rgba(255,255,255,0.60)'    : '#6B7280';
    const pillBorder   = isDark ? 'rgba(255,255,255,0.20)'    : 'rgba(0,0,0,0.12)';
    const pillBg       = isDark ? 'rgba(255,255,255,0.10)'    : 'rgba(0,0,0,0.05)';
    const sectionBg    = isDark ? 'rgba(255,255,255,0.07)'    : '#F9FAFB';
    const dividerColor = isDark ? 'rgba(255,255,255,0.15)'    : 'rgba(0,0,0,0.10)';

    const rootStyle: React.CSSProperties = {
        display:       'flex',
        flexDirection: 'column',
        width:  W,
        height: H,
        ...(bgDef.grad
            ? { backgroundImage: bgDef.grad }
            : { backgroundColor: bgDef.bg ?? '#FFFFFF' }),
        overflow: 'hidden',
    };

    // ── 공통 블록 ──────────────────────────────────────────────────────────────

    const topWatermark = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 32px', backgroundColor: BRAND_PINK }}>
            <span style={{ fontSize: 20, color: '#FFFFFF', fontWeight: 700, letterSpacing: 0.5 }}>
                여성 구인구직은 &apos;코코알바&apos; cocoalba.kr
            </span>
        </div>
    );

    const contactBlock = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 52px 20px', padding: '18px 24px', backgroundColor: sectionBg, borderRadius: 16 }}>
            <span style={{ fontSize: 20, color: BRAND_PINK, fontWeight: 700 }}>💬 코코알바 문의 {TELEGRAM_CS}</span>
            <div style={{ display: 'flex', height: 1, backgroundColor: dividerColor, marginTop: 2, marginBottom: 2 }} />
            <span style={{ fontSize: 13, color: textMuted }}>19세 미성년자 연락/출입금지 업소입니다.</span>
            <span style={{ fontSize: 18, color: textPrimary, fontWeight: 600 }}>코코알바에서 보고 전화드렸어요 →</span>
        </div>
    );

    const bottomWatermark = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 32px', backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: 17, color: textMuted, fontWeight: 700 }}>
                여성 구인구직은 &apos;코코알바&apos; cocoalba.kr
            </span>
        </div>
    );

    const pillsBlock = (titleFontSize = 44) => (
        <>
            {/* Title banner */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 52px', padding: '32px', backgroundColor: sectionBg, borderRadius: 20, flex: 1 }}>
                <span style={{ fontSize: titleFontSize, fontWeight: 900, color: textPrimary, textAlign: 'center', lineHeight: 1.35 }}>
                    {data.title || '신규 구인 공고'}
                </span>
            </div>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 52px', gap: 12 }}>
                {/* Row 1: age + pay */}
                <div style={{ display: 'flex', gap: 12 }}>
                    {data.age && (
                        <div style={{ display: 'flex', padding: '8px 22px', backgroundColor: '#3B82F6', borderRadius: 100 }}>
                            <span style={{ fontSize: 20, color: '#FFFFFF', fontWeight: 700 }}>{data.age}</span>
                        </div>
                    )}
                    {data.payDisplay && (
                        <div style={{ display: 'flex', padding: '8px 22px', backgroundColor: BRAND_PINK, borderRadius: 100 }}>
                            <span style={{ fontSize: 20, color: '#FFFFFF', fontWeight: 700 }}>{data.payDisplay}</span>
                        </div>
                    )}
                </div>
                {/* Row 2: category */}
                <div style={{ display: 'flex', gap: 10 }}>
                    {data.category && (
                        <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, border: `2px solid ${pillBorder}` }}>
                            <span style={{ fontSize: 17, color: textPrimary, fontWeight: 600 }}>{data.category}</span>
                        </div>
                    )}
                    {data.categorySub && (
                        <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, border: `2px solid ${pillBorder}` }}>
                            <span style={{ fontSize: 17, color: textPrimary, fontWeight: 600 }}>{data.categorySub}</span>
                        </div>
                    )}
                </div>
                {/* Row 3: keywords */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {data.keywords.slice(0, 5).map((kw, i) => (
                        <div key={i} style={{ display: 'flex', padding: '4px 14px', backgroundColor: pillBg, borderRadius: 100 }}>
                            <span style={{ fontSize: 15, color: textMuted }}>#{kw.replace(/^#/, '')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    // ── 템플릿 A: 기본형 ──────────────────────────────────────────────────────
    if (template === 'A') {
        return (
            <div style={rootStyle}>
                {topWatermark}
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '32px 52px 20px' }}>
                    <span style={{ fontSize: 54, fontWeight: 900, color: textPrimary, lineHeight: 1.1 }}>
                        {data.nickname}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>{data.region}</span>
                        {data.subRegion && <span style={{ fontSize: 17, color: textMuted }}>{data.subRegion}</span>}
                        {data.phone && <span style={{ fontSize: 18, color: BRAND_PINK, fontWeight: 700 }}>{data.phone}</span>}
                    </div>
                </div>
                {pillsBlock(44)}
                {contactBlock}
                {bottomWatermark}
            </div>
        );
    }

    // ── 템플릿 B: 강조형 (급여 대형) ─────────────────────────────────────────
    if (template === 'B') {
        return (
            <div style={rootStyle}>
                {topWatermark}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 52px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 50, fontWeight: 900, color: textPrimary, lineHeight: 1.1 }}>{data.nickname}</span>
                        {data.region && <span style={{ fontSize: 18, color: textMuted }}>{data.region}{data.subRegion ? ` · ${data.subRegion}` : ''}</span>}
                    </div>
                    {data.phone && (
                        <div style={{ display: 'flex', padding: '10px 24px', backgroundColor: BRAND_PINK, borderRadius: 100 }}>
                            <span style={{ fontSize: 20, color: '#fff', fontWeight: 700 }}>{data.phone}</span>
                        </div>
                    )}
                </div>
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 52px', padding: '24px 32px', backgroundColor: sectionBg, borderRadius: 20, flex: 1 }}>
                    <span style={{ fontSize: 42, fontWeight: 900, color: textPrimary, textAlign: 'center', lineHeight: 1.35 }}>
                        {data.title || '신규 구인 공고'}
                    </span>
                </div>
                {/* Rows — pay pill LARGER */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 52px', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {data.age && (
                            <div style={{ display: 'flex', padding: '8px 20px', backgroundColor: '#3B82F6', borderRadius: 100 }}>
                                <span style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 700 }}>{data.age}</span>
                            </div>
                        )}
                        {data.payDisplay && (
                            <div style={{ display: 'flex', padding: '12px 30px', backgroundColor: BRAND_PINK, borderRadius: 100, border: `3px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)'}` }}>
                                <span style={{ fontSize: 28, color: '#FFFFFF', fontWeight: 900 }}>{data.payDisplay}</span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {data.category && <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, border: `2px solid ${pillBorder}` }}><span style={{ fontSize: 17, color: textPrimary, fontWeight: 600 }}>{data.category}</span></div>}
                        {data.categorySub && <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, border: `2px solid ${pillBorder}` }}><span style={{ fontSize: 17, color: textPrimary, fontWeight: 600 }}>{data.categorySub}</span></div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {data.keywords.slice(0, 5).map((kw, i) => (
                            <div key={i} style={{ display: 'flex', padding: '4px 14px', backgroundColor: pillBg, borderRadius: 100 }}>
                                <span style={{ fontSize: 15, color: textMuted }}>#{kw.replace(/^#/, '')}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {contactBlock}
                {bottomWatermark}
            </div>
        );
    }

    // ── 템플릿 C: 프리미엄 (골드 포인트) ────────────────────────────────────
    if (template === 'C') {
        const gold = '#F5C842';
        return (
            <div style={rootStyle}>
                {/* 골드 상단 바 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 32px', backgroundColor: gold }}>
                    <span style={{ fontSize: 18, color: '#1a1a2e', fontWeight: 900, letterSpacing: 1 }}>
                        ✦ 여성 구인구직은 &apos;코코알바&apos; cocoalba.kr ✦
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 52px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 52, fontWeight: 900, color: textPrimary, lineHeight: 1.1 }}>{data.nickname}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>{data.region}</span>
                        {data.subRegion && <span style={{ fontSize: 16, color: textMuted }}>{data.subRegion}</span>}
                        {data.phone && <span style={{ fontSize: 18, color: gold, fontWeight: 700 }}>{data.phone}</span>}
                    </div>
                </div>
                {/* Gold accent line */}
                <div style={{ display: 'flex', height: 3, backgroundColor: gold, margin: '0 52px' }} />
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 52px 0', padding: '28px 32px', backgroundColor: sectionBg, borderRadius: 16, flex: 1 }}>
                    <span style={{ fontSize: 42, fontWeight: 900, color: textPrimary, textAlign: 'center', lineHeight: 1.35 }}>
                        {data.title || '신규 구인 공고'}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', padding: '18px 52px', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {data.age && <div style={{ display: 'flex', padding: '7px 20px', backgroundColor: '#3B82F6', borderRadius: 100 }}><span style={{ fontSize: 19, color: '#fff', fontWeight: 700 }}>{data.age}</span></div>}
                        {data.payDisplay && <div style={{ display: 'flex', padding: '7px 22px', backgroundColor: gold, borderRadius: 100 }}><span style={{ fontSize: 21, color: '#1a1a2e', fontWeight: 900 }}>{data.payDisplay}</span></div>}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {data.category && <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, border: `2px solid ${gold}` }}><span style={{ fontSize: 17, color: textPrimary, fontWeight: 600 }}>{data.category}</span></div>}
                        {data.categorySub && <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, border: `2px solid ${gold}` }}><span style={{ fontSize: 17, color: textPrimary, fontWeight: 600 }}>{data.categorySub}</span></div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {data.keywords.slice(0, 5).map((kw, i) => (
                            <div key={i} style={{ display: 'flex', padding: '4px 14px', backgroundColor: pillBg, borderRadius: 100 }}>
                                <span style={{ fontSize: 15, color: textMuted }}>#{kw.replace(/^#/, '')}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {contactBlock}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 32px', backgroundColor: gold }}>
                    <span style={{ fontSize: 17, color: '#1a1a2e', fontWeight: 900 }}>
                        ✦ 여성 구인구직은 &apos;코코알바&apos; cocoalba.kr ✦
                    </span>
                </div>
            </div>
        );
    }

    // ── 템플릿 D: 미니멀 (여백, 타이포 중심) ────────────────────────────────
    return (
        <div style={rootStyle}>
            {topWatermark}
            {/* Header — 중앙 정렬 미니멀 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 52px 24px', gap: 8 }}>
                <span style={{ fontSize: 58, fontWeight: 900, color: textPrimary, lineHeight: 1.0 }}>{data.nickname}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 18, color: textMuted }}>{data.region}</span>
                    {data.subRegion && <><span style={{ fontSize: 14, color: dividerColor }}>|</span><span style={{ fontSize: 17, color: textMuted }}>{data.subRegion}</span></>}
                    {data.phone && <><span style={{ fontSize: 14, color: dividerColor }}>|</span><span style={{ fontSize: 18, color: BRAND_PINK, fontWeight: 700 }}>{data.phone}</span></>}
                </div>
            </div>
            {/* Thin divider */}
            <div style={{ display: 'flex', height: 1, backgroundColor: dividerColor, margin: '0 80px' }} />
            {/* Title — large, centered */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '32px 80px' }}>
                <span style={{ fontSize: 46, fontWeight: 900, color: textPrimary, textAlign: 'center', lineHeight: 1.4 }}>
                    {data.title || '신규 구인 공고'}
                </span>
            </div>
            {/* Thin divider */}
            <div style={{ display: 'flex', height: 1, backgroundColor: dividerColor, margin: '0 80px' }} />
            {/* Pills — compact */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 80px', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    {data.age && <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: '#3B82F6', borderRadius: 100 }}><span style={{ fontSize: 17, color: '#fff', fontWeight: 700 }}>{data.age}</span></div>}
                    {data.payDisplay && <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: BRAND_PINK, borderRadius: 100 }}><span style={{ fontSize: 17, color: '#fff', fontWeight: 700 }}>{data.payDisplay}</span></div>}
                    {data.category && <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, border: `1px solid ${pillBorder}` }}><span style={{ fontSize: 16, color: textPrimary, fontWeight: 500 }}>{data.category}</span></div>}
                    {data.categorySub && <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, border: `1px solid ${pillBorder}` }}><span style={{ fontSize: 16, color: textPrimary, fontWeight: 500 }}>{data.categorySub}</span></div>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {data.keywords.slice(0, 5).map((kw, i) => (
                        <div key={i} style={{ display: 'flex', padding: '3px 12px', backgroundColor: pillBg, borderRadius: 100 }}>
                            <span style={{ fontSize: 14, color: textMuted }}>#{kw.replace(/^#/, '')}</span>
                        </div>
                    ))}
                </div>
            </div>
            {contactBlock}
            {bottomWatermark}
        </div>
    );
}

// ─── 카드 데이터 빌드 ─────────────────────────────────────────────────────────

function buildCardData(params: URLSearchParams, shop?: Record<string, any>): CardData {
    const src = shop ?? {};

    // nickname: DB 또는 수동 입력 (10자 초과 → "...")
    const rawNick = (src.nickname || params.get('nickname') || src.name || params.get('name') || '업체명').trim();
    const nickname = rawNick.length > 10 ? rawNick.slice(0, 10) + '...' : rawNick;

    const region    = (src.region           || params.get('region')    || '').replace(/[\[\]]/g, '').trim();
    const subRegion = (src.work_region_sub  || params.get('subRegion') || '').trim();
    const phone     = (src.manager_phone    || params.get('phone')     || '').trim();
    const title     = (src.title            || params.get('title')     || '').trim();

    // 나이
    const ageMin = src.options?.ageMin || params.get('ageMin') || '';
    const ageMax = src.options?.ageMax || params.get('ageMax') || '';
    const age = ageMin && ageMax ? `${ageMin}~${ageMax}대` : ageMin ? `${ageMin}대 이상` : '';

    // 급여
    const payType = src.pay_type || params.get('payType') || '';
    const pay     = src.pay      || params.get('pay')     || '';
    const payDisplay = pay
        ? `${payType ? payType + ' ' : ''}${String(pay) !== '면접후결정' ? Number(String(pay).replace(/[^0-9]/g, '')).toLocaleString() + '원' : '면접 후 결정'}+α`
        : '';

    const category    = (src.category     || params.get('category')    || '').trim();
    const categorySub = (src.category_sub || params.get('categorySub') || '').trim();

    // Row 3: options.paySuffixes + options.keywords → 없으면 폴백
    const paySuffixes: string[] = Array.isArray(src.options?.paySuffixes)
        ? src.options.paySuffixes
        : (params.get('paySuffixes') || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const optKeywords: string[] = Array.isArray(src.options?.keywords)
        ? src.options.keywords
        : (params.get('keywords') || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const userKws = [...paySuffixes, ...optKeywords].filter(Boolean);

    const workType = src.category || params.get('workType') || '룸알바';
    const keywords = userKws.length > 0
        ? userKws
        : buildKeywordFallback(region, workType);

    return { nickname, region, subRegion, phone, title, age, payDisplay, category, categorySub, keywords };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const shopId   = searchParams.get('shopId')   ?? '';
    const template = (searchParams.get('template') ?? 'A').toUpperCase();
    const bg       = searchParams.get('bg')        ?? 'white';

    // DB 모드: shopId 있으면 Supabase 조회
    let shopData: Record<string, any> | undefined;
    if (shopId) {
        const { data } = await supabaseAdmin
            .from('shops')
            .select('id,nickname,name,region,work_region_sub,manager_phone,title,pay,pay_type,category,category_sub,options')
            .eq('id', Number(shopId))
            .single();
        shopData = data ?? undefined;
    }

    const cardData = buildCardData(searchParams, shopData);
    const fontData = await loadFont();

    const fonts = fontData
        ? [{ name: 'Noto Sans KR', data: fontData, weight: 700 as const, style: 'normal' as const }]
        : [];

    return new ImageResponse(
        renderCard(cardData, template, bg) as React.ReactElement,
        {
            width:  W,
            height: H,
            fonts,
        }
    );
}
