import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { CreditCard, Send, CheckCircle, AlertCircle } from 'lucide-react';

const Payments = () => {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    account_id: '',
    payee_name: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  useEffect(() => {
    api.get('/accounts').then(res => {
      setAccounts(res.data);
      if(res.data.length > 0) {
        setFormData(prev => ({...prev, account_id: res.data[0].id}));
      }
    }).catch(() => {
      showToast('error', 'Failed to load accounts.');
    });
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 5000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!formData.account_id) return 'Please select an account to pay from.';
    if (!formData.payee_name.trim()) return 'Payee name is required.';
    if (!formData.amount || Number(formData.amount) <= 0) return 'Please enter a valid amount greater than 0.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      showToast('error', validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/payments', formData);
      showToast('success', res.data.message || 'Payment processed successfully!');
      setFormData({ ...formData, payee_name: '', amount: '' });
      
      // Update account balances implicitly by re-fetching
      const accountsRes = await api.get('/accounts');
      setAccounts(accountsRes.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Payment failed';
      showToast('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h2>Pay Bills</h2>
      
      <div className="glass-card payments-form">
        {toast.message && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Pay From Account</label>
            <select 
              name="account_id" 
              className="input-field" 
              value={formData.account_id} 
              onChange={handleChange} 
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type.toUpperCase()} Account - {acc.account_number} ({formatCurrency(acc.balance, acc.currency)})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Biller / Payee Name</label>
            <input 
              type="text" 
              name="payee_name" 
              className="input-field" 
              value={formData.payee_name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Electric Company, Water Bill" 
            />
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

          <button 
            type="submit" 
            className="btn-primary w-full mt-4" 
            disabled={loading || accounts.length === 0}
          >
            <CreditCard size={18} /> {loading ? 'Processing Payment...' : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payments;
