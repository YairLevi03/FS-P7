import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { ShieldAlert, Users, CreditCard, Landmark, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const ManagerDashboard = () => {
  const [reports, setReports] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repRes, alertsRes] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/admin/security-alerts')
        ]);
        setReports(repRes.data);
        setSecurityAlerts(alertsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <h2>Branch Manager Dashboard</h2>

      {/* Security Alerts Section */}
      {securityAlerts.length > 0 && (
        <section className="glass-card border-l-4 border-l-red-500 animate-slide-up">
          <h3 className="flex items-center gap-2 mb-4 text-[#f87171]">
            <ShieldAlert className="text-red-500 animate-pulse" /> Critical Security Alerts
          </h3>
          <div className="flex flex-col gap-3">
            {securityAlerts.map(alert => (
              <div key={alert.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-red-400">User Lockout: </span>
                  <span className="text-slate-300">Username <strong className="text-white">@{alert.username}</strong> has been locked out after 3 failed login attempts.</span>
                </div>
                <span className="text-xs text-slate-500">{new Date(alert.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Stats Cards Deck */}
      {reports && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#0f172a] text-[#6366f1]">
              <Users size={24} />
            </div>
            <div>
              <p className="text-muted uppercase tracking-wider font-semibold">Total Customers</p>
              <h3 className="text-2xl font-bold mb-0">{reports.total_customers}</h3>
            </div>
          </div>
          
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#0f172a] text-[#6366f1]">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-muted uppercase tracking-wider font-semibold">Total Accounts</p>
              <h3 className="text-2xl font-bold mb-0">{reports.total_accounts}</h3>
            </div>
          </div>
          
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-full bg-[rgba(16, 185, 129, 0.1)] text-[#34d399]">
              <Landmark size={24} />
            </div>
            <div>
              <p className="text-muted uppercase tracking-wider font-semibold">Total Balance</p>
              <h3 className="text-2xl font-bold mb-0 amount text-[#34d399]">
                {formatCurrency(reports.total_balance)}
              </h3>
            </div>
          </div>
          
          <div className="glass-card flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#0f172a] text-[#6366f1]">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-muted uppercase tracking-wider font-semibold">Total Transactions</p>
              <h3 className="text-2xl font-bold mb-0">{reports.total_transactions}</h3>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ManagerDashboard;
