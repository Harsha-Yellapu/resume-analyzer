const SECTION_ICONS = { summary:'◎', experience:'◈', education:'◉', skills:'◇', projects:'◆', certifications:'★' }
const SECTION_COLORS = {
  summary:'var(--violet-2)', experience:'var(--cyan)', education:'var(--emerald)',
  skills:'var(--amber)', projects:'var(--pink)', certifications:'var(--violet-2)'
}

export default function SectionsPanel({ sections, ats }) {
  const all = ['summary','experience','education','skills','projects','certifications']
  return (
    <div>
      {/* Resume sections */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'1.25rem', marginBottom:'1.25rem' }}>
        <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 12px' }}>Resume sections</p>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {all.map(s => {
            const present = sections.present.includes(s)
            const col = SECTION_COLORS[s] || 'var(--violet-2)'
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:13, color:'var(--text-2)', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color: present ? col : 'var(--text-3)', fontSize:12 }}>{SECTION_ICONS[s]||'○'}</span>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </span>
                <span style={{
                  fontSize:11, fontWeight:600, padding:'2px 10px', borderRadius:999,
                  background: present ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)',
                  color: present ? 'var(--emerald)' : 'var(--red)',
                  border: `1px solid ${present ? 'rgba(16,185,129,0.25)' : 'rgba(248,113,113,0.25)'}`
                }}>
                  {present ? '✓ Found' : '✗ Missing'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ATS */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <p style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>ATS friendliness</p>
          <span style={{ fontSize:15, fontWeight:800, color: ats.score>=60 ? 'var(--emerald)' : 'var(--amber)', fontFamily:'var(--font-display)' }}>{ats.score}%</span>
        </div>
        {ats.issues.length === 0 ? (
          <p style={{ fontSize:13, color:'var(--emerald)', margin:0, background:'rgba(16,185,129,0.08)', borderRadius:8, padding:'8px 12px' }}>✓ No ATS issues detected!</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {ats.issues.map((issue,i) => (
              <div key={i} style={{ fontSize:12, color:'var(--amber)', display:'flex', alignItems:'flex-start', gap:8, background:'rgba(251,191,36,0.08)', borderRadius:8, padding:'7px 10px' }}>
                <span style={{ flexShrink:0 }}>⚠</span><span>{issue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
