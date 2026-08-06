import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { ShieldAlert, Landmark, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const ManagerApprovals = () => {
  const [pendingTx, setPendingTx] = useState([]);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [penRes, loansRes] = await Promise.all([
          api.get('/admin/transactions/pending'),
          api.get('/loans/pending')
        ]);
        setPendingTx(penRes.data);
        setPendingLoans(loansRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id, decision) => {
    try {
      await api.put(`/admin/transactions/${id}/approve`, { decision });
      setPendingTx(pendingTx.filter(tx => tx.id !== id));
    } catch (err) {
      alert('Failed to process transaction');
    }
  };

  const handleLoanApprove = async (id, decision) => {
    try {
      const endpoint = decision === 'approve' ? 'approve' : 'reject';
      await api.patch(`/loans/${id}/${endpoint}`);
      setPendingLoans(pendingLoans.filter(loan => loan.id !== id));
    } catch (err) {
      alert('Failed to process loan');
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="flex items-center gap-2">
            <CheckCircle size={28} className="text-[#6366f1]" /> Pending Approvals
          </h2>
          <p className="text-muted">Review and process pending transactions and loan requests.</p>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <section className="glass-card">
        <h3 className="flex items-center gap-2 mb-4 text-[#6366f1]">
          <ShieldAlert className="text-[#f87171]" /> High-Value Transactions
        </h3>
        
        {pendingTx.length === 0 ? (
          <p className="text-center py-6 text-[#94a3b8]">
            No pending transactions require approval at this time.
          </p>
        ) : (
          <div className="table-container">
            <table className="w-full text-left border-collapse [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:text-slate-400 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTx.map(tx => (
                  <tr key={tx.id}>
                    <td className="account-number">#{tx.id}</td>
                    <td className="capitalize font-semibold text-[#6366f1]">{tx.type.replace('_', ' ')}</td>
                    <td className={`amount text-lg font-bold ${tx.amount < 0 ? 'negative' : 'positive'}`}>
                      {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                    </td>
                    <td className="text-sm text-[#94a3b8]">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApprove(tx.id, 'completed')} 
                          className="btn-primary"
                          style={{ minHeight: '36px', padding: '6px 12px', fontSize: '13px' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleApprove(tx.id, 'rejected')} 
                          className="btn alert-error"
                          style={{ minHeight: '36px', padding: '6px 12px', fontSize: '13px' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pending Loans Approvals Table */}
      <section className="glass-card">
        <h3 className="flex items-center gap-2 mb-4 text-[#6366f1]">
          <Landmark className="text-[#818cf8]" /> Loan Requests
        </h3>
        
        {pendingLoans.length === 0 ? (
          <p className="text-center py-6 text-[#94a3b8]">
            No pending loan requests require approval at this time.
          </p>
        ) : (
          <div className="table-container">
            <table className="w-full text-left border-collapse [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:text-slate-400 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Term / Rate</th>
                  <th>Purpose</th>
                  <th>Date Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLoans.map(loan => (
                  <tr key={loan.id}>
                    <td className="font-semibold text-[#6366f1]">{loan.full_name}</td>
                    <td className="amount text-lg font-bold text-white">
                      {formatCurrency(loan.amount)}
                    </td>
                    <td>
                      <div className="text-sm">
                        <span className="text-slate-300">{loan.term_months} Months</span>
                        <br />
                        <span className="text-xs text-[#34d399]">{loan.interest_rate}% APY</span>
                      </div>
                    </td>
                    <td className="text-sm text-slate-300">{loan.purpose}</td>
                    <td className="text-sm text-[#94a3b8]">
                      {new Date(loan.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleLoanApprove(loan.id, 'approve')} 
                          className="btn-primary"
                          style={{ minHeight: '36px', padding: '6px 12px', fontSize: '13px' }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleLoanApprove(loan.id, 'reject')} 
                          className="btn alert-error bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                          style={{ minHeight: '36px', padding: '6px 12px', fontSize: '13px' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ManagerApprovals;
