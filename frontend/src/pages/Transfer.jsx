import React, { useState, useEffect } from 'react';
import { transactionService, accountService, beneficiaryService } from '../services/api';
import { ArrowUpRight, ArrowDownRight, Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

const Transfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    from_account: '',
    to_account: '',
    amount: '',
    verify_password: '',
    confirm_tx: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', text: '' }
  const [step, setStep] = useState(1); // 1 = form, 2 = confirm, 3 = done
  const [contentVisible, setContentVisible] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchBeneficiaries();
    setTimeout(() => setContentVisible(true), 100);
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await accountService.getHomeData();
      if (res.accounts) {
        setAccounts(res.accounts.filter(a => a.status === 'ACTIVE'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const res = await beneficiaryService.getBeneficiaries();
      if (res.success && res.beneficiaries) {
        setBeneficiaries(res.beneficiaries);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setResult(null);

    if (formData.from_account === formData.to_account) {
      setResult({ type: 'error', text: 'Cannot transfer to the same account.' });
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      setResult({ type: 'error', text: 'Amount must be positive.' });
      return;
    }
    setStep(2);
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await transactionService.transfer({
        ...formData,
        confirm_tx: true,
        amount: parseFloat(formData.amount),
      });
      setResult({ type: 'success', text: res.message || 'Transfer successful!' });
      setStep(3);
      fetchAccounts();
    } catch (err) {
      const msg = err.non_field_errors?.[0] || err.error || (typeof err === 'string' ? err : 'Transfer failed.');
      setResult({ type: 'error', text: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ from_account: '', to_account: '', amount: '', verify_password: '', confirm_tx: false });
    setStep(1);
    setResult(null);
  };

  const fromAcc = accounts.find(a => a.accountnumber === formData.from_account);

  return (
    <div className={`max-w-2xl mx-auto space-y-8 transition-all duration-[800ms] ease-out ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Transfer Funds</h1>
        <p className="text-gray-400 text-sm">Move money between your accounts or to beneficiaries.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-500 ${
              step >= s ? 'bg-royal-600 border-royal-500 text-white' : 'bg-surface border-white/10 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 rounded transition-all duration-500 ${step > s ? 'bg-royal-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Amount & Accounts */}
      {step === 1 && (
        <form onSubmit={handleNext} className="glass-card p-8 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">From Account</label>
              <select
                required
                value={formData.from_account}
                onChange={e => setFormData({...formData, from_account: e.target.value})}
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
              <div className="flex items-center justify-between ml-1 relative">
                <label className="text-sm font-medium text-gray-300">To Account</label>
                {beneficiaries.length > 0 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-1.5 text-xs text-royal-400 hover:text-royal-300 font-medium py-1.5 px-3 rounded-lg hover:bg-royal-500/10 transition-colors"
                    >
                      Select Beneficiary <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Custom Stylish Dropdown */}
                    {showDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1b2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 animate-fade-in-up">
                          <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                            <p className="text-xs font-semibold text-gray-400 text-center uppercase tracking-wider">Saved Beneficiaries</p>
                          </div>
                          <div className="max-h-56 overflow-y-auto hide-scrollbar">
                            {beneficiaries.map(b => (
                              <button
                                key={b.accountnumber}
                                type="button"
                                onClick={() => {
                                  setFormData({...formData, to_account: b.accountnumber});
                                  setShowDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-royal-500/10 transition-all duration-200 border-b border-white/5 last:border-0 flex items-center justify-between group ${
                                  formData.to_account === b.accountnumber ? 'bg-royal-500/5' : ''
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <p className={`text-sm font-semibold transition-colors ${formData.to_account === b.accountnumber ? 'text-royal-400' : 'text-white group-hover:text-royal-300'}`}>
                                    {b.nickname || 'Saved Account'}
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono mt-0.5">****{b.accountnumber.slice(-4)}</p>
                                </div>
                                {formData.to_account === b.accountnumber && (
                                  <div className="w-2 h-2 rounded-full bg-royal-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="Enter account number"
                value={formData.to_account}
                onChange={e => setFormData({...formData, to_account: e.target.value})}
                className="form-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Amount ($)</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="form-input text-2xl font-display font-bold py-4"
            />
            {fromAcc && (
              <p className="text-xs text-gray-500 ml-1">Available: ${parseFloat(fromAcc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            )}
          </div>

          {result?.type === 'error' && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {result.text}
            </div>
          )}

          <button type="submit" className="w-full btn-primary">
            Continue
          </button>
        </form>
      )}

      {/* Step 2: Confirm & Password */}
      {step === 2 && (
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <h2 className="text-lg font-semibold text-white">Confirm Transfer Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400 text-sm">From</span>
              <span className="text-white font-medium font-mono">****{formData.from_account.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400 text-sm">To</span>
              <span className="text-white font-medium font-mono">****{formData.to_account.slice(-4)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400 text-sm">Amount</span>
              <span className="text-white font-bold text-xl">${parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Enter Password to Confirm</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.verify_password}
              onChange={e => setFormData({...formData, verify_password: e.target.value})}
              className="form-input"
            />
          </div>

          {result?.type === 'error' && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {result.text}
            </div>
          )}

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 text-sm">
              Back
            </button>
            <button
              onClick={handleTransfer}
              disabled={isLoading || !formData.verify_password}
              className="flex-1 btn-primary text-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Transfer'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && result?.type === 'success' && (
        <div className="glass-card p-12 rounded-3xl text-center space-y-6 animate-pop-in">
          <div className="relative w-24 h-24 mx-auto">
            {/* Ping effect background */}
            <div className="absolute inset-0 bg-green-500/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            
            {/* Main icon background */}
            <div className="relative w-full h-full bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle className="w-12 h-12 text-green-400 animate-scale-in" style={{ animationDelay: '200ms' }} />
            </div>
          </div>
          
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-3xl font-display font-bold text-white mb-3">Transfer Complete!</h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">{result.text}</p>
          </div>
          
          <div className="pt-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <button onClick={resetForm} className="btn-primary px-10 py-3.5 rounded-full mx-auto text-sm font-semibold tracking-wide">
              Make Another Transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer;
