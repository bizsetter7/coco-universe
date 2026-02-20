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
KEYWORDS = [
    # --- Top-level General ---
    '유흥알바', '룸알바', '밤알바', '여우알바', '공주알바', '공주모집', '아가씨구인', 
    '고소득알바', '여성알바', '당일지급알바', '주말알바', '단기알바',
    
    # --- Specific Jobs ---
    '텐프로', '쩜오', '셔츠룸', '레깅스룸', '노래방알바', '노래빠', '룸싸롱', '유흥주점', '단란주점', 
    '토킹바', '모던바', '착석바', '바알바', 'BAR알바', '여성전용클럽',
    '스웨디시 관리사', '왁싱 모델', '피팅 모델',
    
    # --- Regional - Seoul ---
    '강남 유흥알바', '강남 룸알바', '강남 여우알바', '강남 밤알바', '강남 텐프로', '강남 셔츠룸', '강남 가라오케',
    '역삼 룸알바', '선릉 룸알바', '논현 룸알바', '청담 룸알바', '신사 룸알바',
    '홍대 유흥알바', '홍대 룸알바', '신림 유흥알바', '신림 룸알바', '신림 노래빠',
    '건대 유흥알바', '종로 유흥알바', '이태원 유흥알바', '잠실 룸알바', '영등포 룸알바',
    
    # --- Regional - Gyeongsang ---
    '부산 유흥알바', '부산 룸알바', '부산 여우알바', '부산 고소득알바', '서면 유흥알바', '해운대 룸알바', '연산동 룸알바',
    '대구 유흥알바', '대구 룸알바', '동성로 유흥알바', '수성구 룸알바', '황금동 룸알바',
    '울산 유흥알바', '울산 룸알바', '삼산동 룸알바',
    '구미 유흥알바', '포항 유흥알바', '창원 유흥알바', '창원 상남동 룸알바',
    
    # --- Regional - Gyeonggi/Incheon ---
    '인천 유흥알바', '인천 룸알바', '부평 유흥알바', '부천 유흥알바', '부천 룸알바', '부천 상동 룸알바',
    '수원 유흥알바', '수원 룸알바', '인계동 유흥알바', '인계동 룸알바',
    '평택 유흥알바', '평택 룸알바', '평택 노래빠', '동탄 유흥알바', '분당 유흥알바', '일산 유흥알바',
    '안산 유흥알바', '안산 중앙동 룸알바', '시흥 유흥알바',
    
    # --- Regional - Others ---
    '대전 유흥알바', '대전 룸알바', '유성 유흥알바', '둔산동 룸알바',
    '광주 유흥알바', '광주 룸알바', '상무지구 유흥알바', '상무지구 룸알바',
    '천안 유흥알바', '천안 룸알바', '두정동 룸알바',
    '청주 유흥알바', '청주 하복대 룸알바',
    '전주 유흥알바', '제주 유흥알바'
]

PAGES_TO_CRAWL = 3  # Keep low for speed per keyword, but with many keywords it will take time
# [MODIFIED] Use absolute path to ensure saving in project root regardless of CWD
OUTPUT_FILE = r'C:\My-site\통합사이트\브랜드_통합_시스템\contact_list.xlsx'
HEADLESS_MODE = True  # True: 백그라운드 실행, False: 브라우저 보임 (성인인증 필요 시 False로 변경 후 실행하세요)

def setup_driver():
    chrome_options = Options()
    if HEADLESS_MODE:
        chrome_options.add_argument("--headless") # Enable headless mode for background run

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    # Random User Agent to avoid simple blocking
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"
    ]
    chrome_options.add_argument(f"user-agent={random.choice(user_agents)}")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def create_empty_excel():
    """Create an empty Excel file with headers if it likely doesn't exist or is invalid."""
    try:
        if not os.path.exists(OUTPUT_FILE):
            df = pd.DataFrame(columns=["Keyword", "Source", "Title", "Link", "Type", "Contact", "Raw_Text"])
            df.to_excel(OUTPUT_FILE, index=False)
            print(f"Created empty Excel file at: {os.path.abspath(OUTPUT_FILE)}")
    except Exception as e:
        print(f"Error creating empty Excel file: {e}")

def extract_contacts(text):
    """
    Extracts phone numbers (010-XXXX-XXXX) and Kakao IDs from text.
    """
    # Regex for 010-XXXX-XXXX or 010XXXXXXXX
    phone_pattern = r"010[-.\s]?([0-9]{4})[-.\s]?([0-9]{4})"
    
    # Regex for Kakao ID lookups (kakaotalk, kakao, 카톡 followed by ID)
    # This is a heuristic and might need tuning based on actual text formats
    kakao_pattern = r"(?:카톡|kakao|kakaotalk)\s*(?:ID|아이디)?\s*[:.\-]?\s*([a-zA-Z0-9_]{4,})"
    
    phones = re.findall(phone_pattern, text)
    kakaos = re.findall(kakao_pattern, text, re.IGNORECASE)
    
    formatted_phones = []
    for p in phones:
        formatted_phones.append(f"010-{p[0]}-{p[1]}")
    
    # Filter out common false positives for Kakao (like 'com', 'net' if they appear)
    # Also ignore short IDs
    valid_kakaos = []
    for k in kakaos:
        if len(k) < 20 and len(k) > 3 and not k.lower() in ['com', 'net', 'kr', 'co', 'site', 'www', 'http', 'https']: 
            valid_kakaos.append(k)
            
    return list(set(formatted_phones)), list(set(valid_kakaos))

def crawl_naver(driver, keywords):
    results = []
    for keyword in keywords:
        print(f"\n🇳 Search Naver for: {keyword}")
        
        # Naver search URL (pd=4 is recent 1 year approx, or use default)
        # Using mobile view might give different results, but desktop is fine for headless
        url = f"https://search.naver.com/search.naver?query={keyword}&nso=so%3Ar%2Cp%3A1y" # Recent 1 year
        driver.get(url)
        time.sleep(random.uniform(2, 4))
        
        # Naver infinite scroll handling (scroll down a few times)
        for _ in range(4):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1.5)
            
        try:
            body_text = driver.find_element(By.TAG_NAME, "body").text
            phones, kakaos = extract_contacts(body_text)
            
            page_title = driver.title
            
            if phones or kakaos:
                for phone in phones:
                    results.append({
                        "Keyword": keyword,
                        "Source": "Naver",
                        "Title": page_title,
                        "Link": url,
                        "Type": "Phone",
                        "Contact": phone,
                        "Raw_Text": "Extracted from page body"
                    })
                for kakao in kakaos:
                    results.append({
                        "Keyword": keyword,
                        "Source": "Naver",
                        "Title": page_title,
                        "Link": url,
                        "Type": "Kakao",
                        "Contact": kakao,
                        "Raw_Text": "Extracted from page body"
                    })
            print(f"   Found {len(phones)} phones and {len(kakaos)} kakaos on Naver.")
            
        except Exception as e:
            print(f"   Error parsing Naver page: {e}")
            
    return results

def crawl_google(driver, keywords):
    results = []
    
    for keyword in keywords:
        print(f"\n🇬 Search Google for: {keyword}")
        
        # URL for 1-year date range (tbs=qdr:y) to get fresher contacts
        url = f"https://www.google.com/search?q={keyword}&tbs=qdr:y"
        driver.get(url)
        time.sleep(random.uniform(3, 6)) # Wait for page load
        
        for page in range(PAGES_TO_CRAWL):
            print(f"   Processing page {page + 1}...")
            
            try:
                # Extract text from the entire body to avoid selector issues
                body_text = driver.find_element(By.TAG_NAME, "body").text
                phones, kakaos = extract_contacts(body_text)
                
                # Get page title for context
                page_title = driver.title
                
                if phones or kakaos:
                    # Store Phones
                    for phone in phones:
                        results.append({
                            "Keyword": keyword,
                            "Source": "Google",
                            "Title": page_title,
                            "Link": url, # Search Result Page URL (since we scan body)
                            "Type": "Phone",
                            "Contact": phone,
                            "Raw_Text": "Extracted from page body"
                        })
                    
                    # Store Kakaos
                    for kakao in kakaos:
                        results.append({
                            "Keyword": keyword,
                            "Source": "Google",
                            "Title": page_title,
                            "Link": url,
                            "Type": "Kakao",
                            "Contact": kakao,
                            "Raw_Text": "Extracted from page body"
                        })
                
                print(f"   Found {len(phones)} phones and {len(kakaos)} kakaos on page {page + 1}.")

            except Exception as e:
                print(f"   Error parsing page: {e}")

            # Navigate to next page
            try:
                # Google often changes IDs. Try broad selectors.
                # 'pnnext' logic:
                next_button = driver.find_elements(By.ID, "pnnext")
                if next_button:
                    next_button[0].click()
                    time.sleep(random.uniform(4, 7))
                else:
                    # Try finding by text if English/Korean mix
                    try:
                        next_link = driver.find_element(By.XPATH, "//a[contains(text(), '다음') or contains(text(), 'Next')]")
                        next_link.click()
                        time.sleep(random.uniform(4, 7))
                    except:
                        print("   No 'Next' button found. Stopping keyword.")
                        break
            except Exception as e:
                print(f"   Navigation failed: {e}")
                break
                
    return results

def main():
    print("🚀 Starting Contact Crawler (Enhanced Mode)...")
    print(f"Total Keywords: {len(KEYWORDS)}")
    
    create_empty_excel()
    driver = setup_driver()
    
    all_data = []
    
    try:
        # 1. Google Search
        google_data = crawl_google(driver, KEYWORDS)
        all_data.extend(google_data)
        
        # 2. Naver Search (Backup)
        naver_data = crawl_naver(driver, KEYWORDS)
        all_data.extend(naver_data)
        
        if all_data:
            df = pd.DataFrame(all_data)
            
            # Read existing if available to avoid duplicates across runs
            if os.path.exists(OUTPUT_FILE):
                try:
                    existing_df = pd.read_excel(OUTPUT_FILE)
                    # Combine
                    df = pd.concat([existing_df, df])
                except:
                    pass # Create new if read fails

            # Remove duplicates based on Contact info
            df = df.drop_duplicates(subset=['Contact'])
            
            # Save to Excel
            try: 
                # Try saving
                df.to_excel(OUTPUT_FILE, index=False)
                print(f"\n✅ Successfully saved {len(df)} unique contacts to '{os.path.abspath(OUTPUT_FILE)}'")
            except PermissionError:
                print("⚠️ Cannot overwrite file (Permission Denied). Saving to 'contact_list_new.xlsx' instead.")
                alt_file = OUTPUT_FILE.replace('.xlsx', '_new.xlsx')
                df.to_excel(alt_file, index=False)
                print(f"Saved to {alt_file}")
                
        else:
            print("\n⚠️ No contacts found in this run.")
            
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
    finally:
        driver.quit()
        print("👋 Crawler finished.")

if __name__ == "__main__":
    main()
