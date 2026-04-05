import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, Activity, CreditCard, ShieldCheck, FileText, Users, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/dashboard',       icon: Activity,    label: 'Overview',        end: true },
  { path: '/dashboard/transfer',    icon: CreditCard,  label: 'Transfers',       end: false },
  { path: '/dashboard/statements',  icon: FileText,    label: 'Statements',      end: false },
  { path: '/dashboard/beneficiaries', icon: Users,     label: 'Beneficiaries',   end: false },
  { path: '/dashboard/fixed-deposits', icon: ShieldCheck, label: 'Fixed Deposits', end: false },
];

const DashboardLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-2 border-b border-white/5">
        <Wallet className="w-8 h-8 text-royal-500" />
        <span className="text-xl font-display font-bold tracking-tight text-white">
          Nexus<span className="text-royal-400">Wealth</span>
        </span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                isActive
                  ? 'bg-royal-600/20 text-white border border-royal-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/5 hidden md:flex flex-col min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 w-72 h-full glass-panel border-r border-white/5 flex flex-col z-10 animate-fade-in-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden glass-panel border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-40">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-royal-500" />
            <span className="font-display font-bold text-white">NexusWealth</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
