import { useState } from 'react'

const PS = {
  high:   { color:'#F87171', label:'High priority', glow:'rgba(248,113,113,0.15)', bg:'rgba(248,113,113,0.06)' },
  medium: { color:'#FBBF24', label:'Medium',        glow:'rgba(251,191,36,0.15)',  bg:'rgba(251,191,36,0.06)' },
  low:    { color:'#22D3EE', label:'Nice to have',  glow:'rgba(34,211,238,0.15)',  bg:'rgba(34,211,238,0.06)' },
}

const CATEGORY_ICONS = {
  'Skills Gap':       '◈',
  'Structure':        '◎',
  'ATS Optimization': '★',
  'Overall Match':    '◆',
  'Polish':           '✦',
}

const CATEGORY_DESC = {
  'Skills Gap':       'Skills mentioned in the job description that were not found in your resume.',
  'Structure':        'Important resume sections that recruiters and ATS systems expect to see.',
  'ATS Optimization': 'Changes to make your resume more readable by automated screening software.',
  'Overall Match':    'How well your overall resume aligns with the job description.',
  'Polish':           'Final touches that make your resume stand out from other candidates.',
}

export default function SuggestionsPanel({ suggestions }) {
  const [expanded, setExpanded] = useState(null)

  const toggle = (i) => setExpanded(prev => prev === i ? null : i)

  if (!suggestions || suggestions.length === 0) return (
    <div style={{
      background:'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))',
      border:'1px solid rgba(16,185,129,0.2)',
      borderRadius:16, padding:'2rem', textAlign:'center'
    }}>
      <div style={{ fontSize:36, marginBottom:10 }}>🎉</div>
      <p style={{ color:'var(--emerald)', fontWeight:700, fontSize:16, margin:'0 0 6px', fontFamily:'var(--font-display)' }}>Excellent resume!</p>
      <p style={{ color:'rgba(16,185,129,0.6)', fontSize:13, margin:0 }}>No major improvements needed. Your resume is well-matched to this job description.</p>
    </div>
  )

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'1.25rem' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 3px' }}>
            Improvements suggested
          </p>
          <p style={{ fontSize:11, color:'var(--text-3)', margin:0 }}>Click any card to expand</p>
        </div>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--violet-2)', background:'rgba(124,107,255,0.12)', border:'1px solid rgba(124,107,255,0.2)', borderRadius:999, padding:'2px 12px' }}>
          {suggestions.length} total
        </span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {suggestions.map((s, i) => {
          const p = PS[s.priority] || PS.low
          const icon = CATEGORY_ICONS[s.category] || '→'
          const catDesc = CATEGORY_DESC[s.category] || ''
          const isOpen = expanded === i

          return (
            <div key={i}
              onClick={() => toggle(i)}
              style={{
                background: isOpen ? p.bg : 'var(--bg-3)',
                borderRadius:12,
                border:`1px solid ${isOpen ? p.color + '40' : 'var(--border)'}`,
                overflow:'hidden',
                cursor:'pointer',
                transition:'all 0.2s',
                boxShadow: isOpen ? `0 0 0 1px ${p.color}20, 0 4px 20px ${p.glow}` : 'none'
              }}
              onMouseEnter={e => { if(!isOpen) e.currentTarget.style.borderColor='var(--border-2)' }}
              onMouseLeave={e => { if(!isOpen) e.currentTarget.style.borderColor='var(--border)' }}
            >
              <div style={{ display:'flex', gap:0 }}>
                {/* Left accent bar */}
                <div style={{ width:4, flexShrink:0, background:p.color, opacity: isOpen ? 1 : 0.6, transition:'opacity 0.2s' }} />

                {/* Main row */}
                <div style={{ flex:1, padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14, color:p.color }}>{icon}</span>
                      <span style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>{s.title}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:p.color, boxShadow:`0 0 6px ${p.glow}` }} />
                        <span style={{ fontSize:11, color:p.color, fontWeight:600 }}>{p.label}</span>
                      </div>
                      {/* Expand chevron */}
                      <span style={{
                        fontSize:12, color:'var(--text-3)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition:'transform 0.25s',
                        display:'inline-block', lineHeight:1
                      }}>▾</span>
                    </div>
                  </div>

                  {/* Collapsed preview */}
                  {!isOpen && (
                    <p style={{ fontSize:12, color:'var(--text-3)', margin:'5px 0 0', lineHeight:1.5, paddingLeft:22 }}>
                      {s.detail}
                    </p>
                  )}

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{ marginTop:12, paddingLeft:22 }}>

                      {/* Category description */}
                      {catDesc && (
                        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, padding:'8px 12px', marginBottom:12 }}>
                          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 4px' }}>{s.category}</p>
                          <p style={{ fontSize:12, color:'var(--text-2)', margin:0, lineHeight:1.6 }}>{catDesc}</p>
                        </div>
                      )}

                      {/* What was found */}
                      <div style={{ marginBottom:10 }}>
                        <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 4px' }}>What we found</p>
                        <p style={{ fontSize:13, color:'var(--text-2)', margin:0, lineHeight:1.6 }}>{s.detail}</p>
                      </div>

                      {/* What to do */}
                      <div style={{ background:`linear-gradient(135deg, ${p.bg}, transparent)`, border:`1px solid ${p.color}30`, borderRadius:8, padding:'10px 12px' }}>
                        <p style={{ fontSize:11, fontWeight:700, color:p.color, textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 5px' }}>How to fix it</p>
                        <p style={{ fontSize:13, color:'var(--text)', margin:0, lineHeight:1.6, fontWeight:500 }}>
                          {s.action}
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
