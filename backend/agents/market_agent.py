from rapidfuzz import fuzz, process
from backend.utils.data_utils import load_searchventures, load_openvc
from backend.utils.web_scraper import scrape_owler_company_page
from backend.utils.faiss_utils import create_faiss_index, search_faiss

SV_DF = load_searchventures()
OV_DF = load_openvc()
if not OV_DF.empty:
    OV_DF['company_lower'] = OV_DF['company'].str.lower()
FAISS_INDEX, FAISS_EMB = create_faiss_index(SV_DF) if not SV_DF.empty else (None, None)

def find_competitors_semantic(text, top_n=5):
    matches = []
    if FAISS_INDEX:
        matches = search_faiss(FAISS_INDEX, SV_DF, text, top_k=top_n)
        for m in matches:
            m['source'] = 'faiss'

    # fallback fuzzy
    if len(matches) < top_n and not SV_DF.empty:
        keywords = text.split()[:10]
        fuzzy_matches = []
        for kw in keywords:
            choices = SV_DF['candidate_text'].tolist()
            results = process.extract(kw, choices, scorer=fuzz.WRatio, limit=5)
            for match_text, score, idx in results:
                row = SV_DF.iloc[idx]
                fuzzy_matches.append({
                    "company": row.get("name"),
                    "description": row.get("short_description"),
                    "country": row.get("country"),
                    "score": int(score),
                    "source": "fuzzy"
                })
        seen = set([m['company'] for m in matches])
        for fm in fuzzy_matches:
            if fm['company'] not in seen:
                matches.append(fm)
                seen.add(fm['company'])
    investors = []
    if not OV_DF.empty:
        for comp in matches:
            cname = comp["company"]
            cname_lower = str(cname).lower()
    fallback = {}
    if len(matches) == 0:
        split_text = text.split()
    fallback = {}
    if len(matches) == 0:
        fallback = scrape_owler_company_page(text.split()[0])
    # Sort matches by score descending before slicing
    matches_sorted = sorted(matches, key=lambda x: x.get('score', 0), reverse=True)
    return {"matches": matches_sorted[:top_n], "investors": investors, "fallback_owler": fallback}
    return {"matches": matches[:top_n], "investors": investors, "fallback_owler": fallback}
    if len(matches) == 0:
        fallback = scrape_owler_company_page(text.split()[0])
    return {"matches": matches[:top_n], "investors": investors, "fallback_owler": fallback}
