# 🚨 P2 데이터 파이프라인 긴급 수리 명세서
> 작성: 코부장 (2026-04-08)  
> 대상: 안티그래비티  
> 수정 전 반드시 `/session-start` 실행 후 CLAUDE.md + MISTAKES_LOG.md 확인

---

## 📊 Supabase 테이블 전체 구조 & 실기능 매핑

### 1. profiles (회원 명부)
| 컬럼 | 타입 | 실기능 매핑 |
|------|------|------------|
| `id` | uuid | 회원 고유 키. `shops.user_id`, `payments.user_id` FK |
| `username` | text | 로그인 ID (표시용) |
| `nickname` | text | 사이트 닉네임 |
| `full_name` | text | 실명 (본인인증 값) |
| `role` | text | `admin` / `corporate` / `individual` |
| `business_name` | text | 사업자명 = shops.name과 연동 |
| `business_number` | text | 사업자번호 |
| `business_type` | text | 업종 |
| `business_file_url` | text | 사업자등록증 파일 URL |
| `business_address` | text | 사업장 주소 (시/도+구/군) |
| `business_address_detail` | text | 상세주소 |
| `business_verify_status` | text | `pending` / `approved` / `rejected` |
| `business_verified` | bool | 승인 완료 여부 |
| `business_verify_requested_at` | timestamp | 심사요청 시각 |
| `business_verified_at` | timestamp | 승인 시각 |
| `manager_phone` | text | 업체 담당자 연락처 |
| `manager_kakao` | text | 카카오 ID |
| `manager_line` | text | 라인 ID |
| `manager_telegram` | text | 텔레그램 ID |
| `points` | int4 | 포인트 잔액 |

**⚠️ 주의**: `address`, `address_detail` 컬럼이 코드상 조회되는 곳 있음 (JobDetailModal 라인 531) — 실제 Supabase에 이 컬럼이 있는지 확인 필요. 없으면 `business_address` / `business_address_detail`로 통일.

---

### 2. shops (공고/광고 본체) — 핵심 테이블
| 컬럼 | 타입 | 실기능 매핑 |
|------|------|------------|
| `id` | **int8** | 광고번호 (NO.143 등). payments.shop_id FK. **숫자형 — String 비교 금지** |
| `user_id` | uuid | 공고 올린 회원 ID → profiles.id |
| `name` | text | 상호명 = profiles.business_name |
| `title` | text | 공고 제목 |
| `content` | text | 상세내용 (HTML) |
| `nickname` | text | 공고 닉네임/슬로건 |
| `phone` | text | 공고 연락처 |
| `kakao` | text | 카카오 ID |
| `line` | text | 라인 ID |
| `telegram` | text | 텔레그램 ID |
| `manager_name` | text | 담당자 실명 |
| `manager_phone` | text | 담당자 연락처 |
| `region` | text | **1차 지역** (예: "경기도" 또는 "경기도 수원시") — ⚠️ 저장 형태 불일치 있음 |
| `work_region_sub` | text | 상세 지역 (예: "수원시") |
| `category` | text | 1차 업종 |
| `category_sub` | text | 2차 업종 |
| `pay_type` | text | 급여 종류 (시급/일급/월급 등) |
| `pay_amount` | int4 | 급여 금액 (숫자) |
| `pay` | text | 표시용 급여 문구 (예: "200만원") |
| `tier` | text | 광고 계급 (p1~p7) |
| `product_type` | text | 광고 계급 (tier 중복 저장) |
| `status` | text | **현재 상태**: `pending` / `active` / `rejected` |
| `ad_price` | int8 | 결제 금액 = payments.amount |
| `deadline` | text | 마감일 |
| `media_url` | text | 대표 이미지 URL |
| `options` | jsonb | 스냅샷 + 옵션 (아래 별도 설명) |
| `rejection_reason` | text | 반려 사유 |
| `rejection_history` | jsonb | 반려 히스토리 |
| `approved_at` | timestamp | 승인 시각 |

#### options JSONB 내부 구조 (공고등록 시 저장되는 스냅샷)
```json
{
  "icon": 10,
  "ageMax": 35,
  "ageMin": 20,
  "border": "rainbow",
  "status": "pending",        // ← 등록 당시 스냅샷. shops.status(루트)가 현재 진짜 상태
  "payType": "시급",
  "ad_price": 1075000,        // = payments.amount
  "deadline": "2026-07-01",
  "keywords": ["키워드1"],
  "mediaUrl": "https://...",
  "regionCity": "경기도",      // ← 표시 주소 우선값 (shops.region보다 우선)
  "regionGu": "수원시",        // ← 표시 주소 우선값
  "payAmount": 700000,
  "highlighter": 2,
  "icon_period": 90,
  "managerName": "홍길동",
  "paySuffixes": ["숙식제공"],
  "managerPhone": "01012345678",
  "product_type": "p1",       // = shops.tier
  "addressDetail": "2층 뷰테라피",  // 상세주소
  "border_period": 90,
  "product_period": 90,
  "highlighter_period": 90
}
```

**⚠️ status 이중 구조 설명**:
- `shops.status` (루트 컬럼) = **현재 실제 상태** → 관리자 승인 시 변경. 노출 여부 결정.
- `options.status` (JSONB 내부) = **등록 당시 스냅샷** → 변경하지 않음.

---

### 3. payments (결제 장부)
| 컬럼 | 타입 | 실기능 매핑 |
|------|------|------------|
| `id` | uuid | 결제 고유 ID |
| `user_id` | text | profiles.id (uuid 문자열) |
| `shop_id` | **int8** | shops.id. **숫자형** |
| `amount` | int4 | 결제 금액 = shops.ad_price = options.ad_price |
| `status` | text | `pending` / `completed` |
| `method` | text | `bank_transfer` / `admin_manual` 등 |
| `description` | text | 결제 설명 (예: `[p1] 초코아이디어 공고 결제`) |
| `metadata` | jsonb | `{adTitle, nickname, shopName, product_type}` |
| `type` | text | `AD` / `SOS` / `JUMP` / `OPTION` (없으면 `AD` 기본값) |

---

### 4. 기타 테이블 (간략)
| 테이블 | 역할 | 주요 FK |
|--------|------|---------|
| `resumes` | 개인회원 이력서 | `user_id` → profiles.id |
| `applications` | 지원 내역 | `shop_id` → shops.id, `user_id` → profiles.id |
| `sos_alerts` | SOS 급구 알림 | `shop_id` → shops.id |
| `notifications` | 실시간 알림 | `user_id` → profiles.id |
| `community_posts` | 커뮤니티 게시글 | `user_id` → profiles.id |
| `community_comments` | 커뮤니티 댓글 | `post_id`, `user_id` |
| `messages` | 1:1 쪽지 | `sender_id`, `receiver_id` → profiles.id |
| `inquiries` | 1:1 문의 | `user_id` → profiles.id |
| `point_logs` | 포인트 변동 이력 | `user_id` → profiles.id |
| `credit_logs` | 크레딧 변동 이력 | `user_id` → profiles.id |
| `withdrawals` | 출금 신청 | `user_id` → profiles.id |
| `marketing_campaigns` | 마케팅 캠페인 | - |
| `marketing_targets` | 타겟 회원 | `user_id` → profiles.id |
| `system_error_logs` | 에러 블랙박스 | - |

---

## 🔴 발견된 버그 목록 & 수정 명세

### BUG-A (치명적): 메인/업종/지역 페이지 실광고 미노출
**원인**: 3개 파일이 `shops.json` 정적파일만 읽음. Supabase 조회 없음.
```
src/app/page.tsx            → import shopsData from '@/lib/data/shops.json'
src/app/jobs/JobClient.tsx  → shops.json 기반
src/app/region/RegionClient.tsx → shops.json 기반
```
**수정 방향**:
1. 세 파일 모두 Supabase 쿼리로 전환:
   ```ts
   const { data } = await supabase
     .from('shops')
     .select('*')
     .eq('status', 'active')
     .order('updated_at', { ascending: false })
   ```
2. DB 결과 → `normalizeAd()` 함수 적용 (이미 `src/app/my-shop/utils/normalization.ts`에 있음)
3. `shops.json` 목업은 `status='active'`인 실데이터가 없을 때 fallback으로만 사용하거나 제거
4. isMock 플래그 있는 목업은 실광고 뒤에 배치 (현재 로직 유지)

---

### BUG-B (치명적): 관리자 광고 승인 "DB 업데이트 실패"
**원인**: `shops.id`는 `int8`(정수)인데 `String(adId)`로 `.eq()` 비교 → 타입 불일치 → 0건 매칭
```
파일: src/app/api/admin/update-shop-status/route.ts
라인 63: .eq('id', String(adId))        → .eq('id', Number(adId))
라인 83: .eq('shop_id', String(adId))   → .eq('shop_id', Number(adId))
```
동일 문제: `src/app/my-shop/page.tsx` 라인 734의 `.eq('id', String(editingAdId))`도 점검

---

### BUG-C: 주소 "수원시 수원시" 중복 표시
**원인**: `options.regionCity`(경기도) + `options.regionGu`(수원시) + `shops.region`(수원시) 세 값 중복 합산

**표시 우선순위 규칙 (전사 통일)**:
```
표시 주소 = options.regionCity + ' ' + options.regionGu
fallback  = shops.region (단독 사용, 절대 위와 합산 금지)
상세주소  = options.addressDetail
```
수정 파일:
- `src/components/jobs/JobDetailModal.tsx` 라인 315~352
- `src/app/my-shop/utils/normalization.ts` 라인 56~61 (regionCity 매핑 로직)

---

### BUG-D: AdminPaymentManagement 승인 시 adData 미전달
**원인**: 라인 55에서 `adData: { id: shopId }` 만 전달 → payments 내역에 shop 정보 없음
```
파일: src/components/admin/payment/AdminPaymentManagement.tsx
수정: adData: ads.find(a => String(a.id) === String(shopId)) || { id: shopId }
```
ads prop이 Shop[] 이므로 find로 전체 데이터 전달 가능

---

### BUG-E: profiles 주소 컬럼 불일치
**원인**: JobDetailModal 라인 531에서 `profiles.address`, `profiles.address_detail` 조회하는데
실제 Supabase 컬럼명은 `business_address`, `business_address_detail`임.
```
파일: src/components/jobs/JobDetailModal.tsx 라인 530~536
수정:
  .select('business_address, business_address_detail')
  → fullAddr = `${data.business_address || ''} ${data.business_address_detail || ''}`.trim()
```

---

### BUG-F: 공고등록 시 region 컬럼 저장 형태 불일치
**원인**: `shops.region` 컬럼에 "경기도" 만 저장되는 경우 vs "경기도 수원시" 합산 저장되는 경우 혼재
```
파일: src/app/my-shop/page.tsx 라인 653
현재: region: formState.regionCity  → "경기도" 만 저장
```
**표준 규칙**: `region`에는 `regionCity`만 저장. `regionGu`는 `work_region_sub`에 저장. (현재 형태 유지, 표시 시 합산 로직만 통일)

---

## ✅ 작업 순서 (Phase)

```
Phase 1 — 코어 파이프라인 (먼저 완료 필수)
  [1-A] BUG-B 수정: update-shop-status int8 타입 수정 (3줄)
  [1-B] BUG-D 수정: AdminPaymentManagement adData 전달 (1줄)
  [1-C] BUG-E 수정: profiles 주소 컬럼명 수정 (2줄)

Phase 2 — 실광고 노출
  [2-A] BUG-A 수정: page.tsx Supabase 전환
  [2-B] BUG-A 수정: JobClient.tsx Supabase 전환
  [2-C] BUG-A 수정: RegionClient.tsx Supabase 전환
  → 3개 파일 모두 normalizeAd() 함수 공통 사용

Phase 3 — 데이터 표시 정합성
  [3-A] BUG-C 수정: 주소 중복 표시 제거 (JobDetailModal + normalization.ts)
  [3-B] 전체 수동 E2E 확인:
        공고등록 → 관리자심사 → 승인 → 메인/업종/지역 노출 → 클릭 → 상세팝업 데이터 확인
```

---

## 🔒 절대 건드리지 말 것

- `shops.json` 파일 직접 수정 금지 (목업 보존용)
- `middleware.ts` 어드민 리다이렉트 재추가 금지
- `options.status` 내부값 변경 금지 (스냅샷 보존)
- `PAY_BADGE_STANDARDS` / `AD_TIER_STANDARDS` 색상/텍스트 임의 변경 금지
- `normalizeAd()` 함수의 기존 fallback 로직 구조 파괴 금지

---

## 📎 관련 파일 위치

```
src/app/page.tsx                              ← 메인페이지 (BUG-A)
src/app/jobs/JobClient.tsx                    ← 업종별 리스트 (BUG-A)
src/app/region/RegionClient.tsx               ← 지역별 리스트 (BUG-A)
src/app/api/admin/update-shop-status/route.ts ← 광고 승인 API (BUG-B)
src/app/my-shop/page.tsx                      ← 공고등록 (BUG-F 확인)
src/app/my-shop/utils/normalization.ts        ← 정규화 유틸 (공통 사용)
src/components/admin/ad/AdminAdManagement.tsx ← 광고심사관리 UI
src/components/admin/payment/AdminPaymentManagement.tsx ← 결제내역관리 (BUG-D)
src/components/jobs/JobDetailModal.tsx        ← 광고 상세팝업 (BUG-C, BUG-E)
src/types/shop.ts                             ← Shop 타입 정의
```
