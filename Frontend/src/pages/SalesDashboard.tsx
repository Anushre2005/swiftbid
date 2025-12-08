import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRFPs } from '../data/mockData';
import StageProgressBar from '../components/shared/StageProgressBar';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  ListFilter,
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'highValue' | 'closingSoon'>('all');
  const [stageFilter, setStageFilter] = useState<'all' | RFPStage>('all');
  const [valueRange, setValueRange] = useState<'all' | 'lt1' | '1to3' | 'gt3'>('all');
  const [urgency, setUrgency] = useState<'all' | 'soon' | 'month'>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high'>('all');
  const navigate = useNavigate();

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

  const totalPipelineValue = useMemo(() => {
    return activeRFPs.reduce((sum, rfp) => {
      const value = parseFloat(rfp.value.replace(/[^0-9.]/g, '')) || 0;
      return sum + value;
    }, 0) / 1000; // Convert to millions
  }, [activeRFPs]);

  const activeRFPsCount = activeRFPs.length;

  const filteredRFPs = useMemo(() => {
    let data = activeRFPs;

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
        const numeric = parseFloat(String(rfp.value).replace(/[^0-9.]/g, '')) || 0;
        return numeric >= 5;
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
        const numeric = parseFloat(String(rfp.value).replace(/[^0-9.]/g, '')) || 0;
        if (valueRange === 'lt1') return numeric < 1;
        if (valueRange === '1to3') return numeric >= 1 && numeric <= 3;
        return numeric > 3;
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

    return data;
  }, [searchTerm, filter, activeRFPs, stageFilter, valueRange, urgency, ownerFilter, riskFilter]);

  const approachingDeadline = filteredRFPs.filter(rfp => daysUntil(rfp.deadlineDate) <= 7).length;
  const missingCompliance = filteredRFPs.filter(rfp => rfp.riskFlag).length;

  return (
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
  );
};

export default SalesDashboard;
