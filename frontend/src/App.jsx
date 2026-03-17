import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'

function AppContent() {
  const { user, logout } = useAuth()
  const [page, setPage] = useState('upload')
  const [result, setResult] = useState(null)

  if (!user) return <LoginPage />

  const handleResult = (data) => { setResult(data); setPage('results') }
  const handleReset  = () => { setResult(null); setPage('upload') }

  return (
    <div style={{ minHeight:'100vh' }}>
      <Header page={page} setPage={setPage} onReset={handleReset} user={user} logout={logout} />
      <main style={{ maxWidth:960, margin:'0 auto', padding:'1rem 1.5rem 5rem' }}>
        {page === 'upload'  && <UploadPage onResult={handleResult} />}
        {page === 'results' && result && <ResultsPage result={result} onReset={handleReset} />}
        {page === 'history' && <HistoryPage />}
        {page === 'profile' && <ProfilePage />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function Header({ page, setPage, onReset, user, logout }) {
  return (
    <header style={{
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(13,15,26,0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 100,
      padding: '0 1.5rem',
    }}>
      <div style={{ maxWidth:960, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>
        <button onClick={onReset} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, overflow:'hidden', boxShadow:'0 0 16px rgba(124,107,255,0.4)' }}>
            <img src="/icon.svg" alt="ResumeAI" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em' }}>
            Resume<span style={{ color:'var(--violet-2)' }}>AI</span>
          </span>
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <nav style={{ display:'flex', gap:4, background:'var(--bg-3)', padding:4, borderRadius:10, border:'1px solid var(--border)' }}>
            {[['upload','Analyze'],['history','History'],['profile','Profile']].map(([id,label]) => (
              <button key={id} onClick={() => id==='upload' ? onReset() : setPage(id)} style={{
                background: page===id ? 'linear-gradient(135deg, var(--violet), #5B4FD6)' : 'transparent',
                color: page===id ? 'white' : 'var(--text-3)',
                border: 'none', borderRadius: 7, padding: '6px 18px',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                boxShadow: page===id ? '0 2px 12px rgba(124,107,255,0.35)' : 'none'
              }}>{label}</button>
            ))}
          </nav>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{user.email}</span>
            <button onClick={logout} style={{
              background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:7, padding:'6px 14px', color:'rgba(255,255,255,0.7)',
              fontSize:12, cursor:'pointer'
            }}>Logout</button>
          </div>
        </div>
      </div>
    </header>
  )
}
