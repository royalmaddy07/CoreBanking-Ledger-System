import React, { useState, useEffect } from 'react';
import { transactionService, accountService } from '../services/api';
import { FileText, ArrowUpRight, ArrowDownRight, Filter, Search } from 'lucide-react';

const Statements = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccounts();
    setTimeout(() => setContentVisible(true), 100);
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await accountService.getHomeData();
      if (res.accounts) setAccounts(res.accounts);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStatements = async (accNumber) => {
    setIsLoading(true);
    try {
      const res = await transactionService.getStatements(accNumber || null);
      if (res.success) {
        setTransactions(res.transactions || []);
      }
    } catch (e) {
      console.error(e);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountChange = (accNum) => {
    setSelectedAccount(accNum);
    fetchStatements(accNum);
  };

  useEffect(() => {
    // Fetch all statements on mount
    fetchStatements(null);
  }, []);

  const filtered = transactions.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.type?.toLowerCase().includes(term) ||
      t.amount?.toString().includes(term) ||
      t.created_at?.includes(term)
    );
  });

  return (
    <div className={`space-y-8 transition-all duration-[800ms] ease-out ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-1">Bank Statements</h1>
        <p className="text-gray-400 text-sm">View your complete transaction history.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input pl-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedAccount}
            onChange={e => handleAccountChange(e.target.value)}
            className="form-input min-w-[200px]"
          >
            <option value="">All Accounts</option>
            {accounts.map(a => (
              <option key={a.accountnumber} value={a.accountnumber}>
                {a.accounttype} - ****{a.accountnumber.slice(-4)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-white">{filtered.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total Entries</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-400">
            {filtered.filter(t => t.type?.toUpperCase() === 'CREDIT').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Credits</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-gray-300">
            {filtered.filter(t => t.type?.toUpperCase() === 'DEBIT').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Debits</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-royal-400">
            ${filtered.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total Volume</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-royal-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading statements...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Account</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((tx, i) => {
                  const isCredit = tx.type?.toUpperCase() === 'CREDIT';
                  return (
                    <tr key={tx.id || i} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-500/10' : 'bg-white/5'}`}>
                            {isCredit ? <ArrowDownRight className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-gray-400" />}
                          </div>
                          <span className={`text-sm font-medium ${isCredit ? 'text-green-400' : 'text-gray-300'}`}>
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isCredit ? 'text-green-400' : 'text-white'}`}>
                          {isCredit ? '+' : '-'}${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm font-mono hidden md:table-cell">
                        {tx.other_party ? `#${tx.other_party}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statements;
