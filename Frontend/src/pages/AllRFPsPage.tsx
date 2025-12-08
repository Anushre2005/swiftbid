// src/pages/AllRFPsPage.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockRFPs } from '../data/mockData';
import StageProgressBar from '../components/shared/StageProgressBar';
import { FileText, Clock } from 'lucide-react';
import type { RFPStatus } from '../types';

const AllRFPsPage = () => {
  const [statusFilter, setStatusFilter] = useState<RFPStatus | 'all'>('all');
  const navigate = useNavigate();

  // Get status badge styling
  const getStatusBadge = (rfp: typeof mockRFPs[0]) => {
    const rfpStatus = rfp.status || (rfp.waitingOn === 'completed' ? 'completed' : 'active');
    switch (rfpStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get status text
  const getStatusText = (rfp: typeof mockRFPs[0]) => {
    if (rfp.status === 'completed') return 'Completed';
    if (rfp.status === 'accepted') return 'Accepted';
    if (rfp.status === 'rejected') return 'Rejected';
    if (rfp.waitingOn === 'completed') return 'Completed';
    return `Waiting on ${rfp.waitingOn}`;
  };

  // Filter RFPs based on selected status
  const filteredRFPs = useMemo(() => {
    if (statusFilter === 'all') return mockRFPs;
    return mockRFPs.filter((rfp) => {
      const rfpStatus = rfp.status || (rfp.waitingOn === 'completed' ? 'completed' : 'active');
      return rfpStatus === statusFilter;
    });
  }, [statusFilter]);

  const filterOptions: Array<{ value: RFPStatus | 'all'; label: string; count: number }> = [
    { value: 'all', label: 'All', count: mockRFPs.length },
    {
      value: 'active',
      label: 'Active',
      count: mockRFPs.filter((r) => {
        const status = r.status || (r.waitingOn === 'completed' ? 'completed' : 'active');
        return status === 'active';
      }).length,
    },
    {
      value: 'completed',
      label: 'Completed',
      count: mockRFPs.filter((r) => {
        const status = r.status || (r.waitingOn === 'completed' ? 'completed' : 'active');
        return status === 'completed';
      }).length,
    },
    {
      value: 'accepted',
      label: 'Accepted',
      count: mockRFPs.filter((r) => r.status === 'accepted').length,
    },
    {
      value: 'rejected',
      label: 'Rejected',
      count: mockRFPs.filter((r) => r.status === 'rejected').length,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={24} className="sm:w-7 sm:h-7 text-navy-900" />
        <h1 className="text-xl sm:text-2xl font-bold text-navy-900">All RFPs</h1>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === option.value
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {option.label} ({option.count})
          </button>
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RFP Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredRFPs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No RFPs found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRFPs.map((rfp) => (
                  <tr
                    key={rfp.id}
                    onClick={() => navigate(`/rfp/${rfp.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(rfp)}`}>
                        {getStatusText(rfp)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllRFPsPage;

