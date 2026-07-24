import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { Upload, Search, Download, Filter, FileText } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Deposit Check State
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccountId, setDepositAccountId] = useState('');
  const [checkImage, setCheckImage] = useState(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState('');
  
  // Filter State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    type: '',
    accountNumber: ''
  });

  const fileInputRef = useRef(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/transactions?${queryParams}`);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
      if (response.data.length > 0) {
        setDepositAccountId(response.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCheckImage(e.target.files[0]);
    }
  };

  const handleCheckDeposit = async (e) => {
    e.preventDefault();
    if (!checkImage || !depositAmount) return;
    
    setDepositLoading(true);
    setDepositSuccess('');
    setError('');
    
    const formData = new FormData();
    formData.append('accountId', depositAccountId);
    formData.append('amount', depositAmount);
    formData.append('checkImage', checkImage);

    try {
      await api.post('/transactions/deposit-check', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDepositSuccess('Check deposited successfully!');
      setDepositAmount('');
      setCheckImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deposit check');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleExport = (format) => {
    // Simulate export
    alert(`Exporting transaction history to ${format}...`);
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2>Transactions & Deposits</h2>
          <p className="text-muted">Manage your transactions and deposit checks online.</p>
        </div>
      </div>

      {error && <div className="alert-error p-4 rounded glass-card">{error}</div>}
      {depositSuccess && <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl mb-4">{depositSuccess}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check Deposit Simulation Card */}
        <div className="glass-card flex flex-col p-6">
          <h3 className="flex items-center gap-2 mb-4 text-[#818cf8]"><Upload size={20} /> Check Deposit</h3>
          <form onSubmit={handleCheckDeposit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Account</label>
              <select 
                className="input-field" 
                value={depositAccountId} 
                onChange={(e) => setDepositAccountId(e.target.value)}
                required
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-[#0f172a] text-white">
                    {acc.account_type} - {acc.account_number} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount</label>
              <input 
                type="number" 
                className="input-field" 
                value={depositAmount} 
                onChange={(e) => setDepositAmount(e.target.value)} 
                required 
                min="0.01" 
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Upload Check Image (JPEG/PNG)</label>
              <input 
                type="file" 
                ref={fileInputRef}
                className="block w-full text-sm text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-500/10 file:text-indigo-400
                  hover:file:bg-indigo-500/20 cursor-pointer"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleFileChange}
                required
              />
            </div>

            <button type="submit" className="btn-primary mt-2" disabled={depositLoading}>
              {depositLoading ? 'Processing...' : 'Deposit Check'}
            </button>
          </form>
        </div>

        {/* Filters and History */}
        <div className="glass-card lg:col-span-2 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="flex items-center gap-2 text-[#818cf8]"><Filter size={20} /> Transaction History</h3>
            <div className="flex gap-2">
              <button onClick={() => handleExport('PDF')} className="btn-secondary text-sm px-3 py-1.5"><FileText size={16} /> PDF</button>
              <button onClick={() => handleExport('Excel')} className="btn-secondary text-sm px-3 py-1.5"><Download size={16} /> Excel</button>
            </div>
          </div>

          <form onSubmit={handleApplyFilters} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input-field py-2 text-sm" placeholder="Start Date" />
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input-field py-2 text-sm" placeholder="End Date" />
            <input type="number" name="minAmount" value={filters.minAmount} onChange={handleFilterChange} className="input-field py-2 text-sm" placeholder="Min Amount" />
            <input type="number" name="maxAmount" value={filters.maxAmount} onChange={handleFilterChange} className="input-field py-2 text-sm" placeholder="Max Amount" />
            <select name="type" value={filters.type} onChange={handleFilterChange} className="input-field py-2 text-sm">
              <option value="" className="bg-[#0f172a]">All Types</option>
              <option value="deposit" className="bg-[#0f172a]">Deposit</option>
              <option value="withdrawal" className="bg-[#0f172a]">Withdrawal</option>
              <option value="transfer" className="bg-[#0f172a]">Transfer</option>
              <option value="payment" className="bg-[#0f172a]">Payment</option>
              <option value="check_deposit" className="bg-[#0f172a]">Check Deposit</option>
            </select>
            <input type="text" name="accountNumber" value={filters.accountNumber} onChange={handleFilterChange} className="input-field py-2 text-sm" placeholder="Acc Number" />
            <button type="submit" className="btn-primary py-2 md:col-span-2 text-sm"><Search size={16} /> Apply Filters</button>
          </form>

          {loading ? (
            <div className="flex justify-center py-8"><Loader size="md" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:text-slate-400 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5 text-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th>Description / Payee</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No transactions found.</td></tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td>{formatDate(tx.created_at)}</td>
                        <td>{tx.account_number}</td>
                        <td className="capitalize">{tx.type.replace('_', ' ')}</td>
                        <td>{tx.payee_name || tx.description}</td>
                        <td className={`font-semibold ${tx.type === 'deposit' || tx.type === 'check_deposit' || (tx.type === 'transfer' && tx.related_account_id) ? 'text-[#34d399]' : 'text-white'}`}>
                          {tx.type === 'deposit' || tx.type === 'check_deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
