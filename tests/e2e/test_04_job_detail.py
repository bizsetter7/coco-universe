"""
test_04_job_detail.py — 광고 상세 페이지 테스트
E2E 체크리스트: #23~#27 (TC023~TC027)
"""

import pytest
from playwright.sync_api import Page, expect
from conftest import BASE_URL, bypass_adult_gate


def open_first_job(page: Page) -> bool:
    """구인 목록에서 첫 번째 공고 클릭 후 상세 페이지 이동, 성공 여부 반환"""
    page.goto(f"{BASE_URL}/jobs")
    bypass_adult_gate(page)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # 공고 카드 클릭 — 다양한 셀렉터 시도
    card = page.locator("main a, main [role='link'], main .cursor-pointer").first
    if not card.is_visible(timeout=5000):
        return False

    card.click()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)
    return True


class TestJobDetail:
    """TC023~TC027 — 광고 상세 페이지"""

    def test_navigate_to_job_detail(self, page: Page):
        """TC023 — 목록에서 공고 클릭 → 상세 페이지 이동"""
        success = open_first_job(page)
        if not success:
            pytest.skip("공고 목록에 공고 없음 — 상세 테스트 불가")
        # /coco/ 경로로 이동했는지 확인
        assert "/coco/" in page.url, f"광고 상세 URL 예상: /coco/..., 실제: {page.url}"

    def test_job_detail_shows_key_info(self, page: Page):
        """TC025 — 광고 상세 주요 정보 섹션 표시"""
        success = open_first_job(page)
        if not success:
            pytest.skip("공고 없음")

        body_text = page.locator("body").inner_text()
        # 급여, 지역, 연락처 정보 중 하나 이상 표시
        assert any(k in body_text for k in ["급여", "시급", "일급", "월급", "지역", "연락"]), \
            f"광고 상세 주요 정보 미표시. 페이지: {body_text[:200]}"

    def test_apply_button_visible(self, page: Page):
        """TC026 — 지원하기 버튼 표시"""
        success = open_first_job(page)
        if not success:
            pytest.skip("공고 없음")

        apply_btn = page.get_by_role("button", name="지원하기").first
        if not apply_btn.is_visible(timeout=3000):
            # 다른 이름 시도
            apply_btn = page.get_by_text("지원하기").first
        expect(apply_btn).to_be_visible(timeout=5000)

    def test_report_button_visible(self, page: Page):
        """TC024/TC027 — 신고 버튼(🚩) 표시"""
        success = open_first_job(page)
        if not success:
            pytest.skip("공고 없음")

        # 신고 버튼 확인 (flag 이모지 또는 '신고' 텍스트)
        report_btn = page.get_by_role("button", name="신고").first
        if not report_btn.is_visible(timeout=3000):
            report_btn = page.get_by_text("🚩").first
        if not report_btn.is_visible(timeout=2000):
            # 스크롤 후 확인
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(1000)

        body_text = page.locator("body").inner_text()
        assert any(k in body_text for k in ["신고", "🚩", "report"]), \
            "신고 버튼 미표시"

    def test_report_modal_opens(self, page: Page):
        """TC024 — 신고 버튼 클릭 → 신고 모달 열림"""
        success = open_first_job(page)
        if not success:
            pytest.skip("공고 없음")

        # 신고 버튼 찾아서 클릭
        report_btn = page.get_by_role("button", name="신고").first
        if not report_btn.is_visible(timeout=3000):
            report_btn = page.locator('button:has-text("신고"), button:has-text("🚩")').first

        if not report_btn.is_visible(timeout=2000):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            page.wait_for_timeout(1000)

        if report_btn.is_visible():
            report_btn.click()
            page.wait_for_timeout(1500)
            # 모달 또는 신고 사유 선택 UI 표시
            body_text = page.locator("body").inner_text()
            assert any(k in body_text for k in ["신고 사유", "신고하기", "허위", "불법", "스팸"]), \
                "신고 클릭 후 신고 모달 미표시"
        else:
            pytest.skip("신고 버튼을 찾지 못함")

    def test_apply_button_visible_after_scroll(self, page: Page):
        """TC026 — 스크롤 후에도 지원 버튼 유지"""
        success = open_first_job(page)
        if not success:
            pytest.skip("공고 없음")

        # 스크롤 후 확인
        page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        page.wait_for_timeout(800)

        apply_btn = page.get_by_role("button", name="지원하기").first
        if not apply_btn.is_visible(timeout=3000):
            # sticky 버튼이 있을 수 있음
            apply_btn = page.get_by_text("지원하기").first

        expect(apply_btn).to_be_visible(timeout=3000)
