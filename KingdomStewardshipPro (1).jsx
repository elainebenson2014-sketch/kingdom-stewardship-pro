KingdomStewardshipPro.jsx
import React, { useState, useEffect } from 'react';

// ============ CONFIG ============
// IMPORTANT: Set up a NEW Supabase project for this app — separate from Kingdom Wealth Builders
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

// ============ STYLE TOKENS ============
const NAVY = '#0D1F3C';
const GOLD = '#C9A84C';
const GOLD_PALE = '#FDF7E8';
const FOREST = '#1B4D3C';
const SAGE = '#EBF6F1';
const CREAM = '#FAFAF6';
const TXT_LIGHT = '#7A8BA8';
const BORDER = '#E2EAF2';
const RED = '#B53232';
const RED_PALE = '#FFF3F3';

// ============ CATEGORY DATA ============
const INCOME_CATEGORIES_CHURCH = [
  'Tithes', 'Offerings', 'Designated Giving', 'Building Fund',
  'Missions', 'Youth Ministry', 'Benevolence Fund', 'Special Offering',
  'Donations', 'Memorial Gifts', 'Grants', 'Rental Income',
  'Investment Income', 'Fundraising', 'Other Income'
];
const INCOME_CATEGORIES_BUSINESS = [
  'Sales Revenue', 'Service Revenue', 'Consulting', 'Subscriptions',
  'Product Sales', 'Course Sales', 'Speaking Fees', 'Royalties',
  'Affiliate Income', 'Sponsorships', 'Grants', 'Rental Income',
  'Investment Income', 'Interest Income', 'Refunds Received', 'Other Income'
];
const INCOME_CATEGORIES_NONPROFIT = [
  'Donations', 'Grants', 'Memberships', 'Fundraising Events',
  'Program Fees', 'Sponsorships', 'Government Funding',
  'Foundation Grants', 'In-Kind Donations', 'Investment Income',
  'Rental Income', 'Merchandise', 'Other Income'
];

const EXPENSE_CATEGORIES = [
  'Salaries & Wages', 'Payroll Taxes', 'Benefits',
  'Rent', 'Mortgage', 'Utilities', 'Internet / Phone', 'Insurance',
  'Office Supplies', 'Software / Subscriptions', 'Equipment',
  'Banking Fees', 'Professional Services', 'Legal & Accounting',
  'Marketing & Advertising', 'Printing & Postage',
  'Travel', 'Meals & Entertainment', 'Vehicle / Mileage',
  'Maintenance & Repairs', 'Cleaning Services',
  'Ministry Programs', 'Missions Expenses', 'Benevolence Paid',
  'Conferences & Training', 'Books & Publications',
  'Events & Hospitality', 'Curriculum & Resources',
  'Volunteer Appreciation', 'Worship & Music',
  'Cost of Goods Sold', 'Inventory',
  'Charitable Contributions Made',
  'Bank Charges', 'Credit Card Processing Fees',
  'Taxes (other)', 'Licenses & Permits',
  'Depreciation', 'Other Expenses'
];

const FUND_TYPES = ['General', 'Building', 'Missions', 'Youth', 'Benevolence', 'Memorial', 'Designated', 'Reserve'];

const ORG_TYPES = [
  { id: 'church', label: '⛪ Church / Ministry', incomeCategories: INCOME_CATEGORIES_CHURCH, hasFunds: true, hasDonors: true, donorLabel: 'Donors / Members', incomeLabel: 'Giving & Income', termsFor: { income: 'Giving & Income', expense: 'Operating Expenses', net: 'Net Income' } },
  { id: 'nonprofit', label: '🌟 Nonprofit / Foundation', incomeCategories: INCOME_CATEGORIES_NONPROFIT, hasFunds: true, hasDonors: true, donorLabel: 'Donors', incomeLabel: 'Revenue & Donations', termsFor: { income: 'Revenue', expense: 'Operating Expenses', net: 'Change in Net Assets' } },
  { id: 'business', label: '💼 Small Business', incomeCategories: INCOME_CATEGORIES_BUSINESS, hasFunds: false, hasDonors: true, donorLabel: 'Customers', incomeLabel: 'Revenue', termsFor: { income: 'Revenue', expense: 'Expenses', net: 'Net Profit' } },
];

// ============ HELPERS ============
const fmt = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ============ MAIN APP ============
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('landing'); // 'landing' | 'signup' | 'login' | 'onboarding' | 'app'

  useEffect(() => {
    (async () => {
      try {
        const sb = await getSupabase();
        if (!sb) { setLoading(false); return; }
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setView('app');
        }
      } catch(e) { console.log('Session check failed', e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif', minHeight:'100vh', background: CREAM, color: NAVY }}>
      <GlobalStyles />
      {view === 'landing' && <LandingPage onGetStarted={()=>setView('signup')} onLogin={()=>setView('login')} />}
      {view === 'signup' && <AuthPage mode="signup" onAuth={u=>{ setUser(u); setView('onboarding'); }} onSwitch={()=>setView('login')} />}
      {view === 'login' && <AuthPage mode="login" onAuth={u=>{ setUser(u); setView('app'); }} onSwitch={()=>setView('signup')} />}
      {view === 'onboarding' && <OnboardingPage user={user} onComplete={()=>setView('app')} />}
      {view === 'app' && <Dashboard user={user} onLogout={async()=>{ const sb = await getSupabase(); await sb.auth.signOut(); setUser(null); setView('landing'); }} />}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background: NAVY, color: GOLD }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:8 }}>👑</div>
        <div style={{ fontSize:'1.2rem', fontWeight:600 }}>Kingdom Stewardship Pro</div>
        <div style={{ fontSize:'0.9rem', color:'#A8B5C8', marginTop:8 }}>Loading...</div>
      </div>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; margin:0; padding:0; }
      body { background: ${CREAM}; }
      .card { background:#fff; border:1px solid ${BORDER}; border-radius:12px; }
      .card-p { padding:1.25rem; }
      .btn { padding:10px 20px; border-radius:8px; font-weight:700; font-size:0.9rem; cursor:pointer; border:none; transition:transform 0.1s; }
      .btn:active { transform: scale(0.98); }
      .btn-navy { background:${NAVY}; color:#fff; }
      .btn-gold { background:${GOLD}; color:${NAVY}; }
      .btn-outline { background:#fff; color:${NAVY}; border:1px solid ${BORDER}; }
      input, select, textarea { font-family:inherit; font-size:0.9rem; padding:8px 12px; border-radius:8px; border:1px solid ${BORDER}; background:#fff; color:${NAVY}; outline:none; }
      input:focus, select:focus, textarea:focus { border-color:${GOLD}; }
      h1,h2,h3,h4 { font-family:Georgia,Lora,serif; color:${NAVY}; }
    `}</style>
  );
}

// ============ LANDING PAGE ============
function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: NAVY, color:'#fff', padding:'4rem 1.5rem 6rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'3rem' }}>
          <div style={{ fontSize:'1.3rem', fontWeight:700, color: GOLD }}>👑 Kingdom Stewardship Pro</div>
          <button className="btn btn-outline" onClick={onLogin} style={{ background:'transparent', color:'#fff', borderColor:'rgba(255,255,255,0.3)' }}>Sign In</button>
        </div>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'0.85rem', fontWeight:700, color: GOLD, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>For Churches · Nonprofits · Faith-Based Businesses</div>
          <h1 style={{ fontSize:'3rem', lineHeight:1.1, marginBottom:'1.5rem' }}>Steward Your Mission's<br/><span style={{ color: GOLD }}>Finances with Excellence</span></h1>
          <p style={{ fontSize:'1.1rem', color:'#A8B5C8', maxWidth:700, margin:'0 auto 2rem', lineHeight:1.6 }}>
            The complete financial management platform built for ministries, nonprofits, and faith-driven businesses. Track giving, manage funds, generate IRS-ready donor statements — all in one beautiful, simple app.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-gold" onClick={onGetStarted} style={{ fontSize:'1rem', padding:'14px 32px' }}>Start Free Trial →</button>
            <button className="btn btn-outline" style={{ background:'transparent', color:'#fff', borderColor:'rgba(255,255,255,0.3)', fontSize:'1rem', padding:'14px 32px' }}>Watch Demo</button>
          </div>
          <p style={{ fontSize:'0.8rem', color:'#7A8BA8', marginTop:20 }}>✓ 30-day free trial · ✓ No credit card required · ✓ Cancel anytime</p>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: CREAM, padding:'5rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <h2 style={{ fontSize:'2.2rem', textAlign:'center', marginBottom:'1rem' }}>Everything Your Ministry Needs</h2>
          <p style={{ textAlign:'center', color: TXT_LIGHT, marginBottom:'3rem', fontSize:'1.05rem' }}>Designed by people who've served on church finance teams.</p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.5rem' }}>
            {[
              { icon:'💰', title:'Tithe & Offering Tracking', text:'Track every gift by donor, fund, and category. Auto-categorize from bank imports.' },
              { icon:'🏦', title:'Fund Accounting', text:'Manage Building Fund, Missions, Youth, Benevolence and more — each with separate budgets.' },
              { icon:'📊', title:'P&L & Reports', text:'Beautiful Profit & Loss statements, balance sheets, and giving summaries in one click.' },
              { icon:'📄', title:'Donor Statements', text:'Generate IRS-compliant year-end giving statements for every donor automatically.' },
              { icon:'👥', title:'Donor Management', text:'Track giving history, communications, pledges, and grow your generous community.' },
              { icon:'🔗', title:'Bank Imports', text:'Upload CSV from any bank. Smart categorization. No more manual entry.' },
              { icon:'🚗', title:'Mileage Tracking', text:'Built-in IRS mileage rates. Perfect for pastors, volunteers, and business owners.' },
              { icon:'👨‍👩‍👧 ', title:'Multi-User Access', text:'Pastor + Treasurer + Bookkeeper roles with permissions. Everyone stays aligned.' },
              { icon:'🛡️', title:'Bank-Level Security', text:'Encrypted data, secure cloud storage, daily backups. Your records are safe.' },
            ].map((f,i) => (
              <div key={i} className="card card-p" style={{ borderTop:`3px solid ${GOLD}` }}>
                <div style={{ fontSize:'2rem', marginBottom:10 }}>{f.icon}</div>
                <h3 style={{ fontSize:'1.1rem', marginBottom:8 }}>{f.title}</h3>
                <p style={{ color: TXT_LIGHT, fontSize:'0.92rem', lineHeight:1.6 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ background:'#fff', padding:'5rem 1.5rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <h2 style={{ fontSize:'2.2rem', textAlign:'center', marginBottom:'1rem' }}>Simple, Honest Pricing</h2>
          <p style={{ textAlign:'center', color: TXT_LIGHT, marginBottom:'3rem' }}>30-day free trial. No credit card required.</p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.5rem', maxWidth:900, margin:'0 auto' }}>
            {[
              { name:'Small Business', price:'$29', tagline:'For sole proprietors & side hustles', features:['Up to 200 transactions/mo','Customer tracking','P&L Reports','Tax-ready exports','Email support','1 user'], color: NAVY },
              { name:'Church / Nonprofit', price:'$49', tagline:'Most popular — built for ministries', features:['Unlimited transactions','Donor management','Fund accounting','Year-end giving statements','3 users included','Priority support'], color: GOLD, popular:true },
              { name:'Enterprise', price:'$99', tagline:'For large churches & multi-site orgs', features:['Everything in Church','Unlimited users','Multi-site / Multi-location','Custom reports','Phone support','Dedicated success manager'], color: FOREST },
            ].map((p,i) => (
              <div key={i} className="card" style={{ padding:'2rem 1.5rem', border: p.popular ? `2px solid ${GOLD}` : `1px solid ${BORDER}`, position:'relative' }}>
                {p.popular && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background: GOLD, color: NAVY, padding:'4px 14px', borderRadius:6, fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.05em' }}>MOST POPULAR</div>}
                <div style={{ color: p.color, fontWeight:700, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{p.name}</div>
                <div style={{ fontSize:'2.5rem', fontWeight:700, color: NAVY }}>{p.price}<span style={{ fontSize:'1rem', color: TXT_LIGHT, fontWeight:500 }}>/mo</span></div>
                <p style={{ color: TXT_LIGHT, fontSize:'0.88rem', margin:'12px 0 1.5rem' }}>{p.tagline}</p>
                <button className={p.popular ? 'btn btn-gold' : 'btn btn-outline'} onClick={onGetStarted} style={{ width:'100%', marginBottom:'1.5rem' }}>Start Free Trial</button>
                <ul style={{ listStyle:'none', padding:0 }}>
                  {p.features.map((f,j) => (
                    <li key={j} style={{ padding:'6px 0', fontSize:'0.88rem', color: NAVY, display:'flex', alignItems:'flex-start', gap:8 }}>
                      <span style={{ color: GOLD, fontWeight:700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: NAVY, color:'#A8B5C8', padding:'3rem 1.5rem', textAlign:'center' }}>
        <div style={{ fontSize:'1.3rem', fontWeight:700, color: GOLD, marginBottom:12 }}>👑 Kingdom Stewardship Pro</div>
        <p style={{ fontSize:'0.85rem', marginBottom:8 }}>A product of The Healed Place · © 2026</p>
        <p style={{ fontSize:'0.8rem' }}>thehealedplace.org · stewardship@thehealedplace.org</p>
      </footer>
    </div>
  );
}

// ============ AUTH PAGE ============
function AuthPage({ mode, onAuth, onSwitch }) {
  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setErr(''); setLoading(true);
    try {
      const sb = await getSupabase();
      if (mode === 'signup') {
        if (!orgName || !name || !email || !password) { setErr('All fields required'); setLoading(false); return; }
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name, org_name: orgName } } });
        if (error) { setErr(error.message); setLoading(false); return; }
        onAuth(data.user);
      } else {
        if (!email || !password) { setErr('Email and password required'); setLoading(false); return; }
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) { setErr(error.message); setLoading(false); return; }
        onAuth(data.user);
      }
    } catch(e) { setErr('Connection error. Make sure Supabase is configured.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem', background:`linear-gradient(135deg, ${NAVY} 0%, #1a3055 100%)` }}>
      <div className="card" style={{ maxWidth:440, width:'100%', padding:'2.5rem 2rem' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>👑</div>
          <h2 style={{ fontSize:'1.4rem', marginBottom:6 }}>{mode === 'signup' ? 'Start Your Free Trial' : 'Welcome Back'}</h2>
          <p style={{ color: TXT_LIGHT, fontSize:'0.9rem' }}>{mode === 'signup' ? '30-day trial · No credit card required' : 'Sign in to your account'}</p>
        </div>

        {mode === 'signup' && (
          <>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem', fontWeight:700, color: NAVY, display:'block', marginBottom:6 }}>Organization Name</label>
              <input style={{ width:'100%' }} value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="e.g., First Baptist Church" />
            </div>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem', fontWeight:700, color: NAVY, display:'block', marginBottom:6 }}>Your Name</label>
              <input style={{ width:'100%' }} value={name} onChange={e=>setName(e.target.value)} placeholder="Pastor / Treasurer / Owner name" />
            </div>
          </>
        )}
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ fontSize:'0.78rem', fontWeight:700, color: NAVY, display:'block', marginBottom:6 }}>Email</label>
          <input type="email" style={{ width:'100%' }} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div style={{ marginBottom:'1.5rem' }}>
          <label style={{ fontSize:'0.78rem', fontWeight:700, color: NAVY, display:'block', marginBottom:6 }}>Password</label>
          <input type="password" style={{ width:'100%' }} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='signup' ? "At least 6 characters" : "Your password"} />
        </div>

        {err && <div style={{ background: RED_PALE, color: RED, padding:'10px 14px', borderRadius:8, marginBottom:'1rem', fontSize:'0.85rem' }}>{err}</div>}

        <button className="btn btn-navy" onClick={handleSubmit} disabled={loading} style={{ width:'100%', padding:'12px', fontSize:'0.95rem' }}>
          {loading ? '...' : (mode === 'signup' ? 'Create Account →' : 'Sign In')}
        </button>

        <p style={{ textAlign:'center', fontSize:'0.85rem', color: TXT_LIGHT, marginTop:'1.5rem' }}>
          {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={onSwitch} style={{ background:'none', border:'none', color: GOLD, fontWeight:700, cursor:'pointer' }}>{mode === 'signup' ? 'Sign in' : 'Start free trial'}</button>
        </p>
      </div>
    </div>
  );
}

// ============ ONBOARDING ============
function OnboardingPage({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [orgType, setOrgType] = useState('church');
  const [taxId, setTaxId] = useState('');
  const [fiscalYearStart, setFiscalYearStart] = useState('January');

  const handleFinish = async () => {
    try {
      const sb = await getSupabase();
      await sb.from('organizations').upsert({
        user_id: user.id,
        name: user.user_metadata?.org_name || 'My Organization',
        org_type: orgType,
        tax_id: taxId,
        fiscal_year_start: fiscalYearStart,
      });
    } catch(e) { console.log('Save org:', e); }
    onComplete();
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
      <div className="card" style={{ maxWidth:560, width:'100%', padding:'2.5rem 2rem' }}>
        <div style={{ marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ fontSize:'1.3rem' }}>Welcome! Let's get set up</h2>
          <span style={{ fontSize:'0.78rem', color: TXT_LIGHT, fontWeight:700 }}>Step {step} of 2</span>
        </div>

        {step === 1 && (
          <>
            <p style={{ color: TXT_LIGHT, marginBottom:'1.5rem' }}>What type of organization are you?</p>
            {ORG_TYPES.map(t => (
              <label key={t.id} style={{ display:'block', padding:'1rem', marginBottom:10, border:`2px solid ${orgType===t.id?GOLD:BORDER}`, borderRadius:10, cursor:'pointer', background: orgType===t.id?GOLD_PALE:'#fff' }}>
                <input type="radio" name="orgType" checked={orgType===t.id} onChange={()=>setOrgType(t.id)} style={{ marginRight:10 }} />
                <span style={{ fontWeight:700, fontSize:'1rem' }}>{t.label}</span>
              </label>
            ))}
            <button className="btn btn-navy" onClick={()=>setStep(2)} style={{ width:'100%', marginTop:'1rem' }}>Next →</button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: TXT_LIGHT, marginBottom:'1.5rem' }}>A few more details (optional)</p>
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem', fontWeight:700, color: NAVY, display:'block', marginBottom:6 }}>Tax ID / EIN (optional)</label>
              <input style={{ width:'100%' }} value={taxId} onChange={e=>setTaxId(e.target.value)} placeholder="XX-XXXXXXX" />
              <p style={{ fontSize:'0.78rem', color: TXT_LIGHT, marginTop:4 }}>Needed for year-end donor statements</p>
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label style={{ fontSize:'0.78rem', fontWeight:700, color: NAVY, display:'block', marginBottom:6 }}>Fiscal Year Start</label>
              <select style={{ width:'100%' }} value={fiscalYearStart} onChange={e=>setFiscalYearStart(e.target.value)}>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-outline" onClick={()=>setStep(1)} style={{ flex:1 }}>Back</button>
              <button className="btn btn-navy" onClick={handleFinish} style={{ flex:2 }}>Get Started 🚀</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============ DASHBOARD ============
function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [orgType, setOrgType] = useState('church');
  const [orgName, setOrgName] = useState('My Organization');
  const [transactions, setTransactions] = useState([]);
  const [donors, setDonors] = useState([]);
  const [funds, setFunds] = useState([
    { id:'fund_general', name:'General Fund', type:'General', balance:0 }
  ]);

  // Load org config
  useEffect(() => {
    (async () => {
      try {
        const sb = await getSupabase();
        const { data } = await sb.from('organizations').select('*').eq('user_id', user.id).single();
        if (data) {
          setOrgType(data.org_type || 'church');
          setOrgName(data.name || 'My Organization');
        }
        // Load transactions
        const { data: txs } = await sb.from('ksp_transactions').select('*').eq('user_id', user.id);
        if (txs) setTransactions(txs);
        // Load donors
        const { data: ds } = await sb.from('ksp_donors').select('*').eq('user_id', user.id);
        if (ds) setDonors(ds);
        // Load funds
        const { data: fs } = await sb.from('ksp_funds').select('*').eq('user_id', user.id);
        if (fs && fs.length > 0) setFunds(fs);
      } catch(e) { console.log('Load:', e); }
    })();
  }, [user]);

  const orgConfig = ORG_TYPES.find(t => t.id === orgType) || ORG_TYPES[0];

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{ width:240, background: NAVY, color:'#fff', padding:'1.5rem 1rem', flexShrink:0 }}>
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontSize:'0.8rem', color: GOLD, fontWeight:700, letterSpacing:'0.05em' }}>👑 KS PRO</div>
          <div style={{ fontSize:'1rem', fontWeight:600, marginTop:4 }}>{orgName}</div>
          <div style={{ fontSize:'0.75rem', color:'#A8B5C8', marginTop:2 }}>{orgConfig.label}</div>
        </div>

        <nav style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {[
            { id:'overview', icon:'📊', label:'Overview' },
            { id:'transactions', icon:'💰', label:'Transactions' },
            { id:'donors', icon:'👥', label: orgConfig.donorLabel },
            ...(orgConfig.hasFunds ? [{ id:'funds', icon:'🏦', label:'Funds' }] : []),
            { id:'reports', icon:'📄', label:'Reports' },
            { id:'statements', icon:'📃', label:'Statements' },
            { id:'settings', icon:'⚙️', label:'Settings' },
          ].map(item => (
            <button key={item.id} onClick={()=>setTab(item.id)} style={{
              background: tab===item.id ? 'rgba(201,168,76,0.15)' : 'transparent',
              border:'none', color: tab===item.id ? GOLD : '#A8B5C8',
              padding:'10px 12px', borderRadius:8, fontSize:'0.9rem',
              textAlign:'left', cursor:'pointer', fontWeight: tab===item.id?700:500,
            }}>
              <span style={{ marginRight:10 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop:'auto', paddingTop:'2rem' }}>
          <button onClick={onLogout} style={{ width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'#A8B5C8', padding:'8px', borderRadius:8, fontSize:'0.85rem', cursor:'pointer' }}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, padding:'2rem', overflow:'auto' }}>
        {tab === 'overview' && <OverviewTab transactions={transactions} donors={donors} funds={funds} orgConfig={orgConfig} />}
        {tab === 'transactions' && <TransactionsTab user={user} transactions={transactions} setTransactions={setTransactions} donors={donors} funds={funds} orgConfig={orgConfig} />}
        {tab === 'donors' && <DonorsTab user={user} donors={donors} setDonors={setDonors} transactions={transactions} orgConfig={orgConfig} />}
        {tab === 'funds' && orgConfig.hasFunds && <FundsTab user={user} funds={funds} setFunds={setFunds} transactions={transactions} />}
        {tab === 'reports' && <ReportsTab transactions={transactions} orgConfig={orgConfig} />}
        {tab === 'statements' && <StatementsTab user={user} donors={donors} transactions={transactions} orgConfig={orgConfig} orgName={orgName} />}
        {tab === 'settings' && <SettingsTab user={user} orgName={orgName} setOrgName={setOrgName} orgType={orgType} setOrgType={setOrgType} />}
      </main>
    </div>
  );
}

// ============ OVERVIEW TAB ============
function OverviewTab({ transactions, donors, funds, orgConfig }) {
  const now = new Date();
  const ytdYear = now.getFullYear();
  const thisMonth = now.getMonth();

  const ytdTxs = transactions.filter(t => new Date(t.date).getFullYear() === ytdYear);
  const monthTxs = ytdTxs.filter(t => new Date(t.date).getMonth() === thisMonth);

  const totalIncomeYTD = ytdTxs.filter(t => t.type==='income').reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const totalExpensesYTD = ytdTxs.filter(t => t.type==='expense').reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const netYTD = totalIncomeYTD - totalExpensesYTD;
  const incomeMonth = monthTxs.filter(t => t.type==='income').reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const expensesMonth = monthTxs.filter(t => t.type==='expense').reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const topDonors = [...donors].sort((a,b) => (parseFloat(b.total_given||0)) - (parseFloat(a.total_given||0))).slice(0,5);

  return (
    <div>
      <h2 style={{ fontSize:'1.6rem', marginBottom:'1.5rem' }}>📊 Overview</h2>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1rem', marginBottom:'2rem' }}>
        <StatCard label={`${orgConfig.termsFor.income} YTD`} value={fmtShort(totalIncomeYTD)} color={FOREST} sub={`${fmtShort(incomeMonth)} this month`} />
        <StatCard label={`${orgConfig.termsFor.expense} YTD`} value={fmtShort(totalExpensesYTD)} color={RED} sub={`${fmtShort(expensesMonth)} this month`} />
        <StatCard label={`${orgConfig.termsFor.net} YTD`} value={fmtShort(netYTD)} color={netYTD>=0?GOLD:RED} sub={netYTD>=0?'In the black':'In the red'} />
        <StatCard label={orgConfig.donorLabel} value={donors.length} color={NAVY} sub={`${transactions.filter(t=>t.donor_id).length} gifts recorded`} />
      </div>

      {/* Quick actions */}
      <div className="card card-p" style={{ marginBottom:'1.5rem' }}>
        <h3 style={{ fontSize:'1.1rem', marginBottom:'0.75rem' }}>Quick Actions</h3>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn btn-navy">+ Record Income</button>
          <button className="btn btn-outline">+ Add Expense</button>
          <button className="btn btn-outline">📥 Import CSV</button>
          <button className="btn btn-outline">📄 Generate Report</button>
          <button className="btn btn-outline">📃 Year-End Statements</button>
        </div>
      </div>

      {/* Top donors */}
      {topDonors.length > 0 && (
        <div className="card card-p" style={{ marginBottom:'1.5rem' }}>
          <h3 style={{ fontSize:'1.1rem', marginBottom:'0.75rem' }}>🌟 Top {orgConfig.donorLabel}</h3>
          {topDonors.map((d,i) => (
            <div key={d.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i<topDonors.length-1?`1px solid ${BORDER}`:'none' }}>
              <span style={{ color: NAVY, fontWeight:600 }}>{d.name}</span>
              <span style={{ color: FOREST, fontWeight:700 }}>{fmt(d.total_given||0)}</span>
            </div>
          ))}
        </div>
      )}

      {transactions.length === 0 && (
        <div className="card card-p" style={{ textAlign:'center', padding:'3rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:8 }}>🚀</div>
          <h3 style={{ marginBottom:8 }}>Welcome to Kingdom Stewardship Pro!</h3>
          <p style={{ color: TXT_LIGHT, marginBottom:'1.5rem' }}>Get started by recording your first transaction or importing a bank CSV.</p>
          <button className="btn btn-gold">+ Record Your First Transaction</button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div className="card card-p" style={{ borderLeft:`4px solid ${color}` }}>
      <div style={{ fontSize:'0.72rem', color: TXT_LIGHT, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:'1.7rem', fontWeight:700, color, fontFamily:'Georgia,serif' }}>{value}</div>
      {sub && <div style={{ fontSize:'0.78rem', color: TXT_LIGHT, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

// ============ TRANSACTIONS TAB ============
function TransactionsTab({ user, transactions, setTransactions, donors, funds, orgConfig }) {
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState('income');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(orgConfig.incomeCategories[0]);
  const [description, setDescription] = useState('');
  const [donorId, setDonorId] = useState('');
  const [fundId, setFundId] = useState(funds[0]?.id || '');
  const [notes, setNotes] = useState('');

  const handleAdd = async () => {
    if (!amount || !category) return;
    const newTx = {
      id: 'tx_' + Date.now(),
      user_id: user.id,
      type, date, amount: parseFloat(amount),
      category, description,
      donor_id: donorId || null,
      fund_id: fundId || null,
      notes,
    };
    setTransactions(p => [...p, newTx]);
    try {
      const sb = await getSupabase();
      await sb.from('ksp_transactions').insert(newTx);
    } catch(e) { console.log('Save tx:', e); }
    setShowAdd(false);
    setAmount(''); setDescription(''); setNotes(''); setDonorId('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    setTransactions(p => p.filter(t => t.id !== id));
    try { const sb = await getSupabase(); await sb.from('ksp_transactions').delete().eq('id', id); } catch(e) {}
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem' }}>💰 Transactions</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-outline">📥 Import CSV</button>
          <button className="btn btn-navy" onClick={()=>setShowAdd(true)}>+ Add Transaction</button>
        </div>
      </div>

      {showAdd && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <h3 style={{ marginBottom:'1rem' }}>New Transaction</h3>
          <div style={{ display:'flex', gap:8, marginBottom:'1rem' }}>
            <button onClick={()=>setType('income')} style={{ flex:1, padding:'10px', borderRadius:8, border:`2px solid ${type==='income'?FOREST:BORDER}`, background:type==='income'?SAGE:'#fff', color:type==='income'?FOREST:NAVY, fontWeight:700, cursor:'pointer' }}>💵 Income</button>
            <button onClick={()=>setType('expense')} style={{ flex:1, padding:'10px', borderRadius:8, border:`2px solid ${type==='expense'?RED:BORDER}`, background:type==='expense'?RED_PALE:'#fff', color:type==='expense'?RED:NAVY, fontWeight:700, cursor:'pointer' }}>🧾 Expense</button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Date</label>
              <input type="date" style={{ width:'100%' }} value={date} onChange={e=>setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Amount</label>
              <input type="number" step="0.01" style={{ width:'100%' }} value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Category</label>
              <select style={{ width:'100%' }} value={category} onChange={e=>setCategory(e.target.value)}>
                {(type==='income' ? orgConfig.incomeCategories : EXPENSE_CATEGORIES).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Description</label>
              <input style={{ width:'100%' }} value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g., Sunday offering" />
            </div>
            {type === 'income' && donors.length > 0 && (
              <div>
                <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>{orgConfig.donorLabel.slice(0,-1)} (optional)</label>
                <select style={{ width:'100%' }} value={donorId} onChange={e=>setDonorId(e.target.value)}>
                  <option value="">— None —</option>
                  {donors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            {orgConfig.hasFunds && (
              <div>
                <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Fund</label>
                <select style={{ width:'100%' }} value={fundId} onChange={e=>setFundId(e.target.value)}>
                  {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Notes (optional)</label>
            <textarea style={{ width:'100%', minHeight:60 }} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Additional details..." />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={handleAdd}>✓ Save</button>
            <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow:'hidden' }}>
        {transactions.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color: TXT_LIGHT }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>📋</div>
            <p>No transactions yet. Click "Add Transaction" to get started.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
            <thead><tr style={{ borderBottom:`1px solid ${BORDER}`, background: CREAM }}>
              {['Date','Type','Description','Category','Amount',''].map(h => <th key={h} style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[...transactions].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(t => (
                <tr key={t.id} style={{ borderBottom:`1px solid #F4F6FA` }}>
                  <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{t.date}</td>
                  <td style={{ padding:'12px' }}><span style={{ background: t.type==='income'?SAGE:RED_PALE, color: t.type==='income'?FOREST:RED, padding:'2px 8px', borderRadius:6, fontSize:'0.72rem', fontWeight:700 }}>{t.type==='income'?'IN':'OUT'}</span></td>
                  <td style={{ padding:'12px', color: NAVY }}>{t.description || '—'}</td>
                  <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{t.category}</td>
                  <td style={{ padding:'12px', fontWeight:700, color: t.type==='income'?FOREST:RED }}>{t.type==='income'?'+':'-'}{fmt(t.amount)}</td>
                  <td style={{ padding:'12px' }}><button onClick={()=>handleDelete(t.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: TXT_LIGHT }}>🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============ DONORS TAB ============
function DonorsTab({ user, donors, setDonors, transactions, orgConfig }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleAdd = async () => {
    if (!name) return;
    const newDonor = { id: 'donor_' + Date.now(), user_id: user.id, name, email, phone, address, total_given: 0 };
    setDonors(p => [...p, newDonor]);
    try { const sb = await getSupabase(); await sb.from('ksp_donors').insert(newDonor); } catch(e) {}
    setShowAdd(false); setName(''); setEmail(''); setPhone(''); setAddress('');
  };

  // Calculate totals per donor from transactions
  const donorTotals = {};
  transactions.filter(t => t.type==='income' && t.donor_id).forEach(t => {
    donorTotals[t.donor_id] = (donorTotals[t.donor_id] || 0) + parseFloat(t.amount||0);
  });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem' }}>👥 {orgConfig.donorLabel}</h2>
        <button className="btn btn-navy" onClick={()=>setShowAdd(true)}>+ Add {orgConfig.donorLabel.slice(0,-1)}</button>
      </div>

      {showAdd && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <h3 style={{ marginBottom:'1rem' }}>New {orgConfig.donorLabel.slice(0,-1)}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
            <input style={{ width:'100%' }} value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" />
            <input style={{ width:'100%' }} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (for statements)" />
            <input style={{ width:'100%' }} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
            <input style={{ width:'100%' }} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Mailing address" />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={handleAdd}>✓ Save</button>
            <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow:'hidden' }}>
        {donors.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color: TXT_LIGHT }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>👥</div>
            <p>No {orgConfig.donorLabel.toLowerCase()} yet. Add them to track giving history.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
            <thead><tr style={{ borderBottom:`1px solid ${BORDER}`, background: CREAM }}>
              {['Name','Email','Phone','Total Given','# Gifts'].map(h => <th key={h} style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {donors.map(d => {
                const total = donorTotals[d.id] || 0;
                const gifts = transactions.filter(t => t.donor_id === d.id).length;
                return (
                  <tr key={d.id} style={{ borderBottom:`1px solid #F4F6FA` }}>
                    <td style={{ padding:'12px', color: NAVY, fontWeight:600 }}>{d.name}</td>
                    <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{d.email || '—'}</td>
                    <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{d.phone || '—'}</td>
                    <td style={{ padding:'12px', fontWeight:700, color: FOREST }}>{fmt(total)}</td>
                    <td style={{ padding:'12px', color: TXT_LIGHT }}>{gifts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============ FUNDS TAB ============
function FundsTab({ user, funds, setFunds, transactions }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('General');

  const handleAdd = async () => {
    if (!name) return;
    const newFund = { id: 'fund_' + Date.now(), user_id: user.id, name, type, balance: 0 };
    setFunds(p => [...p, newFund]);
    try { const sb = await getSupabase(); await sb.from('ksp_funds').insert(newFund); } catch(e) {}
    setShowAdd(false); setName('');
  };

  // Calculate balance per fund
  const fundBalances = {};
  funds.forEach(f => {
    const inc = transactions.filter(t => t.fund_id === f.id && t.type === 'income').reduce((s,t)=>s+parseFloat(t.amount||0), 0);
    const exp = transactions.filter(t => t.fund_id === f.id && t.type === 'expense').reduce((s,t)=>s+parseFloat(t.amount||0), 0);
    fundBalances[f.id] = inc - exp;
  });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem' }}>🏦 Funds</h2>
        <button className="btn btn-navy" onClick={()=>setShowAdd(true)}>+ Add Fund</button>
      </div>

      <p style={{ color: TXT_LIGHT, marginBottom:'1.5rem' }}>Separate funds for designated giving (Building Fund, Missions, Youth, etc.)</p>

      {showAdd && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <h3 style={{ marginBottom:'1rem' }}>New Fund</h3>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr auto', gap:'0.75rem', alignItems:'end' }}>
            <input style={{ width:'100%' }} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Building Fund" />
            <select style={{ width:'100%' }} value={type} onChange={e=>setType(e.target.value)}>
              {FUND_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <button className="btn btn-navy" onClick={handleAdd}>Save</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1rem' }}>
        {funds.map(f => {
          const balance = fundBalances[f.id] || 0;
          const inc = transactions.filter(t => t.fund_id === f.id && t.type === 'income').reduce((s,t)=>s+parseFloat(t.amount||0), 0);
          const exp = transactions.filter(t => t.fund_id === f.id && t.type === 'expense').reduce((s,t)=>s+parseFloat(t.amount||0), 0);
          return (
            <div key={f.id} className="card card-p" style={{ borderTop:`3px solid ${GOLD}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <h3 style={{ fontSize:'1.1rem' }}>{f.name}</h3>
                <span style={{ fontSize:'0.7rem', background: GOLD_PALE, color:'#8B6914', padding:'2px 8px', borderRadius:6, fontWeight:700 }}>{f.type}</span>
              </div>
              <div style={{ fontSize:'2rem', fontWeight:700, fontFamily:'Georgia,serif', color: balance>=0?FOREST:RED, marginBottom:12 }}>{fmt(balance)}</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color: TXT_LIGHT }}>
                <span>↑ In: {fmt(inc)}</span>
                <span>↓ Out: {fmt(exp)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ REPORTS TAB ============
function ReportsTab({ transactions, orgConfig }) {
  const [year, setYear] = useState(new Date().getFullYear());

  const yearTxs = transactions.filter(t => new Date(t.date).getFullYear() === year);
  const incomeByCategory = {};
  const expensesByCategory = {};
  yearTxs.forEach(t => {
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + parseFloat(t.amount||0);
    } else {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + parseFloat(t.amount||0);
    }
  });

  const totalIncome = Object.values(incomeByCategory).reduce((s,v)=>s+v, 0);
  const totalExpenses = Object.values(expensesByCategory).reduce((s,v)=>s+v, 0);
  const net = totalIncome - totalExpenses;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem' }}>📄 Reports</h2>
        <select value={year} onChange={e=>setYear(parseInt(e.target.value))} style={{ padding:'8px 12px' }}>
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* P&L Statement */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ background: NAVY, color:'#fff', padding:'1rem 1.5rem', borderRadius:'12px 12px 0 0' }}>
          <h3 style={{ color:'#fff', fontSize:'1.2rem' }}>Profit & Loss Statement</h3>
          <p style={{ fontSize:'0.85rem', color:'#A8B5C8', marginTop:4 }}>For year ending December 31, {year}</p>
        </div>
        <div style={{ padding:'1.5rem' }}>
          {/* Income */}
          <h4 style={{ fontSize:'1rem', color: FOREST, marginBottom:'0.75rem', borderBottom:`2px solid ${SAGE}`, paddingBottom:8 }}>{orgConfig.termsFor.income.toUpperCase()}</h4>
          {Object.entries(incomeByCategory).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) => (
            <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'0.9rem' }}>
              <span style={{ color: NAVY }}>{cat}</span>
              <span style={{ fontWeight:600, color: NAVY }}>{fmt(amt)}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:`2px solid ${BORDER}`, marginTop:8 }}>
            <span style={{ fontWeight:700, color: NAVY }}>Total {orgConfig.termsFor.income}</span>
            <span style={{ fontWeight:700, color: FOREST, fontSize:'1.1rem' }}>{fmt(totalIncome)}</span>
          </div>

          {/* Expenses */}
          <h4 style={{ fontSize:'1rem', color: RED, marginTop:'1.5rem', marginBottom:'0.75rem', borderBottom:`2px solid ${RED_PALE}`, paddingBottom:8 }}>{orgConfig.termsFor.expense.toUpperCase()}</h4>
          {Object.entries(expensesByCategory).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) => (
            <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'0.9rem' }}>
              <span style={{ color: NAVY }}>{cat}</span>
              <span style={{ fontWeight:600, color: NAVY }}>{fmt(amt)}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:`2px solid ${BORDER}`, marginTop:8 }}>
            <span style={{ fontWeight:700, color: NAVY }}>Total {orgConfig.termsFor.expense}</span>
            <span style={{ fontWeight:700, color: RED, fontSize:'1.1rem' }}>{fmt(totalExpenses)}</span>
          </div>

          {/* Net */}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 0', marginTop:16, background: net>=0?SAGE:RED_PALE, padding:'14px 18px', borderRadius:8 }}>
            <span style={{ fontWeight:700, color: NAVY, fontSize:'1.05rem' }}>{orgConfig.termsFor.net}</span>
            <span style={{ fontWeight:700, color: net>=0?FOREST:RED, fontSize:'1.3rem', fontFamily:'Georgia,serif' }}>{fmt(net)}</span>
          </div>

          <button className="btn btn-outline" style={{ marginTop:'1rem', width:'100%' }} onClick={()=>window.print()}>🖨️ Print / Export PDF</button>
        </div>
      </div>
    </div>
  );
}

// ============ STATEMENTS TAB ============
function StatementsTab({ user, donors, transactions, orgConfig, orgName }) {
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [selectedDonor, setSelectedDonor] = useState(null);

  const generateStatement = (donor) => {
    const yearTxs = transactions.filter(t =>
      t.donor_id === donor.id &&
      t.type === 'income' &&
      new Date(t.date).getFullYear() === year
    );
    return yearTxs;
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem' }}>📃 Year-End Giving Statements</h2>
        <select value={year} onChange={e=>setYear(parseInt(e.target.value))} style={{ padding:'8px 12px' }}>
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="card card-p" style={{ marginBottom:'1.5rem', background: GOLD_PALE, borderLeft:`4px solid ${GOLD}` }}>
        <p style={{ color: NAVY, fontSize:'0.92rem' }}>
          <strong>IRS-Compliant Statements:</strong> Generate official giving statements for any {orgConfig.donorLabel.toLowerCase().slice(0,-1)} who gave during {year}. These can be printed, emailed, or saved as PDF for {orgConfig.donorLabel.toLowerCase()} to claim tax deductions.
        </p>
      </div>

      {selectedDonor ? (
        <div className="card card-p" style={{ marginBottom:'1rem' }}>
          <button onClick={()=>setSelectedDonor(null)} className="btn btn-outline" style={{ marginBottom:'1rem' }}>← Back to list</button>
          <div style={{ textAlign:'center', borderBottom:`2px solid ${GOLD}`, paddingBottom:'1rem', marginBottom:'1.5rem' }}>
            <h3 style={{ fontSize:'1.5rem', marginBottom:4 }}>{orgName}</h3>
            <p style={{ color: TXT_LIGHT, fontSize:'0.9rem' }}>Year-End Giving Statement · {year}</p>
          </div>
          <div style={{ marginBottom:'1.5rem' }}>
            <p style={{ marginBottom:4 }}><strong>To:</strong> {selectedDonor.name}</p>
            {selectedDonor.address && <p style={{ color: TXT_LIGHT, fontSize:'0.9rem' }}>{selectedDonor.address}</p>}
          </div>
          <p style={{ marginBottom:'1rem', fontSize:'0.95rem', lineHeight:1.6 }}>
            Thank you for your generous support of {orgName} during {year}. Below is a record of your contributions for tax purposes.
          </p>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem', marginBottom:'1rem' }}>
            <thead><tr style={{ borderBottom:`2px solid ${NAVY}` }}>
              <th style={{ padding:8, textAlign:'left' }}>Date</th>
              <th style={{ padding:8, textAlign:'left' }}>Category</th>
              <th style={{ padding:8, textAlign:'right' }}>Amount</th>
            </tr></thead>
            <tbody>
              {generateStatement(selectedDonor).map(t => (
                <tr key={t.id} style={{ borderBottom:`1px solid ${BORDER}` }}>
                  <td style={{ padding:8 }}>{t.date}</td>
                  <td style={{ padding:8 }}>{t.category}</td>
                  <td style={{ padding:8, textAlign:'right', fontWeight:600 }}>{fmt(t.amount)}</td>
                </tr>
              ))}
              <tr style={{ borderTop:`2px solid ${NAVY}`, background: GOLD_PALE }}>
                <td colSpan={2} style={{ padding:'12px 8px', fontWeight:700 }}>TOTAL CONTRIBUTIONS</td>
                <td style={{ padding:'12px 8px', textAlign:'right', fontWeight:700, fontSize:'1.1rem', color: FOREST }}>
                  {fmt(generateStatement(selectedDonor).reduce((s,t)=>s+parseFloat(t.amount||0), 0))}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize:'0.8rem', color: TXT_LIGHT, lineHeight:1.6, marginTop:'1.5rem' }}>
            <strong>Important:</strong> No goods or services were provided in exchange for these contributions, except as noted. Please retain this statement for your tax records. {orgName} is a registered {orgType === 'church' ? '501(c)(3) religious organization' : '501(c)(3) nonprofit'}.
          </p>
          <button className="btn btn-navy" style={{ marginTop:'1.5rem', width:'100%' }} onClick={()=>window.print()}>🖨️ Print This Statement</button>
        </div>
      ) : (
        <div className="card" style={{ overflow:'hidden' }}>
          {donors.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center', color: TXT_LIGHT }}>
              <div style={{ fontSize:'2.5rem', marginBottom:8 }}>📃</div>
              <p>Add {orgConfig.donorLabel.toLowerCase()} first to generate statements.</p>
            </div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
              <thead><tr style={{ borderBottom:`1px solid ${BORDER}`, background: CREAM }}>
                {['Name','Email','Gifts','Total Given',''].map(h => <th key={h} style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'left' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {donors.map(d => {
                  const gifts = generateStatement(d);
                  const total = gifts.reduce((s,t)=>s+parseFloat(t.amount||0), 0);
                  return (
                    <tr key={d.id} style={{ borderBottom:`1px solid #F4F6FA` }}>
                      <td style={{ padding:'12px', color: NAVY, fontWeight:600 }}>{d.name}</td>
                      <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{d.email || '—'}</td>
                      <td style={{ padding:'12px', color: TXT_LIGHT }}>{gifts.length}</td>
                      <td style={{ padding:'12px', fontWeight:700, color: FOREST }}>{fmt(total)}</td>
                      <td style={{ padding:'12px' }}>
                        {gifts.length > 0 && <button className="btn btn-outline" style={{ padding:'4px 12px', fontSize:'0.78rem' }} onClick={()=>setSelectedDonor(d)}>View Statement</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ============ SETTINGS TAB ============
function SettingsTab({ user, orgName, setOrgName, orgType, setOrgType }) {
  const [name, setName] = useState(orgName);
  const [type, setType] = useState(orgType);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setOrgName(name); setOrgType(type);
    try {
      const sb = await getSupabase();
      await sb.from('organizations').upsert({ user_id: user.id, name, org_type: type });
    } catch(e) { console.log('Save settings:', e); }
    setSaving(false);
  };

  return (
    <div>
      <h2 style={{ fontSize:'1.6rem', marginBottom:'1.5rem' }}>⚙️ Settings</h2>

      <div className="card card-p" style={{ marginBottom:'1.5rem', maxWidth:600 }}>
        <h3 style={{ marginBottom:'1rem' }}>Organization Info</h3>

        <div style={{ marginBottom:'1rem' }}>
          <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Organization Name</label>
          <input style={{ width:'100%' }} value={name} onChange={e=>setName(e.target.value)} />
        </div>

        <div style={{ marginBottom:'1.5rem' }}>
          <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Organization Type</label>
          <select style={{ width:'100%' }} value={type} onChange={e=>setType(e.target.value)}>
            {ORG_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <button className="btn btn-navy" onClick={handleSave} disabled={saving}>{saving?'...':'Save Changes'}</button>
      </div>

      <div className="card card-p" style={{ maxWidth:600 }}>
        <h3 style={{ marginBottom:'1rem' }}>Account</h3>
        <p style={{ color: TXT_LIGHT, fontSize:'0.88rem', marginBottom:8 }}><strong>Email:</strong> {user.email}</p>
        <p style={{ color: TXT_LIGHT, fontSize:'0.88rem' }}><strong>Plan:</strong> 30-day Free Trial</p>
      </div>
    </div>
  );
}
