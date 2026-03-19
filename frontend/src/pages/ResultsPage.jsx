import ScoreCircle from '../components/ScoreCircle'
import AISuggestions from '../components/AISuggestions'
import BreakdownBars from '../components/BreakdownBars'
import SkillsPanel from '../components/SkillsPanel'
import SuggestionsPanel from '../components/SuggestionsPanel'
import SectionsPanel from '../components/SectionsPanel'

export default function ResultsPage({ result, onReset, fromHistory = false, resumeText = '', jdText = '' }) {
  const { score, grade, grade_color, breakdown, skills, sections, ats, suggestions, meta } = result

  const gradeConfig = {
    green:  { color:'var(--emerald)', bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.3)',  label:'Excellent' },
    blue:   { color:'var(--violet-2)',bg:'rgba(124,107,255,0.12)', border:'rgba(124,107,255,0.3)', label:'Good' },
    orange: { color:'var(--amber)',   bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.3)',  label:'Fair' },
    red:    { color:'var(--red)',     bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.3)', label:'Needs Work' },
  }
  const gc = gradeConfig[grade_color] || gradeConfig.blue

  return (
    <div>
      {/* Top bar */}
      <div className="animate-fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, margin:0, color:'var(--text)', letterSpacing:'-0.02em' }}>
            {meta?.job_title || 'Analysis Results'}
          </h2>
          {meta?.resume_word_count > 0 && (
            <p style={{ color:'var(--text-3)', fontSize:12, margin:'4px 0 0' }}>
              {meta.resume_word_count} words
              {meta.resume_page_count > 0 && ` · ${meta.resume_page_count} page${meta.resume_page_count > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {!fromHistory && (
          <button onClick={onReset} className="btn-ghost"
            style={{ padding:'8px 18px', fontSize:13, fontWeight:500 }}>
            ← New Analysis
          </button>
        )}
      </div>

      {/* Score hero */}
      <div className="animate-fade-up stagger-1" style={{
        background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20,
        padding:'1.75rem', marginBottom:'1.25rem',
        display:'grid', gridTemplateColumns:'auto 1fr', gap:'2rem', alignItems:'center',
        position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:`radial-gradient(circle, ${gc.bg} 0%, transparent 70%)`, pointerEvents:'none' }} />
        <ScoreCircle score={score} grade={grade} gradeColor={grade_color} />
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em' }}>{score}% match</span>
            <span style={{ background:gc.bg, color:gc.color, padding:'4px 14px', borderRadius:999, fontSize:13, fontWeight:700, border:`1px solid ${gc.border}` }}>
              {grade}
            </span>
          </div>
          <p style={{ color:'var(--text-2)', fontSize:14, margin:'0 0 1.25rem', lineHeight:1.6 }}>
            {score>=80 ? '🚀 Strong match — your resume aligns well with this job. Apply with confidence!' :
             score>=60 ? '✨ Good match — a few tweaks to your skills section could push you higher.' :
             score>=40 ? '⚡ Fair match — consider tailoring your resume more closely to the job description.' :
                         '🔧 Needs significant tailoring — review the suggestions below before applying.'}
          </p>
          <BreakdownBars breakdown={breakdown} />
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
        <div className="animate-fade-up stagger-2"><SkillsPanel skills={skills} /></div>
        <div className="animate-fade-up stagger-3" style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <SectionsPanel sections={sections} ats={ats} />
        </div>
      </div>

      {/* Suggestions */}
      <div className="animate-fade-up stagger-4">
        <SuggestionsPanel suggestions={suggestions} />
      </div>

      {/* AI Suggestions */}
      {!fromHistory && resumeText && jdText && (
        <div className="animate-fade-up stagger-5">
          <AISuggestions resumeText={resumeText} jdText={jdText} score={score} />
        </div>
      )}

      {/* Contact info */}
      {meta?.contact_info && Object.values(meta.contact_info).some(v => v.length > 0) && (
        <div className="animate-fade-up stagger-5" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'1rem 1.25rem', marginTop:'1.25rem' }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 10px' }}>Contact info detected</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {meta.contact_info.email?.map((e,i) => <ContactPill key={i} label="✉" text={e} />)}
            {meta.contact_info.linkedin?.map((l,i) => <ContactPill key={i} label="in" text={l} />)}
            {meta.contact_info.github?.map((g,i) => <ContactPill key={i} label="gh" text={g} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function ContactPill({ label, text }) {
  return (
    <span style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:8, padding:'4px 12px', fontSize:12, color:'var(--text-2)', display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ fontSize:10, fontWeight:700, color:'var(--violet-2)' }}>{label}</span>{text}
    </span>
  )
}
