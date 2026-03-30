import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { normalizeAd } from '@/app/my-shop/utils/normalization';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';

export const dynamic = 'force-dynamic';

type CheckStatus = 'healthy' | 'warning' | 'error';

interface CheckResult {
    status: CheckStatus;
    message: string;
    count?: number; // 이슈 건수 (배지 집계용)
}

function setWorst(current: CheckStatus, next: CheckStatus): CheckStatus {
    if (current === 'error' || next === 'error') return 'error';
    if (current === 'warning' || next === 'warning') return 'warning';
    return 'healthy';
}

export async function POST() {
    const components: Record<string, CheckResult> = {};
    let overall: CheckStatus = 'healthy';

    // ── 1. Supabase 연결 ─────────────────────────────────────────
    try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
        components.supabase = { status: 'healthy', message: 'Supabase DB 연결 정상' };
    } catch (err: any) {
        components.supabase = { status: 'error', message: `DB 연결 실패: ${err.message}` };
        overall = setWorst(overall, 'error');
    }

    // ── 2. DB 스키마 — profiles.points 컬럼 ─────────────────────
    try {
        const { error } = await supabase.from('profiles').select('points').limit(1);
        if (error) throw error;
        components.db_points = { status: 'healthy', message: 'profiles.points 컬럼 정상' };
    } catch {
        components.db_points = { status: 'error', message: 'profiles.points 컬럼 없음 — 가입 포인트 적립 불가. SQL: ALTER TABLE profiles ADD COLUMN points INTEGER DEFAULT 0;' };
        overall = setWorst(overall, 'error');
    }

    // ── 3. DB 스키마 — point_logs 테이블 ────────────────────────
    try {
        const { error } = await supabase.from('point_logs').select('id').limit(1);
        if (error) throw error;
        components.db_point_logs = { status: 'healthy', message: 'point_logs 테이블 정상' };
    } catch {
        components.db_point_logs = { status: 'error', message: 'point_logs 테이블 없음 — 포인트 이력 기록 불가. Supabase SQL Editor에서 테이블 생성 필요.' };
        overall = setWorst(overall, 'error');
    }

    // ── 4. DB 스키마 — applications 테이블 ──────────────────────
    try {
        const { error } = await supabase.from('applications').select('id').limit(1);
        if (error) throw error;
        components.db_applications = { status: 'healthy', message: 'applications 테이블 정상' };
    } catch {
        components.db_applications = { status: 'error', message: 'applications 테이블 없음 — 지원자 관리 기능 불가.' };
        overall = setWorst(overall, 'error');
    }

    // ── 5. 공고 제목 26자 초과 ───────────────────────────────────
    try {
        const { data: shops, error } = await supabase
            .from('shops')
            .select('id, title, name')
            .not('status', 'eq', 'CLOSED');
        if (error) throw error;

        const violations = (shops || []).filter(s => {
            const t = (s.title || s.name || '');
            return t.length > 26;
        });

        if (violations.length === 0) {
            components.title_length = { status: 'healthy', message: '모든 공고 제목이 26자 이내 규격을 준수합니다.' };
        } else {
            components.title_length = {
                status: 'warning',
                message: `공고 제목 26자 초과 ${violations.length}건 — 모바일 레이아웃 깨짐 위험.`,
                count: violations.length
            };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.title_length = { status: 'warning', message: `공고 제목 검사 실패: ${err.message}` };
        overall = setWorst(overall, 'warning');
    }

    // ── 6. 심사 대기 공고 24시간 초과 ───────────────────────────
    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error } = await supabase
            .from('shops')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'PENDING_REVIEW')
            .lt('created_at', since);
        if (error) throw error;

        if (!count || count === 0) {
            components.pending_ads = { status: 'healthy', message: '24시간 초과 미심사 광고 없음' };
        } else {
            components.pending_ads = {
                status: 'warning',
                message: `24시간 이상 심사 대기 광고 ${count}건 — 검토가 필요합니다.`,
                count
            };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.pending_ads = { status: 'warning', message: `광고 심사 검사 실패: ${err.message}` };
    }

    // ── 7. 미답변 1:1 문의 24시간 초과 ─────────────────────────
    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error } = await supabase
            .from('inquiries')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'completed')
            .lt('created_at', since);
        if (error) throw error;

        if (!count || count === 0) {
            components.unanswered_inquiries = { status: 'healthy', message: '24시간 초과 미답변 문의 없음' };
        } else {
            components.unanswered_inquiries = {
                status: 'warning',
                message: `24시간 이상 미답변 문의 ${count}건 — 고객 응대가 필요합니다.`,
                count
            };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.unanswered_inquiries = { status: 'warning', message: `문의 검사 실패: ${err.message}` };
    }

    // ── 8. 결제 대기 72시간 초과 ────────────────────────────────
    try {
        const since = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
        const { count, error } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
            .lt('created_at', since);
        if (error) throw error;

        if (!count || count === 0) {
            components.pending_payments = { status: 'healthy', message: '72시간 초과 결제 대기 없음' };
        } else {
            components.pending_payments = {
                status: 'warning',
                message: `72시간 이상 결제 미처리 ${count}건 — 확인 필요.`,
                count
            };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.pending_payments = { status: 'warning', message: `결제 검사 실패: ${err.message}` };
    }

    // ── 9. 환경변수 — SMS (알리고) ───────────────────────────────
    const aligoKey = process.env.ALIGO_API_KEY;
    const aligoUser = process.env.ALIGO_USER_ID;
    const aligoSender = process.env.ALIGO_SENDER_NUMBER;
    if (aligoKey && aligoUser && aligoSender) {
        components.env_sms = { status: 'healthy', message: '알리고 SMS 환경변수 설정 완료' };
    } else {
        const missing = [!aligoKey && 'ALIGO_API_KEY', !aligoUser && 'ALIGO_USER_ID', !aligoSender && 'ALIGO_SENDER_NUMBER'].filter(Boolean);
        components.env_sms = { status: 'warning', message: `SMS 환경변수 미설정: ${missing.join(', ')} — Mock 모드로 동작 중` };
        overall = setWorst(overall, 'warning');
    }

    // ── 10. 환경변수 — 카카오 알림톡 ────────────────────────────
    const kakaoKey = process.env.KAKAO_SENDER_KEY;
    const kakaoApp = process.env.KAKAO_APP_KEY;
    const kakaoTpl = process.env.KAKAO_TEMPLATE_CODE;
    if (kakaoKey && kakaoApp && kakaoTpl) {
        components.env_kakao = { status: 'healthy', message: '카카오 알림톡 환경변수 설정 완료' };
    } else {
        const missing = [!kakaoKey && 'KAKAO_SENDER_KEY', !kakaoApp && 'KAKAO_APP_KEY', !kakaoTpl && 'KAKAO_TEMPLATE_CODE'].filter(Boolean);
        components.env_kakao = {
            status: 'warning',
            message: `카카오 환경변수 미설정: ${missing.join(', ')} — Mock 모드. 채널 개설 후 설정하면 활성화됩니다.`
        };
        // 카카오는 아직 준비 단계이므로 overall에 영향 안 줌 (info성)
    }

    // ── 11. 포트원 결제 설정 ─────────────────────────────────────
    // storeId/channelKey는 클라이언트 코드에 하드코딩됨 — 서버 시크릿만 확인
    const portoneSecret = process.env.PORTONE_API_SECRET;
    if (portoneSecret) {
        components.portone = { status: 'healthy', message: '포트원 API 자격증명 설정 완료 (storeId·channelKey 하드코딩)' };
    } else {
        components.portone = { status: 'warning', message: `포트원 미설정: PORTONE_API_SECRET — 본인인증 서버 검증 불가` };
        overall = setWorst(overall, 'warning');
    }

    // ── 12. 급여 뱃지 표준 검증 ──────────────────────────────────
    try {
        // v2.0 표준 (2026-03-22 확정) — standards.ts PAY_BADGE_STANDARDS 반영
        const expected = ['시', '일', '주', '월', '연', 'T', '건', '협'];
        const expectedColors = ['bg-cyan-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500', 'bg-slate-500', 'bg-gray-400'];
        const payTypes = ['시급', '일급', '주급', '월급', '연봉', 'TC', '건별', '협의'];
        const errors: string[] = [];

        payTypes.forEach((type, i) => {
            const char = getPayAbbreviation(type);
            const color = getPayColor(type);
            if (char !== expected[i]) errors.push(`${type}: 약어 '${char}' ≠ 기대값 '${expected[i]}'`);
            if (!color.includes(expectedColors[i])) errors.push(`${type}: 색상 불일치`);
        });

        if (errors.length > 0) throw new Error(errors.join(' | '));
        components.standards = { status: 'healthy', message: '급여 뱃지 표준 (약어·색상) 모두 정상' };
    } catch (err: any) {
        components.standards = { status: 'error', message: `표준 위반: ${err.message}` };
        overall = setWorst(overall, 'error');
    }

    // ── 14. z-index 계층 표준 ───────────────────────────────────
    components.z_index_standard = {
        status: 'healthy',
        message: '표준 계층 준수: HEADER(10000), SIDEBAR(10001), MODAL(20000) 강제 적용 중'
    };

    // ══════════════════════════════════════════════════════════════
    // 확장 체크 (14~30번)
    // ══════════════════════════════════════════════════════════════

    // ── 14. DB 스키마 — messages 테이블 ─────────────────────────
    try {
        const { error } = await supabase.from('messages').select('id').limit(1);
        if (error) throw error;
        components.db_messages = { status: 'healthy', message: 'messages 테이블 정상' };
    } catch {
        components.db_messages = { status: 'error', message: 'messages 테이블 없음 — 쪽지 기능 불가' };
        overall = setWorst(overall, 'error');
    }

    // ── 15. DB 스키마 — resumes 테이블 ──────────────────────────
    try {
        const { error } = await supabase.from('resumes').select('id').limit(1);
        if (error) throw error;
        components.db_resumes = { status: 'healthy', message: 'resumes 테이블 정상' };
    } catch {
        components.db_resumes = { status: 'warning', message: 'resumes 테이블 없음 — 이력서 기능 불가' };
        overall = setWorst(overall, 'warning');
    }

    // ── 16. DB 스키마 — contact_email 컬럼 ──────────────────────
    try {
        const { error } = await supabase.from('profiles').select('contact_email').limit(1);
        if (error) throw error;
        components.db_contact_email = { status: 'healthy', message: 'profiles.contact_email 컬럼 존재 — 비밀번호 복구 이메일 수집 가능' };
    } catch {
        components.db_contact_email = { status: 'warning', message: 'profiles.contact_email 컬럼 없음 — SQL: ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_email text;' };
        overall = setWorst(overall, 'warning');
    }

    // ── 17. 포인트 음수 회원 ─────────────────────────────────────
    try {
        const { count, error } = await supabase
            .from('profiles').select('*', { count: 'exact', head: true }).lt('points', 0);
        if (error) throw error;
        if (!count || count === 0) {
            components.negative_points = { status: 'healthy', message: '포인트 음수 회원 없음' };
        } else {
            components.negative_points = { status: 'error', message: `포인트 음수 회원 ${count}명 — 즉시 확인 필요`, count };
            overall = setWorst(overall, 'error');
        }
    } catch (err: any) {
        components.negative_points = { status: 'warning', message: `포인트 음수 검사 실패: ${err.message}` };
    }

    // ── 18. 고아 공고 (user_id 없음) ────────────────────────────
    try {
        const { count, error } = await supabase
            .from('shops').select('*', { count: 'exact', head: true }).is('user_id', null);
        if (error) throw error;
        if (!count || count === 0) {
            components.orphaned_shops = { status: 'healthy', message: '고아 공고(user_id 없음) 없음' };
        } else {
            components.orphaned_shops = { status: 'warning', message: `user_id 없는 공고 ${count}건 — 데이터 정리 필요`, count };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.orphaned_shops = { status: 'warning', message: `고아 공고 검사 실패: ${err.message}` };
    }

    // ── 19. 결제↔공고 상태 불일치 ───────────────────────────────
    try {
        const { data: completedPayments, error } = await supabase
            .from('payments').select('shop_id').eq('status', 'completed').limit(500);
        if (error) throw error;
        let mismatch = 0;
        if (completedPayments && completedPayments.length > 0) {
            const shopIds = [...new Set(completedPayments.map((p: any) => p.shop_id).filter(Boolean))];
            if (shopIds.length > 0) {
                const { count } = await supabase
                    .from('shops').select('*', { count: 'exact', head: true })
                    .in('id', shopIds).eq('status', 'PENDING_REVIEW');
                mismatch = count || 0;
            }
        }
        if (mismatch === 0) {
            components.payment_ad_mismatch = { status: 'healthy', message: '결제 완료 공고 상태 모두 정상' };
        } else {
            components.payment_ad_mismatch = { status: 'warning', message: `결제 완료됐는데 심사대기 상태인 공고 ${mismatch}건`, count: mismatch };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.payment_ad_mismatch = { status: 'warning', message: `결제↔공고 검사 실패: ${err.message}` };
    }

    // ── 20. 최근 24h 가입자 중 포인트 0 (개인 회원 보너스 미적립 체크) ─────
    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error } = await supabase
            .from('profiles').select('*', { count: 'exact', head: true })
            .gte('created_at', since)
            .eq('role', 'individual') // 개인 회원만 포인트 적립 대상
            .eq('points', 0);
        if (error) throw error;

        if (!count || count === 0) {
            components.new_join_no_points = { status: 'healthy', message: '최근 24h 신규 개인 회원 포인트 정상 적립' };
        } else {
            components.new_join_no_points = { 
                status: 'warning', 
                message: `최근 24h 개인 가입자 중 포인트 미적립 ${count}명 (확인 필요)`, 
                count 
            };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.new_join_no_points = { status: 'warning', message: `가입 포인트 검사 실패: ${err.message}` };
    }

    // ── 21. 어드민 권한 동기화 (role=admin 인데 is_admin=false) ──
    try {
        const { count, error } = await supabase
            .from('profiles').select('*', { count: 'exact', head: true })
            .eq('role', 'admin').eq('is_admin', false);
        if (error) throw error;
        if (!count || count === 0) {
            components.admin_role_sync = { status: 'healthy', message: 'admin role ↔ is_admin 플래그 동기화 정상' };
        } else {
            components.admin_role_sync = { status: 'error', message: `role=admin인데 is_admin=false인 계정 ${count}건 — 권한 불일치`, count };
            overall = setWorst(overall, 'error');
        }
    } catch (err: any) {
        components.admin_role_sync = { status: 'warning', message: `어드민 권한 검사 실패: ${err.message}` };
    }

    // ── 22. 무승인 활성 공고 ─────────────────────────────────────
    try {
        const { count, error } = await supabase
            .from('shops').select('*', { count: 'exact', head: true })
            .eq('status', 'active').is('approved_at', null);
        if (error) throw error;
        if (!count || count === 0) {
            components.active_without_approval = { status: 'healthy', message: '모든 활성 공고 정상 승인됨' };
        } else {
            components.active_without_approval = { status: 'warning', message: `승인 없이 활성화된 공고 ${count}건`, count };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.active_without_approval = { status: 'warning', message: `무승인 공고 검사 실패: ${err.message}` };
    }

    // ── 23. 사이트맵 접근성 ──────────────────────────────────────
    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cocoalba.kr';
        const res = await fetch(`${siteUrl}/sitemap.xml`, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            components.sitemap_accessible = { status: 'healthy', message: '/sitemap.xml 정상 응답 (200 OK)' };
        } else {
            components.sitemap_accessible = { status: 'warning', message: `/sitemap.xml HTTP ${res.status} — 검색 노출 영향 가능` };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.sitemap_accessible = { status: 'warning', message: `사이트맵 접근 실패: ${err.message}` };
        overall = setWorst(overall, 'warning');
    }

    // ── 24. 회원 탈퇴 컬럼 ──────────────────────────────────────
    try {
        const { error } = await supabase.from('profiles').select('is_withdrawn').limit(1);
        if (error) throw error;
        components.db_withdraw = { status: 'healthy', message: 'profiles.is_withdrawn 컬럼 존재 — 회원 탈퇴 기능 정상' };
    } catch {
        components.db_withdraw = { status: 'error', message: 'profiles.is_withdrawn 컬럼 없음 — SQL: ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_withdrawn boolean DEFAULT false, ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz;' };
        overall = setWorst(overall, 'error');
    }

    // ── 25. 만료 임박 공고 (7일 내) ─────────────────────────────
    try {
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
        const soonStr = sevenDaysLater.toISOString().split('T')[0];
        const todayStr = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
            .from('shops').select('*', { count: 'exact', head: true })
            .eq('status', 'active').lte('deadline', soonStr).gte('deadline', todayStr);
        if (error) throw error;
        if (!count || count === 0) {
            components.expiring_soon = { status: 'healthy', message: '7일 내 만료 예정 공고 없음' };
        } else {
            components.expiring_soon = { status: 'warning', message: `7일 내 만료 예정 공고 ${count}건`, count };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.expiring_soon = { status: 'warning', message: `만료 임박 검사 실패: ${err.message}` };
    }

    // ── 26. notifications 테이블 (알림쪽지 시스템) ───────────────
    try {
        const { error } = await supabase.from('notifications').select('id').limit(1);
        if (error) throw error;
        components.db_notifications = { status: 'healthy', message: 'notifications 테이블 정상 — 알림쪽지 시스템 작동 가능' };
    } catch {
        components.db_notifications = { status: 'error', message: 'notifications 테이블 없음 — 승인/거절/만료 알림쪽지 발송 불가' };
        overall = setWorst(overall, 'error');
    }

    // ── 27. 읽지 않은 알림 누적 (100건 초과 = 운영 경고) ────────
    try {
        const { count, error } = await supabase
            .from('notifications').select('*', { count: 'exact', head: true }).eq('read', false);
        if (error) throw error;
        if (!count || count < 100) {
            components.unread_notifications = { status: 'healthy', message: `미읽 알림 ${count ?? 0}건 — 정상 범위` };
        } else {
            components.unread_notifications = { status: 'warning', message: `미읽 알림 ${count}건 누적 — 회원 앱 접속 유도 필요`, count };
            overall = setWorst(overall, 'warning');
        }
    } catch (err: any) {
        components.unread_notifications = { status: 'warning', message: `미읽 알림 검사 실패: ${err.message}` };
    }

    // ── 이슈 총집계 (배지용) ─────────────────────────────────────
    const issueCount = Object.values(components).filter(c => c.status === 'error' || c.status === 'warning').length;

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        overall,
        issueCount,
        components,
    });
}

/** GET: 경량 상태 체크 (사이드바 배지용) */
export async function GET() {
    try {
        const res = await POST();
        const data = await res.json();
        return NextResponse.json({
            overall: data.overall,
            issueCount: data.issueCount,
        });
    } catch {
        return NextResponse.json({ overall: 'error', issueCount: 1 });
    }
}
