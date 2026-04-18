/**
 * [광고카드 이미지 생성기] /api/card/generate
 *
 * ⚠️ next/og(Satori)는 Edge Runtime 전용. Node.js runtime에서 렌더링 오류 발생.
 * ⚠️ supabase-js는 Edge runtime 미지원 → Supabase REST API 직접 fetch로 대체.
 *
 * Satori CSS 제약:
 *   - overflow:hidden 금지
 *   - border 단축형 금지 → borderWidth/Style/Color 개별 사용
 *   - Fragment(<>...</>) 금지 → <div> 래퍼 사용
 *   - flex:1 → flexGrow:1
 *   - letterSpacing 반드시 문자열 ('0.5px')
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const W = 1080;
const H = 1080;
const BRAND_PINK  = '#E91E8C';
const GOLD        = '#F5C842';
const TELEGRAM_CS = '@cocoalba_cs_bot';

// ─── Supabase REST (Edge 호환 — supabase-js 대체) ────────────────────────────

async function fetchShopFromDB(shopId: string): Promise<Record<string, any> | null> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey || !shopId) return null;

    try {
        const url = `${supabaseUrl}/rest/v1/shops?id=eq.${Number(shopId)}`
            + `&select=id,nickname,name,region,work_region_sub,manager_phone,title,pay,pay_type,category,category_sub,options`
            + `&limit=1`;
        const res = await fetch(url, {
            headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        });
        if (!res.ok) return null;
        const data: any[] = await res.json();
        return data[0] ?? null;
    } catch {
        return null;
    }
}

// ─── 폰트 로딩 (자체 서버 — public/fonts/ 번들, 외부 CDN 의존 제거) ──────────
// Edge runtime에서 외부 CDN 차단 시 폰트 로딩 실패 → Satori crash → 0 bytes 응답
// 해결: 폰트를 public/fonts/에 번들 → request.url 기반 자체 서버 fetch

async function loadFont(requestUrl: string): Promise<ArrayBuffer | null> {
    try {
        const fontUrl = new URL('/fonts/NotoSansKR-Bold-Korean.woff2', requestUrl).toString();
        const res = await fetch(fontUrl);
        if (res.ok) return res.arrayBuffer();
    } catch { /* 폰트 로딩 실패 시 Satori 빈 렌더링 */}
    return null;
}

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

// ─── 테마 ────────────────────────────────────────────────────────────────────

function makeTheme(isDark: boolean) {
    return {
        textPrimary: isDark ? '#FFFFFF'                : '#111827',
        textMuted:   isDark ? 'rgba(255,255,255,0.60)' : '#6B7280',
        pillBg:      isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
        pillBorderC: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.14)',
        sectionBg:   isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
        dividerC:    isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
    };
}

// ─── Row3 키워드 폴백 ─────────────────────────────────────────────────────────

function buildKeywordFallback(region: string, workType: string): string[] {
    const clean   = region.replace(/[\[\]]/g, '').trim();
    const parts   = clean.split(/[-\s]+/);
    const display = parts[1] || parts[0] || '';
    return [
        `${display}${workType}알바`,
        `${display}여자유흥알바`,
        `${display}여자고수익알바`,
    ].filter(k => k.trim().length > 4);
}

// ─── 공통 서브 컴포넌트 ───────────────────────────────────────────────────────

function TopBar({ bg, text, textColor }: { bg: string; text: string; textColor: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 32px', backgroundColor: bg }}>
            <span style={{ fontSize: 20, color: textColor, fontWeight: 700 }}>{text}</span>
        </div>
    );
}

function BottomBar({ bg, textColor }: { bg: string; textColor: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 32px', backgroundColor: bg }}>
            <span style={{ fontSize: 17, color: textColor, fontWeight: 700 }}>
                여성 구인구직은 코코알바 cocoalba.kr
            </span>
        </div>
    );
}

function ContactSection({ sectionBg, dividerC, textPrimary, textMuted }: {
    sectionBg: string; dividerC: string; textPrimary: string; textMuted: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 52px 20px', padding: '18px 24px', backgroundColor: sectionBg, borderRadius: 16 }}>
            <span style={{ fontSize: 20, color: BRAND_PINK, fontWeight: 700 }}>
                코코알바 문의 {TELEGRAM_CS}
            </span>
            <div style={{ display: 'flex', height: 1, backgroundColor: dividerC }} />
            <span style={{ fontSize: 13, color: textMuted }}>19세 미성년자 연락/출입금지 업소입니다.</span>
            <span style={{ fontSize: 18, color: textPrimary, fontWeight: 600 }}>코코알바에서 보고 전화드렸어요</span>
        </div>
    );
}

function TitleBox({ title, sectionBg, textPrimary, fontSize = 44 }: {
    title: string; sectionBg: string; textPrimary: string; fontSize?: number;
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 52px', padding: '28px 32px', backgroundColor: sectionBg, borderRadius: 20, flexGrow: 1 }}>
            <span style={{ fontSize, fontWeight: 900, color: textPrimary, textAlign: 'center', lineHeight: 1.35 }}>
                {title || '신규 구인 공고'}
            </span>
        </div>
    );
}

function AgePill({ text }: { text: string }) {
    return (
        <div style={{ display: 'flex', padding: '8px 22px', backgroundColor: '#3B82F6', borderRadius: 100 }}>
            <span style={{ fontSize: 20, color: '#FFFFFF', fontWeight: 700 }}>{text}</span>
        </div>
    );
}

function PayPill({ text, bg = BRAND_PINK, textColor = '#FFFFFF', size = 20 }: {
    text: string; bg?: string; textColor?: string; size?: number;
}) {
    return (
        <div style={{ display: 'flex', padding: '8px 22px', backgroundColor: bg, borderRadius: 100 }}>
            <span style={{ fontSize: size, color: textColor, fontWeight: 700 }}>{text}</span>
        </div>
    );
}

function CatPill({ text, pillBg, borderColor, textColor }: {
    text: string; pillBg: string; borderColor: string; textColor: string;
}) {
    return (
        <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: pillBg, borderRadius: 100, borderWidth: 2, borderStyle: 'solid', borderColor }}>
            <span style={{ fontSize: 17, color: textColor, fontWeight: 600 }}>{text}</span>
        </div>
    );
}

function KwPill({ text, pillBg, textColor }: { text: string; pillBg: string; textColor: string }) {
    return (
        <div style={{ display: 'flex', padding: '4px 14px', backgroundColor: pillBg, borderRadius: 100 }}>
            <span style={{ fontSize: 15, color: textColor }}>{`#${text.replace(/^#/, '')}`}</span>
        </div>
    );
}

// ─── 템플릿 렌더링 ───────────────────────────────────────────────────────────

function renderCard(data: CardData, template: string, bgKey: string) {
    const bgDef = BG_MAP[bgKey] ?? BG_MAP.white;
    const { dark: isDark } = bgDef;
    const t   = makeTheme(isDark);
    const rootBg = bgDef.grad
        ? { backgroundImage: bgDef.grad }
        : { backgroundColor: bgDef.bg ?? '#FFFFFF' };

    const WATERMARK = '여성 구인구직은 코코알바 cocoalba.kr';

    // ── Template A: 기본형 ────────────────────────────────────────────────────
    if (template === 'A') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, ...rootBg }}>
                <TopBar bg={BRAND_PINK} text={WATERMARK} textColor="#FFFFFF" />
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '32px 52px 20px' }}>
                    <span style={{ fontSize: 54, fontWeight: 900, color: t.textPrimary, lineHeight: 1.1 }}>{data.nickname}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary }}>{data.region}</span>
                        {data.subRegion
                            ? <span style={{ fontSize: 17, color: t.textMuted }}>{data.subRegion}</span>
                            : null}
                        {data.phone
                            ? <span style={{ fontSize: 18, color: BRAND_PINK, fontWeight: 700 }}>{data.phone}</span>
                            : null}
                    </div>
                </div>
                <TitleBox title={data.title} sectionBg={t.sectionBg} textPrimary={t.textPrimary} />
                {/* Pills */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 52px', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {data.age ? <AgePill text={data.age} /> : null}
                        {data.payDisplay ? <PayPill text={data.payDisplay} /> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {data.category ? <CatPill text={data.category} pillBg={t.pillBg} borderColor={t.pillBorderC} textColor={t.textPrimary} /> : null}
                        {data.categorySub ? <CatPill text={data.categorySub} pillBg={t.pillBg} borderColor={t.pillBorderC} textColor={t.textPrimary} /> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {data.keywords.slice(0, 5).map((kw, i) => <KwPill key={i} text={kw} pillBg={t.pillBg} textColor={t.textMuted} />)}
                    </div>
                </div>
                <ContactSection sectionBg={t.sectionBg} dividerC={t.dividerC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
                <BottomBar bg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} textColor={t.textMuted} />
            </div>
        );
    }

    // ── Template B: 강조형 (급여 대형) ────────────────────────────────────────
    if (template === 'B') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, ...rootBg }}>
                <TopBar bg={BRAND_PINK} text={WATERMARK} textColor="#FFFFFF" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 52px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 50, fontWeight: 900, color: t.textPrimary, lineHeight: 1.1 }}>{data.nickname}</span>
                        <span style={{ fontSize: 18, color: t.textMuted }}>{data.region}{data.subRegion ? ` · ${data.subRegion}` : ''}</span>
                    </div>
                    {data.phone
                        ? <div style={{ display: 'flex', padding: '10px 24px', backgroundColor: BRAND_PINK, borderRadius: 100 }}>
                            <span style={{ fontSize: 20, color: '#fff', fontWeight: 700 }}>{data.phone}</span>
                          </div>
                        : null}
                </div>
                <TitleBox title={data.title} sectionBg={t.sectionBg} textPrimary={t.textPrimary} fontSize={42} />
                <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 52px', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {data.age ? <AgePill text={data.age} /> : null}
                        {data.payDisplay
                            ? <div style={{ display: 'flex', padding: '12px 30px', backgroundColor: BRAND_PINK, borderRadius: 100, borderWidth: 3, borderStyle: 'solid', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)' }}>
                                <span style={{ fontSize: 28, color: '#FFFFFF', fontWeight: 900 }}>{data.payDisplay}</span>
                              </div>
                            : null}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {data.category ? <CatPill text={data.category} pillBg={t.pillBg} borderColor={t.pillBorderC} textColor={t.textPrimary} /> : null}
                        {data.categorySub ? <CatPill text={data.categorySub} pillBg={t.pillBg} borderColor={t.pillBorderC} textColor={t.textPrimary} /> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {data.keywords.slice(0, 5).map((kw, i) => <KwPill key={i} text={kw} pillBg={t.pillBg} textColor={t.textMuted} />)}
                    </div>
                </div>
                <ContactSection sectionBg={t.sectionBg} dividerC={t.dividerC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
                <BottomBar bg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} textColor={t.textMuted} />
            </div>
        );
    }

    // ── Template C: 프리미엄 (골드) ───────────────────────────────────────────
    if (template === 'C') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, ...rootBg }}>
                <TopBar bg={GOLD} text={`[ 여성 구인구직은 코코알바 cocoalba.kr ]`} textColor="#1a1a2e" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '28px 52px 16px' }}>
                    <span style={{ fontSize: 52, fontWeight: 900, color: t.textPrimary, lineHeight: 1.1 }}>{data.nickname}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary }}>{data.region}</span>
                        {data.subRegion ? <span style={{ fontSize: 16, color: t.textMuted }}>{data.subRegion}</span> : null}
                        {data.phone ? <span style={{ fontSize: 18, color: GOLD, fontWeight: 700 }}>{data.phone}</span> : null}
                    </div>
                </div>
                <div style={{ display: 'flex', height: 3, backgroundColor: GOLD, margin: '0 52px' }} />
                <TitleBox title={data.title} sectionBg={t.sectionBg} textPrimary={t.textPrimary} fontSize={42} />
                <div style={{ display: 'flex', flexDirection: 'column', padding: '18px 52px', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {data.age ? <AgePill text={data.age} /> : null}
                        {data.payDisplay ? <PayPill text={data.payDisplay} bg={GOLD} textColor="#1a1a2e" size={21} /> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {data.category
                            ? <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: t.pillBg, borderRadius: 100, borderWidth: 2, borderStyle: 'solid', borderColor: GOLD }}>
                                <span style={{ fontSize: 17, color: t.textPrimary, fontWeight: 600 }}>{data.category}</span>
                              </div>
                            : null}
                        {data.categorySub
                            ? <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: t.pillBg, borderRadius: 100, borderWidth: 2, borderStyle: 'solid', borderColor: GOLD }}>
                                <span style={{ fontSize: 17, color: t.textPrimary, fontWeight: 600 }}>{data.categorySub}</span>
                              </div>
                            : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {data.keywords.slice(0, 5).map((kw, i) => <KwPill key={i} text={kw} pillBg={t.pillBg} textColor={t.textMuted} />)}
                    </div>
                </div>
                <ContactSection sectionBg={t.sectionBg} dividerC={t.dividerC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
                <TopBar bg={GOLD} text={`[ 여성 구인구직은 코코알바 cocoalba.kr ]`} textColor="#1a1a2e" />
            </div>
        );
    }

    // ── Template D: 미니멀 ────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: W, height: H, ...rootBg }}>
            <TopBar bg={BRAND_PINK} text={WATERMARK} textColor="#FFFFFF" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 52px 24px', gap: 8 }}>
                <span style={{ fontSize: 58, fontWeight: 900, color: t.textPrimary, lineHeight: 1.0 }}>{data.nickname}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 18, color: t.textMuted }}>{data.region}</span>
                    {data.subRegion ? <span style={{ fontSize: 17, color: t.textMuted }}>{data.subRegion}</span> : null}
                    {data.phone ? <span style={{ fontSize: 18, color: BRAND_PINK, fontWeight: 700 }}>{data.phone}</span> : null}
                </div>
            </div>
            <div style={{ display: 'flex', height: 1, backgroundColor: t.dividerC, margin: '0 80px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '32px 80px' }}>
                <span style={{ fontSize: 46, fontWeight: 900, color: t.textPrimary, textAlign: 'center', lineHeight: 1.4 }}>
                    {data.title || '신규 구인 공고'}
                </span>
            </div>
            <div style={{ display: 'flex', height: 1, backgroundColor: t.dividerC, margin: '0 80px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 80px', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {data.age ? <AgePill text={data.age} /> : null}
                    {data.payDisplay ? <PayPill text={data.payDisplay} size={17} /> : null}
                    {data.category
                        ? <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: t.pillBg, borderRadius: 100, borderWidth: 1, borderStyle: 'solid', borderColor: t.pillBorderC }}>
                            <span style={{ fontSize: 16, color: t.textPrimary, fontWeight: 500 }}>{data.category}</span>
                          </div>
                        : null}
                    {data.categorySub
                        ? <div style={{ display: 'flex', padding: '6px 18px', backgroundColor: t.pillBg, borderRadius: 100, borderWidth: 1, borderStyle: 'solid', borderColor: t.pillBorderC }}>
                            <span style={{ fontSize: 16, color: t.textPrimary, fontWeight: 500 }}>{data.categorySub}</span>
                          </div>
                        : null}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {data.keywords.slice(0, 5).map((kw, i) => <KwPill key={i} text={kw} pillBg={t.pillBg} textColor={t.textMuted} />)}
                </div>
            </div>
            <ContactSection sectionBg={t.sectionBg} dividerC={t.dividerC} textPrimary={t.textPrimary} textMuted={t.textMuted} />
            <BottomBar bg={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} textColor={t.textMuted} />
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

    const payType = src.pay_type || params.get('payType') || '';
    const payRaw  = String(src.pay || params.get('pay') || '').trim();
    const payNum  = Number(payRaw.replace(/[^0-9]/g, ''));
    const payDisplay = payRaw
        ? payRaw === '면접후결정'
            ? '면접 후 결정+α'
            : `${payType ? payType + ' ' : ''}${isNaN(payNum) || payNum === 0 ? payRaw : payNum.toLocaleString() + '원'}+α`
        : '';

    const category    = (src.category     || params.get('category')    || '').trim();
    const categorySub = (src.category_sub || params.get('categorySub') || '').trim();

    const paySuffixes: string[] = Array.isArray(src.options?.paySuffixes) ? src.options.paySuffixes
        : (params.get('paySuffixes') || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const optKws: string[] = Array.isArray(src.options?.keywords) ? src.options.keywords
        : (params.get('keywords') || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const userKws = [...paySuffixes, ...optKws].filter(Boolean);
    const workType = src.category || params.get('workType') || '룸알바';
    const keywords = userKws.length > 0 ? userKws : buildKeywordFallback(region, workType);

    return { nickname, region, subRegion, phone, title, age, payDisplay, category, categorySub, keywords };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const shopId   = searchParams.get('shopId')    ?? '';
    const template = (searchParams.get('template') ?? 'A').toUpperCase();
    const bg       = searchParams.get('bg')         ?? 'white';

    // 폰트 + DB 병렬 로드 (폰트는 자체 서버 fetch — request.url 기반)
    const [fontData, shopData] = await Promise.all([
        loadFont(request.url),
        shopId ? fetchShopFromDB(shopId) : Promise.resolve(null),
    ]);

    const cardData = buildCardData(searchParams, shopData ?? undefined);

    // 폰트 로딩 실패 시 명시적 에러 반환 (0 bytes 응답 방지)
    if (!fontData) {
        return new Response(
            JSON.stringify({ error: 'Font load failed', fontUrl: new URL('/fonts/NotoSansKR-Bold-Korean.woff2', request.url).toString() }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const fonts = [{ name: 'NotoSansKR', data: fontData, weight: 700 as const, style: 'normal' as const }];

    // ?debug=1 → 폰트 없이 순색 박스 (Satori 기본 동작 확인)
    // ?debug=2 → 폰트 포함 간단 텍스트 (폰트 파싱 확인)
    const debugMode = searchParams.get('debug') ?? '';
    if (debugMode === '1') {
        // 텍스트·폰트 완전 제거 — 순색 박스만
        return new ImageResponse(
            <div style={{ display: 'flex', width: 1080, height: 1080, backgroundColor: '#E91E8C' }} />,
            { width: W, height: H, fonts: [] }
        );
    }
    if (debugMode === '2') {
        // 폰트 포함, 텍스트 포함
        return new ImageResponse(
            <div style={{ display: 'flex', width: 1080, height: 1080, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 80, color: '#fff', fontWeight: 700 }}>COCO OK</span>
            </div>,
            { width: W, height: H, fonts }
        );
    }

    return new ImageResponse(
        renderCard(cardData, template, bg),
        { width: W, height: H, fonts }
    );
}
