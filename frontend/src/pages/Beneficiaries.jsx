import React, { useState, useEffect } from 'react';
import { beneficiaryService } from '../services/api';
import { Users, UserPlus, XCircle, Loader2, Heart } from 'lucide-react';

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ account_number: '', nickname: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBeneficiaries();
    setTimeout(() => setContentVisible(true), 100);
  }, []);

  const fetchBeneficiaries = async () => {
    setIsLoading(true);
    try {
      const res = await beneficiaryService.getBeneficiaries();
      if (res.success) setBeneficiaries(res.beneficiaries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMsg({ type: '', text: '' });
    try {
      const res = await beneficiaryService.addBeneficiary(addForm);
      setAddMsg({ type: 'success', text: res.message || 'Beneficiary added!' });
      setShowAddModal(false);
      setAddForm({ account_number: '', nickname: '' });
      fetchBeneficiaries();
    } catch (err) {
      const msg = err.error || err.non_field_errors?.[0] || 'Failed to add beneficiary.';
      setAddMsg({ type: 'error', text: typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg });
    } finally {
      setAddLoading(false);
    }
  };

  const getInitials = (nickname, accNum) => {
    if (nickname) return nickname.slice(0, 2).toUpperCase();
    return accNum.slice(-2);
  };

  const colors = ['from-royal-600 to-royal-400', 'from-emerald-600 to-emerald-400', 'from-amber-600 to-amber-400', 'from-sky-600 to-sky-400', 'from-rose-600 to-rose-400'];

  return (
    <div className={`space-y-8 transition-all duration-[800ms] ease-out ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">Beneficiaries</h1>
          <p className="text-gray-400 text-sm">Manage your saved transfer recipients.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary px-5 py-2.5 rounded-full text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative glass-card p-8 rounded-3xl w-full max-w-md mx-4 animate-fade-in-up">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <XCircle className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Add Beneficiary</h2>
            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Account Number</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Account number"
                  value={addForm.account_number}
                  onChange={e => setAddForm({...addForm, account_number: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300 ml-1">Nickname (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mom, Rent"
                  value={addForm.nickname}
                  onChange={e => setAddForm({...addForm, nickname: e.target.value})}
                />
              </div>
              {addMsg.text && (
                <div className={`p-3 rounded-xl text-sm font-medium text-center ${addMsg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                  {addMsg.text}
                </div>
              )}
              <button type="submit" disabled={addLoading} className="w-full btn-primary">
                {addLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Beneficiary'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Beneficiary Grid */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-royal-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading beneficiaries...</p>
        </div>
      ) : beneficiaries.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Beneficiaries Yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add a beneficiary to quickly send funds.</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary px-8 py-3 rounded-full mx-auto text-sm">
            Add Your First
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beneficiaries.map((b, i) => (
            <div key={b.beneficiaryid} className="glass-card p-6 rounded-2xl group hover:border-royal-500/40">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-sm border border-white/20`}>
                  {getInitials(b.nickname, b.accountnumber)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{b.nickname || 'Unnamed'}</p>
                  <p className="text-xs text-gray-400 font-mono tracking-wider mt-0.5">****{b.accountnumber.slice(-4)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className={`text-xs px-2 py-1 rounded-full ${b.addedtype === 'AUTO' ? 'bg-royal-500/10 text-royal-300' : 'bg-white/5 text-gray-400'}`}>
                  {b.addedtype}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(b.createdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Beneficiaries;
