import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid p-4 py-8">
      <div className="glass-card max-w-md w-full p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 mb-4 text-indigo-400 glow-indigo">
            <UserPlus size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-muted">Join our premium NexusBank experience</p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input type="text" name="full_name" className="input-field" value={formData.full_name} onChange={handleChange} required placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
            <input type="text" name="username" className="input-field" value={formData.username} onChange={handleChange} required placeholder="e.g. john" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number (Optional)</label>
            <input type="text" name="phone" className="input-field" value={formData.phone} onChange={handleChange} placeholder="050-0000000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required placeholder="At least 6 characters" minLength="6" />
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-8 text-sm text-muted">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
