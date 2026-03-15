import { useState } from 'react'

export default function SkillsPanel({ skills }) {
  const [tab, setTab] = useState('matched')
  const tabs = [
    { id:'matched', label:`Matched (${skills.matched.length})`, color:'var(--emerald)', bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.25)', cls:'skill-matched' },
    { id:'missing', label:`Missing (${skills.missing.length})`,  color:'var(--red)',     bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.25)', cls:'skill-missing' },
    { id:'extra',   label:`Extra (${skills.extra.length})`,      color:'var(--cyan)',    bg:'rgba(34,211,238,0.12)', border:'rgba(34,211,238,0.2)',   cls:'skill-extra' },
  ]
  const lists = { matched:skills.matched, missing:skills.missing, extra:skills.extra }
  const active = tabs.find(t => t.id === tab)

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'1.25rem', height:'100%' }}>
      <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 14px' }}>Skills analysis</p>

      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'4px 14px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer',
            background: tab===t.id ? t.bg : 'transparent',
            color: tab===t.id ? t.color : 'var(--text-3)',
            border: `1px solid ${tab===t.id ? t.border : 'var(--border)'}`,
            fontFamily:'var(--font-body)', transition:'all 0.15s'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:6, maxHeight:200, overflowY:'auto', paddingRight:4 }}>
        {lists[tab].length === 0 ? (
          <p style={{ color:'var(--text-3)', fontSize:13, fontStyle:'italic' }}>
            {tab==='matched' ? 'No matching skills found.' : tab==='missing' ? '🎉 No missing skills!' : 'No extra skills.'}
          </p>
        ) : lists[tab].map((skill,i) => (
          <span key={i} className={`skill-pill ${active?.cls}`}>{skill}</span>
        ))}
      </div>

      <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', fontSize:12 }}>
        <span style={{ color:'var(--text-3)' }}>JD skills found in resume</span>
        <span style={{ fontWeight:700, color:'var(--violet-2)' }}>
          {skills.jd_skills.length > 0 ? `${skills.matched.length} / ${skills.jd_skills.length}` : 'N/A'}
        </span>
      </div>
    </div>
  )
}
