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
  'Tithes', 'Offerings', 'General Fund Giving', 'Designated Giving',
  'Building Fund', 'Capital Campaign', 'Missions', 'World Missions',
  'Local Missions', 'Youth Ministry', 'Children\'s Ministry', 'Women\'s Ministry',
  'Men\'s Ministry', 'Worship / Music Ministry', 'Outreach',
  'Benevolence Fund', 'Special Offering', 'Easter Offering', 'Christmas Offering',
  'Donations', 'Memorial Gifts', 'Pledges Received',
  'Grants', 'Foundation Grants',
  'Rental Income', 'Facility Rental',
  'Investment Income', 'Interest Income',
  'Fundraising', 'Event Income', 'Bake Sale / Yard Sale',
  'Book / Resource Sales', 'Tape / Video Sales',
  'Conference Fees', 'Retreat Fees', 'Camp Fees',
  'Tuition (Christian School)', 'Daycare Income',
  'Sunday School Offering', 'Vacation Bible School',
  'Online Giving', 'Stock / Asset Donations',
  'Other Income'
];
const INCOME_CATEGORIES_BUSINESS = [
  'Sales Revenue', 'Service Revenue', 'Consulting Revenue',
  'Subscription Revenue', 'Product Sales', 'Course Sales',
  'Coaching Fees', 'Speaking Fees', 'Workshop Fees',
  'Royalties', 'Affiliate Income', 'Commission Income',
  'Sponsorships', 'Advertising Income',
  'Grants', 'Business Grants',
  'Rental Income', 'Equipment Rental',
  'Investment Income', 'Interest Income', 'Dividend Income',
  'Refunds Received', 'Reimbursements',
  'Tip Income', 'Gratuities',
  'Online Sales', 'In-Person Sales',
  'Wholesale Revenue', 'Retail Revenue',
  'Licensing Income',
  'Other Income'
];
const INCOME_CATEGORIES_NONPROFIT = [
  'Individual Donations', 'Corporate Donations',
  'Grants', 'Government Grants', 'Foundation Grants', 'Private Grants',
  'Memberships', 'Annual Memberships',
  'Fundraising Events', 'Gala / Banquet', 'Auction', 'Run / Walk',
  'Program Fees', 'Service Fees',
  'Sponsorships', 'Corporate Sponsorships',
  'Government Funding', 'Federal Funding', 'State Funding',
  'In-Kind Donations', 'Volunteer Hours',
  'Investment Income', 'Endowment Income',
  'Rental Income', 'Facility Rental',
  'Merchandise', 'Gift Shop',
  'Tuition Income', 'Class Fees',
  'Major Gifts', 'Planned Giving / Bequest',
  'Online Donations',
  'Other Income'
];

const EXPENSE_CATEGORIES = [
  // Payroll
  'Salaries & Wages', 'Pastor Salary', 'Staff Salary',
  'Contract Labor / 1099', 'Payroll Taxes', 'Benefits',
  'Health Insurance (Staff)', 'Retirement / 403b / 401k',
  // Facility
  'Rent', 'Mortgage', 'Property Tax',
  'Utilities', 'Electric', 'Gas', 'Water / Sewer', 'Trash',
  'Internet / Phone', 'Cell Phones', 'Landline',
  'Insurance (Property)', 'Insurance (Liability)', 'Insurance (Workers Comp)',
  'Maintenance & Repairs', 'Cleaning Services', 'Lawn Care / Landscaping',
  'Pest Control', 'Security',
  // Office
  'Office Supplies', 'Software / Subscriptions', 'Computer / Equipment',
  'Office Furniture', 'Postage / Shipping', 'Printing',
  // Professional
  'Banking Fees', 'Bank Charges', 'Credit Card Processing Fees',
  'Professional Services', 'Legal Fees', 'Accounting / CPA Fees',
  'Audit Fees', 'Consulting Fees',
  // Marketing
  'Marketing & Advertising', 'Website / Hosting', 'Social Media Ads',
  'Print Advertising', 'Signage',
  // Travel
  'Travel', 'Lodging / Hotels', 'Conference Travel',
  'Meals & Entertainment', 'Vehicle / Mileage', 'Gas / Fuel', 'Vehicle Insurance',
  'Vehicle Maintenance',
  // Ministry
  'Ministry Programs', 'Missions Expenses', 'Missionary Support',
  'Benevolence Paid', 'Hospitality',
  'Conferences & Training', 'Continuing Education',
  'Books & Publications', 'Curriculum & Resources',
  'Events & Hospitality', 'Special Events',
  'Volunteer Appreciation', 'Staff Appreciation',
  'Worship & Music', 'Music Licensing', 'Instruments / Equipment',
  'Audio / Visual Equipment',
  'Children\'s Ministry Supplies', 'Youth Ministry Supplies',
  'Sunday School Materials', 'VBS Supplies',
  'Communion / Sacrament Supplies', 'Baptismal Supplies',
  // Business specific
  'Cost of Goods Sold', 'Inventory', 'Materials',
  'Shipping & Handling', 'Packaging',
  'Subscription Services', 'Cloud Storage',
  // Other
  'Charitable Contributions Made',
  'Taxes (other)', 'Licenses & Permits', 'Dues / Memberships',
  'Bad Debt', 'Depreciation',
  'Other Expenses'
];

const FUND_TYPES = ['General', 'Building', 'Missions', 'Youth', 'Benevolence', 'Memorial', 'Designated', 'Reserve'];

// Smart category guesser from description
const guessIncomeCategory = (desc, orgType) => {
  const d = (desc || '').toLowerCase();
  if (orgType === 'church') {
    if (/(tithe)/i.test(d)) return 'Tithes';
    if (/(offering)/i.test(d)) return 'Offerings';
    if (/(building)/i.test(d)) return 'Building Fund';
    if (/(mission)/i.test(d)) return 'Missions';
    if (/(youth)/i.test(d)) return 'Youth Ministry';
    if (/(children|kids)/i.test(d)) return 'Children\'s Ministry';
    if (/(women)/i.test(d)) return 'Women\'s Ministry';
    if (/(benevolence|benevolent)/i.test(d)) return 'Benevolence Fund';
    if (/(memorial)/i.test(d)) return 'Memorial Gifts';
    if (/(easter)/i.test(d)) return 'Easter Offering';
    if (/(christmas)/i.test(d)) return 'Christmas Offering';
    if (/(pledge)/i.test(d)) return 'Pledges Received';
    if (/(rent)/i.test(d)) return 'Rental Income';
    if (/(interest)/i.test(d)) return 'Interest Income';
    if (/(grant)/i.test(d)) return 'Grants';
    if (/(online|electronic|ach|paypal|stripe|tithely)/i.test(d)) return 'Online Giving';
    return 'Offerings';
  }
  if (orgType === 'business') {
    if (/(invoice|payment|sale|product)/i.test(d)) return 'Sales Revenue';
    if (/(consult|consulting)/i.test(d)) return 'Consulting Revenue';
    if (/(subscription|monthly|recurring)/i.test(d)) return 'Subscription Revenue';
    if (/(course|class|training)/i.test(d)) return 'Course Sales';
    if (/(coach|coaching)/i.test(d)) return 'Coaching Fees';
    if (/(speak|keynote|workshop)/i.test(d)) return 'Speaking Fees';
    if (/(rent)/i.test(d)) return 'Rental Income';
    if (/(interest)/i.test(d)) return 'Interest Income';
    if (/(refund|return)/i.test(d)) return 'Refunds Received';
    if (/(tip|gratuity)/i.test(d)) return 'Tip Income';
    return 'Sales Revenue';
  }
  // nonprofit
  if (/(grant)/i.test(d)) return 'Grants';
  if (/(member)/i.test(d)) return 'Memberships';
  if (/(event|gala|auction)/i.test(d)) return 'Fundraising Events';
  if (/(program)/i.test(d)) return 'Program Fees';
  if (/(sponsor)/i.test(d)) return 'Sponsorships';
  return 'Individual Donations';
};

const guessExpenseCategory = (desc) => {
  const d = (desc || '').toLowerCase();
  // Payroll
  if (/(payroll|salary|wage|paycheck)/i.test(d)) return 'Salaries & Wages';
  if (/(contract|1099|freelance)/i.test(d)) return 'Contract Labor / 1099';
  if (/(insurance.*health|health.*insurance)/i.test(d)) return 'Health Insurance (Staff)';
  // Facility
  if (/(rent|lease)/i.test(d)) return 'Rent';
  if (/(mortgage)/i.test(d)) return 'Mortgage';
  if (/(electric|power)/i.test(d)) return 'Electric';
  if (/(water|sewer)/i.test(d)) return 'Water / Sewer';
  if (/(gas\s|natural gas)/i.test(d)) return 'Gas';
  if (/(internet|wifi|spectrum|comcast|cox)/i.test(d)) return 'Internet / Phone';
  if (/(phone|verizon|at\&t|t-mobile|cellular)/i.test(d)) return 'Internet / Phone';
  if (/(clean|janitor)/i.test(d)) return 'Cleaning Services';
  if (/(lawn|landscape|mow)/i.test(d)) return 'Lawn Care / Landscaping';
  if (/(repair|maintenance|fix)/i.test(d)) return 'Maintenance & Repairs';
  // Office
  if (/(office.*supply|staples|paper)/i.test(d)) return 'Office Supplies';
  if (/(software|subscription|saas|adobe|microsoft|google|dropbox|zoom)/i.test(d)) return 'Software / Subscriptions';
  if (/(computer|laptop|monitor|equipment)/i.test(d)) return 'Computer / Equipment';
  if (/(postage|stamp|usps|fedex|ups|shipping)/i.test(d)) return 'Postage / Shipping';
  if (/(print)/i.test(d)) return 'Printing';
  // Banking
  if (/(bank fee|service charge|monthly fee)/i.test(d)) return 'Banking Fees';
  if (/(stripe|square|paypal fee|processing)/i.test(d)) return 'Credit Card Processing Fees';
  // Professional
  if (/(legal|attorney|lawyer)/i.test(d)) return 'Legal Fees';
  if (/(cpa|accountant|tax prep)/i.test(d)) return 'Accounting / CPA Fees';
  // Marketing
  if (/(facebook|instagram|google ads|advertising|marketing)/i.test(d)) return 'Marketing & Advertising';
  if (/(website|hosting|domain)/i.test(d)) return 'Website / Hosting';
  // Travel
  if (/(hotel|motel|lodging|airbnb)/i.test(d)) return 'Lodging / Hotels';
  if (/(airline|flight|delta|southwest|united|american airlines)/i.test(d)) return 'Travel';
  if (/(uber|lyft|taxi|rental car)/i.test(d)) return 'Travel';
  if (/(restaurant|cafe|coffee|meal)/i.test(d)) return 'Meals & Entertainment';
  if (/(shell|exxon|chevron|gas station|fuel)/i.test(d)) return 'Gas / Fuel';
  // Ministry
  if (/(mission|missionary)/i.test(d)) return 'Missions Expenses';
  if (/(benevolence|benevolent)/i.test(d)) return 'Benevolence Paid';
  if (/(conference|convention|seminar)/i.test(d)) return 'Conferences & Training';
  if (/(book|publication|amazon kindle)/i.test(d)) return 'Books & Publications';
  if (/(curriculum|lesson|study material)/i.test(d)) return 'Curriculum & Resources';
  if (/(worship|music|hymn)/i.test(d)) return 'Worship & Music';
  if (/(audio|visual|microphone|speaker|projector)/i.test(d)) return 'Audio / Visual Equipment';
  if (/(youth)/i.test(d)) return 'Youth Ministry Supplies';
  if (/(children|kids)/i.test(d)) return 'Children\'s Ministry Supplies';
  if (/(license|permit)/i.test(d)) return 'Licenses & Permits';
  return 'Other Expenses';
};

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
  const userKey = user?.email ? user.email.toLowerCase().replace(/[^a-z0-9]/g,'_') : 'guest';
  const [customIncomeCats, setCustomIncomeCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`ksp_${userKey}_inc_cats`) || '[]'); } catch { return []; }
  });
  const [customExpenseCats, setCustomExpenseCats] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`ksp_${userKey}_exp_cats`) || '[]'); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(`ksp_${userKey}_inc_cats`, JSON.stringify(customIncomeCats)); } catch {} }, [customIncomeCats, userKey]);
  useEffect(() => { try { localStorage.setItem(`ksp_${userKey}_exp_cats`, JSON.stringify(customExpenseCats)); } catch {} }, [customExpenseCats, userKey]);

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

  const baseOrgConfig = ORG_TYPES.find(t => t.id === orgType) || ORG_TYPES[0];
  const orgConfig = {
    ...baseOrgConfig,
    incomeCategories: [...baseOrgConfig.incomeCategories, ...customIncomeCats],
    expenseCategories: [...EXPENSE_CATEGORIES, ...customExpenseCats],
  };

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
        {tab === 'overview' && <OverviewTab transactions={transactions} donors={donors} funds={funds} orgConfig={orgConfig} setTab={setTab} />}
        {tab === 'transactions' && <TransactionsTab user={user} transactions={transactions} setTransactions={setTransactions} donors={donors} setDonors={setDonors} funds={funds} orgConfig={orgConfig} />}
        {tab === 'donors' && <DonorsTab user={user} donors={donors} setDonors={setDonors} transactions={transactions} setTransactions={setTransactions} orgConfig={orgConfig} />}
        {tab === 'funds' && orgConfig.hasFunds && <FundsTab user={user} funds={funds} setFunds={setFunds} transactions={transactions} />}
        {tab === 'reports' && <ReportsTab transactions={transactions} orgConfig={orgConfig} />}
        {tab === 'statements' && <StatementsTab user={user} donors={donors} transactions={transactions} orgConfig={orgConfig} orgName={orgName} />}
        {tab === 'settings' && <SettingsTab user={user} orgName={orgName} setOrgName={setOrgName} orgType={orgType} setOrgType={setOrgType} customIncomeCats={customIncomeCats} setCustomIncomeCats={setCustomIncomeCats} customExpenseCats={customExpenseCats} setCustomExpenseCats={setCustomExpenseCats} />}
      </main>
    </div>
  );
}

// ============ OVERVIEW TAB ============
function OverviewTab({ transactions, donors, funds, orgConfig, setTab }) {
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
          <button className="btn btn-navy" onClick={()=>setTab('transactions')}>+ Record Income / Expense</button>
          <button className="btn btn-outline" onClick={()=>setTab('transactions')}>📥 Import CSV</button>
          <button className="btn btn-outline" onClick={()=>setTab('donors')}>👥 Manage {orgConfig.donorLabel}</button>
          <button className="btn btn-outline" onClick={()=>setTab('reports')}>📄 Generate Report</button>
          <button className="btn btn-outline" onClick={()=>setTab('statements')}>📃 Year-End Statements</button>
        </div>
      </div>

      {/* First-time welcome (also navigates to transactions) */}
      {transactions.length === 0 && (
        <div className="card card-p" style={{ textAlign:'center', padding:'3rem', marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:8 }}>🚀</div>
          <h3 style={{ marginBottom:8 }}>Welcome to Kingdom Stewardship Pro!</h3>
          <p style={{ color: TXT_LIGHT, marginBottom:'1.5rem' }}>Get started by recording your first transaction or importing a bank CSV.</p>
          <button className="btn btn-gold" onClick={()=>setTab('transactions')}>+ Record Your First Transaction</button>
        </div>
      )}

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
        <div style={{ display:'none' }} />
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
function TransactionsTab({ user, transactions, setTransactions, donors, setDonors, funds, orgConfig }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importFundId, setImportFundId] = useState(funds[0]?.id || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [type, setType] = useState('income');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(orgConfig.incomeCategories[0]);
  const [description, setDescription] = useState('');
  const [donorId, setDonorId] = useState('');
  const [fundId, setFundId] = useState(funds[0]?.id || '');
  const [notes, setNotes] = useState('');

  const handleCSVUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { alert('File is empty'); return; }
      // Auto-detect delimiter: tab or comma
      const firstLine = lines[0];
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const DELIM = tabCount > commaCount ? '\t' : ',';
      const header = lines[0].split(DELIM).map(x => x.replace(/"/g,'').trim().toLowerCase());

      // ===== TITHELY FORMAT DETECTION =====
      const isTithely = header.includes('giving type') &&
                        (header.includes('transaction date') || header.includes('deposit date')) &&
                        (header.includes('first name') || header.includes('name') || header.includes('member id') || header.includes('transaction id'));

      const findCol = (names) => {
        for (const n of names) {
          const idx = header.findIndex(h => h === n);
          if (idx >= 0) return idx;
        }
        for (const n of names) {
          const idx = header.findIndex(h => h.includes(n));
          if (idx >= 0) return idx;
        }
        return -1;
      };

      let parsed;
      if (isTithely) {
        // Tithely-specific parsing
        const txIdIdx = findCol(['transaction id']);
        const amtIdx = findCol(['amount']);
        const netAmtIdx = findCol(['net amount']);
        const firstNameIdx = findCol(['first name']);
        const lastNameIdx = findCol(['last name']);
        const nameIdx = findCol(['name']);
        const emailIdx = findCol(['contact email','email']);
        const addrIdx = findCol(['address']);
        const cityIdx = findCol(['city']);
        const stateIdx = findCol(['state / province','state','province']);
        const postalIdx = findCol(['postal','zip']);
        const phoneIdx = findCol(['phone']);
        const givingIdx = findCol(['giving type']);
        const memoIdx = findCol(['memo / note','memo','note']);
        const txDateIdx = findCol(['transaction date']);
        const depDateIdx = findCol(['deposit date']);
        const methodIdx = findCol(['payment method']);
        const refundIdx = findCol(['refund / remove','refund','remove']);

        parsed = lines.slice(1).map((l, idx) => {
          // Properly handle quoted CSV/TSV (Tithely has commas in addresses)
          let c;
          if (DELIM === '\t') {
            // Tab-separated: simple split
            c = l.split('\t').map(x => x.replace(/"/g,'').trim());
          } else {
            // Comma-separated: handle quoted commas
            c = [];
            let cur = '', inQ = false;
            for (let i = 0; i < l.length; i++) {
              const ch = l[i];
              if (ch === '"') { inQ = !inQ; continue; }
              if (ch === ',' && !inQ) { c.push(cur.trim()); cur = ''; continue; }
              cur += ch;
            }
            c.push(cur.trim());
          }

          // Skip refunded entries
          if (refundIdx >= 0 && c[refundIdx] && /yes|true|refund/i.test(c[refundIdx])) return null;

          let date = (txDateIdx >= 0 ? c[txDateIdx] : (depDateIdx >= 0 ? c[depDateIdx] : '')) || '';
          if (date.includes('/')) {
            const parts = date.split('/');
            if (parts.length === 3) {
              const mo = parts[0].padStart(2,'0');
              const dy = parts[1].padStart(2,'0');
              let yr = parts[2]; if (yr.length === 2) yr = '20' + yr;
              date = `${yr}-${mo}-${dy}`;
            }
          }

          const amt = parseFloat((c[amtIdx]||'').replace(/[$,]/g,'')) || 0;
          if (amt === 0) return null;

          // Build donor name from First + Last, or fall back to Name column
          let donorName = '';
          if (firstNameIdx >= 0 || lastNameIdx >= 0) {
            const first = firstNameIdx >= 0 ? (c[firstNameIdx] || '').trim() : '';
            const last = lastNameIdx >= 0 ? (c[lastNameIdx] || '').trim() : '';
            donorName = `${first} ${last}`.trim();
          }
          if (!donorName && nameIdx >= 0) donorName = c[nameIdx] || '';
          if (!donorName) donorName = 'Anonymous';

          const givingType = givingIdx >= 0 ? c[givingIdx] : '';
          const memo = memoIdx >= 0 ? c[memoIdx] : '';
          const method = methodIdx >= 0 ? c[methodIdx] : '';

          // Build full address from parts
          let fullAddr = '';
          if (addrIdx >= 0) fullAddr = c[addrIdx] || '';
          const addrParts = [];
          if (cityIdx >= 0 && c[cityIdx]) addrParts.push(c[cityIdx]);
          if (stateIdx >= 0 && c[stateIdx]) addrParts.push(c[stateIdx]);
          if (postalIdx >= 0 && c[postalIdx]) addrParts.push(c[postalIdx]);
          if (addrParts.length > 0) fullAddr = fullAddr + (fullAddr ? ', ' : '') + addrParts.join(', ');

          // Map Tithely "Giving Type" to our categories
          const validCats = orgConfig.incomeCategories;
          let chosenCat = validCats.find(vc => vc.toLowerCase() === (givingType||'').toLowerCase()) || '';
          if (!chosenCat) {
            const gt = (givingType || '').toLowerCase();
            if (/tithe/i.test(gt)) chosenCat = 'Tithes';
            else if (/general|offering/i.test(gt)) chosenCat = 'Offerings';
            else if (/building|capital/i.test(gt)) chosenCat = 'Building Fund';
            else if (/mission/i.test(gt)) chosenCat = 'Missions';
            else if (/youth/i.test(gt)) chosenCat = 'Youth Ministry';
            else if (/children|kids/i.test(gt)) chosenCat = "Children's Ministry";
            else if (/benevolence/i.test(gt)) chosenCat = 'Benevolence Fund';
            else if (/easter/i.test(gt)) chosenCat = 'Easter Offering';
            else if (/christmas/i.test(gt)) chosenCat = 'Christmas Offering';
            else if (/memorial/i.test(gt)) chosenCat = 'Memorial Gifts';
            else if (/pledge/i.test(gt)) chosenCat = 'Pledges Received';
            else chosenCat = 'Online Giving';
            if (!validCats.includes(chosenCat)) chosenCat = validCats[0];
          }

          // Match donor by name (skip Anonymous)
          let matchedDonorId = '';
          if (donorName && donorName !== 'Anonymous') {
            const match = donors.find(d => d.name.toLowerCase() === donorName.toLowerCase());
            if (match) matchedDonorId = match.id;
          }

          const desc = givingType + (memo ? ' — ' + memo : '') + (method ? ' (' + method + ')' : '');

          // Use Tithely Transaction ID as our ID — but make it short and safe
          const tithelyTxId = txIdIdx >= 0 ? (c[txIdIdx] || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 30) : '';
          const rowId = tithelyTxId ? 'thly_' + tithelyTxId : 'tx_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).slice(2,10);

          return {
            id: rowId,
            date, description: (desc || 'Tithely import').slice(0, 500), amount: amt, type: 'income',
            category: chosenCat, donor_id: matchedDonorId, donorName,
            _tithely: true,
            _email: emailIdx >= 0 ? c[emailIdx] : '',
            _phone: phoneIdx >= 0 ? c[phoneIdx] : '',
            _address: fullAddr,
            include: true,
          };
        }).filter(r => r !== null);
      } else {
        // ===== GENERIC CSV PARSING =====
        const dateIdx = findCol(['date','posted','transaction date']);
        const descIdx = findCol(['description','desc','payee','merchant','memo','name','details']);
        const amtIdx = findCol(['amount','value']);
        const debitIdx = findCol(['debit','withdrawal','expense']);
        const creditIdx = findCol(['credit','deposit','income']);
        const catIdx = findCol(['category','cat','type']);
        const donorIdx = findCol(['donor','member','customer','from','contributor','giver']);

        parsed = lines.slice(1).map((l, idx) => {
          const c = l.split(DELIM).map(x => x.replace(/"/g,'').trim());
          let date = (dateIdx >= 0 ? c[dateIdx] : c[0]) || '';
          if (date.includes('/')) {
            const parts = date.split('/');
            if (parts.length === 3) {
              const mo = parts[0].padStart(2,'0');
              const dy = parts[1].padStart(2,'0');
              let yr = parts[2]; if (yr.length === 2) yr = '20' + yr;
              date = `${yr}-${mo}-${dy}`;
            }
          }
          let desc = (descIdx >= 0 ? c[descIdx] : '') || 'Imported';
          let amt = 0;
          let txType = 'expense';
          if (amtIdx >= 0 && c[amtIdx]) {
            const n = parseFloat((c[amtIdx]||'').replace(/[$,]/g,'')) || 0;
            amt = Math.abs(n);
            txType = n >= 0 ? 'income' : 'expense';
          } else if (debitIdx >= 0 || creditIdx >= 0) {
            const debit = debitIdx >= 0 ? (parseFloat((c[debitIdx]||'').replace(/[$,]/g,'')) || 0) : 0;
            const credit = creditIdx >= 0 ? (parseFloat((c[creditIdx]||'').replace(/[$,]/g,'')) || 0) : 0;
            if (credit > 0) { amt = credit; txType = 'income'; }
            else if (debit > 0) { amt = debit; txType = 'expense'; }
          }
          const cat = catIdx >= 0 ? c[catIdx] : '';
          const donorName = donorIdx >= 0 ? c[donorIdx] : '';
          if (amt === 0) return null;
          let chosenCat = '';
          const validCats = txType === 'income' ? orgConfig.incomeCategories : orgConfig.expenseCategories;
          if (cat) {
            chosenCat = validCats.find(vc => vc.toLowerCase() === cat.toLowerCase()) || '';
          }
          if (!chosenCat) {
            chosenCat = txType === 'income' ? guessIncomeCategory(desc, orgConfig.id) : guessExpenseCategory(desc);
            if (!validCats.includes(chosenCat)) chosenCat = validCats[0];
          }
          let matchedDonorId = '';
          if (donorName) {
            const match = donors.find(d => d.name.toLowerCase() === donorName.toLowerCase());
            if (match) matchedDonorId = match.id;
          }
          return {
            id: 'tx_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).slice(2,10),
            date, description: desc, amount: amt, type: txType,
            category: chosenCat, donor_id: matchedDonorId, donorName,
            include: true,
          };
        }).filter(r => r !== null);
      }

      if (isTithely) {
        alert(`🎉 Tithely format detected! Found ${parsed.length} transactions. Review them before importing.`);
      }
      setImportRows(parsed);
      setShowImport(true);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleImportAll = async () => {
    // First, auto-create any missing donors from Tithely rows
    const newDonors = [];
    const tithelyRows = importRows.filter(r => r.include && r._tithely && r.donorName && r.donorName !== 'Anonymous' && !r.donor_id);
    const seenNames = new Set();
    tithelyRows.forEach(r => {
      const lname = r.donorName.toLowerCase();
      if (seenNames.has(lname)) return;
      // Also check existing donors
      if (donors.some(d => d.name.toLowerCase() === lname)) return;
      seenNames.add(lname);
      newDonors.push({
        id: 'donor_' + Date.now() + '_' + Math.random().toString(36).slice(2,10),
        user_id: user.id,
        name: r.donorName,
        email: r._email || '',
        phone: r._phone || '',
        address: r._address || '',
        total_given: 0,
      });
    });

    // Update local state IMMEDIATELY so UI feels responsive
    if (newDonors.length > 0) {
      setDonors(p => [...p, ...newDonors]);
    }

    // Build donor lookup
    const allDonors = [...donors, ...newDonors];

    const toImport = importRows.filter(r => r.include).map(r => {
      let donorId = r.donor_id;
      if (!donorId && r.donorName) {
        const found = allDonors.find(d => d.name.toLowerCase() === r.donorName.toLowerCase());
        if (found) donorId = found.id;
      }
      // Remove internal _tithely fields before save
      return {
        id: r.id, user_id: user.id, type: r.type, date: r.date,
        amount: r.amount, category: r.category, description: r.description,
        donor_id: donorId || null, fund_id: importFundId || null, notes: '',
      };
    });

    // Update local state IMMEDIATELY
    setTransactions(p => [...p, ...toImport]);
    setShowImport(false);
    setImportRows([]);

    let msg = `✓ Imported ${toImport.length} transactions!`;
    if (newDonors.length > 0) msg += `\n👥 Auto-created ${newDonors.length} new donors.`;
    alert(msg);

    // Save to Supabase in the background (non-blocking)
    (async () => {
      let successCount = 0;
      let errorMessage = '';
      try {
        const sb = await getSupabase();
        if (newDonors.length > 0) {
          for (let i = 0; i < newDonors.length; i += 100) {
            const chunk = newDonors.slice(i, i+100);
            const { error } = await sb.from('ksp_donors').insert(chunk);
            if (error) {
              console.error('Donor insert error:', error);
              errorMessage = 'Donor save error: ' + error.message;
            }
          }
        }
        for (let i = 0; i < toImport.length; i += 100) {
          const chunk = toImport.slice(i, i+100);
          const { data, error } = await sb.from('ksp_transactions').insert(chunk).select();
          if (error) {
            console.error('Transaction insert error:', error);
            errorMessage = 'Transaction save error: ' + error.message + ' (code: ' + (error.code || 'N/A') + ')';
          } else {
            successCount += chunk.length;
          }
        }
        console.log('✓ Saved ' + successCount + ' transactions to Supabase');
        if (errorMessage) {
          alert('⚠️ Warning: ' + errorMessage + '\n\nSaved ' + successCount + ' of ' + toImport.length + ' transactions. Check the browser console for details.');
        }
      } catch(e) {
        console.error('Supabase save error:', e);
        alert('❌ Save failed: ' + (e.message || 'Unknown error') + '\n\nYour transactions are visible in the app but NOT saved. Check the browser console.');
      }
    })();
  };

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
          <label className="btn btn-outline" style={{ cursor:'pointer' }}>
            📥 Import CSV
            <input type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSVUpload} />
          </label>
          <button className="btn btn-navy" onClick={()=>setShowAdd(true)}>+ Add Transaction</button>
        </div>
      </div>

      {showImport && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3>📥 Review Import ({importRows.filter(r=>r.include).length} of {importRows.length} selected)</h3>
            <button onClick={()=>{ setShowImport(false); setImportRows([]); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18 }}>×</button>
          </div>
          {(() => {
            const existingIds = new Set(transactions.map(t => t.id));
            const dupCount = importRows.filter(r => existingIds.has(r.id)).length;
            if (dupCount > 0) {
              return (
                <div style={{ background:'#FFF3F3', padding:10, borderRadius:8, marginBottom:'1rem', border:`1px solid ${RED}` }}>
                  <strong style={{ color: RED }}>⚠️ {dupCount} transaction{dupCount!==1?'s':''} already imported (highlighted in red below)</strong>
                  <p style={{ fontSize:'0.82rem', color: RED, marginTop:4 }}>These have been auto-deselected. Only NEW transactions will import.</p>
                  <button onClick={() => setImportRows(prev => prev.map(r => existingIds.has(r.id) ? {...r, include: false} : r))} style={{ background: RED, color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, fontSize:'0.78rem', fontWeight:700, cursor:'pointer', marginTop:6 }}>✓ Skip duplicates</button>
                </div>
              );
            }
            return null;
          })()}
          {orgConfig.hasFunds && (
            <div style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Assign all to fund:</label>
              <select style={{ width:'100%', maxWidth:300 }} value={importFundId} onChange={e=>setImportFundId(e.target.value)}>
                {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ background:'#FAFAF6', padding:8, borderRadius:8, marginBottom:'1rem', fontSize:'0.78rem', color: TXT_LIGHT }}>
            💡 <strong>Tip:</strong> Make sure your CSV has columns: <code>Date, Description, Amount</code> (or Date, Desc, Debit, Credit). For donor matching, add a <code>Donor</code> column with names matching your donor list.
          </div>
          <div style={{ maxHeight:400, overflow:'auto', marginBottom:'1rem' }}>
            <table style={{ width:'100%', fontSize:'0.82rem' }}>
              <thead><tr style={{ background: CREAM, position:'sticky', top:0 }}>
                <th style={{ padding:6, width:30 }}><input type="checkbox" checked={importRows.every(r=>r.include)} onChange={e=>setImportRows(p=>p.map(r=>({...r, include:e.target.checked})))} /></th>
                <th style={{ padding:6, textAlign:'left' }}>Date</th>
                <th style={{ padding:6, textAlign:'left' }}>Description</th>
                <th style={{ padding:6, textAlign:'left' }}>Type</th>
                <th style={{ padding:6, textAlign:'left' }}>Category</th>
                <th style={{ padding:6, textAlign:'left' }}>Donor</th>
                <th style={{ padding:6, textAlign:'right' }}>Amount</th>
              </tr></thead>
              <tbody>
                {importRows.map((r, i) => {
                  const isDup = transactions.some(t => t.id === r.id);
                  return (
                  <tr key={r.id} style={{ borderBottom:`1px solid ${BORDER}`, background: isDup ? '#FFF3F3' : (r.include ? 'transparent' : '#F8F8F8') }}>
                    <td style={{ padding:6 }}><input type="checkbox" disabled={isDup} checked={r.include && !isDup} onChange={e=>setImportRows(p=>p.map((x,j)=>j===i?{...x, include:e.target.checked}:x))} /></td>
                    <td style={{ padding:6 }}>{r.date} {isDup && <span style={{ color: RED, fontWeight:700, fontSize:'0.7rem' }}> (DUP)</span>}</td>
                    <td style={{ padding:6 }}>{r.description.slice(0,40)}</td>
                    <td style={{ padding:6 }}>
                      <select value={r.type} onChange={e=>setImportRows(p=>p.map((x,j)=>j===i?{...x, type:e.target.value, category: e.target.value==='income'?orgConfig.incomeCategories[0]:'Other Expenses'}:x))} style={{ fontSize:'0.78rem', padding:'2px 4px' }}>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </td>
                    <td style={{ padding:6 }}>
                      <select value={r.category} onChange={e=>setImportRows(p=>p.map((x,j)=>j===i?{...x, category:e.target.value}:x))} style={{ fontSize:'0.78rem', padding:'2px 4px', maxWidth:140 }}>
                        {(r.type==='income' ? orgConfig.incomeCategories : orgConfig.expenseCategories).map(c => <option key={c}>{c}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:6 }}>
                      <select value={r.donor_id} onChange={e=>setImportRows(p=>p.map((x,j)=>j===i?{...x, donor_id:e.target.value}:x))} style={{ fontSize:'0.78rem', padding:'2px 4px', maxWidth:120 }}>
                        <option value="">— None —</option>
                        {donors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:6, textAlign:'right', fontWeight:700, color: r.type==='income'?FOREST:RED }}>{fmt(r.amount)}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={handleImportAll}>✓ Import {importRows.filter(r=>r.include).length} Transactions</button>
            <button className="btn btn-outline" onClick={()=>{ setShowImport(false); setImportRows([]); }}>Cancel</button>
          </div>
        </div>
      )}

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
                {(type==='income' ? orgConfig.incomeCategories : orgConfig.expenseCategories).map(c => <option key={c}>{c}</option>)}
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
        ) : (() => {
          // Filter by year/month
          const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            if (d.getFullYear() !== filterYear) return false;
            if (filterMonth !== 'all' && d.getMonth() !== parseInt(filterMonth)) return false;
            return true;
          });
          const sorted = [...filtered].sort((a,b)=>new Date(b.date)-new Date(a.date));
          const visibleIds = sorted.map(t => t.id);
          const selectedHere = selectedIds.filter(id => visibleIds.includes(id));
          const allSelected = visibleIds.length > 0 && selectedHere.length === visibleIds.length;
          const someSelected = selectedHere.length > 0;

          const handleBulkDelete = async () => {
            if (!confirm(`Delete ${selectedHere.length} transactions? This cannot be undone.`)) return;
            setTransactions(p => p.filter(t => !selectedHere.includes(t.id)));
            setSelectedIds(prev => prev.filter(id => !selectedHere.includes(id)));
            try {
              const sb = await getSupabase();
              // Delete in chunks of 100
              for (let i = 0; i < selectedHere.length; i += 100) {
                const chunk = selectedHere.slice(i, i+100);
                await sb.from('ksp_transactions').delete().in('id', chunk);
              }
            } catch(e) { console.log('Bulk delete:', e); }
          };

          return (
            <>
              {/* Filter Bar */}
              <div style={{ padding:'12px 16px', background: CREAM, borderBottom:`1px solid ${BORDER}`, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.78rem', fontWeight:700, color: TXT_LIGHT }}>FILTER:</span>
                <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{ padding:'4px 8px', fontSize:'0.82rem' }}>
                  <option value="all">All months</option>
                  {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={filterYear} onChange={e=>setFilterYear(parseInt(e.target.value))} style={{ padding:'4px 8px', fontSize:'0.82rem' }}>
                  {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <span style={{ fontSize:'0.82rem', color: TXT_LIGHT, marginLeft:'auto' }}>{filtered.length} transactions · {fmt(filtered.filter(t=>t.type==='income').reduce((s,t)=>s+parseFloat(t.amount||0),0))} income</span>
              </div>

              {/* Bulk Action Bar */}
              {someSelected && (
                <div style={{ background: GOLD_PALE, padding:'10px 14px', borderBottom:`1px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#8B6914' }}>✓ {selectedHere.length} selected</span>
                  <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                    <button onClick={()=>setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)))} style={{ padding:'5px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background:'#fff', color: NAVY, border:`1px solid ${BORDER}`, cursor:'pointer' }}>Clear</button>
                    <button onClick={handleBulkDelete} style={{ padding:'5px 12px', borderRadius:6, fontSize:'0.78rem', fontWeight:700, background: RED, color:'#fff', border:'none', cursor:'pointer' }}>🗑 Delete {selectedHere.length} selected</button>
                  </div>
                </div>
              )}

              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
                <thead><tr style={{ borderBottom:`1px solid ${BORDER}`, background: CREAM }}>
                  <th style={{ padding:'10px 8px 10px 14px', width:30 }}>
                    <input type="checkbox" checked={allSelected} onChange={e=>{
                      if (e.target.checked) setSelectedIds(prev => [...new Set([...prev, ...visibleIds])]);
                      else setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
                    }} />
                  </th>
                  {['Date','Type','Description','Donor','Category','Amount',''].map(h => <th key={h} style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'left' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {sorted.length === 0 && <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color: TXT_LIGHT }}>No transactions match the filter</td></tr>}
                  {sorted.map(t => {
                    const isChecked = selectedIds.includes(t.id);
                    const donor = donors.find(d => d.id === t.donor_id);
                    return (
                      <tr key={t.id} style={{ borderBottom:`1px solid #F4F6FA`, background: isChecked ? '#FDF7E8' : 'transparent' }}>
                        <td style={{ padding:'10px 8px 10px 14px' }}>
                          <input type="checkbox" checked={isChecked} onChange={e=>{
                            if (e.target.checked) setSelectedIds(prev => [...prev, t.id]);
                            else setSelectedIds(prev => prev.filter(id => id !== t.id));
                          }} />
                        </td>
                        <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{t.date}</td>
                        <td style={{ padding:'12px' }}><span style={{ background: t.type==='income'?SAGE:RED_PALE, color: t.type==='income'?FOREST:RED, padding:'2px 8px', borderRadius:6, fontSize:'0.72rem', fontWeight:700 }}>{t.type==='income'?'IN':'OUT'}</span></td>
                        <td style={{ padding:'12px', color: NAVY }}>{t.description || '—'}</td>
                        <td style={{ padding:'12px' }}>
                          <select value={t.donor_id || ''} onChange={async (e) => {
                            const newDonorId = e.target.value || null;
                            setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, donor_id: newDonorId } : x));
                            try { const sb = await getSupabase(); await sb.from('ksp_transactions').update({ donor_id: newDonorId }).eq('id', t.id); } catch(err) { console.log('Update donor:', err); }
                          }} style={{ background: donor ? '#fff' : '#FFF3F3', color: donor ? NAVY : RED, padding:'4px 8px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, border:`1px solid ${donor ? BORDER : RED}`, cursor:'pointer', maxWidth:160 }}>
                            <option value="">⚠ None</option>
                            {donors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </td>
                        <td style={{ padding:'12px' }}>
                          <select value={t.category || 'Other'} onChange={async (e) => {
                            const newCat = e.target.value;
                            setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, category: newCat } : x));
                            try { const sb = await getSupabase(); await sb.from('ksp_transactions').update({ category: newCat }).eq('id', t.id); } catch(err) { console.log('Update cat:', err); }
                          }} style={{ background:'#fff', color: t.type==='income'?FOREST:RED, padding:'4px 8px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, border:`1px solid ${BORDER}`, cursor:'pointer', maxWidth:180 }}>
                            {(t.type === 'income' ? orgConfig.incomeCategories : orgConfig.expenseCategories).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td style={{ padding:'12px', fontWeight:700, color: t.type==='income'?FOREST:RED }}>{t.type==='income'?'+':'-'}{fmt(t.amount)}</td>
                        <td style={{ padding:'12px' }}><button onClick={()=>handleDelete(t.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: TXT_LIGHT }}>🗑</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ============ DONORS TAB ============
function DonorsTab({ user, donors, setDonors, transactions, setTransactions, orgConfig }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Delete single donor
  const handleDeleteDonor = async (id) => {
    if (!confirm('Delete this donor? Their transactions will remain but be unlinked.')) return;
    setDonors(p => p.filter(d => d.id !== id));
    try { const sb = await getSupabase(); await sb.from('ksp_donors').delete().eq('id', id); } catch(e) { console.log('Delete donor:', e); }
  };

  // Bulk delete
  const handleBulkDeleteDonors = async () => {
    if (!confirm(`Delete ${selectedDonorIds.length} donors? Their transactions will remain but be unlinked.`)) return;
    const toDelete = [...selectedDonorIds];
    setDonors(p => p.filter(d => !toDelete.includes(d.id)));
    setSelectedDonorIds([]);
    try {
      const sb = await getSupabase();
      for (let i = 0; i < toDelete.length; i += 100) {
        const chunk = toDelete.slice(i, i+100);
        await sb.from('ksp_donors').delete().in('id', chunk);
      }
    } catch(e) { console.log('Bulk delete donors:', e); }
  };

  // Auto-merge duplicates (by name)
  const handleDedupe = async () => {
    const groups = {};
    donors.forEach(d => {
      const key = d.name.toLowerCase().trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    const dupGroups = Object.values(groups).filter(g => g.length > 1);
    if (dupGroups.length === 0) {
      alert('No duplicate donors found! ✓');
      return;
    }
    const totalDups = dupGroups.reduce((s,g) => s + (g.length-1), 0);
    if (!confirm(`Found ${dupGroups.length} sets of duplicates (${totalDups} extra records). Merge them now? The most complete record will be kept; transactions will be re-linked.`)) return;
    const idsToDelete = [];
    const reassignments = [];  // {fromId, toId}
    dupGroups.forEach(group => {
      // Keep the one with the most info (email, phone, address filled in)
      const score = (d) => (d.email?1:0) + (d.phone?1:0) + (d.address?1:0);
      group.sort((a,b) => score(b) - score(a));
      const keeper = group[0];
      group.slice(1).forEach(d => {
        idsToDelete.push(d.id);
        reassignments.push({ fromId: d.id, toId: keeper.id });
      });
    });
    // Update transactions to point to keepers
    setTransactions(prev => prev.map(t => {
      const r = reassignments.find(x => x.fromId === t.donor_id);
      return r ? { ...t, donor_id: r.toId } : t;
    }));
    // Remove dupe donors
    setDonors(p => p.filter(d => !idsToDelete.includes(d.id)));
    // Save to Supabase
    try {
      const sb = await getSupabase();
      for (const r of reassignments) {
        await sb.from('ksp_transactions').update({ donor_id: r.toId }).eq('donor_id', r.fromId);
      }
      for (let i = 0; i < idsToDelete.length; i += 100) {
        const chunk = idsToDelete.slice(i, i+100);
        await sb.from('ksp_donors').delete().in('id', chunk);
      }
      alert(`✓ Merged ${totalDups} duplicate donors!`);
    } catch(e) { console.error('Dedupe:', e); alert('Dedupe error: ' + (e.message || 'check console')); }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { alert('File is empty'); return; }
      // Auto-detect delimiter
      const firstLine = lines[0];
      const tabCount = (firstLine.match(/\t/g) || []).length;
      const commaCount = (firstLine.match(/,/g) || []).length;
      const DELIM = tabCount > commaCount ? '\t' : ',';
      const header = lines[0].split(DELIM).map(x => x.replace(/"/g,'').trim().toLowerCase());
      const findCol = (names) => {
        for (const n of names) {
          const idx = header.findIndex(h => h === n);
          if (idx >= 0) return idx;
        }
        for (const n of names) {
          const idx = header.findIndex(h => h.includes(n));
          if (idx >= 0) return idx;
        }
        return -1;
      };
      const nameIdx = findCol(['name','full name','donor','member','contact']);
      const firstNameIdx = findCol(['first name','firstname','first']);
      const lastNameIdx = findCol(['last name','lastname','last','surname']);
      const emailIdx = findCol(['email','e-mail','contact email']);
      const phoneIdx = findCol(['phone','mobile','cell','tel']);
      const addrIdx = findCol(['address','street','mailing']);
      const cityIdx = findCol(['city']);
      const stateIdx = findCol(['state / province','state','province']);
      const zipIdx = findCol(['postal','zip']);

      const parsed = lines.slice(1).map((l, idx) => {
        const c = l.split(DELIM).map(x => x.replace(/"/g,'').trim());
        // Build name (prefer First+Last over just "Name" to get full names)
        let fullName = '';
        if (firstNameIdx >= 0 || lastNameIdx >= 0) {
          const first = firstNameIdx >= 0 ? (c[firstNameIdx] || '').trim() : '';
          const last = lastNameIdx >= 0 ? (c[lastNameIdx] || '').trim() : '';
          fullName = `${first} ${last}`.trim();
        }
        if (!fullName && nameIdx >= 0 && c[nameIdx]) fullName = c[nameIdx];
        if (!fullName && c[0]) fullName = c[0];
        if (!fullName) return null;
        // Build address
        let fullAddr = '';
        if (addrIdx >= 0) fullAddr = c[addrIdx] || '';
        const parts = [];
        if (cityIdx >= 0 && c[cityIdx]) parts.push(c[cityIdx]);
        if (stateIdx >= 0 && c[stateIdx]) parts.push(c[stateIdx]);
        if (zipIdx >= 0 && c[zipIdx]) parts.push(c[zipIdx]);
        if (parts.length > 0) fullAddr = fullAddr + (fullAddr ? ', ' : '') + parts.join(', ');
        return {
          id: 'donor_' + Date.now() + '_' + idx,
          name: fullName,
          email: emailIdx >= 0 ? (c[emailIdx] || '') : '',
          phone: phoneIdx >= 0 ? (c[phoneIdx] || '') : '',
          address: fullAddr,
          include: true,
        };
      }).filter(r => r !== null);
      setImportRows(parsed);
      setShowImport(true);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleImportAll = async () => {
    const existingNames = new Set(donors.map(d => d.name.toLowerCase()));
    const toImport = importRows.filter(r => r.include && !existingNames.has(r.name.toLowerCase())).map(r => ({
      id: r.id, user_id: user.id, name: r.name,
      email: r.email, phone: r.phone, address: r.address, total_given: 0,
    }));
    if (toImport.length === 0) {
      alert('No new donors to import (all names already exist).');
      return;
    }
    setDonors(p => [...p, ...toImport]);
    try {
      const sb = await getSupabase();
      await sb.from('ksp_donors').insert(toImport);
    } catch(e) { console.log('Donor import save:', e); }
    setShowImport(false);
    setImportRows([]);
    alert(`✓ Imported ${toImport.length} ${orgConfig.donorLabel.toLowerCase()}!`);
  };

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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <h2 style={{ fontSize:'1.6rem' }}>👥 {orgConfig.donorLabel}</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn btn-outline" onClick={handleDedupe} style={{ background:'#FFF3F3', color: RED, borderColor: RED }}>🧹 Find Duplicates</button>
          <button className="btn btn-outline" onClick={async () => {
            // Re-link transactions to donors by matching name
            const unlinkedTxs = transactions.filter(t => t.type === 'income' && !t.donor_id);
            if (unlinkedTxs.length === 0) {
              alert('All transactions are already linked to donors. ✓');
              return;
            }
            const updates = [];
            unlinkedTxs.forEach(tx => {
              // Try to match by description (which often contains the donor name in Tithely format)
              // Or by checking if description contains donor name
              const desc = (tx.description || '').toLowerCase();
              for (const d of donors) {
                const lname = d.name.toLowerCase();
                if (desc.includes(lname) || lname.includes(desc.split(' ')[0])) {
                  updates.push({ id: tx.id, donor_id: d.id });
                  break;
                }
              }
            });
            if (updates.length === 0) {
              alert(`Found ${unlinkedTxs.length} unlinked transactions but couldn't match them to donors by name. You'll need to assign them manually in the Transactions tab.`);
              return;
            }
            if (!confirm(`Found ${updates.length} matches out of ${unlinkedTxs.length} unlinked. Link them now?`)) return;
            // Update local state
            setTransactions(prev => prev.map(t => {
              const match = updates.find(u => u.id === t.id);
              return match ? { ...t, donor_id: match.donor_id } : t;
            }));
            // Save to Supabase
            try {
              const sb = await getSupabase();
              for (const u of updates) {
                await sb.from('ksp_transactions').update({ donor_id: u.donor_id }).eq('id', u.id);
              }
              alert(`✓ Linked ${updates.length} transactions to donors!`);
            } catch(e) { console.log('Re-link save:', e); }
          }} style={{ background: GOLD_PALE, color:'#8B6914', borderColor: GOLD }}>🔗 Re-link Donors</button>
          <label className="btn btn-outline" style={{ cursor:'pointer' }}>
            📥 Import CSV
            <input type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSVUpload} />
          </label>
          <button className="btn btn-navy" onClick={()=>setShowAdd(true)}>+ Add {orgConfig.donorLabel.slice(0,-1)}</button>
        </div>
      </div>

      {showImport && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3>📥 Review Import ({importRows.filter(r=>r.include).length} of {importRows.length} selected)</h3>
            <button onClick={()=>{ setShowImport(false); setImportRows([]); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18 }}>×</button>
          </div>
          <div style={{ background:'#FAFAF6', padding:8, borderRadius:8, marginBottom:'1rem', fontSize:'0.78rem', color: TXT_LIGHT }}>
            💡 <strong>Expected columns:</strong> Name (or First Name + Last Name), Email, Phone, Address, City, State, Zip. Duplicates by name will be skipped.
          </div>
          <div style={{ maxHeight:400, overflow:'auto', marginBottom:'1rem' }}>
            <table style={{ width:'100%', fontSize:'0.82rem' }}>
              <thead><tr style={{ background: CREAM, position:'sticky', top:0 }}>
                <th style={{ padding:6, width:30 }}><input type="checkbox" checked={importRows.every(r=>r.include)} onChange={e=>setImportRows(p=>p.map(r=>({...r, include:e.target.checked})))} /></th>
                <th style={{ padding:6, textAlign:'left' }}>Name</th>
                <th style={{ padding:6, textAlign:'left' }}>Email</th>
                <th style={{ padding:6, textAlign:'left' }}>Phone</th>
                <th style={{ padding:6, textAlign:'left' }}>Address</th>
              </tr></thead>
              <tbody>
                {importRows.map((r, i) => {
                  const isDup = donors.some(d => d.name.toLowerCase() === r.name.toLowerCase());
                  return (
                    <tr key={r.id} style={{ borderBottom:`1px solid ${BORDER}`, background: isDup ? '#FFF3F3' : (r.include ? 'transparent' : '#F8F8F8') }}>
                      <td style={{ padding:6 }}><input type="checkbox" disabled={isDup} checked={r.include && !isDup} onChange={e=>setImportRows(p=>p.map((x,j)=>j===i?{...x, include:e.target.checked}:x))} /></td>
                      <td style={{ padding:6, color: isDup ? RED : NAVY }}>{r.name} {isDup && <span style={{ fontSize:'0.7rem', color:RED, fontWeight:700 }}>(duplicate)</span>}</td>
                      <td style={{ padding:6 }}>{r.email}</td>
                      <td style={{ padding:6 }}>{r.phone}</td>
                      <td style={{ padding:6 }}>{r.address}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={handleImportAll}>✓ Import Selected</button>
            <button className="btn btn-outline" onClick={()=>{ setShowImport(false); setImportRows([]); }}>Cancel</button>
          </div>
        </div>
      )}

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
          <>
            {selectedDonorIds.length > 0 && (
              <div style={{ background: GOLD_PALE, padding:'10px 14px', borderBottom:`1px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#8B6914' }}>✓ {selectedDonorIds.length} selected</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>setSelectedDonorIds([])} style={{ padding:'5px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background:'#fff', color: NAVY, border:`1px solid ${BORDER}`, cursor:'pointer' }}>Clear</button>
                  <button onClick={handleBulkDeleteDonors} style={{ padding:'5px 12px', borderRadius:6, fontSize:'0.78rem', fontWeight:700, background: RED, color:'#fff', border:'none', cursor:'pointer' }}>🗑 Delete {selectedDonorIds.length} selected</button>
                </div>
              </div>
            )}
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
              <thead><tr style={{ borderBottom:`1px solid ${BORDER}`, background: CREAM }}>
                <th style={{ padding:'10px 8px 10px 14px', width:30 }}>
                  <input type="checkbox" checked={selectedDonorIds.length === donors.length && donors.length > 0} onChange={e => setSelectedDonorIds(e.target.checked ? donors.map(d => d.id) : [])} />
                </th>
                {['Name','Email','Phone','Total Given','# Gifts',''].map(h => <th key={h} style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'left' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {donors.map(d => {
                  const total = donorTotals[d.id] || 0;
                  const gifts = transactions.filter(t => t.donor_id === d.id).length;
                  const isChecked = selectedDonorIds.includes(d.id);
                  return (
                    <tr key={d.id} style={{ borderBottom:`1px solid #F4F6FA`, background: isChecked ? '#FDF7E8' : 'transparent' }}>
                      <td style={{ padding:'10px 8px 10px 14px' }}>
                        <input type="checkbox" checked={isChecked} onChange={e => {
                          if (e.target.checked) setSelectedDonorIds(prev => [...prev, d.id]);
                          else setSelectedDonorIds(prev => prev.filter(id => id !== d.id));
                        }} />
                      </td>
                      <td style={{ padding:'12px', color: NAVY, fontWeight:600 }}>{d.name}</td>
                      <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{d.email || '—'}</td>
                      <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{d.phone || '—'}</td>
                      <td style={{ padding:'12px', fontWeight:700, color: FOREST }}>{fmt(total)}</td>
                      <td style={{ padding:'12px', color: TXT_LIGHT }}>{gifts}</td>
                      <td style={{ padding:'12px' }}><button onClick={() => handleDeleteDonor(d.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: TXT_LIGHT }}>🗑</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
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
  const [showAudit, setShowAudit] = useState(false);

  const generateStatement = (donor) => {
    const yearTxs = transactions.filter(t =>
      t.donor_id === donor.id &&
      t.type === 'income' &&
      new Date(t.date).getFullYear() === year
    );
    return yearTxs;
  };

  // Audit calculations
  const yearIncomeTxs = transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year);
  const totalYearIncome = yearIncomeTxs.reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const incomeWithDonor = yearIncomeTxs.filter(t => t.donor_id);
  const incomeNoDonor = yearIncomeTxs.filter(t => !t.donor_id);
  const totalWithDonor = incomeWithDonor.reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const totalNoDonor = incomeNoDonor.reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const donorsWithGifts = donors.filter(d => generateStatement(d).length > 0);
  const monthlyBreakdown = MONTHS.map((m, i) => {
    const monthTxs = yearIncomeTxs.filter(t => new Date(t.date).getMonth() === i);
    const total = monthTxs.reduce((s,t)=>s+parseFloat(t.amount||0), 0);
    return { month: m, count: monthTxs.length, total };
  }).filter(m => m.count > 0);
  const categoryBreakdown = {};
  yearIncomeTxs.forEach(t => {
    const c = t.category || 'Uncategorized';
    if (!categoryBreakdown[c]) categoryBreakdown[c] = { count: 0, total: 0 };
    categoryBreakdown[c].count++;
    categoryBreakdown[c].total += parseFloat(t.amount||0);
  });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.6rem' }}>📃 Year-End Giving Statements</h2>
        <select value={year} onChange={e=>setYear(parseInt(e.target.value))} style={{ padding:'8px 12px' }}>
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="card card-p" style={{ marginBottom:'1rem', background: GOLD_PALE, borderLeft:`4px solid ${GOLD}` }}>
        <p style={{ color: NAVY, fontSize:'0.92rem' }}>
          <strong>IRS-Compliant Statements:</strong> Generate official giving statements for any {orgConfig.donorLabel.toLowerCase().slice(0,-1)} who gave during {year}. These can be printed, emailed, or saved as PDF for {orgConfig.donorLabel.toLowerCase()} to claim tax deductions.
        </p>
      </div>

      <div style={{ marginBottom:'1.5rem' }}>
        <button className="btn btn-outline" onClick={()=>setShowAudit(!showAudit)} style={{ width:'100%' }}>
          {showAudit ? '▼' : '▶'} 🔍 Statement Audit — Verify totals before generating
        </button>
      </div>

      {showAudit && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${FOREST}` }}>
          <h3 style={{ marginBottom:'1rem' }}>🔍 Statement Audit for {year}</h3>

          {/* Summary Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
            <div style={{ background: SAGE, padding:12, borderRadius:8 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color: FOREST, textTransform:'uppercase' }}>Total Income {year}</div>
              <div style={{ fontSize:'1.5rem', fontWeight:700, color: FOREST, fontFamily:'Georgia,serif' }}>{fmt(totalYearIncome)}</div>
              <div style={{ fontSize:'0.75rem', color: TXT_LIGHT }}>{yearIncomeTxs.length} transactions</div>
            </div>
            <div style={{ background: SAGE, padding:12, borderRadius:8 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color: FOREST, textTransform:'uppercase' }}>Tagged to Donor</div>
              <div style={{ fontSize:'1.5rem', fontWeight:700, color: FOREST, fontFamily:'Georgia,serif' }}>{fmt(totalWithDonor)}</div>
              <div style={{ fontSize:'0.75rem', color: TXT_LIGHT }}>{incomeWithDonor.length} transactions · ✓ in statements</div>
            </div>
            <div style={{ background: totalNoDonor > 0 ? '#FFF8E1' : SAGE, padding:12, borderRadius:8, border: totalNoDonor > 0 ? `1px solid ${GOLD}` : 'none' }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color: totalNoDonor > 0 ? '#8B6914' : FOREST, textTransform:'uppercase' }}>NOT Tagged</div>
              <div style={{ fontSize:'1.5rem', fontWeight:700, color: totalNoDonor > 0 ? '#8B6914' : FOREST, fontFamily:'Georgia,serif' }}>{fmt(totalNoDonor)}</div>
              <div style={{ fontSize:'0.75rem', color: TXT_LIGHT }}>{incomeNoDonor.length} txs · ⚠️ won't appear on statements</div>
            </div>
            <div style={{ background: SAGE, padding:12, borderRadius:8 }}>
              <div style={{ fontSize:'0.72rem', fontWeight:700, color: FOREST, textTransform:'uppercase' }}>Donors w/ Gifts</div>
              <div style={{ fontSize:'1.5rem', fontWeight:700, color: FOREST, fontFamily:'Georgia,serif' }}>{donorsWithGifts.length}</div>
              <div style={{ fontSize:'0.75rem', color: TXT_LIGHT }}>statements to send</div>
            </div>
          </div>

          {totalNoDonor > 0 && (
            <div style={{ background:'#FFF8E1', padding:12, borderRadius:8, marginBottom:'1rem', border:`1px solid ${GOLD}` }}>
              <strong style={{ color:'#8B6914' }}>⚠️ {incomeNoDonor.length} transactions ({fmt(totalNoDonor)}) aren't linked to a donor.</strong>
              <p style={{ fontSize:'0.85rem', color:'#8B6914', marginTop:4 }}>These won't appear on any donor's statement. Go to <strong>Transactions</strong>, find them, and assign donors. Common reasons: anonymous gifts, cash offerings, or missed donor name on import.</p>
            </div>
          )}

          {/* Monthly Breakdown */}
          <div style={{ marginBottom:'1.5rem' }}>
            <h4 style={{ fontSize:'1rem', marginBottom:'0.5rem' }}>📅 Monthly Income — Compare to Tithely</h4>
            <table style={{ width:'100%', fontSize:'0.88rem' }}>
              <thead><tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                <th style={{ padding:'8px', textAlign:'left', color: TXT_LIGHT, fontSize:'0.75rem', textTransform:'uppercase' }}>Month</th>
                <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.75rem', textTransform:'uppercase' }}>Transactions</th>
                <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.75rem', textTransform:'uppercase' }}>Total</th>
              </tr></thead>
              <tbody>
                {monthlyBreakdown.map(m => (
                  <tr key={m.month} style={{ borderBottom:`1px solid #F4F6FA` }}>
                    <td style={{ padding:'8px', color: NAVY }}>{m.month}</td>
                    <td style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT }}>{m.count}</td>
                    <td style={{ padding:'8px', textAlign:'right', fontWeight:700, color: FOREST }}>{fmt(m.total)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop:`2px solid ${NAVY}`, background: GOLD_PALE }}>
                  <td style={{ padding:'10px 8px', fontWeight:700 }}>TOTAL YEAR</td>
                  <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:700 }}>{yearIncomeTxs.length}</td>
                  <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:700, color: FOREST, fontSize:'1.05rem' }}>{fmt(totalYearIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Category Breakdown */}
          <div style={{ marginBottom:'1rem' }}>
            <h4 style={{ fontSize:'1rem', marginBottom:'0.5rem' }}>📂 By Category — Compare to Tithely</h4>
            <table style={{ width:'100%', fontSize:'0.88rem' }}>
              <thead><tr style={{ borderBottom:`1px solid ${BORDER}` }}>
                <th style={{ padding:'8px', textAlign:'left', color: TXT_LIGHT, fontSize:'0.75rem', textTransform:'uppercase' }}>Category</th>
                <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.75rem', textTransform:'uppercase' }}>Count</th>
                <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.75rem', textTransform:'uppercase' }}>Total</th>
              </tr></thead>
              <tbody>
                {Object.entries(categoryBreakdown).sort((a,b) => b[1].total - a[1].total).map(([cat, data]) => (
                  <tr key={cat} style={{ borderBottom:`1px solid #F4F6FA` }}>
                    <td style={{ padding:'8px' }}><span style={{ background: SAGE, color: FOREST, padding:'2px 8px', borderRadius:6, fontSize:'0.78rem', fontWeight:600 }}>{cat}</span></td>
                    <td style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT }}>{data.count}</td>
                    <td style={{ padding:'8px', textAlign:'right', fontWeight:700, color: FOREST }}>{fmt(data.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background:'#F0F8FF', padding:12, borderRadius:8, fontSize:'0.85rem', color: NAVY }}>
            <strong>💡 How to verify against Tithely:</strong> Log into Tithely → Reports → run a "Total Giving by Month" report for {year}. Compare the monthly totals above to Tithely's. Any difference usually means: (1) a transaction wasn't imported, (2) a date is wrong, or (3) a category was renamed.
          </div>
        </div>
      )}

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
            <strong>Important:</strong> No goods or services were provided in exchange for these contributions, except as noted. Please retain this statement for your tax records. {orgName} is a registered {orgConfig.id === 'church' ? '501(c)(3) religious organization' : '501(c)(3) nonprofit'}.
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
function SettingsTab({ user, orgName, setOrgName, orgType, setOrgType, customIncomeCats, setCustomIncomeCats, customExpenseCats, setCustomExpenseCats }) {
  const [name, setName] = useState(orgName);
  const [type, setType] = useState(orgType);
  const [saving, setSaving] = useState(false);
  const [newIncCat, setNewIncCat] = useState('');
  const [newExpCat, setNewExpCat] = useState('');

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

      <div className="card card-p" style={{ marginBottom:'1.5rem', maxWidth:600 }}>
        <h3 style={{ marginBottom:'0.5rem' }}>📂 Custom Categories</h3>
        <p style={{ color: TXT_LIGHT, fontSize:'0.85rem', marginBottom:'1rem' }}>Add your own categories beyond the built-in options.</p>

        <div style={{ marginBottom:'1.5rem' }}>
          <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:6, color: FOREST }}>💵 Custom Income Categories</label>
          <div style={{ display:'flex', gap:6, marginBottom:8 }}>
            <input style={{ flex:1 }} value={newIncCat} onChange={e=>setNewIncCat(e.target.value)} placeholder="e.g., Weekend Conference Income" onKeyDown={e=>{ if(e.key==='Enter' && newIncCat.trim()){ setCustomIncomeCats(p=>[...p, newIncCat.trim()]); setNewIncCat(''); }}} />
            <button className="btn btn-navy" onClick={()=>{ if(newIncCat.trim()){ setCustomIncomeCats(p=>[...p, newIncCat.trim()]); setNewIncCat(''); }}}>+ Add</button>
          </div>
          {customIncomeCats.length === 0 ? (
            <p style={{ fontSize:'0.78rem', color: TXT_LIGHT, fontStyle:'italic' }}>No custom income categories yet.</p>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {customIncomeCats.map((c, i) => (
                <span key={i} style={{ background: SAGE, color: FOREST, padding:'4px 8px 4px 12px', borderRadius:6, fontSize:'0.82rem', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                  {c}
                  <button onClick={()=>setCustomIncomeCats(p=>p.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:FOREST, fontSize:14, padding:0 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:6, color: RED }}>🧾 Custom Expense Categories</label>
          <div style={{ display:'flex', gap:6, marginBottom:8 }}>
            <input style={{ flex:1 }} value={newExpCat} onChange={e=>setNewExpCat(e.target.value)} placeholder="e.g., Pastor Appreciation Gift" onKeyDown={e=>{ if(e.key==='Enter' && newExpCat.trim()){ setCustomExpenseCats(p=>[...p, newExpCat.trim()]); setNewExpCat(''); }}} />
            <button className="btn btn-navy" onClick={()=>{ if(newExpCat.trim()){ setCustomExpenseCats(p=>[...p, newExpCat.trim()]); setNewExpCat(''); }}}>+ Add</button>
          </div>
          {customExpenseCats.length === 0 ? (
            <p style={{ fontSize:'0.78rem', color: TXT_LIGHT, fontStyle:'italic' }}>No custom expense categories yet.</p>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {customExpenseCats.map((c, i) => (
                <span key={i} style={{ background: RED_PALE, color: RED, padding:'4px 8px 4px 12px', borderRadius:6, fontSize:'0.82rem', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                  {c}
                  <button onClick={()=>setCustomExpenseCats(p=>p.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:RED, fontSize:14, padding:0 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-p" style={{ maxWidth:600 }}>
        <h3 style={{ marginBottom:'1rem' }}>Account</h3>
        <p style={{ color: TXT_LIGHT, fontSize:'0.88rem', marginBottom:8 }}><strong>Email:</strong> {user.email}</p>
        <p style={{ color: TXT_LIGHT, fontSize:'0.88rem' }}><strong>Plan:</strong> 30-day Free Trial</p>
      </div>
    </div>
  );
}
