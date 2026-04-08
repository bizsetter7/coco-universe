# TASK_REPORT: 팝업 통합 및 UI 표준화 (2026-04-09)

## 1. 개요
서비스 내 분산되어 있던 5개의 광고 상세 팝업 진입점(`public`, `my-shop`, `admin` 등)을 단일 표준 컴포넌트인 `JobDetailContent`로 통합하였습니다.

## 2. 작업 상세
- **[어댑터 생성]** `anyAdToShop()`: 다양한 형태의 광고 객체를 표준 `Shop` 타입으로 변환하고 지역명 중복("수원시 수원시")을 제거하는 로직을 `src/lib/adUtils.ts`에 추가했습니다.
- **[마이샵 수리]** `AdDetailModal.tsx`의 방대한 코드를 제거하고 `JobDetailContent`를 호출하도록 단순화했습니다.
- **[어드민 표준화]** `admin/page.tsx`의 광고 미리보기 블록을 `JobDetailContent`로 교체하였습니다.
  - `publisherAddress` prop을 통해 데이터베이스 재조회 없이 즉시 주소와 지도를 표시합니다.
- **[보존]** 광고 등록 Step 4용 `MobilePreviewContent.tsx`는 삭제하지 않고 등록 flow용으로 유지하였습니다.

## 3. 결과 확인
- `npm run build`를 통해 타입 안정성을 검증하였습니다.
- `.next` 캐시를 삭제하고 개발 서버(`npm run dev`)를 재시작하여 변경 사항이 즉시 적용됨을 확인했습니다.

## 4. 향후 주의사항
- 앞으로 모든 광고 상세 UI 수정은 `src/components/jobs/JobDetailModal.tsx`의 `JobDetailContent` 컴포넌트 한 곳만 관리하면 됩니다.
