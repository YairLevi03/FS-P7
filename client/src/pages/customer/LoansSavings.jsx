import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { PiggyBank, Landmark, Percent, X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const LoansSavings = () => {
  const [loans, setLoans] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showAlert, showConfirm } = useModal();

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  // Loan Request State
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('12');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  // Deposit State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTerm, setDepositTerm] = useState('6');
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loansRes, depositsRes] = await Promise.all([
        api.get('/loans/my-loans'),
        api.get('/deposits/my-deposits')
      ]);
      setLoans(loansRes.data);
      setDeposits(depositsRes.data);
    } catch (err) {
      setError('Failed to load loans and savings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      await api.post('/loans/request', { amount: loanAmount, termMonths: loanTerm, purpose: loanPurpose });
      setLoanAmount('');
      setLoanPurpose('');
      fetchData();
      await showAlert('Success', 'Loan request submitted successfully.');
    } catch (err) {
      await showAlert('Error', err.response?.data?.message || 'Failed to request loan');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOpenDeposit = async (e) => {
    e.preventDefault();
    setDepositLoading(true);
    try {
      await api.post('/deposits/open', { amount: depositAmount, termMonths: depositTerm });
      setDepositAmount('');
      fetchData();
      await showAlert('Success', 'Savings deposit opened successfully.');
    } catch (err) {
      await showAlert('Error', err.response?.data?.message || 'Failed to open deposit');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleBreakDeposit = async (id) => {
    const confirmed = await showConfirm(
      'Break Deposit Early',
      'Are you sure you want to break this deposit? You will lose accrued interest.'
    );
    if (!confirmed) return;
    try {
      await api.patch(`/deposits/${id}/break`);
      fetchData();
      await showAlert('Success', 'Deposit broken successfully.');
    } catch (err) {
      await showAlert('Error', err.response?.data?.message || 'Failed to break deposit');
    }
  };

  // Calculator logic
  const calculateMonthlyPayment = (amount, months) => {
    const rate = months > 36 ? 5.5 : 3.5;
    const monthlyRate = (rate / 100) / 12;
    const principal = parseFloat(amount);
    if (!principal) return 0;
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    return payment.toFixed(2);
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2>Loans & Savings</h2>
          <p className="text-muted">Manage your financial growth and credit.</p>
        </div>
      </div>

      {error && <div className="alert-error p-4 rounded glass-card">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* LOANS SECTION */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border-t-4 border-t-[#818cf8]">
            <h3 className="flex items-center gap-2 mb-6 text-[#818cf8]"><Landmark size={20} /> Request a Loan</h3>
            <form onSubmit={handleRequestLoan} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (ILS)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-lg">₪</span>
                  <input 
                    type="number" 
                    className="input-field pl-9" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(e.target.value)} 
                    placeholder="10000" 
                    min="1000"
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Term (Months)</label>
                <select className="input-field" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)}>
                  <option value="12" className="bg-[#0f172a]">12 Months (3.5% APY)</option>
                  <option value="24" className="bg-[#0f172a]">24 Months (3.5% APY)</option>
                  <option value="36" className="bg-[#0f172a]">36 Months (3.5% APY)</option>
                  <option value="48" className="bg-[#0f172a]">48 Months (5.5% APY)</option>
                  <option value="60" className="bg-[#0f172a]">60 Months (5.5% APY)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Purpose</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={loanPurpose} 
                  onChange={(e) => setLoanPurpose(e.target.value)} 
                  placeholder="e.g. Car Purchase, Home Renovation" 
                  required 
                />
              </div>

              {loanAmount && (
                <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-xl flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-300">Estimated Monthly Payment:</span>
                  <span className="text-xl font-bold text-white">{formatCurrency(calculateMonthlyPayment(loanAmount, loanTerm))}</span>
                </div>
              )}

              <button type="submit" className="btn-primary mt-2" disabled={requestLoading}>
                {requestLoading ? 'Submitting...' : 'Submit Loan Request'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <h3 className="mb-4 text-white font-semibold">My Loans</h3>
            {loading ? <Loader size="sm" /> : (
              <div className="flex flex-col gap-3">
                {loans.length === 0 ? (
                  <p className="text-muted text-sm text-center py-4">No loan history.</p>
                ) : (
                  loans.map(loan => (
                    <div 
                      key={loan.id} 
                      onClick={() => setSelectedLoan(loan)}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-white">{formatCurrency(loan.amount)}</p>
                        <p className="text-xs text-slate-400">{formatDate(loan.created_at)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          loan.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                          loan.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* SAVINGS SECTION */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border-t-4 border-t-[#34d399]">
            <h3 className="flex items-center gap-2 mb-6 text-[#34d399]"><PiggyBank size={20} /> Open a Savings Deposit</h3>
            <form onSubmit={handleOpenDeposit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Deposit Amount (ILS)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-lg">₪</span>
                  <input 
                    type="number" 
                    className="input-field pl-9" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(e.target.value)} 
                    placeholder="5000" 
                    min="1000"
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Term</label>
                <select className="input-field" value={depositTerm} onChange={(e) => setDepositTerm(e.target.value)}>
                  <option value="6" className="bg-[#0f172a]">6 Months (2.5% APY)</option>
                  <option value="12" className="bg-[#0f172a]">12 Months (4.0% APY)</option>
                  <option value="24" className="bg-[#0f172a]">24 Months (4.0% APY)</option>
                </select>
              </div>

              {depositAmount && (
                <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-300">Estimated Yield at Maturity:</span>
                  <span className="text-xl font-bold text-[#34d399]">
                    +{formatCurrency(parseFloat(depositAmount) * ((depositTerm >= 12 ? 4.0 : 2.5) / 100) * (depositTerm/12))}
                  </span>
                </div>
              )}

              <button type="submit" className="btn-primary !bg-[#34d399] hover:!bg-[#10b981] mt-2" disabled={depositLoading}>
                {depositLoading ? 'Processing...' : 'Open Deposit'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <h3 className="mb-4 text-white font-semibold">Active Deposits</h3>
            {loading ? <Loader size="sm" /> : (
              <div className="flex flex-col gap-3">
                {deposits.length === 0 ? (
                  <p className="text-muted text-sm text-center py-4">No active savings deposits.</p>
                ) : (
                  deposits.map(dep => (
                    <div 
                      key={dep.id} 
                      onClick={() => setSelectedDeposit(dep)}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-white">{formatCurrency(dep.amount)}</p>
                        <p className="text-xs text-slate-400">{formatDate(dep.created_at)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          dep.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 
                          dep.status === 'matured' ? 'bg-indigo-500/20 text-indigo-400' : 
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {dep.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Loan Modal */}
      {selectedLoan && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[3px]" onClick={() => setSelectedLoan(null)} />
          <div className="glass-card max-w-sm w-full p-6 animate-slide-up relative z-10 !bg-[#1e293b] border border-white/10 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Loan Details</h3>
                <p className="text-xs text-slate-400">Requested: {formatDate(selectedLoan.created_at)}</p>
              </div>
              <button onClick={() => setSelectedLoan(null)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Amount</span>
                <span className="font-bold text-white">{formatCurrency(selectedLoan.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Purpose</span>
                <span className="text-white capitalize">{selectedLoan.purpose}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Term</span>
                <span className="text-white">{selectedLoan.term_months} Months</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                  selectedLoan.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 
                  selectedLoan.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {selectedLoan.status}
                </span>
              </div>
            </div>

            {selectedLoan.status === 'approved' && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Repayment Progress</span>
                  <span className="text-[#818cf8] font-bold">
                    {Math.min(100, Math.round(((Date.now() - new Date(selectedLoan.created_at).getTime()) / (selectedLoan.term_months * 30 * 24 * 60 * 60 * 1000)) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-[#818cf8] h-2 rounded-full" style={{ width: `${Math.min(100, Math.round(((Date.now() - new Date(selectedLoan.created_at).getTime()) / (selectedLoan.term_months * 30 * 24 * 60 * 60 * 1000)) * 100))}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Selected Deposit Modal */}
      {selectedDeposit && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[3px]" onClick={() => setSelectedDeposit(null)} />
          <div className="glass-card max-w-sm w-full p-6 animate-slide-up relative z-10 !bg-[#1e293b] border border-white/10 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Deposit Details</h3>
                <p className="text-xs text-slate-400">Opened: {formatDate(selectedDeposit.created_at)}</p>
              </div>
              <button onClick={() => setSelectedDeposit(null)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Amount</span>
                <span className="font-bold text-white">{formatCurrency(selectedDeposit.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Interest Rate</span>
                <span className="text-[#34d399]">{selectedDeposit.interest_rate}% APY</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Maturity Date</span>
                <span className="text-white">{formatDate(selectedDeposit.maturity_date)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400 text-sm">Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                  selectedDeposit.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 
                  selectedDeposit.status === 'matured' ? 'bg-indigo-500/20 text-indigo-400' : 
                  'bg-red-500/20 text-red-400'
                }`}>
                  {selectedDeposit.status}
                </span>
              </div>
            </div>

            {selectedDeposit.status === 'active' && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Term Progress</span>
                  <span className="text-[#34d399] font-bold">
                    {Math.min(100, Math.round(((Date.now() - new Date(selectedDeposit.created_at).getTime()) / (new Date(selectedDeposit.maturity_date).getTime() - new Date(selectedDeposit.created_at).getTime())) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                  <div className="bg-[#34d399] h-2 rounded-full" style={{ width: `${Math.min(100, Math.round(((Date.now() - new Date(selectedDeposit.created_at).getTime()) / (new Date(selectedDeposit.maturity_date).getTime() - new Date(selectedDeposit.created_at).getTime())) * 100))}%` }}></div>
                </div>
                <button 
                  onClick={() => { setSelectedDeposit(null); handleBreakDeposit(selectedDeposit.id); }}
                  className="w-full text-red-400 hover:text-red-300 font-semibold border border-red-500/30 bg-red-500/10 py-2 rounded-lg text-sm transition-colors"
                >
                  Break Deposit Early
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default LoansSavings;
