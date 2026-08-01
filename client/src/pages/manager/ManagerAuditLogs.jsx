import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ShieldAlert, Activity } from 'lucide-react';

const ManagerAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/audit');
        setLogs(response.data);
      } catch (err) {
        setError('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center py-12"><Loader size="lg" /></div>;

  const uniqueTypes = [...new Set(logs.map(log => log.action_type))].sort();
  const filteredLogs = filterType === 'ALL' ? logs : logs.filter(log => log.action_type === filterType);

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2>System Audit Logs</h2>
          <p className="text-muted">Review security and administrative actions across the system.</p>
        </div>
      </div>

      {error && <div className="alert-error p-4 rounded glass-card">{error}</div>}

      <div className="glass-card flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="flex items-center gap-2 text-[#6366f1] mb-0">
            <Activity size={20} /> Security & Action History
          </h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400 font-medium">Filter by Action:</label>
            <select 
              className="input-field !py-1.5 !px-3 !bg-[#0f172a] text-sm w-auto"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 text-[#94a3b8] flex flex-col items-center">
            <ShieldAlert size={48} className="opacity-50 mb-4" />
            <p>No audit logs recorded yet.</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-[#94a3b8]">
            <p>No logs match the selected action type.</p>
          </div>
        ) : (
          <div className="table-container overflow-x-auto">
            <table className="w-full text-left border-collapse [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:text-slate-400 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5 text-sm">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Action Type</th>
                  <th>User / Admin ID</th>
                  <th>Description</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="text-[#94a3b8] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize ${
                        log.action_type.includes('FAILED') || log.action_type.includes('LOCKED') || log.action_type.includes('REJECTED')
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : log.action_type.includes('SUCCESS') || log.action_type.includes('APPROVED')
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {log.action_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="font-mono text-[#6366f1]">
                      {log.user_username || (log.user_id ? `User #${log.user_id}` : 'System / Unknown')}
                    </td>
                    <td className="text-slate-300">
                      {log.description}
                    </td>
                    <td className="font-mono text-slate-500">
                      {log.ip_address || 'N/A'}
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

export default ManagerAuditLogs;
