import React, { useEffect, useState } from 'react';
import { accountService, transactionService } from '../services/api';
import { Wallet, ArrowUpRight, ArrowDownRight, PlusCircle, TrendingUp, XCircle, X, Copy, Check, Calendar, Hash, CreditCard, Shield, Loader2, AlertTriangle } from 'lucide-react';

const Overview = () => {
  const [accounts, setAccounts] = useState([]);
  const [activeAccCount, setActiveAccCount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [recentStmts, setRecentStmts] = useState([]);

  // Create account modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ accounttype: 'SAVINGS', balance: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  // Account detail panel
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateMsg, setDeactivateMsg] = useState({ type: '', text: '' });

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
            console.warn('No statements yet', e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setContentVisible(true), 100);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg({ type: '', text: '' });
    try {
      await accountService.createAccount(createForm);
      setCreateMsg({ type: 'success', text: 'Account created successfully!' });
      setShowCreateModal(false);
      setCreateForm({ accounttype: 'SAVINGS', balance: '' });
      fetchDashboardData();
    } catch (err) {
      setCreateMsg({ type: 'error', text: err.error || 'Failed to create account.' });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCopyField = (value, field) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDeactivate = async () => {
    if (!selectedAccount) return;
    setDeactivateLoading(true);
    setDeactivateMsg({ type: '', text: '' });
    try {
      await accountService.deactivateAccount({
        account_number: selectedAccount.accountnumber,
        verify_password: deactivatePassword,
      });
      setDeactivateMsg({ type: 'success', text: 'Account deactivated successfully.' });
      setSelectedAccount(null);
      setShowDeactivate(false);
      setDeactivatePassword('');
      fetchDashboardData();
    } catch (err) {
      const msg = err.error || err.non_field_errors?.[0] || 'Failed to deactivate account.';
      setDeactivateMsg({ type: 'error', text: typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg });
    } finally {
      setDeactivateLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-500"></div>
          <p className="text-gray-400 text-sm animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-all duration-[800ms] ease-out ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
      
      {/* Top Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card md:col-span-2 p-8 border-royal-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-royal-600/20 rounded-full blur-3xl pointer-events-none animate-glow-pulse"></div>
          <p className="text-royal-300 text-sm font-semibold tracking-wider uppercase mb-2">Total Balance</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-6 py-2.5 rounded-full text-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> New Account
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

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative glass-card p-8 rounded-3xl w-full max-w-md mx-4 animate-fade-in-up">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <XCircle className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Create New Account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Account Type</label>
                <select
                  value={createForm.accounttype}
                  onChange={e => setCreateForm({...createForm, accounttype: e.target.value})}
                  className="form-input"
                >
                  <option value="SAVINGS">Savings</option>
                  <option value="CURRENT">Current</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Initial Balance ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="1000.00"
                  value={createForm.balance}
                  onChange={e => setCreateForm({...createForm, balance: e.target.value})}
                />
              </div>
              {createMsg.text && (
                <div className={`p-3 rounded-xl text-sm font-medium text-center ${createMsg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                  {createMsg.text}
                </div>
              )}
              <button type="submit" disabled={createLoading} className="w-full btn-primary">
                {createLoading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accounts */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white px-1">Your Accounts</h2>
          <div className="space-y-3">
            {accounts.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-gray-400 border-dashed border-2 border-white/10">
                No accounts yet. Create one above!
              </div>
            ) : (
              accounts.map((acc) => (
                <div
                  key={acc.accountnumber}
                  onClick={() => { setSelectedAccount(acc); setShowDeactivate(false); setDeactivatePassword(''); setDeactivateMsg({ type: '', text: '' }); }}
                  className={`glass-panel p-5 rounded-2xl flex justify-between items-center cursor-pointer border transition-all duration-300 ${
                    selectedAccount?.accountnumber === acc.accountnumber
                      ? 'border-royal-500/50 bg-royal-600/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                      : 'border-transparent hover:bg-surfaceLight/50 hover:border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center border transition-all duration-300 ${
                      selectedAccount?.accountnumber === acc.accountnumber ? 'border-royal-400/50 scale-110' : 'border-white/10'
                    }`}>
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

          {/* Account Detail Panel */}
          {selectedAccount && (
            <div className="glass-card p-6 rounded-2xl space-y-5 animate-fade-in-up border-royal-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-royal-400" />
                  Account Details
                </h3>
                <button onClick={() => setSelectedAccount(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Account Number */}
                <div className="flex items-center justify-between py-3 px-4 bg-surface/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-400">Account Number</p>
                      <p className="text-white font-mono font-medium tracking-wider">{selectedAccount.accountnumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyField(selectedAccount.accountnumber, 'accnum')}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-royal-400"
                    title="Copy"
                  >
                    {copiedField === 'accnum' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Account Type */}
                <div className="flex items-center justify-between py-3 px-4 bg-surface/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-400">Account Type</p>
                      <p className="text-white font-medium">{selectedAccount.accounttype}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-royal-500/10 text-royal-300 font-medium">
                    {selectedAccount.accounttype === 'SAVINGS' ? 'Interest Bearing' : 'No Interest'}
                  </span>
                </div>

                {/* Balance */}
                <div className="flex items-center justify-between py-3 px-4 bg-surface/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-400">Current Balance</p>
                      <p className="text-white font-bold text-lg">${parseFloat(selectedAccount.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between py-3 px-4 bg-surface/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-400">Status</p>
                      <p className="text-white font-medium">{selectedAccount.status}</p>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${selectedAccount.status === 'ACTIVE' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                </div>

                {/* Open Date */}
                <div className="flex items-center justify-between py-3 px-4 bg-surface/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-400">Opened On</p>
                      <p className="text-white font-medium">
                        {new Date(selectedAccount.createdate).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account ID */}
                <div className="flex items-center justify-between py-3 px-4 bg-surface/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-400">Internal ID</p>
                      <p className="text-gray-300 font-mono text-sm">{selectedAccount.accountid}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deactivate Section */}
              {selectedAccount.status === 'ACTIVE' && (
                <div className="pt-2">
                  {!showDeactivate ? (
                    <button
                      onClick={() => setShowDeactivate(true)}
                      className="w-full py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/20 font-medium"
                    >
                      Deactivate Account
                    </button>
                  ) : (
                    <div className="space-y-3 p-4 rounded-xl bg-red-500/5 border border-red-500/15">
                      <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        This action cannot be undone
                      </div>
                      <input
                        type="password"
                        placeholder="Enter password to confirm"
                        value={deactivatePassword}
                        onChange={e => setDeactivatePassword(e.target.value)}
                        className="form-input text-sm"
                      />
                      {deactivateMsg.text && (
                        <p className={`text-xs ${deactivateMsg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{deactivateMsg.text}</p>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setShowDeactivate(false); setDeactivatePassword(''); setDeactivateMsg({ type: '', text: '' }); }}
                          className="flex-1 py-2 text-sm rounded-xl border border-white/10 text-white hover:bg-white/5 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeactivate}
                          disabled={deactivateLoading || !deactivatePassword}
                          className="flex-1 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-semibold flex items-center justify-center gap-2"
                        >
                          {deactivateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deactivate'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white px-1">Recent Activity</h2>
          <div className="glass-panel rounded-2xl p-2 overflow-hidden">
            {recentStmts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No recent transactions.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentStmts.map((stmt) => {
                  const isCredit = stmt.type?.toUpperCase() === 'CREDIT';
                  return (
                    <div key={stmt.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                          {isCredit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{isCredit ? 'Deposit Received' : 'Transfer Sent'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{new Date(stmt.created_at).toLocaleDateString()}</p>
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
  );
};

export default Overview;
