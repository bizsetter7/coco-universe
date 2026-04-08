# CLAUDE_P2.md — P2 코코알바 에이전트 핸드오버 가이드

> **최종 업데이트**: 2026-04-08
> **용도**: 새 에이전트(Claude Code / Antigravity) 세션 시작 시 즉시 컨텍스트 획득용
>
> **[필독] 작업 시작 전 반드시 읽어야 할 선행 문서**
> 1. `C:\My-site\p1.choco-idea\MISTAKES_LOG.md` — 공통 실수 방지 체크리스트 ⭐
> 2. `C:\My-site\p1.choco-idea\AI_SOP.md` — 전사 운영 철학 + 절대 수칙
> 3. `C:\My-site\p1.choco-idea\SEO_GEO_MASTERY_LOG.md` — SEO/GEO 베스트프랙티스
> 4. `C:\My-site\p2.브랜드_통합_시스템\CLAUDE.md` — 이 파일 (P2 기술 가이드)

---

## 🗺️ 프로젝트 기본 정보

| 항목 | 값 |
|------|-----|
| 코드명 | P2 코코알바 |
| 경로 | `C:\My-site\p2.브랜드_통합_시스템` |
| GitHub | `bizsetter7/coco-universe` |
| 프로덕션 도메인 | `www.cocoalba.kr` |
| 프레임워크 | Next.js 15 (App Router) + Supabase + Vercel |
| 스타일 | Tailwind CSS v4 |

---

## ⚡ 자주 쓰는 명령어

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드 (배포 전 반드시 확인)
npm run lint      # ESLint 검사

# E2E 테스트 (GitHub Actions 전용 — Vercel 서버리스에서 실행 불가)
pytest tests/e2e/ -v --html=reports/e2e-report.html
```

---

## 🏗️ 핵심 아키텍처

### 인증 구조 (중요)
```
Supabase Auth (세션) ← 실제 로그인
        ↓
middleware.ts      ← 봇차단/Rate Limit만 담당 (어드민 리다이렉트 비활성)
        ↓
AdminLayout.tsx    ← 클라이언트 어드민 인증 체크
API routes         ← requireAdmin() 가드 (서버사이드 인증 — 실제 보안선)
```

> ⚠️ **middleware.ts 어드민 리다이렉트가 비활성인 이유**: Vercel Edge Runtime에서
> Supabase 쿠키 감지 실패 → 무한 리다이렉트 루프 발생. 의도적 비활성화.
> 실제 보안은 `requireAdmin()` (API) + `AdminLayout` (클라이언트)에서 담당.
> **절대 middleware에 어드민 리다이렉트 로직 재추가 금지.**

### 주요 파일 위치

```
src/
├── app/
│   ├── page.tsx                    ← 메인 (구인목록, 로그인 모달 포함)
│   ├── admin/page.tsx              ← 관리자 대시보드 (모든 어드민 기능 통합)
│   ├── my-shop/page.tsx            ← 업체회원 마이샵
│   ├── talent/page.tsx             ← 인재정보 목록
│   ├── community/                  ← 커뮤니티
│   ├── api/
│   │   ├── admin/
│   │   │   ├── health/route.ts     ← 시스템 헬스체크 (42개 항목)
│   │   │   ├── e2e/route.ts        ← 어드민 내장 E2E 테스트 (16개)
│   │   │   ├── update-shop-status/ ← 광고 승인/반려 (service_role)
│   │   │   ├── fix-integrity/      ← 포인트 무결성 자동 수복
│   │   │   └── ...
│   │   └── ...
├── components/
│   ├── admin/
│   │   ├── HealthDashboard.tsx     ← 시스템검증센터 UI (탭: DB/운영/무결성/보안/E2E)
│   │   ├── ad/AdminAdManagement.tsx
│   │   └── payment/AdminPaymentManagement.tsx
│   ├── PushPermission.tsx          ← SOS 푸시알림 동의 배너 (1일 재표시)
│   └── LayoutWrapper.tsx           ← 성인게이트, 아이들 로그아웃 래퍼
├── lib/
│   ├── requireAdmin.ts             ← 어드민 API 인증 가드 (모든 admin API에 적용)
│   └── supabase.ts
├── middleware.ts                   ← 봇차단/Rate Limit (어드민 인증 비활성 — 위 주의사항 참고)
└── hooks/
    └── useIdleLogout.ts            ← 30분 무활동 자동 로그아웃
```

---

## 📊 현재 진행 상태 (2026-04-08 기준)

### ✅ 완료된 주요 기능

| 기능 | 커밋 | 비고 |
|------|------|------|
| SEO STEP 1~3 (noindex, 가이드 564페이지, JobPosting 스키마) | `c7bcb96`, `0542f5f` | GSC 738페이지 색인 중 |
| 광고 승인/반려 시스템 (update-shop-status API) | `db7b661` | service_role 사용 |
| 결제내역관리 고도화 | `feb2909` | AdminPaymentManagement 개선 |
| 광고상세팝업 타입별 매핑 | `bd4b9a1` | AdDetailModal, MobilePreviewContent |
| 포인트 무결성 자동 수복 | `cfb0240` | fix-integrity API + UI 버튼 |
| 어드민 E2E 자동 테스트 (16개) | `c6b44cc` | HealthDashboard E2E 탭 |
| GitHub Actions Playwright E2E | `e890ac7` | push 트리거 비활성, 수동 실행만 |
| SOS 배너 1일 재표시 | `3322791` | '오늘 하루 보지 않기' |
| 보안 패치 (mock쿠키/autoLogin 우회 제거) | `2e4498a` | my-shop production 분기 |
| 출석체크 KST/중복 버그 수정 | `52af366` | |

### 🔴 미완료 / 진행 중

| 항목 | 우선순위 | 메모 |
|------|---------|------|
| SMS 연동 (아톡비즈) | 높음 | API 문서 요청 필요 (1877-8280) — 4/6(월) 이후 |
| GSC 가이드 페이지 URL 색인 수동 요청 3건 | 중간 | 대표님 GSC 직접 진행 |
| 텔레그램 실제 ID 확정 | 낮음 | 현재 `@cocoalba` 플레이스홀더 |
| 토스 비즈니스 웹훅 연동 | 낮음 | 계정 전환 후 |
| GitHub Actions Secrets 등록 | 중간 | 설정 경로: repo → Settings → Security → Secrets |

---

## 🔐 PROTECTED 항목 (변경 금지 — 대표님 승인 필수)

```
PAY_BADGE_STANDARDS v2.0:
  주급 → green-500, 연봉 → red-500, TC → orange-500
  급구/추천 → purple-600

AD_TIER_STANDARDS:
  Grand > Premium > Deluxe > Special > Urgent > Recommended > Standard
  (순서, 색상, 라벨 모두 고정)
```

> 📎 상세 기준: `C:\Users\K\.claude\projects\...\memory\sop_protected.md`

---

## 🚫 절대 금지 사항

1. **middleware.ts에 어드민 리다이렉트 재추가 금지** (무한루프 발생)
2. **`_` 접두사 없이 임시 디버그 파일(keys.json, dev_*.json 등) 커밋 금지**
   → .gitignore에 등록됨, `git rm --cached` 후 커밋
3. **전체 파일 덮어쓰기 금지** — `replace_file_content` 또는 Edit 도구로 핀셋 수정
4. **PROTECTED 색상/등급 임의 변경 금지**
5. **auth.users 직접 조회 시도 금지** (Supabase 권한 정책상 항상 실패 → 오탐 유발)

---

## 🐛 현재 알려진 이슈

| 코드 | 내용 | 상태 |
|------|------|------|
| - | 어드민 헬스체크 `admin_password_hash` 항목 → 권한 부족으로 확인 불가 (info 처리됨, 정상) | 오탐 확인 |
| - | GitHub Actions E2E — Secrets 미등록 시 auth 테스트 skip (conftest.py에서 graceful skip 처리) | 정상 |

---

## 🗄️ DB 주요 테이블

| 테이블 | 역할 |
|--------|------|
| `profiles` | 회원 (user_type: individual/corporate/admin) |
| `shops` | 광고 공고 (status: pending/approved/rejected) |
| `payments` | 결제 내역 (metadata.type: point_charge/jump_charge) |
| `point_logs` | 포인트 변동 이력 |
| `applications` | 지원 내역 |
| `resumes` | 이력서 |
| `notifications` | 알림 |
| `sos_logs` | SOS 알림 이력 |

---

## 📡 관련 프로젝트 맵

| 코드명 | 경로 | 도메인 |
|--------|------|--------|
| P1 본사(공통) | `C:\My-site\p1.choco-idea` | chocoidea.vercel.app |
| P2 코코알바 | `C:\My-site\p2.브랜드_통합_시스템` | www.cocoalba.kr |
| P3 랜딩(73기지) | `C:\My-site\p3.코코 랜딩페이지` | region.cocoalba.kr |
| P4 파트너스 | `C:\My-site\p4.파트너스_사이트` | partners-credit.vercel.app |
| P7 PRICESHOT | `C:\My-site\p7.PRICESHOT` | (개발 중) |
