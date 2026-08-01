import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { RefreshCw, Plus, Trash2, Calendar, X, AlertCircle, CheckCircle, ArrowRight, DollarSign, Clock } from 'lucide-react';

const StandingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    source_account_id: '',
    target_account_number: '',
    amount: '',
    frequency: 'monthly',
    next_run_date: '',
    duration_type: 'indefinite', // indefinite or set_end
    end_date: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await api.get('/standing-orders');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load standing orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
      const activeAccounts = res.data.filter(a => a.status === 'active');
      if(activeAccounts.length > 0) {
        setFormData(prev => ({...prev, source_account_id: activeAccounts[0].id}));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAccounts();
  }, []);

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this standing order?')) return;
    try {
      await api.delete(`/standing-orders/${id}`);
      setOrders(orders.filter(o => o.id !== id));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      alert('Failed to cancel standing order.');
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    
    try {
      const payload = {
        source_account_id: formData.source_account_id,
        target_account_number: formData.target_account_number,
        amount: formData.amount,
        frequency: formData.frequency,
        next_run_date: formData.next_run_date,
      };
      
      if (formData.duration_type === 'set_end' && formData.end_date) {
        payload.end_date = formData.end_date;
      }
      
      await api.post('/standing-orders', payload);
      setIsCreateModalOpen(false);
      fetchOrders(); // refresh list
      // reset form
      setFormData(prev => ({
        ...prev, 
        target_account_number: '', amount: '', next_run_date: '', end_date: '', duration_type: 'indefinite'
      }));
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create standing order.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;

  return (
    <div className="animate-fade-in standing-orders-container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>Standing Orders</h2>
          <p className="text-muted">Manage your automated recurring transfers.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} /> New Order
        </button>
      </div>

      {error && <div className="alert-error p-4 rounded glass-card">{error}</div>}

      {orders.length === 0 ? (
        <div className="glass-card empty-state text-center py-16">
          <RefreshCw size={56} className="mx-auto mb-4 text-[#818cf8] opacity-50" />
          <h3 className="text-xl">No Standing Orders</h3>
          <p className="text-[#94a3b8] max-w-md mx-auto mt-2">Set up recurring transfers to automate your savings or pay monthly obligations effortlessly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="glass-card cursor-pointer hover:bg-white/5 transition-all p-5 flex flex-col gap-3 relative overflow-hidden group"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#818cf8]"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">To Account #{order.target_account_number || order.target_account_id || 'External'}</h3>
                  <div className="flex items-center gap-3 text-sm text-[#94a3b8]">
                    <span className="flex items-center gap-1 capitalize"><RefreshCw size={14} /> {order.frequency}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> Next: {new Date(order.next_run_date).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-bold text-[#34d399]">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <RefreshCw className="text-[#818cf8]" /> Order Details
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">From Account</span>
                  <span className="text-white font-medium">#{selectedOrder.source_account_number || selectedOrder.source_account_id}</span>
                </div>
                <ArrowRight className="text-[#818cf8] opacity-50" />
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">To Account</span>
                  <span className="text-white font-medium">#{selectedOrder.target_account_number || selectedOrder.target_account_id}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl flex flex-col">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Amount</span>
                  <span className="text-xl font-bold text-[#34d399]">{formatCurrency(selectedOrder.amount)}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl flex flex-col">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Frequency</span>
                  <span className="text-white capitalize font-medium">{selectedOrder.frequency}</span>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Status</span>
                  <span className={`text-sm font-bold ${selectedOrder.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedOrder.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Next Scheduled Run</span>
                  <span className="text-sm text-white font-medium">{new Date(selectedOrder.next_run_date).toLocaleDateString('he-IL')}</span>
                </div>
                {selectedOrder.end_date && (
                  <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                    <span className="text-sm text-slate-400">Ends On</span>
                    <span className="text-sm text-white font-medium">{new Date(selectedOrder.end_date).toLocaleDateString('he-IL')}</span>
                  </div>
                )}
                {!selectedOrder.end_date && (
                  <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                    <span className="text-sm text-slate-400">Ends On</span>
                    <span className="text-sm text-white font-medium">Indefinite (Until Canceled)</span>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={(e) => handleDelete(selectedOrder.id, e)}
              className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} /> Cancel Standing Order
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setIsCreateModalOpen(false)}>
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Create Standing Order</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {formError && (
              <div className="alert-error p-3 rounded mb-4 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">From Account</label>
                <select 
                  name="source_account_id" 
                  className="input-field" 
                  value={formData.source_account_id} 
                  onChange={handleFormChange} 
                  required
                >
                  {accounts.map(acc => {
                    const isDisabled = acc.status !== 'active';
                    return (
                      <option key={acc.id} value={acc.id} className="bg-[#0f172a] text-white" disabled={isDisabled}>
                        {acc.account_type.toUpperCase()} - {acc.account_number} ({formatCurrency(acc.balance)}) {isDisabled ? `(${acc.status})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Target Account Number</label>
                <input 
                  type="text" 
                  name="target_account_number" 
                  className="input-field" 
                  value={formData.target_account_number} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="e.g. 10000001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (₪)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  name="amount" 
                  className="input-field" 
                  value={formData.amount} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Frequency</label>
                  <select 
                    name="frequency" 
                    className="input-field" 
                    value={formData.frequency} 
                    onChange={handleFormChange} 
                    required
                  >
                    <option value="daily" className="bg-[#0f172a]">Daily</option>
                    <option value="weekly" className="bg-[#0f172a]">Weekly</option>
                    <option value="monthly" className="bg-[#0f172a]">Monthly</option>
                    <option value="yearly" className="bg-[#0f172a]">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
                  <input 
                    type="date" 
                    name="next_run_date" 
                    className="input-field" 
                    value={formData.next_run_date} 
                    onChange={handleFormChange} 
                    required 
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input 
                      type="radio" 
                      name="duration_type" 
                      value="indefinite"
                      checked={formData.duration_type === 'indefinite'}
                      onChange={handleFormChange}
                      className="accent-[#818cf8]"
                    />
                    Indefinite (Until Canceled)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input 
                      type="radio" 
                      name="duration_type" 
                      value="set_end"
                      checked={formData.duration_type === 'set_end'}
                      onChange={handleFormChange}
                      className="accent-[#818cf8]"
                    />
                    Set End Date
                  </label>
                </div>
                
                {formData.duration_type === 'set_end' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Stop automatic transfers after:</label>
                    <input 
                      type="date" 
                      name="end_date" 
                      className="input-field" 
                      value={formData.end_date} 
                      onChange={handleFormChange} 
                      required={formData.duration_type === 'set_end'}
                      min={formData.next_run_date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full mt-4" 
                disabled={formLoading}
              >
                {formLoading ? 'Creating...' : 'Create Standing Order'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default StandingOrders;
