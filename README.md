# Max Planck → Unicorn Analyst (Hackathon Prototype)

**Hackathon**: CDTM x TUM.ai x Anthropic  
**Team**: Hack-a-thong

---

## Description

This project is a prototype AI Analyst that evaluates whether Max Planck research papers have potential to become unicorn startups. It combines:

- **CrewAI** for multi-agent orchestration  
- **Claude (Anthropic)** for reasoning & scoring  
- **LogicMill API** for patent similarity  
- **SearchVentures / OpenVC** for market & funding insights (Crunchbase-free)  
- **Lovable / Streamlit** for frontend visualization  

The system analyzes each research paper across six criteria: **Technology/IP**, **Market**, **Team**, **Scaling**, **Funding**, and **Impact**, producing a weighted **Unicorn Potential Score** (0–100).

---

## Features

- PDF upload & text extraction  
- Automatic keyword extraction & market competitor lookup  
- Patent similarity scoring via LogicMill  
- EU-focused funding and regulatory analysis  
- Impact assessment (SDG + Green Deal)  
- Optional PDF report export  
- Dashboard visualization (Lovable/Streamlit fallback)  

---
