import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ShoppingBag, Sun, Moon, ChevronUp,
  Utensils, AlertCircle, ArrowLeft, Phone, X, SlidersHorizontal,
  Award, Zap, Crown, Leaf, Sparkles
} from 'lucide-react'
import { supabase } from './lib/supabase'
import logoImg from './assets/img/logo.png'

const UBER_EATS_URL = 'https://www.ubereats.com/lk/store/hotel-de-plaza-kollupitiya/k2Cg1H4dQ-qzn_X1DUyJmg?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMiUyMERhd3NvbiUyMFN0JTIyJTJDJTIycmVmZXJlbmNlJTIyJTNBJTIyQ2hJSmlhNnpWV3RaNGpvUjRGbE95V3VlMmtzJTIyJTJDJTIycmVmZXJlbmNlVHlwZSUyMiUzQSUyMmdvb2dsZV9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTYuOTE5NDEwMiUyQyUyMmxvbmdpdHVkZSUyMiUzQTc5Ljg1NzU1NTQ5OTk5OTk5JTdE&ps=1?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMiUyMERhd3NvbiUyMFN0JTIyJTJDJTIycmVmZXJlbmNlJTIyJTNBJTIyQ2hJSmlhNnpWV3RaNGpvUjRGbE95V3VlMmtzJTIyJTJDJTIycmVmZXJlbmNlVHlwZSUyMiUzQSUyMmdvb2dsZV9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTYuOTE5NDEwMiUyQyUyMmxvbmdpdHVkZSUyMiUzQTc5Ljg1NzU1NTQ5OTk5OTk5JTdE&ps=1?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMiUyMERhd3NvbiUyMFN0JTIyJTJDJTIycmVmZXJlbmNlJTIyJTNBJTIyQ2hJSmlhNnpWV3RaNGpvUjRGbE95V3VlMmtzJTIyJTJDJTIycmVmZXJlbmNlVHlwZSUyMiUzQSUyMmdvb2dsZV9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTYuOTE5NDEwMiUyQyUyMmxvbmdpdHVkZSUyMiUzQTc5Ljg1NzU1NTQ5OTk5OTk5JTdE&ps=1?diningMode=DELIVERY&pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMjEyMiUyMERhd3NvbiUyMFN0JTIyJTJDJTIycmVmZXJlbmNlJTIyJTNBJTIyQ2hJSmlhNnpWV3RaNGpvUjRGbE95V3VlMmtzJTIyJTJDJTIycmVmZXJlbmNlVHlwZSUyMiUzQSUyMmdvb2dsZV9wbGFjZXMlMjIlMkMlMjJsYXRpdHVkZSUyMiUzQTYuOTE5NDEwMiUyQyUyMmxvbmdpdHVkZSUyMiUzQTc5Ljg1NzU1NTQ5OTk5OTk5JTdE&ps=1'
const WHATSAPP_NUM  = '94772356969'
const WHATSAPP_MSG  = encodeURIComponent('Hello, I have a question about your menu.')

const TAG_CONFIG = {
  best_seller:   { label: 'Best Seller',   color: '#e85b25', icon: <Award size={10} /> },
  new_item:      { label: 'New Item',      color: '#3b82f6', icon: <Sparkles size={10} /> },
  fast_moving:   { label: 'Fast Moving',   color: '#f59e0b', icon: <Zap size={10} /> },
  chefs_special: { label: "Chef's Special",color: '#8b5cf6', icon: <Crown size={10} /> },
  seasonal:      { label: 'Seasonal',      color: '#22c55e', icon: <Leaf size={10} /> },
}

// ── Full fallback menu ────────────────────────────────────────
const FALLBACK_MENU = [
  { category: "Kottu Zone", display_order: 1, subcategories: [
    { title: "Cheese Kottu", items: [
      { name: "Prawn Cheese Kottu", price: 1280 },
      { name: "Chicken Cheese Kottu", m: 1230, l: 1880 },
      { name: "Egg Cheese Kottu", m: 880, l: 1320 },
      { name: "Vegetable Cheese Kottu", price: 760 },
      { name: "Beef Cheese Kottu", m: 1410, l: 1920 },
      { name: "Kurma Chicken Cheese Kottu", price: 1310 },
      { name: "Tandoori Chicken Cheese Kottu", price: 1280 },
      { name: "Butter Chicken Cheese Kottu", price: 1310 },
    ]},
    { title: "Dolphin Kottu", items: [
      { name: "Chicken Cheese Dolphin", m: 1350, l: 1950 },
      { name: "Chicken Cheese Masala Dolphin", m: 1350, l: 1950 },
      { name: "Beef Cheese Dolphin", m: 1450, l: 2050 },
    ]},
    { title: "Palandi & Masala Kottu", items: [
      { name: "Chicken Cheese Palandi Kottu", m: 1270, l: 1950 },
      { name: "Beef Cheese Palandi Kottu", m: 1400, l: 2050 },
      { name: "Chicken Cheese Masala Kottu", m: 1270, l: 1950 },
      { name: "Beef Cheese Masala Kottu", m: 1400, l: 2050 },
    ]},
    { title: "Rotti Kottu", items: [
      { name: "Prawn Kottu", price: 1100 },
      { name: "Egg Kottu", price: 620 },
      { name: "Chicken Kottu", price: 950 },
      { name: "Beef Kottu (Curry)", price: 1250 },
      { name: "Beef Kottu (Devilled)", price: 1350 },
      { name: "Fish Kottu", price: 900 },
      { name: "Butter Chicken Kottu", price: 1030 },
    ]},
  ]},
  { category: "Main Meals", display_order: 2, subcategories: [
    { title: "Biriyani", items: [
      { name: "Basmati Biryani Chicken", m: 950, l: 1420 },
      { name: "Basmati Biryani Beef", m: 1250, l: 1670 },
      { name: "Prawns Biriyani", m: 1200, l: 1700 },
      { name: "Mini Biriyani Chicken", price: 660 },
    ]},
    { title: "Fried Rice", items: [
      { name: "Chicken Fried Rice", m: 920, l: 1320 },
      { name: "Beef Fried Rice", m: 1200, l: 1420 },
      { name: "Egg Fried Rice", m: 620, l: 850 },
      { name: "Prawn Fried Rice", m: 1050, l: 1450 },
      { name: "Mixed Fried Rice", price: 1350 },
      { name: "Nasi Goreng Chicken", m: 1200, l: 1600 },
    ]},
    { title: "Roast Chicken", items: [
      { name: "Roast Chicken Full", price: 2400 },
      { name: "Roast Chicken 1/2", price: 1200 },
      { name: "Roast Chicken 1/4", price: 600 },
    ]},
    { title: "Noodles & Macaroni", items: [
      { name: "Chicken Noodles", m: 950, l: 1330 },
      { name: "Beef Noodles", m: 1210, l: 1560 },
      { name: "Chicken Cheese Macaroni", m: 1230, l: 1880 },
      { name: "Beef Cheese Macaroni", m: 1360, l: 1950 },
    ]},
    { title: "Rice and Curry", items: [
      { name: "Rice and Curry Chicken", price: 480 },
      { name: "Rice and Curry Egg", price: 360 },
      { name: "Rice and Curry Vegetable", price: 320 },
      { name: "Rice and Curry Beef", price: 550 },
    ]},
  ]},
  { category: "String Hopper Zone", display_order: 3, subcategories: [
    { title: "String Hopper Specials", items: [
      { name: "String Hopper Egg Kottu", m: 580, l: 880 },
      { name: "String Hopper Chicken Kottu", m: 950, l: 1380 },
      { name: "String Hopper Beef Curry Kottu", m: 1210, l: 1560 },
      { name: "String Hopper Chicken Cheese Kottu", m: 1230, l: 1880 },
      { name: "String Hopper Beef Cheese Kottu", m: 1410, l: 1920 },
    ]},
    { title: "Portions", items: [
      { name: "String Hoppers (Each)", price: 15 },
      { name: "Dhal Curry", price: 150 },
      { name: "Chicken Curry (Portion)", price: 360 },
      { name: "Pol Sambol", price: 50 },
    ]},
  ]},
  { category: "Indian Selection", display_order: 4, subcategories: [
    { title: "Indian Chicken Curries", items: [
      { name: "Chicken Kurma", price: 950 },
      { name: "Chicken Kadai", price: 1150 },
      { name: "Butter Chicken Masala", price: 1220 },
      { name: "Pepper Chicken", price: 1120 },
      { name: "Afghani Chicken", price: 1120 },
    ]},
    { title: "Naan & Rotis", items: [
      { name: "Plain Naan Rotti", price: 180 },
      { name: "Garlic Naan", price: 220 },
      { name: "Cheese Naan", price: 380 },
      { name: "Butter Naan", price: 280 },
      { name: "Chapathi", price: 220 },
      { name: "Tandoori Rotti", price: 240 },
    ]},
    { title: "Tandoori", items: [
      { name: "Chicken Tikka (5 pcs)", price: 1080 },
      { name: "Tandoori Chicken 1/4", price: 600 },
      { name: "Malai Tikka (5 pcs)", price: 1180 },
      { name: "Kabab (5 pcs)", price: 1180 },
    ]},
  ]},
  { category: "Rotti Zone", display_order: 5, subcategories: [
    { title: "Rotti Specials", items: [
      { name: "Paratha", price: 130 },
      { name: "Egg Rotty", price: 200 },
      { name: "Prawn Wrap", price: 1380 },
      { name: "Chicken Cheese Rotti", price: 1210 },
      { name: "Beef Cheese Rotti", price: 1360 },
      { name: "Chocolate Rotti", price: 680 },
      { name: "Creamy Pistachio Rotti", price: 780 },
    ]},
    { title: "Rotti Portions", items: [
      { name: "Cheese Egg Rotty Portion Chicken", price: 1780 },
      { name: "Egg Rotty Portion Chicken", price: 1280 },
      { name: "Egg Rotty Portion Beef", price: 1330 },
    ]},
  ]},
  { category: "Shorties & Starters", display_order: 6, subcategories: [
    { title: "Bakery", items: [
      { name: "Chicken Rotti", price: 130 },
      { name: "Egg Roll", price: 130 },
      { name: "Beef Samosa", price: 140 },
      { name: "Fish Cutlet", price: 80 },
      { name: "Chicken Cheese Roll", price: 200 },
    ]},
    { title: "Starters", items: [
      { name: "Chicken 65", price: 1450 },
      { name: "Chicken Lollypop", price: 1440 },
      { name: "Prawns Fry", price: 1150 },
      { name: "French Fries", price: 800 },
      { name: "Fish Tawa", price: 880 },
    ]},
  ]},
  { category: "Curry Portions", display_order: 7, subcategories: [
    { title: "Chicken", items: [
      { name: "Full Chicken Palandi Curry", price: 3400 },
      { name: "1/2 Chicken Palandi Curry", price: 1750 },
      { name: "1/4 Chicken Palandi Curry", price: 850 },
      { name: "Chicken Curry Portion", price: 750 },
      { name: "Devilled Chicken Piece", price: 380 },
    ]},
    { title: "Seafood", items: [
      { name: "Prawn Curry", price: 1050 },
      { name: "Prawn Masala", price: 1050 },
      { name: "Prawn Devilled", price: 1240 },
      { name: "Fish Devilled", price: 800 },
      { name: "Cuttle Fish", price: 1220 },
    ]},
  ]},
  { category: "Sawan Platters", display_order: 8, subcategories: [
    { title: "Group Portions", items: [
      { name: "Chicken Biriyani Sawan", price: 8500 },
      { name: "Beef Biriyani Sawan", price: 9500 },
      { name: "Chicken Kottu Sawan", price: 7200 },
      { name: "Chicken Fried Rice Sawan", price: 6500 },
    ]},
  ]},
  { category: "Beverages", display_order: 9, subcategories: [
    { title: "Cold Drinks", items: [
      { name: "Plaza Special Iced Milo", price: 650 },
      { name: "Orange Juice", price: 530 },
      { name: "Lime Juice", price: 350 },
      { name: "Vanilla Milkshake", price: 650 },
      { name: "Chocolate Milkshake", price: 650 },
      { name: "Mango Lassi", price: 550 },
      { name: "Faluda", price: 380 },
    ]},
    { title: "Hot Drinks", items: [
      { name: "Milk Tea", price: 150 },
      { name: "Plain Tea", price: 50 },
      { name: "Nescafe", price: 220 },
      { name: "Hot Milo", price: 220 },
    ]},
  ]},
  { category: "Desserts", display_order: 10, subcategories: [
    { title: "Sweet Endings", items: [
      { name: "Wattalappan Regular", price: 400 },
      { name: "Wattalappan Large", price: 750 },
      { name: "Brownies", price: 220 },
      { name: "Brownies with Ice Cream", price: 350 },
    ]},
  ]},
  { category: "Add Ons", display_order: 11, subcategories: [
    { title: "Extras", items: [
      { name: "Onion Sambol", price: 240 },
      { name: "Extra Cheese", price: 140 },
      { name: "Extra Egg", price: 90 },
      { name: "Boiled Egg", price: 90 },
      { name: "Omelette", price: 220 },
    ]},
  ]},
]

// ── Smart search engine ───────────────────────────────────────
// Handles: exact, partial substring, typos, phonetic variants
// Examples: biriani→biriyani, chiken→chicken, kotu→kottu

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m+1 }, (_, i) =>
    Array.from({ length: n+1 }, (_, j) => i===0 ? j : j===0 ? i : 0)
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

// Normalize a word — collapse double letters, strip extra vowels
// biriyani → biriani → birani (phonetic skeleton)
function normalize(s) {
  return s
    .toLowerCase()
    .replace(/(.)\1+/g, '$1')     // collapse doubles: kottu→kotu, birrr→bir
    .replace(/[aeiou]+/g, 'V')    // collapse vowel runs to V placeholder
    .replace(/[^a-z]/g, '')       // strip non-alpha
}

// Score a single query word against a single target word
function wordScore(qw, tw) {
  if (tw === qw) return 1
  if (tw.startsWith(qw) || tw.includes(qw)) return 0.95
  // direct edit distance
  const direct = 1 - levenshtein(qw, tw) / Math.max(qw.length, tw.length)
  if (direct >= 0.65) return direct
  // phonetic normalized distance
  const phonetic = 1 - levenshtein(normalize(qw), normalize(tw)) / Math.max(normalize(qw).length || 1, normalize(tw).length || 1)
  return Math.max(direct, phonetic * 0.9)
}

// Match a full query string against a full item name
// Returns { match, score, correctedWords }
function smartMatch(query, itemName) {
  const q = query.toLowerCase().trim()
  const t = itemName.toLowerCase()
  if (!q) return { match: true, score: 1, corrected: [] }

  // 1. Direct substring — instant match
  if (t.includes(q)) return { match: true, score: 1, corrected: [] }

  const qWords = q.split(/\s+/)
  const tWords = t.split(/\s+/)

  // 2. Each query word vs best matching target word
  let totalScore = 0
  const corrected = []
  for (const qw of qWords) {
    let best = { score: 0, word: qw }
    for (const tw of tWords) {
      const s = wordScore(qw, tw)
      if (s > best.score) best = { score: s, word: tw }
    }
    totalScore += best.score
    corrected.push(best.word)
  }
  const avg = totalScore / qWords.length

  // 3. Also try matching the full query string against full item name
  const fullScore = wordScore(q.replace(/\s+/g, ''), t.replace(/\s+/g, ''))

  const finalScore = Math.max(avg, fullScore)

  // threshold: 0.5 — intentionally lenient to catch biriani/biriyani
  return {
    match: finalScore >= 0.5,
    score: finalScore,
    corrected: finalScore < 0.92 ? corrected : [],
  }
}

function searchMenu(sections, query) {
  if (!query.trim()) return { sections, suggestion: null }
  let suggestion = null, maxScore = 0

  // Collect all item names to find best global suggestion
  const allNames = sections.flatMap(c =>
    c.subcategories.flatMap(s => s.items.map(i => i.name))
  )
  for (const name of allNames) {
    const r = smartMatch(query, name)
    if (r.match && r.score > maxScore && r.corrected.length > 0) {
      maxScore = r.score
      suggestion = r.corrected.join(' ')
    }
  }

  const filtered = sections.map(cat => ({
    ...cat,
    subcategories: (cat.subcategories||[]).map(sub => ({
      ...sub,
      items: (sub.items||[]).filter(item => {
        const r = smartMatch(query, item.name)
        return r.match
      }),
    })).filter(s => s.items.length > 0),
  })).filter(c => c.subcategories.length > 0)
  return { sections: filtered, suggestion }
}

function mapSupabase(secs, items) {
  return secs.filter(s => !s.archived).sort((a,b) => a.display_order-b.display_order).map(sec => ({
    id: sec.id, category: sec.name, display_order: sec.display_order,
    subcategories: [{
      title: sec.name,
      items: items
        .filter(it => it.section_id===sec.id && !it.archived)
        .sort((a,b) => (a.display_order||0) - (b.display_order||0))
        .map(it => ({
        id: it.id, name: it.name, image_url: it.image_url,
        available: it.available, featured: it.featured,
        tags: it.tags || [],
        ...(it.price_type==='single'
          ? { price: Number(it.price_single) }
          : { m: Number(it.price_medium), l: Number(it.price_large) }),
      })),
    }],
  })).filter(c => c.subcategories[0].items.length > 0)
}

// ── Item Card ─────────────────────────────────────────────────
function ItemCard({ item, T, dark }) {
  const [hov, setHov] = useState(false)
  const avail  = item.available !== false
  const multi  = item.m !== undefined || item.l !== undefined
  const hasImg = !!item.image_url

  const PriceBlock = () => multi ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {item.m && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 1 }}>Med</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: dark ? '#f0ece6' : '#1a1410', fontFamily: 'monospace' }}>Rs.{item.m.toLocaleString()}</span>
        </div>
      )}
      {item.m && item.l && <div style={{ width: 1, height: 28, background: dark ? '#2a2a2a' : '#e8e2d9' }}/>}
      {item.l && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 1 }}>Lrg</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: T.accent, fontFamily: 'monospace' }}>Rs.{item.l.toLocaleString()}</span>
        </div>
      )}
    </div>
  ) : (
    <span style={{ fontSize: 18, fontWeight: 800, color: T.accent, fontFamily: 'monospace' }}>
      Rs.{item.price?.toLocaleString()}
    </span>
  )

  const Tags = () => item.tags?.length > 0 ? (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {item.tags.slice(0, 2).map(key => {
        const cfg = TAG_CONFIG[key]
        if (!cfg) return null
        return (
          <span key={key} style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: cfg.color + '18', color: cfg.color,
            border: `1px solid ${cfg.color}44`,
            borderRadius: 7, padding: '3px 8px',
            fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>{cfg.icon} {cfg.label}</span>
        )
      })}
    </div>
  ) : null

  const AvailDot = () => (
    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
      background: avail ? '#22c55e' : '#ef4444',
      boxShadow: avail ? '0 0 6px #22c55e88' : '0 0 6px #ef444488' }}/>
  )

  const cardBase = {
    background:   dark ? '#161616' : '#ffffff',
    border:       `1.5px solid ${hov ? T.accent : (dark ? '#2a2a2a' : '#e8e2d9')}`,
    borderRadius: 18, overflow: 'hidden',
    transition:   'all 0.22s ease',
    transform:    hov ? 'translateY(-3px)' : 'none',
    boxShadow:    hov
      ? `0 12px 36px ${dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`
      : `0 2px 8px ${dark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.04)'}`,
    opacity:      avail ? 1 : 0.55,
    position:     'relative',
  }

  if (hasImg) {
    // ── WITH IMAGE: image on top, content below
    return (
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={cardBase}>
        {/* Image */}
        <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
          <img src={item.image_url} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s', transform: hov ? 'scale(1.06)' : 'scale(1)' }}/>
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }}/>
          {/* Tags on image */}
          {item.tags?.length > 0 && (
            <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', gap: 4 }}>
              {item.tags.slice(0,2).map(key => {
                const cfg = TAG_CONFIG[key]; if (!cfg) return null
                return <span key={key} style={{ background: cfg.color, color:'#fff', borderRadius:6, padding:'2px 8px', fontSize:9, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', display:'inline-flex', alignItems:'center', gap:3 }}>{cfg.icon}{cfg.label}</span>
              })}
            </div>
          )}
        </div>
        {/* Body */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ margin: 0, flex: 1, fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.35 }}>{item.name}</p>
            <AvailDot/>
          </div>
          <PriceBlock/>
        </div>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: hov?T.accent:'transparent', borderRadius:'18px 0 0 18px', transition:'background 0.22s' }}/>
      </div>
    )
  }

  // ── WITHOUT IMAGE: horizontal layout — left accent bar + content
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...cardBase, display: 'flex' }}>
      {/* Left accent bar */}
      <div style={{ width: 4, flexShrink: 0, background: hov ? T.accent : (dark ? '#252525' : '#ede8e1'), transition: 'background 0.22s' }}/>
      {/* Content */}
      <div style={{ flex: 1, padding: '16px 16px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ margin: 0, flex: 1, fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.35 }}>{item.name}</p>
          <AvailDot/>
        </div>
        {/* Price */}
        <PriceBlock/>
        {/* Tags */}
        <Tags/>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
export default function MenuPage() {
  const navigate = useNavigate()
  const [dark, setDark]             = useState(true)
  const [activeCat, setActiveCat]   = useState('All')
  const [search, setSearch]         = useState('')
  const [scrolled, setScrolled]     = useState(false)
  const [menuData, setMenuData]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [waPulse, setWaPulse]       = useState(false)
  const [showSearch, setShowSearch]   = useState(true)
  const [filterAvail, setFilterAvail] = useState(false)
  const [filterTag, setFilterTag]     = useState(null)
  const [showFilter, setShowFilter]   = useState(false)
  const searchRef   = useRef(null)
  const sectionRefs = useRef({})

  useEffect(() => {
    const t = setInterval(() => { setWaPulse(true); setTimeout(() => setWaPulse(false), 1000) }, 8000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 60)
  }, [showSearch])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        const [{ data: secs }, { data: its }] = await Promise.all([
          supabase.from('sections').select('*').eq('archived', false).order('display_order'),
          supabase.from('menu_items').select('*').eq('archived', false),
        ])
        if (!alive) return
        const mapped = secs?.length ? mapSupabase(secs, its || []) : null
        setMenuData(mapped?.length ? mapped : null)
      } catch { if (alive) setMenuData(null) }
      finally { if (alive) setLoading(false) }
    })()
    return () => { alive = false }
  }, [])

  const base = menuData ?? FALLBACK_MENU
  const { sections: searched, suggestion } = useMemo(() => searchMenu(base, search), [base, search])
  // Apply availability + tag filters
  const filteredMenu = useMemo(() => {
    return searched.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.map(sub => ({
        ...sub,
        items: sub.items.filter(item => {
          if (filterAvail && item.available === false) return false
          if (filterTag && !(item.tags || []).includes(filterTag)) return false
          return true
        }),
      })).filter(s => s.items.length > 0),
    })).filter(c => c.subcategories.length > 0)
  }, [searched, filterAvail, filterTag])

  const menuWithAll = useMemo(() => [
    { category: 'All', subcategories: filteredMenu.flatMap(c => c.subcategories) },
    ...filteredMenu,
  ], [filteredMenu])

  // Item counts per category (unfiltered — for pill badges)
  const itemCounts = useMemo(() => {
    const counts = { All: searched.flatMap(c => c.subcategories.flatMap(s => s.items)).length }
    searched.forEach(c => { counts[c.category] = c.subcategories.flatMap(s => s.items).length })
    return counts
  }, [searched])

  const active     = menuWithAll.find(c => c.category === activeCat) || menuWithAll[0]
  const totalItems = active?.subcategories.flatMap(s => s.items).length || 0

  const T = {
    bg:      dark ? '#0a0a0a' : '#f4f0eb',
    surface: dark ? '#111'    : '#fff',
    card:    dark ? '#161616' : '#fff',
    border:  dark ? '#222'    : '#e8e2d9',
    text:    dark ? '#f0ece6' : '#1a1410',
    muted:   dark ? '#555'    : '#9a9088',
    accent:  '#e85b25',
    green:   '#22c55e',
    red:     '#ef4444',
  }

  return (
    <div onClick={() => setShowFilter(false)} style={{ background: T.bg, color: T.text, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ══ SINGLE CLEAN BAR ════════════════════════════════ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: dark ? 'rgba(10,10,10,0.98)' : 'rgba(244,240,235,0.98)',
        borderBottom: `1px solid ${T.border}`,
        backdropFilter: 'blur(24px)',
      }}>
        {/* Main row */}
        <div className='menu-topbar-row' style={{ padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Back + Brand */}
          <button onClick={() => navigate('/')} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 10, padding: '7px 12px', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", flexShrink: 0, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted }}
          >
            <ArrowLeft size={13} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <img src={logoImg} alt="Hotel de Plaza" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
            <div>
              <p style={{ margin: 0, fontSize: 9, color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Open 24/7
              </p>
            </div>
          </div>

          {/* Search — expands inline */}
          <div className='search-wrap' style={{ flex: 1, position: 'relative', minWidth: 0 }}>
            {showSearch ? (
              <div style={{ position: 'relative', animation: 'slideDown 0.18s ease' }}>
                <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search menu…  try 'biriani', 'chiken kotu'…"
                  style={{ width: '100%', background: dark ? '#1c1c1c' : '#fff', border: `1.5px solid ${T.accent}`, borderRadius: 10, padding: '9px 36px 9px 34px', fontSize: 12, color: T.text, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif" }}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: T.border, border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.muted }}>
                    <X size={9} />
                  </button>
                )}
              </div>
            ) : (
              /* "Did you mean" chip when search closed but suggestion exists */
              suggestion && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: dark ? '#1a1a1a' : '#fff8f4', border: `1px solid ${T.accent}44`, borderRadius: 8, animation: 'slideDown 0.18s ease' }}>
                  <AlertCircle size={11} color={T.accent} />
                  <span style={{ fontSize: 11, color: T.muted }}>
                    Did you mean{' '}
                    <button onClick={() => { setSearch(suggestion); setShowSearch(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontWeight: 800, fontSize: 11, padding: 0, textDecoration: 'underline' }}>{suggestion}</button>?
                  </span>
                </div>
              )
            )}
          </div>

          {/* Right action buttons */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            {/* Search toggle */}
            <button onClick={() => { setShowSearch(s => !s); if (showSearch) setSearch('') }}
              style={{ background: showSearch ? T.accent : 'transparent', border: `1px solid ${showSearch ? T.accent : T.border}`, borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: showSearch ? '#fff' : T.muted, transition: 'all 0.2s', position: 'relative' }}>
              <Search size={14} />
            </button>

            {/* Filter button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFilter(f => !f)}
                style={{
                  background: (filterAvail || filterTag) ? T.accent + '18' : 'transparent',
                  border: `1px solid ${(filterAvail || filterTag) ? T.accent : T.border}`,
                  borderRadius: 10, width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: (filterAvail || filterTag) ? T.accent : T.muted,
                  transition: 'all 0.2s', position: 'relative',
                }}>
                <SlidersHorizontal size={14} />
                {(filterAvail || filterTag) && (
                  <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
                )}
              </button>

              {/* Filter dropdown */}
              {showFilter && (
                <div style={{
                  position: 'absolute', top: 44, right: 0, zIndex: 200,
                  background: dark ? '#1a1a1a' : '#fff',
                  border: `1px solid ${T.border}`,
                  borderRadius: 16, padding: 18, width: 240,
                  boxShadow: `0 16px 40px ${dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)'}`,
                  animation: 'slideDown 0.18s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.text, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filters</p>
                    {(filterAvail || filterTag) && (
                      <button onClick={() => { setFilterAvail(false); setFilterTag(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.accent, fontSize: 11, fontWeight: 700, padding: 0 }}>Clear all</button>
                    )}
                  </div>

                  {/* Available only */}
                  <div
                    onClick={() => setFilterAvail(f => !f)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, border: `1px solid ${filterAvail ? '#22c55e44' : T.border}`, background: filterAvail ? 'rgba(34,197,94,0.08)' : 'transparent', cursor: 'pointer', marginBottom: 10, transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Available only</span>
                    </div>
                    <div style={{ width: 36, height: 20, borderRadius: 999, background: filterAvail ? '#22c55e' : T.border, position: 'relative', transition: 'background 0.2s' }}>
                      <div style={{ position: 'absolute', top: 3, left: filterAvail ? 19 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>

                  {/* Tag filters */}
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Item Type</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                      <div key={key}
                        onClick={() => setFilterTag(t => t === key ? null : key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: `1px solid ${filterTag === key ? cfg.color + '55' : T.border}`, background: filterTag === key ? cfg.color + '12' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: filterTag === key ? cfg.color : T.text, flex: 1 }}>{cfg.label}</span>
                        {filterTag === key && <span style={{ fontSize: 10, color: cfg.color, fontWeight: 800 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Uber Eats */}
            <a href={UBER_EATS_URL} target="_blank" rel="noopener noreferrer"
              style={{ background: T.accent, color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, boxShadow: `0 4px 12px ${T.accent}44`, whiteSpace: 'nowrap' }}>
              <ShoppingBag size={12} />
              <span className="hide-sm">Uber Eats</span>
            </a>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text }}>
              {dark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>

        {/* Category pills — single row */}
        <div className='menu-pills-row no-scrollbar' style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '0 24px 12px' }}>
          {menuWithAll.map(cat => {
            const count = itemCounts[cat.category] || 0
            const isActive = activeCat === cat.category
            return (
              <button key={cat.category}
                onClick={() => {
                  setActiveCat(cat.category)
                  setShowFilter(false)
                  if (cat.category !== 'All') {
                    const firstSub = cat.subcategories?.[0]?.title
                    const el = firstSub ? sectionRefs.current[firstSub] : null
                    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
                    else window.scrollTo({ top: 0, behavior: 'smooth' })
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className='menu-pill' style={{
                  whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: 10,
                  border: `1.5px solid ${isActive ? T.accent : T.border}`,
                  background: isActive ? T.accent : T.surface,
                  color: isActive ? '#fff' : T.muted,
                  fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.18s',
                  fontFamily: "'DM Sans',sans-serif",
                  boxShadow: isActive ? `0 4px 10px ${T.accent}44` : 'none',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                {cat.category}
                <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : T.border, color: isActive ? '#fff' : T.muted, borderRadius: 999, padding: '1px 6px', fontSize: 9, fontWeight: 800 }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ══ LAYOUT ═══════════════════════════════════════════ */}
      <div className='menu-layout' style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px 100px', display: 'flex', gap: 36 }}>

        {/* Sidebar — desktop only */}
        <aside className='menu-sidebar' style={{ width: 210, flexShrink: 0, paddingTop: 36 }}>
          <div style={{ position: 'sticky', top: 130 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 14 }}>Sections</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {base.map(cat => {
                const isActive = activeCat === cat.category
                return (
                  <button key={cat.category}
                    onClick={() => { setActiveCat(cat.category); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    style={{
                      background: isActive ? T.accent + '15' : 'transparent',
                      color: isActive ? T.accent : T.muted,
                      border: 'none',
                      borderLeft: `3px solid ${isActive ? T.accent : 'transparent'}`,
                      borderRadius: '0 10px 10px 0',
                      padding: '10px 14px', fontSize: 12,
                      fontWeight: isActive ? 800 : 500,
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = T.text; e.currentTarget.style.background = dark ? '#1a1a1a' : '#f0ece6' }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = 'transparent' }}}
                  >
                    {cat.category}
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, paddingTop: 36, minWidth: 0 }}>

          {/* Result info */}
          {!loading && (
            <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
              {search ? (
                <p style={{ margin: 0, fontSize: 13, color: T.muted }}>
                  <strong style={{ color: T.accent }}>{totalItems}</strong> result{totalItems !== 1 ? 's' : ''} for "<strong style={{ color: T.text }}>{search}</strong>"
                </p>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>{activeCat}</p>
                  <span style={{ background: T.border, color: T.muted, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                    {totalItems} items
                  </span>
                </>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0', opacity: .4 }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.muted }}>Loading menu…</p>
            </div>
          )}

          {/* Sections */}
          {!loading && totalItems > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
              {active.subcategories.map((sub, si) => (
                <section key={si}>
                  {/* Section heading */}
                  <div
                    ref={el => { sectionRefs.current[sub.title] = el }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, scrollMarginTop: 160 }}
                  >
                    <div style={{ width: 20, height: 2, background: T.accent, borderRadius: 2, flexShrink: 0 }} />
                    <h2 style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.accent, letterSpacing: '0.3em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {sub.title}
                    </h2>
                    <div style={{ flex: 1, height: 1, background: T.border }} />
                    <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, flexShrink: 0 }}>
                      {sub.items.length} item{sub.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Card grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {sub.items.map((item, ii) => (
                      <ItemCard key={item.id || ii} item={item} T={T} dark={dark} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && totalItems === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 0', opacity: .25 }}>
              <Utensils size={52} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 13 }}>Nothing found</p>
              {search && <p style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>Try a different search term</p>}
            </div>
          )}
        </main>
      </div>

      {/* ══ FLOATING BUTTONS ═════════════════════════════════ */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ position: 'fixed', bottom: 90, right: 24, zIndex: 90, background: T.accent, color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: scrolled ? 1 : 0, transform: scrolled ? 'scale(1)' : 'scale(0.6)', transition: 'all 0.3s', pointerEvents: scrolled ? 'auto' : 'none', boxShadow: `0 4px 20px ${T.accent}66` }}>
        <ChevronUp size={18} />
      </button>

      <a href={`https://wa.me/${WHATSAPP_NUM}?text=${WHATSAPP_MSG}`} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 91, background: '#25D366', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: waPulse ? '0 0 0 12px rgba(37,211,102,0.15), 0 4px 24px rgba(37,211,102,0.5)' : '0 4px 20px rgba(37,211,102,0.4)', transform: waPulse ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.3s' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <a href="tel:+94772356969" className="mob-call" style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 90, background: dark ? '#fff' : '#1a1410', color: dark ? '#1a1410' : '#fff', borderRadius: '50%', width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <Phone size={17} fill="currentColor" />
      </a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; overflow-x: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input { caret-color: #e85b25; }
        input::placeholder { color: ${dark ? '#444' : '#bbb'}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .sidebar   { display: block; }
        .mob-call  { display: flex; }
        .hide-sm   { display: inline; }
        .show-sm   { display: none; }
        @media (max-width: 900px) { .sidebar { display: none !important; } }
        @media (max-width: 480px) { .hide-sm { display: none !important; } .show-sm { display: inline !important; } }
        @media (max-width: 768px) {
          .search-wrap { flex:1 !important; min-width:0; }
          .menu-topbar-row { flex-wrap:wrap; gap:8px; height:auto !important; padding:10px 16px !important; }
          .menu-pills-row  { padding:0 12px 10px !important; gap:6px !important; }
          .menu-pill       { padding:6px 12px !important; font-size:10px !important; }
          .menu-layout     { padding:0 12px 80px !important; gap:0 !important; }
          .menu-sidebar    { display:none !important; }
        }
        @media (min-width: 769px) { .mob-call { display: none !important; } }
      `}</style>
    </div>
  )
}