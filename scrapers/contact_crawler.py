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
# --- Configuration ---
KEYWORDS = [
    # Top-level Keywords
    '유흥알바', '룸알바', '밤알바', '여우알바', '공주알바', '공주모집', '아가씨구인',
    '강남 룸싸롱', '평택 노래빠', 
    # Regional Variations (Major Areas + General Terms)
    '강남 유흥알바', '강남 룸알바', '강남 밤알바', '강남 여우알바',
    '평택 유흥알바', '평택 룸알바', '평택 밤알바', '평택 여우알바',
    '부산 유흥알바', '부산 룸알바', '부산 밤알바',
    '대구 유흥알바', '대구 룸알바', 
    '인천 유흥알바', '인천 룸알바',
    '수원 유흥알바', '수원 룸알바',
    '대전 유흥알바', '광주 유흥알바'
]
PAGES_TO_CRAWL = 5  # Number of pages per keyword
OUTPUT_FILE = "contact_list.xlsx"

def setup_driver():
    chrome_options = Options()
    # chrome_options.add_argument("--headless") # Comment out to see the browser
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # Random User Agent to avoid simple blocking
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    ]
    chrome_options.add_argument(f"user-agent={random.choice(user_agents)}")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

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
    valid_kakaos = []
    for k in kakaos:
        if len(k) < 20 and not k.lower() in ['com', 'net', 'kr', 'co']: # Simple filter
            valid_kakaos.append(k)
            
    return list(set(formatted_phones)), list(set(valid_kakaos))

def crawl_google(driver, keywords):
    results = []
    
    for keyword in keywords:
        print(f"\n🔍 Searching for: {keyword}")
        
        # URL for 2-year date range (tbs=qdr:y2)
        url = f"https://www.google.com/search?q={keyword}&tbs=qdr:y2"
        driver.get(url)
        time.sleep(random.uniform(3, 5)) 
        
        for page in range(PAGES_TO_CRAWL):
            print(f"   Processing page {page + 1}...")
            
            # Parse page content
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            search_items = soup.select('.g') # Google's result container class
            
            if not search_items:
                print("   No results found on this page.")
                break

            found_on_page = 0
            for item in search_items:
                # Extract all text from the result item
                text = item.get_text(separator=" ", strip=True)
                phones, kakaos = extract_contacts(text)
                
                if phones or kakaos:
                    link_tag = item.select_one('a')
                    link = link_tag['href'] if link_tag else ""
                    title_tag = item.select_one('h3')
                    title = title_tag.get_text() if title_tag else "No Title"
                    
                    # Store Phones
                    for phone in phones:
                        results.append({
                            "Keyword": keyword,
                            "Source": "Google",
                            "Title": title,
                            "Link": link,
                            "Type": "Phone",
                            "Contact": phone,
                            "Raw_Text": text[:200]
                        })
                        found_on_page += 1
                    
                    # Store Kakaos
                    for kakao in kakaos:
                        results.append({
                            "Keyword": keyword,
                            "Source": "Google",
                            "Title": title,
                            "Link": link,
                            "Type": "Kakao",
                            "Contact": kakao,
                            "Raw_Text": text[:200]
                        })
                        found_on_page += 1
            
            print(f"   Found {found_on_page} contacts on page {page + 1}.")

            # Navigate to next page
            try:
                # Google usually has a 'Next' button with id 'pnnext'
                next_button = driver.find_element(By.ID, "pnnext")
                next_button.click()
                time.sleep(random.uniform(4, 7)) # Random delay to behave like a human
            except Exception as e:
                print("   No more pages or navigation failed.")
                break
                
    return results

def main():
    print("🚀 Starting Contact Crawler...")
    print(f"Target Keywords: {KEYWORDS}")
    
    driver = setup_driver()
    
    try:
        data = crawl_google(driver, KEYWORDS)
        
        if data:
            df = pd.DataFrame(data)
            
            # Remove duplicates based on Contact info
            df = df.drop_duplicates(subset=['Contact'])
            
            # Save to Excel
            if os.path.exists(OUTPUT_FILE):
                os.remove(OUTPUT_FILE) # Overwrite existing
                
            df.to_excel(OUTPUT_FILE, index=False)
            print(f"\n✅ Successfully saved {len(df)} unique contacts to '{OUTPUT_FILE}'")
        else:
            print("\n⚠️ No contacts found.")
            
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
    finally:
        driver.quit()
        print("👋 Crawler finished.")

if __name__ == "__main__":
    main()
