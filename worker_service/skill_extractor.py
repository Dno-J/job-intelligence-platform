import re


# =========================================================
# SKILL ALIASES
# =========================================================
SKILL_ALIASES = {
    "js": "javascript",
    "nodejs": "node.js",
    "node": "node.js",
    "reactjs": "react",
    "nextjs": "next.js",
    "postgres": "postgresql",
    "psql": "postgresql",
    "py": "python",
    "docker-compose": "docker",
    "k8s": "kubernetes",
    "mongo": "mongodb",
    "gh": "github",
    "ci cd": "ci/cd",
    "cicd": "ci/cd",
    "restful api": "rest api",
}


# =========================================================
# SKILLS DATABASE
# Keep noisy single-letter skills out of normal extraction.
# =========================================================
SKILLS = [
    # Languages
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "dart",
    "scala",

    # Frontend
    "html",
    "css",
    "sass",
    "tailwind",
    "bootstrap",
    "react",
    "next.js",
    "vue",
    "angular",
    "redux",
    "vite",
    "webpack",

    # Backend
    "node.js",
    "express",
    "django",
    "fastapi",
    "flask",
    "spring",
    "spring boot",
    "laravel",
    "rails",
    "rest api",
    "graphql",
    "microservices",

    # Databases
    "sql",
    "postgresql",
    "mysql",
    "sqlite",
    "mongodb",
    "redis",
    "elasticsearch",
    "bigquery",
    "snowflake",
    "redshift",

    # ORM / Data tools
    "sqlalchemy",
    "sqlmodel",
    "pandas",
    "numpy",
    "dbt",

    # Cloud / DevOps
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "terraform",
    "jenkins",
    "github actions",
    "gitlab ci",
    "ci/cd",
    "nginx",
    "linux",

    # Testing
    "pytest",
    "unittest",
    "selenium",
    "playwright",
    "jest",
    "cypress",

    # AI / ML
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "nlp",
    "llm",
    "langchain",
    "langgraph",
    "openai",
    "hugging face",
    "tensorflow",
    "pytorch",
    "scikit-learn",

    # Tools
    "git",
    "github",
    "postman",
    "jira",
    "figma",
    "excel",
    "power bi",
    "tableau",

    # Mobile
    "android",
    "ios",
    "react native",
    "flutter",

    # General engineering
    "agile",
    "scrum",
    "data structures",
    "algorithms",
    "system design",
]


# =========================================================
# STRICT / CONTEXTUAL SKILLS
# These are useful skills, but too noisy for simple word-boundary matching.
# =========================================================
CONTEXTUAL_SKILLS = {
    "go": {
        "final": "go",
        "contexts": [
            "golang",
            "go developer",
            "go engineer",
            "go backend",
            "go microservices",
            "go programming",
            "go language",
            "written in go",
            "experience with go",
        ],
    },
    "ai": {
        "final": "artificial intelligence",
        "contexts": [
            "artificial intelligence",
            "ai engineer",
            "ai developer",
            "ai tools",
            "ai systems",
            "ai models",
            "ai/ml",
            "generative ai",
        ],
    },
    "ml": {
        "final": "machine learning",
        "contexts": [
            "machine learning",
            "ml engineer",
            "ml models",
            "ml pipelines",
            "ai/ml",
        ],
    },
    "api": {
        "final": "api",
        "contexts": [
            "rest api",
            "apis",
            "api development",
            "api integration",
            "api design",
            "build apis",
            "building apis",
            "develop apis",
            "developing apis",
        ],
    },
}


# =========================================================
# NORMALIZATION
# =========================================================
def normalize_text(text: str) -> str:
    text = text or ""
    text = text.lower()

    text = text.replace("node.js", "nodejs")
    text = text.replace("next.js", "nextjs")
    text = text.replace("c++", "cplusplus")
    text = text.replace("c#", "csharp")
    text = text.replace("ci/cd", "cicd")
    text = text.replace("ai/ml", "ai ml")

    text = re.sub(r"[^a-z0-9\s\+\#\.\/-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def normalize_skill(skill: str) -> str:
    skill = (skill or "").lower().strip()

    normalized = SKILL_ALIASES.get(skill, skill)

    if normalized == "golang":
        return "go"

    if normalized == "cplusplus":
        return "c++"

    if normalized == "csharp":
        return "c#"

    if normalized == "cicd":
        return "ci/cd"

    return normalized


def prepare_search_key(skill: str) -> str:
    key = skill.lower().strip()
    key = key.replace("node.js", "nodejs")
    key = key.replace("next.js", "nextjs")
    key = key.replace("c++", "cplusplus")
    key = key.replace("c#", "csharp")
    key = key.replace("ci/cd", "cicd")
    return key


def build_skill_pattern(skill: str):
    escaped = re.escape(skill)

    escaped = escaped.replace("nodejs", r"node\.?js")
    escaped = escaped.replace("nextjs", r"next\.?js")
    escaped = escaped.replace("cplusplus", r"c\+\+")
    escaped = escaped.replace("csharp", r"c#")
    escaped = escaped.replace("cicd", r"ci\/?cd")

    return rf"(?<![a-z0-9]){escaped}(?![a-z0-9])"


def phrase_exists(normalized_text: str, phrase: str) -> bool:
    phrase_key = prepare_search_key(phrase)
    pattern = build_skill_pattern(phrase_key)
    return bool(re.search(pattern, normalized_text))


# =========================================================
# MAIN EXTRACTOR
# =========================================================
def extract_skills(text: str):
    if not text:
        return []

    normalized_text = normalize_text(text)
    found_skills = set()

    normalized_skill_map = {}

    for skill in SKILLS:
        search_key = prepare_search_key(skill)
        normalized_skill_map[search_key] = normalize_skill(skill)

    # Match direct skills
    for search_key, final_skill in normalized_skill_map.items():
        pattern = build_skill_pattern(search_key)

        if re.search(pattern, normalized_text):
            found_skills.add(final_skill)

    # Match aliases
    for alias, actual in SKILL_ALIASES.items():
        alias_key = prepare_search_key(alias)
        pattern = build_skill_pattern(alias_key)

        if re.search(pattern, normalized_text):
            found_skills.add(normalize_skill(actual))

    # Contextual noisy skills
    for config in CONTEXTUAL_SKILLS.values():
        final_skill = config["final"]
        contexts = config["contexts"]

        if any(phrase_exists(normalized_text, context) for context in contexts):
            found_skills.add(final_skill)

    return sorted(found_skills)