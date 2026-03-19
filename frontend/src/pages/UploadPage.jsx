import { useState, useRef } from 'react'
import api from '../api'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const FEATURES = [
  { icon:'◈', label:'Skill gap analysis',  desc:'Finds skills the JD needs that your resume is missing' },
  { icon:'◎', label:'ATS check',           desc:'Checks if your resume passes automated screening systems' },
  { icon:'◆', label:'Section detection',   desc:'Detects Summary, Experience, Education, Skills, Projects' },
  { icon:'★', label:'Match scoring',       desc:'Gives an overall 0–100% match score with breakdown' },
  { icon:'→', label:'Improvement tips',    desc:'Prioritized suggestions to improve your resume' },
]

export default function UploadPage({ onResult }) {
  const { user } = useAuth()
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText]         = useState('')
  const [jobTitle, setJobTitle]     = useState('')
  const [inputMode, setInputMode]   = useState('pdf')
  const [dragging, setDragging]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [tooltip, setTooltip]       = useState(null)
  const fileRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') setResumeFile(f)
    else setError('Please drop a PDF file.')
  }

  const handleSubmit = async () => {
    setError('')
    if (!jdText.trim() || jdText.trim().length < 30) { setError('Please paste the job description (at least 30 characters).'); return }
    if (inputMode === 'pdf' && !resumeFile) { setError('Please upload your resume PDF.'); return }
    if (inputMode === 'text' && resumeText.trim().length < 50) { setError('Please paste your resume text (at least 50 characters).'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('jd_text', jdText)
      fd.append('job_title', jobTitle || 'Untitled Position')
      if (inputMode === 'pdf') fd.append('resume_file', resumeFile)
      else fd.append('resume_text', resumeText)
      const res = await api.post('/api/analyze', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onResult(res.data, resumeText || "", jdText || "")
      if (user) {
        try {
          await addDoc(collection(db, 'users', user.uid, 'history'), {
            job_title: res.data.meta?.job_title || 'Untitled',
            score: res.data.score,
            grade: res.data.grade,
            matched_skills: res.data.skills?.matched || [],
            missing_skills: res.data.skills?.missing || [],
            suggestions_count: res.data.suggestions?.length || 0,
            full_result: JSON.stringify(res.data),
            created_at: serverTimestamp()
          })
        } catch(e) { console.error('Firestore save error:', e) }
      }
    } catch(err) {
      setError(err.response?.data?.error || 'Analysis failed. Make sure the backend is running on port 5000.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ paddingTop:'1rem' }}>

      {/* Hero */}
      <div className="animate-fade-up" style={{ textAlign:'center', marginBottom:'2rem',paddingTop:'1rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(124,107,255,0.12)', border:'1px solid rgba(124,107,255,0.3)', borderRadius:999, padding:'6px 16px', marginBottom:20 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--violet-2)', boxShadow:'0 0 8px var(--violet)' }} />
          <span style={{ fontSize:12, color:'var(--violet-2)', fontWeight:500 }}>AI-powered resume analysis</span>
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.2rem,5vw,3.4rem)', fontWeight:800, lineHeight:1.1, marginBottom:16, letterSpacing:'-0.03em' }}>
          Know how well your resume<br/>
          <span className="grad-text">fits the job</span>
        </h1>
        <p style={{ color:'var(--text-2)', fontSize:15, maxWidth:460, margin:'0 auto', lineHeight:1.7 }}>
          Upload your resume, paste the job description — get an AI match score, skill gap analysis, and actionable suggestions instantly.
        </p>
      </div>

      {/* Input grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem', alignItems:'start' }}>

        {/* Resume input */}
        <div className="animate-fade-up stagger-1">
          <div style={{ display:'flex', gap:6, marginBottom:10 }}>
            {[['pdf','Upload PDF'],['text','Paste Text']].map(([m,label]) => (
              <button key={m} onClick={() => setInputMode(m)} style={{
                padding:'5px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
                background: inputMode===m ? 'linear-gradient(135deg,var(--violet),#5B4FD6)' : 'var(--bg-3)',
                color: inputMode===m ? 'white' : 'var(--text-3)',
                border: inputMode===m ? 'none' : '1px solid var(--border)',
                fontFamily:'var(--font-body)', transition:'all 0.15s',
                boxShadow: inputMode===m ? '0 2px 12px var(--violet-glow)' : 'none'
              }}>{label}</button>
            ))}
          </div>

          {inputMode === 'pdf' ? (
            <div onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                border:`2px dashed ${dragging?'var(--violet)':resumeFile?'var(--emerald)':'rgba(255,255,255,0.1)'}`,
                borderRadius:14, padding:'2.5rem 1.5rem', textAlign:'center',
                cursor:'pointer', minHeight:200,
                background: dragging?'rgba(124,107,255,0.05)':resumeFile?'rgba(16,185,129,0.06)':'var(--bg-card)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12,
                transition:'all 0.2s',
                boxShadow: dragging?'0 0 0 4px var(--violet-glow)':resumeFile?'0 0 0 3px var(--emerald-glow)':'none'
              }}>
              <input ref={fileRef} type="file" accept=".pdf" style={{display:'none'}} onChange={e => setResumeFile(e.target.files[0])} />
              {resumeFile ? (
                <>
                  <div style={{ width:52, height:52, borderRadius:12, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p style={{ fontWeight:600, color:'var(--emerald)', margin:'0 0 4px', fontSize:14 }}>{resumeFile.name}</p>
                    <p style={{ color:'var(--text-3)', fontSize:12 }}>{(resumeFile.size/1024).toFixed(0)} KB · Click to change</p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width:52, height:52, borderRadius:12, background:'rgba(124,107,255,0.12)', border:'1px solid rgba(124,107,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--violet-2)" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>Drop your resume here</p>
                    <p style={{ color:'var(--text-3)', fontSize:12, marginTop:4 }}>PDF only · or click to browse</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here..."
              style={{ width:'100%', height:200, padding:'14px', fontSize:13, lineHeight:1.7, resize:'vertical', borderRadius:14 }} />
          )}
        </div>

        {/* JD input */}
       <div className="animate-fade-up stagger-2">
  {/* Spacer to match height of Upload PDF / Paste Text buttons on left */}
  <div style={{ height:44, marginBottom:10, display:'flex', alignItems:'center' }}>
    <p style={{ fontSize:13, fontWeight:600, margin:0, color:'var(--text-2)', letterSpacing:'0.02em' }}>Job description</p>
  </div>
  <textarea
    value={jdText}
    onChange={e => setJdText(e.target.value)}
    placeholder="Paste the full job description — requirements, responsibilities, skills needed..."
    style={{ width:'100%', height:200, padding:'14px', fontSize:13, lineHeight:1.7, resize:'vertical', borderRadius:14 }}
  />
</div> 
      </div>

      {/* Job title + submit */}
      <div className="animate-fade-up stagger-3" style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
        <input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
          placeholder="Job title (optional — e.g. Backend Engineer at Google)"
          style={{ flex:1, padding:'12px 16px', fontSize:13, borderRadius:10 }} />
        <button onClick={handleSubmit} disabled={loading} className="btn-primary"
          style={{ padding:'12px 32px', fontSize:14, display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}>
          {loading && <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />}
          {loading ? 'Analyzing...' : '✦ Analyze Resume'}
        </button>
      </div>

      {error && (
        <div className="animate-fade-up" style={{ marginTop:12, background:'var(--danger-bg)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--red)' }}>
          {error}
        </div>
      )}

      {/* Feature pills — hover to see description */}
      <div className="animate-fade-up stagger-4" style={{ marginTop:'2.5rem' }}>
        <p style={{ textAlign:'center', fontSize:11, color:'var(--text-3)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>What this app analyses</p>
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8, position:'relative' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ position:'relative' }}
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}>
              <span style={{
                fontSize:12, color: tooltip===i ? 'var(--violet-2)' : 'var(--text-3)',
                background: tooltip===i ? 'rgba(124,107,255,0.12)' : 'var(--bg-3)',
                border: `1px solid ${tooltip===i ? 'rgba(124,107,255,0.3)' : 'var(--border)'}`,
                borderRadius:999, padding:'5px 14px', cursor:'default',
                display:'inline-flex', alignItems:'center', gap:6,
                transition:'all 0.15s', userSelect:'none'
              }}>
                <span style={{ fontSize:11 }}>{f.icon}</span>{f.label}
              </span>
              {tooltip === i && (
                <div style={{
                  position:'absolute', bottom:'calc(100% + 8px)', left:'50%',
                  transform:'translateX(-50%)',
                  background:'var(--bg-hover)', border:'1px solid var(--border-2)',
                  borderRadius:8, padding:'8px 12px', fontSize:12, color:'var(--text-2)',
                  whiteSpace:'nowrap', zIndex:10,
                  boxShadow:'0 4px 20px rgba(0,0,0,0.4)'
                }}>
                  {f.desc}
                  <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:'5px solid var(--border-2)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

