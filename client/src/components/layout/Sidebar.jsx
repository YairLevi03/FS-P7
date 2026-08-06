import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CreditCard, 
  Send, 
  Clock, 
  FileText, 
  Users, 
  LogOut,
  Building,
  X,
  Landmark,
  ShieldAlert,
  CheckCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const customerLinks = [
    { to: '/customer/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/customer/accounts', icon: <CreditCard size={20} />, label: 'My Accounts' },
    { to: '/customer/cards', icon: <CreditCard size={20} />, label: 'Cards' },
    { to: '/customer/loans-savings', icon: <Landmark size={20} />, label: 'Loans & Savings' },
    { to: '/customer/transactions', icon: <FileText size={20} />, label: 'Transactions' },
    { to: '/customer/transfer', icon: <Send size={20} />, label: 'Transfer Funds' },
    { to: '/customer/payments', icon: <FileText size={20} />, label: 'Payments' },
    { to: '/customer/standing-orders', icon: <Clock size={20} />, label: 'Standing Orders' },
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/manager/approvals', icon: <CheckCircle size={20} />, label: 'Approvals' },
    { to: '/manager/customers', icon: <Users size={20} />, label: 'Client Directory' },
    { to: '/manager/accounts', icon: <Building size={20} />, label: 'All Accounts' },
    { to: '/manager/audit', icon: <ShieldAlert size={20} />, label: 'System Audit' },
  ];

  const links = user?.role === 'manager' ? managerLinks : customerLinks;

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b]/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold glow-indigo">
            NB
          </div>
          <span className="text-xl font-bold tracking-wide text-white">
            Nexus<span className="text-indigo-400">Bank</span>
          </span>
        </div>
        {/* Mobile Close Button */}
        <button 
          onClick={toggleSidebar} 
          className="md:hidden text-slate-400 hover:text-white p-1"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => { if (isOpen) toggleSidebar(); }}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Profile & Logout Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 font-bold">
            {user?.full_name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-indigo-400 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
