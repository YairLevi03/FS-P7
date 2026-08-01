import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Send } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const TransferForm = () => {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    source_account_id: '',
    target_account_number: '',
    amount: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/accounts').then(res => {
      setAccounts(res.data);
      if(res.data.length > 0) {
        const activeAccounts = res.data.filter(a => a.status === 'active');
        if (activeAccounts.length > 0) {
          setFormData(prev => ({...prev, source_account_id: activeAccounts[0].id}));
        }
      }
    });
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await api.post('/transfers', formData);
      setSuccess(res.data.message || 'Transfer completed successfully');
      setFormData({ ...formData, amount: '', description: '', target_account_number: '' });
      
      // Refresh accounts
      const accountsRes = await api.get('/accounts');
      setAccounts(accountsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h2>Transfer Funds</h2>
      
      <div className="glass-card">
        {error && (
          <div className="alert-error p-3 rounded mb-6 text-sm text-center font-medium border border-[rgba(239, 68, 68, 0.2)]">
            {error}
          </div>
        )}
        
        {success && (
          <div className="btn p-3 rounded mb-6 text-sm text-center font-medium bg-[rgba(16, 185, 129, 0.1)] text-[#34d399] border border-[rgba(16, 185, 129, 0.2)] w-full cursor-default">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">From Account</label>
            <select 
              name="source_account_id" 
              className="input-field" 
              value={formData.source_account_id} 
              onChange={handleChange} 
              required
            >
              {accounts.map(acc => {
                const isDisabled = acc.status !== 'active';
                return (
                  <option key={acc.id} value={acc.id} className="bg-[#0f172a] text-white" disabled={isDisabled}>
                    {acc.account_type.toUpperCase()} Account - {acc.account_number} ({formatCurrency(acc.balance, acc.currency)}) {isDisabled ? `(${acc.status})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Recipient Account Number</label>
            <input 
              type="text" 
              name="target_account_number" 
              className="input-field" 
              value={formData.target_account_number} 
              onChange={handleChange} 
              required 
              placeholder="e.g. 10000001" 
            />
            <span className="text-xs text-[#94a3b8] mt-1">
              Enter the recipient's account number to send funds.
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01" 
                min="0.01" 
                name="amount" 
                className="input-field amount" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
                placeholder="0.00" 
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (Optional)</label>
            <input 
              type="text" 
              name="description" 
              className="input-field" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="e.g. Rent Payment, Dinner, etc." 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full mt-4" 
            disabled={loading || accounts.length === 0}
          >
            <Send size={18} /> {loading ? 'Processing Transfer...' : 'Send Money'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;
