import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [standingOrders, setStandingOrders] = useState([]);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [accountsRes, ordersRes, ratesRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/standing-orders'),
          fetch('https://api.exchangerate-api.com/v4/latest/ILS').then(res => res.json()).catch(() => null)
        ]);
        setAccounts(accountsRes.data);
        setStandingOrders(ordersRes.data);
        if (ratesRes && ratesRes.rates) {
          setExchangeRates(ratesRes.rates);
        }
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;
  if (error) return <div className="alert-error p-4 rounded glass-card">{error}</div>;

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const savingsBalance = accounts.filter(acc => acc.account_type === 'savings').reduce((sum, acc) => sum + Number(acc.balance), 0);
  const savingsPercentage = totalBalance > 0 ? ((savingsBalance / totalBalance) * 100).toFixed(1) : 0;
  const activeOrders = standingOrders.filter(order => order.is_active);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Overview Section */}
      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-white tracking-tight">Financial Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Balance Card */}
          <div className="glass-card flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-muted uppercase tracking-wider font-semibold text-xs">Total Balance</span>
              <div className="p-2 rounded bg-[#0f172a] text-[#818cf8]">
                <Wallet size={20} />
              </div>
            </div>
            <h2 className="amount text-3xl font-extrabold mb-2 text-[#6366f1] tracking-tight">
              {formatCurrency(totalBalance)}
            </h2>
            <div className="flex gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-[#34d399] rounded flex items-center gap-1">
                {savingsPercentage}%
              </span>
              <span className="text-xs text-[#94a3b8] self-center">allocated in Savings</span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="glass-card flex flex-col justify-center">
             <p className="text-muted uppercase tracking-wider font-semibold mb-4 text-xs">Quick Actions</p>
             <div className="flex flex-col gap-3">
                <Link to="/customer/transfer" className="btn-primary w-full justify-center">
                  <ArrowUpRight size={18} /> Transfer Money
                </Link>
                <Link to="/customer/payments" className="btn-secondary w-full justify-center">
                  <ArrowDownRight size={18} /> Pay Bills
                </Link>
             </div>
          </div>

          {/* Exchange Rates Card */}
           <div className="glass-card flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-muted uppercase tracking-wider font-semibold text-xs">Exchange Rates</span>
                <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
                  <Activity size={20} />
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {exchangeRates ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">1 USD =</span>
                      <span className="font-bold text-[#34d399]">{(1 / exchangeRates.USD).toFixed(2)} ₪</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">1 EUR =</span>
                      <span className="font-bold text-[#34d399]">{(1 / exchangeRates.EUR).toFixed(2)} ₪</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">1 GBP =</span>
                      <span className="font-bold text-[#34d399]">{(1 / exchangeRates.GBP).toFixed(2)} ₪</span>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">Loading live rates...</span>
                )}
              </div>
           </div>

          {/* Alerts Panel Card */}
          <div className="glass-card flex flex-col">
             <p className="text-muted uppercase tracking-wider font-semibold mb-4 flex items-center gap-2 text-xs">
               <Activity size={18} className="text-amber-400 animate-pulse" /> System Alerts
             </p>
             <div className="flex flex-col gap-3 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
                {!accounts.some(acc => acc.balance < 1000) && activeOrders.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">No critical alerts or upcoming standing orders.</p>
                )}
                {accounts.some(acc => acc.balance < 1000) && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 animate-pulse"></div>
                    <div>
                      <p className="text-sm text-amber-400 font-semibold mb-0.5">Low Balance Alert</p>
                      <p className="text-xs text-slate-400">One of your accounts has a balance below 1,000 ILS.</p>
                    </div>
                  </div>
                )}
                {activeOrders.map(order => (
                  <div key={order.id} className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-start gap-3 animate-fade-in">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-indigo-400 font-semibold mb-0.5">Upcoming Standing Order</p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(order.amount)} scheduled for transfer on {new Date(order.next_run_date).toLocaleDateString()}.
                      </p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Accounts List */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Accounts</h2>
        </div>

        {accounts.length === 0 ? (
          <div className="glass-card text-center py-8 text-[#94a3b8]">
            You don't have any accounts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(account => (
              <div key={account.id} className="card glass-card-hover flex flex-col justify-between cursor-pointer">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center text-[#818cf8]">
                      <Activity size={20} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      account.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      account.status === 'frozen' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {account.status}
                    </span>
                  </div>
                  <h3 className="capitalize mb-1 text-[#6366f1]">{account.account_type} Account</h3>
                  <p className="text-xs text-[#94a3b8]">Account Number</p>
                  <p className="account-number text-sm text-[#f8fafc] mb-4">{account.account_number}</p>
                </div>
                
                <div className="pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <p className="text-xs text-[#94a3b8] mb-1">Available Balance</p>
                  <p className="amount text-2xl font-bold text-[#6366f1]">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerDashboard;
