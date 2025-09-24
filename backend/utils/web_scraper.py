import requests
from bs4 import BeautifulSoup
import time, random

HEADERS = {"User-Agent": "research-analyst-bot/0.1"}

def scrape_owler_company_page(name):
    query = name.replace(" ", "+")
    search_url = f"https://www.owler.com/search?q={query}"
    r = requests.get(search_url, headers=HEADERS, timeout=10)
    if r.status_code != 200:
        return {}
    soup = BeautifulSoup(r.text, "html.parser")
    results = []
    for card in soup.select(".company-card")[:5]:
        title = card.select_one(".company-name")
        if title:
            results.append({"name": title.text.strip()})
    time.sleep(0.5 + random.random()*0.5)
    return {"search_results": results}
