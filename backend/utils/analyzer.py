import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from utils.skills_taxonomy import extract_skills_from_text, ALL_SKILLS

def extract_skills(text: str) -> list:
    return extract_skills_from_text(text)

def preprocess_for_tfidf(text: str) -> str:
    """
    Clean and expand text before TF-IDF comparison.
    Expands abbreviations so REST == REST API, CI/CD == continuous integration etc.
    """
    # Lowercase
    text = text.lower()

    # Expand common tech abbreviations
    expansions = {
        r'\brest\b':      'rest api restful',
        r'\bci/cd\b':     'cicd continuous integration deployment',
        r'\baws\b':       'aws amazon cloud',
        r'\bml\b':        'machine learning',
        r'\bnlp\b':       'natural language processing',
        r'\bdb\b':        'database',
        r'\bjs\b':        'javascript',
        r'\bts\b':        'typescript',
        r'\bapi\b':       'api interface',
        r'\boop\b':       'object oriented programming',
        r'\bagile\b':     'agile scrum methodology',
        r'\bpg\b':        'postgresql postgres',
        r'\bk8s\b':       'kubernetes',
        r'\bdocker\b':    'docker container containerization',
        r'\bgit\b':       'git version control',
    }
    import re
    for pattern, replacement in expansions.items():
        text = re.sub(pattern, replacement, text)

    # Remove special characters but keep spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def compute_tfidf_score(resume_text: str, jd_text: str) -> float:
    """
    Improved TF-IDF with text preprocessing and expansion.
    """
    if not resume_text.strip() or not jd_text.strip():
        return 0.0
    try:
        # Preprocess both texts
        resume_processed = preprocess_for_tfidf(resume_text)
        jd_processed = preprocess_for_tfidf(jd_text)

        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 3),      # trigrams catch more phrases
            max_features=8000,
            sublinear_tf=True,
            min_df=1
        )
        tfidf_matrix = vectorizer.fit_transform([resume_processed, jd_processed])
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(score)
    except Exception:
        return 0.0

def compute_keyword_overlap(resume_skills: list, jd_skills: list) -> dict:
    if not jd_skills:
        return {"score": 0, "matched": [], "missing": [], "extra": []}
    resume_set = set(s.lower() for s in resume_skills)
    jd_set = set(s.lower() for s in jd_skills)
    matched = list(resume_set & jd_set)
    missing = list(jd_set - resume_set)
    extra = list(resume_set - jd_set)
    score = len(matched) / len(jd_set) if jd_set else 0
    return {"score": round(score, 3), "matched": sorted(matched), "missing": sorted(missing), "extra": sorted(extra)}

IMPORTANT_SECTIONS = ["experience", "education", "skills", "projects", "summary", "certifications"]

def compute_section_score(sections: dict) -> dict:
    # Count any section that exists in the dict (including "detected" value)
    present = [s for s in IMPORTANT_SECTIONS if s in sections and sections[s] != ""]
    missing = [s for s in IMPORTANT_SECTIONS if s not in sections or sections[s] == ""]
    score = len(present) / len(IMPORTANT_SECTIONS)
    return {
        "score": round(score, 3),
        "present_sections": present,
        "missing_sections": missing,
    }

def compute_keyword_density_bonus(resume_text: str, jd_text: str) -> float:
    """
    Extract important keywords from JD and check how many
    appear in the resume body text (not just skills section).
    Returns 0.0 to 1.0
    """
    stopwords = {
        'with', 'that', 'this', 'have', 'from', 'they', 'will',
        'been', 'were', 'their', 'your', 'what', 'about', 'which',
        'when', 'more', 'also', 'into', 'than', 'then', 'some',
        'such', 'must', 'should', 'would', 'could', 'using', 'used',
        'working', 'work', 'good', 'strong', 'plus', 'looking', 'required'
    }
    jd_words = set(
        w.lower() for w in re.findall(r'\b[a-zA-Z]{4,}\b', jd_text)
        if w.lower() not in stopwords
    )
    if not jd_words:
        return 0.0
    resume_lower = resume_text.lower()
    matched = sum(1 for w in jd_words if w in resume_lower)
    return matched / len(jd_words)

def check_ats_friendliness(resume_text: str, sections: dict) -> dict:
    issues = []
    tips = []
    if len(resume_text.split()) < 200:
        issues.append("Resume is very short (under 200 words)")
        tips.append("Expand your experience and project descriptions")
    if not re.search(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', resume_text):
        issues.append("No email address detected")
        tips.append("Add your email address clearly at the top")
    for section in ["experience", "education", "skills"]:
        if section not in sections:
            issues.append(f"'{section.title()}' section not clearly labeled")
            tips.append(f"Add a clearly labeled '{section.title()}' section heading")
    action_verbs = ["developed", "built", "designed", "implemented", "led", "managed", "created", "improved", "achieved", "delivered"]
    if len([v for v in action_verbs if v in resume_text.lower()]) < 3:
        issues.append("Few action verbs found (built, led, improved, etc.)")
        tips.append("Start bullet points with strong action verbs like 'Developed', 'Led', 'Achieved'")
    ats_score = max(0, 100 - (len(issues) * 20))
    return {"score": ats_score, "issues": issues, "tips": tips, "is_ats_friendly": ats_score >= 60}

def compute_final_score(tfidf_score: float, keyword_score: float,
                         section_score: float, ats_score: int) -> int:
    """
    Final weights:
      - Keyword/skill overlap:  50%
      - Text + keyword density: 25%
      - Section completeness:   15%
      - ATS friendliness:       10%
    """
    score = (
        tfidf_score   * 25 +
        keyword_score * 50 +
        section_score * 15 +
        (ats_score / 100) * 10
    )
    return min(int(score), 99)

def generate_suggestions(missing_skills, ats_tips, missing_sections, match_score) -> list:
    suggestions = []
    if missing_skills:
        top_missing = missing_skills[:5]
        suggestions.append({"priority": "high", "category": "Skills Gap",
            "title": f"Add {len(missing_skills)} missing skill{'s' if len(missing_skills) > 1 else ''}",
            "detail": f"The job requires: {', '.join(top_missing)}" + (f" and {len(missing_skills)-5} more" if len(missing_skills) > 5 else ""),
            "action": "Add these skills to your Skills section if you have experience with them."})
    for section in missing_sections:
        suggestions.append({"priority": "high", "category": "Structure",
            "title": f"Add a '{section.title()}' section",
            "detail": f"ATS systems and recruiters look for a clearly labeled {section} section.",
            "action": f"Create a '{section.title()}' heading and add relevant content under it."})
    for tip in ats_tips[:3]:
        suggestions.append({"priority": "medium", "category": "ATS Optimization", "title": "Improve ATS compatibility", "detail": tip, "action": tip})
    if match_score < 40:
        suggestions.append({"priority": "high", "category": "Overall Match",
            "title": "Resume needs significant tailoring for this role",
            "detail": "Your resume matches less than 40% of the job description.",
            "action": "Rewrite your summary to mirror the job description language. Tailor each application."})
    elif match_score < 60:
        suggestions.append({"priority": "medium", "category": "Overall Match",
            "title": "Tailor your summary to this job",
            "detail": "A customized professional summary can significantly improve your match score.",
            "action": "Write a 2-3 sentence summary that uses the exact keywords from the job description."})
    if match_score >= 60 and len(suggestions) < 3:
        suggestions.append({"priority": "low", "category": "Polish",
            "title": "Quantify your achievements", "detail": "Numbers make your impact concrete.",
            "action": "Add metrics: 'Improved performance by 30%', 'Led a team of 5', 'Shipped 3 features'"})
    return suggestions

def analyze_resume(resume_text: str, jd_text: str, sections: dict) -> dict:
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(jd_text)
    tfidf_raw   = compute_tfidf_score(resume_text, jd_text)
    kd_bonus    = compute_keyword_density_bonus(resume_text, jd_text)
    tfidf_score = min((tfidf_raw * 0.5) + (kd_bonus * 0.5), 1.0)
    keyword_data = compute_keyword_overlap(resume_skills, jd_skills)
    section_data = compute_section_score(sections)
    ats_data = check_ats_friendliness(resume_text, sections)
    final_score = compute_final_score(tfidf_score, keyword_data["score"], section_data["score"], ats_data["score"])
    if final_score >= 80: grade, grade_color = "Excellent", "green"
    elif final_score >= 60: grade, grade_color = "Good", "blue"
    elif final_score >= 40: grade, grade_color = "Fair", "orange"
    else: grade, grade_color = "Needs Work", "red"
    suggestions = generate_suggestions(keyword_data["missing"], ats_data["tips"], section_data["missing_sections"], final_score)
    return {
        "score": final_score, "grade": grade, "grade_color": grade_color,
        "breakdown": {"text_similarity": round(tfidf_score * 100, 1), "skill_match": round(keyword_data["score"] * 100, 1),
                      "section_completeness": round(section_data["score"] * 100, 1), "ats_score": ats_data["score"]},
        "skills": {"resume_skills": sorted(resume_skills), "jd_skills": sorted(jd_skills),
                   "matched": keyword_data["matched"], "missing": keyword_data["missing"], "extra": keyword_data["extra"]},
        "sections": {"present": section_data["present_sections"], "missing": section_data["missing_sections"]},
        "ats": ats_data, "suggestions": suggestions,
    }
