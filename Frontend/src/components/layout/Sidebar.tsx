import { LayoutDashboard, Inbox, FileText, LogOut, User, BarChart3, Bot } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { role, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => {
    if (location.pathname === path) {
      return 'bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg border-l-4 border-amber-500';
    }
    return 'text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-200';
  };
  const linkClasses = (path: string) => `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isActive(path)}`;

  const isSales = role === 'sales';
  const isManagement = role === 'management';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden lg:flex h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white fixed left-0 top-0 flex-col z-10 shadow-2xl">
      {/* Header with gradient accent */}
      <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <span className="text-slate-900 font-extrabold text-sm">SB</span>
          </div>
          <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            SwiftBid AI
          </span>
        </div>
      </div>
      
      {/* User Info with colorful accent */}
      {user && (
        <div className="px-4 py-4 border-b border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-slate-700">
              <User size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 py-6 space-y-2 px-4">
        {/* Management sees Executive Dashboard */}
        {isManagement && (
          <Link to="/management" className={linkClasses('/management')}>
            <BarChart3 size={20} className={location.pathname === '/management' ? 'text-amber-400' : ''} /> 
            <span>Executive Dashboard</span>
          </Link>
        )}

        {/* ONLY Sales sees the main Dashboard */}
        {isSales && (
            <Link to="/dashboard" className={linkClasses('/dashboard')}>
            <LayoutDashboard size={20} className={location.pathname === '/dashboard' ? 'text-blue-400' : ''} /> 
            <span>Dashboard</span>
            </Link>
        )}
        
        {(isSales || isManagement) && (
          <Link to="/sales-agent" className={linkClasses('/sales-agent')}>
            <Bot size={20} className={location.pathname === '/sales-agent' ? 'text-indigo-400' : ''} /> 
            <span>Sales Agent</span>
          </Link>
        )}

        {/* Specialists see My Inbox */}
        {!isSales && !isManagement && role !== null && (
             <Link to="/inbox" className={linkClasses('/inbox')}>
             <Inbox size={20} className={location.pathname === '/inbox' ? 'text-emerald-400' : ''} /> 
             <span>My Approvals</span>
             </Link>
        )}

        <Link to="/all-rfps" className={linkClasses('/all-rfps')}>
          <FileText size={20} className={location.pathname === '/all-rfps' ? 'text-teal-400' : ''} /> 
          <span>All RFPs</span>
        </Link>
      </nav>

      {/* Logout Button with red accent */}
      <div className="p-4 border-t border-slate-700 bg-gradient-to-t from-slate-900 to-slate-800/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/20 transition-all duration-200 border border-transparent hover:border-red-500/30"
        >
          <LogOut size={20} className="text-red-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
export default Sidebar;