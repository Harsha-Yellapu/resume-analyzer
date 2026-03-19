import { useState } from 'react'
import api from '../api'

export default function AISuggestions({ resumeText, jdText, score }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState(null)

  const getSuggestions = async () => {
    setLoading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append('resume_text', resumeText)
      fd.append('jd_text', jdText)
      fd.append('score', score)
      const res = await api.post('/api/ai-suggestions', fd)
      setSuggestions(res.data.suggestions)
    } catch (e) {
      setError("Failed to get AI suggestions. Please try again.")
    }
    setLoading(false)
  }

  const priorityColor = (p) => ({ high: "var(--red)", medium: "var(--amber)", low: "var(--emerald)" }[p] || "var(--text-3)")
  const priorityBg = (p) => ({ high: "var(--danger-bg)", medium: "var(--warning-bg)", low: "var(--success-bg)" }[p] || "var(--bg-3)")

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.25rem", marginTop: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: suggestions.length > 0 ? "1rem" : 0 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>AI Powered</p>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>Gemini Suggestions</h3>
        </div>
        {suggestions.length === 0 && (
          <button onClick={getSuggestions} disabled={loading} style={{
            background: loading ? "rgba(124,107,255,0.3)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
            border: "none", borderRadius: 10, padding: "0.6rem 1.2rem",
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)"
          }}>
            {loading ? (
              <>
                <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Analyzing...
              </>
            ) : "✨ Get AI Suggestions"}
          </button>
        )}
        {suggestions.length > 0 && (
          <button onClick={getSuggestions} disabled={loading} style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.5rem 1rem", color: "var(--text-2)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            {loading ? "Analyzing..." : "↺ Refresh"}
          </button>
        )}
      </div>

      {error && <div style={{ background: "var(--danger-bg)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "0.75rem", color: "var(--red)", fontSize: 13, marginTop: "1rem" }}>{error}</div>}

      {loading && suggestions.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-3)" }}>
          <div style={{ width: 32, height: 32, border: "3px solid rgba(124,107,255,0.2)", borderTopColor: "var(--violet)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13 }}>Gemini is analyzing your resume...</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => setExpanded(expanded === i ? null : i)}
              style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.9rem 1rem", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-2)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ background: priorityBg(s.priority), color: priorityColor(s.priority), fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>{s.priority}</span>
                <span style={{ fontSize: 11, color: "var(--text-3)", background: "var(--bg-card)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border)" }}>{s.category}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>{expanded === i ? "▲" : "▼"}</span>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "8px 0 0", fontFamily: "var(--font-display)" }}>{s.title}</p>
              {expanded === i && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 8px", lineHeight: 1.6 }}>{s.detail}</p>
                  <div style={{ background: "rgba(124,107,255,0.08)", border: "1px solid rgba(124,107,255,0.2)", borderRadius: 8, padding: "0.6rem 0.8rem" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--violet-2)", margin: "0 0 3px" }}>Action:</p>
                    <p style={{ fontSize: 12, color: "var(--text)", margin: 0, lineHeight: 1.5 }}>{s.action}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
