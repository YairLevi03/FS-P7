import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load stored lockout timer on mount
  useEffect(() => {
    const storedLockUntil = localStorage.getItem('lockUntil');
    if (storedLockUntil) {
      const remaining = Math.ceil((Number(storedLockUntil) - Date.now()) / 1000);
      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        localStorage.removeItem('lockUntil');
      }
    }
  }, []);

  // Tick countdown every second
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        const storedLockUntil = localStorage.getItem('lockUntil');
        if (storedLockUntil) {
          const remaining = Math.ceil((Number(storedLockUntil) - Date.now()) / 1000);
          if (remaining > 0) {
            setCountdown(remaining);
          } else {
            setCountdown(0);
            localStorage.removeItem('lockUntil');
            setError(''); // clear lockout error when time expires
          }
        } else {
          setCountdown(prev => prev - 1);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      const remaining = err.response?.data?.remaining;
      if (remaining) {
        const lockUntil = Date.now() + remaining * 1000;
        localStorage.setItem('lockUntil', lockUntil);
        setCountdown(remaining);
      }
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid p-4">
      <div className="glass-card max-w-md w-full p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 mb-4 text-indigo-400 glow-indigo">
            <LogIn size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-muted">Sign in to your NexusBank account</p>
        </div>

        {error && (
          <div className="alert-error mb-6 flex flex-col gap-1">
            <span className="flex-1 font-semibold">{error}</span>
            <span className="text-[10px] opacity-80">
              * Account locks for 30s after 3 failed attempts.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="e.g. john"
              disabled={countdown > 0}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              disabled={countdown > 0}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full mt-2" 
            disabled={loading || countdown > 0}
          >
            {countdown > 0 ? `Locked (${countdown}s)` : loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-slate-400">
          <p className="font-semibold text-indigo-300 mb-2">Quick Access Demo Accounts:</p>
          <div className="flex justify-between mb-1">
            <span>Customer: <strong className="text-white font-mono select-all">john</strong></span>
            <span>Password: <strong className="text-white font-mono select-all">123456</strong></span>
          </div>
          <div className="flex justify-between">
            <span>Manager: <strong className="text-white font-mono select-all">admin</strong></span>
            <span>Password: <strong className="text-white font-mono select-all">123456</strong></span>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-muted">
          Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
