/**
 * [광고카드 이미지 생성기] /api/card/generate
 *
 * next/og (Satori) 기반 1080×1080 PNG 생성
 * Satori 호환 규칙:
 *   - overflow: hidden 금지 (루트 렌더링 오류)
 *   - border 단축형 금지 → borderWidth/Style/Color 개별 사용
 *   - Fragment(<>...</>) 금지 → <div> 래퍼 사용
 *   - letterSpacing 문자열 필수 ('0.5px')
 *   - flexGrow: 1 사용 (flex: 1 대신)
 */

import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const W = 1080;
const H = 1080;
const BRAND_PINK = '#E91E8C';
const GOLD       = '#F5C842';
const TELEGRAM_CS = '@cocoalba_cs_bot';

// ─── Supabase ────────────────────────────────────────────────────────────────

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── 배경 팔레트 (18종) ───────────────────────────────────────────────────────

const BG_MAP: Record<string, { bg?: string; grad?: string; dark: boolean }> = {
    white:              { bg: '#FFFFFF',  dark: false },
    'light-gray':       { bg: '#F4F4F5',  dark: false },
    beige:              { bg: '#F5F0E8',  dark: false },
    cream:              { bg: '#FFF8E7',  dark: false },
    'light-pink':       { bg: '#FFF0F5',  dark: false },
    'light-purple':     { bg: '#F8F0FF',  dark: false },
    navy:               { bg: '#1a1a2e',  dark: true  },
    black:              { bg: '#0D0D0D',  dark: true  },
    'grad-pink-purple': { grad: 'linear-gradient(135deg,#FF6B9D 0%,#9B59B6 100%)', dark: true  },
    'grad-gold-orange': { grad: 'linear-gradient(135deg,#F39C12 0%,#E74C3C 100%)', dark: true  },
    'grad-navy-blue':   { grad: 'linear-gradient(135deg,#1a1a2e 0%,#0F3460 100%)', dark: true  },
    'grad-emerald':     { grad: 'linear-gradient(135deg,#00C853 0%,#00BCD4 100%)', dark: true  },
    'grad-rose-coral':  { grad: 'linear-gradient(135deg,#FF1744 0%,#FF8A65 100%)', dark: true  },
    'grad-dark-gray':   { grad: 'linear-gradient(135deg,#2D3436 0%,#636E72 100%)', dark: true  },
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
    age:         string;
    payDisplay:  string;
    category:    string;
    categorySub: string;
    keywords:    string[];
}

// ─── Row3 키워드 폴백 ─────────────────────────────────────────────────────────

function buildKeywordFallback(region: string, workType: string): string[] {
    const clean = region.replace(/[\[\]]/g, '').trim();
    const parts = clean.split(/[-\s]+/);
    const district = parts[1] || '';
    const city     = parts[0] || '';
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
        const res = await fetch(
            'https://fonts.bunny.net/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2'
        );
        if (res.ok) _fontCache = await res.arrayBuffer();
    } catch { /* 폴백 */ }
    return _fontCache;
}

// ─── 공통 스타일 팩토리 ───────────────────────────────────────────────────────

function makeTheme(isDark: boolean) {
    return {
        textPrimary:  isDark ? '#FFFFFF'                : '#111827',
        textMuted:    isDark ? 'rgba(255,255,255,0.60)' : '#6B7280',
        pillBg:       isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
        pillBorderC:  isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.14)',
        sectionBg:    isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
        dividerC:     isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
    };
}

// ─── 공통 서브 컴포넌트 ───────────────────────────────────────────────────────

function Pill({ text, bg, color, size = 20 }: { text: string; bg: string; color: string; size?: number }) {
    return (
        <div style={{ display: 'flex', padding: '8px 22px', backgroundColor: bg, borderRadius: 100 }}>
            <span style={{ fontSize: size, color, fontWeight: 700 }}>{text}</span>
        </div>
    );
}

function OutlinePill({ text, bg, borderColor, textColor, size = 17 }: {
    text: string; bg: string; borderColor: string; textColor: string; size?: number;
}) {
    return (
        <div style={{
            display: 'flex', padding: '6px 18px', backgroundColor: bg, borderRadius: 100,
            borderWidth: 2, borderStyle: 'solid', borderColor,
        }}>
            <span style={{ fontSize: size, color: textColor, fontWeight: 600 }}>{text}</span>
        </div>
    );
}

function KwPill({ text, bg, color }: { text: string; bg: string; color: string }) {
    return (
        <div style={{ display: 'flex', padding: '4px 14px', backgroundColor: bg, borderRadius: 100 }}>
            <span style={{ fontSize: 15, color }}>#{text.replace(/^#/, '')}</span>
        </div>
    );
}

function TopWatermark({ accentBg, textColor }: { accentBg: string; textColor: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 32px', backgroundColor: accentBg }}>
            <span style={{ fontSize: 20, color: textColor, fontWeight: 700, letterSpacing: '0.5px' }}>
                여성 구인구직은 코코알바 cocoalba.kr
            </span>
        </div>
    );
}

function ContactBlock({ sectionBg, dividerC, textPrimary, textMuted }: {
    sectionBg: string; dividerC: string; textPrimary: string; textMuted: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 52px 20px', padding: '18px 24px', backgroundColor: sectionBg, borderRadius: 16 }}>
            <span style={{ fontSize: 20, color: BRAND_PINK, fontWeight: 700 }}>
                💬 코코알바 문의 {TELEGRAM_CS}
            </span>
            <div style={{ display: 'flex', height: 1, backgroundColor: dividerC, marginTop: 2, marginBottom: 2 }} />
            <span style={{ fontSize: 13, color: textMuted }}>19세 미성년자 연락/출입금지 업소입니다.</span>
            <span style={{ fontSize: 18, color: textPrimary, fontWeight: 600 }}>코코알바에서 보고 전화드렸어요 →</span>
        </div>
    );
}

function BottomWatermark({ bg, textColor }: { bg: string; textColor: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 32px', backgroundColor: bg }}>
            <span style={{ fontSize: 17, color: textColor, fontWeight: 700 }}>
                여성 구인구직은 코코알바 cocoalba.kr
            </span>
        </div>
    );
}

function HeaderBlock({ nickname, region, subRegion, phone, textPrimary, textMuted, nickSize = 54 }: {
    nickname: string; region: string; subRegion: string; phone: string;
    textPrimary: string; textMuted: string; nickSize?: number;
}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '32px 52px 20px' }}>
            <span style={{ fontSize: nickSize, fontWeight: 900, color: textPrimary, lineHeight: 1.1 }}>
                {nickname}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: textPrimary }}>{region}</span>
                {subRegion ? <span style={{ fontSize: 17, color: textMuted }}>{subRegion}</span> : null}
                {phone ? <span style={{ fontSize: 18, color: BRAND_PINK, fontWeight: 700 }}>{phone}</span> : null}
            </div>
        </div>
    );
}

function TitleBanner({ title, sectionBg, textPrimary, fontSize = 44 }: {
    title: string; sectionBg: string; textPrimary: string; fontSize?: number;
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 52px', padding: '32px', backgroundColor: sectionBg, borderRadius: 20, flexGrow: 1 }}>
            <span style={{ fontSize, fontWeight: 900, color: textPrimary, textAlign: 'center', lineHeight: 1.35 }}>
                {title || '신규 구인 공고'}
            </span>
        </div>
    );
}

function PillRows({ data, pillBg, pillBorderC, textPrimary, textMuted }: {
    data: CardData; pillBg: string; pillBorderC: string; textPrimary: string; textMuted: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 52px', gap: 12 }}>
            {/* Row 1 */}
            <div style={{ display: 'flex', gap: 12 }}>
                {data.age ? <Pill text={data.age} bg="#3B82F6" color="#FFFFFF" /> : null}
                {data.payDisplay ? <Pill text={data.payDisplay} bg={BRAND_PINK} color="#FFFFFF" /> : null}
            </div>
            {/* Row 2 */}
            <div style={{ display: 'flex', gap: 10 }}>
                {data.category ? <OutlinePill text={data.category} bg={pillBg} borderColor={pillBorderC} textColor={textPrimary} /> : null}
                {data.categorySub ? <OutlinePill text={data.categorySub} bg={pillBg} borderColor={pillBorderC} textColor={textPrimary} /> : null}
            </div>
            {/* Row 3 */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {data.keywords.slice(0, 5).map((kw, i) => (
                    <KwPill key={i} text={kw} bg={pillBg} color={textMuted} />
                ))}
            </div>
        </div>
    );
}

// ─── 템플릿 렌더링 ───────────────────────────────────────────────────────────

function renderCard(data: CardData, template: string, bgKey: string) {
    const bgDef = BG_MAP[bgKey] ?? BG_MAP.white;
    const { dark: isDark } = bgDef;
    const t = makeTheme(isDark);
    const rootBg: Record<string, string> = bgDef.grad
        ? { backgroundImage: bgDef.grad }
        : { backgroundColor: bgDef.bg ?? '#FFFFFF' };

    // ── Template A: 기본형 ────────────────────────────────────────────────────
    if (template === 'A') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, ...rootBg }}>
                <TopWatermark accentBg={BRAND_PINK} textColor="#FFFFFF" />
                <HeaderBlock {...{ ...data, textPrimary: t.textPrimary, textMuted: t.textMuted }} />
                <TitleBanner title={data.title} sectionBg={t.sectionBg} textPrimary={t.textPrimary} />
                <PillRows data={data} pillBg={t.pillBg} pillBorderC={t.pillBorderC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
                <ContactBlock sectionBg={t.sectionBg} dividerC={t.dividerC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
                <BottomWatermark bg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} textColor={t.textMuted} />
            </div>
        );
    }

    // ── Template B: 강조형 (급여 대형) ────────────────────────────────────────
    if (template === 'B') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, ...rootBg }}>
                <TopWatermark accentBg={BRAND_PINK} textColor="#FFFFFF" />
                {/* Header — 닉네임 + 지역 한 행, 전화번호 우측 pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 52px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 50, fontWeight: 900, color: t.textPrimary, lineHeight: 1.1 }}>{data.nickname}</span>
                        <span style={{ fontSize: 18, color: t.textMuted }}>{data.region}{data.subRegion ? ` · ${data.subRegion}` : ''}</span>
                    </div>
                    {data.phone ? (
                        <div style={{ display: 'flex', padding: '10px 24px', backgroundColor: BRAND_PINK, borderRadius: 100 }}>
                            <span style={{ fontSize: 20, color: '#fff', fontWeight: 700 }}>{data.phone}</span>
                        </div>
                    ) : null}
                </div>
                <TitleBanner title={data.title} sectionBg={t.sectionBg} textPrimary={t.textPrimary} fontSize={42} />
                {/* Rows — 급여 pill 대형 */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 52px', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {data.age ? <Pill text={data.age} bg="#3B82F6" color="#FFFFFF" size={18} /> : null}
                        {data.payDisplay ? (
                            <div style={{
                                display: 'flex', padding: '12px 30px', backgroundColor: BRAND_PINK, borderRadius: 100,
                                borderWidth: 3, borderStyle: 'solid', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
                            }}>
                                <span style={{ fontSize: 28, color: '#FFFFFF', fontWeight: 900 }}>{data.payDisplay}</span>
                            </div>
                        ) : null}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {data.category ? <OutlinePill text={data.category} bg={t.pillBg} borderColor={t.pillBorderC} textColor={t.textPrimary} /> : null}
                        {data.categorySub ? <OutlinePill text={data.categorySub} bg={t.pillBg} borderColor={t.pillBorderC} textColor={t.textPrimary} /> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {data.keywords.slice(0, 5).map((kw, i) => (
                            <KwPill key={i} text={kw} bg={t.pillBg} color={t.textMuted} />
                        ))}
                    </div>
                </div>
                <ContactBlock sectionBg={t.sectionBg} dividerC={t.dividerC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
                <BottomWatermark bg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} textColor={t.textMuted} />
            </div>
        );
    }

    // ── Template C: 프리미엄 (골드 포인트) ───────────────────────────────────
    if (template === 'C') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, ...rootBg }}>
                {/* 골드 상단 바 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 32px', backgroundColor: GOLD }}>
                    <span style={{ fontSize: 18, color: '#1a1a2e', fontWeight: 900, letterSpacing: '1px' }}>
                        ✦ 여성 구인구직은 코코알바 cocoalba.kr ✦
                    </span>
                </div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 52px 16px' }}>
                    <span style={{ fontSize: 52, fontWeight: 900, color: t.textPrimary, lineHeight: 1.1 }}>{data.nickname}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary }}>{data.region}</span>
                        {data.subRegion ? <span style={{ fontSize: 16, color: t.textMuted }}>{data.subRegion}</span> : null}
                        {data.phone ? <span style={{ fontSize: 18, color: GOLD, fontWeight: 700 }}>{data.phone}</span> : null}
                    </div>
                </div>
                {/* 골드 라인 */}
                <div style={{ display: 'flex', height: 3, backgroundColor: GOLD, margin: '0 52px' }} />
                <TitleBanner title={data.title} sectionBg={t.sectionBg} textPrimary={t.textPrimary} fontSize={42} />
                {/* Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '18px 52px', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {data.age ? <Pill text={data.age} bg="#3B82F6" color="#FFFFFF" size={19} /> : null}
                        {data.payDisplay ? <Pill text={data.payDisplay} bg={GOLD} color="#1a1a2e" size={21} /> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {data.category ? (
                            <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: t.pillBg, borderRadius: 100, borderWidth: 2, borderStyle: 'solid', borderColor: GOLD }}>
                                <span style={{ fontSize: 17, color: t.textPrimary, fontWeight: 600 }}>{data.category}</span>
                            </div>
                        ) : null}
                        {data.categorySub ? (
                            <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: t.pillBg, borderRadius: 100, borderWidth: 2, borderStyle: 'solid', borderColor: GOLD }}>
                                <span style={{ fontSize: 17, color: t.textPrimary, fontWeight: 600 }}>{data.categorySub}</span>
                            </div>
                        ) : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {data.keywords.slice(0, 5).map((kw, i) => (
                            <KwPill key={i} text={kw} bg={t.pillBg} color={t.textMuted} />
                        ))}
                    </div>
                </div>
                <ContactBlock sectionBg={t.sectionBg} dividerC={t.dividerC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
                {/* 골드 하단 바 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 32px', backgroundColor: GOLD }}>
                    <span style={{ fontSize: 17, color: '#1a1a2e', fontWeight: 900 }}>✦ 여성 구인구직은 코코알바 cocoalba.kr ✦</span>
                </div>
            </div>
        );
    }

    // ── Template D: 미니멀 (중앙 정렬, 여백) ─────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, ...rootBg }}>
            <TopWatermark accentBg={BRAND_PINK} textColor="#FFFFFF" />
            {/* 닉네임 + 지역 중앙 정렬 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 52px 24px', gap: 8 }}>
                <span style={{ fontSize: 58, fontWeight: 900, color: t.textPrimary, lineHeight: 1.0 }}>{data.nickname}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 18, color: t.textMuted }}>{data.region}</span>
                    {data.subRegion ? <span style={{ fontSize: 17, color: t.textMuted }}>{data.subRegion}</span> : null}
                    {data.phone ? <span style={{ fontSize: 18, color: BRAND_PINK, fontWeight: 700 }}>{data.phone}</span> : null}
                </div>
            </div>
            {/* 구분선 */}
            <div style={{ display: 'flex', height: 1, backgroundColor: t.dividerC, margin: '0 80px' }} />
            {/* 타이틀 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '32px 80px' }}>
                <span style={{ fontSize: 46, fontWeight: 900, color: t.textPrimary, textAlign: 'center', lineHeight: 1.4 }}>
                    {data.title || '신규 구인 공고'}
                </span>
            </div>
            {/* 구분선 */}
            <div style={{ display: 'flex', height: 1, backgroundColor: t.dividerC, margin: '0 80px' }} />
            {/* Pills 중앙 정렬 */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 80px', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {data.age ? <Pill text={data.age} bg="#3B82F6" color="#FFFFFF" size={17} /> : null}
                    {data.payDisplay ? <Pill text={data.payDisplay} bg={BRAND_PINK} color="#FFFFFF" size={17} /> : null}
                    {data.category ? (
                        <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: t.pillBg, borderRadius: 100, borderWidth: 1, borderStyle: 'solid', borderColor: t.pillBorderC }}>
                            <span style={{ fontSize: 16, color: t.textPrimary, fontWeight: 500 }}>{data.category}</span>
                        </div>
                    ) : null}
                    {data.categorySub ? (
                        <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: t.pillBg, borderRadius: 100, borderWidth: 1, borderStyle: 'solid', borderColor: t.pillBorderC }}>
                            <span style={{ fontSize: 16, color: t.textPrimary, fontWeight: 500 }}>{data.categorySub}</span>
                        </div>
                    ) : null}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {data.keywords.slice(0, 5).map((kw, i) => (
                        <KwPill key={i} text={kw} bg={t.pillBg} color={t.textMuted} />
                    ))}
                </div>
            </div>
            <ContactBlock sectionBg={t.sectionBg} dividerC={t.dividerC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
            <BottomWatermark bg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} textColor={t.textMuted} />
        </div>
    );
}

// ─── 카드 데이터 빌드 ─────────────────────────────────────────────────────────

function buildCardData(params: URLSearchParams, shop?: Record<string, any>): CardData {
    const src = shop ?? {};

    const rawNick   = (src.nickname || params.get('nickname') || src.name || params.get('name') || '업체명').trim();
    const nickname  = rawNick.length > 10 ? rawNick.slice(0, 10) + '...' : rawNick;
    const region    = (src.region          || params.get('region')    || '').replace(/[\[\]]/g, '').trim();
    const subRegion = (src.work_region_sub || params.get('subRegion') || '').trim();
    const phone     = (src.manager_phone   || params.get('phone')     || '').trim();
    const title     = (src.title           || params.get('title')     || '').trim();

    const ageMin = String(src.options?.ageMin || params.get('ageMin') || '');
    const ageMax = String(src.options?.ageMax || params.get('ageMax') || '');
    const age    = ageMin && ageMax ? `${ageMin}~${ageMax}대` : ageMin ? `${ageMin}대 이상` : '';

    const payType    = src.pay_type || params.get('payType') || '';
    const payRaw     = String(src.pay || params.get('pay') || '').trim();
    const payNum     = Number(payRaw.replace(/[^0-9]/g, ''));
    const payDisplay = payRaw
        ? payRaw === '면접후결정'
            ? '면접 후 결정+α'
            : `${payType ? payType + ' ' : ''}${isNaN(payNum) || payNum === 0 ? payRaw : payNum.toLocaleString() + '원'}+α`
        : '';

    const category    = (src.category     || params.get('category')    || '').trim();
    const categorySub = (src.category_sub || params.get('categorySub') || '').trim();

    const paySuffixes: string[] = Array.isArray(src.options?.paySuffixes)
        ? src.options.paySuffixes
        : (params.get('paySuffixes') || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const optKws: string[] = Array.isArray(src.options?.keywords)
        ? src.options.keywords
        : (params.get('keywords') || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const userKws = [...paySuffixes, ...optKws].filter(Boolean);

    const workType = src.category || params.get('workType') || '룸알바';
    const keywords = userKws.length > 0 ? userKws : buildKeywordFallback(region, workType);

    return { nickname, region, subRegion, phone, title, age, payDisplay, category, categorySub, keywords };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const shopId   = searchParams.get('shopId')    ?? '';
        const template = (searchParams.get('template') ?? 'A').toUpperCase();
        const bg       = searchParams.get('bg')         ?? 'white';

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
            renderCard(cardData, template, bg),
            { width: W, height: H, fonts }
        );
    } catch (err: any) {
        console.error('[card/generate]', err);
        return NextResponse.json({ ok: false, error: String(err?.message ?? err) }, { status: 500 });
    }
}
