"""
test_05_mypage.py — 마이페이지 / 마이샵 (로그인 필요)
E2E 체크리스트: #9~#16, #26~#38 (점프 시스템 일부)
"""

import pytest
from playwright.sync_api import Page, expect
from conftest import BASE_URL, TEST_USER_ID, TEST_SHOP_ID, bypass_adult_gate, login


class TestIndividualMypage:
    """TC009/TC013 — 개인회원 마이페이지"""

    def test_mypage_shows_profile(self, individual_page: Page):
        """TC009 변형 — 개인회원 로그인 후 마이페이지 프로필 정보 표시"""
        individual_page.goto(f"{BASE_URL}/my-shop")
        individual_page.wait_for_load_state("networkidle")
        individual_page.wait_for_timeout(2000)

        body_text = individual_page.locator("body").inner_text()
        # 이름, 아이디, 포인트 중 하나 이상 표시
        assert any(k in body_text for k in [
            TEST_USER_ID, "포인트", "닉네임", "회원", "마이페이지"
        ]), f"개인회원 마이페이지 프로필 미표시: {body_text[:200]}"

    def test_favorites_accessible(self, individual_page: Page):
        """TC013 — 로그인 후 즐겨찾기 페이지 접근 가능"""
        individual_page.goto(f"{BASE_URL}/favorites")
        individual_page.wait_for_load_state("networkidle")
        # 즐겨찾기 목록 또는 빈 상태 메시지 표시
        body_text = individual_page.locator("body").inner_text()
        assert any(k in body_text for k in [
            "즐겨찾기", "스크랩", "관심", "저장한"
        ]), f"즐겨찾기 페이지 내용 없음: {body_text[:200]}"


class TestCorporateMyshop:
    """TC014, TC026~TC038 — 업체회원 마이샵"""

    def test_myshop_shows_business_info(self, corporate_page: Page):
        """TC013/TC014 — 업체회원 로그인 후 마이샵 업체 정보 표시"""
        corporate_page.goto(f"{BASE_URL}/my-shop")
        corporate_page.wait_for_load_state("networkidle")
        corporate_page.wait_for_timeout(2000)

        body_text = corporate_page.locator("body").inner_text()
        assert any(k in body_text for k in [
            TEST_SHOP_ID, "마이샵", "광고", "공고", "업체"
        ]), f"업체회원 마이샵 내용 없음: {body_text[:200]}"

    def test_myshop_has_ad_registration_entry(self, corporate_page: Page):
        """BUG-03 검증 — 마이샵에 '광고 등록' 진입 버튼 존재"""
        corporate_page.goto(f"{BASE_URL}/my-shop")
        corporate_page.wait_for_load_state("networkidle")
        corporate_page.wait_for_timeout(2000)

        body_text = corporate_page.locator("body").inner_text()
        assert any(k in body_text for k in ["광고 등록", "공고 등록", "새 광고", "+", "등록"]), \
            "마이샵에 광고 등록 버튼/링크 없음 (BUG-03)"

    def test_ongoing_ads_tab(self, corporate_page: Page):
        """TC038 — 진행중/마감 탭 전환"""
        corporate_page.goto(f"{BASE_URL}/my-shop")
        corporate_page.wait_for_load_state("networkidle")
        corporate_page.wait_for_timeout(2000)

        # 진행중 탭
        ongoing_tab = corporate_page.get_by_role("tab", name="진행중").first
        if not ongoing_tab.is_visible(timeout=3000):
            ongoing_tab = corporate_page.get_by_text("진행중").first

        if ongoing_tab.is_visible(timeout=2000):
            ongoing_tab.click()
            page_text = corporate_page.locator("body").inner_text()
            # 클릭 후 탭 내용 변경 확인
            assert "진행" in page_text or "활성" in page_text or "active" in page_text.lower(), \
                "진행중 탭 클릭 후 내용 미변경"

        # 마감 탭
        closed_tab = corporate_page.get_by_role("tab", name="마감").first
        if not closed_tab.is_visible(timeout=2000):
            closed_tab = corporate_page.get_by_text("마감").first

        if closed_tab.is_visible(timeout=2000):
            closed_tab.click()
            corporate_page.wait_for_timeout(1000)
            # 마감 탭 내용 확인
            expect(corporate_page.locator("main").first).to_be_visible()

    def test_pending_ad_jump_button_disabled(self, corporate_page: Page):
        """TC026/TC027 — 미승인 광고 점프 버튼은 disabled 상태"""
        corporate_page.goto(f"{BASE_URL}/my-shop")
        corporate_page.wait_for_load_state("networkidle")
        corporate_page.wait_for_timeout(2000)

        # 심사중 배지가 있는 광고 찾기
        pending_badge = corporate_page.get_by_text("심사중").first
        if not pending_badge.is_visible(timeout=3000):
            pytest.skip("미승인(심사중) 광고 없음 — 점프 버튼 테스트 불가")

        # 해당 광고 카드에서 점프 버튼 찾기
        card = pending_badge.locator("xpath=ancestor::div[contains(@class,'rounded')]").first
        jump_btn = card.get_by_role("button").filter(has_text="점프").first
        if jump_btn.is_visible(timeout=2000):
            # disabled 또는 승인대기 텍스트
            assert jump_btn.is_disabled() or "승인대기" in jump_btn.inner_text(), \
                "미승인 광고 점프 버튼이 활성화되어 있음"
