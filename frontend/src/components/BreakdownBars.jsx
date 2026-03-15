import { useEffect, useState } from 'react'

const BARS = [
  { key:'skill_match',          label:'Skill match',      color:'#10B981', glow:'rgba(16,185,129,0.4)' },
  { key:'text_similarity',      label:'Text similarity',  color:'#7C6BFF', glow:'rgba(124,107,255,0.4)' },
  { key:'section_completeness', label:'Resume structure', color:'#FBBF24', glow:'rgba(251,191,36,0.4)' },
  { key:'ats_score',            label:'ATS friendliness', color:'#22D3EE', glow:'rgba(34,211,238,0.4)' },
]

export default function BreakdownBars({ breakdown }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t) }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {BARS.map(({ key, label, color, glow }) => {
        const value = breakdown?.[key] ?? 0
        return (
          <div key={key}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:12, color:'var(--text-2)', fontWeight:500 }}>{label}</span>
              <span style={{ fontSize:12, fontWeight:700, color }}>{Math.round(value)}%</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:999, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:999,
                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                width: animated ? `${value}%` : '0%',
                transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: animated && value > 0 ? `0 0 8px ${glow}` : 'none'
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
