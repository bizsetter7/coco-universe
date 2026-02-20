import time
import random
import re
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import os

# --- Configuration ---
# 1. Base Job Keywords (직종 키워드)
JOB_KEYWORDS = [
    '유흥알바', '룸알바', '밤알바', '여우알바', '공주알바', '공주모집', '아가씨구인',
    '고소득알바', '여성알바', '당일지급', '싸롱알바', '보도알바', '노래방알바',
    '텐프로', '쩜오', '셔츠룸', '레깅스룸', '노래빠', '룸싸롱', '유흥주점', '단란주점', 
    '토킹바', '모던바', '착석바', '바알바', 'BAR알바', '여성전용클럽',
    '스웨디시 관리사', '왁싱 모델',
    '노래빠알바', '노래방 도우미', '유흥 도우미', '도우미알바'
]

# 2. Detailed Region Hierarchy (1차, 2차, 3차 조합을 위한 계층 구조)
REGION_HIERARCHY = {
    '서울': [
        '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구',
        '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
    ],
    '경기': [
        '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시',
        '김포시', '남양주시', '동두천시', '부천시', '성남시', '분당', '수원시', '인계동', '영통', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군',
        '여주시', '연천군', '오산시', '용인시', '수지', '의왕시', '의정부시', '이천시', '파주시', '평택시', '송탄', '동탄', '병점', '포천시', '하남시', '화성시'
    ],
    '인천': ['강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'],
    '부산': [
        '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'
    ],
    '대구': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '광주': ['광산구', '남구', '동구', '북구', '서구'],
    '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
    '울산': ['남구', '동구', '북구', '울주군', '중구'],
    '강원': [
        '강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군',
        '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'
    ],
    '경남': [
        '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시',
        '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'
    ],
    '경북': [
        '경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시',
        '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'
    ],
    '전남': [
        '강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시',
        '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'
    ],
    '전북': [
        '고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'
    ],
    '충남': [
        '계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군',
        '천안시', '청양군', '태안군', '홍성군'
    ],
    '충북': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
    '제주': ['서귀포시', '제주시'],
    '세종': ['세종시']
}

# 3. Modifiers (수식어 - 3차, 4차 조합용)
MODIFIERS = ['고소득', '당일지급', '숙식제공', '초보가능', '경력우대', '주말', '야간', '단기']

# 4. Social Media Platforms (5차 조합용)
PLATFORMS = ['site:instagram.com', 'site:threads.net', 'site:twitter.com', 'site:facebook.com']

# Generate Enhanced Combinations (1차 ~ 5차 조합)
KEYWORDS = []
for province, cities in REGION_HIERARCHY.items():
    for city in cities:
        for job in JOB_KEYWORDS:
            base_keyword = f"{city} {job}" 
            KEYWORDS.append(base_keyword)
            KEYWORDS.append(f"{province} {city} {job}")
            if city in ['강남구', '수원시', '부산진구', '서면', '인계동', '해운대구']: 
                for mod in MODIFIERS[:3]:
                    KEYWORDS.append(f"{city} {mod} {job}")

CORE_AREAS = [
    '강남', '홍대', '건대', '수원', '인계동', '동탄', '평택', '부천', '부평', 
    '부산', '서면', '해운대', '광안리', '대구', '동성로', '광주', '상무지구', '대전', '둔산동', '유성'
]

for area in CORE_AREAS:
    for job in JOB_KEYWORDS:
        for platform in PLATFORMS:
            KEYWORDS.append(f"{platform} {area} {job}")
            
TAIL_COMBINATIONS = [
    ('수원', '인계동', '노래빠'), ('화성', '동탄', '노래방'), ('평택', '송탄', '유흥'), 
    ('서울', '강남', '텐프로'), ('부산', '서면', '룸알바'), ('광주', '상무지구', '룸싸롱')
]

for region_1, region_2, job_type in TAIL_COMBINATIONS:
    for mod in ['당일지급', '고소득']:
        KEYWORDS.append(f"{region_1} {region_2} {job_type}알바 {mod}")
        KEYWORDS.append(f"{region_1} {region_2} {job_type}도우미 {mod}")

# --- Constants & Paths ---
BASE_PATH = r'C:\My-site\통합사이트\브랜드_통합_시스템'
OUTPUT_FILE = os.path.join(BASE_PATH, 'contact_list.xlsx')
# [NEW] Checkpoint file to remember finished keywords
CHECKPOINT_FILE = os.path.join(BASE_PATH, 'finished_keywords.txt')

# Use local AppData to avoid OneDrive sync issues
USER_DATA_DIR = os.path.join(os.environ.get('LOCALAPPDATA', 'C:\\Temp'), "chrome_profile_crawler")
HEADLESS_MODE = False
PAGES_TO_CRAWL = 3

def setup_driver():
    chrome_options = Options()
    if HEADLESS_MODE:
        chrome_options.add_argument("--headless")

    chrome_options.add_argument(f"--user-data-dir={USER_DATA_DIR}")
    chrome_options.add_argument("--profile-directory=Default")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    })
    return driver

def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def save_checkpoint(keyword):
    with open(CHECKPOINT_FILE, 'a', encoding='utf-8') as f:
        f.write(f"{keyword}\n")

def check_captcha(driver):
    """Detects Google reCAPTCHA and waits until the user solves it."""
    try:
        if "google.com/sorry" in driver.current_url or driver.find_elements(By.ID, "captcha-form") or driver.find_elements(By.XPATH, "//iframe[contains(@src, 'recaptcha')]"):
            print("\n⚠️ [봇 감지] 구글이 로봇 확인을 요청했습니다.")
            print("브라우저 창에서 직접 '로봇이 아닙니다'를 클릭하거나 캡차를 해결해 주세요.")
            print("해결이 완료되면 크롤러가 자동으로 다시 시작됩니다...")
            
            while "google.com/sorry" in driver.current_url:
                time.sleep(2)
            print("✅ 캡차가 해결되었습니다. 다시 시작합니다!")
            return True
    except:
        pass
    return False

def create_empty_excel():
    try:
        if not os.path.exists(OUTPUT_FILE):
            df = pd.DataFrame(columns=["Keyword", "Source", "Title", "Link", "Type", "Contact", "Account_ID", "Raw_Text"])
            df.to_excel(OUTPUT_FILE, index=False)
            print(f"Created Excel: {OUTPUT_FILE}")
    except Exception as e:
        print(f"Error creating Excel: {e}")

def extract_id_from_url(url):
    if not url: return None
    patterns = [
        r"instagram\.com/([a-zA-Z0-9._]+)",
        r"threads\.net/@([a-zA-Z0-9._]+)",
        r"twitter\.com/([a-zA-Z0-9_]+)",
        r"x\.com/([a-zA-Z0-9_]+)",
        r"facebook\.com/([a-zA-Z0-9.]+)"
    ]
    for p in patterns:
        match = re.search(p, url)
        if match:
            uid = match.group(1)
            if uid not in ['p', 'reels', 'explore', 'stories', 'groups', 'pages', 'share']:
                return uid
    return None

def extract_contacts(text, url=None):
    phone_pattern = r"010[-.\s]?([0-9]{4})[-.\s]?([0-9]{4})"
    kakao_pattern = r"(?:카톡|kakao|kakaotalk)\s*(?:ID|아이디)?\s*[:.\-]?\s*([a-zA-Z0-9_]{4,})"
    sns_pattern = r"@([a-zA-Z0-9._]{3,20})"
    
    phones = re.findall(phone_pattern, text)
    kakaos = re.findall(kakao_pattern, text, re.IGNORECASE)
    sns_ids = list(re.findall(sns_pattern, text))
    
    url_id = extract_id_from_url(url)
    if url_id: sns_ids.append(url_id)
    
    formatted_phones = [f"010-{p[0]}-{p[1]}" for p in phones]
    valid_kakaos = [k for k in kakaos if len(k) < 20 and len(k) > 3 and not k.lower() in ['com', 'net', 'kr', 'co', 'site', 'www']]
    valid_sns = [s for s in sns_ids if not s.lower() in ['gmail', 'naver', 'kakao', 'outlook', 'gmail.com', 'naver.com', 'site', 'blog']]
            
    return list(set(formatted_phones)), list(set(valid_kakaos)), list(set(valid_sns))

def save_intermediate_data(results):
    """Save results as they are found to minimize data loss."""
    if not results: return
    try:
        new_df = pd.DataFrame(results)
        if os.path.exists(OUTPUT_FILE):
            existing_df = pd.read_excel(OUTPUT_FILE)
            combined_df = pd.concat([existing_df, new_df])
            combined_df = combined_df.drop_duplicates(subset=['Contact'])
            combined_df.to_excel(OUTPUT_FILE, index=False)
        else:
            new_df.to_excel(OUTPUT_FILE, index=False)
    except Exception as e:
        print(f"Intermediate save error: {e}")

def crawl_naver(driver, keywords):
    finished = load_checkpoint()
    for keyword in keywords:
        if f"Naver_{keyword}" in finished: continue
        
        print(f"\n🇳 Naver: {keyword}")
        url = f"https://search.naver.com/search.naver?query={keyword}&nso=so%3Ar%2Cp%3A1y"
        driver.get(url)
        time.sleep(random.uniform(2, 4))
        
        for _ in range(3):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1)
            
        try:
            body_text = driver.find_element(By.TAG_NAME, "body").text
            phones, kakaos, sns_ids = extract_contacts(body_text, url)
            page_title = driver.title
            account_id = ", ".join(sns_ids) if sns_ids else ""
            
            results = []
            if phones or kakaos:
                for phone in phones:
                    results.append({"Keyword": keyword, "Source": "Naver", "Title": page_title, "Link": url, "Type": "Phone", "Contact": phone, "Account_ID": account_id, "Raw_Text": "Extracted"})
                for kakao in kakaos:
                    results.append({"Keyword": keyword, "Source": "Naver", "Title": page_title, "Link": url, "Type": "Kakao", "Contact": kakao, "Account_ID": account_id, "Raw_Text": "Extracted"})
                save_intermediate_data(results)
            print(f"   Found {len(phones)}P, {len(kakaos)}K, {len(sns_ids)}S")
            save_checkpoint(f"Naver_{keyword}")
            
        except Exception as e:
            print(f"   Error: {e}")
            
    return [] # Results are saved incrementally

def crawl_google(driver, keywords):
    finished = load_checkpoint()
    for keyword in keywords:
        if f"Google_{keyword}" in finished: continue
        
        print(f"\n🇬 Google: {keyword}")
        url = f"https://www.google.com/search?q={keyword}&tbs=qdr:y"
        driver.get(url)
        time.sleep(random.uniform(3, 6))
        
        for page in range(PAGES_TO_CRAWL):
            print(f"   Page {page + 1}...")
            # Check for Captcha before processing
            check_captcha(driver)
            
            try:
                body_text = driver.find_element(By.TAG_NAME, "body").text
                phones, kakaos, sns_ids = extract_contacts(body_text, keyword if 'site:' in keyword else None)
                page_title = driver.title
                account_id = ", ".join(sns_ids) if sns_ids else ""
                
                results = []
                if phones or kakaos:
                    for phone in phones:
                        results.append({"Keyword": keyword, "Source": "Google", "Title": page_title, "Link": url, "Type": "Phone", "Contact": phone, "Account_ID": account_id, "Raw_Text": "Extracted"})
                    for kakao in kakaos:
                        results.append({"Keyword": keyword, "Source": "Google", "Title": page_title, "Link": url, "Type": "Kakao", "Contact": kakao, "Account_ID": account_id, "Raw_Text": "Extracted"})
                    save_intermediate_data(results)
                print(f"   Found {len(phones)}P, {len(kakaos)}K, {len(sns_ids)}S")
                
            except Exception as e:
                print(f"   Error: {e}")
                
            try:
                next_button = driver.find_elements(By.ID, "pnnext")
                if next_button:
                    next_button[0].click()
                    time.sleep(random.uniform(4, 7))
                else: break
            except: break
            
        save_checkpoint(f"Google_{keyword}")
        
    return [] # Saved incrementally

def main():
    print(f"🚀 Starting Crawler (Resume/Checkpoint Mode)...")
    create_empty_excel()
    driver = setup_driver()
    
    if not HEADLESS_MODE:
        print("\n" + "="*50)
        print("💡 [수동 로그인 안내]")
        print("네이버/구글 로그인 및 성인인증을 완료해 주세요.")
        print("외출 시에는 로봇 확인창이 뜨면 작업이 중지되므로 다녀오신 뒤 해결해 주시면 이어서 수집됩니다.")
        print("="*50)
        input("[로그인/인증 완료 후 Enter 누르세요]...")
        
    try:
        crawl_google(driver, KEYWORDS)
        crawl_naver(driver, KEYWORDS)
        print("\n✅ All keywords processed effectively.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        driver.quit()
        print("👋 Finished.")

if __name__ == "__main__":
    main()
