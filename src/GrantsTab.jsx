import React, { useState, useEffect, useMemo } from 'react';

// ============ CONFIG ============
// Matches Kingdom Stewardship Pro's connection: hardcoded creds + CDN loader.
// Same Supabase project KSP already uses.
const SUPABASE_URL = "https://lmugkdwjijhmjhlqnmyk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdWdrZHdqaWpobWpobHFubXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTk1NzgsImV4cCI6MjA5Mzg5NTU3OH0.t0dAM7qV9Q3tHV1O7mjpPyJ03jxdzxrqJOiQLS2Yb5Q";

let supabaseInstance = null;
const getSupabase = async () => {
  if (supabaseInstance) return supabaseInstance;
  if (typeof window === 'undefined') return null;
  if (!window.supabase) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    document.head.appendChild(script);
    await new Promise(resolve => script.onload = resolve);
  }
  supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return supabaseInstance;
};

// ============ STYLE TOKENS (match KSP) ============
const NAVY = '#0D1F3C';
const GOLD = '#C9A84C';
const GOLD_PALE = '#FDF7E8';
const FOREST = '#1B4D3C';
const SAGE = '#EBF6F1';
const CREAM = '#FAFAF6';
const TXT_LIGHT = '#7A8BA8';
const BORDER = '#E2EAF2';

const fmtMoney = (n) => n == null || n === '' ? '—' : '$' + (parseFloat(n)||0).toLocaleString('en-US', { maximumFractionDigits:0 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';

// ============ GRANTS TAB ============
export default function GrantsTab({ user }) {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [focus, setFocus] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  // Add-grant form
  const [showAdd, setShowAdd] = useState(false);
  const [f, setF] = useState({ name:'', funder:'', amount:'', deadline:'', focus_area:'', eligibility:'', link:'', status:'open' });

  const loadGrants = async () => {
    setLoading(true);
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.from('grants').select('*');
      if (error) setError(error.message);
      else { setGrants(data || []); setError(null); }
    } catch(e) { setError(e.message || 'Connection error'); }
    setLoading(false);
  };

  useEffect(() => { loadGrants(); }, []);

  const focusAreas = useMemo(() => {
    const set = new Set(grants.map(g => g.focus_area).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [grants]);

  const visible = useMemo(() => {
    let rows = grants.filter(g => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [g.name, g.funder, g.focus_area, g.eligibility].filter(Boolean).some(v => v.toLowerCase().includes(q));
      const matchFocus = focus === 'all' || g.focus_area === focus;
      const matchStatus = status === 'all' || g.status === status;
      return matchSearch && matchFocus && matchStatus;
    });
    rows = [...rows].sort((a,b) => {
      if (sortBy === 'deadline') { if (!a.deadline) return 1; if (!b.deadline) return -1; return new Date(a.deadline) - new Date(b.deadline); }
      if (sortBy === 'amount') return (b.amount||0) - (a.amount||0);
      return (a.name||'').localeCompare(b.name||'');
    });
    return rows;
  }, [grants, search, focus, status, sortBy]);

  const handleAdd = async () => {
    if (!f.name.trim()) { alert('Grant name is required.'); return; }
    const row = {
      id: 'grant_' + Date.now(),
      name: f.name.trim(),
      funder: f.funder.trim() || null,
      amount: f.amount ? parseFloat(f.amount) : null,
      deadline: f.deadline || null,
      focus_area: f.focus_area.trim() || null,
      eligibility: f.eligibility.trim() || null,
      link: f.link.trim() || null,
      status: f.status,
    };
    setGrants(p => [...p, row]);
    setShowAdd(false);
    setF({ name:'', funder:'', amount:'', deadline:'', focus_area:'', eligibility:'', link:'', status:'open' });
    try {
      const sb = await getSupabase();
      const { error } = await sb.from('grants').insert(row);
      if (error) alert('Save error: ' + error.message);
    } catch(e) { alert('Save failed: ' + (e.message || 'unknown')); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this grant from the directory?')) return;
    setGrants(p => p.filter(g => g.id !== id));
    try { const sb = await getSupabase(); await sb.from('grants').delete().eq('id', id); } catch(e) {}
  };

  const statusStyle = (s) => {
    if (s === 'rolling') return { background:'#FBF0D9', color:'#8A5F13' };
    if (s === 'closed') return { background:'#EFEAE6', color:'#7A6F68' };
    return { background: SAGE, color: FOREST };
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontSize:'1.6rem' }}>📋 Funding &amp; Grants</h2>
          <p style={{ color: TXT_LIGHT, fontSize:'0.9rem', marginTop:4 }}>Grants your ministry may qualify for. Search, filter, then pursue.</p>
        </div>
        <button className="btn btn-navy" onClick={()=>setShowAdd(true)}>+ Add Grant</button>
      </div>

      {showAdd && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <h3 style={{ marginBottom:'1rem' }}>New Grant</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Grant name *</label>
              <input style={{ width:'100%' }} value={f.name} onChange={e=>setF({...f, name:e.target.value})} placeholder="e.g., Community Building Grant" />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Funder</label>
              <input style={{ width:'100%' }} value={f.funder} onChange={e=>setF({...f, funder:e.target.value})} placeholder="e.g., Houston Endowment" />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Award amount</label>
              <input type="number" style={{ width:'100%' }} value={f.amount} onChange={e=>setF({...f, amount:e.target.value})} placeholder="25000" />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Deadline</label>
              <input type="date" style={{ width:'100%' }} value={f.deadline} onChange={e=>setF({...f, deadline:e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Focus area</label>
              <input style={{ width:'100%' }} value={f.focus_area} onChange={e=>setF({...f, focus_area:e.target.value})} placeholder="e.g., Youth, Building, Food security" />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Status</label>
              <select style={{ width:'100%' }} value={f.status} onChange={e=>setF({...f, status:e.target.value})}>
                <option value="open">Open</option>
                <option value="rolling">Rolling</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:'0.75rem' }}>
            <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Who qualifies</label>
            <input style={{ width:'100%' }} value={f.eligibility} onChange={e=>setF({...f, eligibility:e.target.value})} placeholder="e.g., 501(c)(3) churches in Harris County" />
          </div>
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Application link</label>
            <input style={{ width:'100%' }} value={f.link} onChange={e=>setF({...f, link:e.target.value})} placeholder="https://..." />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={handleAdd}>✓ Save Grant</button>
            <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="card card-p" style={{ marginBottom:'1.5rem' }}>
        <input type="text" placeholder="🔍 Search by name, funder, focus, or who qualifies..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:'100%', marginBottom:12 }} />
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <div>
            <label style={{ fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', display:'block', marginBottom:4 }}>Focus</label>
            <select value={focus} onChange={e=>setFocus(e.target.value)}>
              {focusAreas.map(a => <option key={a} value={a}>{a === 'all' ? 'All focus areas' : a}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', display:'block', marginBottom:4 }}>Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="rolling">Rolling</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', display:'block', marginBottom:4 }}>Sort</label>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="deadline">Deadline</option>
              <option value="amount">Award size</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="card card-p" style={{ textAlign:'center', color: TXT_LIGHT }}>Loading grants…</div>}

      {error && (
        <div className="card card-p" style={{ color:'#B53232', borderLeft:'4px solid #B53232' }}>
          Couldn’t load grants: {error}. Check that the grants table exists in Supabase, then reload.
        </div>
      )}

      {!loading && !error && grants.length === 0 && (
        <div className="card card-p" style={{ textAlign:'center', padding:'3rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>📋</div>
          <h3 style={{ marginBottom:6 }}>No grants yet</h3>
          <p style={{ color: TXT_LIGHT, marginBottom:'1.5rem' }}>Add your first grant to start building the directory.</p>
          <button className="btn btn-gold" onClick={()=>setShowAdd(true)}>+ Add Your First Grant</button>
        </div>
      )}

      {!loading && !error && grants.length > 0 && visible.length === 0 && (
        <div className="card card-p" style={{ textAlign:'center', color: TXT_LIGHT }}>No grants match those filters.</div>
      )}

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1rem' }}>
        {visible.map(g => (
          <div key={g.id} className="card card-p" style={{ borderTop:`3px solid ${GOLD}`, display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <span style={{ ...statusStyle(g.status), fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', padding:'3px 9px', borderRadius:999 }}>{g.status || 'open'}</span>
              {g.focus_area && <span style={{ fontSize:'0.72rem', color: TXT_LIGHT, border:`1px solid ${BORDER}`, padding:'3px 9px', borderRadius:999, marginLeft:'auto' }}>{g.focus_area}</span>}
            </div>
            <h3 style={{ fontSize:'1.1rem', marginBottom:4 }}>{g.name}</h3>
            {g.funder && <p style={{ color: TXT_LIGHT, fontSize:'0.85rem', marginBottom:14 }}>{g.funder}</p>}
            <div style={{ display:'flex', gap:24, padding:'12px 0', borderTop:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, marginBottom:14 }}>
              <div>
                <div style={{ fontSize:'0.68rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', marginBottom:3 }}>Award</div>
                <div style={{ fontWeight:700, color: NAVY }}>{fmtMoney(g.amount)}</div>
              </div>
              <div>
                <div style={{ fontSize:'0.68rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', marginBottom:3 }}>Deadline</div>
                <div style={{ fontWeight:700, color: NAVY }}>{fmtDate(g.deadline)}</div>
              </div>
            </div>
            {g.eligibility && (
              <p style={{ fontSize:'0.82rem', color: TXT_LIGHT, lineHeight:1.5, marginBottom:14 }}>
                <span style={{ display:'block', fontSize:'0.68rem', fontWeight:700, color: NAVY, textTransform:'uppercase', marginBottom:3 }}>Who qualifies</span>
                {g.eligibility}
              </p>
            )}
            <div style={{ marginTop:'auto', display:'flex', gap:8, alignItems:'center' }}>
              {g.link && <a href={g.link} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize:'0.82rem', padding:'8px 14px', textDecoration:'none' }}>View grant</a>}
              <button onClick={()=>handleDelete(g.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:15, color: TXT_LIGHT, marginLeft:'auto' }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
