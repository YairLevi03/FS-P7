import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-[#334155] bg-grid text-slate-200">
      {/* Sidebar (Desktop sticky & Mobile off-canvas) */}
      <Sidebar isOpen={mobileMenuOpen} toggleSidebar={toggleSidebar} />

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-[#1e293b]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
          {/* Hamburger button for mobile */}
          <button 
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-0">
              Welcome back, <span className="text-white ml-1">{user?.full_name}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
            </button>
          </div>
        </header>

        {/* Content Body with Max Width wrapper */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 modal-overlay z-40 md:hidden animate-fade-in"
        />
      )}
    </div>
  );
};

export default Layout;
