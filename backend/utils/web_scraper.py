import requests
from bs4 import BeautifulSoup
from ratelimit import limits, sleep_and_retry

HEADERS = {"User-Agent": "research-analyst-bot/0.1"}

def scrape_owler_company_page(name):
    """
    Scrapes the Owler company search page for the given company name.

    Args:
        name (str): The company name to search for.

    Returns:
        dict: A dictionary with a single key "search_results" containing a list of dicts,
              each with a "name" key for the company name.
              Example: {"search_results": [{"name": "Company1"}, {"name": "Company2"}]}
    """
    query = name.replace(" ", "+")
    search_url = f"https://www.owler.com/search?q={query}"
    try:
        r = requests.get(search_url, headers=HEADERS, timeout=10)
    except requests.RequestException:
        return {"search_results": []}
    soup = BeautifulSoup(r.text, features="html.parser")
    if r.status_code != 200:
        return {"search_results": []}
    soup = BeautifulSoup(r.text, "html.parser")
    results = []
    for card in soup.select(".company-card")[:5]:
        title = card.select_one(".company-name")
        if title:
            results.append({"name": title.text.strip()})
    time.sleep(0.5 + random.random()*0.5)
    return {"search_results": results}
    return {"search_results": results}
