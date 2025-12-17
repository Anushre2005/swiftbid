import { SquaresFour, Tray, FileText, SignOut, ChartBar, Robot, Buildings, UserCircle } from '@phosphor-icons/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { role, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    if (location.pathname === path) {
      return 'bg-slate-900 text-amber-500 shadow-md font-semibold';
    }
    return 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 transition-all duration-200 font-medium';
  };
  
  const linkClasses = (path: string) => `flex items-center gap-3 px-4 py-3 mx-3 rounded-lg transition-all duration-200 ${isActive(path)}`;

  const isSales = role === 'sales';
  const isManagement = role === 'management';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden lg:flex h-screen w-64 bg-slate-800 text-white fixed left-0 top-0 flex-col z-10 shadow-xl border-r border-slate-700/50">
      {/* Header */}
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg">
            <Buildings size={28} weight="duotone" className="text-amber-500" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            SwiftBid AI
          </span>
        </div>
      </div>
      
      {/* User Info - Modern Pill Style */}
      {user && (
        <div className="px-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <UserCircle size={32} weight="duotone" className="text-slate-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{role} Account</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 py-2">
        <div className="px-6 pb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
        </div>

        {/* Management sees Executive Dashboard */}
        {isManagement && (
          <Link to="/management" className={linkClasses('/management')}>
            <ChartBar size={20} weight="duotone" /> 
            <span>Executive Dashboard</span>
          </Link>
        )}

        {/* ONLY Sales sees the main Dashboard */}
        {isSales && (
            <Link to="/dashboard" className={linkClasses('/dashboard')}>
            <SquaresFour size={20} weight="duotone" /> 
            <span>Overview</span>
            </Link>
        )}
        
        {(isSales || isManagement) && (
          <Link to="/sales-agent" className={linkClasses('/sales-agent')}>
            <Robot size={20} weight="duotone" /> 
            <span>Sales Agent</span>
          </Link>
        )}

        {/* Specialists see My Inbox */}
        {!isSales && !isManagement && role !== null && (
             <Link to="/inbox" className={linkClasses('/inbox')}>
             <Tray size={20} weight="duotone" /> 
             <span>My Approvals</span>
             </Link>
        )}

        <Link to="/all-rfps" className={linkClasses('/all-rfps')}>
          <FileText size={20} weight="duotone" /> 
          <span>All RFPs</span>
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 mx-auto rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <SignOut size={20} weight="duotone" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
export default Sidebar;