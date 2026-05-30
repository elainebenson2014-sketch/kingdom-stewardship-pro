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
// Categories that are EXCLUDED from P&L (they're bookkeeping entries, not real income/expense)
const EXCLUDED_FROM_PL = [
  'Tithely Deposit',     // Tithely batch deposits to bank (already counted individually)
  'Givelify Deposit',    // Givelify batch deposits to bank (already counted individually)
  'Stripe Deposit',       // Stripe payouts (already counted)
  'PayPal Deposit',       // PayPal transfers (already counted)
  'Transfer In',          // Account-to-account transfers
  'Transfer Out',
  'Internal Transfer',
  'Loan Proceeds',        // Borrowed money (liability, not income)
  'Loan Repayment',
  'Owner Investment',     // Capital infusion
  'Owner Draw',           // Distribution to owner
];

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
  'Tithely Deposit', 'Givelify Deposit', 'Stripe Deposit', 'PayPal Deposit',
  'Transfer In', 'Other Income'
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
  'Stripe Deposit', 'PayPal Deposit', 'Transfer In',
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
  'Tithely Deposit', 'Givelify Deposit', 'Stripe Deposit', 'PayPal Deposit', 'Transfer In',
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
    // Auto-detect batch payouts from giving platforms (these are excluded from P&L to avoid double-counting)
    if (/(tithely|tithe\.ly|wave sv|wave sa|wave dep)/i.test(d)) return 'Tithely Deposit';
    if (/(givelify|givelfy)/i.test(d)) return 'Givelify Deposit';
    if (/(stripe)/i.test(d)) return 'Stripe Deposit';
    if (/(paypal\b|paypal si|paypalsi|pp\*paypal)/i.test(d)) return 'PayPal Deposit';
    if (/(venmo|cash app|zelle.*receive)/i.test(d)) return 'Online Giving';
    if (/(online|electronic|ach)/i.test(d)) return 'Online Giving';
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

      /* ===== MOBILE NAV (hidden on desktop) ===== */
      .ksp-mobile-bar { display:none; }
      .ksp-backdrop { display:none; }
      .ksp-close { display:none; }

      /* ===== MOBILE RESPONSIVE ===== */
      @media (max-width: 768px) {
        .ksp-sidebar {
          position: fixed !important; top:0; left:0; bottom:0; z-index:1000;
          transform: translateX(-100%); transition: transform 0.25s ease;
          width: 80% !important; max-width: 300px;
        }
        .ksp-sidebar.ksp-open { transform: translateX(0); }
        .ksp-close {
          display:block; position:absolute; top:10px; right:12px;
          background:none; border:none; color:#fff; font-size:22px; cursor:pointer;
        }
        .ksp-backdrop {
          display:block; position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:999;
        }
        .ksp-mobile-bar {
          display:flex; align-items:center; gap:12px;
          position:sticky; top:0; z-index:90;
          background:${NAVY}; color:#fff; padding:10px 14px;
        }
        .ksp-menu-btn {
          background:rgba(255,255,255,0.12); color:#fff; border:none;
          border-radius:8px; padding:9px 13px; font-size:15px; font-weight:600; cursor:pointer;
        }
        .ksp-main { padding:1rem !important; }
        /* Stacked, tappable forms and inputs */
        .ksp-main input, .ksp-main select, .ksp-main textarea { font-size:16px !important; }
        /* Wide tables scroll instead of crushing */
        .ksp-main table { display:block; overflow-x:auto; white-space:nowrap; }
      }

      /* ===== PRINT STYLES ===== */
      @media print {
        body { background: #fff !important; }
        /* Hide navigation, sidebars, buttons */
        aside, .no-print, button, nav { display: none !important; }
        /* Hide everything except print-area */
        body * { visibility: hidden; }
        .print-area, .print-area * { visibility: visible; }
        .print-area {
          position: absolute;
          left: 0; top: 0; width: 100%;
          padding: 20px !important;
          margin: 0 !important;
          background: #fff !important;
        }
        /* Adjust statement/report look */
        .print-area .card { border: none !important; box-shadow: none !important; }
        .print-area h2, .print-area h3, .print-area h4 { color: #000 !important; page-break-after: avoid; }
        .print-area table { page-break-inside: avoid; }
        /* Hide remaining UI elements */
        main { padding: 0 !important; }
        /* Force colors to print */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orgType, setOrgType] = useState('church');
  const [orgName, setOrgName] = useState('My Organization');
  const [transactions, setTransactions] = useState([]);
  const [donors, setDonors] = useState([]);
  const [vendors, setVendors] = useState([]);
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
        // Load vendors (table may not exist yet — handle gracefully)
        try {
          const { data: vs } = await sb.from('ksp_vendors').select('*').eq('user_id', user.id);
          if (vs) setVendors(vs);
        } catch(ve) { console.log('Vendors table missing — run SQL setup'); }
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
      {/* Mobile top bar with hamburger (only shows on small screens) */}
      <div className="ksp-mobile-bar">
        <button className="ksp-menu-btn" onClick={()=>setMobileMenuOpen(true)} aria-label="Open menu">☰ Menu</button>
        <span style={{ fontWeight:600 }}>👑 {orgName}</span>
      </div>

      {/* Backdrop */}
      {mobileMenuOpen && <div className="ksp-backdrop" onClick={()=>setMobileMenuOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`ksp-sidebar ${mobileMenuOpen ? 'ksp-open' : ''}`} style={{ width:240, background: NAVY, color:'#fff', padding:'1.5rem 1rem', flexShrink:0 }}>
        <button className="ksp-close" onClick={()=>setMobileMenuOpen(false)} aria-label="Close menu">✕</button>
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ fontSize:'0.8rem', color: GOLD, fontWeight:700, letterSpacing:'0.05em' }}>👑 KS PRO</div>
          <div style={{ fontSize:'1rem', fontWeight:600, marginTop:4, color: '#ffffff' }}>{orgName}</div>
          <div style={{ fontSize:'0.75rem', color:'#A8B5C8', marginTop:2 }}>{orgConfig.label}</div>
        </div>

        <nav style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {[
            { id:'overview', icon:'📊', label:'Overview' },
            { id:'transactions', icon:'💰', label:'Transactions' },
            { id:'donors', icon:'👥', label: orgConfig.donorLabel },
            { id:'vendors', icon:'🏪', label:'Vendors' },
            { id:'recurring', icon:'🔄', label:'Recurring' },
            ...(orgConfig.hasFunds ? [{ id:'funds', icon:'🏦', label:'Funds' }] : []),
            { id:'reports', icon:'📄', label:'Reports' },
            { id:'reconcile', icon:'🔍', label:'Reconcile' },
            { id:'statements', icon:'📃', label:'Statements' },
            { id:'settings', icon:'⚙️', label:'Settings' },
          ].map(item => (
            <button key={item.id} onClick={()=>{ setTab(item.id); setMobileMenuOpen(false); }} style={{
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
      <main className="ksp-main" style={{ flex:1, padding:'2rem', overflow:'auto' }}>
        {tab === 'overview' && <OverviewTab transactions={transactions} donors={donors} funds={funds} orgConfig={orgConfig} setTab={setTab} />}
        {tab === 'transactions' && <TransactionsTab user={user} transactions={transactions} setTransactions={setTransactions} donors={donors} setDonors={setDonors} vendors={vendors} setVendors={setVendors} funds={funds} orgConfig={orgConfig} />}
        {tab === 'donors' && <DonorsTab user={user} donors={donors} setDonors={setDonors} transactions={transactions} setTransactions={setTransactions} orgConfig={orgConfig} />}
        {tab === 'vendors' && <VendorsTab user={user} vendors={vendors} setVendors={setVendors} transactions={transactions} setTransactions={setTransactions} orgConfig={orgConfig} />}
        {tab === 'recurring' && <RecurringTab user={user} transactions={transactions} setTransactions={setTransactions} donors={donors} vendors={vendors} funds={funds} orgConfig={orgConfig} />}
        {tab === 'funds' && orgConfig.hasFunds && <FundsTab user={user} funds={funds} setFunds={setFunds} transactions={transactions} />}
        {tab === 'reports' && <ReportsTab transactions={transactions} donors={donors} vendors={vendors} funds={funds} orgConfig={orgConfig} orgName={orgName} />}
        {tab === 'reconcile' && <ReconcileTab user={user} transactions={transactions} setTransactions={setTransactions} orgConfig={orgConfig} />}
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

  const totalIncomeYTD = ytdTxs.filter(t => t.type==='income' && !EXCLUDED_FROM_PL.includes(t.category)).reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const totalExpensesYTD = ytdTxs.filter(t => t.type==='expense' && !EXCLUDED_FROM_PL.includes(t.category)).reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const netYTD = totalIncomeYTD - totalExpensesYTD;
  const incomeMonth = monthTxs.filter(t => t.type==='income' && !EXCLUDED_FROM_PL.includes(t.category)).reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  const expensesMonth = monthTxs.filter(t => t.type==='expense' && !EXCLUDED_FROM_PL.includes(t.category)).reduce((s,t)=>s+parseFloat(t.amount||0), 0);
  // Calculate actual totals per donor from transactions (not stored total_given)
  const donorTotalsMap = {};
  transactions.filter(t => t.type === 'income' && t.donor_id).forEach(t => {
    donorTotalsMap[t.donor_id] = (donorTotalsMap[t.donor_id] || 0) + parseFloat(t.amount||0);
  });
  const topDonors = [...donors]
    .map(d => ({ ...d, actualTotal: donorTotalsMap[d.id] || 0 }))
    .filter(d => d.actualTotal > 0)
    .sort((a,b) => b.actualTotal - a.actualTotal)
    .slice(0,5);

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
              <span style={{ color: FOREST, fontWeight:700 }}>{fmt(d.actualTotal)}</span>
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
function TransactionsTab({ user, transactions, setTransactions, donors, setDonors, vendors, setVendors, funds, orgConfig }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().slice(0,10));
  const [bulkCategory, setBulkCategory] = useState('Tithes');
  const [bulkServiceNote, setBulkServiceNote] = useState('Sunday Service');
  const [importRows, setImportRows] = useState([]);
  const [importSourceType, setImportSourceType] = useState('bank'); // 'bank' or 'giving'
  const [importFundId, setImportFundId] = useState(funds[0]?.id || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [filterDonor, setFilterDonor] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
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
      
      // Parse CSV/TSV properly, respecting quoted multi-line fields
      // This handles memos like "Tithes 400\nBldg 50" without breaking row alignment
      const splitLinesRespectQuotes = (str) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < str.length; i++) {
          const ch = str[i];
          if (ch === '"') {
            // Handle escaped quote ""
            if (i + 1 < str.length && str[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
              current += ch;
            }
          } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
            // Only split on newlines OUTSIDE quotes
            if (current.trim()) result.push(current);
            current = '';
            // Skip \r\n combo
            if (ch === '\r' && i + 1 < str.length && str[i + 1] === '\n') i++;
          } else {
            current += ch;
          }
        }
        if (current.trim()) result.push(current);
        return result;
      };
      
      const lines = splitLinesRespectQuotes(text);
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

      const isGivelify = (header.includes('envelope') || header.includes('campaign') || header.includes('external fund')) &&
                         (header.includes('donor name') || header.includes('giver name') || header.includes('full name') || header.includes('donor email') || header.includes('giver email')) &&
                         (header.includes('donation date') || header.includes('bank deposit date') || header.includes('disbursement date'));

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
        const txDateIdx = findCol(['transaction date','trans date','date','gift date']);
        const depDateIdx = findCol(['deposit date','disbursement date','bank deposit date']);
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
          date = date.trim();

          // Try multiple date formats
          let parsedDate = '';
          if (date) {
            // Format: MM/DD/YYYY or MM/DD/YY
            if (date.includes('/')) {
              const parts = date.split('/');
              if (parts.length === 3) {
                const mo = parts[0].padStart(2,'0');
                const dy = parts[1].padStart(2,'0');
                let yr = parts[2].trim(); if (yr.length === 2) yr = '20' + yr;
                if (/^\d{4}$/.test(yr) && /^\d{1,2}$/.test(mo.replace(/^0/, '')) && /^\d{1,2}$/.test(dy.replace(/^0/, ''))) {
                  parsedDate = `${yr}-${mo}-${dy}`;
                }
              }
            }
            // Format: YYYY-MM-DD (already correct)
            else if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
              parsedDate = date.slice(0, 10);
            }
            // Format: MM-DD-YYYY
            else if (date.includes('-') && date.split('-')[0].length <= 2) {
              const parts = date.split('-');
              if (parts.length === 3) {
                const mo = parts[0].padStart(2,'0');
                const dy = parts[1].padStart(2,'0');
                let yr = parts[2].trim(); if (yr.length === 2) yr = '20' + yr;
                if (/^\d{4}$/.test(yr)) parsedDate = `${yr}-${mo}-${dy}`;
              }
            }
            // Try generic Date parsing
            else {
              const d = new Date(date);
              if (!isNaN(d.getTime())) {
                parsedDate = d.toISOString().slice(0, 10);
              }
            }
          }
          // Fallback: today's date if all parsing failed
          if (!parsedDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
            parsedDate = new Date().toISOString().slice(0, 10);
          }
          date = parsedDate;

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
          // If user clicked "💝 Upload Giving", force "Tithely Deposit" (excluded from P&L)
          const validCats = orgConfig.incomeCategories;
          let chosenCat;
          if (importSourceType === 'giving') {
            chosenCat = 'Tithely Deposit';
          } else {
            chosenCat = validCats.find(vc => vc.toLowerCase() === (givingType||'').toLowerCase()) || '';
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
      } else if (isGivelify) {
        // ===== GIVELIFY PARSING =====
        const amtIdx = findCol(['donation amount','amount','gross amount']);
        const netIdx = findCol(['net amount','net donation']);
        const feeIdx = findCol(['fee','fees','givelify fee']);
        const donorNameIdx = findCol(['donor name','giver name','full name']);
        const firstNameIdx = findCol(['first name']);
        const lastNameIdx = findCol(['last name']);
        const emailIdx = findCol(['donor email','giver email','email']);
        const phoneIdx = findCol(['phone']);
        const addrIdx = findCol(['address']);
        const cityIdx = findCol(['city']);
        const stateIdx = findCol(['state','province']);
        const zipIdx = findCol(['zip','postal']);
        const envIdx = findCol(['envelope','campaign','envelope name','campaign name']);
        const memoIdx = findCol(['memo','message','note']);
        const donationDateIdx = findCol(['donation date']);
        const bankDateIdx = findCol(['bank deposit date','deposit date','disbursement date']);
        const txIdIdx = findCol(['transaction id','donation id','giving id']);
        const memberIdIdx = findCol(['external member id','member id']);

        parsed = lines.slice(1).map((l, idx) => {
          // Handle quoted CSV/TSV
          let c;
          if (DELIM === '\t') {
            c = l.split('\t').map(x => x.replace(/"/g,'').trim());
          } else {
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

          // Date parsing — try donation date first, fallback to bank deposit date
          let date = (donationDateIdx >= 0 ? c[donationDateIdx] : (bankDateIdx >= 0 ? c[bankDateIdx] : '')) || '';
          date = date.trim();
          let parsedDate = '';
          if (date) {
            if (date.includes('/')) {
              const parts = date.split('/');
              if (parts.length === 3) {
                const mo = parts[0].padStart(2,'0');
                const dy = parts[1].padStart(2,'0');
                let yr = parts[2].trim(); if (yr.length === 2) yr = '20' + yr;
                if (/^\d{4}$/.test(yr)) parsedDate = `${yr}-${mo}-${dy}`;
              }
            } else if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
              parsedDate = date.slice(0, 10);
            } else {
              const d = new Date(date);
              if (!isNaN(d.getTime())) parsedDate = d.toISOString().slice(0, 10);
            }
          }
          if (!parsedDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
            parsedDate = new Date().toISOString().slice(0, 10);
          }
          date = parsedDate;

          const amt = parseFloat((c[amtIdx]||'').replace(/[$,]/g,'')) || 0;
          if (amt === 0) return null;

          // Build donor name from First+Last or single Name column
          let donorName = '';
          if (firstNameIdx >= 0 || lastNameIdx >= 0) {
            const first = firstNameIdx >= 0 ? (c[firstNameIdx] || '').trim() : '';
            const last = lastNameIdx >= 0 ? (c[lastNameIdx] || '').trim() : '';
            donorName = `${first} ${last}`.trim();
          }
          if (!donorName && donorNameIdx >= 0) donorName = c[donorNameIdx] || '';
          if (!donorName) donorName = 'Anonymous';

          const envelope = envIdx >= 0 ? c[envIdx] : '';
          const memo = memoIdx >= 0 ? c[memoIdx] : '';

          // Build address
          let fullAddr = '';
          if (addrIdx >= 0) fullAddr = c[addrIdx] || '';
          const parts = [];
          if (cityIdx >= 0 && c[cityIdx]) parts.push(c[cityIdx]);
          if (stateIdx >= 0 && c[stateIdx]) parts.push(c[stateIdx]);
          if (zipIdx >= 0 && c[zipIdx]) parts.push(c[zipIdx]);
          if (parts.length > 0) fullAddr = fullAddr + (fullAddr ? ', ' : '') + parts.join(', ');

          // Map Givelify Envelope/Campaign to our categories
          const validCats = orgConfig.incomeCategories;
          let chosenCat = validCats.find(vc => vc.toLowerCase() === (envelope||'').toLowerCase()) || '';
          if (!chosenCat) {
            const ev = (envelope || '').toLowerCase();
            if (/tithe/i.test(ev)) chosenCat = 'Tithes';
            else if (/general|offering/i.test(ev)) chosenCat = 'Offerings';
            else if (/building|capital/i.test(ev)) chosenCat = 'Building Fund';
            else if (/mission/i.test(ev)) chosenCat = 'Missions';
            else if (/youth/i.test(ev)) chosenCat = 'Youth Ministry';
            else if (/children|kids/i.test(ev)) chosenCat = "Children's Ministry";
            else if (/benevolence/i.test(ev)) chosenCat = 'Benevolence Fund';
            else if (/easter/i.test(ev)) chosenCat = 'Easter Offering';
            else if (/christmas/i.test(ev)) chosenCat = 'Christmas Offering';
            else if (/memorial/i.test(ev)) chosenCat = 'Memorial Gifts';
            else if (/pledge/i.test(ev)) chosenCat = 'Pledges Received';
            else chosenCat = 'Online Giving';
            if (!validCats.includes(chosenCat)) chosenCat = validCats[0];
          }

          // Match donor by name
          let matchedDonorId = '';
          if (donorName && donorName !== 'Anonymous') {
            const match = donors.find(d => d.name.toLowerCase() === donorName.toLowerCase());
            if (match) matchedDonorId = match.id;
          }

          const desc = 'Givelify' + (envelope ? ' — ' + envelope : '') + (memo ? ' — ' + memo : '');

          // Use Givelify Transaction ID as unique row ID to prevent duplicates
          const givelifyId = txIdIdx >= 0 ? (c[txIdIdx] || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 30) : '';
          const rowId = givelifyId ? 'gvfy_' + givelifyId : 'tx_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).slice(2,8);

          return {
            id: rowId,
            date,
            description: (desc || 'Givelify import').slice(0, 500),
            amount: amt,
            type: 'income',
            category: chosenCat,
            donor_id: matchedDonorId,
            donorName,
            _tithely: true,  // reuse the auto-donor-creation flow
            _email: emailIdx >= 0 ? c[emailIdx] : '',
            _phone: phoneIdx >= 0 ? c[phoneIdx] : '',
            _address: fullAddr,
            include: true,
          };
        }).filter(r => r !== null);
      } else {
        // ===== SMART BANK AUTO-DETECTION =====
        // Detect which bank's CSV this is and apply appropriate rules
        let detectedBank = 'Generic';
        const headerStr = header.join(' ').toLowerCase();

        // Chase: "Details, Posting Date, Description, Amount, Type, Balance"
        if (header.includes('posting date') && header.includes('details') && header.includes('balance')) {
          detectedBank = 'Chase';
        }
        // Bank of America: "Date, Description, Amount, Running Bal."
        else if (header.includes('running bal.') || header.includes('running bal')) {
          detectedBank = 'Bank of America';
        }
        // Wells Fargo: "Date, Amount, *, *, Description" (no headers sometimes)
        else if (headerStr.includes('wells fargo')) {
          detectedBank = 'Wells Fargo';
        }
        // Capital One: "Account Number, Transaction Date, Transaction Amount, Transaction Type, Transaction Description, Balance"
        else if (header.includes('account number') && header.includes('transaction amount') && header.includes('transaction type')) {
          detectedBank = 'Capital One';
        }
        // US Bank: "Date, Transaction, Name, Memo, Amount"
        else if (header.includes('transaction') && header.includes('memo') && header.includes('name') && header.includes('amount')) {
          detectedBank = 'US Bank';
        }
        // PNC: "Date, Description, Withdrawals, Deposits, Balance"
        else if (header.includes('withdrawals') && header.includes('deposits') && header.includes('balance')) {
          detectedBank = 'PNC';
        }
        // Citi: "Status, Date, Description, Debit, Credit"
        else if (header.includes('status') && header.includes('debit') && header.includes('credit')) {
          detectedBank = 'Citi';
        }
        // Discover: "Trans. Date, Post Date, Description, Amount, Category"
        else if (header.includes('trans. date') || (header.includes('post date') && header.includes('category'))) {
          detectedBank = 'Discover';
        }
        // American Express: "Date, Description, Amount, Extended Details, Appears On Your Statement As, Address, City/State, Zip Code, Country, Reference, Category"
        else if (header.includes('extended details') || header.includes('appears on your statement as')) {
          detectedBank = 'American Express';
        }
        // Navy Federal: "Posting Date, No., Description, Debit, Credit, Balance"
        else if (header.includes('posting date') && header.includes('no.') && header.includes('debit') && header.includes('credit')) {
          detectedBank = 'Navy Federal';
        }
        // Ally: "Date, Time, Amount, Type, Description"
        else if (header.includes('time') && header.includes('type') && header.includes('amount') && header.length <= 6) {
          detectedBank = 'Ally';
        }
        // Truist (BB&T/SunTrust merger): "Date, Transaction Type, Check Number, Description, Amount, Balance"
        else if (header.includes('transaction type') && header.includes('check number')) {
          detectedBank = 'Truist';
        }
        // TD Bank: "Date, Transaction Description, Debit, Credit, Balance"
        else if (header.includes('transaction description') && header.includes('debit') && header.includes('credit')) {
          detectedBank = 'TD Bank';
        }
        // Generic fallback for any other bank
        window._lastDetectedBank = detectedBank;
        console.log('🏦 Detected bank format:', detectedBank);

        // ===== GENERIC CSV PARSING (works for detected + unknown banks) =====
        const dateIdx = findCol(['date','posted','posting date','transaction date','trans. date','post date']);
        const descIdx = findCol(['description','desc','payee','merchant','memo','name','details','transaction description','extended details']);
        const amtIdx = findCol(['amount','value','transaction amount']);
        const debitIdx = findCol(['debit','withdrawal','expense','withdrawals']);
        const creditIdx = findCol(['credit','deposit','income','deposits']);
        const catIdx = findCol(['category','cat','type','transaction type']);
        const donorIdx = findCol(['donor','member','customer','from','contributor','giver']);

        parsed = lines.slice(1).map((l, idx) => {
          const c = l.split(DELIM).map(x => x.replace(/"/g,'').trim());
          let date = (dateIdx >= 0 ? c[dateIdx] : c[0]) || '';
          date = date.trim();
          let parsedDate = '';
          if (date) {
            if (date.includes('/')) {
              const parts = date.split('/');
              if (parts.length === 3) {
                const mo = parts[0].padStart(2,'0');
                const dy = parts[1].padStart(2,'0');
                let yr = parts[2].trim(); if (yr.length === 2) yr = '20' + yr;
                if (/^\d{4}$/.test(yr)) parsedDate = `${yr}-${mo}-${dy}`;
              }
            } else if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
              parsedDate = date.slice(0, 10);
            } else {
              const d = new Date(date);
              if (!isNaN(d.getTime())) parsedDate = d.toISOString().slice(0, 10);
            }
          }
          if (!parsedDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsedDate)) {
            parsedDate = new Date().toISOString().slice(0, 10);
          }
          date = parsedDate;
          let desc = (descIdx >= 0 ? c[descIdx] : '') || 'Imported';
          // Helper to parse amounts: handles $1,234.56, ($1,234.56) accounting negatives, -$1,234.56
          const parseAmt = (str) => {
            if (!str) return 0;
            let s = String(str).trim();
            // Check for parentheses (accounting negative)
            const isParenNeg = /^\s*\(.*\)\s*$/.test(s);
            // Strip $ , ( ) and whitespace
            s = s.replace(/[$,()\s]/g, '');
            let n = parseFloat(s) || 0;
            if (isParenNeg) n = -Math.abs(n);
            return n;
          };

          let amt = 0;
          let txType = 'expense';
          // Check for "Details" column with DEBIT/CREDIT hint (Chase format)
          const detailsIdx = findCol(['details']);
          const detailsVal = detailsIdx >= 0 ? (c[detailsIdx] || '').toUpperCase().trim() : '';
          const detailsTypeHint = detailsVal === 'CREDIT' || detailsVal === 'DSLIP' ? 'income' : (detailsVal === 'DEBIT' ? 'expense' : '');

          if (amtIdx >= 0 && c[amtIdx]) {
            const n = parseAmt(c[amtIdx]);
            amt = Math.abs(n);
            // REFUND DETECTION: If Details says DEBIT but amount is POSITIVE,
            // it's actually a refund (money coming back) → mark as income
            // Chase format: refunds appear with DEBIT label but positive amount
            if (detailsTypeHint === 'expense' && n > 0) {
              txType = 'income';  // It's a refund
            } else if (detailsTypeHint) {
              txType = detailsTypeHint;
            } else {
              txType = n >= 0 ? 'income' : 'expense';
            }
          } else if (debitIdx >= 0 || creditIdx >= 0) {
            const debit = debitIdx >= 0 ? parseAmt(c[debitIdx]) : 0;
            const credit = creditIdx >= 0 ? parseAmt(c[creditIdx]) : 0;
            if (Math.abs(credit) > 0) { amt = Math.abs(credit); txType = 'income'; }
            else if (Math.abs(debit) > 0) { amt = Math.abs(debit); txType = 'expense'; }
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
          // Generate STABLE ID based on date+amount+description so re-uploading detects duplicates
          // Same transaction = same ID = upsert skips it
          const stableKey = (date || '') + '_' + amt.toFixed(2) + '_' + txType + '_' + (desc || '').slice(0, 80);
          // Simple hash function
          let hash = 0;
          for (let i = 0; i < stableKey.length; i++) {
            hash = ((hash << 5) - hash) + stableKey.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
          }
          const stableId = 'bank_' + Math.abs(hash).toString(36) + '_' + (idx % 1000);
          return {
            id: stableId,
            date, description: desc, amount: amt, type: txType,
            category: chosenCat, donor_id: matchedDonorId, donorName,
            include: true,
          };
        }).filter(r => r !== null);
      }

      if (isTithely) {
        alert(`🎉 Tithely format detected! Found ${parsed.length} transactions. Review them before importing.`);
      } else if (isGivelify) {
        alert(`🎉 Givelify format detected! Found ${parsed.length} transactions. Review them before importing.`);
      } else if (window._lastDetectedBank && window._lastDetectedBank !== 'Generic') {
        alert(`🏦 ${window._lastDetectedBank} format detected! Found ${parsed.length} transactions. Review them before importing.`);
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

    // ===== AUTO-CREATE VENDORS FROM EXPENSE TRANSACTIONS =====
    const newVendors = [];
    const seenVendorNames = new Set();

    // Extract clean vendor name from a transaction description
    const extractVendorName = (desc) => {
      if (!desc) return null;
      let d = desc.trim();
      // Remove common bank metadata patterns
      d = d.replace(/ORIG CO NAME:\s*/i, '');
      d = d.replace(/ORIG ID:\S+/gi, '');
      d = d.replace(/DESC DATE:\s*\S*/gi, '');
      d = d.replace(/CO ENTRY DESCR:\s*\S+/gi, '');
      d = d.replace(/SEC:\S+/gi, '');
      d = d.replace(/TRACE#:\S+/gi, '');
      d = d.replace(/EED:\s*\S+/gi, '');
      d = d.replace(/IND ID:\S+/gi, '');
      d = d.replace(/IND NAME:\s*/gi, '');
      d = d.replace(/TRN:\s*\S+/gi, '');
      d = d.replace(/REF\s*#?\s*\S+/gi, '');
      d = d.replace(/\d{2}\/\d{2}(\/\d{2,4})?/g, ''); // dates
      d = d.replace(/PURCHASE\s*-?\s*/i, '');
      d = d.replace(/POS\s*PURCHASE\s*/i, '');
      d = d.replace(/DEBIT CARD PURCHASE\s*/i, '');
      d = d.replace(/CHECKCARD\s*\d*\s*/i, '');
      d = d.replace(/\b\d{10,}\b/g, '');  // long account numbers
      // Take first meaningful part (before stars, asterisks, or extra info)
      d = d.split(/[\*\|]/)[0];
      d = d.replace(/\s+/g, ' ').trim();
      // Keep only first 3-4 words for cleanliness
      const words = d.split(' ').filter(w => w.length > 1).slice(0, 4);
      return words.join(' ').trim().slice(0, 60);
    };

    importRows.filter(r => r.include && r.type === 'expense' && !r.vendor_id).forEach(r => {
      const cleanName = extractVendorName(r.description);
      if (!cleanName || cleanName.length < 3) return;
      const lname = cleanName.toLowerCase();
      if (seenVendorNames.has(lname)) return;
      // Skip if vendor already exists
      if (vendors && vendors.some(v => v.name.toLowerCase() === lname)) return;
      seenVendorNames.add(lname);
      // Guess if it might need 1099 (avoid for big corporations)
      const isCorporation = /walmart|amazon|target|costco|home depot|lowes|mcdonalds|starbucks|chase|bank of america|wells fargo|capital one|verizon|att|comcast|wix|godaddy|microsoft|google|apple|netflix|spotify|adobe|ups|fedex|usps|uber|lyft|paypal|stripe/i.test(cleanName);
      newVendors.push({
        id: 'vendor_' + Date.now() + '_' + Math.random().toString(36).slice(2,10),
        user_id: user.id,
        name: cleanName,
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        default_category: r.category || '',
        is_1099: !isCorporation,  // contractors more likely to need 1099
        notes: 'Auto-created from import',
      });
    });

    // ===== AUTO-DETECT ZELLE/CASH APP DONORS (income transactions) =====
    // Extract donor name from Zelle/Cash App payment received
    const extractZelleDonor = (desc) => {
      if (!desc) return null;

      // Token-based extraction: take all word tokens until we hit one with a digit
      // (transaction IDs always have digits, real names don't)
      const tokenize = (text) => {
        const tokens = text.trim().split(/\s+/);
        const nameTokens = [];
        for (const tok of tokens) {
          if (/\d/.test(tok)) break;  // Stop at first token with a digit
          if (tok.length === 0) continue;
          // Skip common ALL-CAPS metadata words
          if (/^(ID|REF|TRN|EED|TRACE|SEC|CCD|PPD|WEB|ORIG)$/i.test(tok)) break;
          nameTokens.push(tok);
          if (nameTokens.length >= 5) break;  // Max 5 words
        }
        return nameTokens.length > 0 ? nameTokens.join(' ').slice(0, 60) : null;
      };

      // Zelle
      let m = desc.match(/zelle\s*(?:payment)?\s*(?:receive[d]?\s*)?from\s+(.+)/i);
      if (m) return tokenize(m[1]);

      // Cash App
      m = desc.match(/cash\s*app\s*\*?\s*(.+)/i);
      if (m) return tokenize(m[1]);

      // Venmo
      m = desc.match(/venmo\s*(?:payment)?\s*(.+)/i);
      if (m) return tokenize(m[1]);

      return null;
    };

    // Auto-create donors from Zelle/Cash App INCOME transactions
    importRows.filter(r => r.include && r.type === 'income' && !r.donor_id).forEach(r => {
      const senderName = extractZelleDonor(r.description);
      if (!senderName) return;
      const lname = senderName.toLowerCase();
      if (seenNames.has(lname)) return;
      if (donors.some(d => d.name.toLowerCase() === lname)) return;
      seenNames.add(lname);
      newDonors.push({
        id: 'donor_' + Date.now() + '_' + Math.random().toString(36).slice(2,10),
        user_id: user.id,
        name: senderName,
        email: '',
        phone: '',
        address: '',
        total_given: 0,
      });
    });

    // Update local state IMMEDIATELY so UI feels responsive
    if (newDonors.length > 0) {
      setDonors(p => [...p, ...newDonors]);
    }
    if (newVendors.length > 0) {
      setVendors(p => [...(p||[]), ...newVendors]);
    }

    // Build lookups
    const allDonors = [...donors, ...newDonors];
    const allVendors = [...(vendors || []), ...newVendors];

    const toImport = importRows.filter(r => r.include).map(r => {
      let donorId = r.donor_id;
      if (!donorId && r.donorName) {
        const found = allDonors.find(d => d.name.toLowerCase() === r.donorName.toLowerCase());
        if (found) donorId = found.id;
      }
      // For income, also try Zelle/Cash App name extraction
      if (!donorId && r.type === 'income') {
        const senderName = extractZelleDonor(r.description);
        if (senderName) {
          const found = allDonors.find(d => d.name.toLowerCase() === senderName.toLowerCase());
          if (found) donorId = found.id;
        }
      }
      // For expenses, link to vendor
      let vendorId = r.vendor_id;
      if (!vendorId && r.type === 'expense') {
        const cleanName = extractVendorName(r.description);
        if (cleanName) {
          const found = allVendors.find(v => v.name.toLowerCase() === cleanName.toLowerCase());
          if (found) vendorId = found.id;
        }
      }
      // Remove internal _tithely fields before save
      return {
        id: r.id, user_id: user.id, type: r.type, date: r.date,
        amount: r.amount, category: r.category, description: r.description,
        donor_id: donorId || null, vendor_id: vendorId || null, fund_id: importFundId || null, notes: '',
      };
    });

    // Update local state IMMEDIATELY
    setTransactions(p => [...p, ...toImport]);
    setShowImport(false);
    setImportRows([]);

    let msg = `✓ Imported ${toImport.length} transactions!`;
    if (newDonors.length > 0) msg += `\n👥 Auto-created ${newDonors.length} new donors.`;
    if (newVendors.length > 0) msg += `\n🏪 Auto-created ${newVendors.length} new vendors.`;
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
        if (newVendors.length > 0) {
          for (let i = 0; i < newVendors.length; i += 100) {
            const chunk = newVendors.slice(i, i+100);
            const { error } = await sb.from('ksp_vendors').insert(chunk);
            if (error) {
              console.error('Vendor insert error:', error);
              errorMessage = 'Vendor save error: ' + error.message;
            }
          }
        }
        for (let i = 0; i < toImport.length; i += 100) {
          const chunk = toImport.slice(i, i+100);
          const { data, error } = await sb.from('ksp_transactions').upsert(chunk, { onConflict: 'id' }).select();
          if (error) {
            console.error('Transaction insert error:', JSON.stringify(error, null, 2));
            console.error('Sample failing row:', JSON.stringify(chunk[0], null, 2));
            errorMessage = 'Transaction save error: ' + (error.message || JSON.stringify(error)) + ' (code: ' + (error.code || 'N/A') + ')' + (error.details ? ' Details: ' + error.details : '') + (error.hint ? ' Hint: ' + error.hint : '');
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <h2 style={{ fontSize:'1.6rem' }}>💰 Transactions</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn btn-outline" onClick={()=>setShowBulk(true)} style={{ background: GOLD_PALE, color:'#8B6914', borderColor: GOLD }}>⚡ Bulk Entry</button>
          <button className="btn btn-outline" onClick={() => {
            // Export transactions as CSV (applies current filters)
            const filtered = transactions.filter(t => {
              const d = new Date(t.date);
              if (d.getFullYear() !== filterYear) return false;
              if (filterMonth !== 'all' && d.getMonth() !== parseInt(filterMonth)) return false;
              if (filterType !== 'all' && t.type !== filterType) return false;
              if (filterDonor !== 'all') {
                if (filterDonor === 'none' && t.donor_id) return false;
                if (filterDonor !== 'none' && t.donor_id !== filterDonor) return false;
              }
              if (filterCategory !== 'all' && t.category !== filterCategory) return false;
              if (searchText) {
                const s = searchText.toLowerCase();
                const donor = donors.find(d => d.id === t.donor_id);
                const matchDonor = donor && donor.name.toLowerCase().includes(s);
                const matchDesc = (t.description || '').toLowerCase().includes(s);
                const matchCat = (t.category || '').toLowerCase().includes(s);
                const matchAmt = (parseFloat(t.amount || 0)).toFixed(2).includes(s);
                if (!matchDonor && !matchDesc && !matchCat && !matchAmt) return false;
              }
              return true;
            });
            if (filtered.length === 0) { alert('No transactions to export with current filters.'); return; }
            const sorted = [...filtered].sort((a,b)=>new Date(b.date)-new Date(a.date));
            const rows = [
              ['Date','Type','Description','Donor','Category','Amount','Notes']
            ];
            sorted.forEach(t => {
              const donor = donors.find(d => d.id === t.donor_id);
              const esc = (s) => `"${String(s||'').replace(/"/g,'""')}"`;
              rows.push([
                t.date,
                t.type,
                esc(t.description),
                esc(donor ? donor.name : ''),
                t.category,
                t.type === 'expense' ? -Math.abs(parseFloat(t.amount||0)) : parseFloat(t.amount||0),
                esc(t.notes || '')
              ].join(','));
            });
            const csv = rows.join('\n');
            const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().slice(0,10);
            a.download = `transactions_${dateStr}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}>📤 Export CSV</button>
          <label className="btn btn-outline" style={{ cursor:'pointer', background:'#F0F8FF', borderColor:'#2563EB', color:'#2563EB' }} title="Upload Chase, BofA, Wells Fargo, or other bank CSV — flows to P&L">
            🏦 Upload Bank
            <input type="file" accept=".csv" style={{ display:'none' }} onChange={(e) => { setImportSourceType('bank'); handleCSVUpload(e); }} />
          </label>
          <label className="btn btn-outline" style={{ cursor:'pointer', background:'#FFF8E1', borderColor:'#C9A84C', color:'#7A5C10' }} title="Upload Tithely, Givelify, Pushpay — for donor detail only, excluded from P&L">
            💝 Upload Giving
            <input type="file" accept=".csv,.tsv,.txt" style={{ display:'none' }} onChange={(e) => { setImportSourceType('giving'); handleCSVUpload(e); }} />
          </label>
          <button className="btn btn-navy" onClick={()=>setShowAdd(true)}>+ Add Transaction</button>
        </div>
      </div>

      {showBulk && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3>⚡ Bulk Entry — Cash &amp; Check Gifts</h3>
            <button onClick={()=>{ setShowBulk(false); setBulkRows([]); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18 }}>×</button>
          </div>
          <div style={{ background:'#F0F8FF', padding:10, borderRadius:8, marginBottom:'1rem', fontSize:'0.85rem', color: NAVY }}>
            💡 <strong>Quick entry for service offerings:</strong> All gifts share the same date, category, and service. Just enter donor + amount for each row. Perfect for Sunday cash & check offerings.
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Date</label>
              <input type="date" style={{ width:'100%' }} value={bulkDate} onChange={e=>setBulkDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Category</label>
              <select style={{ width:'100%' }} value={bulkCategory} onChange={e=>setBulkCategory(e.target.value)}>
                {orgConfig.incomeCategories.filter(c => !EXCLUDED_FROM_PL.includes(c)).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'0.78rem', fontWeight:700, display:'block', marginBottom:4 }}>Service / Event Note</label>
              <input style={{ width:'100%' }} value={bulkServiceNote} onChange={e=>setBulkServiceNote(e.target.value)} placeholder="e.g., Sunday Morning Service" />
            </div>
          </div>

          <div style={{ maxHeight:400, overflow:'auto', marginBottom:'1rem' }}>
            <table style={{ width:'100%', fontSize:'0.88rem', borderCollapse:'collapse' }}>
              <thead><tr style={{ background: CREAM, position:'sticky', top:0, borderBottom:`1px solid ${BORDER}` }}>
                <th style={{ padding:8, textAlign:'left', width:50 }}>#</th>
                <th style={{ padding:8, textAlign:'left' }}>Donor</th>
                <th style={{ padding:8, textAlign:'left' }}>Method / Note (optional)</th>
                <th style={{ padding:8, textAlign:'right', width:140 }}>Amount</th>
                <th style={{ padding:8, width:40 }}></th>
              </tr></thead>
              <tbody>
                {bulkRows.length === 0 && <tr><td colSpan={5} style={{ padding:'1.5rem', textAlign:'center', color: TXT_LIGHT }}>Click "+ Add Row" below to start entering gifts</td></tr>}
                {bulkRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid #F4F6FA` }}>
                    <td style={{ padding:6, color: TXT_LIGHT, fontWeight:700 }}>{i+1}</td>
                    <td style={{ padding:6 }}>
                      <select value={row.donor_id} onChange={e=>setBulkRows(p=>p.map((x,j)=>j===i?{...x, donor_id:e.target.value}:x))} style={{ width:'100%', padding:'4px 6px', fontSize:'0.85rem' }}>
                        <option value="">— Choose donor —</option>
                        {[...donors].sort((a,b)=>a.name.localeCompare(b.name)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:6 }}>
                      <input value={row.note} onChange={e=>setBulkRows(p=>p.map((x,j)=>j===i?{...x, note:e.target.value}:x))} placeholder="Cash / Check #1234" style={{ width:'100%', padding:'4px 6px', fontSize:'0.85rem' }} />
                    </td>
                    <td style={{ padding:6 }}>
                      <input type="number" step="0.01" value={row.amount} onChange={e=>setBulkRows(p=>p.map((x,j)=>j===i?{...x, amount:e.target.value}:x))} placeholder="0.00" style={{ width:'100%', padding:'4px 6px', fontSize:'0.85rem', textAlign:'right' }} />
                    </td>
                    <td style={{ padding:6 }}>
                      <button onClick={()=>setBulkRows(p=>p.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: RED }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
            <button className="btn btn-outline" onClick={()=>setBulkRows(p=>[...p, { donor_id:'', note:'', amount:'' }])}>+ Add Row</button>
            <button className="btn btn-outline" onClick={()=>setBulkRows(p=>[...p, ...Array(5).fill(null).map(()=>({ donor_id:'', note:'', amount:'' }))])}>+ Add 5 Rows</button>
            {bulkRows.length > 0 && <button className="btn btn-outline" onClick={()=>{ if(confirm('Clear all rows?')) setBulkRows([]); }} style={{ color: RED }}>Clear All</button>}
          </div>

          {bulkRows.length > 0 && (
            <div style={{ background: SAGE, padding:12, borderRadius:8, marginBottom:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:700, color: FOREST }}>
                {bulkRows.filter(r => r.donor_id && parseFloat(r.amount) > 0).length} valid gifts ready
              </span>
              <span style={{ fontWeight:700, color: FOREST, fontSize:'1.1rem', fontFamily:'Georgia,serif' }}>
                Total: {fmt(bulkRows.reduce((s,r) => s + (parseFloat(r.amount)||0), 0))}
              </span>
            </div>
          )}

          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={async () => {
              const valid = bulkRows.filter(r => r.donor_id && parseFloat(r.amount) > 0);
              if (valid.length === 0) { alert('No valid gifts to save. Each row needs a donor and amount.'); return; }
              const txs = valid.map((r, idx) => ({
                id: 'tx_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).slice(2,8),
                user_id: user.id,
                type: 'income',
                date: bulkDate,
                amount: parseFloat(r.amount),
                category: bulkCategory,
                description: bulkServiceNote + (r.note ? ' — ' + r.note : ''),
                donor_id: r.donor_id,
                fund_id: null,
                notes: '',
              }));
              setTransactions(p => [...p, ...txs]);
              setShowBulk(false);
              setBulkRows([]);
              alert(`✓ Recorded ${valid.length} gifts totaling ${fmt(txs.reduce((s,t)=>s+t.amount,0))}!`);
              try {
                const sb = await getSupabase();
                for (let i = 0; i < txs.length; i += 100) {
                  const chunk = txs.slice(i, i+100);
                  await sb.from('ksp_transactions').insert(chunk);
                }
              } catch(e) { console.log('Bulk save:', e); }
            }}>✓ Save {bulkRows.filter(r => r.donor_id && parseFloat(r.amount) > 0).length} Gifts</button>
            <button className="btn btn-outline" onClick={()=>{ setShowBulk(false); setBulkRows([]); }}>Cancel</button>
          </div>
        </div>
      )}

      {showImport && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${importSourceType === 'giving' ? GOLD : '#2563EB'}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3>📥 Review Import ({importRows.filter(r=>r.include).length} of {importRows.length} selected)</h3>
            <button onClick={()=>{ setShowImport(false); setImportRows([]); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18 }}>×</button>
          </div>

          {/* Source Type Banner */}
          <div style={{
            padding:'10px 14px',
            marginBottom:'1rem',
            background: importSourceType === 'giving' ? '#FFF8E1' : '#F0F8FF',
            border: `1px solid ${importSourceType === 'giving' ? GOLD : '#2563EB'}`,
            borderRadius:8,
            fontSize:'0.85rem'
          }}>
            {importSourceType === 'giving' ? (
              <>
                <strong style={{ color:'#7A5C10' }}>💝 Giving Platform Upload</strong>
                <span style={{ color:'#7A5C10', marginLeft:8 }}>— Donor detail only. Auto-categorized as "Tithely Deposit" (excluded from P&L). Bank deposits are your income source of truth.</span>
              </>
            ) : (
              <>
                <strong style={{ color:'#1E40AF' }}>🏦 Bank Statement Upload</strong>
                <span style={{ color:'#1E40AF', marginLeft:8 }}>— These flow to your P&L. Zelle/Cash App/Venmo donors auto-linked.</span>
              </>
            )}
          </div>
          {(() => {
            const existingIds = new Set(transactions.map(t => t.id));
            // Also build a content-based key for duplicate detection
            // (handles case where IDs differ but transaction is same)
            const contentKey = (t) => `${t.date}|${parseFloat(t.amount).toFixed(2)}|${t.type}|${(t.description||'').trim().slice(0,80)}`;
            const existingContentKeys = new Set(transactions.map(contentKey));
            const isDupRow = (r) => existingIds.has(r.id) || existingContentKeys.has(contentKey(r));
            const dupCount = importRows.filter(isDupRow).length;
            if (dupCount > 0) {
              return (
                <div style={{ background:'#FFF3F3', padding:10, borderRadius:8, marginBottom:'1rem', border:`1px solid ${RED}` }}>
                  <strong style={{ color: RED }}>⚠️ {dupCount} transaction{dupCount!==1?'s':''} already imported (highlighted in red below)</strong>
                  <p style={{ fontSize:'0.82rem', color: RED, marginTop:4 }}>These have been auto-deselected. Only NEW transactions will import.</p>
                  <button onClick={() => setImportRows(prev => prev.map(r => isDupRow(r) ? {...r, include: false} : r))} style={{ background: RED, color:'#fff', border:'none', padding:'5px 12px', borderRadius:6, fontSize:'0.78rem', fontWeight:700, cursor:'pointer', marginTop:6 }}>✓ Skip duplicates</button>
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
            💡 <strong>Supported banks:</strong> Chase · Bank of America · Wells Fargo · Capital One · Citi · US Bank · PNC · TD Bank · Truist · Navy Federal · Discover · American Express · Ally · plus most others. Just download CSV from your bank and upload here.
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
                  const isDup = transactions.some(t =>
                    t.id === r.id ||
                    (t.date === r.date && parseFloat(t.amount).toFixed(2) === parseFloat(r.amount).toFixed(2) && t.type === r.type && (t.description||'').trim().slice(0,80) === (r.description||'').trim().slice(0,80))
                  );
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
          // Filter by year/month/search/donor/category/type
          const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            if (d.getFullYear() !== filterYear) return false;
            if (filterMonth !== 'all' && d.getMonth() !== parseInt(filterMonth)) return false;
            if (filterType !== 'all' && t.type !== filterType) return false;
            if (filterDonor !== 'all') {
              if (filterDonor === 'none' && t.donor_id) return false;
              if (filterDonor !== 'none' && t.donor_id !== filterDonor) return false;
            }
            if (filterCategory !== 'all' && t.category !== filterCategory) return false;
            if (searchText) {
              const s = searchText.toLowerCase();
              const donor = donors.find(d => d.id === t.donor_id);
              const matchDonor = donor && donor.name.toLowerCase().includes(s);
              const matchDesc = (t.description || '').toLowerCase().includes(s);
              const matchCat = (t.category || '').toLowerCase().includes(s);
              const matchAmt = (parseFloat(t.amount || 0)).toFixed(2).includes(s);
              if (!matchDonor && !matchDesc && !matchCat && !matchAmt) return false;
            }
            return true;
          });
          // Sort
          const sortMul = sortDir === 'asc' ? 1 : -1;
          const sorted = [...filtered].sort((a,b) => {
            let av, bv;
            if (sortField === 'date') { av = a.date || ''; bv = b.date || ''; return av.localeCompare(bv) * sortMul; }
            if (sortField === 'desc') { av = (a.description || '').toLowerCase(); bv = (b.description || '').toLowerCase(); return av.localeCompare(bv) * sortMul; }
            if (sortField === 'cat') { av = a.category || ''; bv = b.category || ''; return av.localeCompare(bv) * sortMul; }
            if (sortField === 'donor') {
              const ad = donors.find(d => d.id === a.donor_id);
              const bd = donors.find(d => d.id === b.donor_id);
              av = ad ? ad.name.toLowerCase() : 'zzz';
              bv = bd ? bd.name.toLowerCase() : 'zzz';
              return av.localeCompare(bv) * sortMul;
            }
            if (sortField === 'amt') { av = parseFloat(a.amt || a.amount) || 0; bv = parseFloat(b.amt || b.amount) || 0; return (av - bv) * sortMul; }
            if (sortField === 'type') { av = a.type || ''; bv = b.type || ''; return av.localeCompare(bv) * sortMul; }
            return 0;
          });
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
              {/* Search & Filter Bar */}
              <div style={{ padding:'12px 16px', background: CREAM, borderBottom:`1px solid ${BORDER}` }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                  <input type="text" placeholder="🔍 Search description, donor, category, amount..." value={searchText} onChange={e=>setSearchText(e.target.value)} style={{ flex:1, padding:'8px 12px', fontSize:'0.88rem', borderRadius:6 }} />
                  {(searchText || filterMonth!=='all' || filterDonor!=='all' || filterCategory!=='all' || filterType!=='all') && (
                    <button onClick={()=>{setSearchText(''); setFilterMonth('all'); setFilterDonor('all'); setFilterCategory('all'); setFilterType('all');}} style={{ padding:'6px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background:'#fff', color: RED, border:`1px solid ${BORDER}`, cursor:'pointer' }}>✕ Clear filters</button>
                  )}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT }}>FILTER:</span>
                  <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ padding:'4px 8px', fontSize:'0.82rem' }}>
                    <option value="all">All types</option>
                    <option value="income">💵 Income only</option>
                    <option value="expense">🧾 Expense only</option>
                  </select>
                  <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} style={{ padding:'4px 8px', fontSize:'0.82rem' }}>
                    <option value="all">All months</option>
                    {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select value={filterYear} onChange={e=>setFilterYear(parseInt(e.target.value))} style={{ padding:'4px 8px', fontSize:'0.82rem' }}>
                    {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select value={filterDonor} onChange={e=>setFilterDonor(e.target.value)} style={{ padding:'4px 8px', fontSize:'0.82rem', maxWidth:180 }}>
                    <option value="all">All donors</option>
                    <option value="none">⚠ No donor</option>
                    {[...donors].sort((a,b)=>a.name.localeCompare(b.name)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={{ padding:'4px 8px', fontSize:'0.82rem', maxWidth:180 }}>
                    <option value="all">All categories</option>
                    {[...new Set(transactions.map(t => t.category).filter(Boolean))].sort().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span style={{ fontSize:'0.82rem', color: TXT_LIGHT, marginLeft:'auto' }}>
                    {filtered.length} txs · {fmt(filtered.filter(t=>t.type==='income').reduce((s,t)=>s+parseFloat(t.amount||0),0))} income · {fmt(filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+parseFloat(t.amount||0),0))} exp
                  </span>
                </div>
              </div>

              {/* Bulk Action Bar */}
              {someSelected && (
                <div style={{ background: GOLD_PALE, padding:'10px 14px', borderBottom:`1px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#8B6914' }}>✓ {selectedHere.length} selected</span>
                  <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                    <select onChange={async (e) => {
                      const newCat = e.target.value;
                      if (!newCat) return;
                      if (!confirm(`Change category to "${newCat}" for ${selectedHere.length} transactions?`)) { e.target.value = ''; return; }
                      setTransactions(prev => prev.map(t => selectedHere.includes(t.id) ? { ...t, category: newCat } : t));
                      try {
                        const sb = await getSupabase();
                        for (let i = 0; i < selectedHere.length; i += 100) {
                          const chunk = selectedHere.slice(i, i+100);
                          await sb.from('ksp_transactions').update({ category: newCat }).in('id', chunk);
                        }
                      } catch(err) { console.log('Bulk cat:', err); }
                      e.target.value = '';
                    }} defaultValue="" style={{ padding:'5px 8px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background:'#fff', color: NAVY, border:`1px solid ${BORDER}`, cursor:'pointer', maxWidth:180 }}>
                      <option value="">📂 Change category...</option>
                      <optgroup label="Common">
                        <option value="Tithely Deposit">📋 Tithely Deposit (excluded)</option>
                        <option value="Givelify Deposit">📋 Givelify Deposit (excluded)</option>
                        <option value="Stripe Deposit">📋 Stripe Deposit (excluded)</option>
                        <option value="PayPal Deposit">📋 PayPal Deposit (excluded)</option>
                        <option value="Transfer In">📋 Transfer In (excluded)</option>
                      </optgroup>
                      <optgroup label="Income">
                        {orgConfig.incomeCategories.filter(c => !EXCLUDED_FROM_PL.includes(c)).map(c => <option key={c} value={c}>💵 {c}</option>)}
                      </optgroup>
                      <optgroup label="Expenses">
                        {orgConfig.expenseCategories.map(c => <option key={c} value={c}>🧾 {c}</option>)}
                      </optgroup>
                    </select>
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
                  {(() => {
                    const handleSort = (field) => {
                      if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                      else { setSortField(field); setSortDir('asc'); }
                    };
                    const sortIcon = (field) => sortField !== field ? '⇅' : (sortDir === 'asc' ? '↑' : '↓');
                    const headerStyle = (field) => ({ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: sortField===field ? NAVY : TXT_LIGHT, textTransform:'uppercase', textAlign:'left', cursor:'pointer', userSelect:'none' });
                    return (
                      <>
                        <th style={headerStyle('date')} onClick={()=>handleSort('date')}>Date {sortIcon('date')}</th>
                        <th style={headerStyle('type')} onClick={()=>handleSort('type')}>Type {sortIcon('type')}</th>
                        <th style={headerStyle('desc')} onClick={()=>handleSort('desc')}>Description {sortIcon('desc')}</th>
                        <th style={headerStyle('donor')} onClick={()=>handleSort('donor')}>Donor / Vendor {sortIcon('donor')}</th>
                        <th style={headerStyle('cat')} onClick={()=>handleSort('cat')}>Category {sortIcon('cat')}</th>
                        <th style={headerStyle('amt')} onClick={()=>handleSort('amt')}>Amount {sortIcon('amt')}</th>
                        <th></th>
                      </>
                    );
                  })()}
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
                          {t.type === 'income' ? (
                            <select value={t.donor_id || ''} onChange={async (e) => {
                              const newDonorId = e.target.value || null;
                              setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, donor_id: newDonorId, vendor_id: null } : x));
                              try { const sb = await getSupabase(); await sb.from('ksp_transactions').update({ donor_id: newDonorId, vendor_id: null }).eq('id', t.id); } catch(err) { console.log('Update donor:', err); }
                            }} style={{ background: donor ? '#fff' : '#FFF3F3', color: donor ? NAVY : RED, padding:'4px 8px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, border:`1px solid ${donor ? BORDER : RED}`, cursor:'pointer', maxWidth:160 }}>
                              <option value="">⚠ Donor</option>
                              {[...donors].sort((a,b)=>a.name.localeCompare(b.name)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          ) : (
                            (() => {
                              const vendor = vendors.find(v => v.id === t.vendor_id);
                              return (
                                <select value={t.vendor_id || ''} onChange={async (e) => {
                                  const newVendorId = e.target.value || null;
                                  // Optionally auto-apply vendor's default category
                                  const v = vendors.find(x => x.id === newVendorId);
                                  const update = { vendor_id: newVendorId, donor_id: null };
                                  if (v && v.default_category) update.category = v.default_category;
                                  setTransactions(prev => prev.map(x => x.id === t.id ? { ...x, ...update } : x));
                                  try { const sb = await getSupabase(); await sb.from('ksp_transactions').update(update).eq('id', t.id); } catch(err) { console.log('Update vendor:', err); }
                                }} style={{ background: vendor ? '#fff' : '#FFF8E1', color: vendor ? NAVY : '#8B6914', padding:'4px 8px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, border:`1px solid ${vendor ? BORDER : GOLD}`, cursor:'pointer', maxWidth:160 }}>
                                  <option value="">🏪 Vendor</option>
                                  {[...vendors].sort((a,b)=>a.name.localeCompare(b.name)).map(v => <option key={v.id} value={v.id}>{v.name}{v.is_1099?' 📋':''}</option>)}
                                </select>
                              );
                            })()
                          )}
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
  const [donorSearch, setDonorSearch] = useState('');
  const [donorSortField, setDonorSortField] = useState('name');
  const [donorSortDir, setDonorSortDir] = useState('asc');
  const [editingDonor, setEditingDonor] = useState(null);
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
    // Smart dedupe: matches not just exact names, but also:
    // - Partial names (e.g., "Karen" matches "Karen A Coleman")
    // - Names without middle initials (e.g., "Karen Coleman" matches "Karen A Coleman")
    // - Different capitalization

    // First, build a normalized name key for each donor
    const getNormalizedTokens = (name) => {
      return name.toLowerCase().trim()
        .replace(/[.,]/g, '')
        .split(/\s+/)
        .filter(t => t.length > 0);
    };

    // Group donors by their "core" name (first + last, ignoring middle initial)
    const groups = {};
    donors.forEach(d => {
      const tokens = getNormalizedTokens(d.name);
      if (tokens.length === 0) return;

      // Create multiple possible match keys for this donor:
      // 1. First name only
      // 2. First + last (skipping middle initials of 1 char)
      // 3. Full normalized name
      const keys = new Set();
      keys.add(tokens[0]);  // first name
      if (tokens.length >= 2) {
        // Full name as one key
        keys.add(tokens.join(' '));
        // First + last (skip middle initials of 1 char)
        const nonInitials = tokens.filter((t,i) => i === 0 || i === tokens.length-1 || t.length > 1);
        keys.add(nonInitials.join(' '));
        // First + last only
        keys.add(tokens[0] + ' ' + tokens[tokens.length-1]);
      }
      d._matchKeys = Array.from(keys);
    });

    // Find duplicate groups using union-find style matching
    const dupGroups = [];
    const assignedGroup = {};

    donors.forEach((d1, i) => {
      if (assignedGroup[d1.id] !== undefined) return;
      const group = [d1];
      assignedGroup[d1.id] = dupGroups.length;
      donors.forEach((d2, j) => {
        if (i === j) return;
        if (assignedGroup[d2.id] !== undefined) return;
        // Check if any match key matches
        // Match logic: if shorter name's tokens are all in longer name (in order)
        const t1 = getNormalizedTokens(d1.name);
        const t2 = getNormalizedTokens(d2.name);
        const shorter = t1.length <= t2.length ? t1 : t2;
        const longer = t1.length <= t2.length ? t2 : t1;
        // First names must match
        if (shorter[0] !== longer[0]) return;
        // If shorter has only first name, that's a match (partial)
        if (shorter.length === 1) {
          group.push(d2);
          assignedGroup[d2.id] = dupGroups.length;
          return;
        }
        // If both have last names, last names must match
        if (shorter[shorter.length-1] === longer[longer.length-1]) {
          group.push(d2);
          assignedGroup[d2.id] = dupGroups.length;
        }
      });
      if (group.length > 1) {
        dupGroups.push(group);
      }
    });

    // Clean up
    donors.forEach(d => delete d._matchKeys);

    if (dupGroups.length === 0) {
      alert('No duplicate donors found! ✓');
      return;
    }
    const totalDups = dupGroups.reduce((s,g) => s + (g.length-1), 0);

    // Show a preview of what will merge
    const preview = dupGroups.slice(0, 5).map(g => {
      return `• ${g.map(d => d.name).join(' = ')}`;
    }).join('\n');
    const more = dupGroups.length > 5 ? `\n...and ${dupGroups.length - 5} more` : '';

    if (!confirm(`Found ${dupGroups.length} sets of duplicates (${totalDups} extra records).\n\nPreview:\n${preview}${more}\n\nMerge them now? The most complete record (with most info) will be kept; transactions will be re-linked.`)) return;

    const idsToDelete = [];
    const reassignments = [];
    dupGroups.forEach(group => {
      // Keep the one with the most info AND longest name (more complete)
      const score = (d) => {
        const fields = (d.email?1:0) + (d.phone?1:0) + (d.address?1:0);
        const nameLen = (d.name||'').split(/\s+/).length;  // more tokens = more complete
        return fields * 10 + nameLen;
      };
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
    if (editingDonor) {
      // Update existing
      const updated = { name, email, phone, address };
      setDonors(p => p.map(d => d.id === editingDonor.id ? { ...d, ...updated } : d));
      try { const sb = await getSupabase(); await sb.from('ksp_donors').update(updated).eq('id', editingDonor.id); } catch(e) { console.log('Update donor:', e); }
      setEditingDonor(null);
    } else {
      // Create new
      const newDonor = { id: 'donor_' + Date.now(), user_id: user.id, name, email, phone, address, total_given: 0 };
      setDonors(p => [...p, newDonor]);
      try { const sb = await getSupabase(); await sb.from('ksp_donors').insert(newDonor); } catch(e) {}
    }
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
          <button className="btn btn-outline" onClick={() => {
            if (donors.length === 0) { alert('No donors to export.'); return; }
            const rows = [['Name','Email','Phone','Address','Total Given','# Gifts']];
            [...donors].sort((a,b)=>a.name.localeCompare(b.name)).forEach(d => {
              const total = donorTotals[d.id] || 0;
              const gifts = transactions.filter(t => t.donor_id === d.id).length;
              const esc = (s) => `"${String(s||'').replace(/"/g,'""')}"`;
              rows.push([esc(d.name), esc(d.email), esc(d.phone), esc(d.address), total.toFixed(2), gifts].join(','));
            });
            const csv = rows.join('\n');
            const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `donors_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}>📤 Export CSV</button>
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
          <h3 style={{ marginBottom:'1rem' }}>{editingDonor ? `✏️ Edit ${orgConfig.donorLabel.slice(0,-1)}` : `New ${orgConfig.donorLabel.slice(0,-1)}`}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
            <input style={{ width:'100%' }} value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" />
            <input style={{ width:'100%' }} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (for statements)" />
            <input style={{ width:'100%' }} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
            <input style={{ width:'100%' }} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Mailing address" />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={handleAdd}>{editingDonor ? '✓ Save Changes' : '✓ Save'}</button>
            <button className="btn btn-outline" onClick={()=>{ setShowAdd(false); setEditingDonor(null); setName(''); setEmail(''); setPhone(''); setAddress(''); }}>Cancel</button>
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
            {/* Search bar */}
            <div style={{ padding:'12px 16px', background: CREAM, borderBottom:`1px solid ${BORDER}`, display:'flex', gap:8, alignItems:'center' }}>
              <input type="text" placeholder={`🔍 Search ${orgConfig.donorLabel.toLowerCase()} by name, email, phone...`} value={donorSearch} onChange={e=>setDonorSearch(e.target.value)} style={{ flex:1, padding:'8px 12px', fontSize:'0.88rem', borderRadius:6 }} />
              {donorSearch && <button onClick={()=>setDonorSearch('')} style={{ padding:'6px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background:'#fff', color: RED, border:`1px solid ${BORDER}`, cursor:'pointer' }}>✕ Clear</button>}
              <span style={{ fontSize:'0.82rem', color: TXT_LIGHT }}>{donors.length} total</span>
            </div>

            {selectedDonorIds.length > 0 && (
              <div style={{ background: GOLD_PALE, padding:'10px 14px', borderBottom:`1px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#8B6914' }}>✓ {selectedDonorIds.length} selected</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>setSelectedDonorIds([])} style={{ padding:'5px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background:'#fff', color: NAVY, border:`1px solid ${BORDER}`, cursor:'pointer' }}>Clear</button>
                  <button onClick={handleBulkDeleteDonors} style={{ padding:'5px 12px', borderRadius:6, fontSize:'0.78rem', fontWeight:700, background: RED, color:'#fff', border:'none', cursor:'pointer' }}>🗑 Delete {selectedDonorIds.length} selected</button>
                </div>
              </div>
            )}
            {(() => {
              // Filter + sort donors
              const filtered = donors.filter(d => {
                if (!donorSearch) return true;
                const s = donorSearch.toLowerCase();
                return (d.name||'').toLowerCase().includes(s) ||
                       (d.email||'').toLowerCase().includes(s) ||
                       (d.phone||'').toLowerCase().includes(s);
              });
              const sortMul = donorSortDir === 'asc' ? 1 : -1;
              const sorted = [...filtered].sort((a,b) => {
                if (donorSortField === 'name') return (a.name||'').localeCompare(b.name||'') * sortMul;
                if (donorSortField === 'email') return (a.email||'').localeCompare(b.email||'') * sortMul;
                if (donorSortField === 'total') {
                  const at = donorTotals[a.id] || 0;
                  const bt = donorTotals[b.id] || 0;
                  return (at - bt) * sortMul;
                }
                if (donorSortField === 'gifts') {
                  const ag = transactions.filter(t => t.donor_id === a.id).length;
                  const bg = transactions.filter(t => t.donor_id === b.id).length;
                  return (ag - bg) * sortMul;
                }
                return 0;
              });
              const handleSort = (field) => {
                if (donorSortField === field) setDonorSortDir(donorSortDir === 'asc' ? 'desc' : 'asc');
                else { setDonorSortField(field); setDonorSortDir('asc'); }
              };
              const sortIcon = (field) => donorSortField !== field ? '⇅' : (donorSortDir === 'asc' ? '↑' : '↓');
              const headerStyle = (field) => ({ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: donorSortField===field?NAVY:TXT_LIGHT, textTransform:'uppercase', textAlign:'left', cursor:'pointer', userSelect:'none' });
              return (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
                  <thead><tr style={{ borderBottom:`1px solid ${BORDER}`, background: CREAM }}>
                    <th style={{ padding:'10px 8px 10px 14px', width:30 }}>
                      <input type="checkbox" checked={selectedDonorIds.length === sorted.length && sorted.length > 0} onChange={e => setSelectedDonorIds(e.target.checked ? sorted.map(d => d.id) : [])} />
                    </th>
                    <th style={headerStyle('name')} onClick={()=>handleSort('name')}>Name {sortIcon('name')}</th>
                    <th style={headerStyle('email')} onClick={()=>handleSort('email')}>Email {sortIcon('email')}</th>
                    <th style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'left' }}>Phone</th>
                    <th style={headerStyle('total')} onClick={()=>handleSort('total')}>Total Given {sortIcon('total')}</th>
                    <th style={headerStyle('gifts')} onClick={()=>handleSort('gifts')}># Gifts {sortIcon('gifts')}</th>
                    <th></th>
                  </tr></thead>
                  <tbody>
                    {sorted.length === 0 && <tr><td colSpan={7} style={{ padding:'2rem', textAlign:'center', color: TXT_LIGHT }}>No matches</td></tr>}
                    {sorted.map(d => {
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
                          <td style={{ padding:'12px', whiteSpace:'nowrap' }}>
                            <button onClick={() => { setEditingDonor(d); setName(d.name); setEmail(d.email||''); setPhone(d.phone||''); setAddress(d.address||''); setShowAdd(true); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: NAVY, marginRight:4 }} title="Edit">✏️</button>
                            <button onClick={() => handleDeleteDonor(d.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: TXT_LIGHT }} title="Delete">🗑</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

// ============ RECURRING TAB ============
function RecurringTab({ user, transactions, setTransactions, donors, vendors, funds, orgConfig }) {
  const userKey = user?.email ? user.email.toLowerCase().replace(/[^a-z0-9]/g,'_') : 'guest';
  const storageKey = `ksp_${userKey}_recurring`;

  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(templates)); } catch {} }, [templates, storageKey]);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [frequency, setFrequency] = useState('monthly');

  const resetForm = () => {
    setName(''); setType('expense'); setAmount(''); setCategory(''); setDescription('');
    setVendorId(''); setDayOfMonth(1); setFrequency('monthly'); setEditing(null);
  };

  const handleSave = () => {
    if (!name || !amount) { alert('Name and amount required'); return; }
    const tmpl = { id: editing?.id || 'rec_' + Date.now(), name, type, amount: parseFloat(amount), category, description, vendorId, dayOfMonth: parseInt(dayOfMonth), frequency };
    if (editing) setTemplates(p => p.map(t => t.id === editing.id ? tmpl : t));
    else setTemplates(p => [...p, tmpl]);
    setShowAdd(false); resetForm();
  };

  // Generate this month's transactions from templates
  const generateForMonth = async (template, monthDate) => {
    const yr = monthDate.getFullYear();
    const mo = monthDate.getMonth();
    const day = Math.min(template.dayOfMonth, new Date(yr, mo+1, 0).getDate());
    const date = `${yr}-${String(mo+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    // Check if already exists (by description match for this month)
    const existing = transactions.find(t => 
      t.date.startsWith(`${yr}-${String(mo+1).padStart(2,'0')}`) &&
      t.description === template.description &&
      parseFloat(t.amount) === template.amount
    );
    if (existing) return null;
    const newTx = {
      id: 'tx_rec_' + Date.now() + '_' + Math.random().toString(36).slice(2,8),
      user_id: user.id,
      type: template.type,
      date,
      amount: template.amount,
      category: template.category,
      description: template.description || template.name,
      donor_id: null,
      vendor_id: template.vendorId || null,
      fund_id: null,
      notes: 'Auto-created from recurring template',
    };
    return newTx;
  };

  const handleGenerateThisMonth = async () => {
    const now = new Date();
    const newTxs = [];
    for (const tmpl of templates) {
      const tx = await generateForMonth(tmpl, now);
      if (tx) newTxs.push(tx);
    }
    if (newTxs.length === 0) {
      alert('No new transactions to create. All recurring items for this month already exist!');
      return;
    }
    if (!confirm(`Generate ${newTxs.length} recurring transactions for ${MONTHS[now.getMonth()]} ${now.getFullYear()}?`)) return;
    setTransactions(p => [...p, ...newTxs]);
    try {
      const sb = await getSupabase();
      const { error } = await sb.from('ksp_transactions').insert(newTxs);
      if (error) alert('Save error: ' + error.message);
      else alert(`✓ Created ${newTxs.length} recurring transactions for ${MONTHS[now.getMonth()]}!`);
    } catch(e) { console.log('Save recurring:', e); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <h2 style={{ fontSize:'1.6rem' }}>🔄 Recurring Transactions</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {templates.length > 0 && <button className="btn btn-outline" onClick={handleGenerateThisMonth} style={{ background: GOLD_PALE, color:'#8B6914', borderColor: GOLD }}>⚡ Generate This Month's</button>}
          <button className="btn btn-navy" onClick={()=>{ resetForm(); setShowAdd(true); }}>+ Add Recurring</button>
        </div>
      </div>

      <div className="card card-p" style={{ marginBottom:'1.5rem', background: SAGE, borderLeft:`4px solid ${FOREST}` }}>
        <p style={{ color: FOREST, fontSize:'0.92rem' }}>
          💡 <strong>How it works:</strong> Create templates for monthly rent, utilities, salaries, subscriptions. Click <strong>"⚡ Generate This Month's"</strong> at the start of each month to auto-create all your recurring transactions.
        </p>
      </div>

      {showAdd && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <h3 style={{ marginBottom:'1rem' }}>{editing ? '✏️ Edit Recurring' : '+ New Recurring Template'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
            <input style={{ width:'100%' }} value={name} onChange={e=>setName(e.target.value)} placeholder="Template name (e.g., Monthly Rent, Pastor Salary)" />
            <select style={{ width:'100%' }} value={type} onChange={e=>setType(e.target.value)}>
              <option value="expense">🧾 Expense</option>
              <option value="income">💵 Income</option>
            </select>
            <input style={{ width:'100%' }} type="number" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount" />
            <select style={{ width:'100%' }} value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="">— Choose category —</option>
              {(type === 'income' ? orgConfig.incomeCategories : orgConfig.expenseCategories).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {type === 'expense' && (
              <select style={{ width:'100%' }} value={vendorId} onChange={e=>setVendorId(e.target.value)}>
                <option value="">— Vendor (optional) —</option>
                {[...vendors].sort((a,b)=>a.name.localeCompare(b.name)).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            )}
            <select style={{ width:'100%' }} value={dayOfMonth} onChange={e=>setDayOfMonth(e.target.value)}>
              {[...Array(31)].map((_,i) => <option key={i+1} value={i+1}>Day {i+1} of month</option>)}
            </select>
          </div>
          <input style={{ width:'100%', marginBottom:'1rem' }} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (e.g., May Rent — Building Lease)" />
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={handleSave}>✓ {editing ? 'Save Changes' : 'Save Template'}</button>
            <button className="btn btn-outline" onClick={()=>{ setShowAdd(false); resetForm(); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow:'hidden' }}>
        {templates.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color: TXT_LIGHT }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🔄</div>
            <p>No recurring transactions yet.</p>
            <p style={{ fontSize:'0.85rem', marginTop:8 }}>Add templates for things you pay/receive every month — rent, salaries, utilities, regular tithes.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
            <thead><tr style={{ borderBottom:`1px solid ${BORDER}`, background: CREAM }}>
              {['Name','Type','Day','Category','Amount',''].map(h => <th key={h} style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'left' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.id} style={{ borderBottom:`1px solid #F4F6FA` }}>
                  <td style={{ padding:'12px', color: NAVY, fontWeight:600 }}>{t.name}</td>
                  <td style={{ padding:'12px' }}>
                    <span style={{ background: t.type==='income'?SAGE:RED_PALE, color: t.type==='income'?FOREST:RED, padding:'2px 8px', borderRadius:6, fontSize:'0.72rem', fontWeight:700 }}>{t.type==='income'?'IN':'OUT'}</span>
                  </td>
                  <td style={{ padding:'12px', color: TXT_LIGHT }}>Day {t.dayOfMonth}</td>
                  <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.85rem' }}>{t.category}</td>
                  <td style={{ padding:'12px', fontWeight:700, color: t.type==='income'?FOREST:RED }}>{t.type==='income'?'+':'-'}{fmt(t.amount)}</td>
                  <td style={{ padding:'12px', whiteSpace:'nowrap' }}>
                    <button onClick={()=>{ setEditing(t); setName(t.name); setType(t.type); setAmount(t.amount); setCategory(t.category); setDescription(t.description); setVendorId(t.vendorId); setDayOfMonth(t.dayOfMonth); setShowAdd(true); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: NAVY, marginRight:4 }}>✏️</button>
                    <button onClick={()=>{ if(confirm('Delete this recurring template?')) setTemplates(p => p.filter(x => x.id !== t.id)); }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: TXT_LIGHT }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============ VENDORS TAB ============
function VendorsTab({ user, vendors, setVendors, transactions, setTransactions, orgConfig }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [show1099Only, setShow1099Only] = useState(false);
  const [year1099, setYear1099] = useState(new Date().getFullYear() - 1);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('');
  const [is1099, setIs1099] = useState(false);
  const [notes, setNotes] = useState('');

  // Vendor totals from transactions
  const vendorTotals = {};
  const vendor1099Totals = {};
  transactions.forEach(t => {
    if (t.vendor_id && t.type === 'expense') {
      vendorTotals[t.vendor_id] = (vendorTotals[t.vendor_id] || 0) + parseFloat(t.amount||0);
      const txYear = new Date(t.date).getFullYear();
      if (txYear === year1099) {
        vendor1099Totals[t.vendor_id] = (vendor1099Totals[t.vendor_id] || 0) + parseFloat(t.amount||0);
      }
    }
  });

  const resetForm = () => {
    setName(''); setEmail(''); setPhone(''); setAddress(''); setTaxId('');
    setDefaultCategory(''); setIs1099(false); setNotes(''); setEditing(null);
  };

  const handleSave = async () => {
    if (!name) return;
    if (editing) {
      const updated = { name, email, phone, address, tax_id: taxId, default_category: defaultCategory, is_1099: is1099, notes };
      setVendors(p => p.map(v => v.id === editing.id ? { ...v, ...updated } : v));
      try { const sb = await getSupabase(); await sb.from('ksp_vendors').update(updated).eq('id', editing.id); } catch(e) { console.log('Update vendor:', e); }
    } else {
      const newVendor = { id: 'vendor_' + Date.now(), user_id: user.id, name, email, phone, address, tax_id: taxId, default_category: defaultCategory, is_1099: is1099, notes };
      setVendors(p => [...p, newVendor]);
      try { const sb = await getSupabase(); const { error } = await sb.from('ksp_vendors').insert(newVendor); if (error) alert('Save error: ' + error.message); } catch(e) {}
    }
    setShowAdd(false); resetForm();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vendor? Their transactions will remain but be unlinked.')) return;
    setVendors(p => p.filter(v => v.id !== id));
    try { const sb = await getSupabase(); await sb.from('ksp_vendors').delete().eq('id', id); } catch(e) {}
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} vendors? Their transactions will remain but be unlinked.`)) return;
    const toDelete = [...selectedIds];
    setVendors(p => p.filter(v => !toDelete.includes(v.id)));
    setSelectedIds([]);
    try {
      const sb = await getSupabase();
      for (let i = 0; i < toDelete.length; i += 100) {
        await sb.from('ksp_vendors').delete().in('id', toDelete.slice(i, i+100));
      }
    } catch(e) {}
  };

  const exportCSV = () => {
    if (vendors.length === 0) { alert('No vendors to export.'); return; }
    const rows = [['Name','Email','Phone','Address','Tax ID','1099 Required','Default Category','Total Paid','# Transactions','Notes']];
    [...vendors].sort((a,b)=>a.name.localeCompare(b.name)).forEach(v => {
      const total = vendorTotals[v.id] || 0;
      const count = transactions.filter(t => t.vendor_id === v.id).length;
      const esc = (s) => `"${String(s||'').replace(/"/g,'""')}"`;
      rows.push([esc(v.name), esc(v.email), esc(v.phone), esc(v.address), esc(v.tax_id), v.is_1099?'Yes':'No', esc(v.default_category), total.toFixed(2), count, esc(v.notes)].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `vendors_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const export1099Report = () => {
    const needs1099 = vendors.filter(v => v.is_1099 && (vendor1099Totals[v.id] || 0) >= 600);
    if (needs1099.length === 0) { alert(`No vendors meet the $600 threshold for ${year1099} 1099 reporting.`); return; }
    const rows = [
      [`1099-NEC REPORT — TAX YEAR ${year1099}`],
      ['Vendors paid $600+ requiring 1099-NEC forms'],
      [],
      ['Vendor Name','Tax ID (EIN/SSN)','Address','Email','Phone','Total Paid','# Payments']
    ];
    needs1099.sort((a,b) => (vendor1099Totals[b.id]||0) - (vendor1099Totals[a.id]||0)).forEach(v => {
      const total = vendor1099Totals[v.id] || 0;
      const count = transactions.filter(t => t.vendor_id === v.id && new Date(t.date).getFullYear() === year1099).length;
      const esc = (s) => `"${String(s||'').replace(/"/g,'""')}"`;
      rows.push([esc(v.name), esc(v.tax_id||'MISSING'), esc(v.address), esc(v.email), esc(v.phone), total.toFixed(2), count].join(','));
    });
    rows.push([]);
    rows.push(['TOTAL VENDORS REQUIRING 1099', needs1099.length]);
    rows.push(['TOTAL AMOUNT REPORTED', needs1099.reduce((s,v) => s + (vendor1099Totals[v.id]||0), 0).toFixed(2)]);
    const blob = new Blob([rows.map(r=>Array.isArray(r)?r.join(','):r).join('\n')], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `1099_report_${year1099}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1099 stats
  const vendorsNeed1099 = vendors.filter(v => v.is_1099 && (vendor1099Totals[v.id] || 0) >= 600);
  const vendorsMissingTaxId = vendorsNeed1099.filter(v => !v.tax_id);

  // Filter & sort
  let filtered = vendors;
  if (show1099Only) filtered = filtered.filter(v => v.is_1099);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(v =>
      (v.name||'').toLowerCase().includes(s) ||
      (v.email||'').toLowerCase().includes(s) ||
      (v.phone||'').toLowerCase().includes(s) ||
      (v.tax_id||'').toLowerCase().includes(s)
    );
  }
  const sortMul = sortDir === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a,b) => {
    if (sortField === 'name') return (a.name||'').localeCompare(b.name||'') * sortMul;
    if (sortField === 'total') return ((vendorTotals[a.id]||0) - (vendorTotals[b.id]||0)) * sortMul;
    if (sortField === 'count') {
      const ac = transactions.filter(t => t.vendor_id === a.id).length;
      const bc = transactions.filter(t => t.vendor_id === b.id).length;
      return (ac - bc) * sortMul;
    }
    return 0;
  });
  const handleSort = (f) => { if (sortField === f) setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortField(f); setSortDir('asc'); } };
  const sortIcon = (f) => sortField !== f ? '⇅' : (sortDir === 'asc' ? '↑' : '↓');
  const hStyle = (f) => ({ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: sortField===f?NAVY:TXT_LIGHT, textTransform:'uppercase', textAlign:'left', cursor:'pointer', userSelect:'none' });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <h2 style={{ fontSize:'1.6rem' }}>🏪 Vendors</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn btn-outline" onClick={exportCSV}>📤 Export CSV</button>
          <button className="btn btn-navy" onClick={()=>{ resetForm(); setShowAdd(true); }}>+ Add Vendor</button>
        </div>
      </div>

      {/* 1099 Status Card */}
      {vendors.some(v => v.is_1099) && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${vendorsMissingTaxId.length > 0 ? RED : FOREST}`, background: vendorsMissingTaxId.length > 0 ? '#FFF3F3' : SAGE }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
            <div>
              <h3 style={{ fontSize:'1rem', color: vendorsMissingTaxId.length > 0 ? RED : FOREST }}>📋 1099-NEC Report — Tax Year {year1099}</h3>
              <p style={{ fontSize:'0.85rem', color: TXT_LIGHT, marginTop:4 }}>
                <strong>{vendorsNeed1099.length}</strong> vendors paid $600+ requiring 1099s
                {vendorsMissingTaxId.length > 0 && <span style={{ color: RED, fontWeight:700 }}> · ⚠️ {vendorsMissingTaxId.length} missing Tax ID</span>}
              </p>
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              <select value={year1099} onChange={e=>setYear1099(parseInt(e.target.value))} style={{ padding:'6px 10px', fontSize:'0.85rem' }}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button className="btn btn-outline" onClick={export1099Report}>📤 Generate 1099 Report</button>
            </div>
          </div>
          {vendorsMissingTaxId.length > 0 && (
            <p style={{ fontSize:'0.78rem', color: RED, marginTop:8, fontStyle:'italic' }}>
              💡 Missing Tax IDs for: {vendorsMissingTaxId.map(v=>v.name).slice(0,3).join(', ')}{vendorsMissingTaxId.length>3?` +${vendorsMissingTaxId.length-3} more`:''}. Edit each vendor to add their EIN or SSN.
            </p>
          )}
        </div>
      )}

      {showAdd && (
        <div className="card card-p" style={{ marginBottom:'1.5rem', borderLeft:`4px solid ${GOLD}` }}>
          <h3 style={{ marginBottom:'1rem' }}>{editing ? '✏️ Edit Vendor' : '+ New Vendor'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
            <input style={{ width:'100%' }} value={name} onChange={e=>setName(e.target.value)} placeholder="Vendor name (e.g., Wix, John's Cleaning)" />
            <input style={{ width:'100%' }} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
            <input style={{ width:'100%' }} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" />
            <input style={{ width:'100%' }} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Address (for 1099 mailing)" />
            <input style={{ width:'100%' }} value={taxId} onChange={e=>setTaxId(e.target.value)} placeholder="Tax ID / EIN / SSN (for 1099)" />
            <select style={{ width:'100%' }} value={defaultCategory} onChange={e=>setDefaultCategory(e.target.value)}>
              <option value="">— Default Category (optional) —</option>
              {orgConfig.expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:'1rem', padding:10, background: GOLD_PALE, borderRadius:6 }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <input type="checkbox" checked={is1099} onChange={e=>setIs1099(e.target.checked)} style={{ width:18, height:18 }} />
              <strong style={{ color:'#8B6914' }}>📋 Requires 1099-NEC</strong>
              <span style={{ fontSize:'0.78rem', color: TXT_LIGHT }}>(check this for contractors, freelancers — anyone paid $600+ who's not incorporated)</span>
            </label>
          </div>
          <textarea style={{ width:'100%', marginBottom:'1rem' }} rows="2" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (services provided, contract dates, etc.)" />
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-navy" onClick={handleSave}>✓ {editing ? 'Save Changes' : 'Save Vendor'}</button>
            <button className="btn btn-outline" onClick={()=>{ setShowAdd(false); resetForm(); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ overflow:'hidden' }}>
        {vendors.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color: TXT_LIGHT }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🏪</div>
            <p>No vendors yet.</p>
            <p style={{ fontSize:'0.85rem', marginTop:8 }}>Track who you pay — utility companies, contractors, suppliers. Required for 1099 reporting at year-end.</p>
          </div>
        ) : (
          <>
            <div style={{ padding:'12px 16px', background: CREAM, borderBottom:`1px solid ${BORDER}`, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <input type="text" placeholder="🔍 Search vendor name, email, phone, tax ID..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:200, padding:'8px 12px', fontSize:'0.88rem', borderRadius:6 }} />
              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.85rem', cursor:'pointer' }}>
                <input type="checkbox" checked={show1099Only} onChange={e=>setShow1099Only(e.target.checked)} />
                📋 1099 only
              </label>
              <span style={{ fontSize:'0.82rem', color: TXT_LIGHT }}>{vendors.length} total</span>
            </div>

            {selectedIds.length > 0 && (
              <div style={{ background: GOLD_PALE, padding:'10px 14px', borderBottom:`1px solid ${GOLD}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#8B6914' }}>✓ {selectedIds.length} selected</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>setSelectedIds([])} style={{ padding:'5px 10px', borderRadius:6, fontSize:'0.78rem', fontWeight:600, background:'#fff', color: NAVY, border:`1px solid ${BORDER}`, cursor:'pointer' }}>Clear</button>
                  <button onClick={handleBulkDelete} style={{ padding:'5px 12px', borderRadius:6, fontSize:'0.78rem', fontWeight:700, background: RED, color:'#fff', border:'none', cursor:'pointer' }}>🗑 Delete {selectedIds.length}</button>
                </div>
              </div>
            )}

            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
              <thead><tr style={{ borderBottom:`1px solid ${BORDER}`, background: CREAM }}>
                <th style={{ padding:'10px 8px 10px 14px', width:30 }}>
                  <input type="checkbox" checked={selectedIds.length === sorted.length && sorted.length > 0} onChange={e => setSelectedIds(e.target.checked ? sorted.map(v => v.id) : [])} />
                </th>
                <th style={hStyle('name')} onClick={()=>handleSort('name')}>Name {sortIcon('name')}</th>
                <th style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'left' }}>Contact</th>
                <th style={{ padding:'12px', fontSize:'0.72rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', textAlign:'center' }}>1099?</th>
                <th style={hStyle('total')} onClick={()=>handleSort('total')}>Total Paid {sortIcon('total')}</th>
                <th style={hStyle('count')} onClick={()=>handleSort('count')}># Txs {sortIcon('count')}</th>
                <th></th>
              </tr></thead>
              <tbody>
                {sorted.length === 0 && <tr><td colSpan={7} style={{ padding:'2rem', textAlign:'center', color: TXT_LIGHT }}>No matches</td></tr>}
                {sorted.map(v => {
                  const total = vendorTotals[v.id] || 0;
                  const count = transactions.filter(t => t.vendor_id === v.id).length;
                  const isChecked = selectedIds.includes(v.id);
                  const total1099 = vendor1099Totals[v.id] || 0;
                  return (
                    <tr key={v.id} style={{ borderBottom:`1px solid #F4F6FA`, background: isChecked ? '#FDF7E8' : 'transparent' }}>
                      <td style={{ padding:'10px 8px 10px 14px' }}>
                        <input type="checkbox" checked={isChecked} onChange={e => {
                          if (e.target.checked) setSelectedIds(prev => [...prev, v.id]);
                          else setSelectedIds(prev => prev.filter(id => id !== v.id));
                        }} />
                      </td>
                      <td style={{ padding:'12px', color: NAVY, fontWeight:600 }}>
                        {v.name}
                        {v.default_category && <div style={{ fontSize:'0.72rem', color: TXT_LIGHT, fontWeight:400 }}>→ {v.default_category}</div>}
                      </td>
                      <td style={{ padding:'12px', color: TXT_LIGHT, fontSize:'0.82rem' }}>
                        {v.email && <div>{v.email}</div>}
                        {v.phone && <div>{v.phone}</div>}
                      </td>
                      <td style={{ padding:'12px', textAlign:'center' }}>
                        {v.is_1099 ? (
                          <span style={{ background: total1099 >= 600 ? GOLD_PALE : SAGE, color: total1099 >= 600 ? '#8B6914' : FOREST, padding:'3px 8px', borderRadius:6, fontSize:'0.72rem', fontWeight:700 }}>
                            {total1099 >= 600 ? `📋 ${year1099}` : '✓'}
                            {!v.tax_id && total1099 >= 600 && <span style={{ color: RED, marginLeft:4 }}>⚠ No EIN</span>}
                          </span>
                        ) : <span style={{ color: TXT_LIGHT, fontSize:'0.78rem' }}>—</span>}
                      </td>
                      <td style={{ padding:'12px', fontWeight:700, color: RED }}>{fmt(total)}</td>
                      <td style={{ padding:'12px', color: TXT_LIGHT }}>{count}</td>
                      <td style={{ padding:'12px', whiteSpace:'nowrap' }}>
                        <button onClick={()=>{
                          setEditing(v); setName(v.name); setEmail(v.email||''); setPhone(v.phone||'');
                          setAddress(v.address||''); setTaxId(v.tax_id||''); setDefaultCategory(v.default_category||'');
                          setIs1099(v.is_1099||false); setNotes(v.notes||''); setShowAdd(true);
                        }} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: NAVY, marginRight:4 }}>✏️</button>
                        <button onClick={()=>handleDelete(v.id)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color: TXT_LIGHT }}>🗑</button>
                      </td>
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
function ReportsTab({ transactions, donors, vendors, funds, orgConfig, orgName }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [customMode, setCustomMode] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0,10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0,10));
  const [showByDonor, setShowByDonor] = useState(false);
  const [showByMonth, setShowByMonth] = useState(false);
  const [filterFundId, setFilterFundId] = useState('all'); // 'all' or specific fund_id

  // Apply date filter
  const filteredTxs = transactions.filter(t => {
    // Date filter
    if (customMode) {
      if (!(t.date >= startDate && t.date <= endDate)) return false;
    } else {
      if (new Date(t.date).getFullYear() !== year) return false;
    }
    // Fund filter
    if (filterFundId !== 'all' && t.fund_id !== filterFundId) return false;
    return true;
  });

  const yearTxs = filteredTxs;
  const incomeByCategory = {};
  const expensesByCategory = {};
  const excludedByCategory = {};
  const incomeByDonor = {};
  const incomeByMonth = {};  // {YYYY-MM: amount}

  yearTxs.forEach(t => {
    const amt = parseFloat(t.amount||0);
    if (EXCLUDED_FROM_PL.includes(t.category)) {
      excludedByCategory[t.category] = (excludedByCategory[t.category] || 0) + amt;
    } else if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + amt;
      if (t.donor_id) {
        incomeByDonor[t.donor_id] = (incomeByDonor[t.donor_id] || 0) + amt;
      }
      const monthKey = t.date.slice(0,7);
      incomeByMonth[monthKey] = (incomeByMonth[monthKey] || 0) + amt;
    } else {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + amt;
    }
  });

  const totalIncome = Object.values(incomeByCategory).reduce((s,v)=>s+v, 0);
  const totalExpenses = Object.values(expensesByCategory).reduce((s,v)=>s+v, 0);
  const totalExcluded = Object.values(excludedByCategory).reduce((s,v)=>s+v, 0);
  const net = totalIncome - totalExpenses;
  const periodLabel = customMode ? `${startDate} to ${endDate}` : `Year ${year}`;

  // Export full report as CSV
  const exportReport = () => {
    const rows = [
      [`${orgConfig.termsFor.income.toUpperCase()} & ${orgConfig.termsFor.expense.toUpperCase()} REPORT — ${periodLabel}`],
      [],
      [orgConfig.termsFor.income.toUpperCase()],
      ['Category', 'Amount'],
    ];
    Object.entries(incomeByCategory).sort((a,b)=>b[1]-a[1]).forEach(([cat,amt]) => rows.push([cat, amt.toFixed(2)]));
    rows.push([`Total ${orgConfig.termsFor.income}`, totalIncome.toFixed(2)]);
    rows.push([]);
    rows.push([orgConfig.termsFor.expense.toUpperCase()]);
    rows.push(['Category', 'Amount']);
    Object.entries(expensesByCategory).sort((a,b)=>b[1]-a[1]).forEach(([cat,amt]) => rows.push([cat, amt.toFixed(2)]));
    rows.push([`Total ${orgConfig.termsFor.expense}`, totalExpenses.toFixed(2)]);
    rows.push([]);
    rows.push([orgConfig.termsFor.net.toUpperCase(), net.toFixed(2)]);
    rows.push([]);
    if (Object.keys(excludedByCategory).length > 0) {
      rows.push(['EXCLUDED FROM P&L (Bookkeeping Only)']);
      rows.push(['Category', 'Amount']);
      Object.entries(excludedByCategory).forEach(([cat,amt]) => rows.push([cat, amt.toFixed(2)]));
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${customMode ? startDate+'_to_'+endDate : year}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <h2 style={{ fontSize:'1.6rem' }}>📄 Reports</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <button className="btn btn-outline" onClick={exportReport}>📤 Export CSV</button>
          <button className="btn btn-outline" onClick={() => {
            // Generate a clean PDF-ready HTML document and open print dialog
            const period = customMode ? `${startDate} to ${endDate}` : `For year ending December 31, ${year}`;
            const incomeRows = Object.entries(incomeByCategory).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) =>
              `<tr><td style="padding:6px 0;color:#1e3a5f">${cat}</td><td style="padding:6px 0;text-align:right;font-weight:600">${fmt(amt)}</td></tr>`
            ).join('');
            const expenseRows = Object.entries(expensesByCategory).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) =>
              `<tr><td style="padding:6px 0;color:#1e3a5f">${cat}</td><td style="padding:6px 0;text-align:right;font-weight:600">${fmt(amt)}</td></tr>`
            ).join('');
            const excludedRows = Object.entries(excludedByCategory).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) =>
              `<tr><td style="padding:6px 0;color:#6a7280">${cat}</td><td style="padding:6px 0;text-align:right;color:#6a7280;text-decoration:line-through">${fmt(amt)}</td></tr>`
            ).join('');
            const html = `
<!DOCTYPE html><html><head><title>P&L Report — ${period}</title>
<style>
  body { font-family: Georgia, serif; padding: 40px; color: #1e3a5f; max-width: 800px; margin: 0 auto; }
  .header { background: #1e3a5f; color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center; }
  .header h1 { margin: 0; color: #fff; font-size: 22px; }
  .header p { margin: 6px 0 0 0; color: #A8B5C8; font-size: 13px; }
  h2 { color: #2d5a3f; font-size: 16px; margin-top: 24px; padding-bottom: 6px; border-bottom: 2px solid #e3ebd7; }
  h2.exp { color: #b53232; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 0; font-size: 14px; }
  .total { border-top: 2px solid #1e3a5f; padding-top: 8px !important; font-weight: 700 !important; font-size: 15px !important; }
  .net { background: #e3ebd7; padding: 14px 18px; border-radius: 8px; display: flex; justify-content: space-between; margin: 20px 0; font-weight: 700; font-size: 18px; }
  .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #ddd; color: #6a7280; font-size: 11px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <h1>${orgName || 'Profit & Loss Statement'}</h1>
  <p>${period}</p>
</div>
<h2>${orgConfig.termsFor.income.toUpperCase()}</h2>
<table>${incomeRows}<tr><td colspan="2" class="total" style="padding-top:10px"><div style="display:flex;justify-content:space-between"><span>Total ${orgConfig.termsFor.income}</span><span style="color:#2d5a3f">${fmt(totalIncome)}</span></div></td></tr></table>
<h2 class="exp">${orgConfig.termsFor.expense.toUpperCase()}</h2>
<table>${expenseRows}<tr><td colspan="2" class="total" style="padding-top:10px"><div style="display:flex;justify-content:space-between"><span>Total ${orgConfig.termsFor.expense}</span><span style="color:#b53232">${fmt(totalExpenses)}</span></div></td></tr></table>
<div class="net"><span>${orgConfig.termsFor.net}</span><span style="color:${net >= 0 ? '#2d5a3f' : '#b53232'}">${fmt(net)}</span></div>
${Object.keys(excludedByCategory).length > 0 ? `
<h2 style="color:#6a7280">📋 NOT INCLUDED IN P&L (Bookkeeping Only)</h2>
<p style="font-size:12px;color:#6a7280;font-style:italic">These are bank deposits or transfers already counted via individual entries.</p>
<table>${excludedRows}</table>
` : ''}
<div class="footer">Generated by Kingdom Stewardship Pro · ${new Date().toLocaleDateString()}</div>
<script>window.onload = () => { window.print(); }</script>
</body></html>`;
            const blob = new Blob([html], { type:'text/html' });
            const url = URL.createObjectURL(blob);
            const w = window.open(url, '_blank');
            if (!w) {
              alert('Please allow popups to download PDF. Or use the 🖨️ Print button instead.');
              return;
            }
            // Cleanup after print
            setTimeout(() => URL.revokeObjectURL(url), 60000);
          }}>📄 Download PDF</button>
          <button className="btn btn-outline" onClick={()=>window.print()}>🖨️ Print</button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="card card-p" style={{ marginBottom:'1rem', display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <span style={{ fontSize:'0.78rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase' }}>Period:</span>
        <button onClick={()=>setCustomMode(false)} style={{ padding:'6px 14px', borderRadius:6, fontSize:'0.85rem', fontWeight:600, background: !customMode ? NAVY : '#fff', color: !customMode ? '#fff' : NAVY, border:`1px solid ${NAVY}`, cursor:'pointer' }}>Annual</button>
        <button onClick={()=>setCustomMode(true)} style={{ padding:'6px 14px', borderRadius:6, fontSize:'0.85rem', fontWeight:600, background: customMode ? NAVY : '#fff', color: customMode ? '#fff' : NAVY, border:`1px solid ${NAVY}`, cursor:'pointer' }}>Custom Range</button>
        {!customMode ? (
          <select value={year} onChange={e=>setYear(parseInt(e.target.value))} style={{ padding:'6px 10px' }}>
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        ) : (
          <>
            <label style={{ fontSize:'0.85rem' }}>From: <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{ padding:'4px 6px' }} /></label>
            <label style={{ fontSize:'0.85rem' }}>To: <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={{ padding:'4px 6px' }} /></label>
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={()=>{ const d=new Date(); setStartDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0,10)); setEndDate(new Date(d.getFullYear(), d.getMonth()+1, 0).toISOString().slice(0,10)); }} style={{ padding:'4px 8px', fontSize:'0.78rem', borderRadius:4, background: GOLD_PALE, color:'#8B6914', border:'none', cursor:'pointer' }}>This Month</button>
              <button onClick={()=>{ const d=new Date(); const q=Math.floor(d.getMonth()/3); setStartDate(new Date(d.getFullYear(), q*3, 1).toISOString().slice(0,10)); setEndDate(new Date(d.getFullYear(), q*3+3, 0).toISOString().slice(0,10)); }} style={{ padding:'4px 8px', fontSize:'0.78rem', borderRadius:4, background: GOLD_PALE, color:'#8B6914', border:'none', cursor:'pointer' }}>This Quarter</button>
              <button onClick={()=>{ const d=new Date(); setStartDate(new Date(d.getFullYear(), 0, 1).toISOString().slice(0,10)); setEndDate(new Date(d.getFullYear(), 11, 31).toISOString().slice(0,10)); }} style={{ padding:'4px 8px', fontSize:'0.78rem', borderRadius:4, background: GOLD_PALE, color:'#8B6914', border:'none', cursor:'pointer' }}>This Year</button>
            </div>
          </>
        )}
        <span style={{ fontSize:'0.78rem', fontWeight:700, color: TXT_LIGHT, textTransform:'uppercase', marginLeft:8 }}>Fund:</span>
        <select value={filterFundId} onChange={e=>setFilterFundId(e.target.value)} style={{ padding:'6px 10px', fontSize:'0.85rem', borderRadius:6, border:`1px solid ${NAVY}` }}>
          <option value="all">All Funds</option>
          {(funds || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {/* Section Toggles */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap' }}>
        <button onClick={()=>setShowByMonth(!showByMonth)} className="btn btn-outline" style={{ background: showByMonth ? NAVY : '#fff', color: showByMonth ? '#fff' : NAVY }}>📅 {showByMonth ? '✓ ' : ''}Monthly Breakdown</button>
        <button onClick={()=>setShowByDonor(!showByDonor)} className="btn btn-outline" style={{ background: showByDonor ? NAVY : '#fff', color: showByDonor ? '#fff' : NAVY }}>👥 {showByDonor ? '✓ ' : ''}By {orgConfig.donorLabel}</button>
      </div>

      {/* P&L Statement */}
      <div className="card print-area" style={{ marginBottom:'1.5rem' }}>
        <div style={{ background: NAVY, color:'#fff', padding:'1rem 1.5rem', borderRadius:'12px 12px 0 0' }}>
          <h3 style={{ color:'#fff', fontSize:'1.2rem' }}>Profit & Loss Statement{filterFundId !== 'all' ? ` — ${(funds || []).find(f=>f.id===filterFundId)?.name || ''}` : ''}</h3>
          <p style={{ fontSize:'0.85rem', color:'#A8B5C8', marginTop:4 }}>{customMode ? `${startDate} to ${endDate}` : `For year ending December 31, ${year}`}</p>
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

          {/* Excluded items (transfers, batch deposits) — shown but NOT counted */}
          {Object.keys(excludedByCategory).length > 0 && (
            <div style={{ marginTop:'1.5rem' }}>
              <h4 style={{ fontSize:'0.95rem', color: TXT_LIGHT, marginBottom:'0.5rem', borderBottom:`1px dashed ${BORDER}`, paddingBottom:6 }}>
                📋 NOT INCLUDED IN P&L (Bookkeeping Only)
              </h4>
              <p style={{ fontSize:'0.78rem', color: TXT_LIGHT, marginBottom:8, fontStyle:'italic' }}>
                These transactions are bank deposits or transfers already counted via individual entries. Showing them here for audit purposes only.
              </p>
              {Object.entries(excludedByCategory).sort((a,b)=>b[1]-a[1]).map(([cat, amt]) => (
                <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'0.85rem', color: TXT_LIGHT }}>
                  <span>{cat}</span>
                  <span style={{ textDecoration:'line-through' }}>{fmt(amt)}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:`1px dashed ${BORDER}`, marginTop:6, fontSize:'0.85rem', color: TXT_LIGHT }}>
                <span style={{ fontWeight:700 }}>Total Excluded</span>
                <span style={{ fontWeight:700, textDecoration:'line-through' }}>{fmt(totalExcluded)}</span>
              </div>
            </div>
          )}

          <button className="btn btn-outline no-print" style={{ marginTop:'1rem', width:'100%' }} onClick={()=>window.print()}>🖨️ Print / Export PDF</button>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {showByMonth && (
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ background: NAVY, color:'#fff', padding:'1rem 1.5rem', borderRadius:'12px 12px 0 0' }}>
            <h3 style={{ color:'#fff', fontSize:'1.2rem' }}>📅 Monthly {orgConfig.termsFor.income}</h3>
            <p style={{ fontSize:'0.85rem', color:'#A8B5C8', marginTop:4 }}>{periodLabel}</p>
          </div>
          <div style={{ padding:'1.5rem' }}>
            {Object.keys(incomeByMonth).length === 0 ? (
              <p style={{ color: TXT_LIGHT, textAlign:'center', padding:'1rem' }}>No income data for this period</p>
            ) : (
              <table style={{ width:'100%', fontSize:'0.9rem' }}>
                <thead><tr style={{ borderBottom:`2px solid ${SAGE}` }}>
                  <th style={{ padding:'8px', textAlign:'left', color: TXT_LIGHT, fontSize:'0.78rem', textTransform:'uppercase' }}>Month</th>
                  <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.78rem', textTransform:'uppercase' }}># Gifts</th>
                  <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.78rem', textTransform:'uppercase' }}>Total</th>
                  <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.78rem', textTransform:'uppercase' }}>Average</th>
                </tr></thead>
                <tbody>
                  {Object.entries(incomeByMonth).sort().map(([m, amt]) => {
                    const [y, mo] = m.split('-');
                    const monthTxs = yearTxs.filter(t => t.type === 'income' && !EXCLUDED_FROM_PL.includes(t.category) && t.date.slice(0,7) === m);
                    const count = monthTxs.length;
                    const avg = count > 0 ? amt / count : 0;
                    return (
                      <tr key={m} style={{ borderBottom:`1px solid #F4F6FA` }}>
                        <td style={{ padding:'8px', color: NAVY, fontWeight:600 }}>{MONTHS[parseInt(mo)-1]} {y}</td>
                        <td style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT }}>{count}</td>
                        <td style={{ padding:'8px', textAlign:'right', fontWeight:700, color: FOREST }}>{fmt(amt)}</td>
                        <td style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT }}>{fmt(avg)}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop:`2px solid ${NAVY}`, background: GOLD_PALE }}>
                    <td style={{ padding:'10px 8px', fontWeight:700 }}>TOTAL</td>
                    <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:700 }}>{yearTxs.filter(t => t.type==='income' && !EXCLUDED_FROM_PL.includes(t.category)).length}</td>
                    <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:700, color: FOREST, fontSize:'1.05rem' }}>{fmt(totalIncome)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Donor Breakdown */}
      {showByDonor && (
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ background: NAVY, color:'#fff', padding:'1rem 1.5rem', borderRadius:'12px 12px 0 0' }}>
            <h3 style={{ color:'#fff', fontSize:'1.2rem' }}>👥 Giving By {orgConfig.donorLabel}</h3>
            <p style={{ fontSize:'0.85rem', color:'#A8B5C8', marginTop:4 }}>{periodLabel}</p>
          </div>
          <div style={{ padding:'1.5rem' }}>
            {Object.keys(incomeByDonor).length === 0 ? (
              <p style={{ color: TXT_LIGHT, textAlign:'center', padding:'1rem' }}>No donor-tagged income for this period</p>
            ) : (
              <table style={{ width:'100%', fontSize:'0.9rem' }}>
                <thead><tr style={{ borderBottom:`2px solid ${SAGE}` }}>
                  <th style={{ padding:'8px', textAlign:'left', color: TXT_LIGHT, fontSize:'0.78rem', textTransform:'uppercase' }}>Name</th>
                  <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.78rem', textTransform:'uppercase' }}># Gifts</th>
                  <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.78rem', textTransform:'uppercase' }}>Total</th>
                  <th style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT, fontSize:'0.78rem', textTransform:'uppercase' }}>Average</th>
                </tr></thead>
                <tbody>
                  {Object.entries(incomeByDonor).sort((a,b) => b[1] - a[1]).map(([donorId, amt]) => {
                    const donor = donors.find(d => d.id === donorId);
                    if (!donor) return null;
                    const donorTxs = yearTxs.filter(t => t.type === 'income' && !EXCLUDED_FROM_PL.includes(t.category) && t.donor_id === donorId);
                    const count = donorTxs.length;
                    const avg = count > 0 ? amt / count : 0;
                    return (
                      <tr key={donorId} style={{ borderBottom:`1px solid #F4F6FA` }}>
                        <td style={{ padding:'8px', color: NAVY, fontWeight:600 }}>{donor.name}</td>
                        <td style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT }}>{count}</td>
                        <td style={{ padding:'8px', textAlign:'right', fontWeight:700, color: FOREST }}>{fmt(amt)}</td>
                        <td style={{ padding:'8px', textAlign:'right', color: TXT_LIGHT }}>{fmt(avg)}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop:`2px solid ${NAVY}`, background: GOLD_PALE }}>
                    <td style={{ padding:'10px 8px', fontWeight:700 }}>TOTAL ({Object.keys(incomeByDonor).length} donors)</td>
                    <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:700 }}>{Object.values(incomeByDonor).length > 0 ? yearTxs.filter(t => t.type==='income' && !EXCLUDED_FROM_PL.includes(t.category) && t.donor_id).length : 0}</td>
                    <td style={{ padding:'10px 8px', textAlign:'right', fontWeight:700, color: FOREST, fontSize:'1.05rem' }}>{fmt(Object.values(incomeByDonor).reduce((s,v)=>s+v,0))}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
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
        <div className="card card-p print-area" style={{ marginBottom:'1rem' }}>
          <button onClick={()=>setSelectedDonor(null)} className="btn btn-outline no-print" style={{ marginBottom:'1rem' }}>← Back to list</button>
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
          <div className="no-print" style={{ display:'flex', gap:8, marginTop:'1.5rem', flexWrap:'wrap' }}>
            <button className="btn btn-navy" style={{ flex:1, minWidth:140 }} onClick={()=>window.print()}>🖨️ Print</button>
            <button className="btn btn-outline" style={{ flex:1, minWidth:140 }} onClick={() => {
              // Generate clean PDF
              const stmt = generateStatement(selectedDonor);
              const total = stmt.reduce((s,t)=>s+parseFloat(t.amount||0), 0);
              const rows = stmt.sort((a,b) => a.date.localeCompare(b.date)).map(t =>
                `<tr><td style="padding:6px 8px;color:#6a7280;font-size:13px">${t.date}</td><td style="padding:6px 8px;color:#1e3a5f">${t.category||'Gift'}</td><td style="padding:6px 8px;text-align:right;font-weight:600;color:#2d5a3f">${fmt(parseFloat(t.amount||0))}</td></tr>`
              ).join('');
              const html = `
<!DOCTYPE html><html><head><title>Giving Statement — ${selectedDonor.name} — ${year}</title>
<style>
  body { font-family: Georgia, serif; padding: 40px; color: #1e3a5f; max-width: 700px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 3px solid #c9a84c; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0; color: #1e3a5f; font-size: 24px; }
  .header p { margin: 4px 0 0 0; color: #6a7280; font-size: 13px; }
  .info { margin: 20px 0; font-size: 14px; }
  .info p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { padding: 10px 8px; text-align: left; background: #e3ebd7; color: #1e3a5f; font-size: 12px; text-transform: uppercase; }
  td { border-bottom: 1px solid #f4f6fa; }
  .total { background: #fdf7e8; padding: 14px 18px; border-radius: 8px; display: flex; justify-content: space-between; margin-top: 16px; font-weight: 700; font-size: 18px; color: #1e3a5f; }
  .legal { margin-top: 24px; padding: 16px; background: #f8f8f0; border-left: 4px solid #c9a84c; font-size: 12px; color: #1e3a5f; line-height: 1.6; }
  .footer { text-align: center; margin-top: 32px; color: #6a7280; font-size: 11px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <h1>${orgName}</h1>
  <p>Year-End Giving Statement · ${year}</p>
</div>
<div class="info">
  <p><strong>To:</strong> ${selectedDonor.name}</p>
  ${selectedDonor.address ? `<p style="color:#6a7280">${selectedDonor.address}</p>` : ''}
  ${selectedDonor.email ? `<p style="color:#6a7280">${selectedDonor.email}</p>` : ''}
</div>
<p style="font-size:14px;line-height:1.6">Thank you for your generous support of ${orgName} during ${year}. Below is a record of your contributions for tax purposes.</p>
<table>
  <thead><tr><th>Date</th><th>Category</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="total"><span>Total ${year} Contributions</span><span style="color:#2d5a3f">${fmt(total)}</span></div>
<div class="legal">
  <strong>Important Tax Information:</strong> No goods or services were provided in exchange for these contributions, except as noted. Please retain this statement for your tax records. ${orgName} is a registered ${orgConfig.id === 'church' ? '501(c)(3) religious organization' : '501(c)(3) nonprofit'}.
</div>
<div class="footer">Generated ${new Date().toLocaleDateString()} · ${stmt.length} gift${stmt.length !== 1 ? 's' : ''}</div>
<script>window.onload = () => { window.print(); }</script>
</body></html>`;
              const blob = new Blob([html], { type:'text/html' });
              const url = URL.createObjectURL(blob);
              const w = window.open(url, '_blank');
              if (!w) { alert('Please allow popups to download PDF.'); return; }
              setTimeout(() => URL.revokeObjectURL(url), 60000);
            }}>📄 Download PDF</button>
            {selectedDonor.email && (
              <button className="btn btn-outline" style={{ flex:1, minWidth:140 }} onClick={() => {
                const stmt = generateStatement(selectedDonor);
                const total = stmt.reduce((s,t)=>s+parseFloat(t.amount||0), 0);
                const subject = `Your ${year} Giving Statement from ${orgName}`;
                const body = `Dear ${selectedDonor.name},\n\nThank you for your generous support of ${orgName} in ${year}!\n\nYour total contributions for tax year ${year}: $${total.toFixed(2)}\nNumber of gifts: ${stmt.length}\n\nDetailed gifts:\n${stmt.map(t => `  ${t.date} — $${parseFloat(t.amount||0).toFixed(2)} (${t.category})`).join('\n')}\n\nIMPORTANT TAX INFORMATION:\nNo goods or services were provided in exchange for these contributions, except as noted. Please retain this statement for your tax records. ${orgName} is a registered ${orgConfig.id === 'church' ? '501(c)(3) religious organization' : '501(c)(3) nonprofit'}.\n\nWith gratitude,\n${orgName}`;
                // Open Gmail Compose in new tab (works with Gmail webmail)
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedDonor.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.open(gmailUrl, '_blank');
              }}>📧 Email via Gmail</button>
            )}
          </div>
          {!selectedDonor.email && (
            <p style={{ fontSize:'0.8rem', color: TXT_LIGHT, marginTop:8, fontStyle:'italic', textAlign:'center' }}>
              💡 Add an email to this donor to enable email statements
            </p>
          )}
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

// ============ RECONCILE TAB ============
function ReconcileTab({ user, transactions, setTransactions, orgConfig }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [bankIncome, setBankIncome] = useState('');
  const [bankExpense, setBankExpense] = useState('');
  const [diagnostics, setDiagnostics] = useState(null);
  const [fixing, setFixing] = useState(null);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  const EXCLUDED_CATS = ['Tithely Deposit', 'Givelify Deposit', 'Transfer In', 'Transfer Out', 'Loan Proceeds'];

  // Calculate app P&L totals
  const monthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const inPL = monthTxs.filter(t => !EXCLUDED_CATS.includes(t.category));
  const excluded = monthTxs.filter(t => EXCLUDED_CATS.includes(t.category));

  const appIncome = inPL.filter(t => t.type === 'income').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  const appExpense = inPL.filter(t => t.type === 'expense').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  const appExcluded = excluded.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

  const bankInc = parseFloat(bankIncome) || 0;
  const bankExp = parseFloat(bankExpense) || 0;
  const incomeDiff = bankInc - appIncome;
  const expenseDiff = bankExp - appExpense;

  const runDiagnostics = () => {
    const issues = [];

    // 1. Tithely double-counting: individual gifts NOT in Tithely Deposit
    const tithelyMisclassified = monthTxs.filter(t => 
      t.id && t.id.startsWith('thly') && t.category !== 'Tithely Deposit'
    );
    if (tithelyMisclassified.length > 0) {
      const total = tithelyMisclassified.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      issues.push({
        id: 'tithely-double',
        severity: 'high',
        title: 'Tithely Individual Gifts Double-Counted',
        description: `${tithelyMisclassified.length} Tithely CSV gifts totaling $${total.toFixed(2)} are categorized in your P&L. They should be "Tithely Deposit" (excluded) since bank batch deposits already count this income.`,
        fix: 'Move all to "Tithely Deposit"',
        txIds: tithelyMisclassified.map(t => t.id),
        impact: `Reduces P&L income by $${total.toFixed(2)}`
      });
    }

    // 2. Cash App offerings marked as expense
    const cashAppExpense = monthTxs.filter(t => 
      t.type === 'expense' && 
      (t.description || '').toUpperCase().includes('CASH APP') &&
      (t.description || '').toUpperCase().includes('FIRST FRUITS')
    );
    if (cashAppExpense.length > 0) {
      const total = cashAppExpense.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      issues.push({
        id: 'cashapp-offering',
        severity: 'high',
        title: 'Cash App Offerings Marked As Expense',
        description: `${cashAppExpense.length} Cash App transactions totaling $${total.toFixed(2)} are marked as expense but appear to be incoming offerings.`,
        fix: 'Convert to Income/Offerings',
        txIds: cashAppExpense.map(t => t.id),
        impact: `Increases income by $${total.toFixed(2)}, reduces expense by $${total.toFixed(2)}`
      });
    }

    // 3. Amazon/Walmart/Sams refunds (small amounts likely refunds)
    const possibleRefunds = monthTxs.filter(t => 
      t.type === 'expense' && 
      ((t.description || '').toUpperCase().match(/AMAZON\.COM\s+AMZN/) ||
       (t.description || '').toUpperCase().match(/AMAZON MKTPLACE PMTS/)) &&
      parseFloat(t.amount) < 50
    );
    if (possibleRefunds.length > 0) {
      const total = possibleRefunds.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      issues.push({
        id: 'possible-refunds',
        severity: 'medium',
        title: 'Possible Amazon Refunds',
        description: `${possibleRefunds.length} small Amazon transactions totaling $${total.toFixed(2)} might be refunds (compare to your bank statement — refunds appear with NO minus sign in DEBIT rows).`,
        fix: 'Review individually (manual)',
        txIds: possibleRefunds.map(t => t.id),
        impact: `Could shift up to $${total.toFixed(2)} from expense to income`
      });
    }

    // 4. Transfers categorized wrong (online transfers should be Transfer In/Out)
    const wrongTransfers = monthTxs.filter(t => 
      ((t.description || '').toLowerCase().includes('online transfer') || 
       (t.description || '').toLowerCase().includes('acct_xfer')) &&
      !EXCLUDED_CATS.includes(t.category)
    );
    if (wrongTransfers.length > 0) {
      const total = wrongTransfers.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      issues.push({
        id: 'wrong-transfers',
        severity: 'medium',
        title: 'Internal Transfers Not Excluded',
        description: `${wrongTransfers.length} internal account transfers totaling $${total.toFixed(2)} are in your P&L. They should be excluded (Transfer In/Out).`,
        fix: 'Move to Transfer In/Out',
        txIds: wrongTransfers.map(t => t.id),
        impact: `Removes $${total.toFixed(2)} from P&L (donor records preserved)`
      });
    }

    if (issues.length === 0) {
      issues.push({
        id: 'no-issues',
        severity: 'success',
        title: '✅ No Common Issues Detected',
        description: 'Your books look clean for this month. Any remaining differences may be missing transactions, fees, or bank errors. Review your bank statement line-by-line.',
        fix: null,
        txIds: [],
        impact: 'All known patterns checked'
      });
    }

    setDiagnostics(issues);
  };

  const applyFix = async (issue) => {
    if (!issue.fix || issue.txIds.length === 0) return;
    if (!window.confirm(`Apply fix: "${issue.fix}"?\n\nThis will update ${issue.txIds.length} transactions.`)) return;

    setFixing(issue.id);
    try {
      let updates = {};
      if (issue.id === 'tithely-double') {
        updates = { category: 'Tithely Deposit' };
      } else if (issue.id === 'cashapp-offering') {
        updates = { type: 'income', category: 'Offerings' };
      } else if (issue.id === 'wrong-transfers') {
        // Will set per-transaction based on income/expense type
      }

      if (issue.id === 'wrong-transfers') {
        // Per-transaction logic
        const sb = await getSupabase();
        for (const id of issue.txIds) {
          const tx = transactions.find(t => t.id === id);
          if (!tx) continue;
          const newCat = tx.type === 'income' ? 'Transfer In' : 'Transfer Out';
          const { error } = await sb
            .from('ksp_transactions')
            .update({ category: newCat })
            .eq('id', id)
            .eq('user_id', user.id);
          if (error) console.error(error);
        }
      } else if (Object.keys(updates).length > 0) {
        const sb = await getSupabase();
        const { error } = await sb
          .from('ksp_transactions')
          .update(updates)
          .in('id', issue.txIds)
          .eq('user_id', user.id);
        if (error) {
          alert('Error: ' + error.message);
          setFixing(null);
          return;
        }
      }

      // Reload transactions
      const sb2 = await getSupabase();
      const { data } = await sb2
        .from('ksp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (data) setTransactions(data);

      alert(`✅ Fixed ${issue.txIds.length} transactions!`);
      setDiagnostics(null); // Force re-run
      runDiagnostics();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setFixing(null);
    }
  };

  const fmt = (n) => '$' + (parseFloat(n) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.75rem', fontWeight:600, color:NAVY }}>🔍 Bank Reconciliation</h2>
        <p style={{ color:'#6B7280', marginTop:'0.5rem' }}>Compare your books to your bank statement. Find &amp; fix discrepancies with one click.</p>
      </div>

      {/* Month Selector */}
      <div className="card card-p" style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr', gap:'1rem', alignItems:'center' }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6B7280', marginBottom:4 }}>MONTH</label>
            <div style={{ display:'flex', gap:8 }}>
              <select className="input" value={month} onChange={e => setMonth(parseInt(e.target.value))} style={{ width:140 }}>
                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select className="input" value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ width:100 }}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6B7280', marginBottom:4 }}>BANK INCOME (from statement)</label>
            <input className="input" type="number" step="0.01" placeholder="e.g., 15432.34" value={bankIncome} onChange={e => setBankIncome(e.target.value)} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#6B7280', marginBottom:4 }}>BANK EXPENSE (from statement)</label>
            <input className="input" type="number" step="0.01" placeholder="e.g., 15465.59" value={bankExpense} onChange={e => setBankExpense(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
        {/* Income Card */}
        <div className="card card-p" style={{ borderLeft: `4px solid ${Math.abs(incomeDiff) < 0.01 && bankInc > 0 ? '#10B981' : '#F59E0B'}` }}>
          <h3 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'1rem' }}>💰 Income</h3>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0' }}>
            <span>Bank Statement:</span>
            <strong>{bankInc > 0 ? fmt(bankInc) : '—'}</strong>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid #E5E7EB' }}>
            <span>App P&amp;L:</span>
            <strong>{fmt(appIncome)}</strong>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid #E5E7EB', color: Math.abs(incomeDiff) < 0.01 ? '#10B981' : '#F59E0B' }}>
            <span><strong>Difference:</strong></span>
            <strong>{bankInc > 0 ? (Math.abs(incomeDiff) < 0.01 ? '✅ MATCH' : (incomeDiff > 0 ? '+' : '') + fmt(incomeDiff)) : '—'}</strong>
          </div>
          <div style={{ fontSize:12, color:'#6B7280', marginTop:8 }}>Excluded (donor detail): {fmt(appExcluded)}</div>
        </div>

        {/* Expense Card */}
        <div className="card card-p" style={{ borderLeft: `4px solid ${Math.abs(expenseDiff) < 0.01 && bankExp > 0 ? '#10B981' : '#F59E0B'}` }}>
          <h3 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'1rem' }}>💸 Expense</h3>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0' }}>
            <span>Bank Statement:</span>
            <strong>{bankExp > 0 ? fmt(bankExp) : '—'}</strong>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid #E5E7EB' }}>
            <span>App P&amp;L:</span>
            <strong>{fmt(appExpense)}</strong>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid #E5E7EB', color: Math.abs(expenseDiff) < 0.01 ? '#10B981' : '#F59E0B' }}>
            <span><strong>Difference:</strong></span>
            <strong>{bankExp > 0 ? (Math.abs(expenseDiff) < 0.01 ? '✅ MATCH' : (expenseDiff > 0 ? '+' : '') + fmt(expenseDiff)) : '—'}</strong>
          </div>
        </div>
      </div>

      {/* Run Diagnostics Button */}
      <div style={{ marginBottom:'1.5rem' }}>
        <button className="btn btn-navy" onClick={runDiagnostics} style={{ fontSize:'1rem', padding:'12px 24px' }}>
          🔍 Find Discrepancies for {monthNames[month]} {year}
        </button>
      </div>

      {/* Diagnostic Results */}
      {diagnostics && diagnostics.length > 0 && (
        <div className="card card-p">
          <h3 style={{ marginBottom:'1rem' }}>📋 Diagnostic Results</h3>
          {diagnostics.map((issue) => (
            <div key={issue.id} style={{
              padding:'1rem',
              marginBottom:'0.75rem',
              border:`1px solid ${issue.severity === 'success' ? '#10B981' : issue.severity === 'high' ? '#EF4444' : '#F59E0B'}`,
              borderRadius:8,
              background: issue.severity === 'success' ? '#F0FDF4' : issue.severity === 'high' ? '#FEF2F2' : '#FFFBEB'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', gap:'1rem' }}>
                <div style={{ flex:1 }}>
                  <h4 style={{ margin:0, marginBottom:6, fontSize:'1rem' }}>
                    {issue.severity === 'success' ? '✅' : issue.severity === 'high' ? '🔴' : '🟡'} {issue.title}
                  </h4>
                  <p style={{ margin:0, fontSize:'0.9rem', color:'#4B5563' }}>{issue.description}</p>
                  {issue.impact && (
                    <p style={{ margin:'4px 0 0', fontSize:'0.85rem', color:'#6B7280', fontStyle:'italic' }}>
                      Impact: {issue.impact}
                    </p>
                  )}
                </div>
                {issue.fix && issue.txIds.length > 0 && (
                  <button
                    className="btn btn-gold"
                    onClick={() => applyFix(issue)}
                    disabled={fixing === issue.id}
                    style={{ whiteSpace:'nowrap' }}
                  >
                    {fixing === issue.id ? 'Fixing...' : '⚡ ' + issue.fix}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="card card-p" style={{ marginTop:'1.5rem', background:'#F9FAFB' }}>
        <h4 style={{ marginBottom:8 }}>💡 How to Reconcile</h4>
        <ol style={{ margin:0, paddingLeft:20, fontSize:'0.9rem', color:'#4B5563', lineHeight:1.8 }}>
          <li>Open your bank statement for the month</li>
          <li>Find the total CREDIT (income) and total DEBIT (expense) amounts</li>
          <li>Enter them in the fields above</li>
          <li>The cards turn GREEN ✅ when they match the app exactly</li>
          <li>If they don't match, click "Find Discrepancies" — the app checks for common issues</li>
          <li>Click "Apply Fix" buttons to fix issues with one click</li>
        </ol>
      </div>
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
      const { error } = await sb.from('organizations').upsert({ user_id: user.id, name, org_type: type }, { onConflict: 'user_id' });
      if (error) alert('Save error: ' + error.message);
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
