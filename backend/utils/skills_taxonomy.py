TECH_SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "kotlin", "swift", "ruby", "php", "scala", "r", "matlab", "dart",
    "react", "angular", "vue", "nextjs", "nuxtjs", "svelte", "html", "css",
    "tailwind", "bootstrap", "sass", "webpack", "vite", "redux", "graphql",
    "node", "express", "django", "flask", "fastapi", "spring", "rails",
    "laravel", "asp.net", "rest api", "microservices", "grpc",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "sqlite", "oracle", "firebase",
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd",
    "terraform", "ansible", "linux", "nginx", "apache", "git", "github",
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "data analysis", "data visualization", "tableau", "power bi",
    "spark", "hadoop", "etl", "data pipeline",
    "android", "ios", "react native", "flutter", "xamarin",
    "unit testing", "selenium", "jest", "pytest", "junit", "postman",
    "cybersecurity", "owasp", "penetration testing", "encryption",
]
SOFT_SKILLS = [
    "communication", "teamwork", "leadership", "problem solving",
    "critical thinking", "time management", "project management",
    "agile", "scrum", "kanban", "collaboration", "mentoring",
    "presentation", "negotiation", "adaptability", "creativity",
]
CERTIFICATIONS = [
    "aws certified", "azure certified", "gcp certified",
    "pmp", "scrum master", "cissp", "ceh", "comptia",
    "google analytics", "tableau certified",
]
ALL_SKILLS = TECH_SKILLS + SOFT_SKILLS + CERTIFICATIONS

def normalize(text: str) -> str:
    return text.lower().strip()

def extract_skills_from_text(text: str) -> list:
    text_lower = text.lower()
    found = []
    for skill in ALL_SKILLS:
        if skill.lower() in text_lower:
            found.append(skill)
    return list(set(found))
