import { useState } from 'react'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  const [page, setPage] = useState('upload')
  const [result, setResult] = useState(null)
  const handleResult = (data) => { setResult(data); setPage('results') }
  const handleReset  = () => { setResult(null); setPage('upload') }
  return (
    <div style={{ minHeight:'100vh' }}>
      <Header page={page} setPage={setPage} onReset={handleReset} />
      <main style={{ maxWidth:960, margin:'0 auto', padding:'1rem 1.5rem 5rem' }}>
        {page === 'upload'  && <UploadPage onResult={handleResult} />}
        {page === 'results' && result && <ResultsPage result={result} onReset={handleReset} />}
        {page === 'history' && <HistoryPage />}
      </main>
    </div>
  )
}

function Header({ page, setPage, onReset }) {
  return (
    <header style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(13,15,26,0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 100,
      padding: '0 1.5rem',
    }}>
      <div style={{ maxWidth:960, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        {/* Logo */}
        <button onClick={onReset} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
         <div style={{ width:36, height:36, borderRadius:10, overflow:'hidden', boxShadow:'0 0 16px rgba(124,107,255,0.4)' }}>
  	  <img src="/icon.png" alt="ResumeAI" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
	 </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em' }}>
            Resume<span style={{ color:'var(--violet-2)' }}>AI</span>
          </span>
        </button>

        {/* Nav */}
        <nav style={{ display:'flex', gap:4, background:'var(--bg-3)', padding:4, borderRadius:10, border:'1px solid var(--border)' }}>
          {[['upload','Analyze'],['history','History']].map(([id,label]) => (
            <button key={id} onClick={() => id==='upload' ? onReset() : setPage(id)} style={{
              background: page===id
                ? 'linear-gradient(135deg, var(--violet), #5B4FD6)'
                : 'transparent',
              color: page===id ? 'white' : 'var(--text-3)',
              border: 'none', borderRadius: 7, padding: '6px 18px',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all 0.2s',
              boxShadow: page===id ? '0 2px 12px rgba(124,107,255,0.35)' : 'none'
            }}>{label}</button>
          ))}
        </nav>
      </div>
    </header>
  )
}
