# PLAN_AntiGravity_20260424_AdultGateCTA

## 1. 개요
현재 P2 코코알바는 SEO를 위해 검색 유입 시 첫 페이지에서 성인게이트를 면제하고 있습니다. 
이번 작업의 목적은 콘텐츠 탐색은 허용하되, **공고 클릭, 지원하기, 연락처 보기 등 핵심 행동(CTA)** 시에는 미인증 사용자에게 성인게이트를 즉시 트리거하고, 인증 완료 후 원래 동작이 수행되도록 고도화하는 것입니다.

## 2. 작업 범위 및 파일

### [PHASE 1] 신규 훅 생성
- `[NEW] src/hooks/useAdultGate.ts`
    - `requireVerification(onVerified)` 함수 제공
    - 미인증 시 `open-adult-gate` 커스텀 이벤트 발송

### [PHASE 2] 레이아웃 래퍼 수정
- `[MODIFY] src/components/LayoutWrapper.tsx`
    - `open-adult-gate` 이벤트 리스너 추가
    - `forceShowGate`, `pendingCallback` 상태 관리
    - 인증 완료 시 `pendingCallback` 실행 로직 추가

### [PHASE 3] CTA 컴포넌트 적용 (탐색 필요)
- `[MODIFY] src/app/page.tsx` (또는 관련 Client 컴포넌트)
- `[MODIFY] src/app/shop/[id]/page.tsx`
- `[MODIFY] 광고 카드 관련 컴포넌트` (JobCard 등)
- 작업 내용: `onClick` 핸들러를 `requireVerification`으로 래핑

## 3. 상세 구현 계획

### 1) useAdultGate.ts
```typescript
'use client';
import { useCallback } from 'react';

export function useAdultGate() {
    const requireVerification = useCallback((onVerified: () => void) => {
        if (typeof window !== 'undefined' && localStorage.getItem('adult_verified') === 'true') {
            onVerified();
            return;
        }
        window.dispatchEvent(new CustomEvent('open-adult-gate', { detail: { onVerified } }));
    }, []);
    return { requireVerification };
}
```

### 2) LayoutWrapper.tsx 핀셋 수정
- `forceShowGate`가 true일 때 게이트 강제 노출
- `onVerify` 시 `pendingCallback?.()` 실행 후 상태 초기화

### 3) 적용 대상 컴포넌트 검색 및 수정
- `grep`을 통해 `/shop/` 경로로 이동하는 `router.push` 패턴 탐색
- 상세 페이지 내 '지원하기', '전화하기' 등 버튼 탐색

## 4. 검증 계획
- [ ] `npm run build` 실행 및 성공 확인
- [ ] 미인증 상태에서 메인 페이지 접속 → 콘텐츠 노출 확인
- [ ] 공고 클릭 → 성인게이트 등장 확인
- [ ] 게이트 인증 완료 → 클릭했던 페이지로 이동되는지 확인
- [ ] 이미 인증된 상태 → 게이트 없이 즉시 동작 확인

---
PLAN 저장 완료: `D:\토탈프로젝트\My-site\p2.브랜드_통합_시스템\PLAN_AntiGravity_20260424_AdultGateCTA.md`
