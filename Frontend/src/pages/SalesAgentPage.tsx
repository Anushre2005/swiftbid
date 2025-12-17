import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Globe, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Search,
  Activity
} from 'lucide-react';
import StageProgressBar from '../components/shared/StageProgressBar';

// Mock Data Types
interface RFPSource {
  id: string;
  name: string;
  url: string;
  lastScanned: string;
  status: 'active' | 'scanning' | 'error';
  rfpsFound: number;
}

interface DiscoveredRFP {
  id: string;
  title: string;
  source: string;
  discoveredAt: string;
  value: string;
  status: 'New' | 'Qualified' | 'Processing' | 'Rejected';
  currentStage: 'Discovery' | 'Tech' | 'Pricing' | 'Approval' | 'Final';
  matchScore: number;
}

const SalesAgentPage = () => {
  const navigate = useNavigate();
  const [newUrl, setNewUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  // 1. Mock Sources
  const [sources, setSources] = useState<RFPSource[]>([
    {
      id: '1',
      name: 'Central Public Procurement Portal (CPPP)',
      url: 'https://etenders.gov.in',
      lastScanned: 'Just now',
      status: 'scanning',
      rfpsFound: 12
    },
    {
      id: '2',
      name: 'GeM (Government e-Marketplace)',
      url: 'https://gem.gov.in',
      lastScanned: '5 mins ago',
      status: 'active',
      rfpsFound: 8
    },
    {
      id: '3',
      name: 'NTPC Tender Portal',
      url: 'https://ntpctender.ntpc.co.in',
      lastScanned: '1 hour ago',
      status: 'active',
      rfpsFound: 3
    },
    {
      id: '4',
      name: 'Indian Railways E-Procurement',
      url: 'https://ireps.gov.in',
      lastScanned: '10 mins ago',
      status: 'active',
      rfpsFound: 5
    }
  ]);

  // 2. Mock Discovered RFPs
  const [discoveredRFPs, setDiscoveredRFPs] = useState<DiscoveredRFP[]>([
    {
      id: 'rfp-101',
      title: 'Supply of 1.1kV LT XLPE Cables for Metro Rail Project Phase II',
      source: 'Central Public Procurement Portal (CPPP)',
      discoveredAt: 'Today, 09:15 AM',
      value: '₹ 4.5 Cr',
      status: 'Qualified',
      currentStage: 'Tech',
      matchScore: 92
    },
    {
      id: 'rfp-102',
      title: 'Annual Rate Contract for Fire Survival Cables (FRLS)',
      source: 'NTPC Tender Portal',
      discoveredAt: 'Today, 08:30 AM',
      value: '₹ 2.1 Cr',
      status: 'Processing',
      currentStage: 'Pricing',
      matchScore: 88
    },
    {
      id: 'rfp-103',
      title: 'Procurement of HT Power Cables (33kV) for Substation',
      source: 'GeM (Government e-Marketplace)',
      discoveredAt: 'Yesterday, 04:45 PM',
      value: '₹ 8.2 Cr',
      status: 'New',
      currentStage: 'Discovery',
      matchScore: 75
    },
    {
      id: 'rfp-104',
      title: 'Supply of Control Cables for Refinery Expansion',
      source: 'Indian Railways E-Procurement',
      discoveredAt: 'Yesterday, 02:20 PM',
      value: '₹ 1.8 Cr',
      status: 'Rejected',
      currentStage: 'Discovery',
      matchScore: 45
    }
  ]);

  // Simulate scanning effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSources(prev => prev.map(source => {
        if (source.status === 'scanning') {
          return { ...source, status: 'active', lastScanned: 'Just now' };
        }
        if (Math.random() > 0.7) {
           return { ...source, status: 'scanning' };
        }
        return source;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newSourceName) return;

    const newSource: RFPSource = {
      id: Date.now().toString(),
      name: newSourceName,
      url: newUrl,
      lastScanned: 'Pending...',
      status: 'scanning',
      rfpsFound: 0
    };

    setSources([...sources, newSource]);
    setNewUrl('');
    setNewSourceName('');
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Qualified': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Rejected': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Bot className="text-indigo-600" size={32} />
              Sales Agent Configuration
            </h1>
            <p className="text-slate-500 mt-1">
              Configure RFP sources and monitor autonomous discovery in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-sm font-medium text-slate-700">Agent Active & Scanning</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Source Configuration */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Add Source Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Globe size={18} className="text-slate-500" />
                Add New Source
              </h2>
              <form onSubmit={handleAddSource} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Source Name</label>
                  <input
                    type="text"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    placeholder="e.g. NHAI Tender Portal"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newUrl || !newSourceName}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-sm hover:shadow-md mt-2"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus size={18} />
                    <span>Add Source</span>
                  </div>
                </button>
              </form>
            </div>

            {/* Active Sources List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Monitored Sources</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                  {sources.length} Active
                </span>
              </div>
              
              <div className="space-y-3">
                {sources.map(source => (
                  <div key={source.id} className="group border border-slate-100 rounded-lg p-3 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm text-slate-900">{source.name}</div>
                      <button 
                        onClick={() => handleDeleteSource(source.id)}
                        className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline truncate block mb-2">
                      {source.url}
                    </a>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        {source.status === 'scanning' ? (
                          <>
                            <RefreshCw size={12} className="animate-spin text-emerald-500" />
                            <span className="text-emerald-600 font-medium">Scanning...</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            <span>{source.lastScanned}</span>
                          </>
                        )}
                      </div>
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                        {source.rfpsFound} Found
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Discovery Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Discovery Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Total Scanned</div>
                <div className="text-2xl font-bold text-slate-900">1,248</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Opportunities</div>
                <div className="text-2xl font-bold text-emerald-600">32</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Qualified</div>
                <div className="text-2xl font-bold text-indigo-600">18</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Est. Value</div>
                <div className="text-2xl font-bold text-amber-600">₹45 Cr</div>
              </div>
            </div>

            {/* Discovered RFPs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Live RFP Discovery Feed</h2>
                  <p className="text-sm text-slate-500">Real-time opportunities identified by the Sales Agent.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search feed..." 
                    className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:outline-none w-full sm:w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Opportunity</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Source</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Est. Value</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Match</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {discoveredRFPs.map((rfp) => (
                      <tr key={rfp.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 text-sm mb-0.5">{rfp.title}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={10} />
                            Found: {rfp.discoveredAt}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            {rfp.source.split('(')[0].trim()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                          {rfp.value}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${rfp.matchScore > 80 ? 'bg-emerald-500' : rfp.matchScore > 60 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                style={{ width: `${rfp.matchScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">{rfp.matchScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rfp.status)}`}>
                            {rfp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {rfp.status === 'Rejected' ? (
                             <span className="text-xs text-slate-400 italic">Dismissed</span>
                          ) : (
                            <button 
                              onClick={() => navigate(`/rfp/1`)} // Redirecting to mock ID 1 for demo
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 hover:underline"
                            >
                              View Details
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center">
                <button className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                  Load More History
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAgentPage;
