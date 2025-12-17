// src/pages/RFPDetail.tsx
import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockRFPs } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  Warning,
  FileText,
  X,
  Users,
  CurrencyInr,
  Clock,
  CheckCircle,
  PaperPlaneRight,
  ChatCircleDots,
  DownloadSimple,
} from '@phosphor-icons/react';

// --- MOCKED LOCAL DATA FOR DEMO (Asian Paints Context) ---

const matchedSkus = [
  { rfp_item_no: "1.01", matched_sku: "AP-WC-XLPE-1.1KV-4C-240SQMM", match_confidence: "98%", notes: "Exact match: 1.1kV, 4-Core, 240sqmm, Al Conductor" },
  { rfp_item_no: "1.02", matched_sku: "AP-WC-XLPE-1.1KV-4C-120SQMM", match_confidence: "95%", notes: "Standard variant matches RFP requirements." },
  { rfp_item_no: "2.01", matched_sku: "AP-WC-FRLS-1.1KV-3.5C-70SQMM", match_confidence: "92%", notes: "Proposed FRLS variant as per fire safety spec." },
  { rfp_item_no: "3.01", matched_sku: "AP-WC-CTRL-1.1KV-12C-2.5SQMM", match_confidence: "88%", notes: "Minor deviation: RFP asks for 'Armoured', quoting 'G.I. Wire Armoured'" }
];

const technicalConstraints = {
  applicable_standards: ["IS 7098 (Part-1)", "IS 8130:2013", "IS 5831:1984", "IEC 60332-1"],
  testing_requirements: ["Routine Test", "Type Test (Sample)", "Fire Resistance Test (FRLS)", "Oxygen Index Test"],
  specifications: [
    { component: "Conductor", parameter: "Material", value: "H2 Grade Aluminium", tolerance: "As per IS 8130" },
    { component: "Insulation", parameter: "Material", value: "XLPE (Cross Linked Polyethylene)", page_ref: "Pg 42" },
    { component: "Inner Sheath", parameter: "Type", value: "Extruded PVC Type ST2", page_ref: "Pg 43" },
    { component: "Armouring", parameter: "Material", value: "Galvanized Steel Flat Strip", page_ref: "Pg 44" },
    { component: "Outer Sheath", parameter: "Color", value: "Black (UV Resistant)", page_ref: "Pg 45" },
    { component: "Voltage Grade", parameter: "Rating", value: "1100 Volts", page_ref: "Pg 12" }
  ]
};

const billOfMaterials = [
  { rfp_item_no: "1.01", description: "1.1kV, 4C x 240 sqmm Al Ar. XLPE Cable", quantity: 15.5, unit: "km", category: "Power Cable" },
  { rfp_item_no: "1.02", description: "1.1kV, 4C x 120 sqmm Al Ar. XLPE Cable", quantity: 8.2, unit: "km", category: "Power Cable" },
  { rfp_item_no: "2.01", description: "1.1kV, 3.5C x 70 sqmm Al Ar. FRLS Cable", quantity: 12.0, unit: "km", category: "FRLS Power" },
  { rfp_item_no: "3.01", description: "1.1kV, 12C x 2.5 sqmm Cu Ar. Control Cable", quantity: 5.0, unit: "km", category: "Control Cable" },
  { rfp_item_no: "4.01", description: "Cable Termination Kits (Outdoor)", quantity: 150, unit: "nos", category: "Accessories" }
];

const finalBid = [
  { rfp_item_no: "1.01", sku: "AP-WC-XLPE-4C-240", base_price: 850000, transport_adj: 12000, margin_adj: 95000, final_unit_price: 957000 },
  { rfp_item_no: "1.02", sku: "AP-WC-XLPE-4C-120", base_price: 420000, transport_adj: 8000, margin_adj: 45000, final_unit_price: 473000 },
  { rfp_item_no: "2.01", sku: "AP-WC-FRLS-3.5C-70", base_price: 310000, transport_adj: 6500, margin_adj: 38000, final_unit_price: 354500 },
  { rfp_item_no: "3.01", sku: "AP-WC-CTRL-12C-2.5", base_price: 185000, transport_adj: 4000, margin_adj: 22000, final_unit_price: 211000 },
  { rfp_item_no: "4.01", sku: "AP-ACC-TERM-OUT", base_price: 2500, transport_adj: 50, margin_adj: 450, final_unit_price: 3000 }
];

const serviceCosts = [
  { item: "Type Test Charges (Sample)", cost: 45000, note: "Per lot at NABL lab" },
  { item: "Acceptance Testing (Factory)", cost: 15000, note: "Engineer per diem + travel" },
  { item: "Third Party Inspection (TPI)", cost: 12500, note: "0.5% of value (est)" },
  { item: "Freight & Transit Insurance", cost: 125000, note: "Lump sum for 3 trucks" }
];

const commercialLogistics = {
  incoterms: "FOR Destination (Project Site)",
  delivery_period_weeks: 12,
  payment_terms: "100% against receipt and acceptance",
  warranty_terms: "12 months from date of commissioning",
  insurance_responsibility: "Vendor Scope (Transit + Storage)",
  unloading_responsibility: "Vendor Scope",
  packing_requirements: "Wooden Drums (Non-returnable)",
  taxes_and_duties: "GST Extra as applicable (18%)",
  currency: "INR",
  liquidated_damages: {
    rate_per_week: "0.5%",
    max_cap: "10% of undelivered value"
  },
  financial_instruments: {
    performance_bank_guarantee: "3% of Contract Value",
    security_deposit: "Not Applicable"
  }
};

const complianceEligibilityMd = "\n- [ ] Class-I Local Supplier (>= 50% Local Content)\n- [ ] Valid BIS License for IS:7098 (Part-1)\n- [ ] Type Test Reports (NABL Accredited Lab) < 5 Yrs\n- [ ] Average Annual Turnover > ₹ 50 Cr (Last 3 FY)\n- [ ] Past Performance: 20% of Qty supplied in one order\n- [ ] Non-Blacklisting Declaration\n";

const RFPDetail = () => {
  const { id } = useParams();
  const { role } = useAuth();

  const rfp = useMemo(
    () => mockRFPs.find((r) => String(r.id) === String(id)),
    [id]
  );

  const [activeTab, setActiveTab] = useState<'summary' | 'tech' | 'pricing' | 'compliance'>('summary');
  const [salesNotes, setSalesNotes] = useState(rfp?.salesNotes || '');
  const [isModalOpen, setModalOpen] = useState(false);
  const [changeRequest, setChangeRequest] = useState({
    whatChanges: '',
    why: '',
    effect: '',
    howItMatters: '',
  });

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

  const isInRevision = changeRequests.some(req => req.status === 'pending');

  const loadComments = (key: string) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveComments = (key: string, comments: Array<{ id: string; text: string; timestamp: string }>) => {
    try {
      localStorage.setItem(key, JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comments:', error);
    }
  };

  const [techComments, setTechComments] = useState<Array<{ id: string; text: string; timestamp: string }>>(() =>
    loadComments(`rfp-${id}-tech-comments`)
  );
  const [pricingComments, setPricingComments] = useState<Array<{ id: string; text: string; timestamp: string }>>(() =>
    loadComments(`rfp-${id}-pricing-comments`)
  );
  const [newTechComment, setNewTechComment] = useState('');
  const [newPricingComment, setNewPricingComment] = useState('');

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

  // --- DYNAMIC SUMMARY LOGIC BASED ON CLIENT ---

  const getSummaryContent = (clientName: string) => {
    if (clientName === 'SDSC SHAR') {
      return {
        summary: `This RFP from SDSC SHAR (Satish Dhawan Space Centre) involves the supply of Armoured PIJF Copper Cables (10P, 20P, 50P, 100P) and PVC Switch Board Cables. The tender operates on a Two-Part Bid system via the GeM portal. SwiftBid AI has identified key compliance requirements including 'Make in India' (Class-I Supplier >50% local content) and a strict 8-week delivery schedule. The AI has mapped the PIJF specs to our 'Telecom-Grade' copper cable inventory with high confidence.`,
        techNotes: `Technical validation complete. The requested PIJF cables match our 'Polythene Insulated Jelly Filled' series. Compliance with Department of Space quality standards is mandatory. Deviation: RFP requests 8-week delivery; standard lead time is 10 weeks - flagged for sales negotiation.`,
        pricingNotes: `Pricing calibrated for Government e-Marketplace (GeM) competitiveness. Base rates indexed to Copper (LME). Added 2% buffer for 'Space Centre' specific packaging/inspection requirements. Liquidated damages risk (0.5%/week) factored into risk margin.`,
        profitMargin: '12.5% (Govt Rate)'
      };
    }
    // Default / Other clients
    return {
      summary: `This RFP from ${rfp.client} for "${rfp.title}" aligns with our core industrial cable offerings. SwiftBid AI parsed the BOQ and technical specs, mapping them to our 'Royale' and 'Apex' series. A draft proposal is ready with standard commercial terms.`,
      techNotes: `Spec mapping verified. Standard IS:7098 (XLPE) and IS:1554 (PVC) standards apply. No major deviations found.`,
      pricingNotes: `Standard commercial pricing applied. Logistics cost estimated for site delivery.`,
      profitMargin: '15.0% (Standard)'
    };
  };

  const content = getSummaryContent(rfp.client);

  const competitorIntel = useMemo(() => {
    const presets: Record<
      string,
      {
        knownCompetitors: Array<{ name: string; winRate: number }>;
        strengths: string[];
        gaps: string[];
      }
    > = {
      'SDSC SHAR': {
        knownCompetitors: [
          { name: 'Finolex Cables', winRate: 65 },
          { name: 'Delton Cables', winRate: 58 },
          { name: 'Paramount Comm', winRate: 52 },
        ],
        strengths: ['OEM Status for PIJF Cables', 'Class-I Local Supplier Cert', 'Past performance with ISRO units'],
        gaps: ['Delivery timeline (8 weeks) is tight', 'Strict LD clauses'],
      },
      default: {
        knownCompetitors: [
          { name: 'Polycab', winRate: 62 },
          { name: 'Havells', winRate: 55 },
          { name: 'KEI Industries', winRate: 48 },
        ],
        strengths: ['Superior lead time', 'In-house compound manufacturing'],
        gaps: ['Higher logistics cost', 'Pending approval for specific joints'],
      },
    };

    const picked = presets[rfp.client] ?? presets.default;
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
      'SDSC SHAR': {
        history: [
          { year: '2023', deal: 'Fiber Optic Supply', outcome: 'won', value: '₹ 1.2 Cr' },
          { year: '2022', deal: 'Power Cabling Ph-2', outcome: 'lost', value: '₹ 3.5 Cr' },
          { year: '2021', deal: 'Instrumentation AMC', outcome: 'won', value: '₹ 0.8 Cr' },
        ],
        decisionMakers: [
          { name: 'Head (Purchase)', role: 'Procurement', preference: 'GeM Compliance & L1 Price' },
          { name: 'Dy. Manager (Telecom)', role: 'Technical', preference: 'Quality & OEM Certification' },
        ],
        painPoints: ['Delayed deliveries in past contracts', 'Non-compliance with "Make in India"'],
        buyingCriteria: ['Class-I Local Supplier', 'Acceptance of GeM Terms', 'PBG Submission'],
      },
      default: {
        history: [
          { year: '2024', deal: 'Phase 1 Cabling', outcome: 'won', value: '₹ 8.5 Cr' },
          { year: '2023', deal: 'Control Wiring', outcome: 'lost', value: '₹ 2.1 Cr' },
        ],
        decisionMakers: [
          { name: 'Project Director', role: 'Technical', preference: 'Adherence to delivery schedule' },
          { name: 'Procurement Head', role: 'Commercial', preference: 'Total Cost of Ownership (L1)' },
        ],
        painPoints: ['Past delays', 'Quality inspection failures'],
        buyingCriteria: ['Valid BIS Licenses', 'Type Test Reports'],
      },
    };

    const picked = presets[rfp.client] ?? presets.default;
    const winRate =
      picked.history.filter((h) => h.outcome === 'won').length / Math.max(picked.history.length, 1);

    return {
      ...picked,
      historicalWinRate: Math.round(winRate * 100),
    };
  }, [rfp.client]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const eligibilityChecklist = useMemo(() => {
    return complianceEligibilityMd
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- ['))
      .slice(0, 6);
  }, []);

  const bomSummary = useMemo(() => {
    const totalLines = billOfMaterials.length;
    const totalQty = billOfMaterials.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return { totalLines, totalQty };
  }, []);

  const processTimeline = [
    {
      label: 'RFP Ingested',
      time: 'Day 0 · 09:00',
      description: 'Sales Agent identified tender via GeM Portal scan.',
      type: 'system',
    },
    {
      label: 'AI Parsing & Mapping',
      time: 'Day 0 · 09:05',
      description:
        'Technical Agent extracted PIJF specs and matched against Telecom Cable catalog.',
      type: 'system',
    },
    {
      label: 'Technical Review',
      time: 'Day 0 · 10:30',
      description:
        'Tech Engineer validated 8-week delivery feasibility and copper grades.',
      type: 'tech',
    },
    {
      label: 'Pricing Strategy',
      time: 'Day 0 · 14:00',
      description:
        'Pricing Agent applied Govt Rate Card margins and calculated LD risks.',
      type: 'pricing',
    },
    {
      label: 'Final Approval',
      time: 'Day 1 · 10:00',
      description:
        'Sales Manager reviewing final commercial bid for GeM submission.',
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
                <Warning size={18} weight="duotone" />
                <span>{rfp.deadline} (4 days left)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-medium text-slate-500 uppercase mb-1">
                Source
              </h3>
              <div className="flex items-center gap-2 text-slate-700">
                <FileText size={18} weight="duotone" />
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
                    {content.profitMargin}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Spec match score</span>
                  <span className="font-semibold text-slate-800">
                    {(rfp as any).specMatch || '94%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Exceptions</span>
                  <span className="font-semibold text-slate-800">
                    {(rfp as any).exceptions ?? '1 (approved)'}
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
                    window.open(`/docs/${rfp.id}/original-rfp.pdf`, '_blank', 'noopener');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-sm font-medium text-slate-700"
                >
                  <FileText size={16} weight="duotone" className="text-slate-600" />
                  <span className="flex-1 text-left">Original Tender PDF</span>
                  <DownloadSimple size={14} weight="duotone" className="text-slate-500" />
                </button>
                <button
                  onClick={() => {
                    window.open(`/docs/${rfp.id}/final-solution.pdf`, '_blank', 'noopener');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors text-sm font-medium text-indigo-700"
                >
                  <FileText size={16} weight="duotone" className="text-indigo-600" />
                  <span className="flex-1 text-left">Price Bid (Annex-VI)</span>
                  <DownloadSimple size={14} weight="duotone" className="text-indigo-500" />
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
              className={`px-6 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${activeTab === 'summary'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`px-6 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${activeTab === 'tech'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
            >
              Tech Match
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-6 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${activeTab === 'pricing'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
            >
              Pricing
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-6 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${activeTab === 'compliance'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
            >
              Compliance & Logistics
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
                      <FileText size={18} weight="duotone" className="text-slate-500" />
                      AI Executive Summary
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 uppercase">
                      Sales view
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm mb-3">{content.summary}</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1.5 text-sm">
                    <li>High technical match score for PIJF and PVC copper cables.</li>
                    <li>Key risks: 8-week delivery timeline and 0.5%/week LD clause.</li>
                    <li>
                      Price positioning reflects 'Make in India' preference benefits.
                    </li>
                  </ul>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        window.open(`/docs/${rfp.id}/executive-summary.pdf`, '_blank', 'noopener');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <DownloadSimple size={14} weight="duotone" />
                      Executive Summary PDF
                    </button>
                  </div>
                </div>


                {/* Competitive Intelligence */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={18} weight="duotone" className="text-slate-500" />
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
                      <Users size={18} weight="duotone" className="text-slate-500" />
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
                              className={`text-[11px] px-2 py-0.5 rounded-full ${item.outcome === 'won'
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
                      <Warning size={20} weight="duotone" className="text-red-600" />
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

            {/* TECHTAB */}
            {activeTab === 'tech' && (
              <>
                {/* Show change requests made by tech team */}
                {isTech && changeRequests.filter(r => r.requestedBy === 'tech').length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Warning size={18} weight="duotone" className="text-purple-600" />
                      Your Change Requests
                    </h3>
                    {changeRequests.filter(r => r.requestedBy === 'tech').map((request) => (
                      <div key={request.id} className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-900">
                            Requested on {request.timestamp}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
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
                    <Users size={16} weight="duotone" className="text-slate-500" />
                    Technical review & changes
                  </h3>
                  <p className="text-sm text-slate-700 mb-3">{content.techNotes}</p>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• Spec-to-SKU match score: {(rfp as any).specMatch || '94%'}
                    </li>
                    <li>
                      • Exceptions handled:{' '}
                      {(rfp as any).exceptions ?? '1 (approved with alternate)'}
                    </li>
                    <li>• Type Test reports attached in Annexure-IV.</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={16} weight="duotone" className="text-slate-500" />
                      SKU Matching (AI mapped)
                    </h3>
                    <span className="text-xs text-slate-500">Source: 06_matched_skus.json</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-slate-500">
                          <th className="py-2 pr-4">RFP Item</th>
                          <th className="py-2 pr-4">Matched SKU</th>
                          <th className="py-2 pr-4">Confidence</th>
                          <th className="py-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {matchedSkus.map((row) => (
                          <tr key={row.rfp_item_no} className="align-top">
                            <td className="py-2 pr-4 font-semibold text-slate-900">#{row.rfp_item_no}</td>
                            <td className="py-2 pr-4 text-slate-800">{row.matched_sku}</td>
                            <td className="py-2 pr-4">
                              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                                {row.match_confidence}
                              </span>
                            </td>
                            <td className="py-2 text-slate-700 text-xs">{row.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={16} weight="duotone" className="text-slate-500" />
                      Key Technical Constraints
                    </h3>
                    <span className="text-xs text-slate-500">Source: 03_technical_constraints.json</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Applicable standards</p>
                      <ul className="list-disc list-inside space-y-1">
                        {technicalConstraints.applicable_standards.slice(0, 5).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Testing requirements</p>
                      <ul className="list-disc list-inside space-y-1">
                        {technicalConstraints.testing_requirements.slice(0, 5).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-slate-500">
                          <th className="py-2 pr-4">Component</th>
                          <th className="py-2 pr-4">Parameter</th>
                          <th className="py-2 pr-4">Value</th>
                          <th className="py-2">Ref</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {technicalConstraints.specifications.slice(0, 6).map((spec, idx) => (
                          <tr key={`${spec.component}-${idx}`} className="align-top">
                            <td className="py-2 pr-4 font-semibold text-slate-900">{spec.component}</td>
                            <td className="py-2 pr-4 text-slate-800">{spec.parameter}</td>
                            <td className="py-2 pr-4 text-slate-700">
                              {spec.value}
                              {spec.tolerance ? ` (${spec.tolerance})` : ''}
                            </td>
                            <td className="py-2 text-slate-500 text-xs">{spec.page_ref}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Comments section for Tech team (Sales Manager can send, Tech team can view) */}
                {(isSales || isTech) && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <ChatCircleDots size={18} weight="duotone" className="text-purple-600" />
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
                          placeholder="E.g., Please confirm if we can supply the 'Outdoor' termination kits or if we need to outsource..."
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
                          <PaperPlaneRight size={16} weight="duotone" />
                          Send to Tech Team
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* PRICINGTAB */}
            {activeTab === 'pricing' && (
              <>
                {/* Show change requests made by pricing team */}
                {isPricing && changeRequests.filter(r => r.requestedBy === 'pricing').length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500 mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Warning size={18} weight="duotone" className="text-amber-600" />
                      Your Change Requests
                    </h3>
                    {changeRequests.filter(r => r.requestedBy === 'pricing').map((request) => (
                      <div key={request.id} className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-semibold text-slate-900">
                            Requested on {request.timestamp}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
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
                    <CurrencyInr size={16} weight="duotone" className="text-slate-500" />
                    Pricing & margin decision
                  </h3>
                  <p className="text-sm text-slate-700 mb-3">{content.pricingNotes}</p>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li>• Target margin: {content.profitMargin}
                    </li>
                    <li>
                      • Risk buffer: {(rfp as any).riskBuffer || '2.5%'} for metal price volatility.
                    </li>
                    <li>• Competitively priced to win against Polycab and Havells benchmarks.</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={16} weight="duotone" className="text-slate-500" />
                      Bill of Materials
                    </h3>
                    <span className="text-xs text-slate-500">Source: 02_bill_of_materials.json</span>
                  </div>
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Line items: {bomSummary.totalLines}</p>
                    <p>Total quantity: {bomSummary.totalQty.toFixed(1)} units/km</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-slate-500">
                          <th className="py-2 pr-4">RFP Item</th>
                          <th className="py-2 pr-4">Description</th>
                          <th className="py-2 pr-4">Qty</th>
                          <th className="py-2 pr-4">Unit</th>
                          <th className="py-2">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billOfMaterials.map((row) => (
                          <tr key={row.rfp_item_no} className="align-top">
                            <td className="py-2 pr-4 font-semibold text-slate-900">#{row.rfp_item_no}</td>
                            <td className="py-2 pr-4 text-slate-800">{row.description}</td>
                            <td className="py-2 pr-4 text-slate-800">{row.quantity}</td>
                            <td className="py-2 pr-4 text-slate-800">{row.unit}</td>
                            <td className="py-2 text-slate-700 text-xs">{row.category}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={16} weight="duotone" className="text-slate-500" />
                      Final Bid (unit pricing)
                    </h3>
                    <span className="text-xs text-slate-500">Source: 07_final_bid.json</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-slate-500">
                          <th className="py-2 pr-4">RFP Item</th>
                          <th className="py-2 pr-4">SKU</th>
                          <th className="py-2 pr-4">Base (₹)</th>
                          <th className="py-2 pr-4">Transport</th>
                          <th className="py-2 pr-4">Margin Adj</th>
                          <th className="py-2">Final Unit (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {finalBid.map((row) => (
                          <tr key={row.rfp_item_no} className="align-top">
                            <td className="py-2 pr-4 font-semibold text-slate-900">#{row.rfp_item_no}</td>
                            <td className="py-2 pr-4 text-slate-800">{row.sku}</td>
                            <td className="py-2 pr-4 text-slate-800">{formatCurrency(row.base_price)}</td>
                            <td className="py-2 pr-4 text-slate-800">{formatCurrency(row.transport_adj)}</td>
                            <td className="py-2 pr-4 text-slate-800">{formatCurrency(row.margin_adj)}</td>
                            <td className="py-2 text-slate-900 font-semibold">{formatCurrency(row.final_unit_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Service & Testing Costs Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={16} weight="duotone" className="text-slate-500" />
                      Service & Testing Costs
                    </h3>
                    <span className="text-xs text-slate-500">Additional to Material Cost</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-slate-500">
                          <th className="py-2 pr-4">Service Item</th>
                          <th className="py-2 pr-4">Cost (₹)</th>
                          <th className="py-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {serviceCosts.map((row) => (
                          <tr key={row.item} className="align-top">
                            <td className="py-2 pr-4 font-medium text-slate-900">{row.item}</td>
                            <td className="py-2 pr-4 text-slate-800">{formatCurrency(row.cost)}</td>
                            <td className="py-2 text-slate-600 text-xs">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Comments section for Pricing team (Sales Manager can send, Pricing team can view) */}
                {(isSales || isPricing) && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <ChatCircleDots size={18} weight="duotone" className="text-amber-600" />
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
                          placeholder="E.g., Competitor Y is known to underbid on logistics. Can we tighten our transport assumptions?"
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
                          <PaperPlaneRight size={16} weight="duotone" />
                          Send to Pricing Team
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* COMPLIANCE TAB */}
            {activeTab === 'compliance' && (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={18} weight="duotone" className="text-amber-500" />
                      Compliance & Logistics
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                      Status: {rfp.riskFlag ? 'Pending Clarifications' : 'Compliant'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Key commercial terms</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Incoterm: {commercialLogistics.incoterms}</li>
                        <li>Delivery period: {commercialLogistics.delivery_period_weeks} weeks</li>
                        <li>Payment: {commercialLogistics.payment_terms}</li>
                        <li>Warranty: {commercialLogistics.warranty_terms}</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Risk & responsibilities</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Insurance: {commercialLogistics.insurance_responsibility}</li>
                        <li>Unloading: {commercialLogistics.unloading_responsibility}</li>
                        <li>Packing: {commercialLogistics.packing_requirements}</li>
                        <li>Taxes/Duties: {commercialLogistics.taxes_and_duties}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase text-slate-500">
                          <th className="py-2 pr-4">Item</th>
                          <th className="py-2 pr-4">Details</th>
                          <th className="py-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-slate-900">Currency</td>
                          <td className="py-2 pr-4 text-slate-800">{commercialLogistics.currency}</td>
                          <td className="py-2 text-slate-600 text-xs">Bid submission currency</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-slate-900">Liquidated damages</td>
                          <td className="py-2 pr-4 text-slate-800">
                            {commercialLogistics.liquidated_damages.rate_per_week} (cap {commercialLogistics.liquidated_damages.max_cap})
                          </td>
                          <td className="py-2 text-slate-600 text-xs">Applies to undelivered items</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-slate-900">PBG</td>
                          <td className="py-2 pr-4 text-slate-800">{commercialLogistics.financial_instruments.performance_bank_guarantee}</td>
                          <td className="py-2 text-slate-600 text-xs">Valid through warranty + grace</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-semibold text-slate-900">Security deposit</td>
                          <td className="py-2 pr-4 text-slate-800">{commercialLogistics.financial_instruments.security_deposit}</td>
                          <td className="py-2 text-slate-600 text-xs">Held to contractual completion</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
                    <p className="text-xs font-semibold uppercase mb-1">Eligibility checklist (from 05_compliance_eligibility.md)</p>
                    <ul className="list-disc list-inside space-y-1">
                      {eligibilityChecklist.map((item) => (
                        <li key={item}>{item.replace('- [ ]', '').trim()}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => window.open(`/docs/${rfp.id}/logistics.md`, '_blank', 'noopener')}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      <DownloadSimple size={14} weight="duotone" />
                      Download logistics.md
                    </button>
                    <button
                      onClick={() => window.open(`/docs/${rfp.id}/eligibility.md`, '_blank', 'noopener')}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      <DownloadSimple size={14} weight="duotone" />
                      Download eligibility.md
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline: full journey of this RFP (only visible in Summary tab) */}
            {activeTab === 'summary' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} weight="duotone" className="text-slate-500" />
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
                          <CheckCircle size={16} weight="duotone" className="text-emerald-600" />
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
                <Warning size={16} weight="duotone" className="inline mr-1" />
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
                <X size={22} weight="duotone" />
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