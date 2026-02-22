import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, User, Lock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send the role to the backend to differentiate between Admin and User models
      const res = await api.post('/auth/login', { email, password, role });

      if (res.data.success) {
        // the backend returned user with a specific role
        const loggedUser = res.data.data.user;
        const token = res.data.data.token;

        if (loggedUser.role !== role) {
          setError(`You are not registered as a ${role}`);
          setLoading(false);
          return;
        }

        login(loggedUser, token);
        navigate(`/${loggedUser.role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex bg-blue-600 p-4 rounded-2xl shadow-lg mb-4 text-white">
          <GraduationCap size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
        <p className="text-slate-500 mt-2">
          Sign in to access your academic dashboard
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            {(['student', 'faculty', 'admin'] as const).map(r => <button key={r} type="button" onClick={() => setRole(r)} className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {r}
            </button>)}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-200 flex items-center justify-center gap-2">
            <span>
              {loading ? 'Signing In...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </span>
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Forgot your password?
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <Shield size={14} />
        <span>Secure Academic Portal System</span>
      </div>
    </div>
  </div>;
}