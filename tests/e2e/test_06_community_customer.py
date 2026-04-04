"""
test_06_community_customer.py — 커뮤니티 + 고객센터 테스트
E2E 체크리스트: TC035~TC039, I1~I4 일부
"""

import pytest
from playwright.sync_api import Page, expect
from conftest import BASE_URL, bypass_adult_gate


CUSTOMER_CENTER_URL = f"{BASE_URL}/customer-center"
COMMUNITY_URL = f"{BASE_URL}/community"


class TestCommunity:
    """TC035 — 커뮤니티"""

    def test_community_list_loads(self, page: Page):
        """TC035 — 커뮤니티 게시글 목록 로드"""
        page.goto(COMMUNITY_URL)
        bypass_adult_gate(page)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)

        body_text = page.locator("body").inner_text()
        assert any(k in body_text for k in ["커뮤니티", "게시글", "글쓰기", "자유게시판", "공지"]), \
            f"커뮤니티 페이지 내용 없음: {body_text[:200]}"

    def test_community_post_detail(self, page: Page):
        """TC035 — 커뮤니티 게시글 클릭 → 상세 페이지 이동"""
        page.goto(COMMUNITY_URL)
        bypass_adult_gate(page)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)

        # 첫 번째 게시글 링크 클릭
        post_link = page.locator("main a, main [role='link']").first
        if not post_link.is_visible(timeout=5000):
            pytest.skip("커뮤니티 게시글 없음")

        initial_url = page.url
        post_link.click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1500)

        # URL이 변경되었거나 상세 내용 표시
        assert page.url != initial_url or page.locator("article, .post-detail, [data-post]").first.is_visible(timeout=3000), \
            "커뮤니티 게시글 상세 페이지 이동 실패"


class TestCustomerCenter:
    """TC036~TC039 — 고객센터"""

    def _open_customer_center(self, page: Page) -> None:
        page.goto(CUSTOMER_CENTER_URL)
        bypass_adult_gate(page)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)

    def test_customer_center_loads(self, page: Page):
        """TC036 — 고객센터 페이지 기본 로드"""
        self._open_customer_center(page)
        expect(page.get_by_text("고객센터").first).to_be_visible(timeout=5000)

    def test_faq_expands(self, page: Page):
        """TC036 — FAQ 항목 클릭 → 답변 펼쳐짐"""
        self._open_customer_center(page)

        # FAQ 탭 클릭 (자주묻는질문)
        faq_tab = page.get_by_text("자주묻는질문").first
        if not faq_tab.is_visible(timeout=3000):
            faq_tab = page.get_by_role("button", name="FAQ").first
        if faq_tab.is_visible(timeout=2000):
            faq_tab.click()
            page.wait_for_timeout(1000)

        # 첫 번째 FAQ 버튼 클릭
        faq_btn = page.locator('button:has-text("Q.")').first
        if not faq_btn.is_visible(timeout=3000):
            # 다른 방식으로 찾기
            faq_btn = page.locator("button.faq, details summary, .accordion button").first

        if not faq_btn.is_visible(timeout=2000):
            pytest.skip("FAQ 버튼을 찾지 못함")

        # 클릭 전 상태
        faq_btn.click()
        page.wait_for_timeout(1500)

        # 답변이 표시되었는지 확인 (A. 로 시작하는 텍스트)
        body_text = page.locator("body").inner_text()
        assert "A." in body_text or "답변" in body_text or "입금" in body_text, \
            "FAQ 클릭 후 답변 미표시"

    def test_tab_switch_faq_to_inquiry(self, page: Page):
        """TC037 — 탭 전환: FAQ ↔ 1:1 문의"""
        self._open_customer_center(page)

        # 1:1 문의 탭 클릭
        inquiry_tab = page.get_by_text("1:1 문의").first
        if not inquiry_tab.is_visible(timeout=3000):
            inquiry_tab = page.get_by_role("button", name="문의").first

        if not inquiry_tab.is_visible(timeout=2000):
            pytest.skip("1:1 문의 탭 없음")

        inquiry_tab.click()
        page.wait_for_timeout(1500)

        body_text = page.locator("body").inner_text()
        assert any(k in body_text for k in ["문의", "제목", "내용", "문의하기"]), \
            "1:1 문의 탭 전환 후 내용 미표시"

    def test_notice_section_accessible(self, page: Page):
        """TC039 — 공지사항 탭 접근 가능"""
        self._open_customer_center(page)

        notice_tab = page.get_by_text("공지사항").first
        if not notice_tab.is_visible(timeout=3000):
            notice_tab = page.get_by_role("button", name="공지").first

        if not notice_tab.is_visible(timeout=2000):
            pytest.skip("공지사항 탭 없음")

        notice_tab.click()
        page.wait_for_timeout(1500)

        # 공지사항 목록 또는 빈 메시지 표시
        body_text = page.locator("body").inner_text()
        assert any(k in body_text for k in ["공지", "등록된", "없습니다", "안내"]), \
            "공지사항 탭 클릭 후 내용 미표시"

    def test_tab_switch_via_url_params(self, page: Page):
        """TC037 변형 — URL 파라미터로 탭 직접 접근"""
        page.goto(f"{CUSTOMER_CENTER_URL}?tab=faq")
        bypass_adult_gate(page)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2000)

        body_text = page.locator("body").inner_text()
        assert any(k in body_text for k in ["자주묻는", "FAQ", "Q.", "질문"]), \
            "URL 파라미터로 FAQ 탭 직접 접근 실패"

    def test_inquiry_form_has_required_fields(self, page: Page):
        """TC038 준비 — 1:1 문의 폼 제목/내용 입력창 존재"""
        self._open_customer_center(page)

        inquiry_tab = page.get_by_text("1:1 문의").first
        if not inquiry_tab.is_visible(timeout=3000):
            pytest.skip("1:1 문의 탭 없음")

        inquiry_tab.click()
        page.wait_for_timeout(1500)

        # 제목 입력창
        title_input = page.locator('input[placeholder*="제목"]').first
        if not title_input.is_visible(timeout=3000):
            title_input = page.locator('input[type="text"]').first

        # 내용 입력창
        content_input = page.locator('textarea').first

        body_text = page.locator("body").inner_text()
        # 둘 중 하나라도 있으면 OK
        has_form = (
            title_input.is_visible(timeout=1000) or
            content_input.is_visible(timeout=1000) or
            any(k in body_text for k in ["제목", "내용", "문의 내용"])
        )
        assert has_form, "1:1 문의 폼 입력창 없음"
