import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { Users, Search, Mail, Phone, X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { formatCurrency } from '../../utils/formatters';

const ManagerCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showAlert, showConfirm } = useModal();

  const fetchCustomers = async () => {
    try {
      const [custRes, accRes] = await Promise.all([
        api.get('/admin/customers'),
        api.get('/admin/accounts')
      ]);
      setCustomers(custRes.data);
      setFilteredCustomers(custRes.data);
      setAccounts(accRes.data);
    } catch (err) {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = customers.filter(c => 
      c.full_name.toLowerCase().includes(term) || 
      c.username.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
  };

  const toggleUserStatus = async (e, id, currentStatus) => {
    e.stopPropagation();
    try {
      const action = currentStatus === 'active' ? 'lock' : 'unlock';
      const verb = currentStatus === 'active' ? 'block' : 'unblock';
      const confirmed = await showConfirm(
        'Confirm Action', 
        `Are you sure you want to ${verb} this customer?`
      );
      if (confirmed) {
        await api.patch(`/admin/customers/${id}/${action}`);
        fetchCustomers();
        await showAlert('Success', `Customer has been ${verb}ed successfully.`);
      }
    } catch (err) {
      await showAlert('Error', err.response?.data?.message || `Failed to update customer status`);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;

  return (
    <div className="animate-fade-in customers-page">
      <div className="flex justify-between items-center mb-2">
        <h2>Client Directory</h2>
      </div>

      <div className="search-bar mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94a3b8]" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or username..." 
            className="input-field pl-10 m-0 w-full"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {error && <div className="alert-error p-4 rounded glass-card">{error}</div>}

      <div className="glass-card m-0 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 text-[#94a3b8] flex flex-col items-center">
            <Users size={48} className="opacity-50 mb-4" />
            <p>No customers found matching your search.</p>
          </div>
        ) : (
          <div className="table-container overflow-x-auto">
            <table className="w-full text-left border-collapse [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:text-slate-400 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)} 
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <td className="font-mono text-sm text-[#94a3b8]">
                      #{customer.id.toString().padStart(4, '0')}
                    </td>
                    <td className="font-semibold text-[#6366f1]">
                      {customer.full_name}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 text-sm text-[#94a3b8]">
                        <span className="flex items-center gap-1"><Users size={14} /> @{customer.username}</span>
                        {customer.phone && <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize ${
                        customer.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="text-sm">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={(e) => toggleUserStatus(e, customer.id, customer.status)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all duration-150 ${
                          customer.status === 'active' 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                        }`}
                      >
                        {customer.status === 'active' ? 'BLOCK' : 'UNBLOCK'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client Accounts Details Modal */}
      {selectedCustomer && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[3px]" onClick={() => setSelectedCustomer(null)} />
          
          {/* Modal Card */}
          <div className="glass-card max-w-lg w-full p-6 animate-slide-up relative z-10 !bg-[#1e293b] border border-white/10 shadow-2xl flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedCustomer.full_name}</h3>
                <p className="text-xs text-slate-400">Client ID: #{selectedCustomer.id.toString().padStart(4, '0')} • Username: @{selectedCustomer.username}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Client Bank Accounts</h4>
              <div className="flex flex-col gap-3">
                {accounts.filter(acc => acc.user_id === selectedCustomer.id).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">This client does not have any active bank accounts.</p>
                ) : (
                  accounts.filter(acc => acc.user_id === selectedCustomer.id).map(acc => (
                    <div key={acc.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="capitalize text-sm font-bold text-white">{acc.account_type} Account</span>
                        <p className="font-mono text-xs text-slate-400 mt-1">#{acc.account_number}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          acc.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {acc.status}
                        </span>
                        <p className="text-lg font-bold text-[#6366f1] mt-1">{formatCurrency(acc.balance, acc.currency)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button onClick={() => setSelectedCustomer(null)} className="btn-secondary px-5 py-2">
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ManagerCustomers;
