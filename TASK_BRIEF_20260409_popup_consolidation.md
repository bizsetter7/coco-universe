# TASK_BRIEF_20260409 — 광고 상세 팝업 5개 통합 (Popup Consolidation)

**작성일**: 2026-04-09  
**담당**: 안티그래비티 (구현)  
**검토**: 코부장 (Claude Code)  
**우선순위**: 🔴 HIGH — 지역중복·닉네임·업종표기 버그가 5개 팝업에서 각자 다르게 터짐

---

## 📌 문제 요약

현재 공고 상세 팝업이 **5개의 서로 다른 컴포넌트**로 분산되어 있다.  
동일한 광고 데이터를 보여주지만, 각자 데이터 정규화 로직이 달라서  
버그 1개를 고치면 나머지 4개는 그대로 남는 문제가 반복된다.

| # | 진입점 | 현재 컴포넌트 | 증상 |
|---|--------|--------------|------|
| 1 | 일반 광고 목록 (퍼블릭) | `JobDetailContent` ← **정답 (Canonical)** | 정상 |
| 2 | my-shop 진행중공고 제목 클릭 | `AdDetailModal` | 닉네임·지역 불일치 |
| 3 | my-shop 결제내역 제목 클릭 | `AdDetailModal` (via `setSelectedAdForModal`) | 닉네임·지역 불일치 |
| 4 | admin 광고심사관리 제목 클릭 | `MobilePreviewContent` (via `setSelectedAdForModal`) | **지역 '경기도 수원시 수원시' 중복**, 업종 1차만 표시 |
| 5 | admin 결제내역관리 제목 클릭 | `MobilePreviewContent` (via `setSelectedAdForModal`) | 동일 |

---

## 🎯 목표

**5개 진입점 모두 `JobDetailContent` (정답 컴포넌트)를 사용하도록 교체한다.**

`JobDetailContent`는 `src/components/jobs/JobDetailModal.tsx`에서 export됨.  
이미 다음이 구현되어 있음:
- ✅ 닉네임 정규화 (INVALID_NICK 필터)
- ✅ 카카오 맵 inline
- ✅ 업종 1차+2차 배지 (`shop.category | shop.categorySub`)
- ✅ paySuffixes 정규화
- ✅ tier 기반 헤더 그라데이션

---

## 🔧 구현 방법

### 핵심 원칙
- `AdDetailModal` (my-shop용)을 **삭제하지 않고**, 내부를 `JobDetailContent`로 교체
- admin `page.tsx`의 `MobilePreviewContent` 블록을 `JobDetailContent`로 교체
- 데이터 어댑터 함수 1개 작성: `anyAdToShop(ad: any): Shop`

---

### STEP 1 — 데이터 어댑터 함수 작성

**파일**: `src/lib/adUtils.ts` (기존 파일에 추가)

```ts
/**
 * anyAdToShop: any 타입 광고 객체 → JobDetailContent 전달용 Shop 타입으로 변환
 * my-shop AdDetailModal, admin modal 등 모든 팝업에서 공통 사용
 */
export function anyAdToShop(ad: any): Shop {
    const opt = ad?.options || {};
    const INVALID_NICK = ['닉네임', '관리자', '비즈니스 파트너', '', null, undefined];
    const shopName = ad?.name || opt?.shopName || ad?.shopName || ad?.shop_name || '';
    const rawNick = ad?.nickname ?? opt?.nickname;
    const nickname = (!INVALID_NICK.includes(rawNick) ? rawNick : null) || shopName || '업체명 없음';

    // 지역 중복 방지 (경기도 수원시 수원시 → 경기도 수원시)
    const regionCity = ad?.regionCity || opt?.regionCity || ad?.region || '';
    const regionGu = ad?.regionGu || opt?.regionGu || ad?.work_region_sub || '';
    // regionCity가 이미 regionGu를 포함하고 있으면 regionGu 생략
    const region = regionCity && regionGu && !regionCity.includes(regionGu)
        ? `${regionCity} ${regionGu}`.trim()
        : regionCity || regionGu || '지역미기재';

    return {
        ...ad,
        id: String(ad.id || ''),
        name: shopName,
        shopName: shopName,
        nickname: nickname,
        region,
        work_region_sub: regionGu,
        workType: ad?.workType || ad?.work_type || opt?.category || ad?.category || '일반',
        category: ad?.category || opt?.industryMain || opt?.jobCategory || ad?.workType || '',
        category_sub: ad?.category_sub || opt?.categorySub || opt?.industrySub || ad?.categorySub || '',
        categorySub: ad?.category_sub || opt?.categorySub || opt?.industrySub || ad?.categorySub || '',
        pay: String(
            Number(ad?.pay_amount || ad?.payAmount || opt?.payAmount || ad?.pay || 0)
        ),
        pay_amount: Number(ad?.pay_amount || ad?.payAmount || opt?.payAmount || ad?.pay || 0),
        payType: ad?.payType || ad?.pay_type || opt?.payType || '협의',
        pay_type: ad?.payType || ad?.pay_type || opt?.payType || '협의',
        tier: ad?.tier || opt?.selectedAdProduct || ad?.productType || 'p7',
        title: ad?.title || opt?.title || '',
        content: ad?.content || ad?.description || opt?.content || opt?.editorHtml || '',
        options: {
            ...opt,
            paySuffixes: ad?.paySuffixes || opt?.paySuffixes || opt?.pay_suffixes || [],
            keywords: ad?.keywords || opt?.keywords || opt?.selectedKeywords || [],
            icon: opt?.icon || opt?.selectedIcon || ad?.selectedIcon,
            highlighter: opt?.highlighter || opt?.selectedHighlighter || ad?.selectedHighlighter,
            mediaUrl: opt?.mediaUrl,
        },
        managerName: ad?.managerName || ad?.manager_name || opt?.managerName || '',
        managerPhone: ad?.managerPhone || ad?.manager_phone || opt?.managerPhone || ad?.phone || '',
        businessAddress: ad?.businessAddress || ad?.business_address || opt?.businessAddress || '',
    } as Shop;
}
```

---

### STEP 2 — my-shop `AdDetailModal` 교체

**파일**: `src/app/my-shop/components/AdDetailModal.tsx`

현재 약 200줄의 독립 구현을 `JobDetailContent`로 교체한다.

```tsx
// src/app/my-shop/components/AdDetailModal.tsx
'use client';
import { JobDetailContent } from '@/components/jobs/JobDetailModal';
import { anyAdToShop } from '@/lib/adUtils';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

export const AdDetailModal = ({ ad, onClose }: { ad: any; onClose: () => void }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const shop = anyAdToShop(ad);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg md:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-[32px] md:rounded-[32px] bg-white z-10">
                <JobDetailContent shop={shop} onClose={onClose} />
            </div>
        </div>,
        document.body
    );
};
```

---

### STEP 3 — admin `page.tsx` 교체

**파일**: `src/app/admin/page.tsx`  
**위치**: line ~625 `{selectedAdForModal && (...)}`

현재 `MobilePreviewContent`를 사용하는 20줄 field-mapping 블록을 제거하고 `JobDetailContent`로 교체:

```tsx
// 기존 import 추가 (파일 상단)
import { JobDetailContent } from '@/components/jobs/JobDetailModal';
import { anyAdToShop } from '@/lib/adUtils';

// 기존 MobilePreviewContent import 제거 (admin/page.tsx에서만)

// 팝업 JSX (line ~625 영역 교체)
{selectedAdForModal && (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4">
        <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={() => setSelectedAdForModal(null)}
        />
        <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Admin 전용 헤더: Ad No + 결제금액 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-slate-100 shrink-0">
                <div>
                    <span className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md font-black uppercase">
                        Ad Preview · No.{(selectedAdForModal as any).adNo || String(selectedAdForModal.id || '').substring(0, 8)}
                    </span>
                    <span className="ml-2 text-blue-600 font-black text-sm">
                        {(Number(selectedAdForModal?.ad_price) || Number((selectedAdForModal as any)?.price) || 0).toLocaleString()}원
                    </span>
                </div>
                <button onClick={() => setSelectedAdForModal(null)} className="p-2 text-slate-400 hover:text-slate-900">
                    <XCircle size={24} />
                </button>
            </div>
            {/* 공통 상세 컨텐츠 */}
            <div className="overflow-y-auto">
                <JobDetailContent
                    shop={anyAdToShop(selectedAdForModal)}
                    onClose={() => setSelectedAdForModal(null)}
                />
            </div>
        </div>
    </div>
)}
```

---

## ✅ 완료 체크리스트

- [ ] `src/lib/adUtils.ts` — `anyAdToShop()` 함수 추가
- [ ] `src/app/my-shop/components/AdDetailModal.tsx` — `JobDetailContent` wrapping으로 교체
- [ ] `src/app/admin/page.tsx` — `MobilePreviewContent` 블록 → `JobDetailContent` 교체
- [ ] 지역 중복 `'경기도 수원시 수원시'` 해소 확인 (admin popup)
- [ ] 업종 1차+2차 배지 (`노래주점 | 아가씨`) 표시 확인 (admin popup)
- [ ] 닉네임 정상 표시 확인 (my-shop popup)
- [ ] `MobilePreviewContent` import가 admin/page.tsx에서만 제거되었는지 확인 (광고등록 미리보기 step에서는 유지해야 함!)

---

## ⚠️ 주의사항

1. **`MobilePreviewContent`는 삭제 금지** — 광고 등록 step4 미리보기 (`/my-shop` 내 광고 등록 폼)에서 계속 사용됨. admin/page.tsx 에서만 교체.
2. **`anyAdToShop` 지역 로직** — `regionCity`가 이미 `regionGu`를 포함한 경우(`'경기도 수원시'.includes('수원시') → true`) `regionGu` 추가 안 함. 이게 핵심 버그 픽스.
3. **`JobDetailContent`의 카카오 맵** — `bizAddressOverride`가 없으면 내부에서 Supabase `profiles` 테이블 조회 시도함. admin 팝업에서는 `(selectedAdForModal.options as any)?.businessAddress`를 `publisherAddress` prop으로 전달하면 비동기 조회 없이 즉시 표시됨.
4. **`.next` 캐시** — 이 작업 후 반드시 `Remove-Item -Recurse -Force .next && npm run dev` 실행

---

## 📁 관련 파일 경로

| 파일 | 역할 |
|------|------|
| `src/components/jobs/JobDetailModal.tsx` | Canonical — `JobDetailContent` export |
| `src/app/my-shop/components/AdDetailModal.tsx` | ❌ 교체 대상 (my-shop 2·3번 팝업) |
| `src/app/admin/page.tsx` line ~625 | ❌ 교체 대상 (admin 4·5번 팝업) |
| `src/lib/adUtils.ts` | ✅ `anyAdToShop` 추가 위치 |

---

*By 코부장 (Claude Code) — 2026-04-09*
