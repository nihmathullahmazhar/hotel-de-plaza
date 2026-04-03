import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import logoImg from './assets/img/logo.png'
import {
  LogOut, Plus, Edit2, Trash2, Archive, RotateCcw,
  ChevronUp, ChevronDown, Save, X, Check,
  Users, Menu, LayoutGrid, Star,
  AlertCircle, Upload, Shield, UserPlus,
  Flame, Package, ToggleRight,
  Utensils, Tag, DollarSign, FolderOpen, Info, Bell, Clock,
  Megaphone, ImageIcon, MessageCircle, Calendar, Eye, EyeOff, Link
} from 'lucide-react';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const fmt = n => `Rs.${Number(n || 0).toLocaleString()}`;
const uid = () => Math.random().toString(36).slice(2);

const T = {
  bg:      '#0c0c0c', surface: '#141414', card: '#1a1a1a',
  border:  '#262626', text: '#f0ece6',    muted: '#666',
  accent:  '#e85b25', green: '#22c55e',   red: '#ef4444', blue: '#3b82f6',
};

const TAG_DISPLAY = {
  best_seller:   { label:'Best Seller',    color:'#e85b25' },
  new_item:      { label:'New Item',       color:'#3b82f6' },
  fast_moving:   { label:'Fast Moving',    color:'#f59e0b' },
  chefs_special: { label:"Chef's Special", color:'#8b5cf6' },
  seasonal:      { label:'Seasonal',       color:'#22c55e' },
};

const ITEM_TAGS = Object.entries(TAG_DISPLAY).map(([key, v]) => ({ key, ...v }));

// ── Notification Store ───────────────────────────────────────
// Simple in-memory activity log (persisted to localStorage)
const NOTIF_KEY = 'hdp_activity_log';
const MAX_NOTIFS = 50;

function loadNotifs() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); } catch { return []; }
}
function saveNotifs(list) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, MAX_NOTIFS))); } catch {}
}

let _notifListeners = [];
let _notifs = loadNotifs();

function addNotif(msg, type='info') {
  const entry = { id: Date.now() + Math.random(), msg, type, time: new Date().toISOString() };
  _notifs = [entry, ..._notifs].slice(0, MAX_NOTIFS);
  saveNotifs(_notifs);
  _notifListeners.forEach(fn => fn([..._notifs]));
}

function useNotifs() {
  const [notifs, setNotifs] = useState([..._notifs]);
  useEffect(() => {
    _notifListeners.push(setNotifs);
    return () => { _notifListeners = _notifListeners.filter(fn => fn !== setNotifs); };
  }, []);
  const clear = () => {
    _notifs = [];
    saveNotifs([]);
    _notifListeners.forEach(fn => fn([]));
  };
  return { notifs, clear };
}


// ── UI primitives ────────────────────────────────────────────
const Btn = ({ children, onClick, variant='primary', size='md', disabled, style={}, ...p }) => {
  const base = {
    display:'flex', alignItems:'center', gap:6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border:'none', borderRadius:10, fontFamily:"'DM Sans',sans-serif",
    fontWeight:700, letterSpacing:'0.05em', transition:'all 0.18s',
    opacity: disabled ? 0.45 : 1,
    padding: size==='sm' ? '6px 14px' : size==='lg' ? '14px 28px' : '10px 20px',
    fontSize: size==='sm' ? 11 : 13,
    ...(variant==='primary' ? { background:T.accent, color:'#fff' } : {}),
    ...(variant==='ghost'   ? { background:'transparent', color:T.muted, border:`1px solid ${T.border}` } : {}),
    ...(variant==='danger'  ? { background:'transparent', color:T.red,   border:`1px solid ${T.red}44`  } : {}),
    ...(variant==='success' ? { background:T.green, color:'#fff' } : {}),
    ...style,
  };
  return <button onClick={onClick} disabled={disabled} style={base} {...p}>{children}</button>;
};

const Tag2 = ({ children, color=T.accent }) => (
  <span style={{ background:color+'22', color, border:`1px solid ${color}44`, borderRadius:999, padding:'2px 10px', fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase' }}>
    {children}
  </span>
);

const Field = ({ label, children, error }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
    {label && <label style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:'0.15em', textTransform:'uppercase' }}>{label}</label>}
    {children}
    {error && <p style={{ fontSize:11, color:T.red, margin:0 }}>{error}</p>}
  </div>
);

const Input = ({ style={}, ...p }) => (
  <input style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', fontSize:13, color:T.text, outline:'none', fontFamily:"'DM Sans',sans-serif", width:'100%', boxSizing:'border-box', ...style }} {...p} />
);

const Select = ({ children, style={}, ...p }) => (
  <select style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', fontSize:13, color:T.text, outline:'none', fontFamily:"'DM Sans',sans-serif", width:'100%', boxSizing:'border-box', ...style }} {...p}>{children}</select>
);

const Toggle = ({ value, onChange, label }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => onChange(!value)}>
    <div style={{ width:42, height:24, borderRadius:999, background:value ? T.green : T.border, position:'relative', transition:'background 0.2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:value ? 21 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }} />
    </div>
    {label && <span style={{ fontSize:13, color:value ? T.text : T.muted, fontWeight:600 }}>{label}</span>}
  </div>
);

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e => e.target===e.currentTarget && onClose()}>
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, width:'100%', maxWidth:wide?720:520, maxHeight:'90vh', overflowY:'auto', padding:28 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:T.text }}>{title}</h2>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:T.muted }}><X size={20}/></button>
      </div>
      {children}
    </div>
  </div>
);

const Toast = ({ msg, type='success' }) => msg ? (
  <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', zIndex:999, background:type==='success'?T.green:T.red, color:'#fff', padding:'12px 24px', borderRadius:12, fontSize:13, fontWeight:700, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', display:'flex', alignItems:'center', gap:8 }}>
    {type==='success' ? <Check size={14}/> : <AlertCircle size={14}/>} {msg}
  </div>
) : null;

// ── Tooltip ──────────────────────────────────────────────────
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:'relative', display:'inline-flex' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)', background:'#1a1a1a', border:`1px solid ${T.border}`, borderRadius:8, padding:'6px 10px', fontSize:11, color:T.text, whiteSpace:'nowrap', zIndex:999, boxShadow:'0 4px 16px rgba(0,0,0,0.4)', pointerEvents:'none', maxWidth:220, textAlign:'center', lineHeight:1.5 }}>
          {text}
          <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:`5px solid ${T.border}` }} />
        </div>
      )}
    </div>
  );
}

// ── Reusable Availability Toggle ────────────────────────────
function AvailToggle({ item, onDone }) {
  const [loading, setLoading] = useState(false);
  const toggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    await supabase.from('menu_items').update({ available: !item.available }).eq('id', item.id);
    setLoading(false);
    onDone();
  };
  return (
    <Tooltip text={item.available ? 'Available — click to mark unavailable' : 'Unavailable — click to mark available'}>
      <div onClick={toggle} style={{ cursor: loading ? 'wait' : 'pointer', display:'flex', alignItems:'center', gap:6, opacity: loading ? 0.5 : 1 }}>
        <div style={{
          width:11, height:11, borderRadius:'50%', flexShrink:0,
          background: item.available ? '#22c55e' : '#ef4444',
          boxShadow: item.available ? '0 0 8px #22c55e99' : '0 0 8px #ef444499',
          transition:'all 0.2s',
        }}/>
        <span style={{ fontSize:10, fontWeight:700, color: item.available ? '#22c55e' : '#ef4444', textTransform:'uppercase', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>
          {item.available ? 'Available' : 'Unavailable'}
        </span>
      </div>
    </Tooltip>
  );
}

// ── Reusable Featured Toggle ─────────────────────────────────
function FeaturedToggle({ item, onDone }) {
  const toggle = async (e) => {
    e.stopPropagation();
    await supabase.from('menu_items').update({ featured: !item.featured }).eq('id', item.id);
    onDone();
  };
  return (
    <Tooltip text={item.featured ? 'Featured — click to remove' : 'Click to feature on homepage'}>
      <div onClick={toggle} style={{ cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Star size={15} color={item.featured ? '#e85b25' : '#262626'} fill={item.featured ? '#e85b25' : 'transparent'}/>
      </div>
    </Tooltip>
  );
}

// ── Reusable Row Actions ─────────────────────────────────────
// Use this on every table row: availability + edit + delete
function RowActions({ item, onEdit, reload, showToast, compact=false }) {
  const archiveItem = async (e) => {
    e.stopPropagation();
    if (!confirm('Archive this item? It will be hidden from the menu.')) return;
    await supabase.from('menu_items').update({ archived: true }).eq('id', item.id);
    showToast('Item archived'); reload();
  };

  const deleteItem = async (e) => {
    e.stopPropagation();
    if (!confirm('Permanently DELETE this item? This cannot be undone.')) return;
    await supabase.from('menu_items').delete().eq('id', item.id);
    showToast('Item deleted'); reload();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
      {/* Availability on top */}
      <AvailToggle item={item} onDone={reload}/>
      {/* Edit / Archive / Delete in a row */}
      <div style={{ display:'flex', gap:4 }}>
        <Tooltip text="Edit full details">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{ background:'transparent', border:`1px solid ${T.border}`, borderRadius:7, padding:'5px 8px', cursor:'pointer', color:T.text, display:'flex', alignItems:'center', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#e85b25'; e.currentTarget.style.color='#e85b25'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.text; }}>
            <Edit2 size={11}/>
          </button>
        </Tooltip>
        <Tooltip text="Archive — hide from menu (restorable)">
          <button onClick={archiveItem}
            style={{ background:'transparent', border:`1px solid ${T.border}`, borderRadius:7, padding:'5px 8px', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#f59e0b'; e.currentTarget.style.color='#f59e0b'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.muted; }}>
            <Archive size={11}/>
          </button>
        </Tooltip>
        <Tooltip text="Permanently delete">
          <button onClick={deleteItem}
            style={{ background:'transparent', border:`1px solid ${T.border}`, borderRadius:7, padding:'5px 8px', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center', transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#ef4444'; e.currentTarget.style.color='#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.muted; }}>
            <Trash2 size={11}/>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

// ── Onboarding Banner ────────────────────────────────────────
function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('hdp_ob') === '1'; } catch { return false; }
  });
  if (dismissed) return null;
  const tips = [
    { icon:<Tag size={13} color={T.accent}/>,        title:'Tags',         desc:'Click "Add tag" on any row — saves instantly without opening edit.' },
    { icon:<DollarSign size={13} color={T.accent}/>, title:'Price',        desc:'Click the price to edit inline. Press Enter to save.' },
    { icon:<FolderOpen size={13} color={T.accent}/>, title:'Section',      desc:'Click section name under item name to move it instantly.' },
    { icon:<ToggleRight size={13} color={T.green}/>, title:'Availability', desc:'Green = visible to customers. Toggle to show/hide.' },
    { icon:<Star size={13} color={T.accent}/>,       title:'Featured',     desc:'Star = shows in Featured section on homepage.' },
    { icon:<Archive size={13} color={T.muted}/>,     title:'Archive',      desc:'Hides item from menu. Restore from Archived tab.' },
  ];
  return (
    <div style={{ background:T.accent+'0f', border:`1px solid ${T.accent}33`, borderRadius:14, padding:'16px 20px', marginBottom:20, position:'relative' }}>
      <button onClick={() => { setDismissed(true); try { localStorage.setItem('hdp_ob','1'); } catch{} }}
        style={{ position:'absolute', top:12, right:14, background:'none', border:'none', cursor:'pointer', color:T.muted, fontSize:20, lineHeight:1 }}>x</button>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <Info size={14} color={T.accent}/>
        <p style={{ margin:0, fontSize:13, fontWeight:800, color:T.text }}>Quick Actions Guide — manage items without opening the edit form</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:8 }}>
        {tips.map((tip,i) => (
          <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:9, padding:'10px 12px', display:'flex', gap:9, alignItems:'flex-start' }}>
            <div style={{ flexShrink:0, marginTop:1 }}>{tip.icon}</div>
            <div>
              <p style={{ margin:'0 0 2px', fontSize:12, fontWeight:800, color:T.text }}>{tip.title}</p>
              <p style={{ margin:0, fontSize:11, color:T.muted, lineHeight:1.6 }}>{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tag Legend ───────────────────────────────────────────────
function TagLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom:16 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:9, padding:'6px 14px', cursor:'pointer', color:T.muted, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6, fontFamily:"'DM Sans',sans-serif", transition:'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor=T.accent; e.currentTarget.style.color=T.accent; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.muted; }}
      >
        <Tag size={12}/> What do the tags mean? {open ? '▴' : '▾'}
      </button>
      {open && (
        <div style={{ marginTop:10, background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:10 }}>
          {[
            { key:'best_seller',   title:'Best Seller',    desc:'Your most popular items. Shown in the Best Seller tab on the homepage.' },
            { key:'new_item',      title:'New Item',       desc:'Recently added dishes. Highlighted so customers can discover new items.' },
            { key:'fast_moving',   title:'Fast Moving',    desc:'Items that sell quickly. Helps customers order before they run out.' },
            { key:'chefs_special', title:"Chef's Special", desc:'Recommended by the chef. Shown with a special badge on the menu.' },
            { key:'seasonal',      title:'Seasonal',       desc:'Limited time only — available at certain times or seasons.' },
          ].map(tag => {
            const cfg = TAG_DISPLAY[tag.key];
            if (!cfg) return null;
            return (
              <div key={tag.key} style={{ background:cfg.color+'10', border:`1px solid ${cfg.color}33`, borderRadius:10, padding:'10px 12px' }}>
                <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:800, color:cfg.color }}>{tag.title}</p>
                <p style={{ margin:0, fontSize:11, color:T.muted, lineHeight:1.6 }}>{tag.desc}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Item Row ─────────────────────────────────────────────────
function ItemRow({ item, isLast, onEdit, reload, showToast, COL, sections }) {
  const [showTagDrop,  setShowTagDrop]  = useState(false);
  const [showSecDrop,  setShowSecDrop]  = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceVal,     setPriceVal]     = useState(String(item.price_single || ''));
  const [priceMed,     setPriceMed]     = useState(String(item.price_medium || ''));
  const [priceLrg,     setPriceLrg]     = useState(String(item.price_large  || ''));
  const [localTags,    setLocalTags]    = useState(item.tags || []);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => { setLocalTags(item.tags || []); }, [JSON.stringify(item.tags)]);

  const priceDisplay = item.price_type==='single'
    ? fmt(item.price_single)
    : `${fmt(item.price_medium)} / ${fmt(item.price_large)}`;

  const toggle = async (field) => {
    await supabase.from('menu_items').update({ [field]: !item[field] }).eq('id', item.id);
    showToast(field==='available'
      ? (item.available ? 'Marked unavailable' : 'Marked available')
      : (item.featured  ? 'Removed from featured' : 'Marked as featured'));
    reload();
  };

  const archive = async () => {
    if (!confirm('Archive this item?')) return;
    await supabase.from('menu_items').update({ archived: true }).eq('id', item.id);
    showToast('Item archived'); reload();
  };

  const toggleTag = async (key) => {
    const newTags = localTags.includes(key) ? localTags.filter(t => t!==key) : [...localTags, key];
    setLocalTags(newTags);
    const { error } = await supabase.from('menu_items').update({ tags: newTags }).eq('id', item.id);
    if (error) { setLocalTags(item.tags || []); showToast('Failed to update tags', 'error'); }
    else { showToast('Tags updated'); reload(); }
  };

  const savePrice = async () => {
    setSaving(true);
    const payload = item.price_type==='single'
      ? { price_single: Number(priceVal) }
      : { price_medium: Number(priceMed), price_large: Number(priceLrg) };
    await supabase.from('menu_items').update(payload).eq('id', item.id);
    setSaving(false); setEditingPrice(false);
    showToast('Price updated'); reload();
  };

  const moveSection = async (secId) => {
    await supabase.from('menu_items').update({ section_id: secId }).eq('id', item.id);
    setShowSecDrop(false); showToast('Section updated'); reload();
  };

  const secName = sections.find(s => s.id===item.section_id)?.name || 'No section';

  return (
    <div className="item-row" style={{ display:'grid', gridTemplateColumns:`${COL.img}px 1fr ${COL.price}px ${COL.tags}px ${COL.feat}px ${COL.actions}px`, padding:'10px 16px', gap:12, alignItems:'center', borderBottom:isLast?'none':`1px solid ${T.border}`, transition:'background 0.15s', position:'relative' }}
      onMouseEnter={e => e.currentTarget.style.background='#1c1c1c'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}
    >
      {/* Thumbnail */}
      <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', background:T.surface, flexShrink:0, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {item.image_url ? <img src={item.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Utensils size={16} color={T.muted}/>}
      </div>

      {/* Name + section move */}
      <div style={{ minWidth:0 }}>
        <p style={{ margin:'0 0 3px', fontSize:13, fontWeight:600, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
        <div style={{ position:'relative', display:'inline-block' }}>
          <button onClick={() => { setShowSecDrop(s=>!s); setShowTagDrop(false); setEditingPrice(false); }}
            style={{ background:'none', border:'none', cursor:'pointer', color:T.muted, fontSize:10, fontWeight:700, padding:0, display:'flex', alignItems:'center', gap:3, letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:"'DM Sans',sans-serif" }}>
            {secName} <ChevronDown size={9}/>
          </button>
          {showSecDrop && (
            <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:300, background:'#1a1a1a', border:`1px solid ${T.border}`, borderRadius:12, padding:6, minWidth:180, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
              <p style={{ margin:'0 0 4px', padding:'4px 8px', fontSize:9, fontWeight:800, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>Move to section</p>
              {sections.map(sec => (
                <button key={sec.id} onClick={() => moveSection(sec.id)}
                  style={{ display:'block', width:'100%', textAlign:'left', padding:'7px 10px', background:item.section_id===sec.id?T.accent+'22':'transparent', color:item.section_id===sec.id?T.accent:T.text, border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:item.section_id===sec.id?800:500, fontFamily:"'DM Sans',sans-serif" }}>
                  {sec.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price inline edit */}
      <div style={{ position:'relative' }}>
        {editingPrice ? (
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {item.price_type==='single' ? (
              <input type="number" value={priceVal} onChange={e => setPriceVal(e.target.value)} autoFocus
                style={{ width:'100%', background:T.surface, border:`1px solid ${T.accent}`, borderRadius:7, padding:'5px 8px', fontSize:12, color:T.text, outline:'none', fontFamily:'monospace', boxSizing:'border-box' }}
                onKeyDown={e => { if(e.key==='Enter') savePrice(); if(e.key==='Escape') setEditingPrice(false); }}
              />
            ) : (
              <>
                <input type="number" value={priceMed} onChange={e => setPriceMed(e.target.value)} placeholder="Med" autoFocus
                  style={{ width:'100%', background:T.surface, border:`1px solid ${T.border}`, borderRadius:7, padding:'4px 7px', fontSize:11, color:T.text, outline:'none', fontFamily:'monospace', boxSizing:'border-box' }}/>
                <input type="number" value={priceLrg} onChange={e => setPriceLrg(e.target.value)} placeholder="Lrg"
                  style={{ width:'100%', background:T.surface, border:`1px solid ${T.accent}`, borderRadius:7, padding:'4px 7px', fontSize:11, color:T.text, outline:'none', fontFamily:'monospace', boxSizing:'border-box' }}
                  onKeyDown={e => { if(e.key==='Enter') savePrice(); if(e.key==='Escape') setEditingPrice(false); }}/>
              </>
            )}
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={savePrice} disabled={saving} style={{ flex:1, background:T.green, border:'none', borderRadius:6, padding:'4px', cursor:'pointer', color:'#fff', fontSize:10, fontWeight:800 }}>{saving?'...':'Save'}</button>
              <button onClick={() => setEditingPrice(false)} style={{ flex:1, background:T.border, border:'none', borderRadius:6, padding:'4px', cursor:'pointer', color:T.muted, fontSize:10, fontWeight:800 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <Tooltip text="Click to edit price inline">
            <button onClick={() => { setEditingPrice(true); setShowTagDrop(false); setShowSecDrop(false); }}
              style={{ background:'none', border:'none', cursor:'pointer', color:T.accent, fontSize:12, fontWeight:700, fontFamily:'monospace', padding:0, borderBottom:`1px dashed ${T.accent}44` }}>
              {priceDisplay}
            </button>
          </Tooltip>
        )}
      </div>

      {/* Availability — handled by RowActions */}

      {/* Tags dropdown */}
      <div style={{ position:'relative' }}>
        <button onClick={() => { setShowTagDrop(s=>!s); setShowSecDrop(false); setEditingPrice(false); }}
          style={{ background:showTagDrop?T.accent+'22':'transparent', border:`1px solid ${showTagDrop?T.accent:T.border}`, borderRadius:8, padding:'4px 10px', cursor:'pointer', color:T.muted, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', gap:5, transition:'all 0.15s', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}>
          {localTags.length > 0 ? <span style={{ color:T.accent, fontWeight:800 }}>{localTags.length} tag{localTags.length>1?'s':''}</span> : 'Add tag'}
          <ChevronDown size={9}/>
        </button>
        <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginTop:3 }}>
          {localTags.slice(0,2).map(t => {
            const cfg = TAG_DISPLAY[t];
            return cfg ? <span key={t} style={{ background:cfg.color+'20', color:cfg.color, border:`1px solid ${cfg.color}44`, borderRadius:5, padding:'1px 6px', fontSize:8, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase' }}>{cfg.label}</span> : null;
          })}
          {localTags.length > 2 && <span style={{ fontSize:8, color:T.muted, fontWeight:700 }}>+{localTags.length-2}</span>}
        </div>
        {showTagDrop && (
          <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:300, background:'#1a1a1a', border:`1px solid ${T.border}`, borderRadius:14, padding:10, width:220, boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}>
            <p style={{ margin:'0 0 8px', fontSize:9, fontWeight:800, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>Select all that apply</p>
            {ITEM_TAGS.map(({ key, label, color }) => (
              <div key={key} onClick={() => toggleTag(key)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:9, cursor:'pointer', background:localTags.includes(key)?color+'15':'transparent', transition:'background 0.15s', marginBottom:2 }}>
                <div style={{ width:16, height:16, borderRadius:5, border:`2px solid ${localTags.includes(key)?color:T.border}`, background:localTags.includes(key)?color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                  {localTags.includes(key) && <Check size={9} color="#fff"/>}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:localTags.includes(key)?color:T.text }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured */}
      <FeaturedToggle item={item} onDone={reload}/>

      {/* Actions — consistent: availability + edit + archive + delete */}
      <RowActions item={item} onEdit={onEdit} reload={reload} showToast={showToast}/>

      {/* Close dropdowns on outside click */}
      {(showTagDrop || showSecDrop) && (
        <div style={{ position:'fixed', inset:0, zIndex:299 }} onClick={() => { setShowTagDrop(false); setShowSecDrop(false); }}/>
      )}
    </div>
  );
}

// ── Menu Manager ─────────────────────────────────────────────
function MenuManager({ sections, items, reload, showToast }) {
  const [modal,  setModal]  = useState(null);
  const [search, setSearch] = useState('');

  const activeSections = sections.filter(s => !s.archived).sort((a,b) => a.display_order-b.display_order);
  const activeItems    = items.filter(it => !it.archived);

  const stats = {
    total:     activeItems.length,
    available: activeItems.filter(i => i.available).length,
    featured:  activeItems.filter(i => i.featured).length,
  };

  const filtered = activeItems.filter(it => !search || it.name.toLowerCase().includes(search.toLowerCase()));

  const grouped = activeSections.map(sec => ({
    section: sec,
    items: filtered.filter(it => it.section_id===sec.id),
  })).filter(g => g.items.length > 0);

  const uncategorised = filtered.filter(it => !it.section_id);

  const COL = { img:44, name:'auto', price:150, tags:180, feat:60, actions:220 };

  const COL_HEADERS = [
    { label:'',           tip: null },
    { label:'Item Name',  tip: 'Click the section name below the item to move it to a different section' },
    { label:'Price',      tip: 'Click the price to edit inline — press Enter to save' },
    { label:'Tags',       tip: 'Labels shown on public menu. Click the button to change tags instantly.' },
    { label:'Featured',   tip: 'Star = shown in Featured section on the homepage. Click to toggle.' },
    { label:'Actions',    tip: 'Toggle availability, edit full details, archive (hide), or permanently delete.' },
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Menu Items</h1>
          <p style={{ color:T.muted, fontSize:13, marginTop:4 }}>Manage all dishes and prices</p>
        </div>
        <Btn onClick={() => setModal('add')} size="lg"><Plus size={16}/> Add Item</Btn>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20, className:'stat-grid' }}>
        {[
          { label:'Total Items',  value:stats.total,     color:T.blue },
          { label:'Available',    value:stats.available, color:T.green },
          { label:'Featured',     value:stats.featured,  color:T.accent },
        ].map(s => (
          <div key={s.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <p style={{ margin:0, fontSize:28, fontWeight:800, color:s.color }}>{s.value}</p>
            <p style={{ margin:0, fontSize:11, color:T.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
          style={{ width:'100%', background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:'9px 14px', fontSize:13, color:T.text, outline:'none', boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif" }}/>
        {search && <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:T.muted, fontSize:18 }}>x</button>}
      </div>

      <OnboardingBanner />
      <TagLegend />

      {/* Table */}
      <div className="tbl-scroll">
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden', minWidth:700 }}>
        {/* Header */}
        <div style={{ display:'grid', gridTemplateColumns:`${COL.img}px 1fr ${COL.price}px ${COL.tags}px ${COL.feat}px ${COL.actions}px`, background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'10px 16px', gap:12, alignItems:'center' }}>
          {COL_HEADERS.map((h,i) => (
            h.tip ? (
              <Tooltip key={i} text={h.tip}>
                <p style={{ margin:0, fontSize:10, fontWeight:800, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'help', borderBottom:`1px dashed ${T.border}`, display:'inline' }}>{h.label} i</p>
              </Tooltip>
            ) : (
              <p key={i} style={{ margin:0, fontSize:10, fontWeight:800, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>{h.label}</p>
            )
          ))}
        </div>

        {grouped.length===0 && uncategorised.length===0 && (
          <div style={{ textAlign:'center', padding:'60px 0', opacity:.3 }}>
            <Package size={40} style={{ margin:'0 auto 12px' }}/>
            <p style={{ fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', fontSize:12 }}>No items found</p>
          </div>
        )}

        {grouped.map(({ section, items:secItems }, gi) => (
          <div key={section.id}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', background:T.accent+'12', borderTop:gi>0?`1px solid ${T.border}`:'none', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ width:3, height:16, background:T.accent, borderRadius:2 }}/>
              <p style={{ margin:0, fontSize:11, fontWeight:800, color:T.accent, letterSpacing:'0.25em', textTransform:'uppercase' }}>{section.name}</p>
              <span style={{ background:T.accent+'22', color:T.accent, borderRadius:999, padding:'1px 8px', fontSize:10, fontWeight:800 }}>{secItems.length}</span>
            </div>
            {secItems.map((item,ii) => (
              <ItemRow key={item.id} item={item} isLast={ii===secItems.length-1} onEdit={() => setModal(item)} reload={reload} showToast={showToast} COL={COL} sections={activeSections}/>
            ))}
          </div>
        ))}

        {uncategorised.length > 0 && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', background:T.muted+'18', borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }}>
              <p style={{ margin:0, fontSize:11, fontWeight:800, color:T.muted, letterSpacing:'0.25em', textTransform:'uppercase' }}>Uncategorised</p>
            </div>
            {uncategorised.map((item,ii) => (
              <ItemRow key={item.id} item={item} isLast={ii===uncategorised.length-1} onEdit={() => setModal(item)} reload={reload} showToast={showToast} COL={COL} sections={activeSections}/>
            ))}
          </div>
        )}
      </div>{/* end inner table */}
      </div>{/* end tbl-scroll */}

      {modal && (
        <ItemModal item={modal==='add'?null:modal} sections={activeSections} onClose={() => setModal(null)} reload={reload} showToast={showToast}/>
      )}
    </div>
  );
}

// ── Image Cropper ─────────────────────────────────────────────
function ImageCropper({ src, onCrop, onCancel }) {
  const canvasRef  = useRef();
  const [scale,    setScale]    = useState(1);
  const [offset,   setOffset]   = useState({ x:0, y:0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart,setDragStart]= useState({ x:0, y:0 });
  const imgRef     = useRef(new Image());
  const FRAME_W    = 400;
  const FRAME_H    = 300;

  useEffect(() => {
    imgRef.current.onload = () => draw();
    imgRef.current.src = src;
  }, [src]);

  useEffect(() => { draw(); }, [scale, offset]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current.complete) return;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    ctx.clearRect(0, 0, FRAME_W, FRAME_H);
    const baseScale = Math.max(FRAME_W / img.naturalWidth, FRAME_H / img.naturalHeight);
    const s = baseScale * scale;
    const w = img.naturalWidth  * s;
    const h = img.naturalHeight * s;
    const x = (FRAME_W - w) / 2 + offset.x;
    const y = (FRAME_H - h) / 2 + offset.y;
    ctx.drawImage(img, x, y, w, h);
  };

  // Mouse/touch drag
  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    const pt = e.touches ? e.touches[0] : e;
    setDragStart({ x: pt.clientX - offset.x, y: pt.clientY - offset.y });
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    const pt = e.touches ? e.touches[0] : e;
    setOffset({ x: pt.clientX - dragStart.x, y: pt.clientY - dragStart.y });
  };
  const onMouseUp = () => setDragging(false);

  // Pinch to zoom (touch)
  const lastDist = useRef(0);
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      lastDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else { onMouseDown(e); }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = dist / lastDist.current;
      lastDist.current = dist;
      setScale(s => Math.min(4, Math.max(0.5, s * delta)));
    } else { onMouseMove(e); }
  };

  const cropAndReturn = () => {
    const canvas = canvasRef.current;
    canvas.toBlob(blob => {
      const file = new File([blob], 'cropped.jpg', { type:'image/jpeg' });
      const preview = canvas.toDataURL('image/jpeg', 0.92);
      onCrop(file, preview);
    }, 'image/jpeg', 0.92);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:500, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#1a1a1a', borderRadius:20, padding:24, width:'100%', maxWidth:500 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <p style={{ margin:0, fontSize:16, fontWeight:800, color:'#f0ece6' }}>Crop Photo</p>
            <p style={{ margin:0, fontSize:11, color:'#666', marginTop:2 }}>Drag to reposition • Scroll or pinch to zoom</p>
          </div>
          <button onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', color:'#666', fontSize:22 }}>x</button>
        </div>

        {/* Canvas crop area */}
        <div style={{ position:'relative', borderRadius:12, overflow:'hidden', cursor:dragging?'grabbing':'grab', touchAction:'none', border:'2px solid #e85b2544' }}>
          <canvas
            ref={canvasRef}
            width={FRAME_W}
            height={FRAME_H}
            style={{ display:'block', width:'100%', height:'auto' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          />
          {/* Grid overlay */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'33.33% 33.33%' }}/>
        </div>

        {/* Zoom slider */}
        <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:11, color:'#666', fontWeight:700, whiteSpace:'nowrap' }}>Zoom</span>
          <input type="range" min="50" max="400" value={scale*100}
            onChange={e => setScale(Number(e.target.value)/100)}
            style={{ flex:1, accentColor:'#e85b25' }}/>
          <span style={{ fontSize:11, color:'#e85b25', fontWeight:800, width:40, textAlign:'right' }}>{Math.round(scale*100)}%</span>
        </div>

        {/* Buttons */}
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <button onClick={onCancel}
            style={{ flex:1, padding:'11px', background:'transparent', border:'1px solid #262626', borderRadius:10, cursor:'pointer', color:'#666', fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>
            Cancel
          </button>
          <button onClick={cropAndReturn}
            style={{ flex:2, padding:'11px', background:'#e85b25', border:'none', borderRadius:10, cursor:'pointer', color:'#fff', fontSize:13, fontWeight:800, fontFamily:"'DM Sans',sans-serif" }}>
            Use This Crop
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Item Modal ────────────────────────────────────────────────
const ITEM_TAGS_CONFIG = [
  { key:'best_seller',   label:'Best Seller',    color:'#e85b25' },
  { key:'new_item',      label:'New Item',        color:'#3b82f6' },
  { key:'fast_moving',   label:'Fast Moving',     color:'#f59e0b' },
  { key:'chefs_special', label:"Chef's Special",  color:'#8b5cf6' },
  { key:'seasonal',      label:'Seasonal',        color:'#22c55e' },
];

function ItemModal({ item, sections, onClose, reload, showToast }) {
  const [name,        setName]        = useState(item?.name || '');
  const [sectionId,   setSectionId]   = useState(item?.section_id || sections[0]?.id || '');
  const [priceType,   setPriceType]   = useState(item?.price_type || 'single');
  const [priceSingle, setPriceSingle] = useState(item?.price_single || '');
  const [priceMed,    setPriceMed]    = useState(item?.price_medium || '');
  const [priceLrg,    setPriceLrg]    = useState(item?.price_large  || '');
  const [available,   setAvailable]   = useState(item?.available ?? true);
  const [featured,    setFeatured]    = useState(item?.featured  ?? false);
  const [tags,        setTags]        = useState(item?.tags || []);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image_url || null);
  const [removeImage,  setRemoveImage]  = useState(false);
  const [cropSrc,      setCropSrc]      = useState(null);
  const [busy,         setBusy]         = useState(false);
  const [errors,       setErrors]       = useState({});
  const fileRef = useRef();

  const toggleTag = (key) => setTags(prev => prev.includes(key) ? prev.filter(t => t!==key) : [...prev, key]);

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_IMAGE_BYTES) { setErrors(p => ({...p, image:'Image must be under 2MB'})); return; }
    // Open cropper instead of setting directly
    setCropSrc(URL.createObjectURL(f));
    e.target.value = ''; // reset so same file can be re-selected
  };

  const handleCropDone = (croppedFile, croppedPreview) => {
    setImageFile(croppedFile);
    setImagePreview(croppedPreview);
    setRemoveImage(false);
    setCropSrc(null);
    setErrors(p => ({...p, image:null}));
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!sectionId)   e.section = 'Choose a section';
    if (priceType==='single' && !priceSingle) e.price = 'Enter a price';
    if (priceType==='dual' && (!priceMed || !priceLrg)) e.price = 'Enter both medium and large prices';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      let image_url = removeImage ? null : (item?.image_url || null);
      if (imageFile) {
        // Always use jpg extension for cropped canvas blobs
        const ext  = imageFile.type === 'image/jpeg' ? 'jpg' : (imageFile.name?.split('.').pop() || 'jpg');
        const path = `items/${Date.now()}_${uid()}.${ext}`;
        const { data:upData, error:upErr } = await supabase.storage
          .from('menu-images')
          .upload(path, imageFile, { upsert:true, contentType: imageFile.type || 'image/jpeg' });
        if (upErr) {
          // Show detailed error to help diagnose bucket/policy issues
          throw new Error(`Upload failed: ${upErr.message}`);
        }
        const { data:urlData } = supabase.storage.from('menu-images').getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
      const payload = {
        name: name.trim(), section_id:sectionId, image_url,
        price_type:priceType,
        price_single: priceType==='single' ? Number(priceSingle) : null,
        price_medium: priceType==='dual'   ? Number(priceMed)    : null,
        price_large:  priceType==='dual'   ? Number(priceLrg)    : null,
        available, featured, tags, archived:false,
      };
      if (item?.id) { await supabase.from('menu_items').update(payload).eq('id', item.id); showToast('Item updated'); }
      else          { await supabase.from('menu_items').insert(payload); showToast('Item added'); }
      reload(); onClose();
    } catch(e) {
      console.error('Save error:', e);
      showToast(e.message || 'Save failed', 'error');
    }
    finally { setBusy(false); }
  };

  return (
    <>
    <Modal title={item?'Edit Item':'Add New Item'} onClose={onClose} wide>
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:24 }} className='promo-grid'>
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <Field label="Item Name" error={errors.name}>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chicken Cheese Kottu" style={{ fontSize:15, padding:'12px 14px' }}/>
          </Field>
          <Field label="Section" error={errors.section}>
            <Select value={sectionId} onChange={e => setSectionId(e.target.value)} style={{ fontSize:14, padding:'12px 14px' }}>
              <option value="">Select section</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Price Type">
            <div style={{ display:'flex', gap:8 }}>
              {['single','dual'].map(t => (
                <button key={t} onClick={() => setPriceType(t)} style={{ flex:1, padding:'10px', borderRadius:10, border:`1.5px solid ${priceType===t?T.accent:T.border}`, background:priceType===t?T.accent+'22':'transparent', color:priceType===t?T.accent:T.muted, fontSize:12, fontWeight:700, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                  {t==='single'?'Single Price':'Med / Large'}
                </button>
              ))}
            </div>
          </Field>
          {priceType==='single' ? (
            <Field label="Price (Rs.)" error={errors.price}>
              <Input type="number" value={priceSingle} onChange={e => setPriceSingle(e.target.value)} placeholder="950" style={{ fontSize:15, padding:'12px 14px' }}/>
            </Field>
          ) : (
            <Field label="Medium / Large (Rs.)" error={errors.price}>
              <div style={{ display:'flex', gap:8 }}>
                <Input type="number" value={priceMed} onChange={e => setPriceMed(e.target.value)} placeholder="Med: 950" style={{ fontSize:14, padding:'11px 12px' }}/>
                <Input type="number" value={priceLrg} onChange={e => setPriceLrg(e.target.value)} placeholder="Lrg: 1450" style={{ fontSize:14, padding:'11px 12px' }}/>
              </div>
            </Field>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <Toggle value={available} onChange={setAvailable} label="Currently available" style={{ fontSize:14 }}/>
            <Toggle value={featured}  onChange={setFeatured}  label="Featured / Famous dish" style={{ fontSize:14 }}/>
          </div>
          <Field label="Item Tags">
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {ITEM_TAGS_CONFIG.map(tag => (
                <div key={tag.key} onClick={() => toggleTag(tag.key)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, border:`1.5px solid ${tags.includes(tag.key)?tag.color:T.border}`, background:tags.includes(tag.key)?tag.color+'15':'transparent', cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${tags.includes(tag.key)?tag.color:T.border}`, background:tags.includes(tag.key)?tag.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                    {tags.includes(tag.key) && <Check size={10} color="#fff"/>}
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:tags.includes(tag.key)?tag.color:T.muted }}>{tag.label}</span>
                </div>
              ))}
            </div>
          </Field>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Photo upload */}
          <Field label="Item Photo" error={errors.image}>
            <div style={{ position:'relative' }}>
              <div onClick={() => fileRef.current?.click()}
                style={{ height:200, borderRadius:14, border:`2px dashed ${imagePreview && !removeImage ? T.accent+'55' : T.border}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', background:T.surface, transition:'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor=T.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor=imagePreview && !removeImage ? T.accent+'55' : T.border}>
                {imagePreview && !removeImage ? (
                  <img src={imagePreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <>
                    <Upload size={24} color={T.muted}/>
                    <p style={{ margin:'8px 0 3px', fontSize:13, fontWeight:600, color:T.muted }}>Click to upload photo</p>
                    <p style={{ margin:0, fontSize:11, color:T.muted }}>Max 2MB — JPG, PNG, WebP</p>
                  </>
                )}
              </div>
              {/* Delete image button */}
              {imagePreview && !removeImage && (
                <button onClick={(e) => { e.stopPropagation(); setRemoveImage(true); setImagePreview(null); setImageFile(null); }}
                  style={{ position:'absolute', top:8, right:8, background:'rgba(239,68,68,0.9)', border:'none', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', zIndex:10 }}>
                  <Trash2 size={12}/>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display:'none' }}/>
          </Field>

          {/* Menu card preview */}
          <div>
            <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color:T.muted, letterSpacing:'0.15em', textTransform:'uppercase' }}>Preview — how it looks on the menu</p>
            <div style={{ background:'#111', borderRadius:14, overflow:'hidden', border:`1px solid ${T.border}` }}>
              {/* Card image */}
              <div style={{ height:120, background: imagePreview && !removeImage ? 'transparent' : T.surface, position:'relative', overflow:'hidden' }}>
                {imagePreview && !removeImage ? (
                  <img src={imagePreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Utensils size={32} color={T.border}/>
                  </div>
                )}
                {/* Tags overlay */}
                {tags.length > 0 && (
                  <div style={{ position:'absolute', top:8, left:8, display:'flex', gap:4, flexWrap:'wrap' }}>
                    {tags.slice(0,2).map(t => {
                      const cfg = TAG_DISPLAY[t];
                      return cfg ? (
                        <span key={t} style={{ background:cfg.color, color:'#fff', borderRadius:5, padding:'2px 7px', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                          {cfg.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              {/* Card body */}
              <div style={{ padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:800, color:'#f0ece6', lineHeight:1.3, flex:1 }}>
                    {name || 'Item Name'}
                  </p>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:available?'#22c55e':'#ef4444', flexShrink:0, marginTop:4, marginLeft:8 }}/>
                </div>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#e85b25', fontFamily:'monospace' }}>
                  {priceType==='single'
                    ? (priceSingle ? `Rs.${Number(priceSingle).toLocaleString()}` : 'Rs.—')
                    : (priceMed && priceLrg ? `Rs.${Number(priceMed).toLocaleString()} / Rs.${Number(priceLrg).toLocaleString()}` : 'Rs.— / Rs.—')
                  }
                </p>
                {featured && (
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:5 }}>
                    <Star size={10} color='#e85b25' fill='#e85b25'/>
                    <span style={{ fontSize:9, color:'#e85b25', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em' }}>Featured</span>
                  </div>
                )}
              </div>
            </div>
            <p style={{ margin:'6px 0 0', fontSize:10, color:T.muted, textAlign:'center' }}>Updates as you type</p>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:28, paddingTop:20, borderTop:`1px solid ${T.border}` }}>
        <Btn onClick={onClose} variant='ghost'>Cancel</Btn>
        <Btn onClick={save} disabled={busy}><Save size={14}/>{busy?'Saving...':(item?'Save Changes':'Add Item')}</Btn>
      </div>
    </Modal>
    {cropSrc && (
      <ImageCropper src={cropSrc} onCrop={handleCropDone} onCancel={() => setCropSrc(null)}/>
    )}
    </>
  );
}

// ── Draggable Item List (for Sections view) ─────────────────
function DraggableItemList({ items, reload, showToast }) {
  const [orderedItems, setOrderedItems] = useState(
    [...items].sort((a,b) => (a.display_order||0) - (b.display_order||0))
  );
  const [dragIdx,   setDragIdx]   = useState(null);
  const [overIdx,   setOverIdx]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [editModal, setEditModal] = useState(null);

  // Sync when items prop changes
  useEffect(() => {
    setOrderedItems([...items].sort((a,b) => (a.display_order||0) - (b.display_order||0)));
  }, [items.map(i=>i.id+i.display_order).join()]);

  const onDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(idx);
  };

  const onDrop = async (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return; }
    const reordered = [...orderedItems];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setOrderedItems(reordered);
    setDragIdx(null);
    setOverIdx(null);
    // Save new order to DB
    setSaving(true);
    await Promise.all(
      reordered.map((item, i) =>
        supabase.from('menu_items').update({ display_order: i + 1 }).eq('id', item.id)
      )
    );
    setSaving(false);
    showToast('Order saved');
    reload();
  };

  const onDragEnd = () => { setDragIdx(null); setOverIdx(null); };

  if (orderedItems.length === 0) return (
    <p style={{ padding:'16px 20px', fontSize:12, color:T.muted, fontStyle:'italic' }}>No items in this section</p>
  );

  return (
    <div style={{ borderTop:`1px solid ${T.border}`, position:'relative' }}>
      {saving && (
        <div style={{ position:'absolute', top:8, right:12, fontSize:10, color:T.accent, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, border:`2px solid ${T.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.6s linear infinite' }}/>
          Saving order...
        </div>
      )}
      <div style={{ padding:'6px 12px', background:T.accent+'08', borderBottom:`1px solid ${T.border}` }}>
        <p style={{ margin:0, fontSize:9, fontWeight:800, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>
          Drag rows to reorder — reflects immediately on the public menu
        </p>
      </div>
      {orderedItems.map((item, ii) => {
        const price = item.price_type==='single'
          ? fmt(item.price_single)
          : `${fmt(item.price_medium)} / ${fmt(item.price_large)}`;
        const isDragging = dragIdx === ii;
        const isOver     = overIdx === ii && dragIdx !== ii;
        return (
          <div key={item.id}
            draggable
            onDragStart={e => onDragStart(e, ii)}
            onDragOver={e => onDragOver(e, ii)}
            onDrop={e => onDrop(e, ii)}
            onDragEnd={onDragEnd}
            style={{
              display:'flex', alignItems:'center', gap:14, padding:'10px 16px',
              borderBottom: ii < orderedItems.length-1 ? `1px solid ${T.border}` : 'none',
              background: isDragging ? T.accent+'18' : isOver ? T.accent+'0a' : 'transparent',
              opacity: isDragging ? 0.5 : 1,
              borderLeft: isOver ? `3px solid ${T.accent}` : '3px solid transparent',
              transition:'background 0.1s, border-color 0.1s',
              cursor:'grab',
            }}
            onMouseEnter={e => { if(!isDragging) e.currentTarget.style.background='#1c1c1c'; }}
            onMouseLeave={e => { if(!isDragging) e.currentTarget.style.background='transparent'; }}
          >
            {/* Drag handle */}
            <div style={{ flexShrink:0, color:T.border, display:'flex', flexDirection:'column', gap:2, cursor:'grab', padding:'0 2px' }}>
              <div style={{ display:'flex', gap:2 }}>
                <div style={{ width:3, height:3, borderRadius:'50%', background:'currentColor' }}/>
                <div style={{ width:3, height:3, borderRadius:'50%', background:'currentColor' }}/>
              </div>
              <div style={{ display:'flex', gap:2 }}>
                <div style={{ width:3, height:3, borderRadius:'50%', background:'currentColor' }}/>
                <div style={{ width:3, height:3, borderRadius:'50%', background:'currentColor' }}/>
              </div>
              <div style={{ display:'flex', gap:2 }}>
                <div style={{ width:3, height:3, borderRadius:'50%', background:'currentColor' }}/>
                <div style={{ width:3, height:3, borderRadius:'50%', background:'currentColor' }}/>
              </div>
            </div>

            {/* Order number */}
            <span style={{ fontSize:10, fontWeight:800, color:T.muted, width:18, textAlign:'center', flexShrink:0 }}>{ii+1}</span>

            {/* Thumbnail */}
            <div style={{ width:36, height:36, borderRadius:8, overflow:'hidden', background:T.surface, flexShrink:0, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {item.image_url ? <img src={item.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Utensils size={13} color={T.muted}/>}
            </div>

            {/* Name */}
            <p style={{ flex:1, margin:0, fontSize:13, fontWeight:600, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>

            {/* Price */}
            <p style={{ margin:0, fontSize:12, fontWeight:700, color:T.accent, fontFamily:'monospace', whiteSpace:'nowrap', flexShrink:0 }}>{price}</p>

            {/* Tags */}
            <div style={{ display:'flex', gap:4, flexShrink:0 }}>
              {(item.tags||[]).slice(0,2).map(t => {
                const cfg = TAG_DISPLAY[t];
                return cfg ? <span key={t} style={{ background:cfg.color+'20', color:cfg.color, border:`1px solid ${cfg.color}44`, borderRadius:5, padding:'1px 6px', fontSize:9, fontWeight:800, textTransform:'uppercase' }}>{cfg.label}</span> : null;
              })}
            </div>

            {/* Actions */}
            <RowActions item={item} onEdit={() => setEditModal(item)} reload={reload} showToast={showToast} compact={true}/>
          </div>
        );
      })}

      {editModal && (
        <ItemModal item={editModal} sections={[]} onClose={() => setEditModal(null)} reload={reload} showToast={showToast}/>
      )}
    </div>
  );
}

// ── Sections Manager ──────────────────────────────────────────
function SectionsManager({ sections, items, reload, showToast }) {
  const [modal,    setModal]    = useState(null);
  const [expanded, setExpanded] = useState({});
  const active = sections.filter(s => !s.archived).sort((a,b) => a.display_order-b.display_order);

  const move = async (id, dir) => {
    const idx = active.findIndex(s => s.id===id);
    const swapIdx = idx+dir;
    if (swapIdx < 0 || swapIdx >= active.length) return;
    const a=active[idx], b=active[swapIdx];
    await Promise.all([
      supabase.from('sections').update({ display_order:b.display_order }).eq('id',a.id),
      supabase.from('sections').update({ display_order:a.display_order }).eq('id',b.id),
    ]);
    reload();
  };

  const archive = async (id) => {
    if (!confirm('Archive this section?')) return;
    await supabase.from('sections').update({ archived:true }).eq('id',id);
    showToast('Section archived'); reload();
  };

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Sections</h1>
          <p style={{ color:T.muted, fontSize:13, marginTop:4 }}>Reorder, rename, archive — click a section to see its items</p>
        </div>
        <Btn onClick={() => setModal({ mode:'add' })}><Plus size={16}/> Add Section</Btn>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {active.map((sec,idx) => {
          const secItems = items.filter(it => it.section_id===sec.id && !it.archived);
          const isOpen   = expanded[sec.id];
          return (
            <div key={sec.id} style={{ background:T.card, border:`1px solid ${isOpen?T.accent+'55':T.border}`, borderRadius:14, overflow:'hidden', transition:'border-color 0.2s' }}>
              {/* Section header row */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px' }}>
                {/* Reorder */}
                <div style={{ display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
                  <button onClick={(e) => { e.stopPropagation(); move(sec.id,-1); }} disabled={idx===0}
                    style={{ background:'none', border:'none', cursor:'pointer', color:idx===0?T.border:T.muted, padding:2, lineHeight:1 }}><ChevronUp size={13}/></button>
                  <button onClick={(e) => { e.stopPropagation(); move(sec.id,1); }} disabled={idx===active.length-1}
                    style={{ background:'none', border:'none', cursor:'pointer', color:idx===active.length-1?T.border:T.muted, padding:2, lineHeight:1 }}><ChevronDown size={13}/></button>
                </div>
                {/* Order number */}
                <div style={{ width:26, height:26, borderRadius:7, background:T.accent+'22', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:10, fontWeight:800, color:T.accent }}>{sec.display_order}</span>
                </div>
                {/* Name + item count — clickable to expand */}
                <div onClick={() => toggleExpand(sec.id)} style={{ flex:1, display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                  <p style={{ margin:0, fontSize:15, fontWeight:700, color:T.text }}>{sec.name}</p>
                  <span style={{ background:T.accent+'22', color:T.accent, borderRadius:999, padding:'2px 10px', fontSize:10, fontWeight:800 }}>
                    {secItems.length} items
                  </span>
                  <ChevronDown size={14} color={T.muted} style={{ marginLeft:'auto', transform: isOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}/>
                </div>
                {/* Actions */}
                <div style={{ display:'flex', gap:7, flexShrink:0 }}>
                  <Btn onClick={() => setModal({ mode:'edit', sec })} variant='ghost' size='sm'><Edit2 size={11}/> Edit</Btn>
                  <Btn onClick={() => archive(sec.id)} variant='danger' size='sm'><Archive size={11}/> Archive</Btn>
                </div>
              </div>

              {/* Expanded items list — drag to reorder */}
              {isOpen && (
                <DraggableItemList
                  items={secItems}
                  reload={reload}
                  showToast={showToast}
                />
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal.mode==='add'?'Add Section':'Edit Section'} onClose={() => setModal(null)}>
          <SectionForm sec={modal.sec} sections={active} onClose={() => setModal(null)} reload={reload} showToast={showToast}/>
        </Modal>
      )}
    </div>
  );
}

function SectionForm({ sec, sections, onClose, reload, showToast }) {
  const [name, setName] = useState(sec?.name || '');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!name.trim()) return;
    setBusy(true);
    if (sec?.id) { await supabase.from('sections').update({ name:name.trim() }).eq('id',sec.id); }
    else {
      const maxOrder = Math.max(0, ...sections.map(s => s.display_order));
      await supabase.from('sections').insert({ name:name.trim(), display_order:maxOrder+1 });
    }
    showToast(sec?.id?'Section updated':'Section added');
    reload(); onClose(); setBusy(false);
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <Field label="Section Name">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kottu Zone" onKeyDown={e => e.key==='Enter' && save()} autoFocus/>
      </Field>
      <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
        <Btn onClick={onClose} variant='ghost'>Cancel</Btn>
        <Btn onClick={save} disabled={busy||!name.trim()}><Save size={14}/>{busy?'Saving...':'Save'}</Btn>
      </div>
    </div>
  );
}

// ── Featured & Tagged Manager ────────────────────────────────
function FeaturedTaggedManager({ items, sections, reload, showToast }) {
  const [activeTab, setActiveTab] = useState('featured');
  const [editModal, setEditModal] = useState(null);
  const activeSections = sections.filter(s => !s.archived).sort((a,b) => a.display_order-b.display_order);
  const activeItems = items.filter(i => !i.archived);

  const featuredItems = activeItems.filter(i => i.featured);
  const taggedGroups  = Object.entries(TAG_DISPLAY).map(([key, cfg]) => ({
    key, ...cfg,
    items: activeItems.filter(i => (i.tags||[]).includes(key)),
  })).filter(g => g.items.length > 0);

  const tabs = [
    { id:'featured', label:'Featured', count: featuredItems.length, color: T.accent },
    ...taggedGroups.map(g => ({ id:g.key, label:g.label, count:g.items.length, color:g.color })),
  ];

  const displayItems = activeTab==='featured'
    ? featuredItems
    : (taggedGroups.find(g => g.key===activeTab)?.items || []);

  const fmt2 = (item) => item.price_type==='single'
    ? fmt(item.price_single)
    : `${fmt(item.price_medium)} / ${fmt(item.price_large)}`;

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Featured & Tagged</h1>
        <p style={{ color:T.muted, fontSize:13, marginTop:4 }}>Items marked as featured or tagged — shown on the public homepage</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display:'flex', alignItems:'center', gap:7,
            padding:'8px 16px', borderRadius:10,
            border:`1.5px solid ${activeTab===tab.id ? tab.color : T.border}`,
            background:activeTab===tab.id ? tab.color+'18' : 'transparent',
            color:activeTab===tab.id ? tab.color : T.muted,
            fontSize:12, fontWeight:700, cursor:'pointer',
            fontFamily:"'DM Sans',sans-serif", transition:'all 0.18s',
          }}>
            {tab.id==='featured' ? <Star size={13}/> : <Tag size={13}/>}
            {tab.label}
            <span style={{ background:activeTab===tab.id?tab.color:T.border, color:activeTab===tab.id?'#fff':T.muted, borderRadius:999, padding:'1px 7px', fontSize:10, fontWeight:800 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items table */}
      {displayItems.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', opacity:.3 }}>
          <Star size={40} style={{ margin:'0 auto 12px' }}/>
          <p style={{ fontWeight:800, textTransform:'uppercase', letterSpacing:'0.15em', fontSize:12 }}>
            No items {activeTab==='featured'?'marked as featured':'with this tag'} yet
          </p>
          <p style={{ fontSize:12, color:T.muted, marginTop:8 }}>
            {activeTab==='featured'
              ? 'Go to Menu Items and click the star on any item to feature it'
              : 'Go to Menu Items and add this tag to items from the Tags column'}
          </p>
        </div>
      ) : (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden' }}>
          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'52px 1fr 160px 100px 180px 80px', padding:'10px 16px', gap:12, background:T.surface, borderBottom:`1px solid ${T.border}` }}>
            {['', 'Item Name', 'Price', 'Section', 'Tags', 'Actions'].map((h,i) => (
              <p key={i} style={{ margin:0, fontSize:10, fontWeight:800, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>{h}</p>
            ))}
          </div>
          {displayItems.map((item, ii) => {
            const sec = sections.find(s => s.id===item.section_id);
            return (
              <div key={item.id} style={{ display:'grid', gridTemplateColumns:'52px 1fr 160px 100px 180px 80px', padding:'10px 16px', gap:12, alignItems:'center', borderBottom:ii<displayItems.length-1?`1px solid ${T.border}`:'none', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#1c1c1c'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                {/* Thumbnail */}
                <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', background:T.surface, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {item.image_url ? <img src={item.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Utensils size={15} color={T.muted}/>}
                </div>
                {/* Name + featured toggle */}
                <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:13, fontWeight:700, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                  </div>
                  <FeaturedToggle item={item} onDone={reload}/>
                </div>
                {/* Price */}
                <p style={{ margin:0, fontSize:12, fontWeight:700, color:T.accent, fontFamily:'monospace' }}>{fmt2(item)}</p>
                {/* Section */}
                <p style={{ margin:0, fontSize:11, color:T.muted, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sec?.name || '—'}</p>
                {/* Tags */}
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {(item.tags||[]).map(t => {
                    const cfg = TAG_DISPLAY[t];
                    return cfg ? <span key={t} style={{ background:cfg.color+'20', color:cfg.color, border:`1px solid ${cfg.color}44`, borderRadius:5, padding:'2px 7px', fontSize:9, fontWeight:800, textTransform:'uppercase' }}>{cfg.label}</span> : null;
                  })}
                </div>
                {/* Actions */}
                <RowActions item={item} onEdit={() => setEditModal(item)} reload={reload} showToast={showToast}/>
              </div>
            );
          })}
        </div>
      )}
      {editModal && (
        <ItemModal item={editModal} sections={activeSections} onClose={() => setEditModal(null)} reload={reload} showToast={showToast}/>
      )}
    </div>
  );
}


// ── Promotions Manager ───────────────────────────────────────
function PromotionsManager({ showToast }) {
  const [promos,    setPromos]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null) // null | 'add' | {promo}

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
    setPromos(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggle = async (id, active) => {
    await supabase.from('promotions').update({ active }).eq('id', id)
    showToast(active ? 'Promotion activated' : 'Announcement hidden')
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete this promotion permanently?')) return
    await supabase.from('promotions').delete().eq('id', id)
    showToast('Announcement deleted')
    load()
  }

  const activeCount = promos.filter(p => p.active).length

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Announcements</h1>
          <p style={{ color:T.muted, fontSize:13, marginTop:4 }}>Manage announcements, promotions, events and special offers shown on the website</p>
        </div>
        <Btn onClick={() => setModal('add')} size="lg"><Plus size={16}/> New Promotion</Btn>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Total',    value:promos.length,      color:T.blue   },
          { label:'Active',   value:activeCount,         color:T.green  },
          { label:'Hidden',   value:promos.length-activeCount, color:T.muted },
        ].map(s => (
          <div key={s.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <p style={{ margin:0, fontSize:28, fontWeight:800, color:s.color }}>{s.value}</p>
            <p style={{ margin:0, fontSize:11, color:T.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div style={{ background:T.accent+'0f', border:`1px solid ${T.accent}33`, borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
        <Megaphone size={14} color={T.accent}/>
        <p style={{ margin:0, fontSize:12, color:T.muted, lineHeight:1.6 }}>
          Active promotions appear as a <strong style={{ color:T.text }}>floating banner</strong> on the website homepage. Visitors can click it to see the full poster and contact options.
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', opacity:.3 }}>
          <div style={{ width:32, height:32, border:`3px solid ${T.accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }}/>
        </div>
      ) : promos.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 0', opacity:.3 }}>
          <Megaphone size={44} style={{ margin:'0 auto 14px' }}/>
          <p style={{ fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', fontSize:12 }}>No promotions yet</p>
          <p style={{ fontSize:12, color:T.muted, marginTop:6 }}>Create your first promotion to show it on the website</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {promos.map(promo => (
            <div key={promo.id} style={{ background:T.card, border:`1.5px solid ${promo.active ? T.accent+'44' : T.border}`, borderRadius:16, overflow:'hidden', display:'flex', gap:0 }}>
              {/* Active indicator bar */}
              <div style={{ width:4, flexShrink:0, background:promo.active ? T.green : T.border }}/>

              {/* Thumbnail */}
              {promo.image_url && (
                <div style={{ width:100, flexShrink:0, overflow:'hidden' }}>
                  <img src={promo.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </div>
              )}

              {/* Content */}
              <div style={{ flex:1, padding:'16px 18px', display:'flex', gap:16, alignItems:'center', minWidth:0 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <p style={{ margin:0, fontSize:15, fontWeight:800, color:T.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{promo.title}</p>
                    {promo.active && <span style={{ background:T.green+'22', color:T.green, border:`1px solid ${T.green}44`, borderRadius:999, padding:'2px 8px', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', flexShrink:0 }}>Live</span>}
                  </div>
                  {promo.description && <p style={{ margin:'0 0 8px', fontSize:12, color:T.muted, lineHeight:1.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{promo.description}</p>}
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {/* Contact option */}
                    <span style={{ fontSize:10, color:T.muted, display:'flex', alignItems:'center', gap:4 }}>
                      <Link size={10}/> {promo.contact_option === 'both' ? 'WhatsApp + Call' : promo.contact_option === 'none' ? 'No CTA' : promo.contact_option}
                    </span>
                    {/* Dates */}
                    {promo.start_date && (
                      <span style={{ fontSize:10, color:T.muted, display:'flex', alignItems:'center', gap:4 }}>
                        <Calendar size={10}/> {promo.start_date}{promo.end_date ? ` → ${promo.end_date}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:8, flexShrink:0, alignItems:'center' }}>
                  {/* Toggle active */}
                  <Tooltip text={promo.active ? 'Click to hide from website' : 'Click to show on website'}>
                    <div onClick={() => toggle(promo.id, !promo.active)} style={{ cursor:'pointer' }}>
                      <div style={{ width:42, height:24, borderRadius:999, background:promo.active?T.green:T.border, position:'relative', transition:'background 0.2s' }}>
                        <div style={{ position:'absolute', top:3, left:promo.active?21:3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}/>
                      </div>
                    </div>
                  </Tooltip>
                  <Tooltip text="Edit promotion">
                    <button onClick={() => setModal(promo)} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:'7px 10px', cursor:'pointer', color:T.text, display:'flex', alignItems:'center', transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=T.accent; e.currentTarget.style.color=T.accent }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.text }}>
                      <Edit2 size={12}/>
                    </button>
                  </Tooltip>
                  <Tooltip text="Delete permanently">
                    <button onClick={() => remove(promo.id)} style={{ background:'transparent', border:`1px solid ${T.border}`, borderRadius:8, padding:'7px 10px', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center', transition:'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=T.red; e.currentTarget.style.color=T.red }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.muted }}>
                      <Trash2 size={12}/>
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && <PromoModal promo={modal==='add'?null:modal} onClose={() => setModal(null)} reload={load} showToast={showToast}/>}
    </div>
  )
}

// ── Announcement Modal ───────────────────────────────────────
function PromoModal({ promo, onClose, reload, showToast }) {
  const [posterOnly,  setPosterOnly]  = useState(!promo?.title && !!promo?.image_url)
  const [title,       setTitle]       = useState(promo?.title || '')
  const [desc,        setDesc]        = useState(promo?.description || '')
  const [contact,     setContact]     = useState(promo?.contact_option || 'both')
  const [phone,       setPhone]       = useState(promo?.phone || '94772356969')
  const [waMsg,       setWaMsg]       = useState(promo?.whatsapp_message || 'Hello, I am interested in this promotion!')
  const [startDate,   setStartDate]   = useState(promo?.start_date || '')
  const [endDate,     setEndDate]     = useState(promo?.end_date || '')
  const [active,      setActive]      = useState(promo?.active ?? true)
  const [imageFile,   setImageFile]   = useState(null)
  const [preview,     setPreview]     = useState(promo?.image_url || null)
  const [cropSrc,     setCropSrc]     = useState(null)
  const [busy,        setBusy]        = useState(false)
  const fileRef = useRef()

  const pickImage = (e) => {
    const f = e.target.files[0]; if (!f) return
    if (f.size > MAX_IMAGE_BYTES) { showToast('Image must be under 2MB', 'error'); return }
    const url = URL.createObjectURL(f)
    setCropSrc(url)
  }

  const onCropped = (blob) => {
    const file = new File([blob], 'poster.jpg', { type: 'image/jpeg' })
    setImageFile(file)
    setPreview(URL.createObjectURL(blob))
    setCropSrc(null)
  }

  const save = async () => {
    if (!posterOnly && !title.trim()) { showToast('Title is required', 'error'); return }
    if (posterOnly && !preview) { showToast('Upload a poster image', 'error'); return }
    setBusy(true)
    try {
      let image_url = promo?.image_url || null
      if (imageFile) {
        const ext  = imageFile.name.split('.').pop()
        const path = `promotions/${Date.now()}_${uid()}.${ext}`
        const { error: upErr } = await supabase.storage.from('menu-images').upload(path, imageFile, { upsert:true, contentType: imageFile.type || 'image/jpeg' })
        if (upErr) throw new Error(`Upload failed: ${upErr.message}`)
        const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(path)
        image_url = urlData.publicUrl
      }
      const payload = {
        title:             posterOnly ? '' : title.trim(),
        description:       posterOnly ? '' : desc,
        image_url,
        active,
        contact_option:    contact,
        phone,
        whatsapp_message:  waMsg,
        start_date:        startDate || null,
        end_date:          endDate   || null,
      }
      if (promo?.id) await supabase.from('promotions').update(payload).eq('id', promo.id)
      else           await supabase.from('promotions').insert(payload)
      showToast(promo?.id ? 'Announcement updated' : 'Announcement created')
      reload(); onClose()
    } catch(e) { showToast(e.message || 'Save failed', 'error') }
    finally { setBusy(false) }
  }

  if (cropSrc) return <ImageCropper src={cropSrc} onCrop={onCropped} onCancel={()=>setCropSrc(null)}/>

  const CONTACT_OPTIONS = [
    { key:'whatsapp', label:'WhatsApp only',    desc:'Shows a WhatsApp button' },
    { key:'call',     label:'Call only',        desc:'Shows a Call button'     },
    { key:'both',     label:'WhatsApp + Call',  desc:'Shows both buttons'      },
    { key:'none',     label:'No CTA',           desc:'Poster only, no button'  },
  ]

  return (
    <Modal title={promo ? 'Edit Announcement' : 'New Announcement'} onClose={onClose} wide>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }} className='promo-grid'>

        {/* ── LEFT col ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Poster only toggle */}
          <div onClick={()=>setPosterOnly(p=>!p)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:12, border:`1.5px solid ${posterOnly ? T.accent : T.border}`, background: posterOnly ? T.accent+'0f' : 'transparent', cursor:'pointer', transition:'all 0.2s' }}>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color: posterOnly ? T.accent : T.text }}>Poster only mode</p>
              <p style={{ margin:0, fontSize:11, color:T.muted }}>No title or text — just the image and contact button</p>
            </div>
            <div style={{ width:40, height:22, borderRadius:999, background: posterOnly ? T.accent : T.border, position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:3, left: posterOnly ? 21 : 3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }}/>
            </div>
          </div>

          {/* Title + description — hidden in poster only mode */}
          {!posterOnly && (
            <>
              <Field label="Title"><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Eid Special Offer" style={{fontSize:15,padding:'12px 14px'}}/></Field>
              <Field label="Description (optional)">
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Brief details shown in the popup..."
                  style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:'10px 14px', fontSize:13, color:T.text, outline:'none', fontFamily:"'DM Sans',sans-serif", width:'100%', boxSizing:'border-box', minHeight:72, resize:'vertical' }}/>
              </Field>
              <Field label="Date Range (optional)">
                <div style={{ display:'flex', gap:8 }}>
                  <Input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{fontSize:12}}/>
                  <Input type="date" value={endDate}   onChange={e=>setEndDate(e.target.value)}   style={{fontSize:12}}/>
                </div>
              </Field>
            </>
          )}

          <Toggle value={active} onChange={setActive} label="Show on website (Live)"/>

          {/* Contact option */}
          <Field label="Contact Button">
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {CONTACT_OPTIONS.map(opt => (
                <div key={opt.key} onClick={()=>setContact(opt.key)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10, border:`1.5px solid ${contact===opt.key ? T.accent : T.border}`, background: contact===opt.key ? T.accent+'10' : 'transparent', cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${contact===opt.key ? T.accent : T.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {contact===opt.key && <div style={{ width:8, height:8, borderRadius:'50%', background:T.accent }}/>}
                  </div>
                  <div>
                    <p style={{ margin:0, fontSize:12, fontWeight:700, color: contact===opt.key ? T.accent : T.text }}>{opt.label}</p>
                    <p style={{ margin:0, fontSize:10, color:T.muted }}>{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Field>

          {(contact==='call'||contact==='both') && (
            <Field label="Phone Number"><Input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="94772356969"/></Field>
          )}
          {(contact==='whatsapp'||contact==='both') && (
            <Field label="WhatsApp Pre-filled Message">
              <Input value={waMsg} onChange={e=>setWaMsg(e.target.value)} placeholder="Hello, I am interested..."/>
            </Field>
          )}
        </div>

        {/* ── RIGHT col — Poster upload with crop ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <p style={{ margin:0, fontSize:10, fontWeight:700, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>
            {posterOnly ? 'Poster Image (required)' : 'Poster / Banner Image (optional)'}
          </p>

          {/* Upload area */}
          <div onClick={()=>fileRef.current?.click()}
            style={{ borderRadius:16, border:`2px dashed ${preview ? T.accent+'66' : T.border}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden', background:T.surface, transition:'all 0.2s', minHeight:320, position:'relative' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=T.accent}
            onMouseLeave={e=>e.currentTarget.style.borderColor=preview?T.accent+'66':T.border}>
            {preview ? (
              <>
                <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }}/>
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='0'}>
                  <Upload size={24} color='#fff'/>
                  <p style={{ margin:'8px 0 0', fontSize:12, color:'#fff', fontWeight:700 }}>Click to replace</p>
                </div>
              </>
            ) : (
              <>
                <Upload size={28} color={T.muted}/>
                <p style={{ margin:'10px 0 4px', fontSize:13, fontWeight:600, color:T.muted }}>Click to upload poster</p>
                <p style={{ margin:0, fontSize:11, color:T.muted }}>JPG, PNG — Max 2MB</p>
                <p style={{ margin:'4px 0 0', fontSize:10, color:T.muted, opacity:.7 }}>Recommended: portrait format (3:4)</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} style={{ display:'none' }}/>

          {preview && (
            <button onClick={()=>{setPreview(null);setImageFile(null)}}
              style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'8px', cursor:'pointer', color:T.red, fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Trash2 size={12}/> Remove image
            </button>
          )}
          {preview && (
            <button onClick={()=>{if(promo?.image_url&&!imageFile){setCropSrc(promo.image_url)}else if(imageFile){setCropSrc(URL.createObjectURL(imageFile))}}}
              style={{ background:T.accent+'15', border:`1px solid ${T.accent}44`, borderRadius:10, padding:'8px', cursor:'pointer', color:T.accent, fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Edit2 size={12}/> Re-crop image
            </button>
          )}

          {/* Live preview */}
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:12 }}>
            <p style={{ margin:'0 0 8px', fontSize:9, fontWeight:700, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>Banner preview</p>
            <div style={{ background:'#111', borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:9, background:T.accent+'22', overflow:'hidden', flexShrink:0, border:`1px solid ${T.accent}33` }}>
                {preview ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Flame size={16} color={T.accent}/></div>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:11, fontWeight:800, color:'#f0ece6', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {posterOnly ? '(Poster only)' : (title || 'Announcement title')}
                </p>
                <p style={{ margin:0, fontSize:9, color:'rgba(255,255,255,0.35)' }}>Tap to see full poster</p>
              </div>
              <div style={{ background:T.accent, borderRadius:6, padding:'4px 8px', fontSize:9, fontWeight:800, color:'#fff' }}>View</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:24, paddingTop:20, borderTop:`1px solid ${T.border}` }}>
        <Btn onClick={onClose} variant='ghost'>Cancel</Btn>
        <Btn onClick={save} disabled={busy}><Save size={14}/> {busy ? 'Saving...' : (promo ? 'Save Changes' : 'Create Announcement')}</Btn>
      </div>
    </Modal>
  )
}


// ── Unavailable Manager ─────────────────────────────────────
function UnavailableManager({ items, sections, reload, showToast }) {
  const [editModal, setEditModal] = useState(null);
  const activeSections = sections.filter(s => !s.archived).sort((a,b) => a.display_order-b.display_order);
  const unavailableItems = items.filter(i => !i.available && !i.archived);
  const fmt2 = (item) => item.price_type==='single'
    ? fmt(item.price_single)
    : `${fmt(item.price_medium)} / ${fmt(item.price_large)}`;

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Unavailable Items</h1>
        <p style={{ color:T.muted, fontSize:13, marginTop:4 }}>Items currently hidden from the public menu — click the circle to make them available again</p>
      </div>

      {unavailableItems.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 0', opacity:.3 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'#22c55e22', border:'2px solid #22c55e44', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:'#22c55e' }}/>
          </div>
          <p style={{ fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', fontSize:13 }}>All items are available</p>
          <p style={{ fontSize:12, color:T.muted, marginTop:6 }}>Nothing is hidden from the menu right now</p>
        </div>
      ) : (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'12px 18px', marginBottom:20 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:'#ef4444', boxShadow:'0 0 8px #ef444488' }}/>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:'#ef4444' }}>{unavailableItems.length} item{unavailableItems.length!==1?'s':''} currently unavailable</p>
          </div>

          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'44px 1fr 150px 110px 160px auto', padding:'10px 16px', gap:12, background:T.surface, borderBottom:`1px solid ${T.border}` }}>
              {['', 'Item Name', 'Price', 'Section', 'Tags', 'Actions'].map((h,i) => (
                <p key={i} style={{ margin:0, fontSize:10, fontWeight:800, color:T.muted, letterSpacing:'0.2em', textTransform:'uppercase' }}>{h}</p>
              ))}
            </div>
            {unavailableItems.map((item, ii) => {
              const sec = sections.find(s => s.id===item.section_id);
              return (
                <div key={item.id}
                  style={{ display:'grid', gridTemplateColumns:'44px 1fr 150px 110px 160px auto', padding:'10px 16px', gap:12, alignItems:'center', borderBottom:ii<unavailableItems.length-1?`1px solid ${T.border}`:'none', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#1c1c1c'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  {/* Thumbnail */}
                  <div style={{ width:44, height:44, borderRadius:10, overflow:'hidden', background:T.surface, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', opacity:0.6 }}>
                    {item.image_url ? <img src={item.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Utensils size={15} color={T.muted}/>}
                  </div>
                  {/* Name */}
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:T.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                  {/* Price */}
                  <p style={{ margin:0, fontSize:12, fontWeight:700, color:T.muted, fontFamily:'monospace' }}>{fmt2(item)}</p>
                  {/* Section */}
                  <p style={{ margin:0, fontSize:11, color:T.muted, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sec?.name||'—'}</p>
                  {/* Tags */}
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                    {(item.tags||[]).map(t => {
                      const cfg = TAG_DISPLAY[t];
                      return cfg ? <span key={t} style={{ background:cfg.color+'20', color:cfg.color, border:`1px solid ${cfg.color}44`, borderRadius:5, padding:'2px 7px', fontSize:9, fontWeight:800, textTransform:'uppercase' }}>{cfg.label}</span> : null;
                    })}
                  </div>
                  {/* Actions */}
                  <RowActions item={item} onEdit={() => setEditModal(item)} reload={reload} showToast={showToast}/>
                </div>
              );
            })}
          </div>
        </>
      )}
      {editModal && (
        <ItemModal item={editModal} sections={activeSections} onClose={() => setEditModal(null)} reload={reload} showToast={showToast}/>
      )}
    </div>
  );
}

// ── Promotions Manager ───────────────────────────────────────

// ── Promo Modal ───────────────────────────────────────────────

// ── Archived Manager ─────────────────────────────────────────
function ArchivedManager({ sections, items, reload, showToast }) {
  const archivedSections = sections.filter(s => s.archived)
  const archivedItems    = items.filter(i => i.archived)

  const restoreItem = async (item) => {
    await supabase.from('menu_items').update({ archived: false }).eq('id', item.id)
    showToast(`"${item.name}" restored`); reload()
  }
  const deleteItem = async (item) => {
    if (!confirm(`Permanently delete "${item.name}"?`)) return
    await supabase.from('menu_items').delete().eq('id', item.id)
    showToast(`"${item.name}" deleted`); reload()
  }
  const restoreSection = async (sec) => {
    await supabase.from('sections').update({ archived: false }).eq('id', sec.id)
    showToast(`"${sec.name}" section restored`); reload()
  }
  const deleteSection = async (sec) => {
    if (!confirm(`Permanently delete section "${sec.name}"? Items inside will also be deleted.`)) return
    await supabase.from('sections').delete().eq('id', sec.id)
    showToast(`"${sec.name}" deleted`); reload()
  }

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>Archived</h1>
        <p style={{ color:T.muted, fontSize:13, marginTop:4 }}>Restore or permanently delete archived items and sections</p>
      </div>

      {archivedSections.length === 0 && archivedItems.length === 0 && (
        <div style={{ textAlign:'center', padding:'80px 0', opacity:.25 }}>
          <Archive size={44} style={{ margin:'0 auto 14px' }}/>
          <p style={{ fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', fontSize:13 }}>Nothing archived</p>
        </div>
      )}

      {archivedSections.length > 0 && (
        <div style={{ marginBottom:36 }}>
          <p style={{ fontSize:10, fontWeight:800, color:T.muted, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:12 }}>Archived Sections</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {archivedSections.map(sec => (
              <div key={sec.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{sec.name}</p>
                  <p style={{ margin:0, fontSize:11, color:T.muted }}>Section · {items.filter(i=>i.section_id===sec.id).length} items inside</p>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>restoreSection(sec)} style={{ background:T.accent+'22', border:`1px solid ${T.accent}44`, borderRadius:9, padding:'7px 14px', cursor:'pointer', color:T.accent, fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:5 }}>
                    <RotateCcw size={12}/> Restore
                  </button>
                  <button onClick={()=>deleteSection(sec)} style={{ background:'transparent', border:`1px solid ${T.border}`, borderRadius:9, padding:'7px 14px', cursor:'pointer', color:T.muted, fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:5 }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.red;e.currentTarget.style.color=T.red}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted}}>
                    <Trash2 size={12}/> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {archivedItems.length > 0 && (
        <div>
          <p style={{ fontSize:10, fontWeight:800, color:T.muted, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:12 }}>Archived Items</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {archivedItems.map(item => (
              <div key={item.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:'12px 18px', display:'flex', alignItems:'center', gap:14 }}>
                {item.image_url && <img src={item.image_url} alt="" style={{ width:44, height:44, borderRadius:10, objectFit:'cover', flexShrink:0 }}/>}
                {!item.image_url && <div style={{ width:44, height:44, borderRadius:10, background:T.surface, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Package size={18} color={T.muted}/></div>}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:T.text }}>{item.name}</p>
                  <p style={{ margin:0, fontSize:11, color:T.muted }}>{sections.find(s=>s.id===item.section_id)?.name || 'No section'}</p>
                </div>
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <button onClick={()=>restoreItem(item)} style={{ background:T.accent+'22', border:`1px solid ${T.accent}44`, borderRadius:9, padding:'7px 14px', cursor:'pointer', color:T.accent, fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:5 }}>
                    <RotateCcw size={12}/> Restore
                  </button>
                  <button onClick={()=>deleteItem(item)} style={{ background:'transparent', border:`1px solid ${T.border}`, borderRadius:9, padding:'7px 14px', cursor:'pointer', color:T.muted, fontSize:12, fontWeight:700, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', gap:5 }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.red;e.currentTarget.style.color=T.red}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted}}>
                    <Trash2 size={12}/> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


// ── Unread Badge ─────────────────────────────────────────────
function UnreadBadge() {
  const { notifs } = useNotifs();
  if (!notifs.length) return null;
  return (
    <span style={{ position:'absolute', top:-4, right:-4, background:T.accent, color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${T.bg}` }}>
      {notifs.length > 9 ? '9+' : notifs.length}
    </span>
  );
}

// ── Notification Panel ───────────────────────────────────────
function NotificationPanel({ onClose }) {
  const { notifs, clear } = useNotifs();
  const timeAgo = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return new Date(iso).toLocaleDateString();
  };
  const typeIcon = (type) => {
    if (type === 'error')   return <AlertCircle size={12} color='#ef4444'/>;
    if (type === 'success') return <Check size={12} color='#22c55e'/>;
    return <Info size={12} color='#3b82f6'/>;
  };
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:149 }}/>
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:320, background:T.surface, borderLeft:`1px solid ${T.border}`, zIndex:150, display:'flex', flexDirection:'column', boxShadow:'-8px 0 32px rgba(0,0,0,0.4)', animation:'slideInRight 0.22s ease' }}>
        <div style={{ padding:'18px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Bell size={15} color={T.accent}/>
            <p style={{ margin:0, fontSize:14, fontWeight:800, color:T.text }}>Activity Log</p>
            {notifs.length > 0 && <span style={{ background:T.accent, color:'#fff', borderRadius:999, padding:'1px 8px', fontSize:10, fontWeight:800 }}>{notifs.length}</span>}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {notifs.length > 0 && <button onClick={clear} style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:7, padding:'4px 10px', cursor:'pointer', color:T.muted, fontSize:10, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Clear all</button>}
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:T.muted, display:'flex', alignItems:'center' }}><X size={18}/></button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
          {notifs.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', opacity:.3, gap:10 }}>
              <Bell size={36}/><p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em' }}>No activity yet</p>
            </div>
          ) : notifs.map((n, i) => (
            <div key={n.id} style={{ display:'flex', gap:12, padding:'12px 20px', borderBottom:`1px solid ${T.border}`, background:i===0?T.accent+'08':'transparent' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:n.type==='error'?'rgba(239,68,68,0.12)':n.type==='success'?'rgba(34,197,94,0.12)':'rgba(59,130,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                {typeIcon(n.type)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:'0 0 3px', fontSize:12, fontWeight:600, color:T.text, lineHeight:1.4 }}>{n.msg}</p>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <Clock size={9} color={T.muted}/>
                  <span style={{ fontSize:10, color:T.muted }}>{timeAgo(n.time)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </>
  );
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ page, setPage, profile, onSignOut, mobileOpen, onMobileClose, onNotif }) {
  const links = [
    { id:'menu',        icon:<LayoutGrid size={16}/>,  label:'Menu Items'        },
    { id:'promotions',   icon:<Flame size={16}/>,       label:'Announcements'        },
    { id:'sections',    icon:<Menu size={16}/>,         label:'Sections'          },
    { id:'featured',    icon:<Star size={16}/>,         label:'Featured & Tagged' },
    { id:'unavailable', icon:<AlertCircle size={16}/>,  label:'Unavailable'       },
    { id:'archived',    icon:<Archive size={16}/>,      label:'Archived'          },
  ];
  const handleNav = (id) => { setPage(id); if(onMobileClose) onMobileClose(); };
  return (
    <>
      {mobileOpen && <div onClick={onMobileClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:98 }}/>}
      <div style={{ position:'fixed', top:0, left:0, bottom:0, width:220, background:T.surface, borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column', zIndex:99, transition:'transform 0.25s ease' }} className={`hdp-sidebar${mobileOpen?' open':''}`}>
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
            <img src={logoImg} alt="Hotel de Plaza" style={{ height:46, width:'auto', objectFit:'contain' }}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:T.accent+'33', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:11, fontWeight:800, color:T.accent }}>{profile?.email?.[0]?.toUpperCase()}</span>
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, fontSize:11, color:T.text, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.email}</p>
              <Tag2 color={profile?.role==='owner'?T.accent:T.blue}>{profile?.role||'staff'}</Tag2>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:3, overflowY:'auto' }}>
          {links.map(l => (
            <button key={l.id} onClick={() => handleNav(l.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:page===l.id?T.accent+'22':'transparent', color:page===l.id?T.accent:T.muted, border:page===l.id?`1px solid ${T.accent}44`:'1px solid transparent', cursor:'pointer', fontSize:13, fontWeight:page===l.id?700:500, transition:'all 0.15s', textAlign:'left', fontFamily:"'DM Sans',sans-serif", width:'100%' }}>
              {l.icon}<span style={{ marginLeft:2 }}>{l.label}</span>
            </button>
          ))}
          {/* Activity bell */}
          <button onClick={onNotif} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, background:'transparent', color:T.muted, border:'1px solid transparent', cursor:'pointer', fontSize:13, fontWeight:500, transition:'all 0.15s', textAlign:'left', fontFamily:"'DM Sans',sans-serif", width:'100%', position:'relative' }}
            onMouseEnter={e => { e.currentTarget.style.background=T.border+'44'; e.currentTarget.style.color=T.text; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=T.muted; }}>
            <Bell size={16}/><span style={{ marginLeft:2 }}>Activity Log</span>
            <UnreadBadge/>
          </button>
        </nav>
        <div style={{ padding:'12px', borderTop:`1px solid ${T.border}` }}>
          <button onClick={onSignOut} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', width:'100%', background:'transparent', border:'none', color:T.muted, cursor:'pointer', fontSize:12, fontWeight:600, borderRadius:8, fontFamily:"'DM Sans',sans-serif" }}>
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

// Map usernames to their internal emails (hidden from UI)
const USERNAME_MAP = {
  'owner':   'owner@plaza.com',
  'manager': 'manager@plaza.com',
  'staff':   'staff@plaza.com',
};


export default function AdminApp() {
  const [profile,  setProfile]  = useState({ id:'owner', email:'owner@plaza.com', role:'owner' });
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState('menu');
  const [sections, setSections] = useState([]);
  const [items,    setItems]    = useState([]);
  const [toast,    setToast]    = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
    addNotif(msg, type);
  };



  const loadData = useCallback(async () => {
    const [{ data:secs }, { data:its }] = await Promise.all([
      supabase.from('sections').select('*').order('display_order'),
      supabase.from('menu_items').select('*').order('created_at', { ascending:false }),
    ]);
    setSections(secs||[]); setItems(its||[]);
  }, []);


  useEffect(() => { loadData(); }, [loadData]);

  const isTrial = false;

  return (
    <div style={{ background:T.bg, minHeight:'100vh', color:T.text, fontFamily:"'DM Sans',sans-serif", display:'flex' }}>
      <Sidebar
        page={page} setPage={setPage} profile={profile}
        onSignOut={async () => { await supabase.auth.signOut(); }}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        onNotif={() => setNotifOpen(o => !o)}
      />

      {/* Main content area */}
      <div className="hdp-main">
        {/* Mobile top bar */}
        <div className="hdp-topbar">
          <button onClick={() => setSidebarOpen(true)} style={{ background:'none', border:`1px solid ${T.border}`, borderRadius:9, padding:'7px 9px', cursor:'pointer', color:T.text, display:'flex', alignItems:'center' }}>
            <Menu size={17}/>
          </button>
          <img src={logoImg} alt="Hotel de Plaza" style={{ height:30, objectFit:'contain' }}/>
          <button onClick={() => setNotifOpen(o => !o)} style={{ position:'relative', background:'none', border:`1px solid ${T.border}`, borderRadius:9, padding:'7px 9px', cursor:'pointer', color:T.text, display:'flex', alignItems:'center' }}><Bell size={16}/><UnreadBadge/></button>
        </div>

        {/* Page */}
        <div className="hdp-content">

          {page==='menu'        && <MenuManager        sections={sections} items={items} reload={loadData} showToast={showToast} profile={profile}/>}
          {page==='sections'    && <SectionsManager    sections={sections} items={items} reload={loadData} showToast={showToast}/>}
          {page==='promotions'  && <PromotionsManager showToast={showToast}/>}
          {page==='featured'    && <FeaturedTaggedManager items={items} sections={sections} reload={loadData} showToast={showToast}/>}
          {page==='unavailable'  && <UnavailableManager  items={items} sections={sections} reload={loadData} showToast={showToast}/>}
          {page==='archived'    && <ArchivedManager    sections={sections} items={items} reload={loadData} showToast={showToast}/>}
        {/* ── Admin Footer ── */}
        <footer style={{ marginTop: 60, borderTop: `1px solid ${T.border}`, padding: '20px 0 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            {/* Left — NWS credit */}
            <a href="https://nihmathullah.com/web-services" target="_blank" rel="noopener noreferrer"
              style={{ color: T.muted, fontSize: 11, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = T.accent}
              onMouseLeave={e => e.currentTarget.style.color = T.muted}
            >
              Designed &amp; Built by NWS
            </a>

            {/* Center — support */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <p style={{ margin: 0, fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Need help? Contact support</p>
              <div style={{ display: 'flex', gap: 14 }}>
                <a href="tel:+94769066840" style={{ color: T.accent, fontSize: 12, textDecoration: 'none', fontWeight: 700, fontFamily: 'monospace' }}>+94 76 906 6840</a>
                <span style={{ color: T.border }}>|</span>
                <a href="https://wa.me/94769066840?text=Hi, I need help with the Hotel de Plaza admin panel"
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: '#22c55e', fontSize: 12, textDecoration: 'none', fontWeight: 700 }}>WhatsApp Support</a>
              </div>
            </div>

            {/* Right — copyright */}
            <p style={{ margin: 0, fontSize: 11, color: T.muted }}>
              © {new Date().getFullYear()} Hotel de Plaza
            </p>
          </div>
        </footer>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type}/>}
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)}/>}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg};overflow-x:hidden}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* ── Desktop layout ── */
        .hdp-sidebar { transform:translateX(0) !important; }
        .hdp-topbar  { display:none; }
        .hdp-main    { flex:1; overflow-y:auto; margin-left:220px; min-width:0; display:flex; flex-direction:column; }
        .hdp-content { padding:32px; flex:1; }
        .tbl-scroll  { overflow-x:auto; -webkit-overflow-scrolling:touch; }

        /* ── Mobile layout ── */
        @media(max-width:768px){
          .hdp-sidebar {
            transform:translateX(-100%) !important;
            width:280px !important;
            z-index:200 !important;
            position:fixed !important;
            top:0; left:0; bottom:0;
          }
          .hdp-sidebar.open { transform:translateX(0) !important; }
          .hdp-topbar {
            display:flex !important; align-items:center; justify-content:space-between;
            padding:12px 16px;
            background:${T.surface};
            border-bottom:1px solid ${T.border};
            position:sticky; top:0; z-index:50;
          }
          .hdp-main    { margin-left:0 !important; }
          .hdp-content { padding:12px 10px; }
          .tbl-scroll  { overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:12px; }

          /* Stack stat cards vertically */
          .stat-grid   { grid-template-columns:1fr 1fr !important; gap:8px !important; }

          /* Make modal full screen on mobile */
          .modal-wide  { max-width:100% !important; margin:0 !important; border-radius:16px 16px 0 0 !important; position:fixed !important; bottom:0 !important; left:0 !important; right:0 !important; max-height:92vh !important; overflow-y:auto !important; }
          .modal-grid  { grid-template-columns:1fr !important; }

          /* Announcement modal stacks on mobile */
          .promo-grid  { grid-template-columns:1fr !important; }

          /* Item rows on mobile */
          .item-row { grid-template-columns:44px 1fr auto !important; gap:8px !important; flex-wrap:wrap; }
          .item-row .col-price { display:none; }
          .item-row .col-tags  { display:none; }
          .item-row .col-feat  { display:none; }
        }
      `}</style>
    </div>
  );
}