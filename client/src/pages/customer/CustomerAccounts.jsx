import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { CreditCard, History, Activity } from 'lucide-react';

const CustomerAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [accountTransactions, setAccountTransactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccountsAndTransactions = async () => {
      try {
        const response = await api.get('/accounts');
        const accountsList = response.data;
        setAccounts(accountsList);

        // Fetch transactions for each account
        const txPromises = accountsList.map(acc => api.get(`/accounts/${acc.id}/transactions`));
        const txResults = await Promise.all(txPromises);

        // Map account ID to its transactions list
        const txMap = {};
        accountsList.forEach((acc, index) => {
          txMap[acc.id] = txResults[index].data;
        });
        setAccountTransactions(txMap);
      } catch (err) {
        setError('Failed to load accounts and transaction history.');
      } finally {
        setLoading(false);
      }
    };
    fetchAccountsAndTransactions();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;
  if (error) return <div className="alert-error p-4 rounded glass-card">{error}</div>;

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">My Accounts</h2>
      
      {accounts.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center text-center py-12">
          <CreditCard size={48} className="text-slate-500 mb-4" />
          <h3 className="mb-2">No Accounts Found</h3>
          <p className="text-muted">You do not have any active accounts at the moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {accounts.map(acc => {
            const txs = accountTransactions[acc.id] || [];
            return (
              <div key={acc.id} className="glass-card flex flex-col gap-4 animate-slide-up">
                {/* Account Details Header */}
                <div className="flex justify-between items-start border-b border-white/10 pb-4 flex-wrap gap-4">
                  <div>
                    <h3 className="capitalize text-xl font-bold text-white mb-1">{acc.account_type} Account</h3>
                    <p className="font-mono text-sm text-[#94a3b8]">Account Number: {acc.account_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#94a3b8] mb-1">Available Balance</p>
                    <p className="text-2xl font-extrabold text-[#6366f1]">{formatCurrency(acc.balance, acc.currency)}</p>
                  </div>
                </div>

                {/* Transactions Table with Scrollbar */}
                <div className="overflow-x-auto">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                    <History size={16} /> Recent Transactions
                  </h4>
                  
                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {txs.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2">
                        <Activity size={32} className="opacity-50" />
                        <p className="text-sm">No transaction history found for this account.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:text-slate-400 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5 text-sm">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th className="text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {txs.slice(0, 4).map(tx => {
                            const isPositive = Number(tx.amount) > 0;
                            const amountClass = isPositive ? 'text-emerald-400' : 'text-red-400';
                            const prefix = isPositive ? '+' : '-';
                            
                            return (
                              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                <td className="text-[#94a3b8] whitespace-nowrap">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </td>
                                <td className="font-medium text-slate-200">{tx.description || 'System Transaction'}</td>
                                <td className="capitalize text-[#94a3b8]">{tx.type}</td>
                                <td className={`text-right font-bold ${amountClass}`}>
                                  {prefix}{formatCurrency(Math.abs(Number(tx.amount)))}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerAccounts;
