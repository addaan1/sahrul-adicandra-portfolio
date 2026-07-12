PROFILE = {
    "name": "Sahrul Adicandra Effendy",
    "short_name": "Sahrul",
    "role": "Data Scientist in the making · Creative technologist",
    "headline": "I turn complex data into systems people can understand, trust, and use.",
    "summary": (
        "Undergraduate Data Science Technology student at Universitas Airlangga, currently building "
        "data products across machine learning, NLP, forecasting, cybersecurity analytics, and web engineering."
    ),
    "location": "Surabaya, East Java, Indonesia",
    "education": "B.Sc. Data Science · Universitas Airlangga",
    "education_period": "2023 — 2027",
    "current_role": "Data Science Intern · DSITD Universitas Airlangga",
    "availability": "Open to on-site, hybrid, and remote opportunities",
    "github": "https://github.com/addaan1",
    "linkedin": "https://www.linkedin.com/in/sahrul-adicandra-effendy-b5336b27b/",
    "kaggle": "https://www.kaggle.com/sahruladicandra",
}

STATS = [
    {"value": "22+", "label": "public repositories"},
    {"value": "Top 8%", "label": "Find IT! 2026"},
    {"value": "602K", "label": "records in largest project"},
    {"value": "6", "label": "featured case studies"},
]

SKILL_GROUPS = [
    {
        "name": "Data & ML",
        "mark": "01",
        "skills": ["Python", "Pandas", "scikit-learn", "PyTorch", "Time Series", "Survival Analysis"],
    },
    {
        "name": "Language & Vision",
        "mark": "02",
        "skills": ["NLP", "Transformers", "NMT", "Computer Vision", "EfficientNet", "ConvNeXt"],
    },
    {
        "name": "Product Engineering",
        "mark": "03",
        "skills": ["Django", "Flask", "PostgreSQL", "Docker", "REST", "Vanilla JavaScript"],
    },
    {
        "name": "Creative Direction",
        "mark": "04",
        "skills": ["UI/UX", "Visual Systems", "Graphic Design", "Affinity Photo", "Content Planning", "Documentation"],
    },
]

PROJECTS = [
    {
        "slug": "identity-exposure",
        "number": "01",
        "title": "UNAIR Identity Exposure Intelligence",
        "eyebrow": "Cybersecurity · Django",
        "summary": "A defensive intelligence workspace that turns sanitized exposure signals into risk priorities and remediation workflows.",
        "detail": (
            "Built during a Data Science internship for Universitas Airlangga. The system combines safe identity profiling, "
            "domain intelligence, explainable risk scoring, role-based access, audit logs, and sanitized exports."
        ),
        "impact": "From raw exposure signals to an operational mitigation queue.",
        "stack": ["Django 5", "PostgreSQL", "Docker", "Chart.js", "Risk Scoring"],
        "metric": "Defensive-by-design",
        "image": "portfolio/img/projects/identity.svg",
        "url": "https://github.com/addaan1/UNAIR-Identity-Exposure-Dashboard",
        "accent": "cyan",
    },
    {
        "slug": "ecodash",
        "number": "02",
        "title": "EcoDash Economic Intelligence",
        "eyebrow": "Forecasting · Decision Support",
        "summary": "A multi-horizon economic dashboard for Indonesian inflation, exchange rates, and regional purchasing-power proxies.",
        "detail": (
            "Evaluates ARIMA, SARIMAX, Prophet, LSTM, Bi-LSTM, and ensembles separately across 1, 3, 6, and 12-month horizons, "
            "then communicates uncertainty through walk-forward residual intervals."
        ),
        "impact": "One interface for monitoring, comparison, simulation, and presentation.",
        "stack": ["Django", "PyTorch", "statsmodels", "Prophet", "Ridge"],
        "metric": "4 forecast horizons",
        "image": "portfolio/img/projects/ecodash.svg",
        "url": "https://github.com/addaan1/Project-Machine-Learning",
        "accent": "gold",
    },
    {
        "slug": "findit",
        "number": "03",
        "title": "Face Anti-Spoofing · Find IT! 2026",
        "eyebrow": "Computer Vision · Competition",
        "summary": "An end-to-end six-class anti-spoofing pipeline engineered for domain shift, hard samples, and robust private evaluation.",
        "detail": (
            "Combined EfficientNet-B4 and ConvNeXt with stratified cross-validation, focal loss, semi-automated cleaning, "
            "and carefully matched inference preprocessing. Ranked Top 27 of 339 teams."
        ),
        "impact": "A disciplined pivot from leaderboard patching toward generalizable ensembles.",
        "stack": ["PyTorch", "timm", "Albumentations", "FiftyOne", "CLIP"],
        "metric": "Top 8% · 27/339",
        "image": "portfolio/img/projects/findit.svg",
        "url": "https://github.com/addaan1/FindIt2026",
        "accent": "coral",
    },
    {
        "slug": "galbay",
        "number": "04",
        "title": "Galbay Predictor",
        "eyebrow": "Big Data · Financial Behavior",
        "summary": "A data-first financial behavior coach that maps distress signals across Indonesian fintech conversations.",
        "detail": (
            "Curated 602,675 public items from seven sources, identified 58,120 relevant reviews across 11 distress categories, "
            "and translated findings into a Flask dashboard, decision tools, and a rule-based assistant."
        ),
        "impact": "Separates evidence-driven insight, decision support, and demo interactions clearly.",
        "stack": ["Flask", "Pandas", "scikit-learn", "DVC", "Chart.js"],
        "metric": "602,675 public items",
        "image": "portfolio/img/projects/galbay.svg",
        "url": "https://github.com/addaan1/Final-Project-AKB",
        "accent": "jade",
    },
    {
        "slug": "dataquest",
        "number": "05",
        "title": "Court Sentence Duration Prediction",
        "eyebrow": "NLP · Ensemble ML",
        "summary": "A hybrid NLP and ensemble pipeline for predicting prison sentence duration from Indonesian court decisions.",
        "detail": (
            "Processed 23,675 raw court documents with SpaCy, Stanza, Sastrawi, regex features, TF-IDF/SVD, and weighted "
            "ensembles spanning XGBoost, LightGBM, CatBoost, Random Forest, and stacking."
        ),
        "impact": "Transforms long legal narratives into auditable structured signals.",
        "stack": ["SpaCy", "Stanza", "Sastrawi", "LightGBM", "CatBoost"],
        "metric": "23,675 documents",
        "image": "portfolio/img/projects/dataquest.svg",
        "url": "https://github.com/addaan1/Dataquest-4.0",
        "accent": "violet",
    },
    {
        "slug": "madura-nlp",
        "number": "06",
        "title": "Warisan Nusantara Translator",
        "eyebrow": "Neural Translation · Culture",
        "summary": "A two-way Indonesian–Madura neural translation experience designed as a digital cultural showcase.",
        "detail": (
            "Combines Transformers and PyTorch with speech-to-text, expressive cultural art direction, Three.js particles, "
            "and an accessible web interface grounded in Madurese visual identity."
        ),
        "impact": "Technology used as a medium for language preservation and cultural access.",
        "stack": ["Transformers", "PyTorch", "Whisper", "Flask", "Three.js"],
        "metric": "Bidirectional NMT",
        "image": "portfolio/img/projects/madura.svg",
        "url": "https://github.com/addaan1/indo-madura-nlp",
        "accent": "ruby",
    },
]

JOURNEY = [
    {
        "period": "Jul 2026 — Present",
        "role": "Data Science Intern",
        "org": "Directorate of Information Systems & Digital Transformation · Universitas Airlangga",
        "description": "Building an identity exposure intelligence dashboard for cybersecurity monitoring, risk prioritization, and remediation tracking.",
        "type": "work",
    },
    {
        "period": "Feb 2025 — Jan 2026",
        "role": "Head of Graphic Division",
        "org": "HIMATESDA UNAIR · Media & Information Department",
        "description": "Led the cabinet’s visual system, social media direction, content matrix, cross-department design support, and event documentation.",
        "type": "leadership",
    },
    {
        "period": "Jun — Dec 2025",
        "role": "Coordinator, Publication Documentation & Design",
        "org": "PHILANTHROPY 2025",
        "description": "Coordinated visual communication and documentation delivery for a major student program.",
        "type": "leadership",
    },
    {
        "period": "Feb 2024 — Jan 2025",
        "role": "Media & Information Staff",
        "org": "HIMATESDA UNAIR",
        "description": "Produced posters, member-introduction videos, podcast visuals, and event documentation for clear public communication.",
        "type": "creative",
    },
    {
        "period": "Jul 2023 — Jul 2027",
        "role": "Bachelor of Data Science",
        "org": "Universitas Airlangga",
        "description": "Studying data mining, machine learning, deep learning, NLP, statistics, databases, and data-product development.",
        "type": "education",
    },
]

ACHIEVEMENTS = [
    {
        "title": "Top 8% · Find IT! 2026",
        "meta": "Top 27 of 339 teams · Universitas Gadjah Mada",
        "description": "Six-class face anti-spoofing competition using robust computer-vision ensembles.",
        "icon": "✦",
    },
    {
        "title": "National Bronze Medal · Physics",
        "meta": "Olimpiade Update Festival IX · 2024",
        "description": "Bronze medal in a national-level university physics olympiad.",
        "icon": "◆",
    },
    {
        "title": "9 Licenses & Certifications",
        "meta": "Data science, NLP, image processing, and competition participation",
        "description": "Includes Academic Competition of Data Science 2025 and Objective Quest 2025.",
        "icon": "◈",
    },
]
