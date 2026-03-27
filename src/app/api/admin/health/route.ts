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
    const portoneSecret = process.env.PORTONE_API_SECRET;
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
    if (portoneSecret && storeId && channelKey) {
        components.portone = { status: 'healthy', message: '포트원 API 자격증명 설정 완료' };
    } else {
        const missing = [!portoneSecret && 'PORTONE_API_SECRET', !storeId && 'PORTONE_STORE_ID', !channelKey && 'PORTONE_CHANNEL_KEY'].filter(Boolean);
        components.portone = { status: 'warning', message: `포트원 미설정: ${missing.join(', ')} — 본인인증/결제 불가` };
        overall = setWorst(overall, 'warning');
    }

    // ── 12. 급여 뱃지 표준 검증 ──────────────────────────────────
    try {
        const expected = ['시', '일', '주', '월', '연', 'T', '건', '협'];
        const expectedColors = ['bg-cyan-500', 'bg-[#3B82F6]', 'bg-[#EC4899]', 'bg-[#7C3AED]', 'bg-[#EF4444]', 'bg-emerald-500', 'bg-emerald-500', 'bg-[#6B7280]'];
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

    // ── 13. 데이터 정규화 엔진 ───────────────────────────────────
    try {
        const result = normalizeAd({ shop_name: 'HealthTest', pay_amount: '999999', title: 'TestTitle' });
        if (!result || result.payAmount !== 999999) throw new Error('정규화 출력값 불일치');
        components.normalization = { status: 'healthy', message: '데이터 정규화 엔진 정상 작동' };
    } catch (err: any) {
        components.normalization = { status: 'error', message: `정규화 엔진 오류: ${err.message}` };
        overall = setWorst(overall, 'error');
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
