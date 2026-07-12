PROFILE = {
    "name": "Sahrul Adicandra Effendy",
    "short_name": "Sahrul",
    "role": "Data Science Undergraduate · Machine Learning, NLP, and Analytics",
    "headline": "Building useful data products with clear reasoning, reliable engineering, and thoughtful visual communication.",
    "summary": (
        "Data Science undergraduate at Universitas Airlangga with hands-on experience in machine learning, "
        "natural language processing, forecasting, computer vision, analytics, and data-driven web applications."
    ),
    "location": "Surabaya, East Java, Indonesia",
    "education": "B.Sc. Data Science Technology · Universitas Airlangga",
    "education_period": "2023 — Expected 2027",
    "current_role": "Data Science Intern · Universitas Airlangga",
    "availability": "Open to Data Science, Machine Learning, and Data Analyst internships",
    "email": "sahrul.adican.effendy-2023@ftmm.unair.ac.id",
    "github": "https://github.com/addaan1",
    "linkedin": "https://www.linkedin.com/in/sahrul-adicandra-effendy-b5336b27b/",
    "kaggle": "https://www.kaggle.com/sahruladicandra",
}

STATS = [
    {"value": "22", "label": "public GitHub repositories"},
    {"value": "Top 8%", "label": "Find IT! 2026 ranking"},
    {"value": "650K+", "label": "features generated in one pipeline"},
    {"value": "6", "label": "featured project case studies"},
]

SKILL_GROUPS = [
    {
        "name": "Machine Learning & Analytics",
        "mark": "01",
        "description": "From exploratory analysis and feature engineering to validation, modeling, and interpretation.",
        "skills": ["Python", "R", "Pandas", "scikit-learn", "PyTorch", "TensorFlow", "Time Series", "Survival Analysis"],
    },
    {
        "name": "NLP & Computer Vision",
        "mark": "02",
        "description": "Working with text, audio, and image data through classical and deep-learning approaches.",
        "skills": ["NLP", "Transformers", "Neural Translation", "Computer Vision", "Whisper", "EfficientNet", "ConvNeXt"],
    },
    {
        "name": "Data Product Engineering",
        "mark": "03",
        "description": "Turning analytical work into accessible tools, dashboards, APIs, and reproducible workflows.",
        "skills": ["Django", "Flask", "Laravel", "REST API", "SQL", "MySQL", "PostgreSQL", "Docker", "Git"],
    },
    {
        "name": "Communication & Design",
        "mark": "04",
        "description": "Explaining technical work through structured writing, interface design, and visual systems.",
        "skills": ["UI/UX", "Data Visualization", "Tableau", "Graphic Design", "Adobe Photoshop", "Illustrator", "Documentation"],
    },
]

PROJECTS = [
    {
        "slug": "identity-exposure",
        "number": "01",
        "title": "UNAIR Identity Exposure Intelligence",
        "category": "Cybersecurity Analytics",
        "summary": "A defensive intelligence dashboard for monitoring sanitized identity exposure findings and prioritizing remediation.",
        "detail": (
            "Built during a Data Science internship at Universitas Airlangga. The system combines safe identity profiling, "
            "domain intelligence, explainable risk scoring, role-based access, audit logs, and sanitized exports."
        ),
        "impact": "Converts fragmented exposure signals into a traceable mitigation workflow.",
        "stack": ["Django 5", "PostgreSQL", "Docker", "Chart.js"],
        "metric": "Defensive-by-design",
        "image": "portfolio/img/projects/identity.svg",
        "url": "https://github.com/addaan1/UNAIR-Identity-Exposure-Dashboard",
        "accent": "cyan",
    },
    {
        "slug": "ecodash",
        "number": "02",
        "title": "EcoDash Economic Intelligence",
        "category": "Forecasting & Decision Support",
        "summary": "A multi-horizon dashboard for Indonesian inflation, purchasing power, exchange rates, and related indicators.",
        "detail": (
            "Evaluates ARIMA, SARIMAX, Prophet, LSTM, Bi-LSTM, and ensemble models across 1, 3, 6, and 12-month horizons, "
            "with walk-forward validation and uncertainty communication."
        ),
        "impact": "Brings monitoring, forecasting, model comparison, and policy-oriented simulation into one interface.",
        "stack": ["Django", "PyTorch", "statsmodels", "Prophet"],
        "metric": "4 forecast horizons",
        "image": "portfolio/img/projects/ecodash.svg",
        "url": "https://github.com/addaan1/Project-Machine-Learning",
        "accent": "gold",
    },
    {
        "slug": "march-mania",
        "number": "03",
        "title": "March Machine Learning Mania 2026",
        "category": "Predictive Modeling",
        "summary": "An end-to-end NCAA matchup prediction pipeline with calibrated XGBoost models and an interactive Flask dashboard.",
        "detail": (
            "Engineered historical team statistics, dynamic Elo ratings, and consensus expert rankings into more than 650,000 "
            "matchup features in under four seconds, then calibrated predictions using isotonic regression."
        ),
        "impact": "Achieved Brier Scores of 0.0940 for the men's model and 0.0624 for the women's model.",
        "stack": ["Python", "XGBoost", "Flask", "Isotonic Calibration"],
        "metric": "650K+ features",
        "image": "portfolio/img/projects/march-mania.svg",
        "url": "https://github.com/addaan1/march-machine-learning-mania-2026",
        "accent": "amber",
    },
    {
        "slug": "findit",
        "number": "04",
        "title": "Find IT! 2026 Face Anti-Spoofing",
        "category": "Computer Vision",
        "summary": "A six-class face anti-spoofing workflow designed for domain shift, difficult samples, and robust private evaluation.",
        "detail": (
            "Combined EfficientNet-B4 and ConvNeXt with stratified validation, focal loss, semi-automated cleaning, and carefully "
            "matched inference preprocessing. The project documents both public-score optimization and private robustness."
        ),
        "impact": "Reached a public score of 0.76298 and ranked Top 27 of 339 teams.",
        "stack": ["PyTorch", "timm", "Albumentations", "FiftyOne"],
        "metric": "Top 8% · 27/339",
        "image": "portfolio/img/projects/findit.svg",
        "url": "https://github.com/addaan1/FindIt2026",
        "accent": "coral",
    },
    {
        "slug": "dataquest",
        "number": "05",
        "title": "Court Sentence Duration Prediction",
        "category": "Natural Language Processing",
        "summary": "A hybrid NLP and ensemble-learning pipeline for estimating sentence duration from Indonesian court decisions.",
        "detail": (
            "Processed 23,675 court documents using SpaCy, Stanza, Sastrawi, regex features, TF-IDF/SVD, and weighted ensembles "
            "spanning XGBoost, LightGBM, CatBoost, Random Forest, and stacking."
        ),
        "impact": "Turns long legal narratives into structured, auditable predictive signals.",
        "stack": ["SpaCy", "Stanza", "LightGBM", "CatBoost"],
        "metric": "23,675 documents",
        "image": "portfolio/img/projects/dataquest.svg",
        "url": "https://github.com/addaan1/Dataquest-4.0",
        "accent": "violet",
    },
    {
        "slug": "dataset-doctor",
        "number": "06",
        "title": "Dataset Doctor",
        "category": "Open-Source Data Tooling",
        "summary": "A Python CLI for first-pass dataset quality inspection with terminal, Markdown, and browser-ready HTML reports.",
        "detail": (
            "Implements contextual checks for missing values, duplicates, suspicious semantic roles, and numeric outliers, helping "
            "analysts identify data-quality risks before deeper modeling work begins."
        ),
        "impact": "Makes early dataset review faster, repeatable, and easier to communicate.",
        "stack": ["Python", "CLI", "HTML Reporting", "Data Quality"],
        "metric": "Open-source CLI",
        "image": "portfolio/img/projects/dataset-doctor.svg",
        "url": "https://github.com/addaan1/dataset-doctor",
        "accent": "jade",
    },
]

ADDITIONAL_PROJECTS = [
    {"title": "Warisan Nusantara Translator", "label": "Indonesian–Madurese NMT", "url": "https://github.com/addaan1/indo-madura-nlp"},
    {"title": "WiDS Global Datathon 2026", "label": "Wildfire survival analysis", "url": "https://github.com/addaan1/WiDS-Global-Datathon-2026"},
    {"title": "Galbay Predictor", "label": "Fintech behavior analytics", "url": "https://github.com/addaan1/Final-Project-AKB"},
]

JOURNEY = [
    {
        "period": "Jul 2026 — Present",
        "role": "Data Science Intern",
        "org": "Directorate of Information Systems & Digital Transformation · Universitas Airlangga",
        "description": "Developing a cybersecurity-focused identity exposure dashboard for monitoring, prioritization, and remediation tracking.",
        "type": "Professional Experience",
    },
    {
        "period": "Feb 2025 — Jan 2026",
        "role": "Head of Graphic Media Information",
        "org": "HIMATESDA · Universitas Airlangga",
        "description": "Led visual communication, promotional assets, digital content, and branding consistency across organizational initiatives.",
        "type": "Leadership",
    },
    {
        "period": "Feb 2024 — Dec 2024",
        "role": "Media Information Staff",
        "org": "HIMATESDA · Universitas Airlangga",
        "description": "Produced posters, social media content, event documentation, and coordinated TSD Archives and LinkedIn content.",
        "type": "Campus Involvement",
    },
    {
        "period": "2023 — Present",
        "role": "Creative Staff",
        "org": "TSD Executive Board",
        "description": "Managed Instagram content for Vidyadatum and designed promotional materials for internal student activities.",
        "type": "Campus Involvement",
    },
    {
        "period": "2023 — Expected 2027",
        "role": "B.Sc. Data Science Technology",
        "org": "Universitas Airlangga · Surabaya",
        "description": "Focused on data mining, machine learning, NLP, databases, statistics, and data-product development.",
        "type": "Education",
    },
]

ACHIEVEMENTS = [
    {
        "title": "Top 8% · Find IT! 2026",
        "meta": "Top 27 of 339 teams · Universitas Gadjah Mada",
        "description": "Six-class face anti-spoofing competition using robust computer-vision ensembles.",
        "icon": "01",
    },
    {
        "title": "National Bronze Medal · Physics",
        "meta": "Olimpiade Update Festival IX · 2024",
        "description": "Bronze medal in a national-level university physics olympiad.",
        "icon": "02",
    },
    {
        "title": "Selected Certifications",
        "meta": "Data science, NLP, image processing, and analytics",
        "description": "Continuous learning through technical courses, project-based programs, and competition participation.",
        "icon": "03",
    },
]
