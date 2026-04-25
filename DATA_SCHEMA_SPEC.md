# DATA_SCHEMA_SPEC — P2 코코알바 데이터 파이프라인 규정서
> 작성: 코부장 (Claude Code) | 최초 작성: 2026-04-25
> **목적**: UI 수정/기능 추가 시 데이터 컬럼 오용으로 인한 파이프라인 파괴 방지
> **위치**: 모든 BRIEFING에 이 파일을 선행 필독 문서로 명시할 것

---

## 1. 가장 중요한 식별자 규칙

### ID 계층 구조 — 절대 혼동 금지

| 식별자 | 타입 | 위치 | 의미 | 사용처 |
|--------|------|------|------|--------|
| `auth.users.id` | uuid | Supabase Auth | 로그인 주체의 진짜 UUID | 모든 프로필/권한 조회 기준 |
| `profiles.id` | uuid | public.profiles | auth.users.id와 동일값 | **코드에서 user_id로 사용하는 실체** |
| `profiles.username` | text | public.profiles | 로그인 아이디 (email @ 앞부분) | 화면 표시용, 검색 기준 아님 |
| `profiles.user_id` | text | public.profiles | **레거시 중복 컬럼** — profiles.id와 같은 값을 text로 저장 | 신규 코드에서 사용 금지 |
| `shops.id` | bigint | public.shops | 공고(광고) 식별자 | 공고 조회/수정/삭제 기준 |
| `shops.user_id` | text | public.shops | 공고 소유자의 profiles.id를 TEXT로 저장 | 소유권 확인용 |

```
로그인 사용자 = auth.users.id = profiles.id (uuid)
공고 소유자 확인 = shops.user_id = profiles.id를 TEXT로 변환한 값
공고 식별 = shops.id (bigint, 완전히 다른 ID 체계)
```

---

## 2. 테이블별 컬럼 사용 규정 (Single Source of Truth)

### profiles (회원 정보)

```
✅ 올바른 사용
- 로그인 사용자 조회: .eq('id', user.id)  [user.id = uuid]
- 업체회원 조회: .or('role.eq.corporate,user_type.eq.corporate')
- 개인회원 조회: .not('role', 'in', '("corporate","admin")')
- 포인트 조회: profiles.points (integer)
- 점프잔액: profiles.jump_balance (integer)

❌ 잘못된 사용
- .eq('user_id', user.id)  → user_id는 레거시, profiles.id를 써야 함
- .eq('role', 'individual') → employee 타입 개인회원 누락됨
- .eq('role', 'corporate') → user_type 기반 구형 업체회원 누락됨
```

### shops (공고/광고)

```
✅ 올바른 사용
- 내 공고 조회: .eq('user_id', user.id)  [user.id = uuid이지만 shops.user_id는 TEXT — Supabase가 자동 변환]
- 공고 단건 조회: .eq('id', shopId)  [shopId = bigint]
- Tier 판별: ad.productType || ad.tier || ad.product_type || ad.ad_type || ad.options?.product_type

❌ 잘못된 사용
- shops.id를 uuid로 취급 → shops.id는 bigint
- ad.productType만 체크 → raw DB 응답은 product_type(snake_case)
```

### applications (지원서)

```
⚠️ 알려진 타입 불일치 이슈
- applications.shop_id = uuid 타입
- shops.id = bigint 타입
- 직접 join/in 쿼리 불가

✅ 올바른 조회 방법 (우회 방식)
- applications.user_id(uuid) = 지원자 profiles.id
  → 지원자 본인 지원 내역: .eq('user_id', user.id) ✅
  
- 업체 소유 지원서 조회 (현재 깨져 있음 — 아래 수정 방법 참고):
  현재(잘못): shops.select('id') → bigint → applications.in('shop_id', bigintArray) → 0건
  올바른방법: applications에 owner_user_id TEXT 컬럼 추가 후 
             applications.insert 시 owner_user_id = 공고 소유자 user_id 저장
             조회: .eq('owner_user_id', userId)

❌ 현재 버그 (ApplicantsView.tsx:37~44)
const { data: shops } = await supabase.from('shops').select('id').eq('user_id', userId);
const shopIds = shops.map(s => s.id);  // → bigint 배열
await supabase.from('applications').in('shop_id', shopIds);  // → uuid 컬럼에 bigint 검색 → 0건!
```

### messages (쪽지)

```
DB 컬럼 (실제 존재):
- sender_id (text): 발송자 profiles.id
- receiver_id (text): 수신자 profiles.id  
- sender_name (text): 발송자 표시명
- receiver_name (text): 수신자 표시명
- is_read (boolean): 읽음 여부
- content (text): 내용

⚠️ 존재하지 않는 컬럼 (절대 사용 금지):
- from (없음) → sender_id/sender_name 사용
- to (없음) → receiver_id/receiver_name 사용

✅ 올바른 수신 쪽지 조회:
  NoteService.getInboxById(user.id)  → .eq('receiver_id', userId) ✅

❌ 현재 버그 (noteService.ts):
  getInbox(userName) → .eq('receiver_name', userName)  이름 기반 조회
  sendNote()에서 receiverId가 optional → ID 없이 이름만 저장되는 케이스 발생
  → 닉네임 변경 시 해당 사용자의 수신 쪽지 소실

✅ 올바른 쪽지 발송:
  sendNote() 호출 시 senderId, receiverId 반드시 전달
  저장 시: sender_id, receiver_id, sender_name, receiver_name 모두 INSERT
```

### sos_alerts (SOS 발송 이력)

```
⚠️ 명칭 혼란 주의
- sos_alerts.shop_id (uuid): 실제로 발송자의 profiles.id가 저장됨
  → shops.id(bigint)와 무관. 이름이 shop_id지만 user_id처럼 동작
  
✅ SOS 이력 조회:
  .eq('shop_id', user.id)  [user.id = profiles.id = uuid]

✅ SOS API에서 본인 확인:
  requesterId(profiles.id) !== shopId(profiles.id) → 403 반환 (정상 동작)
```

### payments (결제 내역)

```
존재하지 않는 컬럼: type, updated_at → 절대 INSERT/SELECT 금지

✅ 올바른 컬럼:
- pay_type (text): 결제 분류 — 'AD' | 'SOS' | 'JUMP' | 'point_charge' | 'jump_charge'
- shop_id (bigint): Number(adId) — String() 금지
- user_id (text): profiles.id를 text로 저장

✅ 어드민 승인 라우팅 규칙:
(pay.pay_type === 'JUMP' || pay.metadata?.type === 'point_charge' || pay.metadata?.type === 'jump_charge')
  ? handlePointGrant(...)   // 포인트/점프 지급
  : handlePaymentConfirm()  // 광고 승인(AD/연장)
```

### notifications (알림)

```
✅ 올바른 컬럼:
- read (boolean): 읽음 여부 — 'is_read'가 아님, 'read'가 정확한 컬럼명
- user_id (text): profiles.id를 text로 저장
```

### point_logs (포인트 이력)

```
존재하지 않는 컬럼: note, description → 절대 INSERT 금지

✅ 올바른 컬럼:
- user_id (uuid): profiles.id (uuid 그대로)
- amount (integer): 변동량 (음수=차감, 양수=적립)
- reason (text): SIGNUP_BONUS | ADMIN_GRANT | ATTENDANCE_CHECK | SOS_SEND_* 등
```

---

## 3. 기능별 데이터 플로우 정의

### 회원가입 플로우

```
[개인회원]
auth.users 생성 (id=uuid, email=로그인이메일)
  → profiles upsert:
      id = auth.users.id
      username = email.split('@')[0]  ← 로그인 아이디
      role = 'individual'
      user_type = 'individual'         ← role과 동일값으로 둘 다 세팅 필수

[업체회원 — 코코알바 자체 가입]
auth.users 생성 (id=uuid)
  → profiles upsert:
      id = auth.users.id
      username = email.split('@')[0]
      role = 'corporate'
      user_type = 'corporate'          ← role과 동일값으로 둘 다 세팅 필수

[야사장→코코알바 연동]
야사장 businesses.owner_id = profiles.id (uuid)
코코알바 shops.user_id = profiles.id (text 변환)
→ 같은 Supabase Auth이므로 동일 user.id로 양쪽 접근 가능
```

### SOS 발송 플로우

```
SosAlertView: user.id (profiles.id, uuid) → shopId로 전달
  → /api/sos/send: shopId = profiles.id
  → profiles.points 차감 (.eq('id', shopId))
  → point_logs INSERT: user_id = shopId (uuid)
  → payments INSERT: user_id = shopId (text)
  → sos_alerts INSERT: shop_id = shopId (uuid = profiles.id, shops.id 아님!)
  → push_subscriptions → 대상자에게 WebPush 발송
```

### 점프(Jump) 플로우

```
profiles.jump_balance = 잔여 점프 횟수
  → auto-jump cron: 플랜 등급별 자동 차감 + 공고 상단 노출
  → 점프 충전: payments.insert(metadata.type='jump_charge') → 어드민 승인 → grant-balance API
  → jump_balance UPDATE: profiles.eq('id', userId)
```

### 지원서 플로우 (현재 버그 있음 — 수정 필요)

```
[지원자]
개인회원 → 공고 상세에서 지원
  applications.insert:
    user_id = 지원자 profiles.id (uuid)
    shop_id = ??? (현재 shops.id bigint를 uuid 컬럼에 저장 시도 — 데이터 이상)
    applicant_name, applicant_phone, message

[업체]
ApplicantsView → 내 공고의 지원서 조회
  현재 (버그): shops.id(bigint) → applications.in('shop_id', bigintArray) → 0건
  수정 필요: applications 테이블에 owner_user_id TEXT 컬럼 추가 필요
```

### 쪽지 플로우 (현재 이중 구조 — 정비 필요)

```
발송:
  NoteService.sendNote(content, senderName, receiverName, senderId, receiverId)
  → messages.insert: sender_id, receiver_id, sender_name, receiver_name, is_read=false
  ⚠️ senderId/receiverId를 반드시 전달해야 함 (optional이지만 실질 필수)

수신 조회:
  ✅ 올바른 방법: NoteService.getInboxById(user.id) → .eq('receiver_id', userId)
  ❌ 잘못된 방법: NoteService.getInbox(userName) → .eq('receiver_name', userName) — 닉네임 변경 시 소실
  
현재 일부 코드가 여전히 getInbox(userName) 사용 중 → 전수 교체 필요
```

---

## 4. 안티그래비티 작업 수칙

모든 코드 작업 시 아래를 반드시 확인:

### 체크리스트

```
□ shops.id(bigint) ≠ profiles.id(uuid) ≠ shops.user_id(text) 구분 확인
□ Tier 판별: productType || tier || product_type || ad_type || options?.product_type 체인 사용
□ 쪽지 발송 시 sender_id + receiver_id 반드시 포함 (이름만으로 저장 금지)
□ 쪽지 수신 조회: getInboxById(userId) 사용 (getInbox(userName) 사용 금지)
□ 결제 INSERT 시 type/updated_at 컬럼 사용 금지 (존재 안 함)
□ notifications 읽음 컬럼: read (is_read 아님)
□ point_logs INSERT 시 note/description 컬럼 사용 금지
□ profiles 업체회원 조회: .or('role.eq.corporate,user_type.eq.corporate')
```

### 신규 기능 추가 시 DB 컬럼 추가 규칙

```
1. 기존 컬럼 타입과 연결하는 외래키성 컬럼은 타입을 반드시 일치시킬 것
   예: shops.id(bigint) → 참조 시 bigint / TEXT 혼용 금지

2. user_id 컬럼 추가 시 타입 명시:
   - profiles.id 참조용 → TEXT (기존 패턴: shops.user_id, messages.sender_id 등)
   - point_logs처럼 uuid가 필요하면 uuid로 통일 (기존 코드 확인 후 일치)

3. 신규 테이블 생성 금지 (대표님 승인 전) — 기존 테이블 컬럼 추가만 허용
```

---

## 5. 즉시 수정 필요한 버그 목록 (우선순위순)

| 우선순위 | 버그 | 파일 | 수정 방법 |
|----------|------|------|-----------|
| 🔴 1순위 | applications 조회 0건 (bigint→uuid 타입 불일치) | `ApplicantsView.tsx` | applications에 `owner_user_id TEXT` 컬럼 추가 + 쿼리 변경 |
| 🟠 2순위 | 쪽지 이름 기반 조회 — 닉네임 변경 시 소실 | `noteService.ts`, `MessageModal.tsx` | getInboxById(userId)로 전수 교체 |
| 🟡 3순위 | SOS shopId 명칭 혼란 | 코드 전반 | 주석/변수명에 "= profiles.id, not shops.id" 명시 |

---

## 6. DB SQL (대표님 Supabase 실행 필요)

### 버그 1 수정 — applications 테이블 owner_user_id 추가

```sql
-- 업체 소유자 user_id 컬럼 추가 (지원서 조회 버그 수정용)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS owner_user_id TEXT;

-- 기존 데이터 백필: shop_id(uuid)로 shops 찾기는 불가(타입 불일치)
-- 실제로 저장된 기존 applications.shop_id 값 확인 필요:
-- SELECT shop_id, pg_typeof(shop_id) FROM applications LIMIT 5;
```

> ⚠️ 기존 applications 데이터의 shop_id가 실제로 어떤 값인지 먼저 확인 필요.
> shops.id(bigint)가 uuid 컬럼에 cast되어 저장됐는지, 또는 다른 값인지 확인 후 백필 결정.

---

*이 문서는 코드 수정 시 반드시 참조. P2 CLAUDE.md, MISTAKES_LOG.md와 함께 선행 필독 3대 문서.*
