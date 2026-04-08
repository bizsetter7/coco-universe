# P2 AI_SOP — 전사 마스터 참조

> ⚠️ **이 파일은 더 이상 전사 SOP 원본이 아닙니다.**
> 전사 운영 수칙은 **`C:\My-site\p1.choco-idea\AI_SOP.md`** (마스터)를 참조하십시오.
>
> 안티그래비티는 세션 시작 시 반드시:
> 1. `C:\My-site\p2.브랜드_통합_시스템\CLAUDE.md` 읽기
> 2. `C:\My-site\p1.choco-idea\MISTAKES_LOG.md` 읽기
> 3. `C:\My-site\p1.choco-idea\AI_SOP.md` 읽기

---

## P2 전용 추가 수칙

- **middleware.ts 어드민 리다이렉트 재추가 절대 금지** → Vercel Edge Runtime 쿠키 감지 실패로 무한루프 발생. 보안은 AdminLayout + requireAdmin API 가드가 담당.
- **광고 승인 API**: `/api/admin/update-shop-status` (service_role 사용) — 직접 shops 테이블 수정 금지
- **DB 컬럼 주의**: `shops.pay_status` 컬럼 없음 (없는 컬럼 참조 시 Supabase 묵살 버그)
- **디버그 파일 목록** `.gitignore`에 등록됨 — `git add -A` 사용 전 반드시 `git status` 확인
