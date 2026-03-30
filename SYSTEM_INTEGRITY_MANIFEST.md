# SYSTEM INTEGRITY MANIFEST (시스템 무결성 기술 매니페스트)

본 문서는 **코코알바 & 파트너스 통합 시스템**의 기술적 정합성을 수호하기 위한 실무 지침서입니다.

## 1. 데이터 무결성 체크리스트 (Technical Checklist)

### 🆔 계정 체계 (Account Integrity)
- [ ] `profiles.username`과 `profiles.user_id`가 동일한지 확인
- [ ] 신규 가입 시 `user_type`이 `admin`이 아닌 경우 필수 정보(`nickname`, `phone`)가 누락되지 않았는지 확인
- [ ] Supabase Auth의 이메일 유니크 제약 조건이 활성화되어 있는지 확인

### 💰 자산 관리 (Asset Separation)
- [ ] `updatePoints` (코코 포인트) 함수가 `credit_balance` 컬럼을 건드리지 않는지 확인
- [ ] 결제 로그(`payment_logs`)와 자산 변동 로그(`credit_logs`, `point_logs`)가 분리되어 기록되는지 확인

### 📏 데이터 규격 (Standards Guard)
- [ ] 모든 공고 요약 렌더링 시 [standards.ts](file:///src/constants/standards.ts)의 매핑 로직을 통과하는지 확인
- [ ] `normalized_standards` 필터가 없는 공고 데이터(Null)를 `정보없음`으로 보정하는지 확인

### 🔒 프라이버시 및 커뮤니티 권한 (Privacy & Board Policy)
- [ ] `write/page.tsx`, `CommunityDetailClient.tsx` 등 모든 사용자 입력 폼에서 `user.name`(위험 실명) 대신 `user.nickname`(또는 '익명')만 전송되는지 확인
- [ ] 관리자(`user.type === 'admin'`) 외에는 게시글/댓글 무단 삭제 및 우회가 불가능한지, RLS/API 엔드포인트 무결성 점검
- [ ] 게시물 작성 시 익명/비로그인/일반회원 구분 없이 최소 4자 이상의 비밀번호가 원천 강제되어 수정/삭제 권리 충돌을 차단하는지 확인

## 2. 장애 복구 매뉴얼 (Recovery Manual)

### 🚑 사태: 핵심 페이지 레이아웃/로직 붕괴 (예: 고객지원센터 등)
1. **즉시 보존**: 로컬 및 원격 Git 히스토리에서 가장 안정적이었던 브랜치로 이동합니다.
2. **코드 대조**: `StandardsGuardView.tsx`에 명시된 핵심 파일 경로를 확인합니다.
3. **복구 실행**: 
    - UI 요소가 유실된 경우, [우리의 약속](file:///C:/Users/K/.gemini/antigravity/brain/7087d0bc-74bb-4544-b698-c03e95096c4f/Our_Promises.md)의 디자인 가이드를 최우선으로 복원합니다.
    - 데이터가 섞인 경우, `verify_db_v1.js`와 같은 진단 스크립트를 실행하여 컬럼 값을 대조합니다.

---

## 📅 기술 표준 준수 확인
이 매니페스트는 어드민 패널의 [시스템 검증 센터]와 연동되어 관리됩니다. 모든 작업은 이 가이드라인의 범주 내에서 수행되어야 합니다.
