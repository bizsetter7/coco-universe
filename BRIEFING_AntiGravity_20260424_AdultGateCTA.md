# BRIEFING_AntiGravity_20260424_AdultGateCTA

> 작성자: 코부장 | 수신: AntiGravity | 날짜: 2026-04-24
> 프로젝트: P2 코코알바 (`D:\토탈프로젝트\My-site\p2.브랜드_통합_시스템`)
> 작업 전 필독: CLAUDE.md → MISTAKES_LOG.md

---

## 배경

현재 성인게이트는 **페이지 진입 시** 전체 오버레이로 동작.
구글 검색 유입 첫 페이지는 게이트 면제(SEO 목적) → 메인 페이지 콘텐츠가 보임.

**변경 요청**: 첫 페이지 면제는 유지하되,
**공고 클릭 / CTA 버튼 클릭 시에는 미인증자에게 게이트를 트리거**하도록 변경.

---

## 구현 방식

### 1. `useAdultGate` 훅 신규 생성
**파일**: `src/hooks/useAdultGate.ts`

```typescript
'use client';
import { useCallback } from 'react';

/**
 * 성인 인증 여부를 확인 후 콜백 실행.
 * 미인증 시 게이트를 열어 인증 후 자동 실행.
 */
export function useAdultGate() {
    const requireVerification = useCallback((onVerified: () => void) => {
        // localStorage에 adult_verified가 있으면 통과
        if (typeof window !== 'undefined' && localStorage.getItem('adult_verified') === 'true') {
            onVerified();
            return;
        }
        // 미인증 → 커스텀 이벤트로 LayoutWrapper에 게이트 오픈 요청
        window.dispatchEvent(new CustomEvent('open-adult-gate', { detail: { onVerified } }));
    }, []);

    return { requireVerification };
}
```

---

### 2. `LayoutWrapper.tsx` 수정 — 이벤트 리스너 추가
**파일**: `src/components/LayoutWrapper.tsx`

`useEffect` 안에 아래 리스너 추가 (기존 코드는 핀셋 수정):

```typescript
// CTA 클릭으로 게이트 오픈 요청 처리
const handleOpenGate = (e: Event) => {
    const { onVerified } = (e as CustomEvent).detail;
    // 게이트 강제 오픈 + 인증 완료 시 콜백 실행
    setPendingCallback(() => onVerified);
    setForceShowGate(true);
};
window.addEventListener('open-adult-gate', handleOpenGate);
return () => window.removeEventListener('open-adult-gate', handleOpenGate);
```

`LayoutWrapper` state 추가:
```typescript
const [forceShowGate, setForceShowGate] = useState(false);
const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
```

`showAdultGate` 조건에 `forceShowGate` 추가:
```typescript
const showAdultGate = forceShowGate || (isMounted && !isVerified && ...기존 조건...);
```

`AdultVerificationGate`에 `onVerify` 완료 시 `pendingCallback` 실행:
```typescript
<AdultVerificationGate
    onVerify={() => {
        setIsVerified(true);
        setForceShowGate(false);
        if (pendingCallback) {
            pendingCallback();
            setPendingCallback(null);
        }
    }}
/>
```

---

### 3. CTA 버튼에 `useAdultGate` 적용

#### 3-1. 공고 카드 클릭 (`JobCard` 또는 메인 광고 목록)
공고 카드를 클릭해서 상세 페이지로 이동할 때 게이트 체크:

**대상 파일 탐색 후 적용**:
```typescript
// 기존 코드 (예시)
<div onClick={() => router.push(`/shop/${ad.id}`)}>

// 변경 후
const { requireVerification } = useAdultGate();
<div onClick={() => requireVerification(() => router.push(`/shop/${ad.id}`))}>
```

#### 3-2. "지원하기" 버튼
```typescript
const { requireVerification } = useAdultGate();
<button onClick={() => requireVerification(() => handleApply(ad.id))}>
    지원하기
</button>
```

#### 3-3. "연락하기 / 전화번호 보기" 버튼
```typescript
<button onClick={() => requireVerification(() => setShowContact(true))}>
    연락처 보기
</button>
```

---

## 적용 대상 파일 탐색 후 수정

아래 파일들에서 공고/업소 관련 CTA onClick을 찾아 `requireVerification` 래핑:

| 파일 | 적용 대상 |
|------|---------|
| `src/app/page.tsx` 또는 `HomePortalClient.tsx` | 공고 카드 클릭 |
| `src/components/` 내 광고 카드 컴포넌트 | 카드 클릭, 지원하기 |
| `src/app/shop/[id]/page.tsx` | 지원하기, 연락하기 버튼 |

> **탐색 방법**: `onClick` + `router.push('/shop` 패턴 검색 후 적용

---

## 완료 기준
- [ ] 구글 유입 첫 페이지: 콘텐츠 정상 노출 (게이트 없음) ✅ 유지
- [ ] 첫 페이지에서 공고 클릭 → 게이트 트리거
- [ ] 게이트 인증 완료 → 원래 클릭 동작 자동 실행 (페이지 이동/지원 등)
- [ ] 이미 인증된 사용자 → 게이트 없이 바로 통과
- [ ] `npm run build` 빌드 통과

## 주의사항
- 파일 전체 덮어쓰기 금지 — 핀셋(Edit) 수정만
- LayoutWrapper.tsx는 기존 게이트 로직 건드리지 말고 추가만
- `adult_verified` localStorage 키 기준 유지 (변경 금지)
