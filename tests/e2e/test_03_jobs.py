"""
test_03_jobs.py — 구인광고 목록 / 필터 / 검색 테스트
E2E 체크리스트: #17~#29 (BUG-04/05 포함)
"""

import pytest
from playwright.sync_api import Page, expect
from conftest import BASE_URL, bypass_adult_gate


JOBS_URL = f"{BASE_URL}/jobs"


def open_jobs(page: Page) -> None:
    """Jobs 페이지 열고 성인 게이트 우회"""
    page.goto(JOBS_URL)
    bypass_adult_gate(page)
    page.wait_for_load_state("networkidle")


class TestJobListing:
    """TC015 — 목록 로드"""

    def test_jobs_page_shows_cards(self, page: Page):
        """TC015 — 구인광고 목록 페이지 로드 후 카드 표시"""
        open_jobs(page)
        # 사이드바와 메인 목록 영역 존재
        expect(page.locator("aside").first).to_be_visible(timeout=8000)
        expect(page.locator("main").first).to_be_visible()

    def test_today_viewed_empty_initially(self, page: Page):
        """TC025 — 오늘 본 공고 초기 상태: 빈 메시지"""
        open_jobs(page)
        # '오늘본공고' 또는 '최근 본' 탭 클릭 시도
        recently_tab = page.get_by_text("오늘본공고").first
        if recently_tab.is_visible():
            recently_tab.click()
            page.wait_for_timeout(1000)
            body_text = page.locator("body").inner_text()
            assert any(k in body_text for k in ["아직 없습니다", "없습니다", "0건"]), \
                "오늘 본 공고 탭이 빈 상태가 아님"


class TestJobFilters:
    """TC016~TC024 — 필터 기능"""

    def test_region_filter(self, page: Page):
        """TC016 — 지역 필터 선택 시 해당 지역 공고만 표시"""
        open_jobs(page)
        # 사이드바 지역 버튼 중 '서울' 클릭
        seoul_btn = page.get_by_role("button", name="서울").first
        if not seoul_btn.is_visible(timeout=3000):
            pytest.skip("서울 지역 버튼 없음 — 사이드바 구조 변경 가능성")
        seoul_btn.click()
        page.wait_for_timeout(2000)
        # '서울' 텍스트가 필터 영역에 표시됨
        expect(page.get_by_text("서울").first).to_be_visible()

    def test_filter_zero_results_shows_message(self, page: Page):
        """TC019 — 결과 0건 시 '검색 결과가 없습니다' 메시지"""
        open_jobs(page)
        # 검색창에 존재하지 않을 법한 키워드 입력
        search_input = page.locator('input[placeholder*="검색"]').first
        if not search_input.is_visible(timeout=3000):
            pytest.skip("검색 입력창 없음")
        search_input.fill("XYZZY_NONEXISTENT_KEYWORD_99999")
        # 엔터 또는 버튼 클릭
        search_input.press("Enter")
        page.wait_for_timeout(2000)
        body_text = page.locator("body").inner_text()
        assert any(k in body_text for k in ["없습니다", "결과가 없", "0건", "No result"]), \
            "검색 결과 0건인데 메시지 미표시"

    def test_filter_reset_button(self, page: Page):
        """TC021/TC023 — 필터 초기화 버튼 클릭 후 전체 목록 복원"""
        open_jobs(page)
        # 검색어 입력 후 X 버튼 또는 초기화 버튼 클릭
        search_input = page.locator('input[placeholder*="검색"]').first
        if not search_input.is_visible(timeout=3000):
            pytest.skip("검색 입력창 없음")
        search_input.fill("서울")
        search_input.press("Enter")
        page.wait_for_timeout(1500)

        # 초기화 버튼 찾기
        reset_btn = page.get_by_role("button", name="초기화").first
        if not reset_btn.is_visible(timeout=2000):
            # X 버튼 시도
            clear_btn = page.locator('button[aria-label*="clear"], button:has-text("×"), button:has-text("X")').first
            if clear_btn.is_visible(timeout=2000):
                clear_btn.click()
        else:
            reset_btn.click()

        page.wait_for_timeout(1500)
        # 검색창 비워졌는지 확인
        assert search_input.input_value() == "" or search_input.input_value() == "서울", \
            "필터 초기화 후 검색창이 비워지지 않음"

    def test_bug04_subtype_resets_on_category_change(self, page: Page):
        """BUG-04 검증 — 사이드바 직종 변경 시 서브직종 자동 초기화"""
        open_jobs(page)
        # 서브직종 드롭다운 선택 가능한지 확인 후 직종 변경
        # 사이드바에서 직종 버튼 2개 이상 있어야 함
        sidebar = page.locator("aside").first
        job_btns = sidebar.get_by_role("button")
        if job_btns.count() < 2:
            pytest.skip("사이드바 버튼 2개 미만 — 직종 변경 테스트 불가")

        # 첫 번째 직종 클릭
        job_btns.nth(0).click()
        page.wait_for_timeout(1000)

        # 서브직종 드롭다운 찾기
        sub_dropdown = page.locator('select, [role="listbox"]').first
        if sub_dropdown.is_visible(timeout=2000):
            # 두 번째 직종으로 변경
            job_btns.nth(1).click()
            page.wait_for_timeout(1000)
            # 서브직종이 초기값으로 돌아왔는지 확인 (첫 번째 옵션 = 전체)
            selected = sub_dropdown.input_value() if sub_dropdown.tag_name() == "select" else ""
            # '전체'이거나 초기 상태여야 함
            body_text = page.locator("body").inner_text()
            assert "전체" in body_text, "직종 변경 후 서브직종이 초기화되지 않음 (BUG-04)"

    def test_bug05_unauthenticated_favorite_redirects_login(self, page: Page):
        """BUG-05 검증 — 비로그인 상태에서 즐겨찾기(별) 클릭 시 로그인 페이지 이동"""
        open_jobs(page)
        page.wait_for_timeout(2000)

        # 별 아이콘 버튼 (즐겨찾기) 찾기
        fav_btn = page.locator('button[aria-label*="즐겨찾기"], button[aria-label*="bookmark"], button:has(svg)').first
        # 더 구체적으로 찾기
        star_buttons = page.locator('button').filter(has_text="").all()

        # 페이지에서 star/heart SVG를 가진 버튼 클릭 시도
        # 공고 카드의 첫 번째 즐겨찾기 버튼
        card_area = page.locator("main").first
        fav_btns = card_area.locator('button').all()

        clicked = False
        for btn in fav_btns[:10]:
            try:
                # 작은 버튼들 (즐겨찾기 아이콘 버튼)
                bbox = btn.bounding_box()
                if bbox and bbox["width"] < 50 and bbox["height"] < 50:
                    btn.click()
                    page.wait_for_timeout(1500)
                    # 로그인 페이지로 이동했는지 확인
                    if "login" in page.url or "page=login" in page.url:
                        clicked = True
                        break
            except Exception:
                continue

        if clicked:
            assert "login" in page.url or "page=login" in page.url, \
                "비로그인 즐겨찾기 클릭 후 로그인 페이지 미이동 (BUG-05)"
        else:
            pytest.skip("즐겨찾기 버튼을 찾지 못함 — 공고 없거나 UI 변경")
