import { useState, useRef } from 'react'

const TEMPLATES = [
  { id: 1, name: 'Classic Header', accent: '#7c3aed' },
  { id: 2, name: 'Left Sidebar', accent: '#1e3a5f' },
  { id: 3, name: 'Timeline', accent: '#0f6e56' },
  { id: 4, name: 'Two Column', accent: '#854F0B' },
  { id: 5, name: 'Minimalist', accent: '#111' },
  { id: 6, name: 'Creative Banner', accent: '#A32D2D' },
  { id: 7, name: 'Right Sidebar', accent: '#185FA5' },
  { id: 8, name: 'Card Style', accent: '#534AB7' },
  { id: 9, name: 'Accent Border', accent: '#D4537E' },
  { id: 10, name: 'Split Banner', accent: '#22d3ee' },
  { id: 11, name: 'Infographic', accent: '#639922' },
  { id: 12, name: 'Executive', accent: '#2C2C2A' },
  { id: 13, name: 'Galaxy Dark', accent: '#a78bfa' },
  { id: 14, name: 'Newspaper', accent: '#BA7517' },
  { id: 15, name: 'Neon Tech', accent: '#22d3ee' },
  { id: 16, name: 'Elegant Serif', accent: '#BA7517' },
]

const empty = { name:'', email:'', phone:'', location:'', linkedin:'', github:'', summary:'',
  experience:[{ company:'', role:'', start:'', end:'', description:'' }],
  education:[{ school:'', degree:'', start:'', end:'' }],
  skills:[], projects:[{ name:'', description:'', link:'' }], skillInput:'' }

export default function ResumeBuilderPage() {
  const [data, setData] = useState(empty)
  const [template, setTemplate] = useState(1)
  const [showTemplates, setShowTemplates] = useState(false)
  const previewRef = useRef(null)

  const set = (field, value) => setData(d => ({ ...d, [field]: value }))
  const setExp = (i, field, value) => setData(d => ({ ...d, experience: d.experience.map((e,j) => j===i ? {...e,[field]:value} : e) }))
  const setEdu = (i, field, value) => setData(d => ({ ...d, education: d.education.map((e,j) => j===i ? {...e,[field]:value} : e) }))
  const setPrj = (i, field, value) => setData(d => ({ ...d, projects: d.projects.map((e,j) => j===i ? {...e,[field]:value} : e) }))
  const addExp = () => setData(d => ({ ...d, experience: [...d.experience, { company:'', role:'', start:'', end:'', description:'' }] }))
  const addEdu = () => setData(d => ({ ...d, education: [...d.education, { school:'', degree:'', start:'', end:'' }] }))
  const addPrj = () => setData(d => ({ ...d, projects: [...d.projects, { name:'', description:'', link:'' }] }))
  const removeExp = (i) => setData(d => ({ ...d, experience: d.experience.filter((_,j) => j!==i) }))
  const removeEdu = (i) => setData(d => ({ ...d, education: d.education.filter((_,j) => j!==i) }))
  const removePrj = (i) => setData(d => ({ ...d, projects: d.projects.filter((_,j) => j!==i) }))
  const addSkill = (e) => { if(e.key==='Enter' && data.skillInput.trim()) { setData(d => ({ ...d, skills:[...d.skills, d.skillInput.trim()], skillInput:'' })) } }
  const removeSkill = (i) => setData(d => ({ ...d, skills: d.skills.filter((_,j) => j!==i) }))

  const downloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')
    const el = previewRef.current
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${data.name || 'resume'}.pdf`)
  }

  const t = TEMPLATES.find(t => t.id === template)
  const accent = t?.accent || '#7c3aed'

  const inp = { width:'100%', padding:'7px 10px', background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:7, color:'var(--text)', fontSize:12, boxSizing:'border-box', fontFamily:'var(--font-body)' }
  const label = { fontSize:11, color:'var(--text-3)', marginBottom:3, display:'block' }
  const section = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', marginBottom:12 }
  const sectionTitle = { fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }
  const addBtn = { background:'rgba(124,107,255,0.1)', border:'1px solid rgba(124,107,255,0.2)', borderRadius:6, padding:'4px 10px', color:'var(--violet-2)', fontSize:11, cursor:'pointer', fontFamily:'var(--font-body)' }
  const removeBtn = { background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:6, padding:'3px 8px', color:'var(--red)', fontSize:10, cursor:'pointer', fontFamily:'var(--font-body)' }

  return (
    <div style={{ paddingTop:'1rem' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, margin:0, color:'var(--text)' }}>Resume Builder</h2>
          <p style={{ fontSize:12, color:'var(--text-3)', margin:'4px 0 0' }}>Build and download your resume as PDF</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setShowTemplates(s => !s)} style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 14px', color:'var(--text-2)', fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)' }}>
            🎨 Templates ({template}/16)
          </button>
          <button onClick={downloadPDF} style={{ background:'linear-gradient(135deg,var(--violet),#5B4FD6)', border:'none', borderRadius:8, padding:'7px 16px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-body)' }}>
            ⬇ Download PDF
          </button>
        </div>
      </div>

      {/* Template Picker */}
      {showTemplates && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', marginBottom:12 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10 }}>Choose Template</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:8 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => { setTemplate(t.id); setShowTemplates(false) }}
                style={{ border: template===t.id ? `2px solid ${t.accent}` : '1px solid var(--border)', borderRadius:8, padding:'8px 6px', textAlign:'center', cursor:'pointer', background: template===t.id ? `${t.accent}15` : 'var(--bg-3)', transition:'all 0.15s' }}>
                <div style={{ width:24, height:24, borderRadius:4, background:t.accent, margin:'0 auto 4px' }}></div>
                <div style={{ fontSize:9, color:'var(--text-2)', lineHeight:1.2 }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

        {/* Left: Form */}
        <div style={{ maxHeight:'80vh', overflowY:'auto', paddingRight:4 }}>

          {/* Personal Info */}
          <div style={section}>
            <div style={sectionTitle}>Personal Info</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[['name','Full Name'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn URL'],['github','GitHub URL']].map(([k,l]) => (
                <div key={k}>
                  <label style={label}>{l}</label>
                  <input style={inp} value={data[k]} onChange={e => set(k, e.target.value)} placeholder={l} />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={section}>
            <div style={sectionTitle}>Professional Summary</div>
            <textarea style={{ ...inp, height:70, resize:'vertical' }} value={data.summary} onChange={e => set('summary', e.target.value)} placeholder="Write a brief professional summary..." />
          </div>

          {/* Experience */}
          <div style={section}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={sectionTitle}>Experience</div>
              <button onClick={addExp} style={addBtn}>+ Add</button>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ background:'var(--bg-3)', borderRadius:8, padding:10, marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>#{i+1}</div>
                  {data.experience.length > 1 && <button onClick={() => removeExp(i)} style={removeBtn}>Remove</button>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:6 }}>
                  {[['company','Company'],['role','Job Title'],['start','Start Date'],['end','End Date (or Present)']].map(([k,l]) => (
                    <div key={k}>
                      <label style={label}>{l}</label>
                      <input style={inp} value={exp[k]} onChange={e => setExp(i,k,e.target.value)} placeholder={l} />
                    </div>
                  ))}
                </div>
                <label style={label}>Description</label>
                <textarea style={{ ...inp, height:55, resize:'vertical' }} value={exp.description} onChange={e => setExp(i,'description',e.target.value)} placeholder="Describe your responsibilities and achievements..." />
              </div>
            ))}
          </div>

          {/* Education */}
          <div style={section}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={sectionTitle}>Education</div>
              <button onClick={addEdu} style={addBtn}>+ Add</button>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ background:'var(--bg-3)', borderRadius:8, padding:10, marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>#{i+1}</div>
                  {data.education.length > 1 && <button onClick={() => removeEdu(i)} style={removeBtn}>Remove</button>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {[['school','School/University'],['degree','Degree'],['start','Start Year'],['end','End Year']].map(([k,l]) => (
                    <div key={k}>
                      <label style={label}>{l}</label>
                      <input style={inp} value={edu[k]} onChange={e => setEdu(i,k,e.target.value)} placeholder={l} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={section}>
            <div style={sectionTitle}>Skills</div>
            <input style={{ ...inp, marginBottom:8 }} value={data.skillInput} onChange={e => set('skillInput', e.target.value)} onKeyDown={addSkill} placeholder="Type a skill and press Enter..." />
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {data.skills.map((s,i) => (
                <span key={i} style={{ background:'rgba(124,107,255,0.15)', border:'1px solid rgba(124,107,255,0.3)', borderRadius:999, padding:'3px 10px', fontSize:11, color:'var(--violet-2)', display:'flex', alignItems:'center', gap:5 }}>
                  {s} <span onClick={() => removeSkill(i)} style={{ cursor:'pointer', opacity:0.6 }}>×</span>
                </span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div style={section}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={sectionTitle}>Projects</div>
              <button onClick={addPrj} style={addBtn}>+ Add</button>
            </div>
            {data.projects.map((prj, i) => (
              <div key={i} style={{ background:'var(--bg-3)', borderRadius:8, padding:10, marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>#{i+1}</div>
                  {data.projects.length > 1 && <button onClick={() => removePrj(i)} style={removeBtn}>Remove</button>}
                </div>
                {[['name','Project Name'],['link','Project Link (optional)']].map(([k,l]) => (
                  <div key={k} style={{ marginBottom:6 }}>
                    <label style={label}>{l}</label>
                    <input style={inp} value={prj[k]} onChange={e => setPrj(i,k,e.target.value)} placeholder={l} />
                  </div>
                ))}
                <label style={label}>Description</label>
                <textarea style={{ ...inp, height:55, resize:'vertical' }} value={prj.description} onChange={e => setPrj(i,'description',e.target.value)} placeholder="Describe the project..." />
              </div>
            ))}
          </div>

        </div>

        {/* Right: Live Preview */}
        <div style={{ position:'sticky', top:80, maxHeight:'80vh', overflowY:'auto' }}>
          <div ref={previewRef} style={{ background:'#fff', borderRadius:12, overflow:'hidden', border:'1px solid var(--border)' }}>
            <ResumePreview data={data} templateId={template} accent={accent} />
          </div>
        </div>

      </div>
    </div>
  )
}

function ResumePreview({ data, templateId, accent }) {
  const s = { fontFamily:'Arial, sans-serif', fontSize:9, color:'#333', lineHeight:1.4 }
  const secTitle = { fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:accent, borderBottom:`1.5px solid ${accent}`, paddingBottom:2, marginBottom:6, marginTop:10 }
  const name = { fontSize:18, fontWeight:700, color:'#fff', margin:0 }
  const contact = { fontSize:8, color:'rgba(255,255,255,0.85)', marginTop:2 }

  if (templateId === 1) return (
    <div style={s}>
      <div style={{ background:accent, padding:'16px 20px', textAlign:'center' }}>
        <div style={name}>{data.name || 'Your Name'}</div>
        <div style={contact}>{[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(' · ')}</div>
      </div>
      <div style={{ padding:'12px 20px' }}>
        {data.summary && <><div style={secTitle}>Summary</div><p style={{ fontSize:8, color:'#555', margin:'0 0 6px' }}>{data.summary}</p></>}
        {data.experience.some(e=>e.company) && <><div style={secTitle}>Experience</div>{data.experience.filter(e=>e.company).map((e,i)=><div key={i} style={{ marginBottom:6 }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:700, fontSize:9 }}>{e.role}</span><span style={{ fontSize:8, color:'#888' }}>{e.start}{e.end?` – ${e.end}`:''}</span></div><div style={{ color:accent, fontSize:8 }}>{e.company}</div><div style={{ fontSize:8, color:'#666', marginTop:2 }}>{e.description}</div></div>)}</>}
        {data.education.some(e=>e.school) && <><div style={secTitle}>Education</div>{data.education.filter(e=>e.school).map((e,i)=><div key={i} style={{ marginBottom:4 }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:700, fontSize:9 }}>{e.degree}</span><span style={{ fontSize:8, color:'#888' }}>{e.start}{e.end?` – ${e.end}`:''}</span></div><div style={{ color:accent, fontSize:8 }}>{e.school}</div></div>)}</>}
        {data.skills.length>0 && <><div style={secTitle}>Skills</div><div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>{data.skills.map((s,i)=><span key={i} style={{ background:`${accent}18`, color:accent, borderRadius:3, padding:'2px 7px', fontSize:8 }}>{s}</span>)}</div></>}
        {data.projects.some(p=>p.name) && <><div style={secTitle}>Projects</div>{data.projects.filter(p=>p.name).map((p,i)=><div key={i} style={{ marginBottom:5 }}><span style={{ fontWeight:700, fontSize:9 }}>{p.name}</span>{p.link&&<span style={{ color:accent, fontSize:8 }}> · {p.link}</span>}<div style={{ fontSize:8, color:'#666', marginTop:1 }}>{p.description}</div></div>)}</>}
      </div>
    </div>
  )

  if (templateId === 2) return (
    <div style={{ ...s, display:'grid', gridTemplateColumns:'35% 65%', minHeight:400 }}>
      <div style={{ background:accent, padding:'16px 12px' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', margin:'0 auto 10px' }}>{(data.name||'?')[0]}</div>
        <div style={{ fontSize:12, fontWeight:700, color:'#fff', textAlign:'center', marginBottom:8 }}>{data.name||'Your Name'}</div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Contact</div>
        {[data.email, data.phone, data.location].filter(Boolean).map((c,i)=><div key={i} style={{ fontSize:8, color:'rgba(255,255,255,0.85)', marginBottom:2 }}>{c}</div>)}
        {data.skills.length>0&&<><div style={{ fontSize:8, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.05em', marginTop:10, marginBottom:4 }}>Skills</div>{data.skills.map((s,i)=><div key={i} style={{ fontSize:8, color:'rgba(255,255,255,0.85)', marginBottom:2 }}>• {s}</div>)}</>}
      </div>
      <div style={{ padding:'16px 14px' }}>
        {data.summary&&<><div style={{ ...secTitle, color:accent, borderColor:accent }}>Summary</div><p style={{ fontSize:8, color:'#555', margin:'0 0 6px' }}>{data.summary}</p></>}
        {data.experience.some(e=>e.company)&&<><div style={{ ...secTitle, color:accent, borderColor:accent }}>Experience</div>{data.experience.filter(e=>e.company).map((e,i)=><div key={i} style={{ marginBottom:6 }}><div style={{ fontWeight:700, fontSize:9 }}>{e.role}</div><div style={{ color:accent, fontSize:8 }}>{e.company} · {e.start}{e.end?` – ${e.end}`:''}</div><div style={{ fontSize:8, color:'#666', marginTop:2 }}>{e.description}</div></div>)}</>}
        {data.education.some(e=>e.school)&&<><div style={{ ...secTitle, color:accent, borderColor:accent }}>Education</div>{data.education.filter(e=>e.school).map((e,i)=><div key={i} style={{ marginBottom:4 }}><div style={{ fontWeight:700, fontSize:9 }}>{e.degree}</div><div style={{ color:accent, fontSize:8 }}>{e.school} · {e.end}</div></div>)}</>}
        {data.projects.some(p=>p.name)&&<><div style={{ ...secTitle, color:accent, borderColor:accent }}>Projects</div>{data.projects.filter(p=>p.name).map((p,i)=><div key={i} style={{ marginBottom:4 }}><span style={{ fontWeight:700, fontSize:9 }}>{p.name}</span><div style={{ fontSize:8, color:'#666' }}>{p.description}</div></div>)}</>}
      </div>
    </div>
  )

  if (templateId === 5) return (
    <div style={{ ...s, padding:'20px 24px' }}>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:20, fontWeight:700, color:'#111', letterSpacing:'-0.02em' }}>{data.name||'Your Name'}</div>
        <div style={{ fontSize:8, color:'#888', marginTop:2 }}>{[data.email,data.phone,data.location,data.linkedin].filter(Boolean).join(' · ')}</div>
        <div style={{ width:32, height:2, background:'#111', marginTop:6 }}></div>
      </div>
      {data.summary&&<><div style={{ fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#111', marginBottom:3 }}>Summary</div><p style={{ fontSize:8, color:'#555', margin:'0 0 8px' }}>{data.summary}</p></>}
      {data.experience.some(e=>e.company)&&<><div style={{ fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#111', marginBottom:4 }}>Experience</div>{data.experience.filter(e=>e.company).map((e,i)=><div key={i} style={{ marginBottom:6 }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:700, fontSize:9 }}>{e.role}, {e.company}</span><span style={{ fontSize:8, color:'#888' }}>{e.start}{e.end?` – ${e.end}`:''}</span></div><div style={{ fontSize:8, color:'#666', marginTop:1 }}>{e.description}</div></div>)}</>}
      {data.education.some(e=>e.school)&&<><div style={{ fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#111', marginBottom:4, marginTop:6 }}>Education</div>{data.education.filter(e=>e.school).map((e,i)=><div key={i} style={{ marginBottom:4 }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:700, fontSize:9 }}>{e.degree}, {e.school}</span><span style={{ fontSize:8, color:'#888' }}>{e.end}</span></div></div>)}</>}
      {data.skills.length>0&&<><div style={{ fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#111', marginBottom:3, marginTop:6 }}>Skills</div><div style={{ fontSize:8, color:'#555' }}>{data.skills.join(' · ')}</div></>}
      {data.projects.some(p=>p.name)&&<><div style={{ fontSize:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#111', marginBottom:4, marginTop:6 }}>Projects</div>{data.projects.filter(p=>p.name).map((p,i)=><div key={i} style={{ marginBottom:4 }}><span style={{ fontWeight:700, fontSize:9 }}>{p.name}</span><div style={{ fontSize:8, color:'#666' }}>{p.description}</div></div>)}</>}
    </div>
  )

  if (templateId === 9) return (
    <div style={{ ...s, padding:'16px 20px' }}>
      <div style={{ borderLeft:`4px solid ${accent}`, paddingLeft:12, marginBottom:10 }}>
        <div style={{ fontSize:18, fontWeight:700, color:'#111' }}>{data.name||'Your Name'}</div>
        <div style={{ fontSize:9, color:accent }}>Software Developer</div>
        <div style={{ fontSize:8, color:'#888', marginTop:1 }}>{[data.email,data.phone,data.location].filter(Boolean).join(' · ')}</div>
      </div>
      {data.summary&&<div style={{ borderLeft:`4px solid ${accent}`, paddingLeft:12, marginBottom:8 }}><div style={{ fontSize:9, fontWeight:700, color:accent, textTransform:'uppercase', marginBottom:3 }}>Summary</div><p style={{ fontSize:8, color:'#555', margin:0 }}>{data.summary}</p></div>}
      {data.experience.some(e=>e.company)&&<div style={{ borderLeft:`4px solid ${accent}`, paddingLeft:12, marginBottom:8 }}><div style={{ fontSize:9, fontWeight:700, color:accent, textTransform:'uppercase', marginBottom:4 }}>Experience</div>{data.experience.filter(e=>e.company).map((e,i)=><div key={i} style={{ marginBottom:5 }}><div style={{ fontWeight:700, fontSize:9 }}>{e.role}</div><div style={{ color:accent, fontSize:8 }}>{e.company} · {e.start}{e.end?` – ${e.end}`:''}</div><div style={{ fontSize:8, color:'#666', marginTop:1 }}>{e.description}</div></div>)}</div>}
      {data.education.some(e=>e.school)&&<div style={{ borderLeft:`4px solid ${accent}`, paddingLeft:12, marginBottom:8 }}><div style={{ fontSize:9, fontWeight:700, color:accent, textTransform:'uppercase', marginBottom:4 }}>Education</div>{data.education.filter(e=>e.school).map((e,i)=><div key={i} style={{ marginBottom:3 }}><div style={{ fontWeight:700, fontSize:9 }}>{e.degree}</div><div style={{ color:accent, fontSize:8 }}>{e.school} · {e.end}</div></div>)}</div>}
      {data.skills.length>0&&<div style={{ borderLeft:`4px solid ${accent}`, paddingLeft:12, marginBottom:8 }}><div style={{ fontSize:9, fontWeight:700, color:accent, textTransform:'uppercase', marginBottom:4 }}>Skills</div><div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>{data.skills.map((s,i)=><span key={i} style={{ background:`${accent}18`, color:accent, borderRadius:3, padding:'2px 7px', fontSize:8 }}>{s}</span>)}</div></div>}
      {data.projects.some(p=>p.name)&&<div style={{ borderLeft:`4px solid ${accent}`, paddingLeft:12 }}><div style={{ fontSize:9, fontWeight:700, color:accent, textTransform:'uppercase', marginBottom:4 }}>Projects</div>{data.projects.filter(p=>p.name).map((p,i)=><div key={i} style={{ marginBottom:4 }}><span style={{ fontWeight:700, fontSize:9 }}>{p.name}</span><div style={{ fontSize:8, color:'#666' }}>{p.description}</div></div>)}</div>}
    </div>
  )

  if (templateId === 12) return (
    <div style={{ ...s, padding:'16px 20px' }}>
      <div style={{ textAlign:'center', borderTop:`3px solid ${accent}`, borderBottom:`1px solid ${accent}`, padding:'8px 0', marginBottom:8 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#111', textTransform:'uppercase', letterSpacing:'0.05em' }}>{data.name||'Your Name'}</div>
        <div style={{ fontSize:8, color:'#888', marginTop:2 }}>{[data.email,data.phone,data.location,data.linkedin].filter(Boolean).join(' · ')}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div>
          {data.experience.some(e=>e.company)&&<><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#111', marginBottom:4 }}>Experience</div>{data.experience.filter(e=>e.company).map((e,i)=><div key={i} style={{ marginBottom:5 }}><div style={{ fontWeight:700, fontSize:9 }}>{e.role}</div><div style={{ fontSize:8, color:'#888' }}>{e.company}, {e.start}{e.end?` – ${e.end}`:''}</div><div style={{ fontSize:8, color:'#666', marginTop:1 }}>{e.description}</div></div>)}</>}
        </div>
        <div>
          {data.education.some(e=>e.school)&&<><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#111', marginBottom:4 }}>Education</div>{data.education.filter(e=>e.school).map((e,i)=><div key={i} style={{ marginBottom:4 }}><div style={{ fontWeight:700, fontSize:9 }}>{e.degree}</div><div style={{ fontSize:8, color:'#888' }}>{e.school}, {e.end}</div></div>)}</>}
          {data.skills.length>0&&<><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#111', marginBottom:3, marginTop:8 }}>Skills</div><div style={{ fontSize:8, color:'#555' }}>{data.skills.join(' · ')}</div></>}
          {data.projects.some(p=>p.name)&&<><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#111', marginBottom:4, marginTop:8 }}>Projects</div>{data.projects.filter(p=>p.name).map((p,i)=><div key={i} style={{ marginBottom:3 }}><span style={{ fontWeight:700, fontSize:9 }}>{p.name}</span><div style={{ fontSize:8, color:'#666' }}>{p.description}</div></div>)}</>}
        </div>
      </div>
      {data.summary&&<div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid #eee' }}><div style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#111', marginBottom:3 }}>Summary</div><p style={{ fontSize:8, color:'#555', margin:0 }}>{data.summary}</p></div>}
    </div>
  )

  return (
    <div style={s}>
      <div style={{ background:accent, padding:'16px 20px', textAlign:'center' }}>
        <div style={name}>{data.name || 'Your Name'}</div>
        <div style={contact}>{[data.email, data.phone, data.location].filter(Boolean).join(' · ')}</div>
      </div>
      <div style={{ padding:'12px 20px' }}>
        {data.summary && <><div style={secTitle}>Summary</div><p style={{ fontSize:8, color:'#555', margin:'0 0 6px' }}>{data.summary}</p></>}
        {data.experience.some(e=>e.company) && <><div style={secTitle}>Experience</div>{data.experience.filter(e=>e.company).map((e,i)=><div key={i} style={{ marginBottom:6 }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:700, fontSize:9 }}>{e.role}</span><span style={{ fontSize:8, color:'#888' }}>{e.start}{e.end?` – ${e.end}`:''}</span></div><div style={{ color:accent, fontSize:8 }}>{e.company}</div><div style={{ fontSize:8, color:'#666', marginTop:2 }}>{e.description}</div></div>)}</>}
        {data.education.some(e=>e.school) && <><div style={secTitle}>Education</div>{data.education.filter(e=>e.school).map((e,i)=><div key={i} style={{ marginBottom:4 }}><div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:700, fontSize:9 }}>{e.degree}</span><span style={{ fontSize:8, color:'#888' }}>{e.end}</span></div><div style={{ color:accent, fontSize:8 }}>{e.school}</div></div>)}</>}
        {data.skills.length>0 && <><div style={secTitle}>Skills</div><div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>{data.skills.map((s,i)=><span key={i} style={{ background:`${accent}18`, color:accent, borderRadius:3, padding:'2px 7px', fontSize:8 }}>{s}</span>)}</div></>}
        {data.projects.some(p=>p.name) && <><div style={secTitle}>Projects</div>{data.projects.filter(p=>p.name).map((p,i)=><div key={i} style={{ marginBottom:5 }}><span style={{ fontWeight:700, fontSize:9 }}>{p.name}</span>{p.link&&<span style={{ color:accent, fontSize:8 }}> · {p.link}</span>}<div style={{ fontSize:8, color:'#666', marginTop:1 }}>{p.description}</div></div>)}</>}
      </div>
    </div>
  )
}
