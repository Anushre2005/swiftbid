import { useMemo, useState } from 'react';
import { mockRFPs } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import StageProgressBar from '../components/shared/StageProgressBar';
import { Clock, DollarSign, Activity, CheckCircle2, ListFilter } from 'lucide-react';
import type { RFPStage, UserRole } from '../types';

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const [stageFilter, setStageFilter] = useState<'all' | RFPStage>('all');
  const [valueRange, setValueRange] = useState<'all' | 'lt1' | '1to3' | 'gt3'>('all');
  const [urgency, setUrgency] = useState<'all' | 'soon' | 'month'>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high'>('all');
  
  const totalPipelineValue = mockRFPs.reduce((sum, rfp) => {
    const value = parseFloat(rfp.value.replace(/[^0-9.]/g, '')) || 0;
    return sum + value;
  }, 0);
  
  const activeRFPsCount = mockRFPs.length;
  const completedCount = mockRFPs.filter(rfp => rfp.waitingOn === 'completed').length;
  const inProgressCount = mockRFPs.filter(rfp => rfp.waitingOn !== 'completed').length;
  
  const byStage: Record<RFPStage, number> = {
    'Discovery': 0,
    'Tech': 0,
    'Pricing': 0,
    'Approval': 0,
    'Final': 0,
  };
  
  mockRFPs.forEach(rfp => {
    byStage[rfp.currentStage]++;
  });

  const owners = useMemo(() => Array.from(new Set(mockRFPs.map(rfp => rfp.owner))), []);

  const daysUntil = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredRFPs = useMemo(() => {
    let data = mockRFPs;

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
  }, [stageFilter, valueRange, urgency, ownerFilter, riskFilter]);

  const approachingDeadline = filteredRFPs.filter(rfp => daysUntil(rfp.deadlineDate) <= 7).length;
  const missingCompliance = filteredRFPs.filter(rfp => rfp.riskFlag).length;

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

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
      <div className="mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">Executive Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-600">Complete overview of all RFPs and pipeline status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-100 border border-slate-200 flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Total Pipeline Value</h3>
            <DollarSign size={20} className="text-teal-600" />
          </div>
          <p className="text-3xl font-bold text-navy-900">${(totalPipelineValue / 1000).toFixed(1)}M</p>
          <p className="text-xs text-slate-500 mt-1">Across all active RFPs</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-100 border border-slate-200 flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Active RFPs</h3>
            <Activity size={20} className="text-navy-700" />
          </div>
          <p className="text-3xl font-bold text-navy-900">{activeRFPsCount}</p>
          <p className="text-xs text-slate-500 mt-1">{inProgressCount} in progress</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-100 border border-slate-200 flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Completed</h3>
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-navy-900">{completedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Successfully closed</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md shadow-slate-100 border border-slate-200 flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">In Progress</h3>
            <Clock size={20} className="text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-navy-900">{inProgressCount}</p>
          <p className="text-xs text-slate-500 mt-1">Awaiting action</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Pipeline by Stage</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(byStage).map(([stage, count]) => (
            <div key={stage} className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900">{count}</p>
              <p className="text-xs text-slate-600 mt-1">{stage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden flex-1 min-w-0">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-slate-100 p-2 text-slate-600">
                <ListFilter size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">All RFPs - Complete Status</h2>
                <p className="text-sm text-slate-600 mt-1">Comprehensive view of all requests for proposal</p>
                <p className="text-xs text-slate-500 mt-1">Sorted by deadline</p>
              </div>
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
              {owners.map(owner => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setRiskFilter(riskFilter === 'high' ? 'all' : 'high')}
              className={`text-sm px-3 py-2 rounded-lg border transition duration-150 active:scale-[0.98] overflow-hidden relative group ${
                riskFilter === 'high'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-200'
              }`}
            >
              <span className="absolute inset-0 bg-amber-200 opacity-0 group-active:opacity-40 transition-opacity duration-200 pointer-events-none"></span>
              <span className="relative">{riskFilter === 'high' ? 'High risk only' : 'Include risk'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RFP Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Waiting On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredRFPs.map((rfp) => (
                  <tr 
                    key={rfp.id} 
                    onClick={() => navigate(`/rfp/${rfp.id}`)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-sm hover:-translate-y-0.5 transition duration-200 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-navy-900">{rfp.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{rfp.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">{rfp.value}</td>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        rfp.waitingOn === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rfp.waitingOn === 'completed' ? 'Completed' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(rfp.waitingOn)}`}>
                        {getStatusText(rfp.waitingOn)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{rfp.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/rfp/${rfp.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-teal-700 hover:text-teal-900 font-semibold"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="w-full lg:w-80 bg-white border border-slate-200 rounded-xl shadow-sm p-4 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"></span>
            <p className="text-sm font-semibold text-slate-800">AI Insights</p>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="font-semibold text-emerald-700">{missingCompliance} RFPs missing compliance doc</p>
              <p className="text-xs text-emerald-800 mt-1">Flagged for follow-up.</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <p className="font-semibold text-amber-700">{approachingDeadline} RFPs approaching deadline</p>
              <p className="text-xs text-amber-800 mt-1">Due within the next 7 days.</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <p className="font-semibold text-indigo-700">Suggested discount strategy</p>
              <p className="text-xs text-indigo-800 mt-1">Based on competitor benchmarking and deal size.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ManagementDashboard;

