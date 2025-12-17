import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  TrendUp, 
  ShieldCheck, 
  Lightning, 
  Buildings,
  UsersThree,
  ChartBar
} from '@phosphor-icons/react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<'sales' | 'tech' | 'pricing'>('sales');
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SwiftBid</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
            >
              Get Started <ArrowRight weight="bold" />
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Grid Pattern (CSS-only) */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, 
               backgroundSize: '40px 40px' 
             }}>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Copy */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wide">
              <Lightning weight="fill" />
              <span>AI-Powered RFP Management</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Win Contracts at <br />
              <span className="text-transparent bg-clip-text bg-slate-900 relative">
                Hyper Speed
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-500 opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 max-w-lg leading-relaxed">
              Orchestrate your Sales, Technical, and Pricing teams on one unified platform. Turn complex RFPs into winning bids in hours, not weeks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-indigo-600 text-white text-base font-bold rounded-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-600/20"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 text-base font-bold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                View Live Demo
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-slate-500 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-500" weight="fill" size={18} />
                <span>SOC2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-emerald-500" weight="fill" size={18} />
                <span>GeM Integrated</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - "Live Bid Card" */}
          <div className="relative hidden lg:block perspective-1000">
            {/* Abstract shapes */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-500">
              {/* Fake UI Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                    <Buildings weight="duotone" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">National Grid Infra</h3>
                    <p className="text-xs text-slate-500">RFP-2024-882 • Heavy Cabling</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full animate-pulse">
                  LIVE BIDDING
                </div>
              </div>

              {/* Fake UI Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Win Probability</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900">88%</span>
                    <span className="text-xs text-emerald-600 font-bold mb-1 flex items-center">
                      <TrendUp weight="bold" className="mr-0.5" /> +12%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Margin</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900">18.5%</span>
                    <span className="text-xs text-slate-400 font-medium mb-1">Target: 15%</span>
                  </div>
                </div>
              </div>

              {/* Animated List */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-indigo-200 transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <UsersThree size={16} weight="bold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Tech Review Complete</p>
                    <p className="text-xs text-slate-500">Approved by Eng. Team</p>
                  </div>
                  <CheckCircle size={20} className="text-indigo-600" weight="fill" />
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-indigo-200 transition-colors cursor-default">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <ShieldCheck size={16} weight="bold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Compliance Check</p>
                    <p className="text-xs text-slate-500">ISO 9001 Verified</p>
                  </div>
                  <CheckCircle size={20} className="text-amber-500" weight="fill" />
                </div>

                 <div className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-indigo-200 transition-colors cursor-default opacity-70">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <ChartBar size={16} weight="bold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Final Pricing</p>
                    <p className="text-xs text-slate-500">Awaiting Manager Approval</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Last updated: Just now</span>
                <span className="font-mono">ID: #9928-A</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUE PROP SECTION --- */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Built for Complex Bidding</h2>
            <p className="text-lg text-slate-600">Stop managing multi-million dollar bids on spreadsheets. Switch to a purpose-built command center.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <UsersThree size={32} />,
                title: 'Role-Specific Workflows',
                desc: 'Sales, Tech, and Pricing teams get dedicated dashboards. No more noise, just tasks that matter to them.',
                color: 'text-indigo-600 bg-indigo-50'
              },
              {
                icon: <TrendUp size={32} />,
                title: 'Automated Pricing Logic',
                desc: 'Calculate transport margins, LD risks, and tax implications automatically based on real-time logistics data.',
                color: 'text-emerald-600 bg-emerald-50'
              },
              {
                icon: <ShieldCheck size={32} />,
                title: 'Compliance Guardrails',
                desc: 'Never miss a clause. AI scans PDFs for "Make in India" requirements, PBG terms, and payment milestones.',
                color: 'text-amber-600 bg-amber-50'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(feature.icon as React.ReactElement, { weight: 'duotone' })}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE PREVIEW SECTION --- */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Control Panel */}
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold">A View for Every Expert</h2>
              <p className="text-slate-400 text-lg">See how SwiftBid adapts its interface to the specific needs of each department.</p>
              
              <div className="space-y-4">
                {[
                  { id: 'sales', label: 'Sales Leader', desc: 'Pipeline visibility, strategic notes, and competitor intel.' },
                  { id: 'tech', label: 'Technical Specialist', desc: 'Spec matching, deviation handling, and BOQ verification.' },
                  { id: 'pricing', label: 'Commercial Manager', desc: 'Margin analysis, currency hedging, and risk buffers.' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id as any)}
                    className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${
                      activeRole === role.id 
                      ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-900/20 translate-x-2' 
                      : 'bg-transparent border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold text-lg ${activeRole === role.id ? 'text-white' : 'text-slate-300'}`}>
                        {role.label}
                      </h4>
                      {activeRole === role.id && <ArrowRight className="text-indigo-400" />}
                    </div>
                    <p className="text-sm text-slate-400">{role.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Preview Area */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 rounded-2xl filter blur-3xl"></div>
              
              <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl min-h-[400px] border border-slate-700">
                {/* Mock Browser Header */}
                <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-white px-3 py-1 rounded text-[10px] text-slate-400 font-mono w-fit mx-auto shadow-sm">
                      swiftbid.app/dashboard/{activeRole}
                    </div>
                  </div>
                </div>

                {/* Dynamic Content based on Role */}
                <div className="p-6 bg-slate-50 h-full">
                  {activeRole === 'sales' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Pipeline Overview</h3>
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-bold">Q4 TARGETS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                           <div className="text-2xl font-bold text-slate-900">₹42 Cr</div>
                           <div className="text-xs text-slate-500">Pipeline Value</div>
                         </div>
                         <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                           <div className="text-2xl font-bold text-emerald-600">68%</div>
                           <div className="text-xs text-slate-500">Win Rate</div>
                         </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-3">AI Insights</p>
                        <div className="flex gap-3 items-start">
                          <Lightning className="text-amber-500 shrink-0 mt-1" weight="fill" />
                          <p className="text-sm text-slate-700">Competitor <strong>Polycab</strong> just dropped prices by 2% in the North region. Suggest revising margins for the Delhi Metro bid.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeRole === 'tech' && (
                    <div className="space-y-4 animate-fade-in">
                       <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Spec Validation</h3>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-bold">3 PENDING</span>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 border-l-4 border-l-red-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">Deviation Detected</h4>
                            <p className="text-xs text-slate-500 mt-1">Item #4.2: XLPE Insulation Thickness</p>
                          </div>
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">ISO-8821</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-3 bg-red-50 p-2 rounded border border-red-100">
                          RFP asks for 2.5mm, our standard is 2.2mm. Requires type test waiver or custom extrusion run.
                        </p>
                      </div>
                       <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 opacity-60">
                          <div className="h-4 w-1/2 bg-slate-200 rounded mb-2"></div>
                          <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
                       </div>
                    </div>
                  )}

                  {activeRole === 'pricing' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Commercial Bid</h3>
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-bold">DRAFT MODE</span>
                      </div>
                       <div className="space-y-2">
                        <div className="flex justify-between text-sm p-3 bg-white rounded border border-slate-100">
                          <span className="text-slate-600">Base Material Cost</span>
                          <span className="font-mono font-bold">₹ 1,45,00,000</span>
                        </div>
                        <div className="flex justify-between text-sm p-3 bg-white rounded border border-slate-100">
                          <span className="text-slate-600">Logistics (3 Trucks)</span>
                          <span className="font-mono font-bold">₹ 1,25,000</span>
                        </div>
                        <div className="flex justify-between text-sm p-3 bg-amber-50 rounded border border-amber-100">
                          <span className="text-amber-800 font-medium">Risk Buffer (Cu Volatility)</span>
                          <span className="font-mono font-bold text-amber-700">+ 2.5%</span>
                        </div>
                        <div className="flex justify-between text-sm p-3 bg-slate-900 text-white rounded mt-4">
                          <span className="font-medium">Final Quote Value</span>
                          <span className="font-mono font-bold">₹ 1,82,45,000</span>
                        </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="text-lg font-bold text-slate-900">SwiftBid</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 SwiftBid Inc. Enterprise RFP Intelligence.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
