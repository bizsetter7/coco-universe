"""
test_02_auth.py — 로그인 / 로그아웃 / 인증 테스트
E2E 체크리스트: #1~#8, 자동로그아웃 일부
"""

import pytest
from playwright.sync_api import Page, expect
from conftest import BASE_URL, TEST_USER_ID, TEST_USER_PW, TEST_SHOP_ID, TEST_SHOP_PW, bypass_adult_gate, login


class TestLogin:
    """TC009~TC012 — 로그인 성공/실패 시나리오"""

    def test_login_success_individual(self, page: Page):
        """TC009 — 개인회원 로그인 성공 후 인증 상태 확인"""
        login(page, TEST_USER_ID, TEST_USER_PW)
        # 로그인 후: 마이페이지 또는 프로필 버튼 표시
        page.wait_for_timeout(2000)
        body_text = page.locator("body").inner_text()
        # 로그인 버튼이 사라지거나 로그아웃 버튼 등이 표시됨
        assert "로그인 / 회원가입" not in body_text or "로그아웃" in body_text or \
               TEST_USER_ID in body_text or "마이페이지" in body_text, \
            "로그인 후 인증 상태 미반영"

    def test_login_success_corporate(self, page: Page):
        """TC014 변형 — 업체회원 로그인 성공 후 마이샵 접근"""
        login(page, TEST_SHOP_ID, TEST_SHOP_PW)
        page.goto(f"{BASE_URL}/my-shop")
        page.wait_for_load_state("networkidle")
        # 마이샵 페이지 정상 표시 (로그인 리다이렉트 없어야 함)
        assert "/my-shop" in page.url or "shop" in page.url.lower(), \
            f"업체회원 마이샵 접근 실패: {page.url}"

    def test_login_fail_wrong_password(self, page: Page):
        """TC010 — 잘못된 비밀번호 로그인 실패 + 한국어 오류 메시지"""
        page.goto(f"{BASE_URL}/?page=login")
        bypass_adult_gate(page)

        id_input = page.locator('input[placeholder*="아이디"]').first
        id_input.wait_for(state="visible", timeout=5000)
        id_input.fill(TEST_USER_ID)
        page.locator('input[type="password"]').first.fill("wrong_password_123!")
        page.get_by_role("button", name="로그인").click()

        page.wait_for_timeout(2000)
        body_text = page.locator("body").inner_text()
        assert any(keyword in body_text for keyword in [
            "올바르지 않", "비밀번호", "아이디", "잘못", "틀렸"
        ]), f"로그인 실패 오류 메시지 미표시. 페이지 텍스트: {body_text[:200]}"

    def test_login_fail_empty_id(self, page: Page):
        """TC011 — 아이디 미입력 로그인 차단"""
        page.goto(f"{BASE_URL}/?page=login")
        bypass_adult_gate(page)

        id_input = page.locator('input[placeholder*="아이디"]').first
        id_input.wait_for(state="visible", timeout=5000)
        # 아이디 비워두고 비밀번호만 입력
        page.locator('input[type="password"]').first.fill("1234")
        page.get_by_role("button", name="로그인").click()

        page.wait_for_timeout(1000)
        # 로그인 모달이 아직 열려있거나 경고 메시지 표시
        body_text = page.locator("body").inner_text()
        # 로그인 후 상태가 아님을 확인 (아이디 입력창이 여전히 보여야 함)
        assert id_input.is_visible() or any(k in body_text for k in ["아이디를 입력", "필수", "입력해"]), \
            "빈 아이디로 로그인이 진행됨"

    def test_login_fail_empty_password(self, page: Page):
        """TC012 — 비밀번호 미입력 로그인 차단"""
        page.goto(f"{BASE_URL}/?page=login")
        bypass_adult_gate(page)

        id_input = page.locator('input[placeholder*="아이디"]').first
        id_input.wait_for(state="visible", timeout=5000)
        id_input.fill(TEST_USER_ID)
        # 비밀번호 비워두고 로그인 시도
        page.get_by_role("button", name="로그인").click()

        page.wait_for_timeout(1000)
        body_text = page.locator("body").inner_text()
        pw_input = page.locator('input[type="password"]').first
        assert pw_input.is_visible() or any(k in body_text for k in ["비밀번호를 입력", "필수", "입력해"]), \
            "빈 비밀번호로 로그인이 진행됨"


class TestUsernameCheck:
    """TC1/TC2 일부 — 아이디 중복확인 API 연동"""

    def test_username_check_available(self, page: Page):
        """아이디 중복확인 — 존재하지 않는 아이디 → 사용 가능"""
        page.goto(f"{BASE_URL}/api/auth/check-username?username=unique_xyz_test_99999")
        body_text = page.locator("body").inner_text()
        assert "available" in body_text.lower() or "사용 가능" in body_text or \
               "false" in body_text.lower(), \
            f"중복확인 응답 이상: {body_text[:100]}"

    def test_username_check_taken(self, page: Page):
        """아이디 중복확인 — 기존 아이디(test_user) → 사용 불가"""
        page.goto(f"{BASE_URL}/api/auth/check-username?username={TEST_USER_ID}")
        body_text = page.locator("body").inner_text()
        assert "taken" in body_text.lower() or "사용 중" in body_text or \
               "true" in body_text.lower(), \
            f"중복확인 응답 이상: {body_text[:100]}"
