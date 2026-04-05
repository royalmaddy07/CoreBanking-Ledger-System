import React, { useState, useEffect } from 'react';
import { fdService, accountService } from '../services/api';
import { ShieldCheck, XCircle, Loader2, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

const FixedDeposits = () => {
  const [fds, setFds] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  // Create FD modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ account_number: '', amount: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: '', text: '' });

  // Cancel FD modal
  const [cancelFd, setCancelFd] = useState(null);
  const [cancelPassword, setCancelPassword] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
    setTimeout(() => setContentVisible(true), 100);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fdRes, accRes] = await Promise.all([
        fdService.getFDs(),
        accountService.getHomeData(),
      ]);
      if (fdRes.success) setFds(fdRes.fixed_deposits || []);
      if (accRes.accounts) setAccounts(accRes.accounts.filter(a => a.status === 'ACTIVE'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFD = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg({ type: '', text: '' });
    try {
      const res = await fdService.createFD(createForm);
      setCreateMsg({ type: 'success', text: res.message || 'FD created!' });
      setShowCreateModal(false);
      setCreateForm({ account_number: '', amount: '' });
      fetchData();
    } catch (err) {
      const msg = err.error || err.non_field_errors?.[0] || 'Failed to create FD.';
      setCreateMsg({ type: 'error', text: typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelFD = async () => {
    if (!cancelFd) return;
    setCancelLoading(true);
    setCancelMsg({ type: '', text: '' });
    try {
      const res = await fdService.cancelFD(cancelFd.fdid, cancelPassword);
      setCancelMsg({ type: 'success', text: res.message || 'FD cancelled.' });
      setCancelFd(null);
      setCancelPassword('');
      fetchData();
    } catch (err) {
      const msg = err.error || err.non_field_errors?.[0] || 'Failed to cancel FD.';
      setCancelMsg({ type: 'error', text: typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg });
    } finally {
      setCancelLoading(false);
    }
  };

  const activeFDs = fds.filter(f => f.status === 'ACTIVE');
  const totalInvested = activeFDs.reduce((s, f) => s + parseFloat(f.amount), 0);
  const totalMaturity = activeFDs.reduce((s, f) => s + parseFloat(f.maturityamount), 0);

  return (
    <div className={`space-y-8 transition-all duration-[800ms] ease-out ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Fixed Deposits</h1>
          <p className="text-gray-400 text-sm">Lock your funds and earn guaranteed returns.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary px-5 py-2.5 rounded-full text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> New FD
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Invested</p>
          <p className="text-2xl font-display font-bold text-white">${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Projected Maturity</p>
          <p className="text-2xl font-display font-bold text-green-400">${totalMaturity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Interest Rate</p>
              <p className="text-2xl font-display font-bold text-royal-400">5.00%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-royal-500/40" />
          </div>
        </div>
      </div>

      {/* Create FD Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative glass-card p-8 rounded-3xl w-full max-w-md mx-4 animate-fade-in-up">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <XCircle className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Create Fixed Deposit</h2>
            <p className="text-gray-400 text-sm mb-6">Lock-in period: 6 months at 5.00% APY</p>
            <form onSubmit={handleCreateFD} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Source Account</label>
                <select
                  required
                  value={createForm.account_number}
                  onChange={e => setCreateForm({...createForm, account_number: e.target.value})}
                  className="form-input"
                >
                  <option value="">Select account</option>
                  {accounts.map(a => (
                    <option key={a.accountnumber} value={a.accountnumber}>
                      {a.accounttype} - ****{a.accountnumber.slice(-4)} (${parseFloat(a.balance).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">FD Amount ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  className="form-input text-xl font-display font-bold"
                  placeholder="5000.00"
                  value={createForm.amount}
                  onChange={e => setCreateForm({...createForm, amount: e.target.value})}
                />
                {createForm.amount && parseFloat(createForm.amount) > 0 && (
                  <p className="text-xs text-green-400 ml-1">
                    Maturity amount: ${(parseFloat(createForm.amount) * 1.025).toFixed(2)} after 6 months
                  </p>
                )}
              </div>
              {createMsg.text && (
                <div className={`p-3 rounded-xl text-sm font-medium text-center ${createMsg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                  {createMsg.text}
                </div>
              )}
              <button type="submit" disabled={createLoading} className="w-full btn-primary">
                {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Fixed Deposit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cancel FD Modal */}
      {cancelFd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setCancelFd(null); setCancelPassword(''); }} />
          <div className="relative glass-card p-8 rounded-3xl w-full max-w-md mx-4 animate-fade-in-up">
            <button onClick={() => { setCancelFd(null); setCancelPassword(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <XCircle className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Cancel Fixed Deposit?</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              This will cancel FD #{cancelFd.fdid} and credit <span className="text-white font-semibold">${parseFloat(cancelFd.amount).toLocaleString()}</span> back to your account. Interest will not be paid.
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Enter Password to Confirm</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={cancelPassword}
                  onChange={e => setCancelPassword(e.target.value)}
                />
              </div>
              {cancelMsg.text && (
                <div className={`p-3 rounded-xl text-sm font-medium text-center ${cancelMsg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                  {cancelMsg.text}
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={() => { setCancelFd(null); setCancelPassword(''); }} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 text-sm">
                  Keep FD
                </button>
                <button
                  onClick={handleCancelFD}
                  disabled={cancelLoading || !cancelPassword}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel FD'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FD List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-royal-500 mx-auto"></div>
        </div>
      ) : fds.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center">
          <ShieldCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Fixed Deposits</h3>
          <p className="text-gray-400 text-sm mb-6">Start earning guaranteed 5.00% APY today.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary px-8 py-3 rounded-full mx-auto text-sm">
            Create Your First FD
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fds.map(fd => {
            const isActive = fd.status === 'ACTIVE';
            const startDate = new Date(fd.startdate);
            const maturityDate = new Date(fd.maturitydate);
            const now = new Date();
            const totalDays = (maturityDate - startDate) / (1000 * 60 * 60 * 24);
            const elapsed = Math.min((now - startDate) / (1000 * 60 * 60 * 24), totalDays);
            const progress = totalDays > 0 ? Math.max(0, Math.min(100, (elapsed / totalDays) * 100)) : 0;

            return (
              <div key={fd.fdid} className="glass-card p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isActive ? 'bg-royal-500/10 border-royal-500/30' : 'bg-white/5 border-white/10'}`}>
                      <ShieldCheck className={`w-5 h-5 ${isActive ? 'text-royal-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">FD #{fd.fdid}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                          {fd.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{fd.interestrate}% APY</span>
                        <span>•</span>
                        <span>{fd.durationmonths} months</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Invested</p>
                      <p className="text-white font-bold">${parseFloat(fd.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Maturity</p>
                      <p className="text-green-400 font-bold">${parseFloat(fd.maturityamount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    {isActive && (
                      <button
                        onClick={() => setCancelFd(fd)}
                        className="text-xs px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isActive && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-gray-400">
                        {maturityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-royal-600 to-royal-400"
                        style={{ width: `${progress}%`, transition: 'width 1s ease-out' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(progress)}% complete</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FixedDeposits;
