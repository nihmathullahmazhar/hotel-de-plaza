import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, ShoppingBag, Sun, Moon, Menu, X,
  Phone, MapPin, Clock, Star, ChevronLeft, ChevronRight,
  ChevronUp, ArrowRight, Award, Sparkles,
  UtensilsCrossed, Zap, Crown, Leaf, Quote, Calendar
} from 'lucide-react'
import { supabase } from './lib/supabase'
import chefImg from './assets/img/chef.jpg'
import food1   from './assets/img/food1.jpeg'
import food2   from './assets/img/food2.jpeg'
import food3   from './assets/img/food3.jpeg'
import food4   from './assets/img/food4.jpeg'
import food5   from './assets/img/food5.jpeg'
import food6   from './assets/img/food6.jpeg'
import img2009 from './assets/img/2009.png'
import logoImg from './assets/img/logo.png'

const SLIDES        = [chefImg, food1, food2, food3, food4, food5, food6]
const UBER_EATS_URL = 'https://www.ubereats.com/lk/store/hotel-de-plaza-kollupitiya/k2Cg1H4dQ-qzn_X1DUyJmg?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMiUyMERhd3NvbiUyMFN0JTIyJTJDJTIycmVmZXJlbmNlJTIyJTNBJTIyQ2hJSmlhNnpWV3RaNGpvUjRGbE95V3VlMmtzJTIyJTJDJTIycmVmZXJlbmNlVHlwZSUyMiUzQSUyMmdvb2dsZV9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTYuOTE5NDEwMiUyQyUyMmxvbmdpdHVkZSUyMiUzQTc5Ljg1NzU1NTQ5OTk5OTk5JTdE&ps=1?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMiUyMERhd3NvbiUyMFN0JTIyJTJDJTIycmVmZXJlbmNlJTIyJTNBJTIyQ2hJSmlhNnpWV3RaNGpvUjRGbE95V3VlMmtzJTIyJTJDJTIycmVmZXJlbmNlVHlwZSUyMiUzQSUyMmdvb2dsZV9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTYuOTE5NDEwMiUyQyUyMmxvbmdpdHVkZSUyMiUzQTc5Ljg1NzU1NTQ5OTk5OTk5JTdE&ps=1?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMiUyMERhd3NvbiUyMFN0JTIyJTJDJTIycmVmZXJlbmNlJTIyJTNBJTIyQ2hJSmlhNnpWV3RaNGpvUjRGbE95V3VlMmtzJTIyJTJDJTIycmVmZXJlbmNlVHlwZSUyMiUzQSUyMmdvb2dsZV9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTYuOTE5NDEwMiUyQyUyMmxvbmdpdHVkZSUyMiUzQTc5Ljg1NzU1NTQ5OTk5OTk5JTdE&ps=1?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMiUyMERhd3NvbiUyMFN0JTIyJTJDJTIycmVmZXJlbmNlJTIyJTNBJTIyQ2hJSmlhNnpWV3RaNGpvUjRGbE95V3VlMmtzJTIyJTJDJTIycmVmZXJlbmNlVHlwZSUyMiUzQSUyMmdvb2dsZV9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTYuOTE5NDEwMiUyQyUyMmxvbmdpdHVkZSUyMiUzQTc5Ljg1NzU1NTQ5OTk5OTk5JTdE&ps=1'
const WHATSAPP_NUM  = '94772356969'
const WHATSAPP_MSG  = encodeURIComponent('Hello, I have a question about your menu.')

const ITEM_TAGS = [
  { key:'best_seller',   label:'Best Seller',   icon:<Award size={11}/>,    color:'#e85b25' },
  { key:'new_item',      label:'New',            icon:<Sparkles size={11}/>, color:'#3b82f6' },
  { key:'fast_moving',   label:'Fast Moving',    icon:<Zap size={11}/>,      color:'#f59e0b' },
  { key:'chefs_special', label:"Chef's Special", icon:<Crown size={11}/>,    color:'#8b5cf6' },
  { key:'seasonal',      label:'Seasonal',       icon:<Leaf size={11}/>,     color:'#22c55e' },
]

const REVIEWS = [
  { name:'Ashan Perera',     rating:5, text:'Best kottu in Colombo — hands down. The chicken cheese dolphin at 2am is something else entirely.',      platform:'Google'      },
  { name:'Fathima Rizvi',    rating:5, text:'Been coming here since 2015. The biryani is always consistent. Love that it never closes.',              platform:'Google'      },
  { name:'Ruwantha Silva',   rating:5, text:'Incredible variety. 30+ kottu types and they nail every single one. The palandi is my go-to.',           platform:'Google'      },
  { name:'Nimal Fernando',   rating:5, text:'Open 24/7 and the quality never drops. That\'s rare. My family visits every week.',                     platform:'TripAdvisor' },
  { name:'Dilki Jayawardene',rating:5, text:'The Plaza Special Iced Milo alone is worth the trip. Always fresh, always perfect.',                    platform:'Google'      },
  { name:'Mohamed Farhan',   rating:5, text:'Authentic Sri Lankan food in the heart of Colombo. Est. 2009 and still the best.',                      platform:'Google'      },
]

function useInView(threshold=0.2){
  const ref=useRef(null),[inView,setInView]=useState(false)
  useEffect(()=>{ const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting) setInView(true) },{threshold}); if(ref.current) obs.observe(ref.current); return ()=>obs.disconnect() },[threshold])
  return [ref,inView]
}

function useCountUp(target,duration=1800,start=false){
  const [val,setVal]=useState(0)
  useEffect(()=>{
    if(!start) return
    const n=parseInt(target); if(isNaN(n)){setVal(target);return}
    let t0=null
    const step=ts=>{ if(!t0) t0=ts; const p=Math.min((ts-t0)/duration,1); setVal(Math.floor(p*n)); if(p<1) requestAnimationFrame(step); else setVal(n) }
    requestAnimationFrame(step)
  },[start,target,duration])
  return val
}

function TagBadge({tagKey}){
  const tag=ITEM_TAGS.find(t=>t.key===tagKey); if(!tag) return null
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,background:tag.color+'22',color:tag.color,border:`1px solid ${tag.color}44`,borderRadius:999,padding:'3px 9px',fontSize:9,fontWeight:800,letterSpacing:'0.15em',textTransform:'uppercase'}}>{tag.icon} {tag.label}</span>
}

// ── Featured Carousel ─────────────────────────────────────
function FeaturedCarousel({ items, T, dark }) {
  const [idx, setIdx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
  const [perView, setPerView] = useState(4)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 560) setPerView(1)
      else if (w < 768) setPerView(2)
      else if (w < 1024) setPerView(3)
      else setPerView(4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const cardW = 240, gap = 16
  const maxIdx = Math.max(0, items.length - perView)
  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(maxIdx, i + 1))
  const onDragStart = e => { setDragging(true); setDragStart(e.touches ? e.touches[0].clientX : e.clientX); setDragDelta(0) }
  const onDragMove  = e => { if (!dragging) return; setDragDelta((e.touches ? e.touches[0].clientX : e.clientX) - dragStart) }
  const onDragEnd   = () => { if (Math.abs(dragDelta) > 50) { dragDelta < 0 ? next() : prev() }; setDragging(false); setDragDelta(0) }
  const onWheel     = e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); e.deltaX > 0 ? next() : prev() } }

  return (
    <div style={{ position:'relative', padding:'0 28px' }}>
      <button onClick={prev} disabled={idx===0} style={{ position:'absolute', left:0, top:'40%', transform:'translateY(-50%)', zIndex:10, background:idx===0?T.border:T.accent, border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:idx===0?'default':'pointer', color:'#fff', transition:'all 0.2s', opacity:idx===0?0.3:1 }}>
        <ChevronLeft size={18}/>
      </button>
      <div style={{ overflow:'hidden', borderRadius:16, cursor:dragging?'grabbing':'grab' }}
        onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
        onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
        onWheel={onWheel}>
        <div style={{ display:'flex', gap:gap, transition:dragging?'none':'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)', transform:`translateX(calc(-${idx*(cardW+gap)}px + ${dragging?dragDelta:0}px))`, padding:'8px 4px 16px' }}>
          {items.map(item => (
            <div key={item.id} style={{ flexShrink:0, width:cardW }}>
              <FeaturedCard item={item} T={T} dark={dark}/>
            </div>
          ))}
        </div>
      </div>
      <button onClick={next} disabled={idx>=maxIdx} style={{ position:'absolute', right:0, top:'40%', transform:'translateY(-50%)', zIndex:10, background:idx>=maxIdx?T.border:T.accent, border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:idx>=maxIdx?'default':'pointer', color:'#fff', transition:'all 0.2s', opacity:idx>=maxIdx?0.3:1 }}>
        <ChevronRight size={18}/>
      </button>
      <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:8 }}>
        {Array.from({length:maxIdx+1}).map((_,i) => (
          <button key={i} onClick={()=>setIdx(i)} style={{ width:i===idx?20:7, height:7, borderRadius:4, background:i===idx?T.accent:T.border, border:'none', cursor:'pointer', transition:'all 0.3s', padding:0 }}/>
        ))}
      </div>
    </div>
  )
}

function FeaturedCard({item,T,dark}){
  const [hov,setHov]=useState(false)
  const price=item.price_type==='single'?`Rs.${Number(item.price_single).toLocaleString()}`:`Rs.${Number(item.price_medium).toLocaleString()} / ${Number(item.price_large).toLocaleString()}`
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:T.card,border:`1px solid ${hov?T.accent+'66':T.border}`,borderRadius:20,overflow:'hidden',transition:'all 0.25s',transform:hov?'translateY(-6px)':'none',boxShadow:hov?`0 20px 48px ${dark?'rgba(0,0,0,0.55)':'rgba(0,0,0,0.12)'}`:T.shadow,display:'flex',flexDirection:'column'}}>
      <div style={{height:190,overflow:'hidden',position:'relative',background:dark?'#1a1a1a':'#f0ece6'}}>
        {item.image_url
          ?<img src={item.image_url} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.45s',transform:hov?'scale(1.08)':'scale(1)'}}/>
          :<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,background:dark?'linear-gradient(135deg,#1a1a1a,#111)':'linear-gradient(135deg,#f0ece6,#ebe6df)'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:T.accent+'18',border:`2px solid ${T.accent}33`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <UtensilsCrossed size={24} color={T.accent}/>
            </div>
            <span style={{fontSize:9,fontWeight:700,color:T.muted,letterSpacing:'0.15em',textTransform:'uppercase'}}>No photo yet</span>
          </div>
        }
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 55%)'}}/>
        {item.tags?.[0]&&<div style={{position:'absolute',top:10,left:10}}><TagBadge tagKey={item.tags[0]}/></div>}
        {item.featured&&<div style={{position:'absolute',top:10,right:10,display:'flex',gap:2}}>{[1,2,3,4,5].map(i=><Star key={i} size={9} color='#f59e0b' fill='#f59e0b'/>)}</div>}
      </div>
      <div style={{padding:'14px 16px 18px',flex:1,display:'flex',flexDirection:'column',gap:8}}>
        <p style={{margin:0,fontSize:14,fontWeight:700,color:T.text,lineHeight:1.35}}>{item.name}</p>
        <p style={{margin:0,fontSize:15,fontWeight:800,color:T.accent,fontFamily:'monospace'}}>{price}</p>
      </div>
    </div>
  )
}


// ── Promotion Banner + Popup ──────────────────────────────
function PromoBanner({ promo, idx, total, onNext, onPrev, onExpand, onClose }) {
  const [hov, setHov] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 800); return () => clearTimeout(t) }, [])
  if (!promo) return null
  return (
    <div style={{
      position:'fixed', bottom:100, left:24, zIndex:88, width:320,
      transition:'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.92)',
      opacity: visible ? 1 : 0,
    }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{
        background:'linear-gradient(135deg,#1e1e1e,#141414)',
        border:`1.5px solid ${hov ? '#e85b25' : 'rgba(232,91,37,0.3)'}`,
        borderRadius:18, overflow:'hidden',
        boxShadow: hov
          ? '0 16px 48px rgba(232,91,37,0.3), 0 0 0 1px rgba(232,91,37,0.15)'
          : '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(232,91,37,0.08)',
        animation:'promoPulse 3s ease-in-out infinite',
        transition:'all 0.25s',
      }}>
        {/* Main clickable row */}
        <div onClick={onExpand} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', cursor:'pointer',
          transform: hov ? 'translateY(-2px)' : 'none', transition:'transform 0.2s' }}>
          <div style={{ width:52, height:52, borderRadius:12, overflow:'hidden', flexShrink:0,
            boxShadow:'0 4px 12px rgba(0,0,0,0.4)', background: promo.image_url ? 'transparent' : '#e85b2518',
            border: promo.image_url ? 'none' : '1px solid #e85b2544',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            {promo.image_url
              ? <img src={promo.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : <Flame size={24} color='#e85b25'/>
            }
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#e85b25', boxShadow:'0 0 8px #e85b2599', animation:'pulse 2s infinite', flexShrink:0 }}/>
              <span style={{ fontSize:9, fontWeight:800, color:'#e85b25', letterSpacing:'0.25em', textTransform:'uppercase' }}>Announcement</span>
            </div>
            <p style={{ margin:'0 0 2px', fontSize:13, fontWeight:800, color:'#f0ece6', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {promo.title || 'New Announcement'}
            </p>
            <p style={{ margin:0, fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:500 }}>Tap to see full details</p>
          </div>
          <div style={{ background:'linear-gradient(135deg,#e85b25,#c04010)', borderRadius:10,
            padding:'8px 14px', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0,
            boxShadow:'0 4px 12px rgba(232,91,37,0.4)' }}>
            View
          </div>
        </div>

        {/* Multi-promo navigation — only shows when more than 1 */}
        {total > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'8px 16px 12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={e=>{e.stopPropagation(); onPrev()}} disabled={idx===0}
              style={{ background:'none', border:'none', cursor:idx===0?'default':'pointer',
                color:idx===0?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.5)',
                fontSize:18, lineHeight:1, padding:'0 4px', transition:'color 0.15s' }}
              onMouseEnter={e=>{ if(idx>0) e.currentTarget.style.color='#e85b25' }}
              onMouseLeave={e=>{ e.currentTarget.style.color=idx===0?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.5)' }}>
              ‹
            </button>
            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
              {Array.from({length:total}).map((_,i)=>(
                <div key={i} style={{ width:i===idx?16:5, height:5, borderRadius:3,
                  background:i===idx?'#e85b25':'rgba(255,255,255,0.2)', transition:'all 0.3s' }}/>
              ))}
            </div>
            <button onClick={e=>{e.stopPropagation(); onNext()}} disabled={idx===total-1}
              style={{ background:'none', border:'none', cursor:idx===total-1?'default':'pointer',
                color:idx===total-1?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.5)',
                fontSize:18, lineHeight:1, padding:'0 4px', transition:'color 0.15s' }}
              onMouseEnter={e=>{ if(idx<total-1) e.currentTarget.style.color='#e85b25' }}
              onMouseLeave={e=>{ e.currentTarget.style.color=idx===total-1?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.5)' }}>
              ›
            </button>
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button onClick={e=>{e.stopPropagation();onClose()}}
        style={{ position:'absolute', top:-9, right:-9, background:'#2a2a2a', border:'1px solid #444',
          borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.5)',
          fontSize:13, lineHeight:1, transition:'all 0.15s', zIndex:1 }}
        onMouseEnter={e=>{e.currentTarget.style.background='#ef4444';e.currentTarget.style.color='#fff'}}
        onMouseLeave={e=>{e.currentTarget.style.background='#2a2a2a';e.currentTarget.style.color='rgba(255,255,255,0.5)'}}>
        ×
      </button>
    </div>
  )
}

function PromoPopup({ promo, onClose }) {
  if (!promo) return null
  const hasWA   = promo.contact_option === 'whatsapp' || promo.contact_option === 'both'
  const hasCall = promo.contact_option === 'call'     || promo.contact_option === 'both'
  const hasCTA  = hasWA || hasCall
  const hasText = promo.title || promo.description
  const waMsgEncoded = encodeURIComponent(promo.whatsapp_message || 'Hello, I am interested in this promotion!')

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:24, maxWidth:460, width:'100%', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.7)', animation:'popIn 0.3s ease' }}>

        {/* Poster image */}
        {promo.image_url ? (
          <div style={{ position:'relative', background:'#000' }}>
            <img src={promo.image_url} alt={promo.title||'Announcement'} style={{ width:'100%', maxHeight: hasText||hasCTA ? 300 : 560, objectFit:'cover', display:'block' }}/>
            {(hasText || hasCTA) && <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(20,20,20,0.85) 0%,transparent 50%)' }}/>}
            <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', backdropFilter:'blur(4px)' }}>
              <X size={16}/>
            </button>
          </div>
        ) : (
          <div style={{ height:120, background:'linear-gradient(135deg,#1a0a00,#2a1200)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <Flame size={48} color='#e85b25'/>
            <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff' }}>
              <X size={16}/>
            </button>
          </div>
        )}

        {/* Text content — only if title or description exists */}
        {hasText && (
          <div style={{ padding:'18px 24px 0' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#e85b25', animation:'pulse 2s infinite' }}/>
              <span style={{ fontSize:9, fontWeight:800, color:'#e85b25', letterSpacing:'0.25em', textTransform:'uppercase' }}>Announcement</span>
            </div>
            {promo.title && <h2 style={{ margin:'0 0 8px', fontSize:20, fontWeight:800, color:'#f0ece6', lineHeight:1.2 }}>{promo.title}</h2>}
            {promo.description && <p style={{ margin:'0 0 12px', fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.7 }}>{promo.description}</p>}
            {(promo.start_date || promo.end_date) && (
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12, padding:'7px 12px', background:'rgba(232,91,37,0.08)', border:'1px solid rgba(232,91,37,0.2)', borderRadius:10 }}>
                <Clock size={11} color='#e85b25'/>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>
                  {promo.start_date && `From ${promo.start_date}`}{promo.start_date && promo.end_date && ' · '}{promo.end_date && `Until ${promo.end_date}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA buttons — always show if contact option set */}
        {hasCTA && (
          <div style={{ display:'flex', gap:10, padding: hasText ? '12px 24px 24px' : '20px 24px 24px' }}>
            {hasWA && (
              <a href={`https://wa.me/${promo.phone||'94772356969'}?text=${waMsgEncoded}`} target="_blank" rel="noopener noreferrer" onClick={onClose}
                style={{ flex:1, background:'#25D366', color:'#fff', textDecoration:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                WhatsApp
              </a>
            )}
            {hasCall && (
              <a href={`tel:+${promo.phone||'94772356969'}`} onClick={onClose}
                style={{ flex:1, background:'#e85b25', color:'#fff', textDecoration:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <Phone size={14}/> Call Now
              </a>
            )}
          </div>
        )}

        {/* Close button if poster-only with no CTA */}
        {!hasCTA && !hasText && (
          <div style={{ padding:'16px 24px 24px', textAlign:'center' }}>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:12, padding:'10px 32px', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


export default function App(){
  const navigate=useNavigate()
  const [dark,setDark]=useState(true)
  const [slide,setSlide]=useState(0)
  const [mobileNav,setMobileNav]=useState(false)
  const [scrolled,setScrolled]=useState(false)
  const [modal,setModal]=useState(null)
  const [featuredItems,setFeaturedItems]=useState([])
  const [promos,setPromos]=useState([])
  const [reviewIdx,setReviewIdx]=useState(0)

  // Auto-rotate reviews every 4 seconds
  useEffect(()=>{
    const t = setInterval(()=>setReviewIdx(i=>(i+1)%REVIEWS.length), 4000)
    return ()=>clearInterval(t)
  },[])
  const [promoIdx,setPromoIdx]=useState(0)
  const [promoOpen,setPromoOpen]=useState(false)
  const [promoBanner,setPromoBanner]=useState(false)

  const promo = promos[promoIdx] || null
  const [statsRef,statsInView]=useInView(0.3)
  const [thenRef,thenInView]=useInView(0.2)
  const [featRef,featInView]=useInView(0.2)

  const T={
    bg:     dark?'#0a0a0a':'#f4f0eb',
    surface:dark?'#111111':'#ffffff',
    card:   dark?'#161616':'#ffffff',
    border: dark?'#222222':'#e5e0d8',
    text:   dark?'#f0ece6':'#1a1410',
    muted:  dark?'#555555':'#9a9088',
    accent: '#e85b25',
    shadow: dark?'0 2px 12px rgba(0,0,0,0.4)':'0 2px 12px rgba(0,0,0,0.06)',
  }

  useEffect(()=>{ const t=setInterval(()=>setSlide(s=>(s+1)%SLIDES.length),4500); return ()=>clearInterval(t) },[]);
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>60); window.addEventListener('scroll',fn,{passive:true}); return ()=>window.removeEventListener('scroll',fn) },[]);


  useEffect(()=>{
    ;(async()=>{
      const { data } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
      if (data?.length) {
        setPromos(data)
        setPromoIdx(0)
        setPromoBanner(true)
      }
    })()
  },[])

  useEffect(()=>{
    ;(async()=>{
      // Try featured first, fall back to best_seller tagged
      const { data: feat } = await supabase
        .from('menu_items')
        .select('id,name,price_type,price_single,price_medium,price_large,image_url,tags,featured')
        .eq('archived', false)
        .eq('available', true)
        .eq('featured', true)
        .limit(12)
      if (feat?.length) { setFeaturedItems(feat); return }
      const { data: tagged } = await supabase
        .from('menu_items')
        .select('id,name,price_type,price_single,price_medium,price_large,image_url,tags,featured')
        .eq('archived', false)
        .eq('available', true)
        .contains('tags', ['best_seller'])
        .limit(12)
      if (tagged?.length) setFeaturedItems(tagged)
    })()
  },[])

  const NAV=[
    {label:'Menu',   action:()=>navigate('/menu')},
    {label:'About',  action:()=>setModal('about')},
    {label:'Contact',action:()=>setModal('contact')},
  ]

  const A='#e85b25'

  return(
    <div style={{background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif",overflowX:'hidden'}}>

      {/* ── NAVBAR ── */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:200,background:scrolled?(dark?'rgba(10,10,10,0.97)':'rgba(244,240,235,0.97)'):'transparent',borderBottom:scrolled?`1px solid ${T.border}`:'none',backdropFilter:scrolled?'blur(20px)':'none',transition:'all 0.3s',padding:'0 clamp(20px,5vw,60px)',height:68,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <img src={logoImg} alt="Hotel de Plaza" style={{height:46,objectFit:'contain',cursor:'pointer'}} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}/>
        <div className="nav-desktop" style={{display:'flex',alignItems:'center',gap:8}}>
          {NAV.map(l=>(
            <button key={l.label} onClick={l.action} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:10,padding:'8px 20px',cursor:'pointer',color:T.text,fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=A;e.currentTarget.style.color=A}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.text}}
            >{l.label}</button>
          ))}
          <a href={UBER_EATS_URL} target="_blank" rel="noopener noreferrer" style={{background:A,color:'#fff',textDecoration:'none',borderRadius:10,padding:'9px 20px',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',gap:6,boxShadow:`0 4px 16px ${A}44`}}>
            <ShoppingBag size={14}/> Order on Uber Eats
          </a>
          <button onClick={()=>setDark(!dark)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'50%',width:38,height:38,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:T.text}}>
            {dark?<Sun size={14}/>:<Moon size={14}/>}
          </button>
        </div>
        <div className="nav-mobile" style={{display:'none',alignItems:'center',gap:8}}>
          <button onClick={()=>setDark(!dark)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:'50%',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:T.text}}>
            {dark?<Sun size={13}/>:<Moon size={13}/>}
          </button>
          <button onClick={()=>setMobileNav(!mobileNav)} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:10,padding:'8px 10px',cursor:'pointer',color:T.text,display:'flex',alignItems:'center'}}>
            {mobileNav?<X size={18}/>:<Menu size={18}/>}
          </button>
        </div>
      </nav>

      {mobileNav&&(
        <div style={{position:'fixed',top:68,left:0,right:0,zIndex:199,background:dark?'rgba(10,10,10,0.98)':'rgba(244,240,235,0.98)',borderBottom:`1px solid ${T.border}`,backdropFilter:'blur(20px)',padding:'16px 24px 20px',display:'flex',flexDirection:'column',gap:8}}>
          {NAV.map(l=>(
            <button key={l.label} onClick={()=>{l.action();setMobileNav(false)}} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',cursor:'pointer',color:T.text,fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",textAlign:'left'}}>{l.label}</button>
          ))}
          <a href={UBER_EATS_URL} target="_blank" rel="noopener noreferrer" style={{background:A,color:'#fff',textDecoration:'none',borderRadius:10,padding:'12px 16px',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',gap:6,justifyContent:'center'}}>
            <ShoppingBag size={14}/> Order on Uber Eats
          </a>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{position:'relative',height:'100vh',minHeight:600,overflow:'hidden'}}>
        {SLIDES.map((src,i)=>(
          <div key={i} style={{position:'absolute',inset:0,transition:'opacity 1.2s ease',opacity:i===slide?1:0,zIndex:i===slide?1:0}}>
            <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.65) 100%)'}}/>
          </div>
        ))}
        <div style={{position:'absolute',bottom:32,left:'50%',transform:'translateX(-50%)',display:'flex',gap:8,zIndex:10}}>
          {SLIDES.map((_,i)=><button key={i} onClick={()=>setSlide(i)} style={{width:i===slide?24:8,height:8,borderRadius:4,background:i===slide?A:'rgba(255,255,255,0.35)',border:'none',cursor:'pointer',transition:'all 0.3s',padding:0}}/>)}
        </div>
        <button onClick={()=>setSlide(s=>(s-1+SLIDES.length)%SLIDES.length)} style={{position:'absolute',left:20,top:'50%',transform:'translateY(-50%)',zIndex:10,background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff',backdropFilter:'blur(4px)'}}><ChevronLeft size={20}/></button>
        <button onClick={()=>setSlide(s=>(s+1)%SLIDES.length)} style={{position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',zIndex:10,background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff',backdropFilter:'blur(4px)'}}><ChevronRight size={20}/></button>

        <div style={{position:'relative',zIndex:5,height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'0 24px',paddingTop:68}}>
          {/* Badge */}
          <div style={{marginBottom:28}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(0,0,0,0.5)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:999,padding:'7px 18px',backdropFilter:'blur(12px)'}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 8px #22c55e',display:'inline-block',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.85)',letterSpacing:'0.25em',textTransform:'uppercase'}}>Kollupitiya · Est. 2009 · Open 24/7</span>
            </div>
          </div>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(4rem,12vw,9rem)',color:'#fff',lineHeight:0.9,letterSpacing:'0.02em',margin:'0 0 8px',textShadow:'0 4px 32px rgba(0,0,0,0.5)'}}>
            Hotel de<br/>Plaza
          </h1>
          <p style={{fontSize:'clamp(13px,2vw,17px)',color:'rgba(255,255,255,0.7)',maxWidth:480,lineHeight:1.7,margin:'20px 0 36px',fontWeight:500}}>
            Colombo's original late-night kottu spot. One kitchen, one location, no compromises — since 2009.
          </p>
          {/* Stamp */}
          <div style={{position:'absolute',top:88,right:'clamp(20px,6vw,80px)',opacity:0.9}}>
            <div style={{width:96,height:96,borderRadius:'50%',border:`3px solid ${A}99`,display:'flex',alignItems:'center',justifyContent:'center',transform:'rotate(-15deg)',background:`${A}18`,backdropFilter:'blur(4px)'}}>
              <p style={{margin:0,fontSize:9,fontWeight:800,color:A,letterSpacing:'0.08em',textTransform:'uppercase',textAlign:'center',lineHeight:1.5}}>One<br/>Location<br/>No Branches</p>
            </div>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
            <button onClick={()=>navigate('/menu')} style={{background:A,color:'#fff',border:'none',borderRadius:12,padding:'14px 32px',fontSize:14,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',gap:8,boxShadow:`0 8px 24px ${A}55`,fontFamily:"'DM Sans',sans-serif"}}>
              View Menu <ArrowRight size={16}/>
            </button>
            <a href={UBER_EATS_URL} target="_blank" rel="noopener noreferrer" style={{background:'rgba(255,255,255,0.12)',color:'#fff',textDecoration:'none',border:'1px solid rgba(255,255,255,0.25)',borderRadius:12,padding:'14px 32px',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',gap:8,backdropFilter:'blur(8px)'}}>
              <ShoppingBag size={16}/> Order on Uber Eats
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div ref={statsRef} style={{background:dark?'#111':'#fff',borderBottom:`1px solid ${T.border}`}}>
        <div style={{maxWidth:900,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
          {[{value:'2009',suffix:'',label:'Est. Year'},{value:'24',suffix:'/7',label:'Hours Open'},{value:'265',suffix:'+',label:'Menu Items'},{value:'15',suffix:'+',label:'Years of Excellence'}].map(s=>{
            const count=useCountUp(s.value,1600,statsInView)
            return(
              <div key={s.label} style={{textAlign:'center',padding:'32px 16px',borderRight:`1px solid ${T.border}`}}>
                <p style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2.2rem,5vw,3.8rem)',color:A,lineHeight:1}}>{count}{s.suffix}</p>
                <p style={{margin:'8px 0 0',fontSize:10,fontWeight:700,color:T.muted,letterSpacing:'0.2em',textTransform:'uppercase'}}>{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── THEN & NOW ── */}
      <section ref={thenRef} style={{padding:'100px clamp(20px,6vw,80px)',background:T.bg,overflow:'hidden'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:60}}>
            <div style={{width:32,height:2,background:A}}/>
            <p style={{margin:0,fontSize:10,fontWeight:800,color:A,letterSpacing:'0.35em',textTransform:'uppercase'}}>Our Journey</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'clamp(20px,5vw,60px)',flexWrap:'wrap',justifyContent:'center'}}>
            {/* Old shop */}
            <div style={{flex:'1 1 280px',maxWidth:380,transition:'all 0.8s',transform:thenInView?'translateY(0) rotate(-2deg)':'translateY(40px) rotate(-2deg)',opacity:thenInView?1:0}}>
              <div style={{position:'relative'}}>
                <div style={{borderRadius:20,overflow:'hidden',border:`3px solid ${T.border}`,boxShadow:`0 20px 60px rgba(0,0,0,${dark?0.6:0.15})`,filter:'grayscale(30%)'}}>
                  <img src={img2009} alt="Hotel de Plaza 2009" style={{width:'100%',height:300,objectFit:'cover',display:'block'}}/>
                </div>
                <div style={{position:'absolute',bottom:-14,left:-14,background:A,color:'#fff',borderRadius:12,padding:'10px 16px',fontFamily:"'Bebas Neue',sans-serif",fontSize:28,lineHeight:1,boxShadow:`0 8px 20px ${A}55`}}>2009</div>
              </div>
              <p style={{margin:'28px 0 0',fontSize:13,color:T.muted,lineHeight:1.7,paddingLeft:4}}>Where it all started — a humble kitchen on Galle Road that became Colombo's go-to spot.</p>
            </div>
            {/* Arrow */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flexShrink:0,transition:'all 0.8s 0.3s',opacity:thenInView?1:0,transform:thenInView?'translateY(0)':'translateY(20px)'}}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M10 50 Q20 20 50 30 Q70 38 65 55" stroke={A} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M58 48 L65 55 L72 47" stroke={A} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span style={{fontSize:10,fontWeight:800,color:A,letterSpacing:'0.2em',textTransform:'uppercase'}}>Then → Now</span>
            </div>
            {/* New shop */}
            <div style={{flex:'1 1 280px',maxWidth:380,transition:'all 0.8s 0.15s',transform:thenInView?'translateY(0) rotate(1.5deg)':'translateY(40px) rotate(1.5deg)',opacity:thenInView?1:0}}>
              <div style={{position:'relative'}}>
                <div style={{borderRadius:20,overflow:'hidden',border:`3px solid ${A}44`,boxShadow:`0 20px 60px ${A}22, 0 20px 60px rgba(0,0,0,${dark?0.5:0.12})`}}>
                  <img src={chefImg} alt="Hotel de Plaza Today" style={{width:'100%',height:300,objectFit:'cover',display:'block'}}/>
                </div>
                <div style={{position:'absolute',bottom:-14,right:-14,background:A,color:'#fff',borderRadius:12,padding:'10px 16px',fontFamily:"'Bebas Neue',sans-serif",fontSize:28,lineHeight:1,boxShadow:`0 8px 20px ${A}55`}}>2025</div>
              </div>
              <p style={{margin:'28px 0 0',fontSize:13,color:T.muted,lineHeight:1.7,paddingLeft:4}}>15 years on — same passion, same Galle Road address, now serving 265+ items around the clock.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAMOUS & TRENDING ── */}
      <section ref={featRef} style={{padding:'100px 0',background:dark?'#0d0d0d':'#faf6f1'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 clamp(20px,5vw,40px)'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:48,flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{width:32,height:2,background:A}}/>
                <p style={{margin:0,fontSize:10,fontWeight:800,color:A,letterSpacing:'0.35em',textTransform:'uppercase'}}>Famous & Trending</p>
              </div>
              <h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2.2rem,5vw,3.5rem)',color:T.text,lineHeight:1,letterSpacing:'0.02em'}}>What Everyone's<br/>Ordering</h2>
            </div>
            <button onClick={()=>navigate('/menu')} style={{background:'none',border:`1px solid ${T.border}`,borderRadius:12,padding:'10px 22px',cursor:'pointer',color:T.text,fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:6,transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=A;e.currentTarget.style.color=A}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.text}}>
              Full Menu <ArrowRight size={14}/>
            </button>
          </div>
          {featuredItems.length>0
            ? <FeaturedCarousel items={featuredItems} T={T} dark={dark}/>
            : (
              <div style={{textAlign:'center',padding:'60px 0',opacity:.3}}>
                <Flame size={40} style={{margin:'0 auto 12px'}}/>
                <p style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.2em'}}>Loading featured items...</p>
              </div>
            )
          }
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{padding:'100px clamp(20px,6vw,80px)',background:T.bg}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:14}}>
              <div style={{width:32,height:2,background:A}}/>
              <p style={{margin:0,fontSize:10,fontWeight:800,color:A,letterSpacing:'0.35em',textTransform:'uppercase'}}>What People Say</p>
              <div style={{width:32,height:2,background:A}}/>
            </div>
            <h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2.2rem,5vw,3.5rem)',color:T.text,letterSpacing:'0.02em'}}>Reviews & Ratings</h2>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:16}}>
              {[1,2,3,4,5].map(i=><Star key={i} size={20} color='#f59e0b' fill='#f59e0b'/>)}
              <span style={{fontSize:20,fontWeight:800,color:T.text}}>4.8</span>
              <span style={{fontSize:13,color:T.muted}}>· 500+ reviews on Google</span>
            </div>
          </div>

          {/* Desktop — grid */}
          <div className="reviews-desktop" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16,marginBottom:48}}>
            {REVIEWS.map((r,i)=>(
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'22px 24px',position:'relative',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=A+'55';e.currentTarget.style.transform='translateY(-3px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform='none'}}>
                <Quote size={22} color={A+'44'} style={{position:'absolute',top:18,right:18}}/>
                <div style={{display:'flex',gap:3,marginBottom:12}}>{[1,2,3,4,5].map(s=><Star key={s} size={12} color='#f59e0b' fill='#f59e0b'/>)}</div>
                <p style={{margin:'0 0 16px',fontSize:13,color:T.muted,lineHeight:1.75,fontStyle:'italic'}}>"{r.text}"</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:A+'22',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:13,fontWeight:800,color:A}}>{r.name[0]}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:T.text}}>{r.name}</span>
                  </div>
                  <span style={{fontSize:9,fontWeight:700,color:T.muted,letterSpacing:'0.15em',textTransform:'uppercase',background:T.border,padding:'3px 8px',borderRadius:6}}>{r.platform}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile — carousel */}
          <div className="reviews-mobile" style={{display:'none',marginBottom:32}}>
            <div style={{position:'relative'}}>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'22px 24px',position:'relative',minHeight:180}}>
                <Quote size={22} color={A+'44'} style={{position:'absolute',top:18,right:18}}/>
                <div style={{display:'flex',gap:3,marginBottom:12}}>{[1,2,3,4,5].map(s=><Star key={s} size={12} color='#f59e0b' fill='#f59e0b'/>)}</div>
                <p style={{margin:'0 0 16px',fontSize:13,color:T.muted,lineHeight:1.75,fontStyle:'italic'}}>"{REVIEWS[reviewIdx].text}"</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:A+'22',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:13,fontWeight:800,color:A}}>{REVIEWS[reviewIdx].name[0]}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:T.text}}>{REVIEWS[reviewIdx].name}</span>
                  </div>
                  <span style={{fontSize:9,fontWeight:700,color:T.muted,letterSpacing:'0.15em',textTransform:'uppercase',background:T.border,padding:'3px 8px',borderRadius:6}}>{REVIEWS[reviewIdx].platform}</span>
                </div>
              </div>
              {/* Nav */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:16,padding:'0 4px'}}>
                <button onClick={()=>setReviewIdx(i=>Math.max(0,i-1))} disabled={reviewIdx===0}
                  style={{background:'none',border:`1px solid ${T.border}`,borderRadius:'50%',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:reviewIdx===0?'default':'pointer',color:reviewIdx===0?T.border:T.text,transition:'all 0.2s'}}
                  onMouseEnter={e=>{if(reviewIdx>0){e.currentTarget.style.borderColor=A;e.currentTarget.style.color=A}}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=reviewIdx===0?T.border:T.text}}>
                  <ChevronLeft size={16}/>
                </button>
                <div style={{display:'flex',gap:6}}>
                  {REVIEWS.map((_,i)=>(
                    <div key={i} onClick={()=>setReviewIdx(i)}
                      style={{width:i===reviewIdx?20:7,height:7,borderRadius:4,background:i===reviewIdx?A:T.border,transition:'all 0.3s',cursor:'pointer'}}/>
                  ))}
                </div>
                <button onClick={()=>setReviewIdx(i=>Math.min(REVIEWS.length-1,i+1))} disabled={reviewIdx===REVIEWS.length-1}
                  style={{background:'none',border:`1px solid ${T.border}`,borderRadius:'50%',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:reviewIdx===REVIEWS.length-1?'default':'pointer',color:reviewIdx===REVIEWS.length-1?T.border:T.text,transition:'all 0.2s'}}
                  onMouseEnter={e=>{if(reviewIdx<REVIEWS.length-1){e.currentTarget.style.borderColor=A;e.currentTarget.style.color=A}}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=reviewIdx===REVIEWS.length-1?T.border:T.text}}>
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
          </div>

          <div style={{textAlign:'center'}}>
            <a href="https://www.google.com/search?q=Hotel+de+Plaza+Colombo+reviews" target="_blank" rel="noopener noreferrer"
              style={{display:'inline-flex',alignItems:'center',gap:8,background:'none',border:`1px solid ${T.border}`,borderRadius:12,padding:'12px 28px',color:T.text,textDecoration:'none',fontSize:13,fontWeight:700,transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=A;e.currentTarget.style.color=A}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.text}}>
              <Star size={14}/> Read all reviews on Google
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{padding:'100px clamp(20px,6vw,80px)',background:dark?'#0d0d0d':'#faf6f1'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:48}}>
            <div style={{width:32,height:2,background:A}}/>
            <p style={{margin:0,fontSize:10,fontWeight:800,color:A,letterSpacing:'0.35em',textTransform:'uppercase'}}>Find Us</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:32}}>
            <div style={{display:'flex',flexDirection:'column',gap:24}}>
              <h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(2rem,4vw,3rem)',color:T.text,lineHeight:1.1}}>Come Visit Us.<br/>We're Always Open.</h2>
              {[
                {icon:<MapPin size={16} color={A}/>,title:'Address',content:'329 Galle Road, Kollupitiya, Colombo 03',href:'https://maps.app.goo.gl/dWGjmbBqn9FLYdxe9'},
                {icon:<Phone size={16} color={A}/>,title:'Phone',content:'011 485 2600  /  +94 77 235 6969',href:'tel:+94772356969'},
                {icon:<Clock size={16} color={A}/>,title:'Hours',content:'Open 24 Hours · 7 Days · Never Closes',href:null},
              ].map((item,i)=>(
                <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                  <div style={{width:40,height:40,borderRadius:12,background:A+'18',border:`1px solid ${A}33`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{item.icon}</div>
                  <div>
                    <p style={{margin:'0 0 3px',fontSize:10,fontWeight:700,color:T.muted,letterSpacing:'0.2em',textTransform:'uppercase'}}>{item.title}</p>
                    {item.href
                      ?<a href={item.href} target="_blank" rel="noopener noreferrer" style={{color:T.text,textDecoration:'none',fontSize:14,fontWeight:600,lineHeight:1.5}} onMouseEnter={e=>e.currentTarget.style.color=A} onMouseLeave={e=>e.currentTarget.style.color=T.text}>{item.content}</a>
                      :<p style={{margin:0,fontSize:14,fontWeight:600,color:T.text,lineHeight:1.5,display:'flex',alignItems:'center',gap:6}}><span style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 6px #22c55e',display:'inline-block'}}/>{item.content}</p>
                    }
                  </div>
                </div>
              ))}
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <a href={`https://wa.me/${WHATSAPP_NUM}?text=${WHATSAPP_MSG}`} target="_blank" rel="noopener noreferrer" style={{background:'#25D366',color:'#fff',textDecoration:'none',borderRadius:10,padding:'10px 20px',fontSize:12,fontWeight:800,display:'flex',alignItems:'center',gap:6}}>WhatsApp Us</a>
                <a href={UBER_EATS_URL} target="_blank" rel="noopener noreferrer" style={{background:A,color:'#fff',textDecoration:'none',borderRadius:10,padding:'10px 20px',fontSize:12,fontWeight:800,display:'flex',alignItems:'center',gap:6}}><ShoppingBag size={13}/> Order Online</a>
              </div>
            </div>
            <div style={{borderRadius:20,overflow:'hidden',border:`1px solid ${T.border}`,minHeight:320,boxShadow:T.shadow}}>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798462681601!2d79.8493!3d6.9022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2591614349b0f%3A0x8e34b0cc8e9e5d6d!2s329%20Galle%20Rd%2C%20Colombo%2000300%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1710000000000"
                width="100%" height="100%" style={{border:0,minHeight:320,display:'block',filter:dark?'invert(90%) hue-rotate(180deg)':'none'}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:'#000000',color:'#f0ece6'}}>
        <div style={{height:3,background:`linear-gradient(90deg,transparent,${A},transparent)`}}/>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'60px clamp(20px,5vw,40px) 0',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:48}}>
          <div>
            <img src={logoImg} alt="Hotel de Plaza" style={{height:110,objectFit:'contain',marginBottom:18}}/>
            <p style={{color:'rgba(255,255,255,0.35)',fontSize:12,lineHeight:1.9,maxWidth:220,marginBottom:20}}>Colombo's original late-night kottu spot.<br/>Est. 2009 · One location, no branches.</p>
            <div style={{display:'flex',gap:3,marginBottom:20}}>{[1,2,3,4,5].map(i=><Star key={i} size={12} color={A} fill={A}/>)}<span style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginLeft:6,fontWeight:600}}>4.8 on Google</span></div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[{href:'https://web.facebook.com/hoteldeplaza',label:'f',title:'Facebook'},{href:'https://www.instagram.com/hotelde.plaza/',label:'in',title:'Instagram'},{href:'https://www.tiktok.com/@plazahote3',label:'tt',title:'TikTok'},{href:`https://wa.me/${WHATSAPP_NUM}`,label:'wa',title:'WhatsApp'},{href:'https://tripadvisor.com',label:'TA',title:'TripAdvisor'},{href:'https://g.page/r/hoteldeplaza',label:'G',title:'Google Reviews'}].map((s,i)=>(
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                  style={{width:34,height:34,borderRadius:9,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.4)',textDecoration:'none',fontSize:10,fontWeight:900,transition:'all 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background=A;e.currentTarget.style.color='#fff';e.currentTarget.style.borderColor=A;e.currentTarget.style.transform='translateY(-2px)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='rgba(255,255,255,0.4)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.transform='none'}}
                >{s.label}</a>
              ))}
            </div>
          </div>
          <div>
            <p style={{color:A,fontSize:9,fontWeight:800,letterSpacing:'0.35em',textTransform:'uppercase',marginBottom:22}}>Quick Links</p>
            <div style={{display:'flex',flexDirection:'column',gap:13}}>
              {[{label:'Full Menu',action:()=>navigate('/menu')},{label:'About Us',action:()=>setModal('about')},{label:'Contact Us',action:()=>setModal('contact')},{label:'Order on Uber Eats',href:UBER_EATS_URL},{label:'WhatsApp Order',href:`https://wa.me/${WHATSAPP_NUM}?text=${WHATSAPP_MSG}`},{label:'Find Us on Maps',href:'https://maps.app.goo.gl/dWGjmbBqn9FLYdxe9'}].map((l,i)=>l.href?(
                <a key={i} href={l.href} target={l.href.startsWith('#')?'_self':'_blank'} rel="noopener noreferrer" style={{color:'rgba(255,255,255,0.35)',fontSize:13,textDecoration:'none',fontWeight:500,transition:'all 0.18s'}}
                  onMouseEnter={e=>{e.currentTarget.style.color=A;e.currentTarget.style.paddingLeft='6px'}}
                  onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.35)';e.currentTarget.style.paddingLeft='0'}}
                >{l.label}</a>
              ):(
                <button key={i} onClick={l.action} style={{background:'none',border:'none',color:'rgba(255,255,255,0.35)',fontSize:13,fontWeight:500,cursor:'pointer',textAlign:'left',padding:0,fontFamily:"'DM Sans',sans-serif",transition:'all 0.18s'}}
                  onMouseEnter={e=>{e.currentTarget.style.color=A;e.currentTarget.style.paddingLeft='6px'}}
                  onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.35)';e.currentTarget.style.paddingLeft='0'}}
                >{l.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{color:A,fontSize:9,fontWeight:800,letterSpacing:'0.35em',textTransform:'uppercase',marginBottom:22}}>Contact Us</p>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <p style={{margin:'0 0 4px',fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'0.2em',textTransform:'uppercase'}}>Phone</p>
                <a href="tel:0114852600" style={{display:'block',color:'rgba(255,255,255,0.7)',textDecoration:'none',fontWeight:700,fontFamily:'monospace',fontSize:15,marginBottom:4}}>011 485 2600</a>
                <a href="tel:+94772356969" style={{display:'block',color:'rgba(255,255,255,0.7)',textDecoration:'none',fontWeight:700,fontFamily:'monospace',fontSize:15}}>+94 77 235 6969</a>
              </div>
              <div>
                <p style={{margin:'0 0 6px',fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:'0.2em',textTransform:'uppercase'}}>Hours</p>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 6px #22c55e'}}/>
                  <span style={{color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600}}>Open 24/7 — Never Closes</span>
                </div>
              </div>
              <a href="https://maps.app.goo.gl/dWGjmbBqn9FLYdxe9" target="_blank" rel="noopener noreferrer" style={{color:'rgba(255,255,255,0.4)',fontSize:12,lineHeight:1.8,textDecoration:'none',display:'flex',alignItems:'flex-start',gap:7}}
                onMouseEnter={e=>e.currentTarget.style.color=A} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
                <MapPin size={12} color={A} style={{marginTop:2,flexShrink:0}}/>
                <span>329 Galle Road, Colombo 03<br/>Near Galle Face Green</span>
              </a>
            </div>
          </div>
        </div>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'20px clamp(20px,5vw,40px)',borderTop:'1px solid rgba(255,255,255,0.05)',marginTop:48,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10}}>
          <p style={{color:'rgba(255,255,255,0.15)',fontSize:11,margin:0}}>© {new Date().getFullYear()} Hotel de Plaza · 329 Galle Road, Kollupitiya, Colombo 03</p>
          <a href="https://nihmathullah.com/web-services" target="_blank" rel="noopener noreferrer"
            style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none',transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.7'}
          >
            <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'6px 14px',display:'flex',alignItems:'center',gap:7,opacity:0.7,transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=A;e.currentTarget.style.background=A+'22';e.currentTarget.style.opacity='1'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';e.currentTarget.style.background='rgba(255,255,255,0.08)';e.currentTarget.style.opacity='0.7'}}>
              <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.4)',letterSpacing:'0.15em',textTransform:'uppercase'}}>Designed &amp; Built by</span>
              <span style={{fontSize:13,fontWeight:800,color:'rgba(255,255,255,0.8)',letterSpacing:'0.05em'}}>NWS</span>
            </div>
          </a>
        </div>
      </footer>
      {/* ── PROMOTION BANNER + POPUP ── */}
      {promoBanner && promos.length>0 && !promoOpen && (
        <PromoBanner
          promo={promos[promoIdx]}
          total={promos.length}
          idx={promoIdx}
          onNext={()=>setPromoIdx(i=>(i+1)%promos.length)}
          onPrev={()=>setPromoIdx(i=>(i-1+promos.length)%promos.length)}
          onExpand={()=>{ setPromoOpen(true); sessionStorage.setItem('hdp_promos_seen','1') }}
          onClose={()=>{ setPromoBanner(false); sessionStorage.setItem('hdp_promos_seen','1') }}
        />
      )}
      {promoOpen && promos[promoIdx] && (
        <PromoPopup promo={promos[promoIdx]} onClose={()=>setPromoOpen(false)}/>
      )}

      {/* ── FLOATING ── */}
      <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{position:'fixed',bottom:90,right:24,zIndex:90,background:A,color:'#fff',border:'none',borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',opacity:scrolled?1:0,transform:scrolled?'scale(1)':'scale(0.6)',transition:'all 0.3s',pointerEvents:scrolled?'auto':'none',boxShadow:`0 4px 20px ${A}66`}}>
        <ChevronUp size={18}/>
      </button>
      <a href={`https://wa.me/${WHATSAPP_NUM}?text=${WHATSAPP_MSG}`} target="_blank" rel="noopener noreferrer" style={{position:'fixed',bottom:24,right:24,zIndex:91,background:'#25D366',borderRadius:'50%',width:54,height:54,display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',boxShadow:'0 4px 20px rgba(37,211,102,0.4)',transition:'transform 0.3s'}}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* Contact Modal */}
      {modal==='contact'&&(
        <div onClick={e=>e.target===e.currentTarget&&setModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:dark?'#141414':'#fff',border:`1px solid ${T.border}`,borderRadius:24,padding:36,maxWidth:560,width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <h2 style={{margin:0,fontSize:22,fontWeight:800,color:T.text}}>Contact Us</h2>
              <button onClick={()=>setModal(null)} style={{background:'none',border:'none',cursor:'pointer',color:T.muted}}><X size={20}/></button>
            </div>

            {/* Info blocks */}
            <div style={{display:'flex',flexDirection:'column',gap:18,marginBottom:28}}>
              {[
                {icon:<MapPin size={16} color={A}/>,title:'Address',content:'329 Galle Road, Kollupitiya, Colombo 03',href:'https://maps.app.goo.gl/dWGjmbBqn9FLYdxe9'},
                {icon:<Phone size={16} color={A}/>,title:'Phone',content:'011 485 2600  ·  +94 77 235 6969',href:'tel:+94772356969'},
                {icon:<Clock size={16} color={A}/>,title:'Hours',content:'Open 24 Hours · 7 Days · Never Closes',href:null},
              ].map((item,i)=>(
                <div key={i} style={{display:'flex',gap:14,alignItems:'flex-start',padding:'14px 16px',background:dark?'#1a1a1a':'#f7f3ee',borderRadius:14,border:`1px solid ${T.border}`}}>
                  <div style={{width:38,height:38,borderRadius:10,background:A+'18',border:`1px solid ${A}33`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{item.icon}</div>
                  <div>
                    <p style={{margin:'0 0 3px',fontSize:9,fontWeight:700,color:T.muted,letterSpacing:'0.2em',textTransform:'uppercase'}}>{item.title}</p>
                    {item.href
                      ?<a href={item.href} target="_blank" rel="noopener noreferrer" style={{color:T.text,textDecoration:'none',fontSize:14,fontWeight:600}}
                          onMouseEnter={e=>e.currentTarget.style.color=A} onMouseLeave={e=>e.currentTarget.style.color=T.text}>{item.content}</a>
                      :<p style={{margin:0,fontSize:14,fontWeight:600,color:T.text,display:'flex',alignItems:'center',gap:6}}>
                          <span style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 6px #22c55e',display:'inline-block',animation:'pulse 2s infinite'}}/>{item.content}
                        </p>
                    }
                  </div>
                </div>
              ))}
            </div>

            {/* Map embed */}
            <div style={{borderRadius:16,overflow:'hidden',border:`1px solid ${T.border}`,marginBottom:24,height:220}}>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798462681601!2d79.8493!3d6.9022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2591614349b0f%3A0x8e34b0cc8e9e5d6d!2s329%20Galle%20Rd%2C%20Colombo%2000300%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1710000000000"
                width="100%" height="220" style={{border:0,display:'block',filter:dark?'invert(90%) hue-rotate(180deg)':'none'}}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
            </div>

            {/* Action buttons */}
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <a href={`https://wa.me/${WHATSAPP_NUM}?text=${WHATSAPP_MSG}`} target="_blank" rel="noopener noreferrer"
                style={{flex:1,background:'#25D366',color:'#fff',textDecoration:'none',borderRadius:12,padding:'12px 20px',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                WhatsApp Us
              </a>
              <a href={UBER_EATS_URL} target="_blank" rel="noopener noreferrer"
                style={{flex:1,background:A,color:'#fff',textDecoration:'none',borderRadius:12,padding:'12px 20px',fontSize:13,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                <ShoppingBag size={14}/> Order Online
              </a>
            </div>
          </div>
        </div>
      )}


      {/* About Modal */}
      {modal==='about'&&(
        <div onClick={e=>e.target===e.currentTarget&&setModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:dark?'#141414':'#fff',border:`1px solid ${T.border}`,borderRadius:24,padding:36,maxWidth:520,width:'100%',maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <h2 style={{margin:0,fontSize:22,fontWeight:800,color:T.text}}>About Hotel de Plaza</h2>
              <button onClick={()=>setModal(null)} style={{background:'none',border:'none',cursor:'pointer',color:T.muted}}><X size={20}/></button>
            </div>
            <img src={logoImg} alt="" style={{height:64,marginBottom:20}}/>
            <p style={{color:T.muted,fontSize:13,lineHeight:1.9,marginBottom:14}}>Founded in 2009, Hotel de Plaza has been Colombo's most beloved late-night dining destination for over 15 years. Located at 329 Galle Road, Kollupitiya, we operate 24 hours a day, 7 days a week — never closing.</p>
            <p style={{color:T.muted,fontSize:13,lineHeight:1.9,marginBottom:14}}>We're best known for our 30+ varieties of kottu, but our menu spans 265+ items — from string hoppers to biryani, Indian curries to desserts. One kitchen. One location. No franchises.</p>
            <p style={{color:T.muted,fontSize:13,lineHeight:1.9}}>Whether it's your midnight craving or your Sunday family lunch — we're always here.</p>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#0a0a0a;overflow-x:hidden}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes promoBannerIn{0%{opacity:0;transform:translateX(-40px) scale(0.9)}60%{transform:translateX(4px) scale(1.02)}100%{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes promoGlow{0%,100%{opacity:0.08}50%{opacity:0.22}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes promoPulse{0%,100%{opacity:0.18}50%{opacity:0.28}}
        @keyframes promoDot{0%,100%{box-shadow:0 0 4px #e85b25}50%{box-shadow:0 0 10px #e85b25,0 0 20px rgba(232,91,37,0.4)}}
        @keyframes promoBannerIn{0%{opacity:0;transform:translateX(-40px) scale(0.9)}60%{transform:translateX(6px) scale(1.02)}100%{opacity:1;transform:translateX(0) scale(1)}}
        @keyframes promoGlow{0%,100%{box-shadow:0 0 12px #e85b2533}50%{box-shadow:0 0 28px #e85b2566,0 0 48px #e85b2522}}
        @keyframes promoShimmer{0%{left:-100%}60%,100%{left:200%}}
        @keyframes promoPulse{0%,100%{box-shadow:0 0 0 1px #e85b2544,0 0 16px #e85b2522}50%{box-shadow:0 0 0 2px #e85b2566,0 0 28px #e85b2544}}
        @keyframes promoPulse{0%,100%{box-shadow:0 0 0 1px #e85b2533,0 0 18px #e85b2518}50%{box-shadow:0 0 0 2px #e85b2555,0 0 28px #e85b2533}}
        @keyframes promoDot{0%,100%{opacity:1;box-shadow:0 0 6px #e85b25}50%{opacity:0.6;box-shadow:0 0 12px #e85b25}}
        @keyframes promoPulse{0%,100%{box-shadow:0 0 0 1px #e85b2533,0 0 16px #e85b2522}50%{box-shadow:0 0 0 2px #e85b2555,0 0 28px #e85b2544}}
        @keyframes promoBannerIn{from{opacity:0;transform:translateY(30px) scale(0.85)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes promoGlow{0%,100%{box-shadow:0 0 10px rgba(232,91,37,0.3)}50%{box-shadow:0 0 22px rgba(232,91,37,0.7)}}
        @keyframes promoRing{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.8;transform:scale(1.08)}}
        @keyframes promoDot{0%,100%{box-shadow:0 0 4px #e85b25;opacity:1}50%{box-shadow:0 0 10px #e85b25;opacity:0.6}}
        @keyframes promoBannerIn{from{opacity:0;transform:translateY(32px) scale(0.92)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes promoPulse{0%,100%{opacity:0.08}50%{opacity:0.18}}
        @keyframes promoDot{0%,100%{box-shadow:0 0 4px #e85b25;opacity:1}50%{box-shadow:0 0 10px #e85b25;opacity:0.7}}
        @keyframes promoPulse{0%,100%{box-shadow:0 0 0 1px #e85b2533,0 0 18px #e85b2522}50%{box-shadow:0 0 0 1px #e85b2555,0 0 28px #e85b2544}}
        @keyframes promoDot{0%,100%{opacity:1;box-shadow:0 0 6px #e85b25}50%{opacity:0.5;box-shadow:0 0 12px #e85b25}}
        @keyframes promoPulse{0%,100%{box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 20px rgba(232,91,37,0.08)}50%{box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 28px rgba(232,91,37,0.2)}}
        @keyframes slideUpFade{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{opacity:.8;box-shadow:0 0 0 6px rgba(34,197,94,0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes promoPulse{0%,100%{opacity:0.18}50%{opacity:0.28}}
        @keyframes promoDot{0%,100%{box-shadow:0 0 4px #e85b25}50%{box-shadow:0 0 10px #e85b25,0 0 20px rgba(232,91,37,0.4)}}
        @keyframes promoPulse{0%,100%{box-shadow:0 0 0 1px #e85b2544,0 0 16px #e85b2522}50%{box-shadow:0 0 0 2px #e85b2566,0 0 28px #e85b2544}}
        @keyframes promoPulse{0%,100%{box-shadow:0 0 0 1px #e85b2533,0 0 16px #e85b2522}50%{box-shadow:0 0 0 2px #e85b2555,0 0 28px #e85b2544}}
        @keyframes promoPulse{0%,100%{box-shadow:0 0 0 1px #e85b2533,0 0 18px #e85b2522}50%{box-shadow:0 0 0 1px #e85b2555,0 0 28px #e85b2544}}
        @keyframes promoDot{0%,100%{opacity:1;box-shadow:0 0 6px #e85b25}50%{opacity:0.5;box-shadow:0 0 12px #e85b25}}
        @keyframes promoPulse{0%,100%{box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 20px rgba(232,91,37,0.08)}50%{box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 28px rgba(232,91,37,0.2)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
        @keyframes slideUpFade{from{opacity:0;transform:translate(-50%,20px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUpBanner{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
        .nav-desktop{display:flex}.nav-mobile{display:none}
        /* Fix favicon dynamically */
        .reviews-mobile{display:none!important}
        .reviews-desktop{display:grid}
        @media(max-width:768px){
          .nav-desktop{display:none!important}
          .nav-mobile{display:flex!important}
          .reviews-mobile{display:block!important}
          .reviews-desktop{display:none!important}
        }
      `}</style>
    </div>
  )
}