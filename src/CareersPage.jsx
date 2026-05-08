import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import logoImg from './assets/img/logo.png'
import {
  Briefcase, MapPin, Clock, ChevronLeft, ChevronDown,
  ChevronUp, ExternalLink, Sun, Moon, ArrowRight
} from 'lucide-react'

const A = '#e85b25'
const WHATSAPP_NUM = '94772356969'

const TYPE_LABELS = {
  'full-time':  { label:'Full Time',  color:'#22c55e'  },
  'part-time':  { label:'Part Time',  color:'#3b82f6'  },
  'contract':   { label:'Contract',   color:'#f59e0b'  },
  'internship': { label:'Internship', color:'#8b5cf6'  },
}

function JobCard({ job, dark }) {
  const [open, setOpen] = useState(false)
  const T = {
    card:   dark ? '#161616' : '#ffffff',
    border: dark ? '#222222' : '#e5e0d8',
    text:   dark ? '#f0ece6' : '#1a1410',
    muted:  dark ? '#555555' : '#9a9088',
    bg:     dark ? '#0a0a0a' : '#f4f0eb',
  }
  const typeCfg = TYPE_LABELS[job.type] || TYPE_LABELS['full-time']

  // Build WhatsApp message with job title substituted
  const waMessage = encodeURIComponent(
    (job.whatsapp_message || 'Hi, I am applying for the position of {title} at Hotel de Plaza.')
      .replace('{title}', job.title)
  )
  const waLink = `https://wa.me/${WHATSAPP_NUM}?text=${waMessage}`

  return (
    <div style={{ background:T.card, border:`1.5px solid ${open?A:T.border}`, borderRadius:18, overflow:'hidden', transition:'all 0.25s', boxShadow:open?`0 8px 32px ${dark?'rgba(0,0,0,0.4)':'rgba(0,0,0,0.08)'}`:T.shadow }}>
      {/* Card header — always visible */}
      <div onClick={()=>setOpen(o=>!o)} style={{ padding:'20px 22px', cursor:'pointer', display:'flex', alignItems:'flex-start', gap:14 }}>
        {/* Icon */}
        <div style={{ width:44, height:44, borderRadius:12, background:A+'18', border:`1px solid ${A}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Briefcase size={20} color={A}/>
        </div>
        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
            <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:T.text }}>{job.title}</h3>
            <span style={{ background:typeCfg.color+'18', color:typeCfg.color, border:`1px solid ${typeCfg.color}44`, borderRadius:999, padding:'2px 10px', fontSize:10, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase' }}>{typeCfg.label}</span>
          </div>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            {job.department && <span style={{ fontSize:12, color:T.muted, display:'flex', alignItems:'center', gap:4 }}><Briefcase size={11}/>{job.department}</span>}
            <span style={{ fontSize:12, color:T.muted, display:'flex', alignItems:'center', gap:4 }}><MapPin size={11}/>{job.location||'Colombo 03'}</span>
            <span style={{ fontSize:12, color:T.muted, display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>{typeCfg.label}</span>
            {job.salary_range && <span style={{ fontSize:12, color:A, fontWeight:700 }}>💰 {job.salary_range}</span>}
          </div>
        </div>
        {/* Chevron */}
        <div style={{ color:T.muted, flexShrink:0, transition:'transform 0.2s', transform:open?'rotate(180deg)':'none' }}>
          <ChevronDown size={20}/>
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop:`1px solid ${T.border}`, padding:'20px 22px', display:'flex', flexDirection:'column', gap:16 }}>
          {job.description && (
            <div>
              <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:A, letterSpacing:'0.2em', textTransform:'uppercase' }}>About the Role</p>
              <p style={{ margin:0, fontSize:13, color:T.muted, lineHeight:1.8, whiteSpace:'pre-line' }}>{job.description}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:A, letterSpacing:'0.2em', textTransform:'uppercase' }}>Requirements</p>
              <p style={{ margin:0, fontSize:13, color:T.muted, lineHeight:1.8, whiteSpace:'pre-line' }}>{job.requirements}</p>
            </div>
          )}

          {/* Apply buttons */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', paddingTop:4 }}>
            {job.google_form_url && (
              <a href={job.google_form_url} target="_blank" rel="noopener noreferrer"
                style={{ flex:1, minWidth:160, background:`linear-gradient(135deg,${A},#c04010)`, color:'#fff', textDecoration:'none', borderRadius:12, padding:'13px 18px', fontSize:13, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:7, boxShadow:`0 4px 16px ${A}44` }}>
                <ExternalLink size={15}/> Apply via Form
              </a>
            )}
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ flex:1, minWidth:160, background:'#25D366', color:'#fff', textDecoration:'none', borderRadius:12, padding:'13px 18px', fontSize:13, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:7, boxShadow:'0 4px 16px rgba(37,211,102,0.35)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
              Send CV via WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CareersPage() {
  const navigate = useNavigate()
  const [dark, setDark]     = useState(true)
  const [jobs, setJobs]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('active', true)
        .order('display_order')
        .order('created_at', { ascending: false })
      setJobs(data || [])
      setLoading(false)
    })()
  }, [])

  const T = {
    bg:      dark ? '#0a0a0a' : '#f4f0eb',
    surface: dark ? '#111111' : '#ffffff',
    text:    dark ? '#f0ece6' : '#1a1410',
    muted:   dark ? '#555555' : '#9a9088',
    border:  dark ? '#222222' : '#e5e0d8',
  }

  return (
    <div style={{ background:T.bg, minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", color:T.text }}>
      {/* Navbar */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:dark?'rgba(10,10,10,0.97)':'rgba(244,240,235,0.97)', borderBottom:`1px solid ${T.border}`, backdropFilter:'blur(20px)', padding:'0 clamp(16px,4vw,48px)', height:64, display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={()=>navigate('/')} style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.muted, transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=A;e.currentTarget.style.color=A}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted}}>
          <ChevronLeft size={18}/>
        </button>
        <img src={logoImg} alt="Hotel de Plaza" style={{ height:38, objectFit:'contain' }}/>
        <span style={{ fontSize:14, fontWeight:700, color:T.text, flex:1 }}>Careers</span>
        <button onClick={()=>setDark(!dark)} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:'50%', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T.text }}>
          {dark ? <Sun size={13}/> : <Moon size={13}/>}
        </button>
      </nav>

      {/* Hero */}
      <div style={{ padding:'60px clamp(16px,5vw,80px) 48px', maxWidth:820, margin:'0 auto', textAlign:'center' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:A+'18', border:`1px solid ${A}33`, borderRadius:999, padding:'6px 18px', marginBottom:20 }}>
          <Briefcase size={13} color={A}/>
          <span style={{ fontSize:11, fontWeight:800, color:A, letterSpacing:'0.2em', textTransform:'uppercase' }}>We're Hiring</span>
        </div>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.5rem,7vw,4.5rem)', margin:'0 0 16px', color:T.text, lineHeight:1, letterSpacing:'0.02em' }}>
          Join the Hotel de Plaza Family
        </h1>
        <p style={{ fontSize:'clamp(14px,2vw,17px)', color:T.muted, maxWidth:520, margin:'0 auto 32px', lineHeight:1.7 }}>
          Be part of Colombo's most iconic restaurant. We've been serving since 2009 and we're always looking for passionate people to grow with us.
        </p>
        
      </div>

      {/* Jobs list */}
      <div style={{ padding:'0 clamp(16px,5vw,80px) 80px', maxWidth:820, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <div style={{ width:28, height:2, background:A }}/>
          <p style={{ margin:0, fontSize:10, fontWeight:800, color:A, letterSpacing:'0.35em', textTransform:'uppercase' }}>Open Positions</p>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', opacity:.4 }}>
            <div style={{ width:32, height:32, border:`3px solid ${A}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', background:T.surface, borderRadius:20, border:`1px solid ${T.border}` }}>
            <Briefcase size={44} color={T.muted} style={{ margin:'0 auto 14px' }}/>
            <p style={{ margin:'0 0 6px', fontSize:16, fontWeight:800, color:T.text }}>No open positions right now</p>
            <p style={{ margin:'0 0 20px', fontSize:13, color:T.muted }}>Check back soon or send us your CV anyway!</p>
            <a href={`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent('Hi, I am interested in working at Hotel de Plaza. Please find my CV attached.')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#25D366', color:'#fff', textDecoration:'none', borderRadius:12, padding:'11px 22px', fontSize:13, fontWeight:800 }}>
              Send CV via WhatsApp <ArrowRight size={14}/>
            </a>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {jobs.map(job => <JobCard key={job.id} job={job} dark={dark}/>)}
          </div>
        )}

        {/* General application */}
        {jobs.length > 0 && (
          <div style={{ marginTop:32, background:T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:'24px', textAlign:'center' }}>
            <p style={{ margin:'0 0 6px', fontSize:15, fontWeight:800, color:T.text }}>Don't see the right role?</p>
            <p style={{ margin:'0 0 16px', fontSize:13, color:T.muted }}>Send us your CV and we'll reach out when something fits.</p>
            <a href={`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent('Hi, I am interested in working at Hotel de Plaza. Please find my CV attached.')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#25D366', color:'#fff', textDecoration:'none', borderRadius:12, padding:'12px 24px', fontSize:13, fontWeight:800 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
              Send General CV
            </a>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg};overflow-x:hidden}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}