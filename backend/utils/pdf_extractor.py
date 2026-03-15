import pdfplumber
import re
import io

def extract_text_from_pdf(file_bytes: bytes) -> dict:
    full_text = ""
    pages_text = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                pages_text.append(page_text)
                full_text += page_text + "\n"
    except Exception as e:
        return {"error": f"Could not read PDF: {str(e)}", "text": "", "sections": {}}
    full_text = clean_text(full_text)
    sections = detect_sections(full_text)
    return {"text": full_text, "page_count": len(pages_text), "word_count": len(full_text.split()), "sections": sections, "error": None}

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    return text.strip()

SECTION_PATTERNS = {
    "contact":        r"(contact|email|phone|address|linkedin|github)",
    "summary":        r"(summary|objective|profile|about me|overview)",
    "experience":     r"(experience|work history|employment|career|professional background)",
    "education":      r"(education|academic|university|college|degree|school)",
    "skills":         r"(skills|technical skills|competencies|technologies|tools)",
    "projects":       r"(projects|portfolio|personal projects|academic projects)",
    "certifications": r"(certif|certificate|certified|award|achievement|license|credential|course|training|udemy|coursera|nptel|bootcamp)",
}

def detect_sections(text: str) -> dict:
    sections = _detect_by_lines(text)
    real_sections = {k: v for k, v in sections.items() if k != "other"}
    if len(real_sections) < 2:
        sections = _detect_by_keyword_scan(text)
    else:
        missing = [k for k in SECTION_PATTERNS if k not in sections]
        for section in missing:
            pattern = SECTION_PATTERNS[section]
            if re.search(pattern, text.lower()):
                sections[section] = "detected"
    return sections

def _detect_by_lines(text: str) -> dict:
    lines = re.split(r'\r?\n', text)
    sections = {}
    current_section = "other"
    current_content = []
    for line in lines:
        line_stripped = line.strip()
        line_lower = line_stripped.lower()
        if not line_stripped:
            continue
        matched_section = None
        for section, pattern in SECTION_PATTERNS.items():
            if re.search(pattern, line_lower) and len(line_stripped) < 60:
                matched_section = section
                break
        if matched_section:
            if current_content:
                sections[current_section] = " ".join(current_content[:20]).strip()
            current_section = matched_section
            current_content = []
        else:
            current_content.append(line_stripped)
    if current_content:
        sections[current_section] = " ".join(current_content[:20]).strip()
    return sections


def _detect_by_keyword_scan(text: str) -> dict:
    text_lower = text.lower()
    sections = {}
    for section, pattern in SECTION_PATTERNS.items():
        if re.search(pattern, text_lower):
            sections[section] = "detected"
    return sections

def extract_contact_info(text: str) -> dict:
    return {
        "email":    re.findall(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', text),
        "phone":    re.findall(r'(\+91[\s\-]?)?[6-9]\d{9}|\(\d{3}\)\s*\d{3}[\-\s]\d{4}', text),
        "linkedin": re.findall(r'linkedin\.com/in/[\w\-]+', text),
        "github":   re.findall(r'github\.com/[\w\-]+', text),
    }
