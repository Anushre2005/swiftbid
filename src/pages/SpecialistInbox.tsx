// src/pages/SpecialistInbox.tsx
import { mockRFPs } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Clock } from 'lucide-react';

const SpecialistInbox = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  // === CRITICAL: Filter tasks based on the logged-in user's role ===
  // Only show tasks where 'waitingOn' matches their role.
  const myTasks = mockRFPs.filter(rfp => rfp.waitingOn === role);

  // Helper to display a nice title
  const roleTitle = role === 'tech' ? 'Technical Team' : role === 'pricing' ? 'Pricing Team' : 'Specialist';

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
      <h1 className="text-xl sm:text-2xl font-bold text-navy-900 mb-6">{roleTitle}: Pending Approvals</h1>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RFP Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {myTasks.length > 0 ? (
                    myTasks.map((rfp) => (
                    <tr 
                      key={rfp.id} 
                      onClick={() => navigate(`/rfp/${rfp.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-navy-900">{rfp.client}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">{rfp.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {rfp.deadline}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 text-amber-600 font-medium">
                            <Clock size={16} />
                            <span>Ready for {rfp.currentStage} Review</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/rfp/${rfp.id}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="text-teal-700 hover:text-teal-900 font-semibold flex items-center justify-end gap-1"
                        >
                            Review & Action
                        </Link>
                        </td>
                    </tr>
                    ))
                ) : (
                    // Empty state message
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                            <CheckCircle2 size={48} className="text-teal-500" />
                            <p className="text-lg font-medium">All caught up!</p>
                            <p className="text-sm">No pending approvals for the {roleTitle}.</p>
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default SpecialistInbox;