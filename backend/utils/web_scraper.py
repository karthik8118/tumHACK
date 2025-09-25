# backend/utils/web_scraper.py
import requests
from bs4 import BeautifulSoup
import time, random

HEADERS = {"User-Agent": "research-analyst-bot/0.1"}

def scrape_owler_company_page(name, max_results=5):
    query = name.replace(" ", "+")
    search_url = f"https://www.owler.com/search?q={query}"
    try:
        r = requests.get(search_url, headers=HEADERS, timeout=10)
    except requests.RequestException:
        return {"search_results": []}
    if r.status_code != 200:
        return {"search_results": []}
    soup = BeautifulSoup(r.text, "html.parser")
    results = []
    for card in soup.select(".company-card")[:max_results]:
        title = card.select_one(".company-name")
        if title:
            results.append({"name": title.text.strip()})
    time.sleep(0.4 + random.random()*0.6)
    return {"search_results": results}
