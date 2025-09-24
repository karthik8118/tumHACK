import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import pandas as pd

model = SentenceTransformer('all-MiniLM-L6-v2')

def create_faiss_index(df, text_column='candidate_text'):
    texts = df[text_column].fillna("").tolist()
    embeddings = model.encode(texts, convert_to_numpy=True)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    return index, embeddings, df

def search_faiss(index, embeddings, df, query_text, top_k=5):
    query_vec = model.encode([query_text], convert_to_numpy=True)
    D, I = index.search(query_vec, top_k)
    results = []
    for i, dist in zip(I[0], D[0]):
        row = df.iloc[i]
        results.append({
            "company": row.get("name", ""),
            "description": row.get("short_description", ""),
            "country": row.get("country", ""),
            "distance": float(dist)
        })
    return results
