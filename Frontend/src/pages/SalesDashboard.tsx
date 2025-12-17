import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRFPs } from '../data/mockData';
import StageProgressBar from '../components/shared/StageProgressBar';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  ListFilter,
  Sparkles,
  Target,
} from 'lucide-react';
import { ChatbotPopup, FloatingChatbotButton } from './SpecialistInbox';
import type { UserRole, RFPStage } from '../types';

// Get status badge color
const getStatusBadge = (waitingOn: UserRole | 'completed') => {
  if (waitingOn === 'completed') {
    return 'bg-green-100 text-green-800';
  } else if (waitingOn === 'sales') {
    return 'bg-blue-100 text-blue-800';
  } else if (waitingOn === 'tech') {
    return 'bg-purple-100 text-purple-800';
  } else if (waitingOn === 'pricing') {
    return 'bg-amber-100 text-amber-800';
  }
  return 'bg-slate-100 text-slate-800';
};

const getStatusText = (waitingOn: UserRole | 'completed') => {
  if (waitingOn === 'completed') {
    return 'Completed';
  } else if (waitingOn === 'sales') {
    return 'Waiting on Sales';
  } else if (waitingOn === 'tech') {
    return 'Waiting on Tech';
  } else if (waitingOn === 'pricing') {
    return 'Waiting on Pricing';
  }
  return 'In Progress';
};

const SalesDashboard = () => {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'highValue' | 'closingSoon'>('all');
  const [stageFilter, setStageFilter] = useState<'all' | RFPStage>('all');
  const [valueRange, setValueRange] = useState<'all' | 'lt1' | '1to3' | 'gt3'>('all');
  const [urgency, setUrgency] = useState<'all' | 'soon' | 'month'>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high'>('all');
  const [focusFilter, setFocusFilter] = useState<'all' | 'quickWins' | 'strategicBets'>('all');
  const navigate = useNavigate();

  const winProbabilityByStage: Record<RFPStage, number> = {
    Discovery: 0.35,
    Tech: 0.55,
    Pricing: 0.65,
    Approval: 0.72,
    Final: 0.82,
  };

  const parseValueToMillions = (value: string) => {
    const numeric = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    return numeric >= 100 ? numeric / 1000 : numeric; // handle K vs M notations
  };

  const activeRFPs = useMemo(() => {
    return mockRFPs.filter((rfp) => {
      const rfpStatus = rfp.status || (rfp.waitingOn === 'completed' ? 'completed' : 'active');
      return rfpStatus === 'active';
    });
  }, []);

  const owners = useMemo(
    () => Array.from(new Set(activeRFPs.map((rfp) => rfp.owner).filter(Boolean))) as string[],
    [activeRFPs]
  );

  const daysUntil = (dateString?: string) => {
    const today = new Date();
    const target = dateString ? new Date(dateString) : null;
    if (!target || Number.isNaN(target.getTime())) return Number.POSITIVE_INFINITY;
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const computedRFPs = useMemo(() => {
    const maxValue = Math.max(
      ...activeRFPs.map((rfp) => parseValueToMillions(rfp.value)),
      1
    );

    return activeRFPs.map((rfp) => {
      const days = daysUntil(rfp.deadlineDate);
      const dealSize = parseValueToMillions(rfp.value);
      const dealSizeScore = Math.min(dealSize / maxValue, 1);
      const urgencyScore = Math.max(0, Math.min(1, (30 - Math.min(days, 30)) / 30));
      const winProbability = winProbabilityByStage[rfp.currentStage] ?? 0.5;
      const strategicImportance = Math.min(1, dealSizeScore * 0.6 + (rfp.riskFlag ? 0.4 : 0.2));
      const priorityScore = Math.round(
        (urgencyScore * 0.3 + dealSizeScore * 0.3 + winProbability * 0.25 + strategicImportance * 0.15) *
          100
      );

      const quickWin =
        winProbability >= 0.65 &&
        days <= 21 &&
        dealSize <= 3 &&
        !rfp.riskFlag;

      const strategicBet =
        dealSize >= 3 &&
        (rfp.riskFlag || winProbability < 0.65) &&
        days <= 45;

      return {
        ...rfp,
        priorityScore,
        daysUntilDeadline: days,
        winProbability,
        dealSize,
        quickWin,
        strategicBet,
      };
    });
  }, [activeRFPs]);

  const totalPipelineValue = useMemo(() => {
    return computedRFPs.reduce((sum, rfp) => sum + rfp.dealSize, 0);
  }, [computedRFPs]);

  const activeRFPsCount = activeRFPs.length;

  const filteredRFPs = useMemo(() => {
    let data = computedRFPs;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (rfp) =>
          rfp.client.toLowerCase().includes(term) ||
          rfp.title.toLowerCase().includes(term)
      );
    }

    if (filter === 'highValue') {
      data = data.filter((rfp) => {
        return rfp.dealSize >= 5;
      });
    }

    if (filter === 'closingSoon') {
      data = data.slice(0, 3);
    }

    if (stageFilter !== 'all') {
      data = data.filter(rfp => rfp.currentStage === stageFilter);
    }

    if (valueRange !== 'all') {
      data = data.filter(rfp => {
        if (valueRange === 'lt1') return rfp.dealSize < 1;
        if (valueRange === '1to3') return rfp.dealSize >= 1 && rfp.dealSize <= 3;
        return rfp.dealSize > 3;
      });
    }

    if (urgency !== 'all') {
      data = data.filter(rfp => {
        const days = daysUntil(rfp.deadlineDate);
        if (urgency === 'soon') return days <= 7;
        return days <= 30;
      });
    }

    if (ownerFilter !== 'all') {
      data = data.filter(rfp => rfp.owner === ownerFilter);
    }

    if (riskFilter === 'high') {
      data = data.filter(rfp => rfp.riskFlag);
    }

    if (focusFilter === 'quickWins') {
      data = data.filter((rfp) => rfp.quickWin);
    } else if (focusFilter === 'strategicBets') {
      data = data.filter((rfp) => rfp.strategicBet);
    }

    data = data.sort((a, b) => b.priorityScore - a.priorityScore || a.daysUntilDeadline - b.daysUntilDeadline);

    return data;
  }, [searchTerm, filter, computedRFPs, stageFilter, valueRange, urgency, ownerFilter, riskFilter, focusFilter]);

  const approachingDeadline = filteredRFPs.filter(rfp => daysUntil(rfp.deadlineDate) <= 7).length;
  const missingCompliance = filteredRFPs.filter(rfp => rfp.riskFlag).length;

  const recommendedToday = useMemo(() => {
    return filteredRFPs
      .filter((rfp) => rfp.daysUntilDeadline <= 14 || rfp.quickWin)
      .slice(0, 3);
  }, [filteredRFPs]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-10 sm:mb-12">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Sales Pipeline Overview
                </h1>
                <p className="text-sm sm:text-base text-slate-500">
                  Monitor active RFPs, track progress, and manage conversion.
                </p>
              </div>
            </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-md shadow-slate-100 border border-slate-200 flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-slate-600 uppercase">Active RFPs</h3>
              <Activity size={20} className="text-indigo-600" />
            </div>
            <p className="text-3xl font-bold">{activeRFPsCount}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md shadow-slate-100 border border-slate-200 flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-slate-600 uppercase">Pipeline Value</h3>
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-bold">${totalPipelineValue.toFixed(1)}M</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md shadow-slate-100 border border-slate-200 flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-slate-600 uppercase">Win Rate</h3>
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold">68%</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md shadow-slate-100 border border-slate-200 flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-slate-600 uppercase">Avg Response Time</h3>
              <Clock size={20} className="text-amber-600" />
            </div>
            <p className="text-3xl font-bold">4 Days</p>
          </div>
        </div>
            <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-start gap-3">
                <div className="mt-1 rounded-lg bg-slate-100 p-2 text-slate-600">
                  <ListFilter size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{filteredRFPs.length} Opportunities</span>
                  <span className="text-xs text-slate-500 mt-1">Sorted by deadline</span>
                </div>
              </div>

          <div className="px-6 py-4 flex flex-wrap items-center gap-3 bg-slate-50 border-b border-slate-200">
            <select
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-teal-200 focus:outline-none"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as typeof stageFilter)}
            >
              <option value="all">All stages</option>
              <option value="Discovery">Discovery</option>
              <option value="Tech">Tech</option>
              <option value="Pricing">Pricing</option>
              <option value="Approval">Approval</option>
              <option value="Final">Final</option>
            </select>

            <select
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-teal-200 focus:outline-none"
              value={valueRange}
              onChange={(e) => setValueRange(e.target.value as typeof valueRange)}
            >
              <option value="all">All values</option>
              <option value="lt1">&lt; $1M</option>
              <option value="1to3">$1M - $3M</option>
              <option value="gt3">&gt; $3M</option>
            </select>

            <select
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-teal-200 focus:outline-none"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as typeof urgency)}
            >
              <option value="all">Any deadline</option>
              <option value="soon">Due in 7 days</option>
              <option value="month">Due in 30 days</option>
            </select>

            <select
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-teal-200 focus:outline-none"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value as typeof ownerFilter)}
            >
              <option value="all">All owners</option>
              {owners.map((owner) => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>

            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setFocusFilter('quickWins')}
                className={`text-sm px-3 py-2 rounded-lg border transition duration-150 active:scale-[0.99] ${
                  focusFilter === 'quickWins'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200'
                }`}
              >
                Quick Wins
              </button>
              <button
                type="button"
                onClick={() => setFocusFilter('strategicBets')}
                className={`text-sm px-3 py-2 rounded-lg border transition duration-150 active:scale-[0.99] ${
                  focusFilter === 'strategicBets'
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
                }`}
              >
                Strategic Bets
              </button>
              <button
                type="button"
                onClick={() => setFocusFilter('all')}
                className={`text-sm px-3 py-2 rounded-lg border transition duration-150 active:scale-[0.99] ${
                  focusFilter === 'all'
                    ? 'bg-slate-100 text-slate-800 border-slate-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Reset
              </button>
            </div>

            <button
              type="button"
              onClick={() => setRiskFilter(riskFilter === 'high' ? 'all' : 'high')}
              className={`text-sm px-3 py-2 rounded-lg border transition duration-150 active:scale-[0.99] ${
                riskFilter === 'high'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-200'
              }`}
            >
              {riskFilter === 'high' ? 'High risk only' : 'Include risk'}
            </button>
          </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        RFP Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Priority Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {filteredRFPs.map((rfp) => (
                      <tr
                        key={rfp.id}
                        onClick={() => navigate(`/rfp/${rfp.id}`)}
                        className="bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5 transition duration-200 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-navy-900">
                          {rfp.client}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {rfp.title}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                          {rfp.value}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400"
                                style={{ width: `${Math.min(rfp.priorityScore, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{rfp.priorityScore}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {rfp.quickWin ? 'Quick Win' : rfp.strategicBet ? 'Strategic Bet' : 'Balanced'}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-amber-600" />
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {rfp.deadline}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <StageProgressBar currentStage={rfp.currentStage} />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(rfp.waitingOn)}`}>
                            {getStatusText(rfp.waitingOn)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl shadow-sm p-4 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"></span>
              <p className="text-sm font-semibold text-slate-800">Smart Insights</p>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-sky-600" />
                  <p className="font-semibold text-sky-700">Recommended Action (today)</p>
                </div>
                {recommendedToday.length === 0 ? (
                  <p className="text-xs text-slate-600">No urgent items. Focus on pipeline hygiene.</p>
                ) : (
                  <ul className="space-y-2">
                    {recommendedToday.map((rfp) => (
                      <li key={rfp.id} className="bg-white border border-slate-200 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-800">{rfp.client}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            {rfp.priorityScore} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{rfp.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <Target size={12} />
                          <span>{rfp.quickWin ? 'Quick Win' : 'Strategic Bet'}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                            due in {rfp.daysUntilDeadline === Number.POSITIVE_INFINITY ? '∞' : `${rfp.daysUntilDeadline}d`}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="font-semibold text-emerald-700">{missingCompliance} RFPs flagged</p>
                <p className="text-xs text-emerald-800 mt-1">Missing compliance or marked high risk.</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="font-semibold text-amber-700">{approachingDeadline} approaching deadline</p>
                <p className="text-xs text-amber-800 mt-1">Due within the next 7 days.</p>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                <p className="font-semibold text-indigo-700">Suggested discount strategy</p>
                <p className="text-xs text-indigo-800 mt-1">Based on competitor benchmarks and deal size.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      </div>
      {!chatbotOpen && <FloatingChatbotButton onClick={() => setChatbotOpen(true)} />}
      <ChatbotPopup open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  );
};

export default SalesDashboard;
