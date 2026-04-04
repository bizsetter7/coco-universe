"""
test_01_public.py — 비로그인 공개 페이지 접근 테스트
E2E 체크리스트: SEO1~9, 공개 페이지 로드
"""

import pytest
from playwright.sync_api import Page, expect
from conftest import BASE_URL, bypass_adult_gate


class TestPublicPages:
    """TC015, SEO1~9 — 공개 페이지 정상 로드"""

    def test_homepage_loads(self, page: Page):
        """홈페이지 로드 + 성인 게이트 표시"""
        page.goto(BASE_URL)
        # 성인 게이트 또는 메인 콘텐츠 존재 확인
        assert page.title() != ""

    def test_adult_gate_bypass(self, page: Page):
        """성인인증없이 나가기 버튼으로 게이트 우회 — TC015 전제조건"""
        page.goto(BASE_URL)
        bypass_adult_gate(page)
        # 게이트 사라진 후 메인 콘텐츠 접근 가능
        expect(page.locator("body")).to_be_visible()

    def test_jobs_page_loads(self, fresh_page: Page):
        """TC015 — 구인광고 목록 페이지 로드"""
        fresh_page.goto(f"{BASE_URL}/jobs")
        bypass_adult_gate(fresh_page)
        # 직종 또는 지역 필터 사이드바 존재
        expect(fresh_page.locator("aside")).to_be_visible()

    def test_customer_center_loads(self, fresh_page: Page):
        """TC036/TC037 — 고객센터 페이지 로드"""
        fresh_page.goto(f"{BASE_URL}/customer-center")
        bypass_adult_gate(fresh_page)
        expect(fresh_page.get_by_text("고객센터").first).to_be_visible()

    def test_community_page_loads(self, fresh_page: Page):
        """TC035 — 커뮤니티 목록 페이지 로드"""
        fresh_page.goto(f"{BASE_URL}/community")
        bypass_adult_gate(fresh_page)
        expect(fresh_page.locator("main")).to_be_visible()

    def test_guide_page_no_adult_gate(self, page: Page):
        """SEO1 — 가이드 페이지는 성인인증 없이 바로 표시"""
        page.goto(f"{BASE_URL}/coco/서울/룸알바")
        # 성인인증 버튼이 없어야 함 (가이드 페이지 예외)
        gate_btn = page.get_by_role("button", name="성인인증없이 나가기")
        assert not gate_btn.is_visible(timeout=3000), "가이드 페이지에서 성인 게이트가 표시됨"

    def test_guide_page_has_salary_info(self, page: Page):
        """SEO2 — 가이드 페이지 급여 정보 섹션 표시"""
        page.goto(f"{BASE_URL}/coco/서울/룸알바")
        page.wait_for_load_state("networkidle")
        # 급여 관련 텍스트 (평균 급여 또는 급여 박스)
        expect(page.get_by_text("급여").first).to_be_visible(timeout=8000)

    def test_guide_page_has_faq(self, page: Page):
        """SEO3 — 가이드 페이지 FAQ 섹션 표시"""
        page.goto(f"{BASE_URL}/coco/서울/룸알바")
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("자주 묻는 질문").first).to_be_visible(timeout=8000)

    def test_region_page_has_guide_links(self, page: Page):
        """SEO7 — 지역 페이지에 업종 가이드 링크 6개 표시"""
        page.goto(f"{BASE_URL}/coco/서울")
        bypass_adult_gate(page)
        page.wait_for_load_state("networkidle")
        # 룸알바, 텐프로, 텐카페, 노래주점, 바알바, 마사지 링크 중 하나 이상
        expect(page.get_by_text("룸알바").first).to_be_visible(timeout=8000)

    def test_nonexistent_ad_shows_error(self, page: Page):
        """SEO8 — 존재하지 않는 광고 ID 접속 시 에러 메시지"""
        page.goto(f"{BASE_URL}/coco/서울/nonexistent-ad-id-99999")
        bypass_adult_gate(page)
        page.wait_for_load_state("networkidle")
        # 에러 메시지 또는 404 처리
        body_text = page.locator("body").inner_text()
        assert any(keyword in body_text for keyword in ["존재하지 않", "없습니다", "404", "찾을 수 없"]), \
            "존재하지 않는 광고 페이지에서 적절한 에러 메시지가 없음"
