import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore'
import ResultsPage from './ResultsPage'

export default function HistoryPage() {
  const { user } = useAuth()
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [clearing, setClearing]   = useState(false)
  const [selected, setSelected]   = useState(null)
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'users', user.uid, 'history'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch(e) { console.error(e); setHistory([]) }
    finally { setLoading(false) }
  }

  const handleRowClick = async (item) => {
    setLoadingId(item.id)
    try {
      const result = JSON.parse(item.full_result)
      setSelected(result)
    } catch {
      setSelected({
        score: item.score, grade: item.grade,
        grade_color: {'Excellent':'green','Good':'blue','Fair':'orange','Needs Work':'red'}[item.grade]||'blue',
        meta: { job_title: item.job_title, resume_word_count: 0, resume_page_count: 0, contact_info: {} },
        skills: { matched: item.matched_skills||[], missing: item.missing_skills||[], extra:[], resume_skills:[], jd_skills:[] },
        breakdown: { skill_match:0, text_similarity:0, section_completeness:0, ats_score:0 },
        sections: { present:[], missing:[] }, ats: { score:0, issues:[], tips:[] }, suggestions:[]
      })
    } finally { setLoadingId(null) }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this analysis?')) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'history', id))
      setHistory(prev => prev.filter(h => h.id !== id))
    } catch(e) { console.error(e) }
  }

  const clearHistory = async () => {
    if (!window.confirm('Clear all analysis history?')) return
    setClearing(true)
    try {
      const q = query(collection(db, 'users', user.uid, 'history'))
      const snap = await getDocs(q)
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
      setHistory([]); setSelected(null)
    } catch(e) { console.error(e) }
    finally { setClearing(false) }
  }

  const gc = (g) => ({'Excellent':'var(--emerald)','Good':'var(--violet-2)','Fair':'var(--amber)','Needs Work':'var(--red)'}[g]||'var(--text-3)')
  const gb = (g) => ({'Excellent':'rgba(16,185,129,0.1)','Good':'rgba(124,107,255,0.1)','Fair':'rgba(251,191,36,0.1)','Needs Work':'rgba(248,113,113,0.1)'}[g]||'var(--bg-3)')

  if (selected) return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.5rem', paddingTop:'1rem' }}>
        <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding:'7px 16px', fontSize:13, fontWeight:500 }}>
          ← Back to history
        </button>
        <span style={{ fontSize:12, color:'var(--text-3)', background:'rgba(124,107,255,0.1)', border:'1px solid rgba(124,107,255,0.2)', borderRadius:6, padding:'3px 10px' }}>Viewing saved analysis</span>
      </div>
      <ResultsPage result={selected} onReset={() => setSelected(null)} fromHistory={true} />
    </div>
  )

  return (
    <div style={{ paddingTop:'1rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, margin:'0 0 4px', letterSpacing:'-0.02em' }}>Analysis history</h2>
          {history.length > 0 && <p style={{ fontSize:12, color:'var(--text-3)', margin:0 }}>Click any card to view full results</p>}
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} disabled={clearing} style={{ background:'var(--danger-bg)', color:'var(--red)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'7px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>
            {clearing ? 'Clearing...' : 'Clear all'}
          </button>
        )}
      </div>

      {loading && <p style={{ color:'var(--text-3)', fontSize:14 }}>Loading history...</p>}

      {!loading && history.length === 0 && (
        <div style={{ textAlign:'center', padding:'4rem 0', color:'var(--text-3)' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>◎</div>
          <p style={{ fontSize:15, color:'var(--text-2)' }}>No analyses yet.</p>
          <p style={{ fontSize:13 }}>Run your first analysis to see it here.</p>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {history.map((item) => {
          const matched = item.matched_skills || []
          const missing = item.missing_skills || []
          const isLoading = loadingId === item.id
          const createdAt = item.created_at?.toDate ? item.created_at.toDate() : new Date(item.created_at)
          return (
            <div key={item.id} onClick={() => handleRowClick(item)} className="animate-fade-up"
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'1.1rem 1.25rem', display:'flex', alignItems:'center', gap:'1.5rem', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.transform='translateY(0)' }}
            >
              <div style={{ textAlign:'center', flexShrink:0, minWidth:60, background:gb(item.grade), borderRadius:12, padding:'8px 10px' }}>
                {isLoading ? (
                  <div style={{ width:28, height:28, border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'var(--violet)', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto' }} />
                ) : (
                  <>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:gc(item.grade), lineHeight:1 }}>{item.score}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)', fontWeight:500, marginTop:2 }}>/ 100</div>
                  </>
                )}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <p style={{ fontWeight:700, fontSize:14, margin:0, color:'var(--text)', fontFamily:'var(--font-display)' }}>{item.job_title}</p>
                  <span style={{ fontSize:11, fontWeight:600, padding:'1px 9px', borderRadius:999, background:gb(item.grade), color:gc(item.grade), border:`1px solid ${gc(item.grade)}44` }}>{item.grade}</span>
                </div>
                <p style={{ fontSize:12, color:'var(--text-3)', margin:'0 0 7px' }}>
                  {createdAt.toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}
                  &nbsp;·&nbsp;{item.suggestions_count} suggestion{item.suggestions_count!==1?'s':''}
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {matched.slice(0,5).map((s,j) => <span key={j} className="skill-pill skill-matched">{s}</span>)}
                  {missing.slice(0,3).map((s,j) => <span key={j} className="skill-pill skill-missing">{s}</span>)}
                </div>
              </div>

              <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                <span style={{ fontSize:12, color:'var(--violet-2)', background:'rgba(124,107,255,0.1)', border:'1px solid rgba(124,107,255,0.2)', borderRadius:8, padding:'4px 12px', fontWeight:500 }}>View →</span>
                <button onClick={e => handleDelete(e, item.id)} style={{ fontSize:11, color:'var(--red)', background:'var(--danger-bg)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'3px 10px', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:500 }}>
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
