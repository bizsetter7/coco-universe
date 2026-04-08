"""
conftest.py — 코코알바 E2E 테스트 공용 픽스처
pytest-playwright 기반, 프로덕션(www.cocoalba.kr) 대상
"""

import os
import pytest
from playwright.sync_api import Page, expect

# ── 환경변수 ──────────────────────────────────────────────────────────────────
BASE_URL       = os.environ.get("PLAYWRIGHT_BASE_URL", "https://www.cocoalba.kr")
TEST_USER_ID   = os.environ.get("TEST_USER_ID",  "")
TEST_USER_PW   = os.environ.get("TEST_USER_PW",  "")
TEST_SHOP_ID   = os.environ.get("TEST_SHOP_ID",  "")
TEST_SHOP_PW   = os.environ.get("TEST_SHOP_PW",  "")

# Secrets 설정 여부 — 미설정 시 로그인 필요 테스트 자동 skip
SECRETS_CONFIGURED = bool(TEST_USER_ID and TEST_USER_PW and TEST_SHOP_ID and TEST_SHOP_PW)

# ── pytest-playwright 옵션 오버라이드 ─────────────────────────────────────────
def pytest_configure(config):
    """헤드리스 실행, 슬로우 모드 없음"""
    pass


# ── 헬퍼 함수 ─────────────────────────────────────────────────────────────────

def bypass_adult_gate(page: Page, timeout: int = 6000) -> None:
    """성인인증 오버레이가 뜨면 '성인인증없이 나가기' 클릭으로 우회"""
    try:
        btn = page.get_by_role("button", name="성인인증없이 나가기")
        btn.wait_for(state="visible", timeout=timeout)
        btn.click()
        # 오버레이 사라질 때까지 대기
        btn.wait_for(state="hidden", timeout=3000)
    except Exception:
        pass  # 게이트가 없거나 이미 닫힌 경우 무시


def login(page: Page, user_id: str, password: str, base_url: str = BASE_URL) -> None:
    """로그인 모달 열고 ID/PW 입력 후 로그인"""
    page.goto(f"{base_url}/?page=login")
    bypass_adult_gate(page)

    # 개인/업체 탭 중 이미 올바른 탭에 있을 수 있으므로 아이디 입력창 대기
    id_input = page.locator('input[placeholder*="아이디"]').first
    id_input.wait_for(state="visible", timeout=5000)
    id_input.fill(user_id)

    pw_input = page.locator('input[type="password"]').first
    pw_input.fill(password)

    page.get_by_role("button", name="로그인").click()

    # 로그인 완료 확인 — 모달 닫히거나 URL 변경 대기
    page.wait_for_timeout(2000)


# ── 픽스처 ────────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def base_url_env() -> str:
    return BASE_URL


@pytest.fixture
def fresh_page(page: Page) -> Page:
    """성인 게이트 우회된 빈 페이지 (비로그인)"""
    page.goto(BASE_URL)
    bypass_adult_gate(page)
    return page


@pytest.fixture
def individual_page(page: Page) -> Page:
    """개인회원(test_user)으로 로그인된 페이지"""
    if not SECRETS_CONFIGURED:
        pytest.skip("GitHub Secrets 미설정 — TEST_USER_ID / TEST_USER_PW 필요")
    login(page, TEST_USER_ID, TEST_USER_PW)
    return page


@pytest.fixture
def corporate_page(page: Page) -> Page:
    """업체회원(test_shop)으로 로그인된 페이지"""
    if not SECRETS_CONFIGURED:
        pytest.skip("GitHub Secrets 미설정 — TEST_SHOP_ID / TEST_SHOP_PW 필요")
    login(page, TEST_SHOP_ID, TEST_SHOP_PW)
    return page
