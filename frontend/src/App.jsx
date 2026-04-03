import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useTheme } from './hooks/useTheme'
import LoginPage from './pages/LoginPage'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import ResumeBuilderPage from './pages/ResumeBuilderPage'

function AppContent() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [page, setPage] = useState('upload')
  const [result, setResult] = useState(null)
  const [analysisTexts, setAnalysisTexts] = useState({ resumeText: '', jdText: '' })

  if (!user) return <LoginPage />

  const handleResult = (data, resumeText, jdText) => { setResult(data); setAnalysisTexts({ resumeText, jdText }); setPage('results') }
  const handleReset  = () => { setResult(null); setPage('upload') }

  return (
    <div style={{ minHeight:'100vh' }}>
      <Header page={page} setPage={setPage} onReset={handleReset} user={user} logout={() => setShowLogoutConfirm(true)} theme={theme} toggleTheme={toggleTheme} />
      <main style={{ maxWidth:960, margin:'0 auto', padding:'1rem 1.5rem 5rem' }}>
        {page === 'upload'  && <UploadPage onResult={handleResult} />}
        {page === 'results' && result && <ResultsPage result={result} onReset={handleReset} resumeText={analysisTexts.resumeText} jdText={analysisTexts.jdText} />}
        {page === 'history' && <HistoryPage />}
        {page === 'profile' && <ProfilePage />}
        {page === 'builder' && <ResumeBuilderPage />}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={e => e.target === e.currentTarget && setShowLogoutConfirm(false)}>
          <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem', width:'100%', maxWidth:360, margin:'0 1rem' }}>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:8 }}>Log out?</div>
            <div style={{ fontSize:13, color:'var(--text-2)', marginBottom:20 }}>Are you sure you want to log out of ResumeAI?</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={logout} style={{ flex:1, background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:8, padding:'0.7rem', color:'#f87171', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>Yes, Logout</button>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex:1, background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:8, padding:'0.7rem', color:'var(--text-2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font-body)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
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

function Header({ page, setPage, onReset, user, logout, theme, toggleTheme }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
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

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <nav style={{ display:'flex', gap:4, background:'var(--bg-3)', padding:4, borderRadius:10, border:'1px solid var(--border)' }}>
            {[['upload','Analyze'],['history','History'],['builder','Builder'],['profile','Profile']].map(([id,label]) => (
              <button key={id} onClick={() => id==='upload' ? onReset() : setPage(id)} style={{
                background: page===id ? 'linear-gradient(135deg, var(--violet), #5B4FD6)' : 'transparent',
                color: page===id ? 'white' : 'var(--text-3)',
                border: 'none', borderRadius: 7, padding: '6px 16px',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: page===id ? '0 2px 12px rgba(124,107,255,0.35)' : 'none'
              }}>{label}</button>
            ))}
          </nav>

          <button onClick={toggleTheme} style={{
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            borderRadius: 8, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:12, color:'var(--text-3)' }}>{user.email?.split('@')[0]}</span>
            <button onClick={logout} style={{
              background:'var(--bg-3)', border:'1px solid var(--border)',
              borderRadius:7, padding:'6px 12px', color:'var(--text-2)',
              fontSize:12, cursor:'pointer'
            }}>Logout</button>
          </div>
        </div>
      </div>
    </header>
  )
}
