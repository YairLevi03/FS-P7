import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { RefreshCw, Plus, Trash2, Calendar } from 'lucide-react';

const StandingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this standing order?')) return;
    try {
      await api.delete(`/standing-orders/${id}`);
      setOrders(orders.filter(o => o.id !== id));
    } catch (err) {
      alert('Failed to cancel standing order.');
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;

  return (
    <div className="animate-fade-in standing-orders-container">
      <div className="flex justify-between items-center mb-2">
        <h2>Standing Orders</h2>
        <button className="btn-primary btn-sm" onClick={() => alert('New standing order form coming soon.')}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {error && <div className="alert-error p-4 rounded glass-card">{error}</div>}

      {orders.length === 0 ? (
        <div className="glass-card empty-state text-center py-12">
          <RefreshCw size={48} className="mx-auto mb-4 text-[#818cf8] opacity-50" />
          <h3>No Standing Orders</h3>
          <p className="text-[#94a3b8]">Set up recurring payments to automate your bills.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div key={order.id} className="card order-glass-card m-0">
              <div className="order-details">
                <h3 className="m-0 text-lg font-bold">Transfer to Account #{order.destination_account_id || 'External'}</h3>
                <div className="order-meta">
                  <span className="flex items-center gap-1 capitalize"><RefreshCw size={14} /> {order.frequency}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Next: {new Date(order.next_run_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="order-actions flex items-center gap-4">
                <span className="amount text-xl font-bold">{formatCurrency(order.amount)}</span>
                <button 
                  onClick={() => handleDelete(order.id)}
                  className="btn-secondary text-[#f87171] border-transparent hover:bg-[rgba(239, 68, 68, 0.1)] hover:border-[rgba(239, 68, 68, 0.2)] px-3"
                  title="Cancel Order"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StandingOrders;
