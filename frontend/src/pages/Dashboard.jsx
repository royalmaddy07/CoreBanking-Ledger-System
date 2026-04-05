import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountService, transactionService } from '../services/api';
import { Wallet, LogOut, ArrowUpRight, ArrowDownRight, Activity, PlusCircle, CreditCard, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [activeAccCount, setActiveAccCount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [recentStmts, setRecentStmts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const homeRes = await accountService.getHomeData();
      if (homeRes.accounts) {
        setAccounts(homeRes.accounts);
        setActiveAccCount(homeRes.active_acc_count);
        
        const sum = homeRes.accounts.reduce((acc, curr) => acc + parseFloat(curr.balance), 0);
        setTotalBalance(sum);

        if (homeRes.accounts.length > 0) {
          try {
            const stmtRes = await transactionService.getStatements(homeRes.accounts[0].accountnumber);
            if (stmtRes.success) {
              setRecentStmts(stmtRes.transactions.slice(0, 5));
            }
          } catch (e) {
            // Statements may fail if no transactions exist yet — that's fine
            console.warn('Could not load statements', e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setIsLoading(false);
      // Stagger the content reveal
      setTimeout(() => setContentVisible(true), 100);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-500"></div>
          <p className="text-gray-400 text-sm animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-panel border-r border-white/5 hidden md:flex flex-col min-h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2 border-b border-white/5">
          <Wallet className="w-8 h-8 text-royal-500" />
          <span className="text-xl font-display font-bold tracking-tight text-white">
            Nexus<span className="text-royal-400">Wealth</span>
          </span>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-royal-600/20 text-white font-medium border border-royal-500/30">
            <Activity className="w-5 h-5 text-royal-400" />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium">
            <CreditCard className="w-5 h-5" />
            Transfers
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium">
            <ShieldCheck className="w-5 h-5" />
            Fixed Deposits
          </a>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden glass-panel border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-50">
           <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-royal-500" />
            <span className="font-display font-bold text-white">NexusWealth</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className={`p-6 md:p-10 max-w-7xl mx-auto space-y-8 transition-all duration-[800ms] ease-out ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
          
          {/* Top Overview Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card md:col-span-2 p-8 border-royal-500/20 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-royal-600/20 rounded-full blur-3xl pointer-events-none animate-glow-pulse"></div>
              <p className="text-royal-300 text-sm font-semibold tracking-wider uppercase mb-2">Total Balance</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h1>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary px-6 py-2.5 rounded-full text-sm flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Transfer Funds
                </button>
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Add Account
                </button>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
               <div className="w-16 h-16 rounded-full bg-surfaceLight flex items-center justify-center mb-4 border border-white/10">
                 <span className="text-2xl font-bold text-royal-400">{activeAccCount}</span>
               </div>
               <h3 className="text-lg font-semibold text-white">Active Accounts</h3>
               <p className="text-sm text-gray-400 mt-1">Maximum 5 allowed</p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Accounts List */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold text-white">Your Accounts</h2>
                <a href="#" className="text-sm text-royal-400 hover:text-royal-300 font-medium tracking-wide">View All</a>
              </div>
              
              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <div className="glass-panel p-6 rounded-2xl text-center text-gray-400 border-dashed border-2 border-white/10">
                    No accounts created yet.
                  </div>
                ) : (
                  accounts.map((acc, index) => (
                    <div 
                      key={acc.accountnumber} 
                      className="glass-panel p-5 rounded-2xl flex justify-between items-center hover:bg-surfaceLight/50 cursor-pointer border border-transparent hover:border-white/5"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center border border-white/10 shadow-inner">
                          <Wallet className="w-5 h-5 text-royal-200" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{acc.accounttype} Account</p>
                          <p className="text-xs text-gray-400 font-mono tracking-wider mt-0.5">****{acc.accountnumber.slice(-4)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${parseFloat(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className={`text-xs font-medium mt-0.5 ${acc.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-500'}`}>{acc.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent Transactions */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <a href="#" className="text-sm text-royal-400 hover:text-royal-300 font-medium tracking-wide">Statements</a>
              </div>
              
              <div className="glass-panel rounded-2xl p-2 overflow-hidden border-white/5">
                {recentStmts.length === 0 ? (
                   <div className="p-8 text-center text-gray-400">
                     No recent transactions found.
                   </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recentStmts.map((stmt) => {
                      const isCredit = stmt.entrytype?.toUpperCase() === 'CREDIT';
                      return (
                        <div key={stmt.ledgerid} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                              {isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{isCredit ? 'Deposit Received' : 'Transfer Sent'}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{new Date(stmt.createdate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`font-semibold ${isCredit ? 'text-green-400' : 'text-gray-300'}`}>
                            {isCredit ? '+' : '-'}${parseFloat(stmt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
