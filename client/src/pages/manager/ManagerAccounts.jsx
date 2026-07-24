import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { Shield, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const ManagerAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: '', message: '' });
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/admin/accounts');
      setAccounts(response.data);
      setFilteredAccounts(response.data);
    } catch (err) {
      showToast('error', 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 5000);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = accounts.filter(acc => 
      acc.account_number.toLowerCase().includes(term) || 
      (acc.full_name && acc.full_name.toLowerCase().includes(term))
    );
    setFilteredAccounts(filtered);
  };

  const handleStatusChange = async (accountId, newStatus) => {
    try {
      const confirmed = await showConfirm(
        'Confirm Account Status Change',
        `Are you sure you want to change this account's status to ${newStatus}?`
      );
      if (!confirmed) return;
      
      await api.put(`/admin/accounts/${accountId}/status`, { status: newStatus });
      await showAlert('Success', `Account status updated to ${newStatus}`);
      // Optimistic update
      setAccounts(accounts.map(acc => acc.id === accountId ? { ...acc, status: newStatus } : acc));
      setFilteredAccounts(filteredAccounts.map(acc => acc.id === accountId ? { ...acc, status: newStatus } : acc));
    } catch (err) {
      await showAlert('Error', 'Failed to update account status.');
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;

  return (
    <div className="animate-fade-in manager-accounts-page">
      <h2>Accounts Management</h2>

      {toast.message && (
        <div className={`p-3 rounded mb-4 flex items-center gap-2 font-medium ${toast.type === 'success' ? 'bg-[rgba(16, 185, 129, 0.1)] text-[#34d399]' : 'bg-[rgba(239, 68, 68, 0.1)] text-[#f87171]'}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {toast.message}
        </div>
      )}

      <div className="search-bar mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94a3b8]" size={18} />
          <input 
            type="text" 
            placeholder="Search by account number or customer name..." 
            className="input-field pl-10 m-0"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="glass-card m-0 overflow-hidden">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 text-[#94a3b8] flex flex-col items-center">
            <Shield size={48} className="opacity-50 mb-4" />
            <p>No accounts found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full text-left border-collapse [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:text-slate-400 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Customer Name</th>
                  <th>Type</th>
                  <th className="text-right">Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map(acc => (
                  <tr key={acc.id}>
                    <td className="account-number font-medium">{acc.account_number}</td>
                    <td className="font-semibold">{acc.full_name || 'N/A'}</td>
                    <td className="capitalize text-[#94a3b8]">{acc.account_type}</td>
                    <td className="amount text-right font-bold">{formatCurrency(acc.balance, acc.currency)}</td>
                    <td>
                      <select 
                        className={`bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize cursor-pointer ${
                          acc.status === 'active' ? 'text-emerald-400' :
                          acc.status === 'frozen' ? 'text-amber-400' : 'text-red-400'
                        }`}
                        value={acc.status}
                        onChange={(e) => handleStatusChange(acc.id, e.target.value)}
                      >
                        <option value="active" className="bg-[#1e293b] text-emerald-400 font-semibold">Active</option>
                        <option value="frozen" className="bg-[#1e293b] text-amber-400 font-semibold">Frozen</option>
                        <option value="closed" className="bg-[#1e293b] text-red-400 font-semibold">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerAccounts;
