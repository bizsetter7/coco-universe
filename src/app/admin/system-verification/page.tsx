'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shop } from '@/types/shop';
import {
    AlertTriangle, CheckCircle, RefreshCcw, ExternalLink,
    BookOpen, Database, Shield, ShieldCheck, Search, Layout, MessageSquare, Copy, CheckCheck, Lock
} from 'lucide-react';

// ─── Supabase RLS SQL ──────────────────────────────────────────
// ✅ 2026-02-21 실제 적용 완료된 SQL
const SQL_ENABLE_RLS = `-- ✅ 적용 완료 (2026-02-21) — 수정본: status 컬럼 사용
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- shops: status = 'active'인 공고만 공개
CREATE POLICY "public_read_shops" ON shops
  FOR SELECT USING (status = 'active' OR status IS NULL);

-- community_posts: 비밀글 제외 공개
CREATE POLICY "public_read_posts" ON community_posts
  FOR SELECT USING (is_secret = false OR is_secret IS NULL);

-- 댓글: 전체 공개
CREATE POLICY "public_read_comments" ON community_comments
  FOR SELECT USING (true);

-- 글쓰기/댓글 쓰기 허용
CREATE POLICY "public_insert_posts" ON community_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_insert_comments" ON community_comments
  FOR INSERT WITH CHECK (true);

-- ※ 재적용 시 기존 정책 먼저 삭제:
-- DROP POLICY IF EXISTS "public_read_shops" ON shops;
-- DROP POLICY IF EXISTS "public_read_posts" ON community_posts;
-- DROP POLICY IF EXISTS "public_read_comments" ON community_comments;
-- DROP POLICY IF EXISTS "public_insert_posts" ON community_posts;
-- DROP POLICY IF EXISTS "public_insert_comments" ON community_comments;`;

const SQL_CHECK_RLS = `-- RLS 활성화 여부 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;`;

const SQL_CHECK_POLICIES = `-- 현재 적용된 정책 목록 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;`;


// ─── 복사 버튼 ─────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-700 transition">
            {copied ? <><CheckCheck size={12} /> 복사됨</> : <><Copy size={12} /> 복사</>}
        </button>
    );
}

// ─── 코드 블록 ─────────────────────────────────────────────────
function CodeBlock({ code, label }: { code: string; label?: string }) {
    return (
        <div className="mb-4">
            {label && <p className="text-xs font-black text-gray-500 mb-1 uppercase tracking-wider">{label}</p>}
            <div className="relative bg-gray-900 rounded-xl p-4 pr-24">
                <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">{code}</pre>
                <div className="absolute top-3 right-3">
                    <CopyButton text={code} />
                </div>
            </div>
        </div>
    );
}

// ─── SQL 문서 ─────────────────────────────────────────────────
const SQL_ADD_SEO_COLUMN = `-- community_posts 테이블에 SEO 키워드 컬럼 추가
ALTER TABLE community_posts
ADD COLUMN IF NOT EXISTS seo_keywords TEXT DEFAULT '';

-- 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'community_posts' AND column_name = 'seo_keywords';`;

const SQL_FULL_SCHEMA = `-- community_posts 전체 컬럼 구조
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'community_posts'
ORDER BY ordinal_position;`;

const SQL_COMMUNITY_HEALTH = `-- 커뮤니티 게시글 현황
SELECT
  category,
  COUNT(*) as total_posts,
  COUNT(CASE WHEN is_secret = true THEN 1 END) as secret_posts,
  AVG(COALESCE(views, 0))::int as avg_views
FROM community_posts
GROUP BY category
ORDER BY total_posts DESC;`;

const SQL_SEO_KEYWORDS_STATUS = `-- SEO 키워드 필드 현황 확인
SELECT
  id, title, category,
  LEFT(seo_keywords, 80) as seo_preview
FROM community_posts
WHERE seo_keywords IS NOT NULL AND seo_keywords != ''
ORDER BY created_at DESC
LIMIT 20;`;

// ─── 커뮤니티 규칙 데이터 ────────────────────────────────────
const COMMUNITY_RULES = [
    {
        icon: '📋',
        title: '카테고리 구조',
        items: [
            '전체 (all) - 모든 게시글 표시',
            '밤 문화 Talk (b2blife) - 일상·경험 공유',
            '언니들의 수다(썰) (talk) - 연애·공감 스토리 ★ 핵심',
            '같이일할단짝 (partner) - 파트너 모집',
            '중고거래 (market) - 물품 거래',
            '무료법률상담 (legal) - 법률 정보',
            '뷰티·패션·이벤트 (beauty) - 뷰티 정보',
            '프리미엄 라운지 (lounge) - 수입·성공 스토리',
        ]
    },
    {
        icon: '🔢',
        title: '수치 가이드라인 (자연스럽게 보이는 범위)',
        items: [
            '좋아요(likes): 일반 게시글 9~35 / 인기글 36~60 (최대 60)',
            '댓글(comments): 일반 2~15 / 인기글 16~31 (최대 31)',
            'isHot: likes 36+ 이상이거나 SNS 유입 예상 글에 부여',
            '과장 금지: 절대로 100 이상 값은 사용하지 않음 (비신뢰)',
        ]
    },
    {
        icon: '💾',
        title: '데이터 안전장치 (영속성 로직)',
        items: [
            'MOCK_POSTS는 community.ts에 하드코딩 → 절대 삭제 안 됨',
            'CommunityContent.tsx: DB 데이터 + Mock 데이터 병합 (Map 구조)',
            '병합 순서: Mock 먼저 → DB로 Override (DB 우선)',
            'DB 오류 시 localStorage 백업에서 복구',
            'sitemap.ts: Mock은 항상 포함 + DB게시글 1시간마다 갱신',
        ]
    },
    {
        icon: '🔍',
        title: 'SEO 자동화 규칙',
        items: [
            'sitemap.ts: Mock + DB 게시글 전부 포함 (1시간 revalidate)',
            'community/[id]/page.tsx: generateMetadata 자동 생성',
            'write/page.tsx: 저장 시 seo_keywords 자동 추출 후 DB 저장',
            '키워드 구성: 고정 기반어 + 카테고리별 키워드 + 제목 추출어',
            '구글/네이버 크롤러만 읽음 (유저에게 미노출)',
        ]
    },
    {
        icon: '💬',
        title: '댓글 시스템',
        items: [
            'DB 댓글 우선: community_comments 테이블 조회',
            '폴백: DB 댓글 0개 시 MOCK_COMMENTS에서 postId 필터링',
            '수정된 조건: commentData && commentData.length > 0 (빈배열 예외처리)',
            'MOCK_COMMENTS: 각 게시글당 2~6개 사전 설정 완료',
        ]
    },
    {
        icon: '✍️',
        title: '글쓰기 정책',
        items: [
            '비밀번호 필수: 4자리 이상 (수정/삭제 시 사용)',
            '비밀글 선택: is_secret 플래그',
            '포인트 지급: 로그인 유저 게시 시 200p 자동 적립',
            '이미지: 최대 3장 (로컬 URL → 추후 Storage 연동 예정)',
            'seo_keywords: 저장 시 자동 생성 (유저 액션 불필요)',
        ]
    },
];

// ─── Mock 게시글 ID 목록 ───────────────────────────────────────
const MOCK_POST_IDS = [1, 6, 17, 18, 33, 35, 40, 41, 42, 50, 51, 52, 53, 54, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95];

export default function SystemVerificationPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'issue'>('issue');
    const [activeTab, setActiveTab] = useState<'shops' | 'community'>('shops');

    const fetchShops = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('shops')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
        if (data) setShops(data as unknown as Shop[]);
        setLoading(false);
    };

    useEffect(() => { fetchShops(); }, []);

    const checkTitleIssue = (title: string, name: string) => (title || name).length > 26;
    const filteredShops = filter === 'issue'
        ? shops.filter(s => checkTitleIssue(s.title || '', s.name))
        : shops;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-8 bg-red-600 rounded-full"></span>
                    시스템 검증 센터
                </h1>
                <button onClick={fetchShops} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-bold text-sm">
                    <RefreshCcw size={16} /> 새로고침
                </button>
            </div>

            {/* 탭 */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 pb-0">
                <button
                    onClick={() => setActiveTab('shops')}
                    className={`flex items-center gap-2 px-5 py-2.5 font-black text-sm rounded-t-xl transition border-b-2 -mb-px ${activeTab === 'shops' ? 'border-red-500 text-red-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <Shield size={16} /> 공고 제목 규격 검증
                </button>
                <button
                    onClick={() => setActiveTab('community')}
                    className={`flex items-center gap-2 px-5 py-2.5 font-black text-sm rounded-t-xl transition border-b-2 -mb-px ${activeTab === 'community' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <BookOpen size={16} /> 커뮤니티 운영 매뉴얼
                </button>
            </div>

            {/* ── 탭 1: 공고 검증 (기존) ────────────────────────────── */}
            {activeTab === 'shops' && (
                <>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1 bg-red-50 p-4 rounded-xl border border-red-100">
                                <h3 className="text-red-700 font-black text-lg mb-1">규격 위반 의심 ({shops.filter(s => checkTitleIssue(s.title || '', s.name)).length}건)</h3>
                                <p className="text-red-900/70 text-sm font-bold">제목 길이 26자 초과 (모바일/PC 1줄 초과 위험)</p>
                            </div>
                            <div className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                                <h3 className="text-green-700 font-black text-lg mb-1">정상 규격 ({shops.filter(s => !checkTitleIssue(s.title || '', s.name)).length}건)</h3>
                                <p className="text-green-900/70 text-sm font-bold">제목 길이 26자 이내 안전</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => setFilter('issue')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${filter === 'issue' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>위반 의심 항목만 보기</button>
                            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${filter === 'all' ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>전체 보기</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-y border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="p-3 font-black w-[80px]">상태</th>
                                        <th className="p-3 font-black w-[200px]">상점/공고명</th>
                                        <th className="p-3 font-black">제목 (Length)</th>
                                        <th className="p-3 font-black w-[100px]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading...</td></tr>
                                    ) : filteredShops.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-bold">발견된 문제가 없습니다! Perfect! 🎉</td></tr>
                                    ) : (
                                        filteredShops.map(shop => {
                                            const title = shop.title || shop.name;
                                            const isIssue = checkTitleIssue(title, shop.name);
                                            return (
                                                <tr key={shop.id} className={`hover:bg-gray-50 transition ${isIssue ? 'bg-red-50/30' : ''}`}>
                                                    <td className="p-3">
                                                        {isIssue ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded-full"><AlertTriangle size={12} /> 위반</span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full"><CheckCircle size={12} /> 정상</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-sm text-gray-900 line-clamp-1">{shop.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono">{shop.id.split('-')[0]}...</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className={`font-bold text-sm mb-0.5 line-clamp-1 break-all ${isIssue ? 'text-red-600' : 'text-gray-700'}`}>{title}</div>
                                                        <div className={`text-[10px] font-mono font-bold ${isIssue ? 'text-red-500' : 'text-gray-400'}`}>Length: {title.length} / 26</div>
                                                    </td>
                                                    <td className="p-3">
                                                        <a href={`/shop/${shop.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                                                            <ExternalLink size={14} /> 확인
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-relaxed font-bold">
                        * 이 페이지는 운영자가 공고 제목의 길이를 모니터링하기 위해 생성되었습니다.<br />
                        * [공고등록 페이지]에서는 최대 26자로 입력이 제한되므로, 신규 공고는 안전합니다.<br />
                        * 기존 공고 중 26자를 초과하는 건에 대해서는 '위반'으로 표시되며, 필요 시 수동으로 수정 요청을 해야 합니다.
                    </div>
                </>
            )}

            {/* ── 탭 2: 커뮤니티 운영 매뉴얼 ────────────────────────── */}
            {activeTab === 'community' && (
                <div className="space-y-6">
                    {/* 개요 배너 */}
                    <div className="bg-gradient-to-r from-blue-500 to-rose-500 rounded-2xl p-6 text-white">
                        <h2 className="text-xl font-black mb-1">🌸 코코알바 커뮤니티 운영 완전 가이드</h2>
                        <p className="text-blue-100 text-sm font-bold">이 문서는 커뮤니티 시스템을 복구·복제·재설정할 때 필요한 모든 정보를 담고 있습니다.</p>
                        <div className="flex gap-3 mt-4 flex-wrap">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">Mock 게시글: {MOCK_POST_IDS.length}개</span>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black">MOCK IDs: [{MOCK_POST_IDS.join(', ')}]</span>
                        </div>
                    </div>

                    {/* 운영 규칙 카드들 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {COMMUNITY_RULES.map((rule) => (
                            <div key={rule.title} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-lg">{rule.icon}</span> {rule.title}
                                </h3>
                                <ul className="space-y-1.5">
                                    {rule.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                                            <span className="text-blue-400 font-black mt-0.5">›</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* 이중 관리 시스템 (Dual Management) */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl mb-6">
                        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-white" /> 이중 무결성 수호 체계 (Dual-Integrity)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all cursor-help" title="코코알바의 최상위 운영 원칙(v1.0 약속)을 담은 헌법 문서입니다.">
                                <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Principle 1. Artifact</div>
                                <div className="font-black text-sm mb-1 italic underline decoration-indigo-300">우리의 약속 (Our_Promises.md)</div>
                                <div className="text-[10px] text-white/70 leading-relaxed font-bold">
                                    v1.0 데이터 약속, 계정 미러링, 자산 분리 원칙 등 AI와 개발자가 지켜야 할 절대적 헌법.
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all cursor-help" title="개발 단계에서 코드 정합성을 지키기 위한 기술적 지침서입니다.">
                                <div className="text-[10px] font-black text-purple-200 uppercase tracking-widest mb-1">Principle 2. Codebase</div>
                                <div className="font-black text-sm mb-1 italic underline decoration-purple-300">SYSTEM_INTEGRITY_MANIFEST.md</div>
                                <div className="text-[10px] text-white/70 leading-relaxed font-bold">
                                    장애 발생 시 복구 매뉴얼, DB 컬럼 규격, API 통신 무결성 등 실무 기술 지침.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 파일 경로 가이드 */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Layout size={18} className="text-blue-500" /> 핵심 파일 경로
                        </h3>
                        <div className="space-y-2 font-mono text-xs">
                            {[
                                { path: 'src/constants/standards.ts', desc: '★ 통합 기술 표준 (Single Source of Truth)' },
                                { path: 'SYSTEM_INTEGRITY_MANIFEST.md', desc: '시스템 무결성 수호 기술 매니페스트' },
                                { path: 'src/app/admin/system-verification/page.tsx', desc: '현재 페이지 (시스템 검증 센터)' },
                                { path: 'src/constants/community.ts', desc: 'MOCK_POSTS · MOCK_COMMENTS · CATEGORIES 정의' },
                                { path: 'src/app/community/CommunityContent.tsx', desc: 'Mock+DB 병합 영속성 로직' },
                                { path: 'src/app/sitemap.ts', desc: 'Mock+DB 게시글 사이트맵 (1h 갱신)' },
                            ].map(({ path, desc }) => (
                                <div key={path} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <code className="text-blue-600 font-black shrink-0">{path}</code>
                                    <span className="text-gray-500">{desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DB SQL 섹션 */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Database size={18} className="text-green-500" /> Supabase SQL — 즉시 실행 가능
                        </h3>
                        <CodeBlock
                            label="🔧 STEP 1: seo_keywords 컬럼 추가 (Supabase SQL Editor에서 실행)"
                            code={SQL_ADD_SEO_COLUMN}
                        />
                        <CodeBlock
                            label="📊 STEP 2: community_posts 현황 조회"
                            code={SQL_COMMUNITY_HEALTH}
                        />
                        <CodeBlock
                            label="🔍 STEP 3: SEO 키워드 저장 현황 확인"
                            code={SQL_SEO_KEYWORDS_STATUS}
                        />
                        <CodeBlock
                            label="📋 전체 컬럼 구조 확인"
                            code={SQL_FULL_SCHEMA}
                        />
                    </div>

                    {/* SEO 자동화 작동 방식 */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Search size={18} className="text-purple-500" /> SEO 자동화 작동 흐름
                        </h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { step: '1', label: '유저가 글 작성', desc: 'write/page.tsx에서 제목+카테고리 분석' },
                                { step: '2', label: 'seo_keywords 자동 생성', desc: '고정어 + 카테고리어 + 제목 추출어 조합' },
                                { step: '3', label: 'DB 저장', desc: 'community_posts.seo_keywords에 숨김 저장' },
                                { step: '4', label: '크롤러 수집', desc: 'community/[id]/page.tsx의 keywords 메타태그 읽음' },
                                { step: '5', label: '사이트맵 반영', desc: 'sitemap.ts가 1시간마다 갱신하여 새 글 URL 등록' },
                            ].map(({ step, label, desc }) => (
                                <div key={step} className="flex items-center gap-4 p-3 bg-purple-50 rounded-xl">
                                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0">{step}</div>
                                    <div>
                                        <div className="font-black text-sm text-gray-900">{label}</div>
                                        <div className="text-xs text-gray-500 font-medium">{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 복제 체크리스트 */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <h3 className="font-black text-amber-800 mb-3 flex items-center gap-2">
                            <MessageSquare size={18} /> 새 사이트 복제 시 체크리스트
                        </h3>
                        <div className="space-y-2">
                            {[
                                'community.ts에서 MOCK_POSTS의 author·time 수정 (자연스러운 값으로)',
                                'Supabase에서 seo_keywords 컬럼 추가 (위 SQL 실행)',
                                'sitemap.ts의 baseUrl을 새 도메인으로 변경',
                                'CATEGORIES 목록을 사이트 타겟에 맞게 수정',
                                'MOCK_COMMENTS도 내용 수정 (복사 티 나지 않게)',
                                'write/page.tsx의 BASE_SEO 키워드를 새 사이트 브랜드명으로 변경',
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-amber-900 font-medium">
                                    <span className="w-5 h-5 border-2 border-amber-400 rounded shrink-0 mt-0.5"></span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 보안 섹션 */}
                    <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Lock size={18} className="text-red-500" /> 크롤링·해킹 방어 시스템
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                            {[
                                { icon: '✅', label: 'robots.txt', desc: '악성봇 명시적 차단', status: '✔ 적용 완료' },
                                { icon: '✅', label: 'middleware.ts', desc: '봇 UA 20종 차단 + Rate Limiting', status: '✔ 적용 완료' },
                                { icon: '✅', label: 'Supabase RLS', desc: 'DB 외부 탈취 방지', status: '✔ 적용 완료 (2026-02-21)' },
                                { icon: '✅', label: 'Cloudflare', desc: 'Bot Fight Mode + AI Labyrinth', status: '✔ 적용 완료 (2026-02-21)' },
                            ].map(({ icon, label, desc, status }) => (
                                <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <div className="text-lg mb-1">{icon}</div>
                                    <div className="font-black text-sm text-gray-900">{label}</div>
                                    <div className="text-xs text-gray-500">{desc}</div>
                                    <div className="text-xs font-bold text-blue-600 mt-1">{status}</div>
                                </div>
                            ))}
                        </div>
                        <CodeBlock
                            label="🔐 Supabase RLS 활성화 (SQL Editor에서 실행 — DB 보안 핵심)"
                            code={SQL_ENABLE_RLS}
                        />
                        <CodeBlock
                            label="🔎 RLS 적용 여부 확인"
                            code={SQL_CHECK_RLS}
                        />
                        <CodeBlock
                            label="📋 현재 정책 목록 조회"
                            code={SQL_CHECK_POLICIES}
                        />
                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                            <p className="text-xs font-black text-red-700 mb-1">⚠️ middleware.ts 차단 목록 (src/middleware.ts)</p>
                            <p className="text-xs text-red-600">python-requests, scrapy, curl, wget, ahrefsbot, semrushbot, gptbot, claudebot 등 20종 자동 차단</p>
                            <p className="text-xs text-red-600 mt-1">Rate Limit: 1분당 60회 초과 IP → 429 응답</p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-400 font-bold py-4">
                        최종 업데이트: 2026-02-21 · 코코알바 운영팀
                    </div>
                </div>
            )}
        </div>
    );
}
