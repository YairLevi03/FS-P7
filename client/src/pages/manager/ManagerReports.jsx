import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import { BarChart3, Users, Wallet, Activity } from 'lucide-react';

const ManagerReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/admin/reports');
        setReports(response.data);
      } catch (err) {
        setError('Failed to load system reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;
  if (error) return <div className="alert-error p-4 rounded glass-card">{error}</div>;

  return (
    <div className="animate-fade-in reports-page">
      <div className="flex justify-between items-center mb-4">
        <h2>System Reports & Analytics</h2>
        <button className="btn-secondary btn-sm" onClick={() => window.print()}>
          Export PDF
        </button>
      </div>

      {reports ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card report-stat-card glass-card-hover m-0">
            <div className="report-icon-wrapper">
              <Users size={28} />
            </div>
            <div className="report-value">{reports.totalCustomers || 0}</div>
            <div className="report-label">Total Customers</div>
          </div>

          <div className="card report-stat-card glass-card-hover m-0">
            <div className="report-icon-wrapper">
              <Wallet size={28} />
            </div>
            <div className="report-value">{reports.totalAccounts || 0}</div>
            <div className="report-label">Active Accounts</div>
          </div>

          <div className="card report-stat-card glass-card-hover m-0 md:col-span-2">
            <div className="report-icon-wrapper bg-[rgba(16, 185, 129, 0.1)] text-[#34d399]">
              <BarChart3 size={28} />
            </div>
            <div className="report-value text-[#34d399]">
              {formatCurrency(reports.totalBalance || 0)}
            </div>
            <div className="report-label">Total Bank Assets</div>
          </div>

          <div className="card report-stat-card glass-card-hover m-0 lg:col-span-4">
            <div className="report-icon-wrapper">
              <Activity size={28} />
            </div>
            <div className="report-value">{reports.totalTransactions || 0}</div>
            <div className="report-label">System Transactions Processed</div>
          </div>
        </div>
      ) : (
        <div className="glass-card empty-state">
          No reporting data available.
        </div>
      )}
    </div>
  );
};

export default ManagerReports;
