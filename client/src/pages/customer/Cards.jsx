import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { CreditCard, Lock, Unlock, Plus } from 'lucide-react';
import { useModal } from '../../context/ModalContext';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showAlert, showConfirm } = useModal();
  
  // Request Card Form
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [newCardData, setNewCardData] = useState({ accountId: '', limitAmount: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsRes, accountsRes] = await Promise.all([
        api.get('/cards'),
        api.get('/accounts')
      ]);
      setCards(cardsRes.data);
      setAccounts(accountsRes.data);
      if (accountsRes.data.length > 0) {
        setNewCardData({ ...newCardData, accountId: accountsRes.data[0].id });
      }
    } catch (err) {
      setError('Failed to load credit cards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (cardId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      const verb = currentStatus === 'active' ? 'block' : 'unblock';
      const confirmed = await showConfirm(
        'Confirm Card Status Change',
        `Are you sure you want to ${verb} this card?`
      );
      if (!confirmed) return;

      await api.patch(`/cards/${cardId}/status`, { status: newStatus });
      fetchData(); // Refresh list
      await showAlert('Success', `Card has been ${verb}ed successfully.`);
    } catch (err) {
      await showAlert('Error', err.response?.data?.message || 'Failed to update card status');
    }
  };

  const handleRequestCard = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      await api.post('/cards/request', newCardData);
      setShowRequestForm(false);
      setNewCardData({ ...newCardData, limitAmount: '' });
      fetchData();
      await showAlert('Success', 'Credit card requested successfully.');
    } catch (err) {
      await showAlert('Error', err.response?.data?.message || 'Failed to request card');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2>Credit Cards</h2>
          <p className="text-muted">Manage your active credit cards and limits.</p>
        </div>
        <button onClick={() => setShowRequestForm(!showRequestForm)} className="btn-primary">
          <Plus size={18} /> Request New Card
        </button>
      </div>

      {error && <div className="alert-error p-4 rounded glass-card">{error}</div>}

      {showRequestForm && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="mb-4 text-[#818cf8]">Request a New Credit Card</h3>
          <form onSubmit={handleRequestCard} className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Link to Account</label>
              <select 
                className="input-field" 
                value={newCardData.accountId} 
                onChange={(e) => setNewCardData({ ...newCardData, accountId: e.target.value })}
                required
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-[#0f172a]">
                    {acc.account_type} - {acc.account_number}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Requested Limit (ILS)</label>
              <input 
                type="number" 
                className="input-field" 
                value={newCardData.limitAmount} 
                onChange={(e) => setNewCardData({ ...newCardData, limitAmount: e.target.value })}
                placeholder="5000"
                min="1000"
                required
              />
            </div>
            <button type="submit" className="btn-primary h-[50px] px-8" disabled={requestLoading}>
              {requestLoading ? 'Processing...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.length === 0 ? (
            <div className="glass-card col-span-full text-center py-8 text-muted">
              You don't have any active credit cards.
            </div>
          ) : (
            cards.map(card => (
              <div key={card.id} className="glass-card flex flex-col justify-between overflow-hidden relative">
                {card.status === 'blocked' && (
                  <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm z-10 flex items-center justify-center">
                    <span className="bg-red-500/80 text-white px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
                      <Lock size={16} /> BLOCKED
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                      <CreditCard size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-widest text-slate-300">VISA</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-1">Card Number</p>
                  <p className="text-lg text-white font-mono tracking-widest mb-4">
                    **** **** **** {card.card_number.slice(-4)}
                  </p>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-slate-400">Valid Thru</p>
                      <p className="text-white font-semibold">{card.expiration_date}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">CVV</p>
                      <p className="text-white font-semibold">***</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center z-20">
                  <div>
                    <p className="text-xs text-slate-400">Credit Limit</p>
                    <p className="text-[#34d399] font-bold">{formatCurrency(card.limit_amount)}</p>
                  </div>
                  <button 
                    onClick={() => handleToggleStatus(card.id, card.status)}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                      card.status === 'active' 
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {card.status === 'active' ? 'BLOCK CARD' : 'UNBLOCK CARD'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Cards;
