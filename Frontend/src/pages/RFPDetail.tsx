// src/pages/RFPDetail.tsx
import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockRFPs } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  FileText,
  X,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
  Download,
  FileDown,
} from 'lucide-react';

const RFPDetail = () => {
  const { id } = useParams();
  const { role } = useAuth();

  // Make lookup resilient to string/number mismatch
  const rfp = useMemo(
    () => mockRFPs.find((r) => String(r.id) === String(id)),
    [id]
  );

  // which tab is active
  const [activeTab, setActiveTab] = useState<'summary' | 'tech' | 'pricing'>('summary');

  // Sales notes (for sales view)
  const [salesNotes, setSalesNotes] = useState(rfp?.salesNotes || '');
  const [isModalOpen, setModalOpen] = useState(false);
  
  // Change request form state
  const [changeRequest, setChangeRequest] = useState({
    whatChanges: '',
    why: '',
    effect: '',
    howItMatters: '',
  });
  
  // Load change requests from localStorage
  const loadChangeRequests = () => {
    try {
      const stored = localStorage.getItem(`rfp-${id}-change-requests`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };
  
  const [changeRequests, setChangeRequests] = useState<Array<{
    id: string;
    requestedBy: string;
    timestamp: string;
    whatChanges: string;
    why: string;
    effect: string;
    howItMatters: string;
    status: 'pending' | 'revised' | 'approved';
  }>>(() => loadChangeRequests());
  
  // Check if RFP is in revision
  const isInRevision = changeRequests.some(req => req.status === 'pending');
  
  // Comments for tech and pricing teams - load from localStorage
  const loadComments = (key: string) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveComments = (key: string, comments: Array<{id: string; text: string; timestamp: string}>) => {
    try {
      localStorage.setItem(key, JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comments:', error);
    }
  };

  const [techComments, setTechComments] = useState<Array<{id: string; text: string; timestamp: string}>>(() => 
    loadComments(`rfp-${id}-tech-comments`)
  );
  const [pricingComments, setPricingComments] = useState<Array<{id: string; text: string; timestamp: string}>>(() => 
    loadComments(`rfp-${id}-pricing-comments`)
  );
  const [newTechComment, setNewTechComment] = useState('');
  const [newPricingComment, setNewPricingComment] = useState('');

  // Save comments to localStorage whenever they change
  useEffect(() => {
    saveComments(`rfp-${id}-tech-comments`, techComments);
  }, [techComments, id]);

  useEffect(() => {
    saveComments(`rfp-${id}-pricing-comments`, pricingComments);
  }, [pricingComments, id]);

  if (!rfp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-600 mb-2">RFP Not Found</p>
          <p className="text-sm text-slate-500">
            We couldn&apos;t find an RFP with ID <span className="font-mono">{id}</span>.
          </p>
        </div>
      </div>
    );
  }

  const isSales = role === 'sales';
  const isTech = role === 'tech';
  const isPricing = role === 'pricing';

  // You can later swap these with real backend fields:
  const fakeSummary =
    (rfp as any).summary ||
    `This RFP from ${rfp.client} for "${rfp.title}" aligns well with our capabilities in large industrial and infrastructure execution. SwiftBid AI has parsed the tender, mapped the BOQ to internal SKUs and generated a draft proposal with recommended pricing and risk-margins.`;

  const techNotes =
    (rfp as any).techNotes ||
    `Technical team validated the AI SKU mapping, ensured compliance with core specs and flagged minor deviations for discussion with the client. All mandatory standards and testing requirements are covered in the final BOQ.`;

  const pricingNotes =
    (rfp as any).pricingNotes ||
    `Pricing team applied standard margin guardrails, added logistics and test costs, and calibrated final price based on historical win/loss data in similar projects.`;

  const profitMargin =
    (rfp as any).profitMargin !== undefined
      ? `${(rfp as any).profitMargin}%`
      : '18% (target)';

  const competitorIntel = useMemo(() => {
    const presets: Record<
      string,
      {
        knownCompetitors: Array<{ name: string; winRate: number }>;
        strengths: string[];
        gaps: string[];
      }
    > = {
      InfraCorp: {
        knownCompetitors: [
          { name: 'NetWave', winRate: 62 },
          { name: 'FiberGrid', winRate: 55 },
          { name: 'AxisCore', winRate: 48 },
        ],
        strengths: ['Faster deployment SLAs', 'Deep integration with legacy infra', 'Lower TCO in 3-year view'],
        gaps: ['On-prem security certifications in progress', 'Fewer local delivery partners'],
      },
      'SwiftCorp Global': {
        knownCompetitors: [
          { name: 'CloudSpan', winRate: 58 },
          { name: 'DataSphere', winRate: 50 },
          { name: 'HelixEdge', winRate: 47 },
        ],
        strengths: ['Stronger migration playbooks', 'Proven uptime benchmarks', 'Competitive blended rate card'],
        gaps: ['Limited Tier-3 DC coverage in APAC', 'Referenceable wins are mostly mid-market'],
      },
      default: {
        knownCompetitors: [
          { name: 'Competitor A', winRate: 54 },
          { name: 'Competitor B', winRate: 49 },
          { name: 'Competitor C', winRate: 46 },
        ],
        strengths: ['Responsive bid team', 'Configurable architecture', 'Transparent pricing envelopes'],
        gaps: ['Need fresher case studies', 'Certifications pending on two regions'],
      },
    };

    const picked = presets[rfp.client as keyof typeof presets] ?? presets.default;
    const avgWinRate =
      picked.knownCompetitors.reduce((sum, c) => sum + c.winRate, 0) / picked.knownCompetitors.length;

    return {
      ...picked,
      avgWinRate: Math.round(avgWinRate),
    };
  }, [rfp.client]);

  const clientIntel = useMemo(() => {
    const presets: Record<
      string,
      {
        history: Array<{ year: string; deal: string; outcome: 'won' | 'lost' | 'pending'; value: string }>;
        decisionMakers: Array<{ name: string; role: string; preference: string }>;
        painPoints: string[];
        buyingCriteria: string[];
      }
    > = {
      InfraCorp: {
        history: [
          { year: '2024', deal: 'WAN refresh', outcome: 'won', value: '$1.1M' },
          { year: '2023', deal: 'Campus LAN', outcome: 'lost', value: '$900k' },
          { year: '2022', deal: 'MPLS migration', outcome: 'won', value: '$700k' },
        ],
        decisionMakers: [
          { name: 'Sanjay Mehta', role: 'CIO', preference: 'Uptime and rollout certainty; minimal disruption' },
          { name: 'Lisa Carter', role: 'Procurement', preference: 'Transparent pricing, clear SLA penalties' },
        ],
        painPoints: ['Legacy sites with mixed vendors', 'Aggressive timeline for cutover', 'Strict SLA penalties'],
        buyingCriteria: ['Demonstrated rollout plan', 'SLA guarantees with credits', 'Local support coverage'],
      },
      'SwiftCorp Global': {
        history: [
          { year: '2024', deal: 'Cloud phase 1', outcome: 'won', value: '$1.6M' },
          { year: '2023', deal: 'Data center move', outcome: 'lost', value: '$2.0M' },
        ],
        decisionMakers: [
          { name: 'Amelia Rhodes', role: 'VP Infrastructure', preference: 'Referenceable migrations and rollback plans' },
          { name: 'Dev Patel', role: 'Finance controller', preference: 'Cost predictability; phased payments' },
        ],
        painPoints: ['Risk of downtime during migration', 'Desire for phased spend', 'Need for joint runbooks'],
        buyingCriteria: ['Pilot-first approach', 'Transparent T&M bands', 'Shared success milestones'],
      },
      default: {
        history: [
          { year: '2024', deal: 'Security upgrade', outcome: 'won', value: '$950k' },
          { year: '2023', deal: 'Network audit', outcome: 'won', value: '$250k' },
        ],
        decisionMakers: [
          { name: 'Primary Sponsor', role: 'Director IT', preference: 'Clear roadmap and ownership' },
          { name: 'Procurement Lead', role: 'Procurement', preference: 'Clean commercials and SLA clarity' },
        ],
        painPoints: ['Need faster delivery', 'Compliance documentation burden'],
        buyingCriteria: ['Rapid deployment plan', 'Complete compliance pack'],
      },
    };

    const picked = presets[rfp.client as keyof typeof presets] ?? presets.default;
    const winRate =
      picked.history.filter((h) => h.outcome === 'won').length / Math.max(picked.history.length, 1);

    return {
      ...picked,
      historicalWinRate: Math.round(winRate * 100),
    };
  }, [rfp.client]);

  const processTimeline = [
    {
      label: 'RFP ingested',
      time: 'Day 0 · 09:00',
      description: 'SwiftBid agent scraped the opportunity from the client portal.',
      type: 'system',
    },
    {
      label: 'AI parsing & spec extraction',
      time: 'Day 0 · 09:05',
      description:
        'RFP PDF processed; requirements, BOQ and constraints converted to structured data.',
      type: 'system',
    },
    {
      label: 'Technical mapping',
      time: 'Day 0 · 10:30',
      description:
        'Tech team reviewed SKU mapping, resolved spec gaps and locked final product list.',
      type: 'tech',
    },
    {
      label: 'Pricing & margin decision',
      time: 'Day 0 · 14:00',
      description:
        'Pricing agent calculated total cost, added margin and validated against thresholds.',
      type: 'pricing',
    },
    {
      label: 'Sales review',
      time: 'Day 1 · 10:00',
      description:
        'Sales manager reviewed summary, risks and margin; ready for negotiation and submission.',
      type: 'sales',
    },
  ];

  return (
    <div className="flex flex-col h-full relative w-full overflow-x-hidden bg-slate-50">
      {/* Main layout: left sidebar + right content */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden w-full">
        {/* LEFT SIDEBAR (Metadata) */}
        <div className="w-full lg:w-80 bg-white border-r border-slate-200 p-4 sm:p-6 overflow-y-auto scrollbar-hide">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Client
          </h2>
          <p className="text-2xl font-bold text-slate-900 mb-4">{rfp.client}</p>

          <div className="space-y-5 text-sm">
            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">
                RFP Title
              </h3>
              <p className="font-medium text-slate-800">{rfp.title}</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">
                Estimated Value
              </h3>
              <p className="text-lg font-bold text-emerald-700">{rfp.value}</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">
                Deadline
              </h3>
              <div className="flex items-center gap-2 text-amber-700 font-medium bg-amber-50 px-3 py-2 rounded-md">
                <AlertTriangle size={18} />
                <span>{rfp.deadline} (4 days left)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">
                Source
              </h3>
              <div className="flex items-center gap-2 text-slate-700">
                <FileText size={18} />
                <span className="truncate">{rfp.source}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">
                Snapshot
              </h3>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Profit margin</span>
                  <span className="font-semibold text-emerald-700">
                    {profitMargin}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Spec match score</span>
                  <span className="font-semibold text-slate-800">
                    {(rfp as any).specMatch || '91%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Exceptions</span>
                  <span className="font-semibold text-slate-800">
                    {(rfp as any).exceptions ?? '2 (resolved)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-3">
                Documents
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Create a mock PDF download
                    const link = document.createElement('a');
                    link.href = `#`; // In a real app, this would be the actual PDF URL
                    link.download = `RFP_${rfp.client}_${rfp.title.replace(/\s+/g, '_')}.pdf`;
                    link.click();
                    // For demo purposes, show an alert
                    alert('Downloading RFP PDF...\n\nIn production, this would download the actual RFP document.');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-sm font-medium text-slate-700"
                >
                  <FileText size={16} className="text-slate-600" />
                  <span className="flex-1 text-left">Download RFP PDF</span>
                  <Download size={14} className="text-slate-500" />
                </button>
                <button
                  onClick={() => {
                    // Create a mock submission report download
                    const link = document.createElement('a');
                    link.href = `#`; // In a real app, this would be the actual report URL
                    link.download = `Submission_Report_${rfp.client}_${rfp.title.replace(/\s+/g, '_')}.pdf`;
                    link.click();
                    // For demo purposes, show an alert
                    alert('Downloading Submission Report...\n\nIn production, this would download the AI-generated submission report.');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors text-sm font-medium text-indigo-700"
                >
                  <FileDown size={16} className="text-indigo-600" />
                  <span className="flex-1 text-left">Download Submission Report</span>
                  <Download size={14} className="text-indigo-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 w-full scrollbar-hide">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${
                activeTab === 'summary'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`px-6 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${
                activeTab === 'tech'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Tech Match
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-6 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${
                activeTab === 'pricing'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Pricing
            </button>
          </div>

          <div className="space-y-6">
            {/* SUMMARY TAB */}
            {activeTab === 'summary' && (
              <>
                {/* AI Executive Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={18} className="text-slate-500" />
                      AI Executive Summary
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 uppercase">
                      Sales view
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm mb-3">{fakeSummary}</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1.5 text-sm">
                    <li>High technical match score for core components.</li>
                    <li>Key risks and compliance requirements are tracked for follow-up.</li>
                    <li>
                      Price positioning can be tuned based on competitor behaviour and client
                      profile.
                    </li>
                  </ul>
                </div>

                {/* Competitive Intelligence */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-slate-500" />
                      <h3 className="text-lg font-bold text-slate-900">Competitive Intelligence</h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Est. win rate vs peers: {competitorIntel.avgWinRate}%
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Known competitors</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {competitorIntel.knownCompetitors.map((c) => (
                        <div key={c.name} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              {c.winRate}% win
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">Likely bidder in this segment.</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50">
                      <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Where we are stronger</p>
                      <ul className="list-disc list-inside text-sm text-emerald-900 space-y-1">
                        {competitorIntel.strengths.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border border-amber-100 bg-amber-50">
                      <p className="text-xs font-semibold text-amber-700 uppercase mb-2">Watchouts / weaker vs peers</p>
                      <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                        {competitorIntel.gaps.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Client Intelligence */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-slate-500" />
                      <h3 className="text-lg font-bold text-slate-900">Client Intelligence</h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      Historical win rate: {clientIntel.historicalWinRate}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Past interactions</p>
                      <div className="space-y-2">
                        {clientIntel.history.map((item) => (
                          <div
                            key={`${item.year}-${item.deal}`}
                            className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.deal}</p>
                              <p className="text-xs text-slate-600">{item.year} · {item.value}</p>
                            </div>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full ${
                                item.outcome === 'won'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : item.outcome === 'lost'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {item.outcome === 'won' ? 'Won' : item.outcome === 'lost' ? 'Lost' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Decision makers</p>
                      <div className="space-y-2">
                        {clientIntel.decisionMakers.map((dm) => (
                          <div key={dm.name} className="p-3 rounded-lg border border-slate-200 bg-white">
                            <p className="text-sm font-semibold text-slate-900">{dm.name}</p>
                            <p className="text-xs text-slate-600">{dm.role}</p>
                            <p className="text-xs text-slate-700 mt-1">Prefers: {dm.preference}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-amber-100 bg-amber-50">
                      <p className="text-xs font-semibold text-amber-700 uppercase mb-2">Client pain points</p>
                      <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                        {clientIntel.painPoints.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50">
                      <p className="text-xs font-semibold text-indigo-700 uppercase mb-2">Buying criteria</p>
                      <ul className="list-disc list-inside text-sm text-indigo-900 space-y-1">
                        {clientIntel.buyingCriteria.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Change Requests Section (visible to Sales when RFP is in revision) */}
                {isSales && isInRevision && (
                  <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200 border-l-4 border-l-red-500">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle size={20} className="text-red-600" />
                      <h3 className="text-lg font-bold text-red-900">
                        Change Requests - RFP in Revision
                      </h3>
                    </div>
                    <p className="text-sm text-red-700 mb-4">
                      The {changeRequests.filter(r => r.status === 'pending').map(r => r.requestedBy === 'tech' ? 'Technical' : 'Pricing').join(' and ')} team has requested changes. Please review and work with the AI agent to address these issues.
                    </p>
                    
                    {changeRequests.filter(r => r.status === 'pending').map((request) => (
                      <div key={request.id} className="mb-4 p-4 bg-white rounded-lg border border-red-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-sm font-semibold text-slate-900">
                              Requested by {request.requestedBy === 'tech' ? 'Technical' : 'Pricing'} Team
                            </span>
                            <span className="text-xs text-slate-500 ml-2">{request.timestamp}</span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Pending Revision
                          </span>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-slate-700">What changes:</span>
                            <p className="text-slate-800 mt-1">{request.whatChanges}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Why:</span>
                            <p className="text-slate-800 mt-1">{request.why}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Effect:</span>
                            <p className="text-slate-800 mt-1">{request.effect}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">How it matters:</span>
                            <p className="text-slate-800 mt-1">{request.howItMatters}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-red-200">
                          <button
                            onClick={() => {
                              const updated = changeRequests.map(r => 
                                r.id === request.id ? { ...r, status: 'revised' as const } : r
                              );
                              setChangeRequests(updated);
                              localStorage.setItem(`rfp-${id}-change-requests`, JSON.stringify(updated));
                              alert('Changes marked as revised! The RFP will now return to the ' + (request.requestedBy === 'tech' ? 'Technical' : 'Pricing') + ' team for approval.');
                            }}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Mark as Revised
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sales notes (only visible to Sales, only on Summary tab) */}
                {isSales && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-slate-900">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Sales strategic notes (internal only)
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Add context for technical and pricing teams – negotiation angle, client
                      politics, must-win reasons, etc.
                    </p>
                    <textarea
                      className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none text-slate-800 text-sm"
                      placeholder="E.g., Client is sensitive on timelines; highlight rapid deployment + flexible payment terms..."
                      value={salesNotes}
                      onChange={(e) => setSalesNotes(e.target.value)}
                    />
                  </div>
                )}
              </>
            )}

            {/* TECH TAB */}
            {activeTab === 'tech' && (
              <>
                {/* Show change requests made by tech team */}
                {isTech && changeRequests.filter(r => r.requestedBy === 'tech').length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-purple-600" />
                      Your Change Requests
                    </h3>
                    {changeRequests.filter(r => r.requestedBy === 'tech').map((request) => (
                      <div key={request.id} className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-900">
                            Requested on {request.timestamp}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            request.status === 'revised' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.status === 'pending' ? 'In Revision' :
                             request.status === 'revised' ? 'Revised - Awaiting Approval' :
                             'Approved'}
                          </span>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-slate-700">What changes:</span>
                            <p className="text-slate-800 mt-1">{request.whatChanges}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Why:</span>
                            <p className="text-slate-800 mt-1">{request.why}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Effect:</span>
                            <p className="text-slate-800 mt-1">{request.effect}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">How it matters:</span>
                            <p className="text-slate-800 mt-1">{request.howItMatters}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Users size={16} className="text-slate-500" />
                    Technical review & changes
                  </h3>
                  <p className="text-sm text-slate-700 mb-3">{techNotes}</p>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• Spec-to-SKU match score: {(rfp as any).specMatch || '91%'}</li>
                    <li>
                      • Exceptions handled:{' '}
                      {(rfp as any).exceptions ?? '2 (all resolved with alternates)'}
                    </li>
                    <li>• Test & compliance requirements included in final BOQ.</li>
                  </ul>
                </div>

                {/* Comments section for Tech team (Sales Manager can send, Tech team can view) */}
                {(isSales || isTech) && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <MessageSquare size={18} className="text-purple-600" />
                      {isSales ? 'Comments & Requests for Tech Team' : 'Comments from Sales Team'}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {isSales 
                        ? 'Send requests, comments, or notes to the technical team to check or keep in mind.'
                        : 'View comments and requests from the sales team regarding this RFP.'}
                    </p>
                    
                    {/* Existing comments */}
                    {techComments.length > 0 ? (
                      <div className="mb-4 space-y-3">
                        {techComments.map((comment) => (
                          <div key={comment.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-medium text-slate-700">Sales Manager</span>
                              <span className="text-xs text-slate-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-800">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      isTech && (
                        <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-500 text-center">
                          No comments from sales team yet.
                        </div>
                      )
                    )}

                    {/* New comment form (only for Sales) */}
                    {isSales && (
                      <div className="space-y-3">
                        <textarea
                          className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none text-slate-800 text-sm"
                          placeholder="E.g., Please verify compliance with ISO 27001 requirements. Client mentioned they need additional security certifications..."
                          value={newTechComment}
                          onChange={(e) => setNewTechComment(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            if (newTechComment.trim()) {
                              const newComment = {
                                id: Date.now().toString(),
                                text: newTechComment,
                                timestamp: new Date().toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }),
                              };
                              setTechComments([...techComments, newComment]);
                              setNewTechComment('');
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          <Send size={16} />
                          Send to Tech Team
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
              <>
                {/* Show change requests made by pricing team */}
                {isPricing && changeRequests.filter(r => r.requestedBy === 'pricing').length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-amber-600" />
                      Your Change Requests
                    </h3>
                    {changeRequests.filter(r => r.requestedBy === 'pricing').map((request) => (
                      <div key={request.id} className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-900">
                            Requested on {request.timestamp}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            request.status === 'revised' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {request.status === 'pending' ? 'In Revision' :
                             request.status === 'revised' ? 'Revised - Awaiting Approval' :
                             'Approved'}
                          </span>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-semibold text-slate-700">What changes:</span>
                            <p className="text-slate-800 mt-1">{request.whatChanges}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Why:</span>
                            <p className="text-slate-800 mt-1">{request.why}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Effect:</span>
                            <p className="text-slate-800 mt-1">{request.effect}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">How it matters:</span>
                            <p className="text-slate-800 mt-1">{request.howItMatters}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <DollarSign size={16} className="text-slate-500" />
                    Pricing & margin decision
                  </h3>
                  <p className="text-sm text-slate-700 mb-3">{pricingNotes}</p>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• Target margin: {profitMargin}</li>
                    <li>
                      • Risk buffer: {(rfp as any).riskBuffer || '3%'} for penalties & overruns.
                    </li>
                    <li>• Positioned to stay competitive vs past tender benchmarks.</li>
                  </ul>
                </div>

                {/* Comments section for Pricing team (Sales Manager can send, Pricing team can view) */}
                {(isSales || isPricing) && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <MessageSquare size={18} className="text-amber-600" />
                      {isSales ? 'Comments & Requests for Pricing Team' : 'Comments from Sales Team'}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {isSales 
                        ? 'Send requests, comments, or notes to the pricing team to check or keep in mind.'
                        : 'View comments and requests from the sales team regarding this RFP.'}
                    </p>
                    
                    {/* Existing comments */}
                    {pricingComments.length > 0 ? (
                      <div className="mb-4 space-y-3">
                        {pricingComments.map((comment) => (
                          <div key={comment.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-medium text-slate-700">Sales Manager</span>
                              <span className="text-xs text-slate-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-800">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      isPricing && (
                        <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-500 text-center">
                          No comments from sales team yet.
                        </div>
                      )
                    )}

                    {/* New comment form (only for Sales) */}
                    {isSales && (
                      <div className="space-y-3">
                        <textarea
                          className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none text-slate-800 text-sm"
                          placeholder="E.g., Client has budget constraints. Can we explore flexible payment terms? Also, competitor X typically bids 5-10% lower..."
                          value={newPricingComment}
                          onChange={(e) => setNewPricingComment(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            if (newPricingComment.trim()) {
                              const newComment = {
                                id: Date.now().toString(),
                                text: newPricingComment,
                                timestamp: new Date().toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }),
                              };
                              setPricingComments([...pricingComments, newComment]);
                              setNewPricingComment('');
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors text-sm"
                        >
                          <Send size={16} />
                          Send to Pricing Team
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Timeline: full journey of this RFP (only visible in Summary tab) */}
            {activeTab === 'summary' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-slate-500" />
                    Process timeline
                  </h3>
                  <span className="text-xs text-slate-500">
                    End-to-end story inside SwiftBid AI
                  </span>
                </div>

                <ol className="relative border-l border-slate-200 ml-2 mt-3 space-y-4">
                  {processTimeline.map((step, idx) => (
                    <li key={idx} className="ml-4">
                      <div className="absolute -left-[9px] mt-1.5 h-3 w-3 rounded-full bg-indigo-500 border-2 border-slate-50" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <p className="text-sm font-medium text-slate-900">{step.label}</p>
                        </div>
                        <span className="text-xs text-slate-500">{step.time}</span>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        {step.description}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                        {step.type === 'system'
                          ? 'System agent'
                          : step.type === 'tech'
                          ? 'Technical team'
                          : step.type === 'pricing'
                          ? 'Pricing team'
                          : 'Sales'}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTION BAR (Tech / Pricing / Management, not Sales) */}
      {!isSales && (
        <div className="fixed bottom-0 left-0 lg:left-80 right-0 bg-white border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="text-xs sm:text-sm text-slate-500 font-medium px-1 sm:px-4">
            {changeRequests.some(r => r.status === 'revised' && r.requestedBy === role) ? (
              <span className="text-amber-700">
                <AlertTriangle size={16} className="inline mr-1" />
                RFP revised - Ready for your approval
              </span>
            ) : (
              <>
                Reviewing as:{' '}
                <span className="text-slate-900 capitalize font-semibold">{role} lead</span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 sm:px-6 py-2.5 border-2 border-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors text-xs sm:text-sm"
            >
              Request changes
            </button>
            {changeRequests.some(r => r.status === 'revised' && r.requestedBy === role) ? (
              <button
                onClick={() => {
                  const updated = changeRequests.map(r => 
                    r.status === 'revised' && r.requestedBy === role ? { ...r, status: 'approved' as const } : r
                  );
                  setChangeRequests(updated);
                  localStorage.setItem(`rfp-${id}-change-requests`, JSON.stringify(updated));
                  alert('Approved! Changes have been accepted. RFP is moving to the next stage.');
                }}
                className="px-4 sm:px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm text-xs sm:text-sm"
              >
                Approve Revised Changes
              </button>
            ) : (
              <button
                onClick={() => alert('Approved! Moving to next stage.')}
                className="px-4 sm:px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-xs sm:text-sm"
              >
                Approve & advance
              </button>
            )}
          </div>
        </div>
      )}

      {/* REQUEST CHANGES MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                Request Changes - Detailed Feedback
              </h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setChangeRequest({ whatChanges: '', why: '', effect: '', howItMatters: '' });
                }}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <p className="text-sm text-slate-600 mb-6">
                Provide detailed feedback for the AI agent and sales team. This will send the RFP back for revision.
              </p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What changes need to be done? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none text-slate-800 text-sm"
                    placeholder="E.g., Update margin on item #3 from 12% to 18%, add ISO 27001 compliance documentation, revise technical specifications for component X..."
                    value={changeRequest.whatChanges}
                    onChange={(e) => setChangeRequest({ ...changeRequest, whatChanges: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Why are these changes necessary? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none text-slate-800 text-sm"
                    placeholder="E.g., Current margin is below company threshold of 15%, client specifically requires ISO 27001 certification, technical specs don't match industry standards..."
                    value={changeRequest.why}
                    onChange={(e) => setChangeRequest({ ...changeRequest, why: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What will be the effect of these changes? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none text-slate-800 text-sm"
                    placeholder="E.g., Higher margin will improve profitability by $50k, compliance documentation will meet client requirements, updated specs will ensure compatibility..."
                    value={changeRequest.effect}
                    onChange={(e) => setChangeRequest({ ...changeRequest, effect: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    How does this matter for the RFP? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none text-slate-800 text-sm"
                    placeholder="E.g., Without these changes, the proposal may be rejected due to non-compliance, profitability targets won't be met, technical requirements won't be satisfied..."
                    value={changeRequest.howItMatters}
                    onChange={(e) => setChangeRequest({ ...changeRequest, howItMatters: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setChangeRequest({ whatChanges: '', why: '', effect: '', howItMatters: '' });
                }}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!changeRequest.whatChanges || !changeRequest.why || !changeRequest.effect || !changeRequest.howItMatters) {
                    alert('Please fill in all required fields.');
                    return;
                  }
                  
                  const newRequest = {
                    id: Date.now().toString(),
                    requestedBy: role || 'unknown',
                    timestamp: new Date().toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    ...changeRequest,
                    status: 'pending' as const,
                  };
                  
                  const updated = [...changeRequests, newRequest];
                  setChangeRequests(updated);
                  localStorage.setItem(`rfp-${id}-change-requests`, JSON.stringify(updated));
                  
                  alert('Change request sent! RFP is now in revision. Sales team and AI agent will review and make updates.');
                  setModalOpen(false);
                  setChangeRequest({ whatChanges: '', why: '', effect: '', howItMatters: '' });
                }}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm"
              >
                Send back for revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFPDetail;
