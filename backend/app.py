from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json, sqlite3, datetime

from utils.pdf_extractor import extract_text_from_pdf, extract_contact_info
from utils.analyzer import analyze_resume

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'analyses.db')

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT, job_title TEXT, score INTEGER, grade TEXT,
        matched_skills TEXT, missing_skills TEXT, suggestions_count INTEGER,
        full_result TEXT)''')
    try:
        conn.execute('ALTER TABLE analyses ADD COLUMN full_result TEXT')
    except Exception:
        pass
    conn.commit(); conn.close()

init_db()

def save_analysis(job_title, result):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            '''INSERT INTO analyses (created_at,job_title,score,grade,
               matched_skills,missing_skills,suggestions_count,full_result)
               VALUES (?,?,?,?,?,?,?,?)''',
            (datetime.datetime.now().isoformat(), job_title,
             result["score"], result["grade"],
             json.dumps(result["skills"]["matched"]),
             json.dumps(result["skills"]["missing"]),
             len(result["suggestions"]),
             json.dumps(result)))
        conn.commit(); conn.close()
    except Exception as e:
        print(f"DB save error: {e}")

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Resume Analyzer API is running"})

@app.route('/api/analyze', methods=['POST'])
def analyze():
    jd_text = request.form.get('jd_text', '').strip()
    if not jd_text or len(jd_text) < 30:
        return jsonify({"error": "Please provide a job description (at least 30 characters)"}), 400
    job_title = request.form.get('job_title', 'Untitled Position').strip()
    resume_text = ""; sections = {}; contact_info = {}; page_count = 0; word_count = 0
    if 'resume_file' in request.files:
        pdf_file = request.files['resume_file']
        if pdf_file.filename == '': return jsonify({"error": "No file selected"}), 400
        if not pdf_file.filename.lower().endswith('.pdf'): return jsonify({"error": "Only PDF files are supported"}), 400
        extracted = extract_text_from_pdf(pdf_file.read())
        if extracted.get("error"): return jsonify({"error": extracted["error"]}), 400
        resume_text = extracted["text"]; sections = extracted["sections"]
        page_count = extracted["page_count"]; word_count = extracted["word_count"]
        contact_info = extract_contact_info(resume_text)
    elif 'resume_text' in request.form:
        resume_text = request.form.get('resume_text', '').strip()
        if len(resume_text) < 50: return jsonify({"error": "Resume text is too short"}), 400
        word_count = len(resume_text.split())
    else:
        return jsonify({"error": "Provide either a PDF file or resume text"}), 400
    try:
        result = analyze_resume(resume_text, jd_text, sections)
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500
    full_response = {**result, "meta": {"job_title": job_title, "resume_word_count": word_count, "resume_page_count": page_count, "contact_info": contact_info}}
    save_analysis(job_title, full_response)
    return jsonify(full_response)

@app.route('/api/history', methods=['GET'])
def history():
    try:
        conn = sqlite3.connect(DB_PATH); conn.row_factory = sqlite3.Row
        rows = conn.execute('SELECT * FROM analyses ORDER BY created_at DESC LIMIT 20').fetchall()
        conn.close()
        return jsonify([dict(row) for row in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<int:analysis_id>', methods=['GET'])
def get_analysis(analysis_id):
    try:
        conn = sqlite3.connect(DB_PATH); conn.row_factory = sqlite3.Row
        row = conn.execute('SELECT * FROM analyses WHERE id = ?', (analysis_id,)).fetchone()
        conn.close()
        if not row: return jsonify({"error": "Analysis not found"}), 404
        row_dict = dict(row)
        if row_dict.get('full_result'):
            return jsonify(json.loads(row_dict['full_result']))
        return jsonify({
            "score": row_dict["score"], "grade": row_dict["grade"],
            "grade_color": {"Excellent":"green","Good":"blue","Fair":"orange","Needs Work":"red"}.get(row_dict["grade"],"blue"),
            "meta": {"job_title": row_dict["job_title"], "resume_word_count": 0, "resume_page_count": 0, "contact_info": {}},
            "skills": {"matched": json.loads(row_dict.get("matched_skills","[]")), "missing": json.loads(row_dict.get("missing_skills","[]")), "extra":[], "resume_skills":[], "jd_skills":[]},
            "breakdown": {"skill_match":0,"text_similarity":0,"section_completeness":0,"ats_score":0},
            "sections": {"present":[],"missing":[]}, "ats": {"score":0,"issues":[],"tips":[]}, "suggestions": []
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<int:analysis_id>', methods=['DELETE'])
def delete_analysis(analysis_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute('DELETE FROM analyses WHERE id = ?', (analysis_id,))
        conn.commit(); conn.close()
        return jsonify({"message": "Deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    try:
        conn = sqlite3.connect(DB_PATH); conn.execute('DELETE FROM analyses'); conn.commit(); conn.close()
        return jsonify({"message": "History cleared"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Resume Analyzer API on http://localhost:5000")
    app.run(debug=True, port=5000)

@app.route('/api/ai-suggestions', methods=['POST'])
def ai_suggestions():
    import json
    import requests as req
    resume_text = request.form.get('resume_text', '').strip()
    jd_text = request.form.get('jd_text', '').strip()
    score = request.form.get('score', '0')

    if not jd_text:
        return jsonify({"error": "Job description is required"}), 400

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "Gemini API key not configured"}), 500

    prompt = f"""You are an expert resume coach. Analyze this resume against the job description and give exactly 5 specific, actionable suggestions.

Job Description:
{jd_text[:2000]}

Resume:
{resume_text[:3000] if resume_text else "Not provided"}

Current match score: {score}%

Respond ONLY with a JSON array of exactly 5 objects. Each object must have:
- "title": short title (max 8 words)
- "detail": specific explanation (max 30 words)
- "action": exact action to take (max 30 words)
- "priority": "high", "medium", or "low"
- "category": one of "Skills Gap", "Structure", "ATS Optimization", "Content", "Keywords"

Return ONLY the JSON array, no markdown, no explanation."""

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        response = req.post(url, json=payload, timeout=30)
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        suggestions = json.loads(text.strip())
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
