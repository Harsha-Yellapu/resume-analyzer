import { useEffect, useState } from 'react'

export default function ScoreCircle({ score, grade, gradeColor }) {
  const [displayed, setDisplayed] = useState(0)
  const r = 58
  const circumference = 2 * Math.PI * r
  const dash = (displayed / 100) * circumference

  const colors = {
    green:  { stroke:'#10B981', glow:'rgba(16,185,129,0.4)',  text:'var(--emerald)' },
    blue:   { stroke:'#7C6BFF', glow:'rgba(124,107,255,0.4)', text:'var(--violet-2)' },
    orange: { stroke:'#FBBF24', glow:'rgba(251,191,36,0.4)',  text:'var(--amber)' },
    red:    { stroke:'#F87171', glow:'rgba(248,113,113,0.4)', text:'var(--red)' },
  }
  const c = colors[gradeColor] || colors.blue

  useEffect(() => {
    let start = null
    const animate = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1000, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setDisplayed(Math.round(score * ease))
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  return (
    <div style={{ position:'relative', width:140, height:140, flexShrink:0 }}>
      {/* Glow ring */}
      <div style={{ position:'absolute', inset:-8, borderRadius:'50%', background:`radial-gradient(circle, ${c.glow} 0%, transparent 70%)`, opacity: displayed > 0 ? 0.6 : 0 }} />
      <svg width="140" height="140" style={{ transform:'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={c.stroke} strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 8px ${c.stroke})`, transition:'stroke-dasharray 0.05s' }}
        />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:800, lineHeight:1, color:c.text }}>{displayed}</span>
        <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500, marginTop:3 }}>out of 100</span>
      </div>
    </div>
  )
}
